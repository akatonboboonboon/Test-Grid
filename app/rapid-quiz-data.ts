import { ENGLISH_QUESTIONS, isEnglishPoolItemInScope } from "./english-data";
import { ENGLISH_CH18_QUIZ_ITEMS } from "./english-ch18-quiz-data";
import { ENGLISH_EXAM_LEVEL_QUESTIONS } from "./english-expected-exams-data";
import { APPLIED_MATH_EXAM_LEVEL_QUESTIONS, APPLIED_MATH_FORMULAS, APPLIED_MATH_QUESTIONS } from "./applied-math-data";
import { DIGITAL_CIRCUIT_ALL_FORMULAS, DIGITAL_CIRCUIT_ALL_QUESTIONS, DIGITAL_CIRCUIT_EXAM_LEVEL_QUESTIONS, type DigitalCircuitAnyDiagramKind } from "./digital-circuits-extra-data";
import { MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS, MATERIAL_MECHANICS_FORMULAS, MATERIAL_MECHANICS_QUESTIONS, type MaterialMechanicsDiagramKind } from "./material-mechanics-data";
import { MECHANICAL_DYNAMICS_PRINT_LEVEL_QUESTIONS, type MechanicalDynamicsDiagramKind } from "./mechanical-dynamics-data";
import { ALL_LAYERS, DEFAULT_CARDS, cardLayers, type Layer, type ProtocolCard } from "./protocols";
import { SMART_CONTROL_CARDS, SMART_CONTROL_EXAM_LEVEL_QUESTIONS, SMART_CONTROL_QUESTIONS } from "./smart-control-data";
import { TEXTBOOK_RESPONSE_CARDS, TEXTBOOK_RESPONSE_EXAM_LEVEL_QUESTIONS } from "./smart-control-textbook-data";
import { STATISTICS_FORMULAS, STATISTICS_QUESTIONS } from "./statistics-data";
import { STATISTICS_EXAM_LEVEL_QUESTIONS } from "./statistics-expected-exams-data";
import { THERMODYNAMICS_EXAM_LEVEL_QUESTIONS, THERMODYNAMICS_FORMULAS, THERMODYNAMICS_QUESTIONS, type ThermodynamicsDiagramKind } from "./thermodynamics-data";
import { DEFAULT_SUBJECTS, type SubjectId } from "./study-data";
import { smartControlDiagramIdFor, type SmartControlDiagramId } from "./smart-control-figure-data";

export type RapidQuestionVisual =
  | { type: "mechanical-dynamics"; kind: MechanicalDynamicsDiagramKind }
  | { type: "thermodynamics"; kind: ThermodynamicsDiagramKind }
  | { type: "material-mechanics"; kind: MaterialMechanicsDiagramKind }
  | { type: "smart-control"; kind: SmartControlDiagramId }
  | { type: "digital-circuit"; kind: DigitalCircuitAnyDiagramKind };

export type RapidQuestionReference = {
  label: string;
  quote: string;
  translation?: string;
};

export type RapidQuestion = {
  id: string;
  subjectId: SubjectId;
  topicLabel: string;
  prompt: string;
  answer: string;
  acceptedOptions: string[];
  options: string[];
  explanation: string;
  studyHref: string;
  mathOptions?: boolean;
  visual?: RapidQuestionVisual;
  reference?: RapidQuestionReference;
  requiresVisual?: boolean;
  requiresReference?: boolean;
  difficulty: 1 | 2 | 3;
  recommendedSeconds: number;
  steps: string[];
  sourceBasis: string;
};

export type RapidQuestionInstance = RapidQuestion & {
  instanceId: string;
};

export type RapidSubjectMeta = {
  id: SubjectId;
  name: string;
  accent: string;
  href: string;
  cardHref: string;
};

type ChoiceSeed = {
  id: string;
  topicLabel: string;
  prompt: string;
  answer: string;
  explanation: string;
  studyHref: string;
  options?: string[];
  acceptedOptions?: string[];
  mathOptions?: boolean;
  visual?: RapidQuestionVisual;
  reference?: RapidQuestionReference;
  requiresVisual?: boolean;
  requiresReference?: boolean;
  choiceGroup?: string;
  choiceFormat?: string;
  answerShape?: string;
  difficulty?: 1 | 2 | 3;
  recommendedSeconds?: number;
  steps?: string[];
  sourceBasis?: string;
};

export const RAPID_SUBJECTS: RapidSubjectMeta[] = DEFAULT_SUBJECTS.map((subject) => ({
  id: subject.id,
  name: subject.name,
  accent: subject.accent,
  href: subject.id === "network" ? "/subjects/network" : `/subjects/${subject.id}`,
  cardHref: subject.id === "network"
    ? "/subjects/network/cards"
    : `/subjects/${subject.id}?mode=cards`,
}));

export const RAPID_SUBJECT_IDS = RAPID_SUBJECTS.map((subject) => subject.id);
export const COMPREHENSIVE_QUESTIONS_PER_SUBJECT = 546;
export const COMPREHENSIVE_MAX_QUESTIONS = 9 * COMPREHENSIVE_QUESTIONS_PER_SUBJECT;

export function rapidSubjectMeta(subjectId: SubjectId) {
  return RAPID_SUBJECTS.find((subject) => subject.id === subjectId) ?? RAPID_SUBJECTS[0];
}

export function flashcardSearchHref(subjectId: SubjectId, query: string) {
  return `/cards?subject=${encodeURIComponent(subjectId)}&q=${encodeURIComponent(query)}`;
}

function stableHash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function rotated<T>(values: T[], amount: number) {
  if (!values.length) return values;
  const offset = ((amount % values.length) + values.length) % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
}

function inferAnswerShape(value: string) {
  const trimmed = value.trim();
  if (/^[TF]$/u.test(trimmed)) return "truth-value";
  if (/^[01](?:[\s,→>\-]*[01])+$/u.test(trimmed)) return "binary-sequence";

  const hasJapanese = /[\u3040-\u30ff\u3400-\u9fff]/u.test(trimmed);
  const latinWords = trimmed.match(/[A-Za-z]+(?:['’][A-Za-z]+)?/gu)?.length ?? 0;
  const hasFormulaSyntax = /\\(?:begin|frac|sqrt|mathrm|text)|[=^_]|[+\-×÷*/]\s*\d/u.test(trimmed);
  if (hasFormulaSyntax && !hasJapanese) {
    return /\\begin|,|\\quad|(?:\\to|→).*(?:\\to|→)/u.test(trimmed)
      ? "math:compound"
      : "math:expression";
  }

  const language = hasJapanese ? "ja" : latinWords > 0 ? "en" : "symbol";
  const characterCount = [...trimmed].length;
  const granularity = /[.!?。！？]$/u.test(trimmed) || latinWords >= 7 || characterCount >= 32
    ? "sentence"
    : latinWords >= 2 || characterCount >= 9
      ? "phrase"
      : "term";
  return `${language}:${granularity}`;
}

function choiceCompatibilityKey(seed: ChoiceSeed) {
  const group = seed.choiceGroup ?? seed.topicLabel;
  const format = seed.choiceFormat ?? (seed.mathOptions ? "math" : "text");
  const shape = seed.answerShape ?? inferAnswerShape(seed.answer);
  return `${group}\u0000${format}\u0000${shape}`;
}

function broadChoiceCompatibilityKey(seed: ChoiceSeed) {
  const format = seed.choiceFormat ?? (seed.mathOptions ? "math" : "text");
  const shape = seed.answerShape ?? inferAnswerShape(seed.answer);
  return [format, shape].join(String.fromCharCode(0));
}

function shapeChoiceCompatibilityKey(seed: ChoiceSeed) {
  return seed.answerShape ?? inferAnswerShape(seed.answer);
}

function buildChoicePool(subjectId: SubjectId, seeds: ChoiceSeed[]): RapidQuestion[] {
  const answersByCompatibility = new Map<string, string[]>();
  const answersByBroadCompatibility = new Map<string, string[]>();
  const answersByShapeCompatibility = new Map<string, string[]>();
  seeds.forEach((seed) => {
    const key = choiceCompatibilityKey(seed);
    answersByCompatibility.set(key, unique([
      ...(answersByCompatibility.get(key) ?? []),
      seed.answer,
    ]));
    const broadKey = broadChoiceCompatibilityKey(seed);
    answersByBroadCompatibility.set(broadKey, unique([
      ...(answersByBroadCompatibility.get(broadKey) ?? []),
      seed.answer,
    ]));
    const shapeKey = shapeChoiceCompatibilityKey(seed);
    answersByShapeCompatibility.set(shapeKey, unique([
      ...(answersByShapeCompatibility.get(shapeKey) ?? []),
      seed.answer,
    ]));
  });

  return seeds.map((seed, seedIndex) => {
    const acceptedOptions = unique([seed.answer, ...(seed.acceptedOptions ?? [])]);
    const supplied = unique(seed.options ?? []);
    const compatibleAnswers = unique([
      ...(answersByCompatibility.get(choiceCompatibilityKey(seed)) ?? []),
      ...(answersByBroadCompatibility.get(broadChoiceCompatibilityKey(seed)) ?? []),
      ...(answersByShapeCompatibility.get(shapeChoiceCompatibilityKey(seed)) ?? []),
    ]);
    const compatibleDistractors = rotated(
      compatibleAnswers,
      stableHash(seed.id) % Math.max(1, compatibleAnswers.length),
    ).filter((answer) => !acceptedOptions.includes(answer));

    let options = supplied.length >= 2
      ? supplied.slice(0, 4)
      : unique([...supplied, seed.answer, ...compatibleDistractors]).slice(0, 4);
    if (!options.some((option) => acceptedOptions.includes(option))) {
      options = unique([...options.slice(0, 3), seed.answer]).slice(0, 4);
    }

    return {
      ...seed,
      subjectId,
      difficulty: seed.difficulty ?? 2,
      recommendedSeconds: seed.recommendedSeconds ?? 90,
      steps: seed.steps?.length ? seed.steps : ["条件を整理する。", "必要な関係式または本文根拠を適用する。", "単位・符号・文脈を検算する。"],
      sourceBasis: seed.sourceBasis ?? "読み込み済み試験範囲の確認問題",
      studyHref: flashcardSearchHref(subjectId, seed.prompt),
      acceptedOptions,
      options: rotated(options, (stableHash(seed.id) + seedIndex) % Math.max(1, options.length)),
    };
  });
}

type ExamLevelRapidSource = {
  id: string;
  topic?: string;
  topicId?: string;
  unit?: string;
  group?: string;
  genre?: string;
  format?: string;
  difficulty?: 1 | 2 | 3;
  prompt: string;
  context?: string;
  answer: string;
  options?: string[];
  accepted?: string[];
  numericAnswer?: number;
  expectedUnit?: string;
  formula?: string;
  steps?: string[];
  explanation?: string;
  reference?: RapidQuestionReference;
  requiresVisual?: boolean;
};

const ACTIVE_ENGLISH_RAPID_GROUPS = new Set([
  "長文 True / False",
  "要約穴埋め",
  "語形・文脈",
  "長文内容理解",
  "和訳",
  "長文和訳",
  "情報検索",
  "TOEIC Reading",
  "語彙・熟語（日→英）",
  "語彙・熟語（英→日）",
]);

const ACTIVE_ENGLISH_UNITS = new Set(["ch14", "ch15", "ch16", "ch18", "toeic", "housing", "medical"]);

function isActiveEnglishRapidQuestion(question: ExamLevelRapidSource) {
  return isEnglishPoolItemInScope(question)
    && ACTIVE_ENGLISH_UNITS.has(question.unit ?? "")
    && (
      ACTIVE_ENGLISH_RAPID_GROUPS.has(question.group ?? "")
      || question.group?.startsWith("語順整序｜")
      || question.id.startsWith("exam-level-")
    );
}

const RAPID_SOURCE_BASIS: Partial<Record<SubjectId, string>> = {
  "subject-2": "英語追加範囲 Ch.14・15・16・18、TOEIC Reading、Housing・Medical語彙（対象外欄・Ch.19は除外）",
  "subject-3": "機械力学範囲プリント4枚相当・過去問の連続計算",
  "subject-4": "熱力学範囲ZIP9ページ（追加p.8〜9の冷凍サイクル・逆カルノーCOPを含む）と形式1〜3の複合状態変化",
  "subject-5": "材料力学範囲ZIP13ページ（ねじり・軸設計・コイルばね・はり反力/SFD/BMD・曲げ応力・長方形/中空円断面I/Z）と形式2 Q1〜3の範囲一致部（Q4は出典除外、EIたわみ・曲率・カスティリアーノは対象外）",
  "subject-6": "スマート制御範囲・演習・過去問の計算と図読解",
  "subject-7": "確率統計範囲ZIP・追加範囲5ページ（チェビシェフの不等式を含む）・演習PDF1〜4・過去問形式",
  "subject-8": "応用数学範囲・追加範囲と提供テスト形式",
  "subject-9": "デジタル回路範囲ZIP・演習・過去問の設計問題",
};

function rapidNumber(value: number) {
  if (value === 0) return "0";
  const magnitude = Math.abs(value);
  if (magnitude >= 10_000 || magnitude < 0.001) return value.toExponential(3);
  return Number(value.toPrecision(4)).toString();
}

function mechanicalRapidDistractors(question: ExamLevelRapidSource, numeric: number) {
  const clue = [question.genre, question.prompt, question.formula, question.expectedUnit].filter(Boolean).join(" ");
  if (/周期|T_n|T_d|\bsecond|^s$/iu.test(clue)) {
    // 2πの掛け忘れ・割り忘れと、ms→sの換算忘れ。
    return [numeric * 2 * Math.PI, numeric / (2 * Math.PI), numeric * 1000];
  }
  if (/減衰|zeta|\\zeta|C_2|対数/iu.test(clue)) {
    // ωdとωnの取り違え、近似式と厳密式の取り違えを模した値。
    return [numeric * Math.sqrt(1 - 0.1 ** 2), numeric / Math.sqrt(1 - 0.1 ** 2), numeric * Math.PI];
  }
  if (/レバー|回転|作用腕|r_c|theta|\\theta/iu.test(clue)) {
    // 作用腕の二乗を一度しか掛けない／逆に扱う典型誤答。
    return [numeric * Math.SQRT2, numeric / Math.SQRT2, numeric * Math.PI];
  }
  if (/ばね|剛性|直列|並列|k_\{?eq/iu.test(clue)) {
    // 直列・並列の取り違えが固有値の平方根へ波及した典型誤答。
    return [numeric * Math.SQRT2, numeric / Math.SQRT2, numeric * 2 * Math.PI];
  }
  return [numeric * Math.PI, numeric / Math.PI, numeric * Math.SQRT2];
}
function numericRapidOptions(question: ExamLevelRapidSource, subjectId: SubjectId) {
  const value = question.numericAnswer;
  if (!Number.isFinite(value)) return question.options;
  const numeric = value as number;
  const variants = numeric === 0
    ? [0.05, -0.05, 0.1]
    : subjectId === "subject-3"
      ? mechanicalRapidDistractors(question, numeric)
      : [numeric / 2, numeric * 2, -numeric];
  const suffix = question.expectedUnit?.trim() ?? "";
  const usesPi = /\\pi|π/.test(question.answer);
  return unique([
    question.answer,
    ...variants.map((candidate) => {
      const base = rapidNumber(candidate);
      if (usesPi) return `${base}π`;
      return suffix ? `${base} ${suffix}` : base;
    }),
  ]);
}

function rapidPromptRequiresVisual(question: ExamLevelRapidSource) {
  const text = [question.context, question.prompt].filter(Boolean).join(" ");
  return /(?:下図|上図|次の図|図から|図に示|図を見|図示|回路図|波形図|\bfigure\b)/iu.test(text);
}

function rapidQuestionRequiresReference(subjectId: SubjectId, question: ExamLevelRapidSource, topicLabel: string) {
  if (subjectId !== "subject-2") return false;
  return question.format === "order"
    || question.format === "translation"
    || /(?:True\s*\/\s*False|本文|長文|内容理解|和訳|翻訳|抜き取り|並び替え|語順整序)/iu.test(topicLabel);
}

function examLevelSeed(subjectId: SubjectId, question: ExamLevelRapidSource, visual?: RapidQuestionVisual): ChoiceSeed {
  const steps = question.steps?.filter(Boolean) ?? [];
  const formulaNote = question.formula ? `使用式：\\(${question.formula}\\)` : "";
  const explanation = [...steps, formulaNote, question.explanation ?? ""].filter(Boolean).join(" ");
  const topicLabel = question.group ?? question.genre ?? question.topicId ?? question.topic ?? question.unit ?? "本番水準";
  const options = question.options?.length ? question.options : numericRapidOptions(question, subjectId);
  const optionValues = options?.length ? options : [question.answer];
  const answerShape = Number.isFinite(question.numericAnswer)
    ? `number:${question.expectedUnit?.trim() || "unitless"}`
    : inferAnswerShape(question.answer);
  const requiresVisual = question.requiresVisual ?? (Boolean(visual) || rapidPromptRequiresVisual(question));
  const requiresReference = rapidQuestionRequiresReference(subjectId, question, topicLabel);
  const mathOptions = subjectId !== "subject-2"
    && optionValues.every((option) => !/[\u3000-\u9fff。、]/u.test(option));
  return {
    id: `rapid-exam-${question.id}`,
    topicLabel: `${topicLabel} / 本番水準`,
    prompt: [question.context, question.prompt].filter(Boolean).join("\n"),
    answer: question.answer,
    options,
    acceptedOptions: question.accepted?.length ? question.accepted : [question.answer],
    explanation,
    studyHref: `/subjects/${subjectId}?mode=practice`,
    mathOptions,
    visual,
    reference: question.reference,
    requiresVisual,
    requiresReference,
    choiceGroup: topicLabel,
    choiceFormat: question.format ?? (Number.isFinite(question.numericAnswer) ? "number" : "text"),
    answerShape,
    difficulty: question.difficulty ?? 3,
    recommendedSeconds: subjectId === "subject-2" ? 60 : 90,
    steps: steps.length >= 2 ? steps : ["条件・本文根拠を整理する。", "複数の計算または判断を順に行う。", "答えを元の条件へ戻して検算する。"],
    sourceBasis: RAPID_SOURCE_BASIS[subjectId] ?? "読み込み済み試験範囲",
  };
}

function examLevelPool<T extends ExamLevelRapidSource>(
  subjectId: SubjectId,
  questions: readonly T[],
  include: (question: T) => boolean,
  getVisual?: (question: T) => RapidQuestionVisual | undefined,
) {
  const seen = new Set<string>();
  const selected = questions.filter((question) => {
    if (seen.has(question.id) || !include(question)) return false;
    seen.add(question.id);
    return true;
  });
  return buildChoicePool(subjectId, selected.map((question) => examLevelSeed(subjectId, question, getVisual?.(question))));
}

const mechanicalVisual = (question: { diagram?: MechanicalDynamicsDiagramKind }): RapidQuestionVisual | undefined =>
  question.diagram ? { type: "mechanical-dynamics", kind: question.diagram } : undefined;
const thermodynamicsVisual = (question: { diagram?: ThermodynamicsDiagramKind }): RapidQuestionVisual | undefined =>
  question.diagram ? { type: "thermodynamics", kind: question.diagram } : undefined;
const materialMechanicsVisual = (question: { diagram?: MaterialMechanicsDiagramKind }): RapidQuestionVisual | undefined =>
  question.diagram ? { type: "material-mechanics", kind: question.diagram } : undefined;
const smartControlVisual = (question: { id: string; diagramId?: SmartControlDiagramId }): RapidQuestionVisual | undefined => {
  const diagramId = smartControlDiagramIdFor(question);
  return diagramId ? { type: "smart-control", kind: diagramId } : undefined;
};
const digitalCircuitVisual = (question: { diagram?: DigitalCircuitAnyDiagramKind }): RapidQuestionVisual | undefined =>
  question.diagram ? { type: "digital-circuit", kind: question.diagram } : undefined;

const ENGLISH_CH18_ACTUAL_QUIZ_QUESTIONS: ExamLevelRapidSource[] = ENGLISH_CH18_QUIZ_ITEMS.map((item) => ({
  id: `actual-${item.id}`,
  unit: "ch18",
  group: "Chapter 18 実物小テスト",
  difficulty: 3,
  context: item.reference,
  prompt: item.prompt,
  answer: item.answer,
  accepted: item.accepted,
  steps: ["実物小テストの指定箇所と本文根拠を確認する。", "語形・文法・語順を照合して解答する。", "本文へ戻して意味と形を検算する。"],
  explanation: item.explanation,
}));
type ComprehensiveFormulaCard = {
  id: string;
  title: string;
  prompt: string;
  formula: string;
  explanation: string;
  cue: string;
  example?: string;
  expandedFormula?: string;
};

function formulaCardPool<T extends ComprehensiveFormulaCard>(
  subjectId: SubjectId,
  cards: readonly T[],
  getVisual?: (card: T) => RapidQuestionVisual | undefined,
) {
  return buildChoicePool(subjectId, cards.map((card) => ({
    id: `rapid-card-${card.id}`,
    topicLabel: `${card.title} / 暗記・公式`,
    prompt: card.prompt,
    answer: card.formula,
    acceptedOptions: [card.formula],
    choiceGroup: "formula-card",
    choiceFormat: "formula",
    answerShape: inferAnswerShape(card.formula),
    explanation: [
      card.explanation,
      `覚え方：${card.cue}`,
      card.expandedFormula ? `Σを使わない形：\\(${card.expandedFormula}\\)` : "",
      card.example ? `例：${card.example}` : "",
    ].filter(Boolean).join(" "),
    studyHref: `/subjects/${subjectId}?mode=cards`,
    mathOptions: true,
    visual: getVisual?.(card),
    requiresVisual: Boolean(getVisual?.(card)),
    difficulty: 3 as const,
    recommendedSeconds: 45,
    steps: ["問いの条件・記号を整理する。", `手掛かり「${card.cue}」から公式・定義を再現する。`, "各記号の意味と適用条件を確認する。"],
    sourceBasis: `${RAPID_SOURCE_BASIS[subjectId] ?? "読み込み済み試験範囲"} / 暗記・公式カード`,
  })));
}

function combineRapidPools(...pools: readonly RapidQuestion[][]) {
  const seen = new Set<string>();
  return pools.flat().filter((question) => {
    if (seen.has(question.id)) return false;
    seen.add(question.id);
    return true;
  });
}
const ENGLISH_RAPID = examLevelPool(
  "subject-2",
  [...ENGLISH_QUESTIONS, ...ENGLISH_EXAM_LEVEL_QUESTIONS],
  isActiveEnglishRapidQuestion,
);

export function networkCardsToRapid(cards: ProtocolCard[]) {
  return cards.map((card) => {
    const layers = cardLayers(card);
    const labels = layers.map((layer) => `L${layer}`);
    return {
      id: `rapid-${card.id}`,
      subjectId: "network" as const,
      topicLabel: "OSIレイヤー / 本番瞬時判定",
      prompt: `${card.label} は第何層？`,
      answer: labels.join(" / "),
      acceptedOptions: labels,
      options: ALL_LAYERS.map((layer) => `L${layer}`),
      explanation: [card.fullName, card.description, card.note].filter(Boolean).join("。") || `${card.label} は ${labels.join(" / ")} に属します。`,
      studyHref: flashcardSearchHref("network", card.label),
      difficulty: 3 as const,
      recommendedSeconds: 8,
      steps: ["略称を正式名称へ展開する。", "主な働きからOSI参照モデルの層を判定する。"],
      sourceBasis: "提供されたネットワーク層別一覧（本番の瞬時判定形式）",
    } satisfies RapidQuestion;
  });
}

export function filterNetworkRapidPoolByLayers(
  pool: RapidQuestion[],
  selectedLayers: readonly Layer[],
) {
  if (!selectedLayers.length) return pool;
  const selectedLabels = new Set(selectedLayers.map((layer) => `L${layer}`));
  return pool.filter((question) => (
    question.subjectId === "network"
    && question.acceptedOptions.some((option) => selectedLabels.has(option))
  ));
}

const MECHANICAL_RAPID = examLevelPool(
  "subject-3",
  MECHANICAL_DYNAMICS_PRINT_LEVEL_QUESTIONS,
  (question) => question.difficulty === 3,
  mechanicalVisual,
);
const THERMODYNAMICS_RAPID = examLevelPool(
  "subject-4",
  [...THERMODYNAMICS_QUESTIONS, ...THERMODYNAMICS_EXAM_LEVEL_QUESTIONS],
  (question) => (question.difficulty ?? 1) >= 2,
  thermodynamicsVisual,
);
const MATERIAL_MECHANICS_RAPID = examLevelPool(
  "subject-5",
  [...MATERIAL_MECHANICS_QUESTIONS, ...MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS],
  (question) => (question.difficulty ?? 1) >= 2,
  materialMechanicsVisual,
);
const SMART_CONTROL_RAPID = examLevelPool(
  "subject-6",
  [...SMART_CONTROL_QUESTIONS, ...TEXTBOOK_RESPONSE_EXAM_LEVEL_QUESTIONS, ...SMART_CONTROL_EXAM_LEVEL_QUESTIONS],
  (question) => (question.difficulty ?? 1) >= 2,
  smartControlVisual,
);
const STATISTICS_RAPID = examLevelPool(
  "subject-7",
  [...STATISTICS_QUESTIONS, ...STATISTICS_EXAM_LEVEL_QUESTIONS],
  (question) => (question.difficulty ?? 1) >= 2,
);
const APPLIED_MATH_RAPID = examLevelPool(
  "subject-8",
  [...APPLIED_MATH_QUESTIONS, ...APPLIED_MATH_EXAM_LEVEL_QUESTIONS],
  (question) => (question.difficulty ?? 1) >= 2,
);
const DIGITAL_CIRCUITS_RAPID = examLevelPool(
  "subject-9",
  [...DIGITAL_CIRCUIT_ALL_QUESTIONS, ...DIGITAL_CIRCUIT_EXAM_LEVEL_QUESTIONS],
  (question) => (question.difficulty ?? 1) >= 2,
  digitalCircuitVisual,
);
const STATIC_POOLS: Record<SubjectId, RapidQuestion[]> = {
  "subject-2": ENGLISH_RAPID,
  network: networkCardsToRapid(DEFAULT_CARDS),
  "subject-3": MECHANICAL_RAPID,
  "subject-4": THERMODYNAMICS_RAPID,
  "subject-5": MATERIAL_MECHANICS_RAPID,
  "subject-6": SMART_CONTROL_RAPID,
  "subject-7": STATISTICS_RAPID,
  "subject-8": APPLIED_MATH_RAPID,
  "subject-9": DIGITAL_CIRCUITS_RAPID,
};

export function getStaticRapidPool(subjectId: SubjectId) {
  return STATIC_POOLS[subjectId];
}

export function isRankingEligibleRapidQuestion(question: RapidQuestion) {
  const hasSelectableCorrectAnswer = question.options.length >= 2
    && question.options.some((option) => question.acceptedOptions.includes(option));
  const hasRequiredVisual = !question.requiresVisual || Boolean(question.visual);
  const hasRequiredReference = !question.requiresReference || Boolean(question.reference?.quote.trim());
  return hasSelectableCorrectAnswer && hasRequiredVisual && hasRequiredReference;
}

export function getOfficialRankingEligiblePool(subjectId: SubjectId) {
  return getStaticRapidPool(subjectId).filter(isRankingEligibleRapidQuestion);
}

const COMPREHENSIVE_POOLS: Record<SubjectId, RapidQuestion[]> = {
  "subject-2": examLevelPool(
    "subject-2",
    [...ENGLISH_QUESTIONS, ...ENGLISH_CH18_ACTUAL_QUIZ_QUESTIONS, ...ENGLISH_EXAM_LEVEL_QUESTIONS],
    (question) => isEnglishPoolItemInScope(question) && ACTIVE_ENGLISH_UNITS.has(question.unit ?? ""),
  ),
  network: networkCardsToRapid(DEFAULT_CARDS),
  "subject-3": examLevelPool(
    "subject-3",
    MECHANICAL_DYNAMICS_PRINT_LEVEL_QUESTIONS,
    (question) => question.difficulty === 3,
    mechanicalVisual,
  ),
  "subject-4": combineRapidPools(
    examLevelPool("subject-4", [...THERMODYNAMICS_QUESTIONS, ...THERMODYNAMICS_EXAM_LEVEL_QUESTIONS], () => true, thermodynamicsVisual),
    formulaCardPool("subject-4", THERMODYNAMICS_FORMULAS, thermodynamicsVisual),
  ),
  "subject-5": combineRapidPools(
    examLevelPool("subject-5", [...MATERIAL_MECHANICS_QUESTIONS, ...MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS], () => true, materialMechanicsVisual),
    formulaCardPool("subject-5", MATERIAL_MECHANICS_FORMULAS, materialMechanicsVisual),
  ),
  "subject-6": combineRapidPools(
    examLevelPool("subject-6", [...SMART_CONTROL_QUESTIONS, ...TEXTBOOK_RESPONSE_EXAM_LEVEL_QUESTIONS, ...SMART_CONTROL_EXAM_LEVEL_QUESTIONS], () => true, smartControlVisual),
    formulaCardPool("subject-6", [...SMART_CONTROL_CARDS, ...TEXTBOOK_RESPONSE_CARDS], smartControlVisual),
  ),
  "subject-7": combineRapidPools(
    examLevelPool("subject-7", [...STATISTICS_QUESTIONS, ...STATISTICS_EXAM_LEVEL_QUESTIONS], () => true),
    formulaCardPool("subject-7", STATISTICS_FORMULAS),
  ),
  "subject-8": combineRapidPools(
    examLevelPool("subject-8", [...APPLIED_MATH_QUESTIONS, ...APPLIED_MATH_EXAM_LEVEL_QUESTIONS], () => true),
    formulaCardPool("subject-8", APPLIED_MATH_FORMULAS),
  ),
  "subject-9": combineRapidPools(
    examLevelPool("subject-9", [...DIGITAL_CIRCUIT_ALL_QUESTIONS, ...DIGITAL_CIRCUIT_EXAM_LEVEL_QUESTIONS], () => true, digitalCircuitVisual),
    formulaCardPool("subject-9", DIGITAL_CIRCUIT_ALL_FORMULAS, digitalCircuitVisual),
  ),
};
export function getComprehensiveRapidPool(subjectId: SubjectId) {
  return COMPREHENSIVE_POOLS[subjectId];
}


export function shuffleWith<T>(values: readonly T[], random: () => number = Math.random) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

export function createRapidSession(pool: RapidQuestion[], count: number, random: () => number = Math.random) {
  if (!pool.length || count <= 0) return [];
  const result: RapidQuestionInstance[] = [];
  let cycle = shuffleWith(pool, random);
  for (let index = 0; index < count; index += 1) {
    if (index > 0 && index % pool.length === 0) {
      cycle = shuffleWith(pool, random);
      if (cycle.length > 1 && cycle[0].id === result[result.length - 1].id) {
        [cycle[0], cycle[1]] = [cycle[1], cycle[0]];
      }
    }
    const question = cycle[index % pool.length];
    result.push({ ...question, instanceId: `${question.id}-${index}` });
  }
  return result;
}

export function createBalancedRapidSession(
  pools: Record<SubjectId, RapidQuestion[]>,
  count: number,
  random: () => number = Math.random,
) {
  if (count < 9 || count > COMPREHENSIVE_MAX_QUESTIONS || count % 9 !== 0) return [];
  if (RAPID_SUBJECT_IDS.some((subjectId) => !pools[subjectId]?.length)) return [];
  const perSubject = count / 9;
  const subjectQueues = Object.fromEntries(RAPID_SUBJECT_IDS.map((subjectId) => [
    subjectId,
    createRapidSession(pools[subjectId], perSubject, random),
  ])) as Record<SubjectId, RapidQuestionInstance[]>;
  const result: RapidQuestionInstance[] = [];
  for (let round = 0; round < perSubject; round += 1) {
    for (const subjectId of shuffleWith(RAPID_SUBJECT_IDS, random)) {
      result.push(subjectQueues[subjectId][round]);
    }
  }
  return result.map((question, index) => ({ ...question, instanceId: `${question.id}-balanced-${index}` }));
}

export function unwrapRapidMath(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("\\(") && trimmed.endsWith("\\)")
    ? trimmed.slice(2, -2)
    : trimmed;
}
export function isRapidAnswerCorrect(question: RapidQuestion, selected: string | null) {
  return selected !== null && question.acceptedOptions.includes(selected);
}

export function normalizeOverallQuestionCount(value: number) {
  const bounded = Math.min(COMPREHENSIVE_MAX_QUESTIONS, Math.max(9, Math.round(value)));
  return Math.min(COMPREHENSIVE_MAX_QUESTIONS, Math.max(9, Math.round(bounded / 9) * 9));
}
