import { DEFAULT_CARDS, cardLayers, type Layer } from "./protocols";
import { gradeNetworkWrittenContent } from "./network-written-grading";

export type NetworkWrittenLayerChoice = Layer;

export type NetworkWrittenTerm = {
  id: string;
  term: string;
  fullName?: string;
  category: string;
  expectedLayers: Layer[];
  layerLabel: string;
  layerReason: string;
  keywords: string[];
  modelAnswer: string;
  source: "protocol-card";
};

export type NetworkWrittenEvaluation = {
  characterCount: number;
  enoughCharacters: boolean;
  layerCorrect: boolean;
  matchedKeywords: string[];
  contentMatched: boolean;
  matchedRubricItems: string[];
  expectedRubricItems: string[];
  requiredRubricItems: number;
  detailMatched: boolean;
  actionMatched: boolean;
  contradictions: string[];
  qualified: boolean;
  estimatedScore: 0 | 3 | 5 | 8 | 10;
};

export const NETWORK_WRITTEN_CATEGORIES = [
  "すべて",
  "L1 物理層",
  "L2 データリンク層",
  "L3 ネットワーク層",
  "L4 トランスポート層",
  "L5 セッション層",
  "L6 プレゼンテーション層",
  "L7 アプリケーション層",
] as const;

export type NetworkWrittenCategory = (typeof NETWORK_WRITTEN_CATEGORIES)[number];

const LAYER_LABELS: Record<Layer, string> = {
  1: "L1 物理層",
  2: "L2 データリンク層",
  3: "L3 ネットワーク層",
  4: "L4 トランスポート層",
  5: "L5 セッション層",
  6: "L6 プレゼンテーション層",
  7: "L7 アプリケーション層",
};

const LAYER_REASON: Record<Layer, string> = {
  1: "信号・媒体・ビットの伝送を扱うため物理層です。",
  2: "同一リンク上のフレームやMAC関連処理を扱うためデータリンク層です。",
  3: "IPアドレス・経路制御・ネットワーク間配送を扱うためネットワーク層です。",
  4: "端末間の転送、ポート番号、信頼性や流量を扱うためトランスポート層です。",
  5: "通信セッションの確立・維持・終了を扱うためセッション層です。",
  6: "暗号化やデータ表現の変換を扱うためプレゼンテーション層です。",
  7: "アプリケーションへ直接通信サービスを提供するためアプリケーション層です。",
};

function protocolKeywords(description: string, layers: Layer[]) {
  const candidates: string[] = [];
  if (/暗号|認証|鍵/.test(description)) candidates.push("暗号", "認証");
  if (/経路|ルータ|パケット|IP/.test(description)) candidates.push("経路", "パケット");
  if (/フレーム|MAC|LAN/.test(description)) candidates.push("フレーム", "MAC");
  if (/ポート|セグメント|再送|順序/.test(description)) candidates.push("ポート", "再送");
  if (/名前|ドメイン/.test(description)) candidates.push("名前", "IPアドレス");
  if (/メール/.test(description)) candidates.push("メール");
  if (/時刻/.test(description)) candidates.push("時刻", "同期");
  if (/ファイル/.test(description)) candidates.push("ファイル", "転送");
  if (/HTTP|Web|URL/.test(description)) candidates.push("HTTP", "Web");
  if (/管理|監視|MIB/.test(description)) candidates.push("管理", "監視");
  if (/ログ|イベント/.test(description)) candidates.push("ログ", "イベント");
  if (/音声|映像|リアルタイム/.test(description)) candidates.push("音声", "映像");
  if (/接続|セッション/.test(description)) candidates.push("接続", "セッション");
  if (candidates.length === 0) {
    const layerFallback: Record<Layer, string[]> = {
      1: ["信号", "伝送", "媒体"],
      2: ["フレーム", "MAC", "リンク"],
      3: ["経路", "パケット", "IP"],
      4: ["ポート", "転送", "通信"],
      5: ["セッション", "接続", "通信"],
      6: ["暗号", "変換", "データ"],
      7: ["通信", "要求", "サービス"],
    };
    layers.forEach((layer) => candidates.push(...layerFallback[layer]));
  }
  return [...new Set(candidates)];
}

/**
 * 今回の出題範囲は、最初に提供された層別写真から作成したDEFAULT_CARDSのみ。
 * 後から提供された「ネットワーク形式1・2」の印字語は形式例であり、ここへ追加しない。
 */
export const NETWORK_WRITTEN_TERMS: NetworkWrittenTerm[] = DEFAULT_CARDS.map((card) => {
  const layers = cardLayers(card);
  const description = card.description?.trim()
    || `${card.label}はネットワーク通信で利用され、対応する層の通信手順や処理方法を定めます。`;
  return {
    id: `protocol-${card.id}`,
    term: card.label,
    fullName: card.fullName?.trim() || undefined,
    category: layers.map((layer) => LAYER_LABELS[layer]).join("・"),
    expectedLayers: layers,
    layerLabel: layers.map((layer) => LAYER_LABELS[layer]).join("・"),
    layerReason: card.note || layers.map((layer) => LAYER_REASON[layer]).join(" "),
    keywords: protocolKeywords(description, layers),
    modelAnswer: description,
    source: "protocol-card",
  };
});

const CATEGORY_LAYER = new Map<NetworkWrittenCategory, Layer>([
  ["L1 物理層", 1],
  ["L2 データリンク層", 2],
  ["L3 ネットワーク層", 3],
  ["L4 トランスポート層", 4],
  ["L5 セッション層", 5],
  ["L6 プレゼンテーション層", 6],
  ["L7 アプリケーション層", 7],
]);

export function networkWrittenCategoryMatches(term: NetworkWrittenTerm, category: NetworkWrittenCategory) {
  if (category === "すべて") return true;
  const layer = CATEGORY_LAYER.get(category);
  return layer !== undefined && term.expectedLayers.includes(layer);
}

export function networkWrittenCharacterCount(answer: string) {
  return Array.from(answer.normalize("NFKC").replace(/\s/gu, "")).length;
}

function normalizeForMatch(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("ja-JP").replace(/[\s、。・／/（）()「」『』,.:：-]/gu, "");
}

export function networkWrittenLayerCorrect(term: NetworkWrittenTerm, choice: NetworkWrittenLayerChoice | null) {
  return choice !== null && term.expectedLayers.includes(choice);
}

export function evaluateNetworkWrittenAnswer(
  term: NetworkWrittenTerm,
  answer: string,
  choice: NetworkWrittenLayerChoice | null,
): NetworkWrittenEvaluation {
  const characterCount = networkWrittenCharacterCount(answer);
  const enoughCharacters = characterCount >= 20;
  const layerCorrect = networkWrittenLayerCorrect(term, choice);
  const normalizedAnswer = normalizeForMatch(answer);
  const normalizedTerm = normalizeForMatch(term.term);
  const answerWithoutRepeatedTerm = normalizedTerm
    ? normalizedAnswer.split(normalizedTerm).join("")
    : normalizedAnswer;
  const matchedKeywords = term.keywords.filter((keyword) => answerWithoutRepeatedTerm.includes(normalizeForMatch(keyword)));
  const contentMatched = matchedKeywords.length > 0;
  const strictContent = gradeNetworkWrittenContent(term, answer);
  const fullyQualified = (
    enoughCharacters
    && layerCorrect
    && strictContent.detailMatched
    && strictContent.actionMatched
    && strictContent.contradictions.length === 0
  );
  const nearlyComplete = (
    enoughCharacters
    && layerCorrect
    && strictContent.actionMatched
    && strictContent.matchedItems.length >= Math.max(2, strictContent.requiredItems - 1)
  );
  const estimatedScore: NetworkWrittenEvaluation["estimatedScore"] =
    !enoughCharacters ? 0
      : strictContent.contradictions.length > 0 ? 0
        : !layerCorrect ? (strictContent.detailMatched && strictContent.actionMatched ? 3 : 0)
          : fullyQualified ? 10
            : nearlyComplete ? 8
              : strictContent.matchedItems.length > 0 && strictContent.actionMatched ? 5
                : 3;
  return {
    characterCount,
    enoughCharacters,
    layerCorrect,
    matchedKeywords,
    contentMatched,
    matchedRubricItems: strictContent.matchedItems,
    expectedRubricItems: strictContent.expectedItems,
    requiredRubricItems: strictContent.requiredItems,
    detailMatched: strictContent.detailMatched,
    actionMatched: strictContent.actionMatched,
    contradictions: strictContent.contradictions,
    qualified: fullyQualified,
    estimatedScore,
  };
}

export type NetworkWrittenExamQuestion = {
  id: string;
  topic: "層＋20文字記述";
  group: "本試験形式・層と働き";
  format: "choice";
  difficulty: 3;
  context: string;
  prompt: string;
  answer: string;
  accepted: string[];
  options: string[];
  explanation: string;
  steps: string[];
  sourceBasis: string;
  termId: string;
  minimumCharacters: 20;
};

export type NetworkWrittenMockPaper = {
  id: string;
  number: number;
  title: string;
  durationMinutes: 50;
  totalPoints: 100;
  pointsPerQuestion: 10;
  termIds: string[];
};

const EXAM_CONTEXT =
  "本試験の記述答案を選択式に置き換えた問題です。層だけでなく、20文字以上に相当する働きの説明まで正しいものを選びます。";

function retargetModelAnswer(source: NetworkWrittenTerm, target: NetworkWrittenTerm) {
  const remainder = source.modelAnswer.startsWith(source.term)
    ? source.modelAnswer.slice(source.term.length)
    : `は${source.modelAnswer}`;
  return `${target.term}${remainder}`;
}

function layerStatement(layerLabel: string, description: string) {
  return `${layerLabel}｜${description}`;
}

function rotateOptions(options: string[], offset: number) {
  const amount = offset % options.length;
  return [...options.slice(amount), ...options.slice(0, amount)];
}

/**
 * 時間制限・ランキング・総合問題で使う本試験形式の選択問題。
 * 単なる「第何層？」ではなく、層と働きの両方が一致しないと正解できない。
 */
export const NETWORK_EXAM_LEVEL_QUESTIONS: NetworkWrittenExamQuestion[] = NETWORK_WRITTEN_TERMS.map((term, index, terms) => {
  const expectedLayerLabel = term.layerLabel;
  const wrongLayer = ([1, 2, 3, 4, 5, 6, 7] as Layer[])
    .find((layer) => !term.expectedLayers.includes(layer)) ?? 1;
  const sameLayerOther = terms.find((candidate) => (
    candidate.id !== term.id
    && candidate.expectedLayers.some((layer) => term.expectedLayers.includes(layer))
  )) ?? terms[(index + 1) % terms.length];
  const differentLayerOther = terms.find((candidate) => (
    candidate.id !== term.id
    && candidate.expectedLayers.every((layer) => !term.expectedLayers.includes(layer))
  )) ?? terms[(index + 2) % terms.length];
  const answer = layerStatement(expectedLayerLabel, term.modelAnswer);
  const options = rotateOptions([
    answer,
    layerStatement(LAYER_LABELS[wrongLayer], term.modelAnswer),
    layerStatement(expectedLayerLabel, retargetModelAnswer(sameLayerOther, term)),
    layerStatement(LAYER_LABELS[wrongLayer], retargetModelAnswer(differentLayerOther, term)),
  ], index % 4);
  return {
    id: `network-written-choice-${term.id}`,
    topic: "層＋20文字記述",
    group: "本試験形式・層と働き",
    format: "choice",
    difficulty: 3,
    context: EXAM_CONTEXT,
    prompt: `${term.term}について、層と働きの両方が正しい説明を選びなさい。`,
    answer,
    accepted: [answer],
    options,
    explanation: [
      term.fullName ? `正式名称：${term.fullName}。` : "",
      `正しい層：${term.layerLabel}。${term.layerReason}`,
      `働き：${term.modelAnswer}`,
      "誤答は、層だけを入れ替えたもの、または同じ層の別プロトコルの働きを混ぜたものです。",
    ].filter(Boolean).join("\n"),
    steps: [
      "略称を正式名称へ展開する。",
      "主要な働きからOSI層を判定する。",
      "選択肢の説明が、そのプロトコル自身の働きかまで照合する。",
    ],
    sourceBasis: "最初に提供された層別写真から作成した96プロトコル（形式資料の印字語は除外）",
    termId: term.id,
    minimumCharacters: 20,
  };
});

function buildBalancedMockTermIds(paperIndex: number) {
  const picked = new Set<string>();
  ([1, 2, 3, 4, 5, 6, 7] as Layer[]).forEach((layer) => {
    const candidates = NETWORK_WRITTEN_TERMS.filter((term) => term.expectedLayers.includes(layer));
    const candidate = candidates[(paperIndex * 5 + layer - 1) % candidates.length];
    if (candidate) picked.add(candidate.id);
  });
  for (let offset = 0; picked.size < 10 && offset < NETWORK_WRITTEN_TERMS.length; offset += 1) {
    picked.add(NETWORK_WRITTEN_TERMS[(paperIndex * 17 + offset) % NETWORK_WRITTEN_TERMS.length].id);
  }
  return [...picked].slice(0, 10);
}

/** 50分・10語・100点。答案は各語について「層＋20文字以上の働き」を書く。 */
export const NETWORK_WRITTEN_MOCKS: NetworkWrittenMockPaper[] = Array.from({ length: 6 }, (_, index) => ({
  id: `network-written-mock-${String(index + 1).padStart(2, "0")}`,
  number: index + 1,
  title: `ネットワーク記述模試 ${String(index + 1).padStart(2, "0")}`,
  durationMinutes: 50,
  totalPoints: 100,
  pointsPerQuestion: 10,
  termIds: buildBalancedMockTermIds(index),
}));
