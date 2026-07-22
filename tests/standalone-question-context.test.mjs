import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { importTypeScriptGraph } from "./helpers/import-typescript-graph.mjs";

async function load(relativePath) {
  return importTypeScriptGraph(relativePath, import.meta.url);
}

test("shuffled exam questions retain their shared setup and referenced prior prompts", async () => {
  const [applied, mechanical, thermal, material, statistics] = await Promise.all([
    load("../app/applied-math-data.ts"),
    load("../app/mechanical-dynamics-data.ts"),
    load("../app/thermodynamics-data.ts"),
    load("../app/material-mechanics-data.ts"),
    load("../app/statistics-expected-exams-data.ts"),
  ]);

  const appliedPool = applied.APPLIED_MATH_EXAM_LEVEL_QUESTIONS;
  assert.equal(appliedPool.length, 108, "all six applied-math papers contribute 18 standalone questions");
  assert.ok(appliedPool.every((question) => question.context?.trim()), "every applied-math question keeps its major setup");
  for (const question of appliedPool.filter((item) => /前問|前2問|同じ曲線|同じ曲面/.test(item.prompt))) {
    assert.match(question.context, /【同じ大問の前問】/, `${question.id}: referenced prior prompt is visible`);
  }
  const screenshotQuestion = appliedPool.find((question) => question.id === "applied-expected-06-m1-s2");
  assert.ok(screenshotQuestion, "the reported mobile question remains in the pool");
  assert.match(screenshotQuestion.context, /A=/, "the reported question shows points A, B, and C");
  assert.match(screenshotQuestion.context, /大問1\(1\)/, "the reported question identifies the exact prior subquestion");

  for (const [label, pool] of [
    ["mechanical", mechanical.MECHANICAL_DYNAMICS_EXAM_LEVEL_QUESTIONS],
    ["thermal", thermal.THERMODYNAMICS_EXAM_LEVEL_QUESTIONS],
  ]) {
    assert.ok(pool.every((question) => question.context?.trim()), `${label}: every shuffled question keeps its setup`);
    for (const question of pool.filter((item) => /前問|前二問|前問まで/.test(item.prompt))) {
      assert.match(question.context, /【同じ大問の前問】/, `${question.id}: prior prompt is visible`);
    }
  }

  const materialPool = material.MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS;
  for (const question of materialPool.filter((item) => item.dependsOn?.length)) {
    assert.match(question.context, /【この設問で参照する前問】/, `${question.id}: declared dependencies are visible`);
    for (const dependencyId of question.dependsOn) {
      const dependency = materialPool.find((item) => item.id === dependencyId);
      assert.ok(dependency, `${question.id}: dependency ${dependencyId} exists`);
      assert.ok(question.context.includes(dependency.prompt), `${question.id}: dependency ${dependencyId} prompt is included`);
    }
  }

  const statisticsPool = statistics.STATISTICS_EXAM_LEVEL_QUESTIONS;
  assert.ok(statisticsPool.every((question) => question.context?.trim()), "statistics: every shuffled question keeps its table or scenario");
  for (const question of statisticsPool.filter((item) => item.linkedCalculation && item.sub > 1)) {
    assert.match(question.context, /【同じ大問の前問】/, `${question.id}: prior statistical subquestions are visible`);
  }
  for (const definition of statistics.STATISTICS_EXPECTED_EXAMS) {
    const paper = statistics.EXPECTED_PAPERS_BY_ID.get(definition.id);
    for (const section of paper.sections) {
      for (const sourceQuestion of section.questions.filter((question) => question.difficulty >= 2)) {
        const shuffledQuestion = statisticsPool.find((question) => question.id === sourceQuestion.id);
        assert.ok(shuffledQuestion, `${sourceQuestion.id}: shuffled question exists`);
        const setupOccurrences = shuffledQuestion.context.split(section.context).length - 1;
        assert.equal(setupOccurrences, 1, `${sourceQuestion.id}: shared setup is shown exactly once`);
      }
    }
  }
});

test("single-question banks do not rely on an unseen previous question", async () => {
  const [applied, mechanical, thermal, material, smart, pdf12] = await Promise.all([
    load("../app/applied-math-data.ts"),
    load("../app/mechanical-dynamics-data.ts"),
    load("../app/thermodynamics-data.ts"),
    load("../app/material-mechanics-data.ts"),
    load("../app/smart-control-data.ts"),
    load("../app/statistics-pdf12-data.ts"),
  ]);
  const banks = [
    ["applied", applied.APPLIED_MATH_QUESTIONS],
    ["mechanical", mechanical.MECHANICAL_DYNAMICS_QUESTIONS],
    ["thermal", thermal.THERMODYNAMICS_QUESTIONS],
    ["material", material.MATERIAL_MECHANICS_QUESTIONS],
    ["smart", smart.SMART_CONTROL_QUESTIONS],
    ["statistics-pdf12", pdf12.STATISTICS_PDF12_QUESTIONS],
  ];
  const ambiguousOpening = /^(?:前問|前2問|前問まで|同じ試行|同じ20枚|同じ12本|同じ曲線|同じ曲面)/;
  for (const [label, questions] of banks) {
    for (const question of questions) {
      assert.doesNotMatch(question.prompt, ambiguousOpening, `${label}/${question.id}: standalone prompt must carry its own conditions`);
    }
  }
});
  const statisticsSource = await readFile(new URL("../app/statistics-data.ts", import.meta.url), "utf8");
  assert.doesNotMatch(
    statisticsSource,
    /prompt:\s*"(?:前問|同じ試行|同じ20枚|同じ12本|同じ曲線|同じ曲面)/,
    "statistics: standalone prompts must carry their own conditions",
  );
