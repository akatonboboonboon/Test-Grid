import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

function importTypeScript(source) {
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import("data:text/javascript;base64," + Buffer.from(javascript).toString("base64"));
}

const figureDataSource = readFile(new URL("../app/smart-control-figure-data.ts", import.meta.url), "utf8");
const smartDataSource = readFile(new URL("../app/smart-control-data.ts", import.meta.url), "utf8");
const textbookDataSource = readFile(new URL("../app/smart-control-textbook-data.ts", import.meta.url), "utf8");

test("maps every diagram-dependent smart-control drill and predicted-paper item", async () => {
  const [figureData, smartData, textbookData, katex] = await Promise.all([
    figureDataSource.then(importTypeScript),
    smartDataSource.then(importTypeScript),
    textbookDataSource.then(importTypeScript),
    import(new URL("../app/vendor/katex/katex.mjs", import.meta.url)),
  ]);
  const mapping = figureData.SMART_CONTROL_DIAGRAM_BY_ITEM_ID;
  const supported = new Set(figureData.SMART_CONTROL_DIAGRAM_IDS);

  assert.deepEqual(new Set(Object.values(mapping)), supported, "every renderer family must be exercised by real material");
  for (const [diagramId, tex] of Object.entries(figureData.SMART_CONTROL_DIAGRAM_SOLUTION_TEX)) {
    assert.doesNotMatch(tex, /\//, diagramId + " must use TeX fractions instead of slash-style pseudo math");
    assert.doesNotThrow(
      () => katex.renderToString(tex, { displayMode: true, strict: "error", throwOnError: true, trust: false }),
      diagramId + " must contain valid display TeX",
    );
  }
  assert.ok(
    smartData.SMART_CONTROL_QUESTIONS
      .filter((question) => ["response-stability", "feedback", "block-diagram"].includes(question.topic))
      .every((question) => mapping[question.id]),
    "all pole, response, feedback, and block-diagram practice questions need an exact figure link",
  );
  assert.ok(
    textbookData.TEXTBOOK_RESPONSE_QUESTIONS.every((question) => mapping[question.id]),
    "all textbook response drills need their figure 5.1, 5.2, or 5.3 context",
  );

  const expectedPaperIds = [
    "smart-exam-1-q1", "smart-exam-1-q3", "smart-exam-1-q4",
    "smart-exam-2-q1", "smart-exam-2-q3", "smart-exam-2-q4",
    "smart-exam-3-q3", "smart-exam-3-q4",
    "smart-exam-4-q3", "smart-exam-4-q4",
    "smart-exam-5-q1", "smart-exam-5-q3", "smart-exam-5-q4",
    "smart-exam-6-q3", "smart-exam-6-q4",
  ];
  for (const id of expectedPaperIds) {
    assert.ok(mapping[id], id + " must display a problem-linked figure");
  }
});

test("renders response, pole-plane, feedback, and block figures without exposing solutions on the question face", async () => {
  const [renderer, graph, graphCss] = await Promise.all([
    readFile(new URL("../app/smart-control-diagrams.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/smart-control-response-graph.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/smart-control-response-graph.module.css", import.meta.url), "utf8"),
  ]);

  for (const component of ["ResponseComparison", "PolePlane", "Feedback", "Series", "Parallel", "Shift", "Nested"]) {
    assert.match(renderer, new RegExp("function " + component + "\\("));
  }
  assert.match(renderer, /role="img"/);
  assert.match(renderer, /solution \? "G⁻¹" : "？"/);
  assert.match(renderer, /solution \? "G" : "？"/);
  assert.match(renderer, /solution && <text/);
  assert.match(renderer, /answerVisibility=\{solution \? "shown" : "hidden"\}/);
  assert.match(renderer, /<DisplayMath tex=\{solutionTex\}/);

  assert.match(graph, /answerVisibility\?: "toggle" \| "hidden" \| "shown"/);
  assert.match(graph, /answerVisibility === "hidden"/);
  assert.match(graph, /answerVisibility === "toggle" && <button/);
  assert.match(graph, /compact\s*\?\s*clamp/);
  assert.match(graphCss, /\.compact \.tableWrap/);
  assert.match(graphCss, /display:\s*none/);
});

test("shows linked figures in cards, practice, random mock, review, and A4 expected exams", async () => {
  const [page, exams, examCss] = await Promise.all([
    readFile(new URL("../app/subjects/subject-6/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/smart-control-exams.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/smart-control-exams.module.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /function LinkedSmartControlDiagram/);
  assert.match(page, /item=\{currentCard\}/);
  assert.match(page, /item=\{currentPracticeQuestion\} title="問題図/);
  assert.match(page, /item=\{currentTestQuestion\} title="問題図/);
  assert.match(page, /item=\{result\.question\} solution title="振り返り用の模範図"/);
  assert.match(page, /item=\{question\} solution title="解説図・模範注記"/);

  const practicePrompt = page.indexOf("currentPracticeQuestion.prompt");
  const practiceFigure = page.indexOf('item={currentPracticeQuestion} title="問題図');
  const practiceAnswer = page.indexOf('idPrefix="practice"');
  assert.ok(practicePrompt < practiceFigure && practiceFigure < practiceAnswer, "the practice figure must appear before the answer controls");

  assert.match(exams, /function ExpectedExamDiagram/);
  assert.match(exams, /<ExpectedExamDiagram questionId=\{question\.id\} \/>/);
  assert.match(exams, /<ExpectedExamDiagram questionId=\{question\.id\} solution \/>/);
  assert.match(examCss, /\.diagram\s*\{/);
  assert.match(examCss, /@media print/);
});
