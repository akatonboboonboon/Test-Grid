import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const appUrl = new URL("../app/", import.meta.url);

function evaluateTypeScript(source, filename, dependencies = {}) {
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  }).outputText;
  const exportsObject = {};
  const localRequire = (specifier) => {
    if (Object.hasOwn(dependencies, specifier)) return dependencies[specifier];
    throw new Error(`Unexpected import ${specifier} while evaluating ${filename}`);
  };
  new Function("exports", "require", `${javascript}\n//# sourceURL=${filename}`)(exportsObject, localRequire);
  return exportsObject;
}

async function loadQuizModules() {
  const [dataSource, componentSource] = await Promise.all([
    readFile(new URL("english-ch18-quiz-data.ts", appUrl), "utf8"),
    readFile(new URL("english-ch18-quiz.tsx", appUrl), "utf8"),
  ]);
  const data = evaluateTypeScript(dataSource, "english-ch18-quiz-data.ts");
  const component = evaluateTypeScript(componentSource, "english-ch18-quiz.tsx", {
    react: {},
    "react/jsx-runtime": {},
    "./english-ch18-quiz-data": data,
    "./english-ch18-quiz.module.css": {},
  });
  return { data, component, componentSource };
}

test("Chapter 18 actual quiz faithfully keeps five major questions and 18 one-point blanks", async () => {
  const { data } = await loadQuizModules();
  const items = data.ENGLISH_CH18_QUIZ_ITEMS;
  const sections = data.ENGLISH_CH18_QUIZ_SECTIONS;

  assert.equal(data.ENGLISH_CH18_QUIZ_TOTAL_POINTS, 18);
  assert.equal(items.length, 18);
  assert.equal(new Set(items.map((item) => item.id)).size, 18);
  assert.equal(new Set(sections.map((section) => section.questionNumber)).size, 5);
  assert.deepEqual(
    Object.fromEntries(sections.map((section) => [section.id, items.filter((item) => item.section === section.id).length])),
    { q1: 2, q2: 1, q3a: 3, q3b: 4, q3c: 5, q4: 2, q5: 1 },
  );

  for (const item of items) {
    assert.ok(item.prompt.length >= 3, `${item.id} needs its displayed prompt`);
    assert.ok(item.answer.length >= 1, `${item.id} needs an answer`);
    assert.ok(item.accepted.includes(item.answer), `${item.id} must accept its model answer`);
    assert.ok(item.explanation.length >= 80, `${item.id} needs a detailed explanation`);
    assert.ok(item.reference.includes("Chapter 18"), `${item.id} needs a source reference`);
  }

  const q2 = sections.find((section) => section.id === "q2");
  assert.match(q2.source, /Technologies needed for robot wheelchairs/);
  assert.match(q2.source, /when the users think about a direction/);
  assert.deepEqual(
    sections.filter((section) => section.questionNumber === 3).map((section) => section.id),
    ["q3a", "q3b", "q3c"],
  );
  assert.match(items.find((item) => item.section === "q3a").reference, /第2段落/);
  assert.match(items.find((item) => item.section === "q3b").reference, /第7段落/);
  assert.match(items.find((item) => item.section === "q3c").reference, /第9段落/);
  assert.equal(items.find((item) => item.section === "q5").answer, "The user detects obstacles via a network.");
});

test("Chapter 18 quiz accepts the actual-paper Japanese nuances and keeps manual override", async () => {
  const { data, component, componentSource } = await loadQuizModules();
  const items = data.ENGLISH_CH18_QUIZ_ITEMS;
  const byId = (id) => items.find((item) => item.id === id);
  const isCorrect = component.isEnglishCh18QuizAnswerCorrect;

  assert.equal(isCorrect(byId("ch18-quiz18-q4-2"), "予想する"), true);
  assert.equal(isCorrect(byId("ch18-quiz18-q4-1"), "段差のある"), true);
  assert.equal(isCorrect(byId("ch18-quiz18-q3a-2"), "人手不足"), true);
  assert.equal(isCorrect(byId("ch18-quiz18-q3a-3"), "実際に使われるようになる"), true);
  assert.equal(isCorrect(byId("ch18-quiz18-q5-1"), "The user detects obstacles via a network"), true);
  assert.equal(isCorrect(byId("ch18-quiz18-q2-1"), "by"), false);

  assert.match(componentSource, /意味は合っていた → 正解にする/);
  assert.match(componentSource, /ENGLISH_CH18_QUIZ_STORAGE_KEY/);
  assert.match(componentSource, /途中保存/);
  assert.match(componentSource, /保存内容を復元/);
  assert.match(componentSource, /本当にリセット/);
});

test("English page exposes the actual quiz clearly and syncs the newest saved attempt", async () => {
  const [page, styles, accountSync] = await Promise.all([
    readFile(new URL("subjects/subject-2/page.tsx", appUrl), "utf8"),
    readFile(new URL("english-ch18-quiz.module.css", appUrl), "utf8"),
    readFile(new URL("account-sync.tsx", appUrl), "utf8"),
  ]);

  assert.match(page, /type Mode = .*"quiz18"/);
  assert.match(page, /import EnglishCh18Quiz/);
  assert.match(page, /Ch\.18 実物小テスト（18点）/);
  assert.match(page, /<EnglishCh18Quiz \/>/);
  assert.match(page, /english-primary-tabs/);
  assert.match(styles, /@media/);
  assert.match(styles, /min-width:\s*44px|min-height:\s*44px/);
  assert.match(accountSync, /ch18-quiz18:v1/);
  assert.match(accountSync, /updatedAt/);
});
