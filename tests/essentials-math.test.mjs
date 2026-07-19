import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderToString } from "../app/vendor/katex/katex.mjs";

const files = [
  "../app/essentials-data.ts",
  "../app/essentials-engineering-data.ts",
  "../app/essentials-math-data.ts",
];

function decodeLiteral(raw) {
  return JSON.parse(`"${raw.replaceAll('"', '\\"')}"`);
}

test("every essentials formula and inline math segment parses as TeX", async () => {
  let formulas = 0;
  let inlineSegments = 0;

  for (const file of files) {
    const source = await readFile(new URL(file, import.meta.url), "utf8");
    for (const match of source.matchAll(/tex:\s*"((?:\\.|[^"\\])*)"/g)) {
      const tex = decodeLiteral(match[1]);
      assert.doesNotThrow(
        () => renderToString(tex, { displayMode: true, throwOnError: true, strict: "error", trust: false }),
        `${file} contains invalid display TeX: ${tex}`,
      );
      formulas += 1;
    }

    for (const match of source.matchAll(/(?:value|cue|pitfall):\s*"((?:\\.|[^"\\])*)"/g)) {
      const text = decodeLiteral(match[1]);
      for (const mathMatch of text.matchAll(/\\\(([\s\S]*?)\\\)/g)) {
        assert.doesNotThrow(
          () => renderToString(mathMatch[1], { displayMode: false, throwOnError: true, strict: "error", trust: false }),
          `${file} contains invalid inline TeX: ${mathMatch[1]}`,
        );
        inlineSegments += 1;
      }
    }
  }

  assert.ok(formulas >= 90, `expected at least 90 displayed formulas, found ${formulas}`);
  assert.ok(inlineSegments >= 40, `expected at least 40 inline formulas, found ${inlineSegments}`);
});
