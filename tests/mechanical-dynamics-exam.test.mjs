import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const DATA_URL = new URL("../app/mechanical-dynamics-data.ts", import.meta.url);
const TOPICS = ["undamped", "stiffness", "laplace", "damping", "decrement", "rotational"];

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

let modulePromise;
async function loadData() {
  modulePromise ??= readFile(DATA_URL, "utf8").then((source) => {
    const url = "data:text/javascript;base64," + Buffer.from(compile(source)).toString("base64");
    return import(url);
  });
  return modulePromise;
}

function byId(exam, id) {
  const item = exam.questions.find((question) => question.id === id);
  assert.ok(item, `missing ${id}`);
  return item;
}

function assertQuestionQuality(question, label) {
  assert.ok(question.prompt.length >= 5, `${label} prompt`);
  assert.ok(question.answer.length >= 1, `${label} answer`);
  assert.ok(question.steps.length >= 2, `${label} solution steps`);
  assert.ok(question.explanation.length >= 8, `${label} explanation`);
  assert.ok(question.sourceRefs.length >= 1, `${label} sourceRefs`);
}

test("actual past paper preserves seven majors, thirteen answer fields, and printed points", async () => {
  const data = await loadData();
  const exam = data.MECHANICAL_DYNAMICS_ACTUAL_EXAM;

  assert.equal(exam.kind, "actual");
  assert.equal(exam.totalPoints, 100);
  assert.equal(exam.sections.length, 7);
  assert.equal(exam.questions.length, 13);
  assert.deepEqual(exam.sections.map((section) => section.points), [15, 10, 15, 10, 10, 30, 10]);
  assert.equal(exam.sections.reduce((sum, section) => sum + section.points, 0), 100);
  assert.equal(exam.questions.reduce((sum, question) => sum + question.points, 0), 100);
  assert.equal(new Set(exam.questions.map((question) => question.id)).size, 13);
  assert.equal(exam.officialMinutes, null);
  assert.match(exam.officialConditionsNote, /試験時間は資料に記載がない/);
  assert.match(exam.officialConditionsNote, /有効数字(?:は)?3桁/);
  assert.match(exam.officialConditionsNote, /g=9\.80/);
  assert.match(exam.officialConditionsNote, /π=3\.14/);
  for (const question of exam.questions) {
    assertQuestionQuality(question, question.id);
    assert.ok(question.sourceRefs.some((ref) => ref.kind === "actual-exam"), `${question.id} past-paper source`);
  }
});

test("actual past-paper values follow the printed constants and visible solution", async () => {
  const { MECHANICAL_DYNAMICS_ACTUAL_EXAM: exam } = await loadData();

  assert.ok(Math.abs(byId(exam, "md-actual-m1-s1").numericAnswer - 63.2456) < 0.001);
  assert.ok(Math.abs(byId(exam, "md-actual-m1-s2").numericAnswer - 10.071) < 0.001);
  const period = byId(exam, "md-actual-m1-s3");
  assert.ok(Math.abs(period.numericAnswer - 0.0993) < 0.0001);
  assert.ok(Math.abs(0.0994 - period.numericAnswer) <= period.tolerance, "visible 0.0994 rounding must be accepted");
  assert.equal(byId(exam, "md-actual-m2-s1").numericAnswer, 70);
  assert.equal(byId(exam, "md-actual-m3-s1").numericAnswer, 0.001);
  assert.equal(byId(exam, "md-actual-m3-s2").numericAnswer, 100);
  assert.ok(Math.abs(byId(exam, "md-actual-m3-s3").numericAnswer - 99.99995) < 0.00001);

  const decrement = byId(exam, "md-actual-m4-s1");
  assert.ok(Math.abs(decrement.numericAnswer - 0.01459) < 0.00001);
  assert.match(decrement.formula, /2\\pi n/);
  assert.match(exam.sections[3].context, /x_1/);
  assert.match(exam.sections[3].context, /x_\{n\+1\}/);
  assert.match(decrement.steps.join(" "), /残り40%|0\.400/);

  const leverFrequency = byId(exam, "md-actual-m6-s1");
  const leverDamping = byId(exam, "md-actual-m6-s2");
  assert.match(leverFrequency.answer, /mr\^2/);
  assert.match(leverFrequency.answer, /cr\^2/);
  assert.match(leverFrequency.answer, /kl\^2/);
  assert.match(leverFrequency.answer, /\\frac\{l\}\{r\}/);
  assert.match(leverDamping.answer, /\\frac\{cr\}\{2l\\sqrt\{mk\}\}/);
  assert.ok(Math.abs(byId(exam, "md-actual-m6-s3").numericAnswer - 0.50596) < 0.00001);

  const pendulum = byId(exam, "md-actual-m7-s1");
  assert.equal(pendulum.answer, "0.994 m");
  assert.ok(Math.abs(pendulum.numericAnswer - 0.993955) < 0.000001);
});

test("the three indispensable source figures are attached to their actual questions", async () => {
  const { MECHANICAL_DYNAMICS_ACTUAL_EXAM: exam } = await loadData();
  assert.equal(byId(exam, "md-actual-m5-s1").diagram, "spring-network");
  assert.equal(byId(exam, "md-actual-m6-s1").diagram, "pinned-beam");
  assert.equal(byId(exam, "md-actual-m6-s2").diagram, "pinned-beam");
  assert.equal(byId(exam, "md-actual-m6-s3").diagram, "pinned-beam");
  assert.equal(byId(exam, "md-actual-m7-s1").diagram, "simple-pendulum");
});

test("six expected papers mirror the seven-major, thirteen-field, all-topic contract", async () => {
  const data = await loadData();
  const exams = data.MECHANICAL_DYNAMICS_EXPECTED_EXAMS;
  assert.equal(exams.length, 6);
  assert.equal(new Set(exams.map((exam) => exam.id)).size, 6);

  for (const exam of exams) {
    assert.equal(exam.kind, "expected");
    assert.equal(exam.sections.length, 7, `${exam.id} majors`);
    assert.equal(exam.questions.length, 13, `${exam.id} answer fields`);
    assert.equal(exam.totalPoints, 100);
    assert.equal(exam.sections.reduce((sum, section) => sum + section.points, 0), 100, `${exam.id} section points`);
    assert.equal(exam.questions.reduce((sum, question) => sum + question.points, 0), 100, `${exam.id} question points`);
    assert.deepEqual(new Set(exam.questions.flatMap((question) => [question.topic])), new Set(TOPICS), `${exam.id} coverage`);
    assert.equal(new Set(exam.questions.map((question) => question.id)).size, 13, `${exam.id} ids`);
    assert.ok(exam.questions.filter((question) => question.diagram).length >= 3, `${exam.id} diagrams`);
    for (const question of exam.questions) assertQuestionQuality(question, `${exam.id}:${question.id}`);
  }
});

test("range, source policy, and practice-only timing stay explicit", async () => {
  const data = await loadData();
  assert.equal(data.MECHANICAL_DYNAMICS_RANGE_PAGES.length, 15);
  assert.deepEqual(data.MECHANICAL_DYNAMICS_TOPICS.map((topic) => topic.id), TOPICS);
  assert.ok(data.MECHANICAL_DYNAMICS_FORMULAS.length >= 20);
  assert.ok(data.MECHANICAL_DYNAMICS_QUESTIONS.length >= 25);
  assert.equal(data.MECHANICAL_DYNAMICS_EXAM_SPEC.officialMinutes, null);
  assert.equal(data.MECHANICAL_DYNAMICS_EXAM_SPEC.defaultMinutes, 50);
  assert.equal(data.MECHANICAL_DYNAMICS_EXAM_SPEC.userAdjustable, true);
  assert.equal(data.MECHANICAL_DYNAMICS_EXAM_SPEC.bigQuestionCount, 7);
  assert.equal(data.MECHANICAL_DYNAMICS_EXAM_SPEC.answerFieldCount, 13);
  assert.deepEqual(data.MECHANICAL_DYNAMICS_EXAM_SPEC.constants, { g: 9.8, pi: 3.14 });
  assert.match(data.MECHANICAL_DYNAMICS_SOURCE_POLICY.included.join(" "), /過去問.*全7大問.*13解答欄/);
  assert.match(data.MECHANICAL_DYNAMICS_SOURCE_POLICY.excluded.join(" "), /強制振動|共振|周波数応答/);
});
