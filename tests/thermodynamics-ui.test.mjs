import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const PAGE_URL = new URL("../app/subjects/subject-4/page.tsx", import.meta.url);
const EXAMS_URL = new URL("../app/thermodynamics-expected-exams.tsx", import.meta.url);
const CSS_URL = new URL("../app/thermodynamics-expected-exams.module.css", import.meta.url);
const GLOBALS_URL = new URL("../app/globals.css", import.meta.url);
const DIAGRAMS_URL = new URL("../app/thermodynamics-diagrams.tsx", import.meta.url);

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
  assert.match(page, /currentCard\.diagram/);
  assert.match(page, /question\.diagram && <ThermodynamicsDiagram[^>]*solution/);
  assert.match(page, /振り返り用の模範図/);
  assert.match(exams, /question\.diagram && <ThermodynamicsDiagram[^>]*解答用線図/);
  assert.match(exams, /question\.diagram && <ThermodynamicsDiagram[^>]*solution/);
});

test("Otto, Carnot, and refrigeration use dedicated diagrams without leaking solution labels on the question face", async () => {
  const diagrams = await readFile(DIAGRAMS_URL, "utf8");
  for (const kind of ["otto-pv", "carnot-pv", "carnot-ts", "refrigeration-cycle", "reversed-carnot-ts"]) assert.match(diagrams, new RegExp(`"${kind}"`));
  assert.match(diagrams, /solution && kind === "otto-pv"/);
  assert.match(diagrams, /solution && kind === "carnot-pv"/);
  assert.match(diagrams, /solution && kind === "carnot-ts"/);
  assert.match(diagrams, /solution && kind === "reversed-carnot-ts"/);
  assert.match(diagrams, /function RefrigerationCycleDiagram/);
  assert.match(diagrams, /!solution && \(/);
  assert.match(diagrams, /Q₁=Q₂\+W/);
  assert.match(diagrams, /M180 145 C145 132 108 111 76 96/);
  assert.match(diagrams, /M76 96 V48/);
  assert.match(diagrams, /M76 48 C109 54 147 68 180 84/);
  assert.match(diagrams, /M180 84 V145/);
  assert.match(diagrams, /高温等温膨張 Q₁/);
  assert.match(diagrams, /低温等温圧縮 Q₂/);
  assert.match(diagrams, /M72 55 H176/);
  assert.match(diagrams, /M176 55 V135/);
  assert.match(diagrams, /M176 135 H72/);
  assert.match(diagrams, /M72 135 V55/);
  assert.match(diagrams, /!solution && <text[^>]*>ここに過程を描く<\/text>/);
});

test("study hub treats thermodynamics as ready material with real card metrics", async () => {
  const hub = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(hub, /import \{ THERMODYNAMICS_FORMULAS \}/);
  assert.match(hub, /subject\.id === "subject-4"[\s\S]*?cards: THERMODYNAMICS_FORMULAS\.length/);
  assert.match(hub, /subject\.id === "subject-4"[^\n]*\|\| subject\.id === "subject-6"/);
  assert.match(hub, /熱・流体力学は追加範囲を含む熱力学9枚・7単元/);
});
