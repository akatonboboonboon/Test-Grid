import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("English past-paper units keep objective questions atomic and award constructed responses by elements", async (context) => {
  const server = await createServer({ root: projectRoot, configFile: false, server: { middlewareMode: true }, logLevel: "silent" });
  context.after(() => server.close());
  const { pastPaperPartialCreditBands } = await server.ssrLoadModule("/app/past-paper-partial-credit.ts");

  const scores = (question) => pastPaperPartialCreditBands(question, "english").map((band) => band.points);
  assert.deepEqual(scores({ points: 2, section: "vocab-ja-en", format: "input" }), [0, 2]);
  assert.deepEqual(scores({ points: 2, section: "vocab-en-ja", format: "input" }), [0, 2]);
  assert.deepEqual(scores({ points: 3, section: "language", format: "choice" }), [0, 3]);
  assert.deepEqual(scores({ points: 2, section: "true-false", format: "choice" }), [0, 2]);
  assert.deepEqual(scores({ points: 5, section: "order", format: "order" }), [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(scores({ points: 3, section: "sentence-ja-en", format: "input" }), [0, 1, 2, 3]);
  assert.deepEqual(scores({ points: 4, section: "translation", format: "translation" }), [0, 1, 2, 3, 4]);
});

test("calculation and circuit bands preserve the printed subquestion maximum", async (context) => {
  const server = await createServer({ root: projectRoot, configFile: false, server: { middlewareMode: true }, logLevel: "silent" });
  context.after(() => server.close());
  const { clampPartialCredit, pastPaperPartialCreditBands } = await server.ssrLoadModule("/app/past-paper-partial-credit.ts");

  for (const profile of ["engineering", "statistics", "digital", "smart-control"]) {
    const bands = pastPaperPartialCreditBands({ points: 15, steps: ["立式", "代入", "結論"], requiresUnit: true }, profile);
    assert.equal(bands[0].points, 0);
    assert.equal(bands.at(-1).points, 15);
    assert.ok(bands.every((band, index) => index === 0 || band.points > bands[index - 1].points));
  }
  assert.equal(clampPartialCredit(8, -2), 0);
  assert.equal(clampPartialCredit(8, "5"), 5);
  assert.equal(clampPartialCredit(8, 99), 8);
});
