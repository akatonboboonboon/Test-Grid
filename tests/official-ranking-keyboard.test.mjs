import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readRanking = () => readFile(new URL("../app/official-ranking-test.tsx", import.meta.url), "utf8");

test("official ranking maps network keys to L1-L7 and four-choice keys by displayed order", async () => {
  const source = await readRanking();

  for (const token of [
    'question.subjectId === "network"',
    'option.trim().toUpperCase() ===',
    "question.options.length === 4 && number <= 4",
    "question.options[number - 1]",
    "displayedQuestion.options.map((option, optionIndex) =>",
    "officialRankingOptionShortcut(displayedQuestion, option, optionIndex)",
    "aria-keyshortcuts={shortcut ?? undefined}",
    'className="rapid-option-shortcut"',
    "数字キーで回答できます",
  ]) assert.ok(source.includes(token), token);
});

test("official ranking keyboard grades one answer immediately and ignores typing or replay", async () => {
  const source = await readRanking();

  for (const token of [
    'target.matches("input, textarea, select")',
    "target.isContentEditable",
    "event.repeat",
    "event.isComposing",
    "event.keyCode === 229",
    "event.altKey",
    "event.ctrlKey",
    "event.metaKey",
    "event.shiftKey",
    "answerLockedRef.current",
    "isEditableRankingKeyTarget",
    "event.preventDefault()",
    "void answer(selected)",
    'window.addEventListener("keydown", handleRankingNumberKey)',
    'window.removeEventListener("keydown", handleRankingNumberKey)',
    'if (phase !== "playing" || !session || answerLockedRef.current) return',
    "submitOfficialRankingAnswer(session, selected)",
  ]) assert.ok(source.includes(token), token);
  for (const token of ["answersRef", "submitOfficialRankingChallenge"]) {
    assert.equal(source.includes(token), false, token);
  }
});

test("official ranking choices keep the shared one-row desktop layout and responsive wrapping", async () => {
  const [source, css] = await Promise.all([
    readRanking(),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.ok(source.includes('"--rapid-option-count": displayedQuestion.options.length'));
  assert.ok(css.includes("grid-template-columns: repeat(var(--rapid-option-count, 4), minmax(0, 1fr))"));
  assert.ok(css.includes("@media (max-width: 800px)"));
  assert.ok(css.includes("@media (max-width: 560px)"));
  assert.ok(css.includes("grid-template-columns: repeat(4, minmax(0, 1fr))"));
  assert.ok(css.includes("grid-template-columns: repeat(2, minmax(0, 1fr))"));
});
