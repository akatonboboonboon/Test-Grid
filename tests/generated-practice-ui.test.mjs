import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const APP_URL = new URL("../app/", import.meta.url);
const SUBJECT_IDS = ["subject-2", "subject-3", "subject-4", "subject-6", "subject-7", "subject-8"];

test("generated-practice UI is a separate source-guarded one-question workspace", async () => {
  const [route, client, hub] = await Promise.all([
    readFile(new URL("generated-practice/page.tsx", APP_URL), "utf8"),
    readFile(new URL("generated-practice-client.tsx", APP_URL), "utf8"),
    readFile(new URL("page.tsx", APP_URL), "utf8"),
  ]);

  assert.match(route, /GeneratedPracticeClient/);
  assert.match(route, /searchParams/);
  assert.match(route, /SUBJECT_IDS\.has/);
  assert.match(client, /プリント問題とは別/);
  assert.match(client, /今すぐ1問作る/);
  assert.match(client, /generatePracticeQuestion/);
  assert.match(client, /gradeGeneratedPracticeAnswer/);
  assert.match(client, /要点・ニュアンスで採点/);
  assert.match(client, /question\.format === "order"/);
  assert.match(client, /question\.format === "translation"/);
  assert.match(client, /question\.format === "choice"/);
  assert.match(client, /question\.format === "number"/);
  assert.match(client, /RichMathText/);
  assert.match(client, /DisplayMath/);
  assert.match(client, /\{revealed && \(/);
  assert.match(client, /\{question\.steps\.map/);
  assert.match(client, /question\.reason/);
  assert.match(client, /question\.explanation/);
  assert.match(client, /question\.source\.excerpt/);
  assert.match(hub, /href="\/generated-practice"/);
  assert.match(hub, /自動生成問題で、もう1問/);
});

test("only the six ready subjects link to the generated-practice tab", async () => {
  for (const subjectId of SUBJECT_IDS) {
    const page = await readFile(new URL("subjects/" + subjectId + "/page.tsx", APP_URL), "utf8");
    assert.match(page, new RegExp("generated-practice\\?subject=" + subjectId));
    assert.match(page, /自動生成問題/);
  }

  const network = await readFile(new URL("subjects/network/page.tsx", APP_URL), "utf8");
  assert.doesNotMatch(network, /generated-practice/);
});

test("answers and English excerpts are only mounted inside the revealed solution", async () => {
  const client = await readFile(new URL("generated-practice-client.tsx", APP_URL), "utf8");
  const revealStart = client.indexOf("{revealed && (");
  const answerUse = client.indexOf("text={question.answer}");
  const excerptUse = client.indexOf("text={question.source.excerpt}");
  assert.ok(revealStart >= 0);
  assert.ok(answerUse > revealStart);
  assert.ok(excerptUse > revealStart);
  assert.match(client, /setRevealed\(true\)/);
  assert.match(client, /setRevealed\(false\)/);
});

test("statistics formula hints show both sigma and expanded notation", async () => {
  const source = await readFile(new URL("../app/generated-practice-client.tsx", import.meta.url), "utf8");
  assert.match(source, /Σを使う書き方/u);
  assert.match(source, /Σなしで書くと/u);
  assert.match(source, /question\.expandedFormula/u);
});

test("question regeneration stays pure during React render", async () => {
  const source = await readFile(new URL("../app/generated-practice-client.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /Date\.now\(\)/u);
  assert.match(source, /globalThis\.crypto\?\.randomUUID/u);
  assert.doesNotMatch(source, /nextTemplate \|\| "random",\s*question\.seed/u);
  assert.match(source, /generationCounter\.current/u);
});
