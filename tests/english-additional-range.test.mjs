import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTIVE_UNITS = ["ch14", "ch15", "ch16", "ch18", "toeic", "housing", "medical"];
const EXCLUDED_MARKERS = ["What's new?", "What’s new?"];

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

test("English additional-range transcription and counts match the supplied sheets", async (context) => {
  const server = await withServer(context);
  const data = await server.ssrLoadModule("/app/english-data.ts");

  assert.deepEqual(data.ENGLISH_UNITS.map((unit) => unit.id), ACTIVE_UNITS);
  assert.equal(data.ENGLISH_PASSAGES.length, 6);
  assert.equal(data.ENGLISH_VOCAB.length, 171);
  assert.equal(data.ENGLISH_QUESTIONS.length, 520);

  const battery = data.ENGLISH_PASSAGES.find((passage) => passage.id === "passage-big-battery");
  assert.ok(battery);
  assert.equal(battery.paragraphs.length, 10);
  assert.equal(
    battery.paragraphs[0].en,
    "Japan will build the world's largest storage battery system in Hokkaido as early as autumn of 2013 in a bid to rectify fluctuations in the electricity produced by renewable energy sources.",
  );
  assert.equal(
    battery.paragraphs[4].en,
    "Sumitomo Electric Industries Ltd. and Hokkaido Electric Power Co. are leading the storage project, and the ministry has provided ¥20 billion to cover all development and manufacturing costs.",
  );
  assert.equal(battery.paragraphs[6].en, "With a capacity of 60,000 kWh, the system will be as high as a six-story building.");
  assert.equal(
    battery.paragraphs[9].en,
    "The ministry believes that using such batteries will allow utilities to buy 10 percent more electricity from green energy sources.",
  );

  const trueFalse = data.ENGLISH_QUESTIONS.filter((question) => question.id.startsWith("ch14-tf-"));
  assert.deepEqual(trueFalse.map((question) => question.answer), ["F", "T", "T", "F", "T"]);
  assert.deepEqual(trueFalse.map((question) => question.id), ["ch14-tf-1", "ch14-tf-2", "ch14-tf-3", "ch14-tf-4", "ch14-tf-5"]);

  const summaries = data.ENGLISH_QUESTIONS.filter((question) => question.id.startsWith("ch14-summary-"));
  assert.equal(summaries.length, 4);
  assert.deepEqual(summaries.map((question) => question.answer), ["world's", "government's", "Hokkaido's", "system's"]);
  assert.equal(summaries[2].prompt.startsWith("The "), false, "Hokkaido's must not become the ungrammatical 'The Hokkaido's'");

  const answers = new Map(data.ENGLISH_QUESTIONS.map((question) => [question.id, question.answer]));
  assert.deepEqual(
    ["toeic-part5-104", "toeic-part5-105", "toeic-part5-106"].map((id) => answers.get(id)),
    ["closed", "is recognized", "presentation"],
  );
  assert.deepEqual(
    ["toeic-keller-181", "toeic-keller-182", "toeic-keller-183", "toeic-keller-184", "toeic-keller-185"].map((id) => answers.get(id)),
    ["Shoes to match a suit", "basic", "To praise her company's customer service", "He paid $50 for delivery", "It arrived at the wrong address."],
  );
  assert.deepEqual(
    ["toeic-eston-135", "toeic-eston-136", "toeic-eston-137", "toeic-eston-138"].map((id) => answers.get(id)),
    ["tradition", "It", "You will need only one device per team.", "Afterward"],
  );
  assert.deepEqual(
    data.ENGLISH_QUESTIONS.find((question) => question.id === "toeic-eston-137").options,
    ["The park map is very detailed.", "City hall was built 75 years ago.", "You will need only one device per team.", "Feedback from participants would be helpful."],
  );

  assert.deepEqual(
    ["ch16-extra-map", "ch16-extra-surface", "ch16-extra-narrow"].map((id) => answers.get(id)),
    ["mapped", "surface", "narrow"],
  );
  assert.equal(data.ENGLISH_QUESTIONS.filter((question) => question.group === "語順整序｜追加範囲例文").length, 17);

  const housing = data.ENGLISH_VOCAB.filter((card) => card.unit === "housing").map((card) => card.en);
  const medical = data.ENGLISH_VOCAB.filter((card) => card.unit === "medical").map((card) => card.en);
  assert.deepEqual(housing, ["affordable", "comfort", "condominium", "to decorate", "fully equipped", "to furnish", "furthermore", "household goods", "landlord", "lease", "microwave oven", "mortgage", "rent", "suburban", "tenant"]);
  assert.deepEqual(medical, ["accommodation", "ambulance", "blood pressure", "confidentiality", "to disclose", "to donate", "duty", "evaluation", "inpatient", "to investigate", "to misuse", "occupational therapy", "outpatient", "surgery", "temperature"]);
  assert.ok(data.ENGLISH_VOCAB.filter((card) => card.unit === "housing" || card.unit === "medical").every((card) => card.note?.length >= 20));

  for (const [label, items] of [["vocab", data.ENGLISH_VOCAB], ["passages", data.ENGLISH_PASSAGES], ["questions", data.ENGLISH_QUESTIONS]]) {
    assert.equal(items.some((item) => item.unit === "ch19" || item.unit === "exam-sample"), false, label);
    const serialized = JSON.stringify(items);
    for (const marker of EXCLUDED_MARKERS) assert.equal(serialized.includes(marker), false, `${label}:${marker}`);
  }
  for (const marker of EXCLUDED_MARKERS) {
    assert.equal(data.isEnglishPoolItemInScope({ unit: "ch14", prompt: marker }), false);
  }
  assert.equal(data.isEnglishPoolItemInScope({ unit: "ch19", prompt: "synthetic" }), false);
});

test("additional English range reaches generated, mock, rapid, and official ranking paths", async (context) => {
  const server = await withServer(context);
  const [engine, expected, rapid, rankingIds, rankingQuestions] = await Promise.all([
    server.ssrLoadModule("/app/generated-practice-engine.ts"),
    server.ssrLoadModule("/app/english-expected-exams-data.ts"),
    server.ssrLoadModule("/app/rapid-quiz-data.ts"),
    server.ssrLoadModule("/app/official-ranking-question-ids.ts"),
    server.ssrLoadModule("/app/official-ranking-questions.ts"),
  ]);

  const generatedChapters = new Set();
  for (let seed = 0; seed < 600; seed += 1) {
    const question = engine.generatePracticeQuestion("subject-2", `additional-range:${seed}`);
    generatedChapters.add(question.source.chapter);
    const serialized = JSON.stringify(question);
    assert.doesNotMatch(serialized, /ch19|Chapter 19|What's new\?|What’s new\?/iu);
  }
  assert.deepEqual(generatedChapters, new Set(["ch14", "ch15", "ch16", "ch18"]));

  assert.equal(expected.ENGLISH_EXPECTED_EXAMS.length, 6);
  for (const exam of expected.ENGLISH_EXPECTED_EXAMS) {
    const units = new Set(exam.questions.map((question) => question.unit));
    assert.ok(units.has("ch14"), `${exam.id}:ch14`);
    assert.ok(units.has("toeic"), `${exam.id}:toeic`);
    assert.ok(units.has("housing") || units.has("medical"), `${exam.id}:topical vocabulary`);
    assert.ok(exam.questions.filter((question) => question.unit === "toeic" && question.section === "reading").every((question) => question.reference.quote));
  }
  assert.deepEqual(
    new Set(expected.ENGLISH_EXPECTED_EXAMS.flatMap((exam) => exam.questions.map((question) => question.unit))),
    new Set(ACTIVE_UNITS),
  );

  const rapidPool = rapid.getStaticRapidPool("subject-2");
  const eligible = rapid.getOfficialRankingEligiblePool("subject-2");
  const rapidIds = new Set(rapidPool.map((question) => question.id));
  const eligibleIds = new Set(eligible.map((question) => question.id));
  for (const id of [
    "rapid-exam-ch14-tf-1",
    "rapid-exam-ch14-summary-1",
    "rapid-exam-toeic-keller-181",
    "rapid-exam-toeic-eston-135",
    "rapid-exam-question-ev-199",
    "rapid-exam-question-ev-214",
  ]) {
    assert.ok(rapidIds.has(id), `${id}:rapid`);
    assert.ok(eligibleIds.has(id), `${id}:ranking eligible`);
  }

  const fixedEnglishIds = rankingIds.OFFICIAL_RANKING_QUESTION_IDS["subject-2"];
  assert.equal(fixedEnglishIds.length, 20);
  assert.ok(fixedEnglishIds.includes("rapid-exam-question-ev-199"), "Housing fixed ranking item");
  assert.ok(fixedEnglishIds.includes("rapid-exam-question-ev-214"), "Medical fixed ranking item");
  for (const id of fixedEnglishIds) assert.ok(eligibleIds.has(id), `${id}:fixed ranking id must exist`);

  const official = rankingQuestions.getOfficialRankingQuestions("subject-2");
  assert.ok(official.some((question) => question.id === "rapid-exam-ch14-tf-1"));
  assert.ok(official.some((question) => question.id === "rapid-exam-toeic-keller-181"));
  assert.ok(official.some((question) => question.id === "rapid-exam-question-ev-199"));
  assert.ok(official.some((question) => question.id === "rapid-exam-question-ev-214"));
});

test("Ch14 summary and TOEIC choices use source-specific option analysis", async (context) => {
  const server = await withServer(context);
  const [data, reading] = await Promise.all([
    server.ssrLoadModule("/app/english-data.ts"),
    server.ssrLoadModule("/app/english-explanations-reading.ts"),
  ]);
  const ids = [
    "ch14-summary-1", "ch14-summary-2", "ch14-summary-3", "ch14-summary-4",
    "toeic-keller-181", "toeic-keller-182", "toeic-keller-183", "toeic-keller-184", "toeic-keller-185",
    "toeic-eston-135", "toeic-eston-136", "toeic-eston-137", "toeic-eston-138",
  ];
  for (const id of ids) {
    const question = data.ENGLISH_QUESTIONS.find((candidate) => candidate.id === id);
    const explanation = reading.ENGLISH_READING_EXPLANATIONS[id];
    assert.ok(question && explanation, id);
    assert.deepEqual(new Set(explanation.optionAnalysis.map((item) => item.option)), new Set(question.options), id);
    for (const item of explanation.optionAnalysis) {
      assert.ok(item.reason.length >= 20, `${id}:${item.option}`);
      assert.doesNotMatch(item.reason, /いずれかと一致せず/u, `${id}:${item.option} must be source-specific`);
    }
  }
});
