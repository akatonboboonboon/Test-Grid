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
  | "sequence-detector-1001"
  | "sequence-detector-101"
  | "sequence-detector-1011"
  | "sequence-design-workflow";
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
const additionalImageRef = (filename: string, page: number, note: string): DigitalCircuitSourceRef => ({
  kind: "scope-zip",
  filename,
  page,
  note: "追加範囲ノート：" + note,
});
const ADD1 = (note: string) => additionalImageRef("PXL_20260720_073506138.MP.jpg", 1, note);
const ADD2 = (note: string) => additionalImageRef("PXL_20260720_073513112.MP.jpg", 2, note);

export const DIGITAL_CIRCUIT_CURRENT_SCOPE_PDFS = [
  { filename: "スマート制御過去問.pdf", pages: 4, role: "current-scope", contents: ["JK-FF特性・波形", "10→2巡回ダウンカウンタ", "状態表・Mealy図", "1001系列検出"] },
  { filename: "スマート制御演習1.pdf", pages: 1, role: "current-scope", contents: ["波形から真理値表", "XORタイミング"] },
  { filename: "スマート制御演習2.pdf", pages: 1, role: "current-scope", contents: ["3段JK-FF非同期カウンタ"] },
  { filename: "スマート制御演習3.pdf", pages: 1, role: "current-scope", contents: ["D-FF順序回路", "状態表", "Mealy図"] },
] as const;

export const DIGITAL_CIRCUIT_ADDITIONAL_SCOPE_IMAGES = [
  {
    filename: "PXL_20260720_073506138.MP.jpg",
    page: 1,
    role: "current-scope",
    contents: ["順序回路の設計法", "nビットパターン検出", "101・1011 Mealy系列検出", "重なりを許す状態遷移"],
  },
  {
    filename: "PXL_20260720_073513112.MP.jpg",
    page: 2,
    role: "current-scope",
    contents: ["系列検出の状態表", "カルノー図", "次状態式・出力式", "D-FF実現回路"],
  },
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

export type DigitalCircuitPatternDetectorTransition = {
  current: string;
  input: 0 | 1;
  next: string;
  output: 0 | 1;
};

/** 追加範囲p.1に例示された101を、重なり検出ありのMealy機械にした全6遷移。 */
export const DIGITAL_CIRCUIT_DETECTOR_101_TRANSITIONS: DigitalCircuitPatternDetectorTransition[] = [
  { current: "S0", input: 0, next: "S0", output: 0 },
  { current: "S0", input: 1, next: "S1", output: 0 },
  { current: "S1", input: 0, next: "S2", output: 0 },
  { current: "S1", input: 1, next: "S1", output: 0 },
  { current: "S2", input: 0, next: "S0", output: 0 },
  { current: "S2", input: 1, next: "S1", output: 1 },
];

/** 追加範囲p.1に例示された1011を、重なり検出ありのMealy機械にした全8遷移。 */
export const DIGITAL_CIRCUIT_DETECTOR_1011_TRANSITIONS: DigitalCircuitPatternDetectorTransition[] = [
  { current: "S0", input: 0, next: "S0", output: 0 },
  { current: "S0", input: 1, next: "S1", output: 0 },
  { current: "S1", input: 0, next: "S2", output: 0 },
  { current: "S1", input: 1, next: "S1", output: 0 },
  { current: "S2", input: 0, next: "S0", output: 0 },
  { current: "S2", input: 1, next: "S3", output: 0 },
  { current: "S3", input: 0, next: "S2", output: 0 },
  { current: "S3", input: 1, next: "S1", output: 1 },
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
    cue: "一致した接頭辞を状態にする", diagram: "sequence-detector-1001", sourceRefs: [PAST(4, "問4"), ADD1("1001系列の状態遷移例"), ADD2("状態表・カルノー図・D-FF実現")],
  },
  {
    id: "dc-extra-f-sequence-equations", topic: "state-machines", title: "1001検出器の式",
    prompt: "状態割当00,01,10,11の次状態・出力式は？",
    formula: "\\begin{aligned}S_0^+&=I+S_1\\overline{S_0}\\\\S_1^+&=\\overline I(\\overline{S_1}S_0+S_1\\overline{S_0})\\\\O&=IS_1S_0\\end{aligned}",
    explanation: "状態表で1になる行を積和形へまとめる。出力は状態11でI=1のときだけ1。",
    cue: "O=I・状態11", diagram: "sequence-detector-1001", sourceRefs: [PAST(4, "問4"), ADD2("1001系列の次状態式・出力式")],
  },
  {
    id: "dc-add-f-pattern-design", topic: "state-machines", title: "nビット系列検出器の設計",
    prompt: "Mealy型で状態を何に対応させ、何状態を用意する？",
    formula: "\\begin{aligned}S_k&:\\text{先頭から }k\\text{ ビット一致}\\\\N_{\\mathrm{state}}&=n\\quad(k=0,1,\\ldots,n-1)\\end{aligned}",
    explanation: "nビット語の完成は最後の遷移枝で出力1にするため、Mealy型では一致長0〜n−1のn状態で設計できる。Moore型で検出済み状態を独立させる場合は通常n+1状態になる。",
    cue: "状態＝一致済み接頭辞", diagram: "sequence-detector-101", sourceRefs: [ADD1("p.134〜135・順序回路の設計法とnビットパターン検出")],
  },
  {
    id: "dc-add-f-pattern-overlap", topic: "state-machines", title: "重なりを許す戻り先",
    prompt: "不一致や検出完了の後、必ず初期状態へ戻してよい？",
    formula: "S^+=\\text{入力後の末尾と一致する最長の接頭辞状態}",
    explanation: "必ずS0へ戻すと重なって始まる次の系列を見落とす。たとえば101を検出した直後の末尾1は次の101の先頭として再利用できるためS1へ戻る。",
    cue: "末尾＝次の接頭辞", example: "\\(10101\\) は101を2回検出", diagram: "sequence-detector-101", sourceRefs: [ADD1("系列を連続入力する状態遷移例")],
  },
  {
    id: "dc-add-f-sequence-101", topic: "state-machines", title: "101系列検出器",
    prompt: "重なりを許すMealy型101検出器の状態の意味は？",
    formula: "\\begin{aligned}S_0&:\\text{一致なし}\\\\S_1&:\\text{1まで一致}\\\\S_2&:\\text{10まで一致}\\end{aligned}",
    explanation: "S2で入力1なら101が完成して出力1。末尾の1を再利用するため次状態はS1となる。",
    cue: "S2 -- 1/1 → S1", diagram: "sequence-detector-101", sourceRefs: [ADD1("例101・Mealy系列検出")],
  },
  {
    id: "dc-add-f-sequence-1011", topic: "state-machines", title: "1011系列検出器",
    prompt: "重なりを許すMealy型1011検出器の状態の意味は？",
    formula: "\\begin{aligned}S_0&:\\text{一致なし}\\\\S_1&:\\text{1まで一致}\\\\S_2&:\\text{10まで一致}\\\\S_3&:\\text{101まで一致}\\end{aligned}",
    explanation: "S3で入力1なら1011が完成して出力1、末尾1を再利用してS1へ進む。S3で入力0なら1010の末尾10が接頭辞10と一致するためS2へ戻る。",
    cue: "S3 -- 1/1 → S1", diagram: "sequence-detector-1011", sourceRefs: [ADD1("例1011・状態遷移図")],
  },
  {
    id: "dc-add-f-design-flow", topic: "state-machines", title: "順序回路の設計手順",
    prompt: "系列検出の状態図からD-FF回路へ進む順番は？",
    formula: "\\text{状態図}\\to\\text{状態割当}\\to\\text{状態遷移表}\\to\\text{K-map}\\to\\text{式}\\to\\text{回路}",
    explanation: "先に全状態・全入力の遷移を確定し、各状態を2進符号へ割り当てる。現在状態と入力から次状態ビットと出力を表にし、各列をカルノー図で簡単化してD入力式・出力式をゲートへ置き換える。",
    cue: "図→割当→表→K-map→式→回路", diagram: "sequence-design-workflow", sourceRefs: [ADD1("p.134〜135・状態遷移図と状態割当"), ADD2("状態表からカルノー図・D-FF回路")],
  },
  {
    id: "dc-add-f-dff-synthesis", topic: "state-machines", title: "D-FFによる状態機械の実現",
    prompt: "状態表の次状態ビットをD-FFへどう接続する？",
    formula: "\\begin{aligned}D_1&=S_1^+\\\\D_0&=S_0^+\\\\O&=G(S_1,S_0,I)\\end{aligned}",
    explanation: "D-FFは有効クロックでDをそのまま次状態Q+へ写す。したがって状態表のS1+列・S0+列をそれぞれカルノー図で簡単化し、その式をD1・D0入力へ接続する。出力列も別に簡単化する。",
    cue: "D入力＝次状態", diagram: "sequence-design-workflow", sourceRefs: [ADD2("D1n・D0n・Oのカルノー図と実現回路")],
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
    diagram: "sequence-detector-1001", sourceRefs: [PAST(4, "問4・状態表とMealy図"), ADD1("1001系列の状態遷移"), ADD2("1001系列の状態表")],
  },
  {
    id: "dc-extra-q-sequence-state", topic: "state-machines", genre: "1001検出", difficulty: 1, format: "choice",
    prompt: "1001系列検出器で『100まで一致』を表す状態は？", answer: "11",
    options: ["00", "01", "10", "11"],
    steps: ["00初期、01は1、10は10、11は100まで一致。"],
    explanation: "次に1が来れば1001が完成する待機状態。", diagram: "sequence-detector-1001", sourceRefs: [PAST(4, "問4"), ADD1("1001系列の状態割当")],
  },
  {
    id: "dc-extra-q-sequence-output", topic: "state-machines", genre: "1001検出", difficulty: 2, format: "sequence",
    prompt: "状態11（100まで一致）で入力I=1。次状態/出力は？", answer: "01/1",
    accepted: ["1/1", "次状態01、出力1"],
    formula: "O=IS_1S_0",
    steps: ["I=1かつ状態11なので出力1。", "末尾の1は次の検出の先頭にもなるため状態01へ進む。"],
    explanation: "重なりを許すMealy系列検出器の遷移。", diagram: "sequence-detector-1001", sourceRefs: [PAST(4, "問4"), ADD2("状態表と出力式")],
  },
  {
    id: "dc-extra-q-sequence-stream", topic: "state-machines", genre: "1001検出", difficulty: 3, format: "sequence",
    prompt: "初期00から入力列1001を1ビットずつ入れる。各クロック後の状態列と最後の出力を答えよ。",
    answer: "01→10→11→01、最後O=1",
    accepted: ["01,10,11,01/1", "01 10 11 01 最後1"],
    steps: ["1で00→01。", "0で01→10。", "0で10→11。", "1で検出して11→01、O=1。"],
    explanation: "各状態は一致済みの接頭辞を表す。", diagram: "sequence-detector-1001", sourceRefs: [PAST(4, "問4"), ADD1("連続入力時の状態遷移")],
  },
  {
    id: "dc-add-q-pattern-state-count", topic: "state-machines", genre: "nビット系列検出・状態数", difficulty: 2, format: "choice",
    prompt: "6ビットの固定系列をMealy型で検出する。各状態を一致済み接頭辞長0〜5へ対応させると、必要な状態数は？",
    answer: "6状態", accepted: ["6"], options: ["3状態", "4状態", "6状態", "7状態"],
    formula: "N_{\\mathrm{state}}=n",
    steps: ["完成前の一致長0,1,2,3,4,5を列挙する。", "検出完了は最後の遷移枝の出力1で表す。", "よってMealy型は6状態。"],
    explanation: "Moore型で検出済み状態を独立させる場合のn+1状態と混同しない。", diagram: "sequence-design-workflow", sourceRefs: [ADD1("p.135・nビットパターンマッチャー")],
  },
  {
    id: "dc-add-q-sequence-101-full", topic: "state-machines", genre: "101検出・全6遷移", difficulty: 3, format: "sequence",
    prompt: "状態S0=一致なし、S1=1まで一致、S2=10まで一致とする、重なり許可101 Mealy検出器の全6遷移を次状態/出力で答えよ。",
    answer: "S0:0→S0/0,1→S1/0; S1:0→S2/0,1→S1/0; S2:0→S0/0,1→S1/1",
    accepted: ["S0 0 S0/0 1 S1/0;S1 0 S2/0 1 S1/0;S2 0 S0/0 1 S1/1"],
    steps: ["各状態から入力0と1を1本ずつ、計6本作る。", "入力後の末尾と一致する101の最長接頭辞を次状態にする。", "S2で入力1の枝だけ101が完成して出力1。", "完成後の末尾1を再利用してS1へ進む。"],
    explanation: "S1の入力1自己ループと、検出枝S2--1/1→S1が重なり検出の要点。", diagram: "sequence-detector-101", sourceRefs: [ADD1("例101・状態遷移設計")],
  },
  {
    id: "dc-add-q-sequence-101-stream", topic: "state-machines", genre: "101重なり検出", difficulty: 3, format: "sequence",
    prompt: "初期S0から入力列10101を1ビットずつ101 Mealy検出器へ入れる。各クロック後の状態列と出力列を答えよ。",
    answer: "状態S1→S2→S1→S2→S1、出力00101",
    accepted: ["S1,S2,S1,S2,S1/00101", "S1 S2 S1 S2 S1 出力0 0 1 0 1"],
    steps: ["1でS0→S1、O=0。", "0でS1→S2、O=0。", "1で検出しS2→S1、O=1。", "0でS1→S2、O=0。", "1で再度検出しS2→S1、O=1。"],
    explanation: "10101では末尾の1を次の先頭として共用するため101を2回検出する。", diagram: "sequence-detector-101", sourceRefs: [ADD1("系列の重なりを含む状態遷移例")],
  },
  {
    id: "dc-add-q-sequence-1011-full", topic: "state-machines", genre: "1011検出・全8遷移", difficulty: 3, format: "sequence",
    prompt: "状態S0=一致なし、S1=1、S2=10、S3=101まで一致とする、重なり許可1011 Mealy検出器の全8遷移を次状態/出力で答えよ。",
    answer: "S0:0→S0/0,1→S1/0; S1:0→S2/0,1→S1/0; S2:0→S0/0,1→S3/0; S3:0→S2/0,1→S1/1",
    accepted: ["S0 0 S0/0 1 S1/0;S1 0 S2/0 1 S1/0;S2 0 S0/0 1 S3/0;S3 0 S2/0 1 S1/1"],
    steps: ["4状態×2入力の8本を漏れなく用意する。", "S1に1を加えた11の末尾1は接頭辞1と一致するのでS1へ戻る。", "S3に1を加えると1011が完成し出力1。", "S3に0を加えた1010では末尾10を残してS2へ戻る。"],
    explanation: "不一致時も最長接頭辞を残すため、S3--0/0→S2をS0へ戻してはいけない。", diagram: "sequence-detector-1011", sourceRefs: [ADD1("例1011・状態遷移図")],
  },
  {
    id: "dc-add-q-sequence-1011-stream", topic: "state-machines", genre: "1011重なり検出", difficulty: 3, format: "sequence",
    prompt: "初期S0から入力列1011011を1011 Mealy検出器へ入れる。各クロック後の状態列と出力列を答えよ。",
    answer: "状態S1→S2→S3→S1→S2→S3→S1、出力0001001",
    accepted: ["S1,S2,S3,S1,S2,S3,S1/0001001", "S1 S2 S3 S1 S2 S3 S1 出力0 0 0 1 0 0 1"],
    steps: ["101でS1→S2→S3。", "次の1で1011を検出してS1、O=1。", "検出時の末尾1を次の先頭として保持し、続く0でS2、1でS3、最後の1で再検出する。", "各桁の出力を並べると0001001。"],
    explanation: "入力1011011には位置1〜4と4〜7の2つの1011が、1ビットを共有して含まれる。", diagram: "sequence-detector-1011", sourceRefs: [ADD1("連続パターン入力の状態遷移")],
  },
  {
    id: "dc-add-q-design-workflow", topic: "state-machines", genre: "順序回路設計手順", difficulty: 3, format: "text",
    prompt: "系列検出器を仕様からD-FFと論理ゲートの回路へ落とすまでの手順を、状態図・状態割当・状態表・カルノー図を含めて順に答えよ。",
    answer: "仕様から状態図を作り、各状態へ2進符号を割り当て、全現在状態と入力の状態遷移表を作り、次状態各ビットと出力をカルノー図で簡単化し、その式をD-FF入力と出力ゲートへ実装する",
    accepted: ["状態図→状態割当→状態遷移表→K-map→次状態式・出力式→D-FF回路"],
    keywords: ["状態図", "状態割当", "状態", "カルノー", "D-FF", "回路"], minKeywords: 5,
    steps: ["検出したい系列からMealy状態図を作る。", "状態数を表せるビット数で状態割当する。", "全状態×全入力を列挙して次状態・出力を表にする。", "次状態ビットごとと出力のカルノー図を別々に作る。", "簡単化式をD入力・出力ゲートへ接続する。"],
    explanation: "途中の状態表を省くと遷移の抜け、K-mapを省くと余分なゲートや式ミスが出やすい。", diagram: "sequence-design-workflow", sourceRefs: [ADD1("状態遷移図・状態割当"), ADD2("状態表・K-map・D-FF論理回路")],
  },
  {
    id: "dc-add-q-1001-synthesis", topic: "state-machines", genre: "1001検出・K-map・回路合成", difficulty: 3, format: "text",
    prompt: "1001 Mealy検出器を状態S1S0=00,01,10,11へ割り当てた。全8行の状態表から、D1=S1+、D0=S0+、出力Oの簡単化式を導き、D-FF回路へ接続せよ。",
    answer: "D1=Ī(S̅1S0+S1S̅0)、D0=I+S1S̅0、O=IS1S0",
    accepted: ["D_1=\\overline I(\\overline{S_1}S_0+S_1\\overline{S_0}),D_0=I+S_1\\overline{S_0},O=IS_1S_0"],
    keywords: ["D1", "D0", "O", "I", "S1", "S0"], minKeywords: 6,
    formula: "\\begin{aligned}D_1=S_1^+&=\\overline I(\\overline{S_1}S_0+S_1\\overline{S_0})\\\\D_0=S_0^+&=I+S_1\\overline{S_0}\\\\O&=IS_1S_0\\end{aligned}",
    steps: ["状態00,01,10,11の各々へI=0,1を与えた8行を作る。", "次状態の上位ビット列をD1の3変数K-mapへ転記する。", "下位ビット列をD0のK-map、出力列をOのK-mapへ転記する。", "各K-mapを1,2,4セルの長方形でまとめて積和形を得る。", "D1式を上位D-FF、D0式を下位D-FF、O式を出力ANDへ接続する。"],
    explanation: "D-FFではD=Q+なので励起表を別に変換する必要はない。写真2枚目のK-mapと最終回路はこの3式をゲートへ置き換えたもの。", diagram: "sequence-design-workflow", sourceRefs: [ADD2("D1n・D0n・OのK-mapと最終D-FF回路")],
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
    sourceBasis: ["範囲ZIP p.7〜10：状態表・Mealy・Moore", "現行範囲過去問 p.3〜4・演習3：状態機械と1001検出器の設計", "追加範囲ノート2枚：状態図→状態割当→状態表→K-map→D-FF回路"],
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
  ["dc-extra-q-truth-table-full", "dc-extra-q-cycle-design", "dc-extra-q-ex3-equation", "dc-add-q-1001-synthesis"],
  ["dc-extra-q-xor-seq", "dc-extra-q-cycle-design", "dc-extra-q-past-full-table", "dc-add-q-sequence-101-full"],
  ["dc-extra-q-truth-from-wave", "dc-extra-q-cycle-design", "dc-extra-q-past-full-table", "dc-add-q-sequence-1011-stream"],
  ["dc-extra-q-truth-table-full", "dc-extra-q-cycle-timing", "dc-extra-q-past-full-table", "dc-add-q-design-workflow"],
  ["dc-extra-q-truth-table-full", "dc-extra-q-cycle-design", "dc-extra-q-past-full-table", "dc-add-q-sequence-1011-full"],
  ["dc-extra-q-xor-seq", "dc-extra-q-cycle-design", "dc-extra-q-ex3-equation", "dc-add-q-1001-synthesis"],
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
