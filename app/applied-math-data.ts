export type AppliedMathTopicId =
  | "vectors"
  | "vector-functions"
  | "curves"
  | "surfaces"
  | "gradient"
  | "divergence-curl";

export type AppliedMathTopic = {
  id: AppliedMathTopicId;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  pages: number[];
  color: string;
};

export type AppliedMathRangePage = {
  number: number;
  filename: string;
  lesson: string;
  topics: AppliedMathTopicId[];
  summary: string;
  orientation?: "landscape-sideways-source";
};

export type AppliedMathFormulaCard = {
  id: string;
  topic: AppliedMathTopicId;
  title: string;
  prompt: string;
  formula: string;
  explanation: string;
  cue: string;
  example?: string;
  sourcePages: number[];
};

export type AppliedMathQuestionFormat = "number" | "choice" | "text";

export type AppliedMathQuestion = {
  id: string;
  topic: AppliedMathTopicId;
  topicId: AppliedMathTopicId;
  genre: string;
  difficulty: 1 | 2 | 3;
  format: AppliedMathQuestionFormat;
  prompt: string;
  context?: string;
  answer: string;
  numericAnswer?: number;
  tolerance?: number;
  options?: string[];
  accepted?: string[];
  keywords?: string[];
  minKeywords?: number;
  formula?: string;
  steps: string[];
  explanation: string;
  source: "course-range";
  sourcePages: number[];
};

export type AppliedMathExamQuestion = AppliedMathQuestion & {
  major: number;
  sub: number;
  points: number;
};

export type AppliedMathExamSection = {
  number: number;
  title: string;
  topic: AppliedMathTopicId;
  topicIds: AppliedMathTopicId[];
  points: number;
  context: string;
  questions: AppliedMathExamQuestion[];
};

export type AppliedMathExpectedExam = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  variant: number;
  durationMinutes: 50;
  minutes: 50;
  totalPoints: 80;
  passPoints: 48;
  passPercent: 60;
  paper: "A4 portrait";
  source: "course-range";
  sections: AppliedMathExamSection[];
  questions: AppliedMathExamQuestion[];
};

export const APPLIED_MATH_EXCLUDED_TOPICS = [
  "線積分",
  "ベクトル場の流束面積分",
  "ガウスの発散定理",
  "ストークスの定理",
] as const;

export const APPLIED_MATH_RANGE_PAGES: AppliedMathRangePage[] = [
  { number: 1, filename: "PXL_20260716_080200321.MP.jpg", lesson: "第9回", topics: ["vectors"], summary: "基本ベクトル、成分、ノルム、単位ベクトル、内積" },
  { number: 2, filename: "PXL_20260716_080204620.MP.jpg", lesson: "第9回", topics: ["vectors"], summary: "内積の成分公式、直交、外積の定義・成分・性質" },
  { number: 3, filename: "PXL_20260716_080207523.MP.jpg", lesson: "第9回", topics: ["vector-functions"], summary: "ベクトル関数の極限、連続、微分、高階微分" },
  { number: 4, filename: "PXL_20260716_080221745.MP.jpg", lesson: "第9回", topics: ["vectors"], summary: "ベクトル、直交条件、基本ベクトルと外積の演習" },
  { number: 5, filename: "PXL_20260716_080226935.jpg", lesson: "第9回", topics: ["vectors", "vector-functions"], summary: "外積による三角形面積、ベクトル関数の微分と速さ" },
  { number: 6, filename: "PXL_20260716_080313402.MP.jpg", lesson: "第10回", topics: ["curves"], summary: "正則なパラメータ曲線、接ベクトル、単位接ベクトル", orientation: "landscape-sideways-source" },
  { number: 7, filename: "PXL_20260716_080324828.MP.jpg", lesson: "第10回", topics: ["curves"], summary: "曲線の弧長公式" },
  { number: 8, filename: "PXL_20260716_080329492.MP.jpg", lesson: "第10回", topics: ["surfaces"], summary: "パラメータ曲面、偏微分ベクトル、接平面、単位法線" },
  { number: 9, filename: "PXL_20260716_080333474.MP.jpg", lesson: "第10回", topics: ["surfaces"], summary: "パラメータ曲面の幾何学的表面積" },
  { number: 10, filename: "PXL_20260716_080341199.MP.jpg", lesson: "第10回", topics: ["curves"], summary: "楕円・らせんの単位接ベクトルと弧長演習" },
  { number: 11, filename: "PXL_20260716_080346032.MP.jpg", lesson: "第10回", topics: ["surfaces"], summary: "曲面の単位法線と幾何学的表面積の演習" },
  { number: 12, filename: "PXL_20260716_080353144.jpg", lesson: "第11回", topics: ["gradient"], summary: "スカラー場、ベクトル場、勾配、等位面" },
  { number: 13, filename: "PXL_20260716_080358599.MP.jpg", lesson: "第11回", topics: ["gradient"], summary: "勾配の幾何学的意味、方向微分、最大方向微分" },
  { number: 14, filename: "PXL_20260716_080405870.MP.jpg", lesson: "第12回", topics: ["gradient"], summary: "勾配と方向微分の復習" },
  { number: 15, filename: "PXL_20260716_080410821.MP.jpg", lesson: "第12回", topics: ["divergence-curl"], summary: "ベクトル場の図示、発散、回転と具体例" },
  { number: 16, filename: "PXL_20260716_080412986.MP.jpg", lesson: "第12回", topics: ["divergence-curl"], summary: "微小直方体を用いた発散の物理的意味" },
];

export const APPLIED_MATH_TOPICS: AppliedMathTopic[] = [
  { id: "vectors", number: "01", title: "ベクトル・内積・外積", shortTitle: "内積・外積", description: "成分、ノルム、直交、外積、三角形の面積を扱う。", pages: [1, 2, 4, 5], color: "#7aa7ff" },
  { id: "vector-functions", number: "02", title: "ベクトル関数の微分", shortTitle: "微分・速さ", description: "成分ごとの微分と積の微分、導関数の大きさを扱う。", pages: [3, 5], color: "#a88bff" },
  { id: "curves", number: "03", title: "パラメータ曲線", shortTitle: "接線・弧長", description: "接ベクトル、単位接ベクトル、曲線の長さを求める。", pages: [6, 7, 10], color: "#55dde0" },
  { id: "surfaces", number: "04", title: "パラメータ曲面", shortTitle: "法線・表面積", description: "接平面、単位法線、幾何学的表面積を求める。", pages: [8, 9, 11], color: "#66e39e" },
  { id: "gradient", number: "05", title: "勾配・等位面・方向微分", shortTitle: "勾配・方向微分", description: "勾配の計算と幾何学的意味、方向微分の最大値を扱う。", pages: [12, 13, 14], color: "#ffd65c" },
  { id: "divergence-curl", number: "06", title: "ベクトル場・発散・回転", shortTitle: "発散・回転", description: "ベクトル場を図示し、発散と回転、その意味を求める。", pages: [15, 16], color: "#ff9f68" },
];

const APPLIED_MATH_FORMULA_DEFINITIONS: Array<Omit<AppliedMathFormulaCard, "sourcePages">> = [
  { id: "am-vector-norm", topic: "vectors", title: "ベクトルの大きさ", prompt: "\\(\\mathbf a=(a_x,a_y,a_z)\\) の大きさは？", formula: "|\\mathbf a|=\\sqrt{a_x^2+a_y^2+a_z^2}", explanation: "各成分の二乗和の正の平方根。三平方の定理を3次元へ拡張した形。", cue: "成分を二乗 → 足す → ルート", example: "\\(\\mathbf a=(1,0,2)\\) なら \\(|\\mathbf a|=\\sqrt5\\)" },
  { id: "am-unit-vector", topic: "vectors", title: "単位ベクトル", prompt: "\\(\\mathbf a\\) と同方向の単位ベクトルは？", formula: "\\mathbf e=\\frac{\\mathbf a}{|\\mathbf a|}", explanation: "向きを保ったまま長さだけ1にするため、各成分を元の長さで割る。", cue: "自分の長さで割る" },
  { id: "am-dot", topic: "vectors", title: "内積", prompt: "内積の幾何表示と成分表示は？", formula: "\\mathbf a\\cdot\\mathbf b=|\\mathbf a||\\mathbf b|\\cos\\theta=a_xb_x+a_yb_y+a_zb_z", explanation: "同じ方向へどれだけ成分を持つかを測る。直交なら余弦が0なので内積も0。", cue: "対応成分を掛けて足す" },
  { id: "am-orthogonal", topic: "vectors", title: "直交条件", prompt: "2ベクトルが直交する条件は？", formula: "\\mathbf a\\perp\\mathbf b\\iff\\mathbf a\\cdot\\mathbf b=0", explanation: "なす角が90度なら \\(\\cos90^\\circ=0\\)。未知成分を求める問題で使う。", cue: "直交 → 内積0" },
  { id: "am-cross", topic: "vectors", title: "外積の成分", prompt: "\\(\\mathbf a\\times\\mathbf b\\) の成分公式は？", formula: "\\mathbf a\\times\\mathbf b=(a_yb_z-a_zb_y,\\ a_zb_x-a_xb_z,\\ a_xb_y-a_yb_x)", explanation: "\\(\\mathbf a,\\mathbf b\\) の両方に垂直なベクトル。順序を逆にすると符号が反転する。", cue: "中央成分の符号に注意" },
  { id: "am-cross-size", topic: "vectors", title: "外積の大きさ", prompt: "外積の大きさと、2ベクトルが張る面積は？", formula: "|\\mathbf a\\times\\mathbf b|=|\\mathbf a||\\mathbf b|\\sin\\theta", explanation: "外積の大きさは平行四辺形の面積に等しい。平行なら0になる。", cue: "底辺 × 高さ" },
  { id: "am-triangle-area", topic: "vectors", title: "三角形の面積", prompt: "3点A,B,Cが作る三角形の面積は？", formula: "S=\\frac12|\\overrightarrow{AB}\\times\\overrightarrow{AC}|", explanation: "外積は平行四辺形の面積なので、三角形では半分にする。", cue: "AB×AC の大きさを半分" },

  { id: "am-vector-derivative", topic: "vector-functions", title: "ベクトル関数の微分", prompt: "ベクトル関数を成分で微分すると？", formula: "\\frac{d\\mathbf a}{dt}=\\left(\\frac{da_x}{dt},\\frac{da_y}{dt},\\frac{da_z}{dt}\\right)", explanation: "極限を各成分へ分けられるため、それぞれを通常どおり微分する。", cue: "3成分を1つずつ微分" },
  { id: "am-vector-speed", topic: "vector-functions", title: "ベクトル関数の速さ", prompt: "位置ベクトル \\(\\mathbf r(t)\\) から速さを求めるには？", formula: "v=|\\mathbf r'(t)|", explanation: "導関数は速度ベクトルで、そのノルムが向きを除いた速さ。", cue: "微分してから大きさ" },
  { id: "am-dot-derivative", topic: "vector-functions", title: "内積の微分", prompt: "\\(\\mathbf a\\cdot\\mathbf b\\) の微分法則は？", formula: "\\frac{d}{dt}(\\mathbf a\\cdot\\mathbf b)=\\mathbf a'\\cdot\\mathbf b+\\mathbf a\\cdot\\mathbf b'", explanation: "スカラーの積の微分と同じく、前を微分した項と後ろを微分した項を足す。", cue: "前微分＋後ろ微分" },
  { id: "am-cross-derivative", topic: "vector-functions", title: "外積の微分", prompt: "\\(\\mathbf a\\times\\mathbf b\\) の微分法則は？", formula: "\\frac{d}{dt}(\\mathbf a\\times\\mathbf b)=\\mathbf a'\\times\\mathbf b+\\mathbf a\\times\\mathbf b'", explanation: "積の順序を保ったまま微分する。外積は交換できないので順番を入れ替えない。", cue: "順序を保って前微分＋後ろ微分" },

  { id: "am-tangent", topic: "curves", title: "接ベクトル", prompt: "曲線 \\(\\mathbf r(t)\\) の接ベクトルは？", formula: "\\mathbf r'(t)=\\frac{d\\mathbf r}{dt}", explanation: "時刻を少し動かしたときの位置の変化率が、その点での接線方向を示す。", cue: "曲線をtで微分" },
  { id: "am-unit-tangent", topic: "curves", title: "単位接ベクトル", prompt: "曲線の単位接ベクトルは？", formula: "\\mathbf T(t)=\\frac{\\mathbf r'(t)}{|\\mathbf r'(t)|}", explanation: "接ベクトルをその長さで割り、向きを保って長さ1にする。", cue: "接ベクトルを正規化" },
  { id: "am-arc-length", topic: "curves", title: "曲線の弧長", prompt: "\\(a\\le t\\le b\\) の曲線長は？", formula: "s=\\int_a^b|\\mathbf r'(t)|\\,dt", explanation: "短い時間ごとの移動距離『速さ×時間』を積み重ねる。", cue: "速度の大きさを積分" },
  { id: "am-arc-components", topic: "curves", title: "弧長の成分表示", prompt: "弧長公式をx,y,z成分で書くと？", formula: "s=\\int_a^b\\sqrt{(x')^2+(y')^2+(z')^2}\\,dt", explanation: "\\(|\\mathbf r'|\\) を3成分のノルムとして展開した形。", cue: "各微分の二乗和にルート" },

  { id: "am-surface-regular", topic: "surfaces", title: "正則な曲面", prompt: "パラメータ曲面が正則である条件は？", formula: "\\mathbf r_u\\times\\mathbf r_v\\ne\\mathbf0", explanation: "2本の接ベクトルが平行でなければ、接平面と法線方向が定まる。", cue: "2接ベクトルの外積が0でない" },
  { id: "am-surface-normal", topic: "surfaces", title: "単位法線", prompt: "パラメータ曲面の単位法線は？", formula: "\\mathbf n=\\pm\\frac{\\mathbf r_u\\times\\mathbf r_v}{|\\mathbf r_u\\times\\mathbf r_v|}", explanation: "2つの接ベクトルの外積で法線を作り、正規化する。指定がなければ向きは±。", cue: "偏微分 → 外積 → 正規化" },
  { id: "am-surface-area-element", topic: "surfaces", title: "曲面の面積要素", prompt: "パラメータ平面の小領域が作る曲面上の面積は？", formula: "dS=|\\mathbf r_u\\times\\mathbf r_v|\\,du\\,dv", explanation: "接ベクトルが張る微小平行四辺形の面積を使う。", cue: "外積の大きさが拡大率" },
  { id: "am-surface-area", topic: "surfaces", title: "曲面の幾何学的表面積", prompt: "領域D上の曲面積は？", formula: "S=\\iint_D|\\mathbf r_u\\times\\mathbf r_v|\\,du\\,dv", explanation: "面積要素をパラメータ領域全体で足す。これは流束ではなく幾何学的な面積。", cue: "外積の大きさを二重積分" },

  { id: "am-gradient", topic: "gradient", title: "勾配", prompt: "スカラー場 \\(\\phi\\) の勾配は？", formula: "\\nabla\\phi=\\left(\\frac{\\partial\\phi}{\\partial x},\\frac{\\partial\\phi}{\\partial y},\\frac{\\partial\\phi}{\\partial z}\\right)", explanation: "各座標方向の増加率を並べたベクトルで、最も急に増える方向を向く。", cue: "x,y,zで偏微分" },
  { id: "am-level-surface", topic: "gradient", title: "等位面と法線", prompt: "等位面 \\(\\phi=c\\) の法線方向は？", formula: "\\mathbf n\\parallel\\nabla\\phi", explanation: "等位面上では \\(\\phi\\) が変化しないため、接方向の方向微分は0。勾配はすべての接方向に垂直。", cue: "等位面の法線＝勾配" },
  { id: "am-directional", topic: "gradient", title: "方向微分", prompt: "単位ベクトル \\(\\mathbf e\\) 方向の方向微分は？", formula: "D_{\\mathbf e}\\phi=\\nabla\\phi\\cdot\\mathbf e=|\\nabla\\phi|\\cos\\theta", explanation: "勾配を調べたい方向へ射影した増加率。\\(\\mathbf e\\) は必ず単位ベクトルにする。", cue: "勾配と単位方向の内積" },
  { id: "am-directional-max", topic: "gradient", title: "方向微分の最大値", prompt: "方向微分の最大値と、その方向は？", formula: "\\max_{|\\mathbf e|=1}D_{\\mathbf e}\\phi=|\\nabla\\phi|", explanation: "\\(\\cos\\theta\\le1\\) なので、\\(\\mathbf e\\) が勾配と同方向のとき最大。", cue: "最大値は勾配の大きさ" },

  { id: "am-divergence", topic: "divergence-curl", title: "発散", prompt: "\\(\\mathbf a=(a_x,a_y,a_z)\\) の発散は？", formula: "\\nabla\\cdot\\mathbf a=\\frac{\\partial a_x}{\\partial x}+\\frac{\\partial a_y}{\\partial y}+\\frac{\\partial a_z}{\\partial z}", explanation: "各方向について『その方向成分を同じ座標で微分』して足すスカラー。", cue: "x成分をx、y成分をy、z成分をzで微分" },
  { id: "am-curl", topic: "divergence-curl", title: "回転", prompt: "\\(\\mathbf a\\) の回転を成分で書くと？", formula: "\\nabla\\times\\mathbf a=\\left(\\frac{\\partial a_z}{\\partial y}-\\frac{\\partial a_y}{\\partial z},\\frac{\\partial a_x}{\\partial z}-\\frac{\\partial a_z}{\\partial x},\\frac{\\partial a_y}{\\partial x}-\\frac{\\partial a_x}{\\partial y}\\right)", explanation: "形式的な行列式で計算できるベクトル。最後の成分は \\(\\partial a_y/\\partial x-\\partial a_x/\\partial y\\)。", cue: "∇×a の行列式" },
  { id: "am-divergence-meaning", topic: "divergence-curl", title: "発散の物理的意味", prompt: "流れ場で発散が正・負の意味は？", formula: "\\nabla\\cdot\\mathbf v=\\frac{\\text{正味流出量}}{\\text{単位時間}\\times\\text{単位体積}}", explanation: "正なら微小領域から出る量が入る量より多い湧き出し、負なら吸い込み。", cue: "正＝湧き出し、負＝吸い込み" },
  { id: "am-field-examples", topic: "divergence-curl", title: "代表ベクトル場", prompt: "\\((x,y,0)\\) と \\((-y,x,0)\\) の特徴は？", formula: "\\nabla\\cdot(x,y,0)=2,\\qquad\\nabla\\times(-y,x,0)=(0,0,2)", explanation: "前者は原点から放射状で発散が正、後者は原点周りに回る場でz方向の回転をもつ。", cue: "放射＝div、旋回＝curl" },
];

function sourcePagesForTopic(topic: AppliedMathTopicId) {
  return APPLIED_MATH_TOPICS.find((candidate) => candidate.id === topic)?.pages ?? [];
}

export const APPLIED_MATH_FORMULAS: AppliedMathFormulaCard[] = APPLIED_MATH_FORMULA_DEFINITIONS.map((card) => ({
  ...card,
  sourcePages: sourcePagesForTopic(card.topic),
}));

function courseQuestion(question: Omit<AppliedMathQuestion, "source" | "sourcePages" | "topicId">): AppliedMathQuestion {
  return {
    ...question,
    topicId: question.topic,
    source: "course-range",
    sourcePages: sourcePagesForTopic(question.topic),
  };
}

export const APPLIED_MATH_QUESTIONS: AppliedMathQuestion[] = [
  courseQuestion({ id: "am-q-norm", topic: "vectors", genre: "ノルム", difficulty: 1, format: "number", prompt: "\\(\\mathbf a=(2,-1,2)\\) の大きさを求めよ。", answer: "3", numericAnswer: 3, formula: "|\\mathbf a|=\\sqrt{a_x^2+a_y^2+a_z^2}", steps: ["\\(|\\mathbf a|=\\sqrt{2^2+(-1)^2+2^2}\\)", "\\(=\\sqrt9=3\\)"], explanation: "各成分の符号ではなく二乗を足す。" }),
  courseQuestion({ id: "am-q-unit", topic: "vectors", genre: "単位ベクトル", difficulty: 1, format: "choice", prompt: "\\(\\mathbf a=(0,3,4)\\) と同方向の単位ベクトルを選べ。", answer: "\\((0,3/5,4/5)\\)", options: ["\\((0,3/5,4/5)\\)", "\\((0,3,4)\\)", "\\((0,4/5,3/5)\\)", "\\((0,-3/5,-4/5)\\)"], formula: "\\mathbf e=\\mathbf a/|\\mathbf a|", steps: ["\\(|\\mathbf a|=5\\)", "各成分を5で割る"], explanation: "同方向なので符号は変えず、長さだけ1にする。" }),
  courseQuestion({ id: "am-q-orthogonal", topic: "vectors", genre: "直交", difficulty: 2, format: "number", prompt: "\\((2,k,1)\\) と \\((3,-2,4)\\) が直交するとき \\(k\\) を求めよ。", answer: "5", numericAnswer: 5, formula: "\\mathbf a\\cdot\\mathbf b=0", steps: ["\\(2\\cdot3+k(-2)+1\\cdot4=0\\)", "\\(10-2k=0\\)", "\\(k=5\\)"], explanation: "直交条件を内積0へ置き換える。" }),
  courseQuestion({ id: "am-q-cross", topic: "vectors", genre: "外積", difficulty: 2, format: "choice", prompt: "\\((1,0,2)\\times(2,2,-1)\\) を選べ。", answer: "\\((-4,5,2)\\)", options: ["\\((-4,5,2)\\)", "\\((4,-5,-2)\\)", "\\((-2,5,4)\\)", "\\((4,5,2)\\)"], formula: "\\mathbf a\\times\\mathbf b=(a_yb_z-a_zb_y,a_zb_x-a_xb_z,a_xb_y-a_yb_x)", steps: ["第1成分 \\(0(-1)-2\\cdot2=-4\\)", "第2成分 \\(2\\cdot2-1(-1)=5\\)", "第3成分 \\(1\\cdot2-0\\cdot2=2\\)"], explanation: "第2成分の符号を取り違えない。" }),
  courseQuestion({ id: "am-q-triangle", topic: "vectors", genre: "三角形面積", difficulty: 2, format: "number", prompt: "\\(\\overrightarrow{AB}=(3,0,0),\\ \\overrightarrow{AC}=(0,4,0)\\) のとき三角形ABCの面積を求めよ。", answer: "6", numericAnswer: 6, formula: "S=\\frac12|\\overrightarrow{AB}\\times\\overrightarrow{AC}|", steps: ["外積は \\((0,0,12)\\)", "大きさ12の半分で6"], explanation: "外積は平行四辺形の面積なので2で割る。" }),
  courseQuestion({ id: "am-q-cross-order", topic: "vectors", genre: "外積の性質", difficulty: 1, format: "choice", prompt: "\\(\\mathbf a\\times\\mathbf b\\) と \\(\\mathbf b\\times\\mathbf a\\) の関係を選べ。", answer: "\\(\\mathbf b\\times\\mathbf a=-\\mathbf a\\times\\mathbf b\\)", options: ["\\(\\mathbf b\\times\\mathbf a=-\\mathbf a\\times\\mathbf b\\)", "\\(\\mathbf b\\times\\mathbf a=\\mathbf a\\times\\mathbf b\\)", "常にどちらも1", "常にどちらも同じスカラー"], steps: ["外積は反交換的"], explanation: "順番を逆にすると向きが反転する。" }),

  courseQuestion({ id: "am-q-vector-derivative", topic: "vector-functions", genre: "成分微分", difficulty: 1, format: "choice", prompt: "\\(\\mathbf r(t)=(t^2,\\sin t,e^t)\\) の導関数を選べ。", answer: "\\((2t,\\cos t,e^t)\\)", options: ["\\((2t,\\cos t,e^t)\\)", "\\((t,\\cos t,te^{t-1})\\)", "\\((2, -\\sin t,e^t)\\)", "\\((2t,\\sin t,e^t)\\)"], steps: ["3成分をそれぞれtで微分"], explanation: "ベクトル関数の微分は成分ごとに行う。" }),
  courseQuestion({ id: "am-q-speed", topic: "vector-functions", genre: "速さ", difficulty: 2, format: "number", prompt: "\\(\\mathbf r(t)=(3t,4t,t^2)\\) の \\(t=0\\) における速さを求めよ。", answer: "5", numericAnswer: 5, formula: "v=|\\mathbf r'(t)|", steps: ["\\(\\mathbf r'(t)=(3,4,2t)\\)", "\\(t=0\\) では \\((3,4,0)\\)", "速さは5"], explanation: "位置ではなく導関数の大きさを取る。" }),
  courseQuestion({ id: "am-q-dot-product-rule", topic: "vector-functions", genre: "積の微分", difficulty: 1, format: "choice", prompt: "\\(d(\\mathbf a\\cdot\\mathbf b)/dt\\) を選べ。", answer: "\\(\\mathbf a'\\cdot\\mathbf b+\\mathbf a\\cdot\\mathbf b'\\)", options: ["\\(\\mathbf a'\\cdot\\mathbf b+\\mathbf a\\cdot\\mathbf b'\\)", "\\(\\mathbf a'\\cdot\\mathbf b'\\)", "\\(\\mathbf a'\\cdot\\mathbf b-\\mathbf a\\cdot\\mathbf b'\\)", "\\(\\mathbf a\\cdot\\mathbf b\\)"], steps: ["通常の積の微分と同じ2項"], explanation: "片方ずつ微分した2項を足す。" }),
  courseQuestion({ id: "am-q-cross-product-rule", topic: "vector-functions", genre: "積の微分", difficulty: 2, format: "choice", prompt: "\\(d(\\mathbf a\\times\\mathbf b)/dt\\) を選べ。", answer: "\\(\\mathbf a'\\times\\mathbf b+\\mathbf a\\times\\mathbf b'\\)", options: ["\\(\\mathbf a'\\times\\mathbf b+\\mathbf a\\times\\mathbf b'\\)", "\\(\\mathbf a'\\times\\mathbf b'+\\mathbf b\\times\\mathbf a\\)", "\\(\\mathbf b\\times\\mathbf a'+\\mathbf b'\\times\\mathbf a\\)", "\\(\\mathbf a'\\times\\mathbf b'\\)"], steps: ["外積の順序を保つ", "前を微分した項と後ろを微分した項を足す"], explanation: "外積は交換できないので順序が重要。" }),
  courseQuestion({ id: "am-q-vector-limit", topic: "vector-functions", genre: "極限", difficulty: 1, format: "text", prompt: "ベクトル関数の極限・連続性はどのように判定するか。", answer: "各成分の極限・連続性をそれぞれ判定する。", accepted: ["成分ごとに判定する", "各成分で極限をとる"], keywords: ["成分", "極限"], minKeywords: 2, steps: ["x,y,z各成分へ分ける"], explanation: "ベクトルの極限は成分ごとの極限として定義される。" }),

  courseQuestion({ id: "am-q-unit-tangent", topic: "curves", genre: "単位接ベクトル", difficulty: 2, format: "choice", prompt: "\\(\\mathbf r(t)=(2\\cos t,2\\sin t,0)\\) の単位接ベクトルを選べ。", answer: "\\((-\\sin t,\\cos t,0)\\)", options: ["\\((-\\sin t,\\cos t,0)\\)", "\\((\\cos t,\\sin t,0)\\)", "\\((-2\\sin t,2\\cos t,0)\\)", "\\((\\sin t,-\\cos t,0)\\)"], formula: "\\mathbf T=\\mathbf r'/|\\mathbf r'|", steps: ["\\(\\mathbf r'=(-2\\sin t,2\\cos t,0)\\)", "\\(|\\mathbf r'|=2\\)", "2で割る"], explanation: "接ベクトルを正規化する。" }),
  courseQuestion({ id: "am-q-helix-tangent", topic: "curves", genre: "単位接ベクトル", difficulty: 2, format: "choice", prompt: "\\(\\mathbf r(t)=(3\\cos t,3\\sin t,4t)\\) の単位接ベクトルを選べ。", answer: "\\((-3\\sin t/5,3\\cos t/5,4/5)\\)", options: ["\\((-3\\sin t/5,3\\cos t/5,4/5)\\)", "\\((-3\\sin t,3\\cos t,4)\\)", "\\((3\\cos t/5,3\\sin t/5,4/5)\\)", "\\((-4\\sin t/5,4\\cos t/5,3/5)\\)"], steps: ["\\(\\mathbf r'=(-3\\sin t,3\\cos t,4)\\)", "\\(|\\mathbf r'|=5\\)", "各成分を5で割る"], explanation: "\\(\\sin^2t+\\cos^2t=1\\) を使うと速さは一定。" }),
  courseQuestion({ id: "am-q-helix-length", topic: "curves", genre: "弧長", difficulty: 2, format: "number", prompt: "\\(\\mathbf r(t)=(3\\cos t,3\\sin t,4t)\\), \\(0\\le t\\le2\\pi\\) の曲線長を \\(\\pi\\) の係数で答えよ。", answer: "\\(10\\pi\\)（係数10）", numericAnswer: 10, formula: "s=\\int_0^{2\\pi}|\\mathbf r'(t)|dt", steps: ["速さは \\(\\sqrt{9\\sin^2t+9\\cos^2t+16}=5\\)", "\\(\\int_0^{2\\pi}5dt=10\\pi\\)"], explanation: "入力欄には \\(\\pi\\) の係数10を入力する。" }),
  courseQuestion({ id: "am-q-arc-source", topic: "curves", genre: "弧長", difficulty: 3, format: "number", prompt: "\\(\\mathbf r(t)=(t,t^2,\\frac23t^3)\\), \\(0\\le t\\le1\\) の弧長を求めよ。", answer: "\\(5/3\\)", numericAnswer: 5 / 3, tolerance: 0.0001, steps: ["\\(\\mathbf r'=(1,2t,2t^2)\\)", "\\(|\\mathbf r'|=\\sqrt{1+4t^2+4t^4}=1+2t^2\\)", "\\(\\int_0^1(1+2t^2)dt=5/3\\)"], explanation: "根号内が \\((1+2t^2)^2\\) になることを見抜く。" }),
  courseQuestion({ id: "am-q-regular-curve", topic: "curves", genre: "定義", difficulty: 1, format: "choice", prompt: "正則なパラメータ曲線の条件を選べ。", answer: "\\(\\mathbf r'(t)\\ne\\mathbf0\\)", options: ["\\(\\mathbf r'(t)\\ne\\mathbf0\\)", "\\(\\mathbf r'(t)=\\mathbf0\\)", "\\(|\\mathbf r(t)|=1\\)", "\\(t=0\\)"], steps: ["接方向が定まる条件を確認"], explanation: "導関数が0だと、その点で接ベクトルの向きが定まらない。" }),

  courseQuestion({ id: "am-q-surface-normal", topic: "surfaces", genre: "単位法線", difficulty: 2, format: "choice", prompt: "\\(\\mathbf r(u,v)=(u,v,2u-3v)\\) の単位法線の1つを選べ。", answer: "\\((-2,3,1)/\\sqrt{14}\\)", options: ["\\((-2,3,1)/\\sqrt{14}\\)", "\\((2,-3,1)/\\sqrt{14}\\)", "\\((1,1,-1)/\\sqrt3\\)", "\\((-2,3,1)\\)"], formula: "\\mathbf n=\\pm(\\mathbf r_u\\times\\mathbf r_v)/|\\mathbf r_u\\times\\mathbf r_v|", steps: ["\\(\\mathbf r_u=(1,0,2),\\ \\mathbf r_v=(0,1,-3)\\)", "\\(\\mathbf r_u\\times\\mathbf r_v=(-2,3,1)\\)", "大きさ \\(\\sqrt{14}\\) で割る"], explanation: "反対向きも法線だが、選択肢では指定された向きを選ぶ。" }),
  courseQuestion({ id: "am-q-surface-regular", topic: "surfaces", genre: "正則性", difficulty: 1, format: "choice", prompt: "パラメータ曲面が正則である条件を選べ。", answer: "\\(\\mathbf r_u\\times\\mathbf r_v\\ne\\mathbf0\\)", options: ["\\(\\mathbf r_u\\times\\mathbf r_v\\ne\\mathbf0\\)", "\\(\\mathbf r_u\\cdot\\mathbf r_v=0\\) だけ", "\\(\\mathbf r_u=\\mathbf r_v\\)", "\\(|\\mathbf r|=0\\)"], steps: ["2本の接ベクトルが平行でない条件"], explanation: "外積が0でなければ法線と接平面が定まる。" }),
  courseQuestion({ id: "am-q-plane-area", topic: "surfaces", genre: "曲面積", difficulty: 2, format: "number", prompt: "\\(\\mathbf r(u,v)=(u,v,2u-3v)\\), \\(0\\le u\\le1,0\\le v\\le2\\) の曲面積を \\(\\sqrt{14}\\) の係数で答えよ。", answer: "\\(2\\sqrt{14}\\)（係数2）", numericAnswer: 2, steps: ["\\(|\\mathbf r_u\\times\\mathbf r_v|=\\sqrt{14}\\)", "パラメータ領域の面積は2", "曲面積は \\(2\\sqrt{14}\\)"], explanation: "入力欄には \\(\\sqrt{14}\\) の係数2を入力する。" }),
  courseQuestion({ id: "am-q-surface-area-meaning", topic: "surfaces", genre: "公式の意味", difficulty: 1, format: "text", prompt: "\\(\\iint_D|\\mathbf r_u\\times\\mathbf r_v|\\,du\\,dv\\) が求める量を答えよ。", answer: "パラメータ表示された曲面の幾何学的表面積", accepted: ["曲面の表面積", "幾何学的な曲面積"], keywords: ["曲面", "面積"], minKeywords: 2, steps: ["外積の大きさは微小平行四辺形の面積"], explanation: "ベクトル場の流束ではなく、曲面そのものの面積。" }),

  courseQuestion({ id: "am-q-gradient", topic: "gradient", genre: "勾配", difficulty: 1, format: "choice", prompt: "\\(\\phi=x^2+2y^2+3z\\) の勾配を選べ。", answer: "\\((2x,4y,3)\\)", options: ["\\((2x,4y,3)\\)", "\\((x,2y,3z)\\)", "\\((2,4,3)\\)", "\\((2x,2y,0)\\)"], formula: "\\nabla\\phi=(\\phi_x,\\phi_y,\\phi_z)", steps: ["x,y,zでそれぞれ偏微分"], explanation: "他の変数は定数として偏微分する。" }),
  courseQuestion({ id: "am-q-directional", topic: "gradient", genre: "方向微分", difficulty: 2, format: "number", prompt: "\\(\\phi=x^2+y^2+z^2\\) の点 \\((1,2,2)\\) における \\(\\mathbf e=(1,0,0)\\) 方向の方向微分を求めよ。", answer: "2", numericAnswer: 2, steps: ["\\(\\nabla\\phi=(2x,2y,2z)\\)", "点では \\((2,4,4)\\)", "\\((2,4,4)\\cdot(1,0,0)=2\\)"], explanation: "方向ベクトルはすでに単位ベクトル。" }),
  courseQuestion({ id: "am-q-direction-max", topic: "gradient", genre: "最大方向微分", difficulty: 2, format: "number", prompt: "前問の点 \\((1,2,2)\\) における方向微分の最大値を求めよ。", context: "\\(\\phi=x^2+y^2+z^2\\)", answer: "6", numericAnswer: 6, steps: ["勾配は \\((2,4,4)\\)", "大きさは \\(\\sqrt{4+16+16}=6\\)"], explanation: "最大方向微分は勾配の大きさ。" }),
  courseQuestion({ id: "am-q-level-normal", topic: "gradient", genre: "等位面", difficulty: 1, format: "text", prompt: "等位面 \\(\\phi(x,y,z)=c\\) に対して \\(\\nabla\\phi\\) はどの方向を向くか。", answer: "等位面に垂直な法線方向", accepted: ["等位面の法線方向", "等位面に垂直"], keywords: ["等位面", "垂直"], minKeywords: 2, steps: ["等位面上の接方向ではφは変化しない"], explanation: "接方向との内積が0になるため、勾配は法線。" }),
  courseQuestion({ id: "am-q-direction-unit", topic: "gradient", genre: "方向微分", difficulty: 1, format: "choice", prompt: "方向微分 \\(D_{\\mathbf e}\\phi=\\nabla\\phi\\cdot\\mathbf e\\) で必要な \\(\\mathbf e\\) の条件を選べ。", answer: "単位ベクトルである", options: ["単位ベクトルである", "ゼロベクトルである", "勾配と常に直交する", "長さは自由である"], steps: ["方向だけの変化率にするため長さを1にする"], explanation: "単位化しないと方向だけでなくベクトルの長さまで結果に掛かる。" }),

  courseQuestion({ id: "am-q-div", topic: "divergence-curl", genre: "発散", difficulty: 1, format: "number", prompt: "\\(\\mathbf a=(x,y,0)\\) の発散を求めよ。", answer: "2", numericAnswer: 2, steps: ["\\(\\partial x/\\partial x=1\\)", "\\(\\partial y/\\partial y=1\\)", "\\(\\partial0/\\partial z=0\\)", "合計2"], explanation: "対応する成分と座標を微分して足す。" }),
  courseQuestion({ id: "am-q-curl", topic: "divergence-curl", genre: "回転", difficulty: 2, format: "choice", prompt: "\\(\\mathbf b=(-y,x,0)\\) の回転を選べ。", answer: "\\((0,0,2)\\)", options: ["\\((0,0,2)\\)", "\\((0,0,0)\\)", "\\((0,0,-2)\\)", "2"], steps: ["z成分は \\(\\partial b_y/\\partial x-\\partial b_x/\\partial y\\)", "\\(=1-(-1)=2\\)", "他の成分は0"], explanation: "平面内の反時計回りの旋回が正のz成分に現れる。" }),
  courseQuestion({ id: "am-q-shear-curl", topic: "divergence-curl", genre: "回転", difficulty: 2, format: "choice", prompt: "\\(\\mathbf c=(-y,0,0)\\) の回転を選べ。", answer: "\\((0,0,1)\\)", options: ["\\((0,0,1)\\)", "\\((0,0,-1)\\)", "\\((1,0,0)\\)", "\\((0,0,0)\\)"], steps: ["z成分は \\(\\partial0/\\partial x-\\partial(-y)/\\partial y\\)", "\\(=0-(-1)=1\\)"], explanation: "第3成分の引き算の順序に注意する。" }),
  courseQuestion({ id: "am-q-div-meaning", topic: "divergence-curl", genre: "物理的意味", difficulty: 1, format: "choice", prompt: "流れ場のある点で発散が正のとき、微小領域では何が起きているか。", answer: "流入より流出が多い湧き出し", options: ["流入より流出が多い湧き出し", "流出より流入が多い吸い込み", "必ず回転だけが起きる", "速度が必ず0になる"], steps: ["発散は単位体積・単位時間あたりの正味流出"], explanation: "正は正味流出、負は正味流入。" }),
  courseQuestion({ id: "am-q-field-shape", topic: "divergence-curl", genre: "図示", difficulty: 1, format: "choice", prompt: "平面ベクトル場 \\((-y,x,0)\\) の形として最も適切なものを選べ。", answer: "原点の周りを反時計回りに回る", options: ["原点の周りを反時計回りに回る", "原点から放射状に外へ向く", "すべて右向き", "すべてゼロ"], steps: ["点(1,0)では上向き", "点(0,1)では左向き"], explanation: "各象限で向きを確認すると反時計回りの旋回になる。" }),
];

function examQuestion(
  examId: string,
  major: number,
  sub: number,
  points: number,
  input: Omit<AppliedMathQuestion, "id" | "source" | "sourcePages" | "topicId">,
): AppliedMathExamQuestion {
  return {
    ...input,
    id: `${examId}-m${major}-s${sub}`,
    topicId: input.topic,
    source: "course-range",
    sourcePages: sourcePagesForTopic(input.topic),
    major,
    sub,
    points,
  };
}

function signed(value: number) {
  return value >= 0 ? `+${value}` : String(value);
}

function buildAppliedMathExam(variant: number): AppliedMathExpectedExam {
  const id = `applied-expected-${String(variant).padStart(2, "0")}`;
  const ax = variant + 1;
  const ay = (variant % 3) + 1;
  const az = 2;
  const normSquared = ax ** 2 + ay ** 2 + az ** 2;
  const orthogonalP = variant + 2;
  const orthogonalK = variant + 3;
  const crossA = [variant + 1, 1, 2];
  const crossB = [1, 2, variant % 2 === 0 ? 1 : -1];
  const cross = [
    crossA[1] * crossB[2] - crossA[2] * crossB[1],
    crossA[2] * crossB[0] - crossA[0] * crossB[2],
    crossA[0] * crossB[1] - crossA[1] * crossB[0],
  ];

  const vectorCoefficient = variant + 1;
  const vectorSpeedSquared = 13 + vectorCoefficient ** 2;

  const helixA = variant + 1;
  const helixB = (variant % 3) + 1;
  const helixSpeedSquared = helixA ** 2 + helixB ** 2;

  const surfaceP = (variant % 3) + 1;
  const surfaceQ = ((variant + 1) % 3) + 1;
  const surfaceUSpan = 1 + (variant % 2);
  const surfaceVSpan = 2;
  const surfaceNormSquared = surfaceP ** 2 + surfaceQ ** 2 + 1;
  const surfaceDomainArea = surfaceUSpan * surfaceVSpan;

  const gradientC = variant + 1;
  const gradientAtPoint = [2, 2 * gradientC, 2];
  const directionalNumerator = 2 + 2 * gradientC;
  const gradientNormSquared = gradientAtPoint.reduce((sum, value) => sum + value ** 2, 0);

  const fieldA = variant + 1;
  const fieldB = (variant % 3) + 1;
  const fieldC = (variant % 2) + 1;
  const divergence = 2 * fieldA + fieldC;
  const curlZ = 2 * fieldB;

  const sections: AppliedMathExamSection[] = [
    {
      number: 1,
      title: "ベクトル・内積・外積",
      topic: "vectors",
      topicIds: ["vectors"],
      points: 14,
      context: `\\(\\mathbf a=(${ax},${ay},${az})\\), \\(\\mathbf p=(2,k,1)\\), \\(\\mathbf q=(${orthogonalP},-2,2)\\) とする。`,
      questions: [
        examQuestion(id, 1, 1, 4, { topic: "vectors", genre: "ノルム", difficulty: 1, format: "text", prompt: "\\(|\\mathbf a|\\) を求めよ。", answer: `\\(\\sqrt{${normSquared}}\\)`, accepted: [`sqrt(${normSquared})`, `√${normSquared}`], keywords: [String(normSquared)], minKeywords: 1, formula: "|\\mathbf a|=\\sqrt{a_x^2+a_y^2+a_z^2}", steps: [`\\(|\\mathbf a|=\\sqrt{${ax}^2+${ay}^2+${az}^2}\\)`, `\\(=\\sqrt{${normSquared}}\\)`], explanation: "3成分の二乗和の正の平方根を取る。" }),
        examQuestion(id, 1, 2, 4, { topic: "vectors", genre: "直交", difficulty: 2, format: "number", prompt: "\\(\\mathbf p\\perp\\mathbf q\\) となる \\(k\\) を求めよ。", answer: String(orthogonalK), numericAnswer: orthogonalK, formula: "\\mathbf p\\cdot\\mathbf q=0", steps: [`\\(2\\cdot${orthogonalP}-2k+2=0\\)`, `\\(k=${orthogonalK}\\)`], explanation: "直交を内積0に置き換える。" }),
        examQuestion(id, 1, 3, 6, { topic: "vectors", genre: "外積", difficulty: 2, format: "text", prompt: `\\((${crossA.join(",")})\\times(${crossB.join(",")})\\) を求めよ。`, answer: `\\((${cross.join(",")})\\)`, accepted: [`(${cross.join(",")})`, cross.join(",")], keywords: cross.map(String), minKeywords: 3, formula: "\\mathbf a\\times\\mathbf b=(a_yb_z-a_zb_y,a_zb_x-a_xb_z,a_xb_y-a_yb_x)", steps: [`第1成分は \\(${crossA[1]}(${crossB[2]})-${crossA[2]}(${crossB[1]})=${cross[0]}\\)`, `第2成分は \\(${crossA[2]}(${crossB[0]})-${crossA[0]}(${crossB[2]})=${cross[1]}\\)`, `第3成分は \\(${crossA[0]}(${crossB[1]})-${crossA[1]}(${crossB[0]})=${cross[2]}\\)`], explanation: "外積は順序を逆にすると全成分の符号が反転する。" }),
      ],
    },
    {
      number: 2,
      title: "ベクトル関数の微分と速さ",
      topic: "vector-functions",
      topicIds: ["vector-functions"],
      points: 12,
      context: `\\(\\mathbf r(t)=(t^2,${vectorCoefficient}t,t^3)\\) とする。`,
      questions: [
        examQuestion(id, 2, 1, 6, { topic: "vector-functions", genre: "成分微分", difficulty: 1, format: "text", prompt: "\\(\\mathbf r'(t)\\) と \\(\\mathbf r'(1)\\) を求めよ。", answer: `\\(\\mathbf r'(t)=(2t,${vectorCoefficient},3t^2),\\ \\mathbf r'(1)=(2,${vectorCoefficient},3)\\)`, accepted: [`(2t,${vectorCoefficient},3t^2),(2,${vectorCoefficient},3)`], keywords: ["2t", String(vectorCoefficient), "3t", "2", "3"], minKeywords: 4, formula: "\\mathbf r'(t)=(x'(t),y'(t),z'(t))", steps: [`各成分を微分して \\(\\mathbf r'(t)=(2t,${vectorCoefficient},3t^2)\\)`, `\\(t=1\\) を代入して \\((2,${vectorCoefficient},3)\\)`], explanation: "ベクトル関数は成分ごとに微分する。" }),
        examQuestion(id, 2, 2, 6, { topic: "vector-functions", genre: "速さ", difficulty: 2, format: "text", prompt: "\\(t=1\\) における速さを求めよ。", answer: `\\(\\sqrt{${vectorSpeedSquared}}\\)`, accepted: [`sqrt(${vectorSpeedSquared})`, `√${vectorSpeedSquared}`], keywords: [String(vectorSpeedSquared)], minKeywords: 1, formula: "v=|\\mathbf r'(t)|", steps: [`\\(\\mathbf r'(1)=(2,${vectorCoefficient},3)\\)`, `\\(v=\\sqrt{2^2+${vectorCoefficient}^2+3^2}=\\sqrt{${vectorSpeedSquared}}\\)`], explanation: "導関数は速度ベクトル、その大きさが速さ。" }),
      ],
    },
    {
      number: 3,
      title: "パラメータ曲線",
      topic: "curves",
      topicIds: ["curves"],
      points: 14,
      context: `\\(\\mathbf r(t)=(${helixA}\\cos t,${helixA}\\sin t,${helixB}t),\\ 0\\le t\\le2\\pi\\) とする。`,
      questions: [
        examQuestion(id, 3, 1, 6, { topic: "curves", genre: "単位接ベクトル", difficulty: 2, format: "text", prompt: "単位接ベクトル \\(\\mathbf T(t)\\) を求めよ。", answer: `\\(\\mathbf T(t)=\\frac{1}{\\sqrt{${helixSpeedSquared}}}(-${helixA}\\sin t,${helixA}\\cos t,${helixB})\\)`, accepted: [`(-${helixA}sin t,${helixA}cos t,${helixB})/sqrt(${helixSpeedSquared})`], keywords: [String(helixA), String(helixB), String(helixSpeedSquared)], minKeywords: 3, formula: "\\mathbf T=\\mathbf r'/|\\mathbf r'|", steps: [`\\(\\mathbf r'=(-${helixA}\\sin t,${helixA}\\cos t,${helixB})\\)`, `\\(|\\mathbf r'|=\\sqrt{${helixA}^2(\\sin^2t+\\cos^2t)+${helixB}^2}=\\sqrt{${helixSpeedSquared}}\\)`, "接ベクトルをその大きさで割る"], explanation: "正規化して長さ1にする。" }),
        examQuestion(id, 3, 2, 8, { topic: "curves", genre: "弧長", difficulty: 2, format: "text", prompt: "曲線の長さを求めよ。", answer: `\\(2\\pi\\sqrt{${helixSpeedSquared}}\\)`, accepted: [`2pi sqrt(${helixSpeedSquared})`, `2π√${helixSpeedSquared}`], keywords: ["2", String(helixSpeedSquared)], minKeywords: 2, formula: "s=\\int_0^{2\\pi}|\\mathbf r'(t)|\\,dt", steps: [`速さは一定で \\(\\sqrt{${helixSpeedSquared}}\\)`, `\\(s=\\int_0^{2\\pi}\\sqrt{${helixSpeedSquared}}\\,dt=2\\pi\\sqrt{${helixSpeedSquared}}\\)`], explanation: "速さをパラメータ区間で積分する。" }),
      ],
    },
    {
      number: 4,
      title: "パラメータ曲面",
      topic: "surfaces",
      topicIds: ["surfaces"],
      points: 14,
      context: `\\(\\mathbf r(u,v)=(u,v,${surfaceP}u${signed(-surfaceQ)}v),\\ 0\\le u\\le${surfaceUSpan},\\ 0\\le v\\le${surfaceVSpan}\\) とする。`,
      questions: [
        examQuestion(id, 4, 1, 6, { topic: "surfaces", genre: "単位法線", difficulty: 2, format: "text", prompt: "\\(\\mathbf r_u\\times\\mathbf r_v\\) と単位法線の1つを求めよ。", answer: `\\(\\mathbf r_u\\times\\mathbf r_v=(-${surfaceP},${surfaceQ},1),\\ \\mathbf n=\\frac{(-${surfaceP},${surfaceQ},1)}{\\sqrt{${surfaceNormSquared}}}\\)`, accepted: [`(-${surfaceP},${surfaceQ},1)/sqrt(${surfaceNormSquared})`], keywords: [`-${surfaceP}`, String(surfaceQ), String(surfaceNormSquared)], minKeywords: 3, formula: "\\mathbf n=\\pm(\\mathbf r_u\\times\\mathbf r_v)/|\\mathbf r_u\\times\\mathbf r_v|", steps: [`\\(\\mathbf r_u=(1,0,${surfaceP}),\\ \\mathbf r_v=(0,1,-${surfaceQ})\\)`, `\\(\\mathbf r_u\\times\\mathbf r_v=(-${surfaceP},${surfaceQ},1)\\)`, `大きさ \\(\\sqrt{${surfaceNormSquared}}\\) で割る`], explanation: "逆向きの単位法線も正しい。" }),
        examQuestion(id, 4, 2, 8, { topic: "surfaces", genre: "幾何学的表面積", difficulty: 3, format: "text", prompt: "この曲面の幾何学的表面積を求めよ。", answer: `\\(${surfaceDomainArea}\\sqrt{${surfaceNormSquared}}\\)`, accepted: [`${surfaceDomainArea}sqrt(${surfaceNormSquared})`, `${surfaceDomainArea}√${surfaceNormSquared}`], keywords: [String(surfaceDomainArea), String(surfaceNormSquared)], minKeywords: 2, formula: "S=\\iint_D|\\mathbf r_u\\times\\mathbf r_v|\\,du\\,dv", steps: [`\\(|\\mathbf r_u\\times\\mathbf r_v|=\\sqrt{${surfaceNormSquared}}\\)`, `パラメータ領域の面積は \\(${surfaceUSpan}\\times${surfaceVSpan}=${surfaceDomainArea}\\)`, `\\(S=${surfaceDomainArea}\\sqrt{${surfaceNormSquared}}\\)`], explanation: "これは曲面そのものの面積であり、流束面積分ではない。" }),
      ],
    },
    {
      number: 5,
      title: "勾配・方向微分",
      topic: "gradient",
      topicIds: ["gradient"],
      points: 14,
      context: `\\(\\phi(x,y,z)=x^2+${gradientC}y^2+z^2\\)、点 \\(P=(1,1,1)\\)、単位ベクトル \\(\\mathbf e=(1/\\sqrt2,1/\\sqrt2,0)\\) とする。`,
      questions: [
        examQuestion(id, 5, 1, 5, { topic: "gradient", genre: "勾配", difficulty: 1, format: "text", prompt: "\\(\\nabla\\phi\\) と \\(\\nabla\\phi(P)\\) を求めよ。", answer: `\\(\\nabla\\phi=(2x,${2 * gradientC}y,2z),\\ \\nabla\\phi(P)=(${gradientAtPoint.join(",")})\\)`, accepted: [`(2x,${2 * gradientC}y,2z),(${gradientAtPoint.join(",")})`], keywords: ["2x", `${2 * gradientC}y`, "2z"], minKeywords: 3, formula: "\\nabla\\phi=(\\phi_x,\\phi_y,\\phi_z)", steps: ["x,y,zで偏微分する", `\\(\\nabla\\phi=(2x,${2 * gradientC}y,2z)\\)`, `Pを代入して \\((${gradientAtPoint.join(",")})\\)`], explanation: "勾配はスカラー場の各偏微分を並べたベクトル。" }),
        examQuestion(id, 5, 2, 4, { topic: "gradient", genre: "方向微分", difficulty: 2, format: "text", prompt: "\\(P\\) における \\(\\mathbf e\\) 方向の方向微分を求めよ。", answer: `\\(${directionalNumerator}/\\sqrt2=${directionalNumerator / 2}\\sqrt2\\)`, accepted: [`${directionalNumerator}/sqrt2`, `${directionalNumerator / 2}sqrt2`], keywords: [String(directionalNumerator)], minKeywords: 1, formula: "D_{\\mathbf e}\\phi=\\nabla\\phi\\cdot\\mathbf e", steps: [`\\(D_{\\mathbf e}\\phi=(${gradientAtPoint.join(",")})\\cdot(1/\\sqrt2,1/\\sqrt2,0)\\)`, `\\(=${directionalNumerator}/\\sqrt2=${directionalNumerator / 2}\\sqrt2\\)`], explanation: "方向ベクトルが単位ベクトルであることを確認して内積を取る。" }),
        examQuestion(id, 5, 3, 5, { topic: "gradient", genre: "最大方向微分", difficulty: 2, format: "text", prompt: "\\(P\\) における方向微分の最大値と、その方向の単位ベクトルを求めよ。", answer: `最大値 \\(\\sqrt{${gradientNormSquared}}\\)、方向 \\((${gradientAtPoint.join(",")})/\\sqrt{${gradientNormSquared}}\\)`, accepted: [`sqrt(${gradientNormSquared}),(${gradientAtPoint.join(",")})/sqrt(${gradientNormSquared})`], keywords: [String(gradientNormSquared), ...gradientAtPoint.map(String)], minKeywords: 3, formula: "\\max D_{\\mathbf e}\\phi=|\\nabla\\phi|", steps: [`\\(|\\nabla\\phi(P)|=\\sqrt{${gradientNormSquared}}\\)`, `最大となる方向は勾配と同方向なので \\(\\nabla\\phi(P)/|\\nabla\\phi(P)|\\)`], explanation: "方向微分は勾配と方向単位ベクトルの内積で、両者が同方向のとき最大。" }),
      ],
    },
    {
      number: 6,
      title: "ベクトル場・発散・回転",
      topic: "divergence-curl",
      topicIds: ["divergence-curl"],
      points: 12,
      context: `\\(\\mathbf F(x,y,z)=(${fieldA}x-${fieldB}y,${fieldB}x+${fieldA}y,${fieldC}z)\\) とする。`,
      questions: [
        examQuestion(id, 6, 1, 4, { topic: "divergence-curl", genre: "発散", difficulty: 1, format: "number", prompt: "\\(\\nabla\\cdot\\mathbf F\\) を求めよ。", answer: String(divergence), numericAnswer: divergence, formula: "\\nabla\\cdot\\mathbf F=\\partial_xF_x+\\partial_yF_y+\\partial_zF_z", steps: [`\\(\\partial_xF_x=${fieldA},\\ \\partial_yF_y=${fieldA},\\ \\partial_zF_z=${fieldC}\\)`, `合計 \\(${fieldA}+${fieldA}+${fieldC}=${divergence}\\)`], explanation: "各成分を対応する座標で偏微分して足す。" }),
        examQuestion(id, 6, 2, 4, { topic: "divergence-curl", genre: "回転", difficulty: 2, format: "text", prompt: "\\(\\nabla\\times\\mathbf F\\) を求めよ。", answer: `\\((0,0,${curlZ})\\)`, accepted: [`(0,0,${curlZ})`, `0,0,${curlZ}`], keywords: ["0", String(curlZ)], minKeywords: 2, formula: "\\nabla\\times\\mathbf F=(\\partial_yF_z-\\partial_zF_y,\\partial_zF_x-\\partial_xF_z,\\partial_xF_y-\\partial_yF_x)", steps: ["x,y成分は0", `z成分は \\(\\partial_x(${fieldB}x+${fieldA}y)-\\partial_y(${fieldA}x-${fieldB}y)=${fieldB}-(-${fieldB})=${curlZ}\\)`], explanation: "回転のz成分の引き算の順序に注意する。" }),
        examQuestion(id, 6, 3, 4, { topic: "divergence-curl", genre: "発散の意味", difficulty: 1, format: "text", prompt: "この場を流れ場とみなすとき、発散の符号から微小領域の状態を説明せよ。", answer: `発散は正（${divergence}）なので、流入より流出が多い湧き出しである。`, accepted: ["正なので湧き出し", "流出が流入より多い"], keywords: ["正", "流出", "湧き出し"], minKeywords: 2, formula: "\\nabla\\cdot\\mathbf v=\\text{単位時間・単位体積あたりの正味流出}", steps: [`\\(\\nabla\\cdot\\mathbf F=${divergence}>0\\)`, "正の発散は正味流出を表す"], explanation: "負なら吸い込み、0なら微小領域で流入と流出が釣り合う。" }),
      ],
    },
  ];

  const questions = sections.flatMap((section) => section.questions);
  const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);
  if (sections.length !== 6 || totalPoints !== 80) throw new Error(`${id}: invalid exam blueprint`);
  if (new Set(sections.map((section) => section.topic)).size !== APPLIED_MATH_TOPICS.length) throw new Error(`${id}: missing range topic`);

  return {
    id,
    number: variant,
    title: `全範囲予想 ${String(variant).padStart(2, "0")}`,
    subtitle: "応用数学・全16枚範囲",
    variant,
    durationMinutes: 50,
    minutes: 50,
    totalPoints: 80,
    passPoints: 48,
    passPercent: 60,
    paper: "A4 portrait",
    source: "course-range",
    sections,
    questions,
  };
}

export const APPLIED_MATH_EXPECTED_EXAMS: AppliedMathExpectedExam[] = Array.from(
  { length: 6 },
  (_, index) => buildAppliedMathExam(index + 1),
);

export const APPLIED_MATH_EXAM_FORMATS = [
  {
    id: "format1-no1",
    title: "50分・80点・大問6問",
    description: "形式1 No.1 は50分80点、大問6問。大問内を複数の小問へ分け、途中式を広く取る。",
    strategy: "まず全大問を見て、定義・短い計算を回収してから積分や外積へ進む。",
  },
  {
    id: "format1-no2",
    title: "ベクトル記法と途中式",
    description: "形式1 No.2 はベクトルの記法を指定し、縦長の途中式欄と図を使う構成。",
    strategy: "\\(\\mathbf r_u,\\mathbf r_v\\)、外積、ノルム、正規化を1行ずつ残す。",
  },
  {
    id: "format2-incomplete",
    title: "形式2は後半欠落",
    description: "形式2は全6ページのうち4ページだけが提供され、後半36点の構造は不明。",
    strategy: "欠落部分を推測せず、確認できた『途中式欄＋公式記入欄』だけを形式参考にする。",
  },
  {
    id: "format3",
    title: "基礎・応用タグ",
    description: "形式3は各設問に基礎・応用の表示があり、1ページ2列程度の自由記述欄を使う。",
    strategy: "基礎問題を先に確実に取り、応用では公式と考え方を書いて部分点を狙う。",
  },
] as const;

export const APPLIED_MATH_EXAM_SPEC = {
  minutes: 50,
  totalPoints: 80,
  passPoints: 48,
  passPercent: 60,
  scoreDisplay: "raw/80 と100点換算を併記",
  bigQuestionCount: 6,
  expectedExamCount: 6,
  paper: "A4 portrait",
  sourcePolicy: "問題内容はテスト範囲ZIPの16画像だけを使用",
} as const;
