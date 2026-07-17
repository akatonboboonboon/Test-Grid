import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const STATISTICS_SOURCES = [
  "../app/statistics-data.ts",
  "../app/statistics-pdf12-data.ts",
  "../app/statistics-pdf34-data.ts",
  "../app/statistics-expected-exams.tsx",
];

function extractRichMathSegments(source) {
  const open = "\\\\(";
  const close = "\\\\)";
  return source
    .split(open)
    .slice(1)
    .flatMap((tail) => {
      const end = tail.indexOf(close);
      return end >= 0 ? [tail.slice(0, end)] : [];
    });
}

test("renders every displayed statistics fraction with LaTeX frac notation", async () => {
  const sources = await Promise.all(
    STATISTICS_SOURCES.map(async (path) => ({
      path,
      source: await readFile(new URL(path, import.meta.url), "utf8"),
    })),
  );

  const segments = sources.flatMap(({ path, source }) => (
    extractRichMathSegments(source).map((tex) => ({ path, tex }))
  ));
  assert.ok(segments.length >= 150, "the audit must include the full statistics question corpus");

  const slashFractions = segments.filter(({ tex }) => (
    tex.replace(/\$\{[^}]*\}/g, "").includes("/")
  ));
  assert.deepEqual(
    slashFractions,
    [],
    "displayed statistics math must use \\frac instead of horizontal slash fractions",
  );

  const combined = sources.map(({ source }) => source).join("\n");
  assert.match(combined, /\\\\frac\{1243\.6\}\{2967\}/);
  assert.match(combined, /\\\\frac\{\\\\binom\{3\}\{2\}\}\{\\\\binom\{5\}\{2\}\}/);
  assert.match(combined, /\\\\frac\{X-\\\\mu\}\{\\\\sigma\}/);
  assert.match(combined, /\\\\left\(\\\\frac\{1\}\{2\}\\\\right\)/);
});
