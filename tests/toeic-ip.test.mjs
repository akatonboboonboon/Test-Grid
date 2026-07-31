import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { importTypeScriptGraph } from "./helpers/import-typescript-graph.mjs";

const dataPromise = importTypeScriptGraph("../app/toeic-ip-data.ts", import.meta.url);

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

const TOEIC_TOPICS = [
  "corporate-development",
  "dining",
  "entertainment",
  "finance",
  "general-business",
  "health",
  "manufacturing",
  "office",
  "personnel",
  "property",
  "purchasing",
  "technology",
  "travel",
];

const TOEIC_DIFFICULTIES = ["advanced", "basic", "standard"];
const TOEIC_PARTS_OF_SPEECH = [
  "adjective",
  "adverb",
  "noun",
  "phrase",
  "verb",
];

function normalizedTerm(value) {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/\s+/g, " ");
}

function jpegDimensions(buffer) {
  assert.equal(buffer[0], 0xff, "JPEG SOI byte 1");
  assert.equal(buffer[1], 0xd8, "JPEG SOI byte 2");
  const startOfFrameMarkers = new Set([
    0xc0,
    0xc1,
    0xc2,
    0xc3,
    0xc5,
    0xc6,
    0xc7,
    0xc9,
    0xca,
    0xcb,
    0xcd,
    0xce,
    0xcf,
  ]);
  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if (startOfFrameMarkers.has(marker)) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    if (
      marker === 0xd8 ||
      marker === 0xd9 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      offset += 2;
      continue;
    }
    const segmentLength = buffer.readUInt16BE(offset + 2);
    assert.ok(segmentLength >= 2, "invalid JPEG segment at " + offset);
    offset += segmentLength + 2;
  }
  assert.fail("JPEG dimensions were not found");
}

test("TOEIC IP data covers every Part with original answerable content", async () => {
  const data = await dataPromise;
  const parts = new Set(data.TOEIC_QUESTIONS.map((question) => question.part));
  assert.deepEqual([...parts].sort(), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(data.TOEIC_QUESTIONS.length, 40);
  assert.equal(
    new Set(data.TOEIC_QUESTIONS.map((question) => question.id)).size,
    data.TOEIC_QUESTIONS.length,
  );
  for (const question of data.TOEIC_QUESTIONS) {
    assert.ok(question.prompt.trim(), question.id + ": prompt");
    assert.ok(
      question.choices.length >= 3 && question.choices.length <= 4,
      question.id + ": choices",
    );
    assert.ok(
      Number.isInteger(question.answerIndex) &&
        question.answerIndex >= 0 &&
        question.answerIndex < question.choices.length,
      question.id + ": answerIndex",
    );
    assert.ok(question.explanationJa.trim(), question.id + ": explanation");
    assert.ok(question.evidence.trim(), question.id + ": evidence");
    assert.ok(question.ability.length, question.id + ": ability");
  }
});

test("TOEIC vocabulary provides at least 1,000 unique, complete entries across every learning filter", async () => {
  const data = await dataPromise;
  const vocab = data.TOEIC_VOCAB;
  assert.ok(
    vocab.length >= 1_000,
    "expected >= 1,000 vocabulary entries, received " + vocab.length,
  );

  const ids = new Set();
  const terms = new Set();
  for (const entry of vocab) {
    for (const field of [
      "id",
      "term",
      "meaningJa",
      "collocation",
      "example",
      "exampleJa",
      "topic",
      "difficulty",
      "partOfSpeech",
    ]) {
      assert.equal(
        typeof entry[field],
        "string",
        (entry.id || "unknown") + ": " + field + " type",
      );
      assert.ok(
        entry[field].trim(),
        (entry.id || "unknown") + ": " + field + " must not be empty",
      );
    }

    assert.ok(!ids.has(entry.id), entry.id + ": duplicate id");
    ids.add(entry.id);
    const term = normalizedTerm(entry.term);
    assert.ok(
      !terms.has(term),
      entry.id + ': duplicate normalized term "' + entry.term + '"',
    );
    terms.add(term);
  }

  assert.deepEqual(
    [...new Set(vocab.map((entry) => entry.topic))].sort(),
    TOEIC_TOPICS,
  );
  assert.deepEqual(
    [...new Set(vocab.map((entry) => entry.difficulty))].sort(),
    TOEIC_DIFFICULTIES,
  );
  assert.deepEqual(
    [...new Set(vocab.map((entry) => entry.partOfSpeech))].sort(),
    TOEIC_PARTS_OF_SPEECH,
  );
});

test("TOEIC Listening questions carry scripts and four licensed local Part 1 photographs", async () => {
  const data = await dataPromise;
  const listening = data.TOEIC_QUESTIONS.filter((question) => question.part <= 4);
  assert.ok(listening.length >= 20);
  assert.ok(listening.every((question) => question.script?.trim()));
  const part1 = listening.filter((question) => question.part === 1);
  assert.equal(part1.length, 4);

  const imageSources = new Set();
  for (const question of part1) {
    assert.ok(question.scene?.key?.trim(), question.id + ": scene key");
    assert.ok(
      question.scene?.altJa?.trim(),
      question.id + ": private answer description",
    );
    const image = question.scene?.image;
    assert.ok(image, question.id + ": image metadata");
    assert.match(
      image.src,
      /^\/toeic-ip\/[a-z0-9-]+\.jpe?g$/i,
      question.id + ": local image src",
    );
    assert.ok(
      !imageSources.has(image.src),
      question.id + ": duplicate image src",
    );
    imageSources.add(image.src);
    assert.ok(
      Number.isInteger(image.width) && image.width > 0,
      question.id + ": width",
    );
    assert.ok(
      Number.isInteger(image.height) && image.height > 0,
      question.id + ": height",
    );
    for (const field of [
      "alt",
      "credit",
      "sourceUrl",
      "licenseName",
      "licenseUrl",
    ]) {
      assert.equal(
        typeof image[field],
        "string",
        question.id + ": " + field + " type",
      );
      assert.ok(
        image[field].trim(),
        question.id + ": " + field + " must not be empty",
      );
    }
    assert.notEqual(
      image.alt.trim(),
      question.scene.altJa.trim(),
      question.id + ": image alt must not reveal the answer",
    );
    assert.equal(
      new URL(image.sourceUrl).protocol,
      "https:",
      question.id + ": source URL",
    );
    assert.equal(
      new URL(image.licenseUrl).protocol,
      "https:",
      question.id + ": license URL",
    );

    const assetUrl = new URL("../public" + image.src, import.meta.url);
    const assetStat = await stat(assetUrl);
    assert.ok(assetStat.isFile(), question.id + ": local image file");
    assert.ok(
      assetStat.size > 0,
      question.id + ": local image must not be empty",
    );
    const dimensions = jpegDimensions(await readFile(assetUrl));
    assert.deepEqual(
      dimensions,
      { width: image.width, height: image.height },
      question.id + ": JPEG dimensions",
    );
  }
  assert.equal(imageSources.size, 4);
  assert.ok(
    data.TOEIC_QUESTIONS.some(
      (question) => question.part === 3 && question.chart,
    ),
  );
});

test("TOEIC formats preserve official paper and online-IP structures", async () => {
  const data = await dataPromise;
  const paper = data.TOEIC_FORMATS.find((format) => format.mode === "paper");
  const online = data.TOEIC_FORMATS.find(
    (format) => format.mode === "online-msa",
  );
  assert.equal(paper.totalQuestions, 200);
  assert.equal(paper.listening.questionCount, 100);
  assert.equal(paper.reading.questionCount, 100);
  assert.equal(
    paper.parts.reduce((sum, part) => sum + part.questionCount, 0),
    200,
  );
  assert.equal(online.totalQuestions, 90);
  assert.equal(online.listening.questionCount, 45);
  assert.equal(online.reading.questionCount, 45);
  assert.equal(
    online.units.reduce((sum, unit) => sum + unit.questionCount, 0),
    90,
  );
  assert.equal(data.TOEIC_SUBJECT.examDate, "2026-12-25");
  assert.ok(data.TOEIC_STUDY_PHASES.length >= 7);
});

test("TOEIC page is a separate subject with audio, local progress, mocks and official links", async () => {
  const [page, player, home, layout] = await Promise.all([
    source("../app/subjects/toeic-ip/page.tsx"),
    source("../app/toeic-ip-listening-player.tsx"),
    source("../app/page.tsx"),
    source("../app/layout.tsx"),
  ]);
  assert.match(home, /href="\/subjects\/toeic-ip"/);
  assert.match(home, /2026\.12\.25|2026-12-25/);
  assert.match(home, /SUBJECT 10/);
  assert.match(layout, /TOEIC IP/);
  assert.match(page, /Part別|PART DRILL/i);
  assert.match(page, /Listening/i);
  assert.match(page, /VOCAB|単語帳/i);
  assert.match(page, /模試|MOCK/i);
  assert.match(page, /test-grid:toeic-ip:/);
  assert.match(page, /2026-12-25/);
  assert.match(page, /1-4|1〜4|\^\[1-4\]\$/);
  assert.match(page, /公式サンプル/);
  assert.match(page, /過去問/);
  assert.match(player, /SpeechSynthesisUtterance/);
  assert.match(player, /en-US/);
  assert.match(player, /en-GB/);
  assert.match(player, /en-CA/);
  assert.match(player, /en-AU/);
});

test("TOEIC page scales vocabulary rendering and displays attributed photographs without leaking answers", async () => {
  const page = await source("../app/subjects/toeic-ip/page.tsx");

  assert.match(page, /useDeferredValue\(vocabSearch\)/);
  assert.match(page, /const\s+VOCAB_BATCH_SIZE\s*=\s*90/);
  assert.match(page, /new Set\(masteredVocab\)/);
  assert.match(page, /masteredVocabSet\.has\(item\.id\)/);
  assert.match(page, /filteredVocab\.slice\(0,\s*vocabVisibleCount\)/);
  assert.match(page, /current\s*\+\s*VOCAB_BATCH_SIZE/);
  assert.match(page, /setVocabVisibleCount\(VOCAB_BATCH_SIZE\)/);

  for (const filter of [
    "vocabTopic",
    "vocabDifficulty",
    "vocabPartOfSpeech",
    "vocabStatus",
  ]) {
    assert.match(
      page,
      new RegExp("value=\\{" + filter + "\\}"),
      filter + ": select filter",
    );
  }
  assert.match(page, /deferredVocabSearch/);
  assert.match(page, /searchText/);

  assert.match(page, /<figure\s+className=\{styles\.scene\}>/);
  assert.match(
    page,
    /<img[\s\S]*?src=\{question\.scene\.image\.src\}/,
  );
  assert.match(
    page,
    /<figcaption\s+className=\{styles\.sceneCaption\}>/,
  );
  assert.match(page, /question\.scene\.image\.credit/);
  assert.match(page, /question\.scene\.image\.sourceUrl/);
  assert.match(page, /question\.scene\.image\.licenseName/);
  assert.match(page, /question\.scene\.image\.licenseUrl/);
  assert.doesNotMatch(page, /aria-label=\{question\.scene\.altJa\}/);
  assert.doesNotMatch(
    page,
    /場面イメージ：\{question\.scene\.altJa\}/,
  );
  assert.match(
    page,
    /\{answered\s*\?\s*\([\s\S]*?question\.scene\.altJa/,
  );

  assert.doesNotMatch(page, /VOCABULARY\s+60\b/);
  assert.doesNotMatch(page, /TOEIC頻出語・60語/);
  assert.doesNotMatch(page, /40問・60語/);
  assert.doesNotMatch(
    page,
    /masteredVocab\.length\}\s*\/\s*60\b/,
  );
  assert.match(page, /TOEIC_VOCAB\.length\.toLocaleString/);
});
