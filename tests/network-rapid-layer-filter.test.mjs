import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = new URL("../app/", import.meta.url);
const read = (path) => readFile(new URL(path, app), "utf8");

test("network rapid drill filters the source pool by any selected OSI layer", async () => {
  const [data, drill, protocols] = await Promise.all([
    read("rapid-quiz-data.ts"),
    read("rapid-answer-drill.tsx"),
    read("protocols.ts"),
  ]);

  assert.match(data, /export function filterNetworkRapidPoolByLayers/);
  assert.match(data, /if \(!selectedLayers\.length\) return pool/);
  assert.match(data, /acceptedOptions\.some\(\(option\) => selectedLabels\.has\(option\)\)/);
  assert.match(data, /acceptedOptions: labels/);
  assert.match(protocols, /layers:\s*\[1,\s*2\]/);
  assert.match(protocols, /label: "RADIUS"[^\n]*layers:\s*\[2,\s*7\]/);
  assert.match(protocols, /label: "QUIC"[^\n]*layers:\s*\[6,\s*4\]/);

  assert.match(drill, /const \[sourcePool, setSourcePool\]/);
  assert.match(drill, /filterNetworkRapidPoolByLayers\(sourcePool, selectedLayers\)/);
  assert.match(drill, /createRapidSession\(pool, count\)/);
  assert.match(drill, /\{sourcePool\.length \? \(/);
});

test("network layer selector supports all seven layers and accessible multi-select controls", async () => {
  const drill = await read("rapid-answer-drill.tsx");

  assert.match(drill, /subjectId === "network" &&/);
  assert.match(drill, /出題する層を選ぶ/);
  assert.match(drill, /複数選択できます/);
  assert.match(drill, /ALL_LAYERS\.map\(\(layer\) =>/);
  assert.match(drill, /role="group" aria-label="出題するレイヤー（複数選択可）"/);
  assert.match(drill, /aria-pressed=\{selectedLayers\.includes\(layer\)\}/);
  assert.match(drill, /onClick=\{\(\) => toggleLayer\(layer\)\}/);
  assert.match(drill, /onClick=\{\(\) => setSelectedLayers\(\[\]\)\}/);
  assert.match(drill, /aria-live="polite"/);
});

test("layer filter stays out of fixed ranking and comprehensive pools", async () => {
  const [data, official, comprehensive] = await Promise.all([
    read("rapid-quiz-data.ts"),
    read("official-ranking-questions.ts"),
    read("comprehensive-challenge.tsx"),
  ]);

  assert.match(data, /const NETWORK_RAPID = networkCardsToRapid\(DEFAULT_CARDS\)/);
  assert.match(data, /network:\s*NETWORK_RAPID/);
  assert.doesNotMatch(official, /filterNetworkRapidPoolByLayers/);
  assert.doesNotMatch(comprehensive, /filterNetworkRapidPoolByLayers/);
});

test("network rapid layer buttons remain usable on tablet and phone widths", async () => {
  const css = await read("globals.css");

  assert.match(css, /\.rapid-layer-filter-buttons\s*\{[\s\S]*?grid-template-columns:\s*1\.45fr repeat\(7, minmax\(52px, 1fr\)\)/);
  assert.match(css, /\.rapid-layer-filter-buttons button:focus-visible\s*\{[\s\S]*?outline:\s*3px solid var\(--ink\)/);
  assert.match(css, /@media\s*\(max-width:\s*800px\)[\s\S]*?\.rapid-layer-filter-buttons\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media\s*\(max-width:\s*560px\)[\s\S]*?\.rapid-layer-filter-buttons button:first-child\s*\{[\s\S]*?grid-column:\s*span 2/);
});
