import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = new URL("../app/", import.meta.url);
const read = (path) => readFile(new URL(path, app), "utf8");

test("uses exam-level non-generated questions in rapid and comprehensive pools", async () => {
  const [rapid, drill, overall] = await Promise.all([
    read("rapid-quiz-data.ts"),
    read("rapid-answer-drill.tsx"),
    read("comprehensive-challenge.tsx"),
  ]);

  for (const source of [
    "ENGLISH_EXAM_LEVEL_QUESTIONS",
    "MECHANICAL_DYNAMICS_EXAM_LEVEL_QUESTIONS",
    "THERMODYNAMICS_EXAM_LEVEL_QUESTIONS",
    "MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS",
    "SMART_CONTROL_EXAM_LEVEL_QUESTIONS",
    "TEXTBOOK_RESPONSE_EXAM_LEVEL_QUESTIONS",
    "STATISTICS_EXAM_LEVEL_QUESTIONS",
    "APPLIED_MATH_EXAM_LEVEL_QUESTIONS",
    "DIGITAL_CIRCUIT_EXAM_LEVEL_QUESTIONS",
  ]) assert.match(rapid, new RegExp(source));

  for (const cardSource of [
    "MECHANICAL_DYNAMICS_FORMULAS",
    "THERMODYNAMICS_FORMULAS",
    "MATERIAL_MECHANICS_FORMULAS",
    "SMART_CONTROL_CARDS",
    "TEXTBOOK_RESPONSE_CARDS",
    "STATISTICS_FORMULAS",
    "APPLIED_MATH_FORMULAS",
    "DIGITAL_CIRCUIT_ALL_FORMULAS",
  ]) assert.match(rapid, new RegExp(cardSource));

  assert.match(rapid, /const COMPREHENSIVE_POOLS/);
  assert.match(rapid, /getComprehensiveRapidPool/);
  assert.match(rapid, /function formulaCardPool/);
  assert.match(rapid, /rapid-card-\$\{card\.id\}/);
  assert.match(rapid, /暗記・公式カード/);
  assert.match(rapid, /Σを使わない形/);
  assert.match(rapid, /\(question\.difficulty \?\? 1\) >= 2/);
  assert.match(rapid, /recommendedSeconds: subjectId === "subject-2" \? 60 : 90/);
  assert.match(rapid, /sourceBasis:/);
  assert.match(rapid, /network:[\s\S]*networkCardsToRapid/);
  assert.doesNotMatch(rapid, /generated-practice-engine|generated-practice-history/);

  assert.match(drill, /defaultLimitSeconds = subjectId === "network" \? 8/);
  assert.match(drill, /Math\.min\(300/);
  assert.match(drill, /currentQuestion\.steps\.map/);
  assert.match(overall, /getComprehensiveRapidPool/);
  assert.match(overall, /useState\(90\)/);
  assert.match(overall, /非生成問題/);
  assert.match(overall, /currentQuestion\.steps\.map/);
  assert.doesNotMatch(overall, /getStaticRapidPool/);
});
test("adds both subjects' formula and review cards to global search", async () => {
  const search = await read("card-search.tsx");

  assert.match(search, /MATERIAL_MECHANICS_QUESTIONS/);
  assert.match(search, /DIGITAL_CIRCUIT_ALL_QUESTIONS/);
  assert.match(search, /reviewQuestionsToCards\("subject-5", MATERIAL_MECHANICS_QUESTIONS\)/);
  assert.match(search, /reviewQuestionsToCards\("subject-9", DIGITAL_CIRCUIT_ALL_QUESTIONS\)/);
  assert.doesNotMatch(search, /cardsStorageKey|normalizeStudyCards|studyCardsToRapid/);
});

test("reports real home progress and migrates saved placeholder memos", async () => {
  const [home, data] = await Promise.all([read("page.tsx"), read("study-data.ts")]);

  assert.match(home, /MATERIAL_MECHANICS_FORMULAS\.length/);
  assert.match(home, /DIGITAL_CIRCUIT_ALL_FORMULAS\.length/);
  assert.match(home, /progressStorageKey\("subject-5"\)/);
  assert.match(home, /progressStorageKey\("subject-9"\)/);
  const generatedSet = home.match(/GENERATED_PRACTICE_SUBJECT_IDS[\s\S]*?\]\);/)?.[0] ?? "";
  assert.match(generatedSet, /"subject-5"/);
  assert.match(generatedSet, /"subject-9"/);
  assert.doesNotMatch(home, /cardsStorageKey|normalizeStudyCards|normalizeStudyProgress/);

  assert.match(data, /wasOldMaterialMechanicsPlaceholder/);
  assert.match(data, /wasOldDigitalCircuitsPlaceholder/);
  assert.match(data, /範囲ZIP9枚/);
  assert.match(data, /追加範囲PDF7ページ/);
});