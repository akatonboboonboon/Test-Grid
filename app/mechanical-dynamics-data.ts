export type MechanicalDynamicsTopicId =
  | "undamped"
  | "stiffness"
  | "laplace"
  | "damping"
  | "decrement"
  | "rotational";

export type MechanicalDynamicsQuestionFormat =
  | "number"
  | "choice"
  | "text"
  | "diagram"
  | "derivation";

export type MechanicalDynamicsSourceRef =
  | {
      kind: "range-zip";
      page: number;
      filename: string;
      note?: string;
    }
  | {
      kind: "actual-exam";
      page: 1;
      question: 1 | 2 | 3 | 4 | 5 | 6 | 7;
      major: 1 | 2 | 3 | 4 | 5 | 6 | 7;
      sub?: number;
      filename: "機械力学過去問.pdf";
      note?: string;
    };

export type MechanicalDynamicsTopic = {
  id: MechanicalDynamicsTopicId;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  pages: number[];
  color: string;
};

export type MechanicalDynamicsRangePage = {
  number: number;
  filename: string;
  topics: MechanicalDynamicsTopicId[];
  summary: string;
  uncertainty?: string;
  orientation?: "portrait-source" | "landscape-sideways-source";
};

export type MechanicalDynamicsDiagramKind = "spring-network" | "pinned-beam" | "simple-pendulum" | "single-spring-mass" | "damped-spring-mass" | "static-deflection" | "amplitude-decay" | "cantilever-mass" | "spring-rigid-rod";

export type MechanicalDynamicsFormulaCard = {
  id: string;
  topic: MechanicalDynamicsTopicId;
  title: string;
  prompt: string;
  formula: string;
  explanation: string;
  cue: string;
  example?: string;
  diagram?: MechanicalDynamicsDiagramKind;
  sourceRefs: MechanicalDynamicsSourceRef[];
};

export type MechanicalDynamicsQuestion = {
  id: string;
  topic: MechanicalDynamicsTopicId;
  topicId: MechanicalDynamicsTopicId;
  genre: string;
  difficulty: 1 | 2 | 3;
  format: MechanicalDynamicsQuestionFormat;
  prompt: string;
  context?: string;
  answer: string;
  numericAnswer?: number;
  expectedUnit?: string;
  acceptedUnits?: Record<string, number>;
  requiresUnit?: boolean;
  tolerance?: number;
  options?: string[];
  accepted?: string[];
  keywords?: string[];
  minKeywords?: number;
  formula?: string;
  printedFormula?: string;
  steps: string[];
  explanation: string;
  diagram?: MechanicalDynamicsDiagramKind;
  sourceRefs: MechanicalDynamicsSourceRef[];
};

export type MechanicalDynamicsExamQuestion = MechanicalDynamicsQuestion & {
  major: number;
  sub: number;
  points: number;
};

export type MechanicalDynamicsExamSection = {
  number: number;
  title: string;
  topic: MechanicalDynamicsTopicId;
  topicIds: MechanicalDynamicsTopicId[];
  points: number;
  context: string;
  questions: MechanicalDynamicsExamQuestion[];
};

export type MechanicalDynamicsExam = {
  id: string;
  kind: "actual" | "expected";
  number: number;
  title: string;
  subtitle: string;
  variant?: number;
  defaultMinutes: 50;
  userAdjustable: true;
  officialMinutes: null;
  totalPoints: 100;
  scoreLabel: string;
  passPercent: 60;
  paper: "A4 portrait";
  officialConditionsNote: string;
  sections: MechanicalDynamicsExamSection[];
  questions: MechanicalDynamicsExamQuestion[];
};

const RANGE_FILENAMES = [
  "PXL_20260717_011325483.jpg",
  "PXL_20260717_011331987.jpg",
  "PXL_20260717_011334535.jpg",
  "PXL_20260717_011338797.jpg",
  "PXL_20260717_011341146.jpg",
  "PXL_20260717_011346093.jpg",
  "PXL_20260717_011347920.jpg",
  "PXL_20260717_011352529.MP.jpg",
  "PXL_20260717_011354250.jpg",
  "PXL_20260717_011400338.jpg",
  "PXL_20260717_011402152.jpg",
  "PXL_20260717_011405707.jpg",
  "PXL_20260717_011439729.jpg",
  "PXL_20260717_011446428.jpg",
  "PXL_20260717_011459482.jpg",
] as const;

function rangeRef(page: number, note?: string): MechanicalDynamicsSourceRef {
  const filename = RANGE_FILENAMES[page - 1];
  if (!filename) throw new Error("Unknown mechanical-dynamics range page " + page);
  return { kind: "range-zip", page, filename, note };
}

function actualRef(
  question: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  sub?: number,
  note?: string,
): MechanicalDynamicsSourceRef {
  return {
    kind: "actual-exam",
    page: 1,
    question,
    major: question,
    sub,
    filename: "機械力学過去問.pdf",
    note,
  };
}

export const MECHANICAL_DYNAMICS_RANGE_PAGES: MechanicalDynamicsRangePage[] = [
  { number: 1, filename: RANGE_FILENAMES[0], topics: ["undamped"], summary: "ばね質量系の自由振動、運動方程式、固有角振動数、特性方程式と一般解。", orientation: "portrait-source" },
  { number: 2, filename: RANGE_FILENAMES[1], topics: ["undamped"], summary: "初期変位・初期速度から定数、振幅、位相、固有振動数と周期を求める。", orientation: "portrait-source" },
  { number: 3, filename: RANGE_FILENAMES[2], topics: ["undamped", "rotational"], summary: "正弦波の周期と回転体・プーリ系を等価な回転1自由度系へ置き換える。", uncertainty: "中央の複合回転体の寸法記号は一部薄いため、一般式を採用する。", orientation: "portrait-source" },
  { number: 4, filename: RANGE_FILENAMES[3], topics: ["stiffness", "rotational"], summary: "浮力による復元力、剛体振り子の慣性モーメント、はりの等価ばね定数。", uncertainty: "剛体振り子の個別寸法は薄いため、慣性モーメントの平行軸成分を中心に扱う。", orientation: "portrait-source" },
  { number: 5, filename: RANGE_FILENAMES[4], topics: ["stiffness"], summary: "U字管液柱の固有振動、直列・並列ばね、複合ばねの等価剛性。", orientation: "portrait-source" },
  { number: 6, filename: RANGE_FILENAMES[5], topics: ["damping"], summary: "粘性減衰自由振動の運動方程式、特性根、判別式、臨界減衰係数。", orientation: "portrait-source" },
  { number: 7, filename: RANGE_FILENAMES[6], topics: ["damping"], summary: "減衰比で正規化した方程式と、過減衰・臨界減衰・不足減衰の3分類。", orientation: "portrait-source" },
  { number: 8, filename: RANGE_FILENAMES[7], topics: ["laplace"], summary: "インパルス・ステップ入力、伝達関数、逆ラプラス変換、部分分数分解。", orientation: "portrait-source" },
  { number: 9, filename: RANGE_FILENAMES[8], topics: ["laplace"], summary: "異なる極と重根を含む部分分数分解、逆ラプラス変換の練習。", orientation: "portrait-source" },
  { number: 10, filename: RANGE_FILENAMES[9], topics: ["damping"], summary: "不足減衰解の初期条件、減衰固有角振動数、振幅位相形式。", orientation: "landscape-sideways-source" },
  { number: 11, filename: RANGE_FILENAMES[10], topics: ["damping", "decrement"], summary: "不足減衰振幅・位相、減衰周期、隣接ピークから対数減衰率を求める。", orientation: "landscape-sideways-source" },
  { number: 12, filename: RANGE_FILENAMES[11], topics: ["decrement"], summary: "振幅100 mmから80 mmへ減少する例と簡略式による減衰比。", orientation: "landscape-sideways-source" },
  { number: 13, filename: RANGE_FILENAMES[12], topics: ["damping", "decrement"], summary: "減衰自由振動の確認演習1〜6。減衰比、臨界減衰、油中振動まで。", orientation: "landscape-sideways-source" },
  { number: 14, filename: RANGE_FILENAMES[13], topics: ["damping", "decrement"], summary: "実験波形と演習7〜12。周期、角振動数、対数減衰率、ばね定数。", orientation: "landscape-sideways-source" },
  { number: 15, filename: RANGE_FILENAMES[14], topics: ["rotational"], summary: "倒立振り子、複合振り子、ねじり円板、ばね付き剛体棒、レバー減衰系。", orientation: "landscape-sideways-source" },
];

export const MECHANICAL_DYNAMICS_TOPICS: MechanicalDynamicsTopic[] = [
  { id: "undamped", number: "01", title: "非減衰1自由度系", shortTitle: "自由振動", description: "運動方程式、固有角振動数、一般解、初期条件、周期を扱う。", pages: [1, 2, 3], color: "#63d8cb" },
  { id: "stiffness", number: "02", title: "等価剛性とモデル化", shortTitle: "等価剛性", description: "直列・並列ばね、はり、浮力、U字管を等価ばねへ置き換える。", pages: [4, 5], color: "#70a8ff" },
  { id: "laplace", number: "03", title: "ラプラス変換と部分分数", shortTitle: "ラプラス", description: "インパルス・ステップ応答、伝達関数、逆変換を扱う。", pages: [8, 9], color: "#a68bff" },
  { id: "damping", number: "04", title: "粘性減衰自由振動", shortTitle: "減衰自由振動", description: "減衰比、臨界減衰、3つの応答、減衰固有角振動数を扱う。", pages: [6, 7, 10, 11, 13, 14], color: "#ff8eb6" },
  { id: "decrement", number: "05", title: "対数減衰率と実験波形", shortTitle: "対数減衰", description: "ピーク比、n周期後の振幅、実験波形から減衰比を推定する。", pages: [11, 12, 13, 14], color: "#ffd05d" },
  { id: "rotational", number: "06", title: "振り子・回転1自由度系", shortTitle: "回転・振り子", description: "慣性モーメント、倒立振り子、剛体棒、レバー系を扱う。", pages: [3, 4, 15], color: "#7de19a" },
];

type FormulaSeed = Omit<MechanicalDynamicsFormulaCard, "sourceRefs"> & { pages: number[] };

const FORMULA_SEEDS: FormulaSeed[] = [
  { id: "md-f-motion", topic: "undamped", title: "非減衰の運動方程式", prompt: "ばね質量系のつり合いは？", formula: "m\\ddot{x}+kx=0", explanation: "慣性力とばね復元力の和が0になる。", cue: "質量×加速度＋ばね力", pages: [1] },
  { id: "md-f-wn", topic: "undamped", title: "固有角振動数", prompt: "質量m、剛性kの固有角振動数は？", formula: "\\omega_n=\\sqrt{\\frac{k}{m}}", explanation: "運動方程式をmで割り、xの係数を角振動数の二乗と見る。", cue: "\\(\\sqrt{\\frac{k}{m}}\\)", example: "\\(m=2,\\ k=8000\\Rightarrow\\omega_n=63.2\\ \\mathrm{rad/s}\\)", pages: [1, 2] },
  { id: "md-f-characteristic", topic: "undamped", title: "非減衰の特性根", prompt: "特性方程式と根は？", formula: "\\lambda^2+\\omega_n^2=0,\\quad\\lambda=\\pm j\\omega_n", explanation: "指数解を代入すると純虚数の共役根となる。", cue: "減衰なし→実部0", pages: [1] },
  { id: "md-f-general", topic: "undamped", title: "一般解", prompt: "非減衰自由振動の一般解は？", formula: "x=C_1\\cos\\omega_nt+C_2\\sin\\omega_nt", explanation: "2つの独立な調和関数の線形結合。", cue: "cosとsin", pages: [1, 2] },
  { id: "md-f-initial", topic: "undamped", title: "初期条件を入れた解", prompt: "x(0)=x_0、速度v_0なら？", formula: "x=x_0\\cos\\omega_nt+\\frac{v_0}{\\omega_n}\\sin\\omega_nt", explanation: "\\(C_1=x_0,\\ C_2=\\frac{v_0}{\\omega_n}\\)を一般解へ代入する。", cue: "sinの係数は\\(\\frac{v_0}{\\omega_n}\\)", pages: [2] },
  { id: "md-f-amplitude", topic: "undamped", title: "振幅と位相", prompt: "初期条件から振幅Xと位相αを求める式は？", formula: "\\begin{aligned}X&=\\sqrt{x_0^2+\\left(\\frac{v_0}{\\omega_n}\\right)^2}\\\\ \\tan\\alpha&=\\frac{v_0}{\\omega_nx_0}\\end{aligned}", explanation: "直交するcos係数とsin係数を合成する。", cue: "係数を直角三角形にする", pages: [2, 3] },
  { id: "md-f-frequency", topic: "undamped", title: "周波数と周期", prompt: "ωnからfnとTnへ変換する式は？", formula: "\\begin{aligned}f_n&=\\frac{\\omega_n}{2\\pi}\\\\ T_n&=\\frac{1}{f_n}=\\frac{2\\pi}{\\omega_n}\\end{aligned}", explanation: "1回転は2π radである。", cue: "ω÷2π、周期は逆数", pages: [2, 3] },

  { id: "md-f-parallel", topic: "stiffness", title: "並列ばね", prompt: "並列接続の等価ばね定数は？", formula: "k_{\\mathrm{eq}}=k_1+k_2+\\cdots", explanation: "変位が共通で、力が加算される。", cue: "並列は足す", pages: [5] },
  { id: "md-f-series", topic: "stiffness", title: "直列ばね", prompt: "2本の直列ばねの等価ばね定数は？", formula: "k_{\\mathrm{eq}}=\\frac{k_1k_2}{k_1+k_2}", explanation: "力が共通で、伸びが加算される。", cue: "逆数を足す", pages: [5] },
  { id: "md-f-composite", topic: "stiffness", title: "直列と並列の複合", prompt: "k1と、並列(k2+k3)が直列なら？", formula: "k_{\\mathrm{eq}}=\\frac{k_1(k_2+k_3)}{k_1+k_2+k_3}", explanation: "先に並列部分をまとめ、直列式へ入れる。", cue: "内側から簡単化", pages: [5] },
  { id: "md-f-cantilever", topic: "stiffness", title: "片持ちはり先端の等価剛性", prompt: "先端荷重P、長さlの片持ちはりは？", formula: "\\begin{aligned}\\delta&=\\frac{Pl^3}{3EI}\\\\ k&=\\frac{3EI}{l^3}\\end{aligned}", explanation: "静たわみ\\(\\delta=\\frac{P}{k}\\)から等価剛性を得る。", cue: "片持ち先端は\\(\\frac{3EI}{l^3}\\)", pages: [4] },
  { id: "md-f-simple-beam", topic: "stiffness", title: "単純支持中央荷重のたわみ", prompt: "中央荷重Pなら最大たわみは？", formula: "\\delta=\\frac{Pl^3}{48EI}", explanation: "片持ちはりとは係数が異なる。", cue: "中央荷重は48", pages: [4] },
  { id: "md-f-utube", topic: "stiffness", title: "U字管液柱の固有角振動数", prompt: "液柱全長lのU字管は？", formula: "\\omega_n=\\sqrt{\\frac{2g}{l}}", explanation: "液面差2xが復元圧力を作り、k=2Aρg、m=Aρlとなる。", cue: "断面積と密度が消える", pages: [5] },
  { id: "md-f-buoyancy", topic: "stiffness", title: "浮力による等価剛性", prompt: "断面積Aの浮体が上下するときは？", formula: "\\begin{aligned}k_b&=\\rho Ag\\\\ \\omega_n&=\\sqrt{\\frac{\\rho Ag}{m}}\\end{aligned}", explanation: "沈み込みxで排除体積がAx増え、浮力がρAgx増える。", cue: "増えた体積×ρg", pages: [4] },

  { id: "md-f-impulse", topic: "laplace", title: "インパルスとステップ", prompt: "δ(t)と単位ステップのラプラス変換は？", formula: "\\begin{aligned}\\mathcal{L}\\{\\delta(t)\\}&=1\\\\ \\mathcal{L}\\{1\\}&=\\frac{1}{s}\\end{aligned}", explanation: "インパルス応答とステップ応答の基礎入力。", cue: "インパルス1、ステップ\\(\\frac{1}{s}\\)", pages: [8] },
  { id: "md-f-transfer", topic: "laplace", title: "伝達関数と出力", prompt: "入力U(s)、伝達関数G(s)なら出力は？", formula: "Y(s)=G(s)U(s)", explanation: "時間領域の畳み込みがs領域では積になる。", cue: "出力＝伝達関数×入力", pages: [8] },
  { id: "md-f-first-order", topic: "laplace", title: "一次遅れの逆変換", prompt: "\\(\\frac{1}{s+a}\\)の逆変換は？", formula: "\\mathcal{L}^{-1}\\left\\{\\frac{1}{s+a}\\right\\}=e^{-at}", explanation: "極s=-aが指数減衰率を決める。", cue: "s+a ↔ e^{-at}", pages: [8] },
  { id: "md-f-step-response", topic: "laplace", title: "一次遅れのステップ応答", prompt: "\\(G(s)=\\frac{1}{s+1}\\)へ単位ステップを入れると？", formula: "\\begin{aligned}Y(s)&=\\frac{1}{s(s+1)}=\\frac{1}{s}-\\frac{1}{s+1}\\\\ y(t)&=1-e^{-t}\\end{aligned}", explanation: "部分分数に分けて項別に逆変換する。", cue: "最終値1へ上昇", pages: [8] },
  { id: "md-f-repeated-pole", topic: "laplace", title: "重根の逆変換", prompt: "\\(\\frac{1}{(s+a)^2}\\)の逆変換は？", formula: "\\mathcal{L}^{-1}\\left\\{\\frac{1}{(s+a)^2}\\right\\}=te^{-at}", explanation: "二重極は時間tの因子を伴う。", cue: "2乗ならtが付く", pages: [9] },
  { id: "md-f-coverup", topic: "laplace", title: "相異なる1次極の係数", prompt: "部分分数の係数を素早く求める方法は？", formula: "F(s)\\supset\\frac{A_i}{s-p_i},\\qquad A_i=\\lim_{s\\to p_i}(s-p_i)F(s)", explanation: "分母因子を \\(s-p_i\\) と書き、その因子を掛けて対応する極 \\(p_i\\) を代入する。", cue: "因子を消して極を代入", pages: [8, 9] },

  { id: "md-f-damped-motion", topic: "damping", title: "粘性減衰の運動方程式", prompt: "ばね・ダンパ・質量系の自由振動は？", formula: "m\\ddot{x}+c\\dot{x}+kx=0", explanation: "ダンパ力c xdotは速度と反対向きに働く。", cue: "慣性＋減衰＋ばね", pages: [6, 13] },
  { id: "md-f-c-unit", topic: "damping", title: "減衰係数の単位", prompt: "cのSI単位は？", formula: "[c]=\\mathrm{N\\,s/m}=\\mathrm{kg/s}", explanation: "c xdotが力Nになる単位。", cue: "力÷速度", pages: [6, 13] },
  { id: "md-f-damped-roots", topic: "damping", title: "減衰系の特性根", prompt: "mλ²+cλ+k=0の根は？", formula: "\\lambda=\\frac{-c\\pm\\sqrt{c^2-4mk}}{2m}", explanation: "判別式の符号で応答の形が決まる。", cue: "二次方程式", pages: [6] },
  { id: "md-f-critical", topic: "damping", title: "臨界減衰係数", prompt: "判別式が0になるcは？", formula: "c_c=2\\sqrt{mk}", explanation: "過減衰と不足減衰の境界。", cue: "2√mk", pages: [6, 13, 14] },
  { id: "md-f-zeta", topic: "damping", title: "減衰比", prompt: "減衰係数を無次元化すると？", formula: "\\zeta=\\frac{c}{2\\sqrt{mk}}=\\frac{c}{c_c}", explanation: "臨界減衰係数との比である。", cue: "c÷2√mk", pages: [7, 13] },
  { id: "md-f-normalized", topic: "damping", title: "減衰比による標準形", prompt: "運動方程式の標準形は？", formula: "\\ddot{x}+2\\zeta\\omega_n\\dot{x}+\\omega_n^2x=0", explanation: "\\(\\frac{c}{m}=2\\zeta\\omega_n,\\ \\frac{k}{m}=\\omega_n^2\\)を使う。", cue: "2ζωn", pages: [7, 13] },
  { id: "md-f-three-cases", topic: "damping", title: "減衰応答の3分類", prompt: "ζによる分類は？", formula: "\\zeta>1:\\text{過減衰},\\quad\\zeta=1:\\text{臨界減衰},\\quad0<\\zeta<1:\\text{不足減衰}", explanation: "特性根が実数2根、重根、複素共役根へ変わる。", cue: "1を境界に分類", pages: [7, 13] },
  { id: "md-f-wd", topic: "damping", title: "減衰固有角振動数", prompt: "不足減衰の振動角周波数は？", formula: "\\omega_d=\\omega_n\\sqrt{1-\\zeta^2}", explanation: "減衰により非減衰固有角振動数より少し小さくなる。", cue: "ωn×√(1-ζ²)", pages: [10, 11, 14] },
  { id: "md-f-underdamped", topic: "damping", title: "不足減衰の応答", prompt: "0<ζ<1の自由振動解は？", formula: "x=e^{-\\zeta\\omega_nt}\\left(C_1\\cos\\omega_dt+C_2\\sin\\omega_dt\\right)", explanation: "指数包絡線の中で減衰固有角振動数により振動する。", cue: "指数包絡×正弦波", pages: [7, 10] },
  { id: "md-f-damped-initial", topic: "damping", title: "不足減衰の初期条件定数", prompt: "x0、v0からC1、C2は？", formula: "C_1=x_0,\\quad C_2=\\frac{v_0+\\zeta\\omega_nx_0}{\\omega_d}", explanation: "t=0で変位と速度を代入する。", cue: "C2の分子に減衰項", pages: [10] },

  { id: "md-f-logdec", topic: "decrement", title: "対数減衰率", prompt: "隣接する同符号ピークx_i、x_{i+1}からδは？", formula: "\\delta=\\ln\\frac{x_i}{x_{i+1}}=\\frac{2\\pi\\zeta}{\\sqrt{1-\\zeta^2}}", explanation: "1周期の指数包絡線の減少量を対数で測る。", cue: "ピーク比の自然対数", pages: [11, 13] },
  { id: "md-f-logdec-n", topic: "decrement", title: "n周期離れたピーク", prompt: "n周期後のピークなら？", formula: "\\delta=\\frac{1}{n}\\ln\\frac{x_i}{x_{i+n}}", explanation: "全減少の対数を周期数nで割る。", cue: "ln比÷周期数", pages: [13, 14] },
  { id: "md-f-zeta-exact", topic: "decrement", title: "δから減衰比（厳密式）", prompt: "対数減衰率δからζへ戻す式は？", formula: "\\zeta=\\frac{\\delta}{\\sqrt{4\\pi^2+\\delta^2}}", explanation: "\\(\\delta=\\frac{2\\pi\\zeta}{\\sqrt{1-\\zeta^2}}\\)を\\(\\zeta\\)について解く。", cue: "分母は4π²+δ²の平方根", pages: [11, 13] },
  { id: "md-f-zeta-approx", topic: "decrement", title: "小減衰の簡略式", prompt: "ζが小さいときの近似は？", formula: "\\delta\\simeq2\\pi\\zeta,\\quad\\zeta\\simeq\\frac{\\delta}{2\\pi}", explanation: "√(1-ζ²)≈1とみなす。", cue: "δ÷2π", pages: [11, 12, 13, 14] },
  { id: "md-f-peak-ratio", topic: "decrement", title: "隣接振幅比", prompt: "δから隣接ピーク比を求める式は？", formula: "\\frac{x_i}{x_{i+1}}=e^\\delta", explanation: "対数減衰率の定義を指数へ戻す。", cue: "比＝eのδ乗", pages: [11, 13, 14] },

  { id: "md-f-rotational", topic: "rotational", title: "回転1自由度系の標準形", prompt: "回転系の運動方程式と固有角振動数は？", formula: "\\begin{aligned}J\\ddot{\\theta}+C_\\theta\\dot{\\theta}+K_\\theta\\theta&=0\\\\ \\omega_n&=\\sqrt{\\frac{K_\\theta}{J}}\\end{aligned}", explanation: "並進のm、c、kを回転のJ、Cθ、Kθへ置き換える。", cue: "回転版のm-c-k", pages: [3, 15] },
  { id: "md-f-lever", topic: "rotational", title: "レバー系の換算", prompt: "質点mが腕l、ばねkがl1、ダンパcがl2なら？", formula: "\\begin{aligned}J&=ml^2\\\\ C_\\theta&=cl_2^2\\\\ K_\\theta&=kl_1^2\\end{aligned}", explanation: "微小変位は各作用腕×θとなり、モーメントで腕がもう1回掛かる。", cue: "各係数×腕の二乗", pages: [15] },
  { id: "md-f-disk", topic: "rotational", title: "円板のねじり振動", prompt: "質量m、半径Rの円板とねじりばねktなら？", formula: "\\begin{aligned}J&=\\frac12mR^2\\\\ \\omega_n&=\\sqrt{\\frac{2k_t}{mR^2}}\\end{aligned}", explanation: "円板中心軸まわりの慣性モーメントを使う。", cue: "円板\\(J=\\frac{1}{2}mR^2\\)", pages: [15] },
  { id: "md-f-inverted", topic: "rotational", title: "ばね付き倒立振り子", prompt: "質点mが高さl、ばね作用腕rなら？", formula: "\\omega_n=\\sqrt{\\frac{kr^2-mgl}{ml^2}}", explanation: "ばねは復元、重力は倒立姿勢を不安定化する。kr²>mglが安定条件。", cue: "ばね剛性−重力剛性", pages: [15] },
  { id: "md-f-rigid-rod", topic: "rotational", title: "ばね付き剛体棒", prompt: "上端支持の一様棒、ばね作用腕hなら？", formula: "\\omega_n=\\sqrt{\\frac{kh^2+\\frac{1}{2}mgl}{\\frac{1}{3}ml^2}}", explanation: "\\(J=\\frac{ml^2}{3}\\)、重心は支点から\\(\\frac{l}{2}\\)にある。", cue: "棒の\\(J\\)は\\(\\frac{ml^2}{3}\\)", pages: [15] },
  { id: "md-f-simple-pendulum", topic: "rotational", title: "単振り子", prompt: "長さlの単振り子の固有角振動数と周期は？", formula: "\\begin{aligned}\\omega_n&=\\sqrt{\\frac{g}{l}}\\\\ T&=2\\pi\\sqrt{\\frac{l}{g}}\\end{aligned}", explanation: "微小角近似sinθ≈θを使う。", cue: "長いほど周期が長い", pages: [4] },
  { id: "md-f-parallel-axis", topic: "rotational", title: "平行軸の定理", prompt: "重心まわりJGから距離dの軸へ移すと？", formula: "J_O=J_G+md^2", explanation: "複合振り子の慣性モーメントを支点まわりへ換算する。", cue: "重心J＋md²", pages: [4] },
];

function formulaDiagram(card: FormulaSeed): MechanicalDynamicsDiagramKind | undefined {
  if (card.topic === "undamped") return "single-spring-mass";
  if (card.topic === "damping") return "damped-spring-mass";
  if (card.topic === "decrement") return "amplitude-decay";
  if (card.id === "md-f-lever" || card.id === "md-f-rotational") return "pinned-beam";
  if (card.id === "md-f-simple-pendulum") return "simple-pendulum";
  return undefined;
}

export const MECHANICAL_DYNAMICS_FORMULAS: MechanicalDynamicsFormulaCard[] =
  FORMULA_SEEDS.map(({ pages, ...card }) => ({
    ...card,
    diagram: formulaDiagram({ ...card, pages }),
    sourceRefs: pages.map((page) => rangeRef(page)),
  }));

type QuestionSeed = Omit<MechanicalDynamicsQuestion, "topicId" | "sourceRefs"> & {
  pages: number[];
};

const MECHANICAL_STEP_MATH: Record<string, string> = {
  "X=|x0|": "\\(X=|x_0|\\)",
  "xst=0.00200 m": "\\(x_{st}=0.00200\\ \\mathrm m\\)",
  "100+250=350": "\\(100+250=350\\)",
  "k2+k3=300": "\\(k_2+k_3=300\\)",
  "k=750": "\\(k=750\\)",
  "\\sqrt{24.5}=4.95": "\\(\\sqrt{24.5}=4.95\\)",
  "ρAg=98.0 N/m": "\\(\\rho Ag=98.0\\ \\mathrm{N/m}\\)",
  "a=3を読む": "\\(a=3\\)を読む",
  "0<ζ<1": "\\(0<\\zeta<1\\)",
  "δ=0.223": "\\(\\delta=0.223\\)",
  "e^0.357=1.429": "\\(e^{0.357}=1.429\\)",
  "分母√(1−0.477²)=0.879": "分母は\\(\\sqrt{1-0.477^2}=0.879\\)",
  "分子=2×3.14×0.477": "分子は\\(2\\times3.14\\times0.477\\)",
  "δ≈3.41": "\\(\\delta\\simeq3.41\\)",
  "mR²=1.00": "\\(mR^2=1.00\\)",
  "√100=10": "\\(\\sqrt{100}=10\\)",
  "速度v=lθdot": "速度は\\(v=l\\dot\\theta\\)",
  "積=30.98": "積は\\(30.98\\)",
  "Cθ=cl2²": "\\(C_\\theta=cl_2^2\\)",
  "J=ml²、Kθ=kl1²": "\\(J=ml^2,\\quad K_\\theta=kl_1^2\\)",
  "l=0.993955": "\\(l=0.993955\\)",
  "md²=3×0.16=0.48": "\\(md^2=3\\times0.16=0.48\\)",
  "0.20+0.48=0.68": "\\(0.20+0.48=0.68\\)",
  "k=500000 N/m": "\\(k=500000\\ \\mathrm{N/m}\\)",
  "2√(50×500000)=10000": "\\(2\\sqrt{50\\times500000}=10000\\)",
  "100√(1−0.001²)=99.99995": "\\(100\\sqrt{1-0.001^2}=99.99995\\)",
  "60%減少→残り40%=0.400xi": "60%減少なので、残りは\\(40\\%=0.400x_i\\)",
  "ζ=0.01459": "\\(\\zeta=0.01459\\)",
  "上側：2k+k=3k": "上側：\\(2k+k=3k\\)",
  "J=mr²": "\\(J=mr^2\\)",
  "Cθ=cr²": "\\(C_\\theta=cr^2\\)",
  "Kθ=kl²": "\\(K_\\theta=kl^2\\)",
  "2√(JKθ)=2√(mr²kl²)=2rl√(mk)": "\\(2\\sqrt{JK_\\theta}=2\\sqrt{mr^2kl^2}=2rl\\sqrt{mk}\\)",
  "r=0.50596 m": "\\(r=0.50596\\ \\mathrm m\\)",
  "l=0.993955→0.994 m": "\\(l=0.993955\\rightarrow0.994\\ \\mathrm m\\)",
  "cを2√(mk)で割り、ζを得る": "\\(c\\)を\\(2\\sqrt{mk}\\)で割り、\\(\\zeta\\)を得る",
  "ωn√(1−ζ²)": "\\(\\omega_n\\sqrt{1-\\zeta^2}\\)",
  "√(1−ζ²)をωnへ掛ける": "\\(\\sqrt{1-\\zeta^2}\\)を\\(\\omega_n\\)へ掛ける",
  "ζ=1としてrを解く": "\\(\\zeta=1\\)として\\(r\\)を解く",
};

function formatMechanicalSteps(steps: string[]): string[] {
  return steps.map((step) => MECHANICAL_STEP_MATH[step] ?? step);
}

function question(seed: QuestionSeed): MechanicalDynamicsQuestion {
  const { pages, ...rest } = seed;
  const inferredDiagram: MechanicalDynamicsDiagramKind | undefined =
    rest.id === "md-q-u7" ? "static-deflection"
      : /^md-q-u[1-6]$/.test(rest.id) ? "single-spring-mass"
        : /^md-q-d[1-6]$/.test(rest.id) ? "damped-spring-mass"
          : undefined;
  return {
    ...rest,
    steps: formatMechanicalSteps(rest.steps),
    diagram: rest.diagram ?? inferredDiagram,
    topicId: rest.topic,
    sourceRefs: pages.map((page) => rangeRef(page)),
  };
}

const units = {
  angular: { "rad/s": 1, "rad・s^-1": 1, "s^-1": 1 },
  hertz: { Hz: 1, "s^-1": 1 },
  seconds: { s: 1, sec: 1 },
  stiffness: { "N/m": 1, "kN/m": 1000 },
  damping: { "N s/m": 1, "Ns/m": 1, "N·s/m": 1, "N・s/m": 1, "kg/s": 1 },
} as const;

export const MECHANICAL_DYNAMICS_QUESTIONS: MechanicalDynamicsQuestion[] = [
  question({ id: "md-q-u1", topic: "undamped", genre: "固有角振動数", difficulty: 1, format: "number", prompt: "m=2.00 kg、k=8000 N/mの固有角振動数を求めよ。", answer: "63.2 rad/s", numericAnswer: 63.2456, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.1, formula: "\\omega_n=\\sqrt{\\frac{k}{m}}", steps: ["\\(\\frac{8000}{2}=4000\\)", "\\(\\sqrt{4000}=63.2456\\)"], explanation: "質量と剛性をSI単位のまま代入する。", pages: [1, 2] }),
  question({ id: "md-q-u2", topic: "undamped", genre: "固有振動数", difficulty: 1, format: "number", prompt: "ωn=62.8 rad/sのとき、π=3.14として固有振動数を求めよ。", answer: "10.0 Hz", numericAnswer: 10, expectedUnit: "Hz", acceptedUnits: units.hertz, requiresUnit: true, tolerance: 0.01, formula: "f_n=\\frac{\\omega_n}{2\\pi}", steps: ["\\(\\frac{62.8}{2\\times3.14}=10.0\\)"], explanation: "角振動数を1回転2π radで割る。", pages: [2, 3] }),
  question({ id: "md-q-u3", topic: "undamped", genre: "周期", difficulty: 1, format: "number", prompt: "fn=5.00 Hzの周期を求めよ。", answer: "0.200 s", numericAnswer: 0.2, expectedUnit: "s", acceptedUnits: units.seconds, requiresUnit: true, tolerance: 0.001, formula: "T_n=\\frac{1}{f_n}", steps: ["\\(\\frac{1}{5.00}=0.200\\)"], explanation: "周期は1秒あたりの振動回数の逆数。", pages: [2, 3] }),
  question({ id: "md-q-u4", topic: "undamped", genre: "初期条件", difficulty: 2, format: "number", prompt: "x0=0.030 m、v0=0、ωn=20 rad/sの振幅を求めよ。", answer: "0.030 m", numericAnswer: 0.03, expectedUnit: "m", acceptedUnits: { m: 1, mm: 0.001 }, requiresUnit: true, tolerance: 0.0001, formula: "X=\\sqrt{x_0^2+\\left(\\frac{v_0}{\\omega_n}\\right)^2}", steps: ["速度項は0", "X=|x0|"], explanation: "静かに離す場合、初期変位がそのまま振幅になる。", pages: [2] }),
  question({ id: "md-q-u5", topic: "undamped", genre: "初期条件", difficulty: 2, format: "number", prompt: "x0=0、v0=0.60 m/s、ωn=20 rad/sの振幅を求めよ。", answer: "0.030 m", numericAnswer: 0.03, expectedUnit: "m", acceptedUnits: { m: 1, mm: 0.001 }, requiresUnit: true, tolerance: 0.0001, formula: "X=\\frac{|v_0|}{\\omega_n}", steps: ["\\(\\frac{0.60}{20}=0.030\\)"], explanation: "平衡位置から初速度だけを与えた場合。", pages: [2] }),
  question({ id: "md-q-u6", topic: "undamped", genre: "一般解", difficulty: 1, format: "choice", prompt: "m x¨+kx=0の一般解として正しいものを選べ。", answer: "x=C1 cos(ωnt)+C2 sin(ωnt)", options: ["x=C1 cos(ωnt)+C2 sin(ωnt)", "x=C1e^{ωnt}", "x=C1t+C2", "\\(x=C_1e^{-\\frac{k}{m}t}\\)"], steps: ["特性根は±jωn", "実数解はcosとsin"], explanation: "非減衰系は振幅が指数減衰しない。", pages: [1] }),
  question({ id: "md-q-u7", topic: "undamped", genre: "静たわみ", difficulty: 2, format: "number", prompt: "重力による静たわみが2.00 mmの鉛直ばね系で、g=9.80 m/s²とする。固有角振動数を求めよ。", answer: "70.0 rad/s", numericAnswer: 70, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.1, formula: "\\omega_n=\\sqrt{\\frac{g}{x_{st}}}", steps: ["xst=0.00200 m", "\\(\\sqrt{\\frac{9.80}{0.00200}}=70.0\\)"], explanation: "\\(mg=kx_{st}\\)より\\(\\frac{k}{m}=\\frac{g}{x_{st}}\\)。", pages: [1, 4] }),

  question({ id: "md-q-s1", topic: "stiffness", genre: "並列ばね", difficulty: 1, format: "number", prompt: "100 N/mと250 N/mのばねを並列にした等価剛性を求めよ。", answer: "350 N/m", numericAnswer: 350, expectedUnit: "N/m", acceptedUnits: units.stiffness, requiresUnit: true, tolerance: 0.1, formula: "k_{eq}=k_1+k_2", steps: ["100+250=350"], explanation: "並列では同じ変位に対する力が加算される。", pages: [5] }),
  question({ id: "md-q-s2", topic: "stiffness", genre: "直列ばね", difficulty: 1, format: "number", prompt: "100 N/mと300 N/mのばねを直列にした等価剛性を求めよ。", answer: "75.0 N/m", numericAnswer: 75, expectedUnit: "N/m", acceptedUnits: units.stiffness, requiresUnit: true, tolerance: 0.1, formula: "k_{eq}=\\frac{k_1k_2}{k_1+k_2}", steps: ["\\(\\frac{100\\times300}{100+300}=75\\)"], explanation: "直列では伸びが加算されるため、柔らかい方よりさらに小さくなる。", pages: [5] }),
  question({ id: "md-q-s3", topic: "stiffness", genre: "複合ばね", difficulty: 2, format: "number", prompt: "k1=300 N/mが、並列ばねk2=200 N/m、k3=100 N/mと直列である。等価剛性を求めよ。", answer: "150 N/m", numericAnswer: 150, expectedUnit: "N/m", acceptedUnits: units.stiffness, requiresUnit: true, tolerance: 0.1, formula: "k_{eq}=\\frac{k_1(k_2+k_3)}{k_1+k_2+k_3}", steps: ["k2+k3=300", "\\(\\frac{300\\times300}{600}=150\\)"], explanation: "並列部分を先にまとめる。", pages: [5] }),
  question({ id: "md-q-s4", topic: "stiffness", genre: "片持ちはり", difficulty: 2, format: "number", prompt: "EI=2000 N·m²、l=2.00 mの片持ちはり先端の等価剛性を求めよ。", answer: "750 N/m", numericAnswer: 750, expectedUnit: "N/m", acceptedUnits: units.stiffness, requiresUnit: true, tolerance: 1, formula: "k=\\frac{3EI}{l^3}", steps: ["\\(\\frac{3\\times2000}{2^3}=\\frac{6000}{8}\\)", "k=750"], explanation: "先端集中荷重のたわみ式を使う。", pages: [4] }),
  question({ id: "md-q-s5", topic: "stiffness", genre: "U字管", difficulty: 2, format: "number", prompt: "液柱全長l=0.800 m、g=9.80 m/s²のU字管の固有角振動数を求めよ。", answer: "4.95 rad/s", numericAnswer: 4.9497, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.02, formula: "\\omega_n=\\sqrt{\\frac{2g}{l}}", steps: ["\\(\\frac{2\\times9.80}{0.800}=24.5\\)", "\\sqrt{24.5}=4.95"], explanation: "断面積と密度は慣性と復元力の両方に含まれ相殺される。", pages: [5] }),
  question({ id: "md-q-s6", topic: "stiffness", genre: "浮力", difficulty: 2, format: "number", prompt: "水中の浮体でρ=1000 kg/m³、A=0.0100 m²、m=5.00 kg、g=9.80 m/s²とする。上下振動の固有角振動数を求めよ。", answer: "4.43 rad/s", numericAnswer: 4.427, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.02, formula: "\\omega_n=\\sqrt{\\frac{\\rho Ag}{m}}", steps: ["ρAg=98.0 N/m", "\\(\\sqrt{\\frac{98}{5}}=4.43\\)"], explanation: "沈み込みに比例して浮力が増える。", pages: [4] }),
  question({ id: "md-q-s7", topic: "stiffness", genre: "式の導出", difficulty: 2, format: "derivation", prompt: "上側に2kとkの並列、下側にkとkの直列が質量mへ接続される。ωnを導出せよ。", answer: "\\(\\omega_n=\\sqrt{\\frac{7k}{2m}}\\)", accepted: ["sqrt(7k/(2m))", "√(7k/2m)"], keywords: ["7k", "2m"], minKeywords: 2, formula: "\\omega_n=\\sqrt{\\frac{k_{eq}}{m}}", steps: ["上側は3k", "下側は\\(\\frac{k}{2}\\)", "\\(k_{eq}=3k+\\frac{k}{2}=\\frac{7k}{2}\\)", "\\(\\omega_n=\\sqrt{\\frac{k_{eq}}{m}}\\)"], explanation: "質量から見て両側の復元力は加算される。", diagram: "spring-network", pages: [5] }),

  question({ id: "md-q-l1", topic: "laplace", genre: "基本変換", difficulty: 1, format: "choice", prompt: "単位ステップ1のラプラス変換を選べ。", answer: "\\(\\frac{1}{s}\\)", options: ["\\(\\frac{1}{s}\\)", "1", "s", "e^{-s}"], steps: ["\\(\\int_0^\\infty e^{-st}\\,dt=\\frac{1}{s}\\)"], explanation: "インパルス\\(\\delta(t)\\)は1、単位ステップは\\(\\frac{1}{s}\\)。", pages: [8] }),
  question({ id: "md-q-l2", topic: "laplace", genre: "一次遅れ", difficulty: 1, format: "text", prompt: "\\(\\frac{1}{s+3}\\)を逆ラプラス変換せよ。", answer: "\\(e^{-3t}\\)", accepted: ["e^-3t", "e^{-3t}"], keywords: ["-3t"], minKeywords: 1, formula: "\\mathcal L^{-1}\\!\\left\\{\\frac{1}{s+a}\\right\\}=e^{-at}", steps: ["a=3を読む"], explanation: "極s=-3に対応する指数減衰。", pages: [8] }),
  question({ id: "md-q-l3", topic: "laplace", genre: "ステップ応答", difficulty: 2, format: "derivation", prompt: "\\(G(s)=\\frac{1}{s+1}\\)へ単位ステップを入力した応答\\(y(t)\\)を求めよ。", answer: "\\(y(t)=1-e^{-t}\\)", accepted: ["1-e^-t", "1−e^{-t}"], keywords: ["1", "e", "-t"], minKeywords: 3, formula: "Y=\\frac{G}{s}", steps: ["\\(Y=\\frac{1}{s(s+1)}\\)", "\\(Y=\\frac{1}{s}-\\frac{1}{s+1}\\)", "逆変換"], explanation: "初期値0から最終値1へ近づく一次遅れ応答。", pages: [8] }),
  question({ id: "md-q-l4", topic: "laplace", genre: "部分分数", difficulty: 2, format: "derivation", prompt: "\\(\\frac{s+3}{s(s+1)(s+2)}\\)を部分分数分解せよ。", answer: "\\(\\frac{3}{2s}-\\frac{2}{s+1}+\\frac{1}{2(s+2)}\\)", accepted: ["3/(2s)-2/(s+1)+1/(2(s+2))"], keywords: ["3/2", "-2", "1/2"], minKeywords: 3, steps: ["\\(s=0\\)で\\(A=\\frac{3}{2}\\)", "\\(s=-1\\)で\\(B=-2\\)", "\\(s=-2\\)で\\(C=\\frac{1}{2}\\)"], explanation: "相異なる1次極なので代入法が使える。", pages: [9] }),
  question({ id: "md-q-l5", topic: "laplace", genre: "逆変換", difficulty: 2, format: "text", prompt: "\\(F(s)=\\frac{3}{2s}-\\frac{2}{s+1}+\\frac{1}{2(s+2)}\\) を逆ラプラス変換せよ。", answer: "\\(f(t)=\\frac{3}{2}-2e^{-t}+\\frac{1}{2}e^{-2t}\\)", accepted: ["3/2-2e^-t+1/2e^-2t"], keywords: ["3/2", "-2", "-2t"], minKeywords: 3, steps: ["各項を基本変換へ対応させる"], explanation: "定数項は\\(\\frac{1}{s}\\)、各\\(\\frac{1}{s+a}\\)は\\(e^{-at}\\)。", pages: [9] }),
  question({ id: "md-q-l6", topic: "laplace", genre: "重根", difficulty: 1, format: "choice", prompt: "\\(\\frac{1}{(s+2)^2}\\)の逆ラプラス変換を選べ。 ", answer: "t e^{-2t}", options: ["t e^{-2t}", "e^{-2t}", "2e^{-2t}", "t²e^{-2t}"], steps: ["二重極はtを伴う"], explanation: "\\(\\frac{1}{(s+a)^2}\\leftrightarrow te^{-at}\\)。", pages: [9] }),
  question({ id: "md-q-l7", topic: "laplace", genre: "伝達関数", difficulty: 1, format: "choice", prompt: "入力U(s)と伝達関数G(s)から出力Y(s)を表す式を選べ。", answer: "Y(s)=G(s)U(s)", options: ["Y(s)=G(s)U(s)", "Y(s)=G(s)+U(s)", "\\(Y(s)=\\frac{U(s)}{G(s)}\\)", "\\(Y(s)=\\frac{dG}{ds}\\)"], steps: ["伝達関数は\\(\\frac{\\text{出力}}{\\text{入力}}\\)"], explanation: "初期値0の線形系ではs領域で積となる。", pages: [8] }),

  question({ id: "md-q-d1", topic: "damping", genre: "運動方程式", difficulty: 1, format: "choice", prompt: "粘性減衰自由振動の運動方程式を選べ。", answer: "m x¨+c x˙+kx=0", options: ["m x¨+c x˙+kx=0", "m x¨+kx=F0", "c x¨+m x˙+kx=0", "m x¨−c x˙+kx=0"], steps: ["慣性、減衰、ばねの力を足す"], explanation: "外力のない自由振動なので右辺は0。", diagram: "damped-spring-mass", pages: [6, 13] }),
  question({ id: "md-q-d2", topic: "damping", genre: "減衰比", difficulty: 1, format: "number", prompt: "m=5.00 kg、k=40.0 N/m、c=13.5 N·s/mの減衰比を求めよ。", answer: "0.477", numericAnswer: 0.4773, tolerance: 0.001, formula: "\\zeta=\\frac{c}{2\\sqrt{mk}}", steps: ["\\(2\\sqrt{5\\times40}=28.284\\)", "\\(\\frac{13.5}{28.284}=0.477\\)"], explanation: "無次元量なので単位は付けない。", diagram: "damped-spring-mass", pages: [13] }),
  question({ id: "md-q-d3", topic: "damping", genre: "臨界減衰", difficulty: 1, format: "number", prompt: "m=5.00 kg、k=2000 N/mの臨界減衰係数を求めよ。", answer: "200 N·s/m", numericAnswer: 200, expectedUnit: "N s/m", acceptedUnits: units.damping, requiresUnit: true, tolerance: 0.5, formula: "c_c=2\\sqrt{mk}", steps: ["\\(2\\sqrt{5\\times2000}=200\\)"], explanation: "臨界減衰ではζ=1であり、c_cは速度に比例する抵抗力の係数なので単位はN·s/mとなる。", diagram: "damped-spring-mass", pages: [6, 14] }),
  question({ id: "md-q-d4", topic: "damping", genre: "応答分類", difficulty: 1, format: "choice", prompt: "ζ=0.30の自由振動応答を選べ。", answer: "不足減衰", options: ["不足減衰", "臨界減衰", "過減衰", "非減衰"], steps: ["0<ζ<1"], explanation: "複素共役根を持ち、振動しながら減衰する。", pages: [7, 13] }),
  question({ id: "md-q-d5", topic: "damping", genre: "減衰固有角振動数", difficulty: 2, format: "number", prompt: "ωn=20.0 rad/s、ζ=0.100のωdを求めよ。", answer: "19.9 rad/s", numericAnswer: 19.8997, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.05, formula: "\\omega_d=\\omega_n\\sqrt{1-\\zeta^2}", steps: ["\\(20\\sqrt{1-0.01}=19.8997\\)"], explanation: "小減衰ではωdはωnに近い。", pages: [10, 11, 14] }),
  question({ id: "md-q-d6", topic: "damping", genre: "初期条件", difficulty: 2, format: "number", prompt: "x0=0.020 m、v0=0、ωn=10 rad/s、ζ=0.10の不足減衰解でC2を求めよ。", answer: "0.00201 m", numericAnswer: 0.002010, expectedUnit: "m", acceptedUnits: { m: 1, mm: 0.001 }, requiresUnit: true, tolerance: 0.00002, formula: "C_2=\\frac{v_0+\\zeta\\omega_nx_0}{\\omega_d}", steps: ["\\(\\omega_d=10\\sqrt{0.99}=9.9499\\)", "\\(\\zeta\\omega_nx_0=0.020\\)", "\\(C_2=0.002010\\)"], explanation: "初速度0でも減衰項によりsin係数は0にならない。", pages: [10] }),
  question({ id: "md-q-d7", topic: "damping", genre: "単位", difficulty: 1, format: "choice", prompt: "粘性減衰係数cの単位として正しいものを選べ。", answer: "N·s/m", options: ["N·s/m", "N/m", "kg·m", "rad/s"], steps: ["c×速度が力Nになる"], explanation: "\\(\\frac{\\mathrm N}{\\frac{\\mathrm m}{\\mathrm s}}=\\frac{\\mathrm{N\\cdot s}}{\\mathrm m}\\)。", pages: [6, 13] }),

  question({ id: "md-q-g1", topic: "decrement", genre: "隣接ピーク", difficulty: 1, format: "number", prompt: "隣接する同符号ピークが100 mmと80.0 mmである。対数減衰率を求めよ。", answer: "0.223", numericAnswer: 0.22314, tolerance: 0.001, formula: "\\delta=\\ln\\!\\left(\\frac{x_i}{x_{i+1}}\\right)", steps: ["\\(\\ln\\frac{100}{80}=\\ln1.25\\)", "δ=0.223"], explanation: "振幅の単位は比で消える。", diagram: "amplitude-decay", pages: [12] }),
  question({ id: "md-q-g2", topic: "decrement", genre: "n周期", difficulty: 1, format: "number", prompt: "10周期後に振幅が初めの40.0%になった。1周期あたりの対数減衰率を求めよ。", answer: "0.0916", numericAnswer: 0.09163, tolerance: 0.0002, formula: "\\delta=\\frac{1}{n}\\ln\\!\\left(\\frac{x_i}{x_{i+n}}\\right)", steps: ["比は\\(\\frac{1}{0.4}=2.5\\)", "\\(\\frac{\\ln2.5}{10}=0.0916\\)"], explanation: "60%減少は残り40%である点に注意。", diagram: "amplitude-decay", pages: [13, 14] }),
  question({ id: "md-q-g3", topic: "decrement", genre: "減衰比近似", difficulty: 1, format: "number", prompt: "δ=0.340のとき、π=3.14を用いる簡略式でζを求めよ。", answer: "0.0541", numericAnswer: 0.05414, tolerance: 0.0002, formula: "\\zeta\\simeq\\frac{\\delta}{2\\pi}", steps: ["\\(\\frac{0.340}{6.28}=0.0541\\)"], explanation: "減衰比が十分小さい場合に限り、δを2πで割る簡略式を用いる。", pages: [13, 14] }),
  question({ id: "md-q-g4", topic: "decrement", genre: "振幅比", difficulty: 1, format: "number", prompt: "\\(\\delta=0.357\\)のとき隣接ピーク比\\(\\frac{x_i}{x_{i+1}}\\)を求めよ。", answer: "1.43", numericAnswer: 1.429, tolerance: 0.01, formula: "\\frac{x_i}{x_{i+1}}=e^\\delta", steps: ["e^0.357=1.429"], explanation: "\\(\\frac{\\text{減衰後}}{\\text{減衰前}}\\)ではなく、減衰前を分子にする。", pages: [14] }),
  question({ id: "md-q-g5", topic: "decrement", genre: "実験波形", difficulty: 2, format: "number", prompt: "8.00 sに4周期の振動を行う。減衰固有角振動数をπ=3.14で求めよ。", answer: "3.14 rad/s", numericAnswer: 3.14, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.01, formula: "\\omega_d=\\frac{2\\pi}{T_d}", steps: ["\\(T_d=\\frac{8}{4}=2.00\\ \\mathrm s\\)", "\\(\\omega_d=\\frac{6.28}{2}=3.14\\)"], explanation: "まずグラフの時間幅から周期を求める。", diagram: "amplitude-decay", pages: [14] }),
  question({ id: "md-q-g6", topic: "decrement", genre: "実験波形", difficulty: 2, format: "number", prompt: "10周期で振幅が15.0 mmから0.500 mmになった。δを求めよ。", answer: "0.340", numericAnswer: 0.34012, tolerance: 0.001, formula: "\\delta=\\frac{1}{10}\\ln\\!\\left(\\frac{15}{0.5}\\right)", steps: ["\\(\\frac{15}{0.5}=30\\)", "\\(\\frac{\\ln30}{10}=0.340\\)"], explanation: "n周期離れたピークの式を使う。", diagram: "amplitude-decay", pages: [14] }),
  question({ id: "md-q-g7", topic: "decrement", genre: "厳密式", difficulty: 2, format: "number", prompt: "ζ=0.477のとき対数減衰率δを厳密式で求めよ。", answer: "3.41", numericAnswer: 3.409, tolerance: 0.02, formula: "\\delta=\\frac{2\\pi\\zeta}{\\sqrt{1-\\zeta^2}}", steps: ["分母√(1−0.477²)=0.879", "分子=2×3.14×0.477", "δ≈3.41"], explanation: "ζが大きめなのでδ≈2πζの近似誤差が大きい。", pages: [13] }),

  question({ id: "md-q-r1", topic: "rotational", genre: "ねじり振動", difficulty: 2, format: "number", prompt: "m=4.00 kg、R=0.500 mの円板をkt=50.0 N·m/radのねじりばねで支持する。ωnを求めよ。", answer: "10.0 rad/s", numericAnswer: 10, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.02, formula: "\\omega_n=\\sqrt{\\frac{2k_t}{mR^2}}", steps: ["mR²=1.00", "\\(\\frac{2k_t}{mR^2}=100\\)", "√100=10"], explanation: "円板の慣性モーメントは\\(mR^2\\)ではなく\\(\\frac{mR^2}{2}\\)。", pages: [15] }),
  question({ id: "md-q-r2", topic: "rotational", genre: "レバー換算", difficulty: 1, format: "choice", prompt: "質量mが支点から距離lにあるときの回転慣性を選べ。", answer: "ml²", options: ["ml²", "ml", "\\(\\frac{m}{l^2}\\)", "m+l"], steps: ["速度v=lθdot", "運動エネルギーは\\(\\frac{ml^2\\dot\\theta^2}{2}\\)"], explanation: "点質量の支点まわり慣性モーメント。", pages: [15] }),
  question({ id: "md-q-r3", topic: "rotational", genre: "レバー減衰", difficulty: 2, format: "number", prompt: "m=2.00 kg、k=3000 N/m、l=0.200 m、l1=0.160 mのレバー系のωnを求めよ。", answer: "31.0 rad/s", numericAnswer: 30.984, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.1, formula: "\\omega_n=\\frac{l_1}{l}\\sqrt{\\frac{k}{m}}", steps: ["\\(\\frac{l_1}{l}=0.8\\)", "\\(\\sqrt{\\frac{3000}{2}}=38.73\\)", "積=30.98"], explanation: "質量とばねの作用腕が異なる。", diagram: "pinned-beam", pages: [15] }),
  question({ id: "md-q-r4", topic: "rotational", genre: "レバー減衰", difficulty: 2, format: "number", prompt: "m=2.00 kg、k=3000 N/m、質量の作用腕l=0.200 m、ばねの作用腕l1=0.160 mのレバー系に、c=200 N·s/mのダンパを作用腕l2=0.120 mで加える。減衰比を求めよ。", answer: "0.581", numericAnswer: 0.58095, tolerance: 0.002, formula: "\\zeta=\\frac{cl_2^2}{2ll_1\\sqrt{mk}}", steps: ["Cθ=cl2²", "J=ml²、Kθ=kl1²", "\\(\\zeta=\\frac{C_\\theta}{2\\sqrt{JK_\\theta}}=0.581\\)"], explanation: "ダンパの作用腕も二乗で換算する。", diagram: "pinned-beam", pages: [15] }),
  question({ id: "md-q-r5", topic: "rotational", genre: "倒立振り子", difficulty: 2, format: "derivation", prompt: "ばね付き倒立振り子が微小振動できる安定条件を示せ。", answer: "\\(kr^2>mgl\\)", accepted: ["kr^2>mgl", "kr²＞mgl"], keywords: ["kr", "mgl"], minKeywords: 2, formula: "J\\ddot\\theta+(kr^2-mgl)\\theta=0", steps: ["ばねは復元モーメントkr²θ", "重力は不安定化モーメントmglθ", "合成回転剛性を正にする"], explanation: "固有角振動数の二乗が正になる条件。", pages: [15] }),
  question({ id: "md-q-r6", topic: "rotational", genre: "単振り子", difficulty: 1, format: "number", prompt: "周期2.00 sの単振り子の長さを、g=9.80 m/s²、π=3.14として求めよ。", answer: "0.994 m", numericAnswer: 0.993955, expectedUnit: "m", acceptedUnits: { m: 1, cm: 0.01, mm: 0.001 }, requiresUnit: true, tolerance: 0.002, formula: "l=\\frac{gT^2}{4\\pi^2}", steps: ["\\(\\frac{9.80\\times2^2}{4\\times3.14^2}\\)", "l=0.993955"], explanation: "過去問の指定どおりπ=3.14を使う。", diagram: "simple-pendulum", pages: [4] }),
  question({ id: "md-q-r7", topic: "rotational", genre: "平行軸", difficulty: 2, format: "number", prompt: "重心まわりJG=0.200 kg·m²、m=3.00 kg、支点までd=0.400 mの剛体について支点まわりJを求めよ。", answer: "0.680 kg·m²", numericAnswer: 0.68, expectedUnit: "kg m^2", acceptedUnits: { "kg m^2": 1, "kg m²": 1, "kg·m²": 1, "kg·m^2": 1, "kg・m^2": 1 }, requiresUnit: true, tolerance: 0.002, formula: "J=J_G+md^2", steps: ["md²=3×0.16=0.48", "0.20+0.48=0.68"], explanation: "回転軸が重心から離れるほど慣性モーメントは増える。", pages: [4] }),
];

function examQuestion(
  examId: string,
  major: number,
  sub: number,
  points: number,
  seed: Omit<MechanicalDynamicsQuestion, "id" | "topicId">,
): MechanicalDynamicsExamQuestion {
  const setupDiagram: MechanicalDynamicsDiagramKind | undefined =
    major === 1 ? "single-spring-mass"
      : major === 2 ? "static-deflection"
          : major === 3 ? "damped-spring-mass"
            : major === 4 ? "amplitude-decay"
            : major === 5 && seed.topic === "stiffness" ? "spring-network"
              : major === 6 ? "pinned-beam"
                : major === 7 ? "simple-pendulum"
                  : undefined;
  return {
    ...seed,
    steps: formatMechanicalSteps(seed.steps),
    diagram: seed.diagram ?? setupDiagram,
    id: examId + "-m" + major + "-s" + sub,
    topicId: seed.topic,
    major,
    sub,
    points,
  };
}

const OFFICIAL_CONDITIONS =
  "過去問に明記：電卓使用可。解答欄へ記入し、途中式も示す。最終数値を分数・根号のままにせず、有効数字は3桁、単位必須。g=9.80 m/s²、π=3.14を使用。試験時間は資料に記載がない。";

function actualQuestion(
  major: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  sub: number,
  points: number,
  seed: Omit<MechanicalDynamicsQuestion, "id" | "topicId" | "sourceRefs">,
): MechanicalDynamicsExamQuestion {
  return examQuestion("md-actual", major, sub, points, {
    ...seed,
    sourceRefs: [actualRef(major, sub), ...seed.topic === "laplace" ? [rangeRef(8), rangeRef(9)] : []],
  });
}

const actualSections: MechanicalDynamicsExamSection[] = [
  {
    number: 1,
    title: "ばね質量系の基礎量",
    topic: "undamped",
    topicIds: ["undamped"],
    points: 15,
    context: "m=2.00 kg、k=8000 N/m。",
    questions: [
      actualQuestion(1, 1, 5, { topic: "undamped", genre: "固有角振動数", difficulty: 1, format: "number", prompt: "固有角振動数ωnを求めよ。", answer: "63.2 rad/s", numericAnswer: 63.2456, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.1, formula: "\\omega_n=\\sqrt{\\frac{k}{m}}", steps: ["\\(\\sqrt{\\frac{8000}{2}}=\\sqrt{4000}\\)", "63.2456→63.2"], explanation: "有効数字は3桁なので63.2 rad/sとする。" }),
      actualQuestion(1, 2, 5, { topic: "undamped", genre: "固有振動数", difficulty: 1, format: "number", prompt: "固有振動数fnを求めよ。", answer: "10.1 Hz", numericAnswer: 10.071, expectedUnit: "Hz", acceptedUnits: units.hertz, requiresUnit: true, tolerance: 0.05, formula: "f_n=\\frac{\\omega_n}{2\\pi}", steps: ["\\(\\frac{63.2456}{2\\times3.14}=10.071\\)", "ωnを2πで割り、Hzで丸める"], explanation: "指定されたπ=3.14を用いる。" }),
      actualQuestion(1, 3, 5, { topic: "undamped", genre: "周期", difficulty: 1, format: "number", prompt: "周期Tnを求めよ。", answer: "0.0993 s", numericAnswer: 0.0993, expectedUnit: "s", acceptedUnits: units.seconds, requiresUnit: true, tolerance: 0.0003, formula: "T_n=\\frac{1}{f_n}", steps: ["\\(\\frac{1}{10.071}=0.09929\\)", "\\(T_n=\\frac{1}{f_n}\\)から周期を求め、sを付ける"], explanation: "有効数字は3桁で単位を付ける。" }),
    ],
  },
  {
    number: 2,
    title: "静たわみから固有角振動数",
    topic: "stiffness",
    topicIds: ["stiffness", "undamped"],
    points: 10,
    context: "重力によりばねが2.00 mm静たわみする。mg−kxst=0。",
    questions: [
      actualQuestion(2, 1, 10, { topic: "stiffness", genre: "静たわみ", difficulty: 2, format: "number", prompt: "固有角振動数ωnを求めよ。", answer: "70.0 rad/s", numericAnswer: 70, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.1, formula: "\\omega_n=\\sqrt{\\frac{g}{x_{st}}}", steps: ["xst=0.00200 m", "\\(\\frac{k}{m}=\\frac{g}{x_{st}}\\)", "\\(\\sqrt{\\frac{9.80}{0.00200}}=70.0\\)"], explanation: "質量を直接知らなくても静たわみから求められる。" }),
    ],
  },
  {
    number: 3,
    title: "減衰比と減衰固有角振動数",
    topic: "damping",
    topicIds: ["damping"],
    points: 15,
    context: "m=50.0 kg、k=500 kN/m、c=10.0 N·s/m。",
    questions: [
      actualQuestion(3, 1, 5, { topic: "damping", genre: "減衰比", difficulty: 1, format: "number", prompt: "減衰比ζを求めよ。", answer: "0.00100", numericAnswer: 0.001, tolerance: 0.00001, formula: "\\zeta=\\frac{c}{2\\sqrt{mk}}", steps: ["k=500000 N/m", "2√(50×500000)=10000", "\\(\\frac{10}{10000}=0.00100\\)"], explanation: "分子と分母はいずれも減衰係数の単位N·s/mを持つため、比を取ると無次元になる。" }),
      actualQuestion(3, 2, 5, { topic: "damping", genre: "固有角振動数", difficulty: 1, format: "number", prompt: "固有角振動数ωnを求めよ。", answer: "100 rad/s", numericAnswer: 100, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.1, formula: "\\omega_n=\\sqrt{\\frac{k}{m}}", steps: ["\\(\\sqrt{\\frac{500000}{50}}=\\sqrt{10000}=100\\)", "kをN/mへ直してからrad/sで答える"], explanation: "kN/mをN/mへ直す。" }),
      actualQuestion(3, 3, 5, { topic: "damping", genre: "減衰固有角振動数", difficulty: 2, format: "number", prompt: "減衰固有角振動数ωdを求めよ。", answer: "100 rad/s", numericAnswer: 99.99995, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.1, formula: "\\omega_d=\\omega_n\\sqrt{1-\\zeta^2}", steps: ["100√(1−0.001²)=99.99995", "有効数字3桁で100"], explanation: "ζが非常に小さいためωd≈ωn。" }),
    ],
  },
  {
    number: 4,
    title: "10周期後の振幅",
    topic: "decrement",
    topicIds: ["decrement"],
    points: 10,
    context: "10周期後に振幅が60.0%減少した。問題文提示式：\\(\\zeta=\\frac{1}{2\\pi n}\\log_e\\frac{x_1}{x_{n+1}}\\)。",
    questions: [
      actualQuestion(4, 1, 10, { topic: "decrement", genre: "減衰比近似", difficulty: 2, format: "number", prompt: "減衰比ζを求めよ。", answer: "0.0146", numericAnswer: 0.01459, tolerance: 0.0001, printedFormula: "\\zeta=\\frac{1}{2\\pi n}\\log_e\\frac{x_1}{x_{n+1}}", formula: "\\zeta=\\frac{1}{2\\pi n}\\ln\\frac{x_i}{x_{i+n}}", steps: ["60%減少→残り40%=0.400xi", "\\(\\frac{\\ln\\frac{1}{0.4}}{2\\times3.14\\times10}\\)", "ζ=0.01459"], explanation: "減少率60%を振幅比0.60と取り違えない。" }),
    ],
  },
  {
    number: 5,
    title: "複合ばね",
    topic: "stiffness",
    topicIds: ["stiffness"],
    points: 10,
    context: "図1：質量mに、上側2kとkの並列、下側kとkの直列が接続される。",
    questions: [
      actualQuestion(5, 1, 10, { topic: "stiffness", genre: "等価剛性の導出", difficulty: 2, format: "derivation", prompt: "固有角振動数ωnをm、kで表せ。", answer: "\\(\\omega_n=\\sqrt{\\frac{7k}{2m}}\\)", accepted: ["sqrt(7k/(2m))", "√(7k/(2m))"], keywords: ["7k", "2m"], minKeywords: 2, formula: "\\omega_n=\\sqrt{\\frac{k_{eq}}{m}}", steps: ["上側：2k+k=3k", "下側：\\(\\frac{k\\times k}{k+k}=\\frac{k}{2}\\)", "\\(k_{eq}=3k+\\frac{k}{2}=\\frac{7k}{2}\\)", "\\(\\omega_n=\\sqrt{\\frac{7k}{2m}}\\)"], diagram: "spring-network", explanation: "並列部と直列部は質量変位に対してともに復元力を出す。" }),
    ],
  },
  {
    number: 6,
    title: "レバー・ばね・ダンパ系",
    topic: "rotational",
    topicIds: ["rotational", "damping"],
    points: 30,
    context: "図2：質量なしレバーを左端ピン支持。質点mとダンパcの作用腕はr、ばねkの作用腕はl。微小角θ。",
    questions: [
      actualQuestion(6, 1, 10, { topic: "rotational", genre: "固有角振動数の導出", difficulty: 3, format: "derivation", prompt: "運動方程式を立て、ωnを導出せよ。", answer: "\\(mr^2\\ddot\\theta+cr^2\\dot\\theta+kl^2\\theta=0,\\quad\\omega_n=\\frac{l}{r}\\sqrt{\\frac{k}{m}}\\)", accepted: ["mr^2", "cr^2", "kl^2", "(l/r)sqrt(k/m)"], keywords: ["mr", "cr", "kl", "sqrt"], minKeywords: 4, formula: "\\omega_n=\\sqrt{\\frac{K_\\theta}{J}}", steps: ["J=mr²", "Cθ=cr²", "Kθ=kl²", "\\(\\omega_n=\\sqrt{\\frac{kl^2}{mr^2}}\\)"], diagram: "pinned-beam", explanation: "並進係数を各作用腕の二乗で回転係数へ換算する。" }),
      actualQuestion(6, 2, 10, { topic: "rotational", genre: "減衰比の導出", difficulty: 3, format: "derivation", prompt: "減衰比ζを導出せよ。", answer: "\\(\\zeta=\\frac{cr}{2l\\sqrt{mk}}\\)", accepted: ["cr/(2l√mk)", "cr/(2lsqrt(mk))"], keywords: ["cr", "2l", "mk"], minKeywords: 3, formula: "\\zeta=\\frac{C_\\theta}{2\\sqrt{JK_\\theta}}", steps: ["Cθ=cr²", "2√(JKθ)=2√(mr²kl²)=2rl√(mk)", "約分して\\(\\frac{cr}{2l\\sqrt{mk}}\\)"], diagram: "pinned-beam", explanation: "r、lは正の長さとして平方根を整理する。" }),
      actualQuestion(6, 3, 10, { topic: "rotational", genre: "臨界減衰条件", difficulty: 3, format: "number", prompt: "m=2.00 kg、c=100 N·s/m、k=500 N/m、l=0.800 mのとき、臨界減衰になるrを求めよ。", answer: "0.506 m", numericAnswer: 0.50596, expectedUnit: "m", acceptedUnits: { m: 1, cm: 0.01, mm: 0.001 }, requiresUnit: true, tolerance: 0.002, formula: "1=\\frac{cr}{2l\\sqrt{mk}}", steps: ["\\(r=\\frac{2l\\sqrt{mk}}{c}\\)", "\\(\\frac{2\\times0.8\\times\\sqrt{2\\times500}}{100}\\)", "r=0.50596 m"], diagram: "pinned-beam", explanation: "臨界減衰ではζ=1。" }),
    ],
  },
  {
    number: 7,
    title: "単振り子",
    topic: "rotational",
    topicIds: ["rotational"],
    points: 10,
    context: "単振り子の周期T=2.00 s。g=9.80 m/s²、π=3.14。",
    questions: [
      actualQuestion(7, 1, 10, { topic: "rotational", genre: "単振り子", difficulty: 1, format: "number", prompt: "振り子の長さlを求めよ。", answer: "0.994 m", numericAnswer: 0.993955, expectedUnit: "m", acceptedUnits: { m: 1, cm: 0.01, mm: 0.001 }, requiresUnit: true, tolerance: 0.002, formula: "l=\\frac{gT^2}{4\\pi^2}", steps: ["\\(l=\\frac{9.80\\times2.00^2}{4\\times3.14^2}\\)", "l=0.993955→0.994 m"], diagram: "simple-pendulum", explanation: "過去問のπ=3.14指定に従う。" }),
    ],
  },
];

export const MECHANICAL_DYNAMICS_ACTUAL_EXAM: MechanicalDynamicsExam = {
  id: "md-actual",
  kind: "actual",
  number: 0,
  title: "実物過去問",
  subtitle: "機械力学過去問.pdf・全7大問／13解答欄",
  defaultMinutes: 50,
  userAdjustable: true,
  officialMinutes: null,
  totalPoints: 100,
  scoreLabel: "実物配点100点",
  passPercent: 60,
  paper: "A4 portrait",
  officialConditionsNote: OFFICIAL_CONDITIONS + " 画面の50分は練習用初期値で変更できる。",
  sections: actualSections,
  questions: actualSections.flatMap((section) => section.questions),
};

export const MECHANICAL_DYNAMICS_ACTUAL_PRACTICE_QUESTIONS: MechanicalDynamicsQuestion[] =
  MECHANICAL_DYNAMICS_ACTUAL_EXAM.questions.map(({ major, sub, ...rest }) => {
    const { points, ...item } = rest;
    void points;
    return {
      ...item,
      id: "md-practice-actual-m" + major + "-s" + sub,
      genre: "実物過去問・" + item.genre,
    };
  });

// 過去問は形式参照ではなく試験範囲なので、通常演習からも13解答欄を反復できるようにする。
MECHANICAL_DYNAMICS_QUESTIONS.push(...MECHANICAL_DYNAMICS_ACTUAL_PRACTICE_QUESTIONS);

const PI = 3.14;
const G = 9.8;

function rounded(value: number, digits = 4): number {
  return Number(value.toFixed(digits));
}

function expectedSourceRefs(topic: MechanicalDynamicsTopicId): MechanicalDynamicsSourceRef[] {
  const topicInfo = MECHANICAL_DYNAMICS_TOPICS.find((item) => item.id === topic);
  return (topicInfo?.pages ?? []).map((page) => rangeRef(page, "想定問題の範囲根拠"));
}

function expectedQuestion(
  examId: string,
  major: number,
  sub: number,
  points: number,
  seed: Omit<MechanicalDynamicsQuestion, "id" | "topicId" | "sourceRefs">,
): MechanicalDynamicsExamQuestion {
  return examQuestion(examId, major, sub, points, {
    ...seed,
    explanation: seed.explanation.length >= 20
      ? seed.explanation
      : seed.explanation + " 公式を選び、値を代入して単位と丸めを確認する。",
    sourceRefs: expectedSourceRefs(seed.topic),
  });
}

function buildExpectedExam(variant: number): MechanicalDynamicsExam {
  const id = "md-expected-" + variant;
  const index = variant - 1;

  // 範囲プリントの難度に合わせ、各大問を「モデル化→中間量→最終量」の連続計算にする。
  const baseSpring = [400, 600, 800, 1000, 1200, 1500][index];
  const mass = [3.5, 4.5, 5, 6.5, 8, 10][index];
  const equivalentSpring = 3.5 * baseSpring;
  const naturalAngular = Math.sqrt(equivalentSpring / mass);
  const naturalFrequency = naturalAngular / (2 * PI);
  const naturalPeriod = 1 / naturalFrequency;

  const beamEI = [900, 1500, 2400, 3600, 5000, 7200][index];
  const beamLength = [1.2, 1.4, 1.6, 1.8, 2, 2.2][index];
  const beamMass = [6, 8, 10, 12, 14, 16][index];
  const beamStiffness = (3 * beamEI) / beamLength ** 3;
  const beamAngular = Math.sqrt(beamStiffness / beamMass);

  const dampedMass = 4 + variant;
  const dampedNaturalAngular = 18 + 2 * variant;
  const dampingRatios = [0.05, 0.08, 0.12, 0.16, 0.2, 0.25];
  const dampingRatio = dampingRatios[index];
  const dampedStiffness = dampedMass * dampedNaturalAngular ** 2;
  const dampingCoefficient = 2 * dampingRatio * dampedMass * dampedNaturalAngular;
  const dampedAngular = dampedNaturalAngular * Math.sqrt(1 - dampingRatio ** 2);
  const initialDisplacementMm = [20, 25, 18, 30, 22, 16][index];
  const initialDisplacement = initialDisplacementMm / 1000;
  const initialVelocity = [0.08, -0.04, 0.12, 0, -0.08, 0.05][index];
  const dampedSineCoefficient =
    (initialVelocity + dampingRatio * dampedNaturalAngular * initialDisplacement) / dampedAngular;

  const cycles = 2 + variant;
  const firstPeakMm = [100, 80, 120, 90, 75, 60][index];
  const remaining = [0.45, 0.32, 0.25, 0.18, 0.12, 0.08][index];
  const laterPeakMm = firstPeakMm * remaining;
  const logarithmicDecrement = Math.log(firstPeakMm / laterPeakMm) / cycles;
  const exactDampingRatio = logarithmicDecrement / Math.sqrt(4 * PI ** 2 + logarithmicDecrement ** 2);

  const poleA = variant;
  const poleB = variant + 2;
  const transferGain = poleA * poleB;
  const stepA = -poleB / (poleB - poleA);
  const stepB = poleA / (poleB - poleA);

  const leverMass = 2 + 0.5 * variant;
  const leverStiffness = 400 + 50 * variant;
  const leverDamping = 20 + 5 * variant;
  const leverLength = 0.6 + 0.05 * variant;
  const leverArm = 0.3 + 0.03 * variant;
  const leverAngular = (leverLength / leverArm) * Math.sqrt(leverStiffness / leverMass);
  const leverDampingRatio =
    (leverDamping * leverArm) / (2 * leverLength * Math.sqrt(leverMass * leverStiffness));
  const criticalArm = (2 * leverLength * Math.sqrt(leverMass * leverStiffness)) / leverDamping;

  const rodMass = [3, 4, 5, 6, 7, 8][index];
  const rodLength = [1.2, 1.4, 1.6, 1.8, 2, 2.2][index];
  const springHeight = rodLength / 2;
  const rodSpring = [120, 180, 250, 320, 400, 500][index];
  const rodInertia = rodMass * rodLength ** 2 / 3;
  const rodRotationalStiffness = rodSpring * springHeight ** 2 + rodMass * G * rodLength / 2;
  const rodAngular = Math.sqrt(rodRotationalStiffness / rodInertia);

  const sections: MechanicalDynamicsExamSection[] = [
    {
      number: 1,
      title: "複合ばね系のモデル化と自由振動",
      topic: "stiffness",
      topicIds: ["stiffness", "undamped"],
      points: 15,
      context: "図1の上側は2kとkの並列、下側はkとkの直列で、どちらも質量mの変位に対して復元力を生む。k=" + baseSpring.toFixed(0) + " N/m、m=" + mass.toFixed(2) + " kg、π=3.14。",
      questions: [
        expectedQuestion(id, 1, 1, 5, { topic: "stiffness", genre: "複合ばね・等価剛性", difficulty: 3, format: "number", prompt: "図から等価ばね定数keqを求めよ。", answer: rounded(equivalentSpring, 3) + " N/m", numericAnswer: equivalentSpring, expectedUnit: "N/m", acceptedUnits: units.stiffness, requiresUnit: true, tolerance: 0.5, formula: "k_{eq}=\\left(2k+k\\right)+\\frac{k\\,k}{k+k}=\\frac{7k}{2}", steps: ["図の上側を並列、下側を直列として別々にまとめる", "\\(k_{upper}=3k\\)", "\\(k_{lower}=\\frac{k}{2}\\)", "\\(k_{eq}=3k+\\frac{k}{2}=\\frac{7k}{2}=" + rounded(equivalentSpring, 3) + "\\ \\mathrm{N/m}\\)"], explanation: "同じ質量変位に対して上側と下側の復元力が同時に働くため、最後は両者を加える。", diagram: "spring-network" }),
        expectedQuestion(id, 1, 2, 5, { topic: "undamped", genre: "複合ばね・固有角振動数", difficulty: 2, format: "number", prompt: "前問のkeqを用いて固有角振動数ωnを求めよ。", answer: rounded(naturalAngular, 3) + " rad/s", numericAnswer: naturalAngular, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.1, formula: "\\omega_n=\\sqrt{\\frac{k_{eq}}{m}}", steps: ["前問で得た等価剛性を質量で割る", "\\(\\omega_n=\\sqrt{\\frac{" + rounded(equivalentSpring, 3) + "}{" + mass.toFixed(2) + "}}\\approx" + rounded(naturalAngular, 5) + "\\ \\mathrm{rad/s}\\)"], explanation: "個々のばね定数ではなく、質量から見た等価剛性を使う。", diagram: "spring-network" }),
        expectedQuestion(id, 1, 3, 5, { topic: "undamped", genre: "複合ばね・周期", difficulty: 2, format: "number", prompt: "固有振動数fnと周期Tnを順に求め、解答欄にはTnを記せ。", answer: rounded(naturalPeriod, 4) + " s", numericAnswer: naturalPeriod, expectedUnit: "s", acceptedUnits: units.seconds, requiresUnit: true, tolerance: 0.001, formula: "T_n=\\frac{2\\pi}{\\omega_n}=\\frac{1}{f_n}", steps: ["\\(f_n=\\frac{" + rounded(naturalAngular, 5) + "}{2\\times3.14}\\approx" + rounded(naturalFrequency, 5) + "\\ \\mathrm{Hz}\\)", "\\(T_n=\\frac{1}{" + rounded(naturalFrequency, 5) + "}\\approx" + rounded(naturalPeriod, 5) + "\\ \\mathrm{s}\\)"], explanation: "中間値の丸め過ぎを避け、ωnから得た値を保持して周期まで計算する。", diagram: "spring-network" }),
      ],
    },
    {
      number: 2,
      title: "片持ちはりを等価ばねに置き換える",
      topic: "stiffness",
      topicIds: ["stiffness", "undamped"],
      points: 10,
      context: "図2の片持ちはり先端に質量m=" + beamMass.toFixed(2) + " kgを取り付ける。曲げ剛性EI=" + beamEI.toFixed(0) + " N·m²、長さl=" + beamLength.toFixed(2) + " m。はり自体の質量は無視する。",
      questions: [
        expectedQuestion(id, 2, 1, 10, { topic: "stiffness", genre: "片持ちはり・等価剛性", difficulty: 3, format: "number", prompt: "静たわみ式から等価剛性を導き、系の固有角振動数ωnを求めよ。", answer: rounded(beamAngular, 3) + " rad/s", numericAnswer: beamAngular, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.1, formula: "\\begin{aligned}\\delta&=\\frac{Pl^3}{3EI}\\\\ k_b&=\\frac{P}{\\delta}=\\frac{3EI}{l^3}\\\\ \\omega_n&=\\sqrt{\\frac{k_b}{m}}\\end{aligned}", steps: ["片持ちはりの先端たわみを等価ばねの変位とみなす", "\\(k_b=\\frac{3\\times" + beamEI.toFixed(0) + "}{" + beamLength.toFixed(2) + "^3}\\approx" + rounded(beamStiffness, 5) + "\\ \\mathrm{N/m}\\)", "\\(\\omega_n=\\sqrt{\\frac{" + rounded(beamStiffness, 5) + "}{" + beamMass.toFixed(2) + "}}\\approx" + rounded(beamAngular, 5) + "\\ \\mathrm{rad/s}\\)"], explanation: "プリントと同様に、たわみ式から等価剛性を作ってから一自由度系の公式へつなぐ二段階計算。", diagram: "cantilever-mass" }),
      ],
    },
    {
      number: 3,
      title: "不足減衰系のパラメータと初期値応答",
      topic: "damping",
      topicIds: ["damping"],
      points: 15,
      context: "図3の系でm=" + dampedMass.toFixed(2) + " kg、k=" + rounded(dampedStiffness, 3) + " N/m、c=" + rounded(dampingCoefficient, 4) + " N·s/m。初期条件はx(0)=" + initialDisplacementMm.toFixed(1) + " mm、v(0)=" + initialVelocity.toFixed(3) + " m/s。",
      questions: [
        expectedQuestion(id, 3, 1, 5, { topic: "damping", genre: "不足減衰・減衰比", difficulty: 2, format: "number", prompt: "臨界減衰係数ccを求めたうえで減衰比ζを求め、応答を分類せよ。解答欄にはζを記せ。", answer: dampingRatio.toFixed(3) + "（不足減衰）", numericAnswer: dampingRatio, tolerance: 0.001, formula: "\\begin{aligned}c_c&=2\\sqrt{mk}\\\\ \\zeta&=\\frac{c}{c_c}\\end{aligned}", steps: ["\\(c_c=2\\sqrt{" + dampedMass.toFixed(2) + "\\times" + rounded(dampedStiffness, 3) + "}\\approx" + rounded(2 * Math.sqrt(dampedMass * dampedStiffness), 5) + "\\ \\mathrm{N\\,s/m}\\)", "\\(\\zeta=\\frac{" + rounded(dampingCoefficient, 4) + "}{" + rounded(2 * Math.sqrt(dampedMass * dampedStiffness), 5) + "}\\approx" + dampingRatio.toFixed(5) + "\\)", "\\(0<\\zeta<1\\)なので不足減衰と判定する"], explanation: "減衰比を計算するだけでなく、1との大小から波形の種類まで判断する。", diagram: "damped-spring-mass" }),
        expectedQuestion(id, 3, 2, 5, { topic: "damping", genre: "不足減衰・減衰固有角振動数", difficulty: 2, format: "number", prompt: "ωnを計算し、減衰固有角振動数ωdを求めよ。", answer: rounded(dampedAngular, 3) + " rad/s", numericAnswer: dampedAngular, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.1, formula: "\\begin{aligned}\\omega_n&=\\sqrt{\\frac{k}{m}}\\\\ \\omega_d&=\\omega_n\\sqrt{1-\\zeta^2}\\end{aligned}", steps: ["\\(\\omega_n=\\sqrt{\\frac{" + rounded(dampedStiffness, 3) + "}{" + dampedMass.toFixed(2) + "}}\\approx" + dampedNaturalAngular.toFixed(5) + "\\ \\mathrm{rad/s}\\)", "\\(\\omega_d=" + dampedNaturalAngular.toFixed(5) + "\\sqrt{1-" + dampingRatio.toFixed(3) + "^2}\\approx" + rounded(dampedAngular, 5) + "\\ \\mathrm{rad/s}\\)"], explanation: "ωdには前問のζを使うため、途中値を保持して連続計算する。", diagram: "damped-spring-mass" }),
        expectedQuestion(id, 3, 3, 5, { topic: "damping", genre: "不足減衰・初期条件", difficulty: 3, format: "number", prompt: "不足減衰解のsin項の係数C2を求めよ。", answer: rounded(dampedSineCoefficient, 6) + " m", numericAnswer: dampedSineCoefficient, expectedUnit: "m", acceptedUnits: { m: 1, mm: 0.001 }, requiresUnit: true, tolerance: 0.00002, formula: "C_2=\\frac{v_0+\\zeta\\omega_nx_0}{\\omega_d}", steps: ["初期変位をmmからmへ換算する", "\\(x_0=" + initialDisplacement.toFixed(5) + "\\ \\mathrm{m}\\)", "\\(C_2=\\frac{" + initialVelocity.toFixed(3) + "+" + dampingRatio.toFixed(3) + "\\times" + dampedNaturalAngular.toFixed(3) + "\\times" + initialDisplacement.toFixed(5) + "}{" + rounded(dampedAngular, 5) + "}\\approx" + rounded(dampedSineCoefficient, 7) + "\\ \\mathrm{m}\\)"], explanation: "初速度が0の場合でも減衰項が残る点、初期変位のmm換算を落とさない点がプリント相当の要点。", diagram: "damped-spring-mass" }),
      ],
    },
    {
      number: 4,
      title: "減衰波形の同符号ピークを読む",
      topic: "decrement",
      topicIds: ["decrement", "damping"],
      points: 10,
      context: "図4の同じ向きのピークを読むと、x_i=" + firstPeakMm.toFixed(2) + " mm、" + cycles + "周期後のx_{i+n}=" + laterPeakMm.toFixed(2) + " mmであった。π=3.14。",
      questions: [
        expectedQuestion(id, 4, 1, 10, { topic: "decrement", genre: "波形読解・厳密減衰比", difficulty: 3, format: "number", prompt: "1周期当たりの対数減衰率δを求め、厳密式から減衰比ζを求めよ。解答欄にはζを記せ。", answer: rounded(exactDampingRatio, 5).toString(), numericAnswer: exactDampingRatio, tolerance: 0.0001, formula: "\\begin{aligned}\\delta&=\\frac{1}{n}\\ln\\!\\left(\\frac{x_i}{x_{i+n}}\\right)\\\\ \\zeta&=\\frac{\\delta}{\\sqrt{4\\pi^2+\\delta^2}}\\end{aligned}", steps: ["正負が異なる山ではなく同符号ピークを選ぶ", "\\(\\delta=\\frac{1}{" + cycles + "}\\ln\\!\\left(\\frac{" + firstPeakMm.toFixed(2) + "}{" + laterPeakMm.toFixed(2) + "}\\right)\\approx" + rounded(logarithmicDecrement, 6) + "\\)", "\\(\\zeta=\\frac{" + rounded(logarithmicDecrement, 6) + "}{\\sqrt{4\\times3.14^2+" + rounded(logarithmicDecrement, 6) + "^2}}\\approx" + rounded(exactDampingRatio, 7) + "\\)"], explanation: "近似式だけで終えず、波形からδを作って厳密式へ入れる二段階問題。振幅の単位は比で消える。", diagram: "amplitude-decay" }),
      ],
    },
    {
      number: 5,
      title: "伝達関数の単位ステップ応答",
      topic: "laplace",
      topicIds: ["laplace"],
      points: 10,
      context: "\\(G(s)=\\frac{" + transferGain + "}{(s+" + poleA + ")(s+" + poleB + ")}\\)の系へ単位ステップ\\(U(s)=\\frac{1}{s}\\)を入力する。初期値は0とする。",
      questions: [
        expectedQuestion(id, 5, 1, 10, { topic: "laplace", genre: "単位ステップ応答・3項部分分数", difficulty: 3, format: "derivation", prompt: "Y(s)=G(s)U(s)を3項へ部分分数分解し、y(t)を求めよ。", answer: "\\(y(t)\\approx1" + (stepA < 0 ? "" : "+") + rounded(stepA, 4) + "e^{-" + poleA + "t}+" + rounded(stepB, 4) + "e^{-" + poleB + "t}\\)", accepted: ["1" + rounded(stepA, 4) + "e^-" + poleA + "t+" + rounded(stepB, 4) + "e^-" + poleB + "t"], keywords: ["1", rounded(stepA, 4).toString(), rounded(stepB, 4).toString(), String(poleA), String(poleB)], minKeywords: 4, formula: "Y(s)=\\frac{ab}{s(s+a)(s+b)}=\\frac{1}{s}-\\frac{b}{b-a}\\frac{1}{s+a}+\\frac{a}{b-a}\\frac{1}{s+b}", steps: ["単位ステップなので伝達関数へ\\(\\frac{1}{s}\\)を掛ける", "\\(Y(s)=\\frac{" + transferGain + "}{s(s+" + poleA + ")(s+" + poleB + ")}\\)", "各極へ代入すると\\(A=1,\\ B\\approx" + rounded(stepA, 4) + ",\\ C\\approx" + rounded(stepB, 4) + "\\)", "\\(\\frac{1}{s}\\leftrightarrow1\\)、\\(\\frac{1}{s+a}\\leftrightarrow e^{-at}\\)を項ごとに適用する"], explanation: "入力のラプラス変換を掛け忘れず、2項ではなく定常項を含む3項の部分分数へ分ける。", }),
      ],
    },
    {
      number: 6,
      title: "レバー・ばね・ダンパ系の連続計算",
      topic: "rotational",
      topicIds: ["rotational", "damping"],
      points: 30,
      context: "図5の質量なしレバーは左端ピン支持。質点m=" + leverMass.toFixed(2) + " kgとダンパc=" + leverDamping.toFixed(1) + " N·s/mの作用腕はr=" + leverArm.toFixed(3) + " m、ばねk=" + leverStiffness.toFixed(0) + " N/mの作用腕はl=" + leverLength.toFixed(3) + " m。微小角θとする。",
      questions: [
        expectedQuestion(id, 6, 1, 10, { topic: "rotational", genre: "レバー系・運動方程式", difficulty: 3, format: "derivation", prompt: "支点まわりの運動方程式を立て、回転慣性・回転減衰・回転剛性を示せ。", answer: "\\(mr^2\\ddot\\theta+cr^2\\dot\\theta+kl^2\\theta=0\\)", accepted: ["mr^2", "cr^2", "kl^2"], keywords: ["mr", "cr", "kl"], minKeywords: 3, formula: "J\\ddot\\theta+C_\\theta\\dot\\theta+K_\\theta\\theta=0", steps: ["各要素の微小並進変位は作用腕とθの積になる", "\\(J=mr^2\\)", "\\(C_\\theta=cr^2\\)", "\\(K_\\theta=kl^2\\)", "\\(mr^2\\ddot\\theta+cr^2\\dot\\theta+kl^2\\theta=0\\)"], diagram: "pinned-beam", explanation: "作用腕は変位換算とモーメント換算で二度掛かるため、各係数には腕の二乗が付く。" }),
        expectedQuestion(id, 6, 2, 10, { topic: "rotational", genre: "レバー系・固有角振動数", difficulty: 3, format: "number", prompt: "前問の回転係数から固有角振動数ωnを求めよ。", answer: rounded(leverAngular, 3) + " rad/s", numericAnswer: leverAngular, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.1, formula: "\\omega_n=\\sqrt{\\frac{K_\\theta}{J}}=\\frac{l}{r}\\sqrt{\\frac{k}{m}}", steps: ["前問で得た\\(J\\)と\\(K_\\theta\\)の比を取る", "\\(\\omega_n=\\frac{" + leverLength.toFixed(3) + "}{" + leverArm.toFixed(3) + "}\\sqrt{\\frac{" + leverStiffness.toFixed(0) + "}{" + leverMass.toFixed(2) + "}}\\approx" + rounded(leverAngular, 5) + "\\ \\mathrm{rad/s}\\)"], diagram: "pinned-beam", explanation: "並進系の式へそのままkとmを入れず、作用腕比を含む回転系として計算する。" }),
        expectedQuestion(id, 6, 3, 10, { topic: "rotational", genre: "レバー系・減衰比と臨界条件", difficulty: 3, format: "text", prompt: "現在の減衰比ζを求め、ζ=1となる臨界作用腕r_cも求めよ。", answer: "\\(\\zeta\\approx" + rounded(leverDampingRatio, 4) + ",\\quad r_c\\approx" + rounded(criticalArm, 4) + "\\ \\mathrm{m}\\)", accepted: [rounded(leverDampingRatio, 4) + "," + rounded(criticalArm, 4)], keywords: [rounded(leverDampingRatio, 4).toString(), rounded(criticalArm, 4).toString()], minKeywords: 2, formula: "\\begin{aligned}\\zeta&=\\frac{cr}{2l\\sqrt{mk}}\\\\ r_c&=\\frac{2l\\sqrt{mk}}{c}\\end{aligned}", steps: ["\\(\\zeta=\\frac{" + leverDamping.toFixed(1) + "\\times" + leverArm.toFixed(3) + "}{2\\times" + leverLength.toFixed(3) + "\\sqrt{" + leverMass.toFixed(2) + "\\times" + leverStiffness.toFixed(0) + "}}\\approx" + rounded(leverDampingRatio, 6) + "\\)", "臨界条件\\(\\zeta=1\\)として作用腕について解く", "\\(r_c=\\frac{2\\times" + leverLength.toFixed(3) + "\\sqrt{" + leverMass.toFixed(2) + "\\times" + leverStiffness.toFixed(0) + "}}{" + leverDamping.toFixed(1) + "}\\approx" + rounded(criticalArm, 6) + "\\ \\mathrm{m}\\)"], diagram: "pinned-beam", explanation: "同じ減衰比式を順方向と逆方向に用い、現状態と臨界条件の両方を評価する。" }),
      ],
    },
    {
      number: 7,
      title: "ばね付き一様剛体棒",
      topic: "rotational",
      topicIds: ["rotational"],
      points: 10,
      context: "図6の一様剛体棒は上端ピン支持。m=" + rodMass.toFixed(2) + " kg、l=" + rodLength.toFixed(2) + " m、ばね取付高さh=" + springHeight.toFixed(2) + " m、k=" + rodSpring.toFixed(0) + " N/m。微小角θ、g=9.80 m/s²。",
      questions: [
        expectedQuestion(id, 7, 1, 10, { topic: "rotational", genre: "剛体棒・回転剛性", difficulty: 3, format: "number", prompt: "支点まわりの慣性モーメントと回転剛性を求め、固有角振動数ωnを計算せよ。", answer: rounded(rodAngular, 3) + " rad/s", numericAnswer: rodAngular, expectedUnit: "rad/s", acceptedUnits: units.angular, requiresUnit: true, tolerance: 0.1, formula: "\\begin{aligned}J&=\\frac{1}{3}ml^2\\\\ K_\\theta&=kh^2+\\frac{1}{2}mgl\\\\ \\omega_n&=\\sqrt{\\frac{K_\\theta}{J}}\\end{aligned}", steps: ["一様棒の重心は支点から\\(\\frac{l}{2}\\)にある", "\\(J=\\frac{1}{3}\\times" + rodMass.toFixed(2) + "\\times" + rodLength.toFixed(2) + "^2\\approx" + rounded(rodInertia, 6) + "\\ \\mathrm{kg\\,m^2}\\)", "\\(K_\\theta=" + rodSpring.toFixed(0) + "\\times" + springHeight.toFixed(2) + "^2+\\frac{1}{2}\\times" + rodMass.toFixed(2) + "\\times9.80\\times" + rodLength.toFixed(2) + "\\approx" + rounded(rodRotationalStiffness, 6) + "\\ \\mathrm{N\\,m/rad}\\)", "\\(\\omega_n=\\sqrt{\\frac{" + rounded(rodRotationalStiffness, 6) + "}{" + rounded(rodInertia, 6) + "}}\\approx" + rounded(rodAngular, 6) + "\\ \\mathrm{rad/s}\\)"], diagram: "spring-rigid-rod", explanation: "並進ばねを回転剛性へ換算し、棒の慣性モーメントと重力復元項をまとめる三段階問題。" }),
      ],
    },
  ];

  const questions = sections.flatMap((section) => section.questions);
  const totalPoints = questions.reduce((sum, item) => sum + item.points, 0);
  if (sections.length !== 7 || questions.length !== 13 || totalPoints !== 100) {
    throw new Error(id + ": invalid 7-major/13-answer/100-point blueprint");
  }
  const covered = new Set(sections.flatMap((section) => section.topicIds));
  if (MECHANICAL_DYNAMICS_TOPICS.some((topic) => !covered.has(topic.id))) {
    throw new Error(id + ": missing range topic");
  }

  return {
    id,
    kind: "expected",
    number: variant,
    title: "全範囲想定試験 " + String(variant).padStart(2, "0"),
    subtitle: "範囲プリント4枚と同等難度・7大問／13解答欄／100点",
    variant,
    defaultMinutes: 50,
    userAdjustable: true,
    officialMinutes: null,
    totalPoints: 100,
    scoreLabel: "練習用100点",
    passPercent: 60,
    paper: "A4 portrait",
    officialConditionsNote: "範囲プリント4枚と同等のモデル化・多段階計算・図読解で構成。50分は変更可能な練習用初期値。g=9.80 m/s²、π=3.14、有効数字は3桁、単位必須。",
    sections,
    questions,
  };
}
export const MECHANICAL_DYNAMICS_EXPECTED_EXAMS: MechanicalDynamicsExam[] =
  Array.from({ length: 6 }, (_, index) => buildExpectedExam(index + 1));

/**
 * Standalone, past-paper-level questions used by the timed confirmation test.
 * Section conditions are copied onto every item so a shuffled question never loses its setup.
 */
export const MECHANICAL_DYNAMICS_EXAM_LEVEL_QUESTIONS: MechanicalDynamicsExamQuestion[] =
  MECHANICAL_DYNAMICS_EXPECTED_EXAMS.flatMap((exam) =>
    exam.sections.flatMap((section) =>
      section.questions.map((question, index) => {
        const previousPrompts = section.questions
          .slice(0, index)
          .map((previous) => `大問${previous.major}(${previous.sub})：${previous.prompt}`)
          .join(" ／ ");
        return {
          ...question,
          difficulty: 3,
          steps: question.steps.length >= 3 ? question.steps : [...question.steps, "求めた中間値・単位・物理的な妥当性を答案上で照査する。"],
          context: [
            section.context,
            question.context,
            previousPrompts ? `【同じ大問の前問】${previousPrompts}` : "",
          ].filter(Boolean).join("\n"),
        };
      }),
    ),
  );

export const MECHANICAL_DYNAMICS_EXAM_FORMATS = [
  {
    id: "actual-layout",
    title: "実物過去問：7大問・13解答欄・100点",
    description: "大問配点は15・10・15・10・10・30・10点。計算、導出、図を使うモデル化を同じ用紙で問う。",
    strategy: "途中式、3桁以上、単位を必ず残す。Q6の30点は運動方程式→ωn→ζの順に分解する。",
  },
  {
    id: "constants",
    title: "過去問指定定数",
    description: "g=9.80 m/s²、π=3.14を使用する。",
    strategy: "通常のπキーとの差で末尾が変わるため、実物過去問と想定試験では3.14を入力する。",
  },
  {
    id: "range-policy",
    title: "過去問も試験範囲",
    description: "過去問7大問を形式だけでなく学習問題として収録し、ZIP15枚のラプラス変換・回転系も想定試験へ含める。",
    strategy: "過去問を一度解いた後、6セットの想定試験で全6単元を横断する。",
  },
] as const;

export const MECHANICAL_DYNAMICS_SOURCE_POLICY = {
  included: [
    "機械力学範囲ZIPの全15画像",
    "機械力学過去問.pdfの全7大問・13解答欄",
  ],
  excluded: [
    "資料にない強制振動・共振・周波数応答",
    "判読できない薄い個別寸法を推測した自動採点問題",
  ],
  note: "過去問は形式参照だけでなく今回の試験範囲。すべてのカード・通常演習・想定試験に範囲根拠を付ける。",
} as const;

export const MECHANICAL_DYNAMICS_EXAM_SPEC = {
  officialMinutes: null,
  defaultMinutes: 50,
  userAdjustable: true,
  totalPoints: 100,
  passPoints: 60,
  passPercent: 60,
  bigQuestionCount: 7,
  answerFieldCount: 13,
  expectedExamCount: 6,
  paper: "A4 portrait",
  constants: { g: 9.8, pi: 3.14 },
  scoreDisplay: "100点満点・60点ライン",
  sourcePolicy: MECHANICAL_DYNAMICS_SOURCE_POLICY,
} as const;
