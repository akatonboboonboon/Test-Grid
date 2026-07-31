export type PartialCreditProfile =
  | "english"
  | "engineering"
  | "statistics"
  | "digital"
  | "smart-control";

export type PartialCreditQuestion = {
  points: number;
  section?: string;
  format?: string;
  genre?: string;
  steps?: readonly string[];
  requiresUnit?: boolean;
};

export type PartialCreditBand = {
  points: number;
  label: string;
  description: string;
};

function uniqueBands(bands: PartialCreditBand[], maximum: number) {
  const byPoints = new Map<number, PartialCreditBand>();
  bands.forEach((band) => {
    const points = Math.max(0, Math.min(maximum, Math.floor(band.points)));
    byPoints.set(points, { ...band, points });
  });
  return [...byPoints.values()].sort((left, right) => left.points - right.points);
}

function scaledBands(points: number, finalDescription: string) {
  return uniqueBands([
    { points: 0, label: "0点", description: "無答、別問題、または根拠が成立していない。" },
    { points: Math.max(1, Math.floor(points * 0.25)), label: "方針", description: "使う公式・定理・回路の方針が正しい。" },
    { points: Math.max(1, Math.floor(points * 0.5)), label: "途中まで", description: "立式と主要な途中値・表・状態までは正しい。" },
    { points: Math.max(1, Math.floor(points * 0.75)), label: "ほぼ正解", description: "解法は正しく、計算・符号・表記に軽微な誤りだけがある。" },
    { points, label: "満点", description: finalDescription },
  ], points);
}

export function pastPaperPartialCreditBands(
  question: PartialCreditQuestion,
  profile: PartialCreditProfile,
): PartialCreditBand[] {
  const points = Math.max(0, Math.floor(question.points));
  if (!points) return [{ points: 0, label: "0点", description: "配点なし。" }];

  if (profile === "english") {
    if (question.section === "order") {
      return uniqueBands([
        { points: 0, label: "0点", description: "語順の骨格が成立していない。" },
        { points: 1, label: "全語使用", description: "提示語をすべて一度ずつ使用している。" },
        { points: 2, label: "主述", description: "全語使用に加え、主語・述語の骨格が正しい。" },
        { points: 3, label: "節の接続", description: "節・動詞・関係詞などの接続まで正しい。" },
        { points: 4, label: "修飾位置", description: "修飾語・前置詞・冠詞の位置まで正しく、軽微な語形誤りだけがある。" },
        { points, label: "満点", description: "全語を一度ずつ使い、本文どおりの語順・活用で完成している。" },
      ], points);
    }
    if (question.section === "sentence-ja-en") {
      return uniqueBands([
        { points: 0, label: "0点", description: "英文の骨格が成立していない。" },
        { points: 1, label: "語彙", description: "本文の主要語句を正しく使えている。" },
        { points: 2, label: "文法", description: "主語・動詞・修飾関係が正しく、意味が通る。" },
        { points, label: "満点", description: "本文に沿う語彙・文法・語順・綴りで完成している。" },
      ], points);
    }
    if (question.section === "translation") {
      return uniqueBands([
        { points: 0, label: "0点", description: "原文の中心内容が取れていない。" },
        { points: 1, label: "語句", description: "重要語句の意味を一部取れている。" },
        { points: 2, label: "主節", description: "主語・述語と文の中心内容が正しい。" },
        { points: 3, label: "修飾まで", description: "修飾関係・時制・因果まで正しく、軽微な訳抜けだけがある。" },
        { points, label: "満点", description: "原文の関係を保ち、意味の過不足がない自然な日本語である。" },
      ], points);
    }
    return [
      { points: 0, label: "0点", description: "誤答または未回答。" },
      { points, label: "満点", description: "過去問同様、選択・T/F・綴りを含め正答した場合のみ得点。" },
    ];
  }

  if (profile === "digital") {
    return scaledBands(points, "論理式・状態表／波形・最終出力が矛盾せず、必要な図と根拠まで正しい。");
  }
  if (profile === "smart-control") {
    return scaledBands(points, "変換・極・係数・安定判定を根拠付きで最後まで正しく示している。");
  }
  if (profile === "statistics") {
    return scaledBands(points, "定義・式・代入・丸め・結論が過去問の指示どおりである。");
  }
  return scaledBands(
    points,
    question.requiresUnit
      ? "式・代入・途中値・最終値・指定単位がすべて正しい。"
      : "式・代入・途中値・最終結論がすべて正しい。",
  );
}

export function clampPartialCredit(points: number, value: unknown) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(Math.floor(points), Math.floor(parsed))) : 0;
}
