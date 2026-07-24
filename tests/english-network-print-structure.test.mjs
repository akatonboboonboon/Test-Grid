import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function withServer(context) {
  const server = await createServer({
    root: projectRoot,
    configFile: false,
    server: { middlewareMode: true },
    logLevel: "silent",
  });
  context.after(() => server.close());
  return server;
}

test("English print-level pool keeps source context and authentic order choices", async (context) => {
  const server = await withServer(context);
  const data = await server.ssrLoadModule("/app/english-expected-exams-data.ts");
  const pool = data.ENGLISH_PRINT_LEVEL_QUESTIONS;

  assert.equal(pool.length, data.ENGLISH_EXAM_LEVEL_QUESTIONS.length);
  assert.ok(pool.length >= 200);
  assert.equal(pool.some((question) => question.unit === "ch19"), false);
  assert.doesNotMatch(JSON.stringify(pool), /What's new\?|What’s new\?/u);

  for (const question of pool) {
    assert.ok(question.explanation?.length >= 20, question.id);
    if (data.englishExamQuestionNeedsReference(question)) {
      assert.ok(question.reference?.quote?.trim(), `${question.id}: source text`);
    }
    if (question.format === "order") {
      assert.equal(question.options.length, 4, `${question.id}: ranking order choices`);
      assert.ok(question.options.includes(question.answer), question.id);
      const expectedWords = question.answer.trim().split(/\s+/u).sort();
      for (const option of question.options) {
        assert.deepEqual(option.trim().split(/\s+/u).sort(), expectedWords, `${question.id}: ${option}`);
      }
    }
  }


  const relative = pool.find((question) => question.group === "前置詞＋関係代名詞");
  assert.deepEqual(new Set(relative.options), new Set(["in", "with", "by", "for"]));
  const mapped = pool.find((question) => question.id === "exam-level-english-expected-03-q10-ch16-word-3");
  assert.deepEqual(new Set(mapped.options), new Set(["mapped", "mapping", "map", "maps"]));
  const page = await readFile(new URL("../app/subjects/subject-2/page.tsx", import.meta.url), "utf8");
  assert.match(page, /import \{ ENGLISH_PRINT_LEVEL_QUESTIONS \}/u);
  assert.match(page, /const PRINT_LEVEL_QUESTIONS = ENGLISH_PRINT_LEVEL_QUESTIONS/u);
  assert.doesNotMatch(page, /\bSTUDY_QUESTIONS\b|\bEXAM_LEVEL_QUESTIONS\b/u);
  assert.match(page, /const knownIds = new Set\(PRINT_LEVEL_QUESTIONS/u);
  assert.match(page, /const questionsById = new Map\(PRINT_LEVEL_QUESTIONS/u);

  const rapid = await server.ssrLoadModule("/app/rapid-quiz-data.ts");
  const weatherQuestions = rapid.getStaticRapidPool("subject-2")
    .filter((question) => question.id.includes("ch16-homepage-"));
  assert.equal(weatherQuestions.length, 3);
  assert.ok(weatherQuestions.every((question) => question.requiresVisual));
  assert.ok(weatherQuestions.every((question) => question.visual?.type === "english-weather-homepage"));
  const rapidVisual = await readFile(new URL("../app/rapid-question-visual.tsx", import.meta.url), "utf8");
  assert.match(rapidVisual, /import EnglishWeatherFigure/u);
  assert.match(rapidVisual, /visual\.type === "english-weather-homepage"/u);
});

test("network print-level choices judge layer and function together", async (context) => {
  const server = await withServer(context);
  const data = await server.ssrLoadModule("/app/network-written-data.ts");
  const mockComponent = await server.ssrLoadModule("/app/network-written-mocks.tsx");
  assert.equal(typeof mockComponent.default, "function");
  assert.equal(data.NETWORK_WRITTEN_TERMS.length, 50);
  assert.equal(data.NETWORK_WRITTEN_SOURCE, "ネットワーク範囲.pdf（2026-07-24）");
  assert.equal(data.NETWORK_EXAM_LEVEL_QUESTIONS.length, data.NETWORK_WRITTEN_TERMS.length);
  assert.equal(data.NETWORK_WRITTEN_MOCKS.length, 6);

  for (const question of data.NETWORK_EXAM_LEVEL_QUESTIONS) {
    assert.equal(question.difficulty, 3, question.id);
    assert.equal(question.minimumCharacters, 20, question.id);
    assert.equal(question.options.length, 4, question.id);
    assert.equal(new Set(question.options).size, 4, question.id);
    assert.ok(question.options.includes(question.answer), question.id);
    assert.ok(question.options.every((option) => /^L[1-7]\s/u.test(option) && [...option.replace(/\s/gu, "")].length >= 20), question.id);
    assert.match(question.prompt, /層と働きの両方/u, question.id);
    assert.match(question.explanation, /正しい層/u, question.id);
    assert.equal(question.sourceBasis, "ネットワーク範囲.pdf（2026-07-24）", question.id);
  }

  const termsById = new Map(data.NETWORK_WRITTEN_TERMS.map((term) => [term.id, term]));
  for (const mock of data.NETWORK_WRITTEN_MOCKS) {
    assert.equal(mock.durationMinutes, 50, mock.id);
    assert.equal(mock.totalPoints, 100, mock.id);
    assert.equal(mock.pointsPerQuestion, 10, mock.id);
    assert.equal(mock.termIds.length, 10, mock.id);
    assert.equal(new Set(mock.termIds).size, 10, mock.id);
    const coveredLayers = new Set(mock.termIds.map((id) => termsById.get(id).listedLayer));
    assert.deepEqual(coveredLayers, new Set([1, 2, 3, 4, 5, 6, 7]), mock.id);
  }

  const page = await readFile(new URL("../app/subjects/network/written/page.tsx", import.meta.url), "utf8");
  assert.match(page, /import NetworkWrittenMocks/u);
  assert.match(page, /<NetworkWrittenMocks \/>/u);
  assert.match(page, /層は解答後に表示/u);
  assert.doesNotMatch(page, /\{term\.term\}\s*—\s*\{term\.category\}/u);
  assert.doesNotMatch(page, /<small>\{current\.category\}<\/small>/u);
});
