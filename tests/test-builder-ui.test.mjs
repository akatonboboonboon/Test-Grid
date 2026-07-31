import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const page = await readFile(new URL("app/test-builder/page.tsx", root), "utf8");
const client = await readFile(new URL("app/test-builder-client.tsx", root), "utf8");
const css = await readFile(new URL("app/test-builder.module.css", root), "utf8");

test("test builder is a dedicated local deterministic route", () => {
  assert.match(page, /TestBuilderClient/);
  assert.match(client, /ローカルテスト生成エンジン/);
  assert.match(client, /AI\/API不使用/);
  assert.doesNotMatch(client, /内部テストAI|内部AI/);
  assert.match(client, /範囲外の知識を勝手に追加しない/);
  assert.match(client, /全問に解答・解説・出典/);
});

test("builder covers all five grades and five academic periods", () => {
  for (const grade of [1, 2, 3, 4, 5]) assert.match(client, new RegExp(`\\[1, 2, 3, 4, 5\\]`));
  for (const period of ["first-midterm", "first-final", "second-midterm", "second-final", "other"]) {
    assert.match(client, new RegExp(period));
  }
});

test("builder supports sequential browser OCR with bounded local image input", () => {
  assert.match(client, /\.txt,\.md,\.csv,\.json/);
  assert.match(client, /OCR_MAX_FILES = 5/);
  assert.match(client, /OCR_MAX_FILE_BYTES = 12 \* 1024 \* 1024/);
  assert.match(client, /multiple/);
  assert.match(client, /\.jpg,\.jpeg,\.png,\.webp/);
  assert.match(client, /await import\("tesseract\.js"\)/);
  assert.match(client, /createWorker\(\["jpn", "eng"\]/);
  assert.match(client, /for \(let index = 0; index < files\.length; index \+= 1\)/);
  assert.match(client, /await worker\.recognize\(files\[index\]\)/);
  assert.match(client, /finally \{/);
  assert.match(client, /await worker\?\.terminate\(\)/);
  assert.match(client, /ocrProgress/);
  assert.match(client, /初回のみ日本語・英語OCRの言語データを取得/);
  assert.match(client, /画像本体は外部AIへ送信せず/);
  assert.match(client, /数式・図・手書き文字/);
  assert.match(client, /PDF・ZIPは未対応/);
});

test("builder exposes deterministic settings, guarded local storage and JSON handoff", () => {
  assert.match(client, /再現seed/);
  assert.match(client, /TEST_BUILDER_STORAGE_KEY/);
  assert.match(client, /readProjects\(/);
  assert.match(client, /writeProjects\(/);
  assert.match(client, /test-builder-draft:v1/);
  assert.match(client, /window\.setTimeout/);
  assert.match(client, /try \{/);
  assert.match(client, /catch \(/);
  assert.match(client, /exportProject\(/);
  assert.match(client, /importProject\(/);
  assert.match(client, /\.testgrid\.json/);
  assert.doesNotMatch(client, /fetch\s*\(/);
  assert.doesNotMatch(client, /OPENAI|ANTHROPIC|GEMINI|API_KEY/);
  assert.match(client, /100,000文字/);
  assert.match(client, /TEST_BUILDER_MAX_IMPORT_JSON_LENGTH/);
  assert.match(client, /window\.confirm/);
});

test("preview renders points, answers, explanations and source excerpts", () => {
  assert.match(client, /question\.points/);
  assert.match(client, /question\.answer/);
  assert.match(client, /question\.explanation/);
  assert.match(client, /question\.sourceExcerpt/);
  assert.match(client, /pointTotal/);
});

test("builder has responsive, OCR progress and split A4 print treatments", () => {
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /@media print/);
  assert.match(css, /@page \{ size: A4 portrait/);
  assert.match(css, /grid-template-columns: 1fr/);
  assert.match(client, /問題用紙印刷/);
  assert.match(client, /解答解説付き印刷/);
  assert.match(client, /data-print-mode/);
  assert.match(css, /data-print-mode="questions"/);
  assert.match(css, /\.ocrPanel/);
});
