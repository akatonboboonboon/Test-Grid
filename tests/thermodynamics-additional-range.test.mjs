import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const DATA_URL = new URL("../app/thermodynamics-data.ts", import.meta.url);

let modulePromise;
async function loadData() {
  modulePromise ??= readFile(DATA_URL, "utf8").then((source) => {
    const javascript = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    return import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
  });
  return modulePromise;
}

function closeTo(actual, expected, tolerance, label) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: expected ${expected}, got ${actual}`);
}

test("additional thermodynamics pages 8 and 9 are first-class range sources", async () => {
  const data = await loadData();
  const byPage = new Map(data.THERMODYNAMICS_RANGE_PAGES.map((page) => [page.number, page]));

  assert.equal(byPage.get(8)?.filename, "PXL_20260722_114531438.MP.jpg");
  assert.equal(byPage.get(9)?.filename, "PXL_20260722_114536629.MP.jpg");
  assert.deepEqual(byPage.get(8)?.topics, ["carnot", "refrigeration"]);
  assert.deepEqual(byPage.get(9)?.topics, ["refrigeration"]);

  const refrigeration = data.THERMODYNAMICS_TOPICS.find((topic) => topic.id === "refrigeration");
  assert.deepEqual(refrigeration?.pages, [8, 9]);
  assert.match(refrigeration?.description ?? "", /圧縮機|成績係数/);

  const excluded = data.THERMODYNAMICS_EXCLUDED_TOPICS.join(" ");
  assert.doesNotMatch(excluded, /逆カルノー|冷凍|COP|成績係数/);
});

test("refrigeration formula cards cover apparatus, balance, both COPs, reversed Carnot, and capacity", async () => {
  const data = await loadData();
  const cards = new Map(data.THERMODYNAMICS_FORMULAS.map((card) => [card.id, card]));
  const expected = new Map([
    ["th-refrigeration-components", "refrigeration-cycle"],
    ["th-refrigeration-balance", "refrigeration-cycle"],
    ["th-refrigeration-cop", "refrigeration-cycle"],
    ["th-heat-pump-cop", "refrigeration-cycle"],
    ["th-reversed-carnot-cop", "reversed-carnot-ts"],
    ["th-refrigeration-capacity", "refrigeration-cycle"],
  ]);

  for (const [id, diagram] of expected) {
    const card = cards.get(id);
    assert.ok(card, id);
    assert.equal(card.topic, "refrigeration", `${id} topic`);
    assert.equal(card.diagram, diagram, `${id} diagram`);
    assert.ok(card.sourceRefs.every((ref) => ref.kind !== "range-zip" || ref.page === 8 || ref.page === 9), `${id} source pages`);
  }
  assert.match(cards.get("th-refrigeration-balance").formula, /Q_1=Q_2\+W/);
  assert.match(cards.get("th-reversed-carnot-cop").formula, /T_2.*T_1-T_2/);
  assert.match(cards.get("th-refrigeration-capacity").formula, /4\.19.*3600/);
});

test("source examples preserve the audited 860/380 and 47/7 numerical answers", async () => {
  const data = await loadData();
  const questions = new Map(data.THERMODYNAMICS_QUESTIONS.map((question) => [question.id, question]));

  closeTo(questions.get("th-q-carnot-additional-work").numericAnswer, 11.1627906977, 1e-9, "Carnot work");
  assert.match(questions.get("th-q-carnot-additional-entropy").answer, /-0\.02326/);
  assert.match(questions.get("th-q-carnot-additional-entropy").answer, /\+0\.02326/);
  assert.match(questions.get("th-q-carnot-additional-entropy").prompt, /860 K.*380 K.*20 kJ/);
  assert.match(questions.get("th-q-carnot-additional-entropy").formula, /fluid,hot.*\+\\frac\{Q_1\}\{T_1\}.*fluid,cold.*-\\frac\{Q_2\}\{T_2\}/s);
  assert.match(questions.get("th-q-carnot-additional-entropy").formula, /reservoir,hot.*-\\frac\{Q_1\}\{T_1\}.*reservoir,cold.*\+\\frac\{Q_2\}\{T_2\}/s);
  assert.match(questions.get("th-q-carnot-additional-entropy").steps.join(" "), /原ノート.*作動流体.*\+0\.02326.*-0\.02326/);
  assert.match(questions.get("th-q-carnot-additional-entropy").steps.join(" "), /熱源.*-0\.02326.*\+0\.02326/);
  assert.match(questions.get("th-q-carnot-additional-entropy").explanation, /作動流体と熱源では符号が逆/);

  assert.match(questions.get("th-q-reversed-carnot-cop").prompt, /47℃.*7℃/);
  assert.match(questions.get("th-q-reversed-carnot-cop").answer, /7.*8/);
  closeTo(questions.get("th-q-refrigeration-capacity").numericAnswer, 1.3966666667, 1e-9, "cooling capacity");
  closeTo(questions.get("th-q-reversed-carnot-power").numericAnswer, 0.1995238095, 1e-9, "required power");
  assert.match(questions.get("th-q-reversed-carnot-power").context, /47℃.*7℃.*1200 kcal\/h/);

  assert.equal(questions.get("th-q-refrigeration-diagram").diagram, "refrigeration-cycle");
  assert.equal(questions.get("th-q-reversed-carnot-diagram").diagram, "reversed-carnot-ts");
});

test("all static additional-range questions state their own givens", async () => {
  const data = await loadData();
  const ids = [
    "th-q-carnot-additional-work",
    "th-q-carnot-additional-entropy",
    "th-q-refrigeration-components",
    "th-q-refrigeration-diagram",
    "th-q-refrigeration-balance",
    "th-q-refrigeration-cop",
    "th-q-heat-pump-cop",
    "th-q-reversed-carnot-diagram",
    "th-q-reversed-carnot-cop",
    "th-q-refrigeration-capacity",
    "th-q-reversed-carnot-power",
  ];
  const questions = new Map(data.THERMODYNAMICS_QUESTIONS.map((question) => [question.id, question]));

  for (const id of ids) {
    const question = questions.get(id);
    assert.ok(question, id);
    assert.doesNotMatch(`${question.context ?? ""}\n${question.prompt}`, /前問|前二問/, `${id} must be standalone`);
    assert.ok(question.sourceRefs.some((ref) => ref.kind === "range-zip" && (ref.page === 8 || ref.page === 9)), `${id} page 8/9 source`);
  }
  assert.match(questions.get("th-q-heat-pump-cop").steps.join(" "), /Q_1=Q_2\+W=14\+2=16/);
});

test("all six A4 expected exams include refrigeration at the unchanged 5-major 22-subquestion 100-point shape", async () => {
  const data = await loadData();
  assert.equal(data.THERMODYNAMICS_EXPECTED_EXAMS.length, 6);

  for (const exam of data.THERMODYNAMICS_EXPECTED_EXAMS) {
    assert.equal(exam.sections.length, 5, `${exam.id} major count`);
    assert.equal(exam.questions.length, 22, `${exam.id} subquestion count`);
    assert.equal(exam.questions.reduce((sum, question) => sum + question.points, 0), 100, `${exam.id} points`);
    assert.ok(exam.questions.some((question) => question.topic === "refrigeration"), `${exam.id} refrigeration coverage`);

    const byField = new Map(exam.questions.map((question) => [`${question.major}.${question.sub}`, question]));
    const apparatus = byField.get("5.2");
    const reversedCarnot = byField.get("5.5");
    assert.equal(apparatus.diagram, "refrigeration-cycle", `${exam.id} apparatus diagram`);
    assert.match(apparatus.prompt, /圧縮機.*凝縮器.*膨張弁.*蒸発器/);
    assert.equal(reversedCarnot.diagram, "reversed-carnot-ts", `${exam.id} reversed Carnot diagram`);
    assert.match(reversedCarnot.formula, /varepsilon_r.*varepsilon_h.*dot Q_2.*dot W/s);
    assert.ok(reversedCarnot.sourceRefs.some((ref) => ref.kind === "range-zip" && ref.page === 9));
  }

  const first = data.THERMODYNAMICS_EXPECTED_EXAMS[0];
  const firstQuestion = first.questions.find((question) => question.major === 5 && question.sub === 5);
  assert.match(first.sections.find((section) => section.number === 5).context, /47℃.*7℃.*1200 kcal\/h/);
  assert.match(firstQuestion.answer, /εr≈7(?:\.0+)?、εh≈8(?:\.0+)?.*Qdot2≈1\.397.*Wdot≈0\.2(?:0+)?.*Qdot1≈1\.596/);
});
