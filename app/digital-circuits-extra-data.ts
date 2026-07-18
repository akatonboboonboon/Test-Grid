import {
  DIGITAL_CIRCUIT_EXPECTED_EXAMS,
  DIGITAL_CIRCUIT_FORMULAS,
  DIGITAL_CIRCUIT_QUESTIONS,
  type DigitalCircuitExpectedExam,
  type DigitalCircuitFormulaCard,
  type DigitalCircuitQuestion,
  type DigitalCircuitSourceRef,
} from "./digital-circuits-data";

export type DigitalCircuitExtraDiagramKind =
  | "xor-timing"
  | "three-jk-ripple"
  | "cyclic-down-10-2"
  | "exercise3-sequential"
  | "past-state-machine"
  | "sequence-detector-1001";
export type DigitalCircuitAnyDiagramKind =
  | NonNullable<DigitalCircuitQuestion["diagram"]>
  | DigitalCircuitExtraDiagramKind;
export type DigitalCircuitStudyQuestion =
  Omit<DigitalCircuitQuestion, "diagram"> & { diagram?: DigitalCircuitAnyDiagramKind };
export type DigitalCircuitStudyCard =
  Omit<DigitalCircuitFormulaCard, "diagram"> & { diagram?: DigitalCircuitAnyDiagramKind };

const pdfRef = (filename: string, page: number, note: string): DigitalCircuitSourceRef => ({
  kind: "scope-zip",
  filename,
  page,
  note: "追加現行範囲PDF：" + note,
});
const PAST = (page: number, note: string) => pdfRef("スマート制御過去問.pdf", page, note);
const EX1 = pdfRef("スマート制御演習1.pdf", 1, "第6回演習");
const EX2 = pdfRef("スマート制御演習2.pdf", 1, "第7回演習");
const EX3 = pdfRef("スマート制御演習3.pdf", 1, "第8回演習");

export const DIGITAL_CIRCUIT_CURRENT_SCOPE_PDFS = [
  { filename: "スマート制御過去問.pdf", pages: 4, role: "current-scope", contents: ["JK-FF特性・波形", "10→2巡回ダウンカウンタ", "状態表・Mealy図", "1001系列検出"] },
  { filename: "スマート制御演習1.pdf", pages: 1, role: "current-scope", contents: ["波形から真理値表", "XORタイミング"] },
  { filename: "スマート制御演習2.pdf", pages: 1, role: "current-scope", contents: ["3段JK-FF非同期カウンタ"] },
  { filename: "スマート制御演習3.pdf", pages: 1, role: "current-scope", contents: ["D-FF順序回路", "状態表", "Mealy図"] },
] as const;

export type DigitalCircuitPastMachineTransition = {
  input: 0 | 1;
  tableStateS0S1: string;
  nextTableStateS0S1: string;
  graphStateS1S0: string;
  nextGraphStateS1S0: string;
  output: 0 | 1;
};

// The source table prints the state columns as S0,S1, while its Mealy graph
// prints each node as S1S0. Keeping both spellings beside one another prevents
// the visually similar 01 and 10 states from being silently swapped.
export const DIGITAL_CIRCUIT_PAST_MACHINE_TRANSITIONS: DigitalCircuitPastMachineTransition[] = [
  { input: 0, tableStateS0S1: "00", nextTableStateS0S1: "00", graphStateS1S0: "00", nextGraphStateS1S0: "00", output: 1 },
  { input: 0, tableStateS0S1: "01", nextTableStateS0S1: "10", graphStateS1S0: "10", nextGraphStateS1S0: "01", output: 0 },
  { input: 0, tableStateS0S1: "10", nextTableStateS0S1: "00", graphStateS1S0: "01", nextGraphStateS1S0: "00", output: 1 },
  { input: 0, tableStateS0S1: "11", nextTableStateS0S1: "01", graphStateS1S0: "11", nextGraphStateS1S0: "10", output: 0 },
  { input: 1, tableStateS0S1: "00", nextTableStateS0S1: "10", graphStateS1S0: "00", nextGraphStateS1S0: "01", output: 0 },
  { input: 1, tableStateS0S1: "01", nextTableStateS0S1: "11", graphStateS1S0: "10", nextGraphStateS1S0: "11", output: 0 },
  { input: 1, tableStateS0S1: "10", nextTableStateS0S1: "01", graphStateS1S0: "01", nextGraphStateS1S0: "10", output: 0 },
  { input: 1, tableStateS0S1: "11", nextTableStateS0S1: "00", graphStateS1S0: "11", nextGraphStateS1S0: "00", output: 1 },
];

export type DigitalCircuitDetectorTransition = {
  current: "00" | "01" | "10" | "11";
  input: 0 | 1;
  next: "00" | "01" | "10" | "11";
  output: 0 | 1;
};

export const DIGITAL_CIRCUIT_DETECTOR_1001_TRANSITIONS: DigitalCircuitDetectorTransition[] = [
  { current: "00", input: 0, next: "00", output: 0 },
  { current: "00", input: 1, next: "01", output: 0 },
  { current: "01", input: 0, next: "10", output: 0 },
  { current: "01", input: 1, next: "01", output: 0 },
  { current: "10", input: 0, next: "11", output: 0 },
  { current: "10", input: 1, next: "01", output: 0 },
  { current: "11", input: 0, next: "00", output: 0 },
  { current: "11", input: 1, next: "01", output: 1 },
];
export const DIGITAL_CIRCUIT_EXTRA_FORMULAS: DigitalCircuitStudyCard[] = [
  {
    id: "dc-extra-f-xor", topic: "logic-timing", title: "XORゲート",
    prompt: "XORが1になる条件と論理式は？",
    formula: "Y=A\\oplus B=\\overline AB+A\\overline B",
    explanation: "2入力が異なるときだけ1。00,01,10,11の出力は0,1,1,0。",
    cue: "違えば1", example: "\\((A,B)=(1,0)\\Rightarrow Y=1\\)",
    diagram: "xor-timing", sourceRefs: [EX1],
  },
  {
    id: "dc-extra-f-jk-characteristic", topic: "flipflops", title: "JK-FF特性方程式",
    prompt: "クロック有効時のJK-FF特性方程式は？",
    formula: "Q^+=J\\overline Q+\\overline KQ",
    explanation: "J項がセット、Kの反転項が保持を表す。波形では有効エッジごとに00保持・01リセット・10セット・11反転を適用する。",
    cue: "JQ̅＋K̅Q", diagram: "jk-ff", sourceRefs: [PAST(1, "問1")],
  },
  {
    id: "dc-extra-f-ripple-positive", topic: "counters", title: "正エッジJKのリップル",
    prompt: "J=K=1の正エッジFFをQ出力で直列接続すると？",
    formula: "000\\to111\\to110\\to101\\to100\\to011\\to010\\to001\\to000",
    explanation: "Q0の0→1がQ1を、Q1の0→1がQ2を反転させるため、初期000からダウン方向へ巡回する。",
    cue: "正エッジ＋Q接続＝ダウン列", diagram: "three-jk-ripple", sourceRefs: [EX2],
  },
  {
    id: "dc-extra-f-cycle-10-2", topic: "counters", title: "10から2の巡回ダウン",
    prompt: "指定された巡回列を答えると？",
    formula: "1010\\to1001\\to1000\\to0111\\to0110\\to0101\\to0100\\to0011\\to0010\\to1010",
    explanation: "通常の4ビットダウン列を2まで進め、次は1へ行かず10へ再初期化する9状態カウンタ。",
    cue: "10→…→2→10", diagram: "cyclic-down-10-2", sourceRefs: [PAST(2, "問2")],
  },
  {
    id: "dc-extra-f-cycle-load", topic: "counters", title: "10→2巡回の再ロード回路",
    prompt: "0010の次に1010へ戻す検出条件と非同期SET/RSTは？",
    formula: "\\begin{aligned}init&=D_0\\overline{D_1}\\overline{D_2}\\overline{D_3}\\\\SET&:D_3,D_1\\\\RST&:D_2,D_0\\end{aligned}",
    explanation: "通常の4ビットダウンで0010の次に現れる0001をデコードし、D3とD1をSET、D2とD0をRSTして1010を非同期ロードする。これが過去問p.2の回路図とinit波形の要点。",
    cue: "0001検出 → 1010ロード", example: "\\(0001\\xrightarrow{init}1010\\)",
    diagram: "cyclic-down-10-2", sourceRefs: [PAST(2, "問2・回路設計とタイミングチャート")],
  },
  {
    id: "dc-extra-f-ex3-equations", topic: "state-machines", title: "第8回演習の順序回路",
    prompt: "図のD入力式と出力式は？",
    formula: "\\begin{aligned}S^+&=A\\overline S\\\\Y&=AS\\end{aligned}",
    explanation: "D入力側ANDはAとQ̅、出力側ANDはAとQを受ける。D-FFなのでD入力が次状態になる。",
    cue: "D=AQ̅、Y=AQ", diagram: "exercise3-sequential", sourceRefs: [EX3],
  },
  {
    id: "dc-extra-f-past-equations", topic: "state-machines", title: "過去問問3の次状態・出力式",
    prompt: "図3の回路から得られるS0+, S1+, Outは？",
    formula: "\\begin{aligned}S_0^+&=\\overline{S_0}(I+S_1)\\\\S_1^+&=\\overline I S_0S_1+I(\\overline{S_0}S_1+S_0\\overline{S_1})\\\\Out&=\\overline I\\,\\overline{S_1}+IS_0S_1\\end{aligned}",
    explanation: "この式へIn,S0,S1の8組を代入して状態表を作る。出典の表はS0,S1順だが、同じページのMealy図はノード名をS1S0順で書いているため、01と10を反転して対応させる。",
    cue: "表S0S1 → 図S1S0", diagram: "past-state-machine", sourceRefs: [PAST(3, "問3・回路→状態表→Mealy図")],
  },
  {
    id: "dc-extra-f-past-state-table", topic: "state-machines", title: "2ビット順序回路の状態表",
    prompt: "回路図を状態表へ変換する要点は？",
    formula: "\\begin{array}{ccc|ccc}In&S_0&S_1&S_0^+&S_1^+&Out\\\\0&0&0&0&0&1\\\\0&0&1&1&0&0\\\\0&1&0&0&0&1\\\\0&1&1&0&1&0\\\\1&0&0&1&0&0\\\\1&0&1&1&1&0\\\\1&1&0&0&1&0\\\\1&1&1&0&0&1\\end{array}",
    explanation: "入力1ビットと現在状態2ビットの8行を漏れなく列挙する。出典の状態表はS0,S1順、同ページのMealy図ノードはS1S0順なので、図へ移すとき01と10を反転して対応させる。",
    cue: "8行を列挙", diagram: "past-state-machine", sourceRefs: [PAST(3, "問3")],
  },
  {
    id: "dc-extra-f-sequence-1001", topic: "state-machines", title: "1001系列検出器",
    prompt: "重なりを許すMealy検出器の4状態は？",
    formula: "\\begin{aligned}00&:\\text{初期}\\\\01&:\\text{1まで一致}\\\\10&:\\text{10まで一致}\\\\11&:\\text{100まで一致}\\end{aligned}",
    explanation: "状態は直前までに一致した接頭辞を表す。状態11で入力1なら1001が完成して出力1、次状態01へ進む。",
    cue: "一致した接頭辞を状態にする", diagram: "sequence-detector-1001", sourceRefs: [PAST(4, "問4")],
  },
  {
    id: "dc-extra-f-sequence-equations", topic: "state-machines", title: "1001検出器の式",
    prompt: "状態割当00,01,10,11の次状態・出力式は？",
    formula: "\\begin{aligned}S_0^+&=I+S_1\\overline{S_0}\\\\S_1^+&=\\overline I(\\overline{S_1}S_0+S_1\\overline{S_0})\\\\O&=IS_1S_0\\end{aligned}",
    explanation: "状態表で1になる行を積和形へまとめる。出力は状態11でI=1のときだけ1。",
    cue: "O=I・状態11", diagram: "sequence-detector-1001", sourceRefs: [PAST(4, "問4")],
  },
];

export const DIGITAL_CIRCUIT_EXTRA_QUESTIONS: DigitalCircuitStudyQuestion[] = [
  {
    id: "dc-extra-q-xor-value", topic: "logic-timing", genre: "XOR", difficulty: 1, format: "choice",
    prompt: "XOR回路でA=1、B=1のときYは？", answer: "0", options: ["0", "1", "保持", "不定"],
    formula: "Y=A\\oplus B", steps: ["2入力が同じか異なるかを見る。", "同じ11なので0。"],
    explanation: "XORは入力が異なるときだけ1。", diagram: "xor-timing", sourceRefs: [EX1],
  },
  {
    id: "dc-extra-q-xor-seq", topic: "logic-timing", genre: "XOR波形", difficulty: 2, format: "sequence",
    prompt: "4区間のABが00,10,11,01の順。XOR出力列を答えよ。", answer: "0101",
    accepted: ["0,1,0,1", "0 1 0 1"], formula: "Y=\\overline AB+A\\overline B",
    steps: ["00は同じなので0。", "10は異なるので1。", "11は同じなので0。", "01は異なるので1。"],
    explanation: "波形の各区間で『異なるか』だけを判定する。", diagram: "xor-timing", sourceRefs: [EX1],
  },
  {
    id: "dc-extra-q-truth-from-wave", topic: "logic-timing", genre: "波形から真理値表", difficulty: 2, format: "text",
    prompt: "A・B・Yのタイミングチャートから真理値表を作る手順を説明せよ。",
    answer: "入力変化点で区間を分け、各区間のABとYを読み、同じABの行をまとめる",
    accepted: ["区間ごとにABとYを読み真理値表へ整理する"],
    keywords: ["区間", "AB", "Y", "真理値表"], minKeywords: 3,
    steps: ["全変化点で区切る。", "各区間のA,B,Yを0/1で記録する。", "AB=00,01,10,11の順に並べ直す。"],
    explanation: "同じ入力組で出力が一致するかも確認する。", diagram: "xor-timing", sourceRefs: [EX1],
  },
  {
    id: "dc-extra-q-truth-table-full", topic: "logic-timing", genre: "波形から完全真理値表", difficulty: 2, format: "sequence",
    prompt: "第6回演習・図1のA,B,Y波形を全区間読み、AB=00,01,10,11の完全な4行真理値表を答えよ。",
    answer: "00→0, 01→1, 10→1, 11→0",
    accepted: ["00/0,01/1,10/1,11/0", "0,1,1,0", "0110"],
    formula: "Y=A\\oplus B=\\overline AB+A\\overline B",
    steps: ["AまたはBが変化する全時刻で区間を分ける。", "各区間のA,B,Yを読み取る。", "同じ入力組をまとめて00,01,10,11の4行を必ず埋める。"],
    explanation: "図1には4入力組がすべて現れる。読み取った出力は00→0、01→1、10→1、11→0で、XORの真理値表になる。",
    diagram: "xor-timing", sourceRefs: [EX1],
  },
  {
    id: "dc-extra-q-jk-characteristic", topic: "flipflops", genre: "特性方程式", difficulty: 2, format: "text",
    prompt: "JK-FFの特性方程式を答えよ。", answer: "Q+=JQ̅+K̅Q",
    accepted: ["Q^+=J\\overline Q+\\overline KQ", "Qnext=JQbar+KbarQ"],
    keywords: ["J", "K", "Q"], minKeywords: 3, formula: "Q^+=J\\overline Q+\\overline KQ",
    steps: ["セット側はJQ̅。", "保持側はK̅Q。", "両項をORする。"],
    explanation: "この式はJK動作表の4行を1本にまとめる。", diagram: "jk-ff", sourceRefs: [PAST(1, "問1")],
  },
  {
    id: "dc-extra-q-three-jk", topic: "counters", genre: "3段JK波形", difficulty: 2, format: "sequence",
    prompt: "正エッジJK-FFをQ出力で3段接続し全段J=K=1、初期D2D1D0=000。最初の3状態を答えよ。",
    answer: "111,110,101", accepted: ["111→110→101", "111 110 101"],
    formula: "000\\to111\\to110\\to101",
    steps: ["1回目はQ0の立上りがQ1、Q1の立上りがQ2も反転させ111。", "2回目はQ0だけ立下りして110。", "3回目はQ0立上りでQ1が立下りし101。"],
    explanation: "正エッジFFをQで連鎖したためダウン方向になる。", diagram: "three-jk-ripple", sourceRefs: [EX2],
  },
  {
    id: "dc-extra-q-cycle-next", topic: "counters", genre: "10→2巡回", difficulty: 1, format: "sequence",
    prompt: "10から2まで下がって10へ戻る巡回カウンタで、現在4（0100）。次の3状態は？",
    answer: "0011,0010,1010", accepted: ["0011→0010→1010", "3,2,10"],
    steps: ["4の次は3。", "3の次は2。", "2の次は指定により10へ戻る。"],
    explanation: "通常の4ビットダウンと違い、2の次に再初期化する。", diagram: "cyclic-down-10-2", sourceRefs: [PAST(2, "問2")],
  },
  {
    id: "dc-extra-q-cycle-states", topic: "counters", genre: "10→2巡回", difficulty: 2, format: "choice",
    prompt: "10→9→…→2→10を繰り返すカウンタの状態数は？", answer: "9状態",
    accepted: ["9"], options: ["8状態", "9状態", "10状態", "16状態"],
    steps: ["10から2までを両端含めて数える。", "\\(10-2+1=9\\)。"],
    explanation: "4ビットだが16状態すべては使わない。", diagram: "cyclic-down-10-2", sourceRefs: [PAST(2, "問2")],
  },
  {
    id: "dc-extra-q-cycle-design", topic: "counters", genre: "10→2巡回・回路設計", difficulty: 3, format: "text",
    prompt: "4個のT-FFで10→9→…→2→10を作る。通常カウントで0010の次に現れる状態を使い、1010へ戻す検出条件と非同期SET/RST対象を答えよ。",
    answer: "0001を検出し、D3,D1をSET、D2,D0をRSTして1010をロード",
    accepted: ["init=D0D1barD2barD3bar, SET D3 D1, RST D2 D0", "0001検出→1010"],
    keywords: ["0001", "D3", "D1", "D2", "D0", "1010"], minKeywords: 5,
    formula: "\\begin{aligned}init&=D_0\\overline{D_1}\\overline{D_2}\\overline{D_3}\\\\SET&:D_3,D_1\\\\RST&:D_2,D_0\\end{aligned}",
    steps: ["0010の通常の次状態は0001。", "0001をAND条件で検出してinitを作る。", "1010にするため1の桁D3,D1をSETし、0の桁D2,D0をRSTする。"],
    explanation: "過去問p.2は状態列だけでなく、この再ロード回路とinitを含むタイミングチャートまで要求している。",
    diagram: "cyclic-down-10-2", sourceRefs: [PAST(2, "問2・回路設計")],
  },
  {
    id: "dc-extra-q-cycle-timing", topic: "counters", genre: "10→2巡回・タイミング", difficulty: 2, format: "sequence",
    prompt: "initでD3D2D1D0=1010をロード後、initを解除する。続く10回の有効クロック直後の状態列を答えよ。",
    answer: "1001,1000,0111,0110,0101,0100,0011,0010,1010,1001",
    accepted: ["9,8,7,6,5,4,3,2,10,9", "1001→1000→0111→0110→0101→0100→0011→0010→1010→1001"],
    formula: "1010\\to1001\\to\\cdots\\to0010\\to1010",
    steps: ["1010から1ずつダウンして1001,1000,…,0010を描く。", "0001を検出すると非同期ロードが働くため、観測状態は1010へ戻る。", "その次のクロックで再び1001になる。"],
    explanation: "過去問p.2のタイミングチャートはCLK, init, D0〜D3を同じ時刻軸でそろえる。ここでは各有効クロック直後の4ビット値を列挙した。",
    diagram: "cyclic-down-10-2", sourceRefs: [PAST(2, "問2・タイミングチャート")],
  },
  {
    id: "dc-extra-q-ex3-equation", topic: "state-machines", genre: "回路から式", difficulty: 2, format: "text",
    prompt: "第8回演習の図で、状態をS=Qとした次状態式と出力式を答えよ。",
    answer: "S+=A・S̅、Y=A・S", accepted: ["S^+=A\\overline S,Y=AS", "D=AQbar,Y=AQ"],
    keywords: ["A", "S", "Y"], minKeywords: 3,
    formula: "\\begin{aligned}S^+&=A\\overline S\\\\Y&=AS\\end{aligned}",
    steps: ["D入力側ANDの入力AとQ̅を読む。", "D-FFなのでS+=D。", "出力側ANDの入力AとQを読む。"],
    explanation: "回路配線をそのまま2本の論理式へ翻訳する。", diagram: "exercise3-sequential", sourceRefs: [EX3],
  },
  {
    id: "dc-extra-q-ex3-table", topic: "state-machines", genre: "状態表", difficulty: 2, format: "sequence",
    prompt: "S+=A・S̅、Y=A・S。現在S=0でA=0,1の順に、次状態/出力を答えよ。",
    answer: "0/0,1/0", accepted: ["0/0→1/0", "0/0 1/0"],
    formula: "\\begin{aligned}S^+&=A\\overline S\\\\Y&=AS\\end{aligned}",
    steps: ["S=0なのでS̅=1。", "A=0なら0/0。", "A=1なら1/0。"],
    explanation: "状態表は現在状態を固定して全入力を代入する。", diagram: "exercise3-sequential", sourceRefs: [EX3],
  },
  {
    id: "dc-extra-q-past-full-table", topic: "state-machines", genre: "過去問・回路→全状態表→Mealy図", difficulty: 3, format: "sequence",
    prompt: "過去問問3の図3を解析し、出典表の列順In,S0,S1→S0+,S1+,Outで全8行を埋めよ。さらに状態図ノードのビット順も答えよ。",
    answer: "0/00→00/1; 0/01→10/0; 0/10→00/1; 0/11→01/0; 1/00→10/0; 1/01→11/0; 1/10→01/0; 1/11→00/1。状態図はS1S0順",
    accepted: ["0 00 00 1;0 01 10 0;0 10 00 1;0 11 01 0;1 00 10 0;1 01 11 0;1 10 01 0;1 11 00 1; graph S1S0"],
    formula: "\\begin{aligned}S_0^+&=\\overline{S_0}(I+S_1)\\\\S_1^+&=\\overline I S_0S_1+I(\\overline{S_0}S_1+S_0\\overline{S_1})\\\\Out&=\\overline I\\,\\overline{S_1}+IS_0S_1\\end{aligned}",
    steps: ["In,S0,S1の000〜111を1行ずつ式へ代入する。", "表では現在・次状態をS0S1順で記録する。", "Mealy図へ移すときだけノード名をS1S0順へ反転し、各枝をIn/Outで記す。"],
    explanation: "同じ資料内で表とグラフのビット表示順が逆。例えば表の現在S0S1=01はグラフのノードS1S0=10に対応する。",
    diagram: "past-state-machine", sourceRefs: [PAST(3, "問3・回路→状態表→Mealy図")],
  },
  {
    id: "dc-extra-q-past-row", topic: "state-machines", genre: "過去問状態表", difficulty: 2, format: "sequence",
    prompt: "過去問問3の出典表（列順S0,S1）で、In=1、現在S0S1=01のときS0+S1+/Outは？",
    answer: "11/0", accepted: ["1,1,0", "S0+=1,S1+=1,Out=0"],
    steps: ["状態表のIn=1、S0=0、S1=1の行を探す。", "次状態11、出力0を読む。"],
    explanation: "表では現在S0S1=01から次S0+S1+=11。状態図ノードはS1S0順なので、同じ枝は現在10から次11へのIn/Out=1/0として描く。", diagram: "past-state-machine", sourceRefs: [PAST(3, "問3")],
  },
  {
    id: "dc-extra-q-sequence-full-table", topic: "state-machines", genre: "1001検出・全8遷移", difficulty: 3, format: "sequence",
    prompt: "状態00,01,10,11を使う重なり許可1001 Mealy検出器について、各状態の入力0,1に対する次状態/出力を全8本答えよ。",
    answer: "00:0→00/0,1→01/0; 01:0→10/0,1→01/0; 10:0→11/0,1→01/0; 11:0→00/0,1→01/1",
    accepted: ["00 0 00/0 1 01/0;01 0 10/0 1 01/0;10 0 11/0 1 01/0;11 0 00/0 1 01/1"],
    formula: "\\begin{aligned}S_0^+&=I+S_1\\overline{S_0}\\\\S_1^+&=\\overline I(\\overline{S_1}S_0+S_1\\overline{S_0})\\\\O&=IS_1S_0\\end{aligned}",
    steps: ["各状態は一致済み接頭辞なし・1・10・100に対応する。", "各状態から入力0と1を1本ずつ、合計8本調べる。", "状態11で入力1の枝だけ1001が完成するため出力1。末尾1を再利用して次状態01へ進む。"],
    explanation: "4状態×2入力なので遷移は必ず8本。自己ループ00--0/0、01--1/0を含め、10--1/0→01と11--1/1→01も落とさない。",
    diagram: "sequence-detector-1001", sourceRefs: [PAST(4, "問4・状態表とMealy図")],
  },
  {
    id: "dc-extra-q-sequence-state", topic: "state-machines", genre: "1001検出", difficulty: 1, format: "choice",
    prompt: "1001系列検出器で『100まで一致』を表す状態は？", answer: "11",
    options: ["00", "01", "10", "11"],
    steps: ["00初期、01は1、10は10、11は100まで一致。"],
    explanation: "次に1が来れば1001が完成する待機状態。", diagram: "sequence-detector-1001", sourceRefs: [PAST(4, "問4")],
  },
  {
    id: "dc-extra-q-sequence-output", topic: "state-machines", genre: "1001検出", difficulty: 2, format: "sequence",
    prompt: "状態11（100まで一致）で入力I=1。次状態/出力は？", answer: "01/1",
    accepted: ["1/1", "次状態01、出力1"],
    formula: "O=IS_1S_0",
    steps: ["I=1かつ状態11なので出力1。", "末尾の1は次の検出の先頭にもなるため状態01へ進む。"],
    explanation: "重なりを許すMealy系列検出器の遷移。", diagram: "sequence-detector-1001", sourceRefs: [PAST(4, "問4")],
  },
  {
    id: "dc-extra-q-sequence-stream", topic: "state-machines", genre: "1001検出", difficulty: 3, format: "sequence",
    prompt: "初期00から入力列1001を1ビットずつ入れる。各クロック後の状態列と最後の出力を答えよ。",
    answer: "01→10→11→01、最後O=1",
    accepted: ["01,10,11,01/1", "01 10 11 01 最後1"],
    steps: ["1で00→01。", "0で01→10。", "0で10→11。", "1で検出して11→01、O=1。"],
    explanation: "各状態は一致済みの接頭辞を表す。", diagram: "sequence-detector-1001", sourceRefs: [PAST(4, "問4")],
  },
];

export const DIGITAL_CIRCUIT_ALL_FORMULAS: DigitalCircuitStudyCard[] = [
  ...DIGITAL_CIRCUIT_FORMULAS,
  ...DIGITAL_CIRCUIT_EXTRA_FORMULAS,
];
export const DIGITAL_CIRCUIT_FOUNDATION_QUESTIONS: DigitalCircuitStudyQuestion[] = [
  ...DIGITAL_CIRCUIT_QUESTIONS,
  ...DIGITAL_CIRCUIT_EXTRA_QUESTIONS,
];

const DIGITAL_PRACTICE_CALIBRATION: Record<DigitalCircuitStudyQuestion["topic"], {
  analysis: string;
  designCheck: string;
  sourceBasis: readonly string[];
}> = {
  "logic-timing": {
    analysis: "対象ゲートの4行の真理値表と論理式を再構成し、入力列がある場合は全変化点で区間を分けて波形へ変換する。",
    designCheck: "単一入力組は真理値表の該当行、入力列は各出力の立上り・立下りを元の入力へ戻って照合し、論理式でも同じ値になることを確かめる。",
    sourceBasis: ["範囲ZIP p.1：AND・OR真理値表とタイミング", "現行範囲・演習1 p.1：真理値表からXOR波形を構成する形式"],
  },
  latches: {
    analysis: "SRの4入力組をセット・リセット・保持・禁止へ分類した動作表を再構成し、入力列がある場合は直前状態を引き継いで状態列を完成する。",
    designCheck: "単一入力でも相補出力と禁止入力の解除時競合まで説明し、入力列では波形と動作表の両方に矛盾がないか確かめる。",
    sourceBasis: ["範囲ZIP p.4：NOR形SRラッチ", "範囲問題：入力列から状態波形を追跡する形式"],
  },
  flipflops: {
    analysis: "DまたはJKの特性表・特性式を再構成し、単一条件または全有効エッジ直前の入力と現在状態を一行ずつ代入する。",
    designCheck: "JKではセット・リセット・保持・トグルを全て確認し、Dでは取込み時点を確認して、エッジ間保持を含む波形へ照合する。",
    sourceBasis: ["範囲ZIP p.2・4・7：D・JK-FFの特性と波形", "現行範囲過去問 p.1：JK特性式とタイミング"],
  },
  registers: {
    analysis: "共通クロックで全ビットが同時更新される理由を回路図から示し、指定された各有効エッジ直前の入力を読んで状態列を作る。",
    designCheck: "エッジ間の入力変化が出力へ漏れていないかをビットごとに照合し、完成波形を確認する。",
    sourceBasis: ["範囲ZIP p.3：共通クロック2ビット並列レジスタ", "範囲問題：複数エッジの記憶列"],
  },
  counters: {
    analysis: "現在状態を二進数と10進数で併記し、各段のトグル条件または非同期伝搬条件から次状態を順に作る。",
    designCheck: "全周回、分周比、端状態からの再ロード条件を確認し、欠落・重複状態がないか確かめる。",
    sourceBasis: ["範囲ZIP p.4〜7：同期・非同期カウンタ", "現行範囲過去問 p.2・演習2：10→2巡回と3段JK波形"],
  },
  "state-machines": {
    analysis: "次状態式と出力式から全入力組の状態表を完成し、その表だけを根拠に遷移枝と出力を描く。",
    designCheck: "未使用状態、MealyとMooreの出力位置、系列重なり時の最長接頭辞遷移まで照合する。",
    sourceBasis: ["範囲ZIP p.7〜10：状態表・Mealy・Moore", "現行範囲過去問 p.3〜4・演習3：状態機械と1001検出器の設計"],
  },
};

function hardenDigitalPracticeQuestion(question: DigitalCircuitStudyQuestion): DigitalCircuitStudyQuestion {
  const calibration = DIGITAL_PRACTICE_CALIBRATION[question.topic];
  return {
    ...question,
    difficulty: 3,
    context: [
      "本番・過去問水準です。図へ途中の波形・状態・遷移を書き込み、最終答案だけを入力してください。",
      question.context,
    ].filter(Boolean).join(" "),
    prompt: `【4段階】(1) ${calibration.analysis} (2) ${calibration.designCheck} (3) 図に途中結果を記入する。 (4) ${question.prompt}`,
    steps: [calibration.analysis, ...question.steps, calibration.designCheck, "問題図と解答図を重ね、全区間・全遷移を最終確認する。"],
    explanation: `${question.explanation} 本番では途中の真理値表・状態列・回路判断まで一続きで採点対象になる想定で解く。`,
    subpartCount: 4,
    sourceBasis: calibration.sourceBasis,
    examLevel: true,
  };
}

/** 通常演習・確認テストへ出す、本番難度へ校正済みの図付き問題群。 */
export const DIGITAL_CIRCUIT_ALL_QUESTIONS: DigitalCircuitStudyQuestion[] =
  DIGITAL_CIRCUIT_FOUNDATION_QUESTIONS.map(hardenDigitalPracticeQuestion);

/** 全教科共通の時間制限問題へ渡せる本番難度プール。 */
export const DIGITAL_CIRCUIT_RAPID_CHALLENGES: DigitalCircuitStudyQuestion[] =
  DIGITAL_CIRCUIT_ALL_QUESTIONS.filter((question) => question.format === "choice" || question.format === "sequence");


const extraById = new Map(DIGITAL_CIRCUIT_EXTRA_QUESTIONS.map((question) => [question.id, question]));
const replacements = [
  ["dc-extra-q-truth-table-full", "dc-extra-q-cycle-design", "dc-extra-q-ex3-equation", "dc-extra-q-sequence-full-table"],
  ["dc-extra-q-xor-seq", "dc-extra-q-cycle-design", "dc-extra-q-past-full-table", "dc-extra-q-sequence-stream"],
  ["dc-extra-q-truth-from-wave", "dc-extra-q-cycle-design", "dc-extra-q-past-full-table", "dc-extra-q-sequence-output"],
  ["dc-extra-q-truth-table-full", "dc-extra-q-cycle-timing", "dc-extra-q-past-full-table", "dc-extra-q-sequence-stream"],
  ["dc-extra-q-truth-table-full", "dc-extra-q-cycle-design", "dc-extra-q-past-full-table", "dc-extra-q-sequence-full-table"],
  ["dc-extra-q-xor-seq", "dc-extra-q-cycle-design", "dc-extra-q-ex3-equation", "dc-extra-q-sequence-full-table"],
] as const;

export const DIGITAL_CIRCUIT_ALL_EXPECTED_EXAMS = DIGITAL_CIRCUIT_EXPECTED_EXAMS.map((exam, examIndex) => {
  const selected = replacements[examIndex].map((id) => extraById.get(id)).filter(Boolean) as DigitalCircuitStudyQuestion[];
  const sections = exam.sections.map((section) => ({
    ...section,
    questions: section.questions.map((question) => ({ ...question })) as Array<DigitalCircuitStudyQuestion & { major: number; sub: number; points: number }>,
  }));
  const targets = [
    { section: 0, question: 1, extra: selected[0] },
    { section: 3, question: 1, extra: selected[1] },
    { section: 4, question: 0, extra: selected[2] },
    { section: 4, question: 1, extra: selected[3] },
  ];
  for (const target of targets) {
    const current = sections[target.section]?.questions[target.question];
    if (current && target.extra) {
      sections[target.section].questions[target.question] = {
        ...target.extra,
        major: current.major,
        sub: current.sub,
        points: current.points,
      };
    }
  }
  return { ...exam, sections };
}) as unknown as DigitalCircuitExpectedExam[];

const DIGITAL_CIRCUIT_FLAT_EXPECTED_QUESTIONS: DigitalCircuitStudyQuestion[] =
  DIGITAL_CIRCUIT_ALL_EXPECTED_EXAMS.flatMap((exam) =>
    exam.sections.flatMap((section) => section.questions.map((question) => ({
      ...question,
      id: `${exam.id}-${question.id}-m${question.major}s${question.sub}`,
      difficulty: 3,
      context: [
        `${exam.title}・大問${section.number}「${section.title}」・${question.points}点。`,
        question.context,
      ].filter(Boolean).join(" "),
      steps: question.steps.length >= 3
        ? [...question.steps]
        : [...question.steps, "問題図へ途中の真理値・状態・遷移を記入する。", "最終答案を論理式と図の両方で検算する。"],
      subpartCount: question.subpartCount ?? Math.max(3, question.steps.length),
      sourceBasis: question.sourceBasis ?? question.sourceRefs.map(
        (source) => `${source.filename} p.${source.page}${source.note ? `：${source.note}` : ""}`,
      ),
      examLevel: true,
    }))),
  );

/** 通常確認と6回分のA4模試72問を一意IDで束ねた、非生成の本番水準flat pool。 */
export const DIGITAL_CIRCUIT_EXAM_LEVEL_QUESTIONS: DigitalCircuitStudyQuestion[] = [
  ...DIGITAL_CIRCUIT_ALL_QUESTIONS,
  ...DIGITAL_CIRCUIT_FLAT_EXPECTED_QUESTIONS,
];
