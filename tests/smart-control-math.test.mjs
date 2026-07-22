import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { importTypeScriptGraph } from "./helpers/import-typescript-graph.mjs";

function compileDataModule(source) {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
}

function importDataModule(source) {
  const javascript = compileDataModule(source);
  return import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
}

function walk(value, visit, path = "root") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  visit(value, path);
  for (const [key, child] of Object.entries(value)) walk(child, visit, `${path}.${key}`);
}

function displayedStrings(owner) {
  const values = [];
  for (const field of ["prompt", "answer", "explanation", "example", "cue", "context"]) {
    if (typeof owner[field] === "string") values.push([field, owner[field]]);
  }
  for (const field of ["steps", "options"]) {
    for (const [index, value] of (owner[field] ?? []).entries()) {
      if (typeof value === "string") values.push([`${field}[${index}]`, value]);
    }
  }
  return values;
}

const textbookSourcePromise = readFile(new URL("../app/smart-control-textbook-data.ts", import.meta.url), "utf8");

test("smart-control formulas use TeX fractions instead of slash-style pseudo math", async () => {
  const [textbookSource, katex] = await Promise.all([
    textbookSourcePromise,
    import(new URL("../app/vendor/katex/katex.mjs", import.meta.url)),
  ]);
  const [smart, textbook] = await Promise.all([
    importTypeScriptGraph("../app/smart-control-data.ts", import.meta.url),
    importDataModule(textbookSource),
  ]);
  const corpus = [
    smart.SMART_CONTROL_CARDS,
    smart.SMART_CONTROL_QUESTIONS,
    smart.SMART_CONTROL_EXAMS,
    textbook.TEXTBOOK_RESPONSE_CARDS,
    textbook.TEXTBOOK_RESPONSE_QUESTIONS,
  ];

  let formulaCount = 0;
  let inlineMathCount = 0;
  walk(corpus, (owner, path) => {
    if (typeof owner.formula === "string") {
      formulaCount += 1;
      assert.doesNotMatch(owner.formula, /\/|\[/, `${path}.formula must use \\frac rather than slash or square-bracket fractions`);
      assert.doesNotThrow(() => katex.renderToString(owner.formula, {
        displayMode: true,
        output: "htmlAndMathml",
        strict: "error",
        throwOnError: true,
        trust: false,
      }), `${path}.formula must be valid TeX`);
    }

    for (const [field, value] of displayedStrings(owner)) {
      for (const match of value.matchAll(/\\\(([\s\S]*?)\\\)/g)) {
        inlineMathCount += 1;
        assert.doesNotMatch(match[1], /\/|\[|dH\/dt/, `${path}.${field} contains horizontal pseudo math`);
        assert.doesNotThrow(() => katex.renderToString(match[1], {
          displayMode: false,
          output: "htmlAndMathml",
          strict: "error",
          throwOnError: true,
          trust: false,
        }), `${path}.${field} contains invalid inline TeX`);
      }
    }
  });

  assert.ok(formulaCount >= 75, "the audit must cover every smart-control formula and predicted exam");
  assert.ok(inlineMathCount >= 150, "the audit must cover prompts, answers, choices, steps, explanations, and cues");
  assert.match(smart.SMART_CONTROL_CARDS.find((card) => card.id === "smart-first-order-impulse").prompt, /G\(s\)=\\frac\{K\}\{Ts\+1\}/);
  assert.match(smart.SMART_CONTROL_QUESTIONS.find((question) => question.id === "smart-major-feedback-type1-chain").formula, /\\frac\{G\}\{1\+GH\}/);
  assert.match(textbook.TEXTBOOK_RESPONSE_QUESTIONS.find((question) => question.id === "textbook-response-q07-overshoot-formula").answer, /\\frac/);
});

test("smart-control formula surfaces use the shared responsive math renderer", async () => {
  const [page, exams, css] = await Promise.all([
    readFile(new URL("../app/subjects/subject-6/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/smart-control-exams.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<DisplayMath tex=\{currentCard\.formula\}/);
  assert.match(page, /cardFlipped \? <RichMathText text=\{currentCard\.cue\}/);
  assert.match(exams, /<DisplayMath tex=\{question\.formula\}/);
  assert.match(exams, /<RichMathText text=\{question\.prompt\}/);
  assert.match(css, /\.statistics-math-display\s*\{[\s\S]*?overflow-x:\s*auto/);
  assert.match(css, /\.statistics-rich-math-display-segment\s*\{[\s\S]*?overflow-x:\s*auto/);
  assert.match(css, /font-size:\s*clamp\(15px,\s*4\.8vw,\s*21px\)/);
});
