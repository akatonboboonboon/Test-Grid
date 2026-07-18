import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const DATA_FILES = [
  "mechanical-dynamics-data.ts",
  "thermodynamics-data.ts",
  "material-mechanics-data.ts",
  "applied-math-data.ts",
  "digital-circuits-data.ts",
];

const MATH_SURFACES = [
  "card-search.tsx",
  "comprehensive-challenge.tsx",
  "generated-practice-client.tsx",
  "rapid-answer-drill.tsx",
  "statistics-expected-exams.tsx",
  "smart-control-exams.tsx",
  "mechanical-dynamics-expected-exams.tsx",
  "thermodynamics-expected-exams.tsx",
  "material-mechanics-expected-exams.tsx",
  "applied-math-expected-exams.tsx",
  "digital-circuits-expected-exams.tsx",
  "math-foundations-client.tsx",
  ...[3, 4, 5, 6, 7, 8, 9].map((id) => `subjects/subject-${id}/page.tsx`),
  "subjects/subject-9/rapid/page.tsx",
];

const RICH_FIELDS = ["prompt", "context", "answer", "explanation", "cue", "example", "definition", "answerSuffix", "promptSuffix"];
const TEX_COMMAND = /\\(?:begin|frac|quad|qquad|sum|sqrt|left|right|nabla|int|oint|iint|mathrm|mathbf|bar|overline|hat|Delta|sigma|mu|eta|omega|alpha|beta|gamma|kappa|lambda|varepsilon|text|log|ln|cos|sin|tan|cdot|times|pm|le|ge|approx|partial|infty|pi|mathbb|operatorname)\b/u;
const RAW_DELIMITER = /\\\(|\\\)|\\\[|\\\]|\$\$/u;

function compile(source, jsx = false) {
  return ts.transpileModule(source, {
    compilerOptions: {
      jsx: jsx ? ts.JsxEmit.ReactJSX : undefined,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
}
const dataUrl = (javascript) => `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;

async function loadData(filename) {
  return import(dataUrl(compile(await readFile(new URL(`../app/${filename}`, import.meta.url), "utf8"))));
}

async function loadMathRenderer() {
  const source = await readFile(new URL("../app/statistics-math.tsx", import.meta.url), "utf8");
  const runtime = [
    "export const Fragment = Symbol.for('all-math-test-fragment');",
    "export function jsx(type, props, key) { return { type, key: key ?? null, props: props ?? {} }; }",
    "export const jsxs = jsx;",
  ].join("\n");
  const katexUrl = new URL("../app/vendor/katex/katex.mjs", import.meta.url).href;
  const javascript = compile(source, true)
    .replaceAll('"react/jsx-runtime"', JSON.stringify(dataUrl(runtime)))
    .replaceAll('"./vendor/katex/katex.mjs"', JSON.stringify(katexUrl));
  return import(dataUrl(javascript));
}

function directText(node) {
  if (node == null || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap(directText);
  if (typeof node === "string" || typeof node === "number") return [String(node)];
  if (typeof node === "object" && typeof node.type === "string") return directText(node.props?.children);
  return [];
}

function collect(value, path, output, seen) {
  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((item, index) => collect(item, `${path}[${index}]`, output, seen));
    return;
  }
  for (const field of RICH_FIELDS) {
    if (typeof value[field] === "string") output.push({ label: `${path}.${field}`, text: value[field] });
  }
  for (const field of ["steps", "options"]) {
    if (Array.isArray(value[field])) value[field].forEach((item, index) => {
      if (typeof item === "string") output.push({ label: `${path}.${field}[${index}]`, text: item });
    });
  }
  for (const [key, child] of Object.entries(value)) {
    if (!RICH_FIELDS.includes(key) && key !== "steps" && key !== "options") collect(child, `${path}.${key}`, output, seen);
  }
}

test("display delimiters and array environments never leak as source TeX", async () => {
  const math = await loadMathRenderer();
  const cases = [
    String.raw`次の8個のデータについて答えよ。\[12,\quad 16,\quad 18,\quad 20,\quad 22,\quad 24,\quad 26,\quad 30\] 分散は母分散とする。`,
    String.raw`確率変数 \(X\) の分布は次のとおりである。\[\begin{array}{c|cccc}x&0&1&2&3\\\hline P(X=x)&0.5&0.25&0.125&k\end{array}\] 対数は底2とする。`,
    String.raw`次の対応表を用い、分散・共分散は \(n\) で割る。\[\begin{array}{c|ccccc}i&1&2&3&4&5\\\hline X_i&1&2&3&4&5\\Y_i&9&15&18&21&22\end{array}\]`,
    String.raw`\[\frac{1}{2}\]`,
    String.raw`$$\sum_{i=1}^{n}x_i$$`,
  ];
  for (const source of cases) {
    const rendered = math.RichMathText({ text: source });
    assert.match(rendered.props.className, /has-display-math/, source);
    assert.equal(directText(rendered).some((text) => RAW_DELIMITER.test(text)), false, source);
    const children = Array.isArray(rendered.props.children) ? rendered.props.children : [rendered.props.children];
    const displaySegment = children.find((child) => child?.type?.name === "ResponsiveMathSegment");
    assert.ok(displaySegment, source);
    assert.doesNotMatch(displaySegment.props.tex, RAW_DELIMITER, source);
    const typesetSegment = displaySegment.type(displaySegment.props);
    const html = typesetSegment.props.children.props.dangerouslySetInnerHTML.__html;
    assert.match(html, /katex-display/, source);
    assert.doesNotMatch(html, RAW_DELIMITER, source);
    assert.doesNotMatch(html, /katex-error/, source);
  }
});

test("all engineering rich-text fields consume delimiters and TeX commands", async () => {
  const [math, katex, ...modules] = await Promise.all([loadMathRenderer(), import(new URL("../app/vendor/katex/katex.mjs", import.meta.url)), ...DATA_FILES.map(loadData)]);
  const fields = [];
  const seen = new WeakSet();
  modules.forEach((module, index) => Object.entries(module).forEach(([name, value]) => {
    if (Array.isArray(value)) collect(value, `${DATA_FILES[index]}.${name}`, fields, seen);
  }));

  assert.ok(fields.length >= 1200, `broad corpus audit only found ${fields.length} fields`);
  for (const { label, text } of fields) {
    assert.equal((text.match(/\\\(/g) ?? []).length, (text.match(/\\\)/g) ?? []).length, `${label}: unbalanced inline math`);
    assert.equal((text.match(/\\\[/g) ?? []).length, (text.match(/\\\]/g) ?? []).length, `${label}: unbalanced display math`);
    const leaked = directText(math.RichMathText({ text })).join("");
    assert.doesNotMatch(leaked, RAW_DELIMITER, `${label}: leaked delimiter`);
    if (TEX_COMMAND.test(text)) assert.doesNotMatch(leaked, TEX_COMMAND, `${label}: leaked TeX command`);
    const segments = [...text.matchAll(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/gu)]
      .map((match) => match[1] ?? match[2] ?? match[3] ?? "")
      .filter(Boolean);
    if (segments.length === 0 && TEX_COMMAND.test(text) && math.isStandaloneTex(text)) {
      segments.push(text.trim());
    }
    for (const tex of segments) {
      assert.doesNotThrow(() => katex.renderToString(tex, {
        displayMode: true,
        output: "htmlAndMathml",
        strict: "error",
        throwOnError: true,
        trust: false,
      }), `${label}: invalid TeX segment ${tex}`);
    }
  }
});

test("all twelve statistics papers render every generated field and formula without source TeX leakage", async () => {
  const [math, katex, statistics] = await Promise.all([
    loadMathRenderer(),
    import(new URL("../app/vendor/katex/katex.mjs", import.meta.url)),
    loadData("statistics-expected-exams-data.ts"),
  ]);
  const papers = [...statistics.EXPECTED_PAPERS_BY_ID.values()];
  assert.equal(papers.length, 12);
  assert.equal(papers.every((paper) => paper.questions.length === 32), true);

  const richFields = [];
  const formulas = [];
  for (const paper of papers) {
    for (const section of paper.sections) {
      richFields.push({ label: `${paper.definition.id}.section-${section.number}.context`, text: section.context });
    }
    for (const question of paper.questions) {
      for (const field of ["prompt", "context", "answer", "explanation"]) {
        if (typeof question[field] === "string") {
          richFields.push({ label: `${question.id}.${field}`, text: question[field] });
        }
      }
      for (const field of ["steps", "options"]) {
        for (const [index, text] of (question[field] ?? []).entries()) {
          if (typeof text === "string") richFields.push({ label: `${question.id}.${field}[${index}]`, text });
        }
      }
      for (const field of ["formula", "expandedFormula"]) {
        if (typeof question[field] === "string") formulas.push({ label: `${question.id}.${field}`, tex: question[field] });
      }
    }
  }

  assert.ok(richFields.length >= 1_500, `statistics audit only found ${richFields.length} rendered fields`);
  assert.ok(formulas.length >= 500, `statistics audit only found ${formulas.length} formulas`);
  for (const { label, text } of richFields) {
    assert.equal((text.match(/\\\(/g) ?? []).length, (text.match(/\\\)/g) ?? []).length, `${label}: unbalanced inline math`);
    assert.equal((text.match(/\\\[/g) ?? []).length, (text.match(/\\\]/g) ?? []).length, `${label}: unbalanced display math`);
    const rendered = math.RichMathText({ text });
    const leaked = directText(rendered).join("");
    assert.doesNotMatch(leaked, RAW_DELIMITER, `${label}: leaked delimiter`);
    if (TEX_COMMAND.test(text)) assert.doesNotMatch(leaked, TEX_COMMAND, `${label}: leaked TeX command`);
    const children = Array.isArray(rendered.props.children) ? rendered.props.children : [rendered.props.children];
    for (const child of children.filter((candidate) => candidate?.type?.name === "ResponsiveMathSegment")) {
      assert.doesNotMatch(child.props.tex, RAW_DELIMITER, `${label}: wrapper reached KaTeX`);
      const typeset = child.type(child.props);
      const html = typeset.props.children.props.dangerouslySetInnerHTML.__html;
      assert.doesNotMatch(html, /katex-error/, `${label}: KaTeX error`);
    }
  }
  for (const { label, tex } of formulas) {
    assert.doesNotMatch(tex, RAW_DELIMITER, `${label}: DisplayMath must receive unwrapped TeX`);
    assert.doesNotThrow(() => katex.renderToString(tex, {
      displayMode: true,
      output: "htmlAndMathml",
      strict: "error",
      throwOnError: true,
      trust: false,
    }), `${label}: invalid formula ${tex}`);
  }
});
test("math-capable TSX surfaces do not print formula-bearing fields directly", async () => {
  const violations = [];
  const suspect = new Set(["prompt", "context", "answer", "explanation", "formula", "cue", "example", "definition", "answerSuffix", "promptSuffix"]);
  for (const filename of MATH_SURFACES) {
    const source = await readFile(new URL(`../app/${filename}`, import.meta.url), "utf8");
    const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (node) => {
      if (ts.isJsxExpression(node) && !ts.isJsxAttribute(node.parent) && node.expression) {
        const expression = node.expression;
        const simple = ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression)
          || (ts.isConditionalExpression(expression) && !/[<>]/u.test(expression.getText(file)));
        const text = expression.getText(file);
        const directField = (value) => {
          if (ts.isPropertyAccessExpression(value)) return suspect.has(value.name.text);
          if (ts.isElementAccessExpression(value) && ts.isStringLiteral(value.argumentExpression)) {
            return suspect.has(value.argumentExpression.text);
          }
          return ts.isConditionalExpression(value) && (directField(value.whenTrue) || directField(value.whenFalse));
        };
        if (simple && directField(expression)) {
          const position = file.getLineAndCharacterOfPosition(node.getStart(file));
          violations.push(`${filename}:${position.line + 1}: ${text}`);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
  }
  assert.deepEqual(violations, [], `use RichMathText/DisplayMath:\n${violations.join("\n")}`);
});
