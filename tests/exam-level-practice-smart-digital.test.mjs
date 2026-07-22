import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { importTypeScriptGraph } from "./helpers/import-typescript-graph.mjs";

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

function dataUrl(source) {
  return "data:text/javascript;base64," + Buffer.from(compile(source)).toString("base64");
}

async function importTypeScript(path) {
  return import(dataUrl(await readFile(new URL(path, import.meta.url), "utf8")));
}

async function loadDigital() {
  return Promise.all([
    importTypeScriptGraph("../app/digital-circuits-data.ts", import.meta.url),
    importTypeScriptGraph("../app/digital-circuits-extra-data.ts", import.meta.url),
    importTypeScriptGraph("../app/digital-circuits-generator.ts", import.meta.url),
    importTypeScriptGraph("../app/digital-circuits-extra-generator.ts", import.meta.url),
  ]);
}

test("smart-control confirmation and rapid-ready pools contain only linked exam-level work", async () => {
  const smart = await importTypeScriptGraph("../app/smart-control-data.ts", import.meta.url);
  assert.equal(smart.SMART_CONTROL_PRINT_LEVEL_QUESTIONS.length, 10);
  assert.equal(smart.SMART_CONTROL_QUESTIONS, smart.SMART_CONTROL_PRINT_LEVEL_QUESTIONS);
  const smartExamQuestionCount = smart.SMART_CONTROL_EXAMS.reduce((sum, exam) => sum + exam.questions.length, 0);
  assert.equal(smart.SMART_CONTROL_EXAM_LEVEL_QUESTIONS.length, 10 + smartExamQuestionCount);
  assert.equal(new Set(smart.SMART_CONTROL_EXAM_LEVEL_QUESTIONS.map((question) => question.id)).size, smart.SMART_CONTROL_EXAM_LEVEL_QUESTIONS.length);
  assert.ok(smart.SMART_CONTROL_EXAM_LEVEL_QUESTIONS.slice(smart.SMART_CONTROL_QUESTIONS.length).every(
    (question) => question.difficulty === 3 && question.examLevel && question.steps.length >= 3 && question.sourceBasis?.length,
  ));
  assert.equal(smart.SMART_CONTROL_RAPID_CHALLENGES, smart.SMART_CONTROL_PRINT_LEVEL_QUESTIONS);

  for (const question of smart.SMART_CONTROL_QUESTIONS) {
    assert.equal(question.difficulty, 3, `${question.id} difficulty`);
    assert.equal(question.examLevel, true, `${question.id} examLevel`);
    assert.ok(question.subpartCount >= 3, `${question.id} linked work count`);
    assert.ok(question.sourceBasis?.length >= 2, `${question.id} source calibration`);
    assert.match(question.prompt, /\(1\).+\(2\).+\(3\)/u, `${question.id} staged prompt`);
    assert.ok(question.steps.length >= 3, `${question.id} solution path`);
    assert.ok(question.context, `${question.id} context`);
  }
});

test("smart-control textbook red terms and response graphs are also exam-level", async () => {
  const textbook = await importTypeScript("../app/smart-control-textbook-data.ts");
  assert.ok(textbook.TEXTBOOK_RESPONSE_QUESTIONS.length >= 25);
  assert.equal(textbook.TEXTBOOK_RESPONSE_EXAM_LEVEL_QUESTIONS, textbook.TEXTBOOK_RESPONSE_QUESTIONS);
  for (const question of textbook.TEXTBOOK_RESPONSE_QUESTIONS) {
    assert.equal(question.difficulty, 3, `${question.id} difficulty`);
    assert.equal(question.examLevel, true, `${question.id} examLevel`);
    assert.equal(question.subpartCount, 3, `${question.id} linked work count`);
    assert.ok(question.sourceBasis?.length >= 2, `${question.id} source basis`);
    assert.match(question.prompt, /【図読取り3段階】/u, `${question.id} staged prompt`);
    assert.ok(question.steps.length >= 3, `${question.id} solution path`);
  }
});

test("digital-circuit confirmation and rapid-ready pools contain only diagrammed exam-level work", async () => {
  const [, extra] = await loadDigital();
  assert.equal(extra.DIGITAL_CIRCUIT_PRINT_LEVEL_QUESTIONS.length, 11);
  assert.equal(extra.DIGITAL_CIRCUIT_ALL_QUESTIONS, extra.DIGITAL_CIRCUIT_PRINT_LEVEL_QUESTIONS);
  const digitalExamQuestionCount = extra.DIGITAL_CIRCUIT_ALL_EXPECTED_EXAMS.reduce(
    (sum, exam) => sum + exam.sections.reduce((subtotal, section) => subtotal + section.questions.length, 0),
    0,
  );
  assert.equal(extra.DIGITAL_CIRCUIT_EXAM_LEVEL_QUESTIONS.length, extra.DIGITAL_CIRCUIT_ALL_QUESTIONS.length + digitalExamQuestionCount);
  assert.equal(new Set(extra.DIGITAL_CIRCUIT_EXAM_LEVEL_QUESTIONS.map((question) => question.id)).size, extra.DIGITAL_CIRCUIT_EXAM_LEVEL_QUESTIONS.length);
  assert.ok(extra.DIGITAL_CIRCUIT_EXAM_LEVEL_QUESTIONS.slice(extra.DIGITAL_CIRCUIT_ALL_QUESTIONS.length).every(
    (question) => question.difficulty === 3 && question.examLevel && question.steps.length >= 3 && question.sourceBasis?.length && question.diagram,
  ));
  assert.equal(extra.DIGITAL_CIRCUIT_RAPID_CHALLENGES, extra.DIGITAL_CIRCUIT_PRINT_LEVEL_QUESTIONS);

  for (const question of extra.DIGITAL_CIRCUIT_ALL_QUESTIONS) {
    assert.equal(question.difficulty, 3, `${question.id} difficulty`);
    assert.equal(question.examLevel, true, `${question.id} examLevel`);
    assert.ok(question.subpartCount >= 3, `${question.id} linked work count`);
    assert.ok(question.sourceBasis?.length >= 2, `${question.id} source calibration`);
    assert.ok(question.diagram, `${question.id} diagram`);
    assert.match(question.prompt, /\(1\).+\(2\).+\(3\)/u, `${question.id} staged prompt`);
    assert.ok(question.steps.length >= 3, `${question.id} solution path`);
  }
});

test("every digital on-demand variant stays solved, sourced, diagrammed, and exam-level", async () => {
  const [, , generator, extraGenerator] = await loadDigital();
  for (let seed = 1; seed <= 240; seed += 1) {
    for (const question of [
      generator.generateDigitalCircuitQuestion(seed),
      extraGenerator.generateDigitalCircuitExtraQuestion(seed),
    ]) {
      assert.equal(question.difficulty, 3, `${question.id} difficulty`);
      assert.equal(question.examLevel, true, `${question.id} examLevel`);
      assert.equal(question.subpartCount, 4, `${question.id} linked work count`);
      assert.ok(question.answer, `${question.id} answer`);
      assert.ok(question.diagram, `${question.id} diagram`);
      assert.ok(question.sourceRefs?.length, `${question.id} source`);
      assert.ok(question.sourceBasis?.length >= 2, `${question.id} source basis`);
      assert.ok(question.steps.length >= 4, `${question.id} full solution path`);
      assert.match(question.prompt, /\(1\).+\(2\).+\(3\).+\(4\)/u, `${question.id} staged prompt`);
    }
  }
});

test("shared generated-practice adapter preserves exam-level metadata for smart and digital", async () => {
  const source = await readFile(new URL("../app/generated-practice-engine.ts", import.meta.url), "utf8");
  for (const [name, next] of [
    ["smartStep", "smartPole"],
    ["smartPole", "smartFeedback"],
    ["smartFeedback", "smartSteadyState"],
    ["smartSteadyState", "smartSettling"],
  ]) {
    const segment = source.slice(source.indexOf(`function ${name}(`), source.indexOf(`function ${next}(`));
    assert.match(segment, /difficulty:\s*3/u, `${name} difficulty`);
    assert.match(segment, /subpartCount:\s*[34]/u, `${name} linked work count`);
    assert.match(segment, /sourceBasis:\s*\[/u, `${name} source basis`);
    assert.match(segment, /steps:\s*\[/u, `${name} steps`);
  }
  const digital = source.slice(source.indexOf("function digitalGenerated("), source.indexOf("const TEMPLATES:"));
  assert.match(digital, /difficulty:\s*generated\.difficulty/u);
  assert.match(digital, /subpartCount:\s*generated\.subpartCount/u);
  assert.match(digital, /sourceBasis:\s*generated\.sourceBasis/u);
});