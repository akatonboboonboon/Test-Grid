import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("all nine subjects expose complete print-level questions to rapid, ranking, and comprehensive modes", async (context) => {
  const server = await createServer({
    root: projectRoot,
    configFile: false,
    server: { middlewareMode: true },
    logLevel: "silent",
  });
  context.after(() => server.close());
  const rapid = await server.ssrLoadModule("/app/rapid-quiz-data.ts");
  const seconds = {
    "subject-2": 90,
    network: 90,
    "subject-3": 300,
    "subject-4": 300,
    "subject-5": 300,
    "subject-6": 240,
    "subject-7": 240,
    "subject-8": 300,
    "subject-9": 240,
  };

  assert.equal(rapid.RAPID_SUBJECT_IDS.length, 9);
  for (const subjectId of rapid.RAPID_SUBJECT_IDS) {
    const staticPool = rapid.getStaticRapidPool(subjectId);
    const rankingPool = rapid.getOfficialRankingEligiblePool(subjectId);
    const comprehensivePool = rapid.getComprehensiveRapidPool(subjectId);
    assert.ok(staticPool.length >= 6, `${subjectId}: static density`);
    const ineligible = staticPool.filter((question) => !rapid.isRankingEligibleRapidQuestion(question));
    assert.equal(rankingPool.length, staticPool.length, subjectId + ": incomplete=" + ineligible.map((question) => question.id).join(","));
    assert.ok(comprehensivePool.length >= staticPool.length, `${subjectId}: comprehensive coverage`);

    for (const [label, pool] of [["static", staticPool], ["comprehensive", comprehensivePool]]) {
      assert.equal(new Set(pool.map((question) => question.id)).size, pool.length, `${subjectId}/${label}: unique IDs`);
      for (const question of pool) {
        assert.equal(question.subjectId, subjectId, question.id);
        assert.equal(question.difficulty, 3, `${question.id}: difficulty`);
        assert.equal(question.recommendedSeconds, seconds[subjectId], `${question.id}: fair time`);
        assert.ok(question.prompt.trim().length >= 8, `${question.id}: prompt`);
        assert.ok(question.explanation.trim().length >= 12, `${question.id}: explanation`);
        assert.ok(question.steps.length >= 2, `${question.id}: solving path`);
        assert.ok(question.options.length >= 2 && question.options.length <= 4, `${question.id}: choices`);
        assert.ok(question.options.some((option) => question.acceptedOptions.includes(option)), `${question.id}: selectable answer`);
        assert.equal(question.id.startsWith("rapid-card-"), false, `${question.id}: no formula-card leakage`);
        if (question.requiresVisual) assert.ok(question.visual, `${question.id}: required figure`);
        if (question.requiresReference) assert.ok(question.reference?.quote?.trim(), `${question.id}: required source text`);
      }
    }
  }
});
