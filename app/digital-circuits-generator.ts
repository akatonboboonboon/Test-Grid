import type { DigitalCircuitQuestion, DigitalCircuitSourceRef } from "./digital-circuits-data";

const ref = (page: number, filename: string, note?: string): DigitalCircuitSourceRef => ({
  kind: "scope-zip", page, filename, ...(note ? { note } : {}),
});
const P1 = ref(1, "PXL_20260717_140938493.jpg");
const P2 = ref(2, "PXL_20260717_140945940.jpg");
const P3 = ref(3, "PXL_20260717_140948671.jpg");
const P4 = ref(4, "PXL_20260717_141002906.jpg");
const P5 = ref(5, "PXL_20260717_141005403.jpg");
const P6 = ref(6, "PXL_20260717_141012846.jpg");
const EX3 = ref(1, "スマート制御演習3.pdf", "追加現行範囲PDF・第8回演習");

export const DIGITAL_CIRCUIT_GENERATOR_SPECS = [
  {
    id: "gate-waveform", topic: "logic-timing", sourceLabel: "範囲資料 p.1", sourceRefs: [P1],
    parameters: { gate: ["AND", "OR"], intervals: 4, inputs: ["00", "01", "10", "11"] },
    formula: "Y=A\\cdot B\\quad\\text{or}\\quad Y=A+B",
    answerRule: "各区間のABを真理値表へ入れ、ANDは11だけ1、ORは00だけ0。",
  },
  {
    id: "d-flipflop-waveform", topic: "flipflops", sourceLabel: "範囲資料 p.2", sourceRefs: [P2],
    parameters: { edges: 4, dValues: [0, 1], initialQ: [0, 1] }, formula: "Q^+=D",
    answerRule: "各有効エッジ直前のDが、そのエッジ直後のQ。",
  },
  {
    id: "jk-flipflop-waveform", topic: "flipflops", sourceLabel: "範囲資料 p.2・4", sourceRefs: [P2, P4],
    parameters: { edges: 4, jkInputs: ["00", "01", "10", "11"], initialQ: [0, 1] },
    formula: "00:\\text{保持},\\ 01:\\text{リセット},\\ 10:\\text{セット},\\ 11:\\text{反転}",
    answerRule: "直前のQを使って、各エッジで動作表を一段ずつ適用する。",
  },
  {
    id: "parallel-register", topic: "registers", sourceLabel: "範囲資料 p.3", sourceRefs: [P3],
    parameters: { bits: 2, edges: 3, words: ["00", "01", "10", "11"] },
    formula: "\\boldsymbol Q^+=\\boldsymbol D",
    answerRule: "各正エッジ直前のD1D0を、そのままQ1Q0へ写す。",
  },
  {
    id: "binary-counter", topic: "counters", sourceLabel: "範囲資料 p.5", sourceRefs: [P5],
    parameters: { bits: 3, direction: ["asynchronous-down"], current: [0, 1, 2, 3, 4, 5, 6, 7], steps: 2 },
    formula: "M=2^n",
    answerRule: "3ビット（法8）の非同期ダウンとして1ずつ減算し、0の次は7へ折り返す。",
  },
  {
    id: "state-table-row", topic: "state-machines", sourceLabel: "追加現行範囲PDF・第8回演習", sourceRefs: [EX3],
    parameters: { currentS: [0, 1], inputsA: [0, 1] },
    formula: "\\begin{aligned}S^+&=A\\overline S\\\\Y&=AS\\end{aligned}",
    answerRule: "現在状態Sを固定し、A=0,1を範囲資料どおりの次状態式と出力式へ代入する。",
  },
  {
    id: "synchronous-up-counter", topic: "counters", sourceLabel: "範囲資料 p.6", sourceRefs: [P6],
    parameters: { bits: 3, direction: ["synchronous-up"], current: [0, 1, 2, 3, 4, 5, 6, 7], steps: 2, jkInputs: ["1", "Q0", "Q0Q1"] },
    formula: "\\begin{aligned}J_0=K_0&=1\\\\J_1=K_1&=Q_0\\\\J_2=K_2&=Q_0Q_1\\end{aligned}",
    answerRule: "全FFを共通CLKで同時更新し、3ビットの同期アップ列を1ずつ進める。",
  },
] as const;

function seededRandom(seed: number) {
  let state = (Math.floor(seed) || 1) >>> 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
function binary(value: number, bits = 3) {
  return value.toString(2).padStart(bits, "0");
}

function generateDigitalCircuitFoundationQuestion(seed = Date.now()): DigitalCircuitQuestion {
  const random = seededRandom(seed);
  const generatorIndex = Math.abs(Math.floor(seed)) % DIGITAL_CIRCUIT_GENERATOR_SPECS.length;
  const spec = DIGITAL_CIRCUIT_GENERATOR_SPECS[generatorIndex];
  const id = "dc-generated-" + seed + "-" + generatorIndex;

  if (spec.id === "gate-waveform") {
    const gate = random() < 0.5 ? "AND" : "OR";
    const inputs = Array.from({ length: 4 }, () => binary(Math.floor(random() * 4), 2));
    const output = inputs.map((pair) => gate === "AND"
      ? Number(pair[0]) & Number(pair[1])
      : Number(pair[0]) | Number(pair[1])).join("");
    return {
      id, topic: "logic-timing", genre: "自動生成・タイミング", difficulty: 2, format: "sequence",
      prompt: gate + "ゲートで、4区間のABが" + inputs.join(",") + "の順。出力列を4桁で答えよ。",
      answer: output, accepted: [output.split("").join(","), output.split("").join(" ")],
      formula: gate === "AND" ? "Y=A\\cdot B" : "Y=A+B",
      steps: inputs.map((pair, index) => "区間" + (index + 1) + "：" + pair + "を真理値表へ入れる。"),
      explanation: spec.answerRule, diagram: gate === "AND" ? "and-timing" : "or-timing", sourceRefs: [...spec.sourceRefs],
    };
  }
  if (spec.id === "d-flipflop-waveform") {
    const values = Array.from({ length: 4 }, () => Math.floor(random() * 2));
    return {
      id, topic: "flipflops", genre: "自動生成・D-FF", difficulty: 2, format: "sequence",
      prompt: "4回の正エッジ直前のDが" + values.join(",") + "。各直後のQ列を答えよ。",
      answer: values.join(""), accepted: [values.join(","), values.join(" ")], formula: "Q^+=D",
      steps: values.map((value, index) => (index + 1) + "回目はD=" + value + "を取り込む。"),
      explanation: spec.answerRule, diagram: "d-ff", sourceRefs: [...spec.sourceRefs],
    };
  }
  if (spec.id === "jk-flipflop-waveform") {
    const inputs = Array.from({ length: 4 }, () => binary(Math.floor(random() * 4), 2));
    const initial = Math.floor(random() * 2);
    let state = initial;
    const states = inputs.map((input) => {
      if (input === "01") state = 0;
      if (input === "10") state = 1;
      if (input === "11") state = 1 - state;
      return state;
    });
    return {
      id, topic: "flipflops", genre: "自動生成・JK-FF", difficulty: 2, format: "sequence",
      prompt: "初期Q=" + initial + "。JKが" + inputs.join(",") + "の順。Q列を答えよ。",
      answer: states.join(""), accepted: [states.join(","), states.join(" ")], formula: spec.formula,
      steps: inputs.map((input, index) => "JK=" + input + "を適用しQ=" + states[index] + "。"),
      explanation: spec.answerRule, diagram: "jk-ff", sourceRefs: [...spec.sourceRefs],
    };
  }
  if (spec.id === "parallel-register") {
    const words = Array.from({ length: 3 }, () => binary(Math.floor(random() * 4), 2));
    return {
      id, topic: "registers", genre: "自動生成・レジスタ", difficulty: 2, format: "sequence",
      prompt: "3回の正エッジ直前のD1D0が" + words.join(",") + "。各直後のQ1Q0を答えよ。",
      answer: words.join("-"), accepted: [words.join(","), words.join("→")], formula: spec.formula,
      steps: words.map((word, index) => (index + 1) + "回目で" + word + "を同時記憶。"),
      explanation: spec.answerRule, diagram: "parallel-register", sourceRefs: [...spec.sourceRefs],
    };
  }
  if (spec.id === "binary-counter") {
    const current = Math.floor(random() * 8);
    const next = (current - 1 + 8) % 8;
    const after = (next - 1 + 8) % 8;
    return {
      id, topic: "counters", genre: "自動生成・非同期ダウン", difficulty: 2, format: "sequence",
      prompt: "3ビット非同期ダウンカウンタの現在状態は" + binary(current) + "。次の2状態は？",
      answer: binary(next) + "," + binary(after), accepted: [binary(next) + "→" + binary(after), binary(next) + " " + binary(after)],
      formula: "M=2^3=8", steps: ["現在値を10進数で" + current + "と読む。", "1ずつ減らし、0の次は7へ折り返す。"],
      explanation: spec.answerRule, diagram: "ripple-down", sourceRefs: [...spec.sourceRefs],
    };
  }
  if (spec.id === "synchronous-up-counter") {
    const current = Math.floor(random() * 8);
    const next = (current + 1) % 8;
    const after = (next + 1) % 8;
    return {
      id, topic: "counters", genre: "自動生成・同期アップ", difficulty: 2, format: "sequence",
      prompt: "J0=K0=1、J1=K1=Q0、J2=K2=Q0Q1で全段が共通CLKを受ける。現在" + binary(current) + "の次の2状態は？",
      answer: binary(next) + "," + binary(after), accepted: [binary(next) + "→" + binary(after), binary(next) + " " + binary(after)],
      formula: spec.formula,
      steps: ["各段のJ=Kは順に1、Q0、Q0Q1。", "共通クロック端で3段を同時更新し、1ずつアップする。"],
      explanation: spec.answerRule, diagram: "sync-counter", sourceRefs: [...spec.sourceRefs],
    };
  }
  const current = Math.floor(random() * 2);
  const rows = [0, 1].map((input) => ({ next: input * (1 - current), output: input * current }));
  return {
    id, topic: "state-machines", genre: "自動生成・状態表", difficulty: 2, format: "sequence",
    prompt: "S+=A・S̅、Y=A・S。現在S=" + current + "でA=0,1の順。次状態/出力は？",
    answer: rows.map((row) => row.next + "/" + row.output).join(","),
    accepted: [rows.map((row) => row.next + "/" + row.output).join("→")], formula: spec.formula,
    steps: ["現在S=" + current + "を固定する。", "A=0と1を範囲資料の2式へ代入する。"],
    explanation: spec.answerRule, diagram: "state-analysis", sourceRefs: [...spec.sourceRefs],
  };
}
function calibrateGeneratedDigitalQuestion(question: DigitalCircuitQuestion): DigitalCircuitQuestion {
  const designInstruction = question.topic === "state-machines"
    ? "次状態式・出力式から全入力組の状態表を作り、指定行を状態図へ照合する。"
    : question.topic === "counters"
      ? "各FFのトグル条件と現在状態を表にし、全段同時更新かリップル伝搬かを区別して追う。"
      : "有効エッジまたは全入力変化点で区間を分け、各区間の入力・現在状態・次状態を表にする。";
  return {
    ...question,
    difficulty: 3,
    context: "本番形式の生成問題です。問題図へ途中波形・状態列を書き込んでから最終列を入力してください。",
    prompt: `【設計・検算4段階】(1) ${designInstruction} (2) 全区間または全遷移を図へ記入する。 (3) 端状態・保持・折返しを検算する。 (4) ${question.prompt}`,
    steps: [designInstruction, ...question.steps, "端状態・保持区間・周回条件を検算する。", "生成された問題図と解答列を区間ごとに照合する。"],
    explanation: `${question.explanation} 単発の暗記ではなく、表・図・論理式の3表現が一致したところまでを正解とする。`,
    subpartCount: 4,
    sourceBasis: question.sourceRefs.map((source) => `${source.filename} p.${source.page}${source.note ? `：${source.note}` : ""}`),
    examLevel: true,
  };
}

/** 範囲内公式だけを使い、解・図・検算手順まで確定した本番水準の生成問題。 */
export function generateDigitalCircuitQuestion(seed = Date.now()): DigitalCircuitQuestion {
  return calibrateGeneratedDigitalQuestion(generateDigitalCircuitFoundationQuestion(seed));
}
