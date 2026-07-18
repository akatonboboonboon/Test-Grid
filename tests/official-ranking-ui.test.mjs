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

test("official rankings use one shared fixed-condition UI while free rapid practice stays unranked", async () => {
  const [config, officialUi, rankingRoute, rapidRoute, rapidPractice, comprehensive, legacyDigitalRapid] = await Promise.all([
    readFile(new URL("../app/official-ranking-config.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/official-ranking-test.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ranking/[subjectId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/rapid/[subjectId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/rapid-answer-drill.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/comprehensive-challenge.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/subjects/subject-9/rapid/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(config, /OFFICIAL_RANKING_QUESTION_COUNT = 20/);
  assert.match(config, /"subject-2": 15 \* 60_000/);
  assert.match(config, /network: 3 \* 60_000/);
  for (const subjectId of SUBJECT_IDS.slice(2)) {
    assert.match(config, new RegExp(`"${subjectId}": 30 \\* 60_000`));
  }
  for (const subjectId of SUBJECT_IDS) assert.match(config, new RegExp(`"${subjectId}"`));
  assert.match(config, /boardKey: `ranking:\$\{subjectId\}:v\$\{OFFICIAL_RANKING_VERSION\}`/);

  assert.match(rankingRoute, /OfficialRankingTest subjectId=\{rawSubjectId\}/);
  assert.match(rapidRoute, /RapidAnswerDrill subjectId=\{rawSubjectId\}/);
  assert.match(legacyDigitalRapid, /redirect\("\/rapid\/subject-9"\)/);

  assert.match(officialUi, /startOfficialRankingChallenge/);
  assert.match(officialUi, /submitOfficialRankingChallenge/);
  assert.match(officialUi, /challenge\.expiresAt/);
  assert.match(officialUi, /RapidLeaderboard boardKey=\{spec\.boardKey\}/);
  assert.match(officialUi, /RapidQuestionVisual visual=\{publicQuestionAsVisual\(currentQuestion\)\}/);
  assert.match(officialUi, /全\{result\.questionCount\}問の振り返り/);
  assert.doesNotMatch(officialUi, /setQuestionCount|setLimitSeconds|publishRapidScore/);

  assert.match(rapidPractice, /問題数と1問の秒数を自由に変えられる練習モード/);
  assert.doesNotMatch(rapidPractice, /publishRapidScore|RapidLeaderboard|loadRapidPlayerName/);
  assert.doesNotMatch(comprehensive, /publishRapidScore|RapidLeaderboard|loadRapidPlayerName/);
});

test("every subject page links separately to free rapid practice and the official ranking test", async () => {
  const pages = await Promise.all(SUBJECT_IDS.map((subjectId) => readFile(
    new URL(`../app/subjects/${subjectId}/page.tsx`, import.meta.url),
    "utf8",
  )));

  SUBJECT_IDS.forEach((subjectId, index) => {
    assert.match(pages[index], new RegExp(`href="/rapid/${subjectId}"`), `${subjectId} should link to free rapid practice`);
    assert.match(pages[index], new RegExp(`href="/ranking/${subjectId}"`), `${subjectId} should link to its official ranking test`);
  });
});
