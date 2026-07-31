import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { importTypeScriptGraph } from "./helpers/import-typescript-graph.mjs";

const catalogPromise = importTypeScriptGraph("../app/academic-catalog.ts", import.meta.url);

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

const LEGACY_SUBJECT_IDS = [
  "subject-2",
  "network",
  "subject-3",
  "subject-4",
  "subject-5",
  "subject-6",
  "subject-7",
  "subject-8",
  "subject-9",
];

test("academic catalog defines five years and the five requested exam periods", async () => {
  const catalog = await catalogPromise;

  assert.deepEqual(catalog.ACADEMIC_YEARS, [1, 2, 3, 4, 5]);
  assert.deepEqual(
    catalog.EXAM_PERIODS.map((period) => period.id),
    ["first-midterm", "first-final", "second-midterm", "second-final", "other"],
  );
  assert.deepEqual(
    catalog.EXAM_PERIODS.map((period) => period.label),
    ["前期中間", "前期末", "後期中間", "後期末", "その他（資格・TOEICなど）"],
  );
  assert.deepEqual(catalog.DEFAULT_ACADEMIC_VIEW, { year: 4, period: "first-final" });
});

test("all existing subjects stay in fourth-year first-final without changing their ids or routes", async () => {
  const catalog = await catalogPromise;

  assert.deepEqual(Object.keys(catalog.SUBJECT_ACADEMIC_PLACEMENT), LEGACY_SUBJECT_IDS);
  for (const subjectId of LEGACY_SUBJECT_IDS) {
    assert.deepEqual(
      catalog.SUBJECT_ACADEMIC_PLACEMENT[subjectId],
      { year: 4, period: "first-final" },
      subjectId,
    );
  }

  const subjects = LEGACY_SUBJECT_IDS.map((id, index) => ({ id, name: `教科${index + 1}` }));
  const entries = catalog.buildAcademicCatalog(subjects);
  const legacy = entries.filter((entry) => entry.kind === "legacy-subject");

  assert.deepEqual(legacy.map((entry) => entry.id), LEGACY_SUBJECT_IDS);
  assert.equal(legacy.find((entry) => entry.id === "network")?.href, "/subjects/network");
  assert.equal(legacy.find((entry) => entry.id === "subject-2")?.href, "/subjects/subject-2");
});

test("TOEIC IP is a separate fourth-year qualification entry", async () => {
  const catalog = await catalogPromise;
  const toeic = catalog.TOEIC_ACADEMIC_ENTRY;

  assert.equal(toeic.id, "toeic-lr-ip");
  assert.equal(toeic.href, "/subjects/toeic-ip");
  assert.equal(toeic.examDate, "2026-12-25");
  assert.deepEqual(toeic.placement, { year: 4, period: "other" });
});

test("home exposes accessible year and period controls, empty-state builder link, and scoped schedule", async () => {
  const [page, css, layout] = await Promise.all([
    source("../app/page.tsx"),
    source("../app/globals.css"),
    source("../app/layout.tsx"),
  ]);

  assert.match(page, /ACADEMIC_YEARS\.map/);
  assert.match(page, /EXAM_PERIODS\.map/);
  assert.match(page, /aria-label="学年を選択"/);
  assert.match(page, /aria-label="試験区分を選択"/);
  assert.match(page, /aria-pressed=\{selectedYear === year\}/);
  assert.match(page, /aria-pressed=\{selectedPeriod === period\.id\}/);
  assert.match(page, /visibleSubjects\.map/);
  assert.match(page, /showsToeic &&/);
  assert.match(page, /href="\/test-builder"/);
  const builderLaunchIndex = page.indexOf('className="hub-memory-launch hub-builder-launch"');
  const academicBrowserIndex = page.indexOf('className="hub-academic-browser"');
  assert.ok(builderLaunchIndex >= 0 && builderLaunchIndex < academicBrowserIndex);
  assert.match(page, /<strong>ローカルテスト作成室<\/strong>/);
  assert.match(page, /AI\/API不要/);
  assert.match(page, /aria-label="ローカルテスト作成室を開く（AIと外部APIは不要）"/);
  assert.match(page, /isFourthYearFirstFinal && \(\s*<section className="hub-exam-schedule"/);
  assert.match(page, /isFourthYearFirstFinal && \(\s*<ComprehensiveChallenge/);
  assert.match(page, /role="status" aria-live="polite"/);

  assert.match(css, /\.hub-academic-year-tabs[\s\S]*?grid-template-columns:\s*repeat\(5,/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.hub-academic-year-tabs,[\s\S]*?overflow-x:\s*auto/);
  assert.match(css, /\.hub-academic-year-tabs button:focus-visible/);
  assert.match(layout, /1〜5年の試験・資格対策ハブ/);
});

test("home restores, scopes, and links locally created tests without breaking on corrupt storage", async () => {
  const [page, css] = await Promise.all([
    source("../app/page.tsx"),
    source("../app/globals.css"),
  ]);
  assert.match(page, /TEST_BUILDER_STORAGE_KEY/);
  assert.match(page, /readProjects/);
  assert.match(page, /type TestBuilderProject/);
  assert.match(page, /function restoreBuilderProjects\(\)[\s\S]*?try[\s\S]*?readProjects\(window\.localStorage\.getItem\(TEST_BUILDER_STORAGE_KEY\)\)[\s\S]*?catch[\s\S]*?return \[\]/);
  assert.match(page, /addEventListener\("test-grid:test-builder-projects-changed", refreshBuilderProjects\)/);
  assert.match(page, /addEventListener\("storage", handleStorage\)/);
  assert.match(page, /removeEventListener\("test-grid:test-builder-projects-changed", refreshBuilderProjects\)/);
  assert.match(page, /removeEventListener\("storage", handleStorage\)/);
  assert.match(page, /candidate\.test\.grade === selectedYear && candidate\.test\.period === selectedPeriod/);
  assert.match(page, /selectedEntries\.length \+ visibleBuilderProjects\.length/);
  assert.match(page, /visibleBuilderProjects\.map/);
  assert.match(page, /!visibleSubjects\.length && !showsToeic && !visibleBuilderProjects\.length/);
  assert.match(page, /href=\{`\/test-builder\?project=\$\{encodeURIComponent\(savedProject\.projectId\)\}`\}/);
  assert.match(page, /aria-label=\{`\$\{savedProject\.test\.title\}を開く`\}/);
  assert.match(page, /ローカルテスト作成室を開く/);
  assert.doesNotMatch(page, /テスト作成AIを開く/);
  assert.match(css, /\.hub-builder-launch\s*\{[\s\S]*?background:\s*var\(--yellow\)/);
  assert.match(css, /\.hub-builder-project-grid[\s\S]*?grid-template-columns:\s*repeat\(3,/);
  assert.match(css, /\.hub-builder-project-card > a:focus-visible/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*?\.hub-builder-project-grid[\s\S]*?grid-template-columns:\s*1fr/);
});
