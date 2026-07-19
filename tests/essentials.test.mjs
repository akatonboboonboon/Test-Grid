import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

function countItems(text, exportName) {
  const marker = `${exportName}: EssentialItem[] = [`;
  const start = text.indexOf(marker);
  assert.notEqual(start, -1, `${exportName} must exist`);
  const end = text.indexOf("\n];", start);
  assert.notEqual(end, -1, `${exportName} must close its array`);
  return (text.slice(start, end).match(/\bid:\s*"[^"]+"/g) ?? []).length;
}

test("all nine subjects have a compact essentials collection", async () => {
  const [base, engineering, math, catalog] = await Promise.all([
    source("app/essentials-data.ts"),
    source("app/essentials-engineering-data.ts"),
    source("app/essentials-math-data.ts"),
    source("app/essentials-catalog.ts"),
  ]);

  const collections = [
    [base, "ENGLISH_ESSENTIALS"],
    [base, "NETWORK_ESSENTIALS"],
    [base, "MECHANICAL_ESSENTIALS"],
    [engineering, "THERMODYNAMICS_ESSENTIALS"],
    [engineering, "MATERIAL_ESSENTIALS"],
    [engineering, "SMART_CONTROL_ESSENTIALS"],
    [math, "STATISTICS_ESSENTIALS"],
    [math, "APPLIED_MATH_ESSENTIALS"],
    [math, "DIGITAL_CIRCUIT_ESSENTIALS"],
  ];

  for (const [text, name] of collections) {
    assert.ok(countItems(text, name) >= 10, `${name} should contain at least ten essentials`);
  }

  const subjectIds = [...catalog.matchAll(/\bid:\s*"(network|subject-[2-9])"/g)].map((match) => match[1]);
  assert.deepEqual(subjectIds, ["subject-2", "network", "subject-3", "subject-4", "subject-5", "subject-6", "subject-7", "subject-8", "subject-9"]);

  const itemIds = [base, engineering, math].flatMap((text) => [...text.matchAll(/\bid:\s*"([a-z][a-z0-9-]+)"/g)].map((match) => match[1]));
  assert.equal(new Set(itemIds).size, itemIds.length, "essential item ids must be unique");
  assert.doesNotMatch(base, /Chapter 19|Ch\.19/);
  assert.match(math, /Σなし/);
  assert.match(math, /E\[X\]=x_1p_1/);
});

test("essentials page supports subject deep links, search, filters, math, print, and mobile layout", async () => {
  const [page, client, css, home] = await Promise.all([
    source("app/essentials/page.tsx"),
    source("app/essentials-client.tsx"),
    source("app/essentials.css"),
    source("app/page.tsx"),
  ]);

  assert.match(page, /試験直前・これだけは覚える/);
  assert.match(client, /URLSearchParams\(window\.location\.search\)/);
  assert.match(client, /type="search"/);
  assert.match(client, /KIND_OPTIONS/);
  assert.match(client, /DisplayMath/);
  assert.match(client, /RichMathText/);
  assert.match(client, /window\.print\(\)/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /overflow-x: auto/);
  assert.match(css, /grid-template-columns: 1fr/);
  assert.match(home, /href="\/essentials"/);
  assert.match(home, /\/essentials\?subject=network/);
  assert.match(home, /`\/essentials\?subject=\$\{subject\.id\}`/);
});
