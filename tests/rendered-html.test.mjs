import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import { registerHooks } from "node:module";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);

// The production worker gets this virtual module from Cloudflare. Supplying an
// empty binding keeps server-render smoke tests local without faking any data.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "cloudflare:workers") {
      return {
        shortCircuit: true,
        url: "data:text/javascript,export const env = {};",
      };
    }
    return nextResolve(specifier, context);
  },
});

let englishDataModulePromise;
let statisticsDataModulePromise;

function loadEnglishDataModule() {
  englishDataModulePromise ??= readFile(new URL("../app/english-data.ts", import.meta.url), "utf8")
    .then((source) => ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText)
    .then((javascript) => import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`));
  return englishDataModulePromise;
}

function loadStatisticsDataModule() {
  statisticsDataModulePromise ??= readFile(new URL("../app/statistics-data.ts", import.meta.url), "utf8")
    .then((source) => ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText)
    .then((javascript) => import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`));
  return statisticsDataModulePromise;
}

void loadStatisticsDataModule;

function loadCombinedStatisticsDataModule() {
  return Promise.all([
    readFile(new URL("../app/statistics-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/statistics-pdf12-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/statistics-pdf34-data.ts", import.meta.url), "utf8"),
  ]).then(([mainSource, pdf12Source, pdf34Source]) => {
    const compile = (source) => ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    const toDataUrl = (javascript) => "data:text/javascript;base64," + Buffer.from(javascript).toString("base64");
    const pdf12Url = toDataUrl(compile(pdf12Source));
    const pdf34Url = toDataUrl(compile(pdf34Source));
    const mainJavascript = compile(mainSource)
      .replaceAll('"./statistics-pdf12-data"', JSON.stringify(pdf12Url))
      .replaceAll('"./statistics-pdf34-data"', JSON.stringify(pdf34Url));
    return import(toDataUrl(mainJavascript));
  });
}

async function render(path = "/", init = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const requestHeaders = new Headers(init.headers);
  if (!requestHeaders.has("accept")) requestHeaders.set("accept", "text/html");
  requestHeaders.set("host", "localhost");

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      ...init,
      headers: requestHeaders,
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the nine-subject study hub", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>TEST\/\/GRID/);
  assert.match(html, /9教科を/);
  assert.match(html, /科目別の勉強机/);
  assert.match(html, /ネットワークから始める/);
  assert.match(html, /暗記帳はここです/);
  assert.match(html, /英語/);
  assert.match(html, /機械力学/);
  assert.match(html, /材料力学/);
  assert.match(html, /デジタル回路/);
  assert.match(html, /http:\/\/localhost\/og-test-grid\.png/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("server-renders the preserved Layer Sum trainer", async () => {
  const response = await render("/subjects/network");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>ネットワーク専用ドリル \| TEST\/\/GRID/);
  assert.match(html, /①〜⑦の用語を/);
  assert.match(html, /96(?:<!-- -->)? CARDS/);
  assert.match(html, /フラッシュ暗算/);
  assert.match(html, /カードを編集/);
});

test("server-renders the memorization card page", async () => {
  const response = await render("/subjects/network/cards");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /暗記カード \| ネットワーク \| TEST\/\/GRID/);
  assert.match(html, /まず覚える/);
  assert.match(html, /タップして層と正式名称を確認/);
  assert.match(html, /WHAT IT DOES|FLIP TO LEARN/);
  assert.match(html, /未暗記だけ復習/);
});

test("server-renders the English exam lab", async () => {
  const response = await render("/subjects/subject-2");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /ENGLISH EXAM LAB/);
  assert.match(html, /暗記帳を開く/);
  assert.match(html, /模擬テスト/);
  assert.match(html, /長文読解/);
  assert.match(html, /Chapter 15|Ch\.15/);
  assert.match(html, /Chapter 19|Ch\.19/);
  assert.match(html, /MEMORY BOOK/);
});

test("server-renders the probability and statistics exam lab", async () => {
  const response = await render("/subjects/subject-7");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /確率統計・定期テスト演習/);
  assert.match(html, /PROBABILITY &amp; STATISTICS/);
  assert.match(html, /今回の試験範囲/);
  assert.match(html, /公式カード/);
  assert.match(html, /計算演習/);
  assert.match(html, /ランダム模試/);
  assert.match(html, /想定試験/);
  assert.match(html, /出題形式/);
  assert.match(html, /確率統計ZIPと「確率統計1〜4\.pdf」/);
});

test("keeps the study workspaces usable on phone-sized viewports", async () => {
  const response = await render("/subjects/subject-2");
  assert.equal(response.status, 200);

  const html = await response.text();
  const viewportMeta = html.match(/<meta[^>]*name="viewport"[^>]*>/i)?.[0] ?? "";
  assert.ok(viewportMeta, "the rendered page should declare a viewport");
  assert.match(viewportMeta, /width=device-width/i);
  assert.match(viewportMeta, /initial-scale=1/i);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const mobileStart = css.indexOf("/* Mobile hardening");
  assert.notEqual(mobileStart, -1, "mobile hardening rules should remain grouped and auditable");
  const mobileCss = css.slice(mobileStart);

  assert.match(mobileCss, /@media\s*\(max-width:\s*680px\)/);
  assert.match(mobileCss, /@media\s*\(max-width:\s*430px\)/);
  assert.match(mobileCss, /html,\s*body\s*\{[\s\S]*?overflow-x:\s*clip;/);
  assert.match(mobileCss, /\.topbar\s*\{[\s\S]*?height:\s*auto;[\s\S]*?min-height:\s*64px;/);
  assert.match(mobileCss, /\.app-frame\s+:is\(input,\s*select,\s*textarea\)\s*\{[\s\S]*?font-size:\s*16px;[\s\S]*?max-width:\s*100%;/);
  assert.match(mobileCss, /:where\(\.app-frame\)\s+button,[\s\S]*?min-height:\s*44px;/);
  assert.match(mobileCss, /touch-action:\s*manipulation;/);
  assert.match(mobileCss, /\.subject-dialog\s*\{[\s\S]*?max-height:\s*100dvh;/);
  assert.match(mobileCss, /\.editor-panel\s*\{[\s\S]*?min-height:\s*100dvh;/);
  assert.match(mobileCss, /\.english-order-line button,[\s\S]*?\.english-order-bank button\s*\{[\s\S]*?max-width:\s*100%;[\s\S]*?min-height:\s*44px;/);
});

test("separates long-passage memorization from answer practice", async () => {
  const englishPage = await readFile(new URL("../app/subjects/subject-2/page.tsx", import.meta.url), "utf8");

  assert.match(englishPage, /type ReadingStudyMode\s*=\s*"memory"\s*\|\s*"practice"/);
  assert.match(englishPage, /useState<ReadingStudyMode>\("memory"\)/);
  assert.match(englishPage, /暗記モード/);
  assert.match(englishPage, /実戦モード/);
  assert.match(englishPage, /question\.passageId\s*===\s*selectedPassageId/);
  assert.match(englishPage, /function submitReadingAnswer/);
  assert.match(englishPage, /onSubmit=\{submitReadingAnswer\}/);
  assert.match(englishPage, /readingFeedback/);
  assert.match(englishPage, /getQuestionExplanation\(readingQuestion\)/);
});

test("saves, pauses, resumes, and deletes an in-progress mock exam", async () => {
  const englishPage = await readFile(new URL("../app/subjects/subject-2/page.tsx", import.meta.url), "utf8");
  const savedShape = englishPage.match(/type SavedTestSession\s*=\s*\{([\s\S]*?)\n\};/)?.[1] ?? "";

  assert.match(englishPage, /test-grid:english-mock-test:v1/);
  for (const field of [
    "questionIds",
    "selectedGroups",
    "testIndex",
    "typedAnswer",
    "selectedChoice",
    "orderRemaining",
    "orderSelected",
    "feedback",
    "results",
    "elapsedSeconds",
  ]) {
    assert.match(savedShape, new RegExp(`\\b${field}\\??:`), `saved mock exam should retain ${field}`);
  }

  assert.match(englishPage, /function restoreTestSession/);
  assert.match(englishPage, /function saveTestSession/);
  assert.match(englishPage, /function resumeSavedTest/);
  assert.match(englishPage, /function deleteSavedTest/);
  assert.match(englishPage, /localStorage\.getItem\(TEST_SESSION_KEY\)/);
  assert.match(englishPage, /localStorage\.setItem\(TEST_SESSION_KEY/);
  assert.match(englishPage, /localStorage\.removeItem\(TEST_SESSION_KEY\)/);
  assert.match(englishPage, /中断して保存/);
  assert.match(englishPage, /続きから再開/);
  assert.match(englishPage, /保存データを削除/);
});

test("supports translation grading, explanations, genre filters, and the course-only corpus", async () => {
  const [englishPage, corpus] = await Promise.all([
    readFile(new URL("../app/subjects/subject-2/page.tsx", import.meta.url), "utf8"),
    loadEnglishDataModule(),
  ]);

  const { ENGLISH_PASSAGES, ENGLISH_QUESTIONS, ENGLISH_UNITS, ENGLISH_VOCAB } = corpus;
  for (const [label, items] of [
    ["units", ENGLISH_UNITS],
    ["vocabulary", ENGLISH_VOCAB],
    ["questions", ENGLISH_QUESTIONS],
  ]) {
    assert.equal(
      items.some((item) => (item.id ?? item.unit) === "exam-sample" || item.unit === "exam-sample"),
      false,
      `${label} should exclude questions and material copied from the sample PDF`,
    );
  }

  const translationQuestions = ENGLISH_QUESTIONS.filter((question) => question.format === "translation");
  const passageParagraphCount = ENGLISH_PASSAGES.reduce((total, passage) => total + passage.paragraphs.length, 0);
  assert.equal(translationQuestions.length, passageParagraphCount, "every passage paragraph should be available as translation practice");
  assert.ok(translationQuestions.every((question) => question.passageId && question.answer));

  assert.match(englishPage, /if \(question\.format === "translation"\)/);
  assert.match(englishPage, /normalizeJapanese/);
  assert.match(englishPage, /bigramSimilarity/);
  assert.match(englishPage, /japaneseKeywords/);
  assert.match(englishPage, /和訳入力/);
  assert.match(englishPage, /function getQuestionExplanation/);
  assert.match(englishPage, /getQuestionExplanation\(currentQuestion\)/);
  assert.match(englishPage, /意味は合っていた → 正解にする/);
  assert.doesNotMatch(englishPage, /currentQuestion\.explanation\s*&&/);

  assert.match(englishPage, /出題ジャンル（複数選択）/);
  assert.match(englishPage, /type="checkbox"/);
  assert.match(englishPage, /toggleTestGroup/);
  assert.match(englishPage, /selectedTestGroups\.includes\(questionGenre\(question\)\)/);
  assert.match(englishPage, /question\.group\.split\("｜", 1\)/);
  assert.match(englishPage, /すべて選択/);
});

test("uses English past exams only as a format guide", async () => {
  const englishPage = await readFile(new URL("../app/subjects/subject-2/page.tsx", import.meta.url), "utf8");
  for (const label of ["共通語群・複数空所", "イラスト○×・語形変化", "英文挿入", "複数正解・T/F", "長文の連続小問"]) {
    assert.match(englishPage, new RegExp(label));
  }
  assert.match(englishPage, /過去問は出題形式の分析専用/);
  assert.match(englishPage, /Chapter 15・16・18・19の教材だけ/);
});

test("keeps statistics course data separate from the sample tests and saves mock exams", async () => {
  const [statisticsPage, statisticsData, syncUi] = await Promise.all([
    readFile(new URL("../app/subjects/subject-7/page.tsx", import.meta.url), "utf8"),
    loadCombinedStatisticsDataModule(),
    readFile(new URL("../app/account-sync.tsx", import.meta.url), "utf8"),
  ]);

  const { STATISTICS_TOPICS, STATISTICS_FORMULAS, STATISTICS_QUESTIONS, STATISTICS_EXAM_FORMATS } = statisticsData;
  assert.equal(STATISTICS_TOPICS.length, 6);
  assert.ok(STATISTICS_FORMULAS.length >= 33, "the course should provide a substantial formula deck");
  assert.ok(STATISTICS_QUESTIONS.length >= 90, "the course should include the four in-range exercise PDFs");
  assert.equal(STATISTICS_EXAM_FORMATS.length, 4);
  assert.ok(STATISTICS_QUESTIONS.every((question) => question.source === "course-range"));

  const courseCorpus = JSON.stringify({ STATISTICS_TOPICS, STATISTICS_FORMULAS, STATISTICS_QUESTIONS });
  assert.equal(courseCorpus.includes("モンティ"), false, "the explicitly excluded puzzle must never enter course data");
  assert.equal(courseCorpus.toLowerCase().includes("monty"), false, "the explicitly excluded puzzle must never enter course data");
  for (const prefix of ["stats-ex1-", "stats-ex2-", "stats-ex3-", "stats-ex4-"]) {
    assert.ok(STATISTICS_QUESTIONS.some((question) => question.id.startsWith(prefix)), prefix + " exercises should be present");
  }
  assert.equal(new Set(STATISTICS_QUESTIONS.map((question) => question.id)).size, STATISTICS_QUESTIONS.length, "statistics IDs must remain unique");
  assert.ok(STATISTICS_FORMULAS.every((card) => !card.formula.includes("Σxi") && !card.formula.includes(" / ")), "formula cards should use TeX rather than slash-style pseudo-math");
  for (const excluded of ["中央値", "平均偏差", "変動係数", "幾何平均", "調和平均", "エントロピー", "偏相関", "Spearman", "Kendall"]) {
    assert.equal(courseCorpus.includes(excluded), false, `${excluded} comes only from the sample tests and must remain out of scope`);
  }

  assert.match(statisticsPage, /test-grid:subject-7:progress:v1/);
  assert.match(statisticsPage, /test-grid:subject-7:mock-test:v1/);
  assert.match(statisticsPage, /function parseNumericResponse/);
  assert.match(statisticsPage, /normalized\.includes\("%"\)/);
  assert.match(statisticsPage, /const fraction = normalized\.match/);
  assert.match(statisticsPage, /question\.tolerance/);
  assert.match(statisticsPage, /function pauseTest/);
  assert.match(statisticsPage, /function resumeSavedTest/);
  assert.match(statisticsPage, /function deleteSavedTest/);
  assert.match(statisticsPage, /中断して保存/);
  assert.match(statisticsPage, /続きから再開/);
  assert.match(statisticsPage, /保存データを削除/);
  assert.match(statisticsPage, /途中式/);
  assert.match(statisticsPage, /内容は合っていた → 正解にする/);
  assert.match(statisticsPage, /確率統計1〜4\.pdf/);
  assert.match(statisticsPage, /モンティ・ホール問題/);
  assert.match(statisticsPage, /<StatisticsExpectedExams/);
  assert.match(syncUi, /key\.endsWith\("mock-test:v1"\)/);
  assert.match(syncUi, /key\.endsWith\("expected-exam:v1"\)/);
});

test("provides twelve saved 50-minute predicted exams with TeX answers and a 60-point pass line", async () => {
  const [expectedExams, statisticsPage, mathRenderer] = await Promise.all([
    readFile(new URL("../app/statistics-expected-exams.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/subjects/subject-7/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/statistics-math.tsx", import.meta.url), "utf8"),
  ]);

  assert.equal((expectedExams.match(/id:\s*"expected-\d{2}"/g) ?? []).length, 12);
  assert.match(expectedExams, /const EXAM_SECONDS\s*=\s*50\s*\*\s*60/);
  assert.match(expectedExams, /const PASS_SCORE\s*=\s*60/);
  assert.match(expectedExams, /test-grid:subject-7:expected-exam:v1/);
  assert.match(expectedExams, /中断して保存/);
  assert.match(expectedExams, /続きから再開/);
  assert.match(expectedExams, /MODEL ANSWERS/);
  assert.match(expectedExams, /解答・途中式・解説/);
  assert.match(expectedExams, /赤点です（合格ライン60点）/);
  assert.match(statisticsPage, /DisplayMath/);
  assert.match(statisticsPage, /RichMathText/);
  assert.match(mathRenderer, /renderToString/);
  assert.match(mathRenderer, /output:\s*"htmlAndMathml"/);
  assert.match(mathRenderer, /throwOnError:\s*false/);
});

test("syncs all subject progress through an authenticated account API", async () => {
  const [syncUi, syncRoute, hosting, layout] = await Promise.all([
    readFile(new URL("../app/account-sync.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/study-sync/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /getChatGPTUser/);
  assert.match(layout, /<AccountSync/);
  assert.match(syncUi, /const SYNC_ENDPOINT\s*=\s*"\/api\/study-sync"/);
  assert.match(syncUi, /window\.localStorage\.length/);
  assert.match(syncUi, /STORAGE_KEY_PATTERN/);
  assert.match(syncUi, /fetch\(SYNC_ENDPOINT,\s*\{\s*cache:\s*"no-store"/);
  assert.match(syncUi, /method:\s*"PUT"/);
  assert.match(syncUi, /別のスマホでも続きから/);
  assert.match(syncUi, /アカウント作成・ログイン/);
  assert.match(syncUi, /今すぐ同期/);

  assert.match(syncRoute, /export async function GET\(\)/);
  assert.match(syncRoute, /export async function PUT\(request:\s*Request\)/);
  assert.match(syncRoute, /getChatGPTUser/);
  assert.match(syncRoute, /SIGN_IN_REQUIRED/);
  assert.match(syncRoute, /normalizeSnapshot/);
  assert.match(syncRoute, /env\.STUDY_SNAPSHOTS\.get/);
  assert.match(syncRoute, /env\.STUDY_SNAPSHOTS\.put/);
  assert.match(syncRoute, /crypto\.subtle\.digest\("SHA-256"/);
  assert.match(hosting, /"r2"\s*:\s*"STUDY_SNAPSHOTS"/);

  const [anonymousRead, anonymousWrite] = await Promise.all([
    render("/api/study-sync", { headers: { accept: "application/json" } }),
    render("/api/study-sync", {
      method: "PUT",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ snapshot: {} }),
    }),
  ]);
  assert.equal(anonymousRead.status, 401);
  assert.equal(anonymousWrite.status, 401);
  assert.deepEqual(await anonymousRead.json(), { error: "SIGN_IN_REQUIRED" });
  assert.deepEqual(await anonymousWrite.json(), { error: "SIGN_IN_REQUIRED" });
});

test("server-renders a generic subject workspace and the old cards URL", async () => {
  const [subjectResponse, legacyCardsResponse] = await Promise.all([
    render("/subjects/subject-3"),
    render("/cards"),
  ]);
  assert.equal(subjectResponse.status, 200);
  assert.equal(legacyCardsResponse.status, 200);
  const subjectHtml = await subjectResponse.text();
  assert.match(subjectHtml, /SUBJECT WORKSPACE/);
  assert.match(subjectHtml, /暗記カード/);
  assert.match(subjectHtml, /一問一答/);
  assert.match(subjectHtml, /まだ教材がありません/);
  assert.match(await legacyCardsResponse.text(), /MEMORY CARD DECK/);
});

test("ships the study hub without starter artifacts", async () => {
  const [hubPage, networkPage, cardsPage, subjectPage, englishPage, englishData, studyData, protocols, protocolDescriptions, layout, css, packageJson, ogStats] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/subjects/network/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/subjects/network/cards/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/subjects/[subjectId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/subjects/subject-2/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/english-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/study-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/protocols.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/protocol-descriptions.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    stat(new URL("../public/og-test-grid.png", import.meta.url)),
  ]);

  assert.match(protocols, /const DEFAULT_CARDS/);
  assert.match(protocols, /"FHRP"/);
  assert.match(protocols, /"TKIP"/);
  for (const label of ["10BASE-T", "IEEE 802.1X", "RIPv2", "QUIC", "TLS1.3", "POP3", "Syslog"]) {
    assert.ok(protocols.includes(`"${label}"`), `${label} should be included in the OCR corpus`);
  }
  assert.match(protocols, /layers\?: Layer\[\]/);
  assert.match(protocols, /fullName\?: string/);
  assert.match(protocols, /description\?: string/);
  assert.match(protocols, /PROTOCOL_FORMAL_NAMES/);
  assert.match(protocols, /"SFTP": "SSH File Transfer Protocol"/);
  assert.match(protocols, /"RADIUS": "Remote Authentication Dial-In User Service"/);
  assert.match(protocols, /layers:\s*\[1,\s*2\]/);
  assert.match(protocols, /layers:\s*\[5,\s*7\]/);
  assert.match(protocols, /layers:\s*\[5,\s*6\]/);
  assert.match(protocols, /makeCards\(\["SSL"\], 6, 2\)/);
  assert.match(protocols, /export function cardLayers/);
  assert.match(protocols, /export function cardLayerLabel/);
  assert.match(studyData, /DEFAULT_SUBJECTS/);
  assert.match(studyData, /test-grid-subjects-v1/);
  assert.match(hubPage, /subjects\.map/);
  assert.match(hubPage, /\[dialogOpen\]/);
  assert.doesNotMatch(hubPage, /\[editing\]\);/);
  assert.match(networkPage, /layer-sum-cards-v1/);
  assert.match(networkPage, /mode === "sum"/);
  assert.match(networkPage, /mode === "identify"/);
  assert.match(networkPage, /cardLayers\(/);
  assert.match(networkPage, /cardLayerLabel\(/);
  assert.match(networkPage, /chosen: Layer \| null/);
  assert.match(networkPage, /identifyLimit/);
  assert.match(networkPage, /performance\.now\(\)/);
  assert.match(networkPage, /clearInterval/);
  assert.match(networkPage, /時間切れ/);
  assert.match(networkPage, /1問ごとの制限時間/);
  assert.match(networkPage, /type="number"/);
  assert.doesNotMatch(networkPage, /selectedLayers|対象レイヤー/);
  assert.match(cardsPage, /layer-sum-memory-v1/);
  assert.match(cardsPage, /memory-card/);
  assert.match(cardsPage, /currentCard\?\.fullName/);
  assert.match(cardsPage, /memory-full-name/);
  assert.match(cardsPage, /memory-explanation/);
  assert.match(cardsPage, /currentDescription/);
  for (const label of ["ARP", "TCP", "TLS1.3", "HTTP\/3", "DNS", "RTP"]) {
    assert.ok(protocolDescriptions.includes(`"${label}"`), `${label} should have a role explanation`);
  }
  assert.match(englishPage, /test-grid:english-memory:v1/);
  assert.match(englishPage, /ENGLISH_UNITS\.map/);
  assert.match(englishPage, /questionPassage/);
  assert.match(englishData, /Chapter 15/);
  assert.match(englishData, /Chapter 19/);
  assert.match(englishData, /passage-wheelchair/);
  assert.match(englishData, /passage-dna/);
  assert.match(englishData, /VOCAB_QUESTIONS/);
  assert.match(englishData, /ORDER_QUESTIONS/);
  assert.match(subjectPage, /parseBulk/);
  assert.match(subjectPage, /一問一答/);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /openGraph/);
  assert.match(layout, /<html lang="ja">/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.ok(ogStats.size > 100_000, "social preview should be a real image asset");

  await assert.rejects(access(new URL("../app/_sites-preview", projectRoot)));
});
