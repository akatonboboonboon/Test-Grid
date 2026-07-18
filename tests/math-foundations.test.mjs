import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const SOURCE_URL = new URL("../app/math-foundations-statistics-applied.ts", import.meta.url);

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
}

function dataUrl(javascript) {
  return `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
}

test("statistics and applied-math foundations cover both exam formulas and prerequisites", async () => {
  const source = await readFile(SOURCE_URL, "utf8");
  const module = await import(dataUrl(compile(source)));

  assert.equal(module.STATISTICS_MATH_FOUNDATIONS.length, 28);
  assert.equal(module.APPLIED_MATH_FOUNDATIONS.length, 25);
  assert.ok(module.STATISTICS_MATH_FOUNDATIONS.some((entry) => entry.title.includes("分散")));
  assert.ok(module.STATISTICS_MATH_FOUNDATIONS.some((entry) => entry.title.includes("期待値")));
  assert.ok(module.STATISTICS_MATH_FOUNDATIONS.some((entry) => entry.scope === "prerequisite"));
  assert.ok(module.APPLIED_MATH_FOUNDATIONS.some((entry) => entry.formula.includes("nabla")));
});

test("every statistics formula using sigma notation also provides a sigma-free expansion", async () => {
  const source = await readFile(SOURCE_URL, "utf8");
  const module = await import(dataUrl(compile(source)));
  const sigmaEntries = module.STATISTICS_MATH_FOUNDATIONS.filter((entry) => entry.formula.includes("\\sum"));

  assert.ok(sigmaEntries.length >= 8);
  for (const entry of sigmaEntries) {
    assert.ok(entry.expandedFormula, `${entry.id} is missing a sigma-free expansion`);
    assert.doesNotMatch(entry.expandedFormula, /\\sum/);
  }
});

test("foundation reference exposes all seven quantitative subjects and searchable guidance", async () => {
  const [types, engineering, adapter, client, page, home] = await Promise.all([
    readFile(new URL("../app/math-foundations-types.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/math-foundations-engineering-reference.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/math-foundations-statistics-catalog.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/math-foundations-client.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/foundations/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);

  for (const subjectId of ["subject-3", "subject-4", "subject-5", "subject-6", "subject-7", "subject-8", "subject-9"]) {
    assert.match(types, new RegExp(`"${subjectId}"`));
  }
  for (const sourceName of [
    "MECHANICAL_DYNAMICS_FORMULAS",
    "THERMODYNAMICS_FORMULAS",
    "MATERIAL_MECHANICS_FORMULAS",
    "SMART_CONTROL_CARDS",
    "DIGITAL_CIRCUIT_ALL_FORMULAS",
  ]) {
    assert.match(engineering, new RegExp(sourceName));
  }
  assert.match(engineering, /力のつり合い・角周波数・周期/);
  assert.match(engineering, /絶対温度・絶対圧力・単位/);
  assert.match(engineering, /極・零点・約分と安定性/);
  assert.match(adapter, /Σなしの展開/);
  assert.match(client, /公式・記号・用途を検索/);
  assert.match(client, /Σなし・展開した形/);
  assert.match(client, /使える条件/);
  assert.match(client, /間違えやすい点/);
  assert.match(page, /基礎情報一覧/);
  assert.match(home, /href="\/foundations\?subject=subject-7"/);
});
