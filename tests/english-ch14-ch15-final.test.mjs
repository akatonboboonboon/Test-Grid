import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NOTE_IDS = Array.from({ length: 4 }, (_, index) => `ch14-final-note-taking-${index + 1}`);
const DIALOGUE_IDS = Array.from({ length: 12 }, (_, index) => `ch15-final-dialogue-${index + 1}`);
const PROFILE_IDS = Array.from({ length: 3 }, (_, index) => `ch15-final-corporate-profile-${index + 1}`);
const FINAL_IDS = [...NOTE_IDS, ...DIALOGUE_IDS, ...PROFILE_IDS];

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

test("Chapter 14 and 15 final sheets preserve all supplied prompts and answers", async (context) => {
  const server = await withServer(context);
  const [data, extra] = await Promise.all([
    server.ssrLoadModule("/app/english-data.ts"),
    server.ssrLoadModule("/app/english-explanations-extra.ts"),
  ]);
  const byId = new Map(data.ENGLISH_QUESTIONS.map((question) => [question.id, question]));

  assert.equal(new Set(FINAL_IDS).size, 19);
  assert.deepEqual(NOTE_IDS.map((id) => byId.get(id)?.answer), ["50", "100", "80", "2030"]);
  for (const id of NOTE_IDS) {
    const question = byId.get(id);
    assert.equal(question.format, "choice", id);
    assert.deepEqual(question.options, ["100", "80", "50", "2030", "gasoline-powered", "electric"], id);
    assert.match(question.reference.quote, /About \( 1 \).*almost \( 2 \).*to \( 3 \).*by \( 4 \)/su, id);
    assert.match(question.reference.quote, /Word bank: 100 \/ 80 \/ 50 \/ 2030 \/ gasoline-powered \/ electric/u, id);
  }

  assert.deepEqual(
    DIALOGUE_IDS.map((id) => byId.get(id)?.answer),
    ["job", "luck", "bad", "find", "Where", "kind", "molecules", "How", "chemical", "sugars", "complicated", "finding"],
  );
  for (const id of DIALOGUE_IDS) {
    const question = byId.get(id);
    assert.equal(question.format, "input", id);
    assert.equal(question.options.length, 4, `${id}: ranking choices`);
    assert.ok(question.options.includes(question.answer), `${id}: answer choice`);
    assert.match(question.reference.quote, /\( 1 \)[\s\S]*\( 12 \)/u, `${id}: complete blank dialogue`);
  }

  assert.deepEqual(
    PROFILE_IDS.map((id) => byId.get(id)?.answer),
    ["A company that makes new molecules", "Eriko", "Chemical engineer"],
  );
  assert.deepEqual(
    byId.get(PROFILE_IDS[0]).options,
    [
      "A company that creates new plant sugars",
      "A company that makes new molecules",
      "A company that makes advertisements for cosmetics",
      "A company that builds new laboratories",
    ],
  );
  assert.deepEqual(byId.get(PROFILE_IDS[1]).options, ["Eriko", "Ken", "Both Eriko and Ken", "Neither person"]);
  assert.deepEqual(byId.get(PROFILE_IDS[2]).options, ["Mechanical engineer", "Plant engineer", "Systems engineer", "Chemical engineer"]);

  for (const id of FINAL_IDS) {
    const question = byId.get(id);
    assert.ok(question, id);
    assert.match(question.reference.label, /Chapter (?:14|15) 最終問題/u, id);
    assert.ok(question.reference.quote.length >= 200, `${id}: source text`);
    assert.ok(question.reference.translation.length >= 100, `${id}: translation`);
    assert.ok(extra.ENGLISH_EXTRA_EXPLANATIONS[id]?.length >= 100, `${id}: detailed explanation`);
  }
  const finalSerialized = JSON.stringify(FINAL_IDS.map((id) => byId.get(id)));
  assert.doesNotMatch(finalSerialized, /The museum allows us to take pictures/u);
});

test("all supplied final-sheet questions reach mock, rapid, ranking, and comprehensive pools", async (context) => {
  const server = await withServer(context);
  const [expected, rapid, ranking] = await Promise.all([
    server.ssrLoadModule("/app/english-expected-exams-data.ts"),
    server.ssrLoadModule("/app/rapid-quiz-data.ts"),
    server.ssrLoadModule("/app/official-ranking-questions.ts"),
  ]);
  const printIds = new Set(expected.ENGLISH_PRINT_LEVEL_QUESTIONS.map((question) => question.id));
  const rapidPool = rapid.getStaticRapidPool("subject-2");
  const eligible = rapid.getOfficialRankingEligiblePool("subject-2");
  const comprehensive = rapid.getComprehensiveRapidPool("subject-2");
  const official = ranking.getOfficialRankingQuestions("subject-2");

  for (const sourceId of FINAL_IDS) {
    const mappedId = `exam-level-source-${sourceId}`;
    assert.ok(printIds.has(mappedId), `${sourceId}: mock`);
    for (const [label, pool] of [
      ["rapid", rapidPool],
      ["ranking eligible", eligible],
      ["comprehensive", comprehensive],
      ["official ranking", official],
    ]) {
      const question = pool.find((candidate) => candidate.id.endsWith(sourceId));
      assert.ok(question, `${sourceId}: ${label}`);
      assert.equal(question.options.length, 4, `${sourceId}: ${label} choice count`);
      assert.ok(
        question.options.some((option) => question.acceptedOptions.includes(option)),
        `${sourceId}: ${label} correct choice`,
      );
      assert.ok(question.reference?.quote?.trim(), `${sourceId}: ${label} reference`);
    }
  }
});
