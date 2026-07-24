import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = new URL("../app/", import.meta.url);

const [
  mechanical,
  thermo,
  material,
  materialGenerator,
  smart,
  thermoPage,
  generatedEngine,
] = await Promise.all([
  readFile(new URL("mechanical-dynamics-data.ts", app), "utf8"),
  readFile(new URL("thermodynamics-data.ts", app), "utf8"),
  readFile(new URL("material-mechanics-data.ts", app), "utf8"),
  readFile(new URL("material-mechanics-generator-data.ts", app), "utf8"),
  readFile(new URL("smart-control-data.ts", app), "utf8"),
  readFile(new URL("subjects/subject-4/page.tsx", app), "utf8"),
  readFile(new URL("generated-practice-engine.ts", app), "utf8"),
]);

test("material beam equilibrium keeps current-scope sign-safe formulas", () => {
  assert.match(
    material,
    /id: "mm-f-equilibrium"[\s\S]*?formula: "\\\\sum F_y=0,\\\\qquad \\\\sum M_O=0"/,
  );
  assert.match(
    material,
    /id: "mm-f-simple-point-general"[\s\S]*?formula: "R_A=\\\\frac\{Pb\}\{L\},\\\\qquad R_B=\\\\frac\{Pa\}\{L\},\\\\qquad M_\{max\}=\\\\frac\{Pab\}\{L\}"/,
  );
  assert.doesNotMatch(material, /300\(100\)\+150\(200\)\+R_B\(400\)/);
});

test("mechanical cover-up formula defines the pole sign unambiguously", () => {
  assert.match(mechanical, /A_i=\\\\lim_\{s\\\\to p_i\}\(s-p_i\)F\(s\)/);
  assert.doesNotMatch(mechanical, /A_i=\\\\left\[\(s-a_i\)F\(s\)\\\\right\]_\{s=a_i\}/);
});

test("thermodynamics keeps source fidelity while using the specified gas constant", () => {
  assert.match(thermo, /資料では窒素と表記/);
  assert.match(thermo, /資料指定の.*R=287/);
  assert.match(thermo, /R=287 J\/\(kg·K\)は空気相当/);
});

test("smart-control pole definition handles pole-zero cancellation", () => {
  assert.match(smart, /共通因子を約分した後、実際に残る分母を0にするs/);
  assert.match(smart, /極零相殺を確認する/);
});

test("smart-control distinguishes course grading from marginal stability", () => {
  assert.match(smart, /極±j・不安定扱い（自由応答分類では限界安定）/);
  assert.match(smart, /漸近安定でもBIBO安定でもない/);
  assert.match(smart, /重原点極、重虚軸極は自由応答も発散/);
});

test("thermodynamics card cue uses the math renderer", () => {
  assert.match(
    thermoPage,
    /cardFlipped \? <RichMathText text=\{currentCard\.cue\} \/>/,
  );
});

test("material generator descriptions match implemented input domains", () => {
  assert.match(materialGenerator, /P=8〜30 kW、N=600〜1800 rpm、d=30〜60 mm/);
  assert.match(materialGenerator, /P=80〜240 kW、N=80〜240 rpm、di\/do=0\.40〜0\.70/);
  assert.match(materialGenerator, /d=12〜22 mm、D=100〜220 mm、n=5〜12/);
  assert.match(materialGenerator, /L=2\.0〜6\.0 m、w=1\.5〜6\.0 kN\/m、b=60〜180 mm、h=120〜260 mm/);
  assert.doesNotMatch(materialGenerator, /d=50〜120 mm/);
});

test("generated engineering work uses approximation signs for rounded irrational results", () => {
  assert.match(generatedEngine, /\\\\omega_n=.*\\\\approx.*\\\\mathrm\{rad\/s\}/);
  assert.match(generatedEngine, /p_2=.*\\\\approx.*\\\\mathrm\{kPa\}/);
  assert.match(generatedEngine, /y=.*e\^\{.*\\\\approx/);
});
