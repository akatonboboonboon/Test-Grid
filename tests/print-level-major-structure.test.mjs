import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const APP = new URL("../app/", import.meta.url);

async function load(name) {
  const source = await readFile(new URL(name, APP), "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import("data:text/javascript;base64," + Buffer.from(javascript).toString("base64"));
}

function partCount(text) {
  return (text.match(/\(\d+\)/g) ?? []).length;
}

test("thermodynamics normal pool is thirty autonomous print-level majors", async () => {
  const data = await load("thermodynamics-data.ts");
  const pool = data.THERMODYNAMICS_PRINT_LEVEL_QUESTIONS;
  assert.equal(pool.length, 30);
  assert.equal(new Set(pool.map((question) => question.id)).size, 30);
  assert.deepEqual(
    Object.fromEntries(data.THERMODYNAMICS_TOPICS.map((topic) => [
      topic.id,
      pool.filter((question) => question.topic === topic.id).length,
    ])),
    { adiabatic: 6, polytropic: 3, "second-law": 3, entropy: 6, otto: 6, carnot: 3, refrigeration: 3 },
  );

  for (const question of pool) {
    assert.equal(question.difficulty, 3, question.id);
    assert.notEqual(question.format, "choice", question.id);
    assert.match(question.context, /【全条件】[\s\S]+【答案の構造】/, question.id);
    assert.doesNotMatch(question.context + "\n" + question.prompt, /前問|前二問|前問まで/, question.id);
    assert.ok(partCount(question.prompt) >= 4, question.id + " sub-requirements");
    assert.ok(partCount(question.explanation) >= 4, question.id + " complete answers in explanation");
    assert.doesNotMatch(question.answer, / ／ /, question.id + " grades only the final field");
    assert.ok(question.steps.length >= 8, question.id + " multi-stage working");
    assert.ok(question.diagram, question.id + " diagram");
    assert.match(question.explanation, /典型的誤答/, question.id);
    assert.ok(question.sourceRefs.length, question.id + " sources");
  }

  const added = pool.filter((question) => question.major === 5);
  assert.equal(added.length, 6);
  assert.ok(added.every((question) => question.sourceRefs.some((source) => source.kind === "range-zip" && source.page === 9)));
  assert.ok(added.every((question) => /冷凍能力.*必要動力/.test(question.prompt)));
});

test("material mechanics keeps twenty-four autonomous design majors plus four designated prose questions", async () => {
  const data = await load("material-mechanics-data.ts");
  const pool = data.MATERIAL_MECHANICS_PRINT_LEVEL_QUESTIONS;
  assert.equal(pool.length, 24);
  assert.equal(new Set(pool.map((question) => question.id)).size, 24);
  assert.deepEqual(
    Object.fromEntries(data.MATERIAL_MECHANICS_TOPICS.map((topic) => [
      topic.id,
      pool.filter((question) => question.topic === topic.id).length,
    ])),
    { torsion: 6, "shaft-design": 6, "coil-spring": 6, "beam-statics": 6 },
  );

  for (const question of pool) {
    assert.equal(question.difficulty, 3, question.id);
    assert.equal(question.format, "number", question.id);
    assert.match(question.context, /【全条件】[\s\S]+【答案の構造】/, question.id);
    assert.doesNotMatch(question.context + "\n" + question.prompt, /前問|前2問|前二問|前問まで/, question.id);
    assert.ok(partCount(question.prompt) >= 2, question.id + " sub-requirements");
    assert.ok(partCount(question.explanation) >= 2, question.id + " complete answers in explanation");
    assert.doesNotMatch(question.answer, / ／ /, question.id + " grades only the final field");
    assert.ok(question.steps.length >= 6, question.id + " multi-stage working");
    assert.ok(Number.isFinite(question.numericAnswer), question.id + " final graded quantity");
    assert.ok(question.expectedUnit, question.id + " final unit");
    assert.ok(question.diagram, question.id + " diagram");
    assert.match(question.explanation, /典型的誤答/, question.id);
    assert.ok(question.sourceRefs.length, question.id + " sources");
  }

  const added = pool.filter((question) => question.major === 5);
  assert.equal(added.length, 6);
  assert.ok(added.every((question) => [10, 11, 12, 13, 14].every((page) =>
    question.sourceRefs.some((source) => source.kind === "range-zip" && source.page === page),
  )));
  assert.ok(added.every((question) => /反力[\s\S]*SFD\/BMD[\s\S]*最大曲げ応力/.test(question.prompt)));
  assert.equal(pool.filter((question) => question.sourceRefs.some((source) => source.kind === "format-2-overlap")).length, 0);

  const supplement = data.MATERIAL_MECHANICS_SUPPLEMENT_QUESTIONS;
  assert.equal(supplement.length, 4);
  assert.deepEqual(supplement.map((question) => question.id), [
    "mm-q-supplement-q2-straight-beam",
    "mm-q-supplement-q5-pin-support",
    "mm-q-supplement-q7-concentrated-load",
    "mm-q-supplement-q10-cantilever-wording",
  ]);
  assert.ok(supplement.every((question) => question.format === "text"));
  assert.ok(supplement.every((question) => question.sourceRefs.length === 1 && question.sourceRefs[0].page === 15));
  assert.deepEqual(data.MATERIAL_MECHANICS_PRACTICE_QUESTIONS, [...pool, ...supplement]);
});
test("thermal uses print-level majors while material mixes print-level majors with the four official prose prompts", async () => {
  const [thermalPage, materialPage] = await Promise.all([
    readFile(new URL("subjects/subject-4/page.tsx", APP), "utf8"),
    readFile(new URL("subjects/subject-5/page.tsx", APP), "utf8"),
  ]);

  assert.match(thermalPage, /useState\(\[\.\.\.THERMODYNAMICS_PRINT_LEVEL_QUESTIONS\]\)/);
  assert.match(thermalPage, /THERMODYNAMICS_PRINT_LEVEL_QUESTIONS\.filter/);
  assert.match(thermalPage, /THERMODYNAMICS_PRINT_LEVEL_QUESTIONS\.length} PRINT-LEVEL MAJORS/);

  assert.match(materialPage, /useState\(\(\) => MATERIAL_MECHANICS_PRACTICE_QUESTIONS\.filter/);
  assert.match(materialPage, /randomize\(MATERIAL_MECHANICS_PRACTICE_QUESTIONS\.filter/);
  assert.match(materialPage, /MATERIAL_MECHANICS_PRACTICE_QUESTIONS\.length} PRACTICE QUESTIONS/);
  assert.ok(materialPage.includes("const KNOWN_QUESTION_IDS = new Set(MATERIAL_MECHANICS_PRACTICE_QUESTIONS.map"));
  assert.ok(!materialPage.includes("MATERIAL_MECHANICS_PRACTICE_QUESTIONS.find((question) => question.id === id) ??"));
});