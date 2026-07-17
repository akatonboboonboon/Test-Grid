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

function toDataUrl(javascript) {
  return "data:text/javascript;base64," + Buffer.from(javascript).toString("base64");
}

async function loadStatisticsData() {
  const [mainSource, pdf12Source, pdf34Source] = await Promise.all([
    readFile(new URL("../app/statistics-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/statistics-pdf12-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/statistics-pdf34-data.ts", import.meta.url), "utf8"),
  ]);
  const mainJavascript = compile(mainSource)
    .replaceAll('"./statistics-pdf12-data"', JSON.stringify(toDataUrl(compile(pdf12Source))))
    .replaceAll('"./statistics-pdf34-data"', JSON.stringify(toDataUrl(compile(pdf34Source))));
  return import(toDataUrl(mainJavascript));
}

test("every taught Sigma formula keeps Sigma and adds a Sigma-free expansion", async () => {
  const [data, katex] = await Promise.all([
    loadStatisticsData(),
    import(new URL("../app/vendor/katex/katex.mjs", import.meta.url)),
  ]);
  const owners = [...data.STATISTICS_FORMULAS, ...data.STATISTICS_QUESTIONS];
  const sigmaOwners = owners.filter((owner) => owner.formula?.includes("\\sum"));

  assert.equal(sigmaOwners.length, 13, "audit every current Sigma formula card and course question");
  for (const owner of sigmaOwners) {
    assert.equal(typeof owner.expandedFormula, "string", `${owner.id} needs expandedFormula`);
    assert.ok(owner.expandedFormula.length > 4, `${owner.id} expansion is too short`);
    assert.doesNotMatch(owner.expandedFormula, /\\sum|Σ/, `${owner.id} expansion must not use Sigma`);
    assert.doesNotThrow(() => katex.renderToString(owner.expandedFormula, {
      displayMode: true,
      output: "htmlAndMathml",
      strict: "error",
      throwOnError: true,
      trust: false,
    }), `${owner.id} expandedFormula must be valid TeX`);
  }

  assert.equal(
    data.STATISTICS_QUESTIONS.find((question) => question.id === "stats-q-mean")?.expandedFormula,
    "\\bar{x}=\\frac{4+6+8+10+12}{5}",
  );
  assert.equal(
    data.STATISTICS_QUESTIONS.find((question) => question.id === "stats-ex1-blood-correlation")?.expandedFormula,
    "r=\\frac{4523}{\\sqrt{4690.8\\times7925}}",
  );
});

test("formula cards, practice feedback, and predicted answers label both notations", async () => {
  const [page, expectedExams] = await Promise.all([
    readFile(new URL("../app/subjects/subject-7/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/statistics-expected-exams.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /CardDeckSearch/);
  assert.match(page, /jumpToFormulaCard/);
  assert.match(page, /Σを使う書き方/);
  assert.match(page, /Σなしで書くと/);
  assert.match(page, /currentCard\.expandedFormula/);
  assert.match(page, /question\.expandedFormula/);

  const sigmaTemplates = expectedExams.match(/formula:\s*"[^"\n]*\\\\sum[^"\n]*"/g) ?? [];
  const pairedTemplates = expectedExams.match(/formula:\s*"[^"\n]*\\\\sum[^"\n]*",\s*expandedFormula:/g) ?? [];
  assert.equal(sigmaTemplates.length, 5);
  assert.equal(pairedTemplates.length, sigmaTemplates.length);
  assert.match(expectedExams, /function SigmaAwareFormula/);
  assert.match(expectedExams, /Σを使う書き方/);
  assert.match(expectedExams, /Σなしで書くと/);
  assert.match(expectedExams, /every Sigma formula requires a Sigma-free expandedFormula/);
});
