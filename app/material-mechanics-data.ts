export type MaterialMechanicsTopicId = "torsion" | "shaft-design" | "coil-spring" | "beam-statics";

export type MaterialMechanicsQuestionFormat = "number" | "choice" | "text" | "diagram" | "derivation";

export type MaterialMechanicsSourceRef =
  | { kind: "range-zip"; page: number; filename: string; note?: string }
  | { kind: "format-2-overlap"; page: 1; question: 1 | 2 | 3 | 4 | 5; sub?: number; filename: "材力テスト形式2（一部テスト範囲）.pdf"; note?: string };

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
  | "beam-section-stress";

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
] as const;

function rangeRef(page: number, note?: string): MaterialMechanicsSourceRef {
  const filename = RANGE_FILENAMES[page - 1];
  if (!filename) throw new Error("Unknown material-mechanics range page " + page);
  return { kind: "range-zip", page, filename, note };
}

function overlapRef(question: 1 | 2 | 3 | 4 | 5, sub?: number, note?: string): MaterialMechanicsSourceRef {
  return { kind: "format-2-overlap", page: 1, question, sub, filename: "材力テスト形式2（一部テスト範囲）.pdf", note };
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
];

export const MATERIAL_MECHANICS_TOPICS: MaterialMechanicsTopic[] = [
  { id: "torsion", number: "01", title: "丸軸のねじり", shortTitle: "ねじり基礎", description: "せん断ひずみ、せん断応力、トルク、ねじり角を式の意味から扱う。", pages: [1, 2, 3, 9], color: "#ffbd59" },
  { id: "shaft-design", number: "02", title: "中実・中空軸の設計", shortTitle: "軸設計", description: "極断面二次モーメント、極断面係数、伝達動力、許容応力設計を扱う。", pages: [2, 3, 9], color: "#ff8e5b" },
  { id: "coil-spring", number: "03", title: "密巻コイルばね", shortTitle: "コイルばね", description: "ばね定数、たわみ、線材に生じるねじり応力を扱う。", pages: [4, 9], color: "#d998ff" },
  { id: "beam-statics", number: "04", title: "はりの反力・SFD・BMD", shortTitle: "はり", description: "支点、等価集中荷重、反力、せん断力図、曲げモーメント図を扱う。", pages: [5, 6, 7, 8], color: "#63d8cb" },
];

type FormulaSeed = Omit<MaterialMechanicsFormulaCard, "sourceRefs"> & { pages: number[] };
const FORMULA_SEEDS: FormulaSeed[] = [
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

type QuestionSeed = Omit<MaterialMechanicsQuestion, "topicId" | "sourceRefs"> & { pages: number[]; overlap?: { question: 1 | 2 | 3 | 4 | 5; sub?: number } };
function question(seed: QuestionSeed): MaterialMechanicsQuestion {
  const { pages, overlap, ...item } = seed;
  return { ...item, topicId: item.topic, sourceRefs: [...pages.map((page) => rangeRef(page)), ...(overlap ? [overlapRef(overlap.question, overlap.sub, "範囲ZIPのはり単元と一致する部分のみ採用")] : [])] };
}

const stressUnits = { MPa: 1, "N/mm2": 1, GPa: 1000 };
const gpaUnits = { GPa: 1, MPa: 0.001, Pa: 1e-9 };
const torqueUnits = { "N*m": 1, "kN*m": 1000, "N*mm": 0.001 };
const lengthUnits = { mm: 1, m: 1000 };
const forceUnits = { N: 1, kN: 1000 };
const stiffnessUnits = { "N/mm": 1, "kN/m": 1, "N/m": 0.001 };

export const MATERIAL_MECHANICS_QUESTIONS: MaterialMechanicsQuestion[] = [
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
  question({ id: "mm-q-support-types", topic: "beam-statics", genre: "形式2・第1問", difficulty: 1, format: "text", prompt: "図のピン支点、ローラー支点、固定端が拘束する運動と、必要な反力成分を説明せよ。", answer: "ピン支点は並進を拘束して水平・鉛直反力、ローラー支点は接触面法線方向の反力、固定端は水平・鉛直反力と反力モーメントを持つ。", keywords: ["ピン", "ローラー", "固定", "モーメント"], minKeywords: 4, steps: ["各支点で禁止される並進・回転を確認する。", "禁止された自由度ごとに反力または反力モーメントを置く。"], explanation: "形式2の第1問のうち、範囲ZIP5〜7ページと一致する支点・はりの基礎だけを採用した。", diagram: "support-types", pages: [5, 7], overlap: { question: 1 } }),
  question({ id: "mm-q-rectangle-resultant", topic: "beam-statics", genre: "等価集中荷重", difficulty: 1, format: "number", context: "長さL=3.0 mの区間にw=4.0 kN/mの等分布荷重。", prompt: "合力Wを求めよ。", answer: "12.0 kN", numericAnswer: 12, expectedUnit: "kN", acceptedUnits: { kN: 1, N: 0.001 }, requiresUnit: true, tolerance: 0.05, formula: "W=wL", steps: ["荷重図は幅L、高さwの長方形。", "\\(W=4.0\\times3.0=12.0\\,\\mathrm{kN}\\)"], explanation: "作用位置は荷重区間の中央L/2。", diagram: "load-resultants", pages: [5] }),
  question({ id: "mm-q-triangle-resultant", topic: "beam-statics", genre: "等価集中荷重", difficulty: 2, format: "text", context: "長さL、最大強度w0の三角形分布荷重（左端0、右端w0）。", prompt: "合力の大きさと左端からの作用位置を答えよ。", answer: "\\(W=\\frac{1}{2}w_0L\\)、作用位置は左端から\\(2L/3\\)（大きい側からL/3）", keywords: ["1/2", "2L/3"], minKeywords: 2, formula: "W=\\frac{1}{2}w_0L,\\quad \\bar{x}=\\frac{2L}{3}", steps: ["三角形の面積を合力とする。", "三角形の図心は大きい側から底辺の1/3。"], explanation: "作用位置を小さい側・大きい側のどちらから測るか明記する。", diagram: "load-resultants", pages: [5] }),
  question({ id: "mm-q-simple-center", topic: "beam-statics", genre: "支点反力", difficulty: 1, format: "text", context: "支間Lの単純支持ばり中央に集中荷重Pが下向きに作用する。", prompt: "左右の支点反力を求めよ。", answer: "\\(R_A=R_B=P/2\\)（ともに上向き）", accepted: ["RA=RB=P/2"], keywords: ["P/2", "上向き"], minKeywords: 2, formula: "R_A+R_B=P", steps: ["中央荷重なので左右対称。", "鉛直力のつり合いから合計はP。"], explanation: "対称性を使えばモーメント計算を省ける。", diagram: "simply-supported-point", pages: [5, 6] }),
  question({ id: "mm-q-overhang-format2", topic: "beam-statics", genre: "形式2・第2問", difficulty: 3, format: "text", context: "図でC-A=100 mm、A-D=200 mm、D-B=200 mm。Cに下向き300 N、Dに上向き150 N。", prompt: "支点反力RA、RBを向き付きで求めよ。", answer: "\\(R_A=300\\,\\mathrm{N}\\)上向き、\\(R_B=150\\,\\mathrm{N}\\)下向き", keywords: ["300", "150", "上向き", "下向き"], minKeywords: 4, formula: "\\sum F_y=0,\\quad \\sum M_A=0", steps: ["上向きを正として\\(R_A+R_B+150-300=0\\)。", "A回りで\\(300)(100)+(150)(200)+(R_B)(400)=0\\)。", "\\(R_B=-150\\,\\mathrm{N},\\;R_A=300\\,\\mathrm{N}\\)。"], explanation: "負のRBは仮定した上向きと逆、すなわち下向き反力を示す。形式2のうち今回範囲と一致する設問。", diagram: "overhang-beam", pages: [5, 6, 8], overlap: { question: 2, sub: 1 } }),
  question({ id: "mm-q-overhang-sfd", topic: "beam-statics", genre: "形式2・第2問", difficulty: 3, format: "diagram", context: "C-A=100 mm、A-D=200 mm、D-B=200 mm。C下向き300 N、D上向き150 N、RA=300 N上向き、RB=150 N下向き。", prompt: "SFDとBMDの要点（各区間のV、Mの形）を説明せよ。", answer: "SFDはC-Aで-300 N、A-Dで0、D-Bで+150 N。BMDはCで0からAまで直線で-30 N·m、A-Dで-30 N·m一定、DからBへ直線で0へ戻る。", keywords: ["-300", "0", "+150", "-30"], minKeywords: 3, steps: ["集中荷重位置でVが荷重分だけ跳ぶ。", "分布荷重がない区間ではV一定、Mは直線。", "\\(dM/dx=V\\)を使い、端部M=0を確認する。"], explanation: "問題面は荷重図と空のSFD/BMD座標だけを示し、模範線は解答後に表示する。", diagram: "overhang-sfd-bmd", pages: [8], overlap: { question: 2, sub: 2 } }),
  question({ id: "mm-q-udl-overhang-reactions", topic: "beam-statics", genre: "形式2・第3問", difficulty: 3, format: "text", context: "A-B=400 mm、B-C=50 mm。A-B全体にw=1.5 N/mm、Cに下向き50 N。Aはピン、Bはローラー。", prompt: "支点反力RA、RBを求めよ。", answer: "\\(R_A=293.75\\,\\mathrm{N},\\;R_B=356.25\\,\\mathrm{N}\\)（ともに上向き）", keywords: ["293.75", "356.25", "上向き"], minKeywords: 3, formula: "R_A+R_B=wL+P", steps: ["等分布荷重の合力は\\(1.5\\times400=600\\,\\mathrm{N}\\)、Aから200 mm。", "A回りで\\(R_B(400)-600(200)-50(450)=0\\)。", "\\(R_B=356.25\\,\\mathrm{N},\\;R_A=650-R_B=293.75\\,\\mathrm{N}\\)。"], explanation: "形式2第3問のうち反力・SFD・BMDは範囲ZIPと一致する。", diagram: "overhang-udl", pages: [5, 6, 8], overlap: { question: 3, sub: 1 } }),
  question({ id: "mm-q-udl-mmax-location", topic: "beam-statics", genre: "形式2・第3問", difficulty: 3, format: "number", context: "A-B間で\\(M(x)=293.75x-0.75x^2\\) N·mm（xはAからmm）。", prompt: "曲げモーメントが極大となる位置xを求めよ。", answer: "195.8 mm", numericAnswer: 195.83, expectedUnit: "mm", acceptedUnits: lengthUnits, requiresUnit: true, tolerance: 0.5, formula: "\\frac{dM}{dx}=V=293.75-1.5x=0", steps: ["Mをxで微分する。", "\\(293.75-1.5x=0\\)より\\(x=195.83\\,\\mathrm{mm}\\)。"], explanation: "曲げモーメントの極値位置ではせん断力Vが0になる。", diagram: "overhang-udl", pages: [8], overlap: { question: 3, sub: 3 } }),
  question({ id: "mm-q-udl-mmax", topic: "beam-statics", genre: "形式2・第3問", difficulty: 3, format: "number", context: "\\(M(x)=293.75x-0.75x^2\\) N·mm、極大位置x=195.83 mm。", prompt: "最大曲げモーメントを求めよ。", answer: "28.8 N·m", numericAnswer: 28.78, expectedUnit: "N·m", acceptedUnits: torqueUnits, requiresUnit: true, tolerance: 0.2, formula: "M_{max}=293.75x-0.75x^2", steps: ["x=195.83 mmをM(x)へ代入。", "\\(M_{max}=28776\\,\\mathrm{Nmm}=28.78\\,\\mathrm{Nm}\\)。"], explanation: "N·mmからN·mへは1000で割る。", diagram: "overhang-udl", pages: [8], overlap: { question: 3, sub: 4 } }),
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
function examQuestion(base: Omit<MaterialMechanicsExamQuestion, "topicId" | "sourceRefs"> & { pages: number[]; overlap?: { question: 1 | 2 | 3 | 4 | 5; sub?: number } }): MaterialMechanicsExamQuestion {
  const { pages, overlap, ...item } = base;
  return {
    ...item,
    topicId: item.topic,
    sourceRefs: [
      ...pages.map((page) => rangeRef(page)),
      ...(overlap ? [overlapRef(overlap.question, overlap.sub, "形式2のうち今回範囲と直接つながる連続計算だけを採用")] : []),
    ],
  };
}

function buildExpectedExam(variant: Variant, index: number): MaterialMechanicsExam {
  const examPrefix = `mm-e${index + 1}`;
  const ip = Math.PI * variant.d ** 4 / 32;
  const zp = Math.PI * variant.d ** 3 / 16;
  const twistLimitRad = variant.twistLimitDeg * Math.PI / 180;
  const stressTorqueNmm = variant.tauAllow * zp;
  const twistTorqueNmm = twistLimitRad * variant.g * 1000 * ip / variant.length;
  const allowableTorqueNmm = Math.min(stressTorqueNmm, twistTorqueNmm);
  const shaftGoverning = stressTorqueNmm <= twistTorqueNmm ? "許容せん断応力" : "許容ねじり角";
  const solidOmega = 2 * Math.PI * variant.solidRpm / 60;
  const allowablePowerKw = allowableTorqueNmm * solidOmega / 1e6;

  const omega = 2 * Math.PI * variant.rpm / 60;
  const powerTorqueNm = variant.power * 1000 / omega;
  const powerTorqueNmm = powerTorqueNm * 1000;
  const hollowOuter = Math.cbrt(16 * powerTorqueNmm / (Math.PI * variant.tauAllow * (1 - variant.ratio ** 4)));
  const hollowInner = variant.ratio * hollowOuter;
  const solidRequired = Math.cbrt(16 * powerTorqueNmm / (Math.PI * variant.tauAllow));
  const hollowArea = Math.PI * (hollowOuter ** 2 - hollowInner ** 2) / 4;
  const solidArea = Math.PI * solidRequired ** 2 / 4;
  const areaRatio = hollowArea / solidArea;

  const springK = variant.g * 1000 * variant.wire ** 4 / (8 * variant.turns * variant.springD ** 3);
  const springStressLoad = variant.springTauAllow * Math.PI * variant.wire ** 3 / (8 * variant.springD);
  const springDeflectionLoad = springK * variant.springDeflectionLimit;
  const springAllowableLoad = Math.min(springStressLoad, springDeflectionLoad);
  const springGoverning = springStressLoad <= springDeflectionLoad ? "線材の許容せん断応力" : "許容たわみ";

  const beamReaction = variant.beamW * variant.beamL / 2;
  const beamMoment = variant.beamW * variant.beamL ** 2 / 8;
  const beamSectionModulus = Math.PI * variant.beamD ** 3 / 32;
  const beamStress = beamMoment * 1e6 / beamSectionModulus;

  const sections: MaterialMechanicsExamSection[] = [
    {
      number: 1,
      title: "ねじり設計の前提",
      topic: "torsion",
      topicIds: ["torsion", "shaft-design"],
      points: 15,
      context: "外周だけでなく断面内の応力分布と、応力・ねじり角の二つの設計条件を区別すること。",
      questions: [
        examQuestion({ id: `${examPrefix}-1-1`, major: 1, sub: 1, points: 7, topic: "torsion", genre: "応力分布の適用", difficulty: 1, format: "choice", prompt: "中実丸軸の半径Rに対し、r=R/2の位置のせん断応力は外周最大値の何倍か。", answer: "1/2倍", options: ["0倍", "1/4倍", "1/2倍", "1倍"], formula: "\\frac{\\tau(r)}{\\tau_{max}}=\\frac{r}{R}", steps: ["ねじり応力は \\(\\tau(r)=Tr/I_p\\) で半径rに比例する。", "外周ではr=R、指定点ではr=R/2。", "比は \\((R/2)/R=1/2\\) となる。"], explanation: "公式名の暗記ではなく、線形分布を設計断面の任意位置へ適用する基礎確認。", diagram: "solid-shaft", pages: [1, 3] }),
        examQuestion({ id: `${examPrefix}-1-2`, major: 1, sub: 2, points: 8, topic: "shaft-design", genre: "二条件設計", difficulty: 2, format: "derivation", prompt: "許容せん断応力τalと許容ねじり角Θalの両方がある。各条件から得る許容トルクTτ、TΘと、採用トルクTalの関係を記号式で示せ。", answer: "\\(T_\\tau=\\tau_{al}Z_p,\\;T_\\Theta=\\Theta_{al}GI_p/L,\\;T_{al}=\\min(T_\\tau,T_\\Theta)\\)", accepted: ["Tτ=τalZp,TΘ=ΘalGIp/L,Tal=min(Tτ,TΘ)"], keywords: ["tau", "Theta", "min"], minKeywords: 3, formula: "\\begin{aligned}T_\\tau&=\\tau_{al}Z_p\\\\T_\\Theta&=\\frac{\\Theta_{al}GI_p}{L}\\\\T_{al}&=\\min(T_\\tau,T_\\Theta)\\end{aligned}", steps: ["応力条件 \\(\\tau_{max}=T/Z_p\\) をTについて解く。", "ねじり角条件 \\(\\Theta=TL/(GI_p)\\) をTについて解く。", "どちらも満たすには小さい方を採用する。"], explanation: "次の大問ではこの二条件を数値化し、支配条件から伝達可能動力まで連続して求める。", diagram: "solid-shaft", pages: [2, 3, 9] }),
      ],
    },
    {
      number: 2,
      title: "中実軸の許容設計",
      topic: "shaft-design",
      topicIds: ["torsion", "shaft-design"],
      points: 25,
      context: `直径d=${variant.d} mm、長さL=${variant.length} mm、G=${variant.g} GPa、許容せん断応力τal=${variant.tauAllow} MPa、許容ねじり角Θal=${variant.twistLimitDeg}°、回転数N=${variant.solidRpm} rpm。`,
      questions: [
        examQuestion({ id: `${examPrefix}-2-1`, major: 2, sub: 1, points: 8, topic: "shaft-design", genre: "応力条件の許容トルク", difficulty: 3, format: "number", prompt: "IpとZpを求め、許容せん断応力から許容トルクTτを求めよ。", answer: `${fixed(stressTorqueNmm / 1000, 2)} N·m`, numericAnswer: fixed(stressTorqueNmm / 1000, 5), expectedUnit: "N·m", acceptedUnits: torqueUnits, requiresUnit: true, tolerance: Math.max(0.5, stressTorqueNmm / 1000 * 0.005), formula: "T_\\tau=\\tau_{al}Z_p,\\qquad Z_p=\\frac{\\pi d^3}{16}", steps: [`\\(I_p=\\pi(${variant.d})^4/32=${fixed(ip, 1)}\\,\\mathrm{mm^4}\\)`, `\\(Z_p=2I_p/${variant.d}=${fixed(zp, 1)}\\,\\mathrm{mm^3}\\)`, `\\(T_\\tau=${variant.tauAllow}(${fixed(zp, 1)})=${fixed(stressTorqueNmm, 0)}\\,\\mathrm{Nmm}=${fixed(stressTorqueNmm / 1000, 2)}\\,\\mathrm{Nm}\\)`], explanation: "断面量を先に求め、応力条件をトルクの上限へ変換する。次問でも同じIpを再利用する。", diagram: "solid-shaft", pages: [2, 3, 9] }),
        examQuestion({ id: `${examPrefix}-2-2`, major: 2, sub: 2, points: 9, topic: "torsion", genre: "ねじり角条件の許容トルク", difficulty: 3, format: "number", prompt: "前問で求めたIpを使い、許容ねじり角から許容トルクTΘを求めよ。", answer: `${fixed(twistTorqueNmm / 1000, 2)} N·m`, numericAnswer: fixed(twistTorqueNmm / 1000, 5), expectedUnit: "N·m", acceptedUnits: torqueUnits, requiresUnit: true, tolerance: Math.max(0.5, twistTorqueNmm / 1000 * 0.005), dependsOn: [`${examPrefix}-2-1`], formula: "T_\\Theta=\\frac{\\Theta_{al}GI_p}{L}", steps: [`\\(\\Theta_{al}=${variant.twistLimitDeg}\\pi/180=${fixed(twistLimitRad, 6)}\\,\\mathrm{rad}\\)`, `前問より \\(I_p=${fixed(ip, 1)}\\,\\mathrm{mm^4}\\)、\\(G=${variant.g * 1000}\\,\\mathrm{N/mm^2}\\)。`, `\\(T_\\Theta=${fixed(twistLimitRad, 6)}(${variant.g * 1000})(${fixed(ip, 1)})/${variant.length}=${fixed(twistTorqueNmm / 1000, 2)}\\,\\mathrm{Nm}\\)`], explanation: "度をradへ直し、前問のIpを引き継ぐ。単発代入ではなく同じ軸設計の第二制約を評価する。", diagram: "solid-shaft", pages: [2, 3, 9] }),
        examQuestion({ id: `${examPrefix}-2-3`, major: 2, sub: 3, points: 8, topic: "shaft-design", genre: "支配条件と許容動力", difficulty: 3, format: "number", prompt: "前2問の小さい許容トルクを採用し、この軸が指定回転数で伝達できる許容動力を求めよ。", answer: `${fixed(allowablePowerKw, 2)} kW（${shaftGoverning}が支配）`, numericAnswer: fixed(allowablePowerKw, 5), expectedUnit: "kW", acceptedUnits: { kW: 1, W: 0.001 }, requiresUnit: true, tolerance: Math.max(0.05, allowablePowerKw * 0.01), dependsOn: [`${examPrefix}-2-1`, `${examPrefix}-2-2`], formula: "P=T_{al}\\omega,\\qquad \\omega=\\frac{2\\pi N}{60}", steps: [`\\(T_{al}=\\min(${fixed(stressTorqueNmm / 1000, 2)},${fixed(twistTorqueNmm / 1000, 2)})=${fixed(allowableTorqueNmm / 1000, 2)}\\,\\mathrm{Nm}\\)`, `支配条件は${shaftGoverning}。`, `\\(\\omega=2\\pi(${variant.solidRpm})/60=${fixed(solidOmega, 4)}\\,\\mathrm{rad/s}\\)`, `\\(P=${fixed(allowableTorqueNmm / 1000, 2)}(${fixed(solidOmega, 4)})=${fixed(allowablePowerKw, 2)}\\,\\mathrm{kW}\\)`], explanation: "応力とねじれの両方を満たす小さいトルクを選んで初めて、安全な伝達動力が決まる。", diagram: "solid-shaft", pages: [3, 9] }),
      ],
    },
    {
      number: 3,
      title: "中空軸の設計比較",
      topic: "shaft-design",
      topicIds: ["shaft-design"],
      points: 20,
      context: `動力P=${variant.power} kWをN=${variant.rpm} rpmで伝達する。許容せん断応力τal=${variant.tauAllow} MPa、中空軸の内外径比n=di/do=${variant.ratio.toFixed(2)}。`,
      questions: [
        examQuestion({ id: `${examPrefix}-3-1`, major: 3, sub: 1, points: 9, topic: "shaft-design", genre: "動力からトルク", difficulty: 2, format: "number", prompt: "角速度を求め、軸が伝達するトルクTを求めよ。", answer: `${fixed(powerTorqueNm, 1)} N·m`, numericAnswer: fixed(powerTorqueNm, 4), expectedUnit: "N·m", acceptedUnits: torqueUnits, requiresUnit: true, tolerance: Math.max(1, powerTorqueNm * 0.005), formula: "T=\\frac{P}{\\omega},\\qquad \\omega=\\frac{2\\pi N}{60}", steps: [`\\(\\omega=2\\pi(${variant.rpm})/60=${fixed(omega, 4)}\\,\\mathrm{rad/s}\\)`, `\\(P=${variant.power * 1000}\\,\\mathrm{W}\\)`, `\\(T=${variant.power * 1000}/${fixed(omega, 4)}=${fixed(powerTorqueNm, 1)}\\,\\mathrm{Nm}\\)`], explanation: "rpmを角速度へ直した後、次問の中実・中空両設計で同じトルクを使う。", diagram: "hollow-shaft", pages: [9] }),
        examQuestion({ id: `${examPrefix}-3-2`, major: 3, sub: 2, points: 11, topic: "shaft-design", genre: "中空軸と中実軸の比較設計", difficulty: 3, format: "number", prompt: "前問のTを用いて必要外径doを求め、同じT・τalの中実軸直径dsと断面積比Ah/Asも比較せよ（入力はdo）。", answer: `${fixed(hollowOuter, 2)} mm（di=${fixed(hollowInner, 2)} mm、ds=${fixed(solidRequired, 2)} mm、Ah/As=${fixed(areaRatio, 3)}）`, numericAnswer: fixed(hollowOuter, 5), expectedUnit: "mm", acceptedUnits: lengthUnits, requiresUnit: true, tolerance: Math.max(0.2, hollowOuter * 0.005), dependsOn: [`${examPrefix}-3-1`], formula: "\\begin{aligned}d_o&=\\sqrt[3]{\\frac{16T}{\\pi\\tau_{al}(1-n^4)}}\\\\d_s&=\\sqrt[3]{\\frac{16T}{\\pi\\tau_{al}}}\\end{aligned}", steps: [`前問より \\(T=${fixed(powerTorqueNmm, 0)}\\,\\mathrm{Nmm}\\)。`, `\\(d_o=\\sqrt[3]{16T/[\\pi(${variant.tauAllow})(1-${variant.ratio.toFixed(2)}^4)]}=${fixed(hollowOuter, 2)}\\,\\mathrm{mm}\\)、\\(d_i=n d_o=${fixed(hollowInner, 2)}\\,\\mathrm{mm}\\)。`, `中実軸は \\(d_s=${fixed(solidRequired, 2)}\\,\\mathrm{mm}\\)。`, `\\(A_h/A_s=(d_o^2-d_i^2)/d_s^2=${fixed(areaRatio, 3)}\\)。中空軸は外径が大きい一方、断面積は${fixed((1 - areaRatio) * 100, 1)}%少ない。`], explanation: "中空軸は外周側へ材料を配してねじりに有効な半径を確保するため、外径と材料使用量の両方を比較する。", diagram: "hollow-shaft", pages: [2, 3, 9] }),
      ],
    },
    {
      number: 4,
      title: "密巻コイルばねの許容設計",
      topic: "coil-spring",
      topicIds: ["coil-spring"],
      points: 20,
      context: `G=${variant.g} GPa、平均直径D=${variant.springD} mm、線径d=${variant.wire} mm、有効巻数n=${variant.turns}、許容せん断応力τal=${variant.springTauAllow} MPa、許容たわみδal=${variant.springDeflectionLimit} mm。Wahl係数と直接せん断補正は用いない。`,
      questions: [
        examQuestion({ id: `${examPrefix}-4-1`, major: 4, sub: 1, points: 7, topic: "coil-spring", genre: "ばね定数", difficulty: 2, format: "number", prompt: "ばね定数kを求めよ。", answer: `${fixed(springK, 3)} N/mm`, numericAnswer: fixed(springK, 6), expectedUnit: "N/mm", acceptedUnits: stiffnessUnits, requiresUnit: true, tolerance: Math.max(0.02, springK * 0.01), formula: "k=\\frac{Gd^4}{8nD^3}", steps: [`\\(G=${variant.g * 1000}\\,\\mathrm{N/mm^2}\\)`, `\\(k=${variant.g * 1000}(${variant.wire})^4/[8(${variant.turns})(${variant.springD})^3]\\)`, `\\(k=${fixed(springK, 3)}\\,\\mathrm{N/mm}\\)`], explanation: "平均直径Dの式を用い、次の許容たわみ条件を荷重へ変換するとき再利用する。", diagram: "coil-spring", pages: [4, 9] }),
        examQuestion({ id: `${examPrefix}-4-2`, major: 4, sub: 2, points: 6, topic: "coil-spring", genre: "応力条件の許容荷重", difficulty: 3, format: "number", prompt: "線材の許容せん断応力から、ばねの許容荷重Pτを求めよ。", answer: `${fixed(springStressLoad, 1)} N`, numericAnswer: fixed(springStressLoad, 5), expectedUnit: "N", acceptedUnits: forceUnits, requiresUnit: true, tolerance: Math.max(2, springStressLoad * 0.005), formula: "P_\\tau=\\frac{\\tau_{al}\\pi d^3}{8D}", steps: ["線材トルクは \\(T=P(D/2)\\)。", "中実線材の \\(Z_p=\\pi d^3/16\\) を用いる。", `\\(P_\\tau=${variant.springTauAllow}\\pi(${variant.wire})^3/[8(${variant.springD})]=${fixed(springStressLoad, 1)}\\,\\mathrm{N}\\)`], explanation: "範囲資料どおり基本ねじり応力だけを使い、範囲外のWahl係数は導入しない。", diagram: "coil-spring", pages: [4, 9] }),
        examQuestion({ id: `${examPrefix}-4-3`, major: 4, sub: 3, points: 7, topic: "coil-spring", genre: "二条件の許容荷重", difficulty: 3, format: "number", prompt: "前問までのkとPτを使い、許容たわみからPδを求め、二条件を満たす許容荷重を決定せよ。", answer: `${fixed(springAllowableLoad, 1)} N（${springGoverning}が支配）`, numericAnswer: fixed(springAllowableLoad, 5), expectedUnit: "N", acceptedUnits: forceUnits, requiresUnit: true, tolerance: Math.max(2, springAllowableLoad * 0.005), dependsOn: [`${examPrefix}-4-1`, `${examPrefix}-4-2`], formula: "P_{al}=\\min(P_\\tau,P_\\delta),\\qquad P_\\delta=k\\delta_{al}", steps: [`前問より \\(k=${fixed(springK, 3)}\\,\\mathrm{N/mm}\\)、\\(P_\\tau=${fixed(springStressLoad, 1)}\\,\\mathrm{N}\\)。`, `\\(P_\\delta=k\\delta_{al}=${fixed(springK, 3)}(${variant.springDeflectionLimit})=${fixed(springDeflectionLoad, 1)}\\,\\mathrm{N}\\)`, `\\(P_{al}=\\min(${fixed(springStressLoad, 1)},${fixed(springDeflectionLoad, 1)})=${fixed(springAllowableLoad, 1)}\\,\\mathrm{N}\\)`, `支配条件は${springGoverning}。`], explanation: "応力だけでなく変形量も設計条件である。小さい許容荷重を採用して両方を同時に満たす。", diagram: "coil-spring", pages: [4, 9] }),
      ],
    },
    {
      number: 5,
      title: "はりの反力・SFD/BMD・最大応力",
      topic: "beam-statics",
      topicIds: ["beam-statics"],
      points: 20,
      context: `支間L=${variant.beamL} mの単純支持ばり全体に等分布荷重w=${variant.beamW} kN/m。断面は直径d=${variant.beamD} mmの中実円。下向き荷重を正のwとし、単純支持端のM=0とする。`,
      questions: [
        examQuestion({ id: `${examPrefix}-5-1`, major: 5, sub: 1, points: 7, topic: "beam-statics", genre: "等価荷重と支点反力", difficulty: 2, format: "number", prompt: "分布荷重を等価集中荷重へ置換し、支点反力RA（=RB）を求めよ。", answer: `${fixed(beamReaction, 2)} kN`, numericAnswer: fixed(beamReaction, 5), expectedUnit: "kN", acceptedUnits: { kN: 1, N: 0.001 }, requiresUnit: true, tolerance: Math.max(0.03, beamReaction * 0.005), formula: "R_A=R_B=\\frac{wL}{2}", steps: [`\\(W=wL=${variant.beamW}(${variant.beamL})=${fixed(variant.beamW * variant.beamL, 2)}\\,\\mathrm{kN}\\)`, "合力Wは支間中央L/2に作用する。", `対称性とつり合いより \\(R_A=R_B=W/2=${fixed(beamReaction, 2)}\\,\\mathrm{kN}\\)。`], explanation: "反力は次問のV(x)とM(x)の初期値になるため、向きと作用位置を荷重図へ明記する。", diagram: "simply-supported-udl", pages: [5, 6], overlap: { question: 3, sub: 1 } }),
        examQuestion({ id: `${examPrefix}-5-2`, major: 5, sub: 2, points: 7, topic: "beam-statics", genre: "SFD/BMDと最大曲げモーメント", difficulty: 3, format: "diagram", prompt: "前問の反力を用いてV(x)、M(x)を示し、SFD/BMDを描いて最大曲げモーメントを求めよ。", answer: `\\(V(x)=${fixed(beamReaction, 2)}-${variant.beamW}x\\)、\\(M(x)=${fixed(beamReaction, 2)}x-${fixed(variant.beamW / 2, 3)}x^2\\)。SFDは直線、BMDは放物線、中央でMmax=${fixed(beamMoment, 3)} kN·m。`, keywords: ["V(x)", "M(x)", "直線", "放物線", fixed(beamMoment, 3).toString()], minKeywords: 4, dependsOn: [`${examPrefix}-5-1`], formula: "\\begin{aligned}V(x)&=R_A-wx\\\\M(x)&=R_Ax-\\frac{wx^2}{2}\\\\M_{max}&=\\frac{wL^2}{8}\\end{aligned}", steps: [`前問より \\(R_A=${fixed(beamReaction, 2)}\\,\\mathrm{kN}\\)。`, `\\(V(x)=R_A-wx\\) は傾き-wの直線で、\\(V=0\\) は \\(x=R_A/w=${fixed(variant.beamL / 2, 3)}\\,\\mathrm{m}\\)。`, `\\(M(x)=R_Ax-wx^2/2\\) は両端0の放物線。`, `中央へ代入し \\(M_{max}=wL^2/8=${fixed(beamMoment, 3)}\\,\\mathrm{kNm}\\)。`], explanation: "形式2第3問と同じく、反力→V=0位置→M最大→SFD/BMDの順で一つの荷重状態を追う。", diagram: "sfd-bmd", pages: [6, 8], overlap: { question: 3, sub: 4 } }),
        examQuestion({ id: `${examPrefix}-5-3`, major: 5, sub: 3, points: 6, topic: "beam-statics", genre: "最大曲げ応力", difficulty: 3, format: "number", prompt: "前問のMmaxと中実円断面の断面係数を使い、上下縁の最大曲げ応力の大きさを求めよ。", answer: `${fixed(beamStress, 2)} MPa`, numericAnswer: fixed(beamStress, 5), expectedUnit: "MPa", acceptedUnits: stressUnits, requiresUnit: true, tolerance: Math.max(0.3, beamStress * 0.005), dependsOn: [`${examPrefix}-5-2`], formula: "\\sigma_{max}=\\frac{M_{max}}{Z},\\qquad Z=\\frac{\\pi d^3}{32}", steps: [`前問より \\(M_{max}=${fixed(beamMoment, 3)}\\,\\mathrm{kNm}=${fixed(beamMoment * 1e6, 0)}\\,\\mathrm{Nmm}\\)。`, `\\(Z=\\pi(${variant.beamD})^3/32=${fixed(beamSectionModulus, 1)}\\,\\mathrm{mm^3}\\)。`, `\\(\\sigma_{max}=M_{max}/Z=${fixed(beamStress, 2)}\\,\\mathrm{N/mm^2}=${fixed(beamStress, 2)}\\,\\mathrm{MPa}\\)。`], explanation: "形式2第5問(1)(4)の範囲重複を、前問で得た最大曲げモーメントへ接続した。上縁と下縁では引張・圧縮の符号が逆で大きさは同じ。", diagram: "beam-section-stress", pages: [8], overlap: { question: 5, sub: 4 } }),
      ],
    },
  ];

  return {
    id: `material-mechanics-expected-${index + 1}`,
    kind: "expected",
    number: index + 1,
    title: `材料力学 想定試験 ${index + 1}`,
    subtitle: "範囲ZIP準拠・形式資料の複合計算密度を再現・50分練習",
    variant: index + 1,
    defaultMinutes: 50,
    userAdjustable: true,
    officialMinutes: null,
    totalPoints: 100,
    scoreLabel: "100点換算",
    passPercent: 60,
    paper: "A4 portrait",
    officialConditionsNote: "ねじり・軸設計・密巻コイルばね・はりを、前問結果を引き継ぐ連続計算で出題。形式2は第2・3問の反力/SFD/BMDと、第5問(1)(4)の断面係数・曲げ応力だけを範囲重複として採用し、第4問の断面二次モーメント導出などは除外。",
    sections,
    questions: sections.flatMap((section) => section.questions),
  };
}
export const MATERIAL_MECHANICS_EXPECTED_EXAMS: MaterialMechanicsExam[] = VARIANTS.map(buildExpectedExam);

/** Full-condition, linked-calculation items for the timed confirmation test. */
export const MATERIAL_MECHANICS_EXAM_LEVEL_QUESTIONS: MaterialMechanicsExamQuestion[] =
  MATERIAL_MECHANICS_EXPECTED_EXAMS.flatMap((exam) => exam.sections.flatMap((section) =>
    section.questions.map((question) => ({
      ...question,
      difficulty: 3,
      steps: question.steps.length >= 3 ? question.steps : [...question.steps, "求めた中間値・単位・物理的な妥当性を答案上で照査する。"],
      context: [section.context, question.context].filter(Boolean).join(" "),
    })),
  ));

export const MATERIAL_MECHANICS_EXAM_FORMATS = [
  { id: "definitions", title: "設計条件の立式", description: "公式名の単発暗記ではなく、応力・変形の各条件を許容荷重へ変換する。", strategy: "何が上限を支配するかを式の段階で明示する。" },
  { id: "multi-step", title: "連続する軸設計", description: "断面量→応力条件→ねじり角条件→許容動力を前問の値でつなぐ。", strategy: "記号式→数値式→結果→単位を一列に残す。" },
  { id: "power", title: "伝達動力と中空軸比較", description: "rpmからトルクを求め、中空・中実の必要径と材料量を比較する。", strategy: "rpmのままP=Tωへ入れず、同じT・τalで比較する。" },
  { id: "spring", title: "コイルばね二条件設計", description: "ばね定数、応力上限、たわみ上限から安全な荷重を決める。", strategy: "平均直径Dを用い、二つの許容荷重の小さい方を採る。" },
  { id: "beam", title: "反力→SFD/BMD→最大応力", description: "等価荷重、反力、V、M、最大曲げ応力を同じはりで連続して求める。", strategy: "前問の反力とMmaxを次問へ引き継ぎ、N・mmへ単位統一する。" },
] as const;

export const MATERIAL_MECHANICS_SOURCE_POLICY = {
  included: [
    "材料力学範囲ZIP 9枚",
    "材力テスト形式2の第2・3問（支点反力・SFD・BMD）",
    "材力テスト形式2の第5問(1)(4)（中実円の断面係数と、前問Mmaxを用いる曲げ応力）",
  ],
  formatOnly: ["材料力学形式1 ZIP", "材力テスト形式3 PDF", "材力テスト形式2の紙面・配点"],
  excluded: [
    "形式1・形式3の旧範囲内容",
    "形式2第4問の長方形断面二次モーメント導出と第5問(2)(3)の旧数値条件",
    "コイルばねのWahl係数・直接せん断補正",
  ],
  note: "範囲ZIPを正本とし、形式2は今回の連続計算へ直接接続できる反力・SFD/BMD・中実円の最大曲げ応力だけを採用しています。",
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
