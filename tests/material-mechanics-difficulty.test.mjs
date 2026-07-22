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

test("all six material papers enforce multi-step difficulty instead of substitution drills", async () => {
  const data = await loadData();
  assert.equal(data.MATERIAL_MECHANICS_EXPECTED_EXAMS.length, 6);

  const shaftGovernors = new Set();
  const springGovernors = new Set();
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
    assert.ok(hard.length >= 4, `${exam.id}: difficulty 3 count`);
    assert.ok(easy.length <= 2, `${exam.id}: difficulty 1 count`);
    assert.equal(hard.length, 8, `${exam.id}: calibrated hard count`);
    assert.equal(easy.length, 1, `${exam.id}: calibrated easy count`);
    assert.ok(hard.every((question) => question.steps.length >= 3), `${exam.id}: hard questions keep full working`);
    assert.ok(hard.every((question) => question.explanation.length >= 30), `${exam.id}: hard explanations are detailed`);

    const positions = new Map(exam.questions.map((question, index) => [question.id, index]));
    const linked = exam.questions.filter((question) => question.dependsOn?.length);
    assert.ok(linked.length >= 6, `${exam.id}: linked subquestions`);
    for (const question of linked) {
      for (const dependency of question.dependsOn) {
        assert.ok(positions.has(dependency), `${question.id}: dependency exists`);
        assert.ok(positions.get(dependency) < positions.get(question.id), `${question.id}: dependency is an earlier subquestion`);
      }
      assert.match(question.prompt, /前問|前2問|前問まで/, `${question.id}: prompt tells the student to carry the result forward`);
    }

    const solid = section(exam, 2);
    assert.deepEqual(
      solid.questions.map((question) => question.genre),
      ["応力条件の許容トルク", "ねじり角条件の許容トルク", "支配条件と許容動力"],
      `${exam.id}: solid-shaft chain`,
    );
    assert.ok(solid.questions.every((question) => question.difficulty === 3), `${exam.id}: solid design difficulty`);
    assert.deepEqual(solid.questions[2].dependsOn, [solid.questions[0].id, solid.questions[1].id]);
    shaftGovernors.add(solid.questions[2].answer.match(/（(.+?)が支配）/)?.[1]);

    const hollow = section(exam, 3);
    assert.deepEqual(hollow.questions.map((question) => question.genre), ["動力からトルク", "中空軸と中実軸の比較設計"]);
    assert.deepEqual(hollow.questions[1].dependsOn, [hollow.questions[0].id]);
    assert.match(hollow.questions[1].answer, /di=.*ds=.*Ah\/As=/);
    assert.match(hollow.questions[1].explanation, /外径と材料使用量/);

    const spring = section(exam, 4);
    assert.deepEqual(
      spring.questions.map((question) => question.genre),
      ["ばね定数", "応力条件の許容荷重", "二条件の許容荷重"],
      `${exam.id}: spring design chain`,
    );
    assert.deepEqual(spring.questions[2].dependsOn, [spring.questions[0].id, spring.questions[1].id]);
    springGovernors.add(spring.questions[2].answer.match(/（(.+?)が支配）/)?.[1]);

    const beam = section(exam, 5);
    assert.deepEqual(
      beam.questions.map((question) => question.genre),
      ["反力", "SFD/BMDと最大曲げモーメント", "最大曲げ応力"],
      `${exam.id}: beam chain`,
    );
    assert.deepEqual(beam.questions[1].dependsOn, [beam.questions[0].id]);
    assert.deepEqual(beam.questions[2].dependsOn, [beam.questions[1].id]);
    assert.ok(
      beam.questions.every((question) => question.diagram === beamDiagrams[exam.number - 1]),
      `${exam.id}: matching additional-range diagram family`,
    );
    for (const question of beam.questions) {
      assert.deepEqual(
        question.sourceRefs.filter((ref) => ref.kind === "range-zip").map((ref) => ref.page),
        [10, 11, 12, 13],
        `${question.id}: common problem sheet plus worked notes`,
      );
      assert.ok(question.sourceRefs.every((ref) => ref.kind === "range-zip"), `${question.id}: no format-2 source`);
    }

    for (const question of exam.questions) {
      assert.ok(question.diagram, `${question.id}: diagram`);
      if (question.numericAnswer !== undefined) {
        assert.ok(Number.isFinite(question.numericAnswer) && question.numericAnswer > 0, `${question.id}: finite positive answer`);
        assert.ok(Number.isFinite(question.tolerance) && question.tolerance > 0, `${question.id}: tolerance`);
      }
      if (question.formula) {
        assert.doesNotMatch(question.formula, /Wahl|EI|Castigliano|曲率/i, `${question.id}: no out-of-range formula`);
      }
    }
  }

  assert.deepEqual(shaftGovernors, new Set(["許容せん断応力", "許容ねじり角"]));
  assert.deepEqual(springGovernors, new Set(["線材の許容せん断応力", "許容たわみ"]));
});

test("additional beam chains use pages 10-13 while format-2 Q4 stays excluded", async () => {
  const data = await loadData();
  const beamQuestions = data.MATERIAL_MECHANICS_EXPECTED_EXAMS.flatMap((exam) => section(exam, 5).questions);
  assert.equal(beamQuestions.length, 18);
  for (const question of beamQuestions) {
    assert.deepEqual(
      question.sourceRefs.filter((ref) => ref.kind === "range-zip").map((ref) => ref.page),
      [10, 11, 12, 13],
      `${question.id}: page 10 problem sheet and pages 11-13 worked notes`,
    );
    assert.ok(question.sourceRefs.every((ref) => ref.kind === "range-zip"));
  }

  const refs = data.MATERIAL_MECHANICS_EXPECTED_EXAMS.flatMap((exam) => exam.questions.flatMap((question) => question.sourceRefs));
  const overlap = refs.filter((ref) => ref.kind === "format-2-overlap");
  assert.ok(overlap.every((ref) => ref.question !== 4), "format-2 Q4 derivation stays excluded");
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.included.join(" "), /第5問\(1\)\(4\)/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.excluded.join(" "), /形式2.*第4問/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.excluded.join(" "), /EI/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.excluded.join(" "), /Castigliano/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.excluded.join(" "), /曲率/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.excluded.join(" "), /Wahl/);
});
