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
let smartControlDataModulePromise;
let smartControlTextbookDataModulePromise;
let statisticsMathModulePromise;

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

function loadSmartControlDataModule() {
  smartControlDataModulePromise ??= readFile(new URL("../app/smart-control-data.ts", import.meta.url), "utf8")
    .then((source) => ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText)
    .then((javascript) => import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`));
  return smartControlDataModulePromise;
}
function loadSmartControlTextbookDataModule() {
  smartControlTextbookDataModulePromise ??= readFile(new URL("../app/smart-control-textbook-data.ts", import.meta.url), "utf8")
    .then((source) => ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText)
    .then((javascript) => import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`));
  return smartControlTextbookDataModulePromise;
}
function loadStatisticsMathModule() {
  statisticsMathModulePromise ??= readFile(new URL("../app/statistics-math.tsx", import.meta.url), "utf8")
    .then((source) => ts.transpileModule(source, {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText)
    .then((javascript) => {
      const jsxRuntime = [
        "export const Fragment = Symbol.for('statistics-math-test-fragment');",
        "export function jsx(type, props, key) { return { type, key: key ?? null, props: props ?? {} }; }",
        "export const jsxs = jsx;",
      ].join("\n");
      const jsxRuntimeUrl = `data:text/javascript;base64,${Buffer.from(jsxRuntime).toString("base64")}`;
      const katexUrl = new URL("../app/vendor/katex/katex.mjs", import.meta.url).href;
      const resolvedJavascript = javascript
        .replaceAll('"react/jsx-runtime"', JSON.stringify(jsxRuntimeUrl))
        .replaceAll('"./vendor/katex/katex.mjs"', JSON.stringify(katexUrl));
      return import(`data:text/javascript;base64,${Buffer.from(resolvedJavascript).toString("base64")}`);
    });
  return statisticsMathModulePromise;
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
  assert.match(html, /暗記帳と検索はここです/);
  assert.match(html, /9教科総合/);
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
  assert.match(html, /暗算を始める/);
  assert.match(html, /時間制限つき層即答（練習）/);
  assert.match(html, /層を即答・連続正解の練習/);
  assert.match(html, /公式ランキングテスト/);
  assert.match(html, /ネットワーク連続正解ランキング/);
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

test("network cards hide layer colors until the answer is revealed", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.memory-card\s*\{[\s\S]*?--card-accent:\s*var\(--paper-dim\);[\s\S]*?--layer-accent:\s*var\(--yellow\);/);
  assert.match(css, /\.memory-card\.is-flipped\s*\{\s*--card-accent:\s*var\(--layer-accent\);\s*\}/);
  assert.doesNotMatch(css, /\.memory-card\[data-layer="(?:2|3|4|7)"\][^{]*\{[^}]*--card-accent/);
});

test("server-renders the English exam lab", async () => {
  const response = await render("/subjects/subject-2");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /ENGLISH EXAM LAB/);
  assert.match(html, /暗記帳を開く/);
  assert.match(html, /Ch\.18 実物小テスト/);
  assert.match(html, /実物18点/);
  assert.match(html, /模擬テスト/);
  assert.match(html, /長文読解/);
  assert.match(html, /Chapter 15|Ch\.15/);
  assert.match(html, /Chapter 18|Ch\.18/);
  assert.doesNotMatch(html, /Chapter 19|Ch\.19/);
  assert.match(html, /MEMORY BOOK/);
  assert.match(html, /出題方向/);
  assert.match(html, /日 → 英/);
  assert.match(html, /英 → 日/);
});

test("server-renders the separate on-demand generated-practice lab", async () => {
  const response = await render("/generated-practice?subject=subject-2");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /自動生成問題/);
  assert.match(html, /プリント問題とは別/);
  assert.match(html, /今すぐ1問作る/);
  assert.match(html, /本文一文の並び替え|本文抜粋の和訳|選択問題/);
  assert.doesNotMatch(html, /COMPLETE ANSWER|模範解答/);
  assert.doesNotMatch(html, /<strong>ネットワーク<\/strong>/u);
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

test("server-renders the smart control exam lab", async () => {
  const response = await render("/subjects/subject-6");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /スマート制御・定期テスト演習/);
  assert.match(html, /SMART CONTROL LAB/);
  assert.match(html, /範囲ZIP/);
  assert.match(html, /過去問2/);
  assert.match(html, /過去問1・過去問3/);
  assert.match(html, /暗記カード/);
  assert.match(html, /ランダム模試/);
  assert.match(html, /A4想定試験/);
  assert.match(html, /複素積分・マクローリン展開・留数は対象外/);
  assert.match(html, /教科書赤字・図/);
  assert.match(html, /教科書p\.65〜68/);
  assert.doesNotMatch(html, /未提供の教科書写真/);
});

test("server-renders the thermodynamics exam lab", async () => {
  const response = await render("/subjects/subject-4");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /熱・流体力学・定期テスト演習/);
  assert.match(html, /THERMODYNAMICS/);
  assert.match(html, /今回の試験範囲/);
  assert.match(html, /公式カード/);
  assert.match(html, /計算演習/);
  assert.match(html, /ランダム模試/);
  assert.match(html, /想定試験/);
  assert.match(html, /出題形式/);
  assert.match(html, /形式3の確認済み重複/);
});
test("server-renders the mechanical dynamics exam lab", async () => {
  const response = await render("/subjects/subject-3");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /機械力学・定期テスト演習/);
  assert.match(html, /MECHANICAL DYNAMICS/);
  assert.match(html, /今回の試験範囲/);
  assert.match(html, /範囲ZIP/);
  assert.match(html, /過去問PDF/);
  assert.match(html, /公式カード/);
  assert.match(html, /計算演習/);
  assert.match(html, /ランダム模試/);
  assert.match(html, /過去問・想定試験/);
  assert.match(html, /出題形式/);
  assert.match(html, /7大問・100点/);
  assert.doesNotMatch(html, /まだ教材がありません/);
});
test("server-renders the applied mathematics exam lab", async () => {
  const response = await render("/subjects/subject-8");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /応用数学・定期テスト演習/);
  assert.match(html, /APPLIED MATHEMATICS/);
  assert.match(html, /今回の試験範囲/);
  assert.match(html, /公式カード/);
  assert.match(html, /計算演習/);
  assert.match(html, /ランダム模試/);
  assert.match(html, /想定試験/);
  assert.match(html, /出題形式/);
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
  assert.match(englishPage, /<EnglishQuestionExplanation question=\{readingQuestion\}/);
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
    ["passages", ENGLISH_PASSAGES],
    ["questions", ENGLISH_QUESTIONS],
  ]) {
    assert.equal(
      items.some((item) => (item.id ?? item.unit) === "exam-sample" || item.unit === "exam-sample"),
      false,
      `${label} should exclude questions and material copied from the sample PDF`,
    );
    assert.equal(
      items.some((item) => (item.id ?? item.unit) === "ch19" || item.unit === "ch19"),
      false,
      `${label} should exclude Chapter 19 from the active exam scope`,
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
  assert.match(englishPage, /isAcceptableJapaneseMeaning/);
  assert.match(englishPage, /grading === "japanese-semantic"/);
  assert.equal(
    ENGLISH_QUESTIONS.filter((question) => question.group === "語彙・熟語（英→日）").length,
    ENGLISH_VOCAB.length,
  );
  assert.match(englishPage, /日本語で入力（同じ意味なら言い換え可）/);
  assert.match(englishPage, /和訳入力/);
  assert.match(englishPage, /import \{ EnglishQuestionExplanation, EnglishVocabInsight \}/);
  assert.match(englishPage, /<EnglishQuestionExplanation question=\{currentQuestion\}/);
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
  assert.match(englishPage, /Chapter 15・16・18の教材だけ/);
  assert.doesNotMatch(englishPage, /Chapter 15・16・18・19/);
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

test("keeps smart-control range data, formulas, saves, and A4 papers internally consistent", async () => {
  const [data, page, examsUi, examsCss, syncUi] = await Promise.all([
    loadSmartControlDataModule(),
    readFile(new URL("../app/subjects/subject-6/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/smart-control-exams.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/smart-control-exams.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/account-sync.tsx", import.meta.url), "utf8"),
  ]);

  const {
    SMART_CONTROL_TOPICS,
    SMART_CONTROL_CARDS,
    SMART_CONTROL_QUESTIONS,
    SMART_CONTROL_EXAMS,
  } = data;
  const topicIds = new Set(SMART_CONTROL_TOPICS.map((topic) => topic.id));

  assert.equal(SMART_CONTROL_TOPICS.length, 5);
  assert.ok(SMART_CONTROL_CARDS.length >= 30, "the formula deck should be substantial");
  assert.ok(SMART_CONTROL_QUESTIONS.length >= 38, "the practice bank should cover every supplied range topic");
  assert.equal(SMART_CONTROL_EXAMS.length, 6);
  assert.equal(new Set(SMART_CONTROL_CARDS.map((card) => card.id)).size, SMART_CONTROL_CARDS.length);
  assert.equal(new Set(SMART_CONTROL_QUESTIONS.map((question) => question.id)).size, SMART_CONTROL_QUESTIONS.length);
  assert.ok(SMART_CONTROL_CARDS.every((card) => topicIds.has(card.topic)));
  assert.ok(SMART_CONTROL_QUESTIONS.every((question) => topicIds.has(question.topic)));
  assert.ok(SMART_CONTROL_QUESTIONS.every((question) => ["scope-zip", "past2-overlap"].includes(question.source)));
  assert.ok(SMART_CONTROL_QUESTIONS.filter((question) => question.source === "past2-overlap").every(
    (question) => ["response-stability", "block-diagram"].includes(question.topic),
  ));
  assert.ok(SMART_CONTROL_QUESTIONS.filter((question) => question.format === "choice").every(
    (question) => question.options?.includes(question.answer),
  ));
  assert.ok(SMART_CONTROL_CARDS.some((card) => card.formula.includes("\\frac")));
  assert.ok(SMART_CONTROL_QUESTIONS.some((question) => question.prompt.includes("\\(")));

  const rangeCorpus = JSON.stringify({ SMART_CONTROL_CARDS, SMART_CONTROL_QUESTIONS, SMART_CONTROL_EXAMS });
  for (const excluded of ["複素積分", "マクローリン", "留数"]) {
    assert.equal(rangeCorpus.includes(excluded), false, `${excluded} belongs to the excluded complex-analysis page`);
  }

  const examQuestionIds = SMART_CONTROL_EXAMS.flatMap((exam) => exam.questions.map((question) => question.id));
  assert.equal(new Set(examQuestionIds).size, examQuestionIds.length);
  for (const exam of SMART_CONTROL_EXAMS) {
    assert.equal(exam.questions.length, 4);
    assert.equal(exam.questions.reduce((sum, question) => sum + question.points, 0), 100);
    assert.ok(exam.questions.every((question) => question.prompt && question.answer && question.steps.length));
    assert.ok(exam.questions.every((question) => question.difficulty === 3));
    assert.ok(exam.questions.every((question) => question.subpartCount >= 3));
    assert.ok(exam.questions.every((question) => question.prompt.includes("（1）") && question.prompt.includes("（2）")));
    assert.ok(exam.questions.every((question) => question.sourceBasis?.length === 3));
  }

  assert.match(page, /test-grid:subject-6:progress:v1/);
  assert.match(page, /test-grid:subject-6:mock-test:v1/);
  assert.match(page, /function pauseTest/);
  assert.match(page, /function resumeSavedTest/);
  assert.match(page, /中断して保存/);
  assert.match(page, /続きから再開/);
  assert.match(page, /<SmartControlExams/);
  assert.match(examsUi, /test-grid:subject-6:expected-exam:v1/);
  assert.match(examsUi, /setSavedExam\(snapshot\)/);
  assert.match(examsUi, /function returnToSelector/);
  assert.match(examsUi, /smart-control-printing/);
  assert.match(examsCss, /@page\s*\{/);
  assert.match(examsCss, /size:\s*A4 portrait/);
  assert.match(examsCss, /body\.smart-control-printing/);
  assert.match(syncUi, /key\.endsWith\("mock-test:v1"\)/);
  assert.match(syncUi, /key\.endsWith\("expected-exam:v1"\)/);
});
test("covers all red textbook terms and graph thresholds with dedicated drills", async () => {
  const [textbookData, page, hub, graphUi, graphCss] = await Promise.all([
    loadSmartControlTextbookDataModule(),
    readFile(new URL("../app/subjects/subject-6/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/smart-control-response-graph.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/smart-control-response-graph.module.css", import.meta.url), "utf8"),
  ]);

  const { TEXTBOOK_RESPONSE_CARDS, TEXTBOOK_RESPONSE_QUESTIONS } = textbookData;
  assert.ok(TEXTBOOK_RESPONSE_CARDS.length >= 14, "every red term and graph mark needs a memory card");
  assert.ok(TEXTBOOK_RESPONSE_QUESTIONS.length >= 18, "the graph-reading bank should be substantial");
  assert.equal(new Set(TEXTBOOK_RESPONSE_CARDS.map((card) => card.id)).size, TEXTBOOK_RESPONSE_CARDS.length);
  assert.equal(new Set(TEXTBOOK_RESPONSE_QUESTIONS.map((question) => question.id)).size, TEXTBOOK_RESPONSE_QUESTIONS.length);
  assert.ok(TEXTBOOK_RESPONSE_CARDS.every((card) => card.topic === "response-stability"));
  assert.ok(TEXTBOOK_RESPONSE_QUESTIONS.every((question) => question.topic === "response-stability"));
  assert.ok(TEXTBOOK_RESPONSE_QUESTIONS.every((question) => question.source === "textbook-p65-68"));
  assert.ok(TEXTBOOK_RESPONSE_QUESTIONS.every((question) => question.steps.length >= 2));

  const corpus = JSON.stringify({ TEXTBOOK_RESPONSE_CARDS, TEXTBOOK_RESPONSE_QUESTIONS });
  for (const term of [
    "定常特性", "過渡特性", "定常値", "立ち上がり時間", "速応性",
    "遅れ時間", "オーバーシュート", "行き過ぎ量", "行き過ぎ時間", "減衰性", "整定時間",
  ]) {
    assert.match(corpus, new RegExp(term), `${term} must be covered`);
  }
  for (const mark of ["0.1", "0.5", "0.9", "0.95", "1.05", "t_r", "t_d", "t_p", "t_s", "O_s", "y_{\\\\max}"]) {
    assert.ok(corpus.includes(mark), `${mark} must be practiced`);
  }
  assert.match(corpus, /100/);
  assert.match(corpus, /5%/);

  assert.match(page, /type Mode = .*"textbook"/);
  assert.match(page, /TEXTBOOK_RESPONSE_CARDS/);
  assert.match(page, /TEXTBOOK_RESPONSE_QUESTIONS/);
  assert.match(page, /<SmartControlResponseGraph/);
  assert.match(page, /教科書赤字・図/);
  assert.match(page, /教科書カードだけ/);
  assert.match(page, /function startAllCards/);
  assert.match(page, /FORMULA \+ TEXTBOOK MEMORY/);
  assert.match(page, /currentCard\.id\.startsWith\("textbook-response-"\)/);
  assert.match(page, /図表問題だけ/);
  assert.match(page, /smart-control-tabs/);
  assert.match(hub, /SMART_CONTROL_ALL_CARDS/);

  assert.match(graphUi, /<canvas/);
  assert.doesNotMatch(graphUi, /<svg/i);
  assert.match(graphUi, /ResizeObserver/);
  assert.match(graphUi, /0\.95/);
  assert.match(graphUi, /1\.05/);
  assert.match(graphUi, /答え/);
  assert.match(graphCss, /@media/);
});

test("provides twelve balanced A4 predicted exams with 11 major questions and 100 verified points", async () => {
  const [expectedExams, expectedExamData, expectedExamStyles, statisticsPage, mathRenderer] = await Promise.all([
    readFile(new URL("../app/statistics-expected-exams.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/statistics-expected-exams-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/statistics-expected-exams.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/subjects/subject-7/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/statistics-math.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(expectedExamData, /{ length: 12 }/);
  assert.match(expectedExamData, /const EXAM_SECONDS\s*=\s*50\s*\*\s*60/);
  assert.match(expectedExamData, /const PASS_SCORE\s*=\s*60/);
  assert.match(expectedExamData, /const TOTAL_POINTS\s*=\s*100/);
  assert.match(expectedExamData, /const EXPECTED_MAJOR_COUNT\s*=\s*11/);
  assert.match(expectedExamData, /const EXPECTED_SUBQUESTION_COUNT\s*=\s*32/);
  assert.match(expectedExamData, /function validateExpectedPaper/);
  assert.match(expectedExamData, /paper\.totalPoints\s*!==\s*TOTAL_POINTS/);

  const questionTemplates = [...expectedExamData.matchAll(/makeQuestion\(definition,\s*(\d+),\s*(\d+),\s*(\d+),/g)];
  assert.equal(questionTemplates.length, 32, "each numerical variant should use the same 32 subquestion templates");
  assert.equal(questionTemplates.reduce((sum, match) => sum + Number(match[3]), 0), 100, "template points must total exactly 100");
  const questionsByMajor = new Map();
  for (const match of questionTemplates) questionsByMajor.set(Number(match[1]), (questionsByMajor.get(Number(match[1])) ?? 0) + 1);
  assert.deepEqual([...questionsByMajor.values()], [6, 2, 4, 2, 3, 4, 3, 2, 2, 3, 1]);

  for (const label of ["記述統計（過去問型）", "2群の平均・標準偏差", "相関・回帰（表データ）", "場合の数と確率（演習PDF2型）", "全確率・Bayes（演習PDF3型）", "離散分布・エントロピー", "算術・幾何・調和平均", "連続型確率変数（演習PDF4型）", "正規分布・チェビシェフ", "順位相関（過去問型）", "平方和の恒等式（証明）"]) {
    assert.match(expectedExamData, new RegExp(label));
  }
  assert.doesNotMatch(expectedExamData, /counts:\s*\{/);
  assert.doesNotMatch(expectedExamData, /buildExpectedQuestions/);
  assert.match(expectedExams, /test-grid:subject-7:expected-exam:v1/);
  assert.match(expectedExams, /中断して保存/);
  assert.match(expectedExams, /続きから再開/);
  assert.match(expectedExams, /createPortal/);
  assert.match(expectedExams, /window\.print\(\)/);
  assert.match(expectedExams, /A4問題用紙/);
  assert.match(expectedExams, /EXPECTED_SUBQUESTION_COUNT/);
  assert.match(expectedExams, /MODEL ANSWERS/);
  assert.match(expectedExams, /解答・途中式・解説/);
  assert.match(expectedExams, /赤点です（合格ライン60点）/);
  assert.match(expectedExamStyles, /@page\s*\{/);
  assert.match(expectedExamStyles, /size:\s*A4 portrait/);
  assert.match(expectedExamStyles, /column-count:\s*2/);
  assert.match(expectedExamStyles, /break-before:\s*page/);
  assert.match(expectedExamStyles, /contain:\s*inline-size/);
  assert.match(expectedExamStyles, /min-height:\s*297mm/);
  assert.match(statisticsPage, /DisplayMath/);
  assert.match(statisticsPage, /RichMathText/);
  assert.match(mathRenderer, /renderToString/);
  assert.match(mathRenderer, /output:\s*"htmlAndMathml"/);
  assert.match(mathRenderer, /throwOnError:\s*false/);
});

test("keeps short math inline and gives every long smart-control/statistics expression a responsive block", async () => {
  const [mathRenderer, statistics, smartControl, textbook, css, expectedExamSource, katex] = await Promise.all([
    loadStatisticsMathModule(),
    loadCombinedStatisticsDataModule(),
    loadSmartControlDataModule(),
    loadSmartControlTextbookDataModule(),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/statistics-expected-exams.tsx", import.meta.url), "utf8"),
    import(new URL("../app/vendor/katex/katex.mjs", import.meta.url)),
  ]);

  const shortText = "相関係数 \\(r\\) が正なら正の相関である。";
  const longLeadingText = "\\(G(s)=K/(Ts+1)\\) の単位インパルス応答は？";
  const longLaterText = "高さを小さい順に並べる。\\(0.1y_\\infty<0.5y_\\infty<0.9y_\\infty<0.95y_\\infty<y_\\infty<1.05y_\\infty\\)";

  assert.equal(mathRenderer.shouldDisplayMathSegment({
    tex: "r",
    start: shortText.indexOf("\\("),
    end: shortText.indexOf("\\)") + 2,
    text: shortText,
  }), false);
  assert.equal(mathRenderer.shouldDisplayMathSegment({
    tex: "G(s)=K/(Ts+1)",
    start: 0,
    end: longLeadingText.indexOf("\\)") + 2,
    text: longLeadingText,
  }), true);
  assert.equal(mathRenderer.shouldDisplayMathSegment({
    tex: "0.1y_\\infty<0.5y_\\infty<0.9y_\\infty<0.95y_\\infty<y_\\infty<1.05y_\\infty",
    start: longLaterText.indexOf("\\("),
    end: longLaterText.length,
    text: longLaterText,
  }), true);

  const shortRendered = mathRenderer.RichMathText({ text: shortText });
  assert.doesNotMatch(shortRendered.props.className, /has-display-math/);
  assert.equal(shortRendered.props.children[1].type.name, "InlineMath");

  const longRendered = mathRenderer.RichMathText({ text: longLeadingText });
  assert.match(longRendered.props.className, /has-display-math/);
  assert.equal(longRendered.props.children[0].type.name, "ResponsiveMathSegment");

  const bracketedText = String.raw`次の8個のデータについて答えよ。\[12,\quad 16,\quad 18,\quad 20,\quad 22,\quad 24,\quad 26,\quad 30\] 分散は母分散とする。`;
  const bracketedRendered = mathRenderer.RichMathText({ text: bracketedText });
  assert.match(bracketedRendered.props.className, /has-display-math/);
  assert.equal(bracketedRendered.props.children[1].type.name, "ResponsiveMathSegment");
  assert.equal(bracketedRendered.props.children[1].props.tex, String.raw`12,\quad 16,\quad 18,\quad 20,\quad 22,\quad 24,\quad 26,\quad 30`);

  const arrayCases = [
    [
      String.raw`確率変数 \(X\) の分布は次のとおりである。\[\begin{array}{c|cccc}x&0&1&2&3\\\hline P(X=x)&0.5&0.25&0.125&k\end{array}\] 対数は底2とする。`,
      String.raw`\begin{array}{c|cccc}x&0&1&2&3\\\hline P(X=x)&0.5&0.25&0.125&k\end{array}`,
    ],
    [
      String.raw`次の対応表を用い、分散・共分散は \(n\) で割る。\[\begin{array}{c|ccccc}i&1&2&3&4&5\\\hline X_i&1&2&3&4&5\\Y_i&9&15&18&21&22\end{array}\]`,
      String.raw`\begin{array}{c|ccccc}i&1&2&3&4&5\\\hline X_i&1&2&3&4&5\\Y_i&9&15&18&21&22\end{array}`,
    ],
  ];

  for (const [arrayText, expectedTex] of arrayCases) {
    const rendered = mathRenderer.RichMathText({ text: arrayText });
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    const displaySegments = children.filter((child) => child?.type?.name === "ResponsiveMathSegment");
    assert.equal(displaySegments.length, 1, arrayText);
    assert.equal(displaySegments[0].props.tex, expectedTex);

    const typesetSegment = displaySegments[0].type(displaySegments[0].props);
    const html = typesetSegment.props.children.props.dangerouslySetInnerHTML.__html;
    assert.match(html, /katex-display/);
    assert.doesNotMatch(html, /\\\\\[/);
    assert.doesNotMatch(html, /\\\\\]/);
  }
  const dollarRendered = mathRenderer.RichMathText({ text: String.raw`$$\sum_{i=1}^{n}x_i$$` });
  assert.match(dollarRendered.props.className, /has-display-math/);
  assert.equal(dollarRendered.props.children[0].type.name, "ResponsiveMathSegment");

  assert.equal(mathRenderer.isStandaloneTex(String.raw`\frac{1}{n}\sum_{i=1}^{n}(x_i-\bar{x})^2`), true);
  assert.equal(mathRenderer.isStandaloneTex(String.raw`\text{禁止}`), true);
  assert.equal(mathRenderer.isStandaloneTex("stable network protocol"), false);
  assert.equal(mathRenderer.isStandaloneTex(String.raw`答えは \frac{1}{2}`), false);
  const bareRendered = mathRenderer.RichMathText({ text: String.raw`\frac{1}{n}\sum_{i=1}^{n}(x_i-\bar{x})^2` });
  assert.match(bareRendered.props.className, /has-display-math/);
  assert.equal(bareRendered.props.children.type.name, "ResponsiveMathSegment");

  const questionOwners = [
    ...statistics.STATISTICS_QUESTIONS,
    ...smartControl.SMART_CONTROL_QUESTIONS,
    ...textbook.TEXTBOOK_RESPONSE_QUESTIONS,
    ...smartControl.SMART_CONTROL_EXAMS.flatMap((exam) => exam.questions),
  ];
  assert.ok(questionOwners.length >= 180, "the audit must include every current smart-control/statistics question");

  const formulaOwners = [
    ...statistics.STATISTICS_FORMULAS,
    ...statistics.STATISTICS_QUESTIONS,
    ...smartControl.SMART_CONTROL_CARDS,
    ...smartControl.SMART_CONTROL_QUESTIONS,
    ...smartControl.SMART_CONTROL_EXAMS.flatMap((exam) => exam.questions),
    ...textbook.TEXTBOOK_RESPONSE_CARDS,
    ...textbook.TEXTBOOK_RESPONSE_QUESTIONS,
  ];
  const richTextFields = [];
  for (const owner of formulaOwners) {
    for (const field of ["prompt", "context", "answer", "explanation", "example"]) {
      if (typeof owner[field] === "string") richTextFields.push(`${owner.id}.${field}: ${owner[field]}`);
    }
    for (const field of ["steps", "options"]) {
      for (const [index, value] of (owner[field] ?? []).entries()) {
        if (typeof value === "string") richTextFields.push(`${owner.id}.${field}[${index}]: ${value}`);
      }
    }
  }

  let displayFieldCount = 0;
  let inlineFieldCount = 0;
  for (const labeledText of richTextFields) {
    const separator = labeledText.indexOf(": ");
    const label = labeledText.slice(0, separator);
    const text = labeledText.slice(separator + 2);
    assert.equal((text.match(/\\\(/g) ?? []).length, (text.match(/\\\)/g) ?? []).length, `${label} has unbalanced math delimiters`);
    const rendered = mathRenderer.RichMathText({ text });
    assert.equal(rendered.type, "span", `${label} must render through RichMathText`);
    if (/has-display-math/.test(rendered.props.className)) displayFieldCount += 1;
    else if ((text.match(/\\\(/g) ?? []).length) inlineFieldCount += 1;
  }
  assert.ok(displayFieldCount >= 20, "long equations in the current corpus should use responsive display segments");
  assert.ok(inlineFieldCount > displayFieldCount, "short equations should remain inline");

  const formulas = formulaOwners.filter((owner) => typeof owner.formula === "string");
  assert.ok(formulas.length >= 230, "the strict KaTeX audit must cover every current formula");
  for (const owner of formulas) {
    assert.doesNotThrow(() => katex.renderToString(owner.formula, {
      displayMode: true,
      output: "htmlAndMathml",
      strict: "error",
      throwOnError: true,
      trust: false,
    }), `${owner.id} contains invalid TeX`);
  }

  assert.equal((expectedExamSource.match(/\\\\\(/g) ?? []).length, (expectedExamSource.match(/\\\\\)/g) ?? []).length, "predicted-exam templates must keep balanced math delimiters");
  assert.match(css, /\.statistics-rich-math-display-segment\s*\{/);
  assert.match(css, /font-size:\s*clamp\(15px,\s*4\.8vw,\s*21px\)/);
  assert.match(css, /overflow-x:\s*auto/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
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

test("server-renders the material-mechanics workspace and the all-subject card search", async () => {
  const [subjectResponse, legacyCardsResponse] = await Promise.all([
    render("/subjects/subject-5"),
    render("/cards"),
  ]);
  assert.equal(subjectResponse.status, 200);
  assert.equal(legacyCardsResponse.status, 200);
  const subjectHtml = await subjectResponse.text();
  assert.match(subjectHtml, /MATERIAL MECHANICS/);
  assert.match(subjectHtml, /材料力学/);
  assert.match(subjectHtml, /公式カード/);
  assert.match(subjectHtml, /計算演習/);
  assert.doesNotMatch(subjectHtml, /まだ教材がありません/);
  const cardsHtml = await legacyCardsResponse.text();
  assert.match(cardsHtml, /CARD SEARCH/);
  assert.match(cardsHtml, /aria-autocomplete="list"/);
});

test("ships layer filtering, autocomplete card search, rapid drills, and balanced review", async () => {
  const [networkCardsPage, globalCardSearch, rapidData, rapidDrill, overallChallenge] = await Promise.all([
    readFile(new URL("../app/subjects/network/cards/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/card-search.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/rapid-quiz-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/rapid-answer-drill.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/comprehensive-challenge.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(networkCardsPage, /レイヤーで絞り込み/);
  assert.match(networkCardsPage, /type LayerFilter = Layer\[\]/);
  assert.match(networkCardsPage, /Array\.isArray\(value\)/);
  assert.match(networkCardsPage, /typeof value === "number"/);
  assert.match(networkCardsPage, /cardLayers\(card\)\.some\(\(layer\) => selectedLayers\.includes\(layer\)\)/);
  assert.match(networkCardsPage, /selectedLayers\.includes\(layer\)/);
  assert.match(networkCardsPage, /複数選択できます/);
  assert.match(networkCardsPage, /memory-search-suggestions/);
  assert.match(networkCardsPage, /aria-autocomplete="list"/);
  assert.match(networkCardsPage, /exactProtocolScore/);
  assert.match(globalCardSearch, /全教科の暗記帳検索/);
  assert.match(globalCardSearch, /type SubjectFilter = SubjectId\[\]/);
  assert.match(globalCardSearch, /selectedSubjects\.includes\(card\.subjectId\)/);
  assert.match(globalCardSearch, /function toggleSubject/);
  assert.match(globalCardSearch, /複数選択可/);
  assert.match(globalCardSearch, /function fuzzyScore/);
  assert.match(globalCardSearch, /function exactMatchScore/);
  assert.match(globalCardSearch, /card-search-suggestions/);
  assert.match(globalCardSearch, /role="combobox"/);
  assert.match(globalCardSearch, /role="listbox"/);
  assert.match(globalCardSearch, /handleSearchKeyDown/);
  assert.match(globalCardSearch, /nativeEvent\.isComposing/);
  assert.doesNotMatch(globalCardSearch, /const \[fuzzy/);
  assert.doesNotMatch(globalCardSearch, /card-search-results/);
  assert.doesNotMatch(globalCardSearch, /eval\(|new Function|Function\(/);
  assert.match(rapidDrill, /全問題の振り返り/);
  assert.match(rapidDrill, /間違えた問題の暗記帳へ/);
  assert.match(rapidData, /createBalancedRapidSession/);
  assert.match(overallChallenge, /normalizeOverallQuestionCount/);
  assert.match(overallChallenge, /最大\{COMPREHENSIVE_MAX_QUESTIONS\}問/);
  assert.match(overallChallenge, /英語546問を一通り出題/);
  assert.match(overallChallenge, /9教科の得意・不得意/);
  assert.match(overallChallenge, /全\{runner\.results\.length\}問の振り返り/);
});

test("ships a named D1-backed streak leaderboard with account or device identity and no exposed identifiers", async () => {
  const [route, hosting, rankingData, accountSync] = await Promise.all([
    readFile(new URL("../app/api/leaderboard/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../app/rapid-ranking-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/account-sync.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(route, /SHA-256/);
  assert.match(route, /RAPID_CLIENT_TOKEN_HEADER/);
  assert.match(route, /normalizeRankingName/);
  assert.match(route, /sameSiteWriteAllowed/);
  assert.match(route, /export async function PUT/);
  assert.match(route, /official_ranking_sessions/);
  assert.match(route, /official_ranking_entries/);
  assert.match(route, /scoreOfficialRankingAnswer/);
  assert.match(route, /updateOfficialRankingStreak/);
  assert.match(route, /current_attempt_id/);
  assert.doesNotMatch(route, /env\.DB|SELECT[^;]*email/is);
  assert.doesNotMatch(route, /Response\.json\([^)]*userKey/);
  assert.match(hosting, /"r2": "STUDY_SNAPSHOTS"/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(rankingData, /test-grid:rapid-rankings:v1/);
  assert.match(rankingData, /playerName: string/);
  assert.match(rankingData, /normalizeRapidPlayerName/);
  assert.match(accountSync, /mergeRapidHistories/);
  assert.match(accountSync, /mergeRapidRankingProfiles/);
});

test("ships the applied-math graph break as a safe, exam-excluded interactive lab", async () => {
  const [graphLab, appliedPage] = await Promise.all([
    readFile(new URL("../app/applied-math-graph-lab.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/subjects/subject-8/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(graphLab, /SafeExpressionParser/);
  assert.match(graphLab, /グラフは今回のテストに出ません/);
  assert.match(graphLab, /範囲プリセット/);
  assert.match(graphLab, /自由入力/);
  assert.match(graphLab, /資料不一致/);
  assert.match(graphLab, /function-2d/);
  assert.match(graphLab, /surface-3d/);
  assert.match(graphLab, /vector-2d/);
  assert.match(graphLab, /addEventListener\("wheel", handleWheel, \{ passive: false \}\)/);
  assert.match(graphLab, /activePointersRef/);
  assert.match(graphLab, /pinchDistanceRef/);
  assert.match(graphLab, /Math\.hypot/);
  assert.match(graphLab, /event\.pointerType === "mouse" && event\.button !== 0/);
  assert.match(graphLab, /zoomedBoundsFor2D/);
  assert.match(graphLab, /draw2DGrid\(context, width, height, visibleBounds, project\)/);
  assert.match(graphLab, /ドラッグで回転/);
  assert.match(graphLab, /ホイール／トラックパッド／ピンチで拡大縮小/);
  assert.doesNotMatch(graphLab, /aria-label="(?:左|右|上|下)へ回転"/);
  assert.doesNotMatch(graphLab, /eval\s*\(|new\s+Function|Function\s*\(/);
  assert.match(appliedPage, /mode === "graph"/);
  assert.match(appliedPage, /<AppliedMathGraphLab/);
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
  assert.match(networkPage, /cardLayers\(/);
  assert.match(networkPage, /cardLayerLabel\(/);
  assert.match(networkPage, /href="\/rapid\/network"/);
  assert.match(networkPage, /時間制限つき層即答（練習）/);
  assert.match(networkPage, /層を即答・連続正解の練習/);
  assert.match(networkPage, /href="\/ranking\/network"/);
  assert.match(networkPage, /ネットワーク連続正解ランキング/);
  assert.doesNotMatch(networkPage, /type Mode|mode ===|identifyLimit|finishIdentify|phase === "identify"|id="identify-limit"/);
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
  assert.match(englishPage, /COURSE_UNITS\.map/);
  assert.match(englishPage, /english-chapter-filter/);
  assert.match(englishPage, /questionPassage/);
  assert.match(englishData, /Chapter 15/);
  assert.match(englishData, /passage-wheelchair/);
  assert.match(englishData, /passage\.unit !== "ch19"/);
  assert.match(englishData, /VOCAB_QUESTIONS/);
  assert.match(englishData, /ORDER_QUESTIONS/);
  assert.match(studyData, /ZIP教材のCh\.15・16・18を収録/);
  assert.match(studyData, /ZIP教材のCh\.15・16・18・19を収録・過去問は形式だけ反映/);
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
