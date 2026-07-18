import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const SUBJECT_IDS = ["subject-2", "network", "subject-3", "subject-4", "subject-5", "subject-6", "subject-7", "subject-8", "subject-9"];

async function loadPauseModule() {
  const source = await readFile(new URL("../app/rapid-saved-session.ts", import.meta.url), "utf8");
  const exportsObject = {};
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: "rapid-saved-session.ts",
  }).outputText;
  new Function("exports", "require", javascript)(exportsObject, (specifier) => {
    if (specifier === "./rapid-quiz-data") {
      return { COMPREHENSIVE_MAX_QUESTIONS: 4914, RAPID_SUBJECT_IDS: SUBJECT_IDS };
    }
    if (specifier === "./study-data") return {};
    throw new Error(`Unexpected import ${specifier}`);
  });
  return exportsObject;
}

function question(subjectId, suffix = "base") {
  return {
    id: `${subjectId}-${suffix}`,
    subjectId,
    topicLabel: "topic",
    prompt: "PROMPT MUST NOT BE SAVED",
    answer: "answer",
    acceptedOptions: ["answer"],
    options: ["answer", "other"],
    explanation: "EXPLANATION MUST NOT BE SAVED",
    studyHref: "/cards",
    difficulty: 3,
    recommendedSeconds: 90,
    steps: ["step"],
    sourceBasis: "range",
  };
}

function pools() {
  return Object.fromEntries(SUBJECT_IDS.map((subjectId) => [subjectId, [question(subjectId)]]));
}

test("comprehensive pause snapshots restore exact order, progress, answers, and time", async () => {
  const pause = await loadPauseModule();
  const sourcePools = pools();
  const session = SUBJECT_IDS.map((subjectId, index) => ({ ...sourcePools[subjectId][0], instanceId: `${subjectId}-instance-${index}` }));
  const runner = {
    session,
    index: 2,
    remainingMs: 42_300,
    results: [
      { question: session[0], selected: "answer", correct: true, timedOut: false, elapsedMs: 12_000 },
      { question: session[1], selected: null, correct: false, timedOut: true, elapsedMs: 90_000 },
    ],
    correctCount: 1,
    streak: 0,
    bestStreak: 1,
  };

  const snapshot = pause.createOverallPauseSnapshot(runner, 9, 90, 102_000);
  const serialized = JSON.stringify(snapshot);
  assert.doesNotMatch(serialized, /PROMPT MUST NOT BE SAVED|EXPLANATION MUST NOT BE SAVED/);
  assert.equal(snapshot.session[1].instanceId, session[1].instanceId);

  const restored = pause.restoreOverallPauseSnapshot(serialized, sourcePools);
  assert.ok(restored);
  assert.deepEqual(restored.session.map((item) => item.instanceId), session.map((item) => item.instanceId));
  assert.equal(restored.index, 2);
  assert.equal(restored.remainingMs, 42_300);
  assert.equal(restored.results[0].selected, "answer");
  assert.equal(restored.results[1].timedOut, true);
  assert.equal(restored.activeElapsedMs, 102_000);
});

test("maximum 4914-question pause data stores compact references instead of question bodies", async () => {
  const pause = await loadPauseModule();
  const sourcePools = pools();
  const session = Array.from({ length: 4914 }, (_, index) => {
    const subjectId = SUBJECT_IDS[index % SUBJECT_IDS.length];
    return { ...sourcePools[subjectId][0], instanceId: `${subjectId}-max-${index}` };
  });
  const snapshot = pause.createOverallPauseSnapshot({
    session,
    index: 0,
    remainingMs: 90_000,
    results: [],
    correctCount: 0,
    streak: 0,
    bestStreak: 0,
  }, 4914, 90, 0);
  const serialized = JSON.stringify(snapshot);

  assert.ok(serialized.length < 800_000, `compact snapshot was ${serialized.length} bytes`);
  assert.doesNotMatch(serialized, /prompt|explanation|steps|options/);
  assert.equal(pause.restoreOverallPauseSnapshot(serialized, sourcePools)?.session.length, 4914);
});

test("invalid versions, unknown question ids, and duplicate instances are rejected", async () => {
  const pause = await loadPauseModule();
  const sourcePools = pools();
  const session = SUBJECT_IDS.map((subjectId, index) => ({ ...sourcePools[subjectId][0], instanceId: `${subjectId}-${index}` }));
  const valid = pause.createOverallPauseSnapshot({
    session,
    index: 0,
    remainingMs: 90_000,
    results: [],
    correctCount: 0,
    streak: 0,
    bestStreak: 0,
  }, 9, 90, 0);

  assert.equal(pause.restoreOverallPauseSnapshot(JSON.stringify({ ...valid, version: 2 }), sourcePools), null);
  const unknown = structuredClone(valid);
  unknown.session[0].id = "missing-question";
  assert.equal(pause.restoreOverallPauseSnapshot(JSON.stringify(unknown), sourcePools), null);
  const duplicate = structuredClone(valid);
  duplicate.session[1].instanceId = duplicate.session[0].instanceId;
  assert.equal(pause.restoreOverallPauseSnapshot(JSON.stringify(duplicate), sourcePools), null);
});


test("comprehensive challenge exposes a visible pause, save, and resume flow", async () => {
  const component = await readFile(new URL("../app/comprehensive-challenge.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(component, /OVERALL_PAUSE_STORAGE_KEY/);
  assert.match(component, /phase: "paused"/);
  assert.match(component, /中断して保存/);
  assert.match(component, /続きから再開/);
  assert.match(component, /remainingAtStart/);
  assert.match(component, /restoreOverallPauseSnapshot/);
  assert.match(css, /\.overall-pause-controls\.is-paused/);
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\) auto auto/);
});
