import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { importTypeScriptGraph } from "./helpers/import-typescript-graph.mjs";

const dataPromise = importTypeScriptGraph("../app/toeic-ip-data.ts", import.meta.url);

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("TOEIC IP data covers every Part with original answerable content", async () => {
  const data = await dataPromise;
  const parts = new Set(data.TOEIC_QUESTIONS.map((question) => question.part));
  assert.deepEqual([...parts].sort(), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(data.TOEIC_QUESTIONS.length, 40);
  assert.equal(data.TOEIC_VOCAB.length, 60);
  assert.equal(new Set(data.TOEIC_QUESTIONS.map((question) => question.id)).size, data.TOEIC_QUESTIONS.length);
  for (const question of data.TOEIC_QUESTIONS) {
    assert.ok(question.prompt.trim(), `${question.id}: prompt`);
    assert.ok(question.choices.length >= 3 && question.choices.length <= 4, `${question.id}: choices`);
    assert.ok(Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex < question.choices.length, `${question.id}: answerIndex`);
    assert.ok(question.explanationJa.trim(), `${question.id}: explanation`);
    assert.ok(question.evidence.trim(), `${question.id}: evidence`);
    assert.ok(question.ability.length, `${question.id}: ability`);
  }
});

test("TOEIC Listening questions carry playable scripts and Part 1 visual scenes", async () => {
  const data = await dataPromise;
  const listening = data.TOEIC_QUESTIONS.filter((question) => question.part <= 4);
  assert.ok(listening.length >= 20);
  assert.ok(listening.every((question) => question.script?.trim()));
  const part1 = listening.filter((question) => question.part === 1);
  assert.equal(part1.length, 4);
  assert.ok(part1.every((question) => question.scene?.key && question.scene?.altJa));
  assert.ok(data.TOEIC_QUESTIONS.some((question) => question.part === 3 && question.chart));
});

test("TOEIC formats preserve official paper and online-IP structures", async () => {
  const data = await dataPromise;
  const paper = data.TOEIC_FORMATS.find((format) => format.mode === "paper");
  const online = data.TOEIC_FORMATS.find((format) => format.mode === "online-msa");
  assert.equal(paper.totalQuestions, 200);
  assert.equal(paper.listening.questionCount, 100);
  assert.equal(paper.reading.questionCount, 100);
  assert.equal(paper.parts.reduce((sum, part) => sum + part.questionCount, 0), 200);
  assert.equal(online.totalQuestions, 90);
  assert.equal(online.listening.questionCount, 45);
  assert.equal(online.reading.questionCount, 45);
  assert.equal(online.units.reduce((sum, unit) => sum + unit.questionCount, 0), 90);
  assert.equal(data.TOEIC_SUBJECT.examDate, "2026-12-25");
  assert.ok(data.TOEIC_STUDY_PHASES.length >= 7);
});

test("TOEIC page is a separate subject with audio, local progress, mocks and official links", async () => {
  const [page, player, home, layout] = await Promise.all([
    source("../app/subjects/toeic-ip/page.tsx"),
    source("../app/toeic-ip-listening-player.tsx"),
    source("../app/page.tsx"),
    source("../app/layout.tsx"),
  ]);
  assert.match(home, /href="\/subjects\/toeic-ip"/);
  assert.match(home, /2026\.12\.25|2026-12-25/);
  assert.match(home, /SUBJECT 10/);
  assert.match(layout, /TOEIC IP/);
  assert.match(page, /Part別|PART DRILL/i);
  assert.match(page, /Listening/i);
  assert.match(page, /VOCAB|単語帳/i);
  assert.match(page, /模試|MOCK/i);
  assert.match(page, /test-grid:toeic-ip:/);
  assert.match(page, /2026-12-25/);
  assert.match(page, /1-4|1〜4|\^\[1-4\]\$/);
  assert.match(page, /公式サンプル/);
  assert.match(page, /過去問/);
  assert.match(player, /SpeechSynthesisUtterance/);
  assert.match(player, /en-US/);
  assert.match(player, /en-GB/);
  assert.match(player, /en-CA/);
  assert.match(player, /en-AU/);
});