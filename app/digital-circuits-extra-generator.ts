import type { DigitalCircuitStudyQuestion } from "./digital-circuits-extra-data";

export const DIGITAL_CIRCUIT_EXTRA_GENERATOR_SPECS = [
  {
    id: "xor-waveform", sourceLabel: "スマート制御演習1.pdf p.1（現行デジタル回路範囲）",
    parameters: { intervals: 4, inputs: ["00", "01", "10", "11"] },
    formula: "Y=A\\oplus B=\\overline AB+A\\overline B",
    answerRule: "入力が異なる区間だけ1。",
  },
  {
    id: "cyclic-down-10-2", sourceLabel: "スマート制御過去問.pdf p.2（現行デジタル回路範囲）",
    parameters: { states: [10, 9, 8, 7, 6, 5, 4, 3, 2], requestedSteps: 3 },
    formula: "10\\to9\\to\\cdots\\to2\\to10",
    answerRule: "1ずつ減らし、2の次だけ10へ戻す。",
  },
  {
    id: "sequence-detector-1001", sourceLabel: "スマート制御過去問.pdf p.4（現行デジタル回路範囲）",
    parameters: { currentStates: ["00", "01", "10", "11"], input: [0, 1] },
    formula: "00:\\varnothing,\\ 01:1,\\ 10:10,\\ 11:100",
    answerRule: "状態は一致した接頭辞。状態11で入力1のときだけ出力1。",
  },
] as const;

function randomFor(seed: number) {
  let value = (Math.floor(seed) || 7) >>> 0;
  return () => {
    value = Math.imul(value ^ (value >>> 15), 1 | value);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
const binary = (value: number, bits = 2) => value.toString(2).padStart(bits, "0");
const source = (filename: string, page: number, note: string) => [{
  kind: "scope-zip" as const, filename, page, note: "追加現行範囲PDF：" + note,
}];

function generateDigitalCircuitExtraFoundationQuestion(seed = Date.now()): DigitalCircuitStudyQuestion {
  const random = randomFor(seed);
  const variant = Math.abs(Math.floor(seed)) % 3;
  const id = "dc-extra-generated-" + seed + "-" + variant;
  if (variant === 0) {
    const inputs = Array.from({ length: 4 }, () => binary(Math.floor(random() * 4)));
    const outputs = inputs.map((pair) => Number(pair[0]) ^ Number(pair[1]));
    return {
      id, topic: "logic-timing", genre: "自動生成・XOR波形", difficulty: 2, format: "sequence",
      prompt: "4区間のABが" + inputs.join(",") + "の順。XOR出力列を答えよ。",
      answer: outputs.join(""), accepted: [outputs.join(","), outputs.join(" ")],
      formula: DIGITAL_CIRCUIT_EXTRA_GENERATOR_SPECS[0].formula,
      steps: inputs.map((pair, index) => "区間" + (index + 1) + "の" + pair + "は" + (pair[0] === pair[1] ? "同じ→0" : "異なる→1") + "。"),
      explanation: DIGITAL_CIRCUIT_EXTRA_GENERATOR_SPECS[0].answerRule,
      diagram: "xor-timing", sourceRefs: source("スマート制御演習1.pdf", 1, "第6回演習"),
    };
  }
  if (variant === 1) {
    const states = [10, 9, 8, 7, 6, 5, 4, 3, 2];
    const current = states[Math.floor(random() * states.length)];
    const nextStates: number[] = [];
    let value = current;
    for (let index = 0; index < 3; index += 1) {
      value = value === 2 ? 10 : value - 1;
      nextStates.push(value);
    }
    return {
      id, topic: "counters", genre: "自動生成・10→2巡回", difficulty: 2, format: "sequence",
      prompt: "10から2まで下がって10へ戻る4ビット巡回カウンタ。現在" + current + "（" + binary(current, 4) + "）から次の3状態を答えよ。",
      answer: nextStates.map((item) => binary(item, 4)).join(","),
      accepted: [nextStates.join(","), nextStates.map((item) => binary(item, 4)).join("→")],
      formula: DIGITAL_CIRCUIT_EXTRA_GENERATOR_SPECS[1].formula,
      steps: nextStates.map((item, index) => (index + 1) + "段目は" + item + "（" + binary(item, 4) + "）。"),
      explanation: DIGITAL_CIRCUIT_EXTRA_GENERATOR_SPECS[1].answerRule,
      diagram: "cyclic-down-10-2", sourceRefs: source("スマート制御過去問.pdf", 2, "問2"),
    };
  }

  const states = ["00", "01", "10", "11"] as const;
  const current = states[Math.floor(random() * states.length)];
  const input = Math.floor(random() * 2);
  const transitions: Record<string, [string, number]> = {
    "00-0": ["00", 0], "00-1": ["01", 0],
    "01-0": ["10", 0], "01-1": ["01", 0],
    "10-0": ["11", 0], "10-1": ["01", 0],
    "11-0": ["00", 0], "11-1": ["01", 1],
  };
  const [next, output] = transitions[current + "-" + input];
  return {
    id, topic: "state-machines", genre: "自動生成・1001検出", difficulty: 2, format: "sequence",
    prompt: "1001 Mealy検出器で現在状態" + current + "、入力I=" + input + "。次状態/出力を答えよ。",
    answer: next + "/" + output, accepted: ["S=" + next + ",O=" + output],
    formula: DIGITAL_CIRCUIT_EXTRA_GENERATOR_SPECS[2].formula,
    steps: ["状態" + current + "が表す一致済み接頭辞を確認する。", "入力" + input + "を末尾へ付け、最長の接頭辞状態と検出出力を決める。"],
    explanation: DIGITAL_CIRCUIT_EXTRA_GENERATOR_SPECS[2].answerRule,
    diagram: "sequence-detector-1001", sourceRefs: source("スマート制御過去問.pdf", 4, "問4"),
  };
}
function calibrateGeneratedExtraQuestion(question: DigitalCircuitStudyQuestion): DigitalCircuitStudyQuestion {
  const designInstruction = question.topic === "state-machines"
    ? "4状態×2入力の8遷移を接頭辞の一致長から再構成し、重なり検出を含むMealy図へ照合する。"
    : question.topic === "counters"
      ? "10進・4ビット二進を併記した全周回表を作り、0010の次に1010を再ロードする条件を確認する。"
      : "入力変化点で区間を分け、XORの真理値表と論理式の両方から全区間の波形を作る。";
  return {
    ...question,
    difficulty: 3,
    context: "現行範囲PDFの過去問・演習と同じ設計手順で解く生成問題です。途中表と図を残してください。",
    prompt: `【過去問水準4段階】(1) ${designInstruction} (2) 指定図へ全途中結果を記入する。 (3) 未使用状態・周回端・系列重なりを検算する。 (4) ${question.prompt}`,
    steps: [designInstruction, ...question.steps, "未使用状態・周回端・系列の重なりを検算する。", "問題図と最終答案を全区間または全遷移で照合する。"],
    explanation: `${question.explanation} 出力列だけでなく、設計表と図が一致するところまでを本番答案として確認する。`,
    subpartCount: 4,
    sourceBasis: question.sourceRefs.map((source) => `${source.filename} p.${source.page}${source.note ? `：${source.note}` : ""}`),
    examLevel: true,
  };
}

/** 現行範囲PDFに基づき、解・図・全遷移を確定した本番水準の生成問題。 */
export function generateDigitalCircuitExtraQuestion(seed = Date.now()): DigitalCircuitStudyQuestion {
  return calibrateGeneratedExtraQuestion(generateDigitalCircuitExtraFoundationQuestion(seed));
}
