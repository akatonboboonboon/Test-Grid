"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import styles from "./applied-math-graph-lab.module.css";

type Scope = Record<string, number>;
type Evaluator = (scope: Scope) => number;

type Token =
  | { kind: "number"; value: number; position: number }
  | { kind: "name"; value: string; position: number }
  | { kind: "operator"; value: "+" | "-" | "*" | "/" | "^"; position: number }
  | { kind: "left"; position: number }
  | { kind: "right"; position: number }
  | { kind: "eof"; position: number };

type ExpressionNode =
  | { kind: "number"; value: number }
  | { kind: "variable"; name: string }
  | { kind: "unary"; operator: "+" | "-"; child: ExpressionNode }
  | {
      kind: "binary";
      operator: "+" | "-" | "*" | "/" | "^";
      left: ExpressionNode;
      right: ExpressionNode;
    }
  | { kind: "call"; name: MathFunctionName; argument: ExpressionNode };

type MathFunctionName = keyof typeof MATH_FUNCTIONS;

const MATH_FUNCTIONS = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sqrt: Math.sqrt,
  abs: Math.abs,
  exp: Math.exp,
  log: Math.log,
} as const;

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

const MAX_EXPRESSION_LENGTH = 180;
const MAX_TOKEN_COUNT = 256;
const MAX_COORDINATE = 1_000_000;

function expressionError(message: string, position?: number) {
  const location = position === undefined ? "" : "（" + (position + 1) + "文字目）";
  return new Error(message + location);
}

function normalizeExpression(source: string) {
  return source
    .normalize("NFKC")
    .toLowerCase()
    .replace(/π/g, "pi")
    .replace(/[−–—]/g, "-")
    .replace(/[×・]/g, "*")
    .replace(/\s+/g, "");
}

function tokenizeExpression(source: string): Token[] {
  const normalized = normalizeExpression(source);
  if (!normalized) throw expressionError("式を入力してください。");
  if (normalized.length > MAX_EXPRESSION_LENGTH) {
    throw expressionError("式は" + MAX_EXPRESSION_LENGTH + "文字以内にしてください。");
  }

  const raw: Token[] = [];
  let index = 0;
  while (index < normalized.length) {
    const slice = normalized.slice(index);
    const numberMatch = slice.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/);
    if (numberMatch) {
      const value = Number(numberMatch[0]);
      if (!Number.isFinite(value)) throw expressionError("数値が大きすぎます。", index);
      raw.push({ kind: "number", value, position: index });
      index += numberMatch[0].length;
      continue;
    }

    const nameMatch = slice.match(/^[a-z]+/);
    if (nameMatch) {
      raw.push({ kind: "name", value: nameMatch[0], position: index });
      index += nameMatch[0].length;
      continue;
    }

    const character = normalized[index];
    if (character === "+" || character === "-" || character === "*" || character === "/" || character === "^") {
      raw.push({ kind: "operator", value: character, position: index });
      index += 1;
      continue;
    }
    if (character === "(") {
      raw.push({ kind: "left", position: index });
      index += 1;
      continue;
    }
    if (character === ")") {
      raw.push({ kind: "right", position: index });
      index += 1;
      continue;
    }
    throw expressionError("使用できない記号「" + character + "」があります。", index);
  }

  if (raw.length > MAX_TOKEN_COUNT) {
    throw expressionError("式が複雑すぎます。項を少なくしてください。");
  }

  const tokens: Token[] = [];
  for (const current of raw) {
    const previous = tokens.at(-1);
    const previousEndsValue = previous
      && (previous.kind === "number" || previous.kind === "name" || previous.kind === "right");
    const currentStartsValue = current.kind === "number" || current.kind === "name" || current.kind === "left";
    const isFunctionCall = previous?.kind === "name"
      && previous.value in MATH_FUNCTIONS
      && current.kind === "left";
    if (previousEndsValue && currentStartsValue && !isFunctionCall) {
      tokens.push({ kind: "operator", value: "*", position: current.position });
    }
    tokens.push(current);
  }
  tokens.push({ kind: "eof", position: normalized.length });
  return tokens;
}

class SafeExpressionParser {
  private cursor = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly variables: ReadonlySet<string>,
  ) {}

  parse() {
    const expression = this.parseAddition();
    const token = this.peek();
    if (token.kind !== "eof") {
      throw expressionError("式の終わり方を確認してください。", token.position);
    }
    return expression;
  }

  private peek() {
    return this.tokens[this.cursor];
  }

  private take() {
    const token = this.tokens[this.cursor];
    this.cursor += 1;
    return token;
  }

  private parseAddition(): ExpressionNode {
    let left = this.parseMultiplication();
    while (true) {
      const token = this.peek();
      if (token.kind !== "operator" || (token.value !== "+" && token.value !== "-")) break;
      this.take();
      left = {
        kind: "binary",
        operator: token.value,
        left,
        right: this.parseMultiplication(),
      };
    }
    return left;
  }

  private parseMultiplication(): ExpressionNode {
    let left = this.parseUnary();
    while (true) {
      const token = this.peek();
      if (token.kind !== "operator" || (token.value !== "*" && token.value !== "/")) break;
      this.take();
      left = {
        kind: "binary",
        operator: token.value,
        left,
        right: this.parseUnary(),
      };
    }
    return left;
  }

  private parseUnary(): ExpressionNode {
    const token = this.peek();
    if (token.kind === "operator" && (token.value === "+" || token.value === "-")) {
      this.take();
      return { kind: "unary", operator: token.value, child: this.parseUnary() };
    }
    return this.parsePower();
  }

  private parsePower(): ExpressionNode {
    const left = this.parsePrimary();
    const token = this.peek();
    if (token.kind === "operator" && token.value === "^") {
      this.take();
      return {
        kind: "binary",
        operator: "^",
        left,
        right: this.parseUnary(),
      };
    }
    return left;
  }

  private parsePrimary(): ExpressionNode {
    const token = this.take();
    if (token.kind === "number") return { kind: "number", value: token.value };

    if (token.kind === "name") {
      if (token.value in CONSTANTS) {
        return { kind: "number", value: CONSTANTS[token.value] };
      }
      if (this.variables.has(token.value)) {
        return { kind: "variable", name: token.value };
      }
      if (token.value in MATH_FUNCTIONS) {
        const left = this.take();
        if (left.kind !== "left") {
          throw expressionError(token.value + " の後ろに括弧が必要です。", token.position);
        }
        const argument = this.parseAddition();
        const right = this.take();
        if (right.kind !== "right") {
          throw expressionError("閉じ括弧が足りません。", right.position);
        }
        return { kind: "call", name: token.value as MathFunctionName, argument };
      }
      throw expressionError(
        "「" + token.value + "」は使えません。変数同士は x*y のように * でつないでください。",
        token.position,
      );
    }

    if (token.kind === "left") {
      const expression = this.parseAddition();
      const right = this.take();
      if (right.kind !== "right") {
        throw expressionError("閉じ括弧が足りません。", right.position);
      }
      return expression;
    }

    throw expressionError("数値・変数・括弧のいずれかが必要です。", token.position);
  }
}

function evaluateExpression(node: ExpressionNode, scope: Scope): number {
  if (node.kind === "number") return node.value;
  if (node.kind === "variable") return scope[node.name];
  if (node.kind === "unary") {
    const value = evaluateExpression(node.child, scope);
    return node.operator === "-" ? -value : value;
  }
  if (node.kind === "call") {
    return MATH_FUNCTIONS[node.name](evaluateExpression(node.argument, scope));
  }

  const left = evaluateExpression(node.left, scope);
  const right = evaluateExpression(node.right, scope);
  if (node.operator === "+") return left + right;
  if (node.operator === "-") return left - right;
  if (node.operator === "*") return left * right;
  if (node.operator === "/") return left / right;
  return Math.pow(left, right);
}

export function compileAppliedMathExpression(
  source: string,
  allowedVariables: readonly string[],
): Evaluator {
  const variables = new Set(allowedVariables);
  const tree = new SafeExpressionParser(tokenizeExpression(source), variables).parse();
  return (scope: Scope) => evaluateExpression(tree, scope);
}

type Point2 = { x: number; y: number };
type Point3 = { x: number; y: number; z: number };

type GraphSpec =
  | {
      kind: "function-2d";
      title: string;
      description: string;
      hue: number;
      xMin: number;
      xMax: number;
      samples: number;
      y: (x: number) => number;
    }
  | {
      kind: "vector-2d";
      title: string;
      description: string;
      hue: number;
      xMin: number;
      xMax: number;
      yMin: number;
      yMax: number;
      grid: number;
      vector: (x: number, y: number) => Point2;
    }
  | {
      kind: "curve-3d";
      title: string;
      description: string;
      hue: number;
      tMin: number;
      tMax: number;
      samples: number;
      point: (t: number) => Point3;
    }
  | {
      kind: "surface-3d";
      title: string;
      description: string;
      hue: number;
      uMin: number;
      uMax: number;
      vMin: number;
      vMax: number;
      uSteps: number;
      vSteps: number;
      point: (u: number, v: number) => Point3;
    };

type NumericField = {
  key: string;
  label: string;
  hint: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
};

type Preset = {
  id: string;
  title: string;
  category: string;
  formula: string;
  description: string;
  note?: string;
  warning?: string;
  fields: NumericField[];
  build: (values: Record<string, number>) => GraphSpec;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function finiteCoordinate(value: number) {
  return Number.isFinite(value) && Math.abs(value) <= MAX_COORDINATE;
}

function finitePoint2(point: Point2 | null | undefined): point is Point2 {
  return Boolean(point && finiteCoordinate(point.x) && finiteCoordinate(point.y));
}

function finitePoint3(point: Point3 | null | undefined): point is Point3 {
  return Boolean(
    point
    && finiteCoordinate(point.x)
    && finiteCoordinate(point.y)
    && finiteCoordinate(point.z),
  );
}

function orderedRange(first: number, second: number, minimumSpan = 0.01) {
  if (first <= second - minimumSpan) return [first, second] as const;
  if (second <= first - minimumSpan) return [second, first] as const;
  return [first, first + minimumSpan] as const;
}

const PRESETS: Preset[] = [
  {
    id: "circle",
    title: "円と接線の入口",
    category: "PARAMETRIC CURVE",
    formula: "r(t) = (a cos t, a sin t, z₀)",
    description: "半径と高さを変え、円が3次元空間のどこに置かれるか眺めます。",
    fields: [
      { key: "a", label: "半径 a", hint: "0.1〜8", defaultValue: 2, min: 0.1, max: 8, step: 0.1 },
      { key: "z0", label: "高さ z₀", hint: "-8〜8", defaultValue: 0, min: -8, max: 8, step: 0.1 },
      { key: "turns", label: "周回数", hint: "0.25〜4", defaultValue: 1, min: 0.25, max: 4, step: 0.25 },
    ],
    build: ({ a, z0, turns }) => ({
      kind: "curve-3d",
      title: "円",
      description: "半径 " + a.toFixed(2) + "、高さ " + z0.toFixed(2) + " の円",
      hue: 188,
      tMin: 0,
      tMax: Math.PI * 2 * turns,
      samples: 320,
      point: (t) => ({ x: a * Math.cos(t), y: a * Math.sin(t), z: z0 }),
    }),
  },
  {
    id: "helix",
    title: "らせん",
    category: "PARAMETRIC CURVE",
    formula: "r(t) = (a cos t, a sin t, bt)",
    description: "半径aと上昇率bを変えると、ばねの太さと間隔が変わります。",
    fields: [
      { key: "a", label: "半径 a", hint: "0.1〜6", defaultValue: 1, min: 0.1, max: 6, step: 0.1 },
      { key: "b", label: "上昇率 b", hint: "-2〜2", defaultValue: 0.25, min: -2, max: 2, step: 0.05 },
      { key: "turns", label: "表示する巻き数", hint: "1〜12", defaultValue: 6, min: 1, max: 12, step: 1 },
    ],
    build: ({ a, b, turns }) => ({
      kind: "curve-3d",
      title: "らせん",
      description: "半径 " + a.toFixed(2) + "、上昇率 " + b.toFixed(2),
      hue: 142,
      tMin: -Math.PI * turns,
      tMax: Math.PI * turns,
      samples: 480,
      point: (t) => ({ x: a * Math.cos(t), y: a * Math.sin(t), z: b * t }),
    }),
  },
  {
    id: "plane",
    title: "パラメータ平面",
    category: "PARAMETRIC SURFACE",
    formula: "r(u,v) = (u, v, pu + qv)",
    description: "講義の r=(u,v,2u−3v) を係数p,qで自由に傾けます。",
    fields: [
      { key: "p", label: "x方向の傾き p", hint: "-6〜6", defaultValue: 2, min: -6, max: 6, step: 0.1 },
      { key: "q", label: "y方向の傾き q", hint: "-6〜6", defaultValue: -3, min: -6, max: 6, step: 0.1 },
      { key: "extent", label: "u,v の幅", hint: "0.5〜5", defaultValue: 1.5, min: 0.5, max: 5, step: 0.1 },
    ],
    build: ({ p, q, extent }) => ({
      kind: "surface-3d",
      title: "平面",
      description: "z = " + p.toFixed(2) + "x + " + q.toFixed(2) + "y",
      hue: 266,
      uMin: -extent,
      uMax: extent,
      vMin: -extent,
      vMax: extent,
      uSteps: 27,
      vSteps: 27,
      point: (u, v) => ({ x: u, y: v, z: p * u + q * v }),
    }),
  },
  {
    id: "paraboloid",
    title: "u² パラボロイド",
    category: "TEST-RANGE SURFACE",
    formula: "r(u,v) = (u cos v, u sin v, cu²)",
    description: "テスト対策と第11回演習に一致する、採点対策側の曲面です。",
    note: "試験対策で使うのはこちらの u² 版です。",
    fields: [
      { key: "radius", label: "半径 R", hint: "0.2〜4", defaultValue: 1, min: 0.2, max: 4, step: 0.1 },
      { key: "c", label: "開き c", hint: "-4〜4", defaultValue: 1, min: -4, max: 4, step: 0.1 },
    ],
    build: ({ radius, c }) => ({
      kind: "surface-3d",
      title: "u² パラボロイド",
      description: "0≤u≤" + radius.toFixed(2) + "、0≤v≤2π",
      hue: 204,
      uMin: 0,
      uMax: radius,
      vMin: 0,
      vMax: Math.PI * 2,
      uSteps: 32,
      vSteps: 38,
      point: (u, v) => ({
        x: u * Math.cos(v),
        y: u * Math.sin(v),
        z: c * u * u,
      }),
    }),
  },
  {
    id: "cylinder",
    title: "円柱",
    category: "PARAMETRIC SURFACE",
    formula: "r(u,v) = (R cos u, R sin u, cv²)",
    description: "uを0から2πまで回して、円柱の側面を一周つくります。",
    fields: [
      { key: "radius", label: "半径 R", hint: "0.2〜4", defaultValue: 1, min: 0.2, max: 4, step: 0.1 },
      { key: "height", label: "v の上限 H", hint: "0.2〜4", defaultValue: 2, min: 0.2, max: 4, step: 0.1 },
      { key: "c", label: "高さ係数 c", hint: "-3〜3", defaultValue: 1, min: -3, max: 3, step: 0.1 },
    ],
    build: ({ radius, height, c }) => ({
      kind: "surface-3d",
      title: "円柱",
      description: "uは一周、0≤v≤" + height.toFixed(2),
      hue: 196,
      uMin: 0,
      uMax: Math.PI * 2,
      vMin: 0,
      vMax: height,
      uSteps: 40,
      vSteps: 28,
      point: (u, v) => ({
        x: radius * Math.cos(u),
        y: radius * Math.sin(u),
        z: c * v * v,
      }),
    }),
  },
  {
    id: "half-cylinder",
    title: "半円柱",
    category: "TEST-RANGE SURFACE",
    formula: "r(u,v) = (R cos u, R sin u, cv²), 0≤u≤π",
    description: "第11回演習と同じく、uの範囲を半周にした曲面です。",
    fields: [
      { key: "radius", label: "半径 R", hint: "0.2〜4", defaultValue: 1, min: 0.2, max: 4, step: 0.1 },
      { key: "height", label: "v の上限 H", hint: "0.2〜4", defaultValue: 2, min: 0.2, max: 4, step: 0.1 },
      { key: "c", label: "高さ係数 c", hint: "-3〜3", defaultValue: 1, min: -3, max: 3, step: 0.1 },
    ],
    build: ({ radius, height, c }) => ({
      kind: "surface-3d",
      title: "半円柱",
      description: "0≤u≤π、0≤v≤" + height.toFixed(2),
      hue: 132,
      uMin: 0,
      uMax: Math.PI,
      vMin: 0,
      vMax: height,
      uSteps: 34,
      vSteps: 28,
      point: (u, v) => ({
        x: radius * Math.cos(u),
        y: radius * Math.sin(u),
        z: c * v * v,
      }),
    }),
  },
  {
    id: "handout-v-square",
    title: "v² 資料不一致版",
    category: "GRAPH-ONLY ODDITY",
    formula: "r(u,v) = (u cos v, u sin v, cv²)",
    description: "講義10演習にだけ現れる表記を、採点問題ではなく形の観察に限定して描きます。",
    warning: "資料間で不一致：講義10は v²、講義11演習・テスト対策は u²。これは成績対象外の観察専用です。",
    fields: [
      { key: "radius", label: "u の上限 R", hint: "0.2〜3", defaultValue: 1, min: 0.2, max: 3, step: 0.1 },
      { key: "c", label: "高さ係数 c", hint: "-2〜2", defaultValue: 0.08, min: -2, max: 2, step: 0.02 },
      { key: "vMax", label: "v の上限", hint: "0.5〜2π", defaultValue: Math.PI * 2, min: 0.5, max: Math.PI * 2, step: 0.1 },
    ],
    build: ({ radius, c, vMax }) => ({
      kind: "surface-3d",
      title: "v² 資料不一致版",
      description: "講義10資料の表記を形だけ観察",
      hue: 30,
      uMin: 0,
      uMax: radius,
      vMin: 0,
      vMax,
      uSteps: 30,
      vSteps: 42,
      point: (u, v) => ({
        x: u * Math.cos(v),
        y: u * Math.sin(v),
        z: c * v * v,
      }),
    }),
  },
  {
    id: "source-field",
    title: "湧き出し",
    category: "VECTOR FIELD",
    formula: "F(x,y) = (ax, by)",
    description: "原点から外へ向くベクトル場。発散が正の「湧き出し」を目で確認します。",
    fields: [
      { key: "a", label: "x係数 a", hint: "-3〜3", defaultValue: 1, min: -3, max: 3, step: 0.1 },
      { key: "b", label: "y係数 b", hint: "-3〜3", defaultValue: 1, min: -3, max: 3, step: 0.1 },
      { key: "extent", label: "表示幅", hint: "2〜10", defaultValue: 4, min: 2, max: 10, step: 0.5 },
    ],
    build: ({ a, b, extent }) => ({
      kind: "vector-2d",
      title: "湧き出し",
      description: "F=(" + a.toFixed(2) + "x, " + b.toFixed(2) + "y)",
      hue: 164,
      xMin: -extent,
      xMax: extent,
      yMin: -extent,
      yMax: extent,
      grid: 15,
      vector: (x, y) => ({ x: a * x, y: b * y }),
    }),
  },
  {
    id: "rotation-field",
    title: "回転",
    category: "VECTOR FIELD",
    formula: "F(x,y) = (−ωy, ωx)",
    description: "原点の周りを反時計回りに回る場。回転のz成分が現れる形です。",
    fields: [
      { key: "omega", label: "回転率 ω", hint: "-3〜3", defaultValue: 1, min: -3, max: 3, step: 0.1 },
      { key: "extent", label: "表示幅", hint: "2〜10", defaultValue: 4, min: 2, max: 10, step: 0.5 },
    ],
    build: ({ omega, extent }) => ({
      kind: "vector-2d",
      title: "回転",
      description: "F=(−" + omega.toFixed(2) + "y, " + omega.toFixed(2) + "x)",
      hue: 324,
      xMin: -extent,
      xMax: extent,
      yMin: -extent,
      yMax: extent,
      grid: 15,
      vector: (x, y) => ({ x: -omega * y, y: omega * x }),
    }),
  },
  {
    id: "shear-field",
    title: "せん断",
    category: "VECTOR FIELD",
    formula: "F(x,y) = (−ky, 0)",
    description: "高さyに応じて横向きの流れが反転する、講義12のせん断場です。",
    fields: [
      { key: "k", label: "せん断率 k", hint: "-3〜3", defaultValue: 1, min: -3, max: 3, step: 0.1 },
      { key: "extent", label: "表示幅", hint: "2〜10", defaultValue: 4, min: 2, max: 10, step: 0.5 },
    ],
    build: ({ k, extent }) => ({
      kind: "vector-2d",
      title: "せん断",
      description: "F=(−" + k.toFixed(2) + "y, 0)",
      hue: 42,
      xMin: -extent,
      xMax: extent,
      yMin: -extent,
      yMax: extent,
      grid: 15,
      vector: (_x, y) => ({ x: -k * y, y: 0 }),
    }),
  },
];

type FreeMode =
  | "function-2d"
  | "function-3d"
  | "curve-3d"
  | "surface-3d"
  | "vector-2d";

type FreeModeDefinition = {
  id: FreeMode;
  label: string;
  shortLabel: string;
  description: string;
  expressions: Array<{ key: string; label: string; placeholder: string }>;
  ranges: NumericField[];
};

const FREE_MODES: FreeModeDefinition[] = [
  {
    id: "function-2d",
    label: "2D関数 y=f(x)",
    shortLabel: "2D関数",
    description: "xだけを使う式を平面上に描きます。",
    expressions: [{ key: "y", label: "y =", placeholder: "sin(x)" }],
    ranges: [
      { key: "xMin", label: "x 最小", hint: "-100〜100", defaultValue: -Math.PI * 2, min: -100, max: 100, step: 0.1 },
      { key: "xMax", label: "x 最大", hint: "-100〜100", defaultValue: Math.PI * 2, min: -100, max: 100, step: 0.1 },
      { key: "samples", label: "サンプル数", hint: "80〜600", defaultValue: 420, min: 80, max: 600, step: 20 },
    ],
  },
  {
    id: "function-3d",
    label: "3D関数 z=f(x,y)",
    shortLabel: "3D関数",
    description: "x,yを使う高さ関数をワイヤー曲面として描きます。",
    expressions: [{ key: "z", label: "z =", placeholder: "sin(x)*cos(y)" }],
    ranges: [
      { key: "xMin", label: "x 最小", hint: "-30〜30", defaultValue: -Math.PI, min: -30, max: 30, step: 0.1 },
      { key: "xMax", label: "x 最大", hint: "-30〜30", defaultValue: Math.PI, min: -30, max: 30, step: 0.1 },
      { key: "yMin", label: "y 最小", hint: "-30〜30", defaultValue: -Math.PI, min: -30, max: 30, step: 0.1 },
      { key: "yMax", label: "y 最大", hint: "-30〜30", defaultValue: Math.PI, min: -30, max: 30, step: 0.1 },
      { key: "resolution", label: "分割数", hint: "12〜46", defaultValue: 34, min: 12, max: 46, step: 2 },
    ],
  },
  {
    id: "curve-3d",
    label: "パラメータ曲線 r(t)",
    shortLabel: "曲線 r(t)",
    description: "x(t), y(t), z(t)を別々に入力します。",
    expressions: [
      { key: "x", label: "x(t) =", placeholder: "cos(t)" },
      { key: "y", label: "y(t) =", placeholder: "sin(t)" },
      { key: "z", label: "z(t) =", placeholder: "t/4" },
    ],
    ranges: [
      { key: "tMin", label: "t 最小", hint: "-100〜100", defaultValue: -Math.PI * 4, min: -100, max: 100, step: 0.1 },
      { key: "tMax", label: "t 最大", hint: "-100〜100", defaultValue: Math.PI * 4, min: -100, max: 100, step: 0.1 },
      { key: "samples", label: "サンプル数", hint: "80〜600", defaultValue: 360, min: 80, max: 600, step: 20 },
    ],
  },
  {
    id: "surface-3d",
    label: "パラメータ曲面 r(u,v)",
    shortLabel: "曲面 r(u,v)",
    description: "x(u,v), y(u,v), z(u,v)と2つの範囲を入力します。",
    expressions: [
      { key: "x", label: "x(u,v) =", placeholder: "u*cos(v)" },
      { key: "y", label: "y(u,v) =", placeholder: "u*sin(v)" },
      { key: "z", label: "z(u,v) =", placeholder: "u^2" },
    ],
    ranges: [
      { key: "uMin", label: "u 最小", hint: "-30〜30", defaultValue: 0, min: -30, max: 30, step: 0.1 },
      { key: "uMax", label: "u 最大", hint: "-30〜30", defaultValue: 1, min: -30, max: 30, step: 0.1 },
      { key: "vMin", label: "v 最小", hint: "-30〜30", defaultValue: 0, min: -30, max: 30, step: 0.1 },
      { key: "vMax", label: "v 最大", hint: "-30〜30", defaultValue: Math.PI * 2, min: -30, max: 30, step: 0.1 },
      { key: "resolution", label: "分割数", hint: "12〜46", defaultValue: 34, min: 12, max: 46, step: 2 },
    ],
  },
  {
    id: "vector-2d",
    label: "2Dベクトル場 (P,Q)",
    shortLabel: "ベクトル場",
    description: "P(x,y), Q(x,y)を矢印で描きます。",
    expressions: [
      { key: "p", label: "P(x,y) =", placeholder: "-y" },
      { key: "q", label: "Q(x,y) =", placeholder: "x" },
    ],
    ranges: [
      { key: "xMin", label: "x 最小", hint: "-30〜30", defaultValue: -4, min: -30, max: 30, step: 0.5 },
      { key: "xMax", label: "x 最大", hint: "-30〜30", defaultValue: 4, min: -30, max: 30, step: 0.5 },
      { key: "yMin", label: "y 最小", hint: "-30〜30", defaultValue: -4, min: -30, max: 30, step: 0.5 },
      { key: "yMax", label: "y 最大", hint: "-30〜30", defaultValue: 4, min: -30, max: 30, step: 0.5 },
      { key: "grid", label: "矢印の密度", hint: "5〜25", defaultValue: 15, min: 5, max: 25, step: 2 },
    ],
  },
];

function createFreeDefaults() {
  const defaults: Record<FreeMode, Record<string, string>> = {
    "function-2d": { y: "sin(x)" },
    "function-3d": { z: "sin(x)*cos(y)" },
    "curve-3d": { x: "cos(t)", y: "sin(t)", z: "t/4" },
    "surface-3d": { x: "u*cos(v)", y: "u*sin(v)", z: "u^2" },
    "vector-2d": { p: "-y", q: "x" },
  };
  for (const mode of FREE_MODES) {
    for (const field of mode.ranges) {
      defaults[mode.id][field.key] = String(Number(field.defaultValue.toFixed(4)));
    }
  }
  return defaults;
}

function readClampedNumber(
  draft: Record<string, string>,
  field: NumericField,
) {
  const parsed = Number(draft[field.key]);
  if (!Number.isFinite(parsed)) {
    throw new Error(field.label + "に数値を入力してください。");
  }
  return clamp(parsed, field.min, field.max);
}

function buildFreeGraph(
  mode: FreeMode,
  draft: Record<string, string>,
): { graph: GraphSpec | null; error: string | null } {
  try {
    const definition = FREE_MODES.find((candidate) => candidate.id === mode);
    if (!definition) throw new Error("描画タイプを選び直してください。");
    const numbers = Object.fromEntries(
      definition.ranges.map((field) => [field.key, readClampedNumber(draft, field)]),
    );

    if (mode === "function-2d") {
      const y = compileAppliedMathExpression(draft.y, ["x"]);
      const [xMin, xMax] = orderedRange(numbers.xMin, numbers.xMax);
      return {
        error: null,
        graph: {
          kind: "function-2d",
          title: "y = " + draft.y,
          description: "自由入力した2D関数",
          hue: 184,
          xMin,
          xMax,
          samples: Math.round(numbers.samples),
          y: (x) => y({ x }),
        },
      };
    }

    if (mode === "function-3d") {
      const z = compileAppliedMathExpression(draft.z, ["x", "y"]);
      const [xMin, xMax] = orderedRange(numbers.xMin, numbers.xMax);
      const [yMin, yMax] = orderedRange(numbers.yMin, numbers.yMax);
      const resolution = Math.round(numbers.resolution);
      return {
        error: null,
        graph: {
          kind: "surface-3d",
          title: "z = " + draft.z,
          description: "自由入力した高さ関数",
          hue: 272,
          uMin: xMin,
          uMax: xMax,
          vMin: yMin,
          vMax: yMax,
          uSteps: resolution,
          vSteps: resolution,
          point: (x, y) => ({ x, y, z: z({ x, y }) }),
        },
      };
    }

    if (mode === "curve-3d") {
      const x = compileAppliedMathExpression(draft.x, ["t"]);
      const y = compileAppliedMathExpression(draft.y, ["t"]);
      const z = compileAppliedMathExpression(draft.z, ["t"]);
      const [tMin, tMax] = orderedRange(numbers.tMin, numbers.tMax);
      return {
        error: null,
        graph: {
          kind: "curve-3d",
          title: "r(t) = (" + draft.x + ", " + draft.y + ", " + draft.z + ")",
          description: "自由入力したパラメータ曲線",
          hue: 145,
          tMin,
          tMax,
          samples: Math.round(numbers.samples),
          point: (t) => ({ x: x({ t }), y: y({ t }), z: z({ t }) }),
        },
      };
    }

    if (mode === "surface-3d") {
      const x = compileAppliedMathExpression(draft.x, ["u", "v"]);
      const y = compileAppliedMathExpression(draft.y, ["u", "v"]);
      const z = compileAppliedMathExpression(draft.z, ["u", "v"]);
      const [uMin, uMax] = orderedRange(numbers.uMin, numbers.uMax);
      const [vMin, vMax] = orderedRange(numbers.vMin, numbers.vMax);
      const resolution = Math.round(numbers.resolution);
      return {
        error: null,
        graph: {
          kind: "surface-3d",
          title: "r(u,v) = (" + draft.x + ", " + draft.y + ", " + draft.z + ")",
          description: "自由入力したパラメータ曲面",
          hue: 204,
          uMin,
          uMax,
          vMin,
          vMax,
          uSteps: resolution,
          vSteps: resolution,
          point: (u, v) => ({
            x: x({ u, v }),
            y: y({ u, v }),
            z: z({ u, v }),
          }),
        },
      };
    }

    const p = compileAppliedMathExpression(draft.p, ["x", "y"]);
    const q = compileAppliedMathExpression(draft.q, ["x", "y"]);
    const [xMin, xMax] = orderedRange(numbers.xMin, numbers.xMax);
    const [yMin, yMax] = orderedRange(numbers.yMin, numbers.yMax);
    return {
      error: null,
      graph: {
        kind: "vector-2d",
        title: "F = (" + draft.p + ", " + draft.q + ")",
        description: "自由入力した2Dベクトル場",
        hue: 326,
        xMin,
        xMax,
        yMin,
        yMax,
        grid: Math.round(numbers.grid),
        vector: (x, y) => ({ x: p({ x, y }), y: q({ x, y }) }),
      },
    };
  } catch (error) {
    return {
      graph: null,
      error: error instanceof Error ? error.message : "式を確認してください。",
    };
  }
}

type SampledGraph =
  | {
      kind: "function-2d";
      points: Array<Point2 | null>;
      validCount: number;
    }
  | {
      kind: "vector-2d";
      arrows: Array<{ position: Point2; vector: Point2 }>;
      validCount: number;
    }
  | {
      kind: "curve-3d";
      points: Array<Point3 | null>;
      validCount: number;
    }
  | {
      kind: "surface-3d";
      points: Array<Point3 | null>;
      rows: number;
      columns: number;
      validCount: number;
    };

type Bounds2 = { xMin: number; xMax: number; yMin: number; yMax: number };
type Bounds3 = Bounds2 & { zMin: number; zMax: number };
type ViewState = { yaw: number; pitch: number; zoom: number };
type ProjectedPoint = Point2 & { depth: number };

const DEFAULT_VIEW: ViewState = {
  yaw: -0.72,
  pitch: 0.56,
  zoom: 1,
};

function safePoint2(factory: () => Point2): Point2 | null {
  try {
    const point = factory();
    return finitePoint2(point) ? point : null;
  } catch {
    return null;
  }
}

function safePoint3(factory: () => Point3): Point3 | null {
  try {
    const point = factory();
    return finitePoint3(point) ? point : null;
  } catch {
    return null;
  }
}

function sampleGraph(graph: GraphSpec): SampledGraph {
  if (graph.kind === "function-2d") {
    const samples = Math.round(clamp(graph.samples, 80, 600));
    const points = Array.from({ length: samples }, (_, index) => {
      const ratio = samples === 1 ? 0 : index / (samples - 1);
      const x = graph.xMin + (graph.xMax - graph.xMin) * ratio;
      return safePoint2(() => ({ x, y: graph.y(x) }));
    });
    return {
      kind: graph.kind,
      points,
      validCount: points.filter(finitePoint2).length,
    };
  }

  if (graph.kind === "vector-2d") {
    const grid = Math.round(clamp(graph.grid, 5, 25));
    const arrows: Array<{ position: Point2; vector: Point2 }> = [];
    for (let row = 0; row < grid; row += 1) {
      const y = graph.yMin + (graph.yMax - graph.yMin) * (row / Math.max(1, grid - 1));
      for (let column = 0; column < grid; column += 1) {
        const x = graph.xMin + (graph.xMax - graph.xMin) * (column / Math.max(1, grid - 1));
        const vector = safePoint2(() => graph.vector(x, y));
        if (vector) arrows.push({ position: { x, y }, vector });
      }
    }
    return { kind: graph.kind, arrows, validCount: arrows.length };
  }

  if (graph.kind === "curve-3d") {
    const samples = Math.round(clamp(graph.samples, 80, 600));
    const points = Array.from({ length: samples }, (_, index) => {
      const ratio = samples === 1 ? 0 : index / (samples - 1);
      const t = graph.tMin + (graph.tMax - graph.tMin) * ratio;
      return safePoint3(() => graph.point(t));
    });
    return {
      kind: graph.kind,
      points,
      validCount: points.filter(finitePoint3).length,
    };
  }

  const rows = Math.round(clamp(graph.uSteps, 12, 46));
  const columns = Math.round(clamp(graph.vSteps, 12, 46));
  const points: Array<Point3 | null> = [];
  for (let row = 0; row < rows; row += 1) {
    const u = graph.uMin + (graph.uMax - graph.uMin) * (row / Math.max(1, rows - 1));
    for (let column = 0; column < columns; column += 1) {
      const v = graph.vMin + (graph.vMax - graph.vMin) * (column / Math.max(1, columns - 1));
      points.push(safePoint3(() => graph.point(u, v)));
    }
  }
  return {
    kind: graph.kind,
    points,
    rows,
    columns,
    validCount: points.filter(finitePoint3).length,
  };
}

function paddedRange(minimum: number, maximum: number, fallback = 2) {
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) {
    return [-fallback / 2, fallback / 2] as const;
  }
  if (Math.abs(maximum - minimum) < 1e-9) {
    const padding = Math.max(1, Math.abs(minimum) * 0.25);
    return [minimum - padding, maximum + padding] as const;
  }
  const padding = (maximum - minimum) * 0.1;
  return [minimum - padding, maximum + padding] as const;
}

function boundsFor2D(graph: Extract<GraphSpec, { kind: "function-2d" | "vector-2d" }>, sampled: SampledGraph): Bounds2 {
  if (graph.kind === "vector-2d") {
    return {
      xMin: graph.xMin,
      xMax: graph.xMax,
      yMin: graph.yMin,
      yMax: graph.yMax,
    };
  }

  const points = sampled.kind === "function-2d" ? sampled.points.filter(finitePoint2) : [];
  const yValues = points.map((point) => point.y);
  const [yMin, yMax] = paddedRange(Math.min(...yValues), Math.max(...yValues));
  return { xMin: graph.xMin, xMax: graph.xMax, yMin, yMax };
}

function boundsFor3D(sampled: Extract<SampledGraph, { kind: "curve-3d" | "surface-3d" }>): Bounds3 {
  const points = sampled.points.filter(finitePoint3);
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const zs = points.map((point) => point.z);
  const [xMin, xMax] = paddedRange(Math.min(...xs), Math.max(...xs));
  const [yMin, yMax] = paddedRange(Math.min(...ys), Math.max(...ys));
  const [zMin, zMax] = paddedRange(Math.min(...zs), Math.max(...zs));
  return { xMin, xMax, yMin, yMax, zMin, zMax };
}

function make2DProjector(
  width: number,
  height: number,
  bounds: Bounds2,
  zoom: number,
) {
  const margin = Math.min(52, Math.max(32, width * 0.08));
  const centerX = (bounds.xMin + bounds.xMax) / 2;
  const centerY = (bounds.yMin + bounds.yMax) / 2;
  const xSpan = Math.max(1e-9, (bounds.xMax - bounds.xMin) / zoom);
  const ySpan = Math.max(1e-9, (bounds.yMax - bounds.yMin) / zoom);
  const xMin = centerX - xSpan / 2;
  const yMin = centerY - ySpan / 2;
  const xScale = (width - margin * 2) / xSpan;
  const yScale = (height - margin * 2) / ySpan;
  return (point: Point2): Point2 => ({
    x: margin + (point.x - xMin) * xScale,
    y: height - margin - (point.y - yMin) * yScale,
  });
}

function zoomedBoundsFor2D(bounds: Bounds2, zoom: number): Bounds2 {
  const centerX = (bounds.xMin + bounds.xMax) / 2;
  const centerY = (bounds.yMin + bounds.yMax) / 2;
  const xSpan = Math.max(1e-9, (bounds.xMax - bounds.xMin) / zoom);
  const ySpan = Math.max(1e-9, (bounds.yMax - bounds.yMin) / zoom);
  return {
    xMin: centerX - xSpan / 2,
    xMax: centerX + xSpan / 2,
    yMin: centerY - ySpan / 2,
    yMax: centerY + ySpan / 2,
  };
}

function make3DProjector(
  width: number,
  height: number,
  bounds: Bounds3,
  view: ViewState,
) {
  const center = {
    x: (bounds.xMin + bounds.xMax) / 2,
    y: (bounds.yMin + bounds.yMax) / 2,
    z: (bounds.zMin + bounds.zMax) / 2,
  };
  const span = Math.max(
    bounds.xMax - bounds.xMin,
    bounds.yMax - bounds.yMin,
    bounds.zMax - bounds.zMin,
    1e-9,
  );
  const scale = Math.min(width, height) * 0.7 * view.zoom / span;
  const cosYaw = Math.cos(view.yaw);
  const sinYaw = Math.sin(view.yaw);
  const cosPitch = Math.cos(view.pitch);
  const sinPitch = Math.sin(view.pitch);

  return (point: Point3): ProjectedPoint => {
    const x = point.x - center.x;
    const y = point.y - center.y;
    const z = point.z - center.z;
    const yawX = cosYaw * x - sinYaw * y;
    const yawY = sinYaw * x + cosYaw * y;
    const pitchY = cosPitch * yawY - sinPitch * z;
    const depth = sinPitch * yawY + cosPitch * z;
    return {
      x: width / 2 + yawX * scale,
      y: height / 2 - pitchY * scale,
      depth,
    };
  };
}

function strokeSegment(
  context: CanvasRenderingContext2D,
  first: Point2,
  second: Point2,
) {
  context.beginPath();
  context.moveTo(first.x, first.y);
  context.lineTo(second.x, second.y);
  context.stroke();
}

function draw2DGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  bounds: Bounds2,
  project: (point: Point2) => Point2,
) {
  context.save();
  context.strokeStyle = "rgba(177, 202, 218, 0.13)";
  context.lineWidth = 1;
  context.fillStyle = "rgba(211, 228, 237, 0.62)";
  context.font = "11px ui-monospace, SFMono-Regular, Consolas, monospace";
  context.textAlign = "center";
  context.textBaseline = "top";

  for (let index = 0; index <= 8; index += 1) {
    const x = bounds.xMin + (bounds.xMax - bounds.xMin) * (index / 8);
    const y = bounds.yMin + (bounds.yMax - bounds.yMin) * (index / 8);
    const verticalStart = project({ x, y: bounds.yMin });
    const verticalEnd = project({ x, y: bounds.yMax });
    const horizontalStart = project({ x: bounds.xMin, y });
    const horizontalEnd = project({ x: bounds.xMax, y });
    strokeSegment(context, verticalStart, verticalEnd);
    strokeSegment(context, horizontalStart, horizontalEnd);
  }

  context.strokeStyle = "rgba(235, 245, 250, 0.72)";
  context.lineWidth = 1.4;
  if (bounds.xMin <= 0 && bounds.xMax >= 0) {
    strokeSegment(context, project({ x: 0, y: bounds.yMin }), project({ x: 0, y: bounds.yMax }));
  }
  if (bounds.yMin <= 0 && bounds.yMax >= 0) {
    strokeSegment(context, project({ x: bounds.xMin, y: 0 }), project({ x: bounds.xMax, y: 0 }));
  }
  context.fillText("x", Math.max(16, width - 22), height / 2 + 8);
  context.fillText("y", width / 2 + 12, 10);
  context.restore();
}

function drawArrow(
  context: CanvasRenderingContext2D,
  start: Point2,
  direction: Point2,
  length: number,
  color: string,
) {
  const magnitude = Math.hypot(direction.x, direction.y);
  if (magnitude < 1e-10) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(start.x, start.y, 2.2, 0, Math.PI * 2);
    context.fill();
    return;
  }
  const unitX = direction.x / magnitude;
  const unitY = direction.y / magnitude;
  const end = { x: start.x + unitX * length, y: start.y + unitY * length };
  const head = Math.max(4, Math.min(8, length * 0.35));
  const angle = Math.atan2(unitY, unitX);
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = 1.7;
  strokeSegment(context, start, end);
  context.beginPath();
  context.moveTo(end.x, end.y);
  context.lineTo(
    end.x - head * Math.cos(angle - Math.PI / 6),
    end.y - head * Math.sin(angle - Math.PI / 6),
  );
  context.lineTo(
    end.x - head * Math.cos(angle + Math.PI / 6),
    end.y - head * Math.sin(angle + Math.PI / 6),
  );
  context.closePath();
  context.fill();
}

function draw2DGraph(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  graph: Extract<GraphSpec, { kind: "function-2d" | "vector-2d" }>,
  sampled: Extract<SampledGraph, { kind: "function-2d" | "vector-2d" }>,
  zoom: number,
) {
  const bounds = boundsFor2D(graph, sampled);
  const visibleBounds = zoomedBoundsFor2D(bounds, zoom);
  const project = make2DProjector(width, height, bounds, zoom);
  draw2DGrid(context, width, height, visibleBounds, project);

  if (graph.kind === "function-2d" && sampled.kind === "function-2d") {
    context.save();
    context.strokeStyle = "hsl(" + graph.hue + " 90% 62%)";
    context.lineWidth = 2.6;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.beginPath();
    let drawing = false;
    for (const point of sampled.points) {
      if (!point) {
        drawing = false;
        continue;
      }
      const projected = project(point);
      if (!finitePoint2(projected)) {
        drawing = false;
        continue;
      }
      if (drawing) context.lineTo(projected.x, projected.y);
      else {
        context.moveTo(projected.x, projected.y);
        drawing = true;
      }
    }
    context.stroke();
    context.restore();
    return;
  }

  if (graph.kind === "vector-2d" && sampled.kind === "vector-2d") {
    const magnitudes = sampled.arrows.map(({ vector }) => Math.hypot(vector.x, vector.y));
    const maximum = Math.max(...magnitudes, 1e-9);
    const grid = Math.max(5, graph.grid);
    const cellLength = Math.min(
      (width - 70) / grid,
      (height - 70) / grid,
    );
    for (const { position, vector } of sampled.arrows) {
      const magnitude = Math.hypot(vector.x, vector.y);
      const ratio = Math.log1p(magnitude) / Math.log1p(maximum);
      const projected = project(position);
      const screenDirection = { x: vector.x, y: -vector.y };
      const length = cellLength * (0.22 + ratio * 0.36);
      const hue = (graph.hue + ratio * 90) % 360;
      drawArrow(
        context,
        projected,
        screenDirection,
        length,
        "hsl(" + hue.toFixed(1) + " 92% 60%)",
      );
    }
  }
}

function draw3DGridAndAxes(
  context: CanvasRenderingContext2D,
  bounds: Bounds3,
  project: (point: Point3) => ProjectedPoint,
) {
  const zPlane = clamp(0, bounds.zMin, bounds.zMax);
  context.save();
  context.strokeStyle = "rgba(174, 202, 218, 0.14)";
  context.lineWidth = 1;
  for (let index = 0; index <= 8; index += 1) {
    const x = bounds.xMin + (bounds.xMax - bounds.xMin) * (index / 8);
    const y = bounds.yMin + (bounds.yMax - bounds.yMin) * (index / 8);
    strokeSegment(
      context,
      project({ x, y: bounds.yMin, z: zPlane }),
      project({ x, y: bounds.yMax, z: zPlane }),
    );
    strokeSegment(
      context,
      project({ x: bounds.xMin, y, z: zPlane }),
      project({ x: bounds.xMax, y, z: zPlane }),
    );
  }

  const centerX = clamp(0, bounds.xMin, bounds.xMax);
  const centerY = clamp(0, bounds.yMin, bounds.yMax);
  context.strokeStyle = "rgba(235, 245, 250, 0.72)";
  context.lineWidth = 1.6;
  const xStart = project({ x: bounds.xMin, y: centerY, z: zPlane });
  const xEnd = project({ x: bounds.xMax, y: centerY, z: zPlane });
  const yStart = project({ x: centerX, y: bounds.yMin, z: zPlane });
  const yEnd = project({ x: centerX, y: bounds.yMax, z: zPlane });
  const zStart = project({ x: centerX, y: centerY, z: bounds.zMin });
  const zEnd = project({ x: centerX, y: centerY, z: bounds.zMax });
  strokeSegment(context, xStart, xEnd);
  strokeSegment(context, yStart, yEnd);
  strokeSegment(context, zStart, zEnd);

  context.fillStyle = "rgba(232, 243, 249, 0.76)";
  context.font = "700 12px ui-monospace, SFMono-Regular, Consolas, monospace";
  context.fillText("x", xEnd.x + 7, xEnd.y);
  context.fillText("y", yEnd.x + 7, yEnd.y);
  context.fillText("z", zEnd.x + 7, zEnd.y);
  context.restore();
}

function draw3DGraph(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  graph: Extract<GraphSpec, { kind: "curve-3d" | "surface-3d" }>,
  sampled: Extract<SampledGraph, { kind: "curve-3d" | "surface-3d" }>,
  view: ViewState,
) {
  const bounds = boundsFor3D(sampled);
  const project = make3DProjector(width, height, bounds, view);
  draw3DGridAndAxes(context, bounds, project);

  if (graph.kind === "surface-3d" && sampled.kind === "surface-3d") {
    const quads: Array<{ points: ProjectedPoint[]; depth: number }> = [];
    for (let row = 0; row < sampled.rows - 1; row += 1) {
      for (let column = 0; column < sampled.columns - 1; column += 1) {
        const first = sampled.points[row * sampled.columns + column];
        const second = sampled.points[(row + 1) * sampled.columns + column];
        const third = sampled.points[(row + 1) * sampled.columns + column + 1];
        const fourth = sampled.points[row * sampled.columns + column + 1];
        if (!first || !second || !third || !fourth) continue;
        const points = [first, second, third, fourth].map(project);
        quads.push({
          points,
          depth: points.reduce((sum, point) => sum + point.depth, 0) / points.length,
        });
      }
    }
    quads.sort((first, second) => first.depth - second.depth);

    context.save();
    context.lineWidth = 0.75;
    for (const quad of quads) {
      context.beginPath();
      context.moveTo(quad.points[0].x, quad.points[0].y);
      for (let index = 1; index < quad.points.length; index += 1) {
        context.lineTo(quad.points[index].x, quad.points[index].y);
      }
      context.closePath();
      context.fillStyle = "hsla(" + graph.hue + ", 82%, 58%, 0.24)";
      context.strokeStyle = "hsla(" + graph.hue + ", 88%, 69%, 0.38)";
      context.fill();
      context.stroke();
    }
    context.restore();
  }

  if (graph.kind === "curve-3d" && sampled.kind === "curve-3d") {
    context.save();
    context.strokeStyle = "hsl(" + graph.hue + " 90% 62%)";
    context.shadowColor = "hsla(" + graph.hue + ", 92%, 62%, 0.38)";
    context.shadowBlur = 9;
    context.lineWidth = 3;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.beginPath();
    let drawing = false;
    for (const point of sampled.points) {
      if (!point) {
        drawing = false;
        continue;
      }
      const projected = project(point);
      if (drawing) context.lineTo(projected.x, projected.y);
      else {
        context.moveTo(projected.x, projected.y);
        drawing = true;
      }
    }
    context.stroke();
    context.restore();
  }
}

function GraphCanvas({ graph }: { graph: GraphSpec }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistanceRef = useRef<number | null>(null);
  const descriptionId = useId();
  const [view, setView] = useState<ViewState>(DEFAULT_VIEW);
  const sampled = useMemo(() => sampleGraph(graph), [graph]);
  const is3D = graph.kind === "curve-3d" || graph.kind === "surface-3d";

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = Math.max(280, Math.floor(canvas.clientWidth || 720));
    const height = Math.max(300, Math.floor(canvas.clientHeight || 520));
    const ratio = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const pixelWidth = Math.floor(width * ratio);
    const pixelHeight = Math.floor(height * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#111a23");
    background.addColorStop(0.58, "#0c141d");
    background.addColorStop(1, "#091018");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    if (sampled.validCount === 0) {
      context.fillStyle = "rgba(240, 247, 250, 0.82)";
      context.font = "600 16px system-ui, sans-serif";
      context.textAlign = "center";
      context.fillText("この範囲では描画できる点がありません", width / 2, height / 2);
      context.textAlign = "start";
      return;
    }

    if (graph.kind === "function-2d" && sampled.kind === "function-2d") {
      draw2DGraph(context, width, height, graph, sampled, view.zoom);
    } else if (graph.kind === "vector-2d" && sampled.kind === "vector-2d") {
      draw2DGraph(context, width, height, graph, sampled, view.zoom);
    } else if (graph.kind === "curve-3d" && sampled.kind === "curve-3d") {
      draw3DGraph(context, width, height, graph, sampled, view);
    } else if (graph.kind === "surface-3d" && sampled.kind === "surface-3d") {
      draw3DGraph(context, width, height, graph, sampled, view);
    }
  }, [graph, sampled, view]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? Math.max(320, canvas.clientHeight)
          : 1;
      const normalizedDelta = clamp(event.deltaY * unit, -240, 240);
      const zoomFactor = Math.exp(-normalizedDelta * 0.0022);
      setView((current) => ({
        ...current,
        zoom: clamp(current.zoom * zoomFactor, 0.45, 3.4),
      }));
    };
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  function rotate(horizontal: number, vertical: number) {
    if (!is3D) return;
    setView((current) => ({
      ...current,
      yaw: current.yaw + horizontal,
      pitch: clamp(current.pitch + vertical, -1.35, 1.35),
    }));
  }

  function zoom(delta: number) {
    setView((current) => ({
      ...current,
      zoom: clamp(current.zoom * delta, 0.45, 3.4),
    }));
  }

  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pointers = [...activePointersRef.current.values()];
    pinchDistanceRef.current = pointers.length >= 2
      ? Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y)
      : null;
  }

  function onPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const previous = activePointersRef.current.get(event.pointerId);
    if (!previous) return;
    activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pointers = [...activePointersRef.current.values()];
    if (pointers.length >= 2) {
      const distance = Math.hypot(
        pointers[0].x - pointers[1].x,
        pointers[0].y - pointers[1].y,
      );
      const previousDistance = pinchDistanceRef.current;
      if (previousDistance && previousDistance > 0 && distance > 0) {
        zoom(clamp(distance / previousDistance, 0.82, 1.22));
      }
      pinchDistanceRef.current = distance;
      return;
    }
    pinchDistanceRef.current = null;
    if (is3D) {
      rotate(
        (event.clientX - previous.x) * 0.009,
        (event.clientY - previous.y) * 0.009,
      );
    }
  }

  function endPointer(event: ReactPointerEvent<HTMLCanvasElement>) {
    activePointersRef.current.delete(event.pointerId);
    const pointers = [...activePointersRef.current.values()];
    pinchDistanceRef.current = pointers.length >= 2
      ? Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y)
      : null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLCanvasElement>) {
    if (event.key === "Home") {
      event.preventDefault();
      setView(DEFAULT_VIEW);
      return;
    }
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoom(1.12);
      return;
    }
    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      zoom(1 / 1.12);
      return;
    }
    if (!is3D) return;
    const rotations: Record<string, [number, number]> = {
      ArrowLeft: [-0.12, 0],
      ArrowRight: [0.12, 0],
      ArrowUp: [0, -0.1],
      ArrowDown: [0, 0.1],
    };
    const rotation = rotations[event.key];
    if (!rotation) return;
    event.preventDefault();
    rotate(rotation[0], rotation[1]);
  }

  return (
    <section className={styles.canvasPanel} aria-label="グラフ表示">
      <div className={styles.canvasHeading}>
        <div>
          <span>{is3D ? "3D VIEW" : "2D VIEW"}</span>
          <strong>{graph.title}</strong>
        </div>
        <small>{sampled.validCount.toLocaleString("ja-JP")} 有効サンプル</small>
      </div>
      <canvas
        ref={canvasRef}
        className={[styles.canvas, is3D ? styles.rotatableCanvas : ""].filter(Boolean).join(" ")}
        role="img"
        tabIndex={0}
        aria-label={graph.title + "のインタラクティブグラフ"}
        aria-describedby={descriptionId}
        aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown + - Home"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onLostPointerCapture={endPointer}
        onKeyDown={onKeyDown}
      />
      <p className={styles.gestureHint}>
        {is3D ? "ドラッグで回転 · " : ""}ホイール／トラックパッド／ピンチで拡大縮小
      </p>
      <div className={styles.canvasControls} role="group" aria-label="グラフ表示操作">
        <button type="button" onClick={() => setView(DEFAULT_VIEW)}>表示を戻す</button>
      </div>
      <p id={descriptionId} className={styles.canvasHelp}>
        {graph.description}。キーボードでは{is3D ? "矢印キーで回転、" : ""}＋/−キーで拡大縮小、Homeキーで初期表示に戻せます。
      </p>
    </section>
  );
}

function createPresetDrafts() {
  return Object.fromEntries(
    PRESETS.map((preset) => [
      preset.id,
      Object.fromEntries(
        preset.fields.map((field) => [
          field.key,
          String(Number(field.defaultValue.toFixed(4))),
        ]),
      ),
    ]),
  ) as Record<string, Record<string, string>>;
}

function presetNumbers(
  preset: Preset,
  draft: Record<string, string>,
) {
  return Object.fromEntries(
    preset.fields.map((field) => {
      const parsed = Number(draft[field.key]);
      return [
        field.key,
        Number.isFinite(parsed)
          ? clamp(parsed, field.min, field.max)
          : field.defaultValue,
      ];
    }),
  );
}

function NumericEditor({
  field,
  value,
  onChange,
  onBlur,
}: {
  field: NumericField;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <label className={styles.numberField}>
      <span>{field.label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
      <small>{field.hint}</small>
    </label>
  );
}

function EmptyCanvas({ error }: { error: string }) {
  return (
    <section className={styles.canvasPanel} aria-label="グラフを描画できません">
      <div className={styles.emptyCanvas} role="alert">
        <span>CHECK THE FORMULA</span>
        <strong>まだ描画できません</strong>
        <p>{error}</p>
      </div>
    </section>
  );
}

export type AppliedMathGraphLabProps = {
  className?: string;
};

export default function AppliedMathGraphLab({
  className,
}: AppliedMathGraphLabProps) {
  const titleId = useId();
  const presetPanelId = useId();
  const freePanelId = useId();
  const [tab, setTab] = useState<"preset" | "free">("preset");
  const [selectedPresetId, setSelectedPresetId] = useState(PRESETS[0].id);
  const [presetDrafts, setPresetDrafts] = useState(createPresetDrafts);
  const [freeMode, setFreeMode] = useState<FreeMode>("function-2d");
  const [freeDrafts, setFreeDrafts] = useState(createFreeDefaults);

  const selectedPreset = PRESETS.find((preset) => preset.id === selectedPresetId) ?? PRESETS[0];
  const selectedPresetDraft = presetDrafts[selectedPreset.id];
  const presetGraph = useMemo(
    () => selectedPreset.build(presetNumbers(selectedPreset, selectedPresetDraft)),
    [selectedPreset, selectedPresetDraft],
  );
  const freeDefinition = FREE_MODES.find((mode) => mode.id === freeMode) ?? FREE_MODES[0];
  const freeDraft = freeDrafts[freeMode];
  const freeResult = useMemo(
    () => buildFreeGraph(freeMode, freeDraft),
    [freeDraft, freeMode],
  );

  function updatePresetField(field: NumericField, value: string) {
    setPresetDrafts((current) => ({
      ...current,
      [selectedPreset.id]: {
        ...current[selectedPreset.id],
        [field.key]: value,
      },
    }));
  }

  function normalizePresetField(field: NumericField) {
    const parsed = Number(presetDrafts[selectedPreset.id][field.key]);
    const normalized = Number.isFinite(parsed)
      ? clamp(parsed, field.min, field.max)
      : field.defaultValue;
    updatePresetField(field, String(Number(normalized.toFixed(4))));
  }

  function resetPreset() {
    setPresetDrafts((current) => ({
      ...current,
      [selectedPreset.id]: Object.fromEntries(
        selectedPreset.fields.map((field) => [
          field.key,
          String(Number(field.defaultValue.toFixed(4))),
        ]),
      ),
    }));
  }

  function updateFreeField(key: string, value: string) {
    setFreeDrafts((current) => ({
      ...current,
      [freeMode]: {
        ...current[freeMode],
        [key]: value,
      },
    }));
  }

  function normalizeFreeNumber(field: NumericField) {
    const parsed = Number(freeDrafts[freeMode][field.key]);
    const normalized = Number.isFinite(parsed)
      ? clamp(parsed, field.min, field.max)
      : field.defaultValue;
    updateFreeField(field.key, String(Number(normalized.toFixed(4))));
  }

  function resetFreeMode() {
    const defaults = createFreeDefaults();
    setFreeDrafts((current) => ({
      ...current,
      [freeMode]: defaults[freeMode],
    }));
  }

  return (
    <section
      className={[styles.lab, className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
    >
      <header className={styles.hero}>
        <div>
          <p><span>GRAPH BREAK</span><span>SUBJECT 08</span></p>
          <h2 id={titleId}>グラフ休憩所</h2>
          <small>式を眺めて、回して、数値をいじる。計算の合間に形の直感だけ持ち帰る場所です。</small>
        </div>
        <strong aria-hidden="true">∿</strong>
      </header>

      <aside className={styles.examNotice} role="note" aria-label="試験対象外の注意">
        <span>OFF THE EXAM</span>
        <div>
          <strong>グラフは今回のテストに出ません。</strong>
          <p>完全に息抜き用です。成績・連続正解・ランキング・総合問題の集計対象にも入りません。</p>
        </div>
      </aside>

      <div className={styles.tabs} role="tablist" aria-label="グラフの作り方">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "preset"}
          aria-controls={presetPanelId}
          className={tab === "preset" ? styles.activeTab : undefined}
          onClick={() => setTab("preset")}
        >
          範囲プリセット
          <small>数値だけ変える</small>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "free"}
          aria-controls={freePanelId}
          className={tab === "free" ? styles.activeTab : undefined}
          onClick={() => setTab("free")}
        >
          自由入力
          <small>式からつくる</small>
        </button>
      </div>

      {tab === "preset" && (
        <div
          id={presetPanelId}
          role="tabpanel"
          className={styles.tabPanel}
        >
          <div className={styles.presetRail} role="group" aria-label="範囲のグラフプリセット">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                aria-pressed={selectedPreset.id === preset.id}
                className={selectedPreset.id === preset.id ? styles.activePreset : undefined}
                onClick={() => setSelectedPresetId(preset.id)}
              >
                <span>{preset.category}</span>
                <strong>{preset.title}</strong>
                {preset.warning && <small>⚠ 資料不一致</small>}
              </button>
            ))}
          </div>

          <div className={styles.workspace}>
            <section className={styles.editorPanel} aria-labelledby={titleId + "-preset-editor"}>
              <div className={styles.editorHeading}>
                <div>
                  <span>{selectedPreset.category}</span>
                  <h3 id={titleId + "-preset-editor"}>{selectedPreset.title}</h3>
                </div>
                <button type="button" onClick={resetPreset}>初期値</button>
              </div>

              <div className={styles.formulaBlock}>
                <span>FORMULA</span>
                <code>{selectedPreset.formula}</code>
                <p>{selectedPreset.description}</p>
              </div>

              {selectedPreset.note && (
                <p className={styles.safeNote}>{selectedPreset.note}</p>
              )}
              {selectedPreset.warning && (
                <p className={styles.conflictNote} role="note">
                  <strong>資料不一致</strong>{selectedPreset.warning}
                </p>
              )}

              <fieldset className={styles.numericGrid}>
                <legend>数値を変える</legend>
                {selectedPreset.fields.map((field) => (
                  <NumericEditor
                    key={field.key}
                    field={field}
                    value={presetDrafts[selectedPreset.id][field.key]}
                    onChange={(value) => updatePresetField(field, value)}
                    onBlur={() => normalizePresetField(field)}
                  />
                ))}
              </fieldset>
              <p className={styles.editorHint}>入力値は安全な範囲へ自動で丸め、即座に描き直します。</p>
            </section>

            <GraphCanvas graph={presetGraph} />
          </div>
        </div>
      )}

      {tab === "free" && (
        <div
          id={freePanelId}
          role="tabpanel"
          className={styles.tabPanel}
        >
          <fieldset className={styles.modePicker}>
            <legend>描画タイプ</legend>
            {FREE_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                aria-pressed={freeMode === mode.id}
                className={freeMode === mode.id ? styles.activeMode : undefined}
                onClick={() => setFreeMode(mode.id)}
              >
                {mode.shortLabel}
              </button>
            ))}
          </fieldset>

          <div className={styles.workspace}>
            <section className={styles.editorPanel} aria-labelledby={titleId + "-free-editor"}>
              <div className={styles.editorHeading}>
                <div>
                  <span>SAFE EXPRESSION</span>
                  <h3 id={titleId + "-free-editor"}>{freeDefinition.label}</h3>
                </div>
                <button type="button" onClick={resetFreeMode}>例に戻す</button>
              </div>
              <p className={styles.freeDescription}>{freeDefinition.description}</p>

              <fieldset className={styles.expressionFields}>
                <legend>式を入力</legend>
                {freeDefinition.expressions.map((field) => (
                  <label key={field.key}>
                    <span>{field.label}</span>
                    <input
                      type="text"
                      spellCheck={false}
                      autoComplete="off"
                      maxLength={MAX_EXPRESSION_LENGTH}
                      value={freeDraft[field.key]}
                      placeholder={field.placeholder}
                      onChange={(event) => updateFreeField(field.key, event.target.value)}
                    />
                  </label>
                ))}
              </fieldset>

              <details className={styles.syntaxHelp}>
                <summary>使える記号と関数</summary>
                <p><code>+ − * / ^ ( )</code></p>
                <p><code>sin cos tan sqrt abs exp log pi e</code></p>
                <small>logは自然対数です。変数同士は <code>x*y</code> のように * でつないでください。</small>
              </details>

              <fieldset className={styles.numericGrid}>
                <legend>範囲・細かさ</legend>
                {freeDefinition.ranges.map((field) => (
                  <NumericEditor
                    key={field.key}
                    field={field}
                    value={freeDraft[field.key]}
                    onChange={(value) => updateFreeField(field.key, value)}
                    onBlur={() => normalizeFreeNumber(field)}
                  />
                ))}
              </fieldset>

              {freeResult.error ? (
                <p className={styles.parseError} role="alert">
                  <strong>式を確認：</strong>{freeResult.error}
                </p>
              ) : (
                <p className={styles.parseSuccess} aria-live="polite">
                  安全な式として読み取れました。値を変えると即座に更新します。
                </p>
              )}
              <p className={styles.editorHint}>
                eval / Function は使用していません。許可した構文だけを解析し、NaN・∞は描画から除外します。
              </p>
            </section>

            {freeResult.graph
              ? <GraphCanvas graph={freeResult.graph} />
              : <EmptyCanvas error={freeResult.error ?? "式を確認してください。"} />}
          </div>
        </div>
      )}
    </section>
  );
}
