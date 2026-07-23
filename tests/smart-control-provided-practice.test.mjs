import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { importTypeScriptGraph } from "./helpers/import-typescript-graph.mjs";

const APP = new URL("../app/", import.meta.url);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TEX_FIELDS = [
  "functionTex",
  "factorizedTex",
  "decompositionTex",
  "inverseTex",
  "polesTex",
  "plantTex",
  "closedLoopTex",
  "characteristicTex",
  "atOnePolesTex",
  "stableRangeTex",
];

function poleKey(pole) {
  return `${pole.re},${pole.im},${pole.multiplicity ?? 1}`;
}

function inlineTex(text) {
  return [...text.matchAll(/\\\(([\s\S]*?)\\\)/gu)].map((match) => match[1]);
}

function assertStrictTex(katex, tex, label) {
  assert.ok(tex.trim(), `${label}: TeX must not be empty`);
  assert.doesNotThrow(
    () => katex.renderToString(tex, {
      displayMode: true,
      output: "htmlAndMathml",
      strict: "error",
      throwOnError: true,
      trust: false,
    }),
    `${label}: ${tex}`,
  );
}

test("provided sheet has all 11 inverse-Laplace and two feedback exercises with complete solutions", async () => {
  const practice = await importTypeScriptGraph(new URL("smart-control-practice-sheet-data.ts", APP));
  const inverse = practice.SMART_CONTROL_INVERSE_LAPLACE_PRACTICE;
  const feedback = practice.SMART_CONTROL_FEEDBACK_PRACTICE;
  const all = [...inverse, ...feedback];

  assert.equal(inverse.length, 11, "major 1 must reproduce all eleven printed formulas");
  assert.equal(feedback.length, 2, "major 2 must reproduce both printed feedback systems");
  assert.deepEqual(inverse.map((item) => item.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.deepEqual(feedback.map((item) => item.number), [1, 2]);
  assert.equal(new Set(all.map((item) => item.id)).size, 13, "provided-practice IDs must be unique");
  assert.deepEqual(new Set(practice.SMART_CONTROL_PROVIDED_PRACTICE_IDS), new Set(all.map((item) => item.id)));
  assert.equal(practice.SMART_CONTROL_PRACTICE_SHEET_META.sourceRole, "provided-practice");
  assert.equal(practice.SMART_CONTROL_PRACTICE_SHEET_META.inExamScope, false);

  for (const item of inverse) {
    assert.equal(item.sourceRole, "provided-practice", item.id);
    assert.equal(item.inExamScope, false, item.id);
    for (const field of ["functionTex", "factorizedTex", "decompositionTex", "inverseTex", "polesTex"]) {
      assert.ok(item[field]?.trim(), `${item.id}: missing ${field}`);
    }
    assert.ok(item.poles.length >= 1, `${item.id}: every printed transform needs its poles`);
    assert.ok(item.poles.every((pole) => Number.isFinite(pole.re) && Number.isFinite(pole.im) && pole.label.trim()), `${item.id}: numeric labelled poles`);
    assert.ok(item.poles.every((pole) => pole.multiplicity === undefined || (Number.isInteger(pole.multiplicity) && pole.multiplicity >= 2)), `${item.id}: valid repeated-pole metadata`);
    assert.ok(item.stability.trim(), `${item.id}: stability reasoning`);
    assert.ok(["stable", "marginal", "unstable"].includes(item.stabilityKind), `${item.id}: stability classification`);
    assert.ok(item.steps.length >= 3 && item.steps.every((step) => step.trim()), `${item.id}: complete intermediate working`);
  }

  for (const item of feedback) {
    assert.equal(item.sourceRole, "provided-practice", item.id);
    assert.equal(item.inExamScope, false, item.id);
    for (const field of ["plantTex", "closedLoopTex", "characteristicTex", "atOnePolesTex", "stableRangeTex"]) {
      assert.ok(item[field]?.trim(), `${item.id}: missing ${field}`);
    }
    assert.ok(item.atOneVerdict.trim(), `${item.id}: K=1 verdict`);
    assert.ok(item.stableRangeLabel.trim(), `${item.id}: stable-range explanation`);
    assert.ok(item.steps.length >= 4 && item.steps.every((step) => step.trim()), `${item.id}: complete feedback working`);
  }
});

test("printed formulas, poles, and stability decisions match the supplied sheet", async () => {
  const practice = await importTypeScriptGraph(new URL("smart-control-practice-sheet-data.ts", APP));
  const expected = {
    1: { poles: ["1,2,1", "1,-2,1"], kind: "unstable" },
    2: { poles: ["1,0,1", "-1,0,1", "-2,0,1"], kind: "unstable" },
    3: { poles: ["0,0,2", "1,0,1"], kind: "unstable" },
    4: { poles: ["3,0,1", "-2,0,1", "-1,0,1"], kind: "unstable" },
    5: { poles: ["2,3,1", "2,-3,1"], kind: "unstable" },
    6: { poles: ["-1,0,1", "0,2,1", "0,-2,1"], kind: "marginal" },
    7: { poles: ["1,0,2", "3,0,1"], kind: "unstable" },
    8: { poles: ["0,0,2"], kind: "unstable" },
    9: { poles: ["-1,3,1", "-1,-3,1"], kind: "stable" },
    10: { poles: ["-1,0,2", "1,0,1"], kind: "unstable" },
    11: { poles: ["-1,0,2", "1,0,1"], kind: "unstable" },
  };
  for (const item of practice.SMART_CONTROL_INVERSE_LAPLACE_PRACTICE) {
    assert.deepEqual(new Set(item.poles.map(poleKey)), new Set(expected[item.number].poles), `${item.id}: poles`);
    assert.equal(item.stabilityKind, expected[item.number].kind, `${item.id}: stability`);
  }

  const second = practice.SMART_CONTROL_INVERSE_LAPLACE_PRACTICE[1];
  assert.equal(second.functionTex, "F(s)=\\frac{s+3}{(s^2-1)(s+2)}", "printed item (2) has numerator s+3");
  assert.match(second.inverseTex, /e\^t/u);
  const third = practice.SMART_CONTROL_INVERSE_LAPLACE_PRACTICE[2];
  assert.equal(third.functionTex, "F(s)=\\frac{s+1}{s^2(s-1)}", "printed item (3) has numerator s+1");
  assert.match(third.inverseTex, /2e\^t/u);

  const [firstFeedback, secondFeedback] = practice.SMART_CONTROL_FEEDBACK_PRACTICE;
  assert.equal(firstFeedback.stableRangeTex.replaceAll(" ", ""), "K>2");
  assert.match(firstFeedback.atOnePolesTex, /\\sqrt\{5\}/u);
  assert.match(secondFeedback.atOnePolesTex, /\\pm\s*j/u);
  assert.match(secondFeedback.stableRangeTex, /\\nexists/u);
});

test("every supplied-practice formula and inline working renders with strict KaTeX", async () => {
  const [source, practice, katex] = await Promise.all([
    readFile(new URL("smart-control-practice-sheet-data.ts", APP), "utf8"),
    importTypeScriptGraph(new URL("smart-control-practice-sheet-data.ts", APP)),
    import(new URL("vendor/katex/katex.mjs", APP)),
  ]);
  assert.doesNotMatch(source, /(?<!\\)\\(?!\\)/gu, "all source-level TeX backslashes must be escaped");

  const all = [
    ...practice.SMART_CONTROL_INVERSE_LAPLACE_PRACTICE,
    ...practice.SMART_CONTROL_FEEDBACK_PRACTICE,
  ];
  for (const item of all) {
    for (const field of TEX_FIELDS) {
      if (item[field]) assertStrictTex(katex, item[field], `${item.id}/${field}`);
    }
    for (const [index, step] of item.steps.entries()) {
      for (const [formulaIndex, tex] of inlineTex(step).entries()) {
        assertStrictTex(katex, tex, `${item.id}/step-${index + 1}/formula-${formulaIndex + 1}`);
      }
    }
  }
});

test("provided sheet stays out of normal, rapid, ranking, and comprehensive pools", async (context) => {
  const [practice, smart] = await Promise.all([
    importTypeScriptGraph(new URL("smart-control-practice-sheet-data.ts", APP)),
    importTypeScriptGraph(new URL("smart-control-data.ts", APP)),
  ]);
  const providedIds = new Set(practice.SMART_CONTROL_PROVIDED_PRACTICE_IDS);
  const printIds = new Set(smart.SMART_CONTROL_PRINT_LEVEL_QUESTIONS.map((item) => item.id));
  assert.equal(smart.SMART_CONTROL_PRINT_LEVEL_QUESTIONS.length, 10, "the current exam pool remains ten full majors");
  assert.equal(smart.SMART_CONTROL_QUESTIONS.length, 10);
  assert.equal(smart.SMART_CONTROL_RAPID_CHALLENGES.length, 10);
  for (const pool of [smart.SMART_CONTROL_PRINT_LEVEL_QUESTIONS, smart.SMART_CONTROL_QUESTIONS, smart.SMART_CONTROL_RAPID_CHALLENGES]) {
    assert.equal(pool.some((item) => providedIds.has(item.id)), false, "provided sheet must not alter the current exam scope");
  }
  assert.equal([...providedIds].some((id) => printIds.has(id)), false);

  const server = await createServer({
    root: projectRoot,
    configFile: false,
    server: { middlewareMode: true },
    logLevel: "silent",
  });
  context.after(() => server.close());
  const rapid = await server.ssrLoadModule("/app/rapid-quiz-data.ts");
  for (const [label, pool] of [
    ["rapid", rapid.getStaticRapidPool("subject-6")],
    ["ranking", rapid.getOfficialRankingEligiblePool("subject-6")],
    ["comprehensive", rapid.getComprehensiveRapidPool("subject-6")],
  ]) {
    assert.equal(pool.some((item) => providedIds.has(item.id)), false, `${label}: provided-practice isolation`);
  }
});

test("subject 6 exposes a dedicated responsive practice-sheet tab with pole and feedback figures", async () => {
  const [page, component, css] = await Promise.all([
    readFile(new URL("subjects/subject-6/page.tsx", APP), "utf8"),
    readFile(new URL("smart-control-practice-sheet.tsx", APP), "utf8"),
    readFile(new URL("smart-control-practice-sheet.module.css", APP), "utf8"),
  ]);

  assert.match(page, /SmartControlPracticeSheet/u);
  assert.match(page, /"provided-practice"/u);
  assert.match(page, /changeMode\("provided-practice"\)/u);
  assert.match(page, /mode === "provided-practice"[\s\S]*?<SmartControlPracticeSheet/u);
  assert.match(page, /配布練習問題/u);

  assert.match(component, /SMART_CONTROL_INVERSE_LAPLACE_PRACTICE/u);
  assert.match(component, /SMART_CONTROL_FEEDBACK_PRACTICE/u);
  assert.match(component, /function\s+PolePlane\s*\(/u);
  assert.match(component, /function\s+UnityFeedbackDiagram\s*\(/u);
  assert.doesNotMatch(component, /<svg/u, "the supplied figures use responsive CSS shapes");
  assert.match(component, /role="img"/u);
  assert.match(component, /複素s平面/u);
  assert.match(component, /単位負帰還/u);

  assert.match(css, /@media\s*\(max-width:/u);
  assert.match(css, /overflow-x:\s*auto/u);
  assert.match(css, /(?:grid-template-columns:\s*1fr|overflow-x:\s*auto)/u);
});
