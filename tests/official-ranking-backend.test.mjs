import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("official ranking v1 has one immutable fixed specification per subject", async (context) => {
  const server = await createServer({
    root: projectRoot,
    configFile: false,
    server: { middlewareMode: true },
    logLevel: "silent",
  });
  context.after(() => server.close());
  const config = await server.ssrLoadModule("/app/official-ranking-config.ts");
  const questionData = await server.ssrLoadModule("/app/official-ranking-questions.ts");

  assert.equal(config.OFFICIAL_RANKING_SUBJECT_IDS.length, 9);
  for (const subjectId of config.OFFICIAL_RANKING_SUBJECT_IDS) {
    const spec = config.getOfficialRankingSpec(subjectId);
    const questions = questionData.getOfficialRankingQuestions(subjectId);
    const ids = questionData.getOfficialRankingQuestionIds(subjectId);
    assert.equal(spec.mode, "official-ranking-test");
    assert.equal(spec.version, 1);
    assert.equal(spec.boardKey, `ranking:${subjectId}:v1`);
    assert.equal(spec.questionCount, 20);
    assert.equal(questions.length, 20);
    assert.equal(ids.length, 20);
    assert.equal(new Set(ids).size, 20);
    assert.deepEqual(questions.map((question) => question.id), ids);
    assert.equal(config.officialRankingSpecFromBoardKey(`rapid:${subjectId}:q20`), null);

    const publicQuestion = questionData.toPublicOfficialRankingQuestion(questions[0]);
    assert.equal("answer" in publicQuestion, false);
    assert.equal("acceptedOptions" in publicQuestion, false);
    assert.equal("explanation" in publicQuestion, false);

    const perfect = questionData.scoreOfficialRankingResponses(spec, questions.map((question) => ({
      questionId: question.id,
      selected: question.acceptedOptions[0],
    })));
    assert.equal(perfect.correctCount, 20);
    assert.equal(perfect.bestStreak, 20);
    assert.equal(perfect.review.length, 20);
    assert.equal(perfect.review.every((item) => item.correct), true);
    assert.deepEqual(
      Object.keys(perfect.review[0]).sort(),
      ["acceptedOptions", "answer", "correct", "explanation", "mathOptions", "prompt", "questionId", "selected", "sourceBasis", "steps", "studyHref", "topicLabel", "visual"].sort(),
    );
    assert.equal(perfect.review[0].answer, questions[0].answer);
    assert.deepEqual(perfect.review[0].acceptedOptions, questions[0].acceptedOptions);
    const blank = questionData.scoreOfficialRankingResponses(spec, questions.map((question) => ({
      questionId: question.id,
      selected: null,
    })));
    assert.equal(blank.correctCount, 0);
    assert.equal(blank.bestStreak, 0);
    assert.equal(blank.review.every((item) => !item.correct && item.selected === null), true);
  }

  assert.equal(config.getOfficialRankingSpec("subject-2").timeLimitMs, 15 * 60_000);
  assert.equal(config.getOfficialRankingSpec("network").timeLimitMs, 3 * 60_000);
  for (const subjectId of config.OFFICIAL_RANKING_SUBJECT_IDS.filter((id) => id.startsWith("subject-") && id !== "subject-2")) {
    assert.equal(config.getOfficialRankingSpec(subjectId).timeLimitMs, 30 * 60_000);
  }
});

test("leaderboard API only accepts a server-issued one-use official challenge", async () => {
  const [route, client, rankingData, fixedIds] = await Promise.all([
    readFile(new URL("../app/api/leaderboard/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/official-ranking-client.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/rapid-ranking-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/official-ranking-question-ids.ts", import.meta.url), "utf8"),
  ]);

  assert.match(route, /export async function POST/);
  assert.match(route, /export async function PUT/);
  assert.match(route, /challengeObjectKey\(identity\.userKey/);
  assert.match(route, /CHALLENGE_ALREADY_SUBMITTED/);
  assert.match(route, /CHALLENGE_EXPIRED/);
  assert.match(route, /scoreOfficialRankingResponses\(spec, answers\)/);
  assert.match(route, /completedAt - challenge\.startedAt/);
  assert.match(route, /leaderboards\/official-v1\/scores/);
  assert.doesNotMatch(route, /leaderboards\/v1/);
  assert.doesNotMatch(route, /body\.correctCount|body\.bestStreak|body\.durationMs/);
  assert.match(route, /questions\.map\(toPublicOfficialRankingQuestion\)/);
  assert.match(route, /durationMs,\s*review,/);

  assert.match(client, /method: "POST"/);
  assert.match(client, /method: "PUT"/);
  assert.match(client, /JSON\.stringify\(\{ challengeId, answers \}\)/);
  assert.doesNotMatch(client, /body:\s*JSON\.stringify\(\{[^}]*(?:correctCount|bestStreak|durationMs)/);
  assert.match(client, /review: OfficialRankingReviewItem\[\]/);
  assert.doesNotMatch(rankingData, /fetch\("\/api\/leaderboard"/);
  assert.match(rankingData, /Variable-count rapid drills/);
  assert.match(fixedIds, /deliberately pinned to explicit IDs/);
});
