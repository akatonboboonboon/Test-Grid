import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const FORMAT_URL = new URL("../app/rapid-answer-format.ts", import.meta.url);
const RENDERER_URL = new URL("../app/rapid-answer-text.tsx", import.meta.url);
const RAPID_CLIENT_URLS = [
  new URL("../app/rapid-answer-drill.tsx", import.meta.url),
  new URL("../app/comprehensive-challenge.tsx", import.meta.url),
];

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

test("rapid answer formatting distinguishes pure TeX from mixed rich text per value", async () => {
  const source = await readFile(FORMAT_URL, "utf8");
  const { isPureRapidTex } = await import(dataUrl(compile(source)));

  assert.equal(isPureRapidTex(String.raw`\frac{1}{2}`, true), true);
  assert.equal(isPureRapidTex(String.raw`(3,1,-1)`, true), true);
  assert.equal(isPureRapidTex(String.raw`\(\frac{1}{2}\)`, true), false);
  assert.equal(isPureRapidTex(`\u9762\u7a4d ${String.raw`\(\frac{\sqrt{369}}{2}\)`}`, true), false);
  assert.equal(isPureRapidTex("stable", true), false);
  assert.equal(isPureRapidTex(String.raw`\frac{1}{2}`, false), false);
});

test("rapid choices, feedback, and review share the per-value answer renderer", async () => {
  const renderer = await readFile(RENDERER_URL, "utf8");
  assert.match(renderer, /if \(isPureRapidTex\(value, mathOptions\)\)/);
  assert.match(renderer, /<InlineMath tex=\{unwrapRapidMath\(value\)\} \/>/);
  assert.match(renderer, /<RichMathText text=\{value\} \/>/);

  for (const url of RAPID_CLIENT_URLS) {
    const source = await readFile(url, "utf8");
    assert.match(source, /import RapidAnswerText from "\.\/rapid-answer-text";/);
    assert.match(source, /<RapidAnswerText value=\{option\} mathOptions=\{currentQuestion\.mathOptions\} \/>/);
    assert.match(source, /<RapidAnswerText value=\{currentQuestion\.answer\} mathOptions=\{currentQuestion\.mathOptions\} emphasizeRichText \/>/);
    assert.match(source, /<RapidAnswerText value=\{result\.selected\} mathOptions=\{result\.question\.mathOptions\} \/>/);
    assert.match(source, /<RapidAnswerText value=\{result\.question\.answer\} mathOptions=\{result\.question\.mathOptions\} emphasizeRichText \/>/);
    assert.doesNotMatch(source, /currentQuestion\.mathOptions \? <InlineMath/);
  }
});
