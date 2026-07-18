import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
}

function dataUrl(javascript) {
  return `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
}

test("ranking names are normalized without allowing controls, newlines, or bidi overrides", async () => {
  const source = await readFile(new URL("../app/rapid-ranking-profile.ts", import.meta.url), "utf8");
  const profile = await import(dataUrl(compile(source)));

  assert.equal(profile.normalizeRankingName("  ＯＳＡＴＯ　太郎  "), "OSATO 太郎");
  assert.equal(profile.normalizeRankingName("a   b"), "a b");
  assert.equal(profile.normalizeRankingName("a\nb"), null);
  assert.equal(profile.normalizeRankingName("a\tb"), null);
  assert.equal(profile.normalizeRankingName("safe\u202Ename"), null);
  assert.equal(profile.normalizeRankingName(""), null);
  assert.equal(profile.normalizeRankingName("名".repeat(25)), null);
  assert.equal(profile.normalizeRankingName("名".repeat(24)), "名".repeat(24));
});

test("ranking profile merge preserves the newest value including an explicit clear", async () => {
  const source = await readFile(new URL("../app/rapid-ranking-profile.ts", import.meta.url), "utf8");
  const profile = await import(dataUrl(compile(source)));
  const older = { version: 1, rankingName: "旧名", updatedAt: 10 };
  const newer = { version: 1, rankingName: null, updatedAt: 20 };

  assert.deepEqual(profile.mergeRapidRankingProfiles(older, newer), newer);
  assert.deepEqual(profile.mergeRapidRankingProfiles(newer, older), newer);
});

test("named leaderboards only accept the fixed server-scored official subject tests", async () => {
  const [route, rankingData, accountSync, layout, config, client, questionIds] = await Promise.all([
    readFile(new URL("../app/api/leaderboard/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/rapid-ranking-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/account-sync.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/official-ranking-config.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/official-ranking-client.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/official-ranking-question-ids.ts", import.meta.url), "utf8"),
  ]);

  assert.match(route, /RAPID_CLIENT_TOKEN_HEADER/);
  assert.match(route, /sameSiteWriteAllowed/);
  assert.match(route, /export async function POST/);
  assert.match(route, /CHALLENGE_ALREADY_SUBMITTED/);
  assert.match(route, /scoreOfficialRankingResponses/);
  assert.match(route, /existing\?\.alias !== entry\.alias/);
  assert.match(route, /STUDY_SNAPSHOTS\.put/);
  assert.doesNotMatch(route, /Response\.json\([^)]*userKey/);
  assert.doesNotMatch(route, /body\.correctCount|body\.bestStreak|body\.durationMs/);
  assert.match(config, /OFFICIAL_RANKING_QUESTION_COUNT = 20/);
  assert.match(config, /ranking:\$\{subjectId\}:v\$\{OFFICIAL_RANKING_VERSION\}/);
  assert.match(questionIds, /deliberately pinned to explicit IDs/);
  assert.match(client, /JSON\.stringify\(\{ challengeId, answers \}\)/);
  assert.doesNotMatch(rankingData, /fetch\("\/api\/leaderboard"/);
  assert.match(rankingData, /playerName: string/);
  assert.match(rankingData, /normalizeRapidPlayerName/);
  assert.match(accountSync, /mergeRapidRankingProfiles/);
  assert.match(accountSync, /data-default-ranking-name/);
  assert.match(layout, /defaultRankingName: user\.fullName/);
  assert.doesNotMatch(layout, /defaultRankingName: user\.displayName/);
});
