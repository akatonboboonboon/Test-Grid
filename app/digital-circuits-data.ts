export type DigitalCircuitTopicId =
  | "logic-timing"
  | "latches"
  | "flipflops"
  | "registers"
  | "counters"
  | "state-machines";

export type DigitalCircuitDiagramKind =
  | "and-timing" | "or-timing" | "sr-latch" | "d-ff" | "jk-ff"
  | "parallel-register" | "ripple-up" | "ripple-down" | "sync-counter"
  | "mealy" | "moore" | "state-analysis";

export type DigitalCircuitSourceRef = { kind: "scope-zip"; page: number; filename: string; note?: string };
export type DigitalCircuitFormulaCard = {
  id: string; topic: DigitalCircuitTopicId; title: string; prompt: string; formula: string;
  explanation: string; cue: string; example?: string; diagram?: DigitalCircuitDiagramKind;
  sourceRefs: DigitalCircuitSourceRef[];
};
export type DigitalCircuitQuestion = {
  id: string; topic: DigitalCircuitTopicId; genre: string; difficulty: 1 | 2 | 3;
  format: "choice" | "text" | "sequence"; prompt: string; context?: string; answer: string;
  accepted?: string[]; options?: string[]; keywords?: string[]; minKeywords?: number;
  formula?: string; steps: string[]; explanation: string; diagram?: DigitalCircuitDiagramKind;
  sourceRefs: DigitalCircuitSourceRef[];
  /** 本番形式で連続して処理する小問数。 */
  subpartCount?: number;
  sourceBasis?: readonly string[];
  examLevel?: true;
};
export type DigitalCircuitExpectedQuestion = DigitalCircuitQuestion & { major: number; sub: number; points: number };
export type DigitalCircuitExpectedSection = {
  number: number; title: string; points: number; context: string;
  topicIds: DigitalCircuitTopicId[]; questions: DigitalCircuitExpectedQuestion[];
};
export type DigitalCircuitExpectedExam = {
  officialMinutes?: null;
  id: string; number: number; title: string; subtitle: string; defaultMinutes: 50; userAdjustable: true;
  totalPoints: 100; passPercent: 60; paper: "A4 portrait"; sections: DigitalCircuitExpectedSection[];
};

const SCOPE_FILENAMES = [
  "PXL_20260717_140938493.jpg", "PXL_20260717_140945940.jpg",
  "PXL_20260717_140948671.jpg", "PXL_20260717_141002906.jpg",
  "PXL_20260717_141005403.jpg", "PXL_20260717_141012846.jpg",
  "PXL_20260717_141015686.jpg", "PXL_20260717_141020576.jpg",
  "PXL_20260717_141024210.jpg", "PXL_20260717_141028201.jpg",
] as const;
export const DIGITAL_CIRCUIT_FORMAT_REFERENCE_FILENAMES = [
  "PXL_20260717_141145383.jpg", "PXL_20260717_141150743.jpg",
  "PXL_20260717_141155753.jpg", "PXL_20260717_141158606.jpg",
] as const;
function scopeRef(page: number, note?: string): DigitalCircuitSourceRef {
  const filename = SCOPE_FILENAMES[page - 1];
  if (!filename) throw new Error("Unknown digital-circuit scope page " + page);
  return { kind: "scope-zip", page, filename, note };
}

export const DIGITAL_CIRCUIT_SOURCE_POLICY = {
  scopeArchive: "デジタル回路範囲-20260717T141240Z-1-001.zip",
  formatArchive: "デジタル回路形式-20260717T141257Z-1-001.zip",
  note: "範囲ZIPの10画像と、別送の現行範囲PDF（4ファイル・計7ページ）を出題内容に採用。形式ZIPの4画像は記述式・表完成・回路作図という紙面形式だけを参照する。",
  excludedFormatOnlyTopics: ["進数変換", "カルノー図", "全加算器", "7セグメント表示"],
} as const;

export const DIGITAL_CIRCUIT_RANGE_PAGES = [
  { number: 1, filename: SCOPE_FILENAMES[0], topics: ["logic-timing"], summary: "AND・ORゲートの真理値表とタイミングチャート。" },
  { number: 2, filename: SCOPE_FILENAMES[1], topics: ["flipflops"], summary: "JK・Dフリップフロップ、正負エッジ。" },
  { number: 3, filename: SCOPE_FILENAMES[2], topics: ["registers"], summary: "共通クロックの2ビット並列レジスタ。" },
  { number: 4, filename: SCOPE_FILENAMES[3], topics: ["latches", "flipflops", "counters"], summary: "NOR形SRラッチとJK非同期カウンタ。" },
  { number: 5, filename: SCOPE_FILENAMES[4], topics: ["counters"], summary: "非同期カウンタの計数方向と分周。" },
  { number: 6, filename: SCOPE_FILENAMES[5], topics: ["counters"], summary: "共通CLKの3ビット同期アップカウンタ。J0=K0=1、J1=K1=Q0、J2=K2=Q0Q1。" },
  { number: 7, filename: SCOPE_FILENAMES[6], topics: ["flipflops", "counters", "state-machines"], summary: "プリセット・クリア、Mealy・Moore。" },
  { number: 8, filename: SCOPE_FILENAMES[7], topics: ["state-machines"], summary: "次状態式、状態表、Mealy状態図。" },
  { number: 9, filename: SCOPE_FILENAMES[8], topics: ["state-machines"], summary: "D-FF順序回路の解析。" },
  { number: 10, filename: SCOPE_FILENAMES[9], topics: ["state-machines"], summary: "2状態ビットの状態遷移図。" },
] as const;

export const DIGITAL_CIRCUIT_TOPICS = [
  { id: "logic-timing", number: "01", title: "論理ゲートとタイミング", shortTitle: "ゲート・波形", description: "AND・ORの真理値表を時間方向の波形へ変換する。", pages: [1], color: "#63d8cb" },
  { id: "latches", number: "02", title: "SRラッチ", shortTitle: "SRラッチ", description: "NOR形SRラッチのセット、リセット、保持、禁止入力。", pages: [4], color: "#70a8ff" },
  { id: "flipflops", number: "03", title: "D・JKフリップフロップ", shortTitle: "D・JK FF", description: "エッジトリガ、保持、セット、リセット、トグル、非同期入力。", pages: [2, 4, 7], color: "#a68bff" },
  { id: "registers", number: "04", title: "並列レジスタ", shortTitle: "レジスタ", description: "共通クロックで複数ビットを同時に記憶する。", pages: [3], color: "#ff8eb6" },
  { id: "counters", number: "05", title: "同期・非同期カウンタ", shortTitle: "カウンタ", description: "JK-FFのトグル、共通CLKの同期アップ、非同期ダウン、分周。", pages: [4, 5, 6, 7], color: "#ffd05d" },
  { id: "state-machines", number: "06", title: "順序回路と状態遷移", shortTitle: "状態表・状態図", description: "次状態式、状態表、Mealy・Moore状態図。", pages: [7, 8, 9, 10], color: "#7de19a" },
] as const satisfies ReadonlyArray<{ id: DigitalCircuitTopicId; number: string; title: string; shortTitle: string; description: string; pages: readonly number[]; color: string }>;

type CardSeed = Omit<DigitalCircuitFormulaCard, "sourceRefs"> & { pages: number[] };
const CARD_SEEDS: CardSeed[] = [
  { id: "dc-f-and", topic: "logic-timing", title: "ANDゲート", prompt: "論理式と1になる条件は？", formula: "Y=A\\cdot B", explanation: "両入力が1の区間だけ出力が1。", cue: "両方1なら1", example: "\\((1,0)\\Rightarrow0\\)", diagram: "and-timing", pages: [1] },
  { id: "dc-f-or", topic: "logic-timing", title: "ORゲート", prompt: "論理式と0になる条件は？", formula: "Y=A+B", explanation: "少なくとも一方が1なら出力1。", cue: "両方0だけ0", example: "\\((0,1)\\Rightarrow1\\)", diagram: "or-timing", pages: [1] },
  { id: "dc-f-and-table", topic: "logic-timing", title: "AND真理値表", prompt: "00,01,10,11の出力列は？", formula: "0001", explanation: "11だけ1。", cue: "0001", pages: [1] },
  { id: "dc-f-or-table", topic: "logic-timing", title: "OR真理値表", prompt: "00,01,10,11の出力列は？", formula: "0111", explanation: "00だけ0。", cue: "0111", pages: [1] },
  { id: "dc-f-timing", topic: "logic-timing", title: "タイミング図", prompt: "出力波形を描く基本手順は？", formula: "Y(t)=F(A(t),B(t))", explanation: "入力変化点で区切り、各区間を真理値表へ代入する。", cue: "区切る→計算", diagram: "and-timing", pages: [1] },

  { id: "dc-f-sr", topic: "latches", title: "NOR形SRラッチ", prompt: "入力と次状態の対応は？", formula: "\\begin{array}{cc|c}S&R&Q^+\\\\0&0&Q\\\\1&0&1\\\\0&1&0\\\\1&1&\\text{禁止}\\end{array}", explanation: "00保持、10セット、01リセット、11禁止。", cue: "保持・セット・リセット・禁止", diagram: "sr-latch", pages: [4] },
  { id: "dc-f-sr-hold", topic: "latches", title: "SRの保持", prompt: "保持入力は？", formula: "S=R=0\\Rightarrow Q^+=Q", explanation: "交差帰還が直前状態を保つ。", cue: "00保持", diagram: "sr-latch", pages: [4] },
  { id: "dc-f-sr-forbid", topic: "latches", title: "SRの禁止入力", prompt: "避ける入力と理由は？", formula: "S=R=1", explanation: "同時解除後の状態が不定になり得る。", cue: "11禁止", diagram: "sr-latch", pages: [4] },

  { id: "dc-f-dff", topic: "flipflops", title: "Dフリップフロップ", prompt: "次状態式は？", formula: "Q^+=D", explanation: "有効エッジ時のDを取り込み次のエッジまで保持。", cue: "Dを記憶", diagram: "d-ff", pages: [2, 3] },
  { id: "dc-f-jk", topic: "flipflops", title: "JKフリップフロップ", prompt: "次状態式は？", formula: "Q^+=J\\overline Q+\\overline KQ", explanation: "00保持、01リセット、10セット、11反転。", cue: "保持・0・1・反転", diagram: "jk-ff", pages: [2, 4] },
  { id: "dc-f-toggle", topic: "flipflops", title: "JKのトグル", prompt: "毎エッジ反転させる入力は？", formula: "J=K=1\\Rightarrow Q^+=\\overline Q", explanation: "カウンタ各段に使う。", cue: "11で反転", diagram: "jk-ff", pages: [2, 4, 5, 6] },
  { id: "dc-f-edge", topic: "flipflops", title: "エッジトリガ", prompt: "正・負エッジは？", formula: "\\text{正}:0\\to1,\\quad\\text{負}:1\\to0", explanation: "指定された一瞬だけ入力を取り込む。", cue: "立上り／立下り", diagram: "d-ff", pages: [2, 4] },
  { id: "dc-f-async", topic: "flipflops", title: "プリセット・クリア", prompt: "非同期入力はいつ効く？", formula: "\\text{CLKに無関係}", explanation: "クロックを待たず状態を強制する。", cue: "初期化", diagram: "d-ff", pages: [7] },

  { id: "dc-f-register", topic: "registers", title: "並列レジスタ", prompt: "nビットをどう記憶する？", formula: "\\boldsymbol Q^+=\\boldsymbol D", explanation: "共通エッジで全D入力を対応するQへ同時保存。", cue: "同時記憶", diagram: "parallel-register", pages: [3] },
  { id: "dc-f-reg-hold", topic: "registers", title: "レジスタ保持", prompt: "エッジ間のQは？", formula: "Q_i=\\text{直前エッジの }D_i", explanation: "Dが途中で変化してもQは次エッジまで変わらない。", cue: "変化はエッジだけ", diagram: "parallel-register", pages: [3] },
  { id: "dc-f-reg-sample", topic: "registers", title: "波形の描き方", prompt: "レジスタ波形をどう追う？", formula: "Q_i[k+1]=D_i[k]", explanation: "有効エッジでDを読み次のエッジまで水平に保つ。", cue: "読む→保持", diagram: "parallel-register", pages: [3] },

  { id: "dc-f-modulus", topic: "counters", title: "状態数", prompt: "nビットの状態数は？", formula: "M=2^n", explanation: "各FFが0/1の2状態。", cue: "3ビットは8", diagram: "ripple-up", pages: [5] },
  { id: "dc-f-up", topic: "counters", title: "3ビットアップの状態列", prompt: "一巡を答えると？", formula: "000\\to001\\to010\\to011\\to100\\to101\\to110\\to111\\to000", explanation: "1ずつ増え最大の次に0へ戻る。p.6の同期回路では3段とも同じCLKで同時に更新する。", cue: "0→7", diagram: "sync-counter", pages: [6] },
  { id: "dc-f-sync-excitation", topic: "counters", title: "3ビット同期アップのJK入力", prompt: "各段のJ・K入力は？", formula: "\\begin{aligned}J_0=K_0&=1\\\\J_1=K_1&=Q_0\\\\J_2=K_2&=Q_0Q_1\\end{aligned}", explanation: "Q0は毎クロック反転し、Q1はQ0=1のとき、Q2はQ0Q1=11のとき反転する。全FFは共通CLKで同時に更新する。", cue: "1、Q0、Q0Q1", diagram: "sync-counter", pages: [6] },
  { id: "dc-f-down", topic: "counters", title: "3ビット非同期ダウン", prompt: "一巡を答えると？", formula: "111\\to110\\to101\\to100\\to011\\to010\\to001\\to000\\to111", explanation: "1ずつ減り0の次に7へ戻る。非同期回路では前段出力が次段クロックになる。", cue: "7→0", diagram: "ripple-down", pages: [5] },
  { id: "dc-f-divider", topic: "counters", title: "分周", prompt: "Qiの周波数は？", formula: "f_{Q_i}=\\frac{f_{CLK}}{2^{i+1}}", explanation: "段を進むたび周波数は半分。", cue: "Q0は1/2", diagram: "ripple-up", pages: [5] },
  { id: "dc-f-ripple", topic: "counters", title: "非同期カウンタ", prompt: "なぜリップルと呼ぶ？", formula: "CLK\\to Q_0\\to Q_1\\to Q_2", explanation: "前段出力が次段クロックとなり変化が順に伝わる。", cue: "前段→次段", diagram: "ripple-up", pages: [4, 5] },

  { id: "dc-f-state", topic: "state-machines", title: "次状態式", prompt: "一般形は？", formula: "S^+=F(S,X)", explanation: "次状態は現在状態と入力から決まる。", cue: "D入力＝次状態", diagram: "state-analysis", pages: [8, 9, 10] },
  { id: "dc-f-mealy", topic: "state-machines", title: "Mealy回路", prompt: "出力は何に依存？", formula: "Y=G(S,X)", explanation: "状態と入力に依存し、枝へX/Yを書く。", cue: "状態＋入力", diagram: "mealy", pages: [7, 8, 9, 10] },
  { id: "dc-f-moore", topic: "state-machines", title: "Moore回路", prompt: "出力は何に依存？", formula: "Y=G(S)", explanation: "状態だけに依存し、状態内へ出力を書く。", cue: "状態だけ", diagram: "moore", pages: [7] },
  { id: "dc-f-analysis", topic: "state-machines", title: "解析手順", prompt: "回路図から状態図までの順は？", formula: "\\text{FF番号}\\to\\text{式}\\to\\text{状態表}\\to\\text{状態図}", explanation: "次状態式と出力式を先に確定する。", cue: "式→表→図", diagram: "state-analysis", pages: [8, 9, 10] },
  { id: "dc-f-label", topic: "state-machines", title: "Mealy枝ラベル", prompt: "X/Yは何を表す？", formula: "X/Y", explanation: "スラッシュ前が入力、後が出力。", cue: "入力／出力", diagram: "mealy", pages: [8, 9, 10] },
];
export const DIGITAL_CIRCUIT_FORMULAS: DigitalCircuitFormulaCard[] = CARD_SEEDS.map((seed) => ({
  ...seed, sourceRefs: seed.pages.map((page) => scopeRef(page)),
}));

type QuestionSeed = Omit<DigitalCircuitQuestion, "sourceRefs"> & { pages: number[] };
const q = (seed: QuestionSeed): QuestionSeed => seed;
const QUESTION_SEEDS: QuestionSeed[] = [
  q({ id: "dc-q-and-value", topic: "logic-timing", genre: "真理値表", difficulty: 1, format: "choice", prompt: "ANDでA=1、B=0。Yは？", answer: "0", options: ["0", "1", "保持", "不定"], formula: "Y=A\\cdot B", steps: ["論理積へ代入する。", "\\(1\\cdot0=0\\)。"], explanation: "両入力1のときだけ1。", diagram: "and-timing", pages: [1] }),
  q({ id: "dc-q-and-seq", topic: "logic-timing", genre: "出力列", difficulty: 2, format: "sequence", prompt: "ABが00,01,11,10の順。AND出力列を4桁で答えよ。", answer: "0010", accepted: ["0,0,1,0", "0 0 1 0"], formula: "Y=A\\cdot B", steps: ["入力変化点で4区間に分ける。", "11だけ1にする。"], explanation: "00→0、01→0、11→1、10→0。", diagram: "and-timing", pages: [1] }),
  q({ id: "dc-q-or-seq", topic: "logic-timing", genre: "出力列", difficulty: 2, format: "sequence", prompt: "ABが00,10,11,01の順。OR出力列を4桁で答えよ。", answer: "0111", accepted: ["0,1,1,1", "0 1 1 1"], formula: "Y=A+B", steps: ["4区間に分ける。", "00だけ0にする。"], explanation: "00→0、残りは1。", diagram: "or-timing", pages: [1] }),
  q({ id: "dc-q-timing-step", topic: "logic-timing", genre: "波形作図", difficulty: 2, format: "text", prompt: "入力波形から出力波形を描く手順を説明せよ。", answer: "入力変化点で区間を分け、各区間の入力を真理値表へ代入する", accepted: ["変化点で区切って各区間を真理値表で求める"], keywords: ["変化点", "区間", "真理値表"], minKeywords: 2, steps: ["全入力の変化点をそろえる。", "区間ごとの入力組を読む。", "出力をつなぐ。"], explanation: "入力が一定の区間ごとに考える。", diagram: "and-timing", pages: [1] }),

  q({ id: "dc-q-sr-set", topic: "latches", genre: "セット", difficulty: 1, format: "choice", prompt: "NOR形SRラッチでQを1にする入力は？", answer: "S=1, R=0", options: ["S=0, R=0", "S=0, R=1", "S=1, R=0", "S=1, R=1"], formula: "10\\Rightarrow Q^+=1", steps: ["Sを1、Rを0にする。"], explanation: "SはSet入力。", diagram: "sr-latch", pages: [4] }),
  q({ id: "dc-q-sr-hold", topic: "latches", genre: "保持", difficulty: 1, format: "choice", prompt: "NOR形SRラッチの保持入力は？", answer: "S=0, R=0", options: ["S=0, R=0", "S=0, R=1", "S=1, R=0", "S=1, R=1"], formula: "00\\Rightarrow Q^+=Q", steps: ["SetもResetも要求しない。"], explanation: "交差帰還が直前状態を保持。", diagram: "sr-latch", pages: [4] }),
  q({ id: "dc-q-sr-seq", topic: "latches", genre: "状態列", difficulty: 2, format: "sequence", prompt: "初期Q=0。SRを10,00,01,00の順に与えた直後のQ列は？", answer: "1100", accepted: ["1,1,0,0", "1 1 0 0"], formula: "10:\\text{set},00:\\text{hold},01:\\text{reset}", steps: ["セットして1。", "保持で1。", "リセットで0。", "保持で0。"], explanation: "各入力を順に追う。", diagram: "sr-latch", pages: [4] }),
  q({ id: "dc-q-sr-forbid", topic: "latches", genre: "禁止入力", difficulty: 2, format: "text", prompt: "S=R=1を避ける理由は？", answer: "同時解除後の状態が不定になり得るため", accepted: ["相補出力が崩れ解除後の状態が不定になるため"], keywords: ["不定", "解除"], minKeywords: 2, steps: ["11中の出力を考える。", "同時解除時の競合を考える。"], explanation: "伝搬差で最終状態が決まらない。", diagram: "sr-latch", pages: [4] }),

  q({ id: "dc-q-d-value", topic: "flipflops", genre: "D-FF", difficulty: 1, format: "choice", prompt: "正エッジ直前D=1。直後のQは？", answer: "1", options: ["0", "1", "反転", "不定"], formula: "Q^+=D", steps: ["エッジ時のDをQへ写す。"], explanation: "D-FFはDを記憶。", diagram: "d-ff", pages: [2] }),
  q({ id: "dc-q-d-seq", topic: "flipflops", genre: "D波形", difficulty: 2, format: "sequence", prompt: "初期Q=0。3回の正エッジ直前Dが1,0,1。直後のQ列は？", answer: "101", accepted: ["1,0,1", "1 0 1"], formula: "Q^+=D", steps: ["各正エッジでDを読む。"], explanation: "エッジ間は保持。", diagram: "d-ff", pages: [2] }),
  q({ id: "dc-q-jk-toggle", topic: "flipflops", genre: "JK", difficulty: 1, format: "choice", prompt: "JK=11、現在Q=0。次状態は？", answer: "1", options: ["0", "1", "保持", "禁止"], formula: "Q^+=\\overline Q", steps: ["11はトグル。", "0を反転して1。"], explanation: "JKの11は禁止ではない。", diagram: "jk-ff", pages: [2, 4] }),
  q({ id: "dc-q-jk-seq", topic: "flipflops", genre: "JK波形", difficulty: 2, format: "sequence", prompt: "初期Q=0。JKが10,00,11,01の順。Q列は？", answer: "1100", accepted: ["1,1,0,0", "1 1 0 0"], formula: "10:\\text{set},00:\\text{hold},11:\\text{toggle},01:\\text{reset}", steps: ["セット1。", "保持1。", "反転0。", "リセット0。"], explanation: "直前Qを更新しながら追う。", diagram: "jk-ff", pages: [2, 4] }),
  q({ id: "dc-q-edge", topic: "flipflops", genre: "エッジ", difficulty: 1, format: "choice", prompt: "負エッジで取り込む瞬間は？", answer: "クロックが1から0へ変わる瞬間", options: ["0から1", "1から0", "1の間ずっと", "0の間ずっと"], formula: "1\\to0", steps: ["負エッジを立下りへ対応。"], explanation: "負エッジは立下り。", diagram: "d-ff", pages: [2, 4] }),

  q({ id: "dc-q-reg-value", topic: "registers", genre: "2ビット記憶", difficulty: 1, format: "sequence", prompt: "正エッジ直前D1D0=10。直後のQ1Q0は？", answer: "10", accepted: ["1,0", "1 0"], formula: "\\boldsymbol Q^+=\\boldsymbol D", steps: ["D1→Q1、D0→Q0。"], explanation: "同じエッジで同時に保存。", diagram: "parallel-register", pages: [3] }),
  q({ id: "dc-q-reg-hold", topic: "registers", genre: "保持", difficulty: 1, format: "choice", prompt: "Q1Q0=01を記憶後、次エッジ前にDが10へ変化。Qは？", answer: "01", options: ["00", "01", "10", "11"], steps: ["次の有効エッジはまだ。", "01を保持。"], explanation: "途中のD変化は反映されない。", diagram: "parallel-register", pages: [3] }),
  q({ id: "dc-q-reg-seq", topic: "registers", genre: "波形", difficulty: 2, format: "sequence", prompt: "3回の正エッジ直前D1D0が01,11,10。各直後のQ列は？", answer: "01-11-10", accepted: ["01→11→10", "01,11,10"], formula: "\\boldsymbol Q^+=\\boldsymbol D", steps: ["各エッジ直前だけDを読む。"], explanation: "各値を次エッジまで保持。", diagram: "parallel-register", pages: [3] }),
  q({ id: "dc-q-reg-explain", topic: "registers", genre: "説明", difficulty: 2, format: "text", prompt: "並列レジスタを『共通クロック』を使って説明せよ。", answer: "複数のD-FFが共通クロックの有効エッジで各入力ビットを同時に記憶する", accepted: ["共通クロックで複数ビットを同時保存する"], keywords: ["共通クロック", "同時", "記憶"], minKeywords: 3, steps: ["複数FFと同時動作を書く。"], explanation: "ビット間の記憶時点がそろう。", diagram: "parallel-register", pages: [3] }),

  q({ id: "dc-q-count-states", topic: "counters", genre: "状態数", difficulty: 1, format: "choice", prompt: "4ビット二進カウンタの状態数は？", answer: "16", options: ["4", "8", "16", "32"], formula: "M=2^4", steps: ["\\(2^4=16\\)。"], explanation: "0000〜1111。", diagram: "ripple-up", pages: [5] }),
  q({ id: "dc-q-count-up", topic: "counters", genre: "アップ計数", difficulty: 1, format: "sequence", prompt: "3ビットアップで現在011。次の2状態は？", answer: "100,101", accepted: ["100→101", "100 101"], steps: ["1ずつ加える。"], explanation: "011の次は桁上がりで100。", diagram: "ripple-up", pages: [4, 5] }),
  q({ id: "dc-q-count-sync-inputs", topic: "counters", genre: "同期カウンタ", difficulty: 2, format: "text", prompt: "共通CLKの3ビット同期アップカウンタで、J0=K0、J1=K1、J2=K2を順に答えよ。", answer: "1, Q0, Q0Q1", accepted: ["1,Q0,Q0Q1", "1 Q0 Q0Q1"], keywords: ["1", "Q0", "Q0Q1"], minKeywords: 3, formula: "\\begin{aligned}J_0=K_0&=1\\\\J_1=K_1&=Q_0\\\\J_2=K_2&=Q_0Q_1\\end{aligned}", steps: ["Q0は毎回反転するのでJ0=K0=1。", "Q1は下位1ビットが1のとき反転する。", "Q2は下位2ビットがともに1のとき反転する。"], explanation: "全段が共通CLKを受け、桁上がり条件を各段のJ=Kへ与える。", diagram: "sync-counter", pages: [6] }),
  q({ id: "dc-q-count-sync-seq", topic: "counters", genre: "同期アップ計数", difficulty: 2, format: "sequence", prompt: "p.6の3ビット同期アップカウンタが現在011。次の2状態は？", answer: "100,101", accepted: ["100→101", "100 101"], formula: "000\\to001\\to010\\to011\\to100\\to101\\to110\\to111\\to000", steps: ["011ではQ0Q1=11なので3段すべてが共通CLKで更新され100になる。", "次の100ではQ0だけが反転して101になる。"], explanation: "同期式なので各FFは同じクロック端で同時に次状態へ移る。", diagram: "sync-counter", pages: [6] }),
  q({ id: "dc-q-count-down", topic: "counters", genre: "非同期ダウン計数", difficulty: 1, format: "sequence", prompt: "3ビット非同期ダウンで現在100。次の2状態は？", answer: "011,010", accepted: ["011→010", "011 010"], steps: ["1ずつ引く。"], explanation: "借りを含む二進減算。", diagram: "ripple-down", pages: [5] }),
  q({ id: "dc-q-count-div", topic: "counters", genre: "分周", difficulty: 2, format: "choice", prompt: "CLK=8 kHzの3ビットカウンタ。Q2は？", answer: "1 kHz", accepted: ["1kHz", "1000Hz"], options: ["0.5 kHz", "1 kHz", "2 kHz", "4 kHz"], formula: "f_{Q_2}=f_{CLK}/8", steps: ["Q2は1/8。", "8 kHz÷8。"], explanation: "Q0=1/2、Q1=1/4、Q2=1/8。", diagram: "ripple-up", pages: [5] }),
  q({ id: "dc-q-count-ripple", topic: "counters", genre: "非同期", difficulty: 2, format: "text", prompt: "各ビットが完全同時に変化しない理由は？", answer: "前段出力が次段のクロックとなり伝搬遅延が順に加わるため", accepted: ["前段から次段へ伝搬遅延を伴って変化が伝わるため"], keywords: ["前段", "次段", "伝搬遅延"], minKeywords: 2, steps: ["接続と遅延を書く。"], explanation: "変化が波状に伝わる。", diagram: "ripple-up", pages: [4, 5] }),

  q({ id: "dc-q-mealy", topic: "state-machines", genre: "Mealy/Moore", difficulty: 1, format: "choice", prompt: "出力がSとXの両方に依存する回路は？", answer: "Mealy回路", options: ["Mealy回路", "Moore回路", "並列レジスタ", "SRラッチ"], formula: "Y=G(S,X)", steps: ["依存変数を見る。"], explanation: "Mealyは状態＋入力。", diagram: "mealy", pages: [7, 8, 9, 10] }),
  q({ id: "dc-q-moore", topic: "state-machines", genre: "Mealy/Moore", difficulty: 1, format: "choice", prompt: "出力がSだけに依存する回路は？", answer: "Moore回路", options: ["Mealy回路", "Moore回路", "ANDゲート", "カウンタ"], formula: "Y=G(S)", steps: ["入力Xがない。"], explanation: "Mooreは状態だけ。", diagram: "moore", pages: [7] }),
  q({ id: "dc-q-next", topic: "state-machines", genre: "次状態", difficulty: 1, format: "choice", prompt: "D-FFでD=A。次状態S+は？", answer: "A", options: ["0", "1", "A", "S"], formula: "S^+=D=A", steps: ["D-FFの特性式を使う。"], explanation: "D入力が次状態。", diagram: "state-analysis", pages: [8, 9] }),
  q({ id: "dc-q-analysis", topic: "state-machines", genre: "解析手順", difficulty: 2, format: "text", prompt: "回路図から状態図までの手順を答えよ。", answer: "FFを番号付けし、次状態式と出力式を求め、状態表を作り、状態図を描く", accepted: ["FF番号→次状態式・出力式→状態表→状態図"], keywords: ["次状態式", "出力式", "状態表", "状態図"], minKeywords: 4, steps: ["FFを状態変数化。", "式を作る。", "表を作る。", "図へ変換。"], explanation: "式→表→図の順で抜けを防ぐ。", diagram: "state-analysis", pages: [8, 9, 10] }),
  q({ id: "dc-q-label", topic: "state-machines", genre: "状態図", difficulty: 1, format: "choice", prompt: "Mealy状態図の枝『1/0』の意味は？", answer: "入力1で遷移し出力0", accepted: ["入力1のときその遷移を行い出力0を出す"], options: ["状態1から0", "入力1で遷移し出力0", "入力0で出力1", "1クロック後0"], formula: "X/Y", steps: ["前を入力、後を出力として読む。"], explanation: "枝の始終点が状態遷移。", diagram: "mealy", pages: [8, 9, 10] }),
];
export const DIGITAL_CIRCUIT_QUESTIONS: DigitalCircuitQuestion[] = QUESTION_SEEDS.map((seed) => ({
  ...seed, sourceRefs: seed.pages.map((page) => scopeRef(page)),
}));

const questionById = new Map(DIGITAL_CIRCUIT_QUESTIONS.map((question) => [question.id, question]));
function examQuestion(id: string, major: number, sub: number, points: number): DigitalCircuitExpectedQuestion {
  const question = questionById.get(id);
  if (!question) throw new Error("Unknown digital-circuit question " + id);
  return { ...question, major, sub, points };
}
const EXAM_VARIANTS = [
  ["dc-q-and-seq", "dc-q-or-seq", "dc-q-sr-seq", "dc-q-sr-forbid", "dc-q-d-seq", "dc-q-reg-seq", "dc-q-reg-explain", "dc-q-count-sync-inputs", "dc-q-count-div", "dc-q-count-ripple", "dc-q-analysis", "dc-q-label"],
  ["dc-q-timing-step", "dc-q-and-value", "dc-q-sr-set", "dc-q-sr-forbid", "dc-q-jk-seq", "dc-q-reg-value", "dc-q-reg-hold", "dc-q-count-sync-seq", "dc-q-count-down", "dc-q-count-ripple", "dc-q-mealy", "dc-q-analysis"],
  ["dc-q-and-seq", "dc-q-timing-step", "dc-q-sr-hold", "dc-q-sr-seq", "dc-q-d-seq", "dc-q-reg-seq", "dc-q-reg-hold", "dc-q-count-sync-inputs", "dc-q-count-states", "dc-q-count-ripple", "dc-q-next", "dc-q-label"],
  ["dc-q-or-seq", "dc-q-and-value", "dc-q-sr-forbid", "dc-q-sr-set", "dc-q-jk-seq", "dc-q-reg-explain", "dc-q-reg-value", "dc-q-count-sync-seq", "dc-q-count-div", "dc-q-count-ripple", "dc-q-next", "dc-q-analysis"],
  ["dc-q-and-seq", "dc-q-or-seq", "dc-q-sr-seq", "dc-q-sr-forbid", "dc-q-d-value", "dc-q-reg-seq", "dc-q-reg-explain", "dc-q-count-sync-inputs", "dc-q-count-down", "dc-q-count-ripple", "dc-q-moore", "dc-q-next"],
  ["dc-q-timing-step", "dc-q-or-seq", "dc-q-sr-set", "dc-q-sr-forbid", "dc-q-jk-seq", "dc-q-reg-hold", "dc-q-reg-seq", "dc-q-count-sync-seq", "dc-q-count-states", "dc-q-count-ripple", "dc-q-analysis", "dc-q-label"],
] as const;
const SECTION_BLUEPRINT = [
  { title: "論理ゲートとタイミングチャート", points: 15, count: 2, topics: ["logic-timing"] as DigitalCircuitTopicId[], context: "入力変化点で区間を分け、真理値表と対応する出力を示しなさい。" },
  { title: "ラッチとフリップフロップ", points: 20, count: 3, topics: ["latches", "flipflops"] as DigitalCircuitTopicId[], context: "保持・セット・リセット・反転を区別しなさい。" },
  { title: "並列レジスタ", points: 15, count: 2, topics: ["registers"] as DigitalCircuitTopicId[], context: "共通クロックの正エッジで入力を取り込むものとする。" },
  { title: "同期／非同期カウンタ", points: 20, count: 3, topics: ["counters"] as DigitalCircuitTopicId[], context: "同期回路は共通CLKと各段の桁上がり条件、非同期回路は前段出力と伝搬順序を区別しなさい。" },
  { title: "順序回路の解析と状態遷移", points: 30, count: 2, topics: ["state-machines"] as DigitalCircuitTopicId[], context: "次状態式・出力式から状態表と状態図を作りなさい。" },
] as const;
function buildExpectedExam(index: number): DigitalCircuitExpectedExam {
  const ids = [...EXAM_VARIANTS[index]];
  let cursor = 0;
  const sections = SECTION_BLUEPRINT.map((blueprint, sectionIndex) => {
    const idsForSection = ids.slice(cursor, cursor + blueprint.count);
    cursor += blueprint.count;
    const basePoints = Math.floor(blueprint.points / blueprint.count);
    const questions = idsForSection.map((id, questionIndex) => examQuestion(
      id, sectionIndex + 1, questionIndex + 1,
      questionIndex === idsForSection.length - 1 ? blueprint.points - basePoints * (blueprint.count - 1) : basePoints,
    ));
    return { number: sectionIndex + 1, title: blueprint.title, points: blueprint.points, context: blueprint.context, topicIds: [...blueprint.topics], questions };
  });
  return {
    id: "dc-expected-" + (index + 1), number: index + 1,
    title: "デジタル回路 予想試験 " + (index + 1),
    subtitle: "現行範囲を均等に使う A4・練習初期値50分・100点換算",
    defaultMinutes: 50, userAdjustable: true, officialMinutes: null,
    totalPoints: 100, passPercent: 60, paper: "A4 portrait", sections,
  };
}
export const DIGITAL_CIRCUIT_EXPECTED_EXAMS = EXAM_VARIANTS.map((_, index) => buildExpectedExam(index));
export const DIGITAL_CIRCUIT_EXAM_FORMATS = [
  { id: "timing", title: "タイミングチャート完成", description: "入力波形からゲート・FF・カウンタ出力を描く。", strategy: "変化点→区間値→波形。" },
  { id: "table", title: "真理値表・状態表完成", description: "全入力と現在状態を列挙し次状態と出力を埋める。", strategy: "入力組合せを飛ばさない。" },
  { id: "circuit", title: "回路図から式を導出", description: "各FFへ番号を付け次状態式と出力式を読む。", strategy: "配線を一段ずつ追う。" },
  { id: "state", title: "状態遷移図", description: "状態表を入力／出力ラベル付き矢印へ変換する。", strategy: "Mealyは枝、Mooreは状態内。" },
] as const;
