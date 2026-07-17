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

function allStrings(value, path = "root", output = []) {
  if (typeof value === "string") output.push([path, value]);
  else if (Array.isArray(value)) value.forEach((item, index) => allStrings(item, path + "[" + index + "]", output));
  else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => allStrings(item, path + "." + key, output));
  }
  return output;
}

function checkFormula(tex, katex, label) {
  assert.doesNotMatch(tex, /\\\(|\\\)/, label + " pure TeX");
  assert.doesNotThrow(() => katex.renderToString(tex, {
    displayMode: true,
    output: "htmlAndMathml",
    strict: "error",
    throwOnError: true,
    trust: false,
  }), label + " TeX: " + tex);
}

function checkInlineMath(value, katex, label) {
  for (const [path, text] of allStrings(value, label)) {
    assert.doesNotMatch(text, /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/, path + " control");
    assert.equal((text.match(/\\\(/g) ?? []).length, (text.match(/\\\)/g) ?? []).length, path + " delimiters");
    for (const match of text.matchAll(/\\\(([\s\S]*?)\\\)/g)) {
      assert.doesNotThrow(() => katex.renderToString(match[1], {
        displayMode: false,
        output: "htmlAndMathml",
        strict: "error",
        throwOnError: true,
        trust: false,
      }), path + " inline TeX: " + match[1]);
    }
  }
}

function checkRangeSources(items, label) {
  for (const item of items) {
    assert.ok(Array.isArray(item.sourceRefs) && item.sourceRefs.length > 0, label + ":" + item.id + " sourceRefs");
    for (const ref of item.sourceRefs) {
      assert.ok(ref.kind === "range-zip" || ref.kind === "actual-exam", label + ":" + item.id + " kind");
      if (ref.kind === "range-zip") {
        assert.ok(Number.isInteger(ref.page) && ref.page >= 1 && ref.page <= 15, label + ":" + item.id + " range page");
        assert.match(ref.filename, /^PXL_.*\.jpg$/i, label + ":" + item.id + " filename");
      } else {
        assert.equal(ref.page, 1);
        assert.ok(ref.question >= 1 && ref.question <= 7, label + ":" + item.id + " actual question");
        assert.equal(ref.filename, "機械力学過去問.pdf");
      }
    }
  }
}

test("range contract has all fifteen pages and exactly six topics", async () => {
  const data = await loadData();
  assert.equal(data.MECHANICAL_DYNAMICS_RANGE_PAGES.length, 15);
  assert.deepEqual(data.MECHANICAL_DYNAMICS_RANGE_PAGES.map((page) => page.number), Array.from({ length: 15 }, (_, index) => index + 1));
  assert.deepEqual(data.MECHANICAL_DYNAMICS_TOPICS.map((topic) => topic.id), TOPICS);
  assert.deepEqual(
    new Set(data.MECHANICAL_DYNAMICS_RANGE_PAGES.flatMap((page) => page.topics)),
    new Set(TOPICS),
  );
  const source = await readFile(DATA_URL, "utf8");
  assert.doesNotMatch(source, /THERMODYNAMICS|Thermodynamics|thermodynamics|形式3|format3/);
});

test("formula deck and normal practice meet count, source, page, and TeX contracts", async () => {
  const data = await loadData();
  const katex = await import(new URL("../app/vendor/katex/katex.mjs", import.meta.url));
  assert.ok(data.MECHANICAL_DYNAMICS_FORMULAS.length >= 30);
  assert.ok(data.MECHANICAL_DYNAMICS_QUESTIONS.length >= 36);
  assert.equal(new Set(data.MECHANICAL_DYNAMICS_FORMULAS.map((item) => item.id)).size, data.MECHANICAL_DYNAMICS_FORMULAS.length);
  assert.equal(new Set(data.MECHANICAL_DYNAMICS_QUESTIONS.map((item) => item.id)).size, data.MECHANICAL_DYNAMICS_QUESTIONS.length);
  checkRangeSources(data.MECHANICAL_DYNAMICS_FORMULAS, "formula");
  checkRangeSources(data.MECHANICAL_DYNAMICS_QUESTIONS, "question");

  for (const topic of TOPICS) {
    assert.ok(data.MECHANICAL_DYNAMICS_FORMULAS.some((item) => item.topic === topic), topic + " formula");
    assert.ok(data.MECHANICAL_DYNAMICS_QUESTIONS.some((item) => item.topic === topic), topic + " question");
  }

  const referencedPages = new Set(
    [...data.MECHANICAL_DYNAMICS_FORMULAS, ...data.MECHANICAL_DYNAMICS_QUESTIONS]
      .flatMap((item) => item.sourceRefs)
      .filter((ref) => ref.kind === "range-zip")
      .map((ref) => ref.page),
  );
  assert.deepEqual(referencedPages, new Set(Array.from({ length: 15 }, (_, index) => index + 1)));

  for (const card of data.MECHANICAL_DYNAMICS_FORMULAS) {
    assert.ok(card.explanation.length >= 12, card.id + " explanation");
    checkFormula(card.formula, katex, card.id);
  }
  for (const item of data.MECHANICAL_DYNAMICS_QUESTIONS) {
    assert.ok(item.answer.length, item.id + " answer");
    assert.ok(item.steps.length >= 1, item.id + " steps");
    assert.ok(item.explanation.length >= 10, item.id + " explanation");
    if (item.formula) checkFormula(item.formula, katex, item.id);
  }
  checkInlineMath(data.MECHANICAL_DYNAMICS_FORMULAS, katex, "formula");
  checkInlineMath(data.MECHANICAL_DYNAMICS_QUESTIONS, katex, "question");
  assert.doesNotMatch(JSON.stringify([data.MECHANICAL_DYNAMICS_FORMULAS, data.MECHANICAL_DYNAMICS_QUESTIONS]), /強制振動|共振|周波数応答/);
});

test("actual exam preserves 7 majors, 13 answer fields, 100 points and official constants", async () => {
  const data = await loadData();
  const exam = data.MECHANICAL_DYNAMICS_ACTUAL_EXAM;
  assert.equal(exam.kind, "actual");
  assert.equal(exam.sections.length, 7);
  assert.equal(exam.questions.length, 13);
  assert.deepEqual(exam.sections.map((section) => section.points), [15, 10, 15, 10, 10, 30, 10]);
  assert.equal(exam.questions.reduce((sum, item) => sum + item.points, 0), 100);
  assert.equal(exam.totalPoints, 100);
  assert.equal(exam.officialMinutes, null);
  assert.equal(exam.defaultMinutes, 50);
  assert.equal(exam.userAdjustable, true);
  assert.match(exam.officialConditionsNote, /電卓使用可/);
  assert.match(exam.officialConditionsNote, /有効数字は3桁/);
  assert.match(exam.officialConditionsNote, /単位必須/);
  assert.match(exam.officialConditionsNote, /g=9\.80/);
  assert.match(exam.officialConditionsNote, /π=3\.14/);
  checkRangeSources(exam.questions, "actual");

  const answers = exam.questions.map((item) => item.numericAnswer);
  assert.ok(Math.abs(answers[0] - 63.2456) < 1e-6);
  assert.ok(Math.abs(answers[1] - 10.071) < 1e-6);
  assert.ok(Math.abs(answers[2] - 0.0993) < 1e-6);
  assert.equal(answers[3], 70);
  assert.equal(answers[4], 0.001);
  assert.equal(answers[5], 100);
  assert.ok(Math.abs(answers[6] - 99.99995) < 1e-6);
  assert.ok(Math.abs(answers[7] - 0.01459) < 1e-6);
  assert.match(exam.sections[3].questions[0].formula, /1\{?\/?\}?\{?2\\pi n/);
  assert.match(exam.sections[4].questions[0].answer, /7k\/\(2m\)/);
  assert.match(exam.sections[5].questions[0].answer, /mr\^2/);
  assert.match(exam.sections[5].questions[1].answer, /cr\/\(2l/);
  assert.ok(Math.abs(exam.sections[5].questions[2].numericAnswer - 0.50596) < 1e-6);
  assert.ok(Math.abs(exam.sections[6].questions[0].numericAnswer - 0.993955) < 1e-6);
});

test("six expected exams repeat the real 7-major/13-field format and cover all topics", async () => {
  const data = await loadData();
  const katex = await import(new URL("../app/vendor/katex/katex.mjs", import.meta.url));
  assert.equal(data.MECHANICAL_DYNAMICS_EXPECTED_EXAMS.length, 6);
  assert.equal(new Set(data.MECHANICAL_DYNAMICS_EXPECTED_EXAMS.map((exam) => exam.id)).size, 6);
  for (const exam of data.MECHANICAL_DYNAMICS_EXPECTED_EXAMS) {
    assert.equal(exam.kind, "expected");
    assert.equal(exam.sections.length, 7, exam.id + " majors");
    assert.equal(exam.questions.length, 13, exam.id + " answer fields");
    assert.equal(exam.questions.reduce((sum, item) => sum + item.points, 0), 100, exam.id + " points");
    assert.equal(exam.totalPoints, 100);
    assert.equal(exam.defaultMinutes, 50);
    assert.equal(exam.userAdjustable, true);
    assert.equal(exam.officialMinutes, null);
    assert.equal(exam.passPercent, 60);
    assert.deepEqual(new Set(exam.sections.flatMap((section) => section.topicIds)), new Set(TOPICS), exam.id + " coverage");
    assert.match(exam.officialConditionsNote, /変更可能な練習用/);
    assert.match(exam.officialConditionsNote, /g=9\.80/);
    assert.match(exam.officialConditionsNote, /π=3\.14/);
    checkRangeSources(exam.questions, exam.id);
    for (const item of exam.questions) {
      assert.ok(item.answer.length, item.id + " answer");
      assert.ok(item.steps.length >= 1, item.id + " steps");
      if (item.formula) checkFormula(item.formula, katex, item.id);
    }
    checkInlineMath(exam, katex, exam.id);
  }
});

test("exam spec and source policy distinguish official facts from practice defaults", async () => {
  const data = await loadData();
  const spec = data.MECHANICAL_DYNAMICS_EXAM_SPEC;
  assert.equal(spec.officialMinutes, null);
  assert.equal(spec.defaultMinutes, 50);
  assert.equal(spec.userAdjustable, true);
  assert.equal(spec.totalPoints, 100);
  assert.equal(spec.passPoints, 60);
  assert.equal(spec.passPercent, 60);
  assert.equal(spec.bigQuestionCount, 7);
  assert.equal(spec.answerFieldCount, 13);
  assert.equal(spec.expectedExamCount, 6);
  assert.deepEqual(spec.constants, { g: 9.8, pi: 3.14 });
  assert.ok(data.MECHANICAL_DYNAMICS_SOURCE_POLICY.included.some((item) => /全15画像/.test(item)));
  assert.ok(data.MECHANICAL_DYNAMICS_SOURCE_POLICY.included.some((item) => /過去問/.test(item)));
  assert.ok(data.MECHANICAL_DYNAMICS_SOURCE_POLICY.excluded.some((item) => /強制振動/.test(item)));
});
