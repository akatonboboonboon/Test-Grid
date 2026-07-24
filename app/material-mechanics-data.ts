export type MaterialMechanicsTopicId = "torsion" | "shaft-design" | "coil-spring" | "beam-statics";

export type MaterialMechanicsQuestionFormat = "number" | "choice" | "text" | "diagram" | "derivation";

export type MaterialMechanicsSourceRef = { kind: "range-zip"; page: number; filename: string; note?: string };
export type MaterialMechanicsDiagramKind =
  | "solid-shaft"
  | "hollow-shaft"
  | "coil-spring"
  | "support-types"
  | "simply-supported-point"
  | "simply-supported-udl"
  | "overhang-beam"
  | "overhang-udl"
  | "cantilever-udl"
  | "load-resultants"
  | "sfd-bmd"
  | "overhang-sfd-bmd"
  | "beam-section-stress"
  | "additional-simple-point-rect"
  | "additional-simple-udl-rect"
  | "additional-cantilever-tip-hollow"
  | "additional-cantilever-udl-hollow";

export type MaterialMechanicsTopic = {
  id: MaterialMechanicsTopicId;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  pages: number[];
  color: string;
};

export type MaterialMechanicsRangePage = {
  number: number;
  filename: string;
  topics: MaterialMechanicsTopicId[];
  summary: string;
  orientation: "portrait-source" | "landscape-source";
};

export type MaterialMechanicsFormulaCard = {
  id: string;
  topic: MaterialMechanicsTopicId;
  title: string;
  prompt: string;
  formula: string;
  explanation: string;
  cue: string;
  example?: string;
  diagram?: MaterialMechanicsDiagramKind;
  sourceRefs: MaterialMechanicsSourceRef[];
};

export type MaterialMechanicsQuestion = {
  id: string;
  topic: MaterialMechanicsTopicId;
  topicId: MaterialMechanicsTopicId;
  genre: string;
  difficulty: 1 | 2 | 3;
  format: MaterialMechanicsQuestionFormat;
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
  dependsOn?: string[];
  formula?: string;
  steps: string[];
  explanation: string;
  diagram?: MaterialMechanicsDiagramKind;
  sourceRefs: MaterialMechanicsSourceRef[];
};

export type MaterialMechanicsExamQuestion = MaterialMechanicsQuestion & { major: number; sub: number; points: number };
export type MaterialMechanicsExamSection = {
  number: number;
  title: string;
  topic: MaterialMechanicsTopicId;
  topicIds: MaterialMechanicsTopicId[];
  points: number;
  context: string;
  questions: MaterialMechanicsExamQuestion[];
};
export type MaterialMechanicsExam = {
  id: string;
  kind: "expected";
  number: number;
  title: string;
  subtitle: string;
  variant: number;
  defaultMinutes: 50;
  userAdjustable: true;
  officialMinutes: null;
  totalPoints: 100;
  scoreLabel: string;
  passPercent: 60;
  paper: "A4 portrait";
  officialConditionsNote: string;
  sections: MaterialMechanicsExamSection[];
  questions: MaterialMechanicsExamQuestion[];
};

const RANGE_FILENAMES = [
  "PXL_20260717_135722301.jpg",
  "PXL_20260717_135732120.jpg",
  "PXL_20260717_135735401.jpg",
  "PXL_20260717_135743612.jpg",
  "PXL_20260717_135747948.jpg",
  "PXL_20260717_135755612.jpg",
  "PXL_20260717_135759152.jpg",
  "PXL_20260717_135806323.jpg",
  "材力テスト範囲プリント.jpg",
  "PXL_20260722_061249575.MP.jpg",
  "PXL_20260722_061315221.MP.jpg",
  "PXL_20260722_061318328.MP.jpg",
  "PXL_20260722_061322324.MP.jpg",
] as const;

function rangeRef(page: number, note?: string): MaterialMechanicsSourceRef {
  const filename = RANGE_FILENAMES[page - 1];
  if (!filename) throw new Error("Unknown material-mechanics range page " + page);
  return { kind: "range-zip", page, filename, note };
}

export const MATERIAL_MECHANICS_RANGE_PAGES: MaterialMechanicsRangePage[] = [
  { number: 1, filename: RANGE_FILENAMES[0], topics: ["torsion"], summary: "丸軸のねじり、せん断ひずみ・せん断応力の半径方向分布、トルクの積分。", orientation: "portrait-source" },
  { number: 2, filename: RANGE_FILENAMES[1], topics: ["torsion", "shaft-design"], summary: "極断面二次モーメント、直交軸の定理、中実・中空円形断面。", orientation: "landscape-source" },
  { number: 3, filename: RANGE_FILENAMES[2], topics: ["torsion", "shaft-design"], summary: "ねじり角、ねじり剛性、極断面係数、最大せん断応力。", orientation: "landscape-source" },
  { number: 4, filename: RANGE_FILENAMES[3], topics: ["coil-spring"], summary: "密巻コイルばねを丸軸のねじりへ置換し、ばね定数・たわみを導く。", orientation: "landscape-source" },
  { number: 5, filename: RANGE_FILENAMES[4], topics: ["beam-statics"], summary: "はりの種類、支点、集中荷重・分布荷重・合力の位置。", orientation: "landscape-source" },
  { number: 6, filename: RANGE_FILENAMES[5], topics: ["beam-statics"], summary: "単純支持ばりの支点反力を力とモーメントのつり合いから求める。", orientation: "landscape-source" },
  { number: 7, filename: RANGE_FILENAMES[6], topics: ["beam-statics"], summary: "片持ちばりの反力・固定端モーメントと分布荷重の扱い。", orientation: "landscape-source" },
  { number: 8, filename: RANGE_FILENAMES[7], topics: ["beam-statics"], summary: "せん断力図SFDと曲げモーメント図BMDの符号・形状。", orientation: "landscape-source" },
  { number: 9, filename: RANGE_FILENAMES[8], topics: ["torsion", "shaft-design", "coil-spring"], summary: "ねじり・中空軸・密巻コイルばねのまとめ演習と確認値。", orientation: "portrait-source" },
  { number: 10, filename: RANGE_FILENAMES[9], topics: ["beam-statics"], summary: "追加範囲の問題用紙。単純支持（偏心集中・全長等分布）と片持ち（自由端集中・全長等分布）の4ケース。", orientation: "portrait-source" },
  { number: 11, filename: RANGE_FILENAMES[10], topics: ["beam-statics"], summary: "追加範囲4ケースの反力、SFD・BMD、曲げ応力に関する手書き解法ノート。", orientation: "portrait-source" },
  { number: 12, filename: RANGE_FILENAMES[11], topics: ["beam-statics"], summary: "追加範囲4ケースのV(x)・M(x)、最大曲げモーメントに関する手書き解法ノート。", orientation: "portrait-source" },
  { number: 13, filename: RANGE_FILENAMES[12], topics: ["beam-statics"], summary: "追加範囲4ケースのSFD・BMDと最大曲げ応力に関する手書き解法ノート。", orientation: "portrait-source" },
];

export const MATERIAL_MECHANICS_TOPICS: MaterialMechanicsTopic[] = [
  { id: "torsion", number: "01", title: "丸軸のねじり", shortTitle: "ねじり基礎", description: "せん断ひずみ、せん断応力、トルク、ねじり角を式の意味から扱う。", pages: [1, 2, 3, 9], color: "#ffbd59" },
  { id: "shaft-design", number: "02", title: "中実・中空軸の設計", shortTitle: "軸設計", description: "極断面二次モーメント、極断面係数、伝達動力、許容応力設計を扱う。", pages: [2, 3, 9], color: "#ff8e5b" },
  { id: "coil-spring", number: "03", title: "密巻コイルばね", shortTitle: "コイルばね", description: "ばね定数、たわみ、線材に生じるねじり応力を扱う。", pages: [4, 9], color: "#d998ff" },
  { id: "beam-statics", number: "04", title: "はりの反力・SFD・BMD・曲げ応力", shortTitle: "はり", description: "支点、等価集中荷重、反力、せん断力図、曲げモーメント図、断面二次モーメント・断面係数と曲げ応力を扱う。", pages: [5, 6, 7, 8, 10, 11, 12, 13], color: "#63d8cb" },
];

type FormulaSeed = Omit<MaterialMechanicsFormulaCard, "sourceRefs"> & { pages: number[] };
const FORMULA_SEEDS: FormulaSeed[] = [
  { id: "mm-f-bending-stress", topic: "beam-statics", title: "曲げ応力の基本式", prompt: "中立軸から距離yの曲げ応力と、最外縁の最大曲げ応力は？", formula: "\\sigma=\\frac{My}{I}=\\frac{M}{Z}", explanation: "曲げ応力は中立軸で0、最外縁で最大となる。Iは曲げに対する断面二次モーメント、Z=I/cは断面係数であり、ねじりの極断面量Ip・Zpとは区別する。", cue: "曲げはIとZ（Ip・Zpではない）", diagram: "beam-section-stress", pages: [10, 11, 12, 13] },
  { id: "mm-f-rectangle-bending", topic: "beam-statics", title: "長方形断面の曲げ断面量", prompt: "幅b、高さhの長方形断面のIとZは？", formula: "I=\\frac{bh^3}{12},\\qquad Z=\\frac{bh^2}{6}", explanation: "高さhの3乗・2乗が効く。曲げ軸に対するIを用い、最外縁距離h/2で割るとZになる。", cue: "長方形：Iは12、Zは6", diagram: "additional-simple-point-rect", pages: [10, 11] },
  { id: "mm-f-hollow-bending", topic: "beam-statics", title: "中空円断面の曲げ断面量", prompt: "外径do、内径diの中空円断面のIとZは？", formula: "I=\\frac{\\pi(d_o^4-d_i^4)}{64},\\qquad Z=\\frac{\\pi(d_o^4-d_i^4)}{32d_o}", explanation: "曲げのIは64分のπで、Zは最外縁do/2で割る。ねじりのIp・Zpとは係数が異なる。", cue: "中空円の曲げ：64と32do", diagram: "additional-cantilever-tip-hollow", pages: [12, 13] },
  { id: "mm-f-simple-point-general", topic: "beam-statics", title: "単純支持ばりの偏心集中荷重", prompt: "支間L=a+bで左支点からaの位置に集中荷重Pがあるときの反力とMmaxは？", formula: "R_A=\\frac{Pb}{L},\\qquad R_B=\\frac{Pa}{L},\\qquad M_{max}=\\frac{Pab}{L}", explanation: "モーメントのつり合いで反力を求め、荷重点で左右の曲げモーメントが一致して最大となる。", cue: "反力は反対側距離、最大MはPab/L", diagram: "additional-simple-point-rect", pages: [10] },
  { id: "mm-f-cantilever-tip", topic: "beam-statics", title: "片持ちばりの自由端集中荷重", prompt: "長さLの片持ちばり自由端に集中荷重Pが作用するときの固定端反力とモーメントは？", formula: "R=P,\\qquad |M_0|=PL", explanation: "せん断力は全長で一定、曲げモーメントは自由端0から固定端へ直線的に増え、固定端で絶対値が最大となる。", cue: "自由端荷重：PとPL", diagram: "additional-cantilever-tip-hollow", pages: [12] },
  { id: "mm-f-cantilever-udl-free", topic: "beam-statics", title: "片持ちばり等分布荷重（自由端座標）", prompt: "自由端をx=0とする全長等分布荷重wのV(x)、M(x)、固定端最大値は？", formula: "V(x)=-wx,\\qquad M(x)=-\\frac{wx^2}{2},\\qquad |M_0|=\\frac{wL^2}{2}", explanation: "自由端条件V(0)=M(0)=0から積分する。固定端x=Lで曲げモーメントの絶対値が最大となる。", cue: "自由端からx：Vは一次、Mは二次", diagram: "additional-cantilever-udl-hollow", pages: [13] },
  { id: "mm-f-shear-strain", topic: "torsion", title: "ねじりのせん断ひずみ", prompt: "軸中心から半径rのせん断ひずみは？", formula: "\\gamma(r)=r\\frac{d\\theta}{dx}", explanation: "同じ断面の回転でも外側ほど移動距離が大きいため、ひずみは半径に比例する。", cue: "半径×単位長さ当たりのねじれ", diagram: "solid-shaft", pages: [1] },
  { id: "mm-f-shear-stress", topic: "torsion", title: "せん断応力分布", prompt: "フックの法則を使ったせん断応力は？", formula: "\\tau(r)=G\\gamma(r)=Gr\\frac{d\\theta}{dx}", explanation: "線形弾性範囲ではせん断応力はせん断ひずみに横弾性係数Gを掛ける。", cue: "G×ひずみ、外周が最大", diagram: "solid-shaft", pages: [1] },
  { id: "mm-f-polar-moment", topic: "torsion", title: "極断面二次モーメント", prompt: "極断面二次モーメントの定義と直交軸の関係は？", formula: "I_p=\\int_A r^2\\,dA=I_x+I_y", explanation: "断面の各微小面積を軸中心からの距離の二乗で重み付けした量。", cue: "r²を面積積分", pages: [1, 2] },
  { id: "mm-f-torque", topic: "torsion", title: "トルクとねじれ率", prompt: "トルクT、G、Ip、ねじれ率の関係は？", formula: "T=GI_p\\frac{d\\theta}{dx}", explanation: "微小トルクdT=τr dAを断面全体で積分すると得られる。", cue: "ねじり剛性はGIp", diagram: "solid-shaft", pages: [1, 2] },
  { id: "mm-f-twist", topic: "torsion", title: "ねじり角", prompt: "一様な丸軸の全ねじり角Θは？", formula: "\\Theta=\\frac{TL}{GI_p}", explanation: "ねじれ率が一定なら長さLにわたって積分する。角度計算ではdegreeをradへ直す。", cue: "TLをGIpで割る", example: "7^\\circ=7\\pi/180\\,\\mathrm{rad}", diagram: "solid-shaft", pages: [3, 9] },
  { id: "mm-f-tau-max", topic: "shaft-design", title: "最大せん断応力", prompt: "外周の最大せん断応力は？", formula: "\\tau_{\\max}=\\frac{TR}{I_p}=\\frac{T}{Z_p}", explanation: "τはrに比例するのでr=Rの外周が最大となる。", cue: "T÷極断面係数", diagram: "solid-shaft", pages: [2, 3, 9] },
  { id: "mm-f-solid", topic: "shaft-design", title: "中実丸軸の断面量", prompt: "直径dの中実丸軸のIpとZpは？", formula: "\\begin{aligned}I_p&=\\frac{\\pi d^4}{32}\\\\ Z_p&=\\frac{2I_p}{d}=\\frac{\\pi d^3}{16}\\end{aligned}", explanation: "極断面係数は極断面二次モーメントを最外半径で割る。", cue: "Ipはd⁴/32、Zpはd³/16", diagram: "solid-shaft", pages: [2, 3, 9] },
  { id: "mm-f-hollow", topic: "shaft-design", title: "中空丸軸の断面量", prompt: "外径do、内径diの中空丸軸のIpとZpは？", formula: "\\begin{aligned}I_p&=\\frac{\\pi}{32}(d_o^4-d_i^4)\\\\ Z_p&=\\frac{\\pi}{16d_o}(d_o^4-d_i^4)\\end{aligned}", explanation: "外側の中実円から内側の空孔を差し引く。", cue: "外径4乗−内径4乗", diagram: "hollow-shaft", pages: [2, 9] },
  { id: "mm-f-hollow-ratio", topic: "shaft-design", title: "内外径比で表すZp", prompt: "n=di/doとすると中空軸のZpは？", formula: "Z_p=\\frac{\\pi d_o^3}{16}(1-n^4)", explanation: "di=n doを代入してdo³をくくる。許容応力から外径を直接設計できる。", cue: "中実式×(1−n⁴)", diagram: "hollow-shaft", pages: [9] },
  { id: "mm-f-power", topic: "shaft-design", title: "動力とトルク", prompt: "回転軸の動力P、トルクT、角速度ωの関係は？", formula: "P=T\\omega,\\qquad \\omega=\\frac{2\\pi N}{60}", explanation: "Nをrpmで与えたときは毎秒の角速度へ変換する。", cue: "動力＝トルク×角速度", pages: [9] },
  { id: "mm-f-spring-rate", topic: "coil-spring", title: "密巻コイルばねのばね定数", prompt: "線径d、平均半径R、有効巻数nのばね定数は？", formula: "k=\\frac{Gd^4}{64nR^3}=\\frac{Gd^4}{8nD^3}", explanation: "線材の長さ2πRnとトルクPRを丸軸のねじり式へ入れて導く。", cue: "d⁴に比例、R³と巻数に反比例", diagram: "coil-spring", pages: [4, 9] },
  { id: "mm-f-spring-deflection", topic: "coil-spring", title: "ばねのたわみ", prompt: "荷重Pを受けるばねのたわみδは？", formula: "\\delta=\\frac{P}{k}=\\frac{64nPR^3}{Gd^4}", explanation: "ばね定数の定義P=kδを変形する。", cue: "荷重÷ばね定数", diagram: "coil-spring", pages: [4, 9] },
  { id: "mm-f-spring-stress", topic: "coil-spring", title: "ばね線材のねじり応力", prompt: "荷重P、平均半径Rの密巻ばねの最大せん断応力は？", formula: "T=PR,\\qquad \\tau_{\\max}=\\frac{16PR}{\\pi d^3}", explanation: "範囲資料と同じ、直接せん断と応力集中を無視した基本式。", cue: "荷重×半径を線材のトルクにする", diagram: "coil-spring", pages: [4, 9] },
  { id: "mm-f-resultant", topic: "beam-statics", title: "分布荷重の合力", prompt: "分布荷重w(x)を集中荷重へ置き換える式は？", formula: "W=\\int w(x)\\,dx,\\qquad \\bar{x}=\\frac{\\int xw(x)\\,dx}{W}", explanation: "荷重図の面積が合力、面積図心が作用位置となる。", cue: "面積と図心", diagram: "load-resultants", pages: [5, 6, 7] },
  { id: "mm-f-equilibrium", topic: "beam-statics", title: "はりのつり合い", prompt: "鉛直荷重を受けるはりの反力計算に使う2式は？", formula: "\\sum F_y=0,\\qquad \\sum M_O=0", explanation: "力のつり合いと任意点まわりのモーメントのつり合いを組み合わせる。", cue: "力とモーメント", diagram: "simply-supported-point", pages: [5, 6, 7] },
  { id: "mm-f-beam-diff", topic: "beam-statics", title: "荷重・せん断力・曲げモーメント", prompt: "w、V、Mの微分関係は？", formula: "\\frac{dV}{dx}=-w(x),\\qquad \\frac{dM}{dx}=V(x)", explanation: "分布荷重を積分するとせん断力、さらに積分すると曲げモーメントになる。", cue: "w→V→Mと積分", diagram: "sfd-bmd", pages: [8] },
  { id: "mm-f-cantilever", topic: "beam-statics", title: "片持ちばりの等分布荷重", prompt: "全長Lに等分布荷重wを受ける固定端反力と固定端モーメントは？", formula: "R=wL,\\qquad M_0=\\frac{wL^2}{2}", explanation: "合力wLが固定端からL/2に作用する。", cue: "合力×L/2", diagram: "cantilever-udl", pages: [7, 8] },
  { id: "mm-f-simple-udl", topic: "beam-statics", title: "単純支持ばりの等分布荷重", prompt: "全長Lに等分布荷重wが対称に作用するときの反力は？", formula: "R_A=R_B=\\frac{wL}{2}", explanation: "合力wLが中央に作用し、左右対称なので半分ずつ負担する。", cue: "左右で半分", diagram: "simply-supported-udl", pages: [5, 6] },
];

export const MATERIAL_MECHANICS_FORMULAS: MaterialMechanicsFormulaCard[] = FORMULA_SEEDS.map(({ pages, ...card }) => ({ ...card, sourceRefs: pages.map((page) => rangeRef(page)) }));

type QuestionSeed = Omit<MaterialMechanicsQuestion, "topicId" | "sourceRefs"> & { pages: number[] };
function question(seed: QuestionSeed): MaterialMechanicsQuestion {
  const { pages, ...item } = seed;
  return { ...item, topicId: item.topic, sourceRefs: pages.map((page) => rangeRef(page)) };
}
const stressUnits = { MPa: 1, "N/mm2": 1, GPa: 1000 };
const gpaUnits = { GPa: 1, MPa: 0.001, Pa: 1e-9 };
const torqueUnits = { "N*m": 1, "kN*m": 1000, "N*mm": 0.001 };
const lengthUnits = { mm: 1, m: 1000 };
const forceUnits = { N: 1, kN: 1000 };
const stiffnessUnits = { "N/mm": 1, "kN/m": 1, "N/m": 0.001 };

export const MATERIAL_MECHANICS_QUESTIONS: MaterialMechanicsQuestion[] = [
  question({ id: "mm-q-add-c3-reactions", topic: "beam-statics", genre: "追加例題3・固定端反力", difficulty: 2, format: "text", context: "長さL=2.0 mの片持ちばり自由端にP=4.0 kNが下向きに作用する。断面は外径do=100 mm、内径di=80 mmの中空円。", prompt: "固定端の鉛直反力Rと反力モーメントの大きさ|M0|を求めよ。", answer: "\\(R=4.0\\,\\mathrm{kN},\\;|M_0|=8.0\\,\\mathrm{kN\\,m}\\)", keywords: ["4.0", "8.0", "上向き"], minKeywords: 2, formula: "R=P,\\quad |M_0|=PL", steps: ["鉛直力のつり合いから固定端反力は荷重と逆向きで\\(R=P=4.0\\,\\mathrm{kN}\\)。", "荷重Pの固定端まわり腕長はL=2.0 m。", "\\(|M_0|=PL=4.0(2.0)=8.0\\,\\mathrm{kN m}\\)。反力モーメントは荷重の回転を打ち消す向き。"], explanation: "固定端は力反力とモーメント反力の両方を持つ。", diagram: "additional-cantilever-tip-hollow", pages: [10, 11, 12, 13] }),
  question({ id: "mm-q-add-c3-mmax", topic: "beam-statics", genre: "追加例題3・SFD/BMD", difficulty: 3, format: "number", context: "L=2.0 mの片持ちばり自由端にP=4.0 kN。自由端から固定端へxを測る。", prompt: "V(x)、M(x)とSFD/BMDの形を確認し、最大曲げモーメントの大きさを求めよ。", answer: "8.0 kN·m", numericAnswer: 8000, expectedUnit: "N·m", acceptedUnits: torqueUnits, requiresUnit: true, tolerance: 40, formula: "V(x)=-P,\\quad M(x)=-Px,\\quad |M_{max}|=PL", steps: ["自由端荷重直後から固定端まで\\(V(x)=-4.0\\) kNで、SFDは一定。", "自由端条件M(0)=0より\\(M(x)=-4.0x\\) kN·mで、BMDは三角形。", "固定端x=2.0 mで\\(|M_{max}|=4.0(2.0)=8.0\\,\\mathrm{kN m}\\)。"], explanation: "負号は曲げの向きを表し、応力の大きさには|Mmax|を使う。", diagram: "additional-cantilever-tip-hollow", pages: [10, 11, 12, 13] }),
  question({ id: "mm-q-add-c3-stress", topic: "beam-statics", genre: "追加例題3・中空円曲げ応力", difficulty: 3, format: "number", context: "|Mmax|=8.0 kN·m。中空円断面do=100 mm、di=80 mm。", prompt: "曲げのIとZを求め、最大曲げ応力の大きさを求めよ。", answer: "138.02 MPa", numericAnswer: 138.02, expectedUnit: "MPa", acceptedUnits: stressUnits, requiresUnit: true, tolerance: 0.15, formula: "I=\\frac{\\pi(d_o^4-d_i^4)}{64},\\quad Z=\\frac{\\pi(d_o^4-d_i^4)}{32d_o}", steps: ["\\(I=\\pi(100^4-80^4)/64=2.8981\\times10^6\\,\\mathrm{mm^4}\\)。これは曲げのIであり極断面二次モーメントIpではない。", "\\(Z=I/(d_o/2)=57962.4\\,\\mathrm{mm^3}\\)。", "\\(\\sigma_{max}=8.0\\times10^6/57962.4=138.02\\,\\mathrm{MPa}\\)。"], explanation: "中空円の曲げ断面係数はπ(do⁴−di⁴)/(32do)。ねじり用Zpの半分になる。", diagram: "additional-cantilever-tip-hollow", pages: [10, 11, 12, 13] }),
  question({ id: "mm-q-add-c4-reactions", topic: "beam-statics", genre: "追加例題4・固定端反力", difficulty: 2, format: "text", context: "長さL=3.0 mの片持ちばり全体にw=0.50 kN/mの下向き等分布荷重。断面はdo=100 mm、di=80 mmの中空円。", prompt: "合力、固定端鉛直反力R、反力モーメントの大きさ|M0|を求めよ。", answer: "合力1.50 kNが中央に作用し、\\(R=1.50\\,\\mathrm{kN},\\;|M_0|=2.25\\,\\mathrm{kN\\,m}\\)", keywords: ["1.50", "2.25", "中央"], minKeywords: 3, formula: "R=wL,\\quad |M_0|=\\frac{wL^2}{2}", steps: ["荷重図の面積から合力\\(W=wL=0.50(3.0)=1.50\\,\\mathrm{kN}\\)。", "合力は固定端からL/2=1.50 mの位置に作用する。", "\\(R=W=1.50\\,\\mathrm{kN}\\)、\\(|M_0|=W(L/2)=1.50(1.50)=2.25\\,\\mathrm{kN m}\\)。"], explanation: "固定端反力は次問のSFD/BMD端値と一致する。", diagram: "additional-cantilever-udl-hollow", pages: [10, 11, 12, 13] }),
  question({ id: "mm-q-add-c4-mmax", topic: "beam-statics", genre: "追加例題4・SFD/BMD", difficulty: 3, format: "number", context: "L=3.0 m、w=0.50 kN/m。自由端をx=0、固定端をx=Lとする。", prompt: "V(x)、M(x)を示してSFD/BMDを説明し、最大曲げモーメントの大きさを求めよ。", answer: "2.25 kN·m", numericAnswer: 2250, expectedUnit: "N·m", acceptedUnits: torqueUnits, requiresUnit: true, tolerance: 20, formula: "V(x)=-wx,\\quad M(x)=-\\frac{wx^2}{2}", steps: ["自由端条件V(0)=0から\\(V(x)=-0.50x\\) kN。SFDは三角形。", "自由端条件M(0)=0から\\(M(x)=-0.25x^2\\) kN·m。BMDは放物線。", "固定端x=3.0 mで\\(|M_{max}|=0.50(3.0)^2/2=2.25\\,\\mathrm{kN m}\\)。"], explanation: "自由端座標ではV=-wx、M=-wx²/2となり、いずれも固定端で絶対値最大。", diagram: "additional-cantilever-udl-hollow", pages: [10, 11, 12, 13] }),
  question({ id: "mm-q-add-c4-stress", topic: "beam-statics", genre: "追加例題4・中空円曲げ応力", difficulty: 3, format: "number", context: "|Mmax|=2.25 kN·m。中空円断面do=100 mm、di=80 mm。", prompt: "最大曲げ応力の大きさを求めよ。", answer: "38.82 MPa", numericAnswer: 38.82, expectedUnit: "MPa", acceptedUnits: stressUnits, requiresUnit: true, tolerance: 0.12, formula: "\\sigma_{max}=\\frac{|M_{max}|}{Z},\\quad Z=\\frac{\\pi(d_o^4-d_i^4)}{32d_o}", steps: ["曲げ断面係数\\(Z=\\pi(100^4-80^4)/(32(100))=57962.4\\,\\mathrm{mm^3}\\)。", "\\(|M_{max}|=2.25\\times10^6\\,\\mathrm{Nmm}\\)。", "\\(\\sigma_{max}=2.25\\times10^6/57962.4=38.82\\,\\mathrm{MPa}\\)。"], explanation: "同じ中空円断面でも荷重状態が変わればMmaxが変わり、応力はMmaxに比例する。", diagram: "additional-cantilever-udl-hollow", pages: [10, 11, 12, 13] }),
  question({ id: "mm-q-add-c1-reactions", topic: "beam-statics", genre: "追加例題1・支点反力", difficulty: 2, format: "text", context: "支間L=4.0 mの単純支持ばり。左支点Aからa=2.5 m（右支点Bまでb=1.5 m）の位置にP=8.0 kNが下向きに作用する。断面は幅50 mm、高さ120 mmの長方形。", prompt: "支点反力RA、RBを求めよ。", answer: "\\(R_A=3.0\\,\\mathrm{kN},\\;R_B=5.0\\,\\mathrm{kN}\\)（ともに上向き）", keywords: ["3.0", "5.0", "上向き"], minKeywords: 3, formula: "R_A=\\frac{Pb}{L},\\quad R_B=\\frac{Pa}{L}", steps: ["B点回りまたは一般式から、A反力には反対側距離b=1.5 mを掛ける。", "\\(R_A=8.0(1.5)/4.0=3.0\\,\\mathrm{kN}\\)。", "\\(R_B=8.0(2.5)/4.0=5.0\\,\\mathrm{kN}\\)、確認：RA+RB=P=8.0 kN。"], explanation: "偏心集中荷重では近い支点Bの反力が大きくなる。次問のSFD/BMDへ反力を引き継ぐ。", diagram: "additional-simple-point-rect", pages: [10, 11, 12, 13] }),
  question({ id: "mm-q-add-c1-mmax", topic: "beam-statics", genre: "追加例題1・SFD/BMD", difficulty: 3, format: "number", context: "L=4.0 m、P=8.0 kN、a=2.5 m、b=1.5 m、RA=3.0 kN、RB=5.0 kN。", prompt: "SFD/BMDの要点を確認し、最大曲げモーメントMmaxを求めよ。", answer: "7.50 kN·m", numericAnswer: 7500, expectedUnit: "N·m", acceptedUnits: torqueUnits, requiresUnit: true, tolerance: 30, formula: "M_{max}=R_Aa=\\frac{Pab}{L}", steps: ["荷重点の左ではV=+3.0 kN、右ではV=3.0-8.0=-5.0 kNとなり、荷重点で符号が変わる。", "BMDはAの0から荷重点まで傾き+3.0で直線増加し、その後傾き-5.0でBの0へ戻る。", "\\(M_{max}=3.0(2.5)=Pab/L=8.0(2.5)(1.5)/4.0=7.50\\,\\mathrm{kN m}\\)。"], explanation: "集中荷重位置でVが正から負へ変わるため、同位置でMが最大となる。", diagram: "additional-simple-point-rect", pages: [10, 11, 12, 13] }),
  question({ id: "mm-q-add-c1-stress", topic: "beam-statics", genre: "追加例題1・長方形曲げ応力", difficulty: 3, format: "number", context: "Mmax=7.50 kN·m。長方形断面は幅b=50 mm、高さh=120 mm。", prompt: "断面係数Zを求め、最大曲げ応力の大きさを求めよ。", answer: "62.5 MPa", numericAnswer: 62.5, expectedUnit: "MPa", acceptedUnits: stressUnits, requiresUnit: true, tolerance: 0.2, formula: "Z=\\frac{bh^2}{6},\\quad \\sigma_{max}=\\frac{M_{max}}{Z}", steps: ["曲げの断面係数は\\(Z=50(120)^2/6=120000\\,\\mathrm{mm^3}\\)。極断面係数Zpは使わない。", "\\(M_{max}=7.50\\times10^6\\,\\mathrm{Nmm}\\)へ単位変換する。", "\\(\\sigma_{max}=7.50\\times10^6/120000=62.5\\,\\mathrm{N/mm^2}=62.5\\,\\mathrm{MPa}\\)。"], explanation: "上下縁で引張・圧縮の符号は逆だが、最大値の大きさは同じ。", diagram: "additional-simple-point-rect", pages: [10, 11, 12, 13] }),
  question({ id: "mm-q-add-c2-reactions", topic: "beam-statics", genre: "追加例題2・支点反力", difficulty: 2, format: "text", context: "支間L=4.0 mの単純支持ばり全体にw=6.0 kN/mの下向き等分布荷重。断面は幅50 mm、高さ120 mmの長方形。", prompt: "等価集中荷重と支点反力RA、RBを求めよ。", answer: "合力24.0 kNが中央に作用し、\\(R_A=R_B=12.0\\,\\mathrm{kN}\\)（上向き）", keywords: ["24.0", "12.0", "中央"], minKeywords: 3, formula: "W=wL,\\quad R_A=R_B=\\frac{wL}{2}", steps: ["分布荷重図の面積から\\(W=6.0(4.0)=24.0\\,\\mathrm{kN}\\)。", "長方形荷重図の図心は支間中央x=L/2=2.0 m。", "左右対称かつRA+RB=Wより\\(R_A=R_B=12.0\\,\\mathrm{kN}\\)。"], explanation: "反力を次問のV(x)、M(x)の初期値として使う。", diagram: "additional-simple-udl-rect", pages: [10, 11, 12, 13] }),
  question({ id: "mm-q-add-c2-mmax", topic: "beam-statics", genre: "追加例題2・SFD/BMD", difficulty: 3, format: "number", context: "L=4.0 m、w=6.0 kN/m、RA=RB=12.0 kN。", prompt: "V(x)、M(x)から最大曲げモーメントMmaxを求めよ。", answer: "12.0 kN·m", numericAnswer: 12000, expectedUnit: "N·m", acceptedUnits: torqueUnits, requiresUnit: true, tolerance: 50, formula: "V=R_A-wx,\\quad M=R_Ax-\\frac{wx^2}{2}", steps: ["\\(V(x)=12.0-6.0x\\) kNは直線で、V=0よりx=2.0 m。", "\\(M(x)=12.0x-3.0x^2\\) kN·mは両端0の放物線。", "中央へ代入し\\(M_{max}=12.0(2.0)-3.0(2.0)^2=12.0\\,\\mathrm{kN m}=wL^2/8\\)。"], explanation: "SFDは直線、BMDは放物線となり、V=0の中央でMが最大。", diagram: "additional-simple-udl-rect", pages: [10, 11, 12, 13] }),
  question({ id: "mm-q-add-c2-stress", topic: "beam-statics", genre: "追加例題2・長方形曲げ応力", difficulty: 3, format: "number", context: "Mmax=12.0 kN·m。長方形断面は幅b=50 mm、高さh=120 mm。", prompt: "最大曲げ応力の大きさを求めよ。", answer: "100 MPa", numericAnswer: 100, expectedUnit: "MPa", acceptedUnits: stressUnits, requiresUnit: true, tolerance: 0.3, formula: "I=\\frac{bh^3}{12},\\quad Z=\\frac{bh^2}{6},\\quad \\sigma_{max}=\\frac{M_{max}}{Z}", steps: ["\\(I=50(120)^3/12=7.20\\times10^6\\,\\mathrm{mm^4}\\)。", "\\(Z=I/(h/2)=50(120)^2/6=120000\\,\\mathrm{mm^3}\\)。", "\\(\\sigma_{max}=12.0\\times10^6/120000=100\\,\\mathrm{MPa}\\)。"], explanation: "曲げには断面二次モーメントIと断面係数Zを使い、極断面量Ip・Zpは使わない。", diagram: "additional-simple-udl-rect", pages: [10, 11, 12, 13] }),
  question({ id: "mm-q-strain-distribution", topic: "torsion", genre: "応力分布", difficulty: 1, format: "choice", prompt: "一様な中実丸軸をねじったとき、せん断応力τの半径方向分布として正しいものを選べ。", answer: "中心で0、外周へ向かって直線的に増加する", options: ["断面全体で一定", "中心で最大、外周で0", "中心で0、外周へ向かって直線的に増加する", "半径によらず放物線状に減少する"], formula: "\\tau(r)=\\frac{Tr}{I_p}", steps: ["\\(\\tau=Gr\\,d\\theta/dx\\)より半径rに比例する。", "したがってr=0で0、r=Rで最大。"], explanation: "ねじりのせん断応力は外周ほど大きい。問題図は応力の向きと外周最大を示すが、選択肢の答えは図中に書いていない。", diagram: "solid-shaft", pages: [1, 3] }),
  question({ id: "mm-q-ip-definition", topic: "torsion", genre: "定義", difficulty: 1, format: "text", prompt: "極断面二次モーメントIpの積分定義と、直交する断面二次モーメントIx、Iyとの関係を書け。", answer: "\\(I_p=\\int_A r^2\\,dA=I_x+I_y\\)", accepted: ["Ip=∫r²dA=Ix+Iy"], keywords: ["r^2", "I_x+I_y"], minKeywords: 2, formula: "I_p=\\int_A r^2\\,dA=I_x+I_y", steps: ["極Oから微小面積dAまでの距離をrとする。", "\\(r^2=x^2+y^2\\)を面積積分する。"], explanation: "範囲ノート2ページの定義と直交軸の関係。", pages: [1, 2] }),
  question({ id: "mm-q-solid-g", topic: "torsion", genre: "まとめ演習1(1)", difficulty: 2, format: "number", context: "直径d=20 mm、長さL=300 mmの中実丸軸。トルクT=500 N·m、ねじれ角Θ=7.0°。", prompt: "横弾性係数Gを求めよ。", answer: "78.2 GPa", numericAnswer: 78.2, expectedUnit: "GPa", acceptedUnits: gpaUnits, requiresUnit: true, tolerance: 0.5, formula: "G=\\frac{TL}{\\Theta I_p},\\quad I_p=\\frac{\\pi d^4}{32}", steps: ["\\(I_p=\\pi(20)^4/32=1.571\\times10^4\\,\\mathrm{mm^4}\\)", "\\(T=5.00\\times10^5\\,\\mathrm{Nmm},\\;\\Theta=7\\pi/180=0.1222\\,\\mathrm{rad}\\)", "\\(G=TL/(\\Theta I_p)=7.82\\times10^4\\,\\mathrm{N/mm^2}=78.2\\,\\mathrm{GPa}\\)"], explanation: "度をradへ、N·mをN·mmへ直してから代入する。", diagram: "solid-shaft", pages: [9] }),
  question({ id: "mm-q-solid-stress", topic: "shaft-design", genre: "まとめ演習1(2)", difficulty: 2, format: "number", context: "直径d=20 mmの中実丸軸にトルクT=500 N·mを加える。", prompt: "外表面の最大せん断応力を求めよ。", answer: "318 MPa", numericAnswer: 318.3, expectedUnit: "MPa", acceptedUnits: stressUnits, requiresUnit: true, tolerance: 1, formula: "\\tau_{\\max}=\\frac{16T}{\\pi d^3}", steps: ["\\(T=5.00\\times10^5\\,\\mathrm{Nmm}\\)", "\\(\\tau_{\\max}=16(5.00\\times10^5)/(\\pi20^3)=318.3\\,\\mathrm{N/mm^2}\\)"], explanation: "N/mm²とMPaは同じ数値になる。", diagram: "solid-shaft", pages: [9] }),
  question({ id: "mm-q-hollow-ip", topic: "shaft-design", genre: "断面量", difficulty: 1, format: "number", context: "外径do=60 mm、内径di=40 mmの中空丸軸。", prompt: "極断面二次モーメントIpを求めよ。", answer: "1.02×10^6 mm^4", numericAnswer: 1021017.6, expectedUnit: "mm^4", acceptedUnits: { mm4: 1 }, requiresUnit: true, tolerance: 3000, formula: "I_p=\\frac{\\pi}{32}(d_o^4-d_i^4)", steps: ["\\(60^4-40^4=1.04\\times10^7\\,\\mathrm{mm^4}\\)", "\\(I_p=\\pi(1.04\\times10^7)/32=1.021\\times10^6\\,\\mathrm{mm^4}\\)"], explanation: "穴の部分の極断面二次モーメントを外径側から差し引く。", diagram: "hollow-shaft", pages: [2] }),
  question({ id: "mm-q-power-torque", topic: "shaft-design", genre: "まとめ演習2(1)", difficulty: 2, format: "number", context: "動力P=200 kWを回転数N=120 rpmで伝達する中空軸。", prompt: "伝達トルクTを求めよ。", answer: "15.9 kN·m", numericAnswer: 15915.5, expectedUnit: "N·m", acceptedUnits: torqueUnits, requiresUnit: true, tolerance: 40, formula: "T=\\frac{P}{\\omega},\\quad \\omega=\\frac{2\\pi N}{60}", steps: ["\\(\\omega=2\\pi(120)/60=12.566\\,\\mathrm{rad/s}\\)", "\\(T=200000/12.566=1.5915\\times10^4\\,\\mathrm{Nm}\\)"], explanation: "rpmをrad/sへ変換してから動力を角速度で割る。", diagram: "hollow-shaft", pages: [9] }),
  question({ id: "mm-q-hollow-zp-derive", topic: "shaft-design", genre: "まとめ演習2(2)", difficulty: 2, format: "derivation", context: "内外径比n=di/doとする。", prompt: "中空軸の極断面係数Zpをdoとnで表せ。", answer: "\\(Z_p=\\frac{\\pi d_o^3}{16}(1-n^4)\\)", accepted: ["Zp=πdo^3(1-n^4)/16"], keywords: ["d_o^3", "1-n^4", "16"], minKeywords: 3, formula: "Z_p=\\frac{2I_p}{d_o}", steps: ["\\(I_p=\\pi(d_o^4-d_i^4)/32\\)", "\\(d_i=nd_o\\)を代入する。", "最外半径\\(d_o/2\\)で割る。"], explanation: "内外径比の4乗が断面効率を決める。", diagram: "hollow-shaft", pages: [9] }),
  question({ id: "mm-q-hollow-diameter", topic: "shaft-design", genre: "まとめ演習2(3)", difficulty: 3, format: "number", context: "伝達トルクT=15.9 kN·m、許容せん断応力τal=200 MPa、内外径比n=0.5。", prompt: "必要な外径doを求めよ。", answer: "75.6 mm", numericAnswer: 75.6, expectedUnit: "mm", acceptedUnits: lengthUnits, requiresUnit: true, tolerance: 0.5, formula: "d_o=\\sqrt[3]{\\frac{16T}{\\pi\\tau_{al}(1-n^4)}}", steps: ["\\(T=15.9\\times10^6\\,\\mathrm{Nmm}\\)", "\\(d_o^3=16T/[\\pi(200)(1-0.5^4)]\\)", "\\(d_o=75.6\\,\\mathrm{mm}\\)"], explanation: "範囲プリントの中空円筒設計と同じ手順。", diagram: "hollow-shaft", pages: [9] }),
  question({ id: "mm-q-solid-angle", topic: "torsion", genre: "ねじり角", difficulty: 2, format: "number", context: "d=30 mm、L=800 mm、T=1.20 kN·m、G=80 GPaの中実丸軸。", prompt: "ねじり角Θをradで求めよ。", answer: "0.0151 rad", numericAnswer: 0.01509, expectedUnit: "rad", acceptedUnits: { rad: 1, deg: Math.PI / 180 }, requiresUnit: true, tolerance: 0.0002, formula: "\\Theta=\\frac{TL}{GI_p}", steps: ["\\(I_p=\\pi30^4/32=7.952\\times10^4\\,\\mathrm{mm^4}\\)", "\\(\\Theta=(1.20\\times10^6)(800)/[(80000)(7.952\\times10^4)]=0.01509\\,\\mathrm{rad}\\)"], explanation: "全量をNとmmで統一すればGはN/mm²で使える。", diagram: "solid-shaft", pages: [2, 3] }),
  question({ id: "mm-q-solid-allowable-torque", topic: "shaft-design", genre: "許容トルク", difficulty: 2, format: "number", context: "直径d=25 mmの中実丸軸。許容せん断応力τal=80 MPa。", prompt: "許容トルクを求めよ。", answer: "245 N·m", numericAnswer: 245.4, expectedUnit: "N·m", acceptedUnits: torqueUnits, requiresUnit: true, tolerance: 1.5, formula: "T_{al}=\\tau_{al}\\frac{\\pi d^3}{16}", steps: ["\\(Z_p=\\pi25^3/16=3068\\,\\mathrm{mm^3}\\)", "\\(T=80(3068)=2.454\\times10^5\\,\\mathrm{Nmm}=245.4\\,\\mathrm{Nm}\\)"], explanation: "許容応力に極断面係数を掛ける。", diagram: "solid-shaft", pages: [3] }),
  question({ id: "mm-q-spring-rate", topic: "coil-spring", genre: "まとめ演習3(1)", difficulty: 2, format: "number", context: "G=80 GPa、線径d=20 mm、平均コイル半径R=100 mm、有効巻数n=6。", prompt: "ばね定数kを求めよ。", answer: "33.3 N/mm", numericAnswer: 33.33, expectedUnit: "N/mm", acceptedUnits: stiffnessUnits, requiresUnit: true, tolerance: 0.3, formula: "k=\\frac{Gd^4}{64nR^3}", steps: ["\\(G=80000\\,\\mathrm{N/mm^2}\\)", "\\(k=80000(20)^4/[64(6)(100)^3]=33.33\\,\\mathrm{N/mm}\\)"], explanation: "平均直径200 mmなので平均半径は100 mm。", diagram: "coil-spring", pages: [4, 9] }),
  question({ id: "mm-q-spring-load", topic: "coil-spring", genre: "まとめ演習3(2)", difficulty: 2, format: "number", context: "線径d=20 mm、平均半径R=100 mm、許容せん断応力500 MPa。", prompt: "基本ねじり式で許容荷重Pmaxを求めよ。", answer: "7.85 kN", numericAnswer: 7854, expectedUnit: "N", acceptedUnits: forceUnits, requiresUnit: true, tolerance: 25, formula: "P_{max}=\\frac{\\tau_{al}\\pi d^3}{16R}", steps: ["\\(Z_p=\\pi20^3/16=1570.8\\,\\mathrm{mm^3}\\)", "\\(T_{al}=500(1570.8)=7.854\\times10^5\\,\\mathrm{Nmm}\\)", "\\(P_{max}=T_{al}/R=7854\\,\\mathrm{N}\\)"], explanation: "範囲資料に合わせ、直接せん断とWahl係数は使わない。", diagram: "coil-spring", pages: [9] }),
  question({ id: "mm-q-spring-deflection", topic: "coil-spring", genre: "まとめ演習3(2)", difficulty: 2, format: "number", context: "ばね定数k=33.3 N/mm、許容荷重Pmax=7.85 kN。", prompt: "最大たわみδmaxを求めよ。", answer: "236 mm", numericAnswer: 235.7, expectedUnit: "mm", acceptedUnits: lengthUnits, requiresUnit: true, tolerance: 2, formula: "\\delta_{max}=\\frac{P_{max}}{k}", steps: ["\\(P_{max}=7850\\,\\mathrm{N}\\)", "\\(\\delta_{max}=7850/33.3=235.7\\,\\mathrm{mm}\\)"], explanation: "範囲プリントの確認値236 mmと一致する。", diagram: "coil-spring", pages: [9] }),
  question({ id: "mm-q-spring-general", topic: "coil-spring", genre: "たわみ", difficulty: 2, format: "number", context: "G=79 GPa、d=12 mm、平均直径D=120 mm、n=8、荷重P=500 N。", prompt: "密巻コイルばねのたわみδを求めよ。", answer: "33.8 mm", numericAnswer: 33.76, expectedUnit: "mm", acceptedUnits: lengthUnits, requiresUnit: true, tolerance: 0.5, formula: "\\delta=\\frac{8nPD^3}{Gd^4}", steps: ["平均直径式\\(\\delta=8nPD^3/(Gd^4)\\)を使う。", "\\(\\delta=8(8)(500)(120)^3/[79000(12)^4]=33.76\\,\\mathrm{mm}\\)"], explanation: "R=D/2を半径式へ入れると平均直径式になる。", diagram: "coil-spring", pages: [4] }),
  question({ id: "mm-q-support-types", topic: "beam-statics", genre: "範囲ZIP・支点の基礎", difficulty: 1, format: "text", prompt: "図のピン支点、ローラー支点、固定端が拘束する運動と、必要な反力成分を説明せよ。", answer: "ピン支点は並進を拘束して水平・鉛直反力、ローラー支点は接触面法線方向の反力、固定端は水平・鉛直反力と反力モーメントを持つ。", keywords: ["ピン", "ローラー", "固定", "モーメント"], minKeywords: 4, steps: ["各支点で禁止される並進・回転を確認する。", "禁止された自由度ごとに反力または反力モーメントを置く。"], explanation: "範囲ZIP5〜7ページにある支点・はりの基礎。過去問の数値や配置には依存しない。", diagram: "support-types", pages: [5, 7] }),
  question({ id: "mm-q-rectangle-resultant", topic: "beam-statics", genre: "等価集中荷重", difficulty: 1, format: "number", context: "長さL=3.0 mの区間にw=4.0 kN/mの等分布荷重。", prompt: "合力Wを求めよ。", answer: "12.0 kN", numericAnswer: 12, expectedUnit: "kN", acceptedUnits: { kN: 1, N: 0.001 }, requiresUnit: true, tolerance: 0.05, formula: "W=wL", steps: ["荷重図は幅L、高さwの長方形。", "\\(W=4.0\\times3.0=12.0\\,\\mathrm{kN}\\)"], explanation: "作用位置は荷重区間の中央L/2。", diagram: "load-resultants", pages: [5] }),
  question({ id: "mm-q-triangle-resultant", topic: "beam-statics", genre: "等価集中荷重", difficulty: 2, format: "text", context: "長さL、最大強度w0の三角形分布荷重（左端0、右端w0）。", prompt: "合力の大きさと左端からの作用位置を答えよ。", answer: "\\(W=\\frac{1}{2}w_0L\\)、作用位置は左端から\\(2L/3\\)（大きい側からL/3）", keywords: ["1/2", "2L/3"], minKeywords: 2, formula: "W=\\frac{1}{2}w_0L,\\quad \\bar{x}=\\frac{2L}{3}", steps: ["三角形の面積を合力とする。", "三角形の図心は大きい側から底辺の1/3。"], explanation: "作用位置を小さい側・大きい側のどちらから測るか明記する。", diagram: "load-resultants", pages: [5] }),
  question({ id: "mm-q-simple-center", topic: "beam-statics", genre: "支点反力", difficulty: 1, format: "text", context: "支間Lの単純支持ばり中央に集中荷重Pが下向きに作用する。", prompt: "左右の支点反力を求めよ。", answer: "\\(R_A=R_B=P/2\\)（ともに上向き）", accepted: ["RA=RB=P/2"], keywords: ["P/2", "上向き"], minKeywords: 2, formula: "R_A+R_B=P", steps: ["中央荷重なので左右対称。", "鉛直力のつり合いから合計はP。"], explanation: "対称性を使えばモーメント計算を省ける。", diagram: "simply-supported-point", pages: [5, 6] }),
  question({ id: "mm-q-cantilever", topic: "beam-statics", genre: "固定端反力", difficulty: 2, format: "text", context: "長さL=3.0 mの片持ちばり全体にw=2.0 kN/mの下向き等分布荷重。", prompt: "固定端の鉛直反力と反力モーメントを求めよ。", answer: "鉛直反力6.0 kN上向き、反力モーメント9.0 kN·m（荷重の回転を打ち消す向き）", keywords: ["6.0", "9.0", "上向き"], minKeywords: 3, formula: "R=wL,\\quad M_0=\\frac{wL^2}{2}", steps: ["合力\\(W=2.0\\times3.0=6.0\\,\\mathrm{kN}\\)は中央1.5 mに作用。", "\\(M_0=6.0\\times1.5=9.0\\,\\mathrm{kNm}\\)。"], explanation: "固定端は反力だけでなくモーメント反力も持つ。", diagram: "cantilever-udl", pages: [7, 8] }),
  question({ id: "mm-q-differential", topic: "beam-statics", genre: "SFD/BMD", difficulty: 1, format: "choice", prompt: "分布荷重w(x)、せん断力V(x)、曲げモーメントM(x)の関係として正しいものを選べ。", answer: "\\(dV/dx=-w,\\;dM/dx=V\\)", options: ["\\(dV/dx=M,\\;dM/dx=w\\)", "\\(dV/dx=-w,\\;dM/dx=V\\)", "\\(V=-wM\\)", "\\(dM/dx=-w\\)"], formula: "\\frac{dV}{dx}=-w,\\quad\\frac{dM}{dx}=V", steps: ["微小区間の力のつり合いからdV/dx=-w。", "モーメントのつり合いからdM/dx=V。"], explanation: "符号はページ内の規約に合わせて一貫して使う。", diagram: "sfd-bmd", pages: [8] }),
];

type Variant = {
  d: number;
  length: number;
  g: number;
  tauAllow: number;
  twistLimitDeg: number;
  solidRpm: number;
  ratio: number;
  power: number;
  rpm: number;
  springD: number;
  wire: number;
  turns: number;
  springTauAllow: number;
  springDeflectionLimit: number;
  beamL: number;
  beamW: number;
  beamD: number;
};

const VARIANTS: Variant[] = [
  { d: 24, length: 600, g: 79, tauAllow: 80, twistLimitDeg: 1.5, solidRpm: 900, ratio: 0.50, power: 90, rpm: 180, springD: 120, wire: 12, turns: 8, springTauAllow: 350, springDeflectionLimit: 60, beamL: 4.0, beamW: 3.0, beamD: 80 },
  { d: 28, length: 800, g: 80, tauAllow: 90, twistLimitDeg: 2.0, solidRpm: 750, ratio: 0.55, power: 150, rpm: 240, springD: 140, wire: 14, turns: 9, springTauAllow: 380, springDeflectionLimit: 90, beamL: 5.0, beamW: 2.4, beamD: 85 },
  { d: 30, length: 900, g: 81, tauAllow: 85, twistLimitDeg: 3.0, solidRpm: 600, ratio: 0.60, power: 110, rpm: 150, springD: 160, wire: 16, turns: 10, springTauAllow: 400, springDeflectionLimit: 300, beamL: 6.0, beamW: 2.0, beamD: 90 },
  { d: 32, length: 1000, g: 78, tauAllow: 70, twistLimitDeg: 4.0, solidRpm: 720, ratio: 0.50, power: 180, rpm: 300, springD: 180, wire: 18, turns: 8, springTauAllow: 360, springDeflectionLimit: 240, beamL: 4.5, beamW: 4.0, beamD: 95 },
  { d: 26, length: 700, g: 80, tauAllow: 75, twistLimitDeg: 3.5, solidRpm: 840, ratio: 0.45, power: 75, rpm: 120, springD: 130, wire: 13, turns: 7, springTauAllow: 370, springDeflectionLimit: 80, beamL: 5.5, beamW: 2.8, beamD: 95 },
  { d: 34, length: 1100, g: 79, tauAllow: 95, twistLimitDeg: 3.0, solidRpm: 540, ratio: 0.60, power: 220, rpm: 360, springD: 200, wire: 20, turns: 10, springTauAllow: 420, springDeflectionLimit: 360, beamL: 6.5, beamW: 1.8, beamD: 90 },
];

function fixed(value: number, digits = 3) { return Number(value.toFixed(digits)); }
function examQuestion(base: Omit<MaterialMechanicsExamQuestion, "topicId" | "sourceRefs"> & { pages: number[] }): MaterialMechanicsExamQuestion {
  const { pages, ...item } = base;
  return { ...item, topicId: item.topic, sourceRefs: pages.map((page) => rangeRef(page)) };
}
type BeamExamFamily = "simple-point-rect" | "simple-udl-rect" | "cantilever-tip-hollow" | "cantilever-udl-hollow";
type BeamExamCase = {
  family: BeamExamFamily;
  diagram: Extract<MaterialMechanicsDiagramKind,
    | "additional-simple-point-rect"
    | "additional-simple-udl-rect"
    | "additional-cantilever-tip-hollow"
    | "additional-cantilever-udl-hollow">;
  L: number;
  P?: number;
  w?: number;
  a?: number;
  b?: number;
  width?: number;
  height?: number;
  do?: number;
  di?: number;
};

const BEAM_EXAM_CASES: BeamExamCase[] = [
  { family: "simple-point-rect", diagram: "additional-simple-point-rect", L: 4, P: 8, a: 2.5, b: 1.5, width: 50, height: 120 },
  { family: "simple-udl-rect", diagram: "additional-simple-udl-rect", L: 4, w: 6, width: 50, height: 120 },
  { family: "cantilever-tip-hollow", diagram: "additional-cantilever-tip-hollow", L: 2, P: 4, do: 100, di: 80 },
  { family: "cantilever-udl-hollow", diagram: "additional-cantilever-udl-hollow", L: 3, w: 0.5, do: 100, di: 80 },
  { family: "simple-point-rect", diagram: "additional-simple-point-rect", L: 5, P: 6, a: 2, b: 3, width: 60, height: 140 },
  { family: "cantilever-udl-hollow", diagram: "additional-cantilever-udl-hollow", L: 2.5, w: 0.8, do: 120, di: 90 },
];

function buildBeamExamSection(beam: BeamExamCase, examPrefix: string): MaterialMechanicsExamSection {
  const isSimple = beam.family.startsWith("simple-");
  const isPoint = beam.family.includes("point") || beam.family.includes("tip");
  const isRect = beam.family.endsWith("rect");
  const P = beam.P ?? 0;
  const w = beam.w ?? 0;
  const a = beam.a ?? 0;
  const b = beam.b ?? 0;
  const reactionA = beam.family === "simple-point-rect" ? P * b / beam.L : beam.family === "simple-udl-rect" ? w * beam.L / 2 : isPoint ? P : w * beam.L;
  const reactionB = beam.family === "simple-point-rect" ? P * a / beam.L : beam.family === "simple-udl-rect" ? reactionA : 0;
  const maxMoment = beam.family === "simple-point-rect" ? P * a * b / beam.L : beam.family === "simple-udl-rect" ? w * beam.L ** 2 / 8 : beam.family === "cantilever-tip-hollow" ? P * beam.L : w * beam.L ** 2 / 2;
  const sectionModulus = isRect
    ? (beam.width ?? 0) * (beam.height ?? 0) ** 2 / 6
    : Math.PI * ((beam.do ?? 0) ** 4 - (beam.di ?? 0) ** 4) / (32 * (beam.do ?? 1));
  const stress = maxMoment * 1e6 / sectionModulus;
  const loadContext = beam.family === "simple-point-rect"
    ? `支間L=${beam.L} mの単純支持ばりで、Aからa=${a} m（Bまでb=${b} m）に集中荷重P=${P} kN。`
    : beam.family === "simple-udl-rect"
      ? `支間L=${beam.L} mの単純支持ばり全長に等分布荷重w=${w} kN/m。`
      : beam.family === "cantilever-tip-hollow"
        ? `長さL=${beam.L} mの片持ちばり自由端に集中荷重P=${P} kN。自由端をx=0とする。`
        : `長さL=${beam.L} mの片持ちばり全長に等分布荷重w=${w} kN/m。自由端をx=0とする。`;
  const sectionContext = isRect
    ? `断面は幅b=${beam.width} mm、高さh=${beam.height} mmの長方形。`
    : `断面は外径do=${beam.do} mm、内径di=${beam.di} mmの中空円。`;
  const reactionAnswer = isSimple
    ? `\\(R_A=${fixed(reactionA, 3)}\\,\\mathrm{kN},\\;R_B=${fixed(reactionB, 3)}\\,\\mathrm{kN}\\)（上向き）`
    : `\\(R=${fixed(reactionA, 3)}\\,\\mathrm{kN},\\;|M_0|=${fixed(maxMoment, 3)}\\,\\mathrm{kN\\,m}\\)`;
  const reactionFormula = beam.family === "simple-point-rect"
    ? "R_A=\\frac{Pb}{L},\\quad R_B=\\frac{Pa}{L}"
    : beam.family === "simple-udl-rect"
      ? "R_A=R_B=\\frac{wL}{2}"
      : beam.family === "cantilever-tip-hollow"
        ? "R=P,\\quad |M_0|=PL"
        : "R=wL,\\quad |M_0|=\\frac{wL^2}{2}";
  const reactionSteps = beam.family === "simple-point-rect"
    ? [`\\(R_A=${P}(${b})/${beam.L}=${fixed(reactionA, 3)}\\,\\mathrm{kN}\\)。`, `\\(R_B=${P}(${a})/${beam.L}=${fixed(reactionB, 3)}\\,\\mathrm{kN}\\)。`, `確認：\\(R_A+R_B=${fixed(P, 3)}\\,\\mathrm{kN}=P\\)。`]
    : beam.family === "simple-udl-rect"
      ? [`合力は\\(W=wL=${w}(${beam.L})=${fixed(w * beam.L, 3)}\\,\\mathrm{kN}\\)、作用位置は中央。`, "左右対称なので合力を二等分する。", `\\(R_A=R_B=${fixed(reactionA, 3)}\\,\\mathrm{kN}\\)。`]
      : beam.family === "cantilever-tip-hollow"
        ? [`鉛直力のつり合いから\\(R=P=${fixed(P, 3)}\\,\\mathrm{kN}\\)。`, `荷重の固定端まわり腕長はL=${beam.L} m。`, `\\(|M_0|=PL=${fixed(maxMoment, 3)}\\,\\mathrm{kN m}\\)。`]
        : [`合力は\\(W=wL=${fixed(reactionA, 3)}\\,\\mathrm{kN}\\)、作用位置は固定端からL/2。`, `鉛直力のつり合いから\\(R=${fixed(reactionA, 3)}\\,\\mathrm{kN}\\)。`, `\\(|M_0|=wL^2/2=${fixed(maxMoment, 3)}\\,\\mathrm{kN m}\\)。`];
  const vmFormula = beam.family === "simple-point-rect"
    ? "V=R_A\\;(x<a),\\;V=-R_B\\;(x>a),\\quad M_{max}=\\frac{Pab}{L}"
    : beam.family === "simple-udl-rect"
      ? "V=R_A-wx,\\quad M=R_Ax-\\frac{wx^2}{2},\\quad M_{max}=\\frac{wL^2}{8}"
      : beam.family === "cantilever-tip-hollow"
        ? "V=-P,\\quad M=-Px,\\quad |M_{max}|=PL"
        : "V=-wx,\\quad M=-\\frac{wx^2}{2},\\quad |M_{max}|=\\frac{wL^2}{2}";
  const vmSteps = beam.family === "simple-point-rect"
    ? [`荷重点左側は\\(V=+R_A=${fixed(reactionA, 3)}\\) kN、右側は\\(V=-R_B=-${fixed(reactionB, 3)}\\) kN。`, "BMDは両支点で0、荷重点まで直線増加して以後直線減少する。", `\\(M_{max}=Pab/L=${P}(${a})(${b})/${beam.L}=${fixed(maxMoment, 3)}\\,\\mathrm{kN m}\\)。`]
    : beam.family === "simple-udl-rect"
      ? [`\\(V(x)=${fixed(reactionA, 3)}-${w}x\\) kN、V=0はx=L/2。`, `\\(M(x)=${fixed(reactionA, 3)}x-${fixed(w / 2, 3)}x^2\\) kN·mで、BMDは放物線。`, `\\(M_{max}=wL^2/8=${fixed(maxMoment, 3)}\\,\\mathrm{kN m}\\)。`]
      : beam.family === "cantilever-tip-hollow"
        ? [`自由端から固定端まで\\(V=-${P}\\) kNでSFDは一定。`, `\\(M(x)=-${P}x\\) kN·mでBMDは三角形。`, `固定端x=Lで\\(|M_{max}|=PL=${fixed(maxMoment, 3)}\\,\\mathrm{kN m}\\)。`]
        : [`自由端条件から\\(V(x)=-${w}x\\) kNでSFDは三角形。`, `\\(M(x)=-${fixed(w / 2, 3)}x^2\\) kN·mでBMDは放物線。`, `固定端x=Lで\\(|M_{max}|=wL^2/2=${fixed(maxMoment, 3)}\\,\\mathrm{kN m}\\)。`];
  const sectionFormula = isRect
    ? "I=\\frac{bh^3}{12},\\quad Z=\\frac{bh^2}{6},\\quad \\sigma_{max}=\\frac{M_{max}}{Z}"
    : "I=\\frac{\\pi(d_o^4-d_i^4)}{64},\\quad Z=\\frac{\\pi(d_o^4-d_i^4)}{32d_o},\\quad \\sigma_{max}=\\frac{|M_{max}|}{Z}";
  const sectionSteps = isRect
    ? [`曲げの\\(I=${fixed((beam.width ?? 0) * (beam.height ?? 0) ** 3 / 12, 1)}\\,\\mathrm{mm^4}\\)。`, `\\(Z=bh^2/6=${fixed(sectionModulus, 1)}\\,\\mathrm{mm^3}\\)。`, `\\(\\sigma_{max}=${fixed(maxMoment, 3)}\\times10^6/${fixed(sectionModulus, 1)}=${fixed(stress, 2)}\\,\\mathrm{MPa}\\)。`]
    : [`曲げの\\(I=\\pi(d_o^4-d_i^4)/64=${fixed(sectionModulus * (beam.do ?? 0) / 2, 1)}\\,\\mathrm{mm^4}\\)。`, `\\(Z=I/(d_o/2)=${fixed(sectionModulus, 1)}\\,\\mathrm{mm^3}\\)。`, `\\(\\sigma_{max}=${fixed(maxMoment, 3)}\\times10^6/${fixed(sectionModulus, 1)}=${fixed(stress, 2)}\\,\\mathrm{MPa}\\)。`];

  return {
    number: 5,
    title: "はりの反力・SFD/BMD・最大曲げ応力",
    topic: "beam-statics",
    topicIds: ["beam-statics"],
    points: 20,
    context: `${loadContext}${sectionContext} 曲げにはI・Zを用い、ねじり用のIp・Zpは用いない。`,
    questions: [
      examQuestion({ id: `${examPrefix}-5-1`, major: 5, sub: 1, points: 7, topic: "beam-statics", genre: "反力", difficulty: 2, format: "text", prompt: isSimple ? "支点反力RA、RBを求めよ。" : "固定端鉛直反力Rと反力モーメントの大きさ|M0|を求めよ。", answer: reactionAnswer, keywords: [fixed(reactionA, 3).toString(), fixed(isSimple ? reactionB : maxMoment, 3).toString()], minKeywords: 2, formula: reactionFormula, steps: reactionSteps, explanation: "反力を次問のSFD/BMDへ引き継ぐ。力とモーメントのつり合いを単位付きで確認する。", diagram: beam.diagram, pages: [10, 11, 12, 13] }),
      examQuestion({ id: `${examPrefix}-5-2`, major: 5, sub: 2, points: 7, topic: "beam-statics", genre: "SFD/BMDと最大曲げモーメント", difficulty: 3, format: "diagram", prompt: "前問の反力を用いてV(x)、M(x)を示し、SFD/BMDを描いて最大曲げモーメントの大きさを求めよ。", answer: `\\(|M_{max}|=${fixed(maxMoment, 3)}\\,\\mathrm{kN\\,m}\\)。式と図の形は解答手順のとおり。`, keywords: ["V", "M", fixed(maxMoment, 3).toString()], minKeywords: 3, dependsOn: [`${examPrefix}-5-1`], formula: vmFormula, steps: vmSteps, explanation: "荷重状態に応じたV・Mを作り、最大曲げモーメントを次問へ引き継ぐ。", diagram: beam.diagram, pages: [10, 11, 12, 13] }),
      examQuestion({ id: `${examPrefix}-5-3`, major: 5, sub: 3, points: 6, topic: "beam-statics", genre: "最大曲げ応力", difficulty: 3, format: "number", prompt: "前問の|Mmax|と断面係数Zを用いて、最外縁の最大曲げ応力の大きさを求めよ。", answer: `${fixed(stress, 2)} MPa`, numericAnswer: fixed(stress, 5), expectedUnit: "MPa", acceptedUnits: stressUnits, requiresUnit: true, tolerance: Math.max(0.1, stress * 0.005), dependsOn: [`${examPrefix}-5-2`], formula: sectionFormula, steps: sectionSteps, explanation: "曲げのI・Zを使う。極断面二次モーメントIp・極断面係数Zpへの取り違えに注意する。", diagram: beam.diagram, pages: [10, 11, 12, 13] }),
    ],
  };
}
function buildExpectedExam(variant: Variant, index: number): MaterialMechanicsExam {
  const examPrefix = `mm-e${index + 1}`;
  const ip = Math.PI * variant.d ** 4 / 32;
  const zp = Math.PI * variant.d ** 3 / 16;
  const appliedTorqueNmm = variant.tauAllow * zp * 0.72;
  const appliedStress = appliedTorqueNmm / zp;
  const appliedTwistRad = appliedTorqueNmm * variant.length / (variant.g * 1000 * ip);
  const appliedTwistDeg = appliedTwistRad * 180 / Math.PI;

  const omega = 2 * Math.PI * variant.rpm / 60;
  const powerTorqueNm = variant.power * 1000 / omega;
  const powerTorqueNmm = powerTorqueNm * 1000;
  const hollowOuter = Math.cbrt(16 * powerTorqueNmm / (Math.PI * variant.tauAllow * (1 - variant.ratio ** 4)));
  const hollowInner = variant.ratio * hollowOuter;

  const springK = variant.g * 1000 * variant.wire ** 4 / (8 * variant.turns * variant.springD ** 3);
  const springStressLoad = variant.springTauAllow * Math.PI * variant.wire ** 3 / (8 * variant.springD);
  const springMaxDeflection = springStressLoad / springK;

  const baseSections: MaterialMechanicsExamSection[] = [
    {
      number: 1,
      title: "ねじりの基礎式と応力分布",
      topic: "torsion",
      topicIds: ["torsion", "shaft-design"],
      points: 15,
      context: "範囲ZIP p.1〜3の導出どおり、せん断ひずみ・応力・トルク・ねじり角を同じ丸軸モデルで結び付ける。",
      questions: [
        examQuestion({ id: `${examPrefix}-1-1`, major: 1, sub: 1, points: 7, topic: "torsion", genre: "応力分布の適用", difficulty: 1, format: "choice", prompt: "中実丸軸の半径Rに対し、r=R/2の位置のせん断応力は外周最大値の何倍か。", answer: "1/2倍", options: ["0倍", "1/4倍", "1/2倍", "1倍"], formula: "\\frac{\\tau(r)}{\\tau_{max}}=\\frac{r}{R}", steps: ["ねじり応力は \\(\\tau(r)=Tr/I_p\\) で半径rに比例する。", "外周ではr=R、指定点ではr=R/2。", "比は \\((R/2)/R=1/2\\) となる。"], explanation: "範囲ノートの線形応力分布をそのまま適用する。", diagram: "solid-shaft", pages: [1, 3] }),
        examQuestion({ id: `${examPrefix}-1-2`, major: 1, sub: 2, points: 8, topic: "torsion", genre: "ねじり基本式", difficulty: 2, format: "derivation", prompt: "丸軸について、T・Ip・τ(r)・Θ・G・Lの関係を記号式で示せ。", answer: "\\(T=GI_p\\,d\\theta/dx,\\;\\tau(r)=Tr/I_p,\\;\\Theta=TL/(GI_p)\\)", accepted: ["T=GIpdθ/dx,τ=Tr/Ip,Θ=TL/GIp"], keywords: ["T", "Ip", "tau", "Theta"], minKeywords: 3, formula: "\\begin{aligned}T&=GI_p\\frac{d\\theta}{dx}\\\\\\tau(r)&=\\frac{Tr}{I_p}\\\\\\Theta&=\\frac{TL}{GI_p}\\end{aligned}", steps: ["せん断ひずみは \\(\\gamma=r\\,d\\theta/dx\\)。", "フックの法則 \\(\\tau=G\\gamma\\) を用いる。", "断面でトルクを積分し、一様軸では長さLにわたりねじれ率を積分する。"], explanation: "許容値の大小比較を追加せず、範囲ノートにある三つの基本関係だけを問う。", diagram: "solid-shaft", pages: [1, 2, 3] }),
      ],
    },
    {
      number: 2,
      title: "中実丸軸の応力とねじり角",
      topic: "shaft-design",
      topicIds: ["torsion", "shaft-design"],
      points: 25,
      context: `直径d=${variant.d} mm、長さL=${variant.length} mm、横弾性係数G=${variant.g} GPaの中実丸軸に、トルクT=${fixed(appliedTorqueNmm / 1000, 2)} N·mを加える。`,
      questions: [
        examQuestion({ id: `${examPrefix}-2-1`, major: 2, sub: 1, points: 7, topic: "shaft-design", genre: "中実丸軸の断面量", difficulty: 2, format: "number", prompt: "極断面二次モーメントIpと極断面係数Zpを求めよ。入力欄にはIpを単位付きで入力すること。", answer: `${fixed(ip, 1)} mm^4（Zp=${fixed(zp, 1)} mm^3）`, numericAnswer: fixed(ip, 5), expectedUnit: "mm^4", acceptedUnits: { mm4: 1 }, requiresUnit: true, tolerance: Math.max(10, ip * 0.005), formula: "I_p=\\frac{\\pi d^4}{32},\\qquad Z_p=\\frac{\\pi d^3}{16}", steps: [`\\(I_p=\\pi(${variant.d})^4/32=${fixed(ip, 1)}\\,\\mathrm{mm^4}\\)`, `\\(Z_p=2I_p/${variant.d}=${fixed(zp, 1)}\\,\\mathrm{mm^3}\\)`], explanation: "範囲プリントの中実丸軸と同じ断面量計算。", diagram: "solid-shaft", pages: [2, 3, 9] }),
        examQuestion({ id: `${examPrefix}-2-2`, major: 2, sub: 2, points: 8, topic: "shaft-design", genre: "最大せん断応力", difficulty: 3, format: "number", prompt: "前問のZpを用いて外周最大せん断応力を求めよ。", answer: `${fixed(appliedStress, 2)} MPa`, numericAnswer: fixed(appliedStress, 5), expectedUnit: "MPa", acceptedUnits: stressUnits, requiresUnit: true, tolerance: Math.max(0.1, appliedStress * 0.005), dependsOn: [`${examPrefix}-2-1`], formula: "\\tau_{max}=\\frac{T}{Z_p}", steps: [`\\(T=${fixed(appliedTorqueNmm, 0)}\\,\\mathrm{Nmm}\\)`, `前問の \\(Z_p=${fixed(zp, 1)}\\,\\mathrm{mm^3}\\) を用いる。`, `\\(\\tau_{max}=T/Z_p=${fixed(appliedStress, 2)}\\,\\mathrm{MPa}\\)`], explanation: "範囲プリント1(2)と同じ、与えられたトルクから外表面応力を求める流れ。", diagram: "solid-shaft", pages: [3, 9] }),
        examQuestion({ id: `${examPrefix}-2-3`, major: 2, sub: 3, points: 10, topic: "torsion", genre: "ねじり角", difficulty: 3, format: "number", prompt: "同じトルクによる全ねじり角Θを度で求めよ。", answer: `${fixed(appliedTwistDeg, 3)} deg`, numericAnswer: fixed(appliedTwistDeg, 6), expectedUnit: "deg", acceptedUnits: { deg: 1, rad: 180 / Math.PI }, requiresUnit: true, tolerance: Math.max(0.01, appliedTwistDeg * 0.01), dependsOn: [`${examPrefix}-2-1`], formula: "\\Theta=\\frac{TL}{GI_p}", steps: [`\\(G=${variant.g * 1000}\\,\\mathrm{N/mm^2}\\)`, `\\(\\Theta=${fixed(appliedTorqueNmm, 0)}(${variant.length})/[${variant.g * 1000}(${fixed(ip, 1)})]=${fixed(appliedTwistRad, 6)}\\,\\mathrm{rad}\\)`, `度へ直して \\(\\Theta=${fixed(appliedTwistDeg, 3)}^\\circ\\)。`], explanation: "範囲プリント1(1)と同じ、トルク・長さ・G・Ipからねじり角を求める。", diagram: "solid-shaft", pages: [3, 9] }),
      ],
    },
    {
      number: 3,
      title: "伝達動力から中空軸外径を設計",
      topic: "shaft-design",
      topicIds: ["shaft-design"],
      points: 20,
      context: `動力P=${variant.power} kWをN=${variant.rpm} rpmで伝達する。許容せん断応力τal=${variant.tauAllow} MPa、中空軸の内外径比n=di/do=${variant.ratio.toFixed(2)}。`,
      questions: [
        examQuestion({ id: `${examPrefix}-3-1`, major: 3, sub: 1, points: 9, topic: "shaft-design", genre: "動力からトルク", difficulty: 2, format: "number", prompt: "角速度を求め、軸が伝達するトルクTを求めよ。", answer: `${fixed(powerTorqueNm, 1)} N·m`, numericAnswer: fixed(powerTorqueNm, 4), expectedUnit: "N·m", acceptedUnits: torqueUnits, requiresUnit: true, tolerance: Math.max(1, powerTorqueNm * 0.005), formula: "T=\\frac{P}{\\omega},\\qquad \\omega=\\frac{2\\pi N}{60}", steps: [`\\(\\omega=2\\pi(${variant.rpm})/60=${fixed(omega, 4)}\\,\\mathrm{rad/s}\\)`, `\\(P=${variant.power * 1000}\\,\\mathrm{W}\\)`, `\\(T=${variant.power * 1000}/${fixed(omega, 4)}=${fixed(powerTorqueNm, 1)}\\,\\mathrm{Nm}\\)`], explanation: "範囲プリント2(1)と同じ動力→トルク変換。", diagram: "hollow-shaft", pages: [9] }),
        examQuestion({ id: `${examPrefix}-3-2`, major: 3, sub: 2, points: 11, topic: "shaft-design", genre: "中空軸外径の設計", difficulty: 3, format: "number", prompt: "前問のTを用い、許容せん断応力を超えない中空軸の必要外径doを求めよ。", answer: `${fixed(hollowOuter, 2)} mm（di=${fixed(hollowInner, 2)} mm）`, numericAnswer: fixed(hollowOuter, 5), expectedUnit: "mm", acceptedUnits: lengthUnits, requiresUnit: true, tolerance: Math.max(0.2, hollowOuter * 0.005), dependsOn: [`${examPrefix}-3-1`], formula: "d_o=\\sqrt[3]{\\frac{16T}{\\pi\\tau_{al}(1-n^4)}}", steps: [`前問より \\(T=${fixed(powerTorqueNmm, 0)}\\,\\mathrm{Nmm}\\)。`, `\\(Z_p=\\pi d_o^3(1-n^4)/16\\) を応力式へ代入する。`, `\\(d_o=${fixed(hollowOuter, 2)}\\,\\mathrm{mm},\\;d_i=n d_o=${fixed(hollowInner, 2)}\\,\\mathrm{mm}\\)。`], explanation: "範囲プリント2(2)(3)と同じ外径設計まで。中実軸との材料量比較は出題しない。", diagram: "hollow-shaft", pages: [2, 3, 9] }),
      ],
    },
    {
      number: 4,
      title: "密巻コイルばねの最大荷重とたわみ",
      topic: "coil-spring",
      topicIds: ["coil-spring"],
      points: 20,
      context: `G=${variant.g} GPa、平均直径D=${variant.springD} mm、線径d=${variant.wire} mm、有効巻数n=${variant.turns}、許容せん断応力τal=${variant.springTauAllow} MPa。Wahl係数と直接せん断補正は用いない。`,
      questions: [
        examQuestion({ id: `${examPrefix}-4-1`, major: 4, sub: 1, points: 7, topic: "coil-spring", genre: "ばね定数", difficulty: 2, format: "number", prompt: "ばね定数kを求めよ。", answer: `${fixed(springK, 3)} N/mm`, numericAnswer: fixed(springK, 6), expectedUnit: "N/mm", acceptedUnits: stiffnessUnits, requiresUnit: true, tolerance: Math.max(0.02, springK * 0.01), formula: "k=\\frac{Gd^4}{8nD^3}", steps: [`\\(G=${variant.g * 1000}\\,\\mathrm{N/mm^2}\\)`, `\\(k=${variant.g * 1000}(${variant.wire})^4/[8(${variant.turns})(${variant.springD})^3]=${fixed(springK, 3)}\\,\\mathrm{N/mm}\\)`], explanation: "範囲プリント3(1)と同じばね定数。", diagram: "coil-spring", pages: [4, 9] }),
        examQuestion({ id: `${examPrefix}-4-2`, major: 4, sub: 2, points: 6, topic: "coil-spring", genre: "許容応力から最大荷重", difficulty: 3, format: "number", prompt: "線材の許容せん断応力から最大荷重Pmaxを求めよ。", answer: `${fixed(springStressLoad, 1)} N`, numericAnswer: fixed(springStressLoad, 5), expectedUnit: "N", acceptedUnits: forceUnits, requiresUnit: true, tolerance: Math.max(2, springStressLoad * 0.005), formula: "P_{max}=\\frac{\\tau_{al}\\pi d^3}{8D}", steps: ["線材トルクは \\(T=P(D/2)\\)。", "中実線材の \\(Z_p=\\pi d^3/16\\) を用いる。", `\\(P_{max}=${fixed(springStressLoad, 1)}\\,\\mathrm{N}\\)`], explanation: "範囲プリント3(2)と同じ許容応力からの最大荷重。", diagram: "coil-spring", pages: [4, 9] }),
        examQuestion({ id: `${examPrefix}-4-3`, major: 4, sub: 3, points: 7, topic: "coil-spring", genre: "最大荷重時のたわみ", difficulty: 3, format: "number", prompt: "前問のPmaxが作用するときの最大たわみδmaxを求めよ。", answer: `${fixed(springMaxDeflection, 2)} mm`, numericAnswer: fixed(springMaxDeflection, 5), expectedUnit: "mm", acceptedUnits: lengthUnits, requiresUnit: true, tolerance: Math.max(0.1, springMaxDeflection * 0.005), dependsOn: [`${examPrefix}-4-1`, `${examPrefix}-4-2`], formula: "\\delta_{max}=\\frac{P_{max}}{k}", steps: [`前問より \\(P_{max}=${fixed(springStressLoad, 1)}\\,\\mathrm{N}\\)、\\(k=${fixed(springK, 3)}\\,\\mathrm{N/mm}\\)。`, `\\(\\delta_{max}=P_{max}/k=${fixed(springMaxDeflection, 2)}\\,\\mathrm{mm}\\)。`], explanation: "範囲プリント3(2)と同じ、許容応力で決まる荷重から最大たわみを求める。独立の許容たわみ条件とのmin比較は行わない。", diagram: "coil-spring", pages: [4, 9] }),
      ],
    },
  ];

  const beamCase = BEAM_EXAM_CASES[index];
  if (!beamCase) throw new Error("Unknown beam exam variant " + (index + 1));
  const sections: MaterialMechanicsExamSection[] = [...baseSections, buildBeamExamSection(beamCase, examPrefix)];

  return {
    id: `material-mechanics-expected-${index + 1}`,
    kind: "expected",
    number: index + 1,
    title: `材料力学 想定試験 ${index + 1}`,
    subtitle: "範囲ZIP13枚だけに準拠・50分練習",
    variant: index + 1,
    defaultMinutes: 50,
    userAdjustable: true,
    officialMinutes: null,
    totalPoints: 100,
    scoreLabel: "100点換算",
    passPercent: 60,
    paper: "A4 portrait",
    officialConditionsNote: "範囲ZIP13枚を正本とし、中実軸の応力・ねじり角、中空軸の動力・外径設計、密巻ばねの最大荷重・最大たわみ、追加範囲4ケースの反力・SFD/BMD・曲げ応力を出題する。過去問は紙面構成だけを参照し、数値・荷重配置・旧範囲内容は出題しない。",
    sections,
    questions: sections.flatMap((section) => section.questions),
  };
}
export const MATERIAL_MECHANICS_EXPECTED_EXAMS: MaterialMechanicsExam[] = VARIANTS.map(buildExpectedExam);
function uniqueMaterialSources(questions: readonly MaterialMechanicsExamQuestion[]) {
  const seen = new Set<string>();
  return questions.flatMap((question) => question.sourceRefs).filter((source) => {
    const key = JSON.stringify(source);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const MATERIAL_MAJOR_ERROR_GUIDE: Record<number, string> = {
  2: "典型的誤答は、直径を半径として断面量へ入れる、GPaをN/mm²へ直さない、ねじり角を度のまま式へ入れる答案である。Ip・Zpを先に求め、応力とねじり角を同じトルクから順に計算する。",
  3: "典型的誤答は、動力をkWのまま代入する、rpmをrad/sへ直さない、中空軸で内外径比の4乗を落とす答案である。動力→角速度→トルク→中空軸外径の順に計算する。",
  4: "典型的誤答は、平均コイル径と外径を混同する、GPaをN/mm²へ直さない、荷重Pによる線材トルクをPRではなくPDとする答案である。ばね定数→許容応力で決まる最大荷重→その荷重での最大たわみの順に求める。",
  5: "典型的誤答は、分布荷重を合力へ置き換えた後の作用位置を誤る、反力の符号をSFD/BMDへ引き継がない、曲げのI・ZをねじりのIp・Zpと混同する答案である。荷重図→自由物体図→反力→V(x)→M(x)→Mmax→M/Zの順を崩さない。",
};

/**
 * One card is one complete print-level major problem. Formula-recall fields and
 * isolated substitutions remain available only in the flash-card deck.
 */
const MATERIAL_MECHANICS_EXPECTED_PRINT_LEVEL_QUESTIONS: MaterialMechanicsExamQuestion[] =
  MATERIAL_MECHANICS_EXPECTED_EXAMS.flatMap((exam) =>
    exam.sections
      .filter((section) => section.number >= 2)
      .map((section) => {
        const finalQuestion = section.questions.at(-1);
        if (!finalQuestion) throw new Error(exam.id + ": empty major " + section.number);
        const topic: MaterialMechanicsTopicId = section.number === 2 ? "torsion" : section.topic;
        return {
          ...finalQuestion,
          id: "material-print-e" + exam.number + "-m" + section.number,
          topic,
          topicId: topic,
          major: section.number,
          sub: 0,
          points: section.points,
          genre: "本番大問・" + section.title,
          difficulty: 3,
          context: "【全条件】" + section.context + "\n【答案の構造】条件整理と単位統一を行い、図からモデルを立て、中間量を省略せず最終設計量まで一続きで求めること。",
          prompt: section.questions
            .map((question, index) => "(" + (index + 1) + ") " + question.prompt.replace(/前(?:2問|二問|問まで|問)/g, "それまでに求めた値"))
            .join("\n") + "\n【入力】最後の設問の答えを単位付きで入力すること。途中式・図・中間値は解答用紙へ残す。",
          answer: finalQuestion.answer,
          formula: finalQuestion.formula,
          steps: section.questions.flatMap((question, index) =>
            question.steps.map((step, stepIndex) => "(" + (index + 1) + ")-" + (stepIndex + 1) + " " + step),
          ),
          explanation: "この大問は" + section.title + "を、条件整理から最終量まで連続して判定する。 【全小問の正解】" + section.questions.map((question, index) => "(" + (index + 1) + ") " + question.answer).join(" ／ ") + " 【解説】" + section.questions.map((question) => question.explanation).join(" ") + " " + MATERIAL_MAJOR_ERROR_GUIDE[section.number],
          diagram: section.questions.find((question) => question.diagram)?.diagram,
          sourceRefs: uniqueMaterialSources(section.questions),
        };
      }),
  );



export const MATERIAL_MECHANICS_PRINT_LEVEL_QUESTIONS: MaterialMechanicsExamQuestion[] = [
  ...MATERIAL_MECHANICS_EXPECTED_PRINT_LEVEL_QUESTIONS,
];

/** Full-condition, linked-calculation items for the timed confirmation test. */
export const MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS: MaterialMechanicsExamQuestion[] =
  MATERIAL_MECHANICS_EXPECTED_EXAMS.flatMap((exam) =>
    exam.sections.flatMap((section) => {
      const questionsById = new Map(section.questions.map((question) => [question.id, question]));
      return section.questions.map((question) => {
        const dependencyPrompts = question.dependsOn
          ?.map((id) => questionsById.get(id))
          .filter((dependency): dependency is MaterialMechanicsExamQuestion => Boolean(dependency))
          .map((dependency) => `大問${dependency.major}(${dependency.sub})：${dependency.prompt}`)
          .join(" ／ ");
        return {
          ...question,
          difficulty: 3,
          steps: question.steps.length >= 3 ? question.steps : [...question.steps, "求めた中間値・単位・物理的な妥当性を答案上で照査する。"],
          context: [
            section.context,
            question.context,
            dependencyPrompts ? `【この設問で参照する前問】${dependencyPrompts}` : "",
          ].filter(Boolean).join("\n"),
        };
      });
    }),
  );

export const MATERIAL_MECHANICS_EXAM_FORMATS = [
  { id: "definitions", title: "ねじり基礎式", description: "せん断ひずみ・応力・トルク・ねじり角を同じ丸軸モデルで結ぶ。", strategy: "γ→τ→T→Θの順に式の意味を確認する。" },
  { id: "solid-shaft", title: "中実軸の応力・ねじり角", description: "Ip・Zpを求め、与えられたトルクからτmaxとΘを計算する。", strategy: "N·m→N·mm、GPa→N/mm²、rad→degの変換を明示する。" },
  { id: "power", title: "伝達動力と中空軸外径", description: "rpmからトルクを求め、内外径比を使って必要外径を設計する。", strategy: "P=Tωの後、Zp=πdo³(1−n⁴)/16へ接続する。" },
  { id: "spring", title: "コイルばねの最大荷重・たわみ", description: "ばね定数、許容応力で決まる最大荷重、その荷重時の最大たわみを求める。", strategy: "平均直径Dを用い、Pmaxを求めてからδmax=Pmax/kへ進む。" },
  { id: "beam", title: "反力→SFD/BMD→Mmax→曲げ応力", description: "追加範囲4ケース（単純支持・集中/等分布、片持ち・集中/等分布）だけを扱う。", strategy: "荷重図→反力→V(x)→M(x)→Mmax→M/Zの順を崩さない。" },
] as const;

export const MATERIAL_MECHANICS_SOURCE_POLICY = {
  included: [
    "材料力学の範囲資料 合計13枚（初回9枚＋追加4枚）",
    "ねじり・中実/中空軸・密巻コイルばねの範囲プリント3大問",
    "追加範囲問題用紙の4ケース：単純支持（偏心集中・全長等分布）、片持ち（自由端集中・全長等分布）",
    "追加範囲ノートにある反力・SFD/BMD・断面二次モーメント・断面係数・曲げ応力",
  ],
  formatOnly: [
    "材料力学形式1 ZIP（紙面構成だけ参照）",
    "材力テスト形式2 PDF（紙面・配点だけ参照し、数値・荷重配置・問題内容は出題しない）",
    "材力テスト形式3 PDF（紙面構成だけ参照）",
  ],
  excluded: [
    "過去問固有の張出しばり・荷重配置・数値の丸写し",
    "応力条件と許容ねじり角条件のminによる許容動力設計",
    "中空軸と中実軸の必要径・断面積比による材料量比較",
    "独立した許容たわみ条件と許容応力条件のminによるばね設計",
    "EIを用いるたわみ・たわみ角、Castigliano、曲率・曲率半径・M/EI関係",
    "コイルばねのWahl係数・直接せん断補正",
  ],
  note: "範囲ZIP13枚だけを問題内容の正本とする。過去問は出題の見た目・大問構成だけを参考にし、問題数値や範囲外の構造は問題プールへ入れない。",
} as const;

export const MATERIAL_MECHANICS_EXAM_SPEC = {
  officialMinutes: null,
  totalPoints: 100,
  passPoints: 60,
  bigQuestionCount: 5,
  expectedExamCount: MATERIAL_MECHANICS_EXPECTED_EXAMS.length,
  paper: "A4 portrait",
  requiresUnits: true,
  requiresWork: true,
  sourcePolicy: MATERIAL_MECHANICS_SOURCE_POLICY,
} as const;
