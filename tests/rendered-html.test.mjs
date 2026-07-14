import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Layer Sum trainer", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>LAYER\/\/SUM/);
  assert.match(html, /Pで終わるプロトコル/);
  assert.match(html, /フラッシュ暗算/);
  assert.match(html, /カードを編集/);
  assert.match(html, /http:\/\/localhost\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("ships the final card trainer without starter artifacts", async () => {
  const [page, layout, css, packageJson, ogStats] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    stat(new URL("../public/og.png", import.meta.url)),
  ]);

  assert.match(page, /const DEFAULT_CARDS/);
  assert.match(page, /"FHRP"/);
  assert.match(page, /layer-sum-cards-v1/);
  assert.match(page, /mode === "sum"/);
  assert.match(page, /mode === "identify"/);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /openGraph/);
  assert.match(layout, /<html lang="ja">/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.ok(ogStats.size > 100_000, "social preview should be a real image asset");

  await assert.rejects(access(new URL("../app/_sites-preview", projectRoot)));
});
