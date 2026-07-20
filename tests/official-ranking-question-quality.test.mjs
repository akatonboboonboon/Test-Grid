import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SUBJECT_IDS = [
  "subject-2",
  "network",
  "subject-3",
  "subject-4",
  "subject-5",
  "subject-6",
  "subject-7",
  "subject-8",
  "subject-9",
];

test("ranking choices never use placeholders or admit missing source and visual requirements", async (context) => {
  const server = await createServer({
    root: projectRoot,
    configFile: false,
    server: { middlewareMode: true },
    logLevel: "silent",
  });
  context.after(() => server.close());
  const data = await server.ssrLoadModule("/app/rapid-quiz-data.ts");

  for (const subjectId of SUBJECT_IDS) {
    const all = data.getStaticRapidPool(subjectId);
    const eligible = data.getOfficialRankingEligiblePool(subjectId);
    assert.ok(eligible.length >= 2, subjectId);
    for (const question of all) {
      assert.equal(question.options.includes("別の選択肢"), false, question.id);
      assert.equal(question.options.some((option) => option.trim() === ""), false, question.id);
    }
    for (const question of eligible) {
      assert.ok(question.options.length >= 2, question.id);
      assert.equal(new Set(question.options).size, question.options.length, question.id);
      assert.ok(question.options.some((option) => question.acceptedOptions.includes(option)), question.id);
      if (question.requiresVisual) assert.ok(question.visual, question.id);
      if (question.requiresReference) assert.ok(question.reference?.quote, question.id);
    }
  }
});

test("English ranking keeps choice language and granularity compatible", async (context) => {
  const server = await createServer({
    root: projectRoot,
    configFile: false,
    server: { middlewareMode: true },
    logLevel: "silent",
  });
  context.after(() => server.close());
  const data = await server.ssrLoadModule("/app/rapid-quiz-data.ts");
  const english = data.getOfficialRankingEligiblePool("subject-2");

  const screenshotTruth = english.find((question) => question.prompt.includes("63 billion cloud movements"));
  assert.ok(screenshotTruth, "the screenshot T/F question must stay in the pool");
  assert.match(screenshotTruth.topicLabel, /True\s*\/\s*False/u);
  assert.deepEqual(new Set(screenshotTruth.options), new Set(["T", "F"]));
  assert.equal(screenshotTruth.answer, "F");

  const screenshotVocabulary = english.find((question) => question.answer === "research institute");
  assert.ok(screenshotVocabulary, "the screenshot vocabulary question must stay in the pool");
  assert.match(screenshotVocabulary.topicLabel, /語彙・熟語（日→英）/u);
  assert.match(screenshotVocabulary.prompt, /研究所.*英語/u);
  assert.equal(screenshotVocabulary.prompt.includes("63 billion cloud movements"), false);

  const cloudMap = english.find((question) => question.answer.includes("detailed cloud map"));
  assert.ok(cloudMap, "the screenshot regression question must stay in the pool");
  assert.equal(cloudMap.options.length, 4);
  for (const option of cloudMap.options) {
    assert.equal(/[ぁ-んァ-ヶ一-龠]/u.test(option), false, option);
    assert.ok((option.match(/[A-Za-z]+/gu) ?? []).length >= 4, option);
    assert.match(option, /[.!?]$/u, option);
  }

  const truthQuestions = english.filter((question) => question.answer === "T" || question.answer === "F");
  assert.ok(truthQuestions.length > 0);
  for (const question of truthQuestions) {
    assert.equal(question.options.every((option) => option === "T" || option === "F"), true, question.id);
  }

  const referenced = english.filter((question) => question.requiresReference);
  assert.ok(referenced.length >= 50, "reading, T/F, extraction, order and translation need source text");
  assert.equal(referenced.every((question) => Boolean(question.reference?.quote)), true);

  const passageOrder = english.filter((question) => /(?:語順整序|一文整序)/u.test(question.topicLabel));
  assert.ok(passageOrder.length > 0);
  for (const question of passageOrder) {
    assert.equal(question.reference?.quote.includes(question.answer), false, question.id);
    assert.match(question.reference?.quote ?? "", /並べ替え対象文/u, question.id);
  }
});

test("all diagram-bound engineering ranking questions retain their mapped figure", async (context) => {
  const server = await createServer({
    root: projectRoot,
    configFile: false,
    server: { middlewareMode: true },
    logLevel: "silent",
  });
  context.after(() => server.close());
  const data = await server.ssrLoadModule("/app/rapid-quiz-data.ts");

  for (const subjectId of ["subject-3", "subject-4", "subject-5", "subject-6", "subject-9"]) {
    const all = data.getStaticRapidPool(subjectId);
    assert.equal(all.filter((question) => question.requiresVisual && !question.visual).length, 0, subjectId);
  }
  const smart = data.getOfficialRankingEligiblePool("subject-6");
  assert.ok(smart.filter((question) => question.visual?.type === "smart-control").length >= 20);
});
