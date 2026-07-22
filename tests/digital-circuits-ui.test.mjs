import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const urls = {
  page: new URL("../app/subjects/subject-9/page.tsx", import.meta.url),
  legacyRapid: new URL("../app/subjects/subject-9/rapid/page.tsx", import.meta.url),
  sharedRapid: new URL("../app/rapid-answer-drill.tsx", import.meta.url),
  rapidVisual: new URL("../app/rapid-question-visual.tsx", import.meta.url),
  rankingRoute: new URL("../app/ranking/[subjectId]/page.tsx", import.meta.url),
  expected: new URL("../app/digital-circuits-expected-exams.tsx", import.meta.url),
  diagrams: new URL("../app/digital-circuits-diagrams.tsx", import.meta.url),
  extraDiagrams: new URL("../app/digital-circuits-extra-diagrams.tsx", import.meta.url),
  css: new URL("../app/digital-circuits.module.css", import.meta.url),
};

test("subject 9 exposes its study modes plus separate shared practice and official ranking routes", async () => {
  const [page, legacyRapid, sharedRapid, rankingRoute, expected] = await Promise.all([
    readFile(urls.page, "utf8"), readFile(urls.legacyRapid, "utf8"), readFile(urls.sharedRapid, "utf8"),
    readFile(urls.rankingRoute, "utf8"), readFile(urls.expected, "utf8"),
  ]);
  for (const label of ["暗記帳", "通常演習", "その場で生成", "ランダム模試", "A4予想試験", "形式ガイド"]) assert.match(page, new RegExp(label));
  assert.match(page, /href="\/rapid\/subject-9"/);
  assert.match(page, /href="\/ranking\/subject-9"/);
  assert.match(page, /cardQuery/);
  assert.match(page, /fuzzyMatch/);
  assert.match(page, /localStorage/);
  assert.match(page, /中断・保存/);
  assert.match(page, /resumeTest/);
  assert.match(page, /全問を一覧で振り返り/);
  assert.match(page, /generateDigitalCircuitQuestion/);
  assert.match(page, /generateDigitalCircuitExtraQuestion/);
  assert.match(page, /解答・途中手順・出典が作れない問題は生成しません/);

  assert.match(legacyRapid, /redirect\("\/rapid\/subject-9"\)/);
  assert.doesNotMatch(legacyRapid, /ランキング|RANK_KEY|localStorage/);
  assert.match(sharedRapid, /問題数と1問の秒数を自由に変えられる練習モード/);
  assert.match(sharedRapid, /連続正解/);
  assert.doesNotMatch(sharedRapid, /publishRapidScore|RapidLeaderboard/);
  assert.match(rankingRoute, /OfficialRankingTest/);

  assert.match(expected, /practiceMinutesDraft/);
  assert.match(expected, /公式時間未確認/);
  assert.match(expected, /練習初期値/);
  assert.match(expected, /中断して保存/);
  assert.match(expected, /保存位置から再開/);
  assert.match(expected, /window\.print\(\)/);
});

test("all problem surfaces render a blank linked diagram and solution surfaces opt into solution overlays", async () => {
  const [page, sharedRapid, rapidVisual, expected, diagrams, extraDiagrams] = await Promise.all([
    readFile(urls.page, "utf8"), readFile(urls.sharedRapid, "utf8"), readFile(urls.rapidVisual, "utf8"),
    readFile(urls.expected, "utf8"), readFile(urls.diagrams, "utf8"), readFile(urls.extraDiagrams, "utf8"),
  ]);
  assert.match(page, /currentPractice\.diagram[\s\S]*DigitalCircuitStudyDiagram kind=\{currentPractice\.diagram\} title="問題図・解答記入欄"/);
  assert.match(page, /generated\.diagram[\s\S]*DigitalCircuitStudyDiagram kind=\{generated\.diagram\} title="生成問題の解答用図"/);
  assert.match(page, /currentTest\.diagram[\s\S]*DigitalCircuitStudyDiagram kind=\{currentTest\.diagram\} title="模試の解答用図"/);
  assert.match(page, /DigitalCircuitStudyDiagram kind=\{question\.diagram\} solution title="振り返り用模範図"/);
  assert.match(expected, /DigitalCircuitStudyDiagram kind=\{question\.diagram\} title="解答用図"/);
  assert.match(expected, /DigitalCircuitStudyDiagram kind=\{question\.diagram\} solution title="模範図・読み方"/);

  assert.match(sharedRapid, /RapidQuestionVisual visual=\{currentQuestion\.visual\} solution=\{state\.phase === "feedback"\}/);
  assert.match(sharedRapid, /RapidQuestionVisual visual=\{result\.question\.visual\} solution compact/);
  assert.match(rapidVisual, /visual\.type === "digital-circuit"/);
  assert.match(rapidVisual, /DigitalCircuitStudyDiagram kind=\{visual\.kind\} solution=\{solution\} title=\{title\} compact=\{compact\}/);

  for (const kind of ["and-timing", "or-timing", "sr-latch", "d-ff", "jk-ff", "parallel-register", "ripple-up", "ripple-down", "sync-counter", "mealy", "moore", "state-analysis"]) assert.match(diagrams, new RegExp(kind));
  for (const wiring of ["J0=K0=1", "J1=K1=Q0", "J2=K2=Q0Q1", "共通CLK"]) assert.match(diagrams, new RegExp(wiring));
  assert.match(diagrams, /汎用記入図：具体的なAB列は問題文を使用/);
  assert.match(diagrams, /汎用解析図：具体的な論理式は問題文を使用/);
  for (const kind of ["xor-timing", "three-jk-ripple", "cyclic-down-10-2", "exercise3-sequential", "past-state-machine", "sequence-detector-1001", "sequence-detector-101", "sequence-detector-1011", "sequence-design-workflow"]) assert.match(extraDiagrams, new RegExp(kind));
  assert.match(diagrams, /solution\s*\?/);
  assert.match(extraDiagrams, /solution\s*\?/);
  assert.match(diagrams, /問題文のABを転記して、各区間のYを求める/);
  assert.match(extraDiagrams, /各枝へ I\/O を記入/);
});

test("A4 print and mobile layout are explicit in the dedicated stylesheet", async () => {
  const css = await readFile(urls.css, "utf8");
  assert.match(css, /@page\{size:A4 portrait/);
  assert.match(css, /width:min\(210mm,100%\)/);
  assert.match(css, /min-height:297mm/);
  assert.match(css, /@media\(max-width:820px\)/);
  assert.match(css, /@media\(max-width:540px\)/);
  assert.match(css, /overflow-x:auto/);
  assert.match(css, /@media print/);
});

test("subject-9 study implementation remains dedicated while timed modes use shared routes", async () => {
  const page = await readFile(urls.page, "utf8");
  assert.doesNotMatch(page, /study-data|rapid-quiz-data|generated-practice-engine/);
  assert.match(page, /digital-circuits-data/);
  assert.match(page, /digital-circuits-extra-data/);
  assert.match(page, /digital-circuits-generator/);
  assert.match(page, /href="\/rapid\/subject-9"/);
  assert.match(page, /href="\/ranking\/subject-9"/);
});
