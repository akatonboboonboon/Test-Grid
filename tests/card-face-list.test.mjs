import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = new URL("../app/", import.meta.url);
const readApp = (path) => readFile(new URL(path, app), "utf8");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("shared card list exposes one accessible control and shows both faces together", async () => {
  const source = await readApp("card-face-list.tsx");

  for (const marker of [
    'data-card-face-list',
    'aria-expanded={open}',
    'aria-controls={panelId}',
    'id={panelId}',
    'data-side="front"',
    'data-side="back"',
    'aria-label="表面"',
    'aria-label="裏面"',
    "FRONT / BACK LIST",
  ]) {
    assert.ok(source.includes(marker), "missing shared-list accessibility/face marker: " + marker);
  }

  assert.match(
    source,
    /visibleItems\.map\([\s\S]*?data-side="front"[\s\S]*?item\.front[\s\S]*?data-side="back"[\s\S]*?item\.back/,
    "each visible row must render its front and back simultaneously",
  );
  assert.doesNotMatch(source, /<details\b|<summary\b/, "the two faces must not be hidden behind disclosure widgets");
});

test("shared card list progressively reveals large decks", async () => {
  const source = await readApp("card-face-list.tsx");

  assert.match(source, /pageSize\s*=\s*40/);
  assert.match(source, /useState\(pageSize\)/);
  assert.match(source, /items\.slice\(0,\s*visibleCount\)/);
  assert.match(source, /Math\.max\(0,\s*items\.length\s*-\s*visibleItems\.length\)/);
  assert.match(source, /remaining\s*>\s*0/);
  assert.match(source, /setVisibleCount\(\(count\)\s*=>\s*count\s*\+\s*pageSize\)/);
});

test("card list uses two desktop columns, one mobile column, and contains long math", async () => {
  const css = await readApp("card-face-list.module.css");

  assert.match(
    css,
    /\.sides\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*700px\)[\s\S]*?\.sides[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/,
  );
  assert.match(css, /\.face\s*\{[\s\S]*?min-width:\s*0/);
  assert.match(css, /\.face\s*>\s*div\s*\{[\s\S]*?overflow-wrap:\s*anywhere/);
  assert.match(css, /:global\(\.katex-display\)/);
  assert.match(css, /:global\(\.statistics-rich-math-display-segment\)/);
  assert.match(
    css,
    /:global\(\.katex-display\)[\s\S]*?max-width:\s*100%[\s\S]*?overflow-x:\s*auto[\s\S]*?overflow-y:\s*hidden/,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*700px\)[\s\S]*?\.toggle,[\s\S]*?\.select\s*\{[\s\S]*?min-height:\s*48px/,
  );
});

test("global and every subject flashcard workspace integrate the shared front/back list", async () => {
  const integrations = [
    { path: "card-search.tsx", importPath: "./card-face-list", collection: "filtered" },
    { path: "subjects/network/cards/page.tsx", importPath: "../../../card-face-list", collection: "filteredCards" },
    { path: "subjects/[subjectId]/page.tsx", importPath: "../../card-face-list", collection: "usableCards" },
    { path: "subjects/subject-2/page.tsx", importPath: "../../card-face-list", collection: "filteredVocab" },
    { path: "subjects/subject-3/page.tsx", importPath: "../../card-face-list", collection: "filteredCards" },
    { path: "subjects/subject-4/page.tsx", importPath: "../../card-face-list", collection: "filteredCards" },
    { path: "subjects/subject-5/page.tsx", importPath: "../../card-face-list", collection: "filteredCards" },
    { path: "subjects/subject-6/page.tsx", importPath: "../../card-face-list", collection: "filteredCards" },
    { path: "subjects/subject-7/page.tsx", importPath: "../../card-face-list", collection: "filteredCards" },
    { path: "subjects/subject-8/page.tsx", importPath: "../../card-face-list", collection: "filteredCards" },
    { path: "subjects/subject-9/page.tsx", importPath: "../../card-face-list", collection: "cards" },
  ];

  for (const integration of integrations) {
    const source = await readApp(integration.path);
    assert.ok(
      source.includes(`import CardFaceList from "${integration.importPath}"`),
      integration.path + " must import the shared front/back list",
    );
    assert.ok(source.includes("<CardFaceList"), integration.path + " must render the shared front/back list");
    const collectionPattern = escapeRegExp(integration.collection);
    assert.match(
      source,
      new RegExp(`<CardFaceList[\\s\\S]{0,3200}?items=\\{${collectionPattern}\\.map\\(`),
      integration.path + " must feed the currently filtered flashcard collection into the list",
    );
  }

  const network = await readApp("subjects/network/cards/page.tsx");
  assert.match(network, /<CardFaceList[\s\S]{0,3200}?tone="dark"/);

  const english = await readApp("subjects/subject-2/page.tsx");
  assert.match(english, /<CardFaceList[\s\S]{0,3200}?cardDirection/);

  const statistics = await readApp("subjects/subject-7/page.tsx");
  assert.match(statistics, /<CardFaceList[\s\S]{0,3200}?expandedFormula/);
});
