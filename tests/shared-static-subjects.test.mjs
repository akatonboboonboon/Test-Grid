import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = new URL("../app/", import.meta.url);
const read = (path) => readFile(new URL(path, app), "utf8");

test("routes every subject through its print-level non-generated pool", async () => {
  const [rapid, drill, overall] = await Promise.all([
    read("rapid-quiz-data.ts"),
    read("rapid-answer-drill.tsx"),
    read("comprehensive-challenge.tsx"),
  ]);

  for (const source of [
    "ENGLISH_PRINT_LEVEL_QUESTIONS",
    "NETWORK_EXAM_LEVEL_QUESTIONS",
    "MECHANICAL_DYNAMICS_PRINT_LEVEL_QUESTIONS",
    "THERMODYNAMICS_PRINT_LEVEL_QUESTIONS",
    "MATERIAL_MECHANICS_PRINT_LEVEL_QUESTIONS",
    "SMART_CONTROL_PRINT_LEVEL_QUESTIONS",
    "STATISTICS_PRINT_LEVEL_QUESTIONS",
    "APPLIED_MATH_PRINT_LEVEL_QUESTIONS",
    "DIGITAL_CIRCUIT_PRINT_LEVEL_QUESTIONS",
  ]) assert.match(rapid, new RegExp(source), source);

  for (const staleSource of [
    "THERMODYNAMICS_EXAM_LEVEL_QUESTIONS",
    "MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS",
    "SMART_CONTROL_EXAM_LEVEL_QUESTIONS",
    "TEXTBOOK_RESPONSE_EXAM_LEVEL_QUESTIONS",
    "APPLIED_MATH_EXAM_LEVEL_QUESTIONS",
    "DIGITAL_CIRCUIT_EXAM_LEVEL_QUESTIONS",
    "THERMODYNAMICS_FORMULAS",
    "MATERIAL_MECHANICS_FORMULAS",
    "SMART_CONTROL_CARDS",
    "TEXTBOOK_RESPONSE_CARDS",
    "DIGITAL_CIRCUIT_ALL_FORMULAS",
  ]) assert.doesNotMatch(rapid, new RegExp(staleSource), staleSource);

  for (const [constant, source] of [
    ["ENGLISH_RAPID", "ENGLISH_PRINT_LEVEL_QUESTIONS"],
    ["NETWORK_RAPID", "NETWORK_EXAM_LEVEL_QUESTIONS"],
    ["MECHANICAL_RAPID", "MECHANICAL_DYNAMICS_PRINT_LEVEL_QUESTIONS"],
    ["THERMODYNAMICS_RAPID", "THERMODYNAMICS_PRINT_LEVEL_QUESTIONS"],
    ["MATERIAL_MECHANICS_RAPID", "MATERIAL_MECHANICS_PRINT_LEVEL_QUESTIONS"],
    ["SMART_CONTROL_RAPID", "SMART_CONTROL_PRINT_LEVEL_QUESTIONS"],
    ["STATISTICS_RAPID", "STATISTICS_PRINT_LEVEL_QUESTIONS"],
    ["APPLIED_MATH_RAPID", "APPLIED_MATH_PRINT_LEVEL_QUESTIONS"],
    ["DIGITAL_CIRCUITS_RAPID", "DIGITAL_CIRCUIT_PRINT_LEVEL_QUESTIONS"],
  ]) {
    const start = rapid.indexOf("const " + constant + " = examLevelPool");
    assert.ok(start >= 0, constant);
    assert.ok(rapid.slice(start, start + 260).includes(source), constant + " source");
  }

  assert.ok(rapid.includes("const COMPREHENSIVE_POOLS"));
  assert.ok(rapid.includes("ENGLISH_CH18_ACTUAL_QUIZ_QUESTIONS"));
  assert.ok(rapid.includes("network: NETWORK_RAPID"));
  assert.equal(rapid.includes("network: networkCardsToRapid"), false);
  assert.equal(rapid.includes("networkCardsToRapid(DEFAULT_CARDS)"), false);
  assert.equal(rapid.includes("function formulaCardPool"), false);
  assert.equal(rapid.includes("rapid-card-"), false);
  assert.equal(rapid.includes("combineRapidPools"), false);
  assert.equal(rapid.includes("generated-practice-engine"), false);
  assert.equal(rapid.includes("generated-practice-history"), false);

  assert.ok(rapid.includes("COMPREHENSIVE_QUESTIONS_PER_SUBJECT = 546"));
  assert.ok(rapid.includes("COMPREHENSIVE_MAX_QUESTIONS = 9 * COMPREHENSIVE_QUESTIONS_PER_SUBJECT"));
  assert.ok(rapid.includes("const EXAM_LEVEL_SECONDS: Record<SubjectId, number>"));
  for (const seconds of [
    '"subject-2": 90',
    "network: 90",
    '"subject-3": 300',
    '"subject-4": 300',
    '"subject-5": 300',
    '"subject-6": 240',
    '"subject-7": 240',
    '"subject-8": 300',
    '"subject-9": 240',
  ]) assert.ok(rapid.includes(seconds), seconds);
  assert.ok(rapid.includes("function mechanicalRapidDistractors"));
  assert.ok(rapid.includes("function subjectRapidDistractors"));
  for (const staleNumeric of ["numeric * 0.95", "numeric * 1.05", "numeric * 1.1"]) {
    assert.equal(rapid.includes(staleNumeric), false, staleNumeric);
  }
  assert.ok(rapid.includes("getStaticRapidPool(subjectId).filter(isRankingEligibleRapidQuestion)"));

  assert.ok(drill.includes('defaultLimitSeconds = subjectId === "network" ? 8'));
  assert.ok(drill.includes("currentQuestion.steps.map"));
  assert.ok(overall.includes("getComprehensiveRapidPool"));
  for (const staleOverall of ["networkCardsToRapid", "DEFAULT_CARDS", "normalizeCards", "storageRead", "getStaticRapidPool"]) {
    assert.equal(overall.includes(staleOverall), false, staleOverall);
  }
  assert.ok(overall.includes("非生成問題"));
  assert.ok(overall.includes("currentQuestion.steps.map"));
});
test("adds reversed-Carnot COP and unit conversion to the thermodynamics essentials", async () => {
  const [essentials, catalog] = await Promise.all([
    read("essentials-engineering-data.ts"),
    read("essentials-catalog.ts"),
  ]);
  assert.match(essentials, /id: "thermo-reversed-carnot-cop"/);
  assert.match(essentials, /Q_H=Q_L\+W/);
  assert.match(essentials, /\\\\mathrm\{COP\}_R/);
  assert.match(essentials, /\\\\mathrm\{COP\}_\{HP\}/);
  assert.match(essentials, /\\\\frac\{4\.19\}\{3600\}/);
  assert.match(catalog, /冷凍機COP/);
});
test("adds both subjects' formula and review cards to global search", async () => {
  const search = await read("card-search.tsx");

  assert.match(search, /MATERIAL_MECHANICS_QUESTIONS/);
  assert.match(search, /DIGITAL_CIRCUIT_ALL_QUESTIONS/);
  assert.match(search, /reviewQuestionsToCards\("subject-5", MATERIAL_MECHANICS_QUESTIONS\)/);
  assert.match(search, /reviewQuestionsToCards\("subject-9", DIGITAL_CIRCUIT_ALL_QUESTIONS\)/);
  assert.match(search, /THERMODYNAMICS_FORMULAS/);
  assert.match(search, /STATISTICS_FORMULAS/);
  assert.match(search, /formulaCardsToSearchCards\("subject-4", THERMODYNAMICS_FORMULAS/);
  assert.match(search, /formulaCardsToSearchCards\("subject-7", STATISTICS_FORMULAS/);
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
  assert.match(data, /範囲ZIP13ページ/);
  assert.match(data, /追加範囲PDF7ページ/);
});