import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const DATA_URL = new URL("../app/material-mechanics-data.ts", import.meta.url);

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

async function loadData() {
  const source = await readFile(DATA_URL, "utf8");
  return import("data:text/javascript;base64," + Buffer.from(compile(source)).toString("base64"));
}

function section(exam, number) {
  const value = exam.sections.find((candidate) => candidate.number === number);
  assert.ok(value, `${exam.id}: major ${number}`);
  return value;
}

test("all six material papers keep print-level difficulty inside the documented range", async () => {
  const data = await loadData();
  assert.equal(data.MATERIAL_MECHANICS_EXPECTED_EXAMS.length, 6);
  const beamDiagrams = [
    "additional-simple-point-rect",
    "additional-simple-udl-rect",
    "additional-cantilever-tip-hollow",
    "additional-cantilever-udl-hollow",
    "additional-simple-point-rect",
    "additional-cantilever-udl-hollow",
  ];

  for (const exam of data.MATERIAL_MECHANICS_EXPECTED_EXAMS) {
    assert.equal(exam.defaultMinutes, 50, exam.id);
    assert.equal(exam.totalPoints, 100, exam.id);
    assert.equal(exam.passPercent, 60, exam.id);
    assert.equal(exam.sections.length, 5, exam.id);
    assert.equal(exam.questions.length, 13, exam.id);
    assert.equal(exam.questions.reduce((sum, question) => sum + question.points, 0), 100, exam.id);

    const hard = exam.questions.filter((question) => question.difficulty === 3);
    const easy = exam.questions.filter((question) => question.difficulty === 1);
    assert.equal(hard.length, 7, `${exam.id}: calibrated hard count`);
    assert.equal(easy.length, 1, `${exam.id}: calibrated easy count`);
    assert.ok(hard.every((question) => question.steps.length >= 2), `${exam.id}: hard questions keep full working`);
    assert.ok(hard.every((question) => question.explanation.length >= 20), `${exam.id}: hard explanations are detailed`);

    const positions = new Map(exam.questions.map((question, index) => [question.id, index]));
    const linked = exam.questions.filter((question) => question.dependsOn?.length);
    assert.ok(linked.length >= 6, `${exam.id}: linked subquestions`);
    for (const question of linked) {
      for (const dependency of question.dependsOn) {
        assert.ok(positions.has(dependency), `${question.id}: dependency exists`);
        assert.ok(positions.get(dependency) < positions.get(question.id), `${question.id}: dependency is earlier`);
      }
      assert.match(question.prompt, /前問|同じトルク/, `${question.id}: prompt identifies the carried result`);
    }

    const solid = section(exam, 2);
    assert.deepEqual(solid.questions.map((question) => question.genre), ["中実丸軸の断面量", "最大せん断応力", "ねじり角"]);
    assert.deepEqual(solid.questions.map((question) => question.difficulty), [2, 3, 3]);
    assert.deepEqual(solid.questions[1].dependsOn, [solid.questions[0].id]);
    assert.deepEqual(solid.questions[2].dependsOn, [solid.questions[0].id]);

    const hollow = section(exam, 3);
    assert.deepEqual(hollow.questions.map((question) => question.genre), ["動力からトルク", "中空軸外径の設計"]);
    assert.deepEqual(hollow.questions[1].dependsOn, [hollow.questions[0].id]);
    assert.doesNotMatch(hollow.questions[1].prompt + hollow.questions[1].answer, /\bds\b|Ah\/As|断面積比/);

    const spring = section(exam, 4);
    assert.deepEqual(spring.questions.map((question) => question.genre), ["ばね定数", "許容応力から最大荷重", "最大荷重時のたわみ"]);
    assert.deepEqual(spring.questions[2].dependsOn, [spring.questions[0].id, spring.questions[1].id]);
    assert.doesNotMatch(spring.questions[2].prompt + spring.questions[2].answer, /小さい方|min|支配/);

    const beam = section(exam, 5);
    assert.deepEqual(beam.questions.map((question) => question.genre), ["反力", "SFD/BMDと最大曲げモーメント", "最大曲げ応力"]);
    assert.deepEqual(beam.questions[1].dependsOn, [beam.questions[0].id]);
    assert.deepEqual(beam.questions[2].dependsOn, [beam.questions[1].id]);
    assert.ok(beam.questions.every((question) => question.diagram === beamDiagrams[exam.number - 1]));

    for (const question of exam.questions) {
      assert.ok(question.diagram, `${question.id}: diagram`);
      assert.ok(question.sourceRefs.every((ref) => ref.kind === "range-zip"), `${question.id}: range ZIP only`);
      if (question.numericAnswer !== undefined) {
        assert.ok(Number.isFinite(question.numericAnswer) && question.numericAnswer > 0, `${question.id}: finite positive answer`);
        assert.ok(Number.isFinite(question.tolerance) && question.tolerance > 0, `${question.id}: tolerance`);
      }
      if (question.formula) assert.doesNotMatch(question.formula, /\\min|Wahl|EI|Castigliano|曲率/i, `${question.id}: no unsupported formula`);
    }
  }
});
test("additional beam chains use pages 10-14 while every past-paper problem stays format-only", async () => {
  const data = await loadData();
  const beamQuestions = data.MATERIAL_MECHANICS_EXPECTED_EXAMS.flatMap((exam) => section(exam, 5).questions);
  assert.equal(beamQuestions.length, 18);
  for (const question of beamQuestions) {
    assert.deepEqual(
      question.sourceRefs.filter((ref) => ref.kind === "range-zip").map((ref) => ref.page),
      [10, 11, 12, 13, 14],
      `${question.id}: page 10 problem sheet, pages 11-13 notes, and supplement page 14`,
    );
    assert.ok(question.sourceRefs.every((ref) => ref.kind === "range-zip"));
  }

  const refs = data.MATERIAL_MECHANICS_EXPECTED_EXAMS.flatMap((exam) => exam.questions.flatMap((question) => question.sourceRefs));
  assert.ok(refs.every((ref) => ref.kind === "range-zip"), "all problem content comes from the 15 range sheets");
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.included.join(" "), /合計15枚/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.formatOnly.join(" "), /形式2.*数値.*出題しない/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.excluded.join(" "), /過去問固有/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.excluded.join(" "), /EI/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.excluded.join(" "), /Castigliano/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.excluded.join(" "), /曲率/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.excluded.join(" "), /Wahl/);
});
