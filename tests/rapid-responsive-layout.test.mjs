import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const CSS_URL = new URL("../app/globals.css", import.meta.url);

test("rapid feedback and review grids let long prose shrink without clipping", async () => {
  const css = await readFile(CSS_URL, "utf8");

  assert.match(css, /\.rapid-feedback\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*0\.7fr\)\s+minmax\(0,\s*1\.3fr\)/);
  assert.match(css, /\.rapid-feedback\s*>\s*\*[\s\S]*?max-width:\s*100%[\s\S]*?min-width:\s*0/);
  assert.match(css, /\.rapid-feedback h3,[\s\S]*?\.rapid-review-list small\s*\{[\s\S]*?overflow-wrap:\s*anywhere/);
  assert.match(css, /\.rapid-review-list details\s*\{[\s\S]*?max-width:\s*100%[\s\S]*?min-width:\s*0/);
  assert.match(css, /\.rapid-review-list summary\s*\{[\s\S]*?grid-template-columns:\s*38px\s+minmax\(0,\s*1fr\)\s+auto/);
});

test("rapid long equations scroll inside their own box instead of widening the page", async () => {
  const css = await readFile(CSS_URL, "utf8");

  assert.match(css, /\.rapid-feedback \.statistics-rich-math-display-segment,[\s\S]*?\.rapid-question \.statistics-math-display\s*\{[\s\S]*?max-width:\s*100%[\s\S]*?min-width:\s*0[\s\S]*?overflow-x:\s*auto[\s\S]*?overflow-y:\s*hidden/);
  assert.doesNotMatch(css, /\.rapid-feedback\s*\{[^}]*overflow(?:-x)?:\s*(?:hidden|clip)/);
});

test("rapid feedback keeps zero-minimum tracks at tablet and phone widths", async () => {
  const css = await readFile(CSS_URL, "utf8");

  assert.match(css, /@media\s*\(max-width:\s*800px\)[\s\S]*?\.rapid-feedback\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /@media\s*\(max-width:\s*560px\)[\s\S]*?\.rapid-settings,[\s\S]*?\.rapid-result-summary\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
});
