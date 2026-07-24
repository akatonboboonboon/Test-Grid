export type AppliedMathTopicId =
  | "vectors"
  | "vector-functions"
  | "curves"
  | "surfaces"
  | "gradient"
  | "divergence-curl"
  | "line-integrals"
  | "surface-integrals"
  | "green-theorem";

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
  { number: 17, filename: "PXL_20260717_060743444.jpg", lesson: "第11回演習", topics: ["surfaces"], summary: "回転曲面の偏微分ベクトル、外積、曲面積の計算演習" },
  { number: 18, filename: "PXL_20260717_060748486.jpg", lesson: "第12回演習", topics: ["gradient"], summary: "勾配、同方向の単位ベクトル、方向微分、勾配の演算法則" },
  { number: 19, filename: "PXL_20260717_060758953.jpg", lesson: "前期末基本問題", topics: ["curves", "surfaces", "gradient", "divergence-curl", "line-integrals", "surface-integrals", "green-theorem"], summary: "全範囲基本問題14題。追加範囲2の高画質版で問4の第三成分がu²と確定" },
  { number: 20, filename: "PXL_20260717_060803762.jpg", lesson: "第13回", topics: ["line-integrals"], summary: "曲線の向き、閉曲線、区分的に滑らかな曲線、スカラー場の線積分の定義" },
  { number: 21, filename: "PXL_20260717_060809811.jpg", lesson: "第13回", topics: ["line-integrals"], summary: "スカラー線積分・成分線積分・ベクトル場の線積分の計算公式" },
  { number: 22, filename: "PXL_20260717_060812494.jpg", lesson: "第13回", topics: ["line-integrals"], summary: "経路の結合と反転、勾配定理、経路独立性、閉曲線上の積分" },
  { number: 23, filename: "PXL_20260724_091158945.jpg", lesson: "第13回演習", topics: ["line-integrals"], summary: "円・らせんに沿うスカラー線積分とdx・dy型線積分の計算演習" },
  { number: 24, filename: "PXL_20260724_091203177.jpg", lesson: "第13回演習", topics: ["line-integrals"], summary: "ベクトル場の線積分、経路の反転・結合を使う計算演習" },
  { number: 25, filename: "PXL_20260724_091215721.jpg", lesson: "第14回演習", topics: ["green-theorem"], summary: "正方形・円の閉曲線で直接計算とグリーンの定理を照合する演習" },
  { number: 26, filename: "PXL_20260724_091224452.jpg", lesson: "第14回", topics: ["green-theorem"], summary: "グリーンの定理の仮定と、Pdx・Qdyに分けた証明" },
  { number: 27, filename: "PXL_20260724_091230758.jpg", lesson: "前期末基本問題・高画質版", topics: ["curves", "surfaces", "gradient", "divergence-curl", "line-integrals", "surface-integrals", "green-theorem"], summary: "全範囲基本問題14題の高画質版。問4の曲面はr=(u cos v,u sin v,u²)と確認済み" },
];

export const APPLIED_MATH_TOPICS: AppliedMathTopic[] = [
  { id: "vectors", number: "01", title: "ベクトル・内積・外積", shortTitle: "内積・外積", description: "成分、ノルム、直交、外積、三角形の面積を扱う。", pages: [1, 2, 4, 5], color: "#7aa7ff" },
  { id: "vector-functions", number: "02", title: "ベクトル関数の微分", shortTitle: "微分・速さ", description: "成分ごとの微分と積の微分、導関数の大きさを扱う。", pages: [3, 5], color: "#a88bff" },
  { id: "curves", number: "03", title: "パラメータ曲線", shortTitle: "接線・弧長", description: "接ベクトル、単位接ベクトル、曲線の長さを求める。", pages: [6, 7, 10, 19, 27], color: "#55dde0" },
  { id: "surfaces", number: "04", title: "パラメータ曲面", shortTitle: "法線・表面積", description: "接平面、単位法線、幾何学的表面積を求める。", pages: [8, 9, 11, 17, 19, 27], color: "#66e39e" },
  { id: "gradient", number: "05", title: "勾配・等位面・方向微分", shortTitle: "勾配・方向微分", description: "勾配の計算と演算法則、方向微分の最大値を扱う。", pages: [12, 13, 14, 18, 19, 27], color: "#ffd65c" },
  { id: "divergence-curl", number: "06", title: "ベクトル場・発散・回転", shortTitle: "発散・回転", description: "ベクトル場を図示し、発散と回転、その意味を求める。", pages: [15, 16, 19, 27], color: "#ff9f68" },
  { id: "line-integrals", number: "07", title: "スカラー・ベクトル線積分", shortTitle: "線積分", description: "曲線の向きと速さを使い、スカラー場・ベクトル場を曲線に沿って積分する。", pages: [19, 20, 21, 22, 23, 24, 27], color: "#ff7fbf" },
  { id: "surface-integrals", number: "08", title: "スカラー・流束面積分", shortTitle: "面積分・流束", description: "曲面の面積要素を使い、スカラー場の面積分とベクトル場の流束を求める。", pages: [19, 27], color: "#70d6ff" },
  { id: "green-theorem", number: "09", title: "グリーンの定理", shortTitle: "グリーン", description: "正向きの閉曲線上の線積分を、内部領域の二重積分へ変換する。", pages: [19, 25, 26, 27], color: "#c9f27b" },
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
  { id: "am-vector-constant-derivative", topic: "vector-functions", title: "定ベクトルの微分", prompt: "定ベクトル \\(\\mathbf c\\) を微分すると？", formula: "\\mathbf c'=\\mathbf0", explanation: "各成分が定数なので、成分ごとに微分するとすべて0になる。", cue: "定数ベクトルの微分はゼロ" },
  { id: "am-vector-sum-derivative", topic: "vector-functions", title: "ベクトル和の微分", prompt: "\\(\\mathbf a+\\mathbf b\\) の微分法則は？", formula: "(\\mathbf a+\\mathbf b)'=\\mathbf a'+\\mathbf b'", explanation: "ベクトル関数の微分は成分ごとに行うため、和は各ベクトルへ分けて微分できる。", cue: "和はそのまま分ける" },
  { id: "am-vector-chain-rule", topic: "vector-functions", title: "ベクトル関数の連鎖律", prompt: "\\(\\mathbf a(u(t))\\) を \\(t\\) で微分すると？", formula: "\\frac{d}{dt}\\mathbf a(u(t))=\\frac{d\\mathbf a}{du}\\frac{du}{dt}", explanation: "各成分へ一変数の合成関数の微分を適用し、外側の微分に内側の微分を掛ける。", cue: "外側をuで微分×u'" },
  { id: "am-scalar-vector-product-rule", topic: "vector-functions", title: "スカラーとベクトルの積の微分", prompt: "スカラー関数 \\(u(t)\\) とベクトル関数 \\(\\mathbf a(t)\\) の積を微分すると？", formula: "(u\\mathbf a)'=u'\\mathbf a+u\\mathbf a'", explanation: "通常の積の微分と同じく、スカラーだけを微分した項とベクトルだけを微分した項を足す。", cue: "u' a＋u a'" },

  { id: "am-tangent", topic: "curves", title: "接ベクトル", prompt: "曲線 \\(\\mathbf r(t)\\) の接ベクトルは？", formula: "\\mathbf r'(t)=\\frac{d\\mathbf r}{dt}", explanation: "時刻を少し動かしたときの位置の変化率が、その点での接線方向を示す。", cue: "曲線をtで微分" },
  { id: "am-unit-tangent", topic: "curves", title: "単位接ベクトル", prompt: "曲線の単位接ベクトルは？", formula: "\\mathbf T(t)=\\frac{\\mathbf r'(t)}{|\\mathbf r'(t)|}", explanation: "接ベクトルをその長さで割り、向きを保って長さ1にする。", cue: "接ベクトルを正規化" },
  { id: "am-arc-length", topic: "curves", title: "曲線の弧長", prompt: "\\(a\\le t\\le b\\) の曲線長は？", formula: "s=\\int_a^b|\\mathbf r'(t)|\\,dt", explanation: "短い時間ごとの移動距離『速さ×時間』を積み重ねる。", cue: "速度の大きさを積分" },
  { id: "am-arc-components", topic: "curves", title: "弧長の成分表示", prompt: "弧長公式をx,y,z成分で書くと？", formula: "s=\\int_a^b\\sqrt{(x')^2+(y')^2+(z')^2}\\,dt", explanation: "\\(|\\mathbf r'|\\) を3成分のノルムとして展開した形。", cue: "各微分の二乗和にルート" },

  { id: "am-surface-regular", topic: "surfaces", title: "正則な曲面", prompt: "パラメータ曲面が正則である条件は？", formula: "\\mathbf r_u\\times\\mathbf r_v\\ne\\mathbf0", explanation: "2本の接ベクトルが平行でなければ、接平面と法線方向が定まる。", cue: "2接ベクトルの外積が0でない" },
  { id: "am-surface-normal", topic: "surfaces", title: "単位法線", prompt: "パラメータ曲面の単位法線は？", formula: "\\mathbf n=\\pm\\frac{\\mathbf r_u\\times\\mathbf r_v}{|\\mathbf r_u\\times\\mathbf r_v|}", explanation: "2つの接ベクトルの外積で法線を作り、正規化する。指定がなければ向きは±。", cue: "偏微分 → 外積 → 正規化" },
  { id: "am-source-surface-unit-normal", topic: "surfaces", title: "追加演習の単位法線", prompt: "\\(\\mathbf r=(u+v,u-v,\\frac{u^2+v^2}{2})\\) の単位法線は？", formula: "\\mathbf n=\\pm\\frac{(u+v,u-v,-2)}{\\sqrt{2u^2+2v^2+4}}", explanation: "\\(\\mathbf r_u=(1,1,u)\\)、\\(\\mathbf r_v=(1,-1,v)\\) の外積を作り、その大きさで割る。法線方向の指定がなければ両向きを認める。", cue: "外積は (u+v,u-v,-2)", example: "\\((u,v)=(0,0)\\) では \\(\\mathbf n=\\pm(0,0,-1)\\)" },
  { id: "am-surface-area-element", topic: "surfaces", title: "曲面の面積要素", prompt: "パラメータ平面の小領域が作る曲面上の面積は？", formula: "dS=|\\mathbf r_u\\times\\mathbf r_v|\\,du\\,dv", explanation: "接ベクトルが張る微小平行四辺形の面積を使う。", cue: "外積の大きさが拡大率" },
  { id: "am-surface-area", topic: "surfaces", title: "曲面の幾何学的表面積", prompt: "領域D上の曲面積は？", formula: "S=\\iint_D|\\mathbf r_u\\times\\mathbf r_v|\\,du\\,dv", explanation: "面積要素をパラメータ領域全体で足す。これは流束ではなく幾何学的な面積。", cue: "外積の大きさを二重積分" },

  { id: "am-gradient", topic: "gradient", title: "勾配", prompt: "スカラー場 \\(\\phi\\) の勾配は？", formula: "\\nabla\\phi=\\left(\\frac{\\partial\\phi}{\\partial x},\\frac{\\partial\\phi}{\\partial y},\\frac{\\partial\\phi}{\\partial z}\\right)", explanation: "各座標方向の増加率を並べたベクトルで、最も急に増える方向を向く。", cue: "x,y,zで偏微分" },
  { id: "am-level-surface", topic: "gradient", title: "等位面と法線", prompt: "等位面 \\(\\phi=c\\) の法線方向は？", formula: "\\mathbf n\\parallel\\nabla\\phi", explanation: "等位面上では \\(\\phi\\) が変化しないため、接方向の方向微分は0。勾配はすべての接方向に垂直。", cue: "等位面の法線＝勾配" },
  { id: "am-directional", topic: "gradient", title: "方向微分", prompt: "単位ベクトル \\(\\mathbf e\\) 方向の方向微分は？", formula: "D_{\\mathbf e}\\phi=\\nabla\\phi\\cdot\\mathbf e=|\\nabla\\phi|\\cos\\theta", explanation: "勾配を調べたい方向へ射影した増加率。\\(\\mathbf e\\) は必ず単位ベクトルにする。", cue: "勾配と単位方向の内積" },
  { id: "am-directional-max", topic: "gradient", title: "方向微分の最大値", prompt: "方向微分の最大値と、その方向は？", formula: "\\max_{|\\mathbf e|=1}D_{\\mathbf e}\\phi=|\\nabla\\phi|", explanation: "\\(\\cos\\theta\\le1\\) なので、\\(\\mathbf e\\) が勾配と同方向のとき最大。", cue: "最大値は勾配の大きさ" },

  { id: "am-divergence", topic: "divergence-curl", title: "発散", prompt: "\\(\\mathbf a=(a_x,a_y,a_z)\\) の発散は？", formula: "\\nabla\\cdot\\mathbf a=\\frac{\\partial a_x}{\\partial x}+\\frac{\\partial a_y}{\\partial y}+\\frac{\\partial a_z}{\\partial z}", explanation: "各方向について『その方向成分を同じ座標で微分』して足すスカラー。", cue: "x成分をx、y成分をy、z成分をzで微分" },
  { id: "am-curl", topic: "divergence-curl", title: "回転", prompt: "\\(\\mathbf a\\) の回転を成分で書くと？", formula: "\\nabla\\times\\mathbf a=\\begin{pmatrix}\\frac{\\partial a_z}{\\partial y}-\\frac{\\partial a_y}{\\partial z}\\\\ \\frac{\\partial a_x}{\\partial z}-\\frac{\\partial a_z}{\\partial x}\\\\ \\frac{\\partial a_y}{\\partial x}-\\frac{\\partial a_x}{\\partial y}\\end{pmatrix}", explanation: "形式的な行列式で計算できるベクトル。最後の成分は \\(\\frac{\\partial a_y}{\\partial x}-\\frac{\\partial a_x}{\\partial y}\\)。", cue: "∇×a の行列式" },
  { id: "am-divergence-meaning", topic: "divergence-curl", title: "発散の物理的意味", prompt: "流れ場で発散が正・負の意味は？", formula: "\\nabla\\cdot\\mathbf v=\\frac{\\text{正味流出量}}{\\text{単位時間}\\times\\text{単位体積}}", explanation: "正なら微小領域から出る量が入る量より多い湧き出し、負なら吸い込み。", cue: "正＝湧き出し、負＝吸い込み" },
  { id: "am-field-examples", topic: "divergence-curl", title: "代表ベクトル場", prompt: "\\((x,y,0)\\) と \\((-y,x,0)\\) の特徴は？", formula: "\\nabla\\cdot(x,y,0)=2,\\qquad\\nabla\\times(-y,x,0)=(0,0,2)", explanation: "前者は原点から放射状で発散が正、後者は原点周りに回る場でz方向の回転をもつ。", cue: "放射＝div、旋回＝curl" },
  { id: "am-div-curl-linearity", topic: "divergence-curl", title: "発散・回転の線形性（補助）", prompt: "ベクトル場の和の発散と回転は？", formula: "\\begin{aligned}\\nabla\\cdot(\\mathbf a+\\mathbf b)&=\\nabla\\cdot\\mathbf a+\\nabla\\cdot\\mathbf b\\\\ \\nabla\\times(\\mathbf a+\\mathbf b)&=\\nabla\\times\\mathbf a+\\nabla\\times\\mathbf b\\end{aligned}", explanation: "偏微分の線形性により、和を先に計算しても各場へ分けてから計算しても同じになる補助公式。", cue: "divもcurlも和へ分配" },
  { id: "am-div-curl-scalar-product", topic: "divergence-curl", title: "スカラー倍の発散・回転（補助）", prompt: "スカラー場 \\(\\phi\\) とベクトル場 \\(\\mathbf a\\) の積にdiv・curlを作用させると？", formula: "\\begin{aligned}\\nabla\\cdot(\\phi\\mathbf a)&=\\nabla\\phi\\cdot\\mathbf a+\\phi\\nabla\\cdot\\mathbf a\\\\ \\nabla\\times(\\phi\\mathbf a)&=\\nabla\\phi\\times\\mathbf a+\\phi\\nabla\\times\\mathbf a\\end{aligned}", explanation: "積の微分と同様に、スカラー場を微分する項とベクトル場を微分する項へ分かれる。curlでは外積の順序を変えない。", cue: "∇φの項＋φを残す項" },
  { id: "am-vector-calculus-zero-identities", topic: "divergence-curl", title: "grad・curl・divの恒等式（補助）", prompt: "勾配の回転と、回転の発散は？", formula: "\\nabla\\times(\\nabla\\phi)=\\mathbf0,\\qquad\\nabla\\cdot(\\nabla\\times\\mathbf a)=0", explanation: "十分滑らかな場では混合偏微分の順序を交換でき、各成分が相殺する。ガウス・ストークスの定理そのものではない。", cue: "curl grad＝0、div curl＝0" },

  { id: "am-gradient-linearity", topic: "gradient", title: "勾配の和・差", prompt: "スカラー場の和・差を勾配すると？", formula: "\\nabla(\\phi\\pm\\psi)=\\nabla\\phi\\pm\\nabla\\psi", explanation: "偏微分の線形性により、和や差は各スカラー場を別々に勾配してから同じ符号で結べる。", cue: "和差はそのまま分ける" },
  { id: "am-gradient-product", topic: "gradient", title: "勾配の積の法則", prompt: "\\(\\phi\\psi\\) の勾配は？", formula: "\\nabla(\\phi\\psi)=\\psi\\nabla\\phi+\\phi\\nabla\\psi", explanation: "通常の積の微分と同じく、一方を固定して他方を勾配した2項を足す。", cue: "後ろ×前の勾配＋前×後ろの勾配" },
  { id: "am-gradient-quotient", topic: "gradient", title: "勾配の逆数・商", prompt: "逆数と商の勾配公式は？", formula: "\\begin{aligned}\\nabla\\!\\left(\\frac1\\psi\\right)&=-\\frac{\\nabla\\psi}{\\psi^2}\\\\ \\nabla\\!\\left(\\frac\\phi\\psi\\right)&=\\frac{\\psi\\nabla\\phi-\\phi\\nabla\\psi}{\\psi^2}\\end{aligned}", explanation: "一変数の逆数・商の微分を、各座標方向の偏微分へ同時に適用した形。分母が0でない範囲で使う。", cue: "商は分母×分子勾配−分子×分母勾配" },

  { id: "am-curve-orientation", topic: "line-integrals", title: "曲線の結合と逆向き", prompt: "曲線の結合と逆向きを記号で書くと？", formula: "C=C_1+\\cdots+C_n,\\qquad -C:B\\to A", explanation: "終点と次の始点をつないだ曲線を和で表す。始点と終点を入れ替えて逆向きにたどる曲線がマイナスC。", cue: "結合は＋、逆向きは−C" },
  { id: "am-scalar-line-integral", topic: "line-integrals", title: "スカラー場の線積分", prompt: "曲線 \\(\\mathbf r(t)\\) に沿う \\(\\phi\\) の線積分は？", formula: "\\int_C\\phi\\,ds=\\int_a^b\\phi(\\mathbf r(t))\\,|\\mathbf r'(t)|\\,dt", explanation: "スカラー場の値に微小な曲線長を掛けて足す。向きを逆にしても距離要素は正なので値は変わらない。", cue: "場を代入×速さ" },
  { id: "am-component-line-integral", topic: "line-integrals", title: "成分に関する線積分", prompt: "\\(dx\\) を含む線積分をパラメータで書くと？", formula: "\\int_C\\phi\\,dx=\\int_a^b\\phi(\\mathbf r(t))\\,x'(t)\\,dt", explanation: "距離要素ではなくx座標の変化を掛ける。dy・dzの場合も対応する成分の導関数へ置き換える。", cue: "dxならx'を掛ける" },
  { id: "am-vector-line-integral", topic: "line-integrals", title: "ベクトル場の線積分", prompt: "ベクトル場 \\(\\mathbf a\\) の線積分は？", formula: "\\begin{aligned}\\int_C\\mathbf a\\cdot d\\mathbf r&=\\int_a^b\\mathbf a(\\mathbf r(t))\\cdot\\mathbf r'(t)\\,dt\\\\ &=\\int_C(a_x\\,dx+a_y\\,dy+a_z\\,dz)\\end{aligned}", explanation: "ベクトル場の接線方向成分を曲線に沿って積分する。力の場なら経路に沿って行う仕事に対応する。", cue: "場と接ベクトルの内積" },
  { id: "am-line-path-rules", topic: "line-integrals", title: "線積分の経路法則", prompt: "経路の結合・反転でベクトル線積分はどう変わる？", formula: "\\begin{aligned}\\int_{C_1+C_2}\\mathbf a\\cdot d\\mathbf r&=\\int_{C_1}\\mathbf a\\cdot d\\mathbf r+\\int_{C_2}\\mathbf a\\cdot d\\mathbf r\\\\ \\int_{-C}\\mathbf a\\cdot d\\mathbf r&=-\\int_C\\mathbf a\\cdot d\\mathbf r\\end{aligned}", explanation: "経路をつなげれば各区間の積分を足す。逆向きでは位置の微小変化が反転するため符号も反転する。", cue: "つなぐと足す、逆向きはマイナス" },
  { id: "am-gradient-theorem", topic: "line-integrals", title: "勾配定理", prompt: "勾配場の線積分を端点だけで求める公式は？", formula: "\\int_C\\nabla\\phi\\cdot d\\mathbf r=\\phi(B)-\\phi(A),\\qquad\\oint_C\\nabla\\phi\\cdot d\\mathbf r=0", explanation: "勾配場では線積分が経路によらず始点と終点だけで決まる。閉曲線では両端が同じなので0。", cue: "終点の値−始点の値" },

  { id: "am-scalar-surface-integral", topic: "surface-integrals", title: "スカラー場の面積分", prompt: "パラメータ曲面上で \\(\\phi\\) を面積分すると？", formula: "\\int_S\\phi\\,dS=\\iint_D\\phi(\\mathbf r(u,v))\\,|\\mathbf r_u\\times\\mathbf r_v|\\,du\\,dv", explanation: "曲面上の場の値に面積の拡大率を掛け、パラメータ領域で二重積分する。向きには依存しない。", cue: "場を代入×外積の大きさ" },
  { id: "am-flux-surface-integral", topic: "surface-integrals", title: "ベクトル場の流束面積分", prompt: "向き付き曲面を通過する流束は？", formula: "\\int_S\\mathbf a\\cdot\\mathbf n\\,dS=\\iint_D\\mathbf a(\\mathbf r(u,v))\\cdot(\\mathbf r_u\\times\\mathbf r_v)\\,du\\,dv", explanation: "場の法線方向成分を曲面全体で足す。指定された法線方向に合わせて外積の順序を決める。", cue: "場と向き付き外積の内積" },
  { id: "am-green-theorem", topic: "green-theorem", title: "グリーンの定理", prompt: "正向きの閉曲線上の線積分を二重積分へ直すと？", formula: "\\oint_C(P\\,dx+Q\\,dy)=\\iint_D\\left(\\frac{\\partial Q}{\\partial x}-\\frac{\\partial P}{\\partial y}\\right)dA", explanation: "反時計回りの閉曲線を境界にもつ平面領域で使う。線積分を内部の回転を足す二重積分へ変換する。", cue: "Qをxで微分−Pをyで微分" },
  { id: "am-green-conditions", topic: "green-theorem", title: "グリーンの定理の使用条件", prompt: "グリーンの定理を使うための曲線の向きと関数の条件は？", formula: "C=\\partial D\\quad(\\mathrm{positive\\ orientation}),\\qquad P,Q\\in C^1(D)", explanation: "Cは領域Dを左側に見ながら進む単純閉曲線、すなわち通常は反時計回りである。P、Qと必要な偏導関数がD上で連続であることも確認する。", cue: "単純閉曲線・反時計回り・連続偏導関数" },
  { id: "am-green-proof-components", topic: "green-theorem", title: "グリーンの定理の成分別証明", prompt: "Pdx項とQdy項をそれぞれ二重積分へ直す式は？", formula: "\\begin{aligned}\\oint_C P\\,dx&=-\\iint_D\\frac{\\partial P}{\\partial y}\\,dA\\\\ \\oint_C Q\\,dy&=\\iint_D\\frac{\\partial Q}{\\partial x}\\,dA\\end{aligned}", explanation: "下側と上側、右側と左側の境界積分を基本定理でまとめると2式が得られる。両式を加えることでグリーンの定理になる。", cue: "Pdxは−P_y、Qdyは＋Q_x" },
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
  courseQuestion({ id: "am-q-unit", topic: "vectors", genre: "単位ベクトル", difficulty: 1, format: "choice", prompt: "\\(\\mathbf a=(0,3,4)\\) と同方向の単位ベクトルを選べ。", answer: "\\((0,\\frac35,\\frac45)\\)", options: ["\\((0,\\frac35,\\frac45)\\)", "\\((0,3,4)\\)", "\\((0,\\frac45,\\frac35)\\)", "\\((0,-\\frac35,-\\frac45)\\)"], formula: "\\mathbf e=\\frac{\\mathbf a}{|\\mathbf a|}", steps: ["\\(|\\mathbf a|=5\\)", "各成分を5で割る"], explanation: "同方向なので符号は変えず、長さだけ1にする。" }),
  courseQuestion({ id: "am-q-orthogonal", topic: "vectors", genre: "直交", difficulty: 2, format: "number", prompt: "\\((2,k,1)\\) と \\((3,-2,4)\\) が直交するとき \\(k\\) を求めよ。", answer: "5", numericAnswer: 5, formula: "\\mathbf a\\cdot\\mathbf b=0", steps: ["\\(2\\cdot3+k(-2)+1\\cdot4=0\\)", "\\(10-2k=0\\)", "\\(k=5\\)"], explanation: "直交条件を内積0へ置き換える。" }),
  courseQuestion({ id: "am-q-cross", topic: "vectors", genre: "外積", difficulty: 2, format: "choice", prompt: "\\((1,0,2)\\times(2,2,-1)\\) を選べ。", answer: "\\((-4,5,2)\\)", options: ["\\((-4,5,2)\\)", "\\((4,-5,-2)\\)", "\\((-2,5,4)\\)", "\\((4,5,2)\\)"], formula: "\\mathbf a\\times\\mathbf b=(a_yb_z-a_zb_y,a_zb_x-a_xb_z,a_xb_y-a_yb_x)", steps: ["第1成分 \\(0(-1)-2\\cdot2=-4\\)", "第2成分 \\(2\\cdot2-1(-1)=5\\)", "第3成分 \\(1\\cdot2-0\\cdot2=2\\)"], explanation: "第2成分の符号を取り違えない。" }),
  courseQuestion({ id: "am-q-triangle", topic: "vectors", genre: "三角形面積", difficulty: 2, format: "number", prompt: "\\(\\overrightarrow{AB}=(3,0,0),\\ \\overrightarrow{AC}=(0,4,0)\\) のとき三角形ABCの面積を求めよ。", answer: "6", numericAnswer: 6, formula: "S=\\frac12|\\overrightarrow{AB}\\times\\overrightarrow{AC}|", steps: ["外積は \\((0,0,12)\\)", "大きさ12の半分で6"], explanation: "外積は平行四辺形の面積なので2で割る。" }),
  courseQuestion({ id: "am-q-cross-order", topic: "vectors", genre: "外積の性質", difficulty: 1, format: "choice", prompt: "\\(\\mathbf a\\times\\mathbf b\\) と \\(\\mathbf b\\times\\mathbf a\\) の関係を選べ。", answer: "\\(\\mathbf b\\times\\mathbf a=-\\mathbf a\\times\\mathbf b\\)", options: ["\\(\\mathbf b\\times\\mathbf a=-\\mathbf a\\times\\mathbf b\\)", "\\(\\mathbf b\\times\\mathbf a=\\mathbf a\\times\\mathbf b\\)", "常にどちらも1", "常にどちらも同じスカラー"], steps: ["外積は反交換的"], explanation: "順番を逆にすると向きが反転する。" }),

  courseQuestion({ id: "am-q-vector-derivative", topic: "vector-functions", genre: "成分微分", difficulty: 1, format: "choice", prompt: "\\(\\mathbf r(t)=(t^2,\\sin t,e^t)\\) の導関数を選べ。", answer: "\\((2t,\\cos t,e^t)\\)", options: ["\\((2t,\\cos t,e^t)\\)", "\\((t,\\cos t,te^{t-1})\\)", "\\((2, -\\sin t,e^t)\\)", "\\((2t,\\sin t,e^t)\\)"], steps: ["3成分をそれぞれtで微分"], explanation: "ベクトル関数の微分は成分ごとに行う。" }),
  courseQuestion({ id: "am-q-speed", topic: "vector-functions", genre: "速さ", difficulty: 2, format: "number", prompt: "\\(\\mathbf r(t)=(3t,4t,t^2)\\) の \\(t=0\\) における速さを求めよ。", answer: "5", numericAnswer: 5, formula: "v=|\\mathbf r'(t)|", steps: ["\\(\\mathbf r'(t)=(3,4,2t)\\)", "\\(t=0\\) では \\((3,4,0)\\)", "速さは5"], explanation: "位置ではなく導関数の大きさを取る。" }),
  courseQuestion({ id: "am-q-dot-product-rule", topic: "vector-functions", genre: "積の微分", difficulty: 1, format: "choice", prompt: "\\(\\frac{d}{dt}(\\mathbf a\\cdot\\mathbf b)\\) を選べ。", answer: "\\(\\mathbf a'\\cdot\\mathbf b+\\mathbf a\\cdot\\mathbf b'\\)", options: ["\\(\\mathbf a'\\cdot\\mathbf b+\\mathbf a\\cdot\\mathbf b'\\)", "\\(\\mathbf a'\\cdot\\mathbf b'\\)", "\\(\\mathbf a'\\cdot\\mathbf b-\\mathbf a\\cdot\\mathbf b'\\)", "\\(\\mathbf a\\cdot\\mathbf b\\)"], steps: ["通常の積の微分と同じ2項"], explanation: "片方ずつ微分した2項を足す。" }),
  courseQuestion({ id: "am-q-cross-product-rule", topic: "vector-functions", genre: "積の微分", difficulty: 2, format: "choice", prompt: "\\(\\frac{d}{dt}(\\mathbf a\\times\\mathbf b)\\) を選べ。", answer: "\\(\\mathbf a'\\times\\mathbf b+\\mathbf a\\times\\mathbf b'\\)", options: ["\\(\\mathbf a'\\times\\mathbf b+\\mathbf a\\times\\mathbf b'\\)", "\\(\\mathbf a'\\times\\mathbf b'+\\mathbf b\\times\\mathbf a\\)", "\\(\\mathbf b\\times\\mathbf a'+\\mathbf b'\\times\\mathbf a\\)", "\\(\\mathbf a'\\times\\mathbf b'\\)"], steps: ["外積の順序を保つ", "前を微分した項と後ろを微分した項を足す"], explanation: "外積は交換できないので順序が重要。" }),
  courseQuestion({ id: "am-q-vector-limit", topic: "vector-functions", genre: "極限", difficulty: 1, format: "text", prompt: "ベクトル関数の極限・連続性はどのように判定するか。", answer: "各成分の極限・連続性をそれぞれ判定する。", accepted: ["成分ごとに判定する", "各成分で極限をとる"], keywords: ["成分", "極限"], minKeywords: 2, steps: ["x,y,z各成分へ分ける"], explanation: "ベクトルの極限は成分ごとの極限として定義される。" }),
  courseQuestion({ id: "am-q-vector-chain-rule", topic: "vector-functions", genre: "補助公式・連鎖律", difficulty: 1, format: "choice", prompt: "\\(\\mathbf a(u(t))\\) の \\(t\\) 微分を選べ。", answer: "\\(\\dfrac{d\\mathbf a}{du}\\dfrac{du}{dt}\\)", options: ["\\(\\dfrac{d\\mathbf a}{du}\\dfrac{du}{dt}\\)", "\\(\\dfrac{d\\mathbf a}{du}+\\dfrac{du}{dt}\\)", "\\(\\dfrac{d\\mathbf a}{dt}\\dfrac{dt}{du}\\)", "\\(\\mathbf a(u)+u\\)"], steps: ["外側のベクトル関数をuで微分する", "内側のu(t)をtで微分して掛ける"], explanation: "各成分へ合成関数の微分を適用するため、外側の微分と内側の微分の積になる。" }),
  courseQuestion({ id: "am-q-scalar-vector-product-rule", topic: "vector-functions", genre: "補助公式・積の微分", difficulty: 1, format: "choice", prompt: "スカラー関数 \\(u(t)\\) とベクトル関数 \\(\\mathbf a(t)\\) について \\((u\\mathbf a)'\\) を選べ。", answer: "\\(u'\\mathbf a+u\\mathbf a'\\)", options: ["\\(u'\\mathbf a+u\\mathbf a'\\)", "\\(u'\\mathbf a'\\)", "\\(u'\\mathbf a-u\\mathbf a'\\)", "\\(u\\mathbf a'\\)"], steps: ["uだけを微分した項を作る", "aだけを微分した項を作って足す"], explanation: "スカラーとベクトルの積でも通常の積の微分と同じ2項が必要になる。" }),

  courseQuestion({ id: "am-q-unit-tangent", topic: "curves", genre: "単位接ベクトル", difficulty: 2, format: "choice", prompt: "\\(\\mathbf r(t)=(2\\cos t,2\\sin t,0)\\) の単位接ベクトルを選べ。", answer: "\\((-\\sin t,\\cos t,0)\\)", options: ["\\((-\\sin t,\\cos t,0)\\)", "\\((\\cos t,\\sin t,0)\\)", "\\((-2\\sin t,2\\cos t,0)\\)", "\\((\\sin t,-\\cos t,0)\\)"], formula: "\\mathbf T=\\frac{\\mathbf r'}{|\\mathbf r'|}", steps: ["\\(\\mathbf r'=(-2\\sin t,2\\cos t,0)\\)", "\\(|\\mathbf r'|=2\\)", "2で割る"], explanation: "接ベクトルを正規化する。" }),
  courseQuestion({ id: "am-q-helix-tangent", topic: "curves", genre: "単位接ベクトル", difficulty: 2, format: "choice", prompt: "\\(\\mathbf r(t)=(3\\cos t,3\\sin t,4t)\\) の単位接ベクトルを選べ。", answer: "\\((-\\frac{3\\sin t}{5},\\frac{3\\cos t}{5},\\frac45)\\)", options: ["\\((-\\frac{3\\sin t}{5},\\frac{3\\cos t}{5},\\frac45)\\)", "\\((-3\\sin t,3\\cos t,4)\\)", "\\((\\frac{3\\cos t}{5},\\frac{3\\sin t}{5},\\frac45)\\)", "\\((-\\frac{4\\sin t}{5},\\frac{4\\cos t}{5},\\frac35)\\)"], steps: ["\\(\\mathbf r'=(-3\\sin t,3\\cos t,4)\\)", "\\(|\\mathbf r'|=5\\)", "各成分を5で割る"], explanation: "\\(\\sin^2t+\\cos^2t=1\\) を使うと速さは一定。" }),
  courseQuestion({ id: "am-q-helix-length", topic: "curves", genre: "弧長", difficulty: 2, format: "number", prompt: "\\(\\mathbf r(t)=(3\\cos t,3\\sin t,4t)\\), \\(0\\le t\\le2\\pi\\) の曲線長を \\(\\pi\\) の係数で答えよ。", answer: "\\(10\\pi\\)（係数10）", numericAnswer: 10, formula: "s=\\int_0^{2\\pi}|\\mathbf r'(t)|dt", steps: ["速さは \\(\\sqrt{9\\sin^2t+9\\cos^2t+16}=5\\)", "\\(\\int_0^{2\\pi}5dt=10\\pi\\)"], explanation: "入力欄には \\(\\pi\\) の係数10を入力する。" }),
  courseQuestion({ id: "am-q-arc-source", topic: "curves", genre: "弧長", difficulty: 3, format: "number", prompt: "\\(\\mathbf r(t)=(t,t^2,\\frac23t^3)\\), \\(0\\le t\\le1\\) の弧長を求めよ。", answer: "\\(\\frac53\\)", numericAnswer: 5 / 3, tolerance: 0.0001, steps: ["\\(\\mathbf r'=(1,2t,2t^2)\\)", "\\(|\\mathbf r'|=\\sqrt{1+4t^2+4t^4}=1+2t^2\\)", "\\(\\int_0^1(1+2t^2)\\,dt=\\frac53\\)"], explanation: "根号内が \\((1+2t^2)^2\\) になることを見抜く。" }),
  courseQuestion({ id: "am-q-regular-curve", topic: "curves", genre: "定義", difficulty: 1, format: "choice", prompt: "正則なパラメータ曲線の条件を選べ。", answer: "\\(\\mathbf r'(t)\\ne\\mathbf0\\)", options: ["\\(\\mathbf r'(t)\\ne\\mathbf0\\)", "\\(\\mathbf r'(t)=\\mathbf0\\)", "\\(|\\mathbf r(t)|=1\\)", "\\(t=0\\)"], steps: ["接方向が定まる条件を確認"], explanation: "導関数が0だと、その点で接ベクトルの向きが定まらない。" }),

  courseQuestion({ id: "am-q-surface-normal", topic: "surfaces", genre: "単位法線", difficulty: 2, format: "choice", prompt: "\\(\\mathbf r(u,v)=(u,v,2u-3v)\\) の単位法線の1つを選べ。", answer: "\\(\\frac{(-2,3,1)}{\\sqrt{14}}\\)", options: ["\\(\\frac{(-2,3,1)}{\\sqrt{14}}\\)", "\\(\\frac{(2,-3,1)}{\\sqrt{14}}\\)", "\\(\\frac{(1,1,-1)}{\\sqrt3}\\)", "\\((-2,3,1)\\)"], formula: "\\mathbf n=\\pm\\frac{\\mathbf r_u\\times\\mathbf r_v}{|\\mathbf r_u\\times\\mathbf r_v|}", steps: ["\\(\\mathbf r_u=(1,0,2),\\ \\mathbf r_v=(0,1,-3)\\)", "\\(\\mathbf r_u\\times\\mathbf r_v=(-2,3,1)\\)", "大きさ \\(\\sqrt{14}\\) で割る"], explanation: "反対向きも法線だが、選択肢では指定された向きを選ぶ。" }),
  courseQuestion({ id: "am-q-source-surface-unit-normal", topic: "surfaces", genre: "追加範囲・単位法線", difficulty: 2, format: "choice", prompt: "\\(\\mathbf r(u,v)=(u+v,u-v,\\frac{u^2+v^2}{2})\\) の単位法線を選べ。", answer: "\\(\\displaystyle\\pm\\frac{(u+v,u-v,-2)}{\\sqrt{2u^2+2v^2+4}}\\)", options: ["\\(\\displaystyle\\pm\\frac{(u+v,u-v,-2)}{\\sqrt{2u^2+2v^2+4}}\\)", "\\(\\displaystyle\\pm\\frac{(u-v,u+v,2)}{\\sqrt{2u^2+2v^2+4}}\\)", "\\((u+v,u-v,-2)\\)", "\\(\\displaystyle\\pm\\frac{(1,1,u)}{\\sqrt{u^2+2}}\\)"], formula: "\\mathbf n=\\pm\\frac{\\mathbf r_u\\times\\mathbf r_v}{|\\mathbf r_u\\times\\mathbf r_v|}", steps: ["\\(\\mathbf r_u=(1,1,u),\\ \\mathbf r_v=(1,-1,v)\\)", "\\(\\mathbf r_u\\times\\mathbf r_v=(u+v,u-v,-2)\\)", "大きさ \\(\\sqrt{2u^2+2v^2+4}\\) で割る"], explanation: "外積の第2成分は \\(u-v\\)、第3成分は \\(-2\\)。向きの指定がないので全体を反転した法線も正しい。" }),
  courseQuestion({ id: "am-q-surface-regular", topic: "surfaces", genre: "正則性", difficulty: 1, format: "choice", prompt: "パラメータ曲面が正則である条件を選べ。", answer: "\\(\\mathbf r_u\\times\\mathbf r_v\\ne\\mathbf0\\)", options: ["\\(\\mathbf r_u\\times\\mathbf r_v\\ne\\mathbf0\\)", "\\(\\mathbf r_u\\cdot\\mathbf r_v=0\\) だけ", "\\(\\mathbf r_u=\\mathbf r_v\\)", "\\(|\\mathbf r|=0\\)"], steps: ["2本の接ベクトルが平行でない条件"], explanation: "外積が0でなければ法線と接平面が定まる。" }),
  courseQuestion({ id: "am-q-plane-area", topic: "surfaces", genre: "曲面積", difficulty: 2, format: "number", prompt: "\\(\\mathbf r(u,v)=(u,v,2u-3v)\\), \\(0\\le u\\le1,0\\le v\\le2\\) の曲面積を \\(\\sqrt{14}\\) の係数で答えよ。", answer: "\\(2\\sqrt{14}\\)（係数2）", numericAnswer: 2, steps: ["\\(|\\mathbf r_u\\times\\mathbf r_v|=\\sqrt{14}\\)", "パラメータ領域の面積は2", "曲面積は \\(2\\sqrt{14}\\)"], explanation: "入力欄には \\(\\sqrt{14}\\) の係数2を入力する。" }),
  courseQuestion({ id: "am-q-surface-area-meaning", topic: "surfaces", genre: "公式の意味", difficulty: 1, format: "text", prompt: "\\(\\iint_D|\\mathbf r_u\\times\\mathbf r_v|\\,du\\,dv\\) が求める量を答えよ。", answer: "パラメータ表示された曲面の幾何学的表面積", accepted: ["曲面の表面積", "幾何学的な曲面積"], keywords: ["曲面", "面積"], minKeywords: 2, steps: ["外積の大きさは微小平行四辺形の面積"], explanation: "ベクトル場の流束ではなく、曲面そのものの面積。" }),

  courseQuestion({ id: "am-q-gradient", topic: "gradient", genre: "勾配", difficulty: 1, format: "choice", prompt: "\\(\\phi=x^2+2y^2+3z\\) の勾配を選べ。", answer: "\\((2x,4y,3)\\)", options: ["\\((2x,4y,3)\\)", "\\((x,2y,3z)\\)", "\\((2,4,3)\\)", "\\((2x,2y,0)\\)"], formula: "\\nabla\\phi=(\\phi_x,\\phi_y,\\phi_z)", steps: ["x,y,zでそれぞれ偏微分"], explanation: "他の変数は定数として偏微分する。" }),
  courseQuestion({ id: "am-q-directional", topic: "gradient", genre: "方向微分", difficulty: 2, format: "number", prompt: "\\(\\phi=x^2+y^2+z^2\\) の点 \\((1,2,2)\\) における \\(\\mathbf e=(1,0,0)\\) 方向の方向微分を求めよ。", answer: "2", numericAnswer: 2, steps: ["\\(\\nabla\\phi=(2x,2y,2z)\\)", "点では \\((2,4,4)\\)", "\\((2,4,4)\\cdot(1,0,0)=2\\)"], explanation: "方向ベクトルはすでに単位ベクトル。" }),
  courseQuestion({ id: "am-q-direction-max", topic: "gradient", genre: "最大方向微分", difficulty: 2, format: "number", prompt: "スカラー場 \\(\\phi=x^2+y^2+z^2\\) の点 \\((1,2,2)\\) における方向微分の最大値を求めよ。", answer: "6", numericAnswer: 6, steps: ["勾配は \\((2,4,4)\\)", "大きさは \\(\\sqrt{4+16+16}=6\\)"], explanation: "最大方向微分は勾配の大きさ。" }),
  courseQuestion({ id: "am-q-level-normal", topic: "gradient", genre: "等位面", difficulty: 1, format: "text", prompt: "等位面 \\(\\phi(x,y,z)=c\\) に対して \\(\\nabla\\phi\\) はどの方向を向くか。", answer: "等位面に垂直な法線方向", accepted: ["等位面の法線方向", "等位面に垂直"], keywords: ["等位面", "垂直"], minKeywords: 2, steps: ["等位面上の接方向ではφは変化しない"], explanation: "接方向との内積が0になるため、勾配は法線。" }),
  courseQuestion({ id: "am-q-direction-unit", topic: "gradient", genre: "方向微分", difficulty: 1, format: "choice", prompt: "方向微分 \\(D_{\\mathbf e}\\phi=\\nabla\\phi\\cdot\\mathbf e\\) で必要な \\(\\mathbf e\\) の条件を選べ。", answer: "単位ベクトルである", options: ["単位ベクトルである", "ゼロベクトルである", "勾配と常に直交する", "長さは自由である"], steps: ["方向だけの変化率にするため長さを1にする"], explanation: "単位化しないと方向だけでなくベクトルの長さまで結果に掛かる。" }),

  courseQuestion({ id: "am-q-div", topic: "divergence-curl", genre: "発散", difficulty: 1, format: "number", prompt: "\\(\\mathbf a=(x,y,0)\\) の発散を求めよ。", answer: "2", numericAnswer: 2, steps: ["\\(\\frac{\\partial x}{\\partial x}=1\\)", "\\(\\frac{\\partial y}{\\partial y}=1\\)", "\\(\\frac{\\partial 0}{\\partial z}=0\\)", "合計2"], explanation: "対応する成分と座標を微分して足す。" }),
  courseQuestion({ id: "am-q-curl", topic: "divergence-curl", genre: "回転", difficulty: 2, format: "choice", prompt: "\\(\\mathbf b=(-y,x,0)\\) の回転を選べ。", answer: "\\((0,0,2)\\)", options: ["\\((0,0,2)\\)", "\\((0,0,0)\\)", "\\((0,0,-2)\\)", "2"], steps: ["z成分は \\(\\frac{\\partial b_y}{\\partial x}-\\frac{\\partial b_x}{\\partial y}\\)", "\\(=1-(-1)=2\\)", "他の成分は0"], explanation: "平面内の反時計回りの旋回が正のz成分に現れる。" }),
  courseQuestion({ id: "am-q-shear-curl", topic: "divergence-curl", genre: "回転", difficulty: 2, format: "choice", prompt: "\\(\\mathbf c=(-y,0,0)\\) の回転を選べ。", answer: "\\((0,0,1)\\)", options: ["\\((0,0,1)\\)", "\\((0,0,-1)\\)", "\\((1,0,0)\\)", "\\((0,0,0)\\)"], steps: ["z成分は \\(\\frac{\\partial 0}{\\partial x}-\\frac{\\partial(-y)}{\\partial y}\\)", "\\(=0-(-1)=1\\)"], explanation: "第3成分の引き算の順序に注意する。" }),
  courseQuestion({ id: "am-q-div-meaning", topic: "divergence-curl", genre: "物理的意味", difficulty: 1, format: "choice", prompt: "流れ場のある点で発散が正のとき、微小領域では何が起きているか。", answer: "流入より流出が多い湧き出し", options: ["流入より流出が多い湧き出し", "流出より流入が多い吸い込み", "必ず回転だけが起きる", "速度が必ず0になる"], steps: ["発散は単位体積・単位時間あたりの正味流出"], explanation: "正は正味流出、負は正味流入。" }),
  courseQuestion({ id: "am-q-field-shape", topic: "divergence-curl", genre: "図示", difficulty: 1, format: "choice", prompt: "平面ベクトル場 \\((-y,x,0)\\) の形として最も適切なものを選べ。", answer: "原点の周りを反時計回りに回る", options: ["原点の周りを反時計回りに回る", "原点から放射状に外へ向く", "すべて右向き", "すべてゼロ"], steps: ["点(1,0)では上向き", "点(0,1)では左向き"], explanation: "各象限で向きを確認すると反時計回りの旋回になる。" }),
  courseQuestion({ id: "am-q-div-curl-linearity", topic: "divergence-curl", genre: "補助公式・線形性", difficulty: 1, format: "choice", prompt: "ベクトル場の和に対するdiv・curlの正しい組を選べ。", answer: "\\(\\nabla\\cdot(\\mathbf a+\\mathbf b)=\\nabla\\cdot\\mathbf a+\\nabla\\cdot\\mathbf b,\\ \\nabla\\times(\\mathbf a+\\mathbf b)=\\nabla\\times\\mathbf a+\\nabla\\times\\mathbf b\\)", options: ["\\(\\nabla\\cdot(\\mathbf a+\\mathbf b)=\\nabla\\cdot\\mathbf a+\\nabla\\cdot\\mathbf b,\\ \\nabla\\times(\\mathbf a+\\mathbf b)=\\nabla\\times\\mathbf a+\\nabla\\times\\mathbf b\\)", "\\(\\nabla\\cdot(\\mathbf a+\\mathbf b)=\\nabla\\cdot\\mathbf a\\,\\nabla\\cdot\\mathbf b\\)", "\\(\\nabla\\times(\\mathbf a+\\mathbf b)=\\nabla\\times\\mathbf a-\\nabla\\times\\mathbf b\\)", "divもcurlも和へ分配できない"], steps: ["偏微分は和へ分配できる", "divもcurlも各場へ分けてから足す"], explanation: "発散と回転はいずれも偏微分の線形結合なので、ベクトル場の和に対して線形である。" }),
  courseQuestion({ id: "am-q-div-curl-scalar-product", topic: "divergence-curl", genre: "補助公式・積の微分", difficulty: 2, format: "choice", prompt: "スカラー場 \\(\\phi\\) とベクトル場 \\(\\mathbf a\\) の積に関する正しい組を選べ。", answer: "\\(\\nabla\\cdot(\\phi\\mathbf a)=\\nabla\\phi\\cdot\\mathbf a+\\phi\\nabla\\cdot\\mathbf a,\\ \\nabla\\times(\\phi\\mathbf a)=\\nabla\\phi\\times\\mathbf a+\\phi\\nabla\\times\\mathbf a\\)", options: ["\\(\\nabla\\cdot(\\phi\\mathbf a)=\\nabla\\phi\\cdot\\mathbf a+\\phi\\nabla\\cdot\\mathbf a,\\ \\nabla\\times(\\phi\\mathbf a)=\\nabla\\phi\\times\\mathbf a+\\phi\\nabla\\times\\mathbf a\\)", "\\(\\nabla\\cdot(\\phi\\mathbf a)=\\phi\\nabla\\cdot\\mathbf a\\) だけ", "\\(\\nabla\\times(\\phi\\mathbf a)=\\mathbf a\\times\\nabla\\phi+\\phi\\nabla\\times\\mathbf a\\)", "どちらも \\(\\nabla\\phi+\\nabla\\mathbf a\\)"], steps: ["スカラー場を微分する項と、ベクトル場を微分する項に分ける", "curlでは \\(\\nabla\\phi\\times\\mathbf a\\) の順序を保つ"], explanation: "積の微分と同じ2項が必要で、外積は順序を逆にすると符号が変わる。" }),
  courseQuestion({ id: "am-q-vector-calculus-zero-identities", topic: "divergence-curl", genre: "補助公式・恒等式", difficulty: 1, format: "choice", prompt: "十分滑らかな場で常に成り立つ組を選べ。", answer: "\\(\\nabla\\times(\\nabla\\phi)=\\mathbf0,\\ \\nabla\\cdot(\\nabla\\times\\mathbf a)=0\\)", options: ["\\(\\nabla\\times(\\nabla\\phi)=\\mathbf0,\\ \\nabla\\cdot(\\nabla\\times\\mathbf a)=0\\)", "\\(\\nabla\\cdot(\\nabla\\phi)=0,\\ \\nabla\\times(\\nabla\\times\\mathbf a)=\\mathbf0\\)", "\\(\\nabla\\times(\\nabla\\phi)=1,\\ \\nabla\\cdot(\\nabla\\times\\mathbf a)=1\\)", "どちらも一般には定義できない"], steps: ["curl gradでは混合偏微分が差で相殺する", "div curlでも混合偏微分が差で相殺する"], explanation: "十分滑らかなら混合偏微分の順序を交換できるため、curl gradとdiv curlはともに0になる。" }),

  courseQuestion({ id: "am-q-source-paraboloid-area", topic: "surfaces", genre: "追加範囲・曲面積", difficulty: 3, format: "text", prompt: "\\(\\mathbf r(u,v)=(u\\cos v,u\\sin v,u^2)\\), \\(0\\le u\\le1,0\\le v\\le2\\pi\\) の曲面積を求めよ。", answer: "\\(\\frac{\\pi}{6}(5\\sqrt5-1)\\)", accepted: ["pi(5sqrt5-1)/6", "π(5√5-1)/6"], keywords: ["5", "1", "6"], minKeywords: 3, formula: "S=\\iint_D|\\mathbf r_u\\times\\mathbf r_v|\\,du\\,dv", steps: ["\\(\\mathbf r_u=(\\cos v,\\sin v,2u),\\ \\mathbf r_v=(-u\\sin v,u\\cos v,0)\\)", "\\(\\mathbf r_u\\times\\mathbf r_v=(-2u^2\\cos v,-2u^2\\sin v,u)\\)", "\\(|\\mathbf r_u\\times\\mathbf r_v|=u\\sqrt{4u^2+1}\\)", "\\(2\\pi\\int_0^1u\\sqrt{4u^2+1}\\,du=\\frac{\\pi}{6}(5\\sqrt5-1)\\)"], explanation: "追加範囲2の高画質な基本問題問4で第三成分が \\(u^2\\) と確認できた。偏微分ベクトル、外積、その大きさを順に求めて曲面積へつなぐ。" }),
  courseQuestion({ id: "am-q-source-cylinder-area", topic: "surfaces", genre: "追加範囲・曲面積", difficulty: 2, format: "number", prompt: "\\(\\mathbf r(u,v)=(\\cos u,\\sin u,v^2)\\), \\(0\\le u\\le\\pi,0\\le v\\le2\\) の曲面積を \\(\\pi\\) の係数で答えよ。", answer: "\\(4\\pi\\)（係数4）", numericAnswer: 4, formula: "S=\\iint_D|\\mathbf r_u\\times\\mathbf r_v|\\,du\\,dv", steps: ["\\(\\mathbf r_u=(-\\sin u,\\cos u,0),\\ \\mathbf r_v=(0,0,2v)\\)", "\\(|\\mathbf r_u\\times\\mathbf r_v|=2v\\)", "\\(\\int_0^\\pi\\int_0^2 2v\\,dv\\,du=4\\pi\\)"], explanation: "入力欄には \\(\\pi\\) の係数4を入力する。範囲では \\(v\\ge0\\) なので大きさは \\(2v\\)。" }),

  courseQuestion({ id: "am-q-source-gradient", topic: "gradient", genre: "追加範囲・勾配", difficulty: 2, format: "choice", prompt: "\\(\\phi=xyz^3+2x^2z\\) の点 \\(P=(1,-1,1)\\) における勾配を選べ。", answer: "\\((3,1,-1)\\)", options: ["\\((3,1,-1)\\)", "\\((1,3,-1)\\)", "\\((3,-1,1)\\)", "\\((4,1,-3)\\)"], formula: "\\nabla\\phi=(\\phi_x,\\phi_y,\\phi_z)", steps: ["\\(\\nabla\\phi=(yz^3+4xz,xz^3,3xyz^2+2x^2)\\)", "\\(P=(1,-1,1)\\) を代入する", "\\(\\nabla\\phi(P)=(3,1,-1)\\)"], explanation: "各偏微分を先に作ってから点を代入する。特にz成分の符号を確認する。" }),
  courseQuestion({ id: "am-q-source-directional", topic: "gradient", genre: "追加範囲・方向微分", difficulty: 3, format: "number", prompt: "\\(\\phi=e^{3x}+y^2\\log z\\), \\(P=(0,2,1)\\) における \\(\\mathbf a=(2,1,-2)\\) 方向の方向微分を求めよ。", answer: "\\(-\\frac23\\)", numericAnswer: -2 / 3, tolerance: 0.0001, formula: "D_{\\mathbf e}\\phi=\\nabla\\phi(P)\\cdot\\frac{\\mathbf a}{|\\mathbf a|}", steps: ["\\(\\nabla\\phi=(3e^{3x},2y\\log z,\\frac{y^2}{z})\\) より \\(\\nabla\\phi(P)=(3,0,4)\\)", "\\(|\\mathbf a|=3\\) なので \\(\\mathbf e=\\frac{(2,1,-2)}{3}\\)", "\\((3,0,4)\\cdot\\frac{(2,1,-2)}{3}=-\\frac23\\)"], explanation: "方向ベクトルを単位化してから勾配との内積を取る。単位化を忘れると値が3倍になる。" }),
  courseQuestion({ id: "am-q-gradient-quotient-rule", topic: "gradient", genre: "勾配の演算法則", difficulty: 2, format: "choice", prompt: "\\(\\nabla\\!\\left(\\frac{\\phi}{\\psi}\\right)\\) の正しい公式を選べ。ただし \\(\\psi\\ne0\\) とする。", answer: "\\(\\frac{\\psi\\nabla\\phi-\\phi\\nabla\\psi}{\\psi^2}\\)", options: ["\\(\\frac{\\psi\\nabla\\phi-\\phi\\nabla\\psi}{\\psi^2}\\)", "\\(\\frac{\\phi\\nabla\\psi-\\psi\\nabla\\phi}{\\psi^2}\\)", "\\(\\frac{\\nabla\\phi}{\\nabla\\psi}\\)", "\\(\\frac{\\nabla\\phi+\\nabla\\psi}{\\psi}\\)"], steps: ["一変数の商の微分と同じ順序", "分母を二乗し、分子は分母×分子勾配−分子×分母勾配"], explanation: "勾配どうしを割るのではない。分子の引き算の順序と分母の二乗が重要。" }),

  courseQuestion({ id: "am-q-source-divergence", topic: "divergence-curl", genre: "追加範囲・発散", difficulty: 2, format: "text", prompt: "\\(\\mathbf a=(x^2y,-2xz,2yz)\\) の発散を求めよ。", answer: "\\(2xy+2y\\)", accepted: ["2xy+2y", "2y(x+1)"], keywords: ["2xy", "2y"], minKeywords: 2, formula: "\\nabla\\cdot\\mathbf a=\\partial_xa_x+\\partial_ya_y+\\partial_za_z", steps: ["\\(\\partial_x(x^2y)=2xy\\)", "\\(\\partial_y(-2xz)=0\\)", "\\(\\partial_z(2yz)=2y\\)", "合計して \\(2xy+2y\\)"], explanation: "各成分を対応する座標だけで偏微分する。第2成分はyを含まないため0。" }),
  courseQuestion({ id: "am-q-source-curl", topic: "divergence-curl", genre: "追加範囲・回転", difficulty: 3, format: "text", prompt: "\\(\\mathbf a=(x^3z,-y^2z,xyz)\\) の回転を求めよ。", answer: "\\((xz+y^2,x^3-yz,0)\\)", accepted: ["(xz+y^2,x^3-yz,0)", "xz+y2,x3-yz,0"], keywords: ["xz", "y", "x", "yz", "0"], minKeywords: 4, formula: "\\nabla\\times\\mathbf a=(\\partial_ya_z-\\partial_za_y,\\partial_za_x-\\partial_xa_z,\\partial_xa_y-\\partial_ya_x)", steps: ["第1成分は \\(xz-(-y^2)=xz+y^2\\)", "第2成分は \\(x^3-yz\\)", "第3成分は \\(0-0=0\\)"], explanation: "回転の各成分は偏微分の差である。第1成分では二重のマイナスに注意する。" }),

  courseQuestion({ id: "am-q-scalar-line-ds", topic: "line-integrals", genre: "スカラー線積分", difficulty: 2, format: "number", prompt: "\\(C:\\mathbf r(t)=(\\cos t,\\sin t,1)\\), \\(0\\le t\\le\\pi\\) のとき \\(\\int_C(x^2+z)\\,ds\\) を \\(\\pi\\) の係数で答えよ。", answer: "\\(\\frac{3\\pi}{2}\\)（係数 \\(\\frac32\\)）", numericAnswer: 3 / 2, tolerance: 0.0001, formula: "\\int_C\\phi\\,ds=\\int_a^b\\phi(\\mathbf r(t))|\\mathbf r'(t)|dt", steps: ["\\(|\\mathbf r'(t)|=1\\)", "\\(x^2+z=\\cos^2t+1\\)", "\\(\\int_0^\\pi(\\cos^2t+1)\\,dt=\\frac{3\\pi}{2}\\)"], explanation: "入力欄には \\(\\pi\\) の係数 \\(\\frac32\\) を入力する。dsでは速さを掛ける。" }),
  courseQuestion({ id: "am-q-scalar-line-dx", topic: "line-integrals", genre: "成分線積分", difficulty: 2, format: "number", prompt: "曲線 \\(C:\\mathbf r(t)=(\\cos t,\\sin t,1)\\), \\(0\\le t\\le\\pi\\) に沿う \\(\\int_C(x^2+z)\\,dx\\) を求めよ。", answer: "\\(-\\frac83\\)", numericAnswer: -8 / 3, tolerance: 0.0001, formula: "\\int_C\\phi\\,dx=\\int_a^b\\phi(\\mathbf r(t))x'(t)dt", steps: ["\\(dx=x'(t)dt=-\\sin t\\,dt\\)", "\\(\\int_0^\\pi(\\cos^2t+1)(-\\sin t)\\,dt\\)", "\\(u=\\cos t\\) とおけば \\(\\int_1^{-1}(u^2+1)\\,du=-\\frac83\\)"], explanation: "dxでは曲線長ではなくx成分の変化を掛けるため、向きによって符号が変わる。" }),
  courseQuestion({ id: "am-q-scalar-line-helix-ds", topic: "line-integrals", genre: "スカラー線積分", difficulty: 3, format: "text", prompt: "\\(C:\\mathbf r(t)=(\\cos t,\\sin t,t)\\), \\(0\\le t\\le\\frac{\\pi}{2}\\) のとき \\(\\int_C(x+y^2)\\,ds\\) を求めよ。", answer: "\\(\\sqrt2\\left(1+\\frac{\\pi}{4}\\right)\\)", accepted: ["sqrt2(1+pi/4)", "√2(1+π/4)"], keywords: ["2", "1", "4"], minKeywords: 3, formula: "\\int_C\\phi\\,ds=\\int_a^b\\phi(\\mathbf r(t))|\\mathbf r'(t)|dt", steps: ["\\(|\\mathbf r'|=\\sqrt{\\sin^2t+\\cos^2t+1}=\\sqrt2\\)", "\\(x+y^2=\\cos t+\\sin^2t\\)", "\\(\\sqrt2\\int_0^{\\frac{\\pi}{2}}(\\cos t+\\sin^2t)\\,dt=\\sqrt2\\left(1+\\frac{\\pi}{4}\\right)\\)"], explanation: "らせんではz成分の導関数も速さに含めるため、面内の円より速さが \\(\\sqrt2\\) になる。" }),
  courseQuestion({ id: "am-q-scalar-line-dy", topic: "line-integrals", genre: "成分線積分", difficulty: 3, format: "text", prompt: "曲線 \\(C:\\mathbf r(t)=(\\cos t,\\sin t,t)\\), \\(0\\le t\\le\\frac{\\pi}{2}\\) に沿う \\(\\int_C(x+y^2)\\,dy\\) を求めよ。", answer: "\\(\\frac{\\pi}{4}+\\frac13\\)", accepted: ["pi/4+1/3", "π/4+1/3"], keywords: ["4", "1", "3"], minKeywords: 3, formula: "\\int_C\\phi\\,dy=\\int_a^b\\phi(\\mathbf r(t))y'(t)dt", steps: ["\\(dy=\\cos t\\,dt\\)", "\\(\\int_0^{\\frac{\\pi}{2}}(\\cos t+\\sin^2t)\\cos t\\,dt\\)", "\\(\\int_0^{\\frac{\\pi}{2}}\\cos^2t\\,dt+\\int_0^{\\frac{\\pi}{2}}\\sin^2t\\cos t\\,dt=\\frac{\\pi}{4}+\\frac13\\)"], explanation: "dyなのでyの導関数 \\(\\cos t\\) を掛ける。dsの \\(\\sqrt2\\) は使わない。" }),
  courseQuestion({ id: "am-q-vector-line-one", topic: "line-integrals", genre: "ベクトル線積分", difficulty: 3, format: "number", prompt: "\\(C:\\mathbf r(t)=(t^2+1,2t,1)\\), \\(0\\le t\\le1\\)、\\(\\mathbf a=(xy,yz,zx)\\) の \\(\\int_C\\mathbf a\\cdot d\\mathbf r\\) を求めよ。", answer: "\\(\\frac{62}{15}\\)", numericAnswer: 62 / 15, tolerance: 0.0001, formula: "\\int_C\\mathbf a\\cdot d\\mathbf r=\\int_a^b\\mathbf a(\\mathbf r(t))\\cdot\\mathbf r'(t)dt", steps: ["\\(\\mathbf a(\\mathbf r(t))=(2t(t^2+1),2t,t^2+1)\\)", "\\(\\mathbf r'(t)=(2t,2,0)\\)", "内積は \\(4t^4+4t^2+4t\\)", "\\(\\int_0^1(4t^4+4t^2+4t)\\,dt=\\frac{62}{15}\\)"], explanation: "場へ曲線を代入してから接ベクトルとの内積を作り、最後にtで積分する。" }),
  courseQuestion({ id: "am-q-vector-line-two", topic: "line-integrals", genre: "ベクトル線積分", difficulty: 3, format: "number", prompt: "\\(C:\\mathbf r(t)=(t,t^2,t+t^2)\\), \\(1\\le t\\le2\\)、\\(\\mathbf a=(x-2y,2z,-x)\\) の線積分を求めよ。", answer: "15", numericAnswer: 15, formula: "\\int_C\\mathbf a\\cdot d\\mathbf r=\\int_a^b\\mathbf a(\\mathbf r(t))\\cdot\\mathbf r'(t)dt", steps: ["\\(\\mathbf a(\\mathbf r(t))=(t-2t^2,2t+2t^2,-t)\\)", "\\(\\mathbf r'(t)=(1,2t,1+2t)\\)", "内積を整理すると \\(4t^3\\)", "\\(\\int_1^2 4t^3dt=[t^4]_1^2=15\\)"], explanation: "展開時に2次項が打ち消し合う。積分区間が1から2であることにも注意する。" }),
  courseQuestion({ id: "am-q-gradient-theorem", topic: "line-integrals", genre: "勾配定理", difficulty: 1, format: "choice", prompt: "\\(\\mathbf a=\\nabla\\phi\\) のとき、点AからBへ至る曲線C上の線積分として正しいものを選べ。", answer: "\\(\\phi(B)-\\phi(A)\\)", options: ["\\(\\phi(B)-\\phi(A)\\)", "\\(\\phi(A)-\\phi(B)\\)", "\\(\\phi(A)+\\phi(B)\\)", "経路ごとに必ず異なる"], steps: ["合成関数の微分で被積分関数は \\(\\frac{d}{dt}\\phi(\\mathbf r(t))\\)", "端点で評価して \\(\\phi(B)-\\phi(A)\\)"], explanation: "勾配場の線積分は経路独立で、始点と終点のスカラー場の値だけで決まる。" }),

  courseQuestion({ id: "am-q-path-reversal", topic: "line-integrals", genre: "経路反転", difficulty: 2, format: "number", prompt: "\\(C_1:\\mathbf r(t)=(t,0,0)\\), \\(-3\\le t\\le3\\)、\\(\\mathbf a=(x^2,y,-z)\\) とする。逆向きの経路 \\(-C_1\\) に沿う \\(\\int_{-C_1}\\mathbf a\\cdot d\\mathbf r\\) を求めよ。", answer: "-18", numericAnswer: -18, formula: "\\int_{-C}\\mathbf a\\cdot d\\mathbf r=-\\int_C\\mathbf a\\cdot d\\mathbf r", steps: ["\\(C_1\\) 上では \\(\\mathbf a=(t^2,0,0)\\)、\\(d\\mathbf r=(1,0,0)dt\\)", "\\(\\int_{C_1}\\mathbf a\\cdot d\\mathbf r=\\int_{-3}^{3}t^2dt=18\\)", "逆向きなので \\(\\int_{-C_1}\\mathbf a\\cdot d\\mathbf r=-18\\)"], explanation: "経路を逆向きにたどると接ベクトルの向きが反転するため、ベクトル場の線積分は符号が反転する。" }),
  courseQuestion({ id: "am-q-path-concatenation", topic: "line-integrals", genre: "経路結合", difficulty: 3, format: "number", prompt: "\\(C_1:\\mathbf r(t)=(t,0,0),-3\\le t\\le3\\)、\\(C_2:\\mathbf r(t)=(3\\cos t,3\\sin t,0),0\\le t\\le\\pi\\)、\\(\\mathbf a=(x^2,y,-z)\\) とする。\\(\\int_{C_1+C_2}\\mathbf a\\cdot d\\mathbf r\\) を求めよ。", answer: "0", numericAnswer: 0, formula: "\\int_{C_1+C_2}\\mathbf a\\cdot d\\mathbf r=\\int_{C_1}\\mathbf a\\cdot d\\mathbf r+\\int_{C_2}\\mathbf a\\cdot d\\mathbf r", steps: ["前問と同様に \\(\\int_{C_1}\\mathbf a\\cdot d\\mathbf r=18\\)", "\\(C_2\\) では \\(\\mathbf a=(9\\cos^2t,3\\sin t,0)\\)、\\(\\mathbf r'=(-3\\sin t,3\\cos t,0)\\)", "\\(\\int_0^\\pi(-27\\cos^2t\\sin t+9\\sin t\\cos t)dt=-18\\)", "したがって \\(18+(-18)=0\\)"], explanation: "結合経路では各区間の線積分を足す。2本目を単独で計算してから合計すると、符号と向きを確認しやすい。" }),
  courseQuestion({ id: "am-q-scalar-surface-cylinder", topic: "surface-integrals", genre: "スカラー面積分", difficulty: 3, format: "text", prompt: "半径 \\(a\\)、高さ \\(h\\) の円柱側面 \\(\\mathbf r(u,v)=(a\\cos u,a\\sin u,v)\\) 上で \\(\\phi=x^2\\) の面積分を求めよ。", context: "\\(0\\le u\\le2\\pi,\\ 0\\le v\\le h\\)", answer: "\\(\\pi a^3h\\)", accepted: ["pi a^3 h", "πa3h"], keywords: ["a", "3", "h"], minKeywords: 3, formula: "\\int_S\\phi\\,dS=\\iint_D\\phi(\\mathbf r)|\\mathbf r_u\\times\\mathbf r_v|dudv", steps: ["\\(|\\mathbf r_u\\times\\mathbf r_v|=a\\)", "\\(\\phi=a^2\\cos^2u\\)", "\\(\\int_0^h\\int_0^{2\\pi}a^3\\cos^2u\\,du\\,dv=\\pi a^3h\\)"], explanation: "スカラー場の値と曲面の面積要素を掛ける。円周方向の \\(\\cos^2u\\) の積分は \\(\\pi\\)。" }),
  courseQuestion({ id: "am-q-flux-source", topic: "surface-integrals", genre: "流束面積分", difficulty: 3, format: "number", prompt: "\\(\\mathbf r(u,v)=(u,v,\\sqrt{9-u^2})\\), \\(0\\le u\\le3,0\\le v\\le4\\)、\\(\\mathbf a=(6z,2x+y,-x)\\) とする。z成分が正の法線方向の流束 \\(\\int_S\\mathbf a\\cdot\\mathbf n\\,dS\\) を求めよ。", answer: "90", numericAnswer: 90, formula: "\\int_S\\mathbf a\\cdot\\mathbf n\\,dS=\\iint_D\\mathbf a(\\mathbf r)\\cdot(\\mathbf r_u\\times\\mathbf r_v)dudv", steps: ["\\(\\mathbf r_u\\times\\mathbf r_v=(\\frac{u}{\\sqrt{9-u^2}},0,1)\\) はz成分が正", "\\(\\mathbf a(\\mathbf r)\\cdot(\\mathbf r_u\\times\\mathbf r_v)=6u-u=5u\\)", "\\(\\int_0^4\\int_0^3 5u\\,du\\,dv=90\\)"], explanation: "単位法線とdSを別々に計算する代わりに、向き付き外積をそのまま使うと簡潔になる。" }),

  courseQuestion({ id: "am-q-green-proof-components", topic: "green-theorem", genre: "グリーンの定理・証明", difficulty: 2, format: "text", prompt: "正向きの単純閉曲線 \\(C=\\partial D\\) について、\\(P\\,dx\\) 項と \\(Q\\,dy\\) 項をそれぞれ領域D上の二重積分へ直す2式を書き、加えるとグリーンの定理になることを示せ。", answer: "\\(\\oint_C P\\,dx=-\\iint_D P_y\\,dA\\)、\\(\\oint_C Q\\,dy=\\iint_D Q_x\\,dA\\)", accepted: ["∮Pdx=-∬PydA,∮Qdy=∬QxdA", "Pdx=-Py,Qdy=Qx"], keywords: ["P", "Q", "-", "x", "y"], minKeywords: 5, formula: "\\begin{aligned}\\oint_C P\\,dx&=-\\iint_D\\frac{\\partial P}{\\partial y}\\,dA\\\\ \\oint_C Q\\,dy&=\\iint_D\\frac{\\partial Q}{\\partial x}\\,dA\\end{aligned}", steps: ["領域を \\(D=\\{(x,y)\\mid a\\le x\\le b,\\ \\varphi(x)\\le y\\le\\psi(x)\\}\\) と表す", "下側と上側の向きを含めて \\(\\oint_C Pdx=\\int_a^b[P(x,\\varphi(x))-P(x,\\psi(x))]dx\\)", "微積分の基本定理から \\(\\oint_C Pdx=-\\iint_D P_y\\,dA\\)", "同様に \\(\\oint_C Qdy=\\iint_D Q_x\\,dA\\) とし、2式を加える"], explanation: "追加範囲2の証明用紙にある分解である。Pdx側だけ負号が付き、Qdy側は正号になる点が重要。" }),
  courseQuestion({ id: "am-q-green-square", topic: "green-theorem", genre: "グリーンの定理", difficulty: 3, format: "number", prompt: "正方形 \\(0\\le x\\le1,0\\le y\\le1\\) の境界Cを反時計回りに一周するとき、\\(\\oint_C\\{(x^2+2y^2)dx+xy^2dy\\}\\) を求めよ。", answer: "\\(-\\frac53\\)", numericAnswer: -5 / 3, tolerance: 0.0001, formula: "\\oint_C(Pdx+Qdy)=\\iint_D(Q_x-P_y)dA", steps: ["\\(P=x^2+2y^2,\\ Q=xy^2\\)", "\\(Q_x-P_y=y^2-4y\\)", "\\(\\int_0^1\\int_0^1(y^2-4y)\\,dy\\,dx=-\\frac53\\)"], explanation: "O→A→B→Cの順は反時計回りの正向き。微分の順序は \\(Q_x-P_y\\) である。" }),
  courseQuestion({ id: "am-q-green-circle", topic: "green-theorem", genre: "グリーンの定理", difficulty: 2, format: "number", prompt: "半径2の円の境界Cを反時計回りに一周するとき、\\(\\oint_C\\{(x-y)dx+(x+y)dy\\}\\) を \\(\\pi\\) の係数で答えよ。", answer: "\\(8\\pi\\)（係数8）", numericAnswer: 8, formula: "\\oint_C(Pdx+Qdy)=\\iint_D(Q_x-P_y)dA", steps: ["\\(Q_x=1,\\ P_y=-1\\) より \\(Q_x-P_y=2\\)", "半径2の円の面積は \\(4\\pi\\)", "\\(2\\times4\\pi=8\\pi\\)"], explanation: "入力欄には \\(\\pi\\) の係数8を入力する。向きを逆にすると答えの符号も逆になる。" }),
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

function buildAppliedMathExam(variant: number): AppliedMathExpectedExam {
  const id = "applied-expected-" + String(variant).padStart(2, "0");

  const origin = [variant, 0, 1];
  const sideU = [variant + 1, 1, 0];
  const sideV = [1, (variant % 3) + 2, 2];
  const pointB = origin.map((value, index) => value + sideU[index]);
  const pointC = origin.map((value, index) => value + sideV[index]);
  const triangleCross = [
    sideU[1] * sideV[2] - sideU[2] * sideV[1],
    sideU[2] * sideV[0] - sideU[0] * sideV[2],
    sideU[0] * sideV[1] - sideU[1] * sideV[0],
  ];
  const triangleCrossNormSquared = triangleCross.reduce((sum, value) => sum + value ** 2, 0);

  const vectorCoefficient = variant + 1;
  const vectorSpeedSquared = vectorCoefficient ** 2 + 13;
  const squaredDistanceDerivative = 2 * vectorCoefficient ** 2 + 10;

  const helixA = (variant % 3) + 1;
  const helixB = ((variant + 1) % 3) + 1;
  const helixSpeedSquared = helixA ** 2 + helixB ** 2;
  const helixScalarIntegralCoefficient = 2 * helixA ** 2;

  const surfaceP = (variant % 3) + 1;
  const surfaceQ = ((variant + 1) % 3) + 1;
  const surfaceUSpan = 1 + (variant % 2);
  const surfaceVSpan = 2;
  const surfaceNormSquared = surfaceP ** 2 + surfaceQ ** 2 + 1;
  const surfaceDomainArea = surfaceUSpan * surfaceVSpan;
  const surfaceFlux =
    -(surfaceP ** 2 + 4) * surfaceUSpan ** 2
    + 2 * surfaceP * surfaceQ * surfaceUSpan;

  const gradientC = variant + 1;
  const gradientAtPoint = [2, 2 * gradientC, 2];
  const directionalNumerator = 2 + 2 * gradientC;
  const gradientNormSquared = gradientAtPoint.reduce((sum, value) => sum + value ** 2, 0);
  const gradientLineIntegral = gradientC + 2;

  const fieldA = variant + 1;
  const fieldB = (variant % 3) + 1;
  const fieldC = (variant % 2) + 1;
  const divergence = 2 * fieldA + fieldC;
  const curlZ = 2 * fieldB;
  const greenRadius = ((variant + 1) % 3) + 1;
  const circulationCoefficient = 2 * fieldB * greenRadius ** 2;

  const sections: AppliedMathExamSection[] = [
    {
      number: 1,
      title: "ベクトル・外積・三角形",
      topic: "vectors",
      topicIds: ["vectors"],
      points: 14,
      context:
        "\\(A=(" + origin.join(",") + ")\\)、\\(B=(" + pointB.join(",")
        + ")\\)、\\(C=(" + pointC.join(",") + ")\\) とする。",
      questions: [
        examQuestion(id, 1, 1, 4, {
          topic: "vectors",
          genre: "位置ベクトル",
          difficulty: 1,
          format: "text",
          prompt: "\\(\\overrightarrow{AB}\\) と \\(\\overrightarrow{AC}\\) を求めよ。",
          answer: "\\(\\overrightarrow{AB}=(" + sideU.join(",") + "),\\ \\overrightarrow{AC}=(" + sideV.join(",") + ")\\)",
          accepted: ["(" + sideU.join(",") + "),(" + sideV.join(",") + ")"],
          keywords: [...sideU.map(String), ...sideV.map(String)],
          minKeywords: 5,
          formula: "\\overrightarrow{AB}=\\mathbf B-\\mathbf A",
          steps: [
            "\\(\\overrightarrow{AB}=B-A=(" + sideU.join(",") + ")\\)",
            "\\(\\overrightarrow{AC}=C-A=(" + sideV.join(",") + ")\\)",
          ],
          explanation: "各終点の座標から共通の始点Aの座標を成分ごとに引く。以後の外積と面積は、この2本の辺ベクトルを使う。",
        }),
        examQuestion(id, 1, 2, 4, {
          topic: "vectors",
          genre: "外積",
          difficulty: 2,
          format: "text",
          prompt: "前問の結果を用いて \\(\\overrightarrow{AB}\\times\\overrightarrow{AC}\\) を求めよ。",
          answer: "\\((" + triangleCross.join(",") + ")\\)",
          accepted: ["(" + triangleCross.join(",") + ")", triangleCross.join(",")],
          keywords: triangleCross.map(String),
          minKeywords: 3,
          formula: "\\mathbf a\\times\\mathbf b=(a_yb_z-a_zb_y,\\ a_zb_x-a_xb_z,\\ a_xb_y-a_yb_x)",
          steps: [
            "第1成分は \\(" + sideU[1] + "\\cdot" + sideV[2] + "-" + sideU[2] + "\\cdot" + sideV[1] + "=" + triangleCross[0] + "\\)",
            "第2成分は \\(" + sideU[2] + "\\cdot" + sideV[0] + "-" + sideU[0] + "\\cdot" + sideV[2] + "=" + triangleCross[1] + "\\)",
            "第3成分は \\(" + sideU[0] + "\\cdot" + sideV[1] + "-" + sideU[1] + "\\cdot" + sideV[0] + "=" + triangleCross[2] + "\\)",
          ],
          explanation: "AB、ACの順に外積を取る。順序を逆にすると法線の向きが反転するため、成分の符号まで採点対象になる。",
        }),
        examQuestion(id, 1, 3, 6, {
          topic: "vectors",
          genre: "面積と単位法線",
          difficulty: 3,
          format: "text",
          prompt: "前問の外積から、三角形ABCの面積と、z成分が正の単位法線ベクトルを求めよ。",
          answer:
            "面積 \\(\\frac{\\sqrt{" + triangleCrossNormSquared + "}}{2}\\)、単位法線 \\(\\frac{1}{\\sqrt{"
            + triangleCrossNormSquared + "}}(" + triangleCross.join(",") + ")\\)",
          accepted: [
            "sqrt(" + triangleCrossNormSquared + ")/2,(" + triangleCross.join(",") + ")/sqrt(" + triangleCrossNormSquared + ")",
          ],
          keywords: [String(triangleCrossNormSquared), ...triangleCross.map(String)],
          minKeywords: 4,
          formula: "S=\\frac12|\\overrightarrow{AB}\\times\\overrightarrow{AC}|",
          steps: [
            "前問の外積の大きさは \\(\\sqrt{" + triangleCrossNormSquared + "}\\)",
            "三角形なので平行四辺形の面積の半分を取り、\\(S=\\frac{\\sqrt{" + triangleCrossNormSquared + "}}{2}\\)",
            "外積をその大きさで割り、\\(\\mathbf n=\\frac{1}{\\sqrt{" + triangleCrossNormSquared + "}}(" + triangleCross.join(",") + ")\\)",
          ],
          explanation: "外積は面に垂直で、その大きさは2辺が張る平行四辺形の面積になる。同じ計算結果を面積と法線の両方へつなげる問題である。",
        }),
      ],
    },
    {
      number: 2,
      title: "ベクトル関数の微分・速さ",
      topic: "vector-functions",
      topicIds: ["vector-functions"],
      points: 12,
      context: "\\(\\mathbf r(t)=(t^2," + vectorCoefficient + "t,t^3)\\) とする。",
      questions: [
        examQuestion(id, 2, 1, 6, {
          topic: "vector-functions",
          genre: "速度と加速度",
          difficulty: 2,
          format: "text",
          prompt: "\\(\\mathbf r'(t)\\)、\\(\\mathbf r''(t)\\) と、それぞれの \\(t=1\\) における値を求めよ。",
          answer:
            "\\(\\mathbf r'(t)=(2t," + vectorCoefficient + ",3t^2),\\ \\mathbf r'(1)=(2," + vectorCoefficient
            + ",3)\\)、\\(\\mathbf r''(t)=(2,0,6t),\\ \\mathbf r''(1)=(2,0,6)\\)",
          accepted: [
            "(2t," + vectorCoefficient + ",3t^2),(2," + vectorCoefficient + ",3),(2,0,6t),(2,0,6)",
          ],
          keywords: ["2t", String(vectorCoefficient), "3t", "6t", "2", "6"],
          minKeywords: 5,
          formula: "\\mathbf v=\\mathbf r'(t),\\qquad\\mathbf a=\\mathbf r''(t)",
          steps: [
            "各成分を1回微分して \\(\\mathbf r'(t)=(2t," + vectorCoefficient + ",3t^2)\\)",
            "さらに微分して \\(\\mathbf r''(t)=(2,0,6t)\\)",
            "\\(t=1\\) を代入して \\(\\mathbf r'(1)=(2," + vectorCoefficient + ",3)\\)、\\(\\mathbf r''(1)=(2,0,6)\\)",
          ],
          explanation: "ベクトル関数は成分ごとに微分する。1回微分が速度、2回微分が加速度で、次問では速度ベクトルを再利用する。",
        }),
        examQuestion(id, 2, 2, 6, {
          topic: "vector-functions",
          genre: "速さと内積の微分",
          difficulty: 3,
          format: "text",
          prompt: "前問を用い、\\(t=1\\) の速さと \\(\\left.\\frac{d}{dt}(\\mathbf r\\cdot\\mathbf r)\\right|_{t=1}\\) を求めよ。",
          answer:
            "速さ \\(\\sqrt{" + vectorSpeedSquared + "}\\)、\\(\\left.\\frac{d}{dt}(\\mathbf r\\cdot\\mathbf r)\\right|_{t=1}="
            + squaredDistanceDerivative + "\\)",
          accepted: ["sqrt(" + vectorSpeedSquared + ")," + squaredDistanceDerivative],
          keywords: [String(vectorSpeedSquared), String(squaredDistanceDerivative)],
          minKeywords: 2,
          formula: "\\frac{d}{dt}(\\mathbf r\\cdot\\mathbf r)=2\\mathbf r\\cdot\\mathbf r'",
          steps: [
            "前問より \\(\\mathbf r'(1)=(2," + vectorCoefficient + ",3)\\) なので、速さは \\(\\sqrt{" + vectorSpeedSquared + "}\\)",
            "\\(\\mathbf r(1)=(1," + vectorCoefficient + ",1)\\)",
            "\\(2\\mathbf r(1)\\cdot\\mathbf r'(1)=2(2+" + vectorCoefficient ** 2 + "+3)=" + squaredDistanceDerivative + "\\)",
          ],
          explanation: "速さは速度の大きさである。内積の微分は積の微分則を使うと、成分を展開してから微分するより短く処理できる。",
        }),
      ],
    },
    {
      number: 3,
      title: "パラメータ曲線・線積分",
      topic: "curves",
      topicIds: ["curves", "line-integrals"],
      points: 14,
      context:
        "\\(\\mathbf r(t)=(" + helixA + "\\cos t," + helixA + "\\sin t," + helixB
        + "t),\\ 0\\le t\\le2\\pi\\) が表す曲線Cを考える。",
      questions: [
        examQuestion(id, 3, 1, 4, {
          topic: "curves",
          genre: "単位接ベクトル",
          difficulty: 2,
          format: "text",
          prompt: "\\(\\mathbf r'(t)\\)、\\(|\\mathbf r'(t)|\\) と単位接ベクトル \\(\\mathbf T(t)\\) を求めよ。",
          answer:
            "\\(\\mathbf r'=(-" + helixA + "\\sin t," + helixA + "\\cos t," + helixB
            + ")\\)、\\(|\\mathbf r'|=\\sqrt{" + helixSpeedSquared + "}\\)、\\(\\mathbf T=\\frac{1}{\\sqrt{"
            + helixSpeedSquared + "}}(-" + helixA + "\\sin t," + helixA + "\\cos t," + helixB + ")\\)",
          accepted: [
            "(-" + helixA + "sin t," + helixA + "cos t," + helixB + "),sqrt(" + helixSpeedSquared + ")",
          ],
          keywords: [String(helixA), String(helixB), String(helixSpeedSquared)],
          minKeywords: 3,
          formula: "\\mathbf T(t)=\\frac{\\mathbf r'(t)}{|\\mathbf r'(t)|}",
          steps: [
            "成分ごとに微分して \\(\\mathbf r'=(-" + helixA + "\\sin t," + helixA + "\\cos t," + helixB + ")\\)",
            "\\(\\sin^2t+\\cos^2t=1\\) より \\(|\\mathbf r'|=\\sqrt{" + helixSpeedSquared + "}\\)",
            "接ベクトルを速さで割って単位接ベクトルにする",
          ],
          explanation: "らせんでは速さが一定になる。ここで得た速さを、続く弧長と線積分でも使う。",
        }),
        examQuestion(id, 3, 2, 6, {
          topic: "curves",
          genre: "弧長",
          difficulty: 2,
          format: "text",
          prompt: "前問の速さを用いて、曲線Cの長さを求めよ。",
          answer: "\\(2\\pi\\sqrt{" + helixSpeedSquared + "}\\)",
          accepted: ["2pi sqrt(" + helixSpeedSquared + ")", "2π√" + helixSpeedSquared],
          keywords: ["2", String(helixSpeedSquared)],
          minKeywords: 2,
          formula: "s=\\int_0^{2\\pi}|\\mathbf r'(t)|\\,dt",
          steps: [
            "前問より速さは一定で \\(\\sqrt{" + helixSpeedSquared + "}\\)",
            "\\(s=\\int_0^{2\\pi}\\sqrt{" + helixSpeedSquared + "}\\,dt\\)",
            "\\(s=2\\pi\\sqrt{" + helixSpeedSquared + "}\\)",
          ],
          explanation: "曲線の長さは速さの積分である。定数を積分区間の長さ \\(2\\pi\\) 倍すればよい。",
        }),
        examQuestion(id, 3, 3, 4, {
          topic: "line-integrals",
          genre: "スカラー線積分",
          difficulty: 3,
          format: "text",
          prompt: "同じ曲線Cに沿う \\(\\int_C(x^2+y^2)\\,ds\\) を、前2問の結果を使って求めよ。",
          answer: "\\(" + helixScalarIntegralCoefficient + "\\pi\\sqrt{" + helixSpeedSquared + "}\\)",
          accepted: [helixScalarIntegralCoefficient + "pi sqrt(" + helixSpeedSquared + ")"],
          keywords: [String(helixScalarIntegralCoefficient), String(helixSpeedSquared)],
          minKeywords: 2,
          formula: "\\int_C\\phi\\,ds=\\int_a^b\\phi(\\mathbf r(t))|\\mathbf r'(t)|\\,dt",
          steps: [
            "曲線上では \\(x^2+y^2=" + helixA ** 2 + "(\\cos^2t+\\sin^2t)=" + helixA ** 2 + "\\)",
            "前問までより \\(ds=\\sqrt{" + helixSpeedSquared + "}\\,dt\\)",
            "\\(\\int_0^{2\\pi}" + helixA ** 2 + "\\sqrt{" + helixSpeedSquared + "}\\,dt="
              + helixScalarIntegralCoefficient + "\\pi\\sqrt{" + helixSpeedSquared + "}\\)",
          ],
          explanation: "スカラー場の値と曲線の速さを同時に代入する。別の曲線を解くのではなく、接ベクトルと弧長の計算を線積分へ接続する構成である。",
        }),
      ],
    },
    {
      number: 4,
      title: "パラメータ曲面・面積分",
      topic: "surfaces",
      topicIds: ["surfaces", "surface-integrals"],
      points: 14,
      context:
        "\\(\\mathbf r(u,v)=(u,v," + surfaceP + "u-" + surfaceQ + "v),\\ 0\\le u\\le"
        + surfaceUSpan + ",\\ 0\\le v\\le" + surfaceVSpan + "\\) が表す曲面Sを考える。",
      questions: [
        examQuestion(id, 4, 1, 4, {
          topic: "surfaces",
          genre: "偏微分ベクトルと単位法線",
          difficulty: 2,
          format: "text",
          prompt: "\\(\\mathbf r_u\\)、\\(\\mathbf r_v\\)、\\(\\mathbf r_u\\times\\mathbf r_v\\) と、z成分が正の単位法線を求めよ。",
          answer:
            "\\(\\mathbf r_u=(1,0," + surfaceP + ")\\)、\\(\\mathbf r_v=(0,1,-" + surfaceQ
            + ")\\)、\\(\\mathbf r_u\\times\\mathbf r_v=(-" + surfaceP + "," + surfaceQ
            + ",1)\\)、\\(\\mathbf n=\\frac{1}{\\sqrt{" + surfaceNormSquared + "}}(-"
            + surfaceP + "," + surfaceQ + ",1)\\)",
          accepted: [
            "(1,0," + surfaceP + "),(0,1,-" + surfaceQ + "),(-" + surfaceP + "," + surfaceQ
              + ",1)/sqrt(" + surfaceNormSquared + ")",
          ],
          keywords: [String(surfaceP), String(surfaceQ), String(surfaceNormSquared)],
          minKeywords: 3,
          formula: "\\mathbf n=\\frac{\\mathbf r_u\\times\\mathbf r_v}{|\\mathbf r_u\\times\\mathbf r_v|}",
          steps: [
            "u、vで偏微分して \\(\\mathbf r_u=(1,0," + surfaceP + ")\\)、\\(\\mathbf r_v=(0,1,-" + surfaceQ + ")\\)",
            "外積は \\(\\mathbf r_u\\times\\mathbf r_v=(-" + surfaceP + "," + surfaceQ + ",1)\\)",
            "大きさ \\(\\sqrt{" + surfaceNormSquared + "}\\) で割り、z成分が正の向きを選ぶ",
          ],
          explanation: "曲面の接ベクトル2本の外積が法線と面積要素を同時に与える。後の2問でも同じ外積を使う。",
        }),
        examQuestion(id, 4, 2, 6, {
          topic: "surfaces",
          genre: "幾何学的表面積",
          difficulty: 2,
          format: "text",
          prompt: "前問の外積を用いて、曲面Sの幾何学的表面積を求めよ。",
          answer: "\\(" + surfaceDomainArea + "\\sqrt{" + surfaceNormSquared + "}\\)",
          accepted: [surfaceDomainArea + "sqrt(" + surfaceNormSquared + ")", surfaceDomainArea + "√" + surfaceNormSquared],
          keywords: [String(surfaceDomainArea), String(surfaceNormSquared)],
          minKeywords: 2,
          formula: "S=\\iint_D|\\mathbf r_u\\times\\mathbf r_v|\\,du\\,dv",
          steps: [
            "前問より \\(|\\mathbf r_u\\times\\mathbf r_v|=\\sqrt{" + surfaceNormSquared + "}\\)",
            "uv平面上の長方形の面積は \\(" + surfaceUSpan + "\\times" + surfaceVSpan + "=" + surfaceDomainArea + "\\)",
            "\\(S=" + surfaceDomainArea + "\\sqrt{" + surfaceNormSquared + "}\\)",
          ],
          explanation: "外積の大きさが一定なので、パラメータ領域の面積との積になる。これは投影面積ではなく曲面そのものの面積である。",
        }),
        examQuestion(id, 4, 3, 4, {
          topic: "surface-integrals",
          genre: "流束面積分",
          difficulty: 3,
          format: "number",
          prompt: "同じ曲面S上で \\(\\mathbf F=(z,0,-4x)\\) とする。前問の向き付き外積を使い、z成分が正の向きの流束を求めよ。",
          answer: String(surfaceFlux),
          numericAnswer: surfaceFlux,
          formula: "\\int_S\\mathbf F\\cdot\\mathbf n\\,dS=\\iint_D\\mathbf F(\\mathbf r)\\cdot(\\mathbf r_u\\times\\mathbf r_v)\\,du\\,dv",
          steps: [
            "\\(\\mathbf F(\\mathbf r)=(" + surfaceP + "u-" + surfaceQ + "v,0,-4u)\\)",
            "前問の外積との内積は \\(-(" + surfaceP ** 2 + "+4)u+" + surfaceP * surfaceQ + "v\\)",
            "\\(\\int_0^{" + surfaceVSpan + "}\\int_0^{" + surfaceUSpan + "}[-(" + surfaceP ** 2
              + "+4)u+" + surfaceP * surfaceQ + "v]\\,du\\,dv=" + surfaceFlux + "\\)",
          ],
          explanation: "単位法線と面積要素を別々に作らず、向き付き外積をそのまま使う。前2問の法線計算を流束へつなげる範囲内の面積分である。",
        }),
      ],
    },
    {
      number: 5,
      title: "勾配・方向微分・勾配場の線積分",
      topic: "gradient",
      topicIds: ["gradient", "line-integrals"],
      points: 14,
      context:
        "\\(\\phi(x,y,z)=x^2+" + gradientC + "y^2+z^2\\)、\\(P=(1,1,1)\\)、\\(\\mathbf d=(1,1,0)\\) とする。",
      questions: [
        examQuestion(id, 5, 1, 4, {
          topic: "gradient",
          genre: "勾配",
          difficulty: 2,
          format: "text",
          prompt: "\\(\\nabla\\phi\\) と \\(\\nabla\\phi(P)\\) を求めよ。",
          answer:
            "\\(\\nabla\\phi=(2x," + 2 * gradientC + "y,2z)\\)、\\(\\nabla\\phi(P)=("
            + gradientAtPoint.join(",") + ")\\)",
          accepted: ["(2x," + 2 * gradientC + "y,2z),(" + gradientAtPoint.join(",") + ")"],
          keywords: ["2x", 2 * gradientC + "y", "2z"],
          minKeywords: 3,
          formula: "\\nabla\\phi=(\\phi_x,\\phi_y,\\phi_z)",
          steps: [
            "x、y、zで偏微分する",
            "\\(\\nabla\\phi=(2x," + 2 * gradientC + "y,2z)\\)",
            "点Pを代入して \\(\\nabla\\phi(P)=(" + gradientAtPoint.join(",") + ")\\)",
          ],
          explanation: "勾配は各座標方向の偏微分を並べたベクトルで、方向微分と最大増加方向の共通の出発点になる。",
        }),
        examQuestion(id, 5, 2, 3, {
          topic: "gradient",
          genre: "方向微分",
          difficulty: 2,
          format: "text",
          prompt: "前問を用い、点Pにおける \\(\\mathbf d\\) 方向の方向微分を求めよ。ただし、方向ベクトルを先に単位化すること。",
          answer:
            "\\(\\mathbf e=\\frac{1}{\\sqrt2}(1,1,0)\\)、\\(D_{\\mathbf e}\\phi(P)=\\frac{"
            + directionalNumerator + "}{\\sqrt2}\\)",
          accepted: ["(1,1,0)/sqrt2," + directionalNumerator + "/sqrt2"],
          keywords: [String(directionalNumerator), "sqrt2"],
          minKeywords: 2,
          formula: "D_{\\mathbf e}\\phi=\\nabla\\phi\\cdot\\mathbf e",
          steps: [
            "\\(|\\mathbf d|=\\sqrt2\\) なので \\(\\mathbf e=\\frac{1}{\\sqrt2}(1,1,0)\\)",
            "前問の \\(\\nabla\\phi(P)=(" + gradientAtPoint.join(",") + ")\\) と内積を取る",
            "\\(D_{\\mathbf e}\\phi(P)=\\frac{" + directionalNumerator + "}{\\sqrt2}\\)",
          ],
          explanation: "方向微分の式へ入れるのは単位ベクトルである。与えられた方向をそのまま使うと \\(\\sqrt2\\) 倍ずれる。",
        }),
        examQuestion(id, 5, 3, 3, {
          topic: "gradient",
          genre: "最大方向微分",
          difficulty: 3,
          format: "text",
          prompt: "点Pで方向微分が最大となる単位方向と、その最大値を求めよ。",
          answer:
            "方向 \\(\\frac{1}{\\sqrt{" + gradientNormSquared + "}}(" + gradientAtPoint.join(",")
            + ")\\)、最大値 \\(\\sqrt{" + gradientNormSquared + "}\\)",
          accepted: [
            "(" + gradientAtPoint.join(",") + ")/sqrt(" + gradientNormSquared + "),sqrt(" + gradientNormSquared + ")",
          ],
          keywords: [String(gradientNormSquared), ...gradientAtPoint.map(String)],
          minKeywords: 4,
          formula: "\\max_{|\\mathbf e|=1}D_{\\mathbf e}\\phi=|\\nabla\\phi|",
          steps: [
            "方向微分は \\(\\nabla\\phi(P)\\cdot\\mathbf e\\) なので、内積は同方向で最大になる",
            "\\(|\\nabla\\phi(P)|=\\sqrt{" + gradientNormSquared + "}\\)",
            "勾配を正規化して \\(\\mathbf e_{\\max}=\\frac{1}{\\sqrt{" + gradientNormSquared + "}}("
              + gradientAtPoint.join(",") + ")\\)",
          ],
          explanation: "コーシー・シュワルツの等号成立条件により、勾配と同方向の単位ベクトルで方向微分が最大になる。",
        }),
        examQuestion(id, 5, 4, 4, {
          topic: "line-integrals",
          genre: "勾配場の線積分",
          difficulty: 3,
          format: "number",
          prompt:
            "曲線 \\(C:\\mathbf c(s)=(s,s,s),\\ 0\\le s\\le1\\) に沿う \\(\\int_C\\nabla\\phi\\cdot d\\mathbf r\\) を直接計算し、端点差とも一致することを示せ。",
          answer: String(gradientLineIntegral),
          numericAnswer: gradientLineIntegral,
          formula: "\\int_C\\nabla\\phi\\cdot d\\mathbf r=\\int_0^1\\nabla\\phi(\\mathbf c(s))\\cdot\\mathbf c'(s)\\,ds",
          steps: [
            "\\(\\nabla\\phi(\\mathbf c(s))=(2s," + 2 * gradientC + "s,2s)\\)、\\(\\mathbf c'(s)=(1,1,1)\\)",
            "内積は \\(" + 2 * (gradientC + 2) + "s\\) なので、\\(\\int_0^1" + 2 * (gradientC + 2) + "s\\,ds="
              + gradientLineIntegral + "\\)",
            "\\(\\phi(1,1,1)-\\phi(0,0,0)=" + gradientLineIntegral + "\\) でも同じ値になる",
          ],
          explanation: "直接のパラメータ積分と勾配定理を両方使い、計算を相互確認する。経路によらず端点だけで決まることも確認できる。",
        }),
      ],
    },
    {
      number: 6,
      title: "発散・回転・線積分・Greenの定理",
      topic: "divergence-curl",
      topicIds: ["divergence-curl", "line-integrals", "green-theorem"],
      points: 12,
      context:
        "\\(\\mathbf F=(" + fieldA + "x-" + fieldB + "y," + fieldB + "x+" + fieldA + "y,"
        + fieldC + "z)\\) とし、xy成分を \\(P=" + fieldA + "x-" + fieldB + "y\\)、\\(Q="
        + fieldB + "x+" + fieldA + "y\\) と書く。",
      questions: [
        examQuestion(id, 6, 1, 3, {
          topic: "divergence-curl",
          genre: "発散",
          difficulty: 2,
          format: "number",
          prompt: "\\(\\nabla\\cdot\\mathbf F\\) を求め、各偏微分の和を示せ。",
          answer: String(divergence),
          numericAnswer: divergence,
          formula: "\\nabla\\cdot\\mathbf F=\\partial_xF_x+\\partial_yF_y+\\partial_zF_z",
          steps: [
            "\\(\\partial_xF_x=" + fieldA + "\\)",
            "\\(\\partial_yF_y=" + fieldA + "\\)、\\(\\partial_zF_z=" + fieldC + "\\)",
            "\\(\\nabla\\cdot\\mathbf F=" + fieldA + "+" + fieldA + "+" + fieldC + "=" + divergence + "\\)",
          ],
          explanation: "発散では各成分を対応する座標で偏微分して加える。交差する変数の項はこの計算には入らない。",
        }),
        examQuestion(id, 6, 2, 3, {
          topic: "divergence-curl",
          genre: "回転",
          difficulty: 2,
          format: "text",
          prompt: "\\(\\nabla\\times\\mathbf F\\) を求め、どの軸まわりの回転成分が残るか答えよ。",
          answer: "\\((0,0," + curlZ + ")\\)、z軸まわり",
          accepted: ["(0,0," + curlZ + "),z"],
          keywords: ["0", String(curlZ), "z"],
          minKeywords: 3,
          formula: "\\nabla\\times\\mathbf F=(\\partial_yF_z-\\partial_zF_y,\\ \\partial_zF_x-\\partial_xF_z,\\ \\partial_xF_y-\\partial_yF_x)",
          steps: [
            "x成分とy成分は、zとの交差偏微分がすべて0なので0",
            "z成分は \\(\\partial_xQ-\\partial_yP=" + fieldB + "-(-" + fieldB + ")=" + curlZ + "\\)",
            "したがって \\(\\nabla\\times\\mathbf F=(0,0," + curlZ + ")\\) で、z軸まわりの成分が残る",
          ],
          explanation: "回転のz成分は平面場の \\(Q_x-P_y\\) と一致し、後のGreenの定理へそのままつながる。",
        }),
        examQuestion(id, 6, 3, 3, {
          topic: "line-integrals",
          genre: "閉曲線の線積分",
          difficulty: 3,
          format: "number",
          prompt:
            "半径 \\(" + greenRadius + "\\) の円Cを反時計回りに \\(\\mathbf c(t)=(" + greenRadius
            + "\\cos t," + greenRadius + "\\sin t)\\)、\\(0\\le t\\le2\\pi\\) と表す。\\(\\oint_C(Pdx+Qdy)\\) を直接計算し、\\(\\pi\\) の係数で答えよ。",
          answer: "\\(" + circulationCoefficient + "\\pi\\)（係数" + circulationCoefficient + "）",
          numericAnswer: circulationCoefficient,
          formula: "\\int_C(P\\,dx+Q\\,dy)=\\int_a^b\\{P(\\mathbf c(t))x'(t)+Q(\\mathbf c(t))y'(t)\\}\\,dt",
          steps: [
            "\\(dx=-" + greenRadius + "\\sin t\\,dt\\)、\\(dy=" + greenRadius + "\\cos t\\,dt\\)",
            "代入すると " + fieldA + " を含む項は打ち消し合い、被積分関数は \\("
              + fieldB * greenRadius ** 2 + "\\)",
            "\\(\\int_0^{2\\pi}" + fieldB * greenRadius ** 2 + "\\,dt=" + circulationCoefficient + "\\pi\\)",
          ],
          explanation: "閉曲線を直接パラメータ化する計算である。回転に寄与する係数だけが残り、放射状の成分は一周で相殺される。",
        }),
        examQuestion(id, 6, 4, 3, {
          topic: "green-theorem",
          genre: "Greenの定理",
          difficulty: 3,
          format: "number",
          prompt: "グリーンの定理の使用条件（曲線の向きと関数の条件）を述べたうえで、前問と同じ線積分を二重積分へ直し、前問の値と一致することを確認せよ。答えは \\(\\pi\\) の係数で入力すること。",
          answer: "\\(" + circulationCoefficient + "\\pi\\)（係数" + circulationCoefficient + "）",
          numericAnswer: circulationCoefficient,
          formula: "\\oint_C(P\\,dx+Q\\,dy)=\\iint_D(Q_x-P_y)\\,dA",
          steps: [
            "Cは反時計回りの単純閉曲線で、P、Qと必要な偏導関数は領域上で連続なのでグリーンの定理を適用できる",
            "第(2)問と同じく \\(Q_x-P_y=" + fieldB + "-(-" + fieldB + ")=" + curlZ + "\\)",
            "円の面積は \\(" + greenRadius ** 2 + "\\pi\\)",
            "\\(\\iint_D" + curlZ + "\\,dA=" + curlZ + "\\cdot" + greenRadius ** 2 + "\\pi="
              + circulationCoefficient + "\\pi\\) で前問と一致する",
          ],
          explanation: "反時計回りの単純閉曲線、領域上での連続偏導関数という使用条件まで答案へ書く。回転のz成分、直接線積分、Greenの定理を一続きで照合する問題である。",
        }),
      ],
    },
  ];

  const questions = sections.flatMap((section) => section.questions);
  const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);
  const easyCount = questions.filter((question) => question.difficulty === 1).length;
  const advancedCount = questions.filter((question) => question.difficulty === 3).length;
  if (sections.length !== 6 || questions.length !== 19 || totalPoints !== 80) {
    throw new Error(id + ": invalid exam blueprint");
  }
  if (easyCount > 2 || advancedCount < 5) {
    throw new Error(id + ": invalid difficulty balance");
  }
  const coveredTopics = new Set(sections.flatMap((section) => section.topicIds));
  const questionTopics = new Set(questions.map((question) => question.topic));
  if (APPLIED_MATH_TOPICS.some((topic) => !coveredTopics.has(topic.id) || !questionTopics.has(topic.id))) {
    throw new Error(id + ": missing range topic");
  }

  return {
    id,
    number: variant,
    title: "全範囲予想 " + String(variant).padStart(2, "0"),
    subtitle: "応用数学・全27枚範囲・形式1/2/3の記述構成に準拠",
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

/** 予想模試と同じ連続計算・途中式量を通常演習にも供給する実戦プール。 */
export const APPLIED_MATH_EXAM_LEVEL_QUESTIONS: AppliedMathQuestion[] = APPLIED_MATH_EXPECTED_EXAMS
  .flatMap((exam) =>
    exam.sections.flatMap((section) =>
      section.questions
        .map((question, index) => {
          const previousPrompts = section.questions
            .slice(0, index)
            .map((previous) => `大問${previous.major}(${previous.sub})：${previous.prompt}`)
            .join(" ／ ");
          return {
            ...question,
            context: [
              section.context,
              question.context,
              previousPrompts ? `【同じ大問の前問】${previousPrompts}` : "",
            ]
              .filter(Boolean)
              .join("\n"),
            prompt: `${question.prompt} 必要な中間量は、GIVENの条件から自分で導出すること。`,
          };
        })
        .filter((question) => question.difficulty >= 2),
    ),
  );

/** 模試の各大問を、前問を省略しない一続きの本番型問題として出すプール。 */
const APPLIED_MATH_EXPECTED_PRINT_LEVEL_QUESTIONS: AppliedMathQuestion[] =
  APPLIED_MATH_EXPECTED_EXAMS.flatMap((exam) =>
    exam.sections.map((section) => {
      const finalQuestion = section.questions.at(-1)!;
      const allPrompts = section.questions
        .map((question) => `(${question.sub}) ${question.prompt}`)
        .join("\n");
      const allSteps = section.questions.flatMap((question) => [
        `(${question.sub}) ${question.genre}`,
        ...question.steps.map((step) => `(${question.sub}) ${step}`),
      ]);
      const fullExplanation = section.questions
        .map((question) => `(${question.sub}) 正解：${question.answer}。${question.explanation}`)
        .join("\n");

      return {
        ...finalQuestion,
        id: `${exam.id}-major-${section.number}-complete`,
        difficulty: 3,
        genre: `${section.title}・大問完答`,
        context: section.context,
        prompt: `次の大問を最初から解き、途中式・中間量を残して最終設問まで答えよ。\n${allPrompts}\n解答欄には最終設問(${finalQuestion.sub})の答えを入力すること。`,
        steps: allSteps,
        explanation: fullExplanation,
        sourcePages: [...new Set(section.questions.flatMap((question) => question.sourcePages))],
      } satisfies AppliedMathQuestion;
    }),
  );

export const APPLIED_MATH_RANGE2_PRINT_LEVEL_QUESTIONS: AppliedMathQuestion[] = [
  courseQuestion({
    id: "am-range2-print-scalar-line-integrals",
    topic: "line-integrals",
    genre: "追加範囲2・第13回線積分大問",
    difficulty: 3,
    format: "text",
    context: "\\(C_1:\\mathbf r(t)=(\\cos t,\\sin t,1),0\\le t\\le\\pi\\)、\\(C_2:\\mathbf r(t)=(\\cos t,\\sin t,t),0\\le t\\le\\frac{\\pi}{2}\\) とする。",
    prompt: "次を順に計算せよ。(1) \\(C_1\\) 上の \\(\\int_C(x^2+z)ds\\) と \\(\\int_C(x^2+z)dx\\)。(2) \\(C_2\\) 上の \\(\\int_C(x+y^2)ds\\) と \\(\\int_C(x+y^2)dy\\)。解答欄には最後の積分値を入力すること。",
    answer: "\\(\\frac{\\pi}{4}+\\frac13\\)",
    accepted: ["pi/4+1/3", "π/4+1/3"],
    keywords: ["4", "1", "3"],
    minKeywords: 3,
    formula: "\\int_C\\phi\\,ds=\\int_a^b\\phi(\\mathbf r(t))|\\mathbf r'(t)|dt",
    steps: [
      "\\(C_1\\) では \\(|\\mathbf r'|=1\\) より \\(\\int_C(x^2+z)ds=\\frac{3\\pi}{2}\\)",
      "\\(dx=-\\sin tdt\\) より \\(\\int_C(x^2+z)dx=-\\frac83\\)",
      "\\(C_2\\) では \\(|\\mathbf r'|=\\sqrt2\\) より \\(\\int_C(x+y^2)ds=\\sqrt2(1+\\frac{\\pi}{4})\\)",
      "\\(dy=\\cos tdt\\) より \\(\\int_C(x+y^2)dy=\\frac{\\pi}{4}+\\frac13\\)",
    ],
    explanation: "ds型では速さを掛け、dx・dy型では対応する座標成分の導関数を掛ける。4問を並べて違いを確認する第13回演習そのままの構成。",
  }),
  courseQuestion({
    id: "am-range2-print-path-composition",
    topic: "line-integrals",
    genre: "追加範囲2・経路反転と結合",
    difficulty: 3,
    format: "number",
    context: "\\(C_1:\\mathbf r(t)=(t,0,0),-3\\le t\\le3\\)、\\(C_2:\\mathbf r(t)=(3\\cos t,3\\sin t,0),0\\le t\\le\\pi\\)、\\(\\mathbf a=(x^2,y,-z)\\) とする。",
    prompt: "(1) \\(\\int_{C_1}\\mathbf a\\cdot d\\mathbf r\\) を求め、向きを反転した値を答えよ。(2) \\(\\int_{C_2}\\mathbf a\\cdot d\\mathbf r\\) を求め、最後に \\(\\int_{C_1+C_2}\\mathbf a\\cdot d\\mathbf r\\) を求めよ。解答欄には結合経路の値を入力すること。",
    answer: "0",
    numericAnswer: 0,
    formula: "\\int_{C_1+C_2}\\mathbf a\\cdot d\\mathbf r=\\int_{C_1}\\mathbf a\\cdot d\\mathbf r+\\int_{C_2}\\mathbf a\\cdot d\\mathbf r",
    steps: [
      "\\(\\int_{C_1}t^2dt=18\\)、逆向きでは \\(-18\\)",
      "\\(C_2\\) では内積が \\(-27\\cos^2t\\sin t+9\\sin t\\cos t\\)",
      "\\(\\int_{C_2}\\mathbf a\\cdot d\\mathbf r=-18\\)",
      "結合経路では \\(18+(-18)=0\\)",
    ],
    explanation: "向きを反転すると符号が変わり、経路を結合すると各区間の積分を足す。経路法則と実積分を同時に使う。",
  }),
  courseQuestion({
    id: "am-range2-print-paraboloid-area",
    topic: "surfaces",
    genre: "追加範囲2・基本問題問4",
    difficulty: 3,
    format: "text",
    context: "\\(\\mathbf r(u,v)=(u\\cos v,u\\sin v,u^2)\\)、\\(0\\le u\\le1,0\\le v\\le2\\pi\\) が表す曲面Sを考える。",
    prompt: "(1) \\(\\mathbf r_u\\)、\\(\\mathbf r_v\\)、\\(\\mathbf r_u\\times\\mathbf r_v\\) を求めよ。(2) 外積の大きさを求めよ。(3) 曲面Sの面積を求めよ。解答欄には(3)を入力すること。",
    answer: "\\(\\frac{\\pi}{6}(5\\sqrt5-1)\\)",
    accepted: ["pi(5sqrt5-1)/6", "π(5√5-1)/6"],
    keywords: ["5", "1", "6"],
    minKeywords: 3,
    formula: "S=\\iint_D|\\mathbf r_u\\times\\mathbf r_v|\\,du\\,dv",
    steps: [
      "\\(\\mathbf r_u=(\\cos v,\\sin v,2u)\\)、\\(\\mathbf r_v=(-u\\sin v,u\\cos v,0)\\)",
      "\\(\\mathbf r_u\\times\\mathbf r_v=(-2u^2\\cos v,-2u^2\\sin v,u)\\)",
      "\\(|\\mathbf r_u\\times\\mathbf r_v|=u\\sqrt{4u^2+1}\\)",
      "\\(2\\pi\\int_0^1u\\sqrt{4u^2+1}du=\\frac{\\pi}{6}(5\\sqrt5-1)\\)",
    ],
    explanation: "高画質版で第三成分はu²と確定した。接ベクトル、外積、面積拡大率、二重積分を省略せずにつなぐ基本問題問4。",
  }),
  courseQuestion({
    id: "am-range2-print-green-proof-and-calculation",
    topic: "green-theorem",
    genre: "追加範囲2・第14回Green大問",
    difficulty: 3,
    format: "number",
    context: "Cは領域Dを左側に見ながら反時計回りに一周する単純閉曲線とする。",
    prompt: "(1) グリーンの定理の使用条件と、Pdx項・Qdy項を別々に二重積分へ直す2式を書け。(2) 単位正方形で \\(P=x^2+2y^2,Q=xy^2\\) の線積分を求めよ。(3) 半径2の円で \\(P=x-y,Q=x+y\\) の線積分を求めよ。解答欄には(3)の \\(\\pi\\) の係数を入力すること。",
    answer: "\\(8\\pi\\)（係数8）",
    numericAnswer: 8,
    formula: "\\oint_C(P\\,dx+Q\\,dy)=\\iint_D(Q_x-P_y)\\,dA",
    steps: [
      "単純閉曲線の正向きと、P、Qの連続偏導関数を確認する",
      "\\(\\oint_C Pdx=-\\iint_D P_y dA\\)、\\(\\oint_C Qdy=\\iint_D Q_xdA\\)",
      "正方形では \\(Q_x-P_y=y^2-4y\\) より \\(-\\frac53\\)",
      "円では \\(Q_x-P_y=2\\)、面積 \\(4\\pi\\) より \\(8\\pi\\)",
    ],
    explanation: "第14回の証明と2つの演習を一続きにした問題。Pdx側の負号、正向き、円の面積をまとめて確認する。",
  }),
];

export const APPLIED_MATH_PRINT_LEVEL_QUESTIONS: AppliedMathQuestion[] = [
  ...APPLIED_MATH_EXPECTED_PRINT_LEVEL_QUESTIONS,
  ...APPLIED_MATH_RANGE2_PRINT_LEVEL_QUESTIONS,
];
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
  sourcePolicy: "問題内容は当初範囲16画像・追加範囲6画像・追加範囲2の5画像、全27画像だけを使用",
} as const;
