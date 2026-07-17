import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const appUrl = new URL("../app/", import.meta.url);

function evaluateSearchHelpers(source) {
  const pureSource = source
    .slice(source.indexOf("export type CardDeckSearchItem"), source.indexOf("export default function CardDeckSearch"));
  const exportsObject = {};
  const javascript = ts.transpileModule(pureSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "card-deck-search.tsx",
  }).outputText;
  new Function("exports", javascript)(exportsObject);
  return exportsObject;
}

test("in-deck search ranks normal matches and fuzzy candidates", async () => {
  const source = await readFile(new URL("card-deck-search.tsx", appUrl), "utf8");
  const { normalizeDeckSearchText, rankDeckSearchItems } = evaluateSearchHelpers(source);
  const items = [
    {
      id: "mean",
      label: "算術平均",
      description: "データの合計を個数で割る",
      meta: "記述統計",
      searchText: ["\\\\bar{x}=\\\\frac{1}{n}\\\\sum x_i"],
    },
    {
      id: "network",
      label: "network",
      description: "ネットワーク",
      meta: "English",
    },
  ];

  assert.equal(normalizeDeckSearchText("  ＮＥＴＷＯＲＫ！ "), "network");
  assert.equal(rankDeckSearchItems(items, "平均")[0].item.id, "mean");
  assert.equal(rankDeckSearchItems(items, "frac")[0].item.id, "mean");
  const fuzzy = rankDeckSearchItems(items, "netwrok")[0];
  assert.equal(fuzzy.item.id, "network");
  assert.equal(fuzzy.kind, "fuzzy");
  assert.deepEqual(rankDeckSearchItems(items, ""), []);
});

test("shared search is keyboard-accessible and mobile-friendly", async () => {
  const source = await readFile(new URL("card-deck-search.tsx", appUrl), "utf8");
  const css = await readFile(new URL("globals.css", appUrl), "utf8");

  for (const marker of [
    'role="combobox"',
    'role="listbox"',
    'aria-autocomplete="list"',
    'aria-activedescendant=',
    'event.key === "ArrowDown"',
    'event.key === "ArrowUp"',
    'event.key === "Enter"',
    'event.key === "Escape"',
    "もしかして？",
    "クリア",
  ]) {
    assert.ok(source.includes(marker), "missing accessibility/search marker: " + marker);
  }
  assert.match(css, /\.deck-search\s*\{/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.deck-search/);
  assert.match(css, /\.deck-search-popover li > button[\s\S]*?min-height: 58px/);
});

test("all seven non-network flashcard integrations jump to the exact selected card", async () => {
  const integrations = [
    ["subjects/subject-2/page.tsx", "jumpToVocabCard", "ENGLISH_VOCAB"],
    ["subjects/subject-3/page.tsx", "jumpToFormulaCard", "MECHANICAL_DYNAMICS_FORMULAS"],
    ["subjects/subject-4/page.tsx", "jumpToFormulaCard", "THERMODYNAMICS_FORMULAS"],
    ["subjects/subject-6/page.tsx", "jumpToSmartCard", "SMART_CONTROL_CARDS"],
    ["subjects/subject-7/page.tsx", "jumpToFormulaCard", "STATISTICS_FORMULAS"],
    ["subjects/subject-8/page.tsx", "jumpToFormulaCard", "APPLIED_MATH_FORMULAS"],
    ["subjects/[subjectId]/page.tsx", "jumpToStudyCard", "usableCards"],
  ];

  for (const [path, jumpFunction, dataSource] of integrations) {
    const source = await readFile(new URL(path, appUrl), "utf8");
    assert.match(source, /import CardDeckSearch from "\.\.\/\.\.\/card-deck-search"/, path);
    assert.ok(source.includes("<CardDeckSearch"), path + " must render the in-deck search");
    assert.ok(source.includes("function " + jumpFunction + "(cardId: string)"), path + " must define an exact-card jump");
    assert.ok(source.includes(dataSource), path + " must search the full card source");
    assert.match(source, /findIndex\(\(item\) => item\.id === cardId\)/, path);
    assert.ok(source.includes("setCardFlipped(false)") || source.includes("setFlipped(false)"), path + " must return to the front");
  }
});

test("network keeps its existing local search instead of receiving the shared duplicate", async () => {
  const source = await readFile(new URL("subjects/network/cards/page.tsx", appUrl), "utf8");

  assert.doesNotMatch(source, /import CardDeckSearch/);
  assert.doesNotMatch(source, /<CardDeckSearch/);
  assert.match(source, /searchQuery/);
  assert.match(source, /もしかして/);
  assert.match(source, /suggestCards\(cards, searchQuery\)/);
  assert.match(source, /hasQuery \? cards : filterCardsByLayer\(cards, selectedLayers\)/);
  assert.match(source, /if \(hasQuery && selectedLayers\.length\) setSelectedLayers\(\[\]\)/);
  assert.match(source, /全レイヤー検索へ切り替えました/);
});
