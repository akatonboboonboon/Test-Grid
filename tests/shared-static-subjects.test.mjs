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
    "ENGLISH_CH18_ACTUAL_QUIZ_QUESTIONS",
    "MECHANICAL_DYNAMICS_PRINT_LEVEL_QUESTIONS",
    "THERMODYNAMICS_EXAM_LEVEL_QUESTIONS",
    "MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS",
    "SMART_CONTROL_EXAM_LEVEL_QUESTIONS",
    "TEXTBOOK_RESPONSE_EXAM_LEVEL_QUESTIONS",
    "STATISTICS_EXAM_LEVEL_QUESTIONS",
    "APPLIED_MATH_EXAM_LEVEL_QUESTIONS",
    "DIGITAL_CIRCUIT_EXAM_LEVEL_QUESTIONS",
  ]) assert.match(rapid, new RegExp(source));

  for (const cardSource of [
    "THERMODYNAMICS_FORMULAS",
    "MATERIAL_MECHANICS_FORMULAS",
    "SMART_CONTROL_CARDS",
    "TEXTBOOK_RESPONSE_CARDS",
    "STATISTICS_FORMULAS",
    "APPLIED_MATH_FORMULAS",
    "DIGITAL_CIRCUIT_ALL_FORMULAS",
  ]) assert.match(rapid, new RegExp(cardSource));

  assert.match(rapid, /const COMPREHENSIVE_POOLS/);
  assert.match(rapid, /COMPREHENSIVE_QUESTIONS_PER_SUBJECT = 546/);
  assert.match(rapid, /COMPREHENSIVE_MAX_QUESTIONS = 9 \* COMPREHENSIVE_QUESTIONS_PER_SUBJECT/);
  assert.match(rapid, /count > COMPREHENSIVE_MAX_QUESTIONS/);
  assert.match(rapid, /Math\.min\(COMPREHENSIVE_MAX_QUESTIONS/);
  assert.match(rapid, /getComprehensiveRapidPool/);
  assert.match(rapid, /function formulaCardPool/);
  assert.match(rapid, /rapid-card-\$\{card\.id\}/);
  assert.match(rapid, /暗記・公式カード/);
  assert.match(rapid, /Σを使わない形/);
  assert.match(rapid, /\(question\.difficulty \?\? 1\) >= 2/);
  assert.match(rapid, /recommendedSeconds: subjectId === "subject-2" \? 60 : 90/);
  assert.match(rapid, /sourceBasis:/);
  assert.match(rapid, /const MECHANICAL_RAPID = examLevelPool\([\s\S]*?MECHANICAL_DYNAMICS_PRINT_LEVEL_QUESTIONS,[\s\S]*?question\.difficulty === 3/);
  assert.match(rapid, /"subject-3": examLevelPool\([\s\S]*?MECHANICAL_DYNAMICS_PRINT_LEVEL_QUESTIONS,[\s\S]*?question\.difficulty === 3/);
  assert.doesNotMatch(rapid, /MECHANICAL_DYNAMICS_ACTUAL_PRACTICE_QUESTIONS|MECHANICAL_DYNAMICS_QUESTIONS/);
  assert.doesNotMatch(rapid, /formulaCardPool\("subject-3"|MECHANICAL_DYNAMICS_FORMULAS/);
  assert.match(rapid, /function mechanicalRapidDistractors/);
  assert.match(rapid, /numeric \* 2 \* Math\.PI/);
  assert.match(rapid, /numeric \* Math\.SQRT2/);
  assert.doesNotMatch(rapid, /numeric \* 0\.95|numeric \* 1\.05|numeric \* 1\.1/);
  assert.match(rapid, /const THERMODYNAMICS_RAPID = examLevelPool\([\s\S]*?\[\.\.\.THERMODYNAMICS_QUESTIONS, \.\.\.THERMODYNAMICS_EXAM_LEVEL_QUESTIONS\]/);
  assert.match(rapid, /const STATISTICS_RAPID = examLevelPool\([\s\S]*?\[\.\.\.STATISTICS_QUESTIONS, \.\.\.STATISTICS_EXAM_LEVEL_QUESTIONS\]/);
  assert.match(rapid, /getOfficialRankingEligiblePool\([\s\S]*?getStaticRapidPool\(subjectId\)\.filter\(isRankingEligibleRapidQuestion\)/);
  assert.match(rapid, /"subject-4": combineRapidPools\([\s\S]*?formulaCardPool\("subject-4", THERMODYNAMICS_FORMULAS/);
  assert.match(rapid, /"subject-7": combineRapidPools\([\s\S]*?formulaCardPool\("subject-7", STATISTICS_FORMULAS/);
  assert.match(rapid, /追加p\.8〜9の冷凍サイクル・逆カルノーCOP/);
  assert.match(rapid, /追加範囲5ページ（チェビシェフの不等式を含む）/);
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