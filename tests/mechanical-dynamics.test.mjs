import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const DATA_URL = new URL("../app/mechanical-dynamics-data.ts", import.meta.url);
const TOPICS = ["undamped", "stiffness", "laplace", "damping", "decrement", "rotational"];
const USER_VISIBLE_FIELD = /\.(?:title|prompt|context|answer|explanation|example|cue|description|officialConditionsNote|options\[\d+\]|steps\[\d+\])$/;
const ALLOWED_UNIT_SLASH = /(?:rad\/s|m\/s(?:²|\^2)?|k?N\/m|N[·・ ]?s\/m|kg\/s|kg\/m³|N·m\/rad)/g;

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
  const formulaWithoutUnits = tex.replace(/\\mathrm\{[^{}]*\}/g, "");
  assert.doesNotMatch(formulaWithoutUnits, /\//, label + " uses stacked fractions");
  let markup = "";
  assert.doesNotThrow(() => {
    markup = katex.renderToString(tex, {
      displayMode: true,
      output: "htmlAndMathml",
      strict: "error",
      throwOnError: true,
      trust: false,
    });
  }, label + " TeX: " + tex);
  return markup;
}

function checkInlineMath(value, katex, label) {
  const markup = [];
  for (const [path, text] of allStrings(value, label)) {
    assert.doesNotMatch(text, /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/, path + " control");
    assert.equal((text.match(/\\\(/g) ?? []).length, (text.match(/\\\)/g) ?? []).length, path + " delimiters");
    if (USER_VISIBLE_FIELD.test(path)) {
      const plainText = text
        .replace(/\\\([\s\S]*?\\\)/g, "")
        .replace(ALLOWED_UNIT_SLASH, "");
      assert.doesNotMatch(plainText, /\//, path + " has horizontal math outside TeX");
    }
    for (const match of text.matchAll(/\\\(([\s\S]*?)\\\)/g)) {
      const tex = match[1];
      const formulaWithoutUnits = tex.replace(/\\mathrm\{[^{}]*\}/g, "");
      assert.doesNotMatch(formulaWithoutUnits, /\//, path + " inline uses stacked fractions");
      let rendered = "";
      assert.doesNotThrow(() => {
        rendered = katex.renderToString(tex, {
          displayMode: false,
          output: "htmlAndMathml",
          strict: "error",
          throwOnError: true,
          trust: false,
        });
      }, path + " inline TeX: " + tex);
      markup.push(rendered);
    }
  }
  return markup;
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
  const frequencyCard = data.MECHANICAL_DYNAMICS_FORMULAS.find((item) => item.id === "md-f-frequency");
  const amplitudeCard = data.MECHANICAL_DYNAMICS_FORMULAS.find((item) => item.id === "md-f-amplitude");
  assert.match(checkFormula(frequencyCard.formula, katex, frequencyCard.id), /<mfrac>/);
  assert.match(checkFormula(amplitudeCard.formula, katex, amplitudeCard.id), /<mtable/);
  const inlineMarkup = [
    ...checkInlineMath(data.MECHANICAL_DYNAMICS_FORMULAS, katex, "formula"),
    ...checkInlineMath(data.MECHANICAL_DYNAMICS_QUESTIONS, katex, "question"),
  ];
  assert.ok(inlineMarkup.some((markup) => /<mfrac>/.test(markup)), "inline fractions render as stacked MathML");
  assert.doesNotMatch(JSON.stringify([data.MECHANICAL_DYNAMICS_FORMULAS, data.MECHANICAL_DYNAMICS_QUESTIONS]), /強制振動|共振|周波数応答/);
});

test("mechanical setup and waveform questions carry diagrams across cards and practice", async () => {
  const data = await loadData();
  const cards = new Map(data.MECHANICAL_DYNAMICS_FORMULAS.map((card) => [card.id, card]));
  const questions = new Map(data.MECHANICAL_DYNAMICS_QUESTIONS.map((question) => [question.id, question]));
  assert.equal(cards.get("md-f-wn").diagram, "single-spring-mass");
  assert.equal(cards.get("md-f-zeta").diagram, "damped-spring-mass");
  assert.equal(cards.get("md-f-logdec").diagram, "amplitude-decay");
  assert.equal(cards.get("md-f-simple-pendulum").diagram, "simple-pendulum");
  for (const id of ["md-q-u1", "md-q-u6"]) assert.equal(questions.get(id).diagram, "single-spring-mass", id);
  assert.equal(questions.get("md-q-u7").diagram, "static-deflection");
  for (const id of ["md-q-d1", "md-q-d6"]) assert.equal(questions.get(id).diagram, "damped-spring-mass", id);
  for (const id of ["md-q-g1", "md-q-g6"]) assert.equal(questions.get(id).diagram, "amplitude-decay", id);
});

test("mechanical calculation steps do not expose bare horizontal math", async () => {
  const data = await loadData();
  const questions = [
    ...data.MECHANICAL_DYNAMICS_QUESTIONS,
    ...data.MECHANICAL_DYNAMICS_ACTUAL_EXAM.questions,
    ...data.MECHANICAL_DYNAMICS_EXPECTED_EXAMS.flatMap((exam) => exam.questions),
  ];
  for (const question of questions) {
    for (const step of question.steps) {
      const prose = step.replace(/\\\([\s\S]*?\\\)/g, "");
      assert.doesNotMatch(prose, /[=<>√]|\\sqrt|\d\s*[×÷+]\s*\d/, question.id + " bare step: " + step);
    }
  }
});

test("actual exam preserves 7 majors, 13 answer fields, 100 points and official constants", async () => {
  const data = await loadData();
  const katex = await import(new URL("../app/vendor/katex/katex.mjs", import.meta.url));
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
  assert.ok(exam.questions.every((item) => item.diagram), "every setup-based actual-exam field has its section diagram");
  for (const item of exam.questions) {
    if (item.formula) checkFormula(item.formula, katex, item.id);
    if (item.printedFormula) checkFormula(item.printedFormula, katex, item.id + " printed");
  }
  const actualInlineMarkup = checkInlineMath(exam, katex, "actual");
  assert.ok(actualInlineMarkup.some((markup) => /<mfrac>/.test(markup)), "actual exam inline fractions render as stacked MathML");

  const answers = exam.questions.map((item) => item.numericAnswer);
  assert.ok(Math.abs(answers[0] - 63.2456) < 1e-6);
  assert.ok(Math.abs(answers[1] - 10.071) < 1e-6);
  assert.ok(Math.abs(answers[2] - 0.0993) < 1e-6);
  assert.equal(answers[3], 70);
  assert.equal(answers[4], 0.001);
  assert.equal(answers[5], 100);
  assert.ok(Math.abs(answers[6] - 99.99995) < 1e-6);
  assert.ok(Math.abs(answers[7] - 0.01459) < 1e-6);
  assert.match(exam.sections[3].questions[0].formula, /\\frac\{1\}\{2\\pi n\}/);
  assert.match(exam.sections[4].questions[0].answer, /\\frac\{7k\}\{2m\}/);
  assert.match(exam.sections[5].questions[0].answer, /mr\^2/);
  assert.match(exam.sections[5].questions[1].answer, /\\frac\{cr\}\{2l\\sqrt\{mk\}\}/);
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
      if (item.topic === "laplace") assert.equal(item.diagram, undefined, item.id + " must not show an unrelated spring diagram");
      else assert.ok(item.diagram, item.id + " setup diagram");
    }
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
