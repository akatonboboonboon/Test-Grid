import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("official ranking v2 is an endless server-scored streak for every subject", async (context) => {
  const server = await createServer({
    root: projectRoot,
    configFile: false,
    server: { middlewareMode: true },
    logLevel: "silent",
  });
  context.after(() => server.close());
  const config = await server.ssrLoadModule("/app/official-ranking-config.ts");
  const questionsModule = await server.ssrLoadModule("/app/official-ranking-questions.ts");

  assert.equal(config.OFFICIAL_RANKING_SUBJECT_IDS.length, 9);
  for (const subjectId of config.OFFICIAL_RANKING_SUBJECT_IDS) {
    const spec = config.getOfficialRankingSpec(subjectId);
    const questions = questionsModule.getOfficialRankingQuestions(subjectId);
    assert.equal(spec.mode, "official-ranking-streak");
    assert.equal(spec.version, 2);
    assert.equal(spec.scoring, "consecutive-correct");
    assert.equal(spec.boardKey, "ranking:" + subjectId + ":streak:v2");
    assert.equal("questionCount" in spec, false);
    assert.equal("timeLimitMs" in spec, false);
    assert.ok(questions.length >= 2, subjectId + " needs at least two ranking questions");
    assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
    assert.equal(config.officialRankingSpecFromBoardKey("ranking:" + subjectId + ":v1"), null);

    for (const question of questions) {
      assert.ok(question.options.length >= 2, question.id);
      assert.ok(question.options.some((option) => question.acceptedOptions.includes(option)), question.id);
      if (question.requiresVisual) assert.ok(question.visual, question.id + " must keep its visual");
      if (question.requiresReference) assert.ok(question.reference?.quote, question.id + " must keep its reference");
    }

    const publicQuestion = questionsModule.toPublicOfficialRankingQuestion(questions[0]);
    assert.equal("answer" in publicQuestion, false);
    assert.equal("acceptedOptions" in publicQuestion, false);
    assert.equal("explanation" in publicQuestion, false);
  }

  assert.deepEqual(questionsModule.updateOfficialRankingStreak(4, 9, true), {
    currentStreak: 5,
    bestStreak: 9,
  });
  assert.deepEqual(questionsModule.updateOfficialRankingStreak(9, 9, true), {
    currentStreak: 10,
    bestStreak: 10,
  });
  assert.deepEqual(questionsModule.updateOfficialRankingStreak(8, 12, false), {
    currentStreak: 0,
    bestStreak: 12,
  });

  const englishQuestions = questionsModule.getOfficialRankingQuestions("subject-2");
  const referenced = englishQuestions.find((question) => question.reference?.translation);
  assert.ok(referenced, "English ranking needs a translated source reference");
  const publicReferenced = questionsModule.toPublicOfficialRankingQuestion(referenced);
  assert.deepEqual(publicReferenced.reference, {
    label: referenced.reference.label,
    quote: referenced.reference.quote,
  });
  assert.equal("translation" in publicReferenced.reference, false, "translation must not leak before grading");

  const graded = questionsModule.scoreOfficialRankingAnswer(referenced, referenced.acceptedOptions[0]);
  assert.equal(graded.correct, true);
  assert.equal(graded.feedback.reference.translation, referenced.reference.translation);
  assert.equal(graded.feedback.explanation, referenced.explanation);
  assert.deepEqual(graded.feedback.steps, referenced.steps);

  const passageOrder = englishQuestions.find((question) => (
    /(?:語順整序|一文整序)/u.test(question.topicLabel) && question.reference?.quote
  ));
  assert.ok(passageOrder, "passage ordering needs redacted source context");
  assert.equal(passageOrder.reference.quote.includes(passageOrder.answer), false);
  assert.match(passageOrder.reference.quote, /並べ替え対象文/u);
});

test("leaderboard API persists one-use streak attempts in D1 and never trusts client scores", async () => {
  const [route, client, schema, migration, hosting] = await Promise.all([
    readFile(new URL("../app/api/leaderboard/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/official-ranking-client.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0003_nifty_landau.sql", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);

  for (const token of [
    "export async function GET",
    "export async function POST",
    "export async function PUT",
    "getD1()",
    "official_ranking_sessions",
    "official_ranking_entries",
    "ORDER BY streak_count DESC, achieved_at ASC",
    "current_attempt_id = ?",
    "current_question_id = ?",
    "revision = ?",
    "database.batch([sessionUpdate, entryUpdate])",
    "scoreOfficialRankingAnswer",
    "updateOfficialRankingStreak",
    "question: toPublicOfficialRankingQuestion(nextQuestion)",
  ]) assert.ok(route.includes(token), token);
  assert.ok(route.includes("if (!origin || !fetchSite) return false;"));
  assert.ok(route.includes("ATTEMPT_ALREADY_ANSWERED") || route.includes("STALE_ATTEMPT"));
  for (const token of ["body.correctCount", "body.bestStreak", "body.currentStreak", "body.durationMs", "body.totalAnswered", "body.totalCorrect", "leaderboards/official-v1"]) {
    assert.equal(route.includes(token), false, token);
  }

  for (const token of [
    'method: "POST"',
    'method: "PUT"',
    "subjectId: session.spec.subjectId",
    "sessionId: session.sessionId",
    "attemptId: session.attemptId",
    "questionId: session.question.id",
  ]) assert.ok(client.includes(token), token);
  assert.equal(client.includes("correctCount"), false);
  assert.equal(client.includes("durationMs"), false);

  for (const value of [schema, migration]) {
    for (const token of ["official_ranking_sessions", "official_ranking_entries", "current_attempt_id", "best_streak", "achieved_at"]) {
      assert.ok(value.includes(token), token);
    }
  }
  assert.ok(hosting.includes('"d1": "DB"'));
});
