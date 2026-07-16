import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
}

function dataUrl(javascript) {
  return `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
}

let expectedModulePromise;

async function loadExpectedModule() {
  expectedModulePromise ??= Promise.all([
    readFile(new URL("../app/english-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/english-explanations-extra.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/english-explanations-language.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/english-explanations-reading.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/english-expected-exams-data.ts", import.meta.url), "utf8"),
  ]).then(([englishSource, extraSource, languageSource, readingSource, expectedSource]) => {
    const englishUrl = dataUrl(compile(englishSource));
    const extraUrl = dataUrl(compile(extraSource));
    const languageUrl = dataUrl(compile(languageSource).replaceAll('"./english-data"', JSON.stringify(englishUrl)));
    const readingUrl = dataUrl(compile(readingSource).replaceAll('"./english-data"', JSON.stringify(englishUrl)));
    const expectedJavascript = compile(expectedSource)
      .replaceAll('"./english-data"', JSON.stringify(englishUrl))
      .replaceAll('"./english-explanations-extra"', JSON.stringify(extraUrl))
      .replaceAll('"./english-explanations-language"', JSON.stringify(languageUrl))
      .replaceAll('"./english-explanations-reading"', JSON.stringify(readingUrl));
    return import(dataUrl(expectedJavascript));
  });
  return expectedModulePromise;
}

test("English expected exams provide six balanced 50-minute, 100-point papers", async () => {
  const {
    ENGLISH_EXPECTED_EXAMS,
    ENGLISH_EXPECTED_EXAM_DURATION_MINUTES,
    ENGLISH_EXPECTED_EXAM_TOTAL_POINTS,
  } = await loadExpectedModule();

  assert.equal(ENGLISH_EXPECTED_EXAM_DURATION_MINUTES, 50);
  assert.equal(ENGLISH_EXPECTED_EXAM_TOTAL_POINTS, 100);
  assert.equal(ENGLISH_EXPECTED_EXAMS.length, 6);

  const expectedSectionPoints = {
    "vocab-ja-en": 10,
    "vocab-en-ja": 10,
    language: 12,
    order: 15,
    "true-false": 18,
    reading: 15,
    translation: 20,
  };

  for (const exam of ENGLISH_EXPECTED_EXAMS) {
    assert.equal(exam.durationMinutes, 50, exam.id);
    assert.equal(exam.totalPoints, 100, exam.id);
    assert.equal(exam.questions.length, 29, exam.id);
    assert.equal(exam.questions.reduce((sum, question) => sum + question.points, 0), 100, exam.id);
    assert.deepEqual(new Set(exam.questions.map((question) => question.unit)), new Set(["ch15", "ch16", "ch18"]), exam.id);

    for (const [section, points] of Object.entries(expectedSectionPoints)) {
      assert.equal(
        exam.questions.filter((question) => question.section === section).reduce((sum, question) => sum + question.points, 0),
        points,
        `${exam.id}:${section}`,
      );
    }

    const translations = exam.questions.filter((question) => question.section === "translation");
    assert.equal(translations.length, 3, exam.id);
    assert.deepEqual(new Set(translations.map((question) => question.unit)), new Set(["ch15", "ch16", "ch18"]), exam.id);
    assert.equal(translations.reduce((sum, question) => sum + question.points, 0), 20, exam.id);

    for (const question of exam.questions) {
      assert.ok(question.explanation.length >= 20, `${exam.id}:${question.sourceId} explanation`);
      assert.ok(question.reference.label.length > 0, `${exam.id}:${question.sourceId} reference`);
      assert.ok(!question.sourceId.toLocaleLowerCase("en").includes("ch19"), `${exam.id}:${question.sourceId}`);
    }
  }
});

test("weather-homepage questions require the source figure in papers and explanations", async () => {
  const { ENGLISH_EXPECTED_EXAMS } = await loadExpectedModule();
  const weatherExams = ENGLISH_EXPECTED_EXAMS.filter((exam) => (
    exam.questions.some((question) => question.sourceId.startsWith("ch16-homepage-"))
  ));
  assert.equal(weatherExams.length, 3);
  for (const exam of weatherExams) {
    assert.equal(
      exam.questions.filter((question) => question.sourceId.startsWith("ch16-homepage-")).length,
      1,
      `${exam.id} should render one weather-homepage source figure`,
    );
  }

  const component = await readFile(new URL("../app/english-expected-exams.tsx", import.meta.url), "utf8");
  assert.match(component, /import EnglishWeatherFigure from "\.\/english-weather-figure"/);
  assert.match(component, /sourceId\.startsWith\("ch16-homepage-"\)/);
  assert.ok((component.match(/<EnglishWeatherFigure\s*\/>/g) ?? []).length >= 2, "figure must appear in the paper and answer review");
});

test("expected exam print stylesheet declares A4 paper and question-only mode", async () => {
  const [dataSource, componentSource, cssSource] = await Promise.all([
    readFile(new URL("../app/english-expected-exams-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/english-expected-exams.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/english-expected-exams.module.css", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(dataSource, /ch19/i);
  assert.match(componentSource, /ENGLISH_EXPECTED_EXAM_STORAGE_KEY/);
  assert.match(componentSource, /remainingSeconds/);
  assert.match(componentSource, /window\.print\(\)/);
  assert.match(cssSource, /@page\s*\{/);
  assert.match(cssSource, /size:\s*A4 portrait/);
  assert.match(cssSource, /\.printQuestions\s+\.answerBook/);
});

test("expected exam mode is prominent while existing English practice stays available", async () => {
  const [pageSource, componentSource, cssSource, globalsSource] = await Promise.all([
    readFile(new URL("../app/subjects/subject-2/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/english-expected-exams.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/english-expected-exams.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(pageSource, /import EnglishExpectedExams from "\.\.\/\.\.\/english-expected-exams"/);
  assert.match(pageSource, /type Mode = [^;]*"expected"/);
  assert.match(pageSource, /② 予想模試（6セット・50分）/);
  assert.match(pageSource, /③ Ch\.18 実物小テスト（18点）/);
  assert.match(pageSource, /④ ランダム模試/);
  assert.match(pageSource, /<EnglishExpectedExams\s*\/>/);
  assert.match(pageSource, /<EnglishCh18Quiz\s*\/>/);

  assert.match(componentSource, /const FULL_DURATION_SECONDS = 50 \* 60/);
  assert.ok((componentSource.match(/score >= 60/g) ?? []).length >= 2, "the 60-point pass line must drive the result UI");
  assert.match(componentSource, /中断して保存/);
  assert.match(componentSource, /続きから再開/);
  assert.match(cssSource, /\.weatherFigurePaper/);
  assert.match(cssSource, /\.weatherFigureReview/);
  assert.match(globalsSource, /\.english-primary-tabs\s*\{[^}]*repeat\(6,/s);
  assert.match(globalsSource, /\.english-tabs \.english-tab-expected/);
});
