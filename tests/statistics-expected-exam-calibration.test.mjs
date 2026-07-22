import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
}

function toDataUrl(javascript) {
  return "data:text/javascript;base64," + Buffer.from(javascript).toString("base64");
}

async function loadExpectedExamData() {
  const source = await readFile(new URL("../app/statistics-expected-exams-data.ts", import.meta.url), "utf8");
  return import(toDataUrl(compile(source)));
}

const requiredSources = [
  "past-format",
  "exercise-pdf1",
  "exercise-pdf2",
  "exercise-pdf3",
  "exercise-pdf4",
  "additional-range",
];

const requiredGenres = [
  "2群の統合",
  "エントロピー",
  "算術平均",
  "幾何平均",
  "調和平均",
  "スピアマン順位相関",
  "ケンドール順位相関",
  "平方和の恒等式",
  "チェビシェフ",
];

test("all 12 expected exams reproduce a 50-minute, 100-point past-paper density", async () => {
  const data = await loadExpectedExamData();

  assert.equal(data.STATISTICS_EXPECTED_EXAMS.length, 12);
  assert.equal(data.STATISTICS_EXPECTED_EXAM_AUDIT.length, 12);
  assert.equal(data.EXAM_SECONDS, 50 * 60);
  assert.equal(data.PASS_SCORE, 60);
  assert.equal(data.EXPECTED_MAJOR_COUNT, 11);
  assert.equal(data.EXPECTED_SUBQUESTION_COUNT, 32);

  for (const audit of data.STATISTICS_EXPECTED_EXAM_AUDIT) {
    assert.equal(audit.majorQuestions, 11, `${audit.id}: major-question count`);
    assert.equal(audit.subquestions, 32, `${audit.id}: subquestion count`);
    assert.equal(audit.points, 100, `${audit.id}: total points`);
    assert.equal(audit.estimatedMinutes, 50, `${audit.id}: estimated completion time`);
    assert.ok(audit.difficultQuestions >= 8, `${audit.id}: must retain enough multi-step/hard questions`);
    assert.ok(audit.linkedQuestions >= 24, `${audit.id}: must be dominated by linked calculations`);
    assert.ok(audit.tableQuestions >= 16, `${audit.id}: must retain past-paper table workload`);
    assert.deepEqual([...audit.sourceFamilies].sort(), [...requiredSources].sort(), `${audit.id}: PDF1-4 and past format coverage`);
    for (const genre of requiredGenres) assert.ok(audit.genres.includes(genre), `${audit.id}: missing ${genre}`);
  }
});

test("every paper is broad, fully solved, Sigma-expanded, and excludes Monty Hall", async () => {
  const [data, katex] = await Promise.all([
    loadExpectedExamData(),
    import(new URL("../app/vendor/katex/katex.mjs", import.meta.url)),
  ]);

  const signatures = [];
  for (const definition of data.STATISTICS_EXPECTED_EXAMS) {
    const paper = data.EXPECTED_PAPERS_BY_ID.get(definition.id);
    assert.ok(paper, `${definition.id}: generated paper missing`);
    assert.equal(new Set(paper.questions.map((question) => question.id)).size, 32);

    const searchable = paper.questions
      .map((question) => `${question.genre} ${question.prompt} ${question.context ?? ""}`)
      .join(" ");
    assert.doesNotMatch(searchable, /モンティ|Monty/i);

    const topicSet = new Set(paper.questions.map((question) => question.topic));
    assert.deepEqual(
      [...topicSet].sort(),
      ["conditional", "continuous", "counting", "descriptive", "random-variable", "relation"],
    );

    for (const question of paper.questions) {
      assert.ok(question.answer.trim(), `${question.id}: answer missing`);
      assert.ok(question.steps.length > 0, `${question.id}: worked steps missing`);
      assert.ok(question.explanation.trim(), `${question.id}: explanation missing`);
      assert.ok(question.points > 0, `${question.id}: invalid points`);
      assert.ok(question.estimatedMinutes > 0, `${question.id}: invalid time budget`);
      if (question.format === "number") assert.ok(Number.isFinite(question.numericAnswer), `${question.id}: numeric answer missing`);

      if (question.formula?.includes("\\sum")) {
        assert.ok(question.expandedFormula, `${question.id}: Sigma-free form missing`);
        assert.doesNotMatch(question.expandedFormula, /\\sum|Σ/, `${question.id}: Sigma-free form still uses Sigma`);
      }
      for (const tex of [question.formula, question.expandedFormula].filter(Boolean)) {
        assert.doesNotThrow(() => katex.renderToString(tex, {
          displayMode: true,
          output: "htmlAndMathml",
          strict: "error",
          throwOnError: true,
          trust: false,
        }), `${question.id}: invalid TeX ${tex}`);
      }
    }

    signatures.push(paper.questions.map((question) => `${question.context ?? ""}|${question.answer}`).join("\n"));
  }
  assert.equal(new Set(signatures).size, 12, "the 12 papers must not be cosmetic duplicates");
});

test("the A4 paper keeps the past exam's major-question sequence", async () => {
  const data = await loadExpectedExamData();
  const expectedTitles = [
    "記述統計（過去問型）",
    "2群の平均・標準偏差",
    "相関・回帰（表データ）",
    "場合の数と確率（演習PDF2型）",
    "全確率・Bayes（演習PDF3型）",
    "離散分布・エントロピー",
    "算術・幾何・調和平均",
    "連続型確率変数（演習PDF4型）",
    "正規分布・チェビシェフ",
    "順位相関（過去問型）",
    "平方和の恒等式（証明）",
  ];

  for (const paper of data.EXPECTED_PAPERS_BY_ID.values()) {
    assert.deepEqual(paper.sections.map((section) => section.title), expectedTitles);
    assert.equal(paper.sections.reduce((sum, section) => sum + section.questions.length, 0), 32);
    assert.equal(paper.sections.reduce((sum, section) => sum + section.questions.reduce((points, question) => points + question.points, 0), 0), 100);
  }
});
