import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const PAGE_URL = new URL("../app/subjects/subject-4/page.tsx", import.meta.url);
const EXAMS_URL = new URL("../app/thermodynamics-expected-exams.tsx", import.meta.url);
const CSS_URL = new URL("../app/thermodynamics-expected-exams.module.css", import.meta.url);
const GLOBALS_URL = new URL("../app/globals.css", import.meta.url);

async function extractParser(url, parserName, endMarker) {
  const source = await readFile(url, "utf8");
  const start = source.indexOf("function normalizeUnitToken");
  const end = source.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `${parserName} source extraction`);
  const javascript = ts.transpileModule(`${source.slice(start, end)}\nexport { ${parserName} };`, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
}

test("both thermodynamics modes grade percentages and composite units with conversions", async () => {
  const [{ parseNumericResponse }, { parseLooseNumber }] = await Promise.all([
    extractParser(PAGE_URL, "parseNumericResponse", "function isCorrectAnswer"),
    extractParser(EXAMS_URL, "parseLooseNumber", "function isAutomaticallyCorrect"),
  ]);
  const specificEntropy = { requiresUnit: true, acceptedUnits: { "J/(kg K)": 0.001, "kJ/(kg K)": 1 } };
  const percent = { requiresUnit: true, acceptedUnits: { "%": 1 } };
  for (const parse of [parseNumericResponse, parseLooseNumber]) {
    assert.equal(parse(specificEntropy, "1.25 kJ/(kg K)"), 1.25);
    assert.equal(parse(specificEntropy, "1250 J/(kg K)"), 1.25);
    assert.equal(parse(percent, "51.75%"), 51.75);
    assert.ok(parse(specificEntropy, "1.25") === null || Number.isNaN(parse(specificEntropy, "1.25")));
    assert.ok(parse(percent, "51.75 K") === null || Number.isNaN(parse(percent, "51.75 K")));
  }
});

test("thermodynamics exams persist, resume, print A4, and keep long math responsive", async () => {
  const [page, exams, css, globals] = await Promise.all([
    readFile(PAGE_URL, "utf8"), readFile(EXAMS_URL, "utf8"), readFile(CSS_URL, "utf8"), readFile(GLOBALS_URL, "utf8"),
  ]);
  const ui = `${page}\n${exams}`;
  assert.match(ui, /localStorage/);
  assert.match(ui, /中断して保存/);
  assert.match(ui, /続きから再開/);
  assert.match(ui, /remainingSeconds|elapsedSeconds/);
  assert.match(ui, /window\.print\(\)/);
  assert.match(css, /@page\s*\{/);
  assert.match(css, /size:\s*A4 portrait/);
  assert.match(css, /210mm/);
  assert.match(css, /297mm/);
  assert.match(css, /@media\s*\(max-width:\s*680px\)/);
  assert.match(globals, /\.statistics-rich-math-display-segment\s*\{[\s\S]*?overflow-x:\s*auto/);
  assert.match(globals, /\.statistics-math-display\s*\{[\s\S]*?overflow-x:\s*auto/);
});

test("study hub treats thermodynamics as ready material with real card metrics", async () => {
  const hub = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(hub, /import \{ THERMODYNAMICS_FORMULAS \}/);
  assert.match(hub, /subject\.id === "subject-4"[\s\S]*?cards: THERMODYNAMICS_FORMULAS\.length/);
  assert.match(hub, /subject\.id === "subject-4"[^\n]*\|\| subject\.id === "subject-6"/);
  assert.match(hub, /熱・流体力学は熱力学7枚・6単元/);
});
