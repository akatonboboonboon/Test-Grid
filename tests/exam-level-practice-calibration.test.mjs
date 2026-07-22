import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function load(relativePath) {
  const url = new URL(relativePath, import.meta.url);
  const source = await readFile(url, "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import("data:text/javascript;base64," + Buffer.from(javascript).toString("base64"));
}

test("mechanical, thermal, and material confirmation pools contain only exam-level linked work", async () => {
  const [mechanical, thermal, material] = await Promise.all([
    load("../app/mechanical-dynamics-data.ts"),
    load("../app/thermodynamics-data.ts"),
    load("../app/material-mechanics-data.ts"),
  ]);
  const contracts = [
    {
      label: "mechanical",
      pool: mechanical.MECHANICAL_DYNAMICS_PRINT_LEVEL_QUESTIONS,
      topics: mechanical.MECHANICAL_DYNAMICS_TOPICS.map((topic) => topic.id),
      minimum: 40,
      diagrams: true,
    },
    {
      label: "thermal",
      pool: thermal.THERMODYNAMICS_PRINT_LEVEL_QUESTIONS,
      topics: thermal.THERMODYNAMICS_TOPICS.map((topic) => topic.id),
      minimum: 30,
      diagrams: true,
    },
    {
      label: "material",
      pool: material.MATERIAL_MECHANICS_PRINT_LEVEL_QUESTIONS,
      topics: material.MATERIAL_MECHANICS_TOPICS.map((topic) => topic.id),
      minimum: 26,
      diagrams: true,
    },
  ];
  for (const contract of contracts) {
    assert.ok(contract.pool.length >= contract.minimum, `${contract.label} pool density`);
    assert.deepEqual(new Set(contract.pool.map((question) => question.topic)), new Set(contract.topics), `${contract.label} coverage`);
    assert.equal(new Set(contract.pool.map((question) => question.id)).size, contract.pool.length, `${contract.label} ids`);
    for (const question of contract.pool) {
      assert.equal(question.difficulty, 3, `${question.id} difficulty`);
      assert.ok(question.steps.length >= 3, `${question.id} linked steps`);
      assert.ok(question.context?.length >= 20, `${question.id} standalone conditions`);
      assert.ok(question.answer.trim(), `${question.id} solved answer`);
      assert.ok(question.sourceRefs.length >= 1, `${question.id} source`);
      if (contract.label !== "thermal" && !(contract.label === "mechanical" && question.topic === "laplace")) {
        assert.ok(question.diagram, `${question.id} setup diagram`);
      }
    }
    if (contract.label === "thermal") {
      assert.ok(contract.pool.filter((question) => question.diagram).length >= contract.pool.length / 2, "thermal diagrams where state plots are needed");
    }
  }
});

test("mechanical normal practice pool is print-level, standalone, and retains actual-exam filtering", async () => {
  const mechanical = await load("../app/mechanical-dynamics-data.ts");
  const pool = mechanical.MECHANICAL_DYNAMICS_PRINT_LEVEL_QUESTIONS;
  assert.equal(pool.length, mechanical.MECHANICAL_DYNAMICS_EXPECTED_EXAMS.length * 7 + 2);
  assert.equal(new Set(pool.map((question) => question.id)).size, pool.length);
  assert.deepEqual(new Set(pool.map((question) => question.topic)), new Set(mechanical.MECHANICAL_DYNAMICS_TOPICS.map((topic) => topic.id)));
  for (const question of pool) {
    assert.equal(question.difficulty, 3, `${question.id} difficulty`);
    assert.ok(question.steps.length >= 3, `${question.id} real multi-stage work`);
    assert.ok(question.context?.length >= 20, `${question.id} standalone context`);
    assert.ok(question.sourceRefs.length >= 1, `${question.id} source-backed`);
    assert.match(question.prompt, /この大問を最初から通して解け/u, `${question.id} complete major`);
    assert.match(question.prompt, /必要な中間量を上の条件から自分で導出/u, `${question.id} re-derives prior work`);
    assert.equal(question.steps.some((step) => step.includes("答案上で照査する")), false, `${question.id} no generic padding step`);
    assert.doesNotMatch(question.id, /^md-(?:actual|expected)-/u, `${question.id} no raw subquestion id`);
  }
  const actual = pool.filter((question) => question.sourceRefs.some((source) => source.kind === "actual-exam"));
  assert.equal(actual.length, 2, "actual-exam source filter keeps complete majors 5 and 6");
  assert.ok(actual.every((question) => /【実物過去問・大問[56]】/u.test(question.context)));
});
test("statistics and applied mathematics practice use complete major-question chains", async () => {
  const [statistics, applied] = await Promise.all([
    load("../app/statistics-expected-exams-data.ts"),
    load("../app/applied-math-data.ts"),
  ]);

  const expectedStatisticsCount = [...statistics.EXPECTED_PAPERS_BY_ID.values()]
    .reduce((sum, paper) => sum + paper.sections.length, 0);
  assert.equal(statistics.STATISTICS_PRINT_LEVEL_QUESTIONS.length, expectedStatisticsCount);
  for (const question of statistics.STATISTICS_PRINT_LEVEL_QUESTIONS) {
    assert.equal(question.difficulty, 3, `${question.id} difficulty`);
    assert.ok(question.steps.length >= 3, `${question.id} linked work`);
    assert.ok(question.context?.length >= 10, `${question.id} standalone givens`);
    assert.match(question.prompt, /次の大問を最初から解き/u, `${question.id} full major prompt`);
    assert.match(question.prompt, /最終設問/u, `${question.id} final graded target`);
    assert.ok(question.answer.trim(), `${question.id} solved`);
  }

  const expectedAppliedCount = applied.APPLIED_MATH_EXPECTED_EXAMS
    .reduce((sum, exam) => sum + exam.sections.length, 0);
  assert.equal(applied.APPLIED_MATH_PRINT_LEVEL_QUESTIONS.length, expectedAppliedCount);
  for (const question of applied.APPLIED_MATH_PRINT_LEVEL_QUESTIONS) {
    assert.equal(question.difficulty, 3, `${question.id} difficulty`);
    assert.ok(question.steps.length >= 3, `${question.id} linked work`);
    assert.ok(question.context?.length >= 10, `${question.id} standalone givens`);
    assert.match(question.prompt, /次の大問を最初から解き/u, `${question.id} full major prompt`);
    assert.match(question.prompt, /最終設問/u, `${question.id} final graded target`);
    assert.ok(question.answer.trim(), `${question.id} solved`);
  }

  const statisticsPage = await readFile(new URL("../app/subjects/subject-7/page.tsx", import.meta.url), "utf8");
  const appliedPage = await readFile(new URL("../app/subjects/subject-8/page.tsx", import.meta.url), "utf8");
  assert.match(statisticsPage, /STATISTICS_PRINT_LEVEL_QUESTIONS/u);
  assert.doesNotMatch(statisticsPage, /STATISTICS_ADDITIONAL_QUESTIONS/u);
  assert.match(appliedPage, /APPLIED_MATH_PRINT_LEVEL_QUESTIONS/u);
  assert.doesNotMatch(appliedPage, /APPLIED_MATH_EXAM_LEVEL_QUESTIONS/u);
});

test("timed confirmation pages use and restore the exam-level pools", async () => {
  for (const [subject, token] of [
    ["subject-3", "MECHANICAL_DYNAMICS_PRINT_LEVEL_QUESTIONS"],
    ["subject-4", "THERMODYNAMICS_PRINT_LEVEL_QUESTIONS"],
    ["subject-5", "MATERIAL_MECHANICS_PRINT_LEVEL_QUESTIONS"],
  ]) {
    const source = await readFile(new URL(`../app/subjects/${subject}/page.tsx`, import.meta.url), "utf8");
    assert.match(source, new RegExp(`\\(\\) => ${token}\\.filter`), `${subject} candidates`);
    assert.match(source, new RegExp(`${token}\\.find\\(\\(question\\) => question\\.id === id\\)`), `${subject} resume`);
    assert.match(source, /KNOWN_QUESTION_IDS = new Set\(/, `${subject} saved id allow-list`);
  }
});

test("material generation specs are all source-backed multi-stage exam questions", async () => {
  const data = await load("../app/material-mechanics-generator-data.ts");
  const random = { int: (minimum, maximum) => Math.floor((minimum + maximum) / 2) };
  for (const template of data.MATERIAL_MECHANICS_GENERATOR_TEMPLATES) {
    const spec = data.buildMaterialMechanicsGeneratedSpec(template.id, random);
    assert.equal(spec.difficulty, 3, template.id);
    assert.ok(spec.subpartCount >= 4, `${template.id} subparts`);
    assert.ok(spec.steps.length >= 4, `${template.id} steps`);
    assert.ok(spec.sourceReferenceIds.length >= 3, `${template.id} exact sources`);
    assert.ok(spec.sourceBasis.length >= 2, `${template.id} basis`);
    assert.ok(Number.isFinite(spec.numericAnswer), `${template.id} finite answer`);
    assert.ok(spec.denominators.every((value) => Number.isFinite(value) && Math.abs(value) > 1e-12), `${template.id} denominators`);
    assert.doesNotMatch(spec.formula, /\//u, `${template.id} stacked TeX fractions`);
  }
});