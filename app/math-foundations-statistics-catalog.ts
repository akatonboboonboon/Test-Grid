import {
  APPLIED_MATH_FOUNDATIONS,
  STATISTICS_MATH_FOUNDATIONS,
  type MathFoundationEntry as SourceFoundationEntry,
} from "./math-foundations-statistics-applied";
import type {
  MathFoundationEntry,
  MathFoundationSubject,
} from "./math-foundations-types";

const TOPIC_LABELS: Record<string, string> = {
  descriptive: "記述統計・分散",
  relation: "共分散・相関・回帰",
  counting: "場合の数",
  conditional: "条件付き確率・Bayes",
  "random-variable": "確率変数・期待値",
  continuous: "連続分布・正規分布",
  vectors: "ベクトル",
  "vector-functions": "ベクトル関数",
  curves: "曲線・弧長",
  surfaces: "曲面",
  gradient: "勾配・方向微分",
  "divergence-curl": "発散・回転",
  "line-integrals": "線積分",
  "surface-integrals": "面積分",
  "green-theorem": "グリーンの定理",
};

function adaptFoundation(entry: SourceFoundationEntry): MathFoundationEntry {
  return {
    id: entry.id,
    subjectId: entry.subjectId,
    category: TOPIC_LABELS[entry.topic] ?? entry.topic,
    title: entry.title,
    overview: entry.purpose,
    formulas: [{
      label: entry.scope === "prerequisite" ? "前提として使う式" : "基本式",
      tex: entry.formula,
      expandedTex: entry.expandedFormula,
      note: entry.scope === "prerequisite"
        ? "今回の直接の出題項目でなくても、範囲内問題を解く前提として使います。"
        : undefined,
    }],
    symbols: entry.symbols.map((symbol) => ({
      symbol: symbol.symbol,
      meaning: symbol.note ? symbol.meaning + "（" + symbol.note + "）" : symbol.meaning,
      unit: symbol.unit,
    })),
    conditions: entry.conditions,
    workflow: [
      entry.purpose,
      "条件と記号を確認し、途中式を残して数値または成分を代入する。",
    ],
    pitfalls: entry.commonMistakes,
    example: entry.example ? {
      prompt: entry.example.given,
      steps: [entry.example.working],
      result: entry.example.answer,
    } : undefined,
    keywords: [entry.topic, entry.scope, ...entry.sourceBasis],
  };
}

export const STATISTICS_APPLIED_FOUNDATIONS: MathFoundationSubject[] = [
  {
    id: "subject-7",
    name: "確率統計",
    englishName: "PROBABILITY & STATISTICS",
    accent: "#66e39e",
    description: "平均・分散・期待値・確率・相関を、Σを使う式とΣなしの展開、適用条件まで一緒に確認します。範囲外でも計算の前提になる項目は「前提」として区別しています。",
    entries: STATISTICS_MATH_FOUNDATIONS.map(adaptFoundation),
  },
  {
    id: "subject-8",
    name: "応用数学",
    englishName: "APPLIED MATHEMATICS",
    accent: "#7aa7ff",
    description: "ベクトル、曲線・曲面、grad・div・curl、線積分・面積分を、演算の意味と適用条件から引ける一覧です。",
    entries: APPLIED_MATH_FOUNDATIONS.map(adaptFoundation),
  },
];
