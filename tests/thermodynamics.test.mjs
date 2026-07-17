import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const DATA_URL = new URL("../app/thermodynamics-data.ts", import.meta.url);
const ANALYSIS_URL = new URL("./fixtures/thermodynamics-range-analysis.json", import.meta.url);
const TOPICS = ["adiabatic", "polytropic", "second-law", "entropy", "otto", "carnot"];
const FORBIDDEN = [/蒸気表/, /飽和(?:水|蒸気|状態)/, /湿り蒸気/, /乾き度/, /ランキン/, /逆カルノー(?:サイクル|冷凍|冷蔵|熱ポンプ)/, /\bCOP\b/i, /成績係数/];

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

function strings(value, path = "root", output = []) {
  if (typeof value === "string") output.push([path, value]);
  else if (Array.isArray(value)) value.forEach((item, index) => strings(item, path + "[" + index + "]", output));
  else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => strings(item, path + "." + key, output));
  }
  return output;
}

function checkSources(items, allowlist, label) {
  const allowed = new Set(allowlist.map((item) => item.id));
  for (const item of items) {
    assert.ok(Array.isArray(item.sourceRefs) && item.sourceRefs.length, label + ":" + item.id + " sourceRefs");
    for (const ref of item.sourceRefs) {
      if (ref.kind === "range-zip") {
        assert.ok(Number.isInteger(ref.page) && ref.page >= 1 && ref.page <= 7, label + ":" + item.id + " page");
        assert.match(ref.filename, /^PXL_.*\.jpg$/i, label + ":" + item.id + " filename");
      } else {
        assert.equal(ref.kind, "format3-overlap");
        assert.ok(allowed.has(ref.overlapId), label + ":" + item.id + " allowlist");
        assert.ok(ref.question === 3 || ref.question === 4, label + ":" + item.id + " format3 question");
        assert.ok(ref.evidence.length >= 12, label + ":" + item.id + " evidence");
      }
    }
  }
}

function checkNoForbidden(value, label) {
  const serialized = JSON.stringify(value);
  for (const pattern of FORBIDDEN) assert.doesNotMatch(serialized, pattern, label + " " + pattern);
}

function checkMathStrings(value, katex, label) {
  const rendered = [];
  for (const [path, valueString] of strings(value, label)) {
    assert.doesNotMatch(valueString, /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/, path + " control");
    assert.equal((valueString.match(/\\\(/g) ?? []).length, (valueString.match(/\\\)/g) ?? []).length, path + " delimiters");
    for (const match of valueString.matchAll(/\\\(([\s\S]*?)\\\)/g)) {
      assert.doesNotMatch(match[1], /\//, path + " inline uses stacked fractions");
      let markup = "";
      assert.doesNotThrow(() => {
        markup = katex.renderToString(match[1], {
          displayMode: false,
          output: "htmlAndMathml",
          strict: "error",
          throwOnError: true,
          trust: false,
        });
      }, path + " inline TeX: " + match[1]);
      rendered.push(markup);
    }
  }
  return rendered;
}

function checkFormula(tex, katex, label) {
  assert.doesNotMatch(tex, /\\\(|\\\)/, label + " pure TeX");
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
  }, label + " TeX");
  return markup;
}

test("analysis contract fixes seven pages, six topics, and format3 Q3/Q4 only", async () => {
  const analysis = JSON.parse(await readFile(ANALYSIS_URL, "utf8"));
  assert.equal(analysis.pages.length, 7);
  assert.deepEqual(analysis.pages.map((page) => page.pageIndex), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(analysis.recommendedTopicTags.map((topic) => topic.id), TOPICS);
  assert.deepEqual(analysis.format3.includedQuestionNumbers, [3, 4]);
  assert.deepEqual(analysis.format3.excludedQuestionNumbers, [1, 2, 5]);
});

test("formula deck and practice pool meet coverage, source, scope, and TeX contracts", async () => {
  const data = await loadData();
  const katex = await import(new URL("../app/vendor/katex/katex.mjs", import.meta.url));
  assert.equal(data.THERMODYNAMICS_RANGE_PAGES.length, 7);
  assert.deepEqual(data.THERMODYNAMICS_TOPICS.map((item) => item.id), TOPICS);
  assert.deepEqual(data.THERMODYNAMICS_FORMAT3_OVERLAP_ALLOWLIST.map((item) => item.question), [3, 4]);
  assert.ok(data.THERMODYNAMICS_FORMULAS.length >= 24);
  assert.ok(data.THERMODYNAMICS_QUESTIONS.length >= 30);
  assert.equal(new Set(data.THERMODYNAMICS_FORMULAS.map((item) => item.id)).size, data.THERMODYNAMICS_FORMULAS.length);
  assert.equal(new Set(data.THERMODYNAMICS_QUESTIONS.map((item) => item.id)).size, data.THERMODYNAMICS_QUESTIONS.length);
  checkSources(data.THERMODYNAMICS_FORMULAS, data.THERMODYNAMICS_FORMAT3_OVERLAP_ALLOWLIST, "formula");
  checkSources(data.THERMODYNAMICS_QUESTIONS, data.THERMODYNAMICS_FORMAT3_OVERLAP_ALLOWLIST, "question");
  for (const topic of TOPICS) {
    assert.ok(data.THERMODYNAMICS_FORMULAS.some((item) => item.topic === topic), topic + " formula");
    assert.ok(data.THERMODYNAMICS_QUESTIONS.some((item) => item.topic === topic), topic + " question");
  }
  for (const card of data.THERMODYNAMICS_FORMULAS) {
    assert.ok(card.explanation.length >= 15, card.id + " explanation");
    checkFormula(card.formula, katex, card.id);
  }
  for (const item of data.THERMODYNAMICS_QUESTIONS) {
    assert.ok(item.answer.length, item.id + " answer");
    assert.ok(item.steps.length >= 2, item.id + " steps");
    assert.ok(item.explanation.length >= 12, item.id + " explanation");
    if (item.formula) checkFormula(item.formula, katex, item.id);
  }
  const tpCard = data.THERMODYNAMICS_FORMULAS.find((item) => item.id === "th-ad-tp");
  const ottoQuestion = data.THERMODYNAMICS_QUESTIONS.find((item) => item.id === "th-q-otto-format3");
  assert.ok(tpCard);
  assert.ok(ottoQuestion);
  assert.match(checkFormula(tpCard.formula, katex, tpCard.id), /<mfrac>/);
  assert.match(checkFormula(ottoQuestion.formula, katex, ottoQuestion.id), /<mtable/);
  const inlineMarkup = [
    ...checkMathStrings(data.THERMODYNAMICS_FORMULAS, katex, "formula"),
    ...checkMathStrings(data.THERMODYNAMICS_QUESTIONS, katex, "question"),
  ];
  assert.ok(inlineMarkup.some((markup) => /<mfrac>/.test(markup)), "inline fractions render as mfrac");
  checkNoForbidden(data.THERMODYNAMICS_FORMULAS, "formula");
  checkNoForbidden(data.THERMODYNAMICS_QUESTIONS, "question");
  assert.doesNotMatch(JSON.stringify(data.THERMODYNAMICS_QUESTIONS), /860 K|380 K|0\.0233/);
  const cards = new Map(data.THERMODYNAMICS_FORMULAS.map((card) => [card.id, card]));
  const questions = new Map(data.THERMODYNAMICS_QUESTIONS.map((question) => [question.id, question]));
  assert.equal(cards.get("th-ad-pv").diagram, "pv");
  assert.equal(cards.get("th-otto-cylinder").diagram, "piston");
  for (const id of ["th-otto-processes", "th-otto-compression", "th-otto-efficiency", "th-otto-temperature"]) {
    assert.equal(cards.get(id).diagram, "otto-pv", id);
  }
  for (const id of ["th-carnot-processes", "th-carnot-qin", "th-carnot-qout", "th-carnot-ratio", "th-carnot-efficiency"]) {
    assert.equal(cards.get(id).diagram, "carnot-pv", id);
  }
  assert.equal(cards.get("th-carnot-entropy").diagram, "carnot-ts");
  assert.equal(questions.get("th-q-otto-processes").diagram, "otto-pv");
  assert.equal(questions.get("th-q-otto-format3").diagram, "piston");
  assert.equal(questions.get("th-q-carnot-processes").diagram, "carnot-pv");
  assert.equal(questions.get("th-q-carnot-entropy").diagram, "carnot-ts");
});

test("six expected exams are 5-major, 22-subquestion, full-range practice papers", async () => {
  const data = await loadData();
  const katex = await import(new URL("../app/vendor/katex/katex.mjs", import.meta.url));
  assert.equal(data.THERMODYNAMICS_EXPECTED_EXAMS.length, 6);
  assert.equal(new Set(data.THERMODYNAMICS_EXPECTED_EXAMS.map((item) => item.id)).size, 6);
  for (const exam of data.THERMODYNAMICS_EXPECTED_EXAMS) {
    assert.equal(exam.defaultMinutes, 50);
    assert.equal(exam.userAdjustable, true);
    assert.equal(exam.totalPoints, 100);
    assert.equal(exam.scoreLabel, "練習用100点換算");
    assert.equal(exam.passPercent, 60);
    assert.equal(exam.sections.length, 5, exam.id + " majors");
    assert.equal(exam.questions.length, 22, exam.id + " subquestions");
    assert.equal(exam.questions.reduce((sum, item) => sum + item.points, 0), 100, exam.id + " points");
    assert.deepEqual(new Set(exam.questions.map((item) => item.topic)), new Set(TOPICS), exam.id + " coverage");
    assert.match(exam.officialConditionsNote, /公式.*確認できない/);
    assert.match(exam.officialConditionsNote, /練習設定/);
    checkSources(exam.questions, data.THERMODYNAMICS_FORMAT3_OVERLAP_ALLOWLIST, exam.id);
    for (const item of exam.questions) {
      assert.ok(item.answer.length, item.id + " answer");
      assert.ok(item.steps.length >= 2, item.id + " steps");
      assert.ok(item.explanation.length >= 12, item.id + " explanation");
      if (item.formula) checkFormula(item.formula, katex, item.id);
    }
    const inlineMarkup = checkMathStrings(exam, katex, exam.id);
    assert.ok(inlineMarkup.some((markup) => /<mfrac>/.test(markup)), exam.id + " inline fractions render as mfrac");
    checkNoForbidden(exam, exam.id);
    const diagramByField = new Map(exam.questions.map((question) => [`${question.major}.${question.sub}`, question.diagram]));
    assert.equal(diagramByField.get("4.1"), "otto-pv", exam.id + " Otto P-V");
    for (const field of ["4.2", "4.3", "4.4"]) assert.equal(diagramByField.get(field), "piston", exam.id + " " + field);
    assert.equal(diagramByField.get("4.5"), "otto-pv", exam.id + " Otto efficiency");
    assert.equal(diagramByField.get("5.1"), "carnot-pv", exam.id + " Carnot P-V");
    assert.equal(diagramByField.get("5.2"), "carnot-ts", exam.id + " Carnot T-S");
    for (const field of ["5.3", "5.4"]) assert.equal(diagramByField.get(field), "carnot-pv", exam.id + " " + field);
    assert.equal(diagramByField.get("5.5"), "carnot-ts", exam.id + " Carnot entropy");
  }
});

test("exam spec distinguishes adjustable practice defaults from unknown official conditions", async () => {
  const { THERMODYNAMICS_EXAM_SPEC: spec } = await loadData();
  assert.equal(spec.defaultMinutes, 50);
  assert.equal(spec.userAdjustable, true);
  assert.equal(spec.totalPoints, 100);
  assert.equal(spec.scoreLabel, "練習用100点換算");
  assert.equal(spec.passPercent, 60);
  assert.equal(spec.majorQuestionCount, 5);
  assert.equal(spec.subquestionCount, 22);
  assert.equal(spec.expectedExamCount, 6);
  assert.equal(spec.officialDurationMinutes, null);
  assert.equal(spec.officialTotalPoints, null);
  assert.equal(spec.officialPointAllocation, null);
  assert.match(spec.officialConditionsNote, /公式.*確認できない/);
  assert.match(spec.officialConditionsNote, /練習設定/);
});
