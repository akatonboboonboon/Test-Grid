import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const DATA_URL = new URL("../app/applied-math-data.ts", import.meta.url);
const PAGE_URL = new URL("../app/subjects/subject-8/page.tsx", import.meta.url);
const EXAMS_URL = new URL("../app/applied-math-expected-exams.tsx", import.meta.url);
const EXAMS_CSS_URL = new URL("../app/applied-math-expected-exams.module.css", import.meta.url);
const TOPIC_IDS = [
  "vectors",
  "vector-functions",
  "curves",
  "surfaces",
  "gradient",
  "divergence-curl",
  "line-integrals",
  "surface-integrals",
  "green-theorem",
];

const EXCLUDED_CONTENT = [
  /ガウス(?:の)?発散定理/,
  /ストークス(?:の)?定理/,
  /\bgauss(?:'s)?\s+(?:divergence\s+)?theorem\b/i,
  /\bstokes(?:'s)?\s+theorem\b/i,
];

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
}

function dataUrl(javascript) {
  return `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
}

let dataModulePromise;
async function loadDataModule() {
  dataModulePromise ??= readFile(DATA_URL, "utf8").then((source) => import(dataUrl(compile(source))));
  return dataModulePromise;
}

function assertNoExcludedQuestionContent(items, label) {
  const serialized = JSON.stringify(items.map((item) => ({
    title: item.title,
    genre: item.genre,
    prompt: item.prompt,
    context: item.context,
    formula: item.formula,
    answer: item.answer,
    steps: item.steps,
    options: item.options,
  })));
  for (const pattern of EXCLUDED_CONTENT) {
    assert.doesNotMatch(serialized, pattern, `${label} contains excluded material: ${pattern}`);
  }
}

function allStrings(value, path = "root", result = []) {
  if (typeof value === "string") result.push([path, value]);
  else if (Array.isArray(value)) value.forEach((item, index) => allStrings(item, `${path}[${index}]`, result));
  else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => allStrings(item, `${path}.${key}`, result));
  }
  return result;
}

function assertCleanMathStrings(value, katex, label) {
  for (const [path, string] of allStrings(value, label)) {
    assert.doesNotMatch(string, /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/, `${path} contains a control character`);
    assert.equal((string.match(/\\\(/g) ?? []).length, (string.match(/\\\)/g) ?? []).length, `${path} has unbalanced inline math delimiters`);
    for (const match of string.matchAll(/\\\(([\s\S]*?)\\\)/g)) {
      const mathematicalTex = match[1]
        .replace(/\\(?:mathrm|text|operatorname)\{[^{}]*\}/g, "");
      assert.doesNotMatch(
        mathematicalTex,
        /\//,
        `${path} must use \\frac instead of a horizontal slash fraction: ${match[1]}`,
      );
      assert.doesNotThrow(() => katex.renderToString(match[1], {
        displayMode: false,
        output: "htmlAndMathml",
        strict: "error",
        throwOnError: true,
        trust: false,
      }), `${path} contains invalid inline TeX: ${match[1]}`);
    }
  }
}

function checkFormula(tex, katex, label) {
  assert.doesNotMatch(tex, /\\\(|\\\)/, label + " must store pure TeX");
  assert.doesNotMatch(tex, /\//, label + " uses stacked fractions");
  let markup = "";
  assert.doesNotThrow(() => {
    markup = katex.renderToString(tex, {
      displayMode: true,
      output: "htmlAndMathml",
      strict: "error",
      throwOnError: true,
      trust: false,
    });
  }, label + " contains invalid formula TeX: " + tex);
  return markup;
}

function assertValidSourcePages(items, label) {
  for (const item of items) {
    assert.ok(Array.isArray(item.sourcePages) && item.sourcePages.length > 0, `${label}:${item.id} sourcePages`);
    assert.ok(item.sourcePages.every((page) => Number.isInteger(page) && page >= 1 && page <= 22), `${label}:${item.id} page range`);
  }
}

test("scope contract merges the original 16 images and six additional range images", async () => {
  const {
    APPLIED_MATH_EXCLUDED_TOPICS,
    APPLIED_MATH_RANGE_PAGES,
    APPLIED_MATH_TOPICS,
  } = await loadDataModule();

  assert.equal(APPLIED_MATH_RANGE_PAGES.length, 22);
  assert.deepEqual(APPLIED_MATH_RANGE_PAGES.map((page) => page.number), Array.from({ length: 22 }, (_, index) => index + 1));
  assert.deepEqual(APPLIED_MATH_TOPICS.map((topic) => topic.id), TOPIC_IDS);
  assert.deepEqual(APPLIED_MATH_EXCLUDED_TOPICS, [
    "ガウスの発散定理",
    "ストークスの定理",
  ]);
  assert.match(APPLIED_MATH_RANGE_PAGES.find((page) => page.number === 19)?.summary ?? "", /問4.*矛盾.*除外/);
});

test("applied-math cards and exercises cover all nine range topics with real TeX", async () => {
  const {
    APPLIED_MATH_RANGE_PAGES,
    APPLIED_MATH_TOPICS,
    APPLIED_MATH_FORMULAS,
    APPLIED_MATH_QUESTIONS,
  } = await loadDataModule();
  const katex = await import(new URL("../app/vendor/katex/katex.mjs", import.meta.url));

  assert.equal(APPLIED_MATH_RANGE_PAGES.length, 22);
  assert.deepEqual(APPLIED_MATH_RANGE_PAGES.map((page) => page.number), Array.from({ length: 22 }, (_, index) => index + 1));
  assert.deepEqual(APPLIED_MATH_TOPICS.map((topic) => topic.id), TOPIC_IDS);
  assert.deepEqual(
    [...new Set(APPLIED_MATH_TOPICS.flatMap((topic) => topic.pages))].sort((left, right) => left - right),
    Array.from({ length: 22 }, (_, index) => index + 1),
  );

  assert.ok(APPLIED_MATH_FORMULAS.length >= 47, "formula deck should include the additional-range and high-resolution helper cards");
  assert.ok(APPLIED_MATH_QUESTIONS.length >= 54, "practice/random pool should include the source-derived and helper questions");
  assert.equal(new Set(APPLIED_MATH_FORMULAS.map((card) => card.id)).size, APPLIED_MATH_FORMULAS.length);
  assert.equal(new Set(APPLIED_MATH_QUESTIONS.map((question) => question.id)).size, APPLIED_MATH_QUESTIONS.length);
  for (const cardId of [
    "am-vector-constant-derivative",
    "am-vector-sum-derivative",
    "am-vector-chain-rule",
    "am-scalar-vector-product-rule",
    "am-source-surface-unit-normal",
    "am-div-curl-linearity",
    "am-div-curl-scalar-product",
    "am-vector-calculus-zero-identities",
  ]) {
    assert.ok(APPLIED_MATH_FORMULAS.some((card) => card.id === cardId), `${cardId} helper card`);
  }
  for (const questionId of [
    "am-q-vector-chain-rule",
    "am-q-scalar-vector-product-rule",
    "am-q-source-surface-unit-normal",
    "am-q-div-curl-linearity",
    "am-q-div-curl-scalar-product",
    "am-q-vector-calculus-zero-identities",
  ]) {
    assert.ok(APPLIED_MATH_QUESTIONS.some((question) => question.id === questionId), `${questionId} helper exercise`);
  }
  assertValidSourcePages(APPLIED_MATH_FORMULAS, "formula");
  assertValidSourcePages(APPLIED_MATH_QUESTIONS, "question");

  for (const topic of TOPIC_IDS) {
    assert.ok(APPLIED_MATH_FORMULAS.some((card) => card.topic === topic), `${topic} formula coverage`);
    assert.ok(APPLIED_MATH_QUESTIONS.some((question) => question.topic === topic), `${topic} question coverage`);
  }
  for (const card of APPLIED_MATH_FORMULAS) {
    assert.equal(typeof card.formula, "string", `${card.id} formula`);
    assert.ok(card.formula.length >= 3, `${card.id} formula length`);
    assert.ok(/[\\_^]|\b(?:div|curl|grad)\b/.test(card.formula), `${card.id} must store TeX rather than prose-only pseudo math`);
    assert.ok(card.explanation?.length >= 15, `${card.id} explanation`);
    checkFormula(card.formula, katex, card.id);
  }
  for (const question of APPLIED_MATH_QUESTIONS) {
    assert.ok(question.answer?.length > 0, `${question.id} answer`);
    assert.ok(question.explanation?.length >= 12, `${question.id} explanation`);
    assert.ok(Array.isArray(question.steps) && question.steps.length >= 1, `${question.id} worked steps`);
    if (question.formula) checkFormula(question.formula, katex, question.id);
  }

  const unitQuestion = APPLIED_MATH_QUESTIONS.find((question) => question.id === "am-q-unit");
  const linearityCard = APPLIED_MATH_FORMULAS.find((card) => card.id === "am-div-curl-linearity");
  assert.ok(unitQuestion);
  assert.ok(linearityCard);
  assert.match(checkFormula(unitQuestion.formula, katex, unitQuestion.id), /<mfrac>/);
  const unitAnswerTex = unitQuestion.answer.match(/\\\(([\s\S]*?)\\\)/)?.[1] ?? "";
  assert.match(
    katex.renderToString(unitAnswerTex, {
      displayMode: false,
      output: "htmlAndMathml",
      strict: "error",
      throwOnError: true,
      trust: false,
    }),
    /<mfrac>/,
    "inline unit-vector answers must render as stacked fractions",
  );
  assert.match(checkFormula(linearityCard.formula, katex, linearityCard.id), /<mtable/);

  assertCleanMathStrings(APPLIED_MATH_FORMULAS, katex, "formula deck");
  assertCleanMathStrings(APPLIED_MATH_QUESTIONS, katex, "practice/random pool");
  assertNoExcludedQuestionContent(APPLIED_MATH_FORMULAS, "formula deck");
  assertNoExcludedQuestionContent(APPLIED_MATH_QUESTIONS, "practice/random pool");
  assert.match(JSON.stringify(APPLIED_MATH_FORMULAS), /線積分/);
  assert.match(JSON.stringify(APPLIED_MATH_FORMULAS), /流束面積分/);
  assert.match(JSON.stringify(APPLIED_MATH_FORMULAS), /グリーンの定理/);
  assert.match(JSON.stringify(APPLIED_MATH_QUESTIONS), /基本問題問4.*矛盾.*自動出題しない/);
});

test("six predicted exams are 50-minute, 80-point papers covering all nine topics", async () => {
  const { APPLIED_MATH_EXPECTED_EXAMS } = await loadDataModule();
  const katex = await import(new URL("../app/vendor/katex/katex.mjs", import.meta.url));

  assert.equal(APPLIED_MATH_EXPECTED_EXAMS.length, 6);
  assert.equal(new Set(APPLIED_MATH_EXPECTED_EXAMS.map((exam) => exam.id)).size, 6);
  for (const exam of APPLIED_MATH_EXPECTED_EXAMS) {
    assert.equal(exam.minutes, 50, `${exam.id} duration`);
    assert.equal(exam.totalPoints, 80, `${exam.id} total`);
    assert.equal(exam.passPoints, 48, `${exam.id} pass line`);
    assert.equal(exam.sections.length, 6, `${exam.id} major-question count`);
    assert.equal(exam.questions.reduce((sum, question) => sum + question.points, 0), 80, `${exam.id} points sum`);
    assert.deepEqual(new Set(exam.sections.flatMap((section) => section.topicIds)), new Set(TOPIC_IDS), `${exam.id} section coverage`);
    assert.deepEqual(new Set(exam.questions.map((question) => question.topic)), new Set(TOPIC_IDS), `${exam.id} question coverage`);
    assertValidSourcePages(exam.questions, exam.id);
    for (const question of exam.questions) {
      assert.ok(question.answer?.length > 0, `${question.id} answer`);
      assert.ok(Array.isArray(question.steps) && question.steps.length >= 2, `${question.id} worked solution`);
      assert.ok(question.explanation?.length >= 12, `${question.id} detailed explanation`);
      if (question.formula) checkFormula(question.formula, katex, question.id);
    }
    assertCleanMathStrings(exam, katex, exam.id);
    assertNoExcludedQuestionContent(exam.questions, exam.id);
  }
});

test("predicted exams mirror the print level with linked calculations and no graph questions", async () => {
  const { APPLIED_MATH_EXPECTED_EXAMS } = await loadDataModule();
  const conceptPatterns = [
    /外積/,
    /勾配/,
    /方向微分/,
    /発散/,
    /回転/,
    /線積分/,
    /Green/,
  ];

  for (const exam of APPLIED_MATH_EXPECTED_EXAMS) {
    assert.equal(exam.paper, "A4 portrait", exam.id + " paper");
    assert.equal(exam.durationMinutes, 50, exam.id + " duration");
    assert.equal(exam.passPercent, 60, exam.id + " pass percent");
    assert.equal(exam.passPoints, exam.totalPoints * 0.6, exam.id + " raw pass line");
    assert.equal(exam.questions.length, 19, exam.id + " sub-question count");
    assert.deepEqual(
      exam.sections.map((section) => section.questions.length),
      [3, 2, 3, 3, 4, 4],
      exam.id + " print blueprint",
    );

    const easy = exam.questions.filter((question) => question.difficulty === 1);
    const advanced = exam.questions.filter((question) => question.difficulty === 3);
    assert.ok(easy.length <= 2, exam.id + " has too many one-step questions");
    assert.ok(advanced.length >= 5, exam.id + " needs at least five advanced questions");
    assert.ok(
      advanced.every((question) => question.steps.length >= 3),
      exam.id + " advanced questions need a three-stage worked solution",
    );

    const linked = exam.questions.filter((question) =>
      /前問|前2問|同じ曲線|同じ曲面|端点差|一致/.test(
        [question.prompt, question.explanation, ...question.steps].join(" "),
      ));
    assert.ok(linked.length >= 8, exam.id + " should reuse earlier results across each major question");

    const serialized = JSON.stringify(exam);
    for (const pattern of conceptPatterns) {
      assert.match(serialized, pattern, exam.id + " missing " + pattern);
    }
    assert.doesNotMatch(serialized, /グラフ|作図|\bplot\b/i, exam.id + " must not contain graph questions");

    for (const question of exam.questions) {
      if (question.numericAnswer !== undefined) {
        assert.ok(Number.isFinite(question.numericAnswer), question.id + " numeric answer");
      }
      if (question.tolerance !== undefined) {
        assert.ok(Number.isFinite(question.tolerance) && question.tolerance >= 0, question.id + " tolerance");
      }
    }
  }
});
test("subject 8 integrates formula cards, practice, random mock, predicted exams, and format guide", async () => {
  const [page, exams, studyData] = await Promise.all([
    readFile(PAGE_URL, "utf8"),
    readFile(EXAMS_URL, "utf8"),
    readFile(new URL("../app/study-data.ts", import.meta.url), "utf8"),
  ]);
  const ui = `${page}\n${exams}`;

  for (const label of ["公式カード", "演習", "ランダム模試", "予想模試", "形式ガイド"]) {
    assert.match(ui, new RegExp(label), label);
  }
  assert.match(page, /DisplayMath/);
  assert.match(page, /RichMathText/);
  assert.match(ui, /APPLIED_MATH_FORMULAS/);
  assert.match(ui, /APPLIED_MATH_EXAM_LEVEL_QUESTIONS/);
  assert.match(ui, /APPLIED_MATH_EXPECTED_EXAMS/);
  assert.match(ui, /テスト範囲(?:ZIP|\.zip)/i);
  assert.match(ui, /形式(?:資料|1|2|3).*?(?:レイアウト|形式).*?のみ/s);
  assert.match(ui, /全22枚/);
  assert.match(ui, /全9単元/);
  assert.match(ui, /線積分/);
  assert.match(ui, /流束面積分/);
  assert.match(ui, /グリーンの定理/);
  const excludedPolicy = ui.match(/出題しない：<\/b>([^<]+)/)?.[1] ?? "";
  assert.doesNotMatch(excludedPolicy, /線積分|流束面積分/);
  assert.match(excludedPolicy, /ガウスの発散定理/);
  assert.match(excludedPolicy, /ストークスの定理/);
  assert.match(ui, /問4.*?表記が矛盾.*?自動出題から外/s);

  assert.match(studyData, /subject-8[\s\S]*応用数学/);
  assert.match(studyData, /\{ id: "subject-8", name: "応用数学",[^\n]*memo: "(?!教材写真の追加待ち)[^"]+"/);
  assert.match(studyData, /wasOldAppliedMathPlaceholder[\s\S]*fallback\.id === "subject-8"[\s\S]*savedMemo === "教材写真の追加待ち"/);
});

test("predicted-exam UI saves and resumes, prints A4, explains answers, and works on phones", async () => {
  const [component, css] = await Promise.all([
    readFile(EXAMS_URL, "utf8"),
    readFile(EXAMS_CSS_URL, "utf8"),
  ]);

  assert.match(component, /test-grid:subject-8:(?:expected|exam)/);
  assert.match(component, /localStorage/);
  assert.match(component, /中断して保存/);
  assert.match(component, /続きから再開/);
  assert.match(component, /remainingSeconds|残り時間/);
  assert.match(component, /50\s*\*\s*60|50分/);
  assert.match(component, /48\s*\/\s*80|48点/);
  assert.match(component, /100点換算|convertedScore|scorePercent/);
  assert.match(component, /詳細解答|解答[・／]解説|途中式/);
  assert.match(component, /window\.print\(\)/);

  assert.match(css, /@page\s*\{/);
  assert.match(css, /size:\s*A4 portrait/);
  assert.match(css, /210mm/);
  assert.match(css, /297mm/);
  assert.match(css, /@media\s*\(max-width:\s*(?:680|720)px\)/);
  assert.match(css, /min-width:\s*0|overflow-x:\s*auto/);
});
