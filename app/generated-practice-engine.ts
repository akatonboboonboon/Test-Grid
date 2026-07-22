import { ENGLISH_EXCLUDED_SOURCE_MARKERS, ENGLISH_PASSAGES } from "./english-data";
import {
  buildMaterialMechanicsGeneratedSpec,
  type MaterialMechanicsGeneratorTemplateId,
} from "./material-mechanics-generator-data";
import { generateDigitalCircuitQuestion } from "./digital-circuits-generator";
import { generateDigitalCircuitExtraQuestion } from "./digital-circuits-extra-generator";
import type { MaterialMechanicsDiagramKind } from "./material-mechanics-data";
import type { MechanicalDynamicsDiagramKind } from "./mechanical-dynamics-diagrams";
import type { ThermodynamicsDiagramKind } from "./thermodynamics-diagrams";
import type { DigitalCircuitAnyDiagramKind } from "./digital-circuits-extra-data";

export type GeneratedPracticeSubjectId =
  | "subject-2"
  | "subject-3"
  | "subject-4"
  | "subject-5"
  | "subject-6"
  | "subject-7"
  | "subject-8"
  | "subject-9";

export type GeneratedPracticeFormat = "number" | "choice" | "order" | "translation" | "text";

export type GeneratedPracticeVisual =
  | { type: "material-mechanics"; kind: MaterialMechanicsDiagramKind }
  | { type: "mechanical-dynamics"; kind: MechanicalDynamicsDiagramKind }
  | { type: "thermodynamics"; kind: ThermodynamicsDiagramKind }
  | { type: "digital-circuit"; kind: DigitalCircuitAnyDiagramKind };

export type GeneratedPracticeSource = {
  kind: "passage" | "range";
  label: string;
  chapter?: "ch14" | "ch15" | "ch16" | "ch18";
  passageId?: string;
  passageTitle?: string;
  paragraphIndex?: number;
  sentenceIndex?: number;
  excerpt?: string;
  pages?: number[];
};

export type GeneratedPracticeSafety = {
  domainChecked: true;
  finiteValues: number[];
  denominators: number[];
  radicands: number[];
  logArguments: number[];
  notes: string[];
};

export type GeneratedPracticeEvaluation =
  | {
      type: "numeric";
      numericAnswer: number;
      tolerance: number;
      expectedUnit?: string;
      requireUnit?: boolean;
      acceptedUnitScales?: Record<string, number>;
    }
  | {
      type: "choice" | "normalized-text";
      canonical: string;
      accepted: string[];
    }
  | {
      type: "ordered-tokens";
      canonical: string;
      correctOrder: string[];
    }
  | {
      type: "japanese-semantic";
      canonical: string;
      accepted: string[];
      keywordGroups: string[][];
      minimumKeywordGroups: number;
    };

export type GeneratedPracticeQuestion = {
  id: string;
  seed: string;
  subjectId: GeneratedPracticeSubjectId;
  subjectName: string;
  templateId: string;
  category: string;
  format: GeneratedPracticeFormat;
  title: string;
  prompt: string;
  context?: string;
  options?: string[];
  tokens?: string[];
  answer: string;
  acceptedAnswers: string[];
  formula?: string;
  expandedFormula?: string;
  steps: string[];
  reason: string;
  explanation: string;
  source: GeneratedPracticeSource;
  parameters: Record<string, string | number | boolean>;
  evaluation: GeneratedPracticeEvaluation;
  safety: GeneratedPracticeSafety;
  generation: "on-demand";
  provenance: "generated-from-in-scope-material";
  /** IDs of the exact in-scope cards/questions whose formulas this generator may use. */
  sourceReferenceIds?: string[];
  /** Optional problem/solution diagram. The problem-side variant must not reveal the answer. */
  visual?: GeneratedPracticeVisual;
  /** Past-paper calibrated difficulty and linked-work count. */
  difficulty?: 1 | 2 | 3;
  subpartCount?: number;
  sourceBasis?: readonly string[];
};

export type GeneratedPracticeValidation = {
  ok: boolean;
  errors: string[];
};

export type GeneratedPracticeGrade = {
  correct: boolean;
  normalizedInput: string;
  expected: string;
  feedback: string;
  manualReview?: boolean;
};

export type SeededRandom = {
  next: () => number;
  int: (minimum: number, maximum: number) => number;
  pick: <T>(items: readonly T[]) => T;
  shuffle: <T>(items: readonly T[]) => T[];
};

export const GENERATED_PRACTICE_SUBJECTS = [
  {
    id: "subject-2",
    name: "英語",
    shortName: "英語",
    description: "Ch.14・15・16・18の本文抜粋から、並び替え・和訳・本文文法をその場で生成します。",
    sourceLabel: "英語ZIP教材 Ch.14・15・16・18（Ch.14の除外ブロックは不使用）",
  },
  {
    id: "subject-3",
    name: "機械力学",
    shortName: "機械力学",
    description: "振動・減衰・複合ばねに加え、実物過去問の大問6相当となるレバー・ばね・ダンパ系を生成します。",
    sourceLabel: "機械力学範囲ZIP＋過去問",
  },
  {
    id: "subject-4",
    name: "熱・流体力学",
    shortName: "熱・流体",
    description: "断熱変化・熱効率・理想気体・逆カルノー冷凍機を、範囲内公式だけで生成します。",
    sourceLabel: "熱力学範囲ZIP＋追加範囲2ページ＋範囲内形式3",
  },
  {
    id: "subject-5",
    name: "材料力学",
    shortName: "材料力学",
    description: "丸軸のねじり・コイルばね・はりの反力と曲げモーメントを、範囲内公式だけで生成します。",
    sourceLabel: "材料力学範囲ZIP＋形式2の範囲一致部分",
  },
  {
    id: "subject-6",
    name: "スマート制御",
    shortName: "スマート制御",
    description: "一次遅れ・極・フィードバック・定常値の計算問題を生成します。",
    sourceLabel: "スマート制御範囲ZIP＋教科書p.65〜68",
  },
  {
    id: "subject-7",
    name: "確率統計",
    shortName: "確率統計",
    description: "記述統計・標準化・条件付き確率・場合の数・チェビシェフの不等式を、範囲内公式だけで生成します。",
    sourceLabel: "確率統計範囲ZIP＋追加範囲5ページ＋範囲演習PDF",
  },
  {
    id: "subject-8",
    name: "応用数学",
    shortName: "応用数学",
    description: "ベクトル・勾配・発散・外積・グリーンの定理の数値問題を生成します。",
    sourceLabel: "応用数学範囲22枚＋追加範囲",
  },
  {
    id: "subject-9",
    name: "デジタル回路",
    shortName: "デジタル回路",
    description: "ゲート波形・D/JK-FF・カウンタ・状態遷移・1001検出を、図付きで生成します。",
    sourceLabel: "デジタル回路範囲ZIP＋追加の現行範囲PDF 4件",
  },
] as const satisfies ReadonlyArray<{
  id: GeneratedPracticeSubjectId;
  name: string;
  shortName: string;
  description: string;
  sourceLabel: string;
}>;

const SUBJECT_NAME = Object.fromEntries(
  GENERATED_PRACTICE_SUBJECTS.map((subject) => [subject.id, subject.name]),
) as Record<GeneratedPracticeSubjectId, string>;

const ENGLISH_CHAPTERS = new Set(["ch14", "ch15", "ch16", "ch18"] as const);
const EPSILON = 1e-12;
export const MAX_GENERATION_ATTEMPTS = 32;

function hashSeed(seed: number | string): number {
  const value = String(seed);
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createSeededRandom(seed: number | string): SeededRandom {
  let state = hashSeed(seed) || 0x6d2b79f5;
  const next = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int(minimum, maximum) {
      if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || maximum < minimum) {
        throw new Error("乱数の整数範囲が不正です。");
      }
      return minimum + Math.floor(next() * (maximum - minimum + 1));
    },
    pick<T>(items: readonly T[]) {
      if (items.length === 0) throw new Error("空の候補からは選べません。");
      return items[Math.floor(next() * items.length)] as T;
    },
    shuffle<T>(items: readonly T[]) {
      const result = [...items];
      for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(next() * (index + 1));
        [result[index], result[swapIndex]] = [result[swapIndex] as T, result[index] as T];
      }
      return result;
    },
  };
}

function round(value: number, digits = 4): number {
  return Number(value.toFixed(digits));
}

function formatNumber(value: number, digits = 4): string {
  return round(value, digits).toString();
}

function signedCoefficientTerm(coefficient: number, term: string): string {
  return (coefficient >= 0 ? "+" : "") + coefficient + term;
}

function baseSafety(overrides: Partial<GeneratedPracticeSafety> = {}): GeneratedPracticeSafety {
  return {
    domainChecked: true,
    finiteValues: overrides.finiteValues ?? [],
    denominators: overrides.denominators ?? [],
    radicands: overrides.radicands ?? [],
    logArguments: overrides.logArguments ?? [],
    notes: overrides.notes ?? ["生成パラメータの定義域を確認済み"],
  };
}

function rangeSource(label: string, pages?: number[]): GeneratedPracticeSource {
  return { kind: "range", label, pages };
}

/**
 * Closed allow-list for calculation generators. A numeric template is invalid unless its
 * formula can be traced to these exact entries in the uploaded-range study data.
 */
export const GENERATED_PRACTICE_SOURCE_REFERENCES = {
  "mechanical-natural-frequency": ["md-f-cantilever", "md-f-wn", "md-f-frequency"],
  "mechanical-series-springs": ["md-f-parallel", "md-f-series", "md-f-composite", "md-f-wn", "md-f-frequency"],
  "mechanical-damping-ratio": ["md-f-critical", "md-f-zeta", "md-f-wd", "md-f-damped-initial"],
  "mechanical-pendulum-length": ["md-f-simple-pendulum", "md-f-frequency"],
  "mechanical-log-decrement": ["md-f-logdec-n", "md-f-zeta-exact", "md-f-wd", "md-f-wn"],
  "mechanical-lever-spring-damper": ["md-f-rotational", "md-f-lever", "md-f-zeta", "md-f-critical"],
  "mechanical-laplace-step-response": ["md-f-transfer", "md-f-coverup", "md-f-first-order", "md-f-step-response"],
  "thermo-ideal-gas": ["th-q-poly-mass", "th-poly-law", "th-poly-pressure", "th-q-poly-temperature"],
  "thermo-adiabatic-temperature": ["th-ad-pv", "th-ad-tp", "th-ad-works", "th-q-poly-mass"],
  "thermo-otto-efficiency": ["th-otto-processes", "th-otto-compression", "th-otto-temperature", "th-otto-efficiency"],
  "thermo-carnot-efficiency": ["th-carnot-ratio", "th-carnot-efficiency", "th-carnot-entropy"],
  "thermo-reversed-carnot": ["th-refrigeration-balance", "th-refrigeration-cop", "th-heat-pump-cop", "th-reversed-carnot-cop"],
  "material-solid-shaft-stress": ["mm-f-power", "mm-f-solid", "mm-f-tau-max", "mm-f-twist"],
  "material-hollow-shaft-stress": ["mm-f-power", "mm-f-hollow-ratio", "mm-f-tau-max"],
  "material-coil-spring-deflection": ["mm-f-spring-rate", "mm-f-spring-stress", "mm-f-spring-deflection"],
  "material-simple-beam-udl": ["mm-f-resultant", "mm-f-equilibrium", "mm-f-simple-udl", "mm-f-beam-diff", "mm-q-udl-mmax"],
  "material-simple-beam-point-rect": ["mm-f-bending-stress", "mm-f-rectangle-bending", "mm-f-simple-point-general"],
  "material-simple-beam-udl-rect": ["mm-f-bending-stress", "mm-f-rectangle-bending", "mm-f-simple-udl"],
  "material-cantilever-tip-hollow": ["mm-f-bending-stress", "mm-f-hollow-bending", "mm-f-cantilever-tip"],
  "material-cantilever-udl-hollow": ["mm-f-bending-stress", "mm-f-hollow-bending", "mm-f-cantilever-udl-free"],
  "smart-first-order-step": ["smart-first-order-step", "smart-pole-definition", "smart-stability-rule"],
  "smart-first-order-pole": ["smart-pole-definition", "smart-stability-rule"],
  "smart-negative-feedback": ["smart-negative-feedback", "smart-characteristic-equation", "smart-pole-definition"],
  "smart-steady-state": ["smart-first-order-step"],
  "statistics-symmetric-variance": ["stats-variance", "stats-linear-variance"],
  "statistics-z-score": ["stats-standardization"],
  "statistics-bayes": ["stats-bayes"],
  "statistics-combination": ["stats-combination"],
  "statistics-chebyshev": ["stats-chebyshev"],
  "applied-vector-norm": ["am-vector-norm"],
  "applied-orthogonal-unknown": ["am-orthogonal", "am-vector-norm"],
  "applied-directional-derivative": ["am-gradient", "am-directional"],
  "applied-divergence-point": ["am-divergence", "am-div-curl-linearity"],
  "applied-triangle-area": ["am-triangle-area"],
  "applied-green-rectangle": ["am-green-theorem"],
} as const satisfies Record<string, readonly string[]>;

type NumericSeed = {
  subjectId: Exclude<GeneratedPracticeSubjectId, "subject-2">;
  templateId: string;
  category: string;
  title: string;
  prompt: string;
  context?: string;
  answerValue: number;
  digits?: number;
  tolerance: number;
  unit?: string;
  requireUnit?: boolean;
  acceptedUnitScales?: Record<string, number>;
  formula: string;
  expandedFormula?: string;
  steps: string[];
  reason: string;
  explanation: string;
  source: GeneratedPracticeSource;
  parameters: Record<string, string | number | boolean>;
  safety: GeneratedPracticeSafety;
  visual?: GeneratedPracticeVisual;
  difficulty?: 1 | 2 | 3;
  subpartCount?: number;
  sourceBasis?: readonly string[];
};

function numericQuestion(seedKey: string, seed: NumericSeed): GeneratedPracticeQuestion {
  const answerNumber = formatNumber(seed.answerValue, seed.digits ?? 4);
  const answer = seed.unit ? `${answerNumber} ${seed.unit}` : answerNumber;
  const sourceReferenceIds = GENERATED_PRACTICE_SOURCE_REFERENCES[
    seed.templateId as keyof typeof GENERATED_PRACTICE_SOURCE_REFERENCES
  ];
  if (!sourceReferenceIds) {
    throw new Error(`Missing in-scope source references for template: ${seed.templateId}`);
  }
  return {
    id: `generated-${seed.subjectId}-${seed.templateId}-${hashSeed(seedKey).toString(36)}`,
    seed: seedKey,
    subjectId: seed.subjectId,
    subjectName: SUBJECT_NAME[seed.subjectId],
    templateId: seed.templateId,
    category: seed.category,
    format: "number",
    title: seed.title,
    prompt: seed.prompt,
    context: seed.context,
    answer,
    acceptedAnswers: seed.requireUnit ? [answer] : [answer, answerNumber],
    formula: seed.formula,
    expandedFormula: seed.expandedFormula,
    steps: seed.steps,
    reason: seed.reason,
    explanation: seed.explanation,
    source: seed.source,
    parameters: seed.parameters,
    evaluation: {
      type: "numeric",
      numericAnswer: seed.answerValue,
      tolerance: seed.tolerance,
      expectedUnit: seed.unit,
      requireUnit: seed.requireUnit ?? false,
      acceptedUnitScales: seed.acceptedUnitScales,
    },
    safety: seed.safety,
    generation: "on-demand",
    provenance: "generated-from-in-scope-material",
    sourceReferenceIds: [...sourceReferenceIds],
    visual: seed.visual,
    difficulty: seed.difficulty,
    subpartCount: seed.subpartCount,
    sourceBasis: seed.sourceBasis,
  };
}

type EnglishSourceSpec = {
  chapter: "ch14" | "ch15" | "ch16" | "ch18";
  passageId: string;
  paragraphIndex: number;
  sentenceIndex?: number;
};

function splitSentences(paragraph: string): string[] {
  return paragraph.split(/(?<=[.!?])\s+(?=[A-Z“‘])/u).map((sentence) => sentence.trim()).filter(Boolean);
}

function resolveEnglishSource(spec: EnglishSourceSpec) {
  const passage = ENGLISH_PASSAGES.find((item) => item.id === spec.passageId && item.unit === spec.chapter);
  if (!passage) throw new Error(`英語本文が見つかりません: ${spec.passageId}`);
  const paragraph = passage.paragraphs[spec.paragraphIndex];
  if (!paragraph) throw new Error(`英語本文の段落が見つかりません: ${spec.passageId}:${spec.paragraphIndex}`);
  const sentences = splitSentences(paragraph.en);
  const sentenceIndex = spec.sentenceIndex ?? 0;
  const excerpt = sentences[sentenceIndex];
  if (!excerpt) throw new Error(`英語本文の文が見つかりません: ${spec.passageId}:${spec.paragraphIndex}:${sentenceIndex}`);
  return {
    passage,
    paragraph,
    excerpt,
    source: {
      kind: "passage" as const,
      label: `${passage.titleJa}・第${spec.paragraphIndex + 1}段落${sentences.length > 1 ? `・第${sentenceIndex + 1}文` : ""}`,
      chapter: spec.chapter,
      passageId: passage.id,
      passageTitle: passage.title,
      paragraphIndex: spec.paragraphIndex,
      sentenceIndex,
      excerpt,
    },
  };
}

const ENGLISH_ORDER_SOURCES: EnglishSourceSpec[] = [
  { chapter: "ch14", passageId: "passage-big-battery", paragraphIndex: 2 },
  { chapter: "ch14", passageId: "passage-big-battery", paragraphIndex: 9 },
  { chapter: "ch15", passageId: "passage-amyris", paragraphIndex: 1 },
  { chapter: "ch15", passageId: "passage-amyris", paragraphIndex: 8 },
  { chapter: "ch16", passageId: "passage-weather", paragraphIndex: 2 },
  { chapter: "ch16", passageId: "passage-weather", paragraphIndex: 3 },
  { chapter: "ch18", passageId: "passage-wheelchair", paragraphIndex: 4 },
  { chapter: "ch18", passageId: "passage-wheelchair", paragraphIndex: 8 },
];

const ENGLISH_TRANSLATION_SOURCES: Array<EnglishSourceSpec & { keywordGroups: string[][] }> = [
  {
    chapter: "ch14",
    passageId: "passage-big-battery",
    paragraphIndex: 0,
    keywordGroups: [["日本"], ["北海道"], ["2013年", "2013"], ["世界最大"], ["蓄電池"], ["変動", "再生可能"]],
  },
  {
    chapter: "ch14",
    passageId: "passage-big-battery",
    paragraphIndex: 7,
    keywordGroups: [["レドックスフロー"], ["充電"], ["放電"], ["タンク"], ["バナジウム", "電解液"]],
  },
  {
    chapter: "ch14",
    passageId: "passage-big-battery",
    paragraphIndex: 8,
    keywordGroups: [["安全"], ["寿命"], ["10年", "20年"], ["容易"], ["大規模", "システム"], ["専門家"]],
  },
  {
    chapter: "ch15",
    passageId: "passage-amyris",
    paragraphIndex: 1,
    keywordGroups: [["実験室"], ["ロボットアーム"], ["化合物"], ["混ぜ"], ["目的", "細胞"]],
  },
  {
    chapter: "ch15",
    passageId: "passage-amyris",
    paragraphIndex: 8,
    keywordGroups: [["従来", "伝統"], ["遺伝子工学"], ["少数", "いくつか"], ["ゲノム全体"], ["ゼロから", "一から"]],
  },
  {
    chapter: "ch16",
    passageId: "passage-weather",
    paragraphIndex: 2,
    keywordGroups: [["通常"], ["気象庁", "気象機関"], ["20km", "20 km"], ["正方形", "四方"], ["分け", "分割"]],
  },
  {
    chapter: "ch16",
    passageId: "passage-weather",
    paragraphIndex: 6,
    keywordGroups: [["自然災害"], ["増加", "増えて"], ["チーム"], ["正確", "精度"], ["予報", "システム改善"]],
  },
  {
    chapter: "ch18",
    passageId: "passage-wheelchair",
    paragraphIndex: 4,
    keywordGroups: [["研究機関"], ["ロボット車椅子"], ["必要", "技術"], ["研究", "調べ"]],
  },
  {
    chapter: "ch18",
    passageId: "passage-wheelchair",
    paragraphIndex: 8,
    keywordGroups: [["計画中", "予定"], ["車椅子"], ["現在地", "現在位置"], ["目的地"], ["経路", "ルート", "計算"]],
  },
];

type GrammarSpec = EnglishSourceSpec & {
  target: string;
  question: string;
  options: string[];
  answer: string;
  reason: string;
  explanation: string;
};

const ENGLISH_GRAMMAR_SPECS: GrammarSpec[] = [
  {
    chapter: "ch14",
    passageId: "passage-big-battery",
    paragraphIndex: 1,
    target: "is aimed at promoting",
    question: "is aimed at promoting の文法構造として正しいものはどれか。",
    options: ["be aimed at + 動名詞", "be aimed to + 動名詞", "aim at + 過去分詞", "be aiming for + 不定詞"],
    answer: "be aimed at + 動名詞",
    reason: "at は前置詞なので、後ろに動名詞 promoting が続くためです。",
    explanation: "be aimed at doing は「～することを目的とする」。受動態 be aimed と前置詞 at を一まとまりで捉えます。",
  },
  {
    chapter: "ch14",
    passageId: "passage-big-battery",
    paragraphIndex: 9,
    target: "allow utilities to buy",
    question: "allow utilities to buy の構造として正しいものはどれか。",
    options: ["allow + 目的語 + to do", "allow + doing + 目的語", "allow + 目的語 + doing", "allow to + 目的語 + do"],
    answer: "allow + 目的語 + to do",
    reason: "utilities が意味上の主語、to buy が可能になる動作だからです。",
    explanation: "allow A to do で「Aが～するのを可能にする／許す」。本文では蓄電池が電力会社の利用増加を可能にします。",
  },
  {
    chapter: "ch15",
    passageId: "passage-amyris",
    paragraphIndex: 1,
    target: "to produce the desired cells",
    question: "to produce the desired cells の不定詞の働きはどれか。",
    options: ["目的（〜するために）", "結果（その結果〜した）", "名詞的用法（〜すること）", "形容詞的用法（〜するための）"],
    answer: "目的（〜するために）",
    reason: "ロボットアームが化合物を混ぜる目的を説明しているためです。",
    explanation: "start to mix の to は start の目的語になる不定詞ですが、後半の to produce は『目的の細胞を作るために』という目的を表す副詞用法です。",
  },
  {
    chapter: "ch15",
    passageId: "passage-amyris",
    paragraphIndex: 7,
    target: "Since it was founded a decade ago",
    question: "Since it was founded a decade ago と has become の組合せが表す時間関係はどれか。",
    options: ["10年前から現在まで", "現在から10年後まで", "過去の一時点だけ", "未来の仮定"],
    answer: "10年前から現在まで",
    reason: "since が起点を置き、主節の現在完了 has become が現在までの継続・変化を示すためです。",
    explanation: "was founded は創業された過去の時点、has become はその後現在までに伝説的存在になった変化を表します。",
  },
  {
    chapter: "ch16",
    passageId: "passage-weather",
    paragraphIndex: 1,
    sentenceIndex: 1,
    target: "which are essential factors in weather forecasts",
    question: "which の先行詞はどれか。",
    options: ["Cloud formation and movements", "weather forecasts", "atmospheric conditions", "each block"],
    answer: "Cloud formation and movements",
    reason: "which の直前にある複数名詞を受け、are と数も一致するためです。",
    explanation: "コンマで挟まれた非制限用法の関係代名詞節で、『雲の形成と動きは天気予報の不可欠な要因であり』と補足します。",
  },
  {
    chapter: "ch16",
    passageId: "passage-weather",
    paragraphIndex: 4,
    target: "By using the K computer",
    question: "By + 動名詞が表す意味はどれか。",
    options: ["手段（〜することによって）", "期限（〜までに）", "受動態の動作主", "場所（〜のそばで）"],
    answer: "手段（〜することによって）",
    reason: "京コンピュータを使うことが、細分化と雲の再現を可能にした手段だからです。",
    explanation: "by の直後に using という動名詞が続くと『〜することによって』という方法・手段を表します。",
  },
  {
    chapter: "ch18",
    passageId: "passage-wheelchair",
    paragraphIndex: 1,
    target: "where a labor shortage is predicted",
    question: "where が説明している場所はどれか。",
    options: ["nursing care facilities", "Japan’s population", "the ministry", "robot wheelchairs"],
    answer: "nursing care facilities",
    reason: "where の直前にある場所を表す nursing care facilities が先行詞だからです。",
    explanation: "関係副詞 where は in which と置き換えられ、『労働力不足が予想される介護施設で』という意味になります。",
  },
  {
    chapter: "ch18",
    passageId: "passage-wheelchair",
    paragraphIndex: 7,
    target: "so that their users will be able to share information",
    question: "so that 節が表す関係はどれか。",
    options: ["目的（利用者が情報を共有できるように）", "譲歩（共有できるけれど）", "原因（共有できるので）", "比較（共有できるのと同じほど）"],
    answer: "目的（利用者が情報を共有できるように）",
    reason: "車椅子をネットワーク接続する目的が情報共有だからです。",
    explanation: "so that S can/will be able to ... は『Sが…できるように』という目的を表す重要構文です。",
  },
];

function tokenizeEnglishSentence(excerpt: string): string[] {
  return excerpt.trim().split(/\s+/u);
}

function englishOrder(seedKey: string, rng: SeededRandom): GeneratedPracticeQuestion {
  const spec = rng.pick(ENGLISH_ORDER_SOURCES);
  const { excerpt, paragraph, source } = resolveEnglishSource(spec);
  const correctOrder = tokenizeEnglishSentence(excerpt);
  let tokens = rng.shuffle(correctOrder);
  if (tokens.every((token, index) => token === correctOrder[index])) {
    tokens = [...tokens.slice(1), tokens[0] as string];
  }
  return {
    id: `generated-subject-2-english-order-${hashSeed(seedKey).toString(36)}`,
    seed: seedKey,
    subjectId: "subject-2",
    subjectName: SUBJECT_NAME["subject-2"],
    templateId: "english-order",
    category: "本文抜き出し並び替え",
    format: "order",
    title: `${source.chapter?.toUpperCase()} 本文一文並び替え`,
    prompt: `「${paragraph.ja}」という意味になるように、本文から抜き出した単語を正しい順番へ並べ替えてください。`,
    context: `出典：${source.label}｜本文文脈（対象文は伏せています）：${paragraph.en.replace(excerpt, "［この一文を並び替える］")}`,
    tokens,
    answer: excerpt,
    acceptedAnswers: [excerpt],
    steps: [
      "主語と定動詞を先に特定する。",
      "修飾語句・前置詞句・関係節を、説明する語の直後へ置く。",
      "本文の一文と照合し、句読点を含む語順を確認する。",
    ],
    reason: "段落全体ではなく、試験で並び替えにされやすい本文の一文だけを使っています。",
    explanation: `正解は「${excerpt}」。主語・述語を骨格にし、前置詞句や修飾節を元の係り先へ戻すとこの順になります。`,
    source,
    parameters: { chapter: spec.chapter, paragraph: spec.paragraphIndex + 1, tokenCount: correctOrder.length },
    evaluation: { type: "ordered-tokens", canonical: excerpt, correctOrder },
    safety: baseSafety({ notes: ["本文に実在する一文を完全一致で抽出", "単語と句読点の重複を保持"] }),
    generation: "on-demand",
    provenance: "generated-from-in-scope-material",
    difficulty: 3,
    subpartCount: 3,
    sourceBasis: ["英語過去問・本文一文整序", "範囲教材Chapter 14・15・16・18"],
  };
}

function englishTranslation(seedKey: string, rng: SeededRandom): GeneratedPracticeQuestion {
  const spec = rng.pick(ENGLISH_TRANSLATION_SOURCES);
  const { excerpt, paragraph, source } = resolveEnglishSource(spec);
  const minimumKeywordGroups = Math.max(2, Math.ceil(spec.keywordGroups.length * 0.6));
  return {
    id: `generated-subject-2-english-translation-${hashSeed(seedKey).toString(36)}`,
    seed: seedKey,
    subjectId: "subject-2",
    subjectName: SUBJECT_NAME["subject-2"],
    templateId: "english-translation",
    category: "本文抜き出し和訳",
    format: "translation",
    title: `${source.chapter?.toUpperCase()} 本文一文和訳`,
    prompt: excerpt,
    context: "日本語として自然になるように訳してください。語順の直訳でなくても、要点が合えば正解にします。",
    answer: paragraph.ja,
    acceptedAnswers: [paragraph.ja],
    steps: [
      "主語・述語・目的語の骨格を取る。",
      "分詞・関係節・前置詞句がどの語を説明するかを確定する。",
      "最後に日本語として自然な語順へ組み替える。",
    ],
    reason: "本文の主要情報を落とさず訳せていれば、模範解答と完全一致しなくても正解になる採点情報を付けています。",
    explanation: `模範訳は「${paragraph.ja}」。${spec.keywordGroups.map((group) => group.join("／")).join("、")}などの内容語を押さえるのが要点です。`,
    source,
    parameters: { chapter: spec.chapter, paragraph: spec.paragraphIndex + 1, semanticThreshold: minimumKeywordGroups },
    evaluation: {
      type: "japanese-semantic",
      canonical: paragraph.ja,
      accepted: [paragraph.ja],
      keywordGroups: spec.keywordGroups,
      minimumKeywordGroups,
    },
    safety: baseSafety({ notes: ["対象Chapterの一文と既存和訳を同じ段落から取得", "意味採点の必須概念を定義"] }),
    generation: "on-demand",
    provenance: "generated-from-in-scope-material",
    difficulty: 3,
    subpartCount: 3,
    sourceBasis: ["英語過去問・本文抜粋和訳", "範囲教材Chapter 14・15・16・18"],
  };
}

function englishGrammar(seedKey: string, rng: SeededRandom): GeneratedPracticeQuestion {
  const spec = rng.pick(ENGLISH_GRAMMAR_SPECS);
  const { excerpt, source } = resolveEnglishSource(spec);
  if (!excerpt.includes(spec.target)) throw new Error(`文法対象が本文にありません: ${spec.target}`);
  const options = rng.shuffle(spec.options);
  return {
    id: `generated-subject-2-english-grammar-${hashSeed(seedKey).toString(36)}`,
    seed: seedKey,
    subjectId: "subject-2",
    subjectName: SUBJECT_NAME["subject-2"],
    templateId: "english-grammar",
    category: "範囲本文の文法",
    format: "choice",
    title: `${source.chapter?.toUpperCase()} 本文文法`,
    prompt: spec.question,
    context: excerpt,
    options,
    answer: spec.answer,
    acceptedAnswers: [spec.answer],
    steps: [
      `本文中の対象表現「${spec.target}」を確認する。`,
      "直前・直後の語と文全体での働きを確認する。",
      "意味と文法上の形が両方合う選択肢を選ぶ。",
    ],
    reason: spec.reason,
    explanation: spec.explanation,
    source,
    parameters: { chapter: spec.chapter, paragraph: spec.paragraphIndex + 1, target: spec.target },
    evaluation: { type: "choice", canonical: spec.answer, accepted: [spec.answer] },
    safety: baseSafety({ notes: ["本文中に対象表現が存在することを生成時に確認", "正解を含む選択肢だけを提示"] }),
    generation: "on-demand",
    provenance: "generated-from-in-scope-material",
    difficulty: 3,
    subpartCount: 3,
    sourceBasis: ["英語過去問・文法選択", "範囲本文の主要文法"],
  };
}

type PracticeTemplate = {
  id: string;
  subjectId: GeneratedPracticeSubjectId;
  kind: string;
  title: string;
  build: (seedKey: string, rng: SeededRandom) => GeneratedPracticeQuestion;
};

function mechanicalNatural(seedKey: string, rng: SeededRandom) {
  const mass = rng.pick([2, 3, 4, 5, 6, 8]);
  const flexuralRigidity = rng.pick([1600, 2000, 2400, 3000, 3600, 4800]);
  const length = rng.pick([1.2, 1.5, 1.8, 2, 2.4]);
  const stiffness = 3 * flexuralRigidity / length ** 3;
  const omega = Math.sqrt(stiffness / mass);
  const frequency = omega / (2 * 3.14);
  const period = 1 / frequency;
  return numericQuestion(seedKey, {
    subjectId: "subject-3", templateId: "mechanical-natural-frequency", category: "等価剛性・自由振動", title: "片持ちはり支持質量の固有振動",
    prompt: String.raw`はりを等価ばねへ置換し、\(k\)、\(\omega_n\)、\(f_n\)、\(T_n\)を順に求めよ。解答欄には最後に求める\(T_n\)を入力する。`,
    context: String.raw`先端に質量 \(m=${mass}\,\mathrm{kg}\) を持つ長さ \(l=${length}\,\mathrm m\) の片持ちはり。曲げ剛性は \(EI=${flexuralRigidity}\,\mathrm{N\,m^2}\)。はりの質量は無視する。`,
    answerValue: period, digits: 5, tolerance: 0.001, unit: "s", requireUnit: true,
    acceptedUnitScales: { s: 1, ms: 0.001 },
    formula: "\\begin{aligned}k&=\\frac{3EI}{l^3}\\\\\\omega_n&=\\sqrt{\\frac{k}{m}}\\\\f_n&=\\frac{\\omega_n}{2\\pi}\\\\T_n&=\\frac{1}{f_n}\\end{aligned}",
    steps: [
      `\\(k=\\frac{3(${flexuralRigidity})}{${length}^3}\\approx${formatNumber(stiffness, 4)}\\,\\mathrm{N/m}\\)`,
      `\\(\\omega_n=\\sqrt{\\frac{${formatNumber(stiffness, 4)}}{${mass}}}\\approx${formatNumber(omega, 5)}\\,\\mathrm{rad/s}\\)`,
      `\\(f_n=\\frac{${formatNumber(omega, 5)}}{2\\times3.14}\\approx${formatNumber(frequency, 5)}\\,\\mathrm{Hz}\\)`,
      `\\(T_n=\\frac{1}{${formatNumber(frequency, 5)}}\\approx${formatNumber(period, 5)}\\,\\mathrm s\\)`,
    ],
    reason: "範囲プリント4枚と同じく、構造物の静たわみから等価剛性を作り、振動系へ置換する必要があります。",
    explanation: `途中値はωn=${formatNumber(omega, 4)} rad/sで、最後に求める周期はTn=${formatNumber(period, 5)} sです。kを直接与えず、はりの剛性から周期まで通す本番水準の連続計算です。`,
    source: rangeSource("機械力学範囲・片持ちはり等価剛性と不減衰振動", [1, 2, 4]),
    parameters: { mass, flexuralRigidity, length, stiffness, omega, frequency, period },
    safety: baseSafety({ finiteValues: [mass, flexuralRigidity, length, stiffness, omega, frequency, period], denominators: [length ** 3, mass, 2 * 3.14, frequency], radicands: [stiffness / mass] }),
    visual: { type: "mechanical-dynamics", kind: "cantilever-mass" }, difficulty: 3, subpartCount: 4,
    sourceBasis: ["範囲ZIP p.4の片持ちはり等価剛性", "範囲ZIP p.1〜2の固有角振動数・周期"],
  });
}

function mechanicalSeries(seedKey: string, rng: SeededRandom) {
  const k1 = rng.pick([300, 400, 500, 600, 800]);
  const k2 = rng.pick([200, 300, 400, 600]);
  const k3 = rng.pick([100, 200, 300, 500]);
  const mass = rng.pick([2, 3, 4, 5, 6]);
  const parallel = k2 + k3;
  const denominator = k1 + parallel;
  const equivalent = k1 * parallel / denominator;
  const omega = Math.sqrt(equivalent / mass);
  const period = 2 * 3.14 / omega;
  return numericQuestion(seedKey, {
    subjectId: "subject-3", templateId: "mechanical-series-springs", category: "複合ばね・自由振動", title: "直列・並列複合ばねの固有振動",
    prompt: String.raw`接続図から並列部\(k_p\)、直列合成\(k_{eq}\)、固有角振動数\(\omega_n\)、周期\(T_n\)を順に求めよ。解答欄には最後に求める\(T_n\)を入力する。`,
    context: String.raw`ばね \(k_1=${k1}\,\mathrm{N/m}\) と、並列接続した \(k_2=${k2}\,\mathrm{N/m}\)、\(k_3=${k3}\,\mathrm{N/m}\) が直列で、質量 \(m=${mass}\,\mathrm{kg}\) を支持する。`,
    answerValue: period, digits: 5, tolerance: 0.001, unit: "s", requireUnit: true,
    acceptedUnitScales: { s: 1, ms: 0.001 },
    formula: "\\begin{aligned}k_p&=k_2+k_3\\\\k_{eq}&=\\frac{k_1k_p}{k_1+k_p}\\\\\\omega_n&=\\sqrt{\\frac{k_{eq}}{m}}\\\\T_n&=\\frac{2\\pi}{\\omega_n}\\end{aligned}",
    steps: [
      `\\(k_p=${k2}+${k3}=${parallel}\\,\\mathrm{N/m}\\)`,
      `\\(k_{eq}=\\frac{${k1}(${parallel})}{${k1}+${parallel}}\\approx${formatNumber(equivalent, 4)}\\,\\mathrm{N/m}\\)`,
      `\\(\\omega_n=\\sqrt{\\frac{${formatNumber(equivalent, 4)}}{${mass}}}\\approx${formatNumber(omega, 5)}\\,\\mathrm{rad/s}\\)`,
      `\\(T_n=\\frac{2\\times3.14}{${formatNumber(omega, 5)}}\\approx${formatNumber(period, 5)}\\,\\mathrm s\\)`,
    ],
    reason: "図の内側から接続を簡単化しないと、並列和と直列積和を取り違えるためです。",
    explanation: `等価剛性${formatNumber(equivalent, 4)} N/m、固有角振動数${formatNumber(omega, 4)} rad/sを経て、最後の周期は${formatNumber(period, 5)} sです。`,
    source: rangeSource("機械力学範囲・複合ばね", [3, 4, 5]),
    parameters: { k1, k2, k3, mass, parallel, equivalent, omega, period },
    safety: baseSafety({ finiteValues: [k1, k2, k3, mass, parallel, equivalent, omega, period], denominators: [denominator, mass, omega], radicands: [equivalent / mass] }),
    visual: { type: "mechanical-dynamics", kind: "series-parallel-chain" }, difficulty: 3, subpartCount: 4,
    sourceBasis: ["範囲ZIP p.5の直列・並列・複合ばね", "範囲ZIP p.1〜3の固有振動"],
  });
}

function mechanicalDamping(seedKey: string, rng: SeededRandom) {
  const mass = rng.pick([2, 4, 5, 8, 10]);
  const naturalOmega = rng.pick([10, 12, 15, 20, 25]);
  const targetZeta = rng.pick([0.08, 0.1, 0.15, 0.2, 0.25]);
  const stiffness = mass * naturalOmega ** 2;
  const damping = 2 * targetZeta * mass * naturalOmega;
  const critical = 2 * Math.sqrt(mass * stiffness);
  const zeta = damping / critical;
  const dampedOmega = naturalOmega * Math.sqrt(1 - zeta ** 2);
  const x0 = rng.pick([10, 15, 20, 25]) / 1000;
  const v0 = rng.pick([0, 0.05, 0.1, 0.15]);
  const c2 = (v0 + zeta * naturalOmega * x0) / dampedOmega;
  return numericQuestion(seedKey, {
    subjectId: "subject-3", templateId: "mechanical-damping-ratio", category: "粘性減衰・初期値応答", title: "減衰分類から不足減衰解の係数まで",
    prompt: String.raw`\(c_c,\zeta,\omega_n,\omega_d\)を求めて応答を分類し、初期条件から不足減衰解の係数\(C_2\)まで計算せよ。解答欄には最後に求める\(C_2\)を入力する。`,
    context: String.raw`\(m=${mass}\,\mathrm{kg}\)、\(k=${stiffness}\,\mathrm{N/m}\)、\(c=${formatNumber(damping, 3)}\,\mathrm{N\,s/m}\)、\(x(0)=${formatNumber(x0 * 1000, 1)}\,\mathrm{mm}\)、\(\dot{x}(0)=${v0}\,\mathrm{m/s}\)。`,
    answerValue: c2, digits: 7, tolerance: 0.00002, unit: "m", requireUnit: true, acceptedUnitScales: { m: 1, mm: 0.001 },
    formula: "\\begin{aligned}c_c&=2\\sqrt{mk}\\\\\\zeta&=\\frac{c}{c_c}\\\\\\omega_d&=\\sqrt{\\frac{k}{m}}\\sqrt{1-\\zeta^2}\\\\C_2&=\\frac{v_0+\\zeta\\omega_nx_0}{\\omega_d}\\end{aligned}",
    steps: [
      `\\(c_c=2\\sqrt{${mass}(${stiffness})}=${formatNumber(critical, 4)}\\,\\mathrm{N\\,s/m}\\)`,
      `\\(\\zeta=\\frac{${formatNumber(damping, 3)}}{${formatNumber(critical, 4)}}=${formatNumber(zeta, 5)}\\)、\\(0<\\zeta<1\\)なので不足減衰`,
      `\\(\\omega_n=${naturalOmega}\\,\\mathrm{rad/s}\\)、\\(\\omega_d\\approx${formatNumber(dampedOmega, 5)}\\,\\mathrm{rad/s}\\)`,
      `\\(x_0=${formatNumber(x0, 5)}\\,\\mathrm m\\)として \\(C_2\\approx${formatNumber(c2, 7)}\\,\\mathrm m\\)`,
    ],
    reason: "本番では減衰比だけで終わらず、応答分類と初期値を入れた解の係数まで連続して問われます。",
    explanation: `減衰比は${formatNumber(zeta, 4)}で不足減衰。途中のωdを保持して、最後にC2=${formatNumber(c2, 7)} mまで求めます。丸めは最後に行います。`,
    source: rangeSource("機械力学範囲・粘性減衰と初期条件", [6, 7, 10, 13, 14]),
    parameters: { mass, stiffness, damping, critical, zeta, naturalOmega, dampedOmega, x0, v0, c2 },
    safety: baseSafety({ finiteValues: [mass, stiffness, damping, critical, zeta, naturalOmega, dampedOmega, x0, v0, c2], denominators: [critical, mass, dampedOmega], radicands: [mass * stiffness, 1 - zeta ** 2] }),
    visual: { type: "mechanical-dynamics", kind: "damped-spring-mass" }, difficulty: 3, subpartCount: 4,
    sourceBasis: ["範囲ZIP p.6〜7の減衰分類", "範囲ZIP p.10・13・14の不足減衰初期値演習"],
  });
}

function mechanicalPendulum(seedKey: string, rng: SeededRandom) {
  const cycles = rng.pick([8, 10, 12, 15, 20]);
  const period = rng.pick([1.2, 1.4, 1.6, 1.8, 2, 2.2]);
  const totalTime = cycles * period;
  const gravity = 9.8;
  const pi = 3.14;
  const length = gravity * period ** 2 / (4 * pi ** 2);
  const omega = 2 * pi / period;
  return numericQuestion(seedKey, {
    subjectId: "subject-3", templateId: "mechanical-pendulum-length", category: "単振り子・測定値処理", title: "複数周期の測定から振り子長さを逆算",
    prompt: String.raw`測定値から1周期を求め、\(\omega_n\)と振り子長さ\(l\)を逆算せよ。解答欄には最後に求める\(l\)を入力する。`,
    context: `${cycles}周期に要した時間は${formatNumber(totalTime, 2)} s。g=9.80 m/s²、π=3.14とする。`,
    answerValue: length, digits: 4, tolerance: 0.002, unit: "m", requireUnit: true, acceptedUnitScales: { m: 1, mm: 0.001 },
    formula: "\\begin{aligned}T&=\\frac{t_n}{n}\\\\\\omega_n&=\\frac{2\\pi}{T}\\\\l&=\\frac{gT^2}{4\\pi^2}\\end{aligned}",
    steps: [
      `\\(T=\\frac{${formatNumber(totalTime, 2)}}{${cycles}}=${formatNumber(period, 4)}\\,\\mathrm s\\)`,
      `\\(\\omega_n=\\frac{2\\times3.14}{${formatNumber(period, 4)}}\\approx${formatNumber(omega, 5)}\\,\\mathrm{rad/s}\\)`,
      `\\(l=\\frac{9.80(${formatNumber(period, 4)})^2}{4(3.14)^2}\\approx${formatNumber(length, 5)}\\,\\mathrm m\\)`,
      "複数周期の総時間をそのまま周期式へ入れていないことを照査する。",
    ],
    reason: "実験値は複数周期の時間で与えられるため、まず1周期へ直す必要があります。",
    explanation: `1周期${formatNumber(period, 3)} sから、長さは${formatNumber(length, 4)} mです。`,
    source: rangeSource("機械力学過去問・単振り子", [4]),
    parameters: { cycles, period, totalTime, gravity, pi, length, omega },
    safety: baseSafety({ finiteValues: [cycles, period, totalTime, gravity, pi, length, omega], denominators: [cycles, period, 4 * pi ** 2] }),
    visual: { type: "mechanical-dynamics", kind: "simple-pendulum" }, difficulty: 3, subpartCount: 4,
    sourceBasis: ["過去問の単振り子", "範囲ZIP p.4の周期と長さ"],
  });
}

function mechanicalDecrement(seedKey: string, rng: SeededRandom) {
  const cycles = rng.pick([4, 5, 6, 8, 10]);
  const remaining = rng.pick([0.8, 0.6, 0.5, 0.4, 0.25]);
  const dampedPeriod = rng.pick([0.4, 0.5, 0.8, 1, 1.2]);
  const mass = rng.pick([2, 3, 4, 5, 8]);
  const logArgument = 1 / remaining;
  const decrement = Math.log(logArgument) / cycles;
  const zeta = decrement / Math.sqrt(4 * 3.14 ** 2 + decrement ** 2);
  const dampedOmega = 2 * 3.14 / dampedPeriod;
  const naturalOmega = dampedOmega / Math.sqrt(1 - zeta ** 2);
  const stiffness = mass * naturalOmega ** 2;
  return numericQuestion(seedKey, {
    subjectId: "subject-3", templateId: "mechanical-log-decrement", category: "波形読解・系同定", title: "減衰波形から減衰比・ばね定数を同定",
    prompt: String.raw`波形から\(\delta,\zeta,\omega_d,\omega_n\)を順に求め、ばね定数\(k\)を同定せよ。解答欄には最後に求める\(k\)を入力する。`,
    context: `${cycles}周期後の同符号ピークは初期振幅の${remaining * 100}%、減衰周期Td=${dampedPeriod} s、質量m=${mass} kg。π=3.14。`,
    answerValue: stiffness, digits: 3, tolerance: Math.max(0.2, stiffness * 0.005), unit: "N/m", requireUnit: true, acceptedUnitScales: { "N/m": 1, "kN/m": 1000 },
    formula: "\\begin{aligned}\\delta&=\\frac{1}{n}\\ln\\!\\left(\\frac{x_i}{x_{i+n}}\\right)\\\\\\zeta&=\\frac{\\delta}{\\sqrt{4\\pi^2+\\delta^2}}\\\\\\omega_d&=\\frac{2\\pi}{T_d}\\\\\\omega_n&=\\frac{\\omega_d}{\\sqrt{1-\\zeta^2}}\\\\k&=m\\omega_n^2\\end{aligned}",
    steps: [
      `\\(\\delta=\\frac{1}{${cycles}}\\ln\\!\\left(\\frac{1}{${remaining}}\\right)\\approx${formatNumber(decrement, 6)}\\)`,
      `\\(\\zeta=\\frac{${formatNumber(decrement, 6)}}{\\sqrt{4(3.14)^2+${formatNumber(decrement, 6)}^2}}\\approx${formatNumber(zeta, 7)}\\)`,
      `\\(\\omega_d=\\frac{2(3.14)}{${dampedPeriod}}\\approx${formatNumber(dampedOmega, 5)}\\,\\mathrm{rad/s}\\)`,
      `\\(\\omega_n=\\frac{${formatNumber(dampedOmega, 5)}}{\\sqrt{1-${formatNumber(zeta, 7)}^2}}\\approx${formatNumber(naturalOmega, 5)}\\,\\mathrm{rad/s}\\)`,
      `\\(k=${mass}(${formatNumber(naturalOmega, 5)})^2\\approx${formatNumber(stiffness, 3)}\\,\\mathrm{N/m}\\)`,
    ],
    reason: "範囲演習と同じく、波形のピーク比と周期から未知の系パラメータを逆算する問題です。",
    explanation: `最終的なばね定数は${formatNumber(stiffness, 3)} N/m。近似式ではなくδからζの厳密式を使います。`,
    source: rangeSource("機械力学範囲・対数減衰率と系同定", [11, 12, 13, 14]),
    parameters: { cycles, remaining, dampedPeriod, mass, logArgument, decrement, zeta, dampedOmega, naturalOmega, stiffness },
    safety: baseSafety({ finiteValues: [cycles, remaining, dampedPeriod, mass, logArgument, decrement, zeta, dampedOmega, naturalOmega, stiffness], denominators: [cycles, remaining, dampedPeriod, Math.sqrt(4 * 3.14 ** 2 + decrement ** 2), Math.sqrt(1 - zeta ** 2)], radicands: [4 * 3.14 ** 2 + decrement ** 2, 1 - zeta ** 2], logArguments: [logArgument] }),
    visual: { type: "mechanical-dynamics", kind: "amplitude-decay" }, difficulty: 3, subpartCount: 5,
    sourceBasis: ["範囲ZIP p.11〜14の波形読解", "対数減衰率からばね定数までの演習"],
  });
}
function mechanicalLeverSpringDamper(seedKey: string, rng: SeededRandom) {
  const mass = rng.pick([2, 2.5, 3, 4]);
  const stiffness = rng.pick([400, 500, 600, 800]);
  const damping = rng.pick([120, 140, 160, 180]);
  const massArm = rng.pick([0.25, 0.3, 0.4, 0.5]);
  const springArm = rng.pick([0.6, 0.7, 0.8, 1]);
  const rotationalInertia = mass * massArm ** 2;
  const rotationalDamping = damping * massArm ** 2;
  const rotationalStiffness = stiffness * springArm ** 2;
  const naturalOmega = Math.sqrt(rotationalStiffness / rotationalInertia);
  const dampingRatio = rotationalDamping / (2 * Math.sqrt(rotationalInertia * rotationalStiffness));
  const criticalMassArm = 2 * springArm * Math.sqrt(mass * stiffness) / damping;
  const responseType = dampingRatio < 1 ? "不足減衰" : dampingRatio > 1 ? "過減衰" : "臨界減衰";
  return numericQuestion(seedKey, {
    subjectId: "subject-3",
    templateId: "mechanical-lever-spring-damper",
    category: "回転1自由度系・過去問大問6",
    title: "レバー・ばね・ダンパ系の運動方程式から臨界条件まで",
    prompt: String.raw`回転慣性\(J\)、回転減衰\(C_\theta\)、回転剛性\(K_\theta\)を求め、運動方程式を立てる。続けて固有角振動数\(\omega_n\)と減衰比\(\zeta\)を計算して応答を分類し、\(\zeta=1\)となる質点・ダンパの臨界作用腕\(r_c\)を求めよ。解答欄には最後に求める\(r_c\)を入力する。`,
    context: String.raw`図の質量なしレバーは左端ピン支持。質点\(m=${mass.toFixed(2)}\,\mathrm{kg}\)とダンパ\(c=${damping.toFixed(1)}\,\mathrm{N\,s/m}\)の作用腕は\(r=${massArm.toFixed(3)}\,\mathrm m\)、ばね\(k=${stiffness.toFixed(0)}\,\mathrm{N/m}\)の作用腕は\(l=${springArm.toFixed(3)}\,\mathrm m\)。微小角\(\theta\)とし、作用腕は正とする。`,
    answerValue: criticalMassArm,
    digits: 4,
    tolerance: 0.002,
    unit: "m",
    requireUnit: true,
    acceptedUnitScales: { m: 1, cm: 0.01, mm: 0.001 },
    formula: "\\begin{aligned}J&=mr^2\\\\C_\\theta&=cr^2\\\\K_\\theta&=kl^2\\\\mr^2\\ddot\\theta+cr^2\\dot\\theta+kl^2\\theta&=0\\\\\\omega_n&=\\sqrt{\\frac{K_\\theta}{J}}=\\frac{l}{r}\\sqrt{\\frac{k}{m}}\\\\\\zeta&=\\frac{C_\\theta}{2\\sqrt{JK_\\theta}}=\\frac{cr}{2l\\sqrt{mk}}\\\\r_c&=\\frac{2l\\sqrt{mk}}{c}\\end{aligned}",
    steps: [
      `\\(J=${mass.toFixed(2)}(${massArm.toFixed(3)})^2=${formatNumber(rotationalInertia, 6)}\\,\\mathrm{kg\\,m^2}\\)` ,
      `\\(C_\\theta=${damping.toFixed(1)}(${massArm.toFixed(3)})^2=${formatNumber(rotationalDamping, 6)}\\,\\mathrm{N\\,m\\,s/rad}\\)` ,
      `\\(K_\\theta=${stiffness.toFixed(0)}(${springArm.toFixed(3)})^2=${formatNumber(rotationalStiffness, 6)}\\,\\mathrm{N\\,m/rad}\\)` ,
      `\\(${formatNumber(rotationalInertia, 6)}\\ddot\\theta+${formatNumber(rotationalDamping, 6)}\\dot\\theta+${formatNumber(rotationalStiffness, 6)}\\theta=0\\)` ,
      `\\(\\omega_n=\\sqrt{\\frac{${formatNumber(rotationalStiffness, 6)}}{${formatNumber(rotationalInertia, 6)}}}\\approx${formatNumber(naturalOmega, 6)}\\,\\mathrm{rad/s}\\)` ,
      `\\(\\zeta=\\frac{${formatNumber(rotationalDamping, 6)}}{2\\sqrt{${formatNumber(rotationalInertia, 6)}(${formatNumber(rotationalStiffness, 6)})}}\\approx${formatNumber(dampingRatio, 6)}\\) より${responseType}` ,
      `\\(r_c=\\frac{2(${springArm.toFixed(3)})\\sqrt{${mass.toFixed(2)}(${stiffness.toFixed(0)})}}{${damping.toFixed(1)}}\\approx${formatNumber(criticalMassArm, 6)}\\,\\mathrm m\\)` ,
    ],
    reason: "実物過去問の大問6と同じく、並進要素を作用腕の二乗で回転係数へ換算し、同じ運動方程式から固有振動と臨界減衰まで連続して解きます。",
    explanation: `回転係数を作ってから計算すると、ωn=${formatNumber(naturalOmega, 4)} rad/s、ζ=${formatNumber(dampingRatio, 4)}（${responseType}）、臨界作用腕は${formatNumber(criticalMassArm, 4)} mです。rとlを入れ替えないことが要点です。`,
    source: rangeSource("機械力学過去問.pdf 大問6＋範囲ZIP p.15", [15]),
    parameters: { mass, stiffness, damping, massArm, springArm, rotationalInertia, rotationalDamping, rotationalStiffness, naturalOmega, dampingRatio, criticalMassArm, responseType },
    safety: baseSafety({
      finiteValues: [mass, stiffness, damping, massArm, springArm, rotationalInertia, rotationalDamping, rotationalStiffness, naturalOmega, dampingRatio, criticalMassArm],
      denominators: [massArm, rotationalInertia, 2 * Math.sqrt(rotationalInertia * rotationalStiffness), 2 * springArm * Math.sqrt(mass * stiffness), damping],
      radicands: [rotationalStiffness / rotationalInertia, rotationalInertia * rotationalStiffness, mass * stiffness],
      notes: ["作用腕・質量・ばね定数・減衰係数は正", "実物過去問大問6と範囲ZIP p.15の式だけを使用"],
    }),
    visual: { type: "mechanical-dynamics", kind: "pinned-beam" },
    difficulty: 3,
    subpartCount: 7,
    sourceBasis: ["実物過去問 大問6（レバー・ばね・ダンパ系）", "範囲ZIP p.15の回転1自由度系・作用腕二乗換算"],
  });
}
function mechanicalLaplaceStepResponse(seedKey: string, rng: SeededRandom) {
  const poleA = rng.pick([1, 2, 3, 4]);
  const poleB = poleA + rng.pick([1, 2, 3]);
  const evaluationTime = rng.pick([0.5, 0.8, 1, 1.2, 1.5, 2]);
  const gain = poleA * poleB;
  const coefficientA = -poleB / (poleB - poleA);
  const coefficientB = poleA / (poleB - poleA);
  const response = 1 + coefficientA * Math.exp(-poleA * evaluationTime) + coefficientB * Math.exp(-poleB * evaluationTime);
  return numericQuestion(seedKey, {
    subjectId: "subject-3",
    templateId: "mechanical-laplace-step-response",
    category: "ラプラス変換・3極部分分数",
    title: "単位ステップ入力から時刻指定応答まで",
    prompt: String.raw`単位ステップ入力から\(Y(s)\)を作り、3項へ部分分数分解する。逆ラプラス変換で\(y(t)\)を求め、最後に\(y(t_0)\)を計算せよ。解答欄には\(y(t_0)\)を入力する。`,
    context: String.raw`伝達関数は\(G(s)=\frac{${gain}}{(s+${poleA})(s+${poleB})}\)、入力は\(U(s)=\frac{1}{s}\)、評価時刻は\(t_0=${evaluationTime}\,\mathrm s\)。初期値は0とする。`,
    answerValue: response,
    digits: 6,
    tolerance: 0.001,
    formula: `\\begin{aligned}Y(s)&=G(s)U(s)=\\frac{${gain}}{s(s+${poleA})(s+${poleB})}\\\\&=\\frac{1}{s}-\\frac{${poleB}}{${poleB - poleA}}\\frac{1}{s+${poleA}}+\\frac{${poleA}}{${poleB - poleA}}\\frac{1}{s+${poleB}}\\\\y(t)&=1-\\frac{${poleB}}{${poleB - poleA}}e^{-${poleA}t}+\\frac{${poleA}}{${poleB - poleA}}e^{-${poleB}t}\\end{aligned}`,
    steps: [
      `\\(Y(s)=\\frac{${gain}}{s(s+${poleA})(s+${poleB})}\\) とし、極は \\(0,-${poleA},-${poleB}\\) と整理する。`,
      `\\(Y(s)=\\frac{1}{s}${coefficientA < 0 ? "" : "+"}${formatNumber(coefficientA, 6)}\\frac{1}{s+${poleA}}+${formatNumber(coefficientB, 6)}\\frac{1}{s+${poleB}}\\) と部分分数分解する。`,
      `\\(y(t)=1${coefficientA < 0 ? "" : "+"}${formatNumber(coefficientA, 6)}e^{-${poleA}t}+${formatNumber(coefficientB, 6)}e^{-${poleB}t}\\) と逆変換する。`,
      `\\(y(${evaluationTime})=1${coefficientA < 0 ? "" : "+"}${formatNumber(coefficientA, 6)}e^{-${poleA}(${evaluationTime})}+${formatNumber(coefficientB, 6)}e^{-${poleB}(${evaluationTime})}\\approx${formatNumber(response, 8)}\\) を得る。`,
    ],
    reason: "入力の1/sを掛けて3極へ分解し、逆変換後に時刻を代入するまでを一続きで問うため、単発の変換公式だけでは解けません。",
    explanation: `定常項1と2つの指数過渡項を合わせると、最後の応答はy(${evaluationTime})=${formatNumber(response, 6)}です。入力の1/sと各係数の符号を確認します。`,
    source: rangeSource("機械力学範囲ZIP p.8〜9・単位ステップ応答", [8, 9]),
    parameters: { poleA, poleB, evaluationTime, gain, coefficientA, coefficientB, response },
    safety: baseSafety({
      finiteValues: [poleA, poleB, evaluationTime, gain, coefficientA, coefficientB, response],
      denominators: [poleB - poleA],
      notes: ["2つの実極は相異なり、いずれも安定側", "範囲ZIP p.8〜9の部分分数と逆変換だけを使用"],
    }),
    difficulty: 3,
    subpartCount: 4,
    sourceBasis: ["範囲ZIP p.8の伝達関数と単位ステップ", "範囲ZIP p.8〜9の3項部分分数・逆ラプラス変換"],
  });
}
function thermoIdealGas(seedKey: string, rng: SeededRandom) {
  const p1 = rng.pick([100, 120, 150, 180, 200]);
  const v1 = rng.pick([0.2, 0.3, 0.4, 0.5, 0.8]);
  const t1 = rng.pick([300, 320, 350, 400]);
  const exponent = rng.pick([1.2, 1.3, 1.5, 1.6]);
  const volumeRatio = rng.pick([1.5, 2, 2.5, 3]);
  const v2 = v1 * volumeRatio;
  const gasConstant = 0.287;
  const mass = p1 * v1 / (gasConstant * t1);
  const p2 = p1 * (v1 / v2) ** exponent;
  const t2 = t1 * (v1 / v2) ** (exponent - 1);
  const work = (p2 * v2 - p1 * v1) / (1 - exponent);
  return numericQuestion(seedKey, {
    subjectId: "subject-4", templateId: "thermo-ideal-gas", category: "理想気体・ポリトロープ変化", title: "状態量からポリトロープ仕事まで",
    prompt: "質量m、終状態p₂・T₂、境界仕事Wを順に求めよ。解答欄には終圧力p₂を入力する。",
    context: String.raw`空気が (p_1=${p1},mathrm{kPa},,V_1=${v1},mathrm{m^3},,T_1=${t1},mathrm K) から、(n=${exponent}) のポリトロープ過程で (V_2=${formatNumber(v2, 3)},mathrm{m^3}) まで膨張する。(R=0.287,mathrm{kJ/(kg,K)})。`,
    answerValue: p2, digits: 3, tolerance: 0.2, unit: "kPa", acceptedUnitScales: { kPa: 1, Pa: 0.001 },
    formula: "\\begin{aligned}m&=\\frac{p_1V_1}{RT_1}\\\\p_1V_1^n&=p_2V_2^n\\\\\\frac{T_2}{T_1}&=\\left(\\frac{V_1}{V_2}\\right)^{n-1}\\\\W&=\\frac{p_2V_2-p_1V_1}{1-n}\\end{aligned}",
    steps: [
      `\\(m=\\frac{${p1}(${v1})}{0.287(${t1})}\\approx${formatNumber(mass, 5)}\\,\\mathrm{kg}\\)`,
      `\\(p_2=${p1}\\left(\\frac{${v1}}{${formatNumber(v2, 3)}}\\right)^{${exponent}}\\approx${formatNumber(p2, 4)}\\,\\mathrm{kPa}\\)`,
      `\\(T_2=${t1}\\left(\\frac{${v1}}{${formatNumber(v2, 3)}}\\right)^{${formatNumber(exponent - 1, 2)}}\\approx${formatNumber(t2, 3)}\\,\\mathrm K\\)`,
      `\\(W=\\frac{${formatNumber(p2, 4)}(${formatNumber(v2, 3)})-${p1}(${v1})}{1-${exponent}}\\approx${formatNumber(work, 4)}\\,\\mathrm{kJ}\\)`,
    ],
    reason: "状態方程式、ポリトロープ関係、仕事式を同じ二状態へ一貫して適用します。",
    explanation: `終圧力は${formatNumber(p2, 3)} kPa、膨張仕事は${formatNumber(work, 3)} kJ。kPa·m³=kJなので単位を途中で崩しません。`,
    source: rangeSource("熱力学範囲・理想気体とポリトロープ変化", [1, 2, 3]),
    parameters: { p1, v1, t1, exponent, volumeRatio, v2, gasConstant, mass, p2, t2, work },
    safety: baseSafety({ finiteValues: [p1, v1, t1, exponent, volumeRatio, v2, gasConstant, mass, p2, t2, work], denominators: [gasConstant * t1, v2, 1 - exponent] }),
    visual: { type: "thermodynamics", kind: "pv" }, difficulty: 3, subpartCount: 4,
    sourceBasis: ["範囲ZIPの状態方程式", "範囲ZIPのポリトロープ圧力・温度・仕事"],
  });
}

function thermoAdiabatic(seedKey: string, rng: SeededRandom) {
  const p1 = rng.pick([100, 120, 150]);
  const t1 = rng.pick([280, 300, 320, 350]);
  const v1 = rng.pick([0.3, 0.4, 0.5, 0.8]);
  const pressureRatio = rng.pick([2, 3, 4, 5]);
  const p2 = p1 * pressureRatio;
  const kappa = 1.4;
  const gasConstant = 0.287;
  const cv = 0.718;
  const mass = p1 * v1 / (gasConstant * t1);
  const t2 = t1 * pressureRatio ** ((kappa - 1) / kappa);
  const v2 = v1 * (p1 / p2) ** (1 / kappa);
  const work = mass * cv * (t1 - t2);
  return numericQuestion(seedKey, {
    subjectId: "subject-4", templateId: "thermo-adiabatic-temperature", category: "可逆断熱圧縮", title: "断熱圧縮の状態量・境界仕事",
    prompt: String.raw`質量、終温度、終体積を求め、第一法則から気体がした境界仕事 (W) を計算せよ。解答欄には (W) を入力する。`,
    context: String.raw`空気を (p_1=${p1},mathrm{kPa},,T_1=${t1},mathrm K,,V_1=${v1},mathrm{m^3}) から (p_2=${p2},mathrm{kPa}) まで可逆断熱圧縮する。(R=0.287,,c_v=0.718,mathrm{kJ/(kg,K)},,kappa=1.40)。`,
    answerValue: work, digits: 3, tolerance: 0.3, unit: "kJ", acceptedUnitScales: { kJ: 1, J: 0.001 },
    formula: "\\begin{aligned}m&=\\frac{p_1V_1}{RT_1}\\\\\\frac{T_2}{T_1}&=\\left(\\frac{p_2}{p_1}\\right)^{\\frac{\\kappa-1}{\\kappa}}\\\\\\frac{V_2}{V_1}&=\\left(\\frac{p_1}{p_2}\\right)^{\\frac{1}{\\kappa}}\\\\W&=mc_v(T_1-T_2)\\end{aligned}",
    steps: [
      `\\(m=\\frac{${p1}(${v1})}{0.287(${t1})}\\approx${formatNumber(mass, 5)}\\,\\mathrm{kg}\\)`,
      `\\(T_2=${t1}(${pressureRatio})^{\\frac{0.4}{1.4}}\\approx${formatNumber(t2, 3)}\\,\\mathrm K\\)`,
      `\\(V_2=${v1}\\left(\\frac{1}{${pressureRatio}}\\right)^{\\frac{1}{1.4}}\\approx${formatNumber(v2, 5)}\\,\\mathrm{m^3}\\)`,
      `\\(W=${formatNumber(mass, 5)}(0.718)(${t1}-${formatNumber(t2, 3)})\\approx${formatNumber(work, 4)}\\,\\mathrm{kJ}\\)`,
    ],
    reason: "断熱関係で終状態を決めてから、Q=0の第一法則へつなぐ必要があります。",
    explanation: `圧縮なので気体がした仕事は${formatNumber(work, 3)} kJと負になります。符号と絶対圧力・絶対温度を確認します。`,
    source: rangeSource("熱力学範囲・可逆断熱変化", [1, 2]),
    parameters: { p1, t1, v1, pressureRatio, p2, kappa, gasConstant, cv, mass, t2, v2, work },
    safety: baseSafety({ finiteValues: [p1, t1, v1, pressureRatio, p2, kappa, gasConstant, cv, mass, t2, v2, work], denominators: [gasConstant * t1, p1, p2, kappa] }),
    visual: { type: "thermodynamics", kind: "piston" }, difficulty: 3, subpartCount: 4,
    sourceBasis: ["範囲ZIPの断熱状態関係", "範囲ZIPの断熱仕事・第一法則"],
  });
}

function thermoOtto(seedKey: string, rng: SeededRandom) {
  const compressionRatio = rng.pick([6, 7, 8, 9, 10, 12]);
  const t1 = rng.pick([290, 300, 310, 320]);
  const heatIn = rng.pick([600, 700, 800, 900, 1000]);
  const kappa = 1.4;
  const cv = 0.718;
  const ratioPower = compressionRatio ** (kappa - 1);
  const t2 = t1 * ratioPower;
  const t3 = t2 + heatIn / cv;
  const t4 = t3 / ratioPower;
  const heatOut = cv * (t4 - t1);
  const efficiency = 1 - heatOut / heatIn;
  return numericQuestion(seedKey, {
    subjectId: "subject-4", templateId: "thermo-otto-efficiency", category: "オットーサイクル", title: "4状態温度からオットー効率まで",
    prompt: String.raw`断熱圧縮後 (T_2)、等容加熱後 (T_3)、断熱膨張後 (T_4)、放熱量を求め、熱効率を百分率で答えよ。`,
    context: `空気標準オットーサイクルで圧縮比ε=${compressionRatio}、T1=${t1} K、qin=${heatIn} kJ/kg、cv=${cv} kJ/(kg K)、κ=1.40。`,
    answerValue: efficiency * 100, digits: 2, tolerance: 0.2, unit: "%",
    formula: "\\begin{aligned}T_2&=T_1\\varepsilon^{\\kappa-1}\\\\T_3&=T_2+\\frac{q_{in}}{c_v}\\\\T_4&=\\frac{T_3}{\\varepsilon^{\\kappa-1}}\\\\q_{out}&=c_v(T_4-T_1)\\\\\\eta&=1-\\frac{q_{out}}{q_{in}}\\end{aligned}",
    steps: [
      `\\(T_2=${t1}(${compressionRatio})^{0.4}\\approx${formatNumber(t2, 3)}\\,\\mathrm K\\)`,
      `\\(T_3=${formatNumber(t2, 3)}+\\frac{${heatIn}}{${cv}}\\approx${formatNumber(t3, 3)}\\,\\mathrm K\\)`,
      `\\(T_4=\\frac{${formatNumber(t3, 3)}}{${formatNumber(ratioPower, 5)}}\\approx${formatNumber(t4, 3)}\\,\\mathrm K\\)`,
      `\\(q_{out}=${cv}(${formatNumber(t4, 3)}-${t1})\\approx${formatNumber(heatOut, 3)}\\,\\mathrm{kJ/kg}\\)`,
      `\\(\\eta=1-\\frac{${formatNumber(heatOut, 3)}}{${heatIn}}\\approx${formatNumber(efficiency * 100, 2)}\\%\\)`,
    ],
    reason: "効率公式の一発代入ではなく、P-V線図の4過程に沿って各状態温度と熱量を追います。",
    explanation: `効率は${formatNumber(efficiency * 100, 2)}%。T2〜T4とqoutを残すことで、状態番号の取り違えも確認できます。`,
    source: rangeSource("熱力学範囲＋形式3許可部・オットーサイクル", [4, 5]),
    parameters: { compressionRatio, t1, heatIn, kappa, cv, ratioPower, t2, t3, t4, heatOut, efficiency },
    safety: baseSafety({ finiteValues: [compressionRatio, t1, heatIn, kappa, cv, ratioPower, t2, t3, t4, heatOut, efficiency, efficiency * 100], denominators: [cv, ratioPower, heatIn] }),
    visual: { type: "thermodynamics", kind: "otto-pv" }, difficulty: 3, subpartCount: 5,
    sourceBasis: ["範囲ZIPのオットー4過程", "形式3の今回範囲に含まれるオットー問題"],
  });
}

function thermoCarnot(seedKey: string, rng: SeededRandom) {
  const lowC = rng.pick([20, 27, 40, 50, 80]);
  const highC = lowC + rng.pick([250, 300, 350, 400, 450]);
  const low = lowC + 273;
  const high = highC + 273;
  const heatIn = rng.pick([600, 800, 1000, 1200, 1500]);
  const efficiency = 1 - low / high;
  const heatOut = heatIn * low / high;
  const work = heatIn - heatOut;
  const hotEntropy = -heatIn / high;
  const coldEntropy = heatOut / low;
  return numericQuestion(seedKey, {
    subjectId: "subject-4", templateId: "thermo-carnot-efficiency", category: "カルノーサイクル", title: "温度換算・熱量比・仕事・エントロピー",
    prompt: String.raw`温度をKへ直し、熱効率、放熱量、正味仕事、両熱源のエントロピー変化を求めよ。解答欄には正味仕事を入力する。`,
    context: `高温熱源${highC} ℃、低温熱源${lowC} ℃、1サイクルの受熱量Q1=${heatIn} kJの可逆カルノー熱機関。`,
    answerValue: work, digits: 3, tolerance: 0.3, unit: "kJ", acceptedUnitScales: { kJ: 1, J: 0.001 },
    formula: "\\begin{aligned}\\eta_C&=1-\\frac{T_L}{T_H}\\\\\\frac{Q_2}{Q_1}&=\\frac{T_L}{T_H}\\\\W&=Q_1-Q_2\\\\\\Delta S_H&=-\\frac{Q_1}{T_H},\\quad\\Delta S_L=\\frac{Q_2}{T_L}\\end{aligned}",
    steps: [
      `\\(T_H=${highC}+273=${high}\\,\\mathrm K\\)、\\(T_L=${lowC}+273=${low}\\,\\mathrm K\\)`,
      `\\(\\eta_C=1-\\frac{${low}}{${high}}\\approx${formatNumber(efficiency * 100, 2)}\\%\\)`,
      `\\(Q_2=${heatIn}\\frac{${low}}{${high}}\\approx${formatNumber(heatOut, 3)}\\,\\mathrm{kJ}\\)、\\(W=${heatIn}-Q_2\\approx${formatNumber(work, 3)}\\,\\mathrm{kJ}\\)`,
      `\\(\\Delta S_H\\approx${formatNumber(hotEntropy, 6)}\\,\\mathrm{kJ/K}\\)、\\(\\Delta S_L\\approx${formatNumber(coldEntropy, 6)}\\,\\mathrm{kJ/K}\\)、合計0`,
    ],
    reason: "摂氏温度を効率式へ直接入れず、熱量比・仕事・可逆性の照査まで同じサイクルで行います。",
    explanation: `正味仕事は${formatNumber(work, 3)} kJ。可逆なので熱源の合計エントロピー変化は丸め誤差を除き0です。`,
    source: rangeSource("熱力学範囲＋形式3許可部・カルノーサイクル", [6, 7]),
    parameters: { lowC, highC, low, high, heatIn, efficiency, heatOut, work, hotEntropy, coldEntropy },
    safety: baseSafety({ finiteValues: [lowC, highC, low, high, heatIn, efficiency, heatOut, work, hotEntropy, coldEntropy], denominators: [high, low] }),
    visual: { type: "thermodynamics", kind: "carnot-ts" }, difficulty: 3, subpartCount: 4,
    sourceBasis: ["範囲ZIPのカルノー熱量比・効率", "形式3の今回範囲に含まれるカルノー問題"],
  });
}

function thermoReversedCarnot(seedKey: string, rng: SeededRandom) {
  const highC = 47;
  const lowC = 7;
  const high = highC + 273;
  const low = lowC + 273;
  const refrigerationKcalPerHour = rng.pick([600, 900, 1200, 1500, 1800, 2400]);
  const kcalToKJ = 4.19;
  const refrigerationCapacity = refrigerationKcalPerHour * kcalToKJ / 3600;
  const copR = low / (high - low);
  const copHP = high / (high - low);
  const requiredPower = refrigerationCapacity / copR;
  const rejectedHeatRate = refrigerationCapacity + requiredPower;
  return numericQuestion(seedKey, {
    subjectId: "subject-4",
    templateId: "thermo-reversed-carnot",
    category: "逆カルノー冷凍機・ヒートポンプ",
    title: "47 ℃／7 ℃逆カルノーのCOPと必要動力",
    prompt: String.raw`両熱源温度をKへ直し、冷凍機の成績係数 \(\mathrm{COP}_R\)、ヒートポンプの成績係数 \(\mathrm{COP}_{HP}\)、冷凍能力 \(\dot Q_L\)、必要動力 \(\dot W\) を順に求めよ。解答欄には必要動力をkWで入力すること。`,
    context: `高温側47 ℃、低温側7 ℃で作動する逆カルノー冷凍機が、低温室から毎時${refrigerationKcalPerHour} kcalの熱を取り除く。1 kcal=4.19 kJとする。`,
    answerValue: requiredPower,
    digits: 4,
    tolerance: 0.002,
    unit: "kW",
    requireUnit: true,
    acceptedUnitScales: { kW: 1, W: 0.001 },
    formula: "\\begin{aligned}T_H&=t_H+273,\\quad T_L=t_L+273\\\\\\mathrm{COP}_R&=\\frac{\\dot Q_L}{\\dot W}=\\frac{T_L}{T_H-T_L}\\\\\\mathrm{COP}_{HP}&=\\frac{\\dot Q_H}{\\dot W}=\\frac{T_H}{T_H-T_L}=\\mathrm{COP}_R+1\\\\\\dot Q_L&=q_L\\frac{4.19}{3600}\\\\\\dot W&=\\frac{\\dot Q_L}{\\mathrm{COP}_R},\\quad\\dot Q_H=\\dot Q_L+\\dot W\\end{aligned}",
    steps: [
      `\\(T_H=${highC}+273=${high}\\,\\mathrm K\\)、\\(T_L=${lowC}+273=${low}\\,\\mathrm K\\)`,
      `\\(\\mathrm{COP}_R=\\frac{${low}}{${high}-${low}}=${formatNumber(copR, 3)}\\)、\\(\\mathrm{COP}_{HP}=\\frac{${high}}{${high}-${low}}=${formatNumber(copHP, 3)}\\)`,
      `\\(\\dot Q_L=${refrigerationKcalPerHour}\\frac{4.19}{3600}\\approx${formatNumber(refrigerationCapacity, 4)}\\,\\mathrm{kW}\\)`,
      `\\(\\dot W=\\frac{${formatNumber(refrigerationCapacity, 4)}}{${formatNumber(copR, 3)}}\\approx${formatNumber(requiredPower, 4)}\\,\\mathrm{kW}\\)、\\(\\dot Q_H\\approx${formatNumber(rejectedHeatRate, 4)}\\,\\mathrm{kW}\\)`,
    ],
    reason: "追加範囲p.9と同じく、摂氏から絶対温度への換算、逆カルノーCOP、kcal/hからkWへの換算、熱収支を一続きで使う問題です。",
    explanation: `必要動力は${formatNumber(requiredPower, 4)} kWです。冷凍機は低温側から熱をくみ上げるため、\\(\\mathrm{COP}_R=\\frac{\\dot Q_L}{\\dot W}\\) を使い、ヒートポンプのCOPとは1だけ違います。`,
    source: rangeSource("熱力学追加範囲 p.9・逆カルノー冷凍機（PXL_20260722_114536629.MP.jpg）", [9]),
    parameters: { highC, lowC, high, low, refrigerationKcalPerHour, kcalToKJ, refrigerationCapacity, copR, copHP, requiredPower, rejectedHeatRate },
    safety: baseSafety({
      finiteValues: [highC, lowC, high, low, refrigerationKcalPerHour, kcalToKJ, refrigerationCapacity, copR, copHP, requiredPower, rejectedHeatRate],
      denominators: [3600, high - low, copR],
      notes: ["絶対温度は正", "T_H>T_L", "kcal/hとkWの換算係数は正", "COP_R>0"],
    }),
    difficulty: 3,
    subpartCount: 4,
    sourceBasis: [
      "熱力学追加範囲 p.9（PXL_20260722_114536629.MP.jpg）",
      "同ページ：47 ℃／7 ℃、1200 kcal/hの逆カルノー冷凍機例題",
    ],
  });
}

function smartStep(seedKey: string, rng: SeededRandom) {
  const gain = rng.pick([2, 3, 4, 5, 8, 10]);
  const timeConstant = rng.pick([0.5, 1, 1.5, 2, 2.5, 3]);
  const multiple = rng.pick([2, 3, 4]);
  const time = timeConstant * multiple;
  const output = gain * (1 - Math.exp(-multiple));
  const pole = -1 / timeConstant;
  const reachedPercent = (1 - Math.exp(-multiple)) * 100;
  return numericQuestion(seedKey, {
    subjectId: "subject-6",
    templateId: "smart-first-order-step",
    category: "一次遅れ応答・極・検算",
    title: "一次遅れの単位ステップ総合",
    prompt: String.raw`一次遅れ系 \(G(s)=\frac{${gain}}{${timeConstant}s+1}\) に単位ステップ入力を加える。(1) \(Y(s)\) を作り、(2) 部分分数分解して \(y(t)\) を導き、(3) 極と安定性、初期値・定常値を確認したうえで、(4) \(t=${formatNumber(time, 2)}\,\mathrm s\) の出力 \(y(t)\) を求めよ。入力欄には(4)の数値を入れること。`,
    answerValue: output,
    digits: 4,
    tolerance: 0.002,
    formula: "y(t)=K\\left(1-e^{-\\frac{t}{T}}\\right)",
    steps: [
      `\\(Y(s)=\\frac{${gain}}{s(${timeConstant}s+1)}\\) とし、部分分数分解する。`,
      `\\(y(t)=${gain}\\left(1-e^{-\\frac{t}{${timeConstant}}}\\right)\\)、極は \\(s=${formatNumber(pole, 4)}\\) なので安定。`,
      `\\(y(0^+)=0\\)、\\(y(\\infty)=${gain}\\) を確認する。`,
      `\\(\\frac{t}{T}=\\frac{${formatNumber(time, 2)}}{${timeConstant}}=${multiple}\\)。`,
      `\\(y=${gain}(1-e^{-${multiple}})\\approx${formatNumber(output, 4)}\\)（定常値の約${formatNumber(reachedPercent, 1)}%）。`,
    ],
    reason: "入力のラプラス変換、閉じた式の逆変換、極による安定判定、初期値・最終値の検算を連続して行う過去問型の問題です。",
    explanation: `極は左半平面にあり安定です。${multiple}時定数後なので、出力は定常値${gain}の約${formatNumber(reachedPercent, 1)}%まで到達します。`,
    source: rangeSource("スマート制御範囲ZIP・一次遅れ、極、安定性／教科書p.65〜68", [65, 66, 67, 68]),
    parameters: { gain, timeConstant, multiple, time, output, pole, reachedPercent },
    safety: baseSafety({ finiteValues: [gain, timeConstant, multiple, time, output, pole, reachedPercent], denominators: [timeConstant], notes: ["時定数は正", "指数関数の引数は有限"] }),
    difficulty: 3,
    subpartCount: 4,
    sourceBasis: ["範囲ZIP：一次遅れ応答", "教科書p.65〜68：応答値とグラフ", "過去問：極・安定性との連結"],
  });
}
function smartPole(seedKey: string, rng: SeededRandom) {
  const timeConstant = rng.pick([0.2, 0.25, 0.4, 0.5, 1, 1.25, 2, 2.5]);
  const gain = rng.pick([1, 2, 3, 4, 5]);
  const pole = -1 / timeConstant;
  const twoPercentSettling = 4 * timeConstant;
  return numericQuestion(seedKey, {
    subjectId: "subject-6",
    templateId: "smart-first-order-pole",
    category: "極・応答モード・安定性",
    title: "一次遅れ要素の極と応答判定",
    prompt: String.raw`伝達関数 \(G(s)=\frac{${gain}}{${timeConstant}s+1}\) について、(1) 特性方程式、(2) 極、(3) 対応する指数応答モードと安定性、(4) 2%整定時間の近似値を順に求めよ。入力欄には極の値を入れること。`,
    answerValue: pole,
    digits: 4,
    tolerance: 0.001,
    formula: "s=-\\frac{1}{T}",
    steps: [
      `特性方程式は \\(${timeConstant}s+1=0\\)。`,
      `\\(s=-\\frac{1}{${timeConstant}}=${formatNumber(pole, 4)}\\)。`,
      `応答モードは \\(e^{${formatNumber(pole, 4)}t}\\) で、実部が負なので安定。`,
      `2%整定時間は \\(t_s\\approx4T=${formatNumber(twoPercentSettling, 4)}\\,\\mathrm s\\)。`,
    ],
    reason: "極の数値だけで終わらず、時間応答モード・安定性・整定時間まで同じ特性方程式から判断します。",
    explanation: `ゲイン${gain}は極の位置を変えません。時定数${timeConstant} sが正なので極は左半平面にあり、応答は単調に減衰します。`,
    source: rangeSource("スマート制御範囲ZIP・極と安定性／教科書p.65〜68", [65, 66, 67, 68]),
    parameters: { gain, timeConstant, pole, twoPercentSettling },
    safety: baseSafety({ finiteValues: [gain, timeConstant, pole, twoPercentSettling], denominators: [timeConstant], notes: ["時定数T>0"] }),
    difficulty: 3,
    subpartCount: 4,
    sourceBasis: ["範囲ZIP：極と安定性", "教科書p.65〜68：整定時間と応答判定"],
  });
}
function smartFeedback(seedKey: string, rng: SeededRandom) {
  const forward = rng.pick([2, 3, 4, 5, 8, 10]);
  const feedback = rng.pick([0.2, 0.25, 0.5, 1]);
  const timeConstant = rng.pick([0.5, 1, 1.5, 2, 2.5, 3]);
  const denominatorGain = 1 + forward * feedback;
  const closedDcGain = forward / denominatorGain;
  const closedTimeConstant = timeConstant / denominatorGain;
  const closedPole = -denominatorGain / timeConstant;
  return numericQuestion(seedKey, {
    subjectId: "subject-6",
    templateId: "smart-negative-feedback",
    category: "負帰還・閉ループ極",
    title: "一次遅れ系の負帰還総合",
    prompt: String.raw`前向き要素 \(G(s)=\frac{${forward}}{${timeConstant}s+1}\)、帰還要素 \(H=${feedback}\) の負帰還系について、(1) 閉ループ伝達関数、(2) 直流ゲイン、(3) 極と安定性、(4) 閉ループ時定数を求めよ。入力欄には(4)を秒で入れること。`,
    answerValue: closedTimeConstant,
    digits: 4,
    tolerance: 0.002,
    unit: "s",
    formula: "G_{cl}(s)=\\frac{G(s)}{1+G(s)H}",
    steps: [
      `\\(G_{cl}(s)=\\frac{${forward}}{${timeConstant}s+1+${formatNumber(forward * feedback, 4)}}=\\frac{${forward}}{${timeConstant}s+${formatNumber(denominatorGain, 4)}}\\)。`,
      `直流ゲインは \\(\\frac{${forward}}{${formatNumber(denominatorGain, 4)}}\\approx${formatNumber(closedDcGain, 4)}\\)。`,
      `極は \\(s=-\\frac{${formatNumber(denominatorGain, 4)}}{${timeConstant}}\\approx${formatNumber(closedPole, 4)}\\) で安定。`,
      `標準形へ直すと \\(T_{cl}=\\frac{${timeConstant}}{${formatNumber(denominatorGain, 4)}}\\approx${formatNumber(closedTimeConstant, 4)}\\,\\mathrm s\\)。`,
    ],
    reason: "負帰還式を代入した後、直流ゲイン・極・時定数を同じ分母から読み分ける本番型の連結問題です。",
    explanation: `負帰還により直流ゲインは${formatNumber(closedDcGain, 4)}、時定数は${formatNumber(closedTimeConstant, 4)} sへ下がり、極は${formatNumber(closedPole, 4)}へ左移動します。`,
    source: rangeSource("スマート制御範囲ZIP・フィードバック、特性方程式、極"),
    parameters: { forward, feedback, timeConstant, denominatorGain, closedDcGain, closedTimeConstant, closedPole },
    safety: baseSafety({ finiteValues: [forward, feedback, timeConstant, denominatorGain, closedDcGain, closedTimeConstant, closedPole], denominators: [timeConstant, denominatorGain], notes: ["負帰還かつG,H,T>0なので閉ループ分母は正"] }),
    difficulty: 3,
    subpartCount: 4,
    sourceBasis: ["範囲ZIP：負帰還と閉ループ伝達関数", "過去問：特性方程式・極・安定性"],
  });
}
function smartSteadyState(seedKey: string, rng: SeededRandom) {
  const gain = rng.pick([2, 3, 4, 5, 8, 10]);
  const timeConstant = rng.pick([0.5, 1, 1.5, 2, 2.5, 3]);
  const input = 1;
  const finalValue = gain * input;
  const pole = -1 / timeConstant;
  return numericQuestion(seedKey, {
    subjectId: "subject-6",
    templateId: "smart-steady-state",
    category: "最終値・安定性・検算",
    title: "一次遅れ系の最終値総合",
    prompt: String.raw`安定な一次遅れ系 \(G(s)=\frac{${gain}}{${timeConstant}s+1}\) に単位ステップ入力を加える。(1) \(Y(s)\) を作り、(2) 最終値の定理を適用できる極条件を確認し、(3) 定理と時間応答の両方から定常出力を求めよ。入力欄には定常出力を入れること。`,
    answerValue: finalValue,
    digits: 3,
    tolerance: 0.001,
    formula: "y(\\infty)=K",
    steps: [
      `\\(Y(s)=\\frac{${gain}}{s(${timeConstant}s+1)}\\)。`,
      `\\(sY(s)=\\frac{${gain}}{${timeConstant}s+1}\\) の極は \\(s=${formatNumber(pole, 4)}<0\\) なので最終値の定理を適用できる。`,
      `\\(y(\\infty)=\\lim_{s\\to0}sY(s)=${formatNumber(finalValue, 3)}\\)。`,
      `\\(y(t)=${gain}\\left(1-e^{-\\frac{t}{${timeConstant}}}\\right)\\) でも同じ最終値を確認する。`,
    ],
    reason: "最終値だけを暗記せず、定理の適用条件である極の位置と時間応答による検算を同時に行います。",
    explanation: `時定数${timeConstant} sは到達速度を変えますが、単位ステップに対する定常値${gain}は直流ゲインで決まります。`,
    source: rangeSource("スマート制御範囲ZIP・伝達関数、単位ステップ、最終値、極"),
    parameters: { gain, timeConstant, input, finalValue, pole },
    safety: baseSafety({ finiteValues: [gain, timeConstant, input, finalValue, pole], denominators: [timeConstant], notes: ["最終値の定理を適用できる安定な一次遅れ系"] }),
    difficulty: 3,
    subpartCount: 3,
    sourceBasis: ["範囲ZIP：一次遅れの単位ステップ応答", "範囲ZIP：極と安定性", "過去問：初期値・最終値の検算"],
  });
}
function statsMeanVariance(seedKey: string, rng: SeededRandom) {
  const center = rng.int(10, 30);
  const spread = rng.int(1, 6);
  const scale = rng.pick([2, 3, 4]);
  const offset = rng.pick([-7, -4, 5, 9]);
  const values = [center - 2 * spread, center - spread, center, center + spread, center + 2 * spread];
  const baseVariance = 2 * spread ** 2;
  const transformedVariance = scale ** 2 * baseVariance;
  return numericQuestion(seedKey, {
    subjectId: "subject-7",
    templateId: "statistics-symmetric-variance",
    category: "記述統計・一次変換",
    title: "データの母分散と一次変換",
    prompt: String.raw`データ \(X=(${values.join(",")})\) に対して \(Y=${scale}X${offset >= 0 ? `+${offset}` : offset}\) とする。\(X\) の平均と母分散を途中で求め、最後に \(V(Y)\) を求めよ。解答欄には \(V(Y)\) を書くこと。`,
    answerValue: transformedVariance,
    digits: 4,
    tolerance: 0.002,
    formula: String.raw`V(Y)=a^2\left\{\frac{1}{n}\sum_{i=1}^{n}(x_i-\bar{x})^2\right\}`,
    expandedFormula: String.raw`V(Y)=${scale}^2\left\{\frac{(${values[0]}-${center})^2+(${values[1]}-${center})^2+(${values[2]}-${center})^2+(${values[3]}-${center})^2+(${values[4]}-${center})^2}{5}\right\}`,
    steps: [
      String.raw`\(\bar{x}=\frac{${values.join("+")}}{5}=${center}\)`,
      String.raw`\(V(X)=\frac{(${values[0]}-${center})^2+(${values[1]}-${center})^2+(${values[2]}-${center})^2+(${values[3]}-${center})^2+(${values[4]}-${center})^2}{5}=${baseVariance}\)`,
      String.raw`定数項 ${offset} は分散へ影響せず、倍率 ${scale} は二乗して効く。`,
      String.raw`\(V(Y)=${scale}^2V(X)=${scale ** 2}\times${baseVariance}=${transformedVariance}\)`,
    ],
    reason: "元データの分散を求めて終わりではなく、一次変換では倍率の二乗を掛けるところまでが本番型の連続計算です。",
    explanation: "平均→偏差平方和→母分散→一次変換の順に処理します。母分散の分母は5であり、Yの定数項は分散を変えません。",
    source: rangeSource("確率統計範囲・記述統計と一次変換"),
    parameters: { center, spread, scale, offset, x1: values[0], x2: values[1], x3: values[2], x4: values[3], x5: values[4], baseVariance, transformedVariance },
    safety: baseSafety({ finiteValues: [center, spread, scale, offset, ...values, baseVariance, transformedVariance], denominators: [5] }),
    difficulty: 3,
    subpartCount: 4,
    sourceBasis: ["確率統計テスト過去問・記述統計の連続小問", "確率統計範囲・一次変換"],
  });
}
function statsZScore(seedKey: string, rng: SeededRandom) {
  const zValues = [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2] as const;
  const meanA = rng.pick([40, 50, 60, 70]);
  const sdA = rng.pick([4, 6, 8, 10]);
  const zA = rng.pick(zValues);
  const meanB = rng.pick([45, 55, 65, 75]);
  const sdB = rng.pick([4, 6, 8, 10]);
  const zB = rng.pick(zValues.filter((value) => value !== zA));
  const scoreA = meanA + sdA * zA;
  const scoreB = meanB + sdB * zB;
  const advantage = zA - zB;
  return numericQuestion(seedKey, {
    subjectId: "subject-7",
    templateId: "statistics-z-score",
    category: "標準化・比較",
    title: "異なる試験の標準得点比較",
    prompt: String.raw`試験Aは平均${meanA}、標準偏差${sdA}で得点${scoreA}、試験Bは平均${meanB}、標準偏差${sdB}で得点${scoreB}だった。両方を標準化し、\(z_A-z_B\) を求めよ。正ならAの相対成績が高い。`,
    answerValue: advantage,
    digits: 3,
    tolerance: 0.001,
    formula: String.raw`z_A-z_B=\frac{x_A-\mu_A}{\sigma_A}-\frac{x_B-\mu_B}{\sigma_B}`,
    steps: [
      String.raw`\(z_A=\frac{${scoreA}-${meanA}}{${sdA}}=${zA}\)`,
      String.raw`\(z_B=\frac{${scoreB}-${meanB}}{${sdB}}=${zB}\)`,
      String.raw`生の点数差ではなく、それぞれが平均から標準偏差何個分離れたかを比較する。`,
      String.raw`\(z_A-z_B=${zA}-(${zB})=${advantage}\)`,
    ],
    reason: "平均とばらつきが異なる試験は、生点ではなく標準得点へそろえてから比較します。",
    explanation: "各試験を別々に標準化し、最後に差を取ります。標準偏差を取り違えないことと、負のz得点を括弧に入れることが要点です。",
    source: rangeSource("確率統計範囲・標準化と正規分布"),
    parameters: { mean: meanA, deviation: sdA, value: scoreA, multiplier: zA, meanA, sdA, scoreA, zA, meanB, sdB, scoreB, zB, advantage },
    safety: baseSafety({ finiteValues: [meanA, sdA, scoreA, zA, meanB, sdB, scoreB, zB, advantage], denominators: [sdA, sdB], notes: ["両標準偏差>0"] }),
    difficulty: 3,
    subpartCount: 3,
    sourceBasis: ["確率統計演習・標準化", "過去問型の複数量比較"],
  });
}
function statsBayes(seedKey: string, rng: SeededRandom) {
  const [pA, pB, pC] = rng.pick([
    [0.2, 0.3, 0.5],
    [0.3, 0.4, 0.3],
    [0.4, 0.35, 0.25],
    [0.25, 0.5, 0.25],
  ] as const);
  const defectA = rng.pick([0.02, 0.03, 0.04]);
  const defectB = rng.pick([0.05, 0.06, 0.08]);
  const defectC = rng.pick([0.09, 0.1, 0.12]);
  const routeA = pA * defectA;
  const routeB = pB * defectB;
  const routeC = pC * defectC;
  const denominator = routeA + routeB + routeC;
  const posterior = routeC / denominator;
  return numericQuestion(seedKey, {
    subjectId: "subject-7",
    templateId: "statistics-bayes",
    category: "全確率・Bayes",
    title: "3経路の全確率と事後確率",
    prompt: String.raw`製品を工場A・B・Cがそれぞれ全体の${pA * 100}%・${pB * 100}%・${pC * 100}%生産し、不良率は順に${defectA * 100}%・${defectB * 100}%・${defectC * 100}%である。無作為に選んだ製品が不良だったとき、それが工場C製である確率を求めよ。`,
    answerValue: posterior,
    digits: 5,
    tolerance: 0.001,
    formula: String.raw`P(C\mid D)=\frac{P(C)P(D\mid C)}{P(A)P(D\mid A)+P(B)P(D\mid B)+P(C)P(D\mid C)}`,
    steps: [
      String.raw`A経路：\(${pA}\times${defectA}=${formatNumber(routeA, 5)}\)`,
      String.raw`B経路：\(${pB}\times${defectB}=${formatNumber(routeB, 5)}\)、C経路：\(${pC}\times${defectC}=${formatNumber(routeC, 5)}\)`,
      String.raw`全確率は \(P(D)=${formatNumber(routeA, 5)}+${formatNumber(routeB, 5)}+${formatNumber(routeC, 5)}=${formatNumber(denominator, 5)}\)`,
      String.raw`\(P(C\mid D)=\frac{${formatNumber(routeC, 5)}}{${formatNumber(denominator, 5)}}\approx${formatNumber(posterior, 5)}\)`,
    ],
    reason: "観測された不良品は3工場のどこからも来るため、分母には全経路を足し、分子には工場Cかつ不良の経路だけを置きます。",
    explanation: "生産割合×不良率で各経路の同時確率を作り、全確率で正規化します。不良率だけを比較して答えないことが重要です。",
    source: rangeSource("確率統計範囲・全確率とベイズ"),
    parameters: { pA, pB, pC, defectA, defectB, defectC, routeA, routeB, routeC, denominator, posterior },
    safety: baseSafety({ finiteValues: [pA, pB, pC, defectA, defectB, defectC, routeA, routeB, routeC, denominator, posterior], denominators: [denominator], notes: ["事前確率の和=1", "不良の全確率>0"] }),
    difficulty: 3,
    subpartCount: 4,
    sourceBasis: ["確率統計テスト過去問・複数群", "確率統計演習・全確率とBayes"],
  });
}
function factorial(value: number): number {
  let result = 1;
  for (let index = 2; index <= value; index += 1) result *= index;
  return result;
}

function combination(n: number, r: number): number {
  return factorial(n) / (factorial(r) * factorial(n - r));
}

function statsCombination(seedKey: string, rng: SeededRandom) {
  const groupA = rng.int(5, 8);
  const groupB = rng.int(4, 7);
  const choose = 4;
  const twoFromB = combination(groupB, 2) * combination(groupA, 2);
  const threeFromB = combination(groupB, 3) * combination(groupA, 1);
  const fourFromB = combination(groupB, 4);
  const answer = twoFromB + threeFromB + fourFromB;
  return numericQuestion(seedKey, {
    subjectId: "subject-7",
    templateId: "statistics-combination",
    category: "場合の数・条件付き選出",
    title: "少なくともを含む委員選出",
    prompt: String.raw`A組${groupA}人、B組${groupB}人から4人の委員を選ぶ。B組を少なくとも2人含む選び方は何通りか。`,
    answerValue: answer,
    digits: 0,
    tolerance: 0,
    formula: String.raw`N={}_{${groupB}}C_2{}_{${groupA}}C_2+{}_{${groupB}}C_3{}_{${groupA}}C_1+{}_{${groupB}}C_4`,
    steps: [
      "B組が2人・3人・4人の3つの排反な場合に分ける。",
      String.raw`B組2人は \({}_{${groupB}}C_2{}_{${groupA}}C_2=${twoFromB}\)、B組3人は \({}_{${groupB}}C_3{}_{${groupA}}C_1=${threeFromB}\)`,
      String.raw`B組4人は \({}_{${groupB}}C_4=${fourFromB}\)`,
      String.raw`重なりのない3場合を足し、\(N=${twoFromB}+${threeFromB}+${fourFromB}=${answer}\)`,
    ],
    reason: "『少なくとも2人』を1つの組合せで処理せず、B組の人数ごとに場合分けして加えます。",
    explanation: "各場合ではB組とA組を別々に選び、積の法則を使います。場合どうしは同時に起こらないので最後は和の法則です。",
    source: rangeSource("確率統計範囲・順列と組合せ"),
    parameters: { n: groupA + groupB, r: choose, groupA, groupB, twoFromB, threeFromB, fourFromB, answer },
    safety: baseSafety({ finiteValues: [groupA + groupB, groupA, groupB, choose, twoFromB, threeFromB, fourFromB, answer], denominators: [2, 6, 24], notes: ["各組の人数は選出数以上"] }),
    difficulty: 3,
    subpartCount: 4,
    sourceBasis: ["確率統計演習・場合分け", "過去問型の複合組合せ"],
  });
}
function statsChebyshev(seedKey: string, rng: SeededRandom) {
  const mean = rng.pick([40, 50, 60, 70, 80, 7000]);
  const standardDeviation = mean === 7000 ? 1000 : rng.pick([2, 4, 5, 6, 8, 10]);
  const k = mean === 7000 ? 2 : rng.pick([1.5, 2, 2.5, 3, 4]);
  const radius = k * standardDeviation;
  const intervalLower = mean - radius;
  const intervalUpper = mean + radius;
  const outsideUpperBound = 1 / k ** 2;
  const insideLowerBound = 1 - outsideUpperBound;
  const insideLowerBoundPercent = insideLowerBound * 100;
  return numericQuestion(seedKey, {
    subjectId: "subject-7",
    templateId: "statistics-chebyshev",
    category: "チェビシェフの不等式",
    title: "平均・標準偏差から中心区間の確率下限",
    prompt: String.raw`平均 \(\mu\)、標準偏差 \(\sigma\) をもつ分布について、\(k\sigma\) 以内の中心区間を求め、チェビシェフの不等式からその区間に入る確率の下限を百分率で答えよ。解答欄には確率の下限を入力すること。`,
    context: String.raw`\(\mu=${mean}\)、\(\sigma=${standardDeviation}\)、\(k=${k}\;(k>1)\) とする。分布の形は仮定しない。`,
    answerValue: insideLowerBoundPercent,
    digits: 3,
    tolerance: 0.05,
    unit: "%",
    formula: "\\begin{aligned}P(|X-\\mu|\\ge k\\sigma)&\\le\\frac{1}{k^2}\\\\P(\\mu-k\\sigma\\le X\\le\\mu+k\\sigma)&\\ge1-\\frac{1}{k^2}\\end{aligned}",
    steps: [
      `\\(k\\sigma=${k}(${standardDeviation})=${formatNumber(radius, 3)}\\)`,
      `中心区間は \\(\\mu-k\\sigma\\le X\\le\\mu+k\\sigma\\)、すなわち \\(${formatNumber(intervalLower, 3)}\\le X\\le${formatNumber(intervalUpper, 3)}\\)。`,
      `区間外の確率は \\(P(|X-\\mu|\\ge k\\sigma)\\le\\frac{1}{${k}^2}=${formatNumber(outsideUpperBound, 5)}\\)。`,
      `したがって区間内は \\(P(${formatNumber(intervalLower, 3)}\\le X\\le${formatNumber(intervalUpper, 3)})\\ge1-${formatNumber(outsideUpperBound, 5)}=${formatNumber(insideLowerBoundPercent, 3)}\\%\\)。`,
    ],
    reason: "分布形を仮定せず、平均から標準偏差のk倍以内に入る確率を下から保証する追加範囲の問題です。",
    explanation: `中心区間は${formatNumber(intervalLower, 3)}以上${formatNumber(intervalUpper, 3)}以下、入る確率は少なくとも${formatNumber(insideLowerBoundPercent, 3)}%です。求めるのは正確な確率ではなく、チェビシェフの不等式による下限です。`,
    source: rangeSource("確率統計追加範囲 p.2〜3・チェビシェフの不等式（PXL_20260722_114650437.MP.jpg／PXL_20260722_114652791.MP.jpg）", [2, 3]),
    parameters: { mean, standardDeviation, k, radius, intervalLower, intervalUpper, outsideUpperBound, insideLowerBound, insideLowerBoundPercent },
    safety: baseSafety({
      finiteValues: [mean, standardDeviation, k, radius, intervalLower, intervalUpper, outsideUpperBound, insideLowerBound, insideLowerBoundPercent],
      denominators: [k, k ** 2],
      notes: ["標準偏差は正", "k>1", "確率下限は0より大きく1未満"],
    }),
    difficulty: 3,
    subpartCount: 4,
    sourceBasis: [
      "確率統計追加範囲 p.2（PXL_20260722_114650437.MP.jpg）",
      "確率統計追加範囲 p.3（PXL_20260722_114652791.MP.jpg）",
    ],
  });
}

function appliedNorm(seedKey: string, rng: SeededRandom) {
  const ax = rng.int(1, 4);
  const ay = rng.pick([-3, -2, -1, 1, 2, 3]);
  const az = rng.int(1, 3);
  const bx = rng.pick([-2, -1, 1, 2]);
  const by = rng.int(1, 4);
  const bz = rng.pick([-3, -1, 1, 3]);
  const cx = 2 * ax - bx;
  const cy = 2 * ay - by;
  const cz = 2 * az - bz;
  const normSquared = cx ** 2 + cy ** 2 + cz ** 2;
  const norm = Math.sqrt(normSquared);
  return numericQuestion(seedKey, {
    subjectId: "subject-8",
    templateId: "applied-vector-norm",
    category: "ベクトル・線形結合",
    title: "線形結合ベクトルの大きさ",
    prompt: String.raw`\(\mathbf a=(${ax},${ay},${az})\)、\(\mathbf b=(${bx},${by},${bz})\) とする。まず \(2\mathbf a-\mathbf b\) を成分表示し、その大きさを求めよ。解答欄には大きさを書くこと。`,
    answerValue: norm,
    digits: 5,
    tolerance: 0.002,
    formula: String.raw`|2\mathbf a-\mathbf b|=\sqrt{(2a_x-b_x)^2+(2a_y-b_y)^2+(2a_z-b_z)^2}`,
    steps: [
      String.raw`\(2\mathbf a=(${2 * ax},${2 * ay},${2 * az})\)`,
      String.raw`\(2\mathbf a-\mathbf b=(${cx},${cy},${cz})\)`,
      String.raw`二乗和は \((${cx})^2+(${cy})^2+(${cz})^2=${normSquared}\)`,
      String.raw`\(|2\mathbf a-\mathbf b|=\sqrt{${normSquared}}\approx${formatNumber(norm, 5)}\)`,
    ],
    reason: "先にベクトルの線形結合を成分ごとに計算し、その結果へノルム公式を適用する二段構成です。",
    explanation: "係数2をaの全成分へ掛けてからbを引きます。負の成分も二乗するため、符号を括弧で囲んで計算します。",
    source: rangeSource("応用数学範囲・ベクトルの演算とノルム", [1, 2, 4, 5]),
    parameters: { ax, ay, az, bx, by, bz, cx, cy, cz, normSquared, norm },
    safety: baseSafety({ finiteValues: [ax, ay, az, bx, by, bz, cx, cy, cz, normSquared, norm], radicands: [normSquared] }),
    difficulty: 3,
    subpartCount: 4,
    sourceBasis: ["応用数学範囲・ベクトル演算", "形式資料・途中式を伴うノルム計算"],
  });
}
function appliedOrthogonal(seedKey: string, rng: SeededRandom) {
  const a = rng.int(1, 6);
  const b = rng.pick([-3, -2, -1, 1, 2, 3]);
  const c = rng.int(1, 6);
  const p = rng.pick([-4, -3, -2, -1, 1, 2, 3, 4]);
  const q = rng.pick([-4, -3, -2, -1, 1, 2, 3, 4]);
  const constant = a * p + c * q;
  const k = -constant / b;
  const normSquared = a ** 2 + k ** 2 + c ** 2;
  const norm = Math.sqrt(normSquared);
  return numericQuestion(seedKey, {
    subjectId: "subject-8",
    templateId: "applied-orthogonal-unknown",
    category: "内積・直交・ノルム",
    title: "直交条件から未知成分と大きさ",
    prompt: String.raw`ベクトル \(\mathbf u=(${a},k,${c})\) と \(\mathbf v=(${p},${b},${q})\) が直交する。\(k\) を求めた後、\(|\mathbf u|\) を求めよ。解答欄には \(|\mathbf u|\) を書くこと。`,
    answerValue: norm,
    digits: 5,
    tolerance: 0.002,
    formula: String.raw`\mathbf u\cdot\mathbf v=0,\qquad |\mathbf u|=\sqrt{u_x^2+u_y^2+u_z^2}`,
    steps: [
      String.raw`直交条件より \(${a}\times(${p})+(${b})k+${c}\times(${q})=0\)`,
      String.raw`\(k=-\frac{(${constant})}{(${b})}\approx${formatNumber(k, 5)}\)`,
      String.raw`\(|\mathbf u|^2=${a}^2+k^2+${c}^2\approx${formatNumber(normSquared, 5)}\)`,
      String.raw`\(|\mathbf u|\approx${formatNumber(norm, 5)}\)`,
    ],
    reason: "直交条件で未知成分を決定し、その値を別の公式であるノルムへつなぐ本番型の連続問題です。",
    explanation: "内積0の一次方程式を先に解きます。kが分数・負数でも丸めずに保持し、最後のノルム計算で使うと誤差を抑えられます。",
    source: rangeSource("応用数学範囲・内積、直交、ベクトルの大きさ", [1, 2, 4, 5]),
    parameters: { a, b, c, p, q, constant, k, normSquared, norm },
    safety: baseSafety({ finiteValues: [a, b, c, p, q, constant, k, normSquared, norm], denominators: [b], radicands: [normSquared], notes: ["kの係数b≠0"] }),
    difficulty: 3,
    subpartCount: 4,
    sourceBasis: ["応用数学範囲・直交条件", "応用数学形式資料・連続小問"],
  });
}
function appliedGradient(seedKey: string, rng: SeededRandom) {
  const ax = rng.int(1, 4);
  const ay = rng.int(1, 4);
  const az = rng.int(1, 4);
  const x = rng.pick([-2, -1, 1, 2, 3]);
  const y = rng.pick([-2, -1, 1, 2, 3]);
  const z = rng.pick([-2, -1, 1, 2, 3]);
  const ux = rng.pick([1, 2]);
  const uy = rng.pick([-2, -1, 1, 2]);
  const uz = rng.pick([1, 2, 3]);
  const directionNormSquared = ux ** 2 + uy ** 2 + uz ** 2;
  const directionNorm = Math.sqrt(directionNormSquared);
  const gx = 2 * ax * x;
  const gy = 2 * ay * y;
  const gz = 2 * az * z;
  const numerator = gx * ux + gy * uy + gz * uz;
  const answer = numerator / directionNorm;
  return numericQuestion(seedKey, {
    subjectId: "subject-8",
    templateId: "applied-directional-derivative",
    category: "勾配・方向微分",
    title: "方向の正規化を含む方向微分",
    prompt: String.raw`\(\phi=${ax}x^2+${ay}y^2+${az}z^2\) とする。点 \(P=(${x},${y},${z})\) で、ベクトル \(\mathbf v=(${ux},${uy},${uz})\) が示す向きの方向微分を求めよ。\(\mathbf v\) は単位ベクトルではない。`,
    answerValue: answer,
    digits: 5,
    tolerance: 0.003,
    formula: String.raw`D_{\mathbf e}\phi=\nabla\phi\cdot\mathbf e,\qquad\mathbf e=\frac{\mathbf v}{|\mathbf v|}`,
    steps: [
      String.raw`\(\nabla\phi=(${2 * ax}x,${2 * ay}y,${2 * az}z)\)`,
      String.raw`\(\nabla\phi(P)=(${gx},${gy},${gz})\)`,
      String.raw`\(|\mathbf v|=\sqrt{${directionNormSquared}}\)、したがって \(\mathbf e=\frac{1}{\sqrt{${directionNormSquared}}}(${ux},${uy},${uz})\)`,
      String.raw`\(D_{\mathbf e}\phi=\frac{(${gx})\cdot(${ux})+(${gy})\cdot(${uy})+(${gz})\cdot(${uz})}{\sqrt{${directionNormSquared}}}=\frac{${numerator}}{\sqrt{${directionNormSquared}}}\approx${formatNumber(answer, 5)}\)`,
    ],
    reason: "方向微分は任意ベクトルとの内積ではなく、その向きを表す単位ベクトルとの内積です。",
    explanation: "勾配を求め、点へ代入し、方向ベクトルを正規化してから内積を取ります。正規化を省くとベクトルの長さ倍だけ誤った答えになります。",
    source: rangeSource("応用数学範囲・勾配と方向微分", [12, 13, 14, 18, 19]),
    parameters: { ax, ay, az, x, y, z, ux, uy, uz, gx, gy, gz, directionNormSquared, directionNorm, numerator, answer },
    safety: baseSafety({ finiteValues: [ax, ay, az, x, y, z, ux, uy, uz, gx, gy, gz, directionNormSquared, directionNorm, numerator, answer], denominators: [directionNorm], radicands: [directionNormSquared], notes: ["方向ベクトルは零ベクトルではない"] }),
    difficulty: 3,
    subpartCount: 4,
    sourceBasis: ["応用数学範囲・勾配", "応用数学範囲・方向微分と単位方向"],
  });
}
function appliedDivergence(seedKey: string, rng: SeededRandom) {
  const a = rng.pick([-3, -2, -1, 1, 2, 3]);
  const b = rng.pick([-3, -2, -1, 1, 2, 3]);
  const c = rng.pick([-3, -2, -1, 1, 2, 3]);
  const cross = rng.pick([-2, -1, 1, 2]);
  const scale = rng.pick([2, 3, 4]);
  const x = rng.pick([-2, -1, 1, 2, 3]);
  const y = rng.pick([-2, -1, 1, 2, 3]);
  const z = rng.pick([-2, -1, 1, 2, 3]);
  const baseDivergence = 2 * a * x + 2 * b * y + 2 * c * z;
  const divergence = scale * baseDivergence;
  return numericQuestion(seedKey, {
    subjectId: "subject-8",
    templateId: "applied-divergence-point",
    category: "発散・線形性",
    title: "複合ベクトル場の発散",
    prompt: String.raw`\(\mathbf F=(${a}x^2${signedCoefficientTerm(cross, "yz")},${b}y^2${signedCoefficientTerm(cross, "zx")},${c}z^2${signedCoefficientTerm(cross, "xy")})\)、\(\mathbf G=(y,z,x)\) とする。\(\mathbf H=${scale}\mathbf F+\mathbf G\) の点 \(P=(${x},${y},${z})\) における発散を求めよ。`,
    answerValue: divergence,
    digits: 3,
    tolerance: 0.001,
    formula: String.raw`\nabla\cdot(\lambda\mathbf F+\mathbf G)=\lambda\nabla\cdot\mathbf F+\nabla\cdot\mathbf G`,
    steps: [
      String.raw`対応座標で偏微分し、\(\nabla\cdot\mathbf F=${2 * a}x${signedCoefficientTerm(2 * b, "y")}${signedCoefficientTerm(2 * c, "z")}\)。交差項は対応座標を含まないため0。`,
      String.raw`\(\nabla\cdot\mathbf G=\frac{\partial y}{\partial x}+\frac{\partial z}{\partial y}+\frac{\partial x}{\partial z}=0\)`,
      String.raw`点Pでは \(\nabla\cdot\mathbf F=(${2 * a})(${x})+(${2 * b})(${y})+(${2 * c})(${z})=${baseDivergence}\)`,
      String.raw`線形性より \(\nabla\cdot\mathbf H=${scale}\times(${baseDivergence})+0=${divergence}\)`,
    ],
    reason: "各成分を展開し切る前に発散の線形性を使い、FとGを別々に処理します。",
    explanation: "発散ではx成分をx、y成分をy、z成分をzで微分します。yzなど別変数だけの項は0になり、最後に係数を掛けます。",
    source: rangeSource("応用数学範囲・発散と線形性", [15, 16, 19]),
    parameters: { a, b, c, cross, scale, x, y, z, baseDivergence, divergence },
    safety: baseSafety({ finiteValues: [a, b, c, cross, scale, x, y, z, baseDivergence, divergence] }),
    difficulty: 3,
    subpartCount: 4,
    sourceBasis: ["応用数学範囲・発散", "追加範囲・発散の線形性"],
  });
}
function appliedCrossArea(seedKey: string, rng: SeededRandom) {
  const width = rng.int(2, 8);
  const height = rng.int(2, 8);
  const crossX = 1;
  const crossY = -width;
  const crossZ = width * height;
  const normSquared = crossX ** 2 + crossY ** 2 + crossZ ** 2;
  const area = Math.sqrt(normSquared) / 2;
  return numericQuestion(seedKey, {
    subjectId: "subject-8",
    templateId: "applied-triangle-area",
    category: "外積・三角形面積",
    title: "3次元三角形の外積と面積",
    prompt: String.raw`3点 \(A=(0,0,0)\)、\(B=(${width},1,0)\)、\(C=(0,${height},1)\) が作る三角形ABCの面積を求めよ。辺ベクトルと外積を途中で示すこと。`,
    answerValue: area,
    digits: 5,
    tolerance: 0.003,
    formula: String.raw`S=\frac{1}{2}|\overrightarrow{AB}\times\overrightarrow{AC}|`,
    steps: [
      String.raw`\(\overrightarrow{AB}=(${width},1,0)\)、\(\overrightarrow{AC}=(0,${height},1)\)`,
      String.raw`\(\overrightarrow{AB}\times\overrightarrow{AC}=(${crossX},${crossY},${crossZ})\)`,
      String.raw`外積の大きさは \(\sqrt{${crossX}^2+(${crossY})^2+${crossZ}^2}=\sqrt{${normSquared}}\)`,
      String.raw`三角形なので半分を取り、\(S=\frac{\sqrt{${normSquared}}}{2}\approx${formatNumber(area, 5)}\)`,
    ],
    reason: "座標軸に沿う直角三角形ではないため、2辺の外積を成分計算して面積へつなぎます。",
    explanation: "始点Aを共通にしたABとACを作り、この順で外積を取ります。外積の大きさは平行四辺形の面積なので最後に2で割ります。",
    source: rangeSource("応用数学範囲・外積と面積", [2, 4, 5]),
    parameters: { width, height, crossX, crossY, crossZ, normSquared, area },
    safety: baseSafety({ finiteValues: [width, height, crossX, crossY, crossZ, normSquared, area], denominators: [2], radicands: [normSquared] }),
    difficulty: 3,
    subpartCount: 4,
    sourceBasis: ["応用数学範囲・3次元外積", "形式資料・座標から三角形面積"],
  });
}
function appliedGreen(seedKey: string, rng: SeededRandom) {
  const a = rng.int(1, 5);
  const b = rng.int(1, 5);
  const c = rng.pick([1, 2, 3, 4]);
  const d = rng.pick([1, 2, 3, 4]);
  const result = d * a ** 2 * b + c * a * b ** 2;
  return numericQuestion(seedKey, {
    subjectId: "subject-8",
    templateId: "applied-green-rectangle",
    category: "グリーンの定理",
    title: "非定数被積分関数の線積分",
    prompt: String.raw`長方形 \(D:0\le x\le${a},\ 0\le y\le${b}\) の境界Cを反時計回りに一周する。\(P=-${c}y^2\)、\(Q=${d}x^2\) のとき \(\oint_C(P\,dx+Q\,dy)\) を求めよ。`,
    answerValue: result,
    digits: 3,
    tolerance: 0.001,
    formula: String.raw`\oint_C(P\,dx+Q\,dy)=\iint_D\left(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\right)dA`,
    steps: [
      String.raw`\(\frac{\partial Q}{\partial x}=2\cdot${d}x\)、\(\frac{\partial P}{\partial y}=-2\cdot${c}y\)`,
      String.raw`したがって被積分関数は \(${2 * d}x+${2 * c}y\)`,
      String.raw`\(\int_0^{${a}}\int_0^{${b}}(${2 * d}x+${2 * c}y)\,dy\,dx=${d}\cdot${a}^2\cdot${b}+${c}\cdot${a}\cdot${b}^2\)`,
      String.raw`\(=${result}\)`,
    ],
    reason: "線積分を辺ごとに4本計算せず、グリーンの定理で領域内の二重積分へ変換します。",
    explanation: "反時計回りなので正向きの符号を使います。今回は被積分関数が定数ではないため、面積を掛けるだけでなくx・yについて積分します。",
    source: rangeSource("応用数学追加範囲・グリーンの定理", [19]),
    parameters: { a, b, c, d, result },
    safety: baseSafety({ finiteValues: [a, b, c, d, result], notes: ["境界は反時計回りの正向き", "積分領域は有限長方形"] }),
    difficulty: 3,
    subpartCount: 4,
    sourceBasis: ["応用数学追加範囲・グリーンの定理", "形式資料・途中式付き線積分"],
  });
}
const MATERIAL_GENERATED_VISUALS: Record<MaterialMechanicsGeneratorTemplateId, MaterialMechanicsDiagramKind> = {
  "material-solid-shaft-stress": "solid-shaft",
  "material-hollow-shaft-stress": "hollow-shaft",
  "material-coil-spring-deflection": "coil-spring",
  "material-simple-beam-udl": "simply-supported-udl",
  "material-simple-beam-point-rect": "additional-simple-point-rect",
  "material-simple-beam-udl-rect": "additional-simple-udl-rect",
  "material-cantilever-tip-hollow": "additional-cantilever-tip-hollow",
  "material-cantilever-udl-hollow": "additional-cantilever-udl-hollow",
};

function materialGenerated(
  templateId: MaterialMechanicsGeneratorTemplateId,
  seedKey: string,
  rng: SeededRandom,
): GeneratedPracticeQuestion {
  const spec = buildMaterialMechanicsGeneratedSpec(templateId, rng);
  return numericQuestion(seedKey, {
    subjectId: "subject-5",
    templateId,
    category: spec.category,
    title: spec.title,
    prompt: spec.prompt,
    context: spec.context,
    answerValue: spec.numericAnswer,
    digits: 4,
    tolerance: spec.tolerance,
    unit: spec.expectedUnit,
    requireUnit: true,
    acceptedUnitScales: spec.acceptedUnitScales,
    formula: spec.formula,
    steps: spec.steps,
    reason: spec.reason,
    explanation: spec.explanation,
    source: rangeSource(spec.sourceLabel, spec.sourcePages),
    parameters: spec.parameters,
    safety: baseSafety({
      finiteValues: [...spec.finiteValues, spec.numericAnswer],
      denominators: spec.denominators,
      radicands: spec.radicands,
      notes: ["材料力学範囲ZIPと形式2の範囲一致部分にある公式だけを使用"],
    }),
    visual: { type: "material-mechanics", kind: MATERIAL_GENERATED_VISUALS[templateId] },
    difficulty: spec.difficulty,
    subpartCount: spec.subpartCount,
    sourceBasis: spec.sourceBasis,
  });
}

type DigitalGeneratedQuestion =
  | ReturnType<typeof generateDigitalCircuitQuestion>
  | ReturnType<typeof generateDigitalCircuitExtraQuestion>;

function digitalSeedForVariant(seedKey: string, modulus: number, variant: number) {
  const raw = hashSeed(seedKey);
  return raw - (raw % modulus) + variant;
}

function digitalGenerated(
  seedKey: string,
  templateId: string,
  title: string,
  variant: number,
  extra = false,
): GeneratedPracticeQuestion {
  const generatorSeed = digitalSeedForVariant(seedKey, extra ? 3 : 7, variant);
  const generated: DigitalGeneratedQuestion = extra
    ? generateDigitalCircuitExtraQuestion(generatorSeed)
    : generateDigitalCircuitQuestion(generatorSeed);
  const acceptedAnswers = [...new Set([generated.answer, ...(generated.accepted ?? [])])];
  const sourcePages = [...new Set(generated.sourceRefs.map((reference) => reference.page))];
  const sourceLabel = [...new Set(generated.sourceRefs.map(
    (reference) => reference.filename + " p." + reference.page,
  ))].join("・");
  return {
    id: "generated-subject-9-" + templateId + "-" + hashSeed(seedKey).toString(36),
    seed: seedKey,
    subjectId: "subject-9",
    subjectName: SUBJECT_NAME["subject-9"],
    templateId,
    category: generated.genre,
    format: "text",
    title,
    prompt: generated.prompt,
    context: generated.context,
    answer: generated.answer,
    acceptedAnswers,
    formula: generated.formula,
    steps: generated.steps.length >= 2
      ? generated.steps
      : [...generated.steps, "各区間または各クロックの状態を順に確認する。"],
    reason: "各区間または有効クロックごとに、範囲資料の真理値表・特性式・状態遷移を順に適用するためです。",
    explanation: generated.explanation,
    source: rangeSource(sourceLabel, sourcePages),
    parameters: { generatorSeed, sourceCount: generated.sourceRefs.length },
    evaluation: {
      type: "normalized-text",
      canonical: generated.answer,
      accepted: acceptedAnswers,
    },
    safety: baseSafety({
      finiteValues: [generatorSeed],
      notes: ["現行範囲の論理規則だけで正解列を生成し、生成時に正解を確定"],
    }),
    generation: "on-demand",
    provenance: "generated-from-in-scope-material",
    visual: generated.diagram
      ? { type: "digital-circuit", kind: generated.diagram as DigitalCircuitAnyDiagramKind }
      : undefined,
    difficulty: generated.difficulty,
    subpartCount: generated.subpartCount,
    sourceBasis: generated.sourceBasis,
  };
}
const TEMPLATES: PracticeTemplate[] = [
  { id: "english-order", subjectId: "subject-2", kind: "order", title: "本文抜き出し並び替え", build: englishOrder },
  { id: "english-translation", subjectId: "subject-2", kind: "translation", title: "本文抜き出し和訳", build: englishTranslation },
  { id: "english-grammar", subjectId: "subject-2", kind: "grammar", title: "範囲本文の文法", build: englishGrammar },
  { id: "mechanical-natural-frequency", subjectId: "subject-3", kind: "calculation", title: "片持ちはりの等価剛性・固有振動", build: mechanicalNatural },
  { id: "mechanical-series-springs", subjectId: "subject-3", kind: "calculation", title: "直列・並列複合ばね", build: mechanicalSeries },
  { id: "mechanical-damping-ratio", subjectId: "subject-3", kind: "calculation", title: "減衰分類・初期値応答", build: mechanicalDamping },
  { id: "mechanical-pendulum-length", subjectId: "subject-3", kind: "calculation", title: "測定値から単振り子同定", build: mechanicalPendulum },
  { id: "mechanical-log-decrement", subjectId: "subject-3", kind: "calculation", title: "減衰波形から系同定", build: mechanicalDecrement },
  { id: "mechanical-lever-spring-damper", subjectId: "subject-3", kind: "calculation", title: "過去問大問6・レバー回転系", build: mechanicalLeverSpringDamper },
  { id: "mechanical-laplace-step-response", subjectId: "subject-3", kind: "calculation", title: "3極部分分数・時刻指定応答", build: mechanicalLaplaceStepResponse },
  { id: "thermo-ideal-gas", subjectId: "subject-4", kind: "calculation", title: "ポリトロープ状態・仕事", build: thermoIdealGas },
  { id: "thermo-adiabatic-temperature", subjectId: "subject-4", kind: "calculation", title: "断熱状態・仕事", build: thermoAdiabatic },
  { id: "thermo-otto-efficiency", subjectId: "subject-4", kind: "calculation", title: "オットー4状態・効率", build: thermoOtto },
  { id: "thermo-carnot-efficiency", subjectId: "subject-4", kind: "calculation", title: "カルノー仕事・エントロピー", build: thermoCarnot },
  { id: "thermo-reversed-carnot", subjectId: "subject-4", kind: "calculation", title: "逆カルノーCOP・冷凍能力・必要動力", build: thermoReversedCarnot },
  { id: "material-solid-shaft-stress", subjectId: "subject-5", kind: "calculation", title: "中実丸軸の最大せん断応力", build: (seedKey, rng) => materialGenerated("material-solid-shaft-stress", seedKey, rng) },
  { id: "material-hollow-shaft-stress", subjectId: "subject-5", kind: "calculation", title: "中空丸軸の最大せん断応力", build: (seedKey, rng) => materialGenerated("material-hollow-shaft-stress", seedKey, rng) },
  { id: "material-coil-spring-deflection", subjectId: "subject-5", kind: "calculation", title: "密巻コイルばねのたわみ", build: (seedKey, rng) => materialGenerated("material-coil-spring-deflection", seedKey, rng) },
  { id: "material-simple-beam-udl", subjectId: "subject-5", kind: "calculation", title: "等分布荷重を受ける単純支持ばり", build: (seedKey, rng) => materialGenerated("material-simple-beam-udl", seedKey, rng) },
  { id: "material-simple-beam-point-rect", subjectId: "subject-5", kind: "calculation", title: "集中荷重・長方形断面の単純支持ばり", build: (seedKey, rng) => materialGenerated("material-simple-beam-point-rect", seedKey, rng) },
  { id: "material-simple-beam-udl-rect", subjectId: "subject-5", kind: "calculation", title: "等分布荷重・長方形断面の単純支持ばり", build: (seedKey, rng) => materialGenerated("material-simple-beam-udl-rect", seedKey, rng) },
  { id: "material-cantilever-tip-hollow", subjectId: "subject-5", kind: "calculation", title: "先端集中荷重・中空円断面の片持ちばり", build: (seedKey, rng) => materialGenerated("material-cantilever-tip-hollow", seedKey, rng) },
  { id: "material-cantilever-udl-hollow", subjectId: "subject-5", kind: "calculation", title: "等分布荷重・中空円断面の片持ちばり", build: (seedKey, rng) => materialGenerated("material-cantilever-udl-hollow", seedKey, rng) },
  { id: "smart-first-order-step", subjectId: "subject-6", kind: "calculation", title: "一次遅れ応答", build: smartStep },
  { id: "smart-first-order-pole", subjectId: "subject-6", kind: "calculation", title: "極", build: smartPole },
  { id: "smart-negative-feedback", subjectId: "subject-6", kind: "calculation", title: "負帰還", build: smartFeedback },
  { id: "smart-steady-state", subjectId: "subject-6", kind: "calculation", title: "定常値", build: smartSteadyState },
  { id: "statistics-symmetric-variance", subjectId: "subject-7", kind: "calculation", title: "母分散", build: statsMeanVariance },
  { id: "statistics-z-score", subjectId: "subject-7", kind: "calculation", title: "z得点", build: statsZScore },
  { id: "statistics-bayes", subjectId: "subject-7", kind: "calculation", title: "ベイズ", build: statsBayes },
  { id: "statistics-combination", subjectId: "subject-7", kind: "calculation", title: "組合せ", build: statsCombination },
  { id: "statistics-chebyshev", subjectId: "subject-7", kind: "calculation", title: "チェビシェフの確率下限", build: statsChebyshev },
  { id: "applied-vector-norm", subjectId: "subject-8", kind: "calculation", title: "ベクトルの大きさ", build: appliedNorm },
  { id: "applied-orthogonal-unknown", subjectId: "subject-8", kind: "calculation", title: "直交条件", build: appliedOrthogonal },
  { id: "applied-directional-derivative", subjectId: "subject-8", kind: "calculation", title: "方向微分", build: appliedGradient },
  { id: "applied-divergence-point", subjectId: "subject-8", kind: "calculation", title: "発散", build: appliedDivergence },
  { id: "applied-triangle-area", subjectId: "subject-8", kind: "calculation", title: "三角形面積", build: appliedCrossArea },
  { id: "applied-green-rectangle", subjectId: "subject-8", kind: "calculation", title: "グリーンの定理", build: appliedGreen },
  { id: "digital-gate-waveform", subjectId: "subject-9", kind: "logic", title: "AND・ORゲート波形", build: (seedKey) => digitalGenerated(seedKey, "digital-gate-waveform", "AND・ORゲート波形", 0) },
  { id: "digital-d-flipflop-waveform", subjectId: "subject-9", kind: "flipflop", title: "D-FF波形", build: (seedKey) => digitalGenerated(seedKey, "digital-d-flipflop-waveform", "D-FF波形", 1) },
  { id: "digital-jk-flipflop-waveform", subjectId: "subject-9", kind: "flipflop", title: "JK-FF波形", build: (seedKey) => digitalGenerated(seedKey, "digital-jk-flipflop-waveform", "JK-FF波形", 2) },
  { id: "digital-parallel-register", subjectId: "subject-9", kind: "register", title: "並列レジスタ", build: (seedKey) => digitalGenerated(seedKey, "digital-parallel-register", "並列レジスタ", 3) },
  { id: "digital-binary-counter", subjectId: "subject-9", kind: "counter", title: "非同期ダウンカウンタ", build: (seedKey) => digitalGenerated(seedKey, "digital-binary-counter", "非同期ダウンカウンタ", 4) },
  { id: "digital-state-table-row", subjectId: "subject-9", kind: "state-machine", title: "状態表の完成", build: (seedKey) => digitalGenerated(seedKey, "digital-state-table-row", "状態表の完成", 5) },
  { id: "digital-synchronous-up-counter", subjectId: "subject-9", kind: "counter", title: "3ビット同期アップカウンタ", build: (seedKey) => digitalGenerated(seedKey, "digital-synchronous-up-counter", "3ビット同期アップカウンタ", 6) },
  { id: "digital-xor-waveform", subjectId: "subject-9", kind: "logic", title: "XOR波形", build: (seedKey) => digitalGenerated(seedKey, "digital-xor-waveform", "XOR波形", 0, true) },
  { id: "digital-cyclic-down-10-2", subjectId: "subject-9", kind: "counter", title: "10→2巡回ダウンカウンタ", build: (seedKey) => digitalGenerated(seedKey, "digital-cyclic-down-10-2", "10→2巡回ダウンカウンタ", 1, true) },
  { id: "digital-sequence-detector-1001", subjectId: "subject-9", kind: "state-machine", title: "1001系列検出器", build: (seedKey) => digitalGenerated(seedKey, "digital-sequence-detector-1001", "1001系列検出器", 2, true) },
];

export const GENERATED_PRACTICE_TEMPLATE_METADATA = TEMPLATES.map(({ id, subjectId, kind, title }) => ({
  id,
  subjectId,
  kind,
  title,
}));

function normalizeComparable(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’‘]/gu, "'")
    .replace(/[“”]/gu, '"')
    .replace(/[。．,.、!?！？「」『』（）()\[\]]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function sameMultiset(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false;
  const counts = new Map<string, number>();
  for (const item of left) counts.set(item, (counts.get(item) ?? 0) + 1);
  for (const item of right) {
    const count = counts.get(item) ?? 0;
    if (count <= 0) return false;
    counts.set(item, count - 1);
  }
  return [...counts.values()].every((count) => count === 0);
}

type NumericEvaluation = Extract<GeneratedPracticeEvaluation, { type: "numeric" }>;

const FORBIDDEN_CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/u;

function visibleQuestionStrings(question: GeneratedPracticeQuestion): string[] {
  return [
    question.prompt,
    question.context,
    question.answer,
    ...((Array.isArray(question.steps) ? question.steps : []) as unknown[]),
    question.reason,
    question.explanation,
    question.formula,
    question.expandedFormula,
  ].filter((value): value is string => typeof value === "string");
}

function hasBalancedInlineMath(value: string): boolean {
  return (value.match(/\\\(/gu) ?? []).length === (value.match(/\\\)/gu) ?? []).length;
}

function parseNumericText(value: string): { value: number; unitText: string } | null {
  const normalized = value.normalize("NFKC").replace(/,/gu, "").trim();
  const match = normalized.match(/[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?/iu);
  if (!match) return null;
  const parsed = Number(match[0]);
  if (!Number.isFinite(parsed)) return null;
  return {
    value: parsed,
    unitText: normalizeUnit(`${normalized.slice(0, match.index)}${normalized.slice((match.index ?? 0) + match[0].length)}`),
  };
}

function resolveNumericUnit(
  evaluation: NumericEvaluation,
  unitText: string,
  allowOmission: boolean,
): { ok: boolean; scale: number } {
  if (unitText.length === 0) return { ok: allowOmission, scale: 1 };
  for (const [unit, scale] of Object.entries(evaluation.acceptedUnitScales ?? {})) {
    if (unitText === normalizeUnit(unit)) return { ok: Number.isFinite(scale) && scale > 0, scale };
  }
  if (evaluation.expectedUnit && unitText === normalizeUnit(evaluation.expectedUnit)) {
    return { ok: true, scale: 1 };
  }
  return { ok: false, scale: 1 };
}

function numericTextMatchesEvaluation(
  value: string,
  evaluation: NumericEvaluation,
  allowUnitOmission: boolean,
): boolean {
  const parsed = parseNumericText(value);
  if (!parsed) return false;
  if (!evaluation.expectedUnit && parsed.unitText.length > 0) return false;
  const unit = resolveNumericUnit(evaluation, parsed.unitText, allowUnitOmission);
  return unit.ok
    && Number.isFinite(evaluation.numericAnswer)
    && Number.isFinite(evaluation.tolerance)
    && Math.abs(parsed.value * unit.scale - evaluation.numericAnswer) <= evaluation.tolerance + EPSILON;
}

function normalizedAnswerMatches(answer: string, candidates: readonly string[]): boolean {
  const normalized = normalizeComparable(answer);
  return candidates.some((candidate) => typeof candidate === "string" && normalizeComparable(candidate) === normalized);
}

function semanticConflict(input: string, canonical: string): boolean {
  const value = input.normalize("NFKC").toLowerCase().replace(/\s+/gu, "");
  const expected = canonical.normalize("NFKC").toLowerCase().replace(/\s+/gu, "");
  if (/(?:ではない|じゃない|ではなく|しない|していない|しなかった|できない|不可能|不要|誤り|間違い|反対)/u.test(value)) {
    return true;
  }
  const opposites: Array<[string, string[]]> = [
    ["増加", ["減少", "減った"]],
    ["混ぜ", ["分離", "分けた"]],
    ["作", ["破壊", "壊した"]],
    ["必要", ["不要"]],
    ["正確", ["不正確"]],
    ["研究", ["放棄", "中止"]],
  ];
  return opposites.some(([expectedTerm, oppositeTerms]) =>
    expected.includes(expectedTerm) && oppositeTerms.some((term) => value.includes(term)),
  );
}

export function validateGeneratedPracticeQuestion(question: GeneratedPracticeQuestion): GeneratedPracticeValidation {
  const errors: string[] = [];
  const requiredStrings: Array<[string, unknown]> = [
    ["id", question.id],
    ["seed", question.seed],
    ["subjectName", question.subjectName],
    ["templateId", question.templateId],
    ["category", question.category],
    ["title", question.title],
    ["prompt", question.prompt],
    ["answer", question.answer],
    ["reason", question.reason],
    ["explanation", question.explanation],
    ["source.label", question.source?.label],
  ];
  for (const [label, value] of requiredStrings) {
    if (typeof value !== "string" || value.trim().length === 0) errors.push(`${label}が空です`);
  }
  if (!["number", "choice", "order", "translation", "text"].includes(question.format as string)) {
    errors.push("問題形式が不正です");
  }
  for (const value of visibleQuestionStrings(question)) {
    if (FORBIDDEN_CONTROL_CHARACTERS.test(value)) errors.push("表示文字列に制御文字があります");
    if (!hasBalancedInlineMath(value)) errors.push("インライン数式の区切りが不正です");
  }
  if (!GENERATED_PRACTICE_SUBJECTS.some((subject) => subject.id === question.subjectId)) {
    errors.push("自動生成対象外の教科です");
  }
  if ((question.subjectId as string) === "network") {
    errors.push("ネットワークは自動生成対象外です");
  }
  if (question.visual?.type === "material-mechanics" && question.subjectId !== "subject-5") {
    errors.push("材料力学図の教科が一致しません");
  }
  if (question.visual?.type === "digital-circuit" && question.subjectId !== "subject-9") {
    errors.push("デジタル回路図の教科が一致しません");
  }
  if (!Array.isArray(question.acceptedAnswers)
    || question.acceptedAnswers.length === 0
    || question.acceptedAnswers.some((answer) => typeof answer !== "string" || !answer.trim())) {
    errors.push("acceptedAnswersがありません");
  } else if (typeof question.answer === "string" && !normalizedAnswerMatches(question.answer, question.acceptedAnswers)) {
    errors.push("表示解答がacceptedAnswersと一致しません");
  }
  if (!Array.isArray(question.steps)
    || question.steps.length < 2
    || question.steps.some((step) => typeof step !== "string" || !step.trim())) {
    errors.push("途中式・解法手順が不足しています");
  }
  if (question.generation !== "on-demand" || question.provenance !== "generated-from-in-scope-material") {
    errors.push("生成元情報が不正です");
  }
  const expectedSourceReferences = GENERATED_PRACTICE_SOURCE_REFERENCES[
    question.templateId as keyof typeof GENERATED_PRACTICE_SOURCE_REFERENCES
  ];
  if (question.format === "number") {
    if (!expectedSourceReferences) {
      errors.push("数値問題の範囲内出典IDが未登録です");
    } else if (!Array.isArray(question.sourceReferenceIds)
      || question.sourceReferenceIds.length === 0
      || question.sourceReferenceIds.some((id) => typeof id !== "string" || !id.trim())
      || JSON.stringify(question.sourceReferenceIds) !== JSON.stringify(expectedSourceReferences)) {
      errors.push("数値問題の出典IDが範囲内許可リストと一致しません");
    }
  }
  if (question.templateId === "statistics-symmetric-variance"
    && (!question.expandedFormula || question.expandedFormula.includes("\\sum"))) {
    errors.push("Σを使う統計問題にはΣなしの展開式が必要です");
  }
  const safety = question.safety;
  if (!safety || safety.domainChecked !== true) errors.push("定義域チェックがありません");
  const safetyArraysValid = Boolean(safety)
    && Array.isArray(safety.finiteValues)
    && Array.isArray(safety.denominators)
    && Array.isArray(safety.radicands)
    && Array.isArray(safety.logArguments);
  if (!safetyArraysValid) {
    errors.push("安全性メタデータの配列が不正です");
  } else if (safety) {
    const allSafetyValues = [...safety.finiteValues, ...safety.denominators, ...safety.radicands, ...safety.logArguments];
    if (allSafetyValues.some((value) => !Number.isFinite(value))) errors.push("非有限値を含みます");
    if (safety.denominators.some((value) => Math.abs(value) <= EPSILON)) errors.push("0除算の可能性があります");
    if (safety.radicands.some((value) => value < 0)) errors.push("平方根の定義域外です");
    if (safety.logArguments.some((value) => value <= 0)) errors.push("対数の定義域外です");
    if (!Array.isArray(safety.notes)
      || safety.notes.length === 0
      || safety.notes.some((note) => typeof note !== "string" || !note.trim())) {
      errors.push("定義域確認メモがありません");
    }
    if (question.format === "number" && safety.finiteValues.length === 0) {
      errors.push("数値問題の有限値一覧がありません");
    }
    const computationalFormula = (question.formula ?? "")
      .replace(/\\frac\{\\partial[^{}]*\}\{\\partial[^{}]*\}/gu, "");
    if (computationalFormula.includes("\\frac") && safety.denominators.length === 0) {
      errors.push("分数式に必要な分母安全性がありません");
    }
    if (question.formula?.includes("\\sqrt") && safety.radicands.length === 0) {
      errors.push("平方根式に必要な定義域安全性がありません");
    }
    if (/\\(?:ln|log)/u.test(question.formula ?? "") && safety.logArguments.length === 0) {
      errors.push("対数式に必要な定義域安全性がありません");
    }
    if (question.format === "number") {
      for (const [key, value] of Object.entries(question.parameters ?? {})) {
        if (typeof value === "number"
          && Number.isFinite(value)
          && !safety.finiteValues.some((safeValue) => Object.is(safeValue, value))) {
          errors.push(`計算パラメータ${key}が有限値一覧にありません`);
        }
      }
    }
  }
  for (const [key, value] of Object.entries(question.parameters ?? {})) {
    if (typeof value === "number" && !Number.isFinite(value)) errors.push(`パラメータ${key}が非有限です`);
  }
  const evaluation = question.evaluation;
  if (!evaluation || typeof evaluation !== "object" || typeof (evaluation as { type?: unknown }).type !== "string") {
    errors.push("採点情報がありません");
  } else if (evaluation.type === "numeric") {
    if (question.format !== "number") errors.push("数値採点と問題形式が一致しません");
    if (!Number.isFinite(evaluation.numericAnswer)) errors.push("数値解答が非有限です");
    if (!Number.isFinite(evaluation.tolerance) || evaluation.tolerance < 0) errors.push("許容誤差が不正です");
    if (evaluation.expectedUnit !== undefined && (typeof evaluation.expectedUnit !== "string" || !evaluation.expectedUnit.trim())) {
      errors.push("期待単位が不正です");
    }
    if (evaluation.requireUnit !== undefined && typeof evaluation.requireUnit !== "boolean") {
      errors.push("単位必須設定が不正です");
    }
    if (evaluation.requireUnit && !evaluation.expectedUnit) errors.push("必須単位が定義されていません");
    if (evaluation.acceptedUnitScales !== undefined
      && (typeof evaluation.acceptedUnitScales !== "object"
        || evaluation.acceptedUnitScales === null
        || Object.entries(evaluation.acceptedUnitScales).some(([unit, scale]) => !unit.trim() || !Number.isFinite(scale) || scale <= 0))) {
      errors.push("単位換算表が不正です");
    }
    if (Number.isFinite(evaluation.numericAnswer)
      && Number.isFinite(evaluation.tolerance)
      && !numericTextMatchesEvaluation(question.answer, evaluation, !evaluation.expectedUnit)) {
      errors.push("表示解答が数値採点基準と一致しません");
    }
    if (safetyArraysValid && safety && Number.isFinite(evaluation.numericAnswer)
      && !safety.finiteValues.some((value) => Object.is(value, evaluation.numericAnswer))) {
      errors.push("数値解答が有限値一覧にありません");
    }
  } else if (evaluation.type === "ordered-tokens") {
    if (question.format !== "order") errors.push("並び替え採点と問題形式が一致しません");
    if (typeof evaluation.canonical !== "string" || !evaluation.canonical.trim()
      || !Array.isArray(evaluation.correctOrder)
      || evaluation.correctOrder.length < 2
      || evaluation.correctOrder.some((token) => typeof token !== "string" || !token.trim())) {
      errors.push("並び替え採点情報が不正です");
    } else {
      if (!question.tokens || !sameMultiset(question.tokens, evaluation.correctOrder)) errors.push("並び替え語句と正解語句が一致しません");
      if (evaluation.correctOrder.some((token) => /\s/u.test(token.trim()))) errors.push("並び替え選択肢は1語ずつである必要があります");
      if (evaluation.correctOrder.join(" ") !== evaluation.canonical) errors.push("並び替え正解が本文一文と一致しません");
      if (!normalizedAnswerMatches(question.answer, [evaluation.canonical])) errors.push("表示解答が並び替え正解と一致しません");
    }
  } else if (evaluation.type === "japanese-semantic") {
    if (question.format !== "translation") errors.push("意味採点と問題形式が一致しません");
    const groupsValid = Array.isArray(evaluation.keywordGroups)
      && evaluation.keywordGroups.length > 0
      && evaluation.keywordGroups.every((group) => Array.isArray(group)
        && group.length > 0
        && group.every((keyword) => typeof keyword === "string" && keyword.trim()));
    if (typeof evaluation.canonical !== "string" || !evaluation.canonical.trim()
      || !Array.isArray(evaluation.accepted)
      || evaluation.accepted.some((answer) => typeof answer !== "string" || !answer.trim())
      || !groupsValid
      || !Number.isInteger(evaluation.minimumKeywordGroups)
      || evaluation.minimumKeywordGroups < 1
      || evaluation.minimumKeywordGroups > (Array.isArray(evaluation.keywordGroups) ? evaluation.keywordGroups.length : 0)) {
      errors.push("意味採点の閾値が不正です");
    } else if (!normalizedAnswerMatches(question.answer, [evaluation.canonical])) {
      errors.push("表示解答が和訳模範解答と一致しません");
    }
  } else if (evaluation.type === "choice" || evaluation.type === "normalized-text") {
    if (evaluation.type === "normalized-text" && question.format !== "text") {
      errors.push("文字入力採点と問題形式が一致しません");
    }
    if (typeof evaluation.canonical !== "string" || !evaluation.canonical.trim()
      || !Array.isArray(evaluation.accepted)
      || evaluation.accepted.some((answer) => typeof answer !== "string" || !answer.trim())) {
      errors.push("文字列採点情報が不正です");
    } else if (!normalizedAnswerMatches(question.answer, [evaluation.canonical, ...evaluation.accepted])) {
      errors.push("表示解答が文字列採点基準と一致しません");
    }
    if (evaluation.type === "choice"
      && (question.format !== "choice"
        || !Array.isArray(question.options)
        || question.options.length < 2
        || !question.options.includes(evaluation.canonical))) {
      errors.push("選択肢に正解がありません");
    }
  } else {
    errors.push("採点方式が不正です");
  }
  if (question.subjectId === "subject-2") {
    const sourceChapter = question.source.chapter as string | undefined;
    if (question.source.kind !== "passage" || !sourceChapter || !ENGLISH_CHAPTERS.has(sourceChapter as "ch14" | "ch15" | "ch16" | "ch18")) {
      errors.push("英語の出典Chapterが範囲外です");
    }
    if (sourceChapter === "ch19") errors.push("Chapter 19は対象外です");
    const passage = ENGLISH_PASSAGES.find((item) => item.id === question.source.passageId && item.unit === question.source.chapter);
    const paragraph = passage?.paragraphs[question.source.paragraphIndex ?? -1];
    if (!passage || !paragraph || !question.source.excerpt || !paragraph.en.includes(question.source.excerpt)) {
      errors.push("英語抜粋が範囲本文に存在しません");
    }
    if (JSON.stringify(question).includes("ch19") || JSON.stringify(question).includes("Chapter 19")) {
      errors.push("Chapter 19の情報を含みます");
    }
    if (ENGLISH_EXCLUDED_SOURCE_MARKERS.some((marker) => JSON.stringify(question).includes(marker))) {
      errors.push("Chapter 14の対象外ブロックを含みます");
    }
  }
  return { ok: errors.length === 0, errors };
}

function assertValid(question: GeneratedPracticeQuestion): GeneratedPracticeQuestion {
  const validation = validateGeneratedPracticeQuestion(question);
  if (!validation.ok) throw new Error(`${question.templateId}: ${validation.errors.join(" / ")}`);
  return question;
}

export function generatePracticeQuestion(
  subjectId: GeneratedPracticeSubjectId,
  seed: number | string,
  options: { templateId?: string; kind?: string } = {},
): GeneratedPracticeQuestion {
  const available = TEMPLATES.filter((template) =>
    template.subjectId === subjectId
    && (!options.templateId || template.id === options.templateId)
    && (!options.kind || template.kind === options.kind),
  );
  if (available.length === 0) throw new Error(`利用できる自動生成テンプレートがありません: ${subjectId}`);
  const originalSeed = String(seed);
  const failures: string[] = [];
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const seedKey = `${originalSeed}:${attempt}`;
    const rng = createSeededRandom(seedKey);
    const template = options.templateId ? available[0] as PracticeTemplate : rng.pick(available);
    try {
      return assertValid(template.build(seedKey, rng));
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }
  throw new Error(`安全な解答付き問題を生成できませんでした: ${failures.slice(-3).join(" / ")}`);
}

export function generatePracticeSet(
  subjectId: GeneratedPracticeSubjectId,
  count: number,
  seed: number | string,
): GeneratedPracticeQuestion[] {
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error("生成数は1〜100問の整数で指定してください。");
  const templates = TEMPLATES.filter((template) => template.subjectId === subjectId);
  return Array.from({ length: count }, (_, index) => generatePracticeQuestion(
    subjectId,
    `${String(seed)}:set:${index}`,
    { templateId: templates[index % templates.length]?.id },
  ));
}

function normalizeUnit(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/[·・⋅]/gu, " ").replace(/\s+/gu, " ").trim();
}

export function gradeGeneratedPracticeAnswer(
  question: GeneratedPracticeQuestion,
  input: string,
): GeneratedPracticeGrade {
  const normalizedInput = normalizeComparable(input);
  const evaluation = question.evaluation;
  let correct = false;
  let manualReview = false;
  if (evaluation.type === "numeric") {
    correct = numericTextMatchesEvaluation(input, evaluation, !evaluation.requireUnit);
  } else if (evaluation.type === "japanese-semantic") {
    const exact = [evaluation.canonical, ...evaluation.accepted].some((answer) => normalizeComparable(answer) === normalizedInput);
    const matchedGroups = evaluation.keywordGroups.filter((group) => group.some((keyword) => normalizedInput.includes(normalizeComparable(keyword)))).length;
    const conflict = !exact && semanticConflict(input, evaluation.canonical);
    manualReview = conflict;
    correct = exact || (!conflict && matchedGroups >= evaluation.minimumKeywordGroups);
  } else if (evaluation.type === "ordered-tokens") {
    correct = normalizeComparable(evaluation.canonical) === normalizedInput;
  } else {
    correct = [evaluation.canonical, ...evaluation.accepted].some((answer) => normalizeComparable(answer) === normalizedInput);
  }
  return {
    correct,
    normalizedInput,
    expected: question.answer,
    feedback: correct
      ? "正解です。解説で根拠も確認しましょう。"
      : manualReview
        ? "否定・反対の意味を含むため自動では正解にできません。模範訳と照合してください。"
        : `正解は「${question.answer}」です。途中式と出典を確認してください。`,
    manualReview: manualReview || undefined,
  };
}
