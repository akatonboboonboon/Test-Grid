import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const APP = new URL("../app/", import.meta.url);
async function load(name) {
  const source = await readFile(new URL(name, APP), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
}
const pages = (item) => item.sourceRefs.filter((ref) => ref.kind === "range-zip").map((ref) => ref.page);

test("additional pages and six bending formulas are exact", async () => {
  const data = await load("material-mechanics-data.ts");
  assert.deepEqual(data.MATERIAL_MECHANICS_RANGE_PAGES.slice(9).map((p) => [p.number, p.filename]), [
    [10, "PXL_20260722_061249575.MP.jpg"],
    [11, "PXL_20260722_061315221.MP.jpg"],
    [12, "PXL_20260722_061318328.MP.jpg"],
    [13, "PXL_20260722_061322324.MP.jpg"],
  ]);
  assert.equal(data.MATERIAL_MECHANICS_FORMULAS.length, 24);
  const f = new Map(data.MATERIAL_MECHANICS_FORMULAS.map((card) => [card.id, card.formula]));
  const ids = ["mm-f-bending-stress", "mm-f-rectangle-bending", "mm-f-hollow-bending", "mm-f-simple-point-general", "mm-f-cantilever-tip", "mm-f-cantilever-udl-free"];
  assert.ok(ids.every((id) => f.has(id)));
  assert.equal(f.get(ids[0]), "\\sigma=\\frac{My}{I}=\\frac{M}{Z}");
  assert.match(f.get(ids[1]), /bh\^3\}\{12\}[\s\S]*bh\^2\}\{6\}/);
  assert.match(f.get(ids[2]), /d_o\^4-d_i\^4\)\}\{64\}[\s\S]*\}\{32d_o\}/);
  assert.match(f.get(ids[3]), /Pb\}\{L\}[\s\S]*Pa\}\{L\}[\s\S]*Pab\}\{L\}/);
  assert.equal(f.get(ids[4]), "R=P,\\qquad |M_0|=PL");
  assert.match(f.get(ids[5]), /V\(x\)=-wx[\s\S]*wx\^2\}\{2\}[\s\S]*wL\^2\}\{2\}/);
  for (const id of ids) assert.doesNotMatch(f.get(id), /I_p|Z_p/);
});

test("twelve exact practices keep diagrams, normalized values, and pages 10-13", async () => {
  const data = await load("material-mechanics-data.ts");
  const q = new Map(data.MATERIAL_MECHANICS_QUESTIONS.filter((x) => x.id.startsWith("mm-q-add-")).map((x) => [x.id, x]));
  assert.equal(q.size, 12);
  const diagrams = { c1: "additional-simple-point-rect", c2: "additional-simple-udl-rect", c3: "additional-cantilever-tip-hollow", c4: "additional-cantilever-udl-hollow" };
  for (const [c, diagram] of Object.entries(diagrams)) for (const suffix of ["reactions", "mmax", "stress"]) {
    const item = q.get("mm-q-add-" + c + "-" + suffix);
    assert.equal(item.diagram, diagram);
    assert.deepEqual(pages(item), [10, 11, 12, 13]);
  }
  assert.match(q.get("mm-q-add-c1-reactions").answer, /3\.0[\s\S]*5\.0/);
  assert.match(q.get("mm-q-add-c2-reactions").answer, /24\.0[\s\S]*12\.0/);
  assert.match(q.get("mm-q-add-c3-reactions").answer, /4\.0[\s\S]*8\.0/);
  assert.match(q.get("mm-q-add-c4-reactions").answer, /1\.50[\s\S]*2\.25/);
  const moments = { "mm-q-add-c1-mmax": 7500, "mm-q-add-c2-mmax": 12000, "mm-q-add-c3-mmax": 8000, "mm-q-add-c4-mmax": 2250 };
  for (const [id, value] of Object.entries(moments)) {
    assert.equal(q.get(id).numericAnswer, value);
    assert.equal(q.get(id).expectedUnit, "N·m");
    assert.equal(q.get(id).acceptedUnits["kN*m"], 1000);
  }
  assert.deepEqual(["c1", "c2", "c3", "c4"].map((c) => q.get("mm-q-add-" + c + "-stress").numericAnswer), [62.5, 100, 138.02, 38.82]);
});

test("six mock chains cover four new families and use pages 10-13", async () => {
  const data = await load("material-mechanics-data.ts");
  const diagrams = ["additional-simple-point-rect", "additional-simple-udl-rect", "additional-cantilever-tip-hollow", "additional-cantilever-udl-hollow", "additional-simple-point-rect", "additional-cantilever-udl-hollow"];
  const stresses = [62.5, 100, 138.02, 38.82];
  for (const [i, exam] of data.MATERIAL_MECHANICS_EXPECTED_EXAMS.entries()) {
    assert.deepEqual([exam.sections.length, exam.questions.length, exam.questions.reduce((n, x) => n + x.points, 0), exam.defaultMinutes], [5, 13, 100, 50]);
    const beam = exam.sections[4];
    assert.deepEqual(beam.questions.map((x) => x.genre), ["反力", "SFD/BMDと最大曲げモーメント", "最大曲げ応力"]);
    assert.ok(beam.questions.every((x) => x.diagram === diagrams[i]));
    assert.deepEqual(beam.questions[1].dependsOn, [beam.questions[0].id]);
    assert.deepEqual(beam.questions[2].dependsOn, [beam.questions[1].id]);
    for (const item of beam.questions) {
      assert.deepEqual(pages(item), [10, 11, 12, 13]);
      assert.ok(item.sourceRefs.every((ref) => ref.kind === "range-zip"));
      assert.doesNotMatch(item.formula, /\//);
    }
    if (i < 4) assert.equal(Number(beam.questions[2].numericAnswer.toFixed(2)), stresses[i]);
  }
  assert.equal(new Set(diagrams).size, 4);
});

test("eight generators include four page-10 bending families and hollow formulas", async () => {
  const gen = await load("material-mechanics-generator-data.ts");
  assert.equal(gen.MATERIAL_MECHANICS_GENERATOR_TEMPLATES.length, 8);
  const expected = { "material-simple-beam-point-rect": [10, 11], "material-simple-beam-udl-rect": [10, 11], "material-cantilever-tip-hollow": [10, 12], "material-cantilever-udl-hollow": [10, 13] };
  const random = { int: (a, b) => Math.floor((a + b) / 2) };
  for (const [id, sourcePages] of Object.entries(expected)) {
    const spec = gen.buildMaterialMechanicsGeneratedSpec(id, random);
    assert.deepEqual(spec.sourcePages, sourcePages);
    assert.ok(spec.sourcePages.includes(10));
    assert.ok(Number.isFinite(spec.numericAnswer) && spec.steps.length >= 3);
  }
  for (const id of ["material-cantilever-tip-hollow", "material-cantilever-udl-hollow"]) {
    const formula = gen.MATERIAL_MECHANICS_GENERATOR_TEMPLATES.find((x) => x.id === id).formula;
    assert.match(formula, /d_o\^4-d_i\^4/);
    assert.match(formula, /32d_o/);
    assert.doesNotMatch(formula, /I_p|Z_p/);
  }
});

test("rapid, comprehensive, generated, and ranking pools include the range", async () => {
  const names = ["rapid-quiz-data.ts", "official-ranking-config.ts", "official-ranking-question-ids.ts", "generated-practice-engine.ts"];
  const [rapid, ranking, ids, engine] = await Promise.all(names.map((name) => readFile(new URL(name, APP), "utf8")));
  assert.match(rapid, /MATERIAL_MECHANICS_RAPID = examLevelPool\([\s\S]*MATERIAL_MECHANICS_QUESTIONS[\s\S]*MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS/);
  assert.match(rapid, /"subject-5": combineRapidPools\([\s\S]*MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS[\s\S]*MATERIAL_MECHANICS_FORMULAS/);
  assert.match(rapid, /getOfficialRankingEligiblePool[\s\S]*getStaticRapidPool\(subjectId\)\.filter/);
  assert.match(ranking, /"subject-5"/);
  assert.match(ids, /"subject-5":[\s\S]*rapid-exam-mm-e[1-6]-5-1/);
  for (const id of ["material-simple-beam-point-rect", "material-simple-beam-udl-rect", "material-cantilever-tip-hollow", "material-cantilever-udl-hollow"]) assert.ok(engine.includes('"' + id + '"'));
});

test("application copy has no stale nine-page material range", async () => {
  const files = (await readdir(APP, { recursive: true })).filter((path) => /\.(?:ts|tsx)$/u.test(path));
  const stale = [];
  for (const path of files) {
    const source = await readFile(new URL(path.replaceAll("\\", "/"), APP), "utf8");
    if (/範囲ZIP\s*9(?:枚|ページ)/u.test(source)) stale.push(path);
  }
  assert.deepEqual(stale, []);
});
