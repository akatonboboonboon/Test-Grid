import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readRanking = () => readFile(new URL("../app/official-ranking-test.tsx", import.meta.url), "utf8");

test("official ranking maps network keys to L1-L7 and four-choice keys by displayed order", async () => {
  const source = await readRanking();

  assert.match(source, /question\.subjectId === "network"[\s\S]*?option\.trim\(\)\.toUpperCase\(\) === `L\$\{number\}`/);
  assert.match(source, /question\.options\.length === 4 && number <= 4[\s\S]*?question\.options\[number - 1\]/);
  assert.match(source, /currentQuestion\.options\.map\(\(option, optionIndex\) =>/);
  assert.match(source, /officialRankingOptionShortcut\(currentQuestion, option, optionIndex\)/);
  assert.match(source, /aria-keyshortcuts=\{shortcut \?\? undefined\}/);
  assert.match(source, /className="rapid-option-shortcut"/);
  assert.match(source, /数字キーでも回答できます/);
});

test("official ranking keyboard handler ignores typing and cannot mutate a submitted answer", async () => {
  const source = await readRanking();

  assert.match(source, /target\.matches\("input, textarea, select"\)/);
  assert.match(source, /target\.isContentEditable/);
  assert.match(source, /event\.repeat/);
  assert.match(source, /event\.isComposing/);
  assert.match(source, /event\.keyCode === 229/);
  assert.match(source, /event\.altKey[\s\S]*?event\.ctrlKey[\s\S]*?event\.metaKey[\s\S]*?event\.shiftKey/);
  assert.match(source, /submissionLockedRef\.current[\s\S]*?isEditableRankingKeyTarget/);
  assert.match(source, /event\.preventDefault\(\);[\s\S]*?selectAnswer\(selected\)/);
  assert.match(source, /window\.addEventListener\("keydown", handleRankingNumberKey\)/);
  assert.match(source, /window\.removeEventListener\("keydown", handleRankingNumberKey\)/);
  assert.match(source, /if \(phase !== "playing" \|\| !currentQuestion \|\| submissionLockedRef\.current\) return/);
  assert.match(source, /answersRef\.current\.map/);
});

test("official ranking choices use the same dynamic one-row layout as free rapid practice", async () => {
  const [source, css] = await Promise.all([
    readRanking(),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(source, /style=\{\{ "--rapid-option-count": currentQuestion\.options\.length \} as CSSProperties\}/);
  assert.match(css, /\.rapid-options\s*\{[\s\S]*?grid-template-columns:\s*repeat\(var\(--rapid-option-count, 4\), minmax\(0, 1fr\)\)/);
  assert.match(css, /@media\s*\(max-width:\s*800px\)[\s\S]*?\.rapid-options\s*\{[\s\S]*?repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media\s*\(max-width:\s*560px\)[\s\S]*?\.rapid-options\s*\{[\s\S]*?repeat\(2, minmax\(0, 1fr\)\)/);
});
