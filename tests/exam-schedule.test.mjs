import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const PAGE_URL = new URL("../app/page.tsx", import.meta.url);
const DATA_URL = new URL("../app/study-data.ts", import.meta.url);
const CSS_URL = new URL("../app/globals.css", import.meta.url);

test("defines the five 2026 exam dates and covers all nine subjects", async () => {
  const data = await readFile(DATA_URL, "utf8");
  const scheduleBlock = data.match(/export const EXAM_SCHEDULE[\s\S]*?\n\];/)?.[0] ?? "";

  assert.match(scheduleBlock, /2026-07-28/);
  assert.match(scheduleBlock, /2026-07-29/);
  assert.match(scheduleBlock, /2026-07-30/);
  assert.match(scheduleBlock, /2026-07-31/);
  assert.match(scheduleBlock, /2026-08-03/);
  assert.equal((scheduleBlock.match(/subjectIds:/g) ?? []).length, 5);

  const ids = [...scheduleBlock.matchAll(/"(network|subject-[2-9])"/g)].map((match) => match[1]);
  assert.deepEqual(new Set(ids), new Set([
    "subject-2",
    "network",
    "subject-3",
    "subject-4",
    "subject-5",
    "subject-6",
    "subject-7",
    "subject-8",
    "subject-9",
  ]));
});

test("renders the schedule directly after the hub summary with dates, subjects, and countdowns", async () => {
  const page = await readFile(PAGE_URL, "utf8");
  const summaryPosition = page.indexOf('className="hub-summary"');
  const schedulePosition = page.indexOf('className="hub-exam-schedule"');
  const subjectsPosition = page.indexOf('className="hub-subject-section"');

  assert.match(page, /EXAM_SCHEDULE/);
  assert.ok(summaryPosition >= 0 && schedulePosition > summaryPosition && subjectsPosition > schedulePosition);
  assert.match(page, /EXAM_SCHEDULE\.map\(\(entry, index\)/);
  assert.match(page, /<time dateTime=\{entry\.date\}>\{entry\.displayDate\}<\/time>/);
  assert.match(page, /subjects\.find\(\(subject\) => subject\.id === subjectId\)/);
  assert.match(page, /scheduleCountdownLabel\(entry\.date\)/);
  assert.match(page, /あと\$\{days\}日/);
  assert.match(page, /EXAM SCHEDULE \/ 2026/);
});

test("keeps schedule cards readable on desktop and 680px mobile without changing dialog focus behavior", async () => {
  const [page, css] = await Promise.all([
    readFile(PAGE_URL, "utf8"),
    readFile(CSS_URL, "utf8"),
  ]);

  assert.match(css, /\.hub-exam-schedule-list\s*\{[\s\S]*?grid-template-columns:\s*repeat\(5,/);
  assert.match(css, /@media\s*\(max-width:\s*680px\)\s*\{[\s\S]*?\.hub-exam-schedule-list\s*\{[\s\S]*?grid-template-columns:\s*1fr;/);
  assert.match(css, /\.hub-exam-schedule-item\s*\{[\s\S]*?min-width:\s*0;/);
  assert.match(page, /\}, \[dialogOpen\]\);/);
  assert.doesNotMatch(page, /\}, \[editing\]\);/);
});
