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

async function load(relative) {
  const source = await readFile(new URL(relative, import.meta.url), "utf8");
  return import(toDataUrl(compile(source)));
}

const expectedFilenames = [
  "PXL_20260722_114642607.MP.jpg",
  "PXL_20260722_114650437.MP.jpg",
  "PXL_20260722_114652791.MP.jpg",
  "PXL_20260722_114730085.MP.jpg",
  "PXL_20260722_114734899.MP.jpg",
];

test("the five additional-range images are registered in page order with a safe-use policy", async () => {
  const data = await load("../app/statistics-additional-data.ts");
  assert.equal(data.STATISTICS_ADDITIONAL_RANGE_LABEL, "確率統計追加範囲（2026-07-22・全5枚）");
  assert.deepEqual(data.STATISTICS_ADDITIONAL_SOURCES.map((source) => source.filename), expectedFilenames);
  assert.deepEqual(data.STATISTICS_ADDITIONAL_SOURCES.map((source) => source.page), [1, 2, 3, 4, 5]);
  for (const source of data.STATISTICS_ADDITIONAL_SOURCES) {
    assert.ok(source.summary.length >= 18, `${source.filename}: summary missing`);
    assert.ok(source.usePolicy.length >= 10, `${source.filename}: use policy missing`);
  }
  assert.match(data.STATISTICS_ADDITIONAL_SOURCES[4].usePolicy, /名称・概念確認だけ/);
});

test("all photographed exact values and general rules are represented without inventing p.99 calculations", async () => {
  const data = await load("../app/statistics-additional-data.ts");
  const formulas = new Map(data.STATISTICS_ADDITIONAL_FORMULAS.map((formula) => [formula.id, formula]));
  const questions = new Map(data.STATISTICS_ADDITIONAL_QUESTIONS.map((question) => [question.id, question]));

  assert.match(formulas.get("stats-second-moment").example, /91.*6/);
  assert.match(formulas.get("stats-variance-properties").formula, /V\(c\)=0/);
  assert.match(formulas.get("stats-two-sample-average-variance").formula, /V\(X\).*2/);
  assert.match(formulas.get("stats-exponential-variance").formula, /lambda\^2/);
  assert.match(formulas.get("stats-unit-uniform-variance").formula, /1\{12\}/);
  assert.match(formulas.get("stats-general-standardization").formula, /E\[Z\]=0.*V\(Z\)=1/);
  assert.match(formulas.get("stats-moment-vocabulary").explanation, /定義式が写っていない/);

  assert.equal(questions.get("stats-additional-die-expectation").numericAnswer, 3.5);
  assert.equal(questions.get("stats-additional-die-second-moment").numericAnswer, 91 / 6);
  assert.equal(questions.get("stats-additional-die-variance").numericAnswer, 35 / 12);
  assert.equal(questions.get("stats-additional-two-dice-average-variance").numericAnswer, 35 / 24);
  assert.equal(questions.get("stats-additional-exponential-variance").numericAnswer, 0.25);
  assert.equal(questions.get("stats-additional-unit-uniform-variance").numericAnswer, 1 / 12);
  assert.equal(questions.get("stats-additional-normal-narrow-interval").numericAnswer, 0.0282);
  assert.equal(questions.get("stats-additional-normal-x-interval").numericAnswer, 0.798);
  assert.match(questions.get("stats-additional-normal-x-interval").answer, /0\.7980/);
  assert.ok(![...questions].some(([, question]) => /モーメント母関数|歪度|尖度/.test(`${question.prompt} ${question.formula ?? ""}`)), "p.99 terms must not become invented calculation questions");
});

test("every additional Sigma formula has a visible Sigma-free expansion and all TeX renders", async () => {
  const [data, katex] = await Promise.all([
    load("../app/statistics-additional-data.ts"),
    import(new URL("../app/vendor/katex/katex.mjs", import.meta.url)),
  ]);
  const owners = [...data.STATISTICS_ADDITIONAL_FORMULAS, ...data.STATISTICS_ADDITIONAL_QUESTIONS];
  for (const owner of owners) {
    if (owner.formula?.includes("\\sum")) {
      assert.ok(owner.expandedFormula, `${owner.id}: expanded formula missing`);
      assert.doesNotMatch(owner.expandedFormula, /\\sum|Σ/);
    }
    for (const tex of [owner.formula, owner.expandedFormula].filter(Boolean)) {
      assert.doesNotThrow(() => katex.renderToString(tex, {
        displayMode: true,
        output: "htmlAndMathml",
        strict: "error",
        throwOnError: true,
        trust: false,
      }), `${owner.id}: invalid TeX ${tex}`);
    }
  }
});

test("all 12 expected papers preserve exact additional-range provenance for normal and Chebyshev questions", async () => {
  const data = await load("../app/statistics-expected-exams-data.ts");
  assert.equal(data.EXPECTED_PAPERS_BY_ID.size, 12);
  for (const paper of data.EXPECTED_PAPERS_BY_ID.values()) {
    const additional = paper.questions.filter((question) => question.sourceFamily === "additional-range");
    const hasAdditionalNormal = paper.definition.variant % 3 !== 0;
    assert.equal(additional.length, hasAdditionalNormal ? 2 : 1, `${paper.definition.id}: additional-range question count`);

    const chebyshev = paper.questions.find((question) => question.major === 9 && question.sub === 2);
    assert.equal(chebyshev.sourceFamily, "additional-range", `${paper.definition.id}: Chebyshev source family`);
    assert.equal(chebyshev.genre, "チェビシェフ");
    assert.ok([2 / 3, 0.75].includes(chebyshev.numericAnswer));
    assert.deepEqual(chebyshev.sourcePages, [paper.definition.variant % 2 === 1 ? 2 : 3]);

    const normal = paper.questions.find((question) => question.major === 9 && question.sub === 1);
    if (hasAdditionalNormal) {
      assert.equal(normal.sourceFamily, "additional-range", `${paper.definition.id}: added normal source family`);
      assert.deepEqual(normal.sourcePages, [2]);
      assert.equal(normal.numericAnswer, paper.definition.variant % 3 === 1 ? 0.0282 : 0.798);
    } else {
      assert.equal(normal.sourceFamily, "exercise-pdf4", `${paper.definition.id}: fallback normal source family`);
    }

    const searchable = paper.questions.map((question) => `${question.prompt} ${question.context ?? ""}`).join(" ");
    assert.doesNotMatch(searchable, /モンティ|Monty/i);
  }
  const allQuestions = [...data.EXPECTED_PAPERS_BY_ID.values()].flatMap((paper) => paper.questions);
  assert.ok(allQuestions.some((question) => question.numericAnswer === 0.0282));
  assert.ok(allQuestions.some((question) => question.numericAnswer === 0.798));
});
