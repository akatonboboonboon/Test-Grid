import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const appUrl = new URL("../app/", import.meta.url);

function evaluateTypeScript(source, filename) {
  const exportsObject = {};
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  }).outputText;
  new Function("exports", "require", `${javascript}\n//# sourceURL=${filename}`)(
    exportsObject,
    (specifier) => {
      throw new Error(`Unexpected import ${specifier} while evaluating ${filename}`);
    },
  );
  return exportsObject;
}

test("English Chapter selections normalize legacy values and use OR semantics", async () => {
  const source = await readFile(new URL("english-chapter-filter.ts", appUrl), "utf8");
  const {
    chapterMatches,
    normalizeChapterSelection,
    toggleChapterSelection,
  } = evaluateTypeScript(source, "english-chapter-filter.ts");
  const allowed = ["ch14", "ch15", "ch16", "ch18", "toeic", "housing", "medical"];

  assert.deepEqual(normalizeChapterSelection("all", allowed), []);
  assert.deepEqual(normalizeChapterSelection("ch16", allowed), ["ch16"]);
  assert.deepEqual(
    normalizeChapterSelection(["medical", "ch15", "medical", "ch19"], allowed),
    ["ch15", "medical"],
  );
  assert.equal(chapterMatches("ch15", []), true, "empty selection means all active Chapters");
  assert.equal(chapterMatches("ch15", ["ch15", "ch18"]), true);
  assert.equal(chapterMatches("ch16", ["ch15", "ch18"]), false);
  assert.deepEqual(toggleChapterSelection(["ch15"], "ch18", allowed), ["ch15", "ch18"]);
  assert.deepEqual(toggleChapterSelection(["ch15", "ch18"], "ch15", allowed), ["ch18"]);
});

test("English cards, mock tests, and reading practice expose independent multi-Chapter controls", async () => {
  const page = await readFile(new URL("subjects/subject-2/page.tsx", appUrl), "utf8");

  assert.match(page, /cardUnits\.includes\(unit\.id\)/);
  assert.match(page, /testUnits\.includes\(unit\.id\)/);
  assert.match(page, /readingUnits\.includes\(unit\.id\)/);
  assert.match(page, /範囲タグ（複数選択可）/);
  assert.match(page, /chapterMatches\(card\.unit, cardUnits\)/);
  assert.match(page, /chapterMatches\(question\.unit, testUnits\)/);
  assert.match(page, /chapterMatches\(question\.unit, readingUnits\)/);
  assert.match(page, /Array\.isArray\(parsed\.testUnits\) \? parsed\.testUnits : parsed\.testUnit/);
  assert.match(page, /version: 2/);
});

test("English Chapter 19 stays outside every selectable and study data set", async () => {
  const source = await readFile(new URL("english-data.ts", appUrl), "utf8");
  const { ENGLISH_PASSAGES, ENGLISH_QUESTIONS, ENGLISH_UNITS, ENGLISH_VOCAB } =
    evaluateTypeScript(source, "english-data.ts");

  assert.deepEqual(ENGLISH_UNITS.map((unit) => unit.id), ["ch14", "ch15", "ch16", "ch18", "toeic", "housing", "medical"]);
  for (const [label, items] of [
    ["vocab", ENGLISH_VOCAB],
    ["questions", ENGLISH_QUESTIONS],
    ["passages", ENGLISH_PASSAGES],
  ]) {
    assert.equal(
      items.some((item) => item.unit === "ch19"),
      false,
      `${label} must keep Chapter 19 excluded`,
    );
  }
});
