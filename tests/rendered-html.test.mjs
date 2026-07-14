import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
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

test("server-renders the nine-subject study hub", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>TEST\/\/GRID/);
  assert.match(html, /9教科を/);
  assert.match(html, /科目別の勉強机/);
  assert.match(html, /ネットワークから始める/);
  assert.match(html, /英語/);
  assert.match(html, /機械力学/);
  assert.match(html, /材料力学/);
  assert.match(html, /デジタル回路/);
  assert.match(html, /http:\/\/localhost\/og-test-grid\.png/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("server-renders the preserved Layer Sum trainer", async () => {
  const response = await render("/subjects/network");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>ネットワーク専用ドリル \| TEST\/\/GRID/);
  assert.match(html, /①〜⑦の用語を/);
  assert.match(html, /96(?:<!-- -->)? CARDS/);
  assert.match(html, /フラッシュ暗算/);
  assert.match(html, /カードを編集/);
});

test("server-renders the memorization card page", async () => {
  const response = await render("/subjects/network/cards");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /暗記カード \| ネットワーク \| TEST\/\/GRID/);
  assert.match(html, /まず覚える/);
  assert.match(html, /タップして層を確認/);
  assert.match(html, /未暗記だけ復習/);
});

test("server-renders a generic subject workspace and the old cards URL", async () => {
  const [subjectResponse, legacyCardsResponse] = await Promise.all([
    render("/subjects/subject-2"),
    render("/cards"),
  ]);
  assert.equal(subjectResponse.status, 200);
  assert.equal(legacyCardsResponse.status, 200);
  const subjectHtml = await subjectResponse.text();
  assert.match(subjectHtml, /SUBJECT WORKSPACE/);
  assert.match(subjectHtml, /暗記カード/);
  assert.match(subjectHtml, /一問一答/);
  assert.match(subjectHtml, /まだ教材がありません/);
  assert.match(await legacyCardsResponse.text(), /MEMORY CARD DECK/);
});

test("ships the study hub without starter artifacts", async () => {
  const [hubPage, networkPage, cardsPage, subjectPage, studyData, protocols, layout, css, packageJson, ogStats] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/subjects/network/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/subjects/network/cards/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/subjects/[subjectId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/study-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/protocols.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    stat(new URL("../public/og-test-grid.png", import.meta.url)),
  ]);

  assert.match(protocols, /const DEFAULT_CARDS/);
  assert.match(protocols, /"FHRP"/);
  assert.match(protocols, /"TKIP"/);
  for (const label of ["10BASE-T", "IEEE 802.1X", "RIPv2", "QUIC", "TLS1.3", "POP3", "Syslog"]) {
    assert.ok(protocols.includes(`"${label}"`), `${label} should be included in the OCR corpus`);
  }
  assert.match(protocols, /layers\?: Layer\[\]/);
  assert.match(protocols, /layers:\s*\[1,\s*2\]/);
  assert.match(protocols, /layers:\s*\[5,\s*7\]/);
  assert.match(protocols, /layers:\s*\[5,\s*6\]/);
  assert.match(protocols, /makeCards\(\["SSL"\], 6, 2\)/);
  assert.match(protocols, /export function cardLayers/);
  assert.match(protocols, /export function cardLayerLabel/);
  assert.match(studyData, /DEFAULT_SUBJECTS/);
  assert.match(studyData, /test-grid-subjects-v1/);
  assert.match(hubPage, /subjects\.map/);
  assert.match(hubPage, /\[dialogOpen\]/);
  assert.doesNotMatch(hubPage, /\[editing\]\);/);
  assert.match(networkPage, /layer-sum-cards-v1/);
  assert.match(networkPage, /mode === "sum"/);
  assert.match(networkPage, /mode === "identify"/);
  assert.match(networkPage, /cardLayers\(/);
  assert.match(networkPage, /cardLayerLabel\(/);
  assert.match(networkPage, /type="number"/);
  assert.doesNotMatch(networkPage, /selectedLayers|対象レイヤー/);
  assert.match(cardsPage, /layer-sum-memory-v1/);
  assert.match(cardsPage, /memory-card/);
  assert.match(subjectPage, /parseBulk/);
  assert.match(subjectPage, /一問一答/);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /openGraph/);
  assert.match(layout, /<html lang="ja">/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.ok(ogStats.size > 100_000, "social preview should be a real image asset");

  await assert.rejects(access(new URL("../app/_sites-preview", projectRoot)));
});
