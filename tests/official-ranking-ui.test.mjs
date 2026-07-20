import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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

test("official rankings use one shared endless-streak UI while free rapid practice stays unranked", async () => {
  const [config, officialUi, rankingRoute, rapidRoute, rapidPractice, comprehensive, legacyDigitalRapid, leaderboard] = await Promise.all([
    readFile(new URL("../app/official-ranking-config.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/official-ranking-test.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ranking/[subjectId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/rapid/[subjectId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/rapid-answer-drill.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/comprehensive-challenge.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/subjects/subject-9/rapid/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/rapid-leaderboard.tsx", import.meta.url), "utf8"),
  ]);

  for (const token of [
    'OFFICIAL_RANKING_MODE = "official-ranking-streak"',
    "OFFICIAL_RANKING_VERSION = 2",
    'OFFICIAL_RANKING_SCORING = "consecutive-correct"',
    "streak:v",
  ]) assert.ok(config.includes(token), token);
  assert.equal(config.includes("QUESTION_COUNT"), false);
  assert.equal(config.includes("timeLimitMs"), false);
  for (const subjectId of SUBJECT_IDS) assert.ok(config.includes('"' + subjectId + '"'));

  assert.ok(rankingRoute.includes("<OfficialRankingTest subjectId={rawSubjectId}"));
  assert.ok(rapidRoute.includes("<RapidAnswerDrill subjectId={rawSubjectId}"));
  assert.ok(legacyDigitalRapid.includes('redirect("/rapid/subject-9")'));

  for (const token of [
    "startOfficialRankingSession",
    "submitOfficialRankingAnswer",
    "CURRENT STREAK",
    "session.currentStreak",
    "session.bestStreak",
    "中断して{meta.name}へ戻る",
    "次の問題へ",
    "refreshToken={leaderboardRefresh}",
  ]) assert.ok(officialUi.includes(token), token);
  for (const token of ["expiresAt", "questionCount", "timeLimitMs", "answersRef", "submitOfficialRankingChallenge"]) {
    assert.equal(officialUi.includes(token), false, token);
  }

  assert.ok(leaderboard.includes("entry.bestStreak"));
  assert.ok(leaderboard.includes("最高連続正解数"));
  assert.ok(leaderboard.includes("中断しても現在の連続数は保存"));

  for (const token of ["publishRapidScore", "RapidLeaderboard", "loadRapidPlayerName"]) {
    assert.equal(rapidPractice.includes(token), false, token);
    assert.equal(comprehensive.includes(token), false, token);
  }
});

test("ranking questions show required source text and diagrams before answering, then translation and explanation", async () => {
  const source = await readFile(new URL("../app/official-ranking-test.tsx", import.meta.url), "utf8");

  const promptIndex = source.indexOf("displayedQuestion.prompt");
  const referenceIndex = source.indexOf("displayedQuestion.reference?.quote");
  const visualIndex = source.indexOf("RapidQuestionVisual visual={displayedQuestion.visual}");
  const optionsIndex = source.indexOf('className="rapid-options"');
  assert.ok(promptIndex >= 0);
  assert.ok(referenceIndex > promptIndex, "reference should be visible after the prompt");
  assert.ok(visualIndex > referenceIndex, "visual should be visible before choices");
  assert.ok(optionsIndex > visualIndex, "choices should follow the source and visual");

  for (const token of [
    'aria-label="問題の参照本文"',
    "displayedQuestion.reference.quote",
    'solution={phase === "feedback"}',
    "feedback.reference?.translation",
    'aria-label="参照和訳"',
    "feedback.steps.map",
    "feedback.explanation",
    "feedback.sourceBasis",
  ]) assert.ok(source.includes(token), token);
});

test("every subject page links separately to free rapid practice and the official ranking test", async () => {
  const pages = await Promise.all(SUBJECT_IDS.map((subjectId) => readFile(
    new URL("../app/subjects/" + subjectId + "/page.tsx", import.meta.url),
    "utf8",
  )));

  SUBJECT_IDS.forEach((subjectId, index) => {
    assert.ok(pages[index].includes('href="/rapid/' + subjectId + '"'), subjectId + " should link to free rapid practice");
    assert.ok(pages[index].includes('href="/ranking/' + subjectId + '"'), subjectId + " should link to its official ranking test");
  });
});
