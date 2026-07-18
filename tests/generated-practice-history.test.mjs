import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);

test("generated practice supports a bounded 1 to 100 question session", async () => {
  const client = await readFile(new URL("app/generated-practice-client.tsx", ROOT), "utf8");

  assert.match(client, /MAX_SESSION_QUESTIONS = 100/);
  assert.doesNotMatch(client, /nextTemplate \|\| "random",\s*question\.seed,/);
  assert.match(client, /type="number"/);
  assert.match(client, /min="1"/);
  assert.match(client, /max={MAX_SESSION_QUESTIONS}/);
  assert.match(client, /startPractice/);
  assert.match(client, /sessionQueue/);
  assert.match(client, /advanceSession/);
  assert.match(client, /if \(revealed\) return/);
  assert.match(client, /readOnly=\{revealed\}/);
  assert.match(client, /disabled=\{revealed \|\| selectedTokenIndexes\.includes\(index\)\}/);
  assert.match(client, /連続練習の結果/);
  assert.match(client, /模範解答と解説を振り返る/);
});

test("generated questions are saved to a public, validated, paginated D1 history", async () => {
  const [
    client,
    route,
    favoriteRoute,
    schema,
    hosting,
    historyMigration,
    quotaMigration,
    favoriteMigration,
  ] = await Promise.all([
    readFile(new URL("app/generated-practice-client.tsx", ROOT), "utf8"),
    readFile(new URL("app/api/generated-practice-history/route.ts", ROOT), "utf8"),
    readFile(new URL("app/api/generated-practice-favorites/route.ts", ROOT), "utf8"),
    readFile(new URL("db/schema.ts", ROOT), "utf8"),
    readFile(new URL(".openai/hosting.json", ROOT), "utf8"),
    readFile(new URL("drizzle/0000_blushing_jetstream.sql", ROOT), "utf8"),
    readFile(new URL("drizzle/0001_mute_robbie_robertson.sql", ROOT), "utf8"),
    readFile(new URL("drizzle/0002_easy_harrier.sql", ROOT), "utf8"),
  ]);

  assert.match(client, /みんなの生成履歴/);
  assert.match(client, /saveGenerationRequestsToHistory/);
  assert.match(client, /JSON\.stringify\(\{ requests \}\)/);
  assert.match(client, /method: "POST"/);
  assert.match(client, /この問題を解き直す/);
  assert.match(route, /export async function GET/);
  assert.match(route, /export async function POST/);
  assert.match(route, /validateGeneratedPracticeQuestion/);
  assert.match(route, /generatePracticeQuestion/);
  assert.match(route, /parseGenerationRequest/);
  assert.match(route, /MAX_BODY_BYTES = 128_000/);
  assert.match(route, /MAX_BATCH_SIZE = 100/);
  assert.match(route, /MAX_HISTORY_ITEMS = 5_000/);
  assert.match(route, /MAX_QUESTIONS_PER_MINUTE = 500/);
  assert.match(route, /HISTORY_WRITE_RATE_LIMITED/);
  assert.match(route, /claimFallbackWrite/);
  assert.match(route, /PERSISTENT_QUOTA_UNAVAILABLE/);
  assert.match(route, /LIMIT -1 OFFSET \?/);
  assert.match(route, /UNFAVORITED_TTL_MS = 3 \* 24 \* 60 \* 60 \* 1_000/);
  assert.match(route, /NOT EXISTS \(\s*SELECT 1\s*FROM generated_practice_favorites/s);
  assert.doesNotMatch(route, /body\.questions/);
  assert.match(route, /INSERT OR IGNORE INTO generated_practice_history/);
  assert.doesNotMatch(route, /getChatGPTUser/);
  assert.match(schema, /generated_practice_history/);
  assert.match(schema, /generated_practice_write_limits/);
  assert.match(schema, /generated_practice_favorites/);
  assert.ok(schema.includes("primaryKey({ columns: [table.questionId, table.actorKey] })"));
  assert.equal(JSON.parse(hosting).d1, "DB");
  assert.match(historyMigration, /CREATE TABLE .*generated_practice_history/);
  assert.match(quotaMigration, /CREATE TABLE .*generated_practice_write_limits/);
  assert.match(favoriteMigration, /CREATE TABLE .*generated_practice_favorites/);
  assert.match(favoriteMigration, /ON DELETE cascade/);
  assert.match(favoriteRoute, /export async function GET/);
  assert.match(favoriteRoute, /export async function PATCH/);
  assert.match(favoriteRoute, /INSERT OR IGNORE INTO generated_practice_favorites/);
  assert.match(favoriteRoute, /DELETE FROM generated_practice_favorites/);
  assert.ok(favoriteRoute.includes("UNFAVORITED_TTL_MS = 3 * 24 * 60 * 60 * 1_000"));
  assert.match(favoriteRoute, /favoriteCount/);
  assert.match(favoriteRoute, /viewerFavorited/);
  assert.match(client, /toggleFavorite/);
  assert.ok(client.includes("aria-pressed={Boolean(item.viewerFavorited)}"));
  assert.match(client, /お気に入りが0件の問題は生成から3日で自動整理/);
});

test("generated practice has high-contrast page tokens and obvious entry points", async () => {
  const [css, homePage] = await Promise.all([
    readFile(new URL("app/globals.css", ROOT), "utf8"),
    readFile(new URL("app/page.tsx", ROOT), "utf8"),
  ]);

  assert.ok(css.includes(".generated-practice-page {"));
  assert.ok(css.includes("--dark: #141a22"));
  assert.ok(css.includes("--muted: #4b5563"));
  assert.ok(css.includes(".generated-practice-builder,"));
  assert.ok(css.includes("color: var(--ink)"));
  assert.ok(css.includes(".generated-practice-history-grid"));
  assert.ok(css.includes(".generated-practice-favorite-button"));
  assert.ok(css.includes("border-left: 10px solid #f04f8a"));
  assert.ok(css.includes(".hub-generated-header-link"));
  assert.ok(css.includes("background: #f04f8a"));
  assert.match(homePage, /hub-generated-header-link/);
  assert.match(homePage, /自動生成問題・共有履歴/);
  assert.match(homePage, /1〜100問連続/);
});