import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const BASE_URL = new URL("../app/digital-circuits-data.ts", import.meta.url);
const EXTRA_URL = new URL("../app/digital-circuits-extra-data.ts", import.meta.url);
const GENERATOR_URL = new URL("../app/digital-circuits-generator.ts", import.meta.url);
const EXTRA_GENERATOR_URL = new URL("../app/digital-circuits-extra-generator.ts", import.meta.url);
const TOPICS = ["logic-timing", "latches", "flipflops", "registers", "counters", "state-machines"];

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}
function dataUrl(source) {
  return "data:text/javascript;base64," + Buffer.from(compile(source)).toString("base64");
}
let modulesPromise;
async function loadModules() {
  if (!modulesPromise) modulesPromise = (async () => {
    const baseSource = await readFile(BASE_URL, "utf8");
    const baseUrl = dataUrl(baseSource);
    const extraSource = (await readFile(EXTRA_URL, "utf8"))
      .replace('"./digital-circuits-data"', JSON.stringify(baseUrl));
    const [base, extra, generator, extraGenerator] = await Promise.all([
      import(baseUrl),
      import(dataUrl(extraSource)),
      readFile(GENERATOR_URL, "utf8").then((source) => import(dataUrl(source))),
      readFile(EXTRA_GENERATOR_URL, "utf8").then((source) => import(dataUrl(source))),
    ]);
    return { base, extra, generator, extraGenerator };
  })();
  return modulesPromise;
}

test("source contract separates ten scope images, four current-scope PDFs, and format-only references", async () => {
  const { base, extra } = await loadModules();
  assert.equal(base.DIGITAL_CIRCUIT_RANGE_PAGES.length, 10);
  assert.deepEqual(base.DIGITAL_CIRCUIT_RANGE_PAGES.map((page) => page.number), [1,2,3,4,5,6,7,8,9,10]);
  assert.equal(base.DIGITAL_CIRCUIT_FORMAT_REFERENCE_FILENAMES.length, 4);
  assert.equal(extra.DIGITAL_CIRCUIT_CURRENT_SCOPE_PDFS.length, 4);
  assert.equal(extra.DIGITAL_CIRCUIT_CURRENT_SCOPE_PDFS.reduce((sum, file) => sum + file.pages, 0), 7);
  assert.deepEqual(extra.DIGITAL_CIRCUIT_CURRENT_SCOPE_PDFS.map((file) => file.filename), [
    "スマート制御過去問.pdf", "スマート制御演習1.pdf", "スマート制御演習2.pdf", "スマート制御演習3.pdf",
  ]);
  assert.ok(extra.DIGITAL_CIRCUIT_CURRENT_SCOPE_PDFS.every((file) => file.role === "current-scope"));
  assert.match(base.DIGITAL_CIRCUIT_SOURCE_POLICY.note, /別送の現行範囲PDF（4ファイル・計7ページ）/);
  assert.match(base.DIGITAL_CIRCUIT_SOURCE_POLICY.note, /形式ZIP.*紙面形式/);
  const page6 = base.DIGITAL_CIRCUIT_RANGE_PAGES.find((page) => page.number === 6);
  assert.match(page6.summary, /共通CLKの3ビット同期アップ/);
  assert.match(page6.summary, /J0=K0=1、J1=K1=Q0、J2=K2=Q0Q1/);
});

test("combined deck and practice cover every in-scope topic with solved, sourced, diagram-linked items", async () => {
  const { base, extra } = await loadModules();
  assert.deepEqual(base.DIGITAL_CIRCUIT_TOPICS.map((topic) => topic.id), TOPICS);
  assert.ok(extra.DIGITAL_CIRCUIT_ALL_FORMULAS.length >= 32);
  assert.ok(extra.DIGITAL_CIRCUIT_ALL_QUESTIONS.length >= 40);
  assert.equal(new Set(extra.DIGITAL_CIRCUIT_ALL_FORMULAS.map((item) => item.id)).size, extra.DIGITAL_CIRCUIT_ALL_FORMULAS.length);
  assert.equal(new Set(extra.DIGITAL_CIRCUIT_ALL_QUESTIONS.map((item) => item.id)).size, extra.DIGITAL_CIRCUIT_ALL_QUESTIONS.length);
  for (const topic of TOPICS) {
    assert.ok(extra.DIGITAL_CIRCUIT_ALL_FORMULAS.some((card) => card.topic === topic), topic + " card");
    assert.ok(extra.DIGITAL_CIRCUIT_ALL_QUESTIONS.some((question) => question.topic === topic), topic + " question");
  }
  for (const card of extra.DIGITAL_CIRCUIT_ALL_FORMULAS) {
    assert.ok(card.formula, card.id + " formula");
    assert.ok(card.explanation, card.id + " explanation");
    assert.ok(card.sourceRefs?.length, card.id + " source");
  }
  const syncCards = base.DIGITAL_CIRCUIT_FORMULAS.filter((item) => item.diagram === "sync-counter");
  const syncQuestions = base.DIGITAL_CIRCUIT_QUESTIONS.filter((item) => item.diagram === "sync-counter");
  assert.ok(syncCards.length >= 2);
  assert.ok(syncQuestions.length >= 2);
  for (const item of [...syncCards, ...syncQuestions]) {
    assert.deepEqual(item.sourceRefs.map((source) => source.filename), ["PXL_20260717_141012846.jpg"]);
    assert.ok(item.sourceRefs.every((source) => source.page === 6));
  }
  for (const item of [...base.DIGITAL_CIRCUIT_FORMULAS, ...base.DIGITAL_CIRCUIT_QUESTIONS].filter((entry) => entry.diagram === "ripple-down")) {
    assert.ok(item.sourceRefs.every((source) => source.page === 5), item.id + " async down source");
  }
  for (const item of [...base.DIGITAL_CIRCUIT_FORMULAS, ...base.DIGITAL_CIRCUIT_QUESTIONS].filter((entry) => entry.diagram === "ripple-up" || entry.diagram === "ripple-down")) {
    assert.ok(item.sourceRefs.every((source) => source.page !== 6), item.id + " must not cite sync p.6 as ripple");
  }
  for (const question of extra.DIGITAL_CIRCUIT_ALL_QUESTIONS) {
    assert.ok(question.answer, question.id + " answer");
    assert.ok(question.steps?.length, question.id + " steps");
    assert.ok(question.explanation, question.id + " explanation");
    assert.ok(question.sourceRefs?.length, question.id + " source");
    assert.ok(question.diagram, question.id + " required problem-linked diagram");
  }
  const facts = JSON.stringify([extra.DIGITAL_CIRCUIT_ALL_FORMULAS, extra.DIGITAL_CIRCUIT_ALL_QUESTIONS]);
  assert.doesNotMatch(facts, /進数変換|カルノー図|全加算器|7セグメント/);
  for (const required of ["XOR", "1001", "10→2", "S\\^\\+", "JK"]) assert.match(facts, new RegExp(required));
});

test("all TeX formulas render strictly and formulas do not use answer-leaking prose", async () => {
  const { extra } = await loadModules();
  const katex = await import(new URL("../app/vendor/katex/katex.mjs", import.meta.url));
  const formulas = [
    ...extra.DIGITAL_CIRCUIT_ALL_FORMULAS.map((item) => [item.id, item.formula]),
    ...extra.DIGITAL_CIRCUIT_ALL_QUESTIONS.filter((item) => item.formula).map((item) => [item.id, item.formula]),
  ];
  for (const [id, formula] of formulas) {
    assert.doesNotMatch(formula, /\\\(|\\\)/, id + " pure TeX");
    assert.doesNotThrow(() => katex.renderToString(formula, {
      displayMode: true, output: "htmlAndMathml", throwOnError: true, strict: "error", trust: false,
    }), id + ": " + formula);
  }
});

test("six A4 exams use an adjustable 50-minute practice default, 100-point conversion, target 60, and extra PDFs", async () => {
  const { extra } = await loadModules();
  assert.equal(extra.DIGITAL_CIRCUIT_ALL_EXPECTED_EXAMS.length, 6);
  for (const exam of extra.DIGITAL_CIRCUIT_ALL_EXPECTED_EXAMS) {
    assert.equal(exam.defaultMinutes, 50);
    assert.equal(exam.userAdjustable, true);
    assert.equal(exam.officialMinutes, null);
    assert.equal(exam.totalPoints, 100);
    assert.equal(exam.passPercent, 60);
    assert.equal(exam.paper, "A4 portrait");
    assert.equal(exam.sections.length, 5);
    const questions = exam.sections.flatMap((section) => section.questions);
    assert.equal(questions.length, 12);
    assert.equal(questions.reduce((sum, question) => sum + question.points, 0), 100);
    assert.ok(questions.every((question) => question.diagram), exam.id + " all figures");
    assert.ok(questions.some((question) => question.sourceRefs.some((source) => source.filename.endsWith(".pdf"))), exam.id + " current-scope PDF");
    assert.ok(questions.some((question) => question.diagram === "sync-counter"), exam.id + " p.6 synchronous counter");
    assert.deepEqual(new Set(exam.sections.flatMap((section) => section.topicIds)), new Set(TOPICS));
  }
});

test("on-demand generators are source-backed and never produce an unsolved or figureless question", async () => {
  const { generator, extraGenerator } = await loadModules();
  assert.equal(generator.DIGITAL_CIRCUIT_GENERATOR_SPECS.length, 7);
  assert.deepEqual(generator.DIGITAL_CIRCUIT_GENERATOR_SPECS.map((spec) => spec.id), [
    "gate-waveform", "d-flipflop-waveform", "jk-flipflop-waveform", "parallel-register",
    "binary-counter", "state-table-row", "synchronous-up-counter",
  ]);
  assert.equal(extraGenerator.DIGITAL_CIRCUIT_EXTRA_GENERATOR_SPECS.length, 3);
  for (const spec of [...generator.DIGITAL_CIRCUIT_GENERATOR_SPECS, ...extraGenerator.DIGITAL_CIRCUIT_EXTRA_GENERATOR_SPECS]) {
    assert.ok(spec.sourceLabel);
    assert.ok(spec.formula);
    assert.ok(spec.answerRule);
    assert.ok(spec.parameters);
  }
  const generated = [];
  for (let seed = 1; seed <= 240; seed += 1) {
    generated.push(generator.generateDigitalCircuitQuestion(seed));
    generated.push(extraGenerator.generateDigitalCircuitExtraQuestion(seed));
  }
  for (const question of generated) {
    assert.ok(question.answer, question.id + " answer");
    assert.ok(question.steps?.length, question.id + " steps");
    assert.ok(question.explanation, question.id + " explanation");
    assert.ok(question.sourceRefs?.length, question.id + " source");
    assert.ok(question.diagram, question.id + " diagram");
  }
  const genres = new Set(generated.map((question) => question.genre));
  const synchronous = generated.filter((question) => question.genre === "自動生成・同期アップ");
  assert.ok(synchronous.length > 0);
  assert.ok(synchronous.every((question) => question.diagram === "sync-counter"));
  assert.ok(synchronous.every((question) => question.sourceRefs.length === 1 && question.sourceRefs[0].page === 6));
  assert.ok(synchronous.every((question) => /J_0=K_0/.test(question.formula)));
  const asynchronousDown = generated.filter((question) => question.genre === "自動生成・非同期ダウン");
  assert.ok(asynchronousDown.length > 0);
  assert.ok(asynchronousDown.every((question) => question.diagram === "ripple-down"));
  assert.ok(asynchronousDown.every((question) => question.sourceRefs.length === 1 && question.sourceRefs[0].page === 5));
  const stateRows = generated.filter((question) => question.genre === "自動生成・状態表");
  assert.ok(stateRows.length > 0);
  assert.ok(stateRows.every((question) => /A\\overline S/.test(question.formula)));
  assert.ok(stateRows.every((question) => question.sourceRefs.every((source) => source.filename === "スマート制御演習3.pdf")));
  assert.doesNotMatch(JSON.stringify(stateRows), /S\+=X|Y=S・X/);
  for (const genre of ["自動生成・タイミング", "自動生成・D-FF", "自動生成・JK-FF", "自動生成・レジスタ", "自動生成・非同期ダウン", "自動生成・同期アップ", "自動生成・状態表", "自動生成・XOR波形", "自動生成・10→2巡回", "自動生成・1001検出"]) {
    assert.ok(genres.has(genre), genre);
  }
});
