import { DIGITAL_CIRCUIT_ALL_FORMULAS } from "./digital-circuits-extra-data";
import { MATERIAL_MECHANICS_FORMULAS } from "./material-mechanics-data";
import { MECHANICAL_DYNAMICS_FORMULAS } from "./mechanical-dynamics-data";
import { SMART_CONTROL_CARDS } from "./smart-control-data";
import { THERMODYNAMICS_FORMULAS } from "./thermodynamics-data";
import type {
  MathFoundationEntry,
  MathFoundationSubject,
  MathFoundationSubjectId,
} from "./math-foundations-types";

type EngineeringSubjectId = Extract<
  MathFoundationSubjectId,
  "subject-3" | "subject-4" | "subject-5" | "subject-6" | "subject-9"
>;

type FormulaCard = {
  id: string;
  topic: string;
  title: string;
  prompt: string;
  formula: string;
  explanation: string;
  cue: string;
  example?: string;
};

const CATEGORY_LABELS: Record<EngineeringSubjectId, Record<string, string>> = {
  "subject-3": {
    undamped: "非減衰振動",
    stiffness: "等価剛性・はり",
    laplace: "ラプラス応答",
    damping: "粘性減衰",
    decrement: "対数減衰率",
    rotational: "回転・振り子",
  },
  "subject-4": {
    adiabatic: "断熱変化",
    polytropic: "ポリトロープ変化",
    "second-law": "熱力学第二法則",
    entropy: "エントロピー",
    otto: "Ottoサイクル",
    carnot: "Carnotサイクル",
  },
  "subject-5": {
    torsion: "円形軸のねじり",
    "shaft-design": "軸設計",
    "coil-spring": "コイルばね",
    "beam-statics": "はり・静力学",
  },
  "subject-6": {
    transfer: "伝達関数",
    "inverse-laplace": "逆ラプラス変換",
    "response-stability": "応答・安定性",
    feedback: "フィードバック",
    "block-diagram": "ブロック線図",
  },
  "subject-9": {
    "logic-timing": "論理ゲート・波形",
    latches: "SRラッチ",
    flipflops: "D・JKフリップフロップ",
    registers: "レジスタ",
    counters: "カウンタ",
    "state-machines": "状態表・状態図",
  },
};

const CONDITIONS: Record<EngineeringSubjectId, string[]> = {
  "subject-3": ["正方向、自由度、初期条件を先に定める。", "数値計算では長さ・質量・時間をSI単位へそろえる。"],
  "subject-4": ["温度はK、圧力は絶対圧を基本とする。", "可逆・断熱・定温など、公式の仮定を問題条件と照合する。"],
  "subject-5": ["N–mm–MPa系かN–m–Pa系へ単位を統一する。", "荷重・支点・断面・正負の規約を図へ写してから立式する。"],
  "subject-6": ["連続時間LTI系を前提とし、伝達関数はゼロ初期値で扱う。", "極は共通因子を約分した後の実際の分母から求める。"],
  "subject-9": ["論理値は0/1で扱う。", "FFの種類、有効エッジ、入力極性、非同期端子を確認する。"],
};

const FINAL_CHECK: Record<EngineeringSubjectId, string> = {
  "subject-3": "rad/sとHz、変位と速度、並進量と回転量を取り違えない。",
  "subject-4": "℃のまま温度比を作らず、熱と仕事の符号規約を答案へ残す。",
  "subject-5": "直径と半径、断面二次モーメントIと極断面二次モーメントJを取り違えない。",
  "subject-6": "s+aの極は-a。単純極の公式を重根へそのまま使わない。",
  "subject-9": "現状態と次状態を混ぜず、全状態×全入力を一つずつ確認する。",
};

function fromCard(subjectId: EngineeringSubjectId, card: FormulaCard): MathFoundationEntry {
  return {
    id: "foundation-" + card.id,
    subjectId,
    category: CATEGORY_LABELS[subjectId][card.topic] ?? card.topic,
    title: card.title,
    overview: card.explanation,
    formulas: [{ label: "教材で使う式", tex: card.formula, note: card.example }],
    conditions: CONDITIONS[subjectId],
    workflow: [
      "求める量、既知量、正方向、状態、単位を整理する。",
      "「" + card.title + "」の式を記号のまま立ててから代入する。",
      "答えを「" + card.cue + "」と照合して検算する。",
    ],
    pitfalls: [card.cue, FINAL_CHECK[subjectId]],
    keywords: [card.id, card.topic, card.prompt, card.title],
  };
}

const EXTRA_FOUNDATIONS: MathFoundationEntry[] = [
  {
    id: "foundation-md-balance-frequency",
    subjectId: "subject-3",
    category: "共通基礎",
    title: "力のつり合い・角周波数・周期",
    overview: "運動方程式を立てる前に正方向と単位を固定し、Hz・rad/s・周期を相互変換します。",
    formulas: [
      { label: "運動方程式の出発点", tex: "\\sum F=m\\ddot{x}" },
      { label: "周波数・角周波数・周期", tex: "\\omega=2\\pi f,\\qquad f=\\frac{\\omega}{2\\pi},\\qquad T=\\frac1f=\\frac{2\\pi}{\\omega}" },
    ],
    symbols: [
      { symbol: "f", meaning: "周波数", unit: "\\mathrm{Hz}" },
      { symbol: "\\omega", meaning: "角周波数", unit: "\\mathrm{rad/s}" },
      { symbol: "T", meaning: "周期", unit: "\\mathrm{s}" },
    ],
    conditions: ["慣性座標系で正方向を先に定義する。", "数値代入前にmmをmへ直す。"],
    workflow: ["自由物体図を描く。", "正方向成分で運動方程式を立てる。", "必要ならω、f、Tを変換する。"],
    pitfalls: ["rad/sをHzとして読まない。", "復元力の符号を正方向に合わせる。"],
    example: { prompt: "\\(\\omega=20\\pi\\,\\mathrm{rad/s}\\) の周波数は？", steps: ["f=\\omega/(2\\pi)=20\\pi/(2\\pi)"], result: "10\\,\\mathrm{Hz}" },
    keywords: ["SI", "周波数", "周期", "運動方程式"],
  },
  {
    id: "foundation-th-absolute-units",
    subjectId: "subject-4",
    category: "共通基礎",
    title: "絶対温度・絶対圧力・単位",
    overview: "状態方程式、温度比、効率へ代入する前に℃をK、ゲージ圧を絶対圧へ直します。",
    formulas: [
      { label: "絶対温度", tex: "T[\\mathrm K]=t[{}^\\circ\\mathrm C]+273.15" },
      { label: "絶対圧力", tex: "p_{\\mathrm{abs}}=p_g+p_{\\mathrm{atm}}" },
      { label: "圧力単位", tex: "1\\,\\mathrm{kPa}=10^3\\,\\mathrm{Pa}" },
    ],
    conditions: ["状態方程式と温度比では絶対温度・絶対圧力を使う。"],
    workflow: ["圧力が絶対圧かゲージ圧か判定する。", "℃をKへ直す。", "Pa、m³、J系へ統一する。"],
    pitfalls: ["℃を温度比へ直接使わない。", "ゲージ圧を状態方程式へ直接入れない。"],
    keywords: ["K", "ケルビン", "絶対圧", "ゲージ圧"],
  },
  {
    id: "foundation-th-ideal-gas",
    subjectId: "subject-4",
    category: "共通基礎",
    title: "理想気体の状態方程式",
    overview: "圧力・体積・質量・温度を結ぶ基礎式です。資料や問題で指定された気体定数を優先します。",
    formulas: [
      { label: "質量を使う形", tex: "pV=mRT" },
      { label: "比体積を使う形", tex: "pv=RT" },
      { label: "同じ質量の二状態", tex: "\\frac{p_1V_1}{T_1}=\\frac{p_2V_2}{T_2}" },
    ],
    symbols: [
      { symbol: "R", meaning: "気体定数", unit: "\\mathrm{J/(kg\\,K)}" },
      { symbol: "v=V/m", meaning: "比体積", unit: "\\mathrm{m^3/kg}" },
    ],
    conditions: ["理想気体近似ができる。", "pとTは絶対量を使う。"],
    workflow: ["既知量と未知量を式へ対応させる。", "単位をそろえる。", "指定Rを使って未知量を解く。"],
    pitfalls: ["Vと比体積vを混同しない。", "物質名の印象で問題指定のRを変えない。"],
    example: { prompt: "\\(p=100\\,\\mathrm{kPa},V=1\\,\\mathrm{m^3},T=300\\,\\mathrm K,R=287\\) の質量は？", steps: ["m=pV/(RT)=100000/(287\\times300)"], result: "m\\approx1.16\\,\\mathrm{kg}" },
    keywords: ["状態方程式", "理想気体", "気体定数"],
  },
  {
    id: "foundation-th-first-law",
    subjectId: "subject-4",
    category: "共通基礎",
    title: "閉じた系の第一法則と符号",
    overview: "系へ入る熱を正、系が外へする境界仕事を正とする授業の符号規約です。",
    formulas: [
      { label: "第一法則", tex: "\\Delta U=Q-W_b,\\qquad Q=\\Delta U+W_b" },
      { label: "理想気体の内部エネルギー変化", tex: "\\Delta U=mc_v(T_2-T_1)" },
    ],
    conditions: ["閉じた系を扱う。", "境界仕事W_bは系が外へした仕事を正とする。"],
    workflow: ["熱と仕事の正方向を明記する。", "温度差からΔUを求める。", "第一法則へ符号付きで代入する。"],
    pitfalls: ["圧縮ではW_bが負になる。", "異なる符号規約の式を混在させない。"],
    keywords: ["第一法則", "内部エネルギー", "境界仕事", "符号"],
  },
  {
    id: "foundation-mm-units-angle",
    subjectId: "subject-5",
    category: "共通基礎",
    title: "N–mm–MPa系と角度変換",
    overview: "材料力学では単位の混在が大きな誤差になります。式へ代入する前に一つの単位系へそろえます。",
    formulas: [
      { label: "力のモーメント", tex: "1\\,\\mathrm{N\\,m}=10^3\\,\\mathrm{N\\,mm}" },
      { label: "応力", tex: "1\\,\\mathrm{MPa}=1\\,\\mathrm{N/mm^2}" },
      { label: "度からrad", tex: "\\theta[\\mathrm{rad}]=\\theta[{}^\\circ]\\frac{\\pi}{180}" },
    ],
    conditions: ["N–mm–MPa系かN–m–Pa系へ統一する。"],
    workflow: ["荷重、長さ、断面量、弾性係数の単位を書く。", "採用する単位系へ変換する。", "答えの単位を戻す。"],
    pitfalls: ["トルクだけN·m、径だけmmのままにしない。", "度をねじれ角式へ直接入れない。"],
    keywords: ["単位", "MPa", "Nmm", "ラジアン"],
  },
  {
    id: "foundation-mm-bending-stress",
    subjectId: "subject-5",
    category: "はり・静力学",
    title: "曲げ応力と断面係数",
    overview: "曲げモーメントから断面内の垂直応力を求め、外縁最大応力を設計条件と照合します。",
    formulas: [
      { label: "曲げ応力", tex: "\\sigma=\\frac{My}{I}" },
      { label: "外縁最大応力", tex: "\\sigma_{\\max}=\\frac{Mc}{I}=\\frac{M}{Z},\\qquad Z=\\frac{I}{c}" },
    ],
    symbols: [
      { symbol: "I", meaning: "中立軸まわりの断面二次モーメント", unit: "\\mathrm{mm^4}" },
      { symbol: "c", meaning: "中立軸から外縁までの距離", unit: "\\mathrm{mm}" },
    ],
    conditions: ["Euler–Bernoulliの仮定、小変形・線形弾性。", "MとIを同じ長さ単位系で扱う。"],
    workflow: ["BMDから対象断面のMを得る。", "中立軸とI、外縁距離cを求める。", "σ=M/Zを計算する。"],
    pitfalls: ["IとねじりのJを混同しない。", "最大応力ではy=cを使う。"],
    keywords: ["曲げ応力", "断面係数", "中立軸", "BMD"],
  },
  {
    id: "foundation-smart-poles-stability",
    subjectId: "subject-6",
    category: "応答・安定性",
    title: "極・零点・約分と安定性",
    overview: "入出力伝達関数では、共通因子を約分した後に実際に残る分母の根が極です。安定性の用語も区別します。",
    formulas: [
      { label: "既約伝達関数と極", tex: "G(s)=\\frac{N_c(s)}{D_c(s)},\\qquad D_c(p)=0" },
      { label: "漸近・BIBO安定の基本条件", tex: "\\operatorname{Re}(p_i)<0\\qquad(\\forall i)" },
    ],
    conditions: ["連続時間有理LTI系の既約な入出力伝達関数。", "内部安定性では隠れモードを別に確認する。"],
    workflow: ["分子と分母を因数分解する。", "共通因子を約分する。", "残った分母根の実部を調べる。"],
    pitfalls: ["約分前の分母根を入出力伝達関数の極として数えない。", "虚軸上の単純極は限界安定でも漸近・BIBO安定ではなく、授業の二択では不安定扱い。"],
    keywords: ["極", "零点", "極零相殺", "安定", "限界安定", "BIBO"],
  },
  {
    id: "foundation-dc-demorgan",
    subjectId: "subject-9",
    category: "論理ゲート・波形",
    title: "De Morganの法則と相補則",
    overview: "否定を括弧の中へ移すとANDとORが入れ替わります。論理式変形とNAND/NOR化の基礎です。",
    formulas: [
      { label: "De Morgan", tex: "\\overline{AB}=\\overline A+\\overline B,\\qquad \\overline{A+B}=\\overline A\\,\\overline B" },
      { label: "相補則", tex: "A+\\overline A=1,\\qquad A\\overline A=0" },
    ],
    conditions: ["A,Bは0または1のブール変数。", "上線の範囲を明確にする。"],
    workflow: ["外側の否定を確認する。", "否定を内側へ配りAND/ORを反転する。", "各変数を否定する。"],
    pitfalls: ["否定だけ配ってAND/ORを反転し忘れない。", "上線の範囲を省略しない。"],
    keywords: ["ド・モルガン", "De Morgan", "相補", "NAND", "NOR"],
  },
];

function extrasFor(subjectId: EngineeringSubjectId) {
  return EXTRA_FOUNDATIONS.filter((entry) => entry.subjectId === subjectId);
}

function makeSubject(
  id: EngineeringSubjectId,
  name: string,
  englishName: string,
  accent: string,
  description: string,
  cards: readonly FormulaCard[],
): MathFoundationSubject {
  return {
    id,
    name,
    englishName,
    accent,
    description,
    entries: [...extrasFor(id), ...cards.map((card) => fromCard(id, card))],
  };
}

export const ENGINEERING_FOUNDATIONS: MathFoundationSubject[] = [
  makeSubject("subject-3", "機械力学", "MECHANICAL DYNAMICS", "#ff5c35", "運動方程式、固有振動数、等価剛性、減衰、ラプラス応答、回転系を、適用条件と単位まで含めて引けます。", MECHANICAL_DYNAMICS_FORMULAS),
  makeSubject("subject-4", "熱・流体力学", "THERMODYNAMICS", "#a88bff", "絶対温度・状態方程式・第一法則から、断熱・ポリトロープ・エントロピー・Otto・Carnotまでを整理しています。", THERMODYNAMICS_FORMULAS),
  makeSubject("subject-5", "材料力学", "MATERIAL MECHANICS", "#ffd65c", "単位系、ねじり、軸径設計、コイルばね、はりの反力・SFD/BMD・曲げ応力を一つの一覧で確認できます。", MATERIAL_MECHANICS_FORMULAS),
  makeSubject("subject-6", "スマート制御", "SMART CONTROL", "#ff8fc7", "ラプラス変換、伝達関数、一次・二次応答、極と安定性、フィードバック、ブロック線図の基礎です。", SMART_CONTROL_CARDS),
  makeSubject("subject-9", "デジタル回路", "DIGITAL CIRCUITS", "#ff9f68", "ブール代数、FF、カウンタ、次状態式、Mealy/Moore、系列検出を、入力条件と解析手順から確認します。", DIGITAL_CIRCUIT_ALL_FORMULAS),
];
