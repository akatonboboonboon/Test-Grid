import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const appUrl = new URL("../app/", import.meta.url);

function transpileCommonJs(source, filename) {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  }).outputText;
}

function evaluateCommonJs(source, filename, dependencies = {}) {
  const exportsObject = {};
  const localRequire = (specifier) => {
    if (Object.hasOwn(dependencies, specifier)) return dependencies[specifier];
    throw new Error(`Unexpected import ${specifier} while evaluating ${filename}`);
  };
  const javascript = transpileCommonJs(source, filename);
  new Function("exports", "require", `${javascript}\n//# sourceURL=${filename}`)(
    exportsObject,
    localRequire,
  );
  return exportsObject;
}

let explanationModulesPromise;

function loadExplanationModules() {
  explanationModulesPromise ??= Promise.all([
    readFile(new URL("english-data.ts", appUrl), "utf8"),
    readFile(new URL("english-explanations-reading.ts", appUrl), "utf8"),
    readFile(new URL("english-explanations-language.ts", appUrl), "utf8"),
    readFile(new URL("english-explanations-extra.ts", appUrl), "utf8"),
  ]).then(([dataSource, readingSource, languageSource, extraSource]) => {
    const data = evaluateCommonJs(dataSource, "english-data.ts");
    const dataDependency = { "./english-data": data };
    return {
      data,
      reading: evaluateCommonJs(
        readingSource,
        "english-explanations-reading.ts",
        dataDependency,
      ),
      language: evaluateCommonJs(
        languageSource,
        "english-explanations-language.ts",
        dataDependency,
      ),
      extra: evaluateCommonJs(extraSource, "english-explanations-extra.ts"),
    };
  });
  return explanationModulesPromise;
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right, "en"));
}

test("reading, language, and extra explanations cover all 324 study questions", async () => {
  const { data, reading, language, extra } = await loadExplanationModules();
  const questions = data.ENGLISH_QUESTIONS;
  const questionIds = questions.map((question) => question.id);
  const questionIdSet = new Set(questionIds);
  const explanationMaps = [
    reading.ENGLISH_READING_EXPLANATIONS,
    language.ENGLISH_LANGUAGE_EXPLANATIONS,
    extra.ENGLISH_EXTRA_EXPLANATIONS,
  ];
  const coveredIds = new Set(explanationMaps.flatMap((map) => Object.keys(map)));

  assert.equal(questions.length, 324);
  assert.equal(questionIdSet.size, 324, "question ids must be unique");
  assert.deepEqual(
    sorted([...coveredIds]),
    sorted(questionIds),
    "the union of the three explanation maps must equal the question corpus",
  );

  for (const question of questions) {
    const readingExplanation = reading.ENGLISH_READING_EXPLANATIONS[question.id];
    const textExplanation = language.ENGLISH_LANGUAGE_EXPLANATIONS[question.id]
      ?? extra.ENGLISH_EXTRA_EXPLANATIONS[question.id];
    const detailed = readingExplanation
      ? readingExplanation.correctReason?.trim().length >= 20
        && readingExplanation.naturalTranslation?.trim().length >= 2
      : textExplanation?.trim().length >= 60;
    assert.ok(detailed, `${question.id} must have a substantive explanation`);
  }
});

test("12 passage grammar ordering questions stay sentence-sized and span all active chapters", async () => {
  const { data, language } = await loadExplanationModules();
  const questions = data.ENGLISH_QUESTIONS.filter(
    (question) => question.id.startsWith("passage-order-"),
  );
  const completeParagraphs = new Set(
    data.ENGLISH_PASSAGES.flatMap((passage) =>
      passage.paragraphs.map((paragraph) => paragraph.en),
    ),
  );

  assert.equal(questions.length, 12);
  assert.deepEqual(
    [...new Set(questions.map((question) => question.unit))].sort(),
    ["ch15", "ch16", "ch18"],
  );

  for (const question of questions) {
    assert.equal(question.format, "order");
    assert.equal(question.group, "語順整序｜本文主要文法");
    assert.ok(question.tokens.length >= 4);
    assert.ok(
      !completeParagraphs.has(question.answer),
      `${question.id} must not turn a whole paragraph into an ordering item`,
    );
    assert.match(
      language.ENGLISH_LANGUAGE_EXPLANATIONS[question.id] ?? "",
      /【完成文】[\s\S]*【文法構造】[\s\S]*【組み立て方】/u,
    );
  }
});

test("explanation coverage diagnostics are empty and map keys match their targets", async () => {
  const { reading, language } = await loadExplanationModules();

  assert.deepEqual(reading.ENGLISH_READING_EXPLANATION_MISSING_IDS, []);
  assert.deepEqual(reading.ENGLISH_READING_EXPLANATION_OPTION_GAPS, []);
  assert.deepEqual(reading.ENGLISH_READING_EXPLANATION_REFERENCE_GAPS, []);
  assert.deepEqual(reading.ENGLISH_READING_EXPLANATION_UNUSED_IDS, []);
  assert.deepEqual(language.ENGLISH_LANGUAGE_EXPLANATION_MISSING_IDS, []);

  assert.deepEqual(
    sorted(Object.keys(reading.ENGLISH_READING_EXPLANATIONS)),
    sorted(reading.ENGLISH_READING_EXPLANATION_TARGET_IDS),
  );
  assert.deepEqual(
    sorted(Object.keys(language.ENGLISH_LANGUAGE_EXPLANATIONS)),
    sorted(language.ENGLISH_LANGUAGE_EXPLANATION_TARGET_IDS),
  );
});

test("every choice question explains its correct choice and distractors", async () => {
  const { data, reading, language, extra } = await loadExplanationModules();
  const choiceQuestions = data.ENGLISH_QUESTIONS.filter(
    (question) => question.format === "choice",
  );

  assert.equal(choiceQuestions.length, 33);

  for (const question of choiceQuestions) {
    assert.ok(question.options?.length >= 2, `${question.id} must expose its choices`);
    const structured = reading.ENGLISH_READING_EXPLANATIONS[question.id];
    if (structured) {
      const analyses = structured.optionAnalysis ?? [];
      assert.deepEqual(
        sorted(analyses.map((analysis) => analysis.option)),
        sorted(question.options),
        `${question.id} must analyze every displayed option`,
      );
      for (const option of question.options) {
        const analysis = analyses.find((item) => item.option === option);
        assert.ok(analysis?.reason.trim().length >= 8, `${question.id}::${option} needs a reason`);
        assert.equal(analysis.isCorrect, option === question.answer);
      }
      continue;
    }

    const languageText = language.ENGLISH_LANGUAGE_EXPLANATIONS[question.id];
    if (languageText) {
      assert.match(languageText, /【正解】/u, `${question.id} needs a correct-answer section`);
      assert.match(languageText, /【誤答】/u, `${question.id} needs a distractor section`);
      for (const option of question.options.filter((option) => option !== question.answer)) {
        assert.ok(languageText.includes(option), `${question.id} must discuss distractor ${option}`);
      }
      continue;
    }

    const extraText = extra.ENGLISH_EXTRA_EXPLANATIONS[question.id] ?? "";
    assert.ok(extraText.includes(question.answer), `${question.id} must state its answer`);
    assert.match(extraText, /【他が違う理由】/u, `${question.id} needs distractor analysis`);
  }
});

test("all T/F questions carry a passage reference, translation, and binary analysis", async () => {
  const { data, reading } = await loadExplanationModules();
  const trueFalseQuestions = data.ENGLISH_QUESTIONS.filter(
    (question) => question.group === "長文 True / False",
  );

  assert.equal(trueFalseQuestions.length, 8);

  for (const question of trueFalseQuestions) {
    const explanation = reading.ENGLISH_READING_EXPLANATIONS[question.id];
    assert.ok(explanation, `${question.id} must use the reading overlay`);
    assert.equal(explanation.reference.passageId, question.passageId);
    assert.ok(explanation.reference.paragraphNumbers.length >= 1);
    assert.ok(explanation.reference.english.length >= 40);
    assert.ok(explanation.naturalTranslation.length >= 20);
    assert.ok(explanation.correctReason.length >= 40);
    assert.deepEqual(
      sorted(explanation.optionAnalysis.map((item) => item.option)),
      ["F", "T"],
    );
  }
});

test("all 26 passage translations have sentence-specific grammar evidence", async () => {
  const { data, reading } = await loadExplanationModules();
  const translationQuestions = data.ENGLISH_QUESTIONS.filter(
    (question) => question.group === "長文和訳",
  );
  const grammarEvidence = /主語|述語|動詞|受動態|現在完了|修飾|節|句|不定詞|分詞|並列|目的語|補語|同格|関係|時制|前置詞|比較|対比|構造|骨格|主節|目的|理由|条件|譲歩/u;
  const rationales = new Set();
  const missingGrammarEvidence = [];

  assert.equal(translationQuestions.length, 26);

  for (const question of translationQuestions) {
    const explanation = reading.ENGLISH_READING_EXPLANATIONS[question.id];
    assert.ok(explanation, `${question.id} must use the reading overlay`);
    assert.equal(explanation.reference.paragraphNumbers.length, 1);
    assert.ok(question.prompt.includes(explanation.reference.english));
    assert.equal(explanation.naturalTranslation, question.answer);
    assert.ok(explanation.correctReason.length >= 60);
    if (!grammarEvidence.test(explanation.correctReason)) missingGrammarEvidence.push(question.id);
    assert.ok(explanation.readingTip?.length >= 20);
    rationales.add(explanation.correctReason);
  }

  assert.equal(rationales.size, 26, "each translated sentence needs its own rationale");
  assert.deepEqual(missingGrammarEvidence, [], "every translation needs explicit grammar evidence");
});

test("all 108 vocabulary cards explain meaning, form, origin, and the answer", async () => {
  const { data, language } = await loadExplanationModules();
  const vocabularyQuestions = data.ENGLISH_QUESTIONS.filter(
    (question) => question.group === "語彙・熟語（日→英）",
  );

  assert.equal(data.ENGLISH_VOCAB.length, 108);
  assert.equal(vocabularyQuestions.length, 108);

  for (const card of data.ENGLISH_VOCAB) {
    const questionId = `question-${card.id}`;
    const question = vocabularyQuestions.find((candidate) => candidate.id === questionId);
    const explanation = language.ENGLISH_LANGUAGE_EXPLANATIONS[questionId] ?? "";
    assert.ok(question, `${questionId} must exist for ${card.en}`);
    assert.equal(question.answer, card.en);
    assert.ok(explanation.includes(card.en), `${questionId} must state the English answer`);
    assert.match(explanation, /【意味】/u);
    assert.match(explanation, /【品詞・形】/u);
    assert.match(explanation, /【語源・覚え方】/u);
    assert.match(explanation, /【正解の理由】/u);
    assert.ok(explanation.length >= 140, `${questionId} explanation is too short`);
  }
});

test("all 108 vocabulary cards also produce explained English-to-Japanese mock questions", async () => {
  const { data, language } = await loadExplanationModules();
  const reverseQuestions = data.ENGLISH_QUESTIONS.filter(
    (question) => question.group === "語彙・熟語（英→日）",
  );

  assert.equal(reverseQuestions.length, 108);
  for (const card of data.ENGLISH_VOCAB) {
    const questionId = `reverse-question-${card.id}`;
    const question = reverseQuestions.find((candidate) => candidate.id === questionId);
    const explanation = language.ENGLISH_LANGUAGE_EXPLANATIONS[questionId] ?? "";
    assert.ok(question, `${questionId} must exist for ${card.en}`);
    assert.equal(question.grading, "japanese-semantic");
    assert.equal(question.answer, card.ja);
    assert.ok(question.prompt.includes(card.en));
    assert.match(explanation, /【意味】/u);
    assert.match(explanation, /【品詞・形】/u);
    assert.match(explanation, /【語源・覚え方】/u);
    assert.match(explanation, /【正解の理由】/u);
    assert.match(explanation, /【採点】/u);
  }
});

test("the Chapter 16 weather figure, public image, and five question explanations stay linked", async () => {
  const { data, extra } = await loadExplanationModules();
  const weatherIds = Array.from({ length: 5 }, (_, index) => `ch16-homepage-${index + 1}`);
  const [componentSource, pageSource, styleSource, image, imageStats] = await Promise.all([
    readFile(new URL("english-weather-figure.tsx", appUrl), "utf8"),
    readFile(new URL("subjects/subject-2/page.tsx", appUrl), "utf8"),
    readFile(new URL("english-weather-figure.module.css", appUrl), "utf8"),
    readFile(new URL("../public/english/ch16-weather-homepage-source.jpg", appUrl)),
    stat(new URL("../public/english/ch16-weather-homepage-source.jpg", appUrl)),
  ]);

  assert.match(componentSource, /SOURCE_IMAGE\s*=\s*"\/english\/ch16-weather-homepage-source\.jpg"/u);
  assert.match(componentSource, /export function EnglishWeatherFigure\(\)/u);
  assert.match(componentSource, /<Image/u);
  assert.match(componentSource, /href=\{SOURCE_IMAGE\}/u);
  assert.match(styleSource, /rotate\(-90deg\)/u);
  assert.ok(
    (pageSource.match(/startsWith\("ch16-homepage-"\)/gu) ?? []).length >= 2,
    "the drill and reading views must both display the source figure",
  );
  assert.ok(imageStats.size > 100_000, "the public source photo must not be a placeholder");
  assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff], "source image must be JPEG");

  for (const id of weatherIds) {
    const question = data.ENGLISH_QUESTIONS.find((candidate) => candidate.id === id);
    const explanation = extra.ENGLISH_EXTRA_EXPLANATIONS[id] ?? "";
    assert.ok(question, `${id} must exist`);
    assert.equal(question.format, "choice");
    assert.ok(explanation.includes(question.answer), `${id} must state its answer`);
    assert.match(explanation, /【問題文の和訳】/u);
    assert.match(explanation, /【図の読み方】/u);
    assert.match(explanation, /【他が違う理由】/u);
  }
});
