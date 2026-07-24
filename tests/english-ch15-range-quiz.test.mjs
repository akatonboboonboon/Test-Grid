import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUIZ_IDS = [
  "ch15-range-quiz-translation-1",
  "ch15-range-quiz-translation-2",
  "ch15-range-quiz-translation-3",
  "ch15-range-quiz-vocab-intersection",
  "ch15-range-quiz-vocab-genetic-engineering",
  "ch15-range-quiz-vocab-involve",
  "ch15-range-quiz-vocab-revive",
  "ch15-range-quiz-order-leaning",
  "ch15-range-quiz-order-eyes-closed",
  "ch15-range-quiz-term-petrochemicals",
  "ch15-range-quiz-term-dna-sequence",
];

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

test("Chapter 15 supplemental quiz keeps all supplied prompts, answers, and detailed explanations", async (context) => {
  const server = await withServer(context);
  const [data, language, extra] = await Promise.all([
    server.ssrLoadModule("/app/english-data.ts"),
    server.ssrLoadModule("/app/english-explanations-language.ts"),
    server.ssrLoadModule("/app/english-explanations-extra.ts"),
  ]);
  assert.deepEqual(data.CH15_RANGE_QUIZ_SOURCE_IDS, QUIZ_IDS);

  const byId = new Map(data.ENGLISH_QUESTIONS.map((question) => [question.id, question]));
  assert.deepEqual(
    QUIZ_IDS.map((id) => byId.get(id)?.answer),
    [
      "ニューマン氏のバイオテクノロジー企業は、主に遺伝子組み換え酵母の形をした新しい生命体を、1日1,500体を超えるめまぐるしい速度で作り出している。",
      "砂糖を医薬品に変換するものもあれば、化粧品に使用できる保湿剤を作り出すものもある。",
      "何百もの製品が現在開発中である。",
      "交差点、交差する領域",
      "遺伝子工学",
      "～を含む、伴う",
      "再燃させる、復活させる",
      "A man is standing, leaning against the wall.",
      "A man is sitting with his eyes closed.",
      "petrochemicals",
      "DNA sequence",
    ],
  );

  for (const id of QUIZ_IDS) {
    const question = byId.get(id);
    assert.ok(question, id);
    assert.equal(question.unit, "ch15", id);
    assert.match(question.reference?.label ?? "", /Chapter 15 範囲補足小テスト/u, id);
    assert.ok(question.reference?.quote?.trim(), `${id}: source`);
    assert.ok(question.reference?.translation?.trim(), `${id}: translation`);
    assert.equal(question.options?.length, 4, `${id}: ranking choices`);
    assert.ok(question.options.includes(question.answer), `${id}: answer in choices`);
    const explanation = language.ENGLISH_LANGUAGE_EXPLANATIONS[id]
      ?? extra.ENGLISH_EXTRA_EXPLANATIONS[id];
    assert.ok(explanation?.length >= 100, `${id}: detailed explanation`);
  }

  const translationIds = QUIZ_IDS.filter((id) => id.includes("-translation-"));
  for (const id of translationIds) {
    assert.equal(byId.get(id).format, "translation", id);
    assert.equal(byId.get(id).grading, "japanese-semantic", id);
  }

  for (const id of ["ch15-range-quiz-order-leaning", "ch15-range-quiz-order-eyes-closed"]) {
    const question = byId.get(id);
    assert.equal(question.format, "order", id);
    assert.ok(question.tokens.every((token) => token.trim() && !/\s/u.test(token)), id);
    assert.equal(question.tokens.join(" "), question.answer, id);
  }
  assert.equal(byId.get("ch15-range-quiz-order-leaning").answer.includes("with"), false);
  assert.match(byId.get("ch15-range-quiz-order-eyes-closed").answer, /with his eyes closed/u);

  const ch15Cards = data.ENGLISH_VOCAB.filter((card) => card.unit === "ch15");
  for (const term of ["intersection", "involve"]) {
    const card = ch15Cards.find((candidate) => candidate.en === term);
    assert.ok(card, term);
    assert.ok(card.note.length >= 40, `${term}: origin note`);
  }

  for (const prepId of ["ch15-prep-2", "ch15-prep-3", "ch15-prep-4"]) {
    assert.match(byId.get(prepId).reference?.label ?? "", /範囲補足小テスト/u, prepId);
  }

  const serialized = JSON.stringify(QUIZ_IDS.map((id) => byId.get(id)));
  assert.doesNotMatch(serialized, /Chapter 19|What's new\?|What’s new\?/iu);
});

test("Chapter 15 supplemental quiz reaches mock, rapid, ranking, and comprehensive pools", async (context) => {
  const server = await withServer(context);
  const [expected, rapid, ranking] = await Promise.all([
    server.ssrLoadModule("/app/english-expected-exams-data.ts"),
    server.ssrLoadModule("/app/rapid-quiz-data.ts"),
    server.ssrLoadModule("/app/official-ranking-questions.ts"),
  ]);
  assert.match(expected.ENGLISH_EXPECTED_SOURCE_POLICY, /Chapter 15範囲補足小テスト/u);
  assert.match(expected.ENGLISH_EXPECTED_SOURCE_POLICY, /形式だけ/u);

  const printIds = new Set(expected.ENGLISH_PRINT_LEVEL_QUESTIONS.map((question) => question.id));
  const rapidPool = rapid.getStaticRapidPool("subject-2");
  const eligible = rapid.getOfficialRankingEligiblePool("subject-2");
  const comprehensive = rapid.getComprehensiveRapidPool("subject-2");
  const official = ranking.getOfficialRankingQuestions("subject-2");

  for (const sourceId of QUIZ_IDS) {
    assert.ok(printIds.has(`exam-level-source-${sourceId}`), `${sourceId}: print-level`);
    for (const [label, pool] of [
      ["rapid", rapidPool],
      ["ranking eligible", eligible],
      ["comprehensive", comprehensive],
      ["official ranking", official],
    ]) {
      const question = pool.find((candidate) => candidate.id.endsWith(sourceId));
      assert.ok(question, `${sourceId}: ${label}`);
      assert.equal(question.options.length, 4, `${sourceId}: ${label}: choices`);
      assert.ok(
        question.options.some((option) => question.acceptedOptions.includes(option)),
        `${sourceId}: ${label}: correct choice`,
      );
      assert.ok(question.reference?.quote?.trim(), `${sourceId}: ${label}: reference`);
    }
  }
});
