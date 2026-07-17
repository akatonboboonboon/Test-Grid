import { ENGLISH_PASSAGES } from "./english-data";

export type GeneratedPracticeSubjectId =
  | "subject-2"
  | "subject-3"
  | "subject-4"
  | "subject-6"
  | "subject-7"
  | "subject-8";

export type GeneratedPracticeFormat = "number" | "choice" | "order" | "translation";

export type GeneratedPracticeSource = {
  kind: "passage" | "range";
  label: string;
  chapter?: "ch15" | "ch16" | "ch18";
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
    description: "Ch.15・16・18の本文抜粋から、並び替え・和訳・本文文法をその場で生成します。",
    sourceLabel: "英語ZIP教材 Ch.15・16・18",
  },
  {
    id: "subject-3",
    name: "機械力学",
    shortName: "機械力学",
    description: "振動・減衰・ばね・振り子の数値を変えた計算問題を生成します。",
    sourceLabel: "機械力学範囲ZIP＋過去問",
  },
  {
    id: "subject-4",
    name: "熱・流体力学",
    shortName: "熱・流体",
    description: "断熱変化・熱効率・理想気体の、範囲内公式だけを使う計算問題を生成します。",
    sourceLabel: "熱力学範囲ZIP＋範囲内形式3",
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
    description: "記述統計・標準化・条件付き確率・場合の数を、範囲内公式だけで生成します。",
    sourceLabel: "確率統計範囲ZIP＋範囲演習PDF",
  },
  {
    id: "subject-8",
    name: "応用数学",
    shortName: "応用数学",
    description: "ベクトル・勾配・発散・外積・グリーンの定理の数値問題を生成します。",
    sourceLabel: "応用数学範囲22枚＋追加範囲",
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

const ENGLISH_CHAPTERS = new Set(["ch15", "ch16", "ch18"] as const);
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
  "mechanical-natural-frequency": ["md-f-wn"],
  "mechanical-series-springs": ["md-f-series", "md-f-wn"],
  "mechanical-damping-ratio": ["md-f-zeta"],
  "mechanical-pendulum-length": ["md-f-simple-pendulum"],
  "mechanical-log-decrement": ["md-f-logdec-n"],
  "thermo-ideal-gas": ["th-q-poly-mass"],
  "thermo-adiabatic-temperature": ["th-ad-tv"],
  "thermo-otto-efficiency": ["th-otto-efficiency"],
  "thermo-carnot-efficiency": ["th-carnot-efficiency"],
  "smart-first-order-step": ["smart-first-order-step"],
  "smart-first-order-pole": ["smart-pole-definition"],
  "smart-negative-feedback": ["smart-negative-feedback"],
  "smart-steady-state": ["smart-first-order-step"],
  "statistics-symmetric-variance": ["stats-variance"],
  "statistics-z-score": ["stats-standardization"],
  "statistics-bayes": ["stats-bayes"],
  "statistics-combination": ["stats-combination"],
  "applied-vector-norm": ["am-vector-norm"],
  "applied-orthogonal-unknown": ["am-orthogonal"],
  "applied-directional-derivative": ["am-directional"],
  "applied-divergence-point": ["am-divergence"],
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
  };
}

type EnglishSourceSpec = {
  chapter: "ch15" | "ch16" | "ch18";
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
  { chapter: "ch15", passageId: "passage-amyris", paragraphIndex: 1 },
  { chapter: "ch15", passageId: "passage-amyris", paragraphIndex: 8 },
  { chapter: "ch16", passageId: "passage-weather", paragraphIndex: 2 },
  { chapter: "ch16", passageId: "passage-weather", paragraphIndex: 3 },
  { chapter: "ch18", passageId: "passage-wheelchair", paragraphIndex: 4 },
  { chapter: "ch18", passageId: "passage-wheelchair", paragraphIndex: 8 },
];

const ENGLISH_TRANSLATION_SOURCES: Array<EnglishSourceSpec & { keywordGroups: string[][] }> = [
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

function chunkEnglish(excerpt: string, rng: SeededRandom): string[] {
  const words = excerpt.split(/\s+/u);
  const chunks: string[] = [];
  let index = 0;
  while (index < words.length) {
    const remaining = words.length - index;
    const size = remaining <= 4 ? remaining : rng.pick([2, 3, 3, 4]);
    chunks.push(words.slice(index, index + size).join(" "));
    index += size;
  }
  return chunks;
}

function englishOrder(seedKey: string, rng: SeededRandom): GeneratedPracticeQuestion {
  const spec = rng.pick(ENGLISH_ORDER_SOURCES);
  const { excerpt, source } = resolveEnglishSource(spec);
  const correctOrder = chunkEnglish(excerpt, rng);
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
    prompt: "本文から抜き出した一文です。語句を正しい順番へ並べ替えてください。",
    context: `出典：${source.label}（本文そのものは解答表示後に確認できます）`,
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
    parameters: { chapter: spec.chapter, paragraph: spec.paragraphIndex + 1, chunkCount: correctOrder.length },
    evaluation: { type: "ordered-tokens", canonical: excerpt, correctOrder },
    safety: baseSafety({ notes: ["本文に実在する一文を完全一致で抽出", "語句の重複を保持"] }),
    generation: "on-demand",
    provenance: "generated-from-in-scope-material",
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
  const mass = rng.pick([2, 3, 4, 5, 6, 8, 10, 12]);
  const omega = rng.pick([5, 8, 10, 12, 15, 18, 20, 25]);
  const stiffness = mass * omega ** 2;
  return numericQuestion(seedKey, {
    subjectId: "subject-3",
    templateId: "mechanical-natural-frequency",
    category: "不減衰自由振動",
    title: "固有角振動数",
    prompt: String.raw`質量 \(m=${mass}\,\mathrm{kg}\)、ばね定数 \(k=${stiffness}\,\mathrm{N/m}\) の1自由度系の固有角振動数を求めよ。`,
    answerValue: omega,
    digits: 3,
    tolerance: 0.02,
    unit: "rad/s",
    requireUnit: true,
    acceptedUnitScales: { "rad/s": 1, "rad s^-1": 1 },
    formula: "\\omega_n=\\sqrt{\\frac{k}{m}}",
    steps: [`\\(\\frac{k}{m}=\\frac{${stiffness}}{${mass}}=${omega ** 2}\\)`, `\\(\\omega_n=\\sqrt{${omega ** 2}}=${omega}\\,\\mathrm{rad/s}\\)`],
    reason: "固有角振動数は剛性と質量の比の平方根で決まります。",
    explanation: "ばね定数を質量で割ってから平方根を取り、角振動数なので単位はrad/sです。",
    source: rangeSource("機械力学範囲・不減衰振動", [1, 2, 3]),
    parameters: { mass, stiffness, omega },
    safety: baseSafety({ finiteValues: [mass, stiffness, omega], denominators: [mass], radicands: [stiffness / mass] }),
  });
}

function mechanicalSeries(seedKey: string, rng: SeededRandom) {
  const k1 = rng.pick([200, 300, 400, 500, 600, 800]);
  const k2 = rng.pick([300, 400, 600, 900, 1200]);
  const mass = rng.pick([2, 3, 4, 5, 6]);
  const denominator = k1 + k2;
  const equivalent = (k1 * k2) / denominator;
  const omega = Math.sqrt(equivalent / mass);
  return numericQuestion(seedKey, {
    subjectId: "subject-3",
    templateId: "mechanical-series-springs",
    category: "等価ばね定数",
    title: "直列ばね系の固有角振動数",
    prompt: String.raw`\(k_1=${k1}\,\mathrm{N/m}\)、\(k_2=${k2}\,\mathrm{N/m}\) を直列接続し、質量 \(m=${mass}\,\mathrm{kg}\) を付けた。固有角振動数を求めよ。`,
    answerValue: omega,
    digits: 4,
    tolerance: 0.02,
    unit: "rad/s",
    formula: "\\begin{aligned}k_{eq}&=\\frac{k_1k_2}{k_1+k_2}\\\\\\omega_n&=\\sqrt{\\frac{k_{eq}}{m}}\\end{aligned}",
    steps: [`\\(k_{eq}=\\frac{${k1}\\times${k2}}{${k1}+${k2}}=${formatNumber(equivalent, 4)}\\,\\mathrm{N/m}\\)`, `\\(\\omega_n=\\sqrt{\\frac{${formatNumber(equivalent, 4)}}{${mass}}}=${formatNumber(omega, 4)}\\,\\mathrm{rad/s}\\)`],
    reason: "直列ばねは先に等価ばね定数へまとめる必要があります。",
    explanation: "直列合成を単純な和にしないことが要点です。合成後は通常の1自由度系として計算します。",
    source: rangeSource("機械力学範囲・等価剛性", [3, 4, 5]),
    parameters: { k1, k2, mass, equivalent },
    safety: baseSafety({ finiteValues: [k1, k2, mass, equivalent, omega], denominators: [denominator, mass], radicands: [equivalent / mass] }),
  });
}

function mechanicalDamping(seedKey: string, rng: SeededRandom) {
  const mass = rng.pick([2, 4, 5, 8, 10]);
  const omega = rng.pick([10, 12, 15, 20, 25]);
  const zeta = rng.pick([0.05, 0.08, 0.1, 0.15, 0.2, 0.25]);
  const stiffness = mass * omega ** 2;
  const damping = 2 * zeta * mass * omega;
  const denominator = 2 * Math.sqrt(mass * stiffness);
  return numericQuestion(seedKey, {
    subjectId: "subject-3",
    templateId: "mechanical-damping-ratio",
    category: "粘性減衰振動",
    title: "減衰比",
    prompt: String.raw`\(m=${mass}\,\mathrm{kg}\)、\(k=${stiffness}\,\mathrm{N/m}\)、\(c=${formatNumber(damping, 3)}\,\mathrm{N\,s/m}\) の減衰比 \(\zeta\) を求めよ。`,
    answerValue: zeta,
    digits: 4,
    tolerance: 0.001,
    formula: "\\zeta=\\frac{c}{2\\sqrt{mk}}",
    steps: [`\\(2\\sqrt{mk}=2\\sqrt{${mass}\\times${stiffness}}=${formatNumber(denominator, 3)}\\)`, `\\(\\zeta=\\frac{${formatNumber(damping, 3)}}{${formatNumber(denominator, 3)}}=${formatNumber(zeta, 4)}\\)`],
    reason: "減衰比は実際の減衰係数を臨界減衰係数で割った無次元量です。",
    explanation: "分母と分子の単位が消えるため、答えに単位は付きません。",
    source: rangeSource("機械力学範囲・粘性減衰", [6, 10, 11]),
    parameters: { mass, stiffness, damping, zeta },
    safety: baseSafety({ finiteValues: [mass, stiffness, damping, denominator, zeta], denominators: [denominator], radicands: [mass * stiffness] }),
  });
}

function mechanicalPendulum(seedKey: string, rng: SeededRandom) {
  const period = rng.pick([1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4]);
  const gravity = 9.8;
  const pi = 3.14;
  const denominator = 4 * pi ** 2;
  const length = (gravity * period ** 2) / denominator;
  return numericQuestion(seedKey, {
    subjectId: "subject-3",
    templateId: "mechanical-pendulum-length",
    category: "単振り子",
    title: "周期から振り子長さ",
    prompt: String.raw`単振り子の周期が \(T=${period.toFixed(2)}\,\mathrm{s}\) である。\(g=9.80\,\mathrm{m/s^2}\)、\(\pi=3.14\) として長さを求めよ。`,
    answerValue: length,
    digits: 4,
    tolerance: 0.002,
    unit: "m",
    formula: "l=\\frac{gT^2}{4\\pi^2}",
    steps: [`\\(l=\\frac{9.80\\times${period.toFixed(2)}^2}{4\\times3.14^2}\\)`, `\\(l=${formatNumber(length, 4)}\\,\\mathrm m\\)`],
    reason: "単振り子の周期式を長さについて解きます。",
    explanation: "試験条件に合わせ、円周率は3.14を使って最後に丸めます。",
    source: rangeSource("機械力学過去問・単振り子", [4]),
    parameters: { period, gravity, pi, length },
    safety: baseSafety({ finiteValues: [period, gravity, pi, length], denominators: [denominator], radicands: [] }),
  });
}

function mechanicalDecrement(seedKey: string, rng: SeededRandom) {
  const cycles = rng.pick([4, 5, 6, 8, 10, 12]);
  const remaining = rng.pick([0.8, 0.6, 0.5, 0.4, 0.25, 0.2]);
  const logArgument = 1 / remaining;
  const decrement = Math.log(logArgument) / cycles;
  return numericQuestion(seedKey, {
    subjectId: "subject-3",
    templateId: "mechanical-log-decrement",
    category: "対数減衰率",
    title: "複数周期の振幅から対数減衰率",
    prompt: String.raw`${cycles}周期後の振幅が初期振幅の${remaining * 100}%になった。1周期あたりの対数減衰率 \(\delta\) を求めよ。`,
    answerValue: decrement,
    digits: 5,
    tolerance: 0.0002,
    formula: "\\delta=\\frac{1}{n}\\ln\\!\\left(\\frac{x_i}{x_{i+n}}\\right)",
    steps: [`\\(\\frac{x_i}{x_{i+n}}=\\frac{1}{${remaining}}=${formatNumber(logArgument, 4)}\\)`, `\\(\\delta=\\frac{\\ln(${formatNumber(logArgument, 4)})}{${cycles}}=${formatNumber(decrement, 5)}\\)`],
    reason: "減少した割合ではなく、残っている振幅を分母に置きます。",
    explanation: "複数周期離れたピークを使うため、自然対数を周期数で割ります。",
    source: rangeSource("機械力学範囲・対数減衰率", [12, 13, 14]),
    parameters: { cycles, remaining, logArgument, decrement },
    safety: baseSafety({ finiteValues: [cycles, remaining, logArgument, decrement], denominators: [cycles, remaining], logArguments: [logArgument] }),
  });
}

function thermoIdealGas(seedKey: string, rng: SeededRandom) {
  const mass = rng.pick([0.5, 0.8, 1, 1.2, 1.5, 2]);
  const gasConstant = 0.287;
  const temperature = rng.pick([300, 320, 350, 400, 450, 500]);
  const volume = rng.pick([0.2, 0.25, 0.4, 0.5, 0.8, 1]);
  const pressure = (mass * gasConstant * temperature) / volume;
  return numericQuestion(seedKey, {
    subjectId: "subject-4",
    templateId: "thermo-ideal-gas",
    category: "理想気体",
    title: "状態方程式",
    prompt: String.raw`空気 \(m=${mass}\,\mathrm{kg}\)、\(T=${temperature}\,\mathrm K\)、\(V=${volume}\,\mathrm{m^3}\) とする。\(R=0.287\,\mathrm{kJ/(kg\,K)}\) を用いて圧力を求めよ。`,
    answerValue: pressure,
    digits: 3,
    tolerance: 0.2,
    unit: "kPa",
    formula: "pV=mRT",
    steps: [`\\(p=\\frac{mRT}{V}=\\frac{${mass}\\times0.287\\times${temperature}}{${volume}}\\)`, `\\(p=${formatNumber(pressure, 3)}\\,\\mathrm{kPa}\\)`],
    reason: "kJとkPa・m³は整合するため、与えられた単位のまま代入できます。",
    explanation: "絶対温度Kと絶対圧力を使い、体積で割ります。",
    source: rangeSource("熱力学範囲・理想気体と断熱関係", [1]),
    parameters: { mass, gasConstant, temperature, volume, pressure },
    safety: baseSafety({ finiteValues: [mass, gasConstant, temperature, volume, pressure], denominators: [volume] }),
  });
}

function thermoAdiabatic(seedKey: string, rng: SeededRandom) {
  const t1 = rng.pick([280, 300, 320, 350]);
  const p1 = rng.pick([100, 120, 150]);
  const ratio = rng.pick([2, 3, 4, 5, 6]);
  const p2 = p1 * ratio;
  const kappa = 1.4;
  const exponent = (kappa - 1) / kappa;
  const t2 = t1 * ratio ** exponent;
  return numericQuestion(seedKey, {
    subjectId: "subject-4",
    templateId: "thermo-adiabatic-temperature",
    category: "断熱変化",
    title: "断熱圧縮後の温度",
    prompt: String.raw`空気を \(p_1=${p1}\,\mathrm{kPa},\ T_1=${t1}\,\mathrm K\) から \(p_2=${p2}\,\mathrm{kPa}\) まで可逆断熱圧縮する。\(\kappa=1.40\) として \(T_2\) を求めよ。`,
    answerValue: t2,
    digits: 2,
    tolerance: 0.5,
    unit: "K",
    formula: "\\frac{T_2}{T_1}=\\left(\\frac{p_2}{p_1}\\right)^{\\frac{\\kappa-1}{\\kappa}}",
    steps: [`\\(\\frac{p_2}{p_1}=\\frac{${p2}}{${p1}}=${ratio}\\)`, `\\(T_2=${t1}\\times${ratio}^{\\frac{0.4}{1.4}}=${formatNumber(t2, 2)}\\,\\mathrm K\\)`],
    reason: "理想気体の可逆断熱関係を温度と圧力の形で使います。",
    explanation: "圧縮なので圧力比は1より大きく、温度も上昇します。",
    source: rangeSource("熱力学範囲・断熱変化", [1, 2]),
    parameters: { t1, p1, p2, ratio, kappa, exponent, t2 },
    safety: baseSafety({ finiteValues: [t1, p1, p2, ratio, kappa, exponent, t2], denominators: [p1, kappa], radicands: [], notes: ["圧力と温度は絶対値で正", "圧力比は正"] }),
  });
}

function thermoOtto(seedKey: string, rng: SeededRandom) {
  const compressionRatio = rng.pick([6, 7, 8, 9, 10, 12]);
  const kappa = 1.4;
  const efficiency = 1 - 1 / compressionRatio ** (kappa - 1);
  return numericQuestion(seedKey, {
    subjectId: "subject-4",
    templateId: "thermo-otto-efficiency",
    category: "オットーサイクル",
    title: "理論熱効率",
    prompt: String.raw`空気標準オットーサイクルの圧縮比を \(\varepsilon=${compressionRatio}\)、比熱比を \(\kappa=1.40\) とする。理論熱効率を百分率で求めよ。`,
    answerValue: efficiency * 100,
    digits: 2,
    tolerance: 0.2,
    unit: "%",
    formula: "\\eta_{th}=1-\\frac{1}{\\varepsilon^{\\kappa-1}}",
    steps: [`\\(\\varepsilon^{\\kappa-1}=${compressionRatio}^{0.4}=${formatNumber(compressionRatio ** 0.4, 4)}\\)`, `\\(\\eta_{th}=1-\\frac{1}{${formatNumber(compressionRatio ** 0.4, 4)}}=${formatNumber(efficiency, 4)}=${formatNumber(efficiency * 100, 2)}\\%\\)`],
    reason: "オットーサイクルの効率は圧縮比と比熱比だけで決まります。",
    explanation: "式の値は0〜1なので、最後に100を掛けて百分率へ直します。",
    source: rangeSource("熱力学範囲・オットーサイクル", [4, 5]),
    parameters: { compressionRatio, kappa, efficiency },
    safety: baseSafety({ finiteValues: [compressionRatio, kappa, efficiency, efficiency * 100], denominators: [compressionRatio ** (kappa - 1)], notes: ["圧縮比は1より大きい"] }),
  });
}

function thermoCarnot(seedKey: string, rng: SeededRandom) {
  const low = rng.pick([280, 300, 320, 350, 373]);
  const gap = rng.pick([150, 200, 250, 300, 400]);
  const high = low + gap;
  const efficiency = 1 - low / high;
  return numericQuestion(seedKey, {
    subjectId: "subject-4",
    templateId: "thermo-carnot-efficiency",
    category: "カルノーサイクル",
    title: "カルノー熱機関の効率",
    prompt: String.raw`高温熱源 \(T_H=${high}\,\mathrm K\)、低温熱源 \(T_L=${low}\,\mathrm K\) のカルノー熱機関の理論効率を百分率で求めよ。`,
    answerValue: efficiency * 100,
    digits: 2,
    tolerance: 0.2,
    unit: "%",
    formula: "\\eta_C=1-\\frac{T_L}{T_H}",
    steps: [`\\(\\frac{T_L}{T_H}=\\frac{${low}}{${high}}=${formatNumber(low / high, 4)}\\)`, `\\(\\eta_C=${formatNumber(efficiency, 4)}=${formatNumber(efficiency * 100, 2)}\\%\\)`],
    reason: "熱源温度は必ず絶対温度Kで式へ入れます。",
    explanation: "高温熱源が低温熱源より高いので、効率は0〜100%の範囲に入ります。",
    source: rangeSource("熱力学範囲・カルノーサイクル", [6, 7]),
    parameters: { high, low, efficiency },
    safety: baseSafety({ finiteValues: [high, low, efficiency, efficiency * 100], denominators: [high], notes: ["0<T_L<T_Hを確認"] }),
  });
}

function thermoEntropy(seedKey: string, rng: SeededRandom) {
  const mass = rng.pick([1, 1.5, 2, 2.5, 3]);
  const cv = rng.pick([0.718, 0.72, 1.0]);
  const t1 = rng.pick([280, 300, 320, 350]);
  const ratio = rng.pick([1.2, 1.5, 2, 2.5]);
  const t2 = t1 * ratio;
  const logArgument = t2 / t1;
  const entropy = mass * cv * Math.log(logArgument);
  return numericQuestion(seedKey, {
    subjectId: "subject-4",
    templateId: "thermo-entropy-isochoric",
    category: "エントロピー",
    title: "等容加熱のエントロピー変化",
    prompt: String.raw`質量 \(m=${mass}\,\mathrm{kg}\)、定容比熱 \(c_v=${cv}\,\mathrm{kJ/(kg\,K)}\) の理想気体を等容で \(T_1=${t1}\,\mathrm K\) から \(T_2=${formatNumber(t2, 1)}\,\mathrm K\) へ加熱した。エントロピー変化を求めよ。`,
    answerValue: entropy,
    digits: 4,
    tolerance: 0.002,
    unit: "kJ/K",
    formula: "\\Delta S=mc_v\\ln\\!\\left(\\frac{T_2}{T_1}\\right)",
    steps: [`\\(\\frac{T_2}{T_1}=${formatNumber(logArgument, 4)}\\)`, `\\(\\Delta S=${mass}\\times${cv}\\times\\ln(${formatNumber(logArgument, 4)})=${formatNumber(entropy, 4)}\\,\\mathrm{kJ/K}\\)`],
    reason: "等容変化では体積比の項が0になり、温度比だけが残ります。",
    explanation: "加熱なので温度比は1より大きく、エントロピー変化は正です。",
    source: rangeSource("熱力学範囲・エントロピー", [3, 4]),
    parameters: { mass, cv, t1, t2, logArgument, entropy },
    safety: baseSafety({ finiteValues: [mass, cv, t1, t2, logArgument, entropy], denominators: [t1], logArguments: [logArgument], notes: ["絶対温度は正", "加熱なので温度比>1"] }),
  });
}

function smartStep(seedKey: string, rng: SeededRandom) {
  const gain = rng.pick([1, 2, 3, 4, 5, 8, 10]);
  const timeConstant = rng.pick([0.5, 1, 1.5, 2, 2.5, 3]);
  const multiple = rng.pick([1, 2, 3, 4]);
  const time = timeConstant * multiple;
  const output = gain * (1 - Math.exp(-multiple));
  return numericQuestion(seedKey, {
    subjectId: "subject-6",
    templateId: "smart-first-order-step",
    category: "一次遅れ応答",
    title: "一次遅れのステップ応答",
    prompt: String.raw`\(G(s)=\frac{${gain}}{${timeConstant}s+1}\) に単位ステップ入力を加える。\(t=${formatNumber(time, 2)}\,\mathrm s\) の出力 \(y(t)\) を求めよ。`,
    answerValue: output,
    digits: 4,
    tolerance: 0.002,
    formula: "y(t)=K\\left(1-e^{-\\frac{t}{T}}\\right)",
    steps: [`\\(\\frac{t}{T}=\\frac{${formatNumber(time, 2)}}{${timeConstant}}=${multiple}\\)`, `\\(y=${gain}(1-e^{-${multiple}})=${formatNumber(output, 4)}\\)`],
    reason: "単位ステップに対する一次遅れ応答へ、ゲインと時定数をそのまま代入します。",
    explanation: `${multiple}時定数後なので、最終値${gain}の${formatNumber((1 - Math.exp(-multiple)) * 100, 1)}%まで応答しています。`,
    source: rangeSource("スマート制御範囲・一次遅れ＋教科書p.65〜68", [65, 66, 67, 68]),
    parameters: { gain, timeConstant, multiple, time, output },
    safety: baseSafety({ finiteValues: [gain, timeConstant, multiple, time, output], denominators: [timeConstant], notes: ["時定数は正", "指数関数の引数は有限"] }),
  });
}

function smartPole(seedKey: string, rng: SeededRandom) {
  const timeConstant = rng.pick([0.2, 0.25, 0.4, 0.5, 1, 1.25, 2, 2.5]);
  const pole = -1 / timeConstant;
  return numericQuestion(seedKey, {
    subjectId: "subject-6",
    templateId: "smart-first-order-pole",
    category: "極と安定性",
    title: "一次遅れ要素の極",
    prompt: String.raw`伝達関数 \(G(s)=\frac{K}{${timeConstant}s+1}\) の極を求めよ。`,
    answerValue: pole,
    digits: 4,
    tolerance: 0.001,
    formula: "s=-\\frac{1}{T}",
    steps: [`\\(${timeConstant}s+1=0\\)`, `\\(s=-\\frac{1}{${timeConstant}}=${formatNumber(pole, 4)}\\)`],
    reason: "極は伝達関数の分母を0にするsです。",
    explanation: "時定数が正なので極は負の実軸上にあり、この一次系は安定です。",
    source: rangeSource("スマート制御範囲・極と安定性"),
    parameters: { timeConstant, pole },
    safety: baseSafety({ finiteValues: [timeConstant, pole], denominators: [timeConstant], notes: ["時定数T>0"] }),
  });
}

function smartFeedback(seedKey: string, rng: SeededRandom) {
  const forward = rng.pick([1, 2, 3, 4, 5, 8, 10]);
  const feedback = rng.pick([0.2, 0.25, 0.5, 1, 2]);
  const denominator = 1 + forward * feedback;
  const closed = forward / denominator;
  return numericQuestion(seedKey, {
    subjectId: "subject-6",
    templateId: "smart-negative-feedback",
    category: "フィードバック",
    title: "負帰還の閉ループゲイン",
    prompt: String.raw`前向き要素の定常ゲインを \(G=${forward}\)、帰還要素を \(H=${feedback}\) とする負帰還系の閉ループ定常ゲインを求めよ。`,
    answerValue: closed,
    digits: 4,
    tolerance: 0.002,
    formula: "G_{cl}=\\frac{G}{1+GH}",
    steps: [`\\(1+GH=1+${forward}\\times${feedback}=${formatNumber(denominator, 4)}\\)`, `\\(G_{cl}=\\frac{${forward}}{${formatNumber(denominator, 4)}}=${formatNumber(closed, 4)}\\)`],
    reason: "負帰還なので分母は1+GHです。",
    explanation: "正帰還の1−GHと取り違えないことが要点です。",
    source: rangeSource("スマート制御範囲・フィードバックとゲインK"),
    parameters: { forward, feedback, denominator, closed },
    safety: baseSafety({ finiteValues: [forward, feedback, denominator, closed], denominators: [denominator], notes: ["負帰還かつG,H>0なので分母>1"] }),
  });
}

function smartSteadyState(seedKey: string, rng: SeededRandom) {
  const gain = rng.pick([1, 2, 3, 4, 5, 8, 10]);
  const input = 1;
  const finalValue = gain * input;
  return numericQuestion(seedKey, {
    subjectId: "subject-6",
    templateId: "smart-steady-state",
    category: "最終値",
    title: "一次遅れ系の定常値",
    prompt: String.raw`安定な一次遅れ系 \(G(s)=\frac{${gain}}{Ts+1}\) に単位ステップ入力を加える。定常出力を求めよ。`,
    answerValue: finalValue,
    digits: 3,
    tolerance: 0.001,
    formula: "y(\\infty)=K",
    steps: [`\\(G(0)=${gain}\\)`, `単位ステップなので \\(y(\\infty)=G(0)=${formatNumber(finalValue, 3)}\\)`],
    reason: "範囲資料で扱う単位ステップでは、安定な一次遅れ系の定常値は直流ゲインKです。",
    explanation: "時定数Tは応答速度を変えますが、この問題の定常値には影響しません。",
    source: rangeSource("スマート制御範囲・伝達関数とステップ応答"),
    parameters: { gain, input, finalValue },
    safety: baseSafety({ finiteValues: [gain, input, finalValue], notes: ["安定な一次遅れ系を使用"] }),
  });
}

function smartSettling(seedKey: string, rng: SeededRandom) {
  const timeConstant = rng.pick([0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 3]);
  const band = rng.pick([0.05, 0.02, 0.01]);
  const time = -timeConstant * Math.log(band);
  return numericQuestion(seedKey, {
    subjectId: "subject-6",
    templateId: "smart-settling-band",
    category: "一次遅れ応答",
    title: "誤差帯へ入る時刻",
    prompt: String.raw`時定数 \(T=${timeConstant}\,\mathrm s\) の一次遅れ応答が、最終値に対する誤差${band * 100}%以内へ初めて入る時刻を求めよ。`,
    answerValue: time,
    digits: 4,
    tolerance: 0.01,
    unit: "s",
    formula: "t=-T\\ln\\varepsilon",
    steps: [`\\(e^{-\\frac{t}{T}}=${band}\\)`, `\\(t=-${timeConstant}\\ln(${band})=${formatNumber(time, 4)}\\,\\mathrm s\\)`],
    reason: "一次遅れの残留誤差は \\(e^{-\\frac{t}{T}}\\) です。",
    explanation: "誤差率を小数へ直して自然対数を取り、時定数を掛けます。",
    source: rangeSource("スマート制御教科書p.65〜68・一次遅れグラフ", [65, 66, 67, 68]),
    parameters: { timeConstant, band, time },
    safety: baseSafety({ finiteValues: [timeConstant, band, time], denominators: [timeConstant], logArguments: [band], notes: ["0<誤差率<1", "時定数>0"] }),
  });
}

function statsMeanVariance(seedKey: string, rng: SeededRandom) {
  const center = rng.int(5, 30);
  const spread = rng.int(1, 9);
  const values = [center - spread, center, center + spread];
  const variance = (2 * spread ** 2) / 3;
  return numericQuestion(seedKey, {
    subjectId: "subject-7",
    templateId: "statistics-symmetric-variance",
    category: "記述統計",
    title: "母分散",
    prompt: String.raw`データ \(${values.join(",")}\) の母分散を求めよ。`,
    answerValue: variance,
    digits: 4,
    tolerance: 0.002,
    formula: "\\sigma^2=\\frac{1}{n}\\sum_{i=1}^{n}(x_i-\\bar{x})^2",
    expandedFormula: `\\sigma^2=\\frac{(${values[0]}-${center})^2+(${values[1]}-${center})^2+(${values[2]}-${center})^2}{3}`,
    steps: [`\\(\\bar{x}=\\frac{${values.join("+")}}{3}=${center}\\)`, `\\(\\sigma^2=\\frac{(-${spread})^2+0^2+${spread}^2}{3}=${formatNumber(variance, 4)}\\)`],
    reason: "母分散なので偏差平方和をデータ数3で割ります。",
    explanation: "不偏分散のようにn−1で割らないことに注意します。",
    source: rangeSource("確率統計範囲・記述統計"),
    parameters: { center, spread, x1: values[0], x2: values[1], x3: values[2], variance },
    safety: baseSafety({ finiteValues: [center, spread, ...values, variance], denominators: [3] }),
  });
}

function statsZScore(seedKey: string, rng: SeededRandom) {
  const mean = rng.pick([40, 50, 60, 70]);
  const deviation = rng.pick([4, 5, 8, 10, 12]);
  const multiplier = rng.pick([-2, -1.5, -1, 1, 1.5, 2]);
  const value = mean + deviation * multiplier;
  return numericQuestion(seedKey, {
    subjectId: "subject-7",
    templateId: "statistics-z-score",
    category: "標準化",
    title: "z得点",
    prompt: String.raw`平均 \(\mu=${mean}\)、標準偏差 \(\sigma=${deviation}\) の分布で、値 \(x=${value}\) のz得点を求めよ。`,
    answerValue: multiplier,
    digits: 3,
    tolerance: 0.001,
    formula: "z=\\frac{x-\\mu}{\\sigma}",
    steps: [`\\(x-\\mu=${value}-${mean}=${formatNumber(value - mean, 3)}\\)`, `\\(z=\\frac{${formatNumber(value - mean, 3)}}{${deviation}}=${multiplier}\\)`],
    reason: "平均との差を標準偏差何個分かに直すのが標準化です。",
    explanation: "平均との差が負ならz得点も負になります。",
    source: rangeSource("確率統計範囲・標準化と正規分布"),
    parameters: { mean, deviation, value, multiplier },
    safety: baseSafety({ finiteValues: [mean, deviation, value, multiplier], denominators: [deviation], notes: ["標準偏差>0"] }),
  });
}

function statsBayes(seedKey: string, rng: SeededRandom) {
  const prevalence = rng.pick([0.05, 0.1, 0.2, 0.25, 0.3]);
  const sensitivity = rng.pick([0.8, 0.85, 0.9, 0.95]);
  const falsePositive = rng.pick([0.02, 0.05, 0.1, 0.15]);
  const denominator = sensitivity * prevalence + falsePositive * (1 - prevalence);
  const posterior = (sensitivity * prevalence) / denominator;
  return numericQuestion(seedKey, {
    subjectId: "subject-7",
    templateId: "statistics-bayes",
    category: "条件付き確率",
    title: "ベイズの定理",
    prompt: String.raw`事象Aの事前確率が${prevalence}、\(P(B\mid A)=${sensitivity}\)、\(P(B\mid A^c)=${falsePositive}\) である。Bが起きたときの \(P(A\mid B)\) を求めよ。`,
    answerValue: posterior,
    digits: 4,
    tolerance: 0.002,
    formula: "P(A\\mid B)=\\frac{P(B\\mid A)P(A)}{P(B\\mid A)P(A)+P(B\\mid A^c)P(A^c)}",
    steps: [`\\(P(B)=${sensitivity}\\times${prevalence}+${falsePositive}\\times${formatNumber(1 - prevalence, 2)}=${formatNumber(denominator, 4)}\\)`, `\\(P(A\\mid B)=\\frac{${formatNumber(sensitivity * prevalence, 4)}}{${formatNumber(denominator, 4)}}=${formatNumber(posterior, 4)}\\)`],
    reason: "分母にはAの場合とAでない場合の両方からBが起きる確率を足します。",
    explanation: "感度だけを答えず、Bが観測された後の確率へ更新します。",
    source: rangeSource("確率統計範囲・条件付き確率とベイズ"),
    parameters: { prevalence, sensitivity, falsePositive, denominator, posterior },
    safety: baseSafety({ finiteValues: [prevalence, sensitivity, falsePositive, denominator, posterior], denominators: [denominator], notes: ["全確率P(B)>0", "すべての確率は0〜1"] }),
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
  const n = rng.int(5, 12);
  const r = rng.int(2, Math.min(5, n - 1));
  const answer = combination(n, r);
  const denominator = factorial(r) * factorial(n - r);
  return numericQuestion(seedKey, {
    subjectId: "subject-7",
    templateId: "statistics-combination",
    category: "場合の数",
    title: "組合せ",
    prompt: String.raw`${n}人から順序を区別せず${r}人を選ぶ方法は何通りか。`,
    answerValue: answer,
    digits: 0,
    tolerance: 0,
    formula: "{}_nC_r=\\frac{n!}{r!(n-r)!}",
    steps: [`\\({}_{${n}}C_{${r}}=\\frac{${n}!}{${r}!(${n}-${r})!}\\)`, `\\(=${answer}\\)`],
    reason: "選ばれた人の並び順を区別しないので順列ではなく組合せです。",
    explanation: "同じメンバーの並べ替えを重複して数えないようr!で割ります。",
    source: rangeSource("確率統計範囲・順列と組合せ"),
    parameters: { n, r, answer },
    safety: baseSafety({ finiteValues: [n, r, answer], denominators: [denominator], notes: ["0<r<n", "階乗は安全な整数範囲"] }),
  });
}

function statsEntropy(seedKey: string, rng: SeededRandom) {
  const denominator = rng.pick([4, 8, 16]);
  const numerator = rng.int(1, denominator - 1);
  const probability = numerator / denominator;
  const information = -Math.log2(probability);
  return numericQuestion(seedKey, {
    subjectId: "subject-7",
    templateId: "statistics-information-content",
    category: "情報量・エントロピー",
    title: "自己情報量",
    prompt: String.raw`確率 \(p=\frac{${numerator}}{${denominator}}\) の事象が起きたときの自己情報量を求めよ。底は2とする。`,
    answerValue: information,
    digits: 4,
    tolerance: 0.002,
    unit: "bit",
    formula: "I(p)=-\\log_2 p",
    steps: [`\\(p=\\frac{${numerator}}{${denominator}}=${formatNumber(probability, 4)}\\)`, `\\(I=-\\log_2(${formatNumber(probability, 4)})=${formatNumber(information, 4)}\\,\\mathrm{bit}\\)`],
    reason: "起こりにくい事象ほど情報量が大きくなります。",
    explanation: "確率は0より大きく1以下なので対数が定義され、答えは0以上になります。",
    source: rangeSource("確率統計範囲・情報量とエントロピー"),
    parameters: { numerator, denominator, probability, information },
    safety: baseSafety({ finiteValues: [numerator, denominator, probability, information], denominators: [denominator], logArguments: [probability], notes: ["0<p<1"] }),
  });
}

function appliedNorm(seedKey: string, rng: SeededRandom) {
  const triple = rng.pick([[3, 4, 0, 5], [1, 2, 2, 3], [2, 3, 6, 7], [4, 4, 7, 9], [6, 6, 7, 11]] as const);
  const signs = [rng.pick([-1, 1]), rng.pick([-1, 1]), rng.pick([-1, 1])];
  const [a, b, c, norm] = triple;
  const x = a * signs[0];
  const y = b * signs[1];
  const z = c * signs[2];
  return numericQuestion(seedKey, {
    subjectId: "subject-8",
    templateId: "applied-vector-norm",
    category: "ベクトル",
    title: "ベクトルの大きさ",
    prompt: String.raw`ベクトル \(\mathbf a=(${x},${y},${z})\) の大きさを求めよ。`,
    answerValue: norm,
    digits: 3,
    tolerance: 0.001,
    formula: "|\\mathbf a|=\\sqrt{a_x^2+a_y^2+a_z^2}",
    steps: [`\\(|\\mathbf a|=\\sqrt{(${x})^2+(${y})^2+(${z})^2}\\)`, `\\(=\\sqrt{${x ** 2 + y ** 2 + z ** 2}}=${norm}\\)`],
    reason: "符号に関係なく各成分を二乗して足します。",
    explanation: "ベクトルの大きさはノルムであり、平方根は正の値を取ります。",
    source: rangeSource("応用数学範囲・ベクトル", [1, 2, 4, 5]),
    parameters: { x, y, z, norm },
    safety: baseSafety({ finiteValues: [x, y, z, norm], radicands: [x ** 2 + y ** 2 + z ** 2] }),
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
  return numericQuestion(seedKey, {
    subjectId: "subject-8",
    templateId: "applied-orthogonal-unknown",
    category: "内積・直交",
    title: "直交条件から未知成分",
    prompt: String.raw`ベクトル \((${a},k,${c})\) と \((${p},${b},${q})\) が直交するとき、\(k\) を求めよ。`,
    answerValue: k,
    digits: 4,
    tolerance: 0.002,
    formula: "\\mathbf a\\cdot\\mathbf b=0",
    steps: [`\\(${a}\\times${p}+${b}k+${c}\\times${q}=0\\)`, `\\(k=-\\frac{${constant}}{${b}}=${formatNumber(k, 4)}\\)`],
    reason: "直交する2ベクトルの内積は0です。",
    explanation: "対応成分の積を足し、kについて一次方程式を解きます。",
    source: rangeSource("応用数学範囲・内積と直交", [1, 2, 4]),
    parameters: { a, b, c, p, q, constant, k },
    safety: baseSafety({ finiteValues: [a, b, c, p, q, constant, k], denominators: [b], notes: ["kの係数b≠0"] }),
  });
}

function appliedGradient(seedKey: string, rng: SeededRandom) {
  const ax = rng.int(1, 5);
  const ay = rng.int(1, 5);
  const az = rng.int(1, 5);
  const x = rng.pick([-2, -1, 1, 2, 3]);
  const y = rng.pick([-2, -1, 1, 2, 3]);
  const z = rng.pick([-2, -1, 1, 2, 3]);
  const axis = rng.pick(["x", "y", "z"] as const);
  const answer = axis === "x" ? 2 * ax * x : axis === "y" ? 2 * ay * y : 2 * az * z;
  const direction = axis === "x" ? "(1,0,0)" : axis === "y" ? "(0,1,0)" : "(0,0,1)";
  return numericQuestion(seedKey, {
    subjectId: "subject-8",
    templateId: "applied-directional-derivative",
    category: "勾配・方向微分",
    title: "座標軸方向の方向微分",
    prompt: String.raw`\(\phi=${ax}x^2+${ay}y^2+${az}z^2\) の点 \(P=(${x},${y},${z})\) における \(\mathbf e=${direction}\) 方向の方向微分を求めよ。`,
    answerValue: answer,
    digits: 3,
    tolerance: 0.001,
    formula: "D_{\\mathbf e}\\phi=\\nabla\\phi\\cdot\\mathbf e",
    steps: [`\\(\\nabla\\phi=(${2 * ax}x,${2 * ay}y,${2 * az}z)\\)`, `\\(\\nabla\\phi(P)=(${2 * ax * x},${2 * ay * y},${2 * az * z})\\)`, `\\(D_{\\mathbf e}\\phi=${answer}\\)`],
    reason: "勾配と指定された単位方向ベクトルの内積を取ります。",
    explanation: "座標軸方向なので、勾配の対応する1成分がそのまま答えになります。",
    source: rangeSource("応用数学範囲・勾配と方向微分", [12, 13, 14, 18, 19]),
    parameters: { ax, ay, az, x, y, z, axis, answer },
    safety: baseSafety({ finiteValues: [ax, ay, az, x, y, z, answer], notes: ["方向ベクトルは単位ベクトル"] }),
  });
}

function appliedDivergence(seedKey: string, rng: SeededRandom) {
  const a = rng.pick([-4, -3, -2, -1, 1, 2, 3, 4]);
  const b = rng.pick([-4, -3, -2, -1, 1, 2, 3, 4]);
  const c = rng.pick([-4, -3, -2, -1, 1, 2, 3, 4]);
  const x = rng.pick([-2, -1, 1, 2, 3]);
  const y = rng.pick([-2, -1, 1, 2, 3]);
  const z = rng.pick([-2, -1, 1, 2, 3]);
  const divergence = 2 * a * x + 2 * b * y + 2 * c * z;
  return numericQuestion(seedKey, {
    subjectId: "subject-8",
    templateId: "applied-divergence-point",
    category: "発散・回転",
    title: "ベクトル場の発散",
    prompt: String.raw`ベクトル場 \(\mathbf F=(${a}x^2,${b}y^2,${c}z^2)\) の点 \(P=(${x},${y},${z})\) における発散を求めよ。`,
    answerValue: divergence,
    digits: 3,
    tolerance: 0.001,
    formula: "\\nabla\\cdot\\mathbf F=\\frac{\\partial F_x}{\\partial x}+\\frac{\\partial F_y}{\\partial y}+\\frac{\\partial F_z}{\\partial z}",
    steps: [`\\(\\nabla\\cdot\\mathbf F=${2 * a}x+${2 * b}y+${2 * c}z\\)`, `\\(=${2 * a}(${x})+${2 * b}(${y})+${2 * c}(${z})=${divergence}\\)`],
    reason: "各成分を対応する座標で偏微分して足します。",
    explanation: "x成分をx、y成分をy、z成分をzで微分する対応を崩さないことが重要です。",
    source: rangeSource("応用数学範囲・発散", [15, 16, 19]),
    parameters: { a, b, c, x, y, z, divergence },
    safety: baseSafety({ finiteValues: [a, b, c, x, y, z, divergence] }),
  });
}

function appliedCrossArea(seedKey: string, rng: SeededRandom) {
  const width = rng.int(2, 10);
  const height = rng.int(2, 10);
  const area = (width * height) / 2;
  return numericQuestion(seedKey, {
    subjectId: "subject-8",
    templateId: "applied-triangle-area",
    category: "外積",
    title: "外積による三角形面積",
    prompt: String.raw`\(\overrightarrow{AB}=(${width},0,0)\)、\(\overrightarrow{AC}=(0,${height},0)\) のとき三角形ABCの面積を求めよ。`,
    answerValue: area,
    digits: 3,
    tolerance: 0.001,
    formula: "S=\\frac{1}{2}|\\overrightarrow{AB}\\times\\overrightarrow{AC}|",
    steps: [`\\(\\overrightarrow{AB}\\times\\overrightarrow{AC}=(0,0,${width * height})\\)`, `\\(S=\\frac{1}{2}\\times${width * height}=${formatNumber(area, 3)}\\)`],
    reason: "外積の大きさは平行四辺形の面積なので、三角形では半分にします。",
    explanation: "2本のベクトルは直交しているため、外積の大きさは底辺×高さです。",
    source: rangeSource("応用数学範囲・外積と面積", [2, 4, 5]),
    parameters: { width, height, area },
    safety: baseSafety({ finiteValues: [width, height, area], denominators: [2] }),
  });
}

function appliedGreen(seedKey: string, rng: SeededRandom) {
  const a = rng.int(1, 5);
  const b = rng.int(1, 5);
  const coefficient = rng.pick([-4, -3, -2, -1, 1, 2, 3, 4]);
  const result = coefficient * a * b;
  return numericQuestion(seedKey, {
    subjectId: "subject-8",
    templateId: "applied-green-rectangle",
    category: "グリーンの定理",
    title: "長方形境界の線積分",
    prompt: String.raw`長方形 \(0\le x\le${a},\ 0\le y\le${b}\) の境界Cを反時計回りに一周する。\(P=0,\ Q=${coefficient}x\) のとき \(\oint_C(P\,dx+Q\,dy)\) を求めよ。`,
    answerValue: result,
    digits: 3,
    tolerance: 0.001,
    formula: "\\oint_C(P\\,dx+Q\\,dy)=\\iint_D\\left(\\frac{\\partial Q}{\\partial x}-\\frac{\\partial P}{\\partial y}\\right)dA",
    steps: [`\\(\\frac{\\partial Q}{\\partial x}-\\frac{\\partial P}{\\partial y}=${coefficient}\\)`, `\\(\\iint_D ${coefficient}\\,dA=${coefficient}\\times${a}\\times${b}=${result}\\)`],
    reason: "反時計回りは正向きなので、グリーンの定理を符号変更なしで使えます。",
    explanation: "被積分関数が定数になるため、長方形の面積を掛ければ求まります。",
    source: rangeSource("応用数学追加範囲・グリーンの定理", [19]),
    parameters: { a, b, coefficient, result },
    safety: baseSafety({ finiteValues: [a, b, coefficient, result], notes: ["境界は反時計回りの正向き"] }),
  });
}

const TEMPLATES: PracticeTemplate[] = [
  { id: "english-order", subjectId: "subject-2", kind: "order", title: "本文抜き出し並び替え", build: englishOrder },
  { id: "english-translation", subjectId: "subject-2", kind: "translation", title: "本文抜き出し和訳", build: englishTranslation },
  { id: "english-grammar", subjectId: "subject-2", kind: "grammar", title: "範囲本文の文法", build: englishGrammar },
  { id: "mechanical-natural-frequency", subjectId: "subject-3", kind: "calculation", title: "固有角振動数", build: mechanicalNatural },
  { id: "mechanical-series-springs", subjectId: "subject-3", kind: "calculation", title: "直列ばね", build: mechanicalSeries },
  { id: "mechanical-damping-ratio", subjectId: "subject-3", kind: "calculation", title: "減衰比", build: mechanicalDamping },
  { id: "mechanical-pendulum-length", subjectId: "subject-3", kind: "calculation", title: "単振り子", build: mechanicalPendulum },
  { id: "mechanical-log-decrement", subjectId: "subject-3", kind: "calculation", title: "対数減衰率", build: mechanicalDecrement },
  { id: "thermo-ideal-gas", subjectId: "subject-4", kind: "calculation", title: "理想気体", build: thermoIdealGas },
  { id: "thermo-adiabatic-temperature", subjectId: "subject-4", kind: "calculation", title: "断熱温度", build: thermoAdiabatic },
  { id: "thermo-otto-efficiency", subjectId: "subject-4", kind: "calculation", title: "オットー効率", build: thermoOtto },
  { id: "thermo-carnot-efficiency", subjectId: "subject-4", kind: "calculation", title: "カルノー効率", build: thermoCarnot },
  { id: "smart-first-order-step", subjectId: "subject-6", kind: "calculation", title: "一次遅れ応答", build: smartStep },
  { id: "smart-first-order-pole", subjectId: "subject-6", kind: "calculation", title: "極", build: smartPole },
  { id: "smart-negative-feedback", subjectId: "subject-6", kind: "calculation", title: "負帰還", build: smartFeedback },
  { id: "smart-steady-state", subjectId: "subject-6", kind: "calculation", title: "定常値", build: smartSteadyState },
  { id: "statistics-symmetric-variance", subjectId: "subject-7", kind: "calculation", title: "母分散", build: statsMeanVariance },
  { id: "statistics-z-score", subjectId: "subject-7", kind: "calculation", title: "z得点", build: statsZScore },
  { id: "statistics-bayes", subjectId: "subject-7", kind: "calculation", title: "ベイズ", build: statsBayes },
  { id: "statistics-combination", subjectId: "subject-7", kind: "calculation", title: "組合せ", build: statsCombination },
  { id: "applied-vector-norm", subjectId: "subject-8", kind: "calculation", title: "ベクトルの大きさ", build: appliedNorm },
  { id: "applied-orthogonal-unknown", subjectId: "subject-8", kind: "calculation", title: "直交条件", build: appliedOrthogonal },
  { id: "applied-directional-derivative", subjectId: "subject-8", kind: "calculation", title: "方向微分", build: appliedGradient },
  { id: "applied-divergence-point", subjectId: "subject-8", kind: "calculation", title: "発散", build: appliedDivergence },
  { id: "applied-triangle-area", subjectId: "subject-8", kind: "calculation", title: "三角形面積", build: appliedCrossArea },
  { id: "applied-green-rectangle", subjectId: "subject-8", kind: "calculation", title: "グリーンの定理", build: appliedGreen },
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
  if (!["number", "choice", "order", "translation"].includes(question.format as string)) {
    errors.push("問題形式が不正です");
  }
  for (const value of visibleQuestionStrings(question)) {
    if (FORBIDDEN_CONTROL_CHARACTERS.test(value)) errors.push("表示文字列に制御文字があります");
    if (!hasBalancedInlineMath(value)) errors.push("インライン数式の区切りが不正です");
  }
  if (!GENERATED_PRACTICE_SUBJECTS.some((subject) => subject.id === question.subjectId)) {
    errors.push("自動生成対象外の教科です");
  }
  if (["network", "subject-5", "subject-9"].includes(question.subjectId as string)) {
    errors.push("ネットワーク・材料力学・デジタル回路は自動生成対象外です");
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
    if (question.source.kind !== "passage" || !sourceChapter || !ENGLISH_CHAPTERS.has(sourceChapter as "ch15" | "ch16" | "ch18")) {
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
