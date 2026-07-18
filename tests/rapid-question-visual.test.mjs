import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = new URL("../app/", import.meta.url);
const read = (path) => readFile(new URL(path, app), "utf8");

test("rapid pools preserve every existing subject diagram as a typed visual", async () => {
  const rapid = await read("rapid-quiz-data.ts");

  for (const visualType of [
    "mechanical-dynamics",
    "thermodynamics",
    "material-mechanics",
    "smart-control",
    "digital-circuit",
  ]) assert.match(rapid, new RegExp(`type: "${visualType}"`));

  assert.match(rapid, /visual\?: RapidQuestionVisual/);
  assert.match(rapid, /getVisual\?\.\(question\)/);
  assert.match(rapid, /visual: getVisual\?\.\(card\)/);
  for (const extractor of [
    "mechanicalVisual",
    "thermodynamicsVisual",
    "materialMechanicsVisual",
    "smartControlVisual",
    "digitalCircuitVisual",
  ]) assert.match(rapid, new RegExp(extractor));
});

test("rapid drill and comprehensive challenge show figures during questions and review", async () => {
  const [visual, drill, comprehensive, css] = await Promise.all([
    read("rapid-question-visual.tsx"),
    read("rapid-answer-drill.tsx"),
    read("comprehensive-challenge.tsx"),
    read("globals.css"),
  ]);

  for (const component of [
    "MechanicalDynamicsDiagram",
    "ThermodynamicsDiagram",
    "MaterialMechanicsDiagram",
    "SmartControlDiagram",
    "DigitalCircuitStudyDiagram",
  ]) assert.match(visual, new RegExp(component));
  assert.match(visual, /solution=\{solution\}/);
  assert.match(visual, /compact=\{compact\}/);

  assert.match(drill, /visual=\{currentQuestion\.visual\} solution=\{state\.phase === "feedback"\}/);
  assert.match(drill, /visual=\{result\.question\.visual\} solution compact/);
  assert.match(comprehensive, /visual=\{currentQuestion\.visual\} solution=\{runner\.phase === "feedback"\}/);
  assert.match(comprehensive, /visual=\{result\.question\.visual\} solution compact/);

  assert.match(css, /\.rapid-question-visual \{/);
  assert.match(css, /\.rapid-question-visual svg[\s\S]*?width: 100%/);
  assert.match(css, /overflow-x: auto/);
});

test("the eighth digital-circuit exercise always reaches the shared rapid figure renderer", async () => {
  const [data, rapid, visual] = await Promise.all([
    read("digital-circuits-extra-data.ts"),
    read("rapid-quiz-data.ts"),
    read("rapid-question-visual.tsx"),
  ]);

  assert.match(data, /id: "dc-extra-q-ex3-equation"[\s\S]{0,900}diagram: "exercise3-sequential"/);
  assert.match(data, /id: "dc-extra-q-ex3-table"[\s\S]{0,900}diagram: "exercise3-sequential"/);
  assert.match(rapid, /DIGITAL_CIRCUIT_ALL_QUESTIONS[\s\S]*?digitalCircuitVisual/);
  assert.match(visual, /DigitalCircuitStudyDiagram kind=\{visual\.kind\}/);
});