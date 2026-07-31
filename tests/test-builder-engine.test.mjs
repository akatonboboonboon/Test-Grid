import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptGraph } from "./helpers/import-typescript-graph.mjs";

const enginePromise = importTypeScriptGraph("../app/test-builder-engine.ts", import.meta.url);

const SCOPE = `
Q: 日本の首都はどこか。
A: 東京
解説: 日本の首都として東京を答える。
OSI::Open Systems Interconnection::通信機能を7層に分けた参照モデル
TCP=信頼性のある通信を提供するプロトコル
- フーリエの法則は熱伝導を表す。
独立した範囲文である。
TCP=信頼性のある通信を提供するプロトコル
`;

const FORMAT = "試験時間50分、100点満点、全8問。4択2問、穴埋め2問、T/F2問、記述2問。";

function baseInput(overrides = {}) {
  return {
    grade: 4,
    period: "first-final",
    subject: "テスト教科",
    title: "4年前期末 想定試験",
    durationMinutes: 50,
    totalPoints: 100,
    questionCount: 8,
    difficulty: 3,
    scopeText: SCOPE,
    formatText: FORMAT,
    seed: "stable-seed",
    ...overrides,
  };
}

test("scope parser accepts five input styles and removes duplicates", async () => {
  const engine = await enginePromise;
  const entries = engine.parseTestBuilderScope(SCOPE);
  assert.deepEqual(new Set(entries.map((entry) => entry.style)), new Set([
    "qa",
    "term-detail",
    "definition",
    "bullet",
    "sentence",
  ]));
  assert.equal(entries.filter((entry) => entry.answer.includes("信頼性")).length, 1);
  assert.ok(entries.every((entry) => entry.answer && entry.explanation && entry.sourceExcerpt));
});

test("format parser reads time, total, question count, and all four compositions", async () => {
  const engine = await enginePromise;
  const parsed = engine.parseTestBuilderFormat(FORMAT, {
    durationMinutes: 10,
    totalPoints: 10,
    questionCount: 4,
  });
  assert.equal(parsed.durationMinutes, 50);
  assert.equal(parsed.totalPoints, 100);
  assert.equal(parsed.questionCount, 8);
  assert.deepEqual(parsed.kindCounts, { choice: 2, fill: 2, "true-false": 2, written: 2 });
  assert.deepEqual(parsed.parsed, {
    durationMinutes: true,
    totalPoints: true,
    questionCount: true,
    composition: true,
  });
});

test("same seed produces the same fully solved source-bound test", async () => {
  const engine = await enginePromise;
  const left = engine.createTestBuilderProject(baseInput());
  const right = engine.createTestBuilderProject(baseInput());
  assert.deepEqual(left, right);
  assert.notDeepEqual(left, engine.createTestBuilderProject(baseInput({ seed: "another-seed" })));
  assert.equal(left.test.questions.length, 8);
  assert.equal(left.test.durationMinutes, 50);
  assert.equal(left.test.totalPoints, 100);
  assert.ok(left.test.questions.every((question) =>
    question.answer.trim()
      && question.explanation.trim()
      && question.sourceExcerpt.trim()
      && question.points > 0,
  ));
  const sourceExcerpts = new Set(left.scopeEntries.map((entry) => entry.sourceExcerpt));
  const scopeAnswers = new Set(left.scopeEntries.map((entry) => entry.answer));
  for (const question of left.test.questions) {
    assert.ok(sourceExcerpts.has(question.sourceExcerpt), `${question.id} exact source excerpt`);
    if (question.kind !== "true-false") assert.ok(scopeAnswers.has(question.answer), `${question.id} answer is in scope`);
    if (question.options) assert.ok(question.options.every((option) => scopeAnswers.has(option)));
  }
  const trueFalse = left.test.questions.filter((question) => question.kind === "true-false");
  assert.deepEqual(new Set(trueFalse.map((question) => question.answer)), new Set(["T", "F"]));
  const falseQuestion = trueFalse.find((question) => question.answer === "F");
  const falseSource = left.scopeEntries.find((entry) => entry.sourceExcerpt === falseQuestion.sourceExcerpt);
  assert.ok(falseSource);
  assert.ok(falseQuestion.explanation.includes(falseSource.answer));
  assert.ok(left.test.questions.filter((question) => question.kind === "fill")
    .every((question) => question.prompt.startsWith("次の問いの空欄")));
  assert.ok(left.test.questions.filter((question) => question.kind === "written")
    .every((question) => question.prompt.startsWith("範囲資料に基づき")));
  assert.equal(left.test.questions.reduce((sum, question) => sum + question.points, 0), 100);
  assert.equal(engine.validateTestBuilderProject(left).ok, true);
});

test("explicit numeric settings remain authoritative even when format text contains other numbers", async () => {
  const engine = await enginePromise;
  const project = engine.createTestBuilderProject(baseInput({
    formatText: FORMAT,
    durationMinutes: 37,
    totalPoints: 60,
    questionCount: 7,
  }));
  assert.equal(project.format.durationMinutes, 37);
  assert.equal(project.format.totalPoints, 60);
  assert.equal(project.format.questionCount, 7);
  assert.equal(project.test.questions.length, 7);
  assert.equal(project.test.questions.reduce((sum, question) => sum + question.points, 0), 60);
});

test("project identity includes explicit numeric settings and difficulty", async () => {
  const engine = await enginePromise;
  const original = engine.createTestBuilderProject(baseInput());
  const changedCount = engine.createTestBuilderProject(baseInput({ questionCount: 7 }));
  const changedDifficulty = engine.createTestBuilderProject(baseInput({ difficulty: 2 }));
  assert.notEqual(original.projectId, changedCount.projectId);
  assert.notEqual(original.projectId, changedDifficulty.projectId);
});

test("JSON export/import round-trips and rejects answer tampering", async () => {
  const engine = await enginePromise;
  const project = engine.createTestBuilderProject(baseInput());
  const json = engine.exportTestBuilderProject(project);
  assert.deepEqual(engine.importTestBuilderProject(json), project);
  assert.equal(project.schemaVersion, engine.TEST_BUILDER_SCHEMA_VERSION);
  assert.match(engine.TEST_BUILDER_STORAGE_KEY, /test-builder/);
  assert.deepEqual(engine.generateTestProject(baseInput()), project);
  assert.deepEqual(engine.importProject(engine.exportProject(project)), project);
  assert.deepEqual(engine.readProjects(engine.writeProjects([project])), [project]);
  assert.deepEqual(engine.readProjects(null), []);
  assert.throws(
    () => engine.writeProjects(Array.from({ length: 200 }, () => project)),
    /project collection is too large/,
  );
  assert.throws(
    () => engine.readProjects("x".repeat(engine.TEST_BUILDER_MAX_COLLECTION_BYTES + 1)),
    /project collection is too large/,
  );

  const tampered = structuredClone(project);
  tampered.test.questions[0].answer = "範囲外の偽解答";
  assert.equal(engine.validateTestBuilderProject(tampered).ok, false);
  assert.throws(() => engine.importTestBuilderProject(JSON.stringify(tampered)), /TEST_BUILDER_INVALID/);
});

test("invalid bounds, oversized input, malformed JSON, and unsupported schema are rejected", async () => {
  const engine = await enginePromise;
  assert.throws(() => engine.createTestBuilderProject(baseInput({ grade: 0 })), /grade/);
  assert.throws(() => engine.createTestBuilderProject(baseInput({ grade: 6 })), /grade/);
  assert.throws(() => engine.createTestBuilderProject(baseInput({ questionCount: 0, formatText: "" })), /questionCount/);
  assert.throws(() => engine.createTestBuilderProject(baseInput({ questionCount: 101, formatText: "" })), /questionCount/);
  assert.throws(() => engine.createTestBuilderProject(baseInput({ scopeText: "x".repeat(engine.TEST_BUILDER_MAX_SCOPE_TEXT_LENGTH + 1) })), /scopeText/);
  assert.throws(() => engine.importTestBuilderProject("not-json"), /could not be parsed/);
  assert.throws(
    () => engine.importTestBuilderProject("x".repeat(engine.TEST_BUILDER_MAX_IMPORT_JSON_LENGTH + 1)),
    /too large/,
  );
  const wrongVersion = engine.createTestBuilderProject(baseInput());
  wrongVersion.schemaVersion = 999;
  assert.equal(engine.validateTestBuilderProject(wrongVersion).ok, false);
});

test("HTML-looking input is converted to inert plain text and no browser API is used", async () => {
  const engine = await enginePromise;
  const project = engine.createTestBuilderProject(baseInput({
    scopeText: "<script>alert('x')</script>危険語=安全な説明",
    formatText: "<b>全1問</b> 記述1問",
    questionCount: 1,
  }));
  const serialized = JSON.stringify(project);
  assert.doesNotMatch(serialized, /<\/?(?:script|b)\b/iu);
  assert.doesNotMatch(serialized, /localStorage|sessionStorage|document\.|window\./u);
  assert.equal(project.test.questions.length, 1);
  assert.ok(project.test.questions[0].answer);
});
