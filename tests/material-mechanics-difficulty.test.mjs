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
      ["等価荷重と支点反力", "SFD/BMDと最大曲げモーメント", "最大曲げ応力"],
      `${exam.id}: beam chain`,
    );
    assert.deepEqual(beam.questions[1].dependsOn, [beam.questions[0].id]);
    assert.deepEqual(beam.questions[2].dependsOn, [beam.questions[1].id]);
    assert.equal(beam.questions[1].diagram, "sfd-bmd");
    assert.equal(beam.questions[2].diagram, "beam-section-stress");
    assert.ok(
      beam.questions[2].sourceRefs.some((ref) => ref.kind === "format-2-overlap" && ref.question === 5 && ref.sub === 4),
      `${exam.id}: bending stress source overlap`,
    );

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

test("format references admit only the documented beam-stress overlap", async () => {
  const data = await loadData();
  const refs = data.MATERIAL_MECHANICS_EXPECTED_EXAMS.flatMap((exam) => exam.questions.flatMap((question) => question.sourceRefs));
  const overlap = refs.filter((ref) => ref.kind === "format-2-overlap");
  assert.ok(overlap.some((ref) => ref.question === 3), "reaction/SFD/BMD overlap");
  assert.ok(overlap.some((ref) => ref.question === 5 && ref.sub === 4), "solid-circle bending-stress overlap");
  assert.ok(overlap.every((ref) => ref.question !== 4), "format-2 Q4 derivation stays excluded");
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.included.join(" "), /第5問\(1\)\(4\)/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.excluded.join(" "), /形式2第4問/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.excluded.join(" "), /Wahl/);
});
