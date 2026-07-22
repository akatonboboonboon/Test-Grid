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
  const originalAnswer = question.answer;
  let chainInstruction = "真理値表・式・全区間の結果を一続きで示す";
  let chainAnswer = originalAnswer;
  let chainFormula = question.formula ?? "";
  let keywords: string[] = [];
  let extraSteps: string[] = [];

  if (question.diagram === "and-timing" || question.diagram === "or-timing") {
    const isAnd = question.diagram === "and-timing";
    const truth = isAnd ? "0001" : "0111";
    chainInstruction = "AB=00,01,10,11の完全な真理値表を作り、積和形を求めてから、指定4区間の出力波形を求める";
    chainAnswer = `truth=${truth}; ${isAnd ? "Y=AB" : "Y=A+B"}; waveform=${originalAnswer}`;
    keywords = [truth, "Y", originalAnswer];
    extraSteps = ["4行の真理値表を先に完成する。", "Y=1となる行から論理式を作る。"];
  } else if (question.diagram === "d-ff") {
    chainInstruction = "D-FFの動作表と特性式Q⁺=Dを書き、初期状態から全エッジを追跡する";
    chainAnswer = `Q^+=D; waveform=${originalAnswer}`;
    keywords = ["Q", "D", originalAnswer];
    extraSteps = ["有効エッジ直前のDだけを取り込む。", "エッジ間のD変化ではQを保持する。"];
  } else if (question.diagram === "jk-ff") {
    chainInstruction = "JKの4行動作表から特性式を導き、現在Qを用いて全エッジを追跡する";
    chainFormula = "Q^+=J\\overline Q+\\overline KQ";
    chainAnswer = `Q^+=JQbar+KbarQ; waveform=${originalAnswer}`;
    keywords = ["J", "K", "Q", originalAnswer];
    extraSteps = ["00保持・01リセット・10セット・11反転を表にする。", "各エッジで更新前Qを使う。"];
  } else if (question.diagram === "parallel-register") {
    chainInstruction = "共通クロックを明記し、各エッジ直前の入力語と各エッジ直後の出力語を対応表にする";
    chainAnswer = `Q^+=D at each active edge; words=${originalAnswer}`;
    keywords = ["Q", "D", originalAnswer];
    extraSteps = ["全D-FFが共通クロックで同時更新されることを確認する。", "エッジ間は保持する。"];
  } else if (question.diagram === "ripple-down") {
    chainInstruction = "全8状態のダウン順を作り、指定状態からの遷移と各段の分周比を求める";
    chainFormula = "f_{Q_n}=f_{CLK}/2^{n+1}";
    chainAnswer = `cycle=111,110,101,100,011,010,001,000; requested=${originalAnswer}; divisions=1/2,1/4,1/8`;
    keywords = ["111", "000", originalAnswer, "1/8"];
    extraSteps = ["3ビットの一周を先に並べる。", "非同期段間の伝搬遅延も説明する。"];
  } else if (question.diagram === "sync-counter") {
    chainInstruction = "8行の状態遷移表からJK励起条件を簡単化し、指定状態からの遷移で検算する";
    chainAnswer = `J0=K0=1; J1=K1=Q0; J2=K2=Q0Q1; requested=${originalAnswer}`;
    keywords = ["J0", "Q0", "Q0Q1", originalAnswer];
    extraSteps = ["Q0は毎回、Q1はQ0=1、Q2はQ1Q0=11で反転する。", "全段が共通CLKで同時更新される。"];
  } else {
    chainInstruction = "次状態式・出力式から4行の状態表とMealy状態図を完成し、指定行を照合する";
    chainFormula = "S^+=A\\overline S,\\quad Y=AS";
    chainAnswer = `S^+=ASbar; Y=AS; table=S0:0/0,1/0; S1:0/0,0/1; requested=${originalAnswer}`;
    keywords = ["S", "A", "Y", originalAnswer];
    extraSteps = ["A,Sの4組を式へ代入する。", "枝ラベルをA/Yとして2状態の図へ移す。"];
  }

  return {
    ...question,
    difficulty: 3,
    format: "text",
    context: "範囲資料の数値・回路だけで最後まで解ける自動生成大問。途中表と図も採点対象とする。",
    prompt: `(1) ${chainInstruction}。(2) 途中の表・式を示す。(3) 図へ全遷移または全区間を書き込む。(4) ${question.prompt}`,
    answer: chainAnswer,
    accepted: [chainAnswer, ...(question.accepted ?? [])],
    keywords,
    minKeywords: Math.max(2, keywords.length - 1),
    formula: chainFormula,
    steps: [...extraSteps, ...question.steps, "最終結果を元の入力条件へ戻して全区間照合する。"],
    explanation: `${question.explanation} 単発の最終値ではなく、表→式→図→指定結果が一致した場合に正解となる。`,
    subpartCount: 4,
    sourceBasis: [...question.sourceRefs.map((source) => `${source.filename} p.${source.page}${source.note ? `・${source.note}` : ""}`), "範囲内の公式だけで数値を変えた本番形式4段階問題"],
    examLevel: true,
  };
}
/** 範囲内公式だけを使い、解・図・検算手順まで確定した本番水準の生成問題。 */
export function generateDigitalCircuitQuestion(seed = Date.now()): DigitalCircuitQuestion {
  return calibrateGeneratedDigitalQuestion(generateDigitalCircuitFoundationQuestion(seed));
}
