import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const DATA_URL = new URL("../app/material-mechanics-data.ts", import.meta.url);
const GENERATOR_URL = new URL("../app/material-mechanics-generator-data.ts", import.meta.url);
const PAGE_URL = new URL("../app/subjects/subject-5/page.tsx", import.meta.url);
const EXAMS_URL = new URL("../app/material-mechanics-expected-exams.tsx", import.meta.url);
const EXAMS_CSS_URL = new URL("../app/material-mechanics-expected-exams.module.css", import.meta.url);
const DIAGRAMS_URL = new URL("../app/material-mechanics-diagrams.tsx", import.meta.url);

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

async function loadModule(url) {
  const source = await readFile(url, "utf8");
  return import("data:text/javascript;base64," + Buffer.from(compile(source)).toString("base64"));
}

function assertStackedFormula(tex, katex, label) {
  const withoutUnits = tex.replace(/\\mathrm\{[^{}]*\}/g, "");
  assert.doesNotMatch(withoutUnits, /\//, `${label} must use \\frac, not a horizontal slash`);
  assert.doesNotThrow(() => katex.renderToString(tex, {
    displayMode: true,
    output: "htmlAndMathml",
    strict: "error",
    throwOnError: true,
    trust: false,
  }), `${label} valid TeX: ${tex}`);
}

function assertSourceRefs(items) {
  for (const item of items) {
    assert.ok(item.sourceRefs.length > 0, `${item.id} has a source`);
    for (const ref of item.sourceRefs) {
      assert.equal(ref.kind, "range-zip", `${item.id} uses range ZIP only`);
      assert.ok(Number.isInteger(ref.page) && ref.page >= 1 && ref.page <= 13, `${item.id} range page`);
      assert.match(ref.filename, /\.(?:jpg|jpeg)$/i, `${item.id} range filename`);
    }
  }
}

test("material-mechanics range truth is thirteen pages across four documented topics", async () => {
  const data = await loadModule(DATA_URL);
  assert.deepEqual(data.MATERIAL_MECHANICS_RANGE_PAGES.map((page) => page.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  assert.deepEqual(
    data.MATERIAL_MECHANICS_TOPICS.map((topic) => topic.id),
    ["torsion", "shaft-design", "coil-spring", "beam-statics"],
  );
  assert.deepEqual(
    new Set(data.MATERIAL_MECHANICS_RANGE_PAGES.flatMap((page) => page.topics)),
    new Set(["torsion", "shaft-design", "coil-spring", "beam-statics"]),
  );
  assert.equal(data.MATERIAL_MECHANICS_EXAM_SPEC.officialMinutes, null);
  assert.equal(data.MATERIAL_MECHANICS_EXAM_SPEC.totalPoints, 100);
  assert.equal(data.MATERIAL_MECHANICS_EXAM_SPEC.passPoints, 60);
  assert.equal(data.MATERIAL_MECHANICS_EXAM_SPEC.paper, "A4 portrait");
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.included.join(" "), /合計13枚/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.formatOnly.join(" "), /形式2.*数値/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.excluded.join(" "), /過去問固有/);
  assert.match(data.MATERIAL_MECHANICS_SOURCE_POLICY.excluded.join(" "), /Wahl/);
});

test("material-mechanics cards and practice are source-backed, solved, diagrammed, and valid TeX", async () => {
  const data = await loadModule(DATA_URL);
  const katex = await import(new URL("../app/vendor/katex/katex.mjs", import.meta.url));
  assert.equal(data.MATERIAL_MECHANICS_FORMULAS.length, 24);
  assert.ok(data.MATERIAL_MECHANICS_QUESTIONS.length >= 32);
  assert.equal(new Set(data.MATERIAL_MECHANICS_FORMULAS.map((item) => item.id)).size, data.MATERIAL_MECHANICS_FORMULAS.length);
  assert.equal(new Set(data.MATERIAL_MECHANICS_QUESTIONS.map((item) => item.id)).size, data.MATERIAL_MECHANICS_QUESTIONS.length);
  assertSourceRefs(data.MATERIAL_MECHANICS_FORMULAS);
  assertSourceRefs(data.MATERIAL_MECHANICS_QUESTIONS);

  for (const topic of data.MATERIAL_MECHANICS_TOPICS) {
    assert.ok(data.MATERIAL_MECHANICS_FORMULAS.some((item) => item.topic === topic.id), `${topic.id} card`);
    assert.ok(data.MATERIAL_MECHANICS_QUESTIONS.some((item) => item.topic === topic.id), `${topic.id} practice`);
  }
  for (const card of data.MATERIAL_MECHANICS_FORMULAS) {
    assertStackedFormula(card.formula, katex, card.id);
    assert.ok(card.explanation.length >= 10, `${card.id} explanation`);
  }
  for (const question of data.MATERIAL_MECHANICS_QUESTIONS) {
    assert.ok(question.answer.length > 0, `${question.id} answer`);
    assert.ok(question.steps.length > 0, `${question.id} steps`);
    assert.ok(question.explanation.length >= 10, `${question.id} explanation`);
    if (question.formula) assertStackedFormula(question.formula, katex, question.id);
  }

  const byId = new Map(data.MATERIAL_MECHANICS_QUESTIONS.map((item) => [item.id, item]));
  assert.equal(byId.get("mm-q-solid-g").numericAnswer, 78.2);
  assert.equal(byId.get("mm-q-solid-stress").numericAnswer, 318.3);
  assert.equal(byId.get("mm-q-power-torque").numericAnswer, 15915.5);
  assert.equal(byId.get("mm-q-hollow-diameter").numericAnswer, 75.6);
  assert.equal(byId.get("mm-q-spring-rate").numericAnswer, 33.33);
  assert.equal(byId.get("mm-q-spring-deflection").numericAnswer, 235.7);
  for (const excludedId of ["mm-q-overhang-format2", "mm-q-overhang-sfd", "mm-q-udl-overhang-reactions", "mm-q-udl-mmax-location", "mm-q-udl-mmax"]) {
    assert.equal(byId.has(excludedId), false, `${excludedId} past-paper copy is excluded`);
  }
});

test("six expected A4 exams are 100-point, 60-pass, 5-major, all-topic solved papers", async () => {
  const data = await loadModule(DATA_URL);
  const katex = await import(new URL("../app/vendor/katex/katex.mjs", import.meta.url));
  assert.equal(data.MATERIAL_MECHANICS_EXPECTED_EXAMS.length, 6);
  for (const exam of data.MATERIAL_MECHANICS_EXPECTED_EXAMS) {
    assert.equal(exam.kind, "expected");
    assert.equal(exam.defaultMinutes, 50);
    assert.equal(exam.officialMinutes, null);
    assert.equal(exam.userAdjustable, true);
    assert.equal(exam.totalPoints, 100);
    assert.equal(exam.passPercent, 60);
    assert.equal(exam.paper, "A4 portrait");
    assert.equal(exam.sections.length, 5);
    assert.equal(exam.questions.length, 13);
    assert.equal(exam.questions.reduce((sum, item) => sum + item.points, 0), 100);
    assert.deepEqual(new Set(exam.sections.flatMap((section) => section.topicIds)), new Set(["torsion", "shaft-design", "coil-spring", "beam-statics"]));
    assert.ok(exam.questions.every((item) => item.diagram), `${exam.id} every setup has a problem-facing diagram`);
    assertSourceRefs(exam.questions);
    for (const item of exam.questions) if (item.formula) assertStackedFormula(item.formula, katex, item.id);
  }
});

test("material-mechanics generator exposes eight safe, source-backed, fully solved templates", async () => {
  const generator = await loadModule(GENERATOR_URL);
  const katex = await import(new URL("../app/vendor/katex/katex.mjs", import.meta.url));
  assert.deepEqual(
    generator.MATERIAL_MECHANICS_GENERATOR_TEMPLATES.map((item) => item.id),
    ["material-solid-shaft-stress", "material-hollow-shaft-stress", "material-coil-spring-deflection", "material-simple-beam-udl", "material-simple-beam-point-rect", "material-simple-beam-udl-rect", "material-cantilever-tip-hollow", "material-cantilever-udl-hollow"],
  );
  const random = { int: (minimum, maximum) => Math.floor((minimum + maximum) / 2) };
  for (const template of generator.MATERIAL_MECHANICS_GENERATOR_TEMPLATES) {
    const spec = generator.buildMaterialMechanicsGeneratedSpec(template.id, random);
    assert.equal(spec.templateId, template.id);
    assert.ok(Number.isFinite(spec.numericAnswer) && spec.numericAnswer > 0, `${template.id} numeric answer`);
    assert.ok(spec.finiteValues.every(Number.isFinite), `${template.id} finite values`);
    assert.ok(spec.denominators.every((value) => Number.isFinite(value) && value > 0), `${template.id} safe denominators`);
    assert.ok(spec.steps.length >= 2, `${template.id} worked solution`);
    assert.ok(spec.reason.length >= 10 && spec.explanation.length >= 10, `${template.id} rationale`);
    assert.ok(spec.sourceReferenceIds.length >= 2 && spec.sourcePages.length >= 1, `${template.id} source references`);
    assertStackedFormula(spec.formula, katex, template.id);
    const displayed = Number(spec.answer.match(/[+-]?(?:\d+(?:\.\d+)?|\.\d+)/)?.[0]);
    assert.ok(Number.isFinite(displayed), `${template.id} answer begins with a number`);
    assert.ok(Math.abs(displayed - spec.numericAnswer) <= Math.max(0.01, spec.tolerance), `${template.id} displayed answer agrees`);
  }
  const beam = generator.buildMaterialMechanicsGeneratedSpec("material-simple-beam-udl", random);
  assert.match(beam.prompt, /最大曲げモーメント/);
  assert.doesNotMatch(beam.answer, /R_A|R_B|反力/);
  assert.equal((beam.answer.match(/[+-]?(?:\d+(?:\.\d+)?|\.\d+)/g) ?? []).length, 1);
});

test("material-mechanics UI provides searchable cards, timed drill, persistence, A4 print, and answer-safe diagrams", async () => {
  const [page, exams, css, diagrams] = await Promise.all([
    readFile(PAGE_URL, "utf8"),
    readFile(EXAMS_URL, "utf8"),
    readFile(EXAMS_CSS_URL, "utf8"),
    readFile(DIAGRAMS_URL, "utf8"),
  ]);
  for (const mode of ["scope", "cards", "practice", "test", "expected", "guide"]) {
    assert.match(page, new RegExp(`mode === ["']${mode}["']`));
  }
  assert.match(page, /type SourceFilter = "range-zip"/);
  assert.doesNotMatch(page, /SourceFilterControl|形式2・範囲一致部/);
  assert.match(page, /範囲ZIP13枚だけが今回範囲の正本/);
  assert.match(page, /形式2は形式のみ参照し、問題内容・数値は使用していません/);
  assert.match(exams, /範囲ZIP13枚 p\./);
  assert.doesNotMatch(exams, /形式2確認済み重複|形式2の確認済み範囲重複/);
  assert.match(page, /<CardDeckSearch/);
  assert.match(page, /href="\/rapid\/subject-5"/);
  assert.match(page, /href="\/generated-practice\?subject=subject-5"/);
  assert.match(page, /test-grid:subject-5:progress:v1/);
  assert.match(page, /test-grid:subject-5:mock-test:v1/);
  assert.match(page, /currentPracticeQuestion\.diagram && <MaterialMechanicsDiagram/);
  assert.match(page, /question\.diagram && <MaterialMechanicsDiagram[^>]*solution/);

  assert.match(exams, /test-grid:subject-5:expected-exam:v1/);
  assert.match(exams, /window\.print\(\)/);
  assert.match(exams, /中断して保存/);
  assert.match(exams, /続きから再開/);
  assert.match(exams, /question\.diagram && <MaterialMechanicsDiagram[^>]*解答用線図/);
  assert.match(exams, /question\.diagram && <MaterialMechanicsDiagram[^>]*solution/);
  assert.match(css, /@page\s*\{/);
  assert.match(css, /size:\s*A4 portrait/);
  assert.match(css, /210mm/);
  assert.match(css, /297mm/);

  for (const kind of ["solid-shaft", "hollow-shaft", "coil-spring", "support-types", "simply-supported-point", "simply-supported-udl", "overhang-beam", "overhang-udl", "cantilever-udl", "load-resultants", "sfd-bmd", "overhang-sfd-bmd", "beam-section-stress", "additional-simple-point-rect", "additional-simple-udl-rect", "additional-cantilever-tip-hollow", "additional-cantilever-udl-hollow"]) {
    assert.match(diagrams, new RegExp(`"${kind}"`), `${kind} diagram`);
  }
  assert.match(diagrams, /useId/);
  assert.match(diagrams, /solution && <>[\s\S]*R=wL/);
  assert.match(diagrams, /function Resultants\([^)]*solution/);
  assert.match(diagrams, /solution \? <>[\s\S]*作用位置 L\/2/);
  assert.match(diagrams, /solution \? <><path d=\{sfd\}/);
  assert.match(diagrams, /function BeamSectionStress/);
  assert.match(diagrams, /σmax=Mmax\/Z/);
});
