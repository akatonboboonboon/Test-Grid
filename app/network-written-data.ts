import { DEFAULT_CARDS, cardLayers, type Layer } from "./protocols";

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
  const passedChecks = [enoughCharacters, layerCorrect, contentMatched].filter(Boolean).length;
  const estimatedScore: NetworkWrittenEvaluation["estimatedScore"] =
    enoughCharacters && layerCorrect && contentMatched ? 10
      : enoughCharacters && layerCorrect ? 8
        : passedChecks >= 2 ? 5
          : passedChecks === 1 ? 3
            : 0;
  return {
    characterCount,
    enoughCharacters,
    layerCorrect,
    matchedKeywords,
    contentMatched,
    qualified: enoughCharacters && layerCorrect && contentMatched,
    estimatedScore,
  };
}
