import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const APP_URL = new URL("../app/", import.meta.url);

function evaluateTypeScript(source, filename, requireModule) {
  const exportsObject = {};
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  }).outputText;
  new Function("exports", "require", `${javascript}\n//# sourceURL=${filename}`)(
    exportsObject,
    requireModule ?? ((specifier) => {
      throw new Error(`Unexpected import ${specifier} while evaluating ${filename}`);
    }),
  );
  return exportsObject;
}

let modulesPromise;
async function loadModules() {
  modulesPromise ??= Promise.all([
    readFile(new URL("english-data.ts", APP_URL), "utf8"),
    readFile(new URL("material-mechanics-generator-data.ts", APP_URL), "utf8"),
    readFile(new URL("digital-circuits-generator.ts", APP_URL), "utf8"),
    readFile(new URL("digital-circuits-extra-generator.ts", APP_URL), "utf8"),
    readFile(new URL("generated-practice-engine.ts", APP_URL), "utf8"),
  ]).then(([englishSource, materialSource, digitalSource, digitalExtraSource, engineSource]) => {
    const english = evaluateTypeScript(englishSource, "english-data.ts");
    const material = evaluateTypeScript(materialSource, "material-mechanics-generator-data.ts");
    const digital = evaluateTypeScript(digitalSource, "digital-circuits-generator.ts");
    const digitalExtra = evaluateTypeScript(digitalExtraSource, "digital-circuits-extra-generator.ts");
    const engine = evaluateTypeScript(engineSource, "generated-practice-engine.ts", (specifier) => {
      if (specifier === "./english-data") return english;
      if (specifier === "./material-mechanics-generator-data") return material;
      if (specifier === "./digital-circuits-generator") return digital;
      if (specifier === "./digital-circuits-extra-generator") return digitalExtra;
      throw new Error("Unexpected engine import " + specifier);
    });
    return { english, engine };
  });  return modulesPromise;
}

const SUBJECT_IDS = ["subject-2", "subject-3", "subject-4", "subject-5", "subject-6", "subject-7", "subject-8", "subject-9"];
const ALLOWED_CHAPTERS = new Set(["ch14", "ch15", "ch16", "ch18"]);
const FORBIDDEN_CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/u;

function visibleStrings(question) {
  return [
    ["prompt", question.prompt],
    ["context", question.context],
    ["answer", question.answer],
    ...question.steps.map((value, index) => [`steps[${index}]`, value]),
    ["reason", question.reason],
    ["explanation", question.explanation],
  ].filter(([, value]) => typeof value === "string");
}

function inlineMathSegments(value) {
  return [...value.matchAll(/\\\(([\s\S]*?)\\\)/gu)].map((match) => match[1]);
}

test("on-demand generation metadata exposes only subjects with source-backed generators", async () => {
  const { engine } = await loadModules();
  assert.deepEqual(engine.GENERATED_PRACTICE_SUBJECTS.map((subject) => subject.id), SUBJECT_IDS);
  assert.equal(engine.GENERATED_PRACTICE_SUBJECTS.some((subject) => subject.id === "network"), false);
  assert.equal(engine.GENERATED_PRACTICE_SUBJECTS.some((subject) => subject.id === "subject-5"), true);
  assert.equal(engine.GENERATED_PRACTICE_SUBJECTS.some((subject) => subject.id === "subject-9"), true);
  assert.equal(engine.GENERATED_PRACTICE_TEMPLATE_METADATA.length, 48);
  assert.deepEqual(
    [...new Set(engine.GENERATED_PRACTICE_TEMPLATE_METADATA.map((template) => template.subjectId))],
    SUBJECT_IDS,
  );
  assert.deepEqual(
    engine.GENERATED_PRACTICE_TEMPLATE_METADATA.filter((template) => template.subjectId === "subject-2").map((template) => template.id),
    ["english-order", "english-translation", "english-grammar"],
  );
});

test("on-demand templates stay inside the formulas currently taught in the loaded range", async () => {
  const { engine } = await loadModules();
  const excluded = new Set([
    "thermo-entropy-isochoric",
    "statistics-information-content",
    "smart-settling-band",
  ]);
  const ids = engine.GENERATED_PRACTICE_TEMPLATE_METADATA.map((template) => template.id);
  for (const id of excluded) assert.equal(ids.includes(id), false, `${id} must remain outside generation`);
  const sourceFilesBySubject = {
    "subject-3": ["mechanical-dynamics-data.ts"],
    "subject-4": ["thermodynamics-data.ts"],
    "subject-5": ["material-mechanics-data.ts"],
    "subject-6": ["smart-control-data.ts"],
    "subject-7": ["statistics-data.ts", "statistics-pdf34-data.ts", "statistics-additional-data.ts"],
    "subject-8": ["applied-math-data.ts"],
  };
  const sourceTextBySubject = Object.fromEntries(await Promise.all(
    Object.entries(sourceFilesBySubject).map(async ([subjectId, filenames]) => [
      subjectId,
      (await Promise.all(filenames.map((filename) => readFile(new URL(filename, APP_URL), "utf8")))).join("\n"),
    ]),
  ));
  const numericTemplates = engine.GENERATED_PRACTICE_TEMPLATE_METADATA.filter((template) => template.kind === "calculation");
  assert.equal(Object.keys(engine.GENERATED_PRACTICE_SOURCE_REFERENCES).length, numericTemplates.length);
  for (const template of numericTemplates) {
    const references = engine.GENERATED_PRACTICE_SOURCE_REFERENCES[template.id];
    assert.ok(Array.isArray(references) && references.length > 0, `${template.id} source references`);
    for (const reference of references) {
      assert.match(
        sourceTextBySubject[template.subjectId],
        new RegExp(`id:\\s*["']${reference}["']`),
        `${template.id} references a real in-scope study entry`,
      );
    }
    const question = engine.generatePracticeQuestion(template.subjectId, `source-ref:${template.id}`, { templateId: template.id });
    assert.deepEqual(question.sourceReferenceIds, [...references]);
    const tampered = { ...question, sourceReferenceIds: ["not-in-current-range"] };
    assert.equal(engine.validateGeneratedPracticeQuestion(tampered).ok, false);
  }
  for (let seed = 0; seed < 80; seed += 1) {
    const question = engine.generatePracticeQuestion("subject-6", `unit-step:${seed}`, { templateId: "smart-steady-state" });
    assert.equal(question.parameters.input, 1);
    assert.match(question.prompt, /単位ステップ/);
    assert.equal(question.formula, "y(\\infty)=K");
  }
  const varianceQuestion = engine.generatePracticeQuestion(
    "subject-7",
    "sigma-expanded",
    { templateId: "statistics-symmetric-variance" },
  );
  assert.match(varianceQuestion.formula, /\\sum/u);
  assert.ok(varianceQuestion.expandedFormula);
  assert.doesNotMatch(varianceQuestion.expandedFormula, /\\sum/u);
  for (const value of [varianceQuestion.parameters.x1, varianceQuestion.parameters.x2, varianceQuestion.parameters.x3]) {
    assert.match(varianceQuestion.expandedFormula, new RegExp(`\\(${value}-`));
  }
});

test("material and digital generators include scoped solution diagrams", async () => {
  const { engine } = await loadModules();
  for (const template of engine.GENERATED_PRACTICE_TEMPLATE_METADATA.filter((item) => item.subjectId === "subject-5")) {
    const question = engine.generatePracticeQuestion("subject-5", "material-visual-" + template.id, { templateId: template.id });
    assert.equal(question.evaluation.type, "numeric");
    assert.equal(question.visual?.type, "material-mechanics");
    assert.ok(question.sourceReferenceIds?.length);
  }
  for (const template of engine.GENERATED_PRACTICE_TEMPLATE_METADATA.filter((item) => item.subjectId === "subject-9")) {
    const question = engine.generatePracticeQuestion("subject-9", "digital-visual-" + template.id, { templateId: template.id });
    assert.equal(question.format, "text");
    assert.equal(question.evaluation.type, "normalized-text");
    assert.equal(question.visual?.type, "digital-circuit");
    assert.ok(question.answer);
    assert.ok(question.steps.length >= 2);
  }
});
test("mechanical past-paper generator reproduces major 6 as solved multi-stage linked work", async () => {
  const { engine } = await loadModules();
  for (let seed = 0; seed < 48; seed += 1) {
    const question = engine.generatePracticeQuestion(
      "subject-3",
      `mechanical-major-6:${seed}`,
      { templateId: "mechanical-lever-spring-damper" },
    );
    assert.deepEqual(question.sourceReferenceIds, ["md-f-rotational", "md-f-lever", "md-f-zeta", "md-f-critical"]);
    assert.equal(question.difficulty, 3);
    assert.ok(question.subpartCount >= 7);
    assert.ok(question.steps.length >= 7);
    assert.deepEqual(question.visual, { type: "mechanical-dynamics", kind: "pinned-beam" });
    assert.match(question.source.label, /機械力学過去問\.pdf 大問6/u);
    assert.match(question.sourceBasis.join(" "), /実物過去問 大問6/u);
    assert.equal(question.parameters.rotationalInertia, question.parameters.mass * question.parameters.massArm ** 2);
    assert.equal(question.parameters.rotationalDamping, question.parameters.damping * question.parameters.massArm ** 2);
    assert.equal(question.parameters.rotationalStiffness, question.parameters.stiffness * question.parameters.springArm ** 2);
    assert.ok(Math.abs(
      question.parameters.naturalOmega
        - Math.sqrt(question.parameters.rotationalStiffness / question.parameters.rotationalInertia),
    ) <= 1e-12);
    assert.ok(Math.abs(
      question.evaluation.numericAnswer
        - 2 * question.parameters.springArm * Math.sqrt(question.parameters.mass * question.parameters.stiffness) / question.parameters.damping,
    ) <= 1e-12);
    assert.ok(question.safety.denominators.every((value) => Number.isFinite(value) && value > 0));
    assert.ok(question.evaluation.numericAnswer > 0 && question.evaluation.numericAnswer <= question.parameters.springArm, "0 < r_c <= l");
    assert.equal(engine.validateGeneratedPracticeQuestion(question).ok, true);
  }
});
test("mechanical generators grade the final linked result and render real math", async () => {
  const { engine } = await loadModules();
  const cases = [
    ["mechanical-natural-frequency", "period", "s", undefined],
    ["mechanical-series-springs", "period", "s", "series-parallel-chain"],
    ["mechanical-damping-ratio", "c2", "m", undefined],
    ["mechanical-pendulum-length", "length", "m", undefined],
    ["mechanical-log-decrement", "stiffness", "N/m", undefined],
  ];
  for (const [templateId, finalParameter, unit, diagram] of cases) {
    const question = engine.generatePracticeQuestion("subject-3", `mechanical-final:${templateId}`, { templateId });
    assert.equal(question.evaluation.numericAnswer, question.parameters[finalParameter], `${templateId} grades final result`);
    assert.equal(question.evaluation.expectedUnit, unit, `${templateId} final unit`);
    assert.match(question.prompt, /\\\([^)]*\\\)/u, `${templateId} visible inline TeX`);
    assert.match(question.prompt, /最後/u, `${templateId} explicitly asks for final result`);
    assert.ok(question.steps.length >= 4, `${templateId} linked calculations`);
    if (diagram) assert.equal(question.visual?.kind, diagram, `${templateId} matching diagram`);
  }
  const laplace = engine.generatePracticeQuestion("subject-3", "mechanical-laplace", { templateId: "mechanical-laplace-step-response" });
  assert.equal(laplace.evaluation.numericAnswer, laplace.parameters.response);
  assert.equal(laplace.difficulty, 3);
  assert.ok(laplace.subpartCount >= 4 && laplace.steps.length >= 4);
  assert.deepEqual(laplace.sourceReferenceIds, ["md-f-transfer", "md-f-coverup", "md-f-first-order", "md-f-step-response"]);
  assert.match(laplace.prompt, /Y\(s\)[\s\S]*y\(t\)[\s\S]*y\(t_0\)/u);
});
test("additional thermodynamics and statistics generators keep exact source files and calculations", async () => {
  const { engine } = await loadModules();
  const reversed = engine.generatePracticeQuestion("subject-4", "additional-reversed-carnot", { templateId: "thermo-reversed-carnot" });
  assert.deepEqual(reversed.sourceReferenceIds, [
    "th-refrigeration-balance",
    "th-refrigeration-cop",
    "th-heat-pump-cop",
    "th-reversed-carnot-cop",
  ]);
  assert.deepEqual(reversed.source.pages, [9]);
  assert.match(reversed.source.label, /PXL_20260722_114536629\.MP\.jpg/u);
  assert.match(reversed.sourceBasis.join(" "), /追加範囲 p\.9/u);
  assert.equal(reversed.parameters.highC, 47);
  assert.equal(reversed.parameters.lowC, 7);
  assert.equal(reversed.parameters.copR, 7);
  assert.equal(reversed.parameters.copHP, 8);
  assert.ok(Math.abs(
    reversed.evaluation.numericAnswer - reversed.parameters.refrigerationCapacity / reversed.parameters.copR,
  ) <= 1e-12);
  assert.ok(reversed.safety.denominators.every((value) => value > 0));

  const chebyshev = engine.generatePracticeQuestion("subject-7", "additional-chebyshev", { templateId: "statistics-chebyshev" });
  assert.deepEqual(chebyshev.sourceReferenceIds, ["stats-chebyshev"]);
  assert.deepEqual(chebyshev.source.pages, [2, 3]);
  assert.match(chebyshev.source.label, /PXL_20260722_114650437\.MP\.jpg/u);
  assert.match(chebyshev.source.label, /PXL_20260722_114652791\.MP\.jpg/u);
  assert.ok(chebyshev.parameters.k > 1);
  assert.equal(chebyshev.parameters.intervalLower, chebyshev.parameters.mean - chebyshev.parameters.k * chebyshev.parameters.standardDeviation);
  assert.equal(chebyshev.parameters.intervalUpper, chebyshev.parameters.mean + chebyshev.parameters.k * chebyshev.parameters.standardDeviation);
  assert.ok(Math.abs(chebyshev.evaluation.numericAnswer - (1 - 1 / chebyshev.parameters.k ** 2) * 100) <= 1e-12);
  assert.doesNotMatch(chebyshev.formula, /\\sum/u);
});
test("seeded API is deterministic and the set API cycles through every template", async () => {
  const { engine } = await loadModules();
  for (const subjectId of SUBJECT_IDS) {
    assert.deepEqual(
      engine.generatePracticeQuestion(subjectId, "same-seed"),
      engine.generatePracticeQuestion(subjectId, "same-seed"),
      `${subjectId} deterministic`,
    );
    assert.notDeepEqual(
      engine.generatePracticeQuestion(subjectId, "same-seed"),
      engine.generatePracticeQuestion(subjectId, "different-seed"),
      `${subjectId} seed should affect id or parameters`,
    );
    const templates = engine.GENERATED_PRACTICE_TEMPLATE_METADATA.filter((template) => template.subjectId === subjectId);
    const generated = engine.generatePracticeSet(subjectId, templates.length, `set-${subjectId}`);
    assert.deepEqual(generated.map((question) => question.templateId), templates.map((template) => template.id));
  }
  assert.throws(() => engine.generatePracticeSet("subject-3", 0, "bad"), /1〜100/);
  assert.throws(() => engine.generatePracticeQuestion("subject-3", 1, { templateId: "missing" }), /テンプレート/);
});

test("every template produces a solved, finite, source-backed question", async () => {
  const { engine } = await loadModules();
  const katex = await import(new URL("../app/vendor/katex/katex.mjs", import.meta.url));
  for (const template of engine.GENERATED_PRACTICE_TEMPLATE_METADATA) {
    for (let seed = 0; seed < 40; seed += 1) {
      const question = engine.generatePracticeQuestion(template.subjectId, `${template.id}:${seed}`, { templateId: template.id });
      const validation = engine.validateGeneratedPracticeQuestion(question);
      assert.equal(validation.ok, true, `${template.id}:${seed}: ${validation.errors.join(" / ")}`);
      assert.equal(question.templateId, template.id);
      assert.ok(question.answer.trim(), `${question.id} answer`);
      assert.ok(question.acceptedAnswers.length >= 1, `${question.id} accepted answers`);
      assert.ok(question.steps.length >= 2, `${question.id} steps`);
      assert.ok(question.reason.length >= 8, `${question.id} reason`);
      assert.ok(question.explanation.length >= 12, `${question.id} explanation`);
      assert.equal(question.generation, "on-demand");
      assert.equal(question.provenance, "generated-from-in-scope-material");
      assert.equal(question.safety.domainChecked, true);
      assert.ok(question.safety.denominators.every((value) => Number.isFinite(value) && Math.abs(value) > 1e-12));
      assert.ok(question.safety.radicands.every((value) => Number.isFinite(value) && value >= 0));
      assert.ok(question.safety.logArguments.every((value) => Number.isFinite(value) && value > 0));
      assert.ok(Object.values(question.parameters).filter((value) => typeof value === "number").every(Number.isFinite));
      if (question.evaluation.type === "numeric") {
        assert.ok(Number.isFinite(question.evaluation.numericAnswer), `${question.id} finite answer`);
        assert.ok(question.evaluation.tolerance >= 0, `${question.id} tolerance`);
        assert.equal(question.format, "number");
        assert.ok(question.formula, `${question.id} formula`);
        assert.doesNotMatch(question.formula, /\//, `${question.id} uses stacked TeX fractions`);
        assert.doesNotThrow(() => katex.renderToString(question.formula, {
          displayMode: true,
          output: "htmlAndMathml",
          strict: "error",
          throwOnError: true,
          trust: false,
        }), `${question.id} valid TeX`);
      }
    }
  }
});

test("runtime user-visible strings preserve TeX delimiters and every math segment parses", async () => {
  const { engine } = await loadModules();
  const katex = await import(new URL("../app/vendor/katex/katex.mjs", import.meta.url));
  for (const template of engine.GENERATED_PRACTICE_TEMPLATE_METADATA) {
    for (let seed = 0; seed < 12; seed += 1) {
      const question = engine.generatePracticeQuestion(template.subjectId, `runtime-tex:${template.id}:${seed}`, { templateId: template.id });
      for (const [field, value] of visibleStrings(question)) {
        assert.doesNotMatch(value, FORBIDDEN_CONTROL_CHARACTERS, `${question.id}.${field} control character`);
        assert.equal((value.match(/\\\(/gu) ?? []).length, (value.match(/\\\)/gu) ?? []).length, `${question.id}.${field} balanced delimiters`);
        for (const segment of inlineMathSegments(value)) {
          assert.doesNotMatch(segment, /\\\\(?:mathbf|phi|nabla|overrightarrow|le|oint|,)/u, `${question.id}.${field} double-escaped TeX command`);
          assert.doesNotThrow(() => katex.renderToString(segment, {
            displayMode: false,
            output: "htmlAndMathml",
            strict: "error",
            throwOnError: true,
            trust: false,
          }), `${question.id}.${field} invalid inline TeX: ${segment}`);
        }
      }
      if (question.formula) {
        assert.doesNotMatch(question.formula, FORBIDDEN_CONTROL_CHARACTERS, `${question.id}.formula control character`);
        assert.doesNotThrow(() => katex.renderToString(question.formula, {
          displayMode: true,
          output: "htmlAndMathml",
          strict: "error",
          throwOnError: true,
          trust: false,
        }), `${question.id}.formula invalid TeX: ${question.formula}`);
      }
      if (question.expandedFormula) {
        assert.doesNotThrow(() => katex.renderToString(question.expandedFormula, {
          displayMode: true,
          output: "htmlAndMathml",
          strict: "error",
          throwOnError: true,
          trust: false,
        }), `${question.id}.expandedFormula invalid TeX: ${question.expandedFormula}`);
      }
    }
  }
});

test("every English template and the default initial English question are SSR-safe", async () => {
  const { engine } = await loadModules();
  for (const templateId of ["english-order", "english-translation", "english-grammar"]) {
    assert.doesNotThrow(() => engine.generatePracticeQuestion("subject-2", `ssr:${templateId}`, { templateId }));
  }
  const initial = engine.generatePracticeQuestion("subject-2", "generated-practice-initial:subject-2");
  assert.equal(engine.validateGeneratedPracticeQuestion(initial).ok, true);
  assert.equal(initial.subjectId, "subject-2");
});

test("hundreds of arbitrary seeds never leak unsolved or undefined questions", async () => {
  const { engine } = await loadModules();
  for (const subjectId of SUBJECT_IDS) {
    const seenTemplates = new Set();
    for (let seed = 0; seed < 300; seed += 1) {
      const question = engine.generatePracticeQuestion(subjectId, `stress:${subjectId}:${seed}`);
      seenTemplates.add(question.templateId);
      const validation = engine.validateGeneratedPracticeQuestion(question);
      assert.equal(validation.ok, true, `${question.id}: ${validation.errors.join(" / ")}`);
      assert.doesNotMatch(JSON.stringify(question), /null/, `${question.id} must not serialize a nonfinite number to null`);
      if (question.evaluation.type === "numeric") {
        assert.ok(Number.isFinite(question.evaluation.numericAnswer));
      }
    }
    const expectedTemplateCount = engine.GENERATED_PRACTICE_TEMPLATE_METADATA.filter((template) => template.subjectId === subjectId).length;
    assert.equal(seenTemplates.size, expectedTemplateCount, `${subjectId} randomized template coverage`);
  }
});

test("English generation uses exact Ch.14, 15, 16, and 18 excerpts and never excluded sources", async () => {
  const { english, engine } = await loadModules();
  const seenChapters = new Set();
  const seenKinds = new Set();
  for (let seed = 0; seed < 600; seed += 1) {
    const question = engine.generatePracticeQuestion("subject-2", `english:${seed}`);
    seenChapters.add(question.source.chapter);
    seenKinds.add(question.templateId);
    assert.ok(ALLOWED_CHAPTERS.has(question.source.chapter));
    assert.doesNotMatch(JSON.stringify(question), /ch19|Chapter 19|What's new\?|What’s new\?/i);
    const passage = english.ENGLISH_PASSAGES.find((item) => item.id === question.source.passageId);
    const paragraph = passage?.paragraphs[question.source.paragraphIndex];
    assert.ok(passage, `${question.id} passage`);
    assert.ok(paragraph?.en.includes(question.source.excerpt), `${question.id} exact source excerpt`);
    if (question.templateId === "english-order") {
      assert.equal(question.evaluation.type, "ordered-tokens");
      assert.equal(question.evaluation.correctOrder.join(" "), question.source.excerpt);
      assert.equal(question.answer, question.source.excerpt);
      assert.ok(question.tokens.every((token) => token.trim() && !/\s/u.test(token.trim())), `${question.id} choices must be one word each`);
      assert.deepEqual(question.evaluation.correctOrder, question.source.excerpt.trim().split(/\s+/u));
      assert.ok(question.prompt.includes(paragraph.ja), `${question.id} must show the Japanese target meaning`);
      assert.ok(!question.prompt.includes(question.answer), `${question.id} must not reveal the English answer on the question face`);
    } else if (question.templateId === "english-translation") {
      assert.equal(question.evaluation.type, "japanese-semantic");
      assert.equal(question.answer, paragraph.ja);
      assert.ok(question.evaluation.keywordGroups.length >= 4);
      assert.ok(question.evaluation.minimumKeywordGroups >= 2);
    } else {
      assert.equal(question.templateId, "english-grammar");
      assert.equal(question.evaluation.type, "choice");
      assert.ok(question.source.excerpt.includes(question.parameters.target));
      assert.ok(question.options.includes(question.answer));
    }
  }
  assert.deepEqual(seenChapters, new Set(["ch14", "ch15", "ch16", "ch18"]));
  assert.deepEqual(seenKinds, new Set(["english-order", "english-translation", "english-grammar"]));
});

test("English, statistics, and applied-math generators use past-paper calibrated multi-stage work", async () => {
  const { engine } = await loadModules();
  for (const subjectId of ["subject-2", "subject-7", "subject-8"]) {
    const templates = engine.GENERATED_PRACTICE_TEMPLATE_METADATA.filter((item) => item.subjectId === subjectId);
    for (const template of templates) {
      for (let seed = 0; seed < 12; seed += 1) {
        const question = engine.generatePracticeQuestion(subjectId, `exam-level:${template.id}:${seed}`, { templateId: template.id });
        assert.equal(question.difficulty, 3, `${template.id} difficulty`);
        assert.ok(question.subpartCount >= 3, `${template.id} internal work count`);
        assert.ok(question.steps.length >= 3, `${template.id} worked stages`);
        assert.ok(question.sourceBasis.length >= 2, `${template.id} source basis`);
        assert.doesNotMatch(JSON.stringify(question), /グラフ|作図|ガウス(?:の)?発散定理|ストークス(?:の)?定理/i);
      }
    }
  }

  const ordering = engine.generatePracticeQuestion("subject-2", "masked-passage", { templateId: "english-order" });
  assert.match(ordering.context, /本文文脈/);
  assert.match(ordering.context, /この一文を並び替える/);
  assert.equal(ordering.context.includes(ordering.answer), false);
  assert.ok(ordering.tokens.every((token) => !/\s/u.test(token.trim())), "ordering chips stay word-by-word");

  const variance = engine.generatePracticeQuestion("subject-7", "exam-variance", { templateId: "statistics-symmetric-variance" });
  assert.match(variance.formula, /\\sum/);
  assert.ok(variance.expandedFormula);
  assert.doesNotMatch(variance.expandedFormula, /\\sum/);
  assert.match(variance.prompt, /V\(Y\)/);

  const direction = engine.generatePracticeQuestion("subject-8", "exam-direction", { templateId: "applied-directional-derivative" });
  assert.match(direction.prompt, /単位ベクトルではない/);
  assert.ok(direction.sourceReferenceIds.includes("am-gradient"));
  assert.ok(direction.sourceReferenceIds.includes("am-directional"));
});
test("statistics and applied-math generators keep numeric work exact and sign-safe across 100 seeds", async () => {
  const { engine } = await loadModules();
  const templates = engine.GENERATED_PRACTICE_TEMPLATE_METADATA.filter((template) =>
    ["subject-7", "subject-8"].includes(template.subjectId),
  );
  assert.equal(templates.length, 11);

  for (const template of templates) {
    for (let seed = 0; seed < 100; seed += 1) {
      const question = engine.generatePracticeQuestion(
        template.subjectId,
        `math-consistency:${template.id}:${seed}`,
        { templateId: template.id },
      );
      const p = question.parameters;
      let expected;
      switch (template.id) {
        case "statistics-symmetric-variance": expected = p.scale ** 2 * 2 * p.spread ** 2; break;
        case "statistics-z-score": expected = p.zA - p.zB; break;
        case "statistics-bayes": expected = p.routeC / (p.routeA + p.routeB + p.routeC); break;
        case "statistics-combination": expected = p.twoFromB + p.threeFromB + p.fourFromB; break;
        case "statistics-chebyshev": expected = (1 - 1 / p.k ** 2) * 100; break;
        case "applied-vector-norm": expected = Math.hypot(p.cx, p.cy, p.cz); break;
        case "applied-orthogonal-unknown": expected = Math.hypot(p.a, -(p.a * p.p + p.c * p.q) / p.b, p.c); break;
        case "applied-directional-derivative": expected = (p.gx * p.ux + p.gy * p.uy + p.gz * p.uz) / Math.hypot(p.ux, p.uy, p.uz); break;
        case "applied-divergence-point": expected = p.scale * (2 * p.a * p.x + 2 * p.b * p.y + 2 * p.c * p.z); break;
        case "applied-triangle-area": expected = Math.sqrt(p.normSquared) / 2; break;
        case "applied-green-rectangle": expected = p.d * p.a ** 2 * p.b + p.c * p.a * p.b ** 2; break;
        default: throw new Error(`Unhandled template ${template.id}`);
      }
      assert.ok(Math.abs(question.evaluation.numericAnswer - expected) <= 1e-10, `${template.id}:${seed}`);

      for (const [, value] of visibleStrings(question)) {
        for (const tex of inlineMathSegments(value)) {
          assert.doesNotMatch(tex, /\+\s*-/u, `${template.id}:${seed} contains ambiguous +−: ${tex}`);
          assert.doesNotMatch(
            tex,
            /(?<![({])-\d+(?:\.\d+)?\^2/u,
            `${template.id}:${seed} squares a negative literal without parentheses: ${tex}`,
          );
        }
      }
    }
  }
});
test("validator rejects every unsolved/domain-invalid failure mode", async () => {
  const { engine } = await loadModules();
  const base = engine.generatePracticeQuestion("subject-3", "validator", { templateId: "mechanical-log-decrement" });

  const missingAnswer = structuredClone(base);
  missingAnswer.answer = "";
  assert.match(engine.validateGeneratedPracticeQuestion(missingAnswer).errors.join(" / "), /answer/);

  const nonfiniteAnswer = structuredClone(base);
  nonfiniteAnswer.evaluation.numericAnswer = Number.POSITIVE_INFINITY;
  assert.match(engine.validateGeneratedPracticeQuestion(nonfiniteAnswer).errors.join(" / "), /非有限/);

  const wrongDisplayedAnswer = structuredClone(base);
  wrongDisplayedAnswer.answer = "999";
  wrongDisplayedAnswer.acceptedAnswers = ["999"];
  assert.match(engine.validateGeneratedPracticeQuestion(wrongDisplayedAnswer).errors.join(" / "), /表示解答が数値採点基準/);

  const zeroDenominator = structuredClone(base);
  zeroDenominator.safety.denominators.push(0);
  assert.match(engine.validateGeneratedPracticeQuestion(zeroDenominator).errors.join(" / "), /0除算/);

  const absentDenominatorSafety = structuredClone(base);
  absentDenominatorSafety.safety.denominators = [];
  assert.match(engine.validateGeneratedPracticeQuestion(absentDenominatorSafety).errors.join(" / "), /分母安全性/);

  const negativeRadicand = structuredClone(base);
  negativeRadicand.safety.radicands.push(-1);
  assert.match(engine.validateGeneratedPracticeQuestion(negativeRadicand).errors.join(" / "), /平方根/);

  const invalidLog = structuredClone(base);
  invalidLog.safety.logArguments.push(0);
  assert.match(engine.validateGeneratedPracticeQuestion(invalidLog).errors.join(" / "), /対数/);

  const absentLogSafety = structuredClone(base);
  absentLogSafety.safety.logArguments = [];
  assert.match(engine.validateGeneratedPracticeQuestion(absentLogSafety).errors.join(" / "), /対数式.*定義域安全性/);

  const malformedSafety = structuredClone(base);
  malformedSafety.safety.finiteValues = undefined;
  assert.doesNotThrow(() => engine.validateGeneratedPracticeQuestion(malformedSafety));
  assert.match(engine.validateGeneratedPracticeQuestion(malformedSafety).errors.join(" / "), /安全性メタデータ/);

  const nonfiniteParameter = structuredClone(base);
  nonfiniteParameter.parameters.bad = Number.NaN;
  assert.match(engine.validateGeneratedPracticeQuestion(nonfiniteParameter).errors.join(" / "), /パラメータ/);

  const malformedEvaluation = structuredClone(base);
  malformedEvaluation.evaluation = { type: "unknown" };
  assert.match(engine.validateGeneratedPracticeQuestion(malformedEvaluation).errors.join(" / "), /採点方式/);

  const malformedTolerance = structuredClone(base);
  malformedTolerance.evaluation.tolerance = "wide";
  assert.match(engine.validateGeneratedPracticeQuestion(malformedTolerance).errors.join(" / "), /許容誤差/);

  const unitQuestion = engine.generatePracticeQuestion("subject-3", "unit-table", { templateId: "mechanical-natural-frequency" });
  unitQuestion.evaluation.acceptedUnitScales = { "rad/s": 0 };
  assert.match(engine.validateGeneratedPracticeQuestion(unitQuestion).errors.join(" / "), /単位換算表/);

  const wrongChoice = engine.generatePracticeQuestion("subject-2", "wrong-choice", { templateId: "english-grammar" });
  wrongChoice.answer = wrongChoice.options.find((option) => option !== wrongChoice.evaluation.canonical);
  wrongChoice.acceptedAnswers = [wrongChoice.answer];
  assert.match(engine.validateGeneratedPracticeQuestion(wrongChoice).errors.join(" / "), /表示解答が文字列採点基準/);

  const controlCharacter = structuredClone(base);
  controlCharacter.explanation += "\u000c";
  assert.match(engine.validateGeneratedPracticeQuestion(controlCharacter).errors.join(" / "), /制御文字/);

  const wrongChapter = engine.generatePracticeQuestion("subject-2", "chapter", { templateId: "english-translation" });
  wrongChapter.source.chapter = "ch19";
  assert.match(engine.validateGeneratedPracticeQuestion(wrongChapter).errors.join(" / "), /範囲外|Chapter 19/);
});

test("built-in grader handles units, order, choices, and nuance-based Japanese", async () => {
  const { engine } = await loadModules();
  const numeric = engine.generatePracticeQuestion("subject-3", "grade-number", { templateId: "mechanical-natural-frequency" });
  assert.equal(engine.gradeGeneratedPracticeAnswer(numeric, numeric.answer).correct, true);
  assert.equal(engine.gradeGeneratedPracticeAnswer(numeric, String(numeric.evaluation.numericAnswer)).correct, false, "required unit");
  assert.equal(engine.gradeGeneratedPracticeAnswer(numeric, "999 rad/s").correct, false);

  const optionalUnit = engine.generatePracticeQuestion("subject-4", "grade-optional-unit", { templateId: "thermo-ideal-gas" });
  const optionalValue = String(optionalUnit.evaluation.numericAnswer);
  assert.equal(engine.gradeGeneratedPracticeAnswer(optionalUnit, optionalValue).correct, true, "optional unit may be omitted");
  assert.equal(engine.gradeGeneratedPracticeAnswer(optionalUnit, `${optionalValue} kPa`).correct, true, "recognized optional unit");
  assert.equal(engine.gradeGeneratedPracticeAnswer(optionalUnit, `${optionalValue} bananas`).correct, false, "arbitrary optional unit must fail");

  const unitless = engine.generatePracticeQuestion("subject-7", "grade-unitless", { templateId: "statistics-z-score" });
  assert.equal(engine.gradeGeneratedPracticeAnswer(unitless, `${unitless.evaluation.numericAnswer} kg`).correct, false, "unitless answer rejects invented unit");

  const order = engine.generatePracticeQuestion("subject-2", "grade-order", { templateId: "english-order" });
  assert.equal(engine.gradeGeneratedPracticeAnswer(order, order.answer).correct, true);
  assert.equal(engine.gradeGeneratedPracticeAnswer(order, "wrong order").correct, false);

  const grammar = engine.generatePracticeQuestion("subject-2", "grade-grammar", { templateId: "english-grammar" });
  assert.equal(engine.gradeGeneratedPracticeAnswer(grammar, grammar.answer).correct, true);

  const translation = engine.generatePracticeQuestion("subject-2", "grade-translation", { templateId: "english-translation" });
  const semanticAnswer = translation.evaluation.keywordGroups
    .slice(0, translation.evaluation.minimumKeywordGroups)
    .map((group) => group[0])
    .join("、");
  assert.equal(engine.gradeGeneratedPracticeAnswer(translation, semanticAnswer).correct, true, "matching nuance should pass");
  const negated = engine.gradeGeneratedPracticeAnswer(translation, `${semanticAnswer}、しかし本文の内容は実行していない`);
  assert.equal(negated.correct, false, "keywords plus explicit negation must not pass");
  assert.equal(negated.manualReview, true);
  assert.equal(engine.gradeGeneratedPracticeAnswer(translation, translation.answer).correct, true, "canonical translation remains correct");
  assert.equal(engine.gradeGeneratedPracticeAnswer(translation, "関係のない内容").correct, false);

  const increaseTranslation = Array.from({ length: 100 }, (_, seed) =>
    engine.generatePracticeQuestion("subject-2", `increase:${seed}`, { templateId: "english-translation" }),
  ).find((question) => question.answer.includes("増加"));
  assert.ok(increaseTranslation, "fixture with increase meaning");
  const oppositeKeywords = increaseTranslation.evaluation.keywordGroups
    .slice(0, increaseTranslation.evaluation.minimumKeywordGroups)
    .map((group) => group[0])
    .join("、");
  const opposite = engine.gradeGeneratedPracticeAnswer(increaseTranslation, `${oppositeKeywords}、自然災害は減少した`);
  assert.equal(opposite.correct, false, "opposite meaning must not pass by keyword count");
  assert.equal(opposite.manualReview, true);
});
