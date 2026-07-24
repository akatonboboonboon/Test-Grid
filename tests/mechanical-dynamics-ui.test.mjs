import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const PAGE_URL = new URL("../app/subjects/subject-3/page.tsx", import.meta.url);
const EXAMS_URL = new URL("../app/mechanical-dynamics-expected-exams.tsx", import.meta.url);
const EXAMS_CSS_URL = new URL("../app/mechanical-dynamics-expected-exams.module.css", import.meta.url);
const DIAGRAMS_URL = new URL("../app/mechanical-dynamics-diagrams.tsx", import.meta.url);

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

test("both mechanical dynamics graders normalize middle dots and squared unit notation", async () => {
  const [{ parseNumericResponse }, { parseLooseNumber }] = await Promise.all([
    extractParser(PAGE_URL, "parseNumericResponse", "function isCorrectAnswer"),
    extractParser(EXAMS_URL, "parseLooseNumber", "function isAutomaticallyCorrect"),
  ]);
  const damping = { requiresUnit: true, acceptedUnits: { "N·s/m": 1 } };
  const inertia = { requiresUnit: true, acceptedUnits: { "kg·m²": 1 } };
  for (const parse of [parseNumericResponse, parseLooseNumber]) {
    assert.equal(parse(damping, "12 N·s/m"), 12);
    assert.equal(parse(damping, "12 N・s/m"), 12);
    assert.equal(parse(damping, "12 N*s/m"), 12);
    assert.equal(parse(inertia, "3 kg m^2"), 3);
    assert.equal(parse(inertia, "3 kg·m²"), 3);
  }
});
test("mechanical dynamics exposes six study modes and source-aware practice", async () => {
  const page = await readFile(PAGE_URL, "utf8");
  for (const mode of ["scope", "cards", "practice", "test", "expected", "guide"]) {
    assert.match(page, new RegExp(`mode === ["']${mode}["']`));
  }
  assert.match(page, /type SourceFilter = "all" \| "range-zip" \| "actual-exam"/);
  assert.match(page, /範囲ZIP/);
  assert.match(page, /過去問由来/);
  assert.match(page, /matchesSource/);
  assert.match(page, /useState\(\[\.\.\.MECHANICAL_DYNAMICS_PRINT_LEVEL_QUESTIONS\]\)/);
  assert.match(page, /MECHANICAL_DYNAMICS_PRINT_LEVEL_QUESTIONS\.filter/);
  assert.match(page, /複数選択/);
  assert.match(page, /DisplayMath/);
  assert.match(page, /RichMathText/);
  assert.match(page, /cardFlipped \? <RichMathText text=\{currentCard\.cue\}/);
  assert.match(page, /currentCard\.diagram/);
  assert.match(page, /question\.diagram && <MechanicalDynamicsDiagram[^>]*solution/);
  assert.match(page, /currentPracticeQuestion\.printedFormula/);
  assert.match(page, /currentTestQuestion\.printedFormula/);
  assert.match(page, /振り返り用の模範図/);
});

test("mechanical dynamics random and A4 exams persist and resume", async () => {
  const [page, exams] = await Promise.all([
    readFile(PAGE_URL, "utf8"),
    readFile(EXAMS_URL, "utf8"),
  ]);
  assert.match(page, /test-grid:subject-3:progress:v1/);
  assert.match(page, /test-grid:subject-3:mock-test:v1/);
  assert.match(page, /sourceFilter: testSourceFilter/);
  assert.match(page, /続きから再開/);
  assert.match(exams, /test-grid:subject-3:expected-exam:v1/);
  assert.match(exams, /MECHANICAL_DYNAMICS_ACTUAL_EXAM/);
  assert.match(exams, /isActualExam/);
  assert.match(exams, /公式配点/);
  assert.match(exams, /練習配点/);
  assert.match(exams, /中断して保存/);
  assert.match(exams, /window\.print\(\)/);
});

test("mechanical dynamics prints a separate A4 answer sheet and renders the three actual diagrams", async () => {
  const [exams, css, diagrams] = await Promise.all([
    readFile(EXAMS_URL, "utf8"),
    readFile(EXAMS_CSS_URL, "utf8"),
    readFile(DIAGRAMS_URL, "utf8"),
  ]);
  assert.match(exams, /専用解答用紙/);
  assert.match(exams, /SEPARATE ANSWER SHEET/);
  assert.match(exams, /π=3\.14/);
  assert.match(exams, /g=9\.80 m\/s²/);
  assert.match(css, /@page\s*\{/);
  assert.match(css, /size:\s*A4 portrait/);
  assert.match(css, /210mm/);
  assert.match(css, /297mm/);
  assert.match(css, /\.answerSheetGrid/);
  for (const kind of ["spring-network", "series-parallel-chain", "pinned-beam", "simple-pendulum", "torsional-shaft-disk", "axial-bar-mass"]) {
    assert.match(diagrams, new RegExp(kind));
  }
  assert.match(diagrams, /useId/);
  assert.match(exams, /question\.diagram && <MechanicalDynamicsDiagram[^>]*解答用線図/);
  assert.match(exams, /question\.diagram && <MechanicalDynamicsDiagram[^>]*solution/);
  assert.match(exams, /question\.printedFormula &&/);
  assert.match(exams, /試験用紙に記載される式/);
});

test("study hub reports the dedicated mechanical dynamics deck as ready", async () => {
  const [hub, studyData] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/study-data.ts", import.meta.url), "utf8"),
  ]);
  assert.match(hub, /import \{ MECHANICAL_DYNAMICS_FORMULAS \}/);
  assert.match(hub, /subject\.id === "subject-3"[\s\S]*?cards: MECHANICAL_DYNAMICS_FORMULAS\.length/);
  assert.match(hub, /subject\.id === "subject-3" \|\| subject\.id === "subject-4"/);
  assert.match(studyData, /subject-3[\s\S]*範囲ZIP15枚・過去問全体/);
  assert.match(studyData, /wasOldMechanicalDynamicsPlaceholder/);
});
