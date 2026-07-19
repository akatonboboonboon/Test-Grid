import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (file) => readFile(new URL(`../app/${file}`, import.meta.url), "utf8");

test("rapid answers map layer number keys directly and four-choice keys by displayed order", async () => {
  const source = await read("rapid-answer-drill.tsx");

  assert.match(source, /question\.subjectId === "network"[\s\S]*?option\.trim\(\)\.toUpperCase\(\) === `L\$\{number\}`/);
  assert.match(source, /question\.options\.length === 4 && number <= 4[\s\S]*?question\.options\[number - 1\]/);
  assert.match(source, /currentQuestion\.options\.map\(\(option, optionIndex\) =>/);
  assert.match(source, /aria-keyshortcuts=\{shortcut \?\? undefined\}/);
  assert.match(source, /className="rapid-option-shortcut"/);
  assert.match(source, /数字キーでも回答できます/);
});

test("rapid keyboard handler ignores typing, composition, modifiers, and repeated keydown", async () => {
  const source = await read("rapid-answer-drill.tsx");

  assert.match(source, /target\.matches\("input, textarea, select"\)/);
  assert.match(source, /target\.isContentEditable/);
  assert.match(source, /event\.repeat/);
  assert.match(source, /event\.isComposing/);
  assert.match(source, /event\.keyCode === 229/);
  assert.match(source, /event\.altKey[\s\S]*?event\.ctrlKey[\s\S]*?event\.metaKey[\s\S]*?event\.shiftKey/);
  assert.match(source, /event\.preventDefault\(\);[\s\S]*?answer\(selected\)/);
  assert.match(source, /answerLockRef\.current/);
  assert.match(source, /window\.addEventListener\("keydown", handleNumberKey\)/);
  assert.match(source, /window\.removeEventListener\("keydown", handleNumberKey\)/);
});

test("rapid options use one desktop row and equal-width responsive wrapping", async () => {
  const css = await read("globals.css");

  assert.match(css, /\.rapid-options\s*\{[\s\S]*?grid-template-columns:\s*repeat\(var\(--rapid-option-count, 4\), minmax\(0, 1fr\)\)/);
  assert.match(css, /@media\s*\(max-width:\s*800px\)[\s\S]*?\.rapid-options\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media\s*\(max-width:\s*560px\)[\s\S]*?\.rapid-options\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.rapid-options button\s*\{[\s\S]*?min-width:\s*0/);
});
