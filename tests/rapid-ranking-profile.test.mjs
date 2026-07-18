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
  assert.equal(profile.normalizeRankingName("あ".repeat(25)), null);
  assert.equal(profile.normalizeRankingName("あ".repeat(24)), "あ".repeat(24));
});

test("ranking profile merge preserves the newest value including an explicit clear", async () => {
  const source = await readFile(new URL("../app/rapid-ranking-profile.ts", import.meta.url), "utf8");
  const profile = await import(dataUrl(compile(source)));
  const older = { version: 1, rankingName: "旧名", updatedAt: 10 };
  const newer = { version: 1, rankingName: null, updatedAt: 20 };

  assert.deepEqual(profile.mergeRapidRankingProfiles(older, newer), newer);
  assert.deepEqual(profile.mergeRapidRankingProfiles(newer, older), newer);
});

test("named leaderboards support account or device identity and the 4914-question overall board", async () => {
  const [route, rankingData, accountSync, layout, rapid, overall, publicBoard] = await Promise.all([
    readFile(new URL("../app/api/leaderboard/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/rapid-ranking-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/account-sync.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/rapid-answer-drill.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/comprehensive-challenge.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/rapid-leaderboard.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(route, /RAPID_CLIENT_TOKEN_HEADER/);
  assert.match(route, /sameSiteWriteAllowed/);
  assert.match(route, /questionCount > 4_914/);
  assert.match(route, /existing\.alias !== alias/);
  assert.match(route, /STUDY_SNAPSHOTS\.put/);
  assert.doesNotMatch(route, /Response\.json\([^)]*userKey/);
  assert.match(rankingData, /playerName: string/);
  assert.match(rankingData, /normalizeRapidPlayerName/);
  assert.match(rankingData, /以前の記録|\\u4ee5\\u524d\\u306e\\u8a18\\u9332/);
  assert.match(accountSync, /mergeRapidRankingProfiles/);
  assert.match(accountSync, /data-default-ranking-name/);
  assert.match(layout, /defaultRankingName: user\.fullName/);
  assert.doesNotMatch(layout, /defaultRankingName: user\.displayName/);
  for (const client of [rapid, overall]) {
    assert.match(client, /ランキング表示名/);
    assert.match(client, /playerName/);
    assert.match(client, /連続/);
  }
  assert.match(publicBoard, /PLAYER RANKING/);
  assert.match(publicBoard, /entry\.alias/);
});
