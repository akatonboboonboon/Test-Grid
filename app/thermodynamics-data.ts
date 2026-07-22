export type ThermodynamicsTopicId =
  | "adiabatic"
  | "polytropic"
  | "second-law"
  | "entropy"
  | "otto"
  | "carnot"
  | "refrigeration";

export type ThermodynamicsRangePageNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const THERMODYNAMICS_FORMAT3_OVERLAP_ALLOWLIST = [
  {
    id: "format3-q3-otto",
    question: 3,
    topic: "otto",
    evidence: "範囲画像4・5のオットーサイクル、圧縮比、円筒体積、断熱温度、理論熱効率と一致",
  },
  {
    id: "format3-q4-carnot",
    question: 4,
    topic: "carnot",
    evidence: "範囲画像6・7のカルノーサイクル、500℃/100℃の例、熱量比、効率、エントロピーと一致",
  },
] as const;

export type ThermodynamicsFormat3OverlapId =
  (typeof THERMODYNAMICS_FORMAT3_OVERLAP_ALLOWLIST)[number]["id"];

export type ThermodynamicsSourceRef =
  | {
      kind: "range-zip";
      page: ThermodynamicsRangePageNumber;
      filename: string;
      note?: string;
    }
  | {
      kind: "format3-overlap";
      page: 1;
      question: 3 | 4;
      overlapId: ThermodynamicsFormat3OverlapId;
      evidence: string;
    };

export type ThermodynamicsTopic = {
  id: ThermodynamicsTopicId;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  pages: ThermodynamicsRangePageNumber[];
  color: string;
};

export type ThermodynamicsRangePage = {
  number: ThermodynamicsRangePageNumber;
  filename: string;
  topics: ThermodynamicsTopicId[];
  summary: string;
  uncertainty?: string;
  orientation?: "portrait-source" | "landscape-sideways-source";
};

export type ThermodynamicsDiagramKind =
  | "pv"
  | "ts"
  | "hs"
  | "piston"
  | "otto-pv"
  | "carnot-pv"
  | "carnot-ts"
  | "refrigeration-cycle"
  | "entropy-transfer"
  | "reversed-carnot-ts";

export type ThermodynamicsFormulaCard = {
  id: string;
  topic: ThermodynamicsTopicId;
  title: string;
  prompt: string;
  formula: string;
  explanation: string;
  cue: string;
  example?: string;
  diagram?: ThermodynamicsDiagramKind;
  sourceRefs: ThermodynamicsSourceRef[];
};

export type ThermodynamicsQuestionFormat = "number" | "choice" | "text" | "diagram";

export type ThermodynamicsQuestion = {
  id: string;
  topic: ThermodynamicsTopicId;
  topicId: ThermodynamicsTopicId;
  genre: string;
  difficulty: 1 | 2 | 3;
  format: ThermodynamicsQuestionFormat;
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
  steps: string[];
  explanation: string;
  diagram?: ThermodynamicsDiagramKind;
  sourceRefs: ThermodynamicsSourceRef[];
};

export type ThermodynamicsExamQuestion = ThermodynamicsQuestion & {
  major: number;
  sub: number;
  points: number;
};

export type ThermodynamicsExamSection = {
  number: number;
  title: string;
  topic: ThermodynamicsTopicId;
  topicIds: ThermodynamicsTopicId[];
  points: number;
  context: string;
  questions: ThermodynamicsExamQuestion[];
};

export type ThermodynamicsExpectedExam = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  variant: number;
  defaultMinutes: 50;
  userAdjustable: true;
  totalPoints: 100;
  scoreLabel: "練習用100点換算";
  passPercent: 60;
  paper: "A4 portrait";
  sourcePolicy: string;
  officialConditionsNote: string;
  sections: ThermodynamicsExamSection[];
  questions: ThermodynamicsExamQuestion[];
};

export const THERMODYNAMICS_EXCLUDED_TOPICS = [
  "蒸気表・飽和蒸気・湿り蒸気",
  "ランキンサイクル",
  "形式1・形式2にだけ現れる固有内容",
] as const;

export const THERMODYNAMICS_RANGE_PAGES: ThermodynamicsRangePage[] = [
  {
    number: 1,
    filename: "PXL_20260716_134252604.MP.jpg",
    topics: ["adiabatic"],
    summary: "第一法則と理想気体式から断熱関係、境界仕事、工業仕事を導く。",
    uncertainty: "仕事の添字が一部重複するため、境界仕事と工業仕事を記号で区別する。",
    orientation: "portrait-source",
  },
  {
    number: 2,
    filename: "PXL_20260716_134255790.MP.jpg",
    topics: ["adiabatic", "polytropic"],
    summary: "ポリトロープ指数と特殊過程。資料では窒素と表記されるが、演習指定のR=287 J/(kg·K)は空気相当なので指定値を優先する。",
    uncertainty: "手書き例の入力値は薄いため、公式のみを確実な根拠として使う。",
    orientation: "portrait-source",
  },
  {
    number: 3,
    filename: "PXL_20260716_134308462.MP.jpg",
    topics: ["second-law", "entropy"],
    summary: "熱力学第2法則の二つの表現、第二種永久機関、エントロピーの定義。",
    orientation: "landscape-sideways-source",
  },
  {
    number: 4,
    filename: "PXL_20260716_134312919.MP.jpg",
    topics: ["entropy", "otto"],
    summary: "エントロピー増大則、等エントロピー変化、オットーサイクルの導入。",
    uncertainty: "上部の熱移動例は数値が薄いため、一般式だけを使う。",
    orientation: "landscape-sideways-source",
  },
  {
    number: 5,
    filename: "PXL_20260716_134319559.MP.jpg",
    topics: ["otto"],
    summary: "圧縮比、オットー熱効率、シリンダ幾何、圧縮後温度。",
    uncertainty: "手書きシリンダ例の寸法は一部隠れているため、形式3問3の明瞭な寸法だけを追加参照する。",
    orientation: "landscape-sideways-source",
  },
  {
    number: 6,
    filename: "PXL_20260716_134322893.MP.jpg",
    topics: ["carnot"],
    summary: "カルノーサイクルの4過程、P-V/T-S線図、熱量比と理論効率。",
    orientation: "landscape-sideways-source",
  },
  {
    number: 7,
    filename: "PXL_20260716_134327105.MP.jpg",
    topics: ["carnot"],
    summary: "カルノー熱機関の仕事、放熱量、熱源のエントロピー変化の例。",
    uncertainty: "最初の例題の温度は薄いため、500℃/100℃の明瞭な例を優先する。",
    orientation: "landscape-sideways-source",
  },
  {
    number: 8,
    filename: "PXL_20260722_114531438.MP.jpg",
    topics: ["carnot", "refrigeration"],
    summary: "860 K/380 Kのカルノー熱機関と500℃/100℃の熱量比・効率、蒸気圧縮冷凍サイクルの構成機器、熱収支、冷凍機・ヒートポンプの成績係数、T-S/P-h線図。",
    uncertainty: "860 K/380 K例の赤字は作動流体側の受放熱方向で符号を書いているため、サイトでは熱源のエントロピーを高温側負・低温側正として明示する。",
    orientation: "landscape-sideways-source",
  },
  {
    number: 9,
    filename: "PXL_20260722_114536629.MP.jpg",
    topics: ["refrigeration"],
    summary: "逆カルノー冷凍機・ヒートポンプのT-S線図、冷凍・暖房成績係数と両者の関係、47℃/7℃・冷凍能力1200 kcal/hから必要動力を求める例。",
    orientation: "landscape-sideways-source",
  },
];

export const THERMODYNAMICS_TOPICS: ThermodynamicsTopic[] = [
  {
    id: "adiabatic",
    number: "01",
    title: "理想気体の断熱変化",
    shortTitle: "断熱変化",
    description: "断熱関係式、温度・圧力・体積の関係、境界仕事と工業仕事を扱う。",
    pages: [1, 2],
    color: "#64d8cb",
  },
  {
    id: "polytropic",
    number: "02",
    title: "ポリトロープ変化",
    shortTitle: "ポリトロープ",
    description: "指数nと等圧・等温・断熱・等容変化との対応を扱う。",
    pages: [2],
    color: "#71a7ff",
  },
  {
    id: "second-law",
    number: "03",
    title: "熱力学第2法則",
    shortTitle: "第2法則",
    description: "クラウジウスとケルビン・プランクの表現、熱変換の方向性を扱う。",
    pages: [3],
    color: "#a98cff",
  },
  {
    id: "entropy",
    number: "04",
    title: "エントロピー",
    shortTitle: "エントロピー",
    description: "定義、比エントロピー、二熱源の変化、エントロピー増大則を扱う。",
    pages: [3, 4],
    color: "#f5c85b",
  },
  {
    id: "otto",
    number: "05",
    title: "オットーサイクル",
    shortTitle: "オットー",
    description: "4過程、圧縮比、シリンダ体積、理論熱効率、圧縮後温度を扱う。",
    pages: [4, 5],
    color: "#ff956f",
  },
  {
    id: "carnot",
    number: "06",
    title: "カルノーサイクル",
    shortTitle: "カルノー",
    description: "4過程、P-V/T-S線図、熱量比、仕事、最大効率、エントロピーを扱う。",
    pages: [6, 7, 8],
    color: "#e776b7",
  },
  {
    id: "refrigeration",
    number: "07",
    title: "冷凍サイクル・逆カルノー",
    shortTitle: "冷凍・逆カルノー",
    description: "圧縮機・凝縮器・膨張弁・蒸発器、熱収支、冷凍機とヒートポンプの成績係数、逆カルノー冷凍機を扱う。",
    pages: [8, 9],
    color: "#5dd9ff",
  },
];

const RANGE_FILE_BY_PAGE = new Map(
  THERMODYNAMICS_RANGE_PAGES.map((page) => [page.number, page.filename]),
);

function rangeRef(page: ThermodynamicsRangePageNumber, note?: string): ThermodynamicsSourceRef {
  return {
    kind: "range-zip",
    page,
    filename: RANGE_FILE_BY_PAGE.get(page) ?? "",
    ...(note ? { note } : {}),
  };
}

function rangeRefsForTopic(topic: ThermodynamicsTopicId): ThermodynamicsSourceRef[] {
  return (THERMODYNAMICS_TOPICS.find((candidate) => candidate.id === topic)?.pages ?? []).map((page) =>
    rangeRef(page),
  );
}

const FORMAT3_OTTO_REF: ThermodynamicsSourceRef = {
  kind: "format3-overlap",
  page: 1,
  question: 3,
  overlapId: "format3-q3-otto",
  evidence: THERMODYNAMICS_FORMAT3_OVERLAP_ALLOWLIST[0].evidence,
};

const FORMAT3_CARNOT_REF: ThermodynamicsSourceRef = {
  kind: "format3-overlap",
  page: 1,
  question: 4,
  overlapId: "format3-q4-carnot",
  evidence: THERMODYNAMICS_FORMAT3_OVERLAP_ALLOWLIST[1].evidence,
};

function inline(tex: string) {
  return "\\(" + tex + "\\)";
}

type FormulaDefinition = Omit<ThermodynamicsFormulaCard, "sourceRefs"> & {
  sourceRefs?: ThermodynamicsSourceRef[];
};

const FORMULA_DEFINITIONS: FormulaDefinition[] = [
  {
    id: "th-ad-first-law",
    topic: "adiabatic",
    title: "閉じた系の第一法則",
    prompt: "準静的な閉じた系で熱・内部エネルギー・境界仕事を結ぶ式は？",
    formula: "\\delta Q=dU+P\\,dV",
    explanation: "系へ入る熱は、内部エネルギーの増加と系が外へする境界仕事に分かれる。",
    cue: "熱＝内部エネルギー変化＋P dV",
  },
  {
    id: "th-ad-pv",
    topic: "adiabatic",
    title: "断熱のP-V関係",
    prompt: "理想気体の可逆断熱変化で圧力と体積はどう結ばれる？",
    formula: "PV^{\\kappa}=C",
    explanation: "第一法則、理想気体式、比熱関係を組み合わせて積分した断熱の基本式。",
    cue: "断熱ならVの指数は比熱比",
  },
  {
    id: "th-ad-tv",
    topic: "adiabatic",
    title: "断熱のT-V関係",
    prompt: "理想気体の可逆断熱変化で温度と体積は？",
    formula: "TV^{\\kappa-1}=C",
    explanation: "Pを消去した形。体積比から温度比を求めるときに直接使える。",
    cue: "TとV、指数はκ−1",
  },
  {
    id: "th-ad-tp",
    topic: "adiabatic",
    title: "断熱のT-P関係",
    prompt: "理想気体の可逆断熱変化で温度と圧力は？",
    formula: "\\frac{T}{P^{\\frac{\\kappa-1}{\\kappa}}}=C",
    explanation: "体積を使わず、圧力比から温度比を出したいときに使う。",
    cue: "Pの指数は" + inline("\\frac{\\kappa-1}{\\kappa}"),
  },
  {
    id: "th-ad-works",
    topic: "adiabatic",
    title: "断熱の境界仕事と工業仕事",
    prompt: "断熱変化の境界仕事と工業仕事は？",
    formula: "W_b=\\frac{mR(T_1-T_2)}{\\kappa-1},\\qquad W_t=\\kappa W_b",
    explanation: "膨張を正とするノートの符号規約。工業仕事は境界仕事のκ倍になる。",
    cue: "境界仕事にκを掛けると工業仕事",
  },
  {
    id: "th-poly-law",
    topic: "polytropic",
    title: "ポリトロープ変化",
    prompt: "ポリトロープ変化の基本式は？",
    formula: "PV^n=C",
    explanation: "指数nを変えることで、等圧・等温・断熱・等容を一つの式で表せる。",
    cue: "Vの指数がn",
  },
  {
    id: "th-poly-special-low",
    topic: "polytropic",
    title: "n=0とn=1",
    prompt: "n=0、n=1はそれぞれ何変化？",
    formula: "n=0\\Rightarrow P=C,\\qquad n=1\\Rightarrow PV=C",
    explanation: "n=0は等圧、n=1は理想気体の等温変化に対応する。",
    cue: "0は等圧、1は等温",
  },
  {
    id: "th-poly-special-high",
    topic: "polytropic",
    title: "n=κとn→∞",
    prompt: "n=κ、n→∞はそれぞれ何変化？",
    formula: "n=\\kappa\\Rightarrow PV^{\\kappa}=C,\\qquad n\\to\\infty\\Rightarrow V=C",
    explanation: "n=κは断熱、nを十分大きくすると体積が変化しない等容へ近づく。",
    cue: "κは断熱、∞は等容",
  },
  {
    id: "th-poly-pressure",
    topic: "polytropic",
    title: "ポリトロープ圧力比",
    prompt: "状態1から2へ変化するときのP2は？",
    formula: "P_2=P_1\\left(\\frac{V_1}{V_2}\\right)^n",
    explanation: "両状態でP Vのn乗が等しいため、体積比のn乗を初期圧力に掛ける。",
    cue: "圧縮比のn乗",
  },
  {
    id: "th-law-clausius",
    topic: "second-law",
    title: "クラウジウスの表現",
    prompt: "外部へ変化を残さずに起こせない熱移動は？",
    formula: "T_{\\mathrm{hot}}>T_{\\mathrm{cold}},\\qquad Q:T_{\\mathrm{cold}}\\not\\to T_{\\mathrm{hot}}",
    explanation: "熱は自然には高温側から低温側へ移る。逆向きには外部からの作用が必要。",
    cue: "熱は勝手に冷→熱へ行かない",
  },
  {
    id: "th-law-kelvin",
    topic: "second-law",
    title: "ケルビン・プランクの表現",
    prompt: "単一熱源から受けた熱を全て仕事にできる？",
    formula: "Q_1=W,\\ Q_2=0\\quad\\text{is impossible for a cycle}",
    explanation: "周期機関は受熱の一部を低温側へ捨てる必要があり、熱を100%仕事へ変換できない。",
    cue: "周期機関には放熱が必要",
  },
  {
    id: "th-law-efficiency",
    topic: "second-law",
    title: "100%熱効率の禁止",
    prompt: "熱機関の効率が1にならないことを式で表すと？",
    formula: "\\eta=\\frac{W}{Q_1}=1-\\frac{Q_2}{Q_1}<1",
    explanation: "第2法則によりQ2をゼロにできないため、仕事は受熱量より小さい。",
    cue: "Q2が残るのでη<1",
  },
  {
    id: "th-law-direction",
    topic: "second-law",
    title: "熱移動の向き",
    prompt: "温度T1>T2の二熱源を接触させたときの自然な向きは？",
    formula: "T_1>T_2\\Rightarrow Q:T_1\\to T_2",
    explanation: "高温側が熱を失い、低温側が同じ熱量を受け取る方向が自然過程。",
    cue: "高温から低温へ",
  },
  {
    id: "th-ent-definition",
    topic: "entropy",
    title: "エントロピーの定義",
    prompt: "可逆な微小過程でのエントロピー変化は？",
    formula: "dS=\\frac{\\delta Q_{\\mathrm{rev}}}{T}",
    explanation: "可逆に与えた微小熱量を、そのときの絶対温度で割った状態量の変化。",
    cue: "可逆熱量÷絶対温度",
  },
  {
    id: "th-ent-specific",
    topic: "entropy",
    title: "比エントロピー",
    prompt: "全エントロピーSから比エントロピーsを求める式は？",
    formula: "s=\\frac{S}{m}",
    explanation: "エントロピーを質量で割り、単位質量あたりの状態量にしたもの。",
    cue: "Sを質量で割る",
  },
  {
    id: "th-ent-change",
    topic: "entropy",
    title: "有限変化のエントロピー",
    prompt: "状態1から2までのエントロピー変化は？",
    formula: "\\Delta S=S_2-S_1=\\int_1^2\\frac{\\delta Q_{\\mathrm{rev}}}{T}",
    explanation: "実際の経路が不可逆でも、同じ両端を結ぶ可逆経路で積分して状態量差を得る。",
    cue: "可逆経路で" + inline("\\frac{\\delta Q_{\\mathrm{rev}}}{T}") + "を積分",
  },
  {
    id: "th-ent-two-reservoirs",
    topic: "entropy",
    title: "二熱源の全エントロピー変化",
    prompt: "T1>T2で熱量Qが高温側から低温側へ移ると？",
    formula: "\\Delta S_{\\mathrm{total}}=-\\frac{Q}{T_1}+\\frac{Q}{T_2}>0",
    explanation: "高温側の減少より低温側の増加が大きく、不可逆な熱移動では全体が増える。",
    cue: "高温側" + inline("-\\frac{Q}{T_1}") + "、低温側" + inline("+\\frac{Q}{T_2}"),
  },
  {
    id: "th-otto-processes",
    topic: "otto",
    title: "オットーの4過程",
    prompt: "理論オットーサイクルの4過程は？",
    formula: "1\\to2:Q=0,\\quad2\\to3:V=C,\\quad3\\to4:Q=0,\\quad4\\to1:V=C",
    explanation: "断熱圧縮、定容加熱、断熱膨張、定容放熱の順に閉じる。",
    cue: "断熱→定容→断熱→定容",
  },
  {
    id: "th-otto-compression",
    topic: "otto",
    title: "圧縮比",
    prompt: "最大体積V1と最小体積V2から圧縮比を表すと？",
    formula: "\\varepsilon=\\frac{V_1}{V_2}=\\frac{V_s+V_c}{V_c}",
    explanation: "下死点体積を上死点のすきま容積で割る。行程容積だけで割らない。",
    cue: "全体積÷すきま容積",
  },
  {
    id: "th-otto-efficiency",
    topic: "otto",
    title: "オットー理論熱効率",
    prompt: "圧縮比εと比熱比κから理論熱効率を求める式は？",
    formula: "\\eta_{\\mathrm{th}}=1-\\frac{1}{\\varepsilon^{\\kappa-1}}",
    explanation: "圧縮比または比熱比が大きいほど、理想サイクルの効率は高くなる。",
    cue: "1−圧縮比の(κ−1)乗の逆数",
  },
  {
    id: "th-otto-temperature",
    topic: "otto",
    title: "断熱圧縮後温度",
    prompt: "吸気温度T1から圧縮後温度T2を求める式は？",
    formula: "T_2=T_1\\varepsilon^{\\kappa-1}",
    explanation: "1→2は断熱圧縮なので、T Vのκ−1乗一定を体積比へ直して使う。",
    cue: "吸気K×圧縮比^(κ−1)",
  },
  {
    id: "th-otto-cylinder",
    topic: "otto",
    title: "円筒体積",
    prompt: "内径d、長さLの円筒体積は？",
    formula: "V=\\frac{\\pi d^2L}{4}",
    explanation: "底面積" + inline("\\frac{\\pi d^2}{4}") + "に長さを掛ける。mmからcmまたはmへの換算を先にそろえる。",
    cue: "円の面積×長さ",
    sourceRefs: [rangeRef(5), FORMAT3_OTTO_REF],
  },
  {
    id: "th-carnot-processes",
    topic: "carnot",
    title: "カルノーの4過程",
    prompt: "カルノー熱機関の4過程は？",
    formula: "1\\to2:T=T_1,\\quad2\\to3:Q=0,\\quad3\\to4:T=T_2,\\quad4\\to1:Q=0",
    explanation: "高温等温膨張、断熱膨張、低温等温圧縮、断熱圧縮で元へ戻る。",
    cue: "等温→断熱→等温→断熱",
  },
  {
    id: "th-carnot-qin",
    topic: "carnot",
    title: "高温等温過程の受熱",
    prompt: "温度T1でV1からV2へ等温膨張するときのQ1は？",
    formula: "Q_1=mRT_1\\ln\\frac{V_2}{V_1}",
    explanation: "理想気体の等温変化では内部エネルギー変化がゼロで、受熱が仕事に等しい。",
    cue: "mRT1×体積比の自然対数",
  },
  {
    id: "th-carnot-qout",
    topic: "carnot",
    title: "低温等温過程の放熱",
    prompt: "温度T2での等温圧縮における放熱量の大きさQ2は？",
    formula: "Q_2=mRT_2\\ln\\frac{V_3}{V_4}",
    explanation: "放熱量を正の大きさとして書いた式。系への熱を正にする場合は符号が負になる。",
    cue: "mRT2×体積比の自然対数",
  },
  {
    id: "th-carnot-ratio",
    topic: "carnot",
    title: "カルノーの熱量比",
    prompt: "高温側と低温側の熱量比は温度でどう表せる？",
    formula: "\\frac{Q_2}{Q_1}=\\frac{T_2}{T_1}",
    explanation: "二つの断熱過程の体積比が対応し、等温熱量式の対数項が共通になる。",
    cue: "熱量比＝絶対温度比",
  },
  {
    id: "th-carnot-efficiency",
    topic: "carnot",
    title: "カルノー効率",
    prompt: "二熱源温度から理論最大効率を求める式は？",
    formula: "\\eta_c=1-\\frac{Q_2}{Q_1}=1-\\frac{T_2}{T_1}",
    explanation: "温度は必ずKで代入する。摂氏温度の比をそのまま使ってはいけない。",
    cue: "1−低温K÷高温K",
    sourceRefs: [rangeRef(6), rangeRef(7), rangeRef(8), FORMAT3_CARNOT_REF],
  },
  {
    id: "th-carnot-entropy",
    topic: "carnot",
    title: "可逆カルノーの熱源エントロピー",
    prompt: "一周期で高温・低温熱源のエントロピー変化は？",
    formula: "\\Delta S_{\\mathrm{hot}}=-\\frac{Q_1}{T_1},\\quad\\Delta S_{\\mathrm{cold}}=\\frac{Q_2}{T_2},\\quad\\Delta S_{\\mathrm{total}}=0",
    explanation: "可逆サイクルでは両熱源の変化が打ち消し合い、全体のエントロピー生成はゼロ。",
    cue: "高温側は負、低温側は正、合計0",
  },
  {
    id: "th-refrigeration-components",
    topic: "refrigeration",
    title: "蒸気圧縮冷凍サイクルの4機器",
    prompt: "冷媒が通る4機器を、圧縮機から順に示すと？",
    formula: "\\text{圧縮機}\\to\\text{凝縮器}\\to\\text{膨張弁}\\to\\text{蒸発器}",
    explanation: "圧縮機へ仕事Wを入れ、凝縮器で高温側へQ1を放出し、膨張弁で減圧し、蒸発器で低温側からQ2を吸収する。",
    cue: "圧縮→凝縮→膨張→蒸発",
    sourceRefs: [rangeRef(8)],
  },
  {
    id: "th-refrigeration-balance",
    topic: "refrigeration",
    title: "冷凍サイクルの熱収支",
    prompt: "低温側から吸収する熱Q2、投入仕事W、高温側へ放出する熱Q1の関係は？",
    formula: "Q_1=Q_2+W",
    explanation: "一周期で作動流体のエネルギーは元へ戻るため、凝縮器の放熱量は蒸発器の吸熱量と圧縮機仕事の和になる。",
    cue: "捨てる熱＝冷やした熱＋投入仕事",
    sourceRefs: [rangeRef(8), rangeRef(9)],
  },
  {
    id: "th-refrigeration-cop",
    topic: "refrigeration",
    title: "冷凍機の成績係数",
    prompt: "冷凍目的で、投入仕事に対する冷凍効果を表す成績係数は？",
    formula: "\\varepsilon_r=\\frac{Q_2}{W}",
    explanation: "冷凍機で欲しい効果は低温側から取り去る熱量Q2なので、これを投入仕事Wで割る。効率ではないため1を超えてよい。",
    cue: "冷凍COP＝低温側吸熱÷仕事",
    sourceRefs: [rangeRef(8), rangeRef(9)],
  },
  {
    id: "th-heat-pump-cop",
    topic: "refrigeration",
    title: "ヒートポンプの成績係数",
    prompt: "暖房目的の成績係数と、冷凍機の成績係数との関係は？",
    formula: "\\varepsilon_h=\\frac{Q_1}{W}=\\varepsilon_r+1",
    explanation: "暖房で欲しい効果は高温側へ渡すQ1。Q1=Q2+WをWで割ると、暖房COPは冷凍COPより必ず1大きい。",
    cue: "暖房COP＝冷凍COP＋1",
    sourceRefs: [rangeRef(8), rangeRef(9)],
  },
  {
    id: "th-reversed-carnot-cop",
    topic: "refrigeration",
    title: "逆カルノーの成績係数",
    prompt: "高温T1、低温T2の逆カルノー冷凍機・ヒートポンプの成績係数は？",
    formula: "\\begin{aligned}\\varepsilon_r&=\\frac{Q_2}{Q_1-Q_2}=\\frac{T_2}{T_1-T_2}\\\\ \\varepsilon_h&=\\frac{Q_1}{Q_1-Q_2}=\\frac{T_1}{T_1-T_2}\\end{aligned}",
    explanation: "可逆カルノーでは熱量比が絶対温度比に等しい。温度差が小さいほど同じ仕事で大きな冷凍・暖房効果を得られる。",
    cue: "分母は高温K−低温K",
    sourceRefs: [rangeRef(9)],
  },
  {
    id: "th-refrigeration-capacity",
    topic: "refrigeration",
    title: "冷凍能力の単位換算",
    prompt: "冷凍能力q kcal/hをkWへ直す式は？",
    formula: "\\dot Q_2=\\frac{4.19q}{3600}\\,\\mathrm{kW}",
    explanation: "資料の換算値1 kcal=4.19 kJを用い、1時間=3600秒で割るとkJ/s、すなわちkWになる。",
    cue: "kcal/h×4.19÷3600",
    sourceRefs: [rangeRef(9)],
  },
];

function formulaDiagram(card: FormulaDefinition): ThermodynamicsDiagramKind | undefined {
  if (["th-ad-pv", "th-poly-law", "th-poly-pressure"].includes(card.id)) return "pv";
  if (["th-otto-processes", "th-otto-compression", "th-otto-efficiency", "th-otto-temperature"].includes(card.id)) return "otto-pv";
  if (["th-carnot-processes", "th-carnot-qin", "th-carnot-qout", "th-carnot-ratio", "th-carnot-efficiency"].includes(card.id)) return "carnot-pv";
  if (card.id === "th-otto-cylinder") return "piston";
  if (card.id === "th-carnot-entropy") return "carnot-ts";
  if (["th-refrigeration-components", "th-refrigeration-balance", "th-refrigeration-cop", "th-heat-pump-cop", "th-refrigeration-capacity"].includes(card.id)) return "refrigeration-cycle";
  if (card.id === "th-reversed-carnot-cop") return "reversed-carnot-ts";
  return undefined;
}

export const THERMODYNAMICS_FORMULAS: ThermodynamicsFormulaCard[] = FORMULA_DEFINITIONS.map(
  (card) => ({
    ...card,
    diagram: formulaDiagram(card),
    sourceRefs: card.sourceRefs ?? rangeRefsForTopic(card.topic),
  }),
);

type QuestionInput = Omit<ThermodynamicsQuestion, "topicId" | "sourceRefs"> & {
  sourceRefs?: ThermodynamicsSourceRef[];
};

function question(input: QuestionInput): ThermodynamicsQuestion {
  const inferredDiagram: ThermodynamicsDiagramKind | undefined =
    input.id === "th-q-poly-map"
      ? "pv"
      : input.id.startsWith("th-q-otto-") && input.id !== "th-q-otto-format3"
        ? "otto-pv"
        : input.id.startsWith("th-q-carnot-")
          ? input.id === "th-q-carnot-entropy" ? "carnot-ts" : "carnot-pv"
          : input.id.startsWith("th-q-reversed-carnot-")
            ? "reversed-carnot-ts"
            : input.id.startsWith("th-q-refrigeration-")
              ? "refrigeration-cycle"
              : undefined;
  return {
    ...input,
    diagram: input.diagram ?? inferredDiagram,
    topicId: input.topic,
    sourceRefs: input.sourceRefs ?? rangeRefsForTopic(input.topic),
  };
}

function numberText(value: number, digits = 3) {
  return Number(value.toFixed(digits)).toString();
}

const PRACTICE_AD_RATIO = 4;
const PRACTICE_AD_KAPPA = 1.4;
const PRACTICE_AD_P2 = 100 * PRACTICE_AD_RATIO ** PRACTICE_AD_KAPPA;
const PRACTICE_AD_T2 = 300 * PRACTICE_AD_RATIO ** (PRACTICE_AD_KAPPA - 1);
const PRACTICE_AD_WB = (287 * (600 - 400)) / (PRACTICE_AD_KAPPA - 1) / 1000;
const PRACTICE_POLY_P2 = 120 * 2 ** 1.3;
const PRACTICE_POLY_T2 = 300 * 2 ** 0.3;
const PRACTICE_N2_MASS = (101300 * 200e-6) / (287 * 288);
const PRACTICE_OTTO_EFF = 1 - 1 / 10 ** 0.4;
const PRACTICE_OTTO_T2 = 300 * 10 ** 0.4;
const FORMAT3_CLEARANCE_CC = (Math.PI * 6.4 ** 2 * 0.8) / 4;
const FORMAT3_SWEPT_CC = (Math.PI * 6.4 ** 2 * 6.4) / 4;
const FORMAT3_COMPRESSION = (FORMAT3_CLEARANCE_CC + FORMAT3_SWEPT_CC) / FORMAT3_CLEARANCE_CC;
const FORMAT3_OTTO_EFF = 1 - 1 / FORMAT3_COMPRESSION ** 0.3;
const FORMAT3_OTTO_T2 = (25 + 273) * FORMAT3_COMPRESSION ** 0.3;
const PRACTICE_CARNOT_RATIO = (100 + 273) / (500 + 273);
const PRACTICE_CARNOT_EFF = 1 - PRACTICE_CARNOT_RATIO;
const PRACTICE_CARNOT_Q1 = 10 / PRACTICE_CARNOT_RATIO;
const ADDITIONAL_CARNOT_HOT_K = 860;
const ADDITIONAL_CARNOT_COLD_K = 380;
const ADDITIONAL_CARNOT_Q1 = 20;
const ADDITIONAL_CARNOT_RATIO = ADDITIONAL_CARNOT_COLD_K / ADDITIONAL_CARNOT_HOT_K;
const ADDITIONAL_CARNOT_Q2 = ADDITIONAL_CARNOT_Q1 * ADDITIONAL_CARNOT_RATIO;
const ADDITIONAL_CARNOT_WORK = ADDITIONAL_CARNOT_Q1 - ADDITIONAL_CARNOT_Q2;
const ADDITIONAL_CARNOT_ENTROPY = ADDITIONAL_CARNOT_Q1 / ADDITIONAL_CARNOT_HOT_K;
const ADDITIONAL_REVERSED_HOT_K = 47 + 273;
const ADDITIONAL_REVERSED_COLD_K = 7 + 273;
const ADDITIONAL_REVERSED_COP_R = ADDITIONAL_REVERSED_COLD_K / (ADDITIONAL_REVERSED_HOT_K - ADDITIONAL_REVERSED_COLD_K);
const ADDITIONAL_REVERSED_COP_H = ADDITIONAL_REVERSED_HOT_K / (ADDITIONAL_REVERSED_HOT_K - ADDITIONAL_REVERSED_COLD_K);
const ADDITIONAL_COOLING_KW = (1200 * 4.19) / 3600;
const ADDITIONAL_REQUIRED_POWER_KW = ADDITIONAL_COOLING_KW / ADDITIONAL_REVERSED_COP_R;

export const THERMODYNAMICS_QUESTIONS: ThermodynamicsQuestion[] = [
  question({
    id: "th-q-ad-pressure",
    topic: "adiabatic",
    genre: "断熱圧力",
    difficulty: 1,
    format: "number",
    prompt: "空気を可逆断熱で体積が" + inline("\\frac{1}{4}") + "になるまで圧縮する。初圧100 kPa、比熱比1.4のとき終圧を求めよ。",
    answer: numberText(PRACTICE_AD_P2, 1) + " kPa",
    numericAnswer: PRACTICE_AD_P2,
    expectedUnit: "kPa",
    acceptedUnits: { Pa: 0.001, kPa: 1, MPa: 1000 },
    requiresUnit: true,
    tolerance: 1,
    formula: "P_2=P_1\\left(\\frac{V_1}{V_2}\\right)^{\\kappa}",
    steps: [
      inline("\\frac{V_1}{V_2}=4"),
      inline("P_2=100\\times4^{1.4}\\approx" + numberText(PRACTICE_AD_P2, 1) + "\\,\\mathrm{kPa}"),
    ],
    explanation: "圧縮では体積比" + inline("\\frac{V_1}{V_2}") + "が1より大きくなり、終圧は初圧より高くなる。",
  }),
  question({
    id: "th-q-ad-temperature",
    topic: "adiabatic",
    genre: "断熱温度",
    difficulty: 1,
    format: "number",
    prompt: "初温300 Kの空気を体積が" + inline("\\frac{1}{4}") + "になるまで可逆断熱圧縮する。比熱比1.4として終温を求めよ。",
    answer: numberText(PRACTICE_AD_T2, 1) + " K",
    numericAnswer: PRACTICE_AD_T2,
    expectedUnit: "K",
    acceptedUnits: { K: 1 },
    requiresUnit: true,
    tolerance: 1,
    formula: "T_2=T_1\\left(\\frac{V_1}{V_2}\\right)^{\\kappa-1}",
    steps: [
      inline("T_2=300\\times4^{1.4-1}"),
      inline("T_2\\approx" + numberText(PRACTICE_AD_T2, 1) + "\\,\\mathrm{K}"),
    ],
    explanation: "温度式の指数はκではなくκ−1。圧縮なので温度が上がる。",
  }),
  question({
    id: "th-q-ad-boundary-work",
    topic: "adiabatic",
    genre: "境界仕事",
    difficulty: 2,
    format: "number",
    prompt: "1 kgの空気が600 Kから400 Kへ可逆断熱膨張する。" + inline("R=287\\,\\mathrm{J\\,(kg\\,K)^{-1}},\\ \\kappa=1.4") + "として境界仕事を求めよ。",
    answer: numberText(PRACTICE_AD_WB, 1) + " kJ",
    numericAnswer: PRACTICE_AD_WB,
    expectedUnit: "kJ",
    acceptedUnits: { J: 0.001, kJ: 1 },
    requiresUnit: true,
    tolerance: 0.3,
    formula: "W_b=\\frac{mR(T_1-T_2)}{\\kappa-1}",
    steps: [
      inline("W_b=\\frac{1\\times287\\times(600-400)}{1.4-1}\\times10^{-3}"),
      inline("W_b\\approx" + numberText(PRACTICE_AD_WB, 1) + "\\,\\mathrm{kJ}"),
    ],
    explanation: "膨張を正とする符号規約ではT1>T2なので仕事は正になる。",
  }),
  question({
    id: "th-q-ad-technical-work",
    topic: "adiabatic",
    genre: "工業仕事",
    difficulty: 2,
    format: "number",
    prompt: "断熱変化の境界仕事が143.5 kJ、比熱比が1.4のとき、工業仕事を求めよ。",
    answer: "200.9 kJ",
    numericAnswer: 200.9,
    expectedUnit: "kJ",
    acceptedUnits: { J: 0.001, kJ: 1 },
    requiresUnit: true,
    tolerance: 0.2,
    formula: "W_t=\\kappa W_b",
    steps: [inline("W_t\\approx1.4\\times143.5"), inline("W_t\\approx200.9\\,\\mathrm{kJ}")],
    explanation: "ノートの断熱関係では、工業仕事は境界仕事のκ倍。",
  }),
  question({
    id: "th-q-ad-invariant",
    topic: "adiabatic",
    genre: "関係式",
    difficulty: 1,
    format: "choice",
    prompt: "理想気体の可逆断熱変化で一定になる組合せを選べ。",
    answer: inline("PV^{\\kappa}"),
    options: [inline("PV"), inline("PV^{\\kappa}"), inline("\\frac{P}{V}"), inline("TV")],
    formula: "PV^{\\kappa}=C",
    steps: ["断熱では熱の出入りがない。", inline("PV^{\\kappa}=C") + "を選ぶ。"],
    explanation: "PV一定は等温変化であり、断熱では体積の指数が比熱比κになる。",
  }),

  question({
    id: "th-q-poly-map",
    topic: "polytropic",
    genre: "指数と過程",
    difficulty: 1,
    format: "choice",
    prompt: "n=0、1、κ、∞の対応として正しいものを選べ。",
    answer: "等圧・等温・断熱・等容",
    options: ["等圧・等温・断熱・等容", "等温・等圧・等容・断熱", "等容・断熱・等温・等圧", "断熱・等容・等圧・等温"],
    formula: "PV^n=C",
    steps: [inline("n=0\\Rightarrow P=C"), inline("n=1\\Rightarrow PV=C,\\ n=\\kappa\\Rightarrow\\text{断熱},\\ n\\to\\infty\\Rightarrow V=C")],
    explanation: "nの特殊値で代表的な状態変化を一つの式から整理できる。",
  }),
  question({
    id: "th-q-poly-pressure",
    topic: "polytropic",
    genre: "ポリトロープ圧力",
    difficulty: 2,
    format: "number",
    prompt: inline("P_1=120\\,\\mathrm{kPa},\\ \\frac{V_1}{V_2}=2,\\ n=1.3") + "のポリトロープ圧縮で" + inline("P_2") + "を求めよ。",
    answer: numberText(PRACTICE_POLY_P2, 1) + " kPa",
    numericAnswer: PRACTICE_POLY_P2,
    expectedUnit: "kPa",
    acceptedUnits: { Pa: 0.001, kPa: 1, MPa: 1000 },
    requiresUnit: true,
    tolerance: 0.8,
    formula: "P_2=P_1\\left(\\frac{V_1}{V_2}\\right)^n",
    steps: [inline("P_2=120\\times2^{1.3}"), inline("P_2\\approx" + numberText(PRACTICE_POLY_P2, 1) + "\\,\\mathrm{kPa}")],
    explanation: "PV^nが両状態で等しいことから体積比をn乗する。",
  }),
  question({
    id: "th-q-poly-temperature",
    topic: "polytropic",
    genre: "ポリトロープ温度",
    difficulty: 2,
    format: "number",
    prompt: "理想気体を" + inline("T_1=300\\,\\mathrm{K},\\ \\frac{V_1}{V_2}=2,\\ n=1.3") + "でポリトロープ圧縮した。" + inline("T_2") + "を求めよ。",
    answer: numberText(PRACTICE_POLY_T2, 1) + " K",
    numericAnswer: PRACTICE_POLY_T2,
    expectedUnit: "K",
    acceptedUnits: { K: 1 },
    requiresUnit: true,
    tolerance: 0.8,
    formula: "T_2=T_1\\left(\\frac{V_1}{V_2}\\right)^{n-1}",
    steps: [
      inline("PV^n=C") + "と" + inline("PV=mRT") + "から" + inline("TV^{n-1}=C") + "。",
      inline("T_2=300\\times2^{0.3}\\approx" + numberText(PRACTICE_POLY_T2, 1) + "\\,\\mathrm{K}"),
    ],
    explanation: "理想気体式でPを消去すると温度式の指数はn−1になる。",
  }),
  question({
    id: "th-q-poly-isothermal",
    topic: "polytropic",
    genre: "等温判定",
    difficulty: 1,
    format: "choice",
    prompt: "ポリトロープ指数n=1のとき一定になる量を選べ。",
    answer: inline("PV"),
    options: [inline("P"), inline("V"), inline("PV"), inline("PV^{\\kappa}")],
    formula: "n=1\\Rightarrow PV=C",
    steps: [inline("PV^n=C") + "へn=1を代入する。", inline("PV=C") + "なので理想気体では等温。"],
    explanation: "n=1は等温、n=κは断熱なので混同しない。",
  }),
  question({
    id: "th-q-poly-mass",
    topic: "polytropic",
    genre: "気体質量",
    difficulty: 2,
    format: "number",
    prompt: inline("P=101.3\\,\\mathrm{kPa},\\ V=200\\,\\mathrm{cc},\\ T=288\\,\\mathrm{K}") + "の気体を、資料指定の" + inline("R=287\\,\\mathrm{J\\,(kg\\,K)^{-1}}") + "を用いる理想気体として質量を求めよ。",
    answer: numberText(PRACTICE_N2_MASS * 1000, 3) + " g",
    numericAnswer: PRACTICE_N2_MASS * 1000,
    expectedUnit: "g",
    acceptedUnits: { kg: 1000, g: 1 },
    requiresUnit: true,
    tolerance: 0.003,
    formula: "m=\\frac{PV}{RT}",
    steps: [
      inline("101.3\\,\\mathrm{kPa}=101300\\,\\mathrm{Pa},\\ 200\\,\\mathrm{cc}=200\\times10^{-6}\\,\\mathrm{m^3}"),
      inline("m=\\frac{101300\\times200\\times10^{-6}}{287\\times288}\\approx" + numberText(PRACTICE_N2_MASS * 1000, 3) + "\\,\\mathrm{g}"),
    ],
    explanation: "状態方程式へ入れる前に圧力と体積をSI単位へそろえる。元資料の気体名は窒素だが、指定されたR=287 J/(kg·K)は空気相当なので、この演習では問題文の指定値をそのまま用いる。",
  }),

  question({
    id: "th-q-law-clausius",
    topic: "second-law",
    genre: "クラウジウス",
    difficulty: 1,
    format: "choice",
    prompt: "クラウジウスの表現として正しいものを選べ。",
    answer: "外部へ変化を残さず、熱を低温側から高温側へ移すことはできない。",
    options: ["外部へ変化を残さず、熱を低温側から高温側へ移すことはできない。", "熱は必ず低温側から高温側へ移る。", "熱は全て仕事へ変換できる。", "エネルギーは保存しない。"],
    formula: "T_{\\mathrm{hot}}>T_{\\mathrm{cold}}",
    steps: ["自然な熱移動は高温側から低温側。", "逆向きには外部からの作用が必要。"],
    explanation: "第1法則だけでは向きは決まらず、第2法則が自然過程の向きを定める。",
  }),
  question({
    id: "th-q-law-kelvin",
    topic: "second-law",
    genre: "ケルビン・プランク",
    difficulty: 1,
    format: "choice",
    prompt: "周期熱機関について正しい説明を選べ。",
    answer: "単一熱源から受けた熱を、他に変化を残さず全て仕事へ変えることはできない。",
    options: ["単一熱源から受けた熱を、他に変化を残さず全て仕事へ変えることはできない。", "放熱なしで必ず効率1になる。", "仕事を全て熱へ変えることも不可能である。", "低温熱源は不要である。"],
    formula: "\\eta=1-\\frac{Q_2}{Q_1}<1",
    steps: ["周期機関には低温側への放熱が必要。", inline("Q_2>0") + "なので" + inline("\\eta<1") + "。"],
    explanation: "受熱の一部を放熱する必要があり、100%の熱効率は実現できない。",
  }),
  question({
    id: "th-q-law-direction",
    topic: "second-law",
    genre: "自然過程",
    difficulty: 1,
    format: "text",
    prompt: "500 Kと300 Kの物体を接触させた。熱の自然な移動方向を答えよ。",
    answer: "500 K側から300 K側へ移る。",
    accepted: ["500 Kから300 K", "高温側から低温側"],
    keywords: ["500", "300", "高温", "低温"],
    minKeywords: 2,
    formula: "T_1>T_2\\Rightarrow Q:T_1\\to T_2",
    steps: ["500 K側が高温、300 K側が低温。", "自然な熱移動は高温側から低温側。"],
    explanation: "逆向きの移動には外部から仕事などを与える必要がある。",
  }),
  question({
    id: "th-q-law-engine",
    topic: "second-law",
    genre: "熱機関",
    difficulty: 2,
    format: "choice",
    prompt: "Q1=100 kJを受け、W=100 kJを出し、放熱Q2=0の周期熱機関は実現できるか。",
    answer: "実現できない。",
    options: ["実現できる。", "実現できない。", "温度によらず判断不能。", "第一法則だけで必ず実現できる。"],
    formula: "Q_1=W,\\ Q_2=0\\Rightarrow\\eta=1",
    steps: ["エネルギー収支だけなら数値は合う。", "しかし効率1の周期熱機関は第2法則に反する。"],
    explanation: "第1法則を満たしていても、第2法則に反する過程は実現できない。",
  }),
  question({
    id: "th-q-law-pmm2",
    topic: "second-law",
    genre: "第二種永久機関",
    difficulty: 1,
    format: "text",
    prompt: "単一熱源から熱を取り出して全て仕事に変える周期機関を何と呼ぶか。",
    answer: "第二種永久機関",
    accepted: ["第二種永久機関", "第2種永久機関"],
    keywords: ["第二種", "永久機関"],
    minKeywords: 2,
    formula: "\\eta=1",
    steps: ["単一熱源・放熱なし・全熱量を仕事、という条件を確認する。", "この仮想機関は第二種永久機関。"],
    explanation: "熱力学第2法則により、第二種永久機関は実現できない。",
  }),

  question({
    id: "th-q-ent-constant-temperature",
    topic: "entropy",
    genre: "定温受熱",
    difficulty: 1,
    format: "number",
    prompt: "300 Kで可逆に600 kJの熱を受け取る系のエントロピー変化を求めよ。",
    answer: "2 kJ/K",
    numericAnswer: 2,
    expectedUnit: "kJ/K",
    acceptedUnits: { "J/K": 0.001, "kJ/K": 1 },
    requiresUnit: true,
    tolerance: 0.01,
    formula: "\\Delta S=\\frac{Q_{\\mathrm{rev}}}{T}",
    steps: [inline("\\Delta S=\\frac{600}{300}"), inline("\\Delta S=2\\,\\mathrm{kJ\\,K^{-1}}")],
    explanation: "温度が一定なので" + inline("\\frac{Q}{T}") + "をそのまま用いる。受熱なので正。",
  }),
  question({
    id: "th-q-ent-hot",
    topic: "entropy",
    genre: "高温熱源",
    difficulty: 1,
    format: "number",
    prompt: "500 Kの熱源が100 kJを失う。熱源のエントロピー変化を求めよ。",
    answer: "-0.2 kJ/K",
    numericAnswer: -0.2,
    expectedUnit: "kJ/K",
    acceptedUnits: { "J/K": 0.001, "kJ/K": 1 },
    requiresUnit: true,
    tolerance: 0.002,
    formula: "\\Delta S_{\\mathrm{hot}}=-\\frac{Q}{T_1}",
    steps: [inline("\\Delta S_{\\mathrm{hot}}=-\\frac{100}{500}"), inline("=-0.2\\,\\mathrm{kJ\\,K^{-1}}")],
    explanation: "高温熱源は熱を失うので、" + inline("\\frac{Q}{T}") + "の符号は負。",
  }),
  question({
    id: "th-q-ent-total",
    topic: "entropy",
    genre: "全エントロピー",
    difficulty: 2,
    format: "number",
    prompt: "500 Kの熱源から300 Kの熱源へ100 kJが移る。二熱源全体のエントロピー変化を求めよ。",
    answer: "0.133 kJ/K",
    numericAnswer: 100 * (-1 / 500 + 1 / 300),
    expectedUnit: "kJ/K",
    acceptedUnits: { "J/K": 0.001, "kJ/K": 1 },
    requiresUnit: true,
    tolerance: 0.002,
    formula: "\\Delta S_{\\mathrm{total}}=-\\frac{Q}{T_1}+\\frac{Q}{T_2}",
    steps: [
      inline("\\Delta S=-\\frac{100}{500}+\\frac{100}{300}"),
      inline("\\Delta S\\approx0.133\\,\\mathrm{kJ\\,K^{-1}}>0"),
    ],
    explanation: "不可逆な有限温度差の熱移動なので、全体のエントロピーは増加する。",
  }),
  question({
    id: "th-q-ent-isentropic",
    topic: "entropy",
    genre: "等エントロピー",
    difficulty: 1,
    format: "choice",
    prompt: "可逆断熱変化で正しい関係を選べ。",
    answer: inline("\\Delta S=0"),
    options: [inline("\\Delta S>0"), inline("\\Delta S=0"), inline("\\Delta S<0"), inline("S=0")],
    formula: "dS=\\frac{\\delta Q_{\\mathrm{rev}}}{T}",
    steps: [inline("\\delta Q_{\\mathrm{rev}}=0"), "したがって" + inline("dS=0") + "。"],
    explanation: "エントロピーそのものがゼロなのではなく、可逆断熱過程で変化量がゼロ。",
  }),
  question({
    id: "th-q-ent-specific",
    topic: "entropy",
    genre: "比エントロピー",
    difficulty: 1,
    format: "number",
    prompt: "質量3 kgの系の全エントロピーが" + inline("12\\,\\mathrm{kJ\\,K^{-1}}") + "である。比エントロピーを求めよ。",
    answer: "4 kJ/(kg K)",
    numericAnswer: 4,
    expectedUnit: "kJ/(kg K)",
    acceptedUnits: { "J/(kg K)": 0.001, "kJ/(kg K)": 1 },
    requiresUnit: true,
    tolerance: 0.01,
    formula: "s=\\frac{S}{m}",
    steps: [inline("s=\\frac{12}{3}"), inline("s=4\\,\\mathrm{kJ\\,(kg\\,K)^{-1}}")],
    explanation: "全エントロピーを質量で割ると比エントロピーになる。",
  }),

  question({
    id: "th-q-otto-processes",
    topic: "otto",
    genre: "4過程",
    difficulty: 1,
    format: "choice",
    prompt: "理論オットーサイクルの正しい過程順を選べ。",
    answer: "断熱圧縮→定容加熱→断熱膨張→定容放熱",
    options: ["断熱圧縮→定容加熱→断熱膨張→定容放熱", "等温圧縮→定圧加熱→等温膨張→定圧放熱", "定容圧縮→断熱加熱→定容膨張→断熱放熱", "断熱圧縮→定圧加熱→断熱膨張→定圧放熱"],
    formula: "1\\to2:Q=0,\\ 2\\to3:V=C,\\ 3\\to4:Q=0,\\ 4\\to1:V=C",
    steps: ["圧縮・膨張は断熱。", "加熱・放熱は定容。"],
    explanation: "理論オットーサイクルでは燃焼と排熱を瞬時の定容熱移動として扱う。",
  }),
  question({
    id: "th-q-otto-compression",
    topic: "otto",
    genre: "圧縮比",
    difficulty: 1,
    format: "number",
    prompt: "最大体積500 cc、最小体積50 ccのとき圧縮比を求めよ。",
    answer: "10",
    numericAnswer: 10,
    tolerance: 0.01,
    formula: "\\varepsilon=\\frac{V_1}{V_2}",
    steps: [inline("\\varepsilon=\\frac{500}{50}"), inline("\\varepsilon=10")],
    explanation: "圧縮比は最大体積を最小体積で割った無次元量。",
  }),
  question({
    id: "th-q-otto-efficiency",
    topic: "otto",
    genre: "理論熱効率",
    difficulty: 2,
    format: "number",
    prompt: "圧縮比10、比熱比1.4の理論オットーサイクルの熱効率を求めよ。",
    answer: numberText(PRACTICE_OTTO_EFF * 100, 2) + "%",
    numericAnswer: PRACTICE_OTTO_EFF * 100,
    expectedUnit: "%",
    acceptedUnits: { "%": 1 },
    requiresUnit: true,
    tolerance: 0.1,
    formula: "\\eta_{\\mathrm{th}}=1-\\frac{1}{\\varepsilon^{\\kappa-1}}",
    steps: [
      inline("\\eta_{\\mathrm{th}}=1-\\frac{1}{10^{0.4}}"),
      inline("\\eta_{\\mathrm{th}}\\approx" + numberText(PRACTICE_OTTO_EFF, 4) + "=" + numberText(PRACTICE_OTTO_EFF * 100, 2) + "\\%"),
    ],
    explanation: "効率を百分率で答えるときだけ最後に100を掛ける。",
  }),
  question({
    id: "th-q-otto-temperature",
    topic: "otto",
    genre: "圧縮後温度",
    difficulty: 2,
    format: "number",
    prompt: "T1=300 K、圧縮比10、比熱比1.4の断熱圧縮後温度T2を求めよ。",
    answer: numberText(PRACTICE_OTTO_T2, 1) + " K",
    numericAnswer: PRACTICE_OTTO_T2,
    expectedUnit: "K",
    acceptedUnits: { K: 1 },
    requiresUnit: true,
    tolerance: 1,
    formula: "T_2=T_1\\varepsilon^{\\kappa-1}",
    steps: [inline("T_2=300\\times10^{0.4}"), inline("T_2\\approx" + numberText(PRACTICE_OTTO_T2, 1) + "\\,\\mathrm{K}")],
    explanation: "温度はKで代入する。圧縮なのでT2はT1より高い。",
  }),
  question({
    id: "th-q-otto-format3",
    topic: "otto",
    genre: "シリンダ総合",
    difficulty: 3,
    format: "text",
    prompt: "内径64 mm、行程64 mm、すきま長さ8 mm、κ=1.30、吸気25℃の1気筒について、すきま容積・行程容積・圧縮比・理論効率・圧縮後温度を求めよ。",
    answer:
      "すきま容積" +
      numberText(FORMAT3_CLEARANCE_CC, 2) +
      " cc、行程容積" +
      numberText(FORMAT3_SWEPT_CC, 1) +
      " cc、圧縮比" +
      numberText(FORMAT3_COMPRESSION, 2) +
      "、効率" +
      numberText(FORMAT3_OTTO_EFF * 100, 2) +
      "%、T2=" +
      numberText(FORMAT3_OTTO_T2, 1) +
      " K",
    accepted: ["25.7 cc,206 cc,9,48.3%,576 K"],
    keywords: ["25.7", "206", "9", "48.3", "576"],
    minKeywords: 4,
    formula: "\\begin{aligned}V&=\\frac{\\pi d^2L}{4}\\\\ \\varepsilon&=\\frac{V_s+V_c}{V_c}\\\\ \\eta&=1-\\frac{1}{\\varepsilon^{\\kappa-1}}\\\\ T_2&=T_1\\varepsilon^{\\kappa-1}\\end{aligned}",
    steps: [
      inline("d=6.4\\,\\mathrm{cm},\\ L=6.4\\,\\mathrm{cm},\\ l_c=0.8\\,\\mathrm{cm}"),
      inline("V_c=\\frac{\\pi(6.4)^2(0.8)}{4}\\approx" + numberText(FORMAT3_CLEARANCE_CC, 2) + "\\,\\mathrm{cc}"),
      inline("V_s=\\frac{\\pi(6.4)^2(6.4)}{4}\\approx" + numberText(FORMAT3_SWEPT_CC, 1) + "\\,\\mathrm{cc}"),
      inline("\\varepsilon=\\frac{V_s+V_c}{V_c}\\approx" + numberText(FORMAT3_COMPRESSION, 2)),
      inline("\\eta=1-\\frac{1}{\\varepsilon^{0.30}}\\approx" + numberText(FORMAT3_OTTO_EFF * 100, 2) + "\\%,\\quad T_2=298\\varepsilon^{0.30}\\approx" + numberText(FORMAT3_OTTO_T2, 1) + "\\,\\mathrm{K}"),
    ],
    explanation: "形式3問3の明瞭な寸法を使う許可済み重複問題。長さをcmへ統一してccを得る。",
    diagram: "piston",
    sourceRefs: [rangeRef(4), rangeRef(5), FORMAT3_OTTO_REF],
  }),

  question({
    id: "th-q-carnot-processes",
    topic: "carnot",
    genre: "4過程",
    difficulty: 1,
    format: "choice",
    prompt: "カルノー熱機関の正しい過程順を選べ。",
    answer: "高温等温膨張→断熱膨張→低温等温圧縮→断熱圧縮",
    options: ["高温等温膨張→断熱膨張→低温等温圧縮→断熱圧縮", "断熱圧縮→定容加熱→断熱膨張→定容放熱", "高温等圧膨張→等容冷却→低温等圧圧縮→等容加熱", "等温圧縮→断熱圧縮→等温膨張→断熱膨張"],
    formula: "1\\to2:T=T_1,\\ 2\\to3:Q=0,\\ 3\\to4:T=T_2,\\ 4\\to1:Q=0",
    steps: ["受熱は高温で等温膨張。", "断熱膨張、低温等温圧縮、断熱圧縮で戻る。"],
    explanation: "二つの等温過程を二つの断熱過程で結ぶ可逆サイクル。",
  }),
  question({
    id: "th-q-carnot-efficiency",
    topic: "carnot",
    genre: "カルノー効率",
    difficulty: 2,
    format: "number",
    prompt: "高温熱源500℃、低温熱源100℃のカルノー熱機関の効率を求めよ。",
    answer: numberText(PRACTICE_CARNOT_EFF * 100, 2) + "%",
    numericAnswer: PRACTICE_CARNOT_EFF * 100,
    expectedUnit: "%",
    acceptedUnits: { "%": 1 },
    requiresUnit: true,
    tolerance: 0.1,
    formula: "\\eta_c=1-\\frac{T_2}{T_1}",
    steps: [
      inline("T_1=773\\,\\mathrm{K},\\ T_2=373\\,\\mathrm{K}"),
      inline("\\eta_c=1-\\frac{373}{773}\\approx" + numberText(PRACTICE_CARNOT_EFF, 4) + "=" + numberText(PRACTICE_CARNOT_EFF * 100, 2) + "\\%"),
    ],
    explanation: "摂氏温度の比ではなく、273を加えた絶対温度の比を使う。",
    sourceRefs: [rangeRef(6), rangeRef(7), rangeRef(8), FORMAT3_CARNOT_REF],
  }),
  question({
    id: "th-q-carnot-ratio",
    topic: "carnot",
    genre: "熱量比",
    difficulty: 1,
    format: "number",
    prompt: "高温熱源500℃、低温熱源100℃のカルノー熱機関で" + inline("\\frac{Q_2}{Q_1}") + "を求めよ。",
    answer: numberText(PRACTICE_CARNOT_RATIO, 4),
    numericAnswer: PRACTICE_CARNOT_RATIO,
    tolerance: 0.002,
    formula: "\\frac{Q_2}{Q_1}=\\frac{T_2}{T_1}",
    steps: [inline("\\frac{Q_2}{Q_1}=\\frac{373}{773}"), inline("\\frac{Q_2}{Q_1}\\approx" + numberText(PRACTICE_CARNOT_RATIO, 4))],
    explanation: "可逆カルノーでは熱量比が絶対温度比に等しい。",
    sourceRefs: [rangeRef(6), rangeRef(7), rangeRef(8), FORMAT3_CARNOT_REF],
  }),
  question({
    id: "th-q-carnot-work",
    topic: "carnot",
    genre: "仕事",
    difficulty: 2,
    format: "number",
    prompt: "高温500℃・低温100℃のカルノー熱機関が10 kJを放熱する。仕事を求めよ。",
    answer: numberText(PRACTICE_CARNOT_Q1 - 10, 2) + " kJ",
    numericAnswer: PRACTICE_CARNOT_Q1 - 10,
    expectedUnit: "kJ",
    acceptedUnits: { J: 0.001, kJ: 1 },
    requiresUnit: true,
    tolerance: 0.05,
    formula: "\\begin{aligned}\\frac{Q_2}{Q_1}&=\\frac{T_2}{T_1}\\\\ W&=Q_1-Q_2\\end{aligned}",
    steps: [
      inline("Q_1=Q_2\\frac{T_1}{T_2}=10\\times\\frac{773}{373}\\approx" + numberText(PRACTICE_CARNOT_Q1, 2) + "\\,\\mathrm{kJ}"),
      inline("W=Q_1-Q_2\\approx" + numberText(PRACTICE_CARNOT_Q1 - 10, 2) + "\\,\\mathrm{kJ}"),
    ],
    explanation: "放熱量から先に受熱量を熱量比で戻し、その差を仕事にする。",
    sourceRefs: [rangeRef(6), rangeRef(7), rangeRef(8), FORMAT3_CARNOT_REF],
  }),
  question({
    id: "th-q-carnot-entropy",
    topic: "carnot",
    genre: "熱源エントロピー",
    difficulty: 2,
    format: "text",
    prompt: "可逆カルノー熱機関で高温熱源500℃、低温熱源100℃、高温側の受熱量20 kJとして、両熱源のエントロピー変化と合計を示せ。",
    answer: "高温側-0.0259 kJ/K、低温側+0.0259 kJ/K、合計0",
    accepted: ["-0.0259,+0.0259,0"],
    keywords: ["-0.0259", "+0.0259", "0"],
    minKeywords: 3,
    formula: "\\begin{aligned}\\Delta S_{\\mathrm{hot}}&=-\\frac{Q_1}{T_1}\\\\ \\Delta S_{\\mathrm{cold}}&=\\frac{Q_2}{T_2}\\end{aligned}",
    steps: [
      inline("\\Delta S_{\\mathrm{hot}}=-\\frac{20}{773}=-0.0259\\,\\mathrm{kJ\\,K^{-1}}"),
      inline("\\frac{Q_2}{Q_1}=\\frac{T_2}{T_1}") + "より" + inline("\\frac{Q_2}{T_2}=\\frac{Q_1}{T_1}"),
      inline("\\Delta S_{\\mathrm{cold}}=+0.0259\\,\\mathrm{kJ\\,K^{-1}},\\quad\\Delta S_{\\mathrm{total}}=0"),
    ],
    explanation: "可逆カルノーでは高温側の減少と低温側の増加が等しく、全体はゼロ。",
  }),
  question({
    id: "th-q-carnot-additional-work",
    topic: "carnot",
    genre: "追加範囲・熱量と仕事",
    difficulty: 2,
    format: "number",
    prompt: "高温熱源860 K、低温熱源380 Kの可逆カルノー熱機関が高温側から20 kJを受け取る。正味仕事Wを求めよ。",
    answer: numberText(ADDITIONAL_CARNOT_WORK, 2) + " kJ",
    numericAnswer: ADDITIONAL_CARNOT_WORK,
    expectedUnit: "kJ",
    acceptedUnits: { J: 0.001, kJ: 1 },
    requiresUnit: true,
    tolerance: 0.05,
    formula: "\\begin{aligned}\\frac{Q_2}{Q_1}&=\\frac{T_2}{T_1}\\\\ W&=Q_1-Q_2\\end{aligned}",
    steps: [
      inline("Q_2=20\\times\\frac{380}{860}\\approx" + numberText(ADDITIONAL_CARNOT_Q2, 2) + "\\,\\mathrm{kJ}"),
      inline("W=20-" + numberText(ADDITIONAL_CARNOT_Q2, 2) + "\\approx" + numberText(ADDITIONAL_CARNOT_WORK, 2) + "\\,\\mathrm{kJ}"),
    ],
    explanation: "資料の20 kJは発生仕事ではなく高温側からの受熱量Q1。絶対温度比からQ2を求め、その差を仕事とする。",
    diagram: "carnot-pv",
    sourceRefs: [rangeRef(8)],
  }),
  question({
    id: "th-q-carnot-additional-entropy",
    topic: "carnot",
    genre: "追加範囲・熱源エントロピー",
    difficulty: 3,
    format: "text",
    prompt: "高温熱源860 K、低温熱源380 Kの可逆カルノー熱機関が高温側からQ1=20 kJを受け取る。高温熱源・低温熱源・両熱源全体のエントロピー変化を示せ。",
    answer: "高温側-" + numberText(ADDITIONAL_CARNOT_ENTROPY, 5) + " kJ/K、低温側+" + numberText(ADDITIONAL_CARNOT_ENTROPY, 5) + " kJ/K、合計0。",
    keywords: ["-0.02326", "+0.02326", "0"],
    minKeywords: 3,
    formula: "\\begin{aligned}\\Delta S_{\\mathrm{fluid,hot}}&=+\\frac{Q_1}{T_1},&\\Delta S_{\\mathrm{fluid,cold}}&=-\\frac{Q_2}{T_2}\\\\ \\Delta S_{\\mathrm{reservoir,hot}}&=-\\frac{Q_1}{T_1},&\\Delta S_{\\mathrm{reservoir,cold}}&=+\\frac{Q_2}{T_2}\\end{aligned}",
    steps: [
      "原ノートの赤字は作動流体を基準にし、高温等温過程で" + inline("\\Delta S_{\\mathrm{fluid,hot}}=+\\frac{20}{860}\\approx+" + numberText(ADDITIONAL_CARNOT_ENTROPY, 5) + "\\,\\mathrm{kJ\\,K^{-1}}") + "、低温等温過程で" + inline("\\Delta S_{\\mathrm{fluid,cold}}=-\\frac{" + numberText(ADDITIONAL_CARNOT_Q2, 2) + "}{380}\\approx-" + numberText(ADDITIONAL_CARNOT_ENTROPY, 5) + "\\,\\mathrm{kJ\\,K^{-1}}") + "となる。",
      "設問の熱源を基準にすると熱の受け渡しが逆なので、" + inline("\\Delta S_{\\mathrm{reservoir,hot}}=-\\frac{20}{860}\\approx-" + numberText(ADDITIONAL_CARNOT_ENTROPY, 5) + "\\,\\mathrm{kJ\\,K^{-1}}") + "、" + inline("\\Delta S_{\\mathrm{reservoir,cold}}=+\\frac{" + numberText(ADDITIONAL_CARNOT_Q2, 2) + "}{380}\\approx+" + numberText(ADDITIONAL_CARNOT_ENTROPY, 5) + "\\,\\mathrm{kJ\\,K^{-1}}") + "となる。",
      inline("\\Delta S_{\\mathrm{fluid,total}}=0,\\qquad\\Delta S_{\\mathrm{reservoir,total}}=0"),
    ],
    explanation: "同じ熱移動でも、作動流体と熱源では符号が逆になる。原ノートは作動流体について高温側過程を正、低温側過程を負としている。一方、この設問は熱源の変化を尋ねるため高温熱源が負、低温熱源が正となる。可逆サイクルではどちらの視点でも二つの変化の大きさが一致し、合計は0になる。",
    diagram: "carnot-ts",
    sourceRefs: [rangeRef(8)],
  }),
  question({
    id: "th-q-refrigeration-components",
    topic: "refrigeration",
    genre: "冷凍装置・構成機器",
    difficulty: 1,
    format: "choice",
    prompt: "図の蒸気圧縮冷凍サイクルで、冷媒が通る4機器の正しい順序を選べ。",
    answer: "圧縮機→凝縮器→膨張弁→蒸発器",
    options: [
      "圧縮機→凝縮器→膨張弁→蒸発器",
      "圧縮機→蒸発器→膨張弁→凝縮器",
      "蒸発器→凝縮器→圧縮機→膨張弁",
      "凝縮器→圧縮機→蒸発器→膨張弁",
    ],
    formula: "\\text{圧縮機}\\to\\text{凝縮器}\\to\\text{膨張弁}\\to\\text{蒸発器}",
    steps: ["圧縮機で冷媒へ仕事Wを加える。", "凝縮器でQ1を放出し、膨張弁で減圧し、蒸発器でQ2を吸収する。"],
    explanation: "各機器の役割と熱・仕事の矢印を一緒に覚えると、単なる名称暗記ではなく装置図から復元できる。",
    diagram: "refrigeration-cycle",
    sourceRefs: [rangeRef(8)],
  }),
  question({
    id: "th-q-refrigeration-diagram",
    topic: "refrigeration",
    genre: "冷凍装置・熱と仕事",
    difficulty: 2,
    format: "diagram",
    prompt: "装置図の圧縮機・凝縮器・膨張弁・蒸発器を特定し、W、Q1、Q2の向きを書き込め。",
    answer: "圧縮機へWを入力、凝縮器から高温側へQ1を放出、蒸発器は低温側からQ2を吸収する。膨張弁で減圧する。",
    keywords: ["圧縮機", "凝縮器", "膨張弁", "蒸発器", "W", "Q1", "Q2"],
    minKeywords: 6,
    formula: "Q_1=Q_2+W",
    steps: ["4機器を冷媒の流れ順に配置する。", "圧縮機だけに仕事入力W、凝縮器に放熱Q1、蒸発器に吸熱Q2の矢印を付ける。"],
    explanation: "冷凍機は外部仕事によって低温側から高温側へ熱をくみ上げるため、熱と仕事の向きを誤らないことが重要。",
    diagram: "refrigeration-cycle",
    sourceRefs: [rangeRef(8)],
  }),
  question({
    id: "th-q-refrigeration-balance",
    topic: "refrigeration",
    genre: "冷凍サイクル・熱収支",
    difficulty: 1,
    format: "number",
    prompt: "冷凍機が低温側から12 kJを吸収し、一周期に3 kJの仕事を受ける。高温側への放熱量Q1を求めよ。",
    answer: "15 kJ",
    numericAnswer: 15,
    expectedUnit: "kJ",
    acceptedUnits: { J: 0.001, kJ: 1 },
    requiresUnit: true,
    tolerance: 0.02,
    formula: "Q_1=Q_2+W",
    steps: [inline("Q_1=12+3"), inline("Q_1=15\\,\\mathrm{kJ}")],
    explanation: "一周期のエネルギー収支では、高温側への放熱は低温側からの吸熱と圧縮機仕事の和になる。",
    diagram: "refrigeration-cycle",
    sourceRefs: [rangeRef(8)],
  }),
  question({
    id: "th-q-refrigeration-cop",
    topic: "refrigeration",
    genre: "冷凍機COP",
    difficulty: 2,
    format: "number",
    prompt: "低温側から14 kJを吸収するために2 kJの仕事を要する冷凍機の成績係数εrを求めよ。",
    answer: "7",
    numericAnswer: 7,
    tolerance: 0.01,
    formula: "\\varepsilon_r=\\frac{Q_2}{W}",
    steps: [inline("\\varepsilon_r=\\frac{14}{2}"), inline("\\varepsilon_r=7")],
    explanation: "冷凍目的で有用なのは低温側から取り去るQ2。成績係数は無次元で、効率とは違い1を超えてよい。",
    diagram: "refrigeration-cycle",
    sourceRefs: [rangeRef(8), rangeRef(9)],
  }),
  question({
    id: "th-q-heat-pump-cop",
    topic: "refrigeration",
    genre: "ヒートポンプCOP",
    difficulty: 2,
    format: "number",
    prompt: "低温側からQ2=14 kJを吸収するためにW=2 kJの仕事を要する装置を、暖房用ヒートポンプとして用いる。暖房成績係数εhを求めよ。",
    answer: "8",
    numericAnswer: 8,
    tolerance: 0.01,
    formula: "\\varepsilon_h=\\varepsilon_r+1",
    steps: [inline("Q_1=Q_2+W=14+2=16\\,\\mathrm{kJ}"), inline("\\varepsilon_h=\\frac{Q_1}{W}=\\frac{16}{2}=8"), inline("\\varepsilon_h=\\varepsilon_r+1=7+1=8")],
    explanation: "Q1=Q2+WをWで割るため、暖房成績係数は冷凍成績係数より1大きい。",
    diagram: "refrigeration-cycle",
    sourceRefs: [rangeRef(8), rangeRef(9)],
  }),
  question({
    id: "th-q-reversed-carnot-diagram",
    topic: "refrigeration",
    genre: "逆カルノーT-S線図",
    difficulty: 2,
    format: "diagram",
    prompt: "逆カルノーサイクルをT-S線図に描き、進行方向、Q1、Q2、二つの等エントロピー過程を示せ。",
    answer: "低温T2でQ2を吸収し、等エントロピー圧縮、高温T1でQ1を放出、等エントロピー膨張を行う反時計回りの長方形。",
    keywords: ["T1", "T2", "Q1", "Q2", "等エントロピー", "反時計"],
    minKeywords: 5,
    formula: "\\frac{Q_2}{Q_1}=\\frac{T_2}{T_1}",
    steps: ["等温過程を水平線、可逆断熱過程を鉛直線で描く。", "熱機関と逆向きの反時計回りに矢印を付ける。"],
    explanation: "逆カルノーはカルノー熱機関を逆向きに運転し、仕事を受けて低温側から高温側へ熱を移す。",
    diagram: "reversed-carnot-ts",
    sourceRefs: [rangeRef(9)],
  }),
  question({
    id: "th-q-reversed-carnot-cop",
    topic: "refrigeration",
    genre: "追加範囲・逆カルノーCOP",
    difficulty: 2,
    format: "text",
    prompt: "高温側47℃、低温側7℃の逆カルノーサイクルについて、冷凍成績係数εrと暖房成績係数εhを求めよ。",
    answer: "εr=" + numberText(ADDITIONAL_REVERSED_COP_R, 3) + "、εh=" + numberText(ADDITIONAL_REVERSED_COP_H, 3),
    keywords: ["7", "8"],
    minKeywords: 2,
    formula: "\\begin{aligned}\\varepsilon_r&=\\frac{T_2}{T_1-T_2}\\\\ \\varepsilon_h&=\\frac{T_1}{T_1-T_2}\\end{aligned}",
    steps: [
      inline("T_1=47+273=320\\,\\mathrm K,\\quad T_2=7+273=280\\,\\mathrm K"),
      inline("\\varepsilon_r=\\frac{280}{320-280}=7"),
      inline("\\varepsilon_h=\\frac{320}{320-280}=8"),
    ],
    explanation: "温度はKへ直すが、温度差40 Kは40℃差と同じ。結果はεh=εr+1でも照合できる。",
    diagram: "reversed-carnot-ts",
    sourceRefs: [rangeRef(9)],
  }),
  question({
    id: "th-q-refrigeration-capacity",
    topic: "refrigeration",
    genre: "追加範囲・冷凍能力換算",
    difficulty: 2,
    format: "number",
    prompt: "冷凍能力1200 kcal/hを、資料指定の1 kcal=4.19 kJでkWへ換算せよ。",
    answer: numberText(ADDITIONAL_COOLING_KW, 3) + " kW",
    numericAnswer: ADDITIONAL_COOLING_KW,
    expectedUnit: "kW",
    acceptedUnits: { W: 0.001, kW: 1 },
    requiresUnit: true,
    tolerance: 0.005,
    formula: "\\dot Q_2=\\frac{1200\\times4.19}{3600}",
    steps: [inline("1200\\times4.19=5028\\,\\mathrm{kJ\\,h^{-1}}"), inline("\\dot Q_2=\\frac{5028}{3600}\\approx" + numberText(ADDITIONAL_COOLING_KW, 3) + "\\,\\mathrm{kW}")],
    explanation: "kJ/hを3600で割るとkJ/sとなり、1 kJ/s=1 kWを使える。",
    diagram: "refrigeration-cycle",
    sourceRefs: [rangeRef(9)],
  }),
  question({
    id: "th-q-reversed-carnot-power",
    topic: "refrigeration",
    genre: "追加範囲・必要動力",
    difficulty: 3,
    format: "number",
    context: "高温側47℃、低温側7℃の逆カルノー冷凍機。冷凍能力は1200 kcal/hとする。",
    prompt: "温度条件から冷凍成績係数を求め、冷凍能力1200 kcal/hをkWへ換算したうえで、必要動力を求めよ。",
    answer: numberText(ADDITIONAL_REQUIRED_POWER_KW, 3) + " kW",
    numericAnswer: ADDITIONAL_REQUIRED_POWER_KW,
    expectedUnit: "kW",
    acceptedUnits: { W: 0.001, kW: 1 },
    requiresUnit: true,
    tolerance: 0.005,
    formula: "\\dot W=\\frac{\\dot Q_2}{\\varepsilon_r}",
    steps: [
      inline("\\dot Q_2=\\frac{1200\\times4.19}{3600}\\approx" + numberText(ADDITIONAL_COOLING_KW, 3) + "\\,\\mathrm{kW}"),
      inline("\\dot W=\\frac{" + numberText(ADDITIONAL_COOLING_KW, 3) + "}{7}\\approx" + numberText(ADDITIONAL_REQUIRED_POWER_KW, 3) + "\\,\\mathrm{kW}"),
    ],
    explanation: "冷凍COPの定義を必要動力について解く。資料の丸めでは約0.200 kWとなる。",
    diagram: "reversed-carnot-ts",
    sourceRefs: [rangeRef(9)],
  }),
];

type ExamVariant = {
  poly: readonly [number, number, number];
  adiabatic: readonly [number, number, number, number, number];
  entropy: readonly [number, number, number];
  otto: readonly [number, number, number, number, number];
  carnot: readonly [number, number, number];
  refrigeration: readonly [number, number, number];
};

const EXAM_VARIANTS: ExamVariant[] = [
  { poly: [100, 2, 1.2], adiabatic: [100, 300, 4, 1.4, 1], entropy: [120, 600, 300], otto: [64, 64, 8, 1.3, 25], carnot: [500, 100, 10], refrigeration: [47, 7, 1200] },
  { poly: [110, 2.5, 1.25], adiabatic: [95, 295, 3, 1.4, 0.8], entropy: [150, 650, 325], otto: [70, 70, 10, 1.32, 20], carnot: [450, 50, 12], refrigeration: [42, 2, 1000] },
  { poly: [90, 3, 1.3], adiabatic: [105, 310, 5, 1.4, 1.2], entropy: [180, 720, 360], otto: [72, 80, 10, 1.35, 30], carnot: [550, 150, 15], refrigeration: [50, 10, 1500] },
  { poly: [130, 1.8, 1.35], adiabatic: [120, 290, 2.5, 1.4, 0.6], entropy: [96, 480, 320], otto: [60, 72, 9, 1.3, 15], carnot: [400, 80, 9], refrigeration: [37, -3, 900] },
  { poly: [115, 2.2, 1.28], adiabatic: [98, 305, 3.5, 1.4, 1.1], entropy: [140, 700, 350], otto: [68, 76, 9.5, 1.33, 28], carnot: [600, 120, 18], refrigeration: [45, 5, 1800] },
  { poly: [105, 2.8, 1.32], adiabatic: [108, 298, 4.5, 1.4, 0.9], entropy: [160, 640, 320], otto: [66, 74, 8.5, 1.34, 22], carnot: [520, 90, 14], refrigeration: [55, 15, 1400] },
];

function examQuestion(
  examId: string,
  major: number,
  sub: number,
  points: number,
  input: Omit<QuestionInput, "id">,
): ThermodynamicsExamQuestion {
  return {
    ...question({ ...input, id: examId + "-m" + major + "-q" + sub }),
    major,
    sub,
    points,
  };
}

function buildThermodynamicsExam(index: number): ThermodynamicsExpectedExam {
  const variant = EXAM_VARIANTS[index - 1];
  const id = "thermo-expected-" + String(index).padStart(2, "0");
  const [polyP1, polyRatio, polyN] = variant.poly;
  const [adP1, adT1, adRatio, adKappa, adMass] = variant.adiabatic;
  const [entropyQ, entropyHot, entropyCold] = variant.entropy;
  const [ottoDiameterMm, ottoStrokeMm, ottoClearanceMm, ottoKappa, ottoIntakeC] = variant.otto;
  const [carnotHotC, carnotColdC, carnotQOut] = variant.carnot;
  const [refrigerationHotC, refrigerationColdC, refrigerationKcalPerHour] = variant.refrigeration;
  const polyT1C = 25 + 2 * (index - 1);
  const polyT1K = polyT1C + 273;
  const polyP2 = polyP1 * polyRatio ** polyN;
  const polyT2 = polyT1K * (polyP2 / polyP1) / polyRatio;
  const adP2 = adP1 * adRatio ** adKappa;
  const adT2 = adT1 * adRatio ** (adKappa - 1);
  const adWb = (adMass * 287 * (adT1 - adT2)) / (adKappa - 1) / 1000;
  const adWt = adKappa * adWb;
  const d = ottoDiameterMm / 10;
  const stroke = ottoStrokeMm / 10;
  const clearance = ottoClearanceMm / 10;
  const vc = (Math.PI * d ** 2 * clearance) / 4;
  const vs = (Math.PI * d ** 2 * stroke) / 4;
  const epsilon = (vc + vs) / vc;
  const ottoEta = 1 - 1 / epsilon ** (ottoKappa - 1);
  const ottoT2 = (ottoIntakeC + 273) * epsilon ** (ottoKappa - 1);
  const entropyQJ = entropyQ * 1000;
  const entropyHotDelta = -entropyQ / entropyHot;
  const entropyColdDelta = entropyQ / entropyCold;
  const entropyTotal = entropyHotDelta + entropyColdDelta;
  const highK = carnotHotC + 273;
  const lowK = carnotColdC + 273;
  const carnotRatio = lowK / highK;
  const carnotEta = 1 - carnotRatio;
  const carnotQIn = carnotQOut / carnotRatio;
  const carnotW = carnotQIn - carnotQOut;


  const refrigerationHighK = refrigerationHotC + 273;
  const refrigerationLowK = refrigerationColdC + 273;
  const refrigerationCopR = refrigerationLowK / (refrigerationHighK - refrigerationLowK);
  const refrigerationCopH = refrigerationHighK / (refrigerationHighK - refrigerationLowK);
  const refrigerationCoolingKw = (refrigerationKcalPerHour * 4.19) / 3600;
  const refrigerationPowerKw = refrigerationCoolingKw / refrigerationCopR;
  const refrigerationHeatingKw = refrigerationCoolingKw + refrigerationPowerKw;

  const sections: ThermodynamicsExamSection[] = [
    {
      number: 1,
      title: "第2法則・ポリトロープ変化",
      topic: "second-law",
      topicIds: ["second-law", "polytropic"],
      points: 16,
      context: "熱移動の方向と周期機関の限界を説明する。続いてP-V線図の状態1から2へ、" + inline("P_1=" + polyP1 + "\\,\\mathrm{kPa},\\ \\frac{V_1}{V_2}=" + polyRatio + ",\\ n=" + polyN + ",\\ T_1=" + polyT1C + "\\,^\\circ\\mathrm C") + "でポリトロープ圧縮する。",
      questions: [
        examQuestion(id, 1, 1, 4, {
          topic: "second-law", genre: "クラウジウス", difficulty: 1, format: "text",
          prompt: "クラウジウスの表現を、低温側・高温側・外部への変化の3語を用いて説明せよ。",
          answer: "外部へ変化を残さず、熱を低温側から高温側へ移すことはできない。",
          keywords: ["外部", "低温", "高温"], minKeywords: 3, formula: "T_{\\mathrm{hot}}>T_{\\mathrm{cold}}",
          steps: ["自然な熱移動は高温側から低温側である。", "逆向きには外部からの作用が必要と明記する。"],
          explanation: "第1法則の収支だけでは決まらない、熱移動の自然な向きを定める表現。",
        }),
        examQuestion(id, 1, 2, 4, {
          topic: "second-law", genre: "ケルビン・プランク", difficulty: 1, format: "text",
          prompt: "単一熱源から受けた熱を全て仕事へ変える周期機関が不可能な理由を説明せよ。",
          answer: "周期機関には放熱Q2が必要で、Q2=0かつη=1は第2法則に反する。",
          keywords: ["放熱", "Q2", "効率", "第2法則"], minKeywords: 2, formula: "\\eta=1-\\frac{Q_2}{Q_1}<1",
          steps: [inline("W=Q_1-Q_2") + "である。", "第2法則により周期機関では" + inline("Q_2>0") + "。"],
          explanation: "エネルギー収支を満たして見えても、熱を100%仕事へ変換する周期機関は実現しない。",
        }),
        examQuestion(id, 1, 3, 4, {
          topic: "polytropic", genre: "P-V線図・終圧", difficulty: 2, format: "number",
          prompt: "P-V線図で圧縮方向と圧力変化を確認し、終圧P2を求めよ。",
          answer: numberText(polyP2, 1) + " kPa", numericAnswer: polyP2, expectedUnit: "kPa",
          acceptedUnits: { Pa: 0.001, kPa: 1, MPa: 1000 }, requiresUnit: true, tolerance: 1,
          formula: "P_2=P_1\\left(\\frac{V_1}{V_2}\\right)^n",
          steps: ["圧縮なので" + inline("\\frac{V_1}{V_2}>1") + "となり、線図上で圧力が上がることを確認する。", inline("P_2=" + polyP1 + "\\times" + polyRatio + "^{" + polyN + "}"), inline("P_2\\approx" + numberText(polyP2, 1) + "\\,\\mathrm{kPa}")],
          explanation: "P-V線図の向きと数値結果が整合するかを確認し、体積比のn乗を初圧へ掛ける。",
          diagram: "pv",
        }),
        examQuestion(id, 1, 4, 4, {
          topic: "polytropic", genre: "状態方程式・終温", difficulty: 3, format: "number",
          prompt: "前問のP2を用い、初温を絶対温度へ直して終温T2を求めよ。",
          answer: numberText(polyT2, 1) + " K", numericAnswer: polyT2, expectedUnit: "K",
          acceptedUnits: { K: 1 }, requiresUnit: true, tolerance: 1,
          formula: "T_2=T_1\\frac{P_2}{P_1}\\frac{V_2}{V_1}=T_1\\left(\\frac{V_1}{V_2}\\right)^{n-1}",
          steps: [inline("T_1=" + polyT1C + "+273=" + polyT1K + "\\,\\mathrm K"), "理想気体式を二状態で割り、前問の" + inline("P_2") + "を代入する。", inline("T_2=" + polyT1K + "\\times\\frac{" + numberText(polyP2, 1) + "}{" + polyP1 + "}\\times\\frac{1}{" + polyRatio + "}\\approx" + numberText(polyT2, 1) + "\\,\\mathrm K")],
          explanation: "圧力比と逆の体積比を組み合わせる連続計算。摂氏温度のまま状態方程式へ入れない。",
          diagram: "pv",
        }),
      ],
    },
    {
      number: 2,
      title: "理想気体の断熱変化",
      topic: "adiabatic",
      topicIds: ["adiabatic"],
      points: 18,
      context: "空気を" + inline("R=287\\,\\mathrm{J\\,(kg\\,K)^{-1}},\\ \\kappa=" + adKappa) + "とする。" + inline("P_1=" + adP1 + "\\,\\mathrm{kPa},\\ T_1=" + adT1 + "\\,\\mathrm{K},\\ m=" + adMass + "\\,\\mathrm{kg}") + "から体積が" + inline("\\frac{1}{" + adRatio + "}") + "になるまで可逆断熱圧縮する。系がする仕事を正とする。",
      questions: [
        examQuestion(id, 2, 1, 4, {
          topic: "adiabatic", genre: "P-V線図・断熱関係", difficulty: 2, format: "diagram",
          prompt: "P-V線図へ状態1、2と圧縮方向を描き、P-V、T-V、T-Pの三つの断熱関係式を書け。",
          answer: inline("\\begin{aligned}PV^{\\kappa}&=C\\\\ TV^{\\kappa-1}&=C\\\\ \\frac{T}{P^{\\frac{\\kappa-1}{\\kappa}}}&=C\\end{aligned}") + "。圧縮なので2は高圧・小体積側、系がする仕事は負。",
          keywords: ["PV", "TV", "T/P", "高圧", "負"], minKeywords: 4,
          formula: "\\begin{aligned}PV^{\\kappa}&=C\\\\ TV^{\\kappa-1}&=C\\\\ \\frac{T}{P^{\\frac{\\kappa-1}{\\kappa}}}&=C\\end{aligned}",
          steps: ["状態1を低圧・大体積側、状態2を高圧・小体積側へ置く。", "断熱圧縮曲線へ1から2の矢印を付ける。", "後続計算で使う状態量の組に応じて三関係式を整理する。"],
          explanation: "式の暗記だけでなく、圧縮時のP-V線図、状態量の増減、仕事の符号を同時に対応させる。",
          diagram: "pv",
        }),
        examQuestion(id, 2, 2, 4, {
          topic: "adiabatic", genre: "終圧", difficulty: 2, format: "number",
          prompt: "前問のP-V断熱関係を使い、終圧P2を求めよ。", answer: numberText(adP2, 1) + " kPa", numericAnswer: adP2,
          expectedUnit: "kPa", acceptedUnits: { Pa: 0.001, kPa: 1, MPa: 1000 }, requiresUnit: true, tolerance: 1.5,
          formula: "P_2=P_1\\left(\\frac{V_1}{V_2}\\right)^{\\kappa}",
          steps: [inline("P_2=" + adP1 + "\\times" + adRatio + "^{" + adKappa + "}"), inline("P_2\\approx" + numberText(adP2, 1) + "\\,\\mathrm{kPa}")],
          explanation: "圧縮なので" + inline("\\frac{V_1}{V_2}") + "は1より大きく、終圧は初圧より高くなる。",
        }),
        examQuestion(id, 2, 3, 5, {
          topic: "adiabatic", genre: "T-P関係・終温", difficulty: 3, format: "number",
          prompt: "前問で得たP2を用い、T-P断熱関係から終温T2を求めよ。",
          answer: numberText(adT2, 1) + " K", numericAnswer: adT2,
          expectedUnit: "K", acceptedUnits: { K: 1 }, requiresUnit: true, tolerance: 1,
          formula: "T_2=T_1\\left(\\frac{P_2}{P_1}\\right)^{\\frac{\\kappa-1}{\\kappa}}",
          steps: ["前問の終圧を丸め過ぎずに用いる。", inline("T_2=" + adT1 + "\\left(\\frac{" + numberText(adP2, 1) + "}{" + adP1 + "}\\right)^{\\frac{" + numberText(adKappa - 1, 2) + "}{" + adKappa + "}}"), inline("T_2\\approx" + numberText(adT2, 1) + "\\,\\mathrm{K}")],
          explanation: "前問のP2を引き継ぐ連続計算。T-P式の指数はκではなく(κ−1)/κである。",
          diagram: "pv",
        }),
        examQuestion(id, 2, 4, 5, {
          topic: "adiabatic", genre: "二つの仕事", difficulty: 3, format: "text",
          prompt: "前問のT2を用いて境界仕事Wbを求め、続いて工業仕事Wtを求め、圧縮時の符号を説明せよ。",
          answer: "Wb≈" + numberText(adWb, 1) + " kJ、Wt≈" + numberText(adWt, 1) + " kJ。系がする仕事を正としたため負。",
          keywords: [numberText(adWb, 1), numberText(adWt, 1), "負"], minKeywords: 3,
          formula: "\\begin{aligned}W_b&=\\frac{mR(T_1-T_2)}{\\kappa-1}\\\\ W_t&=\\kappa W_b\\end{aligned}",
          steps: [inline("W_b=\\frac{" + adMass + "\\times287(" + adT1 + "-" + numberText(adT2, 1) + ")}{" + adKappa + "-1}\\times10^{-3}\\approx" + numberText(adWb, 1) + "\\,\\mathrm{kJ}"), inline("W_t=" + adKappa + "W_b\\approx" + numberText(adWt, 1) + "\\,\\mathrm{kJ}")],
          explanation: "圧縮ではT2>T1となるため、系が外へする仕事を正とした値は負になる。",
        }),
      ],
    },
    {
      number: 3,
      title: "エントロピー",
      topic: "entropy",
      topicIds: ["entropy"],
      points: 18,
      context: entropyHot + " Kの高温熱源から" + entropyCold + " Kの低温熱源へ" + entropyQJ + " Jが直接移動する。解答はkJ/Kで示す。",
      questions: [
        examQuestion(id, 3, 1, 4, {
          topic: "entropy", genre: "符号・不可逆性の予測", difficulty: 2, format: "text",
          prompt: "計算前に、高温熱源・低温熱源・二熱源全体のエントロピー変化の符号を予測し、全体が0にならない理由を述べよ。",
          answer: "高温側は負、低温側は正、全体は正。有限温度差で直接移動する不可逆過程だから。",
          keywords: ["高温", "負", "低温", "正", "不可逆"], minKeywords: 4,
          formula: "\\Delta S_{\\mathrm{total}}=-\\frac{Q}{T_1}+\\frac{Q}{T_2}>0",
          steps: ["熱を失う高温熱源は負、受け取る低温熱源は正とする。", inline("T_1>T_2") + "なので、同じ熱量を割った絶対値は低温側の方が大きい。", "有限温度差での直接熱移動は不可逆なので全体は正になる。"],
          explanation: "後続の数値計算を始める前に、符号と第2法則による結論を予測して検算基準にする。",
        }),
        examQuestion(id, 3, 2, 4, {
          topic: "entropy", genre: "高温熱源・単位換算", difficulty: 2, format: "number",
          prompt: "高温熱源のエントロピー変化を求めよ。",
          answer: numberText(entropyHotDelta, 4) + " kJ/K", numericAnswer: entropyHotDelta,
          expectedUnit: "kJ/K", acceptedUnits: { "J/K": 0.001, "kJ/K": 1 }, requiresUnit: true, tolerance: 0.002,
          formula: "\\Delta S_{\\mathrm{hot}}=-\\frac{Q}{T_1}",
          steps: [inline("Q=" + entropyQJ + "\\,\\mathrm J=" + entropyQ + "\\,\\mathrm{kJ}"), inline("\\Delta S_{\\mathrm{hot}}=-\\frac{" + entropyQ + "}{" + entropyHot + "}"), inline("\\approx" + numberText(entropyHotDelta, 4) + "\\,\\mathrm{kJ\\,K^{-1}}")],
          explanation: "高温熱源は熱を失うので変化量は負。",
        }),
        examQuestion(id, 3, 3, 5, {
          topic: "entropy", genre: "低温熱源・単位換算", difficulty: 2, format: "number",
          prompt: "低温熱源のエントロピー変化を求めよ。",
          answer: "+" + numberText(entropyColdDelta, 4) + " kJ/K", numericAnswer: entropyColdDelta,
          expectedUnit: "kJ/K", acceptedUnits: { "J/K": 0.001, "kJ/K": 1 }, requiresUnit: true, tolerance: 0.002,
          formula: "\\Delta S_{\\mathrm{cold}}=\\frac{Q}{T_2}",
          steps: [inline("Q=" + entropyQJ + "\\,\\mathrm J=" + entropyQ + "\\,\\mathrm{kJ}"), inline("\\Delta S_{\\mathrm{cold}}=\\frac{" + entropyQ + "}{" + entropyCold + "}"), inline("\\approx" + numberText(entropyColdDelta, 4) + "\\,\\mathrm{kJ\\,K^{-1}}")],
          explanation: "低温熱源は熱を受け取るので変化量は正。",
        }),
        examQuestion(id, 3, 4, 5, {
          topic: "entropy", genre: "全エントロピー・不可逆性", difficulty: 3, format: "text",
          prompt: "前二問の結果を加えて二熱源全体のエントロピー変化を求め、第2法則との関係を述べよ。",
          answer: "ΔS_total≈" + numberText(entropyTotal, 4) + " kJ/K>0。有限温度差の不可逆熱移動なので増大する。",
          keywords: [numberText(entropyTotal, 4), "正", "不可逆", "増大"], minKeywords: 3,
          formula: "\\Delta S_{\\mathrm{total}}=-\\frac{Q}{T_1}+\\frac{Q}{T_2}",
          steps: ["前二問の符号付き結果をそのまま足す。", inline("\\Delta S_{\\mathrm{total}}\\approx" + numberText(entropyHotDelta, 4) + "+" + numberText(entropyColdDelta, 4)), inline("\\approx" + numberText(entropyTotal, 4) + "\\,\\mathrm{kJ\\,K^{-1}}>0") + "より不可逆過程と判定する。"],
          explanation: "有限温度差で直接熱が移る不可逆過程では、全体系のエントロピーが増加する。",
        }),
      ],
    },
    {
      number: 4,
      title: "オットーサイクル",
      topic: "otto",
      topicIds: ["otto"],
      points: 24,
      context: "1気筒、内径" + ottoDiameterMm + " mm、行程" + ottoStrokeMm + " mm、すきま長さ" + ottoClearanceMm + " mm、κ=" + ottoKappa + "、吸気" + ottoIntakeC + "℃とする。",
      questions: [
        examQuestion(id, 4, 1, 4, {
          topic: "otto", genre: "P-V線図", difficulty: 1, format: "diagram",
          prompt: "P-V線図に状態1～4、各過程名、Q1、Q2、Wを示し、最大体積・最小体積となる状態の組も記せ。",
          answer: "1→2断熱圧縮、2→3定容加熱Q1、3→4断熱膨張、4→1定容放熱Q2。V1=V4が最大、V2=V3が最小、囲む面積がW。",
          keywords: ["断熱圧縮", "定容加熱", "断熱膨張", "定容放熱"], minKeywords: 4,
          formula: "1\\to2:Q=0,\\ 2\\to3:V=C,\\ 3\\to4:Q=0,\\ 4\\to1:V=C",
          steps: ["右側の大体積から断熱圧縮で左へ進む。", "定容加熱、断熱膨張、定容放熱で閉じる。"],
          explanation: "二本の断熱曲線と二本の定容線で閉じ、囲まれた面積が正味仕事。",
          diagram: "otto-pv", sourceRefs: [rangeRef(4), rangeRef(5), FORMAT3_OTTO_REF],
        }),
        examQuestion(id, 4, 2, 5, {
          topic: "otto", genre: "すきま容積", difficulty: 2, format: "number",
          prompt: "すきま容積Vcをccで求めよ。", answer: numberText(vc, 2) + " cc", numericAnswer: vc,
          expectedUnit: "cc", acceptedUnits: { "cm^3": 1, cc: 1, "m^3": 1e6 }, requiresUnit: true, tolerance: 0.1,
          formula: "V_c=\\frac{\\pi d^2l_c}{4}",
          steps: [inline("d=" + d + "\\,\\mathrm{cm},\\ l_c=" + clearance + "\\,\\mathrm{cm}"), inline("V_c=\\frac{\\pi(" + d + ")^2(" + clearance + ")}{4}\\approx" + numberText(vc, 2) + "\\,\\mathrm{cc}")],
          explanation: "mmをcmへそろえて円筒体積を計算すると、結果はcm³すなわちcc。",
          diagram: "piston",
          sourceRefs: [rangeRef(5), FORMAT3_OTTO_REF],
        }),
        examQuestion(id, 4, 3, 5, {
          topic: "otto", genre: "行程容積", difficulty: 2, format: "number",
          prompt: "行程容積Vsをccで求めよ。", answer: numberText(vs, 2) + " cc", numericAnswer: vs,
          expectedUnit: "cc", acceptedUnits: { "cm^3": 1, cc: 1, "m^3": 1e6 }, requiresUnit: true, tolerance: 0.2,
          formula: "V_s=\\frac{\\pi d^2L}{4}",
          steps: [inline("L=" + stroke + "\\,\\mathrm{cm}"), inline("V_s=\\frac{\\pi(" + d + ")^2(" + stroke + ")}{4}\\approx" + numberText(vs, 2) + "\\,\\mathrm{cc}")],
          explanation: "底面積へ上死点から下死点までの行程を掛ける。",
          diagram: "piston",
          sourceRefs: [rangeRef(5), FORMAT3_OTTO_REF],
        }),
        examQuestion(id, 4, 4, 5, {
          topic: "otto", genre: "圧縮比・前問結果", difficulty: 3, format: "number",
          prompt: "前二問で求めたVc、Vsを用いて圧縮比εを求めよ。", answer: numberText(epsilon, 3), numericAnswer: epsilon, tolerance: 0.02,
          formula: "\\varepsilon=\\frac{V_s+V_c}{V_c}",
          steps: ["最大体積を" + inline("V_s+V_c") + "、最小体積を" + inline("V_c") + "と置く。", inline("\\varepsilon=\\frac{" + numberText(vs, 2) + "+" + numberText(vc, 2) + "}{" + numberText(vc, 2) + "}"), inline("\\varepsilon\\approx" + numberText(epsilon, 3))],
          explanation: "最大体積は行程容積とすきま容積の和、最小体積はすきま容積。",
          diagram: "piston",
          sourceRefs: [rangeRef(5), FORMAT3_OTTO_REF],
        }),
        examQuestion(id, 4, 5, 5, {
          topic: "otto", genre: "効率・圧縮後温度", difficulty: 3, format: "text",
          prompt: "理論熱効率と断熱圧縮後温度T2を求めよ。",
          answer: "η≈" + numberText(ottoEta * 100, 2) + "%、T2≈" + numberText(ottoT2, 1) + " K",
          keywords: [numberText(ottoEta * 100, 2), numberText(ottoT2, 1)], minKeywords: 2,
          formula: "\\begin{aligned}\\eta&=1-\\frac{1}{\\varepsilon^{\\kappa-1}}\\\\ T_2&=T_1\\varepsilon^{\\kappa-1}\\end{aligned}",
          steps: [inline("\\eta=1-\\frac{1}{" + numberText(epsilon, 3) + "^{" + numberText(ottoKappa - 1, 2) + "}}\\approx" + numberText(ottoEta * 100, 2) + "\\%"), inline("T_1=" + (ottoIntakeC + 273) + "\\,\\mathrm{K}"), inline("T_2=" + (ottoIntakeC + 273) + "\\times" + numberText(epsilon, 3) + "^{" + numberText(ottoKappa - 1, 2) + "}\\approx" + numberText(ottoT2, 1) + "\\,\\mathrm{K}")],
          explanation: "効率と圧縮後温度は同じεのκ−1乗を使い、吸気温度はKへ変換する。",
          diagram: "otto-pv",
          sourceRefs: [rangeRef(4), rangeRef(5), FORMAT3_OTTO_REF],
        }),
      ],
    },
    {
      number: 5,
      title: "カルノー熱機関・冷凍サイクル",
      topic: "carnot",
      topicIds: ["carnot", "refrigeration"],
      points: 24,
      context: "高温熱源" + carnotHotC + "℃、低温熱源" + carnotColdC + "℃の間で作動し、低温側へ" + carnotQOut + " kJを放熱する可逆カルノー熱機関を考える。さらに、高温側" + refrigerationHotC + "℃、低温側" + refrigerationColdC + "℃、冷凍能力" + refrigerationKcalPerHour + " kcal/hの逆カルノー冷凍機を考える。資料指定の1 kcal=4.19 kJを用いる。",
      questions: [
        examQuestion(id, 5, 1, 4, {
          topic: "carnot", genre: "P-V線図", difficulty: 1, format: "diagram",
          prompt: "P-V線図に状態1～4、二つの等温過程、二つの断熱過程、Q1、Q2、Wを示せ。",
          answer: "1→2高温等温膨張Q1、2→3断熱膨張、3→4低温等温圧縮Q2、4→1断熱圧縮。囲む面積がW。",
          keywords: ["等温膨張", "断熱膨張", "等温圧縮", "断熱圧縮"], minKeywords: 4,
          formula: "1\\to2:T=T_1,\\ 2\\to3:Q=0,\\ 3\\to4:T=T_2,\\ 4\\to1:Q=0",
          steps: ["高温等温線を上、低温等温線を下に置く。", "二本の断熱曲線で結び時計回りに矢印を付ける。"],
          explanation: "時計回りの閉曲線で、囲む面積が一周期の正味仕事。",
          diagram: "carnot-pv", sourceRefs: [rangeRef(6), rangeRef(7), rangeRef(8), FORMAT3_CARNOT_REF],
        }),
        examQuestion(id, 5, 2, 5, {
          topic: "refrigeration", genre: "冷凍装置図・熱収支", difficulty: 2, format: "diagram",
          prompt: "蒸気圧縮冷凍サイクルの圧縮機・凝縮器・膨張弁・蒸発器を冷媒の流れ順に配置し、W、Q1、Q2の向きを示せ。",
          answer: "圧縮機→凝縮器→膨張弁→蒸発器。圧縮機へWを入力、凝縮器からQ1を放出、蒸発器でQ2を吸収する。",
          keywords: ["圧縮機", "凝縮器", "膨張弁", "蒸発器", "W", "Q1", "Q2"], minKeywords: 6,
          formula: "Q_1=Q_2+W",
          steps: ["4機器を圧縮・凝縮・膨張・蒸発の順に結ぶ。", "仕事入力と二つの熱移動の向きを付け、熱収支を照合する。"],
          explanation: "装置名だけでなく、低温側から高温側へ熱をくみ上げるための仕事と熱の流れを図で対応させる。",
          diagram: "refrigeration-cycle", sourceRefs: [rangeRef(8)],
        }),
        examQuestion(id, 5, 3, 5, {
          topic: "carnot", genre: "理論効率", difficulty: 2, format: "number",
          prompt: "理論熱効率を求めよ。", answer: numberText(carnotEta * 100, 2) + "%", numericAnswer: carnotEta * 100,
          expectedUnit: "%", acceptedUnits: { "%": 1 }, requiresUnit: true, tolerance: 0.1,
          formula: "\\eta_c=1-\\frac{T_2}{T_1}",
          steps: [inline("T_1=" + highK + "\\,\\mathrm{K},\\ T_2=" + lowK + "\\,\\mathrm{K}"), inline("\\eta_c=1-\\frac{" + lowK + "}{" + highK + "}\\approx" + numberText(carnotEta * 100, 2) + "\\%")],
          explanation: "摂氏温度へ273を加え、必ず絶対温度比を使う。",
          diagram: "carnot-pv",
          sourceRefs: [rangeRef(6), rangeRef(7), rangeRef(8), FORMAT3_CARNOT_REF],
        }),
        examQuestion(id, 5, 4, 5, {
          topic: "carnot", genre: "受熱量・仕事・前問結果", difficulty: 3, format: "text",
          prompt: "前問までの絶対温度比と効率を使い、受熱量Q1と仕事Wを二通りで求めて一致を確認せよ。",
          answer: "Q1≈" + numberText(carnotQIn, 2) + " kJ、W≈" + numberText(carnotW, 2) + " kJ",
          keywords: [numberText(carnotQIn, 2), numberText(carnotW, 2)], minKeywords: 2,
          formula: "\\begin{aligned}\\frac{Q_2}{Q_1}&=\\frac{T_2}{T_1}\\\\ W&=Q_1-Q_2\\end{aligned}",
          steps: [inline("Q_1=" + carnotQOut + "\\times\\frac{" + highK + "}{" + lowK + "}\\approx" + numberText(carnotQIn, 2) + "\\,\\mathrm{kJ}"), inline("W=Q_1-Q_2\\approx" + numberText(carnotW, 2) + "\\,\\mathrm{kJ}"), inline("W=\\eta_cQ_1\\approx" + numberText(carnotEta, 5) + "\\times" + numberText(carnotQIn, 2) + "\\approx" + numberText(carnotW, 2) + "\\,\\mathrm{kJ}") + "となり一致する。"],
          explanation: "熱量比から受熱量を戻し、受熱量と放熱量の差を正味仕事とする。",
          diagram: "carnot-pv",
          sourceRefs: [rangeRef(6), rangeRef(7), rangeRef(8), FORMAT3_CARNOT_REF],
        }),
        examQuestion(id, 5, 5, 5, {
          topic: "refrigeration", genre: "逆カルノーCOP・必要動力", difficulty: 3, format: "text",
          prompt: "逆カルノー冷凍機のT-S線図を完成し、εr、εh、冷凍能力kW、必要動力kW、高温側放熱能力kWを求めよ。",
          answer: "εr≈" + numberText(refrigerationCopR, 3) + "、εh≈" + numberText(refrigerationCopH, 3) + "、Qdot2≈" + numberText(refrigerationCoolingKw, 3) + " kW、Wdot≈" + numberText(refrigerationPowerKw, 3) + " kW、Qdot1≈" + numberText(refrigerationHeatingKw, 3) + " kW",
          keywords: [numberText(refrigerationCopR, 3), numberText(refrigerationCopH, 3), numberText(refrigerationCoolingKw, 3), numberText(refrigerationPowerKw, 3), numberText(refrigerationHeatingKw, 3)], minKeywords: 4,
          formula: "\\begin{aligned}\\varepsilon_r&=\\frac{T_2}{T_1-T_2}\\\\ \\varepsilon_h&=\\frac{T_1}{T_1-T_2}\\\\ \\dot Q_2&=\\frac{4.19q}{3600}\\\\ \\dot W&=\\frac{\\dot Q_2}{\\varepsilon_r}\\end{aligned}",
          steps: [
            inline("T_1=" + refrigerationHighK + "\\,\\mathrm K,\\quad T_2=" + refrigerationLowK + "\\,\\mathrm K"),
            inline("\\varepsilon_r=\\frac{" + refrigerationLowK + "}{" + refrigerationHighK + "-" + refrigerationLowK + "}\\approx" + numberText(refrigerationCopR, 3) + ",\\quad\\varepsilon_h\\approx" + numberText(refrigerationCopH, 3)),
            inline("\\dot Q_2=\\frac{" + refrigerationKcalPerHour + "\\times4.19}{3600}\\approx" + numberText(refrigerationCoolingKw, 3) + "\\,\\mathrm{kW}"),
            inline("\\dot W=\\frac{" + numberText(refrigerationCoolingKw, 3) + "}{" + numberText(refrigerationCopR, 3) + "}\\approx" + numberText(refrigerationPowerKw, 3) + "\\,\\mathrm{kW}"),
            inline("\\dot Q_1=\\dot Q_2+\\dot W\\approx" + numberText(refrigerationHeatingKw, 3) + "\\,\\mathrm{kW}"),
          ],
          explanation: "絶対温度で逆カルノーCOPを求め、kcal/hをkWへ換算してからCOPの定義で必要動力を出す複合計算。",
          diagram: "reversed-carnot-ts",
          sourceRefs: [rangeRef(9)],
        }),
      ],
    },
  ];

  const questions = sections.flatMap((section) => section.questions);
  const totalPoints = questions.reduce((sum, item) => sum + item.points, 0);
  const covered = new Set(questions.map((item) => item.topic));
  if (sections.length !== 5 || questions.length !== 22 || totalPoints !== 100) {
    throw new Error(id + ": invalid expected-exam blueprint");
  }
  if (THERMODYNAMICS_TOPICS.some((topic) => !covered.has(topic.id))) {
    throw new Error(id + ": missing topic coverage");
  }

  return {
    id,
    number: index,
    title: "全範囲想定試験 " + String(index).padStart(2, "0"),
    subtitle: "範囲ZIP・形式1/2/3の実難度に合わせた5大問22小問",
    variant: index,
    defaultMinutes: 50,
    userAdjustable: true,
    totalPoints: 100,
    scoreLabel: "練習用100点換算",
    passPercent: 60,
    paper: "A4 portrait",
    sourcePolicy: "範囲ZIPの9画像と形式3の許可済み問3・問4だけを使用",
    officialConditionsNote: "公式の試験時間・満点・配点は資料から確認できない。範囲ZIPと提供形式に合わせ、単位換算・図読解・前問結果を使う複合計算で構成。50分と100点換算は変更可能な練習設定。",
    sections,
    questions,
  };
}

export const THERMODYNAMICS_EXPECTED_EXAMS: ThermodynamicsExpectedExam[] = Array.from(
  { length: 6 },
  (_, index) => buildThermodynamicsExam(index + 1),
);


function uniqueThermodynamicsSources(questions: readonly ThermodynamicsExamQuestion[]) {
  const seen = new Set<string>();
  return questions.flatMap((question) => question.sourceRefs).filter((source) => {
    const key = JSON.stringify(source);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const THERMODYNAMICS_MAJOR_ERROR_GUIDE: Record<number, string> = {
  1: "典型的誤答は、第2法則をエネルギー保存だけで説明する、圧縮時の体積比を逆にする、摂氏温度を状態方程式へ直接入れる答案である。法則の文章、P-V線図、絶対温度による二状態式を相互に照合する。",
  2: "典型的誤答は、断熱指数の位置を取り違える、圧縮なのに終圧・終温を低くする、境界仕事と工業仕事を同じ値にする、仕事の符号規約を落とす答案である。三つの断熱関係とP-V線図で検算する。",
  3: "典型的誤答は、JとkJを混在させる、熱を失う高温側を正にする、二熱源の変化を絶対値で加える答案である。各系の熱の向きを決めてから符号付きで合計し、第2法則で正負を照合する。",
  4: "典型的誤答は、mmとcmを混在させる、最大体積を行程容積だけとする、圧縮比を逆にする、吸気温度を℃のまま断熱式へ入れる答案である。ピストン図からVc・Vs・ε・η・T2を一列でつなぐ。",
  5: "典型的誤答は、℃の比をそのまま使う、Q1とQ2を逆にする、冷凍COPと暖房COPを混同する、kcal/hをkWへ直さず動力を求める答案である。熱機関図・冷凍装置図・T-S線図と熱収支を対応させる。",
};

/**
 * Complete, self-contained major problems used by normal calculation practice
 * and the timed confirmation test. Each item contains every required condition.
 */
export const THERMODYNAMICS_PRINT_LEVEL_QUESTIONS: ThermodynamicsExamQuestion[] =
  THERMODYNAMICS_EXPECTED_EXAMS.flatMap((exam) =>
    exam.sections.map((section) => {
      const finalQuestion = section.questions.at(-1);
      if (!finalQuestion) throw new Error(exam.id + ": empty major " + section.number);
      const topic: ThermodynamicsTopicId = section.number === 1
        ? (exam.number % 2 === 1 ? "second-law" : "polytropic")
        : section.number === 5
          ? (exam.number % 2 === 1 ? "carnot" : "refrigeration")
          : section.topic;
      return {
        ...finalQuestion,
        id: "thermo-print-e" + exam.number + "-m" + section.number,
        topic,
        topicId: topic,
        major: section.number,
        sub: 0,
        points: section.points,
        genre: "本番大問・" + section.title,
        difficulty: 3,
        context: "【全条件】" + section.context + "\n【答案の構造】状態・系・符号規約と単位を整理し、必要な線図または装置図を示してから、中間量を省略せず最終量まで求めること。",
        prompt: section.questions
          .map((question, index) => "(" + (index + 1) + ") " + question.prompt.replace(/前(?:二問|問まで|問)/g, "それまでに求めた値"))
          .join("\n") + "\n【入力】最後の設問の答えを入力すること。途中式・図・中間値は解答用紙へ残す。",
        answer: finalQuestion.answer,
        formula: finalQuestion.formula,
        steps: section.questions.flatMap((question, index) =>
          question.steps.map((step, stepIndex) => "(" + (index + 1) + ")-" + (stepIndex + 1) + " " + step),
        ),
        explanation: "この大問は" + section.title + "を、状態・図・収支から最終量まで連続して判定する。 【全小問の正解】" + section.questions.map((question, index) => "(" + (index + 1) + ") " + question.answer).join(" ／ ") + " 【解説】" + section.questions.map((question) => question.explanation).join(" ") + " " + THERMODYNAMICS_MAJOR_ERROR_GUIDE[section.number],
        diagram: section.number === 3 ? "entropy-transfer" : finalQuestion.diagram ?? section.questions.find((question) => question.diagram)?.diagram,
        sourceRefs: uniqueThermodynamicsSources(section.questions),
      };
    }),
  );

/** Full-condition, multi-stage items for the timed confirmation test. */
export const THERMODYNAMICS_EXAM_LEVEL_QUESTIONS: ThermodynamicsExamQuestion[] =
  THERMODYNAMICS_EXPECTED_EXAMS.flatMap((exam) =>
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

export const THERMODYNAMICS_EXAM_FORMATS = [
  {
    id: "observed-structure",
    title: "記述式・途中式重視",
    description: "提供資料はいずれも問題用紙へ式・単位・途中計算を書き込む構成。",
    strategy: "公式、代入、単位換算、数値、結論の順に残して部分点を狙う。",
  },
  {
    id: "observed-counts",
    title: "5～8大問・複数小問",
    description: "確認できた資料は5～8大問で、各大問が複数小問へ分かれる。",
    strategy: "同じ条件を後続小問でも使うため、前問の結果と単位を枠で囲む。",
  },
  {
    id: "observed-diagrams",
    title: "線図と計算の組合せ",
    description: "後半ではP-V・T-S線図に加え、冷凍装置図と逆カルノーT-S線図を描き、効率・仕事・成績係数・必要動力を計算する。",
    strategy: "軸、状態番号、矢印、過程名、熱と仕事を先に書いてから計算へ進む。",
  },
] as const;

export const THERMODYNAMICS_EXAM_SPEC = {
  defaultMinutes: 50,
  userAdjustable: true,
  totalPoints: 100,
  scoreLabel: "練習用100点換算",
  passPercent: 60,
  majorQuestionCount: 5,
  subquestionCount: 22,
  expectedExamCount: 6,
  paper: "A4 portrait",
  officialDurationMinutes: null,
  officialTotalPoints: null,
  officialPointAllocation: null,
  officialConditionsNote: "公式の試験時間・満点・配点は資料から確認できない。50分・100点換算・60%は変更可能な練習設定であり、公式条件ではない。",
  sourcePolicy: "内容は範囲ZIPの9画像のみ。形式3はallowlistの問3オットー・問4カルノーだけを追加参照する。",
} as const;
