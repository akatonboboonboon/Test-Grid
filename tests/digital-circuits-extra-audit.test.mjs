import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { importTypeScriptGraph } from "./helpers/import-typescript-graph.mjs";

const EXTRA_URL = new URL("../app/digital-circuits-extra-data.ts", import.meta.url);
const DIAGRAM_URL = new URL("../app/digital-circuits-extra-diagrams.tsx", import.meta.url);
const GENERATOR_URL = new URL("../app/digital-circuits-extra-generator.ts", import.meta.url);

const compile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const dataUrl = (source) => "data:text/javascript;base64," + Buffer.from(compile(source)).toString("base64");

async function loadExtra() {
  return importTypeScriptGraph(EXTRA_URL);
}

test("past-machine source table and S1S0 graph retain all eight exact transitions", async () => {
  const extra = await loadExtra();
  const actual = extra.DIGITAL_CIRCUIT_PAST_MACHINE_TRANSITIONS;
  assert.equal(actual.length, 8);
  assert.deepEqual(actual.map(({ graphStateS1S0, input, nextGraphStateS1S0, output }) =>
    `${graphStateS1S0}:${input}->${nextGraphStateS1S0}/${output}`), [
    "00:0->00/1", "10:0->01/0", "01:0->00/1", "11:0->10/0",
    "00:1->01/0", "10:1->11/0", "01:1->10/0", "11:1->00/1",
  ]);
  for (const transition of actual) {
    assert.equal(transition.graphStateS1S0, [...transition.tableStateS0S1].reverse().join(""));
    assert.equal(transition.nextGraphStateS1S0, [...transition.nextTableStateS0S1].reverse().join(""));
  }
  assert.equal(new Set(actual.map((item) => item.graphStateS1S0 + item.input)).size, 8);
});

test("1001 detector retains the source's exact eight Mealy transitions", async () => {
  const extra = await loadExtra();
  assert.deepEqual(extra.DIGITAL_CIRCUIT_DETECTOR_1001_TRANSITIONS, [
    { current: "00", input: 0, next: "00", output: 0 },
    { current: "00", input: 1, next: "01", output: 0 },
    { current: "01", input: 0, next: "10", output: 0 },
    { current: "01", input: 1, next: "01", output: 0 },
    { current: "10", input: 0, next: "11", output: 0 },
    { current: "10", input: 1, next: "01", output: 0 },
    { current: "11", input: 0, next: "00", output: 0 },
    { current: "11", input: 1, next: "01", output: 1 },
  ]);
});

test("additional-scope 101 and 1011 detectors retain every overlap-aware transition", async () => {
  const extra = await loadExtra();
  assert.deepEqual(extra.DIGITAL_CIRCUIT_DETECTOR_101_TRANSITIONS.map((item) =>
    `${item.current}:${item.input}->${item.next}/${item.output}`), [
    "S0:0->S0/0", "S0:1->S1/0", "S1:0->S2/0",
    "S1:1->S1/0", "S2:0->S0/0", "S2:1->S1/1",
  ]);
  assert.deepEqual(extra.DIGITAL_CIRCUIT_DETECTOR_1011_TRANSITIONS.map((item) =>
    `${item.current}:${item.input}->${item.next}/${item.output}`), [
    "S0:0->S0/0", "S0:1->S1/0", "S1:0->S2/0", "S1:1->S1/0",
    "S2:0->S0/0", "S2:1->S3/0", "S3:0->S2/0", "S3:1->S1/1",
  ]);
  assert.equal(extra.DIGITAL_CIRCUIT_ADDITIONAL_SCOPE_IMAGES.length, 2);
  assert.ok(extra.DIGITAL_CIRCUIT_ADDITIONAL_SCOPE_IMAGES.every((image) => image.role === "current-scope"));
  assert.match(extra.DIGITAL_CIRCUIT_ADDITIONAL_SCOPE_IMAGES[0].contents.join(" "), /101・1011/);

  let state = "S0";
  const states = [];
  const outputs = [];
  for (const input of "1011011") {
    const transition = extra.DIGITAL_CIRCUIT_DETECTOR_1011_TRANSITIONS.find(
      (item) => item.current === state && item.input === Number(input),
    );
    assert.ok(transition, `${state}/${input}`);
    state = transition.next;
    states.push(state);
    outputs.push(transition.output);
  }
  assert.deepEqual(states, ["S1", "S2", "S3", "S1", "S2", "S3", "S1"]);
  assert.equal(outputs.join(""), "0001001");
  assert.match(
    extra.DIGITAL_CIRCUIT_EXTRA_QUESTIONS.find((item) => item.id === "dc-add-q-sequence-1011-stream").answer,
    /S1→S2→S3→S1→S2→S3→S1、出力0001001/,
  );
});

test("unsolved diagrams are neutral worksheets and solved diagrams consume canonical transitions", async () => {
  const source = await readFile(DIAGRAM_URL, "utf8");
  const cyclic = source.slice(source.indexOf("function CyclicDown"), source.indexOf("function Exercise3"));
  const cyclicBlank = cyclic.slice(0, cyclic.indexOf("model answer"));
  assert.doesNotMatch(cyclicBlank, /9状態|0010の次|1010を非同期ロード/);
  assert.match(cyclicBlank, /戻り状態を検出する論理/);

  const pastBlank = source.slice(source.indexOf("function PastMachineWorksheet"), source.indexOf("function pastLabel"));
  assert.match(pastBlank, /出典表: In, S0, S1/);
  assert.match(pastBlank, /状態図のノード名は S1S0 順/);
  assert.doesNotMatch(pastBlank, /nextGraphStateS1S0|transition\.output|pastLabel/);

  const detectorBlank = source.slice(source.indexOf("function Detector1001Worksheet"), source.indexOf("function detectorLabel"));
  assert.doesNotMatch(detectorBlank, /初期|1まで一致|10まで一致|100まで一致|transition\.next|transition\.output/);
  assert.match(detectorBlank, /各枝へ I\/O を記入/);
  assert.match(source, /DIGITAL_CIRCUIT_PAST_MACHINE_TRANSITIONS\.find/);
  assert.match(source, /DIGITAL_CIRCUIT_DETECTOR_1001_TRANSITIONS\.find/);
  for (const kind of ["sequence-detector-101", "sequence-detector-1011", "sequence-design-workflow"]) {
    assert.match(source, new RegExp(kind));
  }
});

test("added practice covers full waveform table, circuit/timing, full state table, and all detector branches", async () => {
  const extra = await loadExtra();
  const ids = new Set(extra.DIGITAL_CIRCUIT_EXTRA_QUESTIONS.map((question) => question.id));
  for (const id of [
    "dc-extra-q-truth-table-full", "dc-extra-q-cycle-design", "dc-extra-q-cycle-timing",
    "dc-extra-q-past-full-table", "dc-extra-q-sequence-full-table",
    "dc-add-q-sequence-101-full", "dc-add-q-sequence-1011-full",
    "dc-add-q-design-workflow", "dc-add-q-1001-synthesis",
  ]) assert.ok(ids.has(id), id);
  assert.match(extra.DIGITAL_CIRCUIT_EXTRA_QUESTIONS.find((item) => item.id === "dc-extra-q-past-full-table").explanation, /表.*S0S1.*グラフ.*S1S0/);
});

test("every predicted paper carries five complete, past-paper-level major problems", async () => {
  const extra = await loadExtra();
  for (const exam of extra.DIGITAL_CIRCUIT_ALL_EXPECTED_EXAMS) {
    const questions = exam.sections.flatMap((section) => section.questions);
    assert.equal(exam.sections.length, 5);
    assert.equal(questions.length, 5);
    assert.equal(questions.reduce((sum, question) => sum + question.points, 0), 100);
    assert.ok(exam.sections.every((section) => section.questions.length === 1), exam.id);
    assert.ok(questions.every((question) => question.difficulty === 3 && question.examLevel), exam.id);
    assert.ok(questions.every((question) => question.subpartCount >= 3 && question.steps.length >= 3), exam.id);
    assert.ok(questions.every((question) => question.diagram && question.sourceBasis?.length >= 2), exam.id);
    assert.ok(questions.some((question) => question.topic === "counters"), exam.id);
    assert.ok(questions.some((question) => question.topic === "state-machines"), exam.id);
  }
});
test("generated variants keep their three stable IDs and use neutral canonical diagrams", async () => {
  const source = await readFile(GENERATOR_URL, "utf8");
  const generator = await import(dataUrl(source));
  assert.deepEqual(generator.DIGITAL_CIRCUIT_EXTRA_GENERATOR_SPECS.map((item) => item.id), [
    "xor-waveform", "cyclic-down-10-2", "sequence-detector-1001",
  ]);
  assert.equal(generator.generateDigitalCircuitExtraQuestion(3).diagram, "xor-timing");
  assert.equal(generator.generateDigitalCircuitExtraQuestion(4).diagram, "cyclic-down-10-2");
  assert.equal(generator.generateDigitalCircuitExtraQuestion(5).diagram, "sequence-detector-1001");
}
);
