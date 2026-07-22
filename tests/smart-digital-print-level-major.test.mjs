import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { importTypeScriptGraph } from "./helpers/import-typescript-graph.mjs";

const APP = new URL("../app/", import.meta.url);
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u;

function countSubparts(prompt) {
  return (prompt.match(/\(\d+\)/gu) ?? []).length;
}

function assertMajor(question, minimumParts, requireReviewChoices = true) {
  assert.equal(question.difficulty, 3, question.id);
  assert.equal(question.examLevel, true, question.id);
  assert.equal(question.format, "text", question.id);
  assert.ok(question.context?.trim(), `${question.id}: self-contained conditions`);
  assert.ok(countSubparts(question.prompt) >= minimumParts, `${question.id}: linked subquestions`);
  assert.ok(question.subpartCount >= minimumParts, `${question.id}: subpart metadata`);
  assert.ok(question.answer?.trim(), `${question.id}: complete answer`);
  if (requireReviewChoices) assert.equal(question.options?.length, 4, `${question.id}: four credible review choices`);
  assert.ok(question.steps?.length >= minimumParts, `${question.id}: full working`);
  assert.ok(question.explanation?.trim(), `${question.id}: explanation`);
  assert.ok(question.sourceBasis?.length >= 2, `${question.id}: source calibration`);
  for (const value of [question.context, question.prompt, question.answer, question.formula, ...question.steps]) {
    if (value) assert.doesNotMatch(value, CONTROL_CHARACTERS, `${question.id}: no escaped-TeX control characters`);
  }
}

test("smart-control normal, timed, and rapid pools are the same ten print-level majors", async () => {
  const smart = await importTypeScriptGraph(new URL("smart-control-data.ts", APP));
  const pool = smart.SMART_CONTROL_PRINT_LEVEL_QUESTIONS;
  assert.equal(pool.length, 10);
  assert.equal(new Set(pool.map((question) => question.id)).size, 10);
  assert.deepEqual(smart.SMART_CONTROL_QUESTIONS, pool);
  assert.deepEqual(smart.SMART_CONTROL_RAPID_CHALLENGES, pool);
  assert.deepEqual(new Set(pool.map((question) => question.topic)), new Set([
    "transfer", "inverse-laplace", "response-stability", "feedback", "block-diagram",
  ]));
  for (const question of pool) assertMajor(question, 3);
  for (const question of pool.filter((item) => ["response-stability", "feedback", "block-diagram"].includes(item.topic))) {
    assert.ok(question.diagramId, `${question.id}: problem-linked figure`);
  }
});

test("digital-circuit normal, timed, rapid, and A4 pools use complete diagrammed majors", async () => {
  const digital = await importTypeScriptGraph(new URL("digital-circuits-extra-data.ts", APP));
  const pool = digital.DIGITAL_CIRCUIT_PRINT_LEVEL_QUESTIONS;
  assert.equal(pool.length, 11);
  assert.equal(new Set(pool.map((question) => question.id)).size, 11);
  assert.deepEqual(digital.DIGITAL_CIRCUIT_ALL_QUESTIONS, pool);
  assert.deepEqual(digital.DIGITAL_CIRCUIT_RAPID_CHALLENGES, pool);
  assert.deepEqual(new Set(pool.map((question) => question.topic)), new Set([
    "logic-timing", "latches", "flipflops", "registers", "counters", "state-machines",
  ]));
  for (const question of pool) {
    assertMajor(question, 3);
    assert.ok(question.diagram, `${question.id}: problem-linked diagram`);
    assert.ok(question.sourceRefs?.length, `${question.id}: exact source reference`);
  }

  assert.equal(digital.DIGITAL_CIRCUIT_ALL_EXPECTED_EXAMS.length, 6);
  for (const paper of digital.DIGITAL_CIRCUIT_ALL_EXPECTED_EXAMS) {
    assert.equal(paper.sections.length, 5, paper.id);
    assert.equal(paper.sections.flatMap((section) => section.questions).length, 5, paper.id);
    assert.equal(paper.sections.flatMap((section) => section.questions).reduce((sum, question) => sum + question.points, 0), 100, paper.id);
    for (const section of paper.sections) {
      assert.equal(section.questions.length, 1, `${paper.id}/${section.title}: one full major, not fragments`);
      const [question] = section.questions;
      assert.ok(question.diagram, `${paper.id}/${question.id}: diagram`);
      assert.ok(countSubparts(question.prompt) >= 3, `${paper.id}/${question.id}: linked work`);
      assert.ok(question.steps.length >= 3, `${paper.id}/${question.id}: solved stages`);
    }
  }
});

test("smart and digital source TeX is double escaped and every runtime formula renders strictly", async () => {
  const [smartSource, digitalSource, smart, digital, katex] = await Promise.all([
    readFile(new URL("smart-control-major-questions.ts", APP), "utf8"),
    readFile(new URL("digital-circuits-major-questions.ts", APP), "utf8"),
    importTypeScriptGraph(new URL("smart-control-major-questions.ts", APP)),
    importTypeScriptGraph(new URL("digital-circuits-major-questions.ts", APP)),
    import(new URL("vendor/katex/katex.mjs", APP)),
  ]);
  for (const [label, source] of [["smart", smartSource], ["digital", digitalSource]]) {
    assert.doesNotMatch(source, /(?<!\\)\\(?!\\)/gu, `${label}: every source-level TeX slash must be doubled`);
  }
  const questions = [...smart.SMART_CONTROL_MAJOR_QUESTIONS, ...digital.DIGITAL_CIRCUIT_MAJOR_QUESTIONS];
  for (const question of questions.filter((item) => item.formula)) {
    assert.doesNotMatch(question.formula, CONTROL_CHARACTERS, question.id);
    assert.doesNotThrow(() => katex.renderToString(question.formula, {
      displayMode: true,
      output: "htmlAndMathml",
      strict: "error",
      throwOnError: true,
      trust: false,
    }), `${question.id}: ${question.formula}`);
  }
});

test("digital generators always return solved, sourced, diagrammed four-stage questions", async () => {
  const [generator, extraGenerator] = await Promise.all([
    importTypeScriptGraph(new URL("digital-circuits-generator.ts", APP)),
    importTypeScriptGraph(new URL("digital-circuits-extra-generator.ts", APP)),
  ]);
  for (let seed = 1; seed <= 120; seed += 1) {
    for (const question of [
      generator.generateDigitalCircuitQuestion(seed),
      extraGenerator.generateDigitalCircuitExtraQuestion(seed),
    ]) {
      assertMajor(question, 4, false);
      assert.ok(question.diagram, `${question.id}: generated diagram`);
      assert.ok(question.sourceRefs?.length, `${question.id}: generated source`);
    }
  }
});

test("subject pages and saved-session whitelists use print-level pools only", async () => {
  const [smartPage, digitalPage, rapidData] = await Promise.all([
    readFile(new URL("subjects/subject-6/page.tsx", APP), "utf8"),
    readFile(new URL("subjects/subject-9/page.tsx", APP), "utf8"),
    readFile(new URL("rapid-quiz-data.ts", APP), "utf8"),
  ]);
  assert.match(smartPage, /SMART_CONTROL_PRINT_LEVEL_QUESTIONS/u);
  assert.match(smartPage, /KNOWN_QUESTION_IDS = new Set\(SMART_CONTROL_PRINT_LEVEL_QUESTIONS\.map/u);
  assert.match(smartPage, /parsed\.questionIds\.some\([\s\S]*?!KNOWN_QUESTION_IDS\.has/u);
  assert.doesNotMatch(smartPage.slice(0, smartPage.indexOf("const TEXTBOOK_GRAPH_QUESTIONS")), /TEXTBOOK_RESPONSE_QUESTIONS\.filter/u);

  assert.match(digitalPage, /DIGITAL_CIRCUIT_PRINT_LEVEL_QUESTIONS/u);
  assert.doesNotMatch(digitalPage, /DIGITAL_CIRCUIT_ALL_QUESTIONS/u);
  assert.match(digitalPage, /KNOWN_QUESTION_IDS = new Set\(DIGITAL_CIRCUIT_PRINT_LEVEL_QUESTIONS\.map/u);
  assert.match(digitalPage, /parsed\.ids\.some\([\s\S]*?!KNOWN_QUESTION_IDS\.has/u);

  assert.match(rapidData, /SMART_CONTROL_PRINT_LEVEL_QUESTIONS/u);
  assert.match(rapidData, /DIGITAL_CIRCUIT_PRINT_LEVEL_QUESTIONS/u);
});
