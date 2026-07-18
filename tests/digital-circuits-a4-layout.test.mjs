import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const expectedUrl = new URL("../app/digital-circuits-expected-exams.tsx", import.meta.url);
const cssUrl = new URL("../app/digital-circuits.module.css", import.meta.url);

test("problem pages budget two questions and solution pages budget one explanation per physical A4 page", async () => {
  const source = await readFile(expectedUrl, "utf8");

  assert.match(source, /const QUESTIONS_PER_PAPER = 2/);
  assert.match(source, /function examPages\(exam: Exam, perPage = QUESTIONS_PER_PAPER\)/);
  assert.match(source, /Math\.ceil\(items\.length \/ perPage\)/);
  assert.match(source, /const pages = examPages\(exam, 1\)/);
  assert.match(source, /data-book="problems"/);
  assert.match(source, /data-book="solutions"/);
  assert.match(source, /pageIndex \+ 1} \/ {pages\.length}/);
  assert.doesNotMatch(source, /const groups = \[exam\.sections\.slice/);
});

test("problem pages expose only necessary blank figures while solution overlays stay in the answer book", async () => {
  const source = await readFile(expectedUrl, "utf8");
  const problemBook = source.slice(source.indexOf("function ExamPapers"), source.indexOf("function SolutionBook"));
  const solutionBook = source.slice(source.indexOf("function SolutionBook"));

  assert.match(source, /function needsQuestionFigure/);
  assert.match(problemBook, /needsQuestionFigure\(question\)/);
  assert.match(problemBook, /DigitalCircuitStudyDiagram kind=\{question\.diagram\} title="解答用図" compact/);
  assert.doesNotMatch(problemBook, /<DigitalCircuitStudyDiagram[^>]*\bsolution\b/);
  assert.match(solutionBook, /DigitalCircuitStudyDiagram kind=\{question\.diagram\} solution title="模範図・読み方" compact/);
});

test("A4 CSS gives every page, figure, and answer area an explicit height budget", async () => {
  const css = await readFile(cssUrl, "utf8");

  assert.match(css, /\.examPaper\{[^}]*height:297mm[^}]*display:flex[^}]*break-after:page/);
  assert.match(css, /\.examPaper:last-child\{break-after:auto;page-break-after:auto\}/);
  assert.match(css, /grid-template-rows:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /\.solutionPaper \.examPageBody\{grid-template-rows:minmax\(0,1fr\)/);
  assert.match(css, /\.examQuestionFigure\{[^}]*height:38mm/);
  assert.match(css, /\.examQuestion textarea\{[^}]*max-height:18mm/);
  assert.match(css, /\.examAnswerLines\{[^}]*height:18mm/);
  assert.doesNotMatch(css, /\.solutionItem\{[^}]*overflow:hidden/);
  assert.match(css, /@media\(max-width:820px\)[^{]*\{[\s\S]*?\.examPaper\{height:auto/);
  assert.match(css, /@page\{size:A4 portrait;margin:0\}/);
});

test("setup renders either the problem book or the answer book for printing, never both", async () => {
  const source = await readFile(expectedUrl, "utf8");

  assert.match(source, /\{printAnswers\s*\?\s*<SolutionBook exam=\{exam\} \/>\s*:\s*<ExamPapers/);
  assert.doesNotMatch(source, /display:\s*printAnswers\s*\?\s*"block"/);
});
