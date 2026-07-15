export type StatisticsTopicId =
  | "descriptive"
  | "relation"
  | "counting"
  | "conditional"
  | "random-variable"
  | "continuous";

export type StatisticsTopic = {
  id: StatisticsTopicId;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
};

export type StatisticsFormulaCard = {
  id: string;
  topic: StatisticsTopicId;
  title: string;
  prompt: string;
  formula: string;
  explanation: string;
  cue: string;
  example?: string;
};

export type StatisticsQuestionFormat = "number" | "choice" | "text";

export type StatisticsQuestion = {
  id: string;
  topic: StatisticsTopicId;
  genre: string;
  difficulty: 1 | 2 | 3;
  format: StatisticsQuestionFormat;
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
};

export type StatisticsExamFormat = {
  id: string;
  title: string;
  description: string;
  strategy: string;
};

export const STATISTICS_TOPICS: StatisticsTopic[] = [
  {
    id: "descriptive",
    number: "01",
    title: "記述統計",
    shortTitle: "平均・分散",
    description: "平均、分散、標準偏差と一次変換を計算する。",
    color: "#66e39e",
  },
  {
    id: "relation",
    number: "02",
    title: "相関・回帰",
    shortTitle: "共分散・回帰直線",
    description: "共分散、相関係数、決定係数と最小二乗法を扱う。",
    color: "#55dde0",
  },
  {
    id: "counting",
    number: "03",
    title: "場合の数と確率",
    shortTitle: "順列・組合せ",
    description: "標本空間、順列、組合せ、和事象と余事象を整理する。",
    color: "#ffd65c",
  },
  {
    id: "conditional",
    number: "04",
    title: "条件付き確率",
    shortTitle: "独立・ベイズ",
    description: "乗法定理、独立、全確率とベイズの定理を使い分ける。",
    color: "#ff9f68",
  },
  {
    id: "random-variable",
    number: "05",
    title: "確率変数",
    shortTitle: "期待値・分散",
    description: "離散型確率変数の分布、期待値、分散と一次変換を求める。",
    color: "#a88bff",
  },
  {
    id: "continuous",
    number: "06",
    title: "連続分布・正規分布",
    shortTitle: "密度・標準化",
    description: "確率密度の積分、連続型の期待値、正規分布の標準化を行う。",
    color: "#7aa7ff",
  },
];

const CORE_STATISTICS_FORMULAS: StatisticsFormulaCard[] = [
  {
    id: "stats-mean",
    topic: "descriptive",
    title: "平均",
    prompt: "n個のデータの平均 x̄ は？",
    formula: "\\bar{x}=\\frac{1}{n}\\sum_{i=1}^{n}x_i",
    explanation: "全データの合計を個数で割る。度数があるときは『値×度数』の合計を総度数で割る。",
    cue: "合計 ÷ 個数",
    example: "4, 6, 8 の平均は (4+6+8)/3 = 6",
  },
  {
    id: "stats-variance",
    topic: "descriptive",
    title: "母分散",
    prompt: "データの母分散 σ² は？",
    formula: "\\sigma^2=\\frac{1}{n}\\sum_{i=1}^{n}(x_i-\\bar{x})^2",
    explanation: "平均からの偏差を二乗し、その平均を取る。母分散では n で割る。",
    cue: "偏差を二乗 → 平均",
  },
  {
    id: "stats-variance-shortcut",
    topic: "descriptive",
    title: "分散の計算公式",
    prompt: "E[X²] を使う分散の公式は？",
    formula: "V(X)=E[X^2]-\\{E[X]\\}^2",
    explanation: "二乗の期待値から期待値の二乗を引く。表から分散を出すときに速い。",
    cue: "二乗の平均 − 平均の二乗",
  },
  {
    id: "stats-standard-deviation",
    topic: "descriptive",
    title: "標準偏差",
    prompt: "分散から標準偏差を求めるには？",
    formula: "\\sigma=\\sqrt{V(X)}",
    explanation: "分散の正の平方根。元のデータと同じ単位に戻る。",
    cue: "分散にルート",
  },
  {
    id: "stats-linear-mean",
    topic: "descriptive",
    title: "一次変換の平均",
    prompt: "Y = aX + b の平均は？",
    formula: "E[Y]=aE[X]+b",
    explanation: "平均には倍率 a と平行移動 b の両方が効く。",
    cue: "平均には +b も入る",
  },
  {
    id: "stats-linear-variance",
    topic: "descriptive",
    title: "一次変換の分散",
    prompt: "Y = aX + b の分散は？",
    formula: "V(Y)=a^2V(X)",
    explanation: "定数 b はばらつきを変えず、倍率 a は二乗で効く。",
    cue: "分散は a²、b は消える",
  },
  {
    id: "stats-covariance",
    topic: "relation",
    title: "共分散",
    prompt: "X と Y の母共分散は？",
    formula: "\\sigma_{xy}=\\frac{1}{n}\\sum_{i=1}^{n}(x_i-\\bar{x})(y_i-\\bar{y})",
    explanation: "2つの偏差の積の平均。同じ向きに動けば正、逆向きなら負になる。",
    cue: "Xの偏差 × Yの偏差 の平均",
  },
  {
    id: "stats-correlation",
    topic: "relation",
    title: "相関係数",
    prompt: "ピアソンの相関係数 r は？",
    formula: "r=\\frac{\\sigma_{xy}}{\\sigma_x\\sigma_y}",
    explanation: "共分散を両変数の標準偏差で割り、−1から1の範囲に標準化する。",
    cue: "共分散 ÷ 標準偏差どうし",
  },
  {
    id: "stats-determination",
    topic: "relation",
    title: "決定係数",
    prompt: "単回帰における決定係数 R² は？",
    formula: "R^2=r^2",
    explanation: "相関係数を二乗した値。回帰直線が変動を説明する割合の目安になる。",
    cue: "相関係数を二乗",
  },
  {
    id: "stats-regression-slope",
    topic: "relation",
    title: "回帰係数",
    prompt: "ŷ = a + bx の傾き b は？",
    formula: "b=\\frac{\\sigma_{xy}}{\\sigma_x^2}",
    explanation: "XとYの共分散をXの分散で割る。分母は説明変数Xの分散。",
    cue: "共分散 ÷ Xの分散",
  },
  {
    id: "stats-regression-intercept",
    topic: "relation",
    title: "回帰直線の切片",
    prompt: "ŷ = a + bx の切片 a は？",
    formula: "a=\\bar{y}-b\\bar{x}",
    explanation: "回帰直線は必ず点 (x̄, ȳ) を通るため、この式で切片を求められる。",
    cue: "Y平均 − 傾き×X平均",
  },
  {
    id: "stats-factorial",
    topic: "counting",
    title: "階乗",
    prompt: "n! の意味は？",
    formula: "n!=n(n-1)\\cdots2\\cdot1",
    explanation: "異なるn個を一列に並べる総数。0! = 1 と定める。",
    cue: "nから1まで掛ける",
  },
  {
    id: "stats-permutation",
    topic: "counting",
    title: "順列",
    prompt: "n個からr個を選んで順に並べる数は？",
    formula: "{}_nP_r=\\frac{n!}{(n-r)!}",
    explanation: "選ぶだけでなく順番も区別する。",
    cue: "順番を区別 → P",
  },
  {
    id: "stats-combination",
    topic: "counting",
    title: "組合せ",
    prompt: "n個からr個を順不同で選ぶ数は？",
    formula: "{}_nC_r=\\frac{n!}{r!(n-r)!}",
    explanation: "順番を区別しない。nCr = nC(n−r) も使える。",
    cue: "順番を無視 → C",
  },
  {
    id: "stats-addition-rule",
    topic: "counting",
    title: "加法定理",
    prompt: "A または B が起こる確率は？",
    formula: "P(A\\cup B)=P(A)+P(B)-P(A\\cap B)",
    explanation: "共通部分を二重に足しているため、最後に1回引く。",
    cue: "足して、重なりを引く",
  },
  {
    id: "stats-complement",
    topic: "counting",
    title: "余事象",
    prompt: "Aが起こらない確率は？",
    formula: "P(A^c)=1-P(A)",
    explanation: "『少なくとも1回』は『1回も起こらない』を1から引くと速い。",
    cue: "少なくとも → 1 − 0回",
  },
  {
    id: "stats-conditional",
    topic: "conditional",
    title: "条件付き確率",
    prompt: "Bが起きた条件でAが起きる確率は？",
    formula: "P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}",
    explanation: "標本空間をBの中だけに絞る。分母は条件側B。",
    cue: "縦棒の右を分母へ",
  },
  {
    id: "stats-product-rule",
    topic: "conditional",
    title: "乗法定理",
    prompt: "AとBがともに起こる確率は？",
    formula: "P(A\\cap B)=P(A\\mid B)P(B)",
    explanation: "条件付き確率の式を変形したもの。順序を逆にしてもよい。",
    cue: "条件付き × 条件側",
  },
  {
    id: "stats-independence",
    topic: "conditional",
    title: "独立",
    prompt: "AとBが独立である条件は？",
    formula: "P(A\\cap B)=P(A)P(B)",
    explanation: "一方の発生が他方の確率を変えない。P(A|B)=P(A)とも表せる。",
    cue: "独立ならそのまま掛ける",
  },
  {
    id: "stats-total-probability",
    topic: "conditional",
    title: "全確率の公式",
    prompt: "場合分け H1,…,Hk からAの確率を求めるには？",
    formula: "P(A)=\\sum_i P(A\\mid H_i)P(H_i)",
    explanation: "原因ごとに『その原因の確率×その条件でAとなる確率』を足す。",
    cue: "枝ごとの掛け算を全部足す",
  },
  {
    id: "stats-bayes",
    topic: "conditional",
    title: "ベイズの定理",
    prompt: "結果Aから原因Hiを逆算する式は？",
    formula: "P(H_i\\mid A)=\\frac{P(A\\mid H_i)P(H_i)}{P(A)}",
    explanation: "分子はHiを通ってAに至る同時確率、分母はAとなる全経路の確率。",
    cue: "欲しい経路 ÷ 全経路",
  },
  {
    id: "stats-discrete-expectation",
    topic: "random-variable",
    title: "離散型の期待値",
    prompt: "値 xi、確率 pi の期待値は？",
    formula: "E[X]=\\sum_i x_i p_i",
    explanation: "各値にその確率を掛けた加重平均。",
    cue: "値 × 確率 を合計",
  },
  {
    id: "stats-discrete-variance",
    topic: "random-variable",
    title: "離散型の分散",
    prompt: "離散型確率変数の分散は？",
    formula: "V(X)=\\sum_i(x_i-\\mu)^2p_i",
    explanation: "平均からの偏差の二乗に確率を掛けて足す。E[X²]−μ²でも求められる。",
    cue: "偏差² × 確率",
  },
  {
    id: "stats-density-conditions",
    topic: "continuous",
    title: "確率密度の条件",
    prompt: "確率密度関数 f(x) の2条件は？",
    formula: "f(x)\\ge0,\\qquad\\int_{-\\infty}^{\\infty}f(x)\\,dx=1",
    explanation: "密度は負にならず、グラフ全体の面積は1になる。",
    cue: "0以上・全面積1",
  },
  {
    id: "stats-continuous-probability",
    topic: "continuous",
    title: "区間の確率",
    prompt: "連続型で a≤X≤b となる確率は？",
    formula: "P(a\\le X\\le b)=\\int_a^b f(x)\\,dx",
    explanation: "確率密度曲線のaからbまでの面積を積分で求める。",
    cue: "確率 = 区間の面積",
  },
  {
    id: "stats-continuous-expectation",
    topic: "continuous",
    title: "連続型の期待値",
    prompt: "連続型確率変数の期待値は？",
    formula: "E[X]=\\int_{-\\infty}^{\\infty}x f(x)\\,dx",
    explanation: "離散型のΣが積分に変わる。定義域外の密度は0として積分する。",
    cue: "x × 密度 を積分",
  },
  {
    id: "stats-continuous-variance",
    topic: "continuous",
    title: "連続型の分散",
    prompt: "連続型で E[X²] を使う分散は？",
    formula: "V(X)=\\int_{-\\infty}^{\\infty}x^2f(x)\\,dx-\\{E[X]\\}^2",
    explanation: "まずx²の期待値を積分し、平均の二乗を引く。",
    cue: "E[X²] − E[X]²",
  },
  {
    id: "stats-normal-density",
    topic: "continuous",
    title: "正規分布",
    prompt: "X∼N(μ,σ²) の確率密度は？",
    formula: "f(x)=\\frac{1}{\\sqrt{2\\pi}\\sigma}\\exp\\!\\left(-\\frac{(x-\\mu)^2}{2\\sigma^2}\\right)",
    explanation: "平均μを中心に左右対称。σが大きいほど横に広がる。",
    cue: "中心μ・広がりσ",
  },
  {
    id: "stats-standardization",
    topic: "continuous",
    title: "標準化",
    prompt: "X∼N(μ,σ²) を標準正規分布へ直すには？",
    formula: "Z=\\frac{X-\\mu}{\\sigma}",
    explanation: "平均を引いて標準偏差で割ると Z∼N(0,1) になる。",
    cue: "平均との差 ÷ 標準偏差",
  },
  {
    id: "stats-normal-symmetry",
    topic: "continuous",
    title: "標準正規分布の対称性",
    prompt: "負のz値を表から求める基本関係は？",
    formula: "P(Z\\le -z)=1-P(Z\\le z)",
    explanation: "標準正規分布は0を中心に左右対称。区間確率は累積確率の差で求める。",
    cue: "負側は1から引く",
  },
  {
    id: "stats-three-sigma",
    topic: "continuous",
    title: "3σ範囲",
    prompt: "正規分布で平均から±3σ以内に入る確率は約いくら？",
    formula: "P(\\mu-3\\sigma\\le X\\le\\mu+3\\sigma)\\approx0.997",
    explanation: "正規分布ではほぼ全体にあたる約99.7%が平均の前後3標準偏差に入る。",
    cue: "±3σで約99.7%",
  },
];

export const STATISTICS_FORMULAS: StatisticsFormulaCard[] = [
  ...CORE_STATISTICS_FORMULAS,
  ...STATISTICS_PDF34_FORMULAS,
];

function question(question: Omit<StatisticsQuestion, "source">): StatisticsQuestion {
  return { ...question, source: "course-range" };
}

const CORE_STATISTICS_QUESTIONS: StatisticsQuestion[] = [
  question({ id: "stats-q-mean", topic: "descriptive", genre: "平均", difficulty: 1, format: "number", prompt: "データ 4, 6, 8, 10, 12 の平均を求めよ。", answer: "8", numericAnswer: 8, steps: ["合計は 40", "40÷5 = 8"], explanation: "平均はデータの合計を個数で割る。", formula: "\\bar{x}=\\frac{1}{n}\\sum_{i=1}^{n}x_i" }),
  question({ id: "stats-q-variance", topic: "descriptive", genre: "母分散", difficulty: 2, format: "number", prompt: "データ 2, 4, 6 の母分散を求めよ。小数第3位まで可。", answer: "8/3 ≒ 2.667", numericAnswer: 8 / 3, tolerance: 0.001, steps: ["平均は4", "偏差平方は4,0,4", "(4+0+4)÷3 = 8/3"], explanation: "母分散なので偏差平方和を n=3 で割る。", formula: "\\sigma^2=\\frac{1}{n}\\sum_{i=1}^{n}(x_i-\\bar{x})^2" }),
  question({ id: "stats-q-sd", topic: "descriptive", genre: "標準偏差", difficulty: 1, format: "number", prompt: "母分散が 9 のとき、標準偏差を求めよ。", answer: "3", numericAnswer: 3, steps: ["√9 = 3"], explanation: "標準偏差は分散の正の平方根。", formula: "\\sigma=\\sqrt{V(X)}" }),
  question({ id: "stats-q-linear-mean", topic: "descriptive", genre: "一次変換", difficulty: 1, format: "number", prompt: "E[X]=5、Y=3X+2 のとき E[Y] を求めよ。", answer: "17", numericAnswer: 17, steps: ["E[Y]=3E[X]+2", "3×5+2=17"], explanation: "期待値では定数項もそのまま加わる。", formula: "E[aX+b]=aE[X]+b" }),
  question({ id: "stats-q-linear-var", topic: "descriptive", genre: "一次変換", difficulty: 2, format: "number", prompt: "V(X)=4、Y=2X−1 のとき V(Y) を求めよ。", answer: "16", numericAnswer: 16, steps: ["V(Y)=2²V(X)", "4×4=16"], explanation: "分散には倍率の二乗が効き、定数−1は影響しない。", formula: "V(aX+b)=a^2V(X)" }),
  question({ id: "stats-q-divisor", topic: "descriptive", genre: "定義", difficulty: 1, format: "choice", prompt: "n個のデータを母集団そのものとして扱う母分散では、偏差平方和を何で割るか。", answer: "n", options: ["n", "n²", "√n", "2n"], steps: ["母分散の定義を確認"], explanation: "母分散は偏差平方和をデータ数 n で割る。" }),

  question({ id: "stats-q-covariance", topic: "relation", genre: "共分散", difficulty: 2, format: "number", prompt: "X=(1,2,3)、Y=(2,4,6) の母共分散を求めよ。小数第3位まで可。", answer: "4/3 ≒ 1.333", numericAnswer: 4 / 3, tolerance: 0.001, steps: ["x̄=2、ȳ=4", "偏差積は2,0,2", "(2+0+2)÷3=4/3"], explanation: "両方が同じ向きに動くため共分散は正になる。", formula: "\\sigma_{xy}=\\frac{1}{n}\\sum_{i=1}^{n}(x_i-\\bar{x})(y_i-\\bar{y})" }),
  question({ id: "stats-q-perfect-r", topic: "relation", genre: "相関係数", difficulty: 1, format: "number", prompt: "すべての点が右上がりの一直線上に完全に並ぶとき、相関係数 r はいくつか。", answer: "1", numericAnswer: 1, steps: ["完全な正の直線関係を確認"], explanation: "完全な正の相関では r=1。右下がりなら r=−1。" }),
  question({ id: "stats-q-regression-slope", topic: "relation", genre: "回帰直線", difficulty: 2, format: "number", prompt: "点 (1,3), (2,5), (3,7) を通る回帰直線の傾き b を求めよ。", answer: "2", numericAnswer: 2, steps: ["xが1増えるとyは2増える", "よって傾きは2"], explanation: "3点は y=2x+1 上に完全に並ぶ。", formula: "b=\\frac{\\sigma_{xy}}{\\sigma_x^2}" }),
  question({ id: "stats-q-regression-intercept", topic: "relation", genre: "回帰直線", difficulty: 2, format: "number", prompt: "回帰直線の傾き b=2、x̄=3、ȳ=8 のとき切片 a を求めよ。", answer: "2", numericAnswer: 2, steps: ["a=ȳ−bx̄", "8−2×3=2"], explanation: "回帰直線は (x̄,ȳ) を通る。", formula: "a=\\bar{y}-b\\bar{x}" }),
  question({ id: "stats-q-r2", topic: "relation", genre: "決定係数", difficulty: 1, format: "number", prompt: "相関係数 r=−0.8 のとき決定係数 R² を求めよ。", answer: "0.64", numericAnswer: 0.64, steps: ["R²=r²", "(−0.8)²=0.64"], explanation: "二乗するので相関係数の符号は消える。", formula: "R^2=r^2" }),
  question({ id: "stats-q-least-squares", topic: "relation", genre: "最小二乗法", difficulty: 2, format: "text", prompt: "最小二乗法では、何を最小にするよう回帰直線を決めるか。", answer: "残差の二乗和", accepted: ["残差の二乗和", "残差平方和", "誤差の二乗和"], keywords: ["残差", "二乗", "和"], minKeywords: 2, steps: ["観測値と予測値の差が残差", "その二乗を全点で足す"], explanation: "正負の残差が打ち消し合わないよう二乗し、その合計を最小にする。" }),

  question({ id: "stats-q-factorial", topic: "counting", genre: "階乗", difficulty: 1, format: "number", prompt: "5! を求めよ。", answer: "120", numericAnswer: 120, steps: ["5×4×3×2×1", "=120"], explanation: "5個の異なるものを一列に並べる総数でもある。" }),
  question({ id: "stats-q-permutation", topic: "counting", genre: "順列", difficulty: 1, format: "number", prompt: "7個から3個を選んで順に並べる方法は何通りか。", answer: "210通り", numericAnswer: 210, steps: ["7P3=7×6×5", "=210"], explanation: "順番を区別するので組合せではなく順列。", formula: "{}_nP_r=\\frac{n!}{(n-r)!}" }),
  question({ id: "stats-q-combination", topic: "counting", genre: "組合せ", difficulty: 1, format: "number", prompt: "8人から2人を選ぶ方法は何通りか。", answer: "28通り", numericAnswer: 28, steps: ["8C2=(8×7)/(2×1)", "=28"], explanation: "選ばれた2人の順番は区別しない。", formula: "{}_nC_r=\\frac{n!}{r!(n-r)!}" }),
  question({ id: "stats-q-two-dice", topic: "counting", genre: "確率", difficulty: 2, format: "number", prompt: "公平な2個のサイコロを投げ、出目の和が7になる確率を求めよ。", answer: "1/6 ≒ 0.1667", numericAnswer: 1 / 6, tolerance: 0.0001, steps: ["全事象は36通り", "和7は6通り", "6/36=1/6"], explanation: "(1,6)から(6,1)まで6組ある。" }),
  question({ id: "stats-q-at-least-head", topic: "counting", genre: "余事象", difficulty: 2, format: "number", prompt: "公平なコインを3回投げ、少なくとも1回表が出る確率を求めよ。", answer: "7/8 = 0.875", numericAnswer: 7 / 8, steps: ["1回も表が出ない確率は(1/2)³=1/8", "1−1/8=7/8"], explanation: "『少なくとも』は余事象を使うと一度で求められる。", formula: "1-P(X=0)" }),
  question({ id: "stats-q-addition", topic: "counting", genre: "加法定理", difficulty: 2, format: "number", prompt: "P(A)=0.4、P(B)=0.5、P(A∩B)=0.2 のとき P(A∪B) を求めよ。", answer: "0.7", numericAnswer: 0.7, steps: ["0.4+0.5−0.2", "=0.7"], explanation: "共通部分を二重に数えた分だけ引く。", formula: "P(A\\cup B)=P(A)+P(B)-P(A\\cap B)" }),
  question({ id: "stats-q-sample-space", topic: "counting", genre: "標本空間", difficulty: 1, format: "number", prompt: "コインを4回投げるとき、表裏の並びは全部で何通りか。", answer: "16通り", numericAnswer: 16, steps: ["各回2通り", "2⁴=16"], explanation: "4回それぞれに表・裏の2通りがある。" }),

  question({ id: "stats-q-conditional", topic: "conditional", genre: "条件付き確率", difficulty: 1, format: "number", prompt: "P(A∩B)=0.12、P(B)=0.30 のとき P(A|B) を求めよ。", answer: "0.4", numericAnswer: 0.4, steps: ["0.12÷0.30", "=0.4"], explanation: "条件側Bの確率を分母に置く。", formula: "P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}" }),
  question({ id: "stats-q-product", topic: "conditional", genre: "乗法定理", difficulty: 1, format: "number", prompt: "P(A|B)=0.6、P(B)=0.5 のとき P(A∩B) を求めよ。", answer: "0.3", numericAnswer: 0.3, steps: ["0.6×0.5", "=0.3"], explanation: "条件付き確率と条件側の確率を掛ける。", formula: "P(A\\cap B)=P(A\\mid B)P(B)" }),
  question({ id: "stats-q-independent", topic: "conditional", genre: "独立", difficulty: 1, format: "number", prompt: "AとBが独立で P(A)=0.4、P(B)=0.5 のとき P(A∩B) を求めよ。", answer: "0.2", numericAnswer: 0.2, steps: ["独立なので0.4×0.5", "=0.2"], explanation: "独立なら積事象の確率は各確率の積。", formula: "P(A\\cap B)=P(A)P(B)" }),
  question({ id: "stats-q-total", topic: "conditional", genre: "全確率", difficulty: 2, format: "number", prompt: "製品の60%を機械A、40%を機械Bが作る。Aの不良率2%、Bの不良率5%のとき、無作為に選んだ製品が不良である確率を求めよ。", answer: "0.032（3.2%）", numericAnswer: 0.032, tolerance: 0.00001, steps: ["A経路:0.6×0.02=0.012", "B経路:0.4×0.05=0.020", "合計0.032"], explanation: "原因ごとの経路確率を足す。", formula: "P(D)=\\sum_iP(D\\mid H_i)P(H_i)" }),
  question({ id: "stats-q-bayes-machine", topic: "conditional", genre: "ベイズ", difficulty: 3, format: "number", prompt: "前問と同じ条件で、不良品が機械A製である確率を求めよ。小数第3位まで可。", context: "機械A:生産60%・不良率2%、機械B:生産40%・不良率5%", answer: "0.375（37.5%）", numericAnswer: 0.375, steps: ["Aかつ不良=0.6×0.02=0.012", "不良全体=0.032", "0.012÷0.032=0.375"], explanation: "分子は目的のA経路、分母は不良になる全経路。", formula: "P(A\\mid D)=\\frac{P(D\\mid A)P(A)}{P(D)}" }),
  question({ id: "stats-q-bayes-test", topic: "conditional", genre: "ベイズ", difficulty: 3, format: "number", prompt: "有病率1%、感度95%、偽陽性率5%の検査で陽性だった。実際に病気である確率を求めよ。小数第3位まで可。", answer: "約0.161（16.1%）", numericAnswer: 0.0095 / 0.059, tolerance: 0.001, steps: ["病気かつ陽性=0.01×0.95=0.0095", "健康かつ陽性=0.99×0.05=0.0495", "0.0095÷(0.0095+0.0495)≈0.161"], explanation: "感度が高くても、有病率が低いと偽陽性の人数が無視できない。", formula: "P(D\\mid +)=\\frac{P(+\\mid D)P(D)}{P(+)}" }),
  question({ id: "stats-q-independent-definition", topic: "conditional", genre: "独立", difficulty: 2, format: "text", prompt: "事象AとBが独立であることを、積事象の確率を使って式で答えよ。", answer: "P(A∩B)=P(A)P(B)", accepted: ["p(a∩b)=p(a)p(b)", "p(aかつb)=p(a)p(b)"], keywords: ["p(a∩b)", "p(a)", "p(b)"], minKeywords: 3, steps: ["独立なら一方を知っても他方の確率は変わらない"], explanation: "同値な表現としてP(A|B)=P(A)もある。" }),

  question({ id: "stats-q-expectation", topic: "random-variable", genre: "期待値", difficulty: 1, format: "number", prompt: "Xが0,1,2を確率0.2,0.5,0.3で取るとき E[X] を求めよ。", answer: "1.1", numericAnswer: 1.1, steps: ["0×0.2+1×0.5+2×0.3", "=1.1"], explanation: "値に確率を掛けた加重平均。", formula: "E[X]=\\sum_i x_i p_i" }),
  question({ id: "stats-q-discrete-var", topic: "random-variable", genre: "分散", difficulty: 2, format: "number", prompt: "Xが0,1,2を確率0.2,0.5,0.3で取るとき V(X) を求めよ。", answer: "0.49", numericAnswer: 0.49, steps: ["E[X]=1.1", "E[X²]=0+0.5+4×0.3=1.7", "1.7−1.1²=0.49"], explanation: "E[X²]−E[X]² を使うと表から速く計算できる。", formula: "V(X)=E[X^2]-\\{E[X]\\}^2" }),
  question({ id: "stats-q-expectation-transform", topic: "random-variable", genre: "一次変換", difficulty: 1, format: "number", prompt: "E[X]=4 のとき E[3X−2] を求めよ。", answer: "10", numericAnswer: 10, steps: ["3E[X]−2", "=3×4−2=10"], explanation: "期待値は線形に変換できる。" }),
  question({ id: "stats-q-variance-transform", topic: "random-variable", genre: "一次変換", difficulty: 2, format: "number", prompt: "V(X)=3 のとき V(−2X+5) を求めよ。", answer: "12", numericAnswer: 12, steps: ["(−2)²V(X)", "=4×3=12"], explanation: "定数5は分散に影響せず、−2は二乗して4になる。" }),
  question({ id: "stats-q-binomial-mean", topic: "random-variable", genre: "反復試行", difficulty: 2, format: "number", prompt: "公平なコインを4回投げたとき、表の回数Xの期待値を求めよ。", answer: "2", numericAnswer: 2, steps: ["各回の表の確率は1/2", "E[X]=np=4×1/2=2"], explanation: "表の回数は二項型の確率変数として扱える。" }),
  question({ id: "stats-q-probability-total", topic: "random-variable", genre: "確率分布", difficulty: 1, format: "number", prompt: "Xが1,2,3を確率0.2,0.3,kで取る。kを求めよ。", answer: "0.5", numericAnswer: 0.5, steps: ["確率の総和は1", "k=1−0.2−0.3=0.5"], explanation: "確率分布ではすべての確率が0以上で、合計が1。" }),

  question({ id: "stats-q-density-k", topic: "continuous", genre: "確率密度", difficulty: 2, format: "number", prompt: "f(x)=kx (0≤x≤2)、それ以外0が確率密度となるよう k を求めよ。", answer: "1/2 = 0.5", numericAnswer: 0.5, steps: ["∫₀²kx dx=1", "2k=1", "k=1/2"], explanation: "密度全体の面積が1になるよう定数を決める。" }),
  question({ id: "stats-q-density-prob", topic: "continuous", genre: "区間確率", difficulty: 2, format: "number", prompt: "f(x)=x/2 (0≤x≤2) のとき P(0≤X≤1) を求めよ。", answer: "1/4 = 0.25", numericAnswer: 0.25, steps: ["∫₀¹(x/2)dx", "[x²/4]₀¹=1/4"], explanation: "区間確率はその区間の密度曲線下の面積。" }),
  question({ id: "stats-q-continuous-mean", topic: "continuous", genre: "期待値", difficulty: 3, format: "number", prompt: "f(x)=x/2 (0≤x≤2) のとき E[X] を求めよ。小数第3位まで可。", answer: "4/3 ≒ 1.333", numericAnswer: 4 / 3, tolerance: 0.001, steps: ["E[X]=∫₀²x·(x/2)dx", "=[x³/6]₀²", "=4/3"], explanation: "連続型では値×密度を積分する。", formula: "E[X]=\\int_{-\\infty}^{\\infty}x f(x)\\,dx" }),
  question({ id: "stats-q-continuous-var", topic: "continuous", genre: "分散", difficulty: 3, format: "number", prompt: "f(x)=x/2 (0≤x≤2) のとき V(X) を求めよ。小数第3位まで可。", answer: "2/9 ≒ 0.222", numericAnswer: 2 / 9, tolerance: 0.001, steps: ["E[X]=4/3", "E[X²]=∫₀²x²·(x/2)dx=2", "2−(4/3)²=2/9"], explanation: "E[X²]を積分してからE[X]²を引く。", formula: "V(X)=E[X^2]-\\{E[X]\\}^2" }),
  question({ id: "stats-q-uniform", topic: "continuous", genre: "区間確率", difficulty: 1, format: "number", prompt: "f(x)=1/4 (0≤x≤4) の一様分布で P(1≤X≤3) を求めよ。", answer: "1/2 = 0.5", numericAnswer: 0.5, steps: ["幅2×高さ1/4", "=1/2"], explanation: "一定の密度なので長方形の面積で求められる。" }),
  question({ id: "stats-q-density-condition", topic: "continuous", genre: "定義", difficulty: 1, format: "choice", prompt: "確率密度関数の条件として正しい組を選べ。", answer: "f(x)≥0 かつ 全区間の積分が1", options: ["f(x)≥0 かつ 全区間の積分が1", "f(x)>1 かつ 全区間の積分が0", "f(x)は整数 かつ 合計がn", "f(x)≤0 かつ 全区間の積分が−1"], steps: ["密度は負にならない", "全面積は1"], explanation: "離散型の『確率の合計1』が、連続型では『密度の積分1』になる。" }),
  question({ id: "stats-q-z-score", topic: "continuous", genre: "標準化", difficulty: 1, format: "number", prompt: "平均62、標準偏差8の分布で X=74 の z得点を求めよ。", answer: "1.5", numericAnswer: 1.5, steps: ["z=(74−62)/8", "=12/8=1.5"], explanation: "平均より標準偏差1.5個分だけ上にある。", formula: "z=\\frac{x-\\mu}{\\sigma}" }),
  question({ id: "stats-q-unstandardize", topic: "continuous", genre: "標準化", difficulty: 1, format: "number", prompt: "平均50、標準偏差5の分布で z=−1.2 に対応する X を求めよ。", answer: "44", numericAnswer: 44, steps: ["x=μ+zσ", "=50+(−1.2)×5=44"], explanation: "標準化の式をxについて解き直す。" }),
  question({ id: "stats-q-normal-table", topic: "continuous", genre: "正規分布表", difficulty: 2, format: "number", prompt: "標準正規分布表で P(Z≤1.28) を求めよ。小数第4位まで。", answer: "0.8997", numericAnswer: 0.8997, tolerance: 0.00005, steps: ["行1.2、列0.08を読む", "累積確率は0.8997"], explanation: "下側確率表ではそのまま行と列の交点を読む。" }),
  question({ id: "stats-q-normal-center", topic: "continuous", genre: "正規分布", difficulty: 2, format: "number", prompt: "標準正規分布で P(−1≤Z≤1) を求めよ。小数第4位まで。", answer: "0.6826", numericAnswer: 0.6826, tolerance: 0.00005, steps: ["P(Z≤1)=0.8413", "P(Z≤−1)=1−0.8413=0.1587", "0.8413−0.1587=0.6826"], explanation: "累積確率の差を取り、対称性を使う。" }),
  question({ id: "stats-q-normal-x", topic: "continuous", genre: "正規分布", difficulty: 2, format: "number", prompt: "X∼N(100,15²) のとき P(X≤115) を求めよ。小数第4位まで。", answer: "0.8413", numericAnswer: 0.8413, tolerance: 0.00005, steps: ["z=(115−100)/15=1", "P(Z≤1)=0.8413"], explanation: "まず標準化してから標準正規分布表を読む。" }),
  question({ id: "stats-q-normal-interval", topic: "continuous", genre: "正規分布", difficulty: 3, format: "number", prompt: "X∼N(100,15²) のとき P(85≤X≤115) を求めよ。小数第4位まで。", answer: "0.6826", numericAnswer: 0.6826, tolerance: 0.00005, steps: ["85はz=−1、115はz=1", "P(−1≤Z≤1)=0.6826"], explanation: "平均の前後1標準偏差の区間に相当する。" }),
  question({ id: "stats-q-three-sigma", topic: "continuous", genre: "正規分布", difficulty: 1, format: "number", prompt: "正規分布で μ−3σ≤X≤μ+3σ となる確率を近似値で答えよ。", answer: "約0.997（99.7%）", numericAnswer: 0.997, tolerance: 0.0005, steps: ["正規分布の3σ範囲を使う", "約99.7%=0.997"], explanation: "平均から±3標準偏差の範囲には、ほぼ全体にあたる約99.7%が入る。" }),
  question({ id: "stats-q-standardize-text", topic: "continuous", genre: "標準化", difficulty: 2, format: "text", prompt: "X∼N(μ,σ²) を標準正規分布へ変換する式を答えよ。", answer: "Z=(X−μ)/σ", accepted: ["z=(x-μ)/σ", "z=(x−μ)/σ", "(x-μ)/σ"], keywords: ["x", "μ", "σ"], minKeywords: 3, steps: ["平均μを引く", "標準偏差σで割る"], explanation: "この変換後は平均0、分散1の標準正規分布になる。" }),
];

export const STATISTICS_QUESTIONS: StatisticsQuestion[] = [
  ...CORE_STATISTICS_QUESTIONS,
  ...STATISTICS_PDF12_QUESTIONS,
  ...STATISTICS_PDF34_QUESTIONS,
];

export const STATISTICS_EXAM_FORMATS: StatisticsExamFormat[] = [
  {
    id: "direct",
    title: "直接計算",
    description: "平均・分散・相関・確率・期待値などを、与えられた表や数値から順に計算する形式。",
    strategy: "式を先に書き、代入、計算、指定桁への丸めの順に固定する。",
  },
  {
    id: "linked",
    title: "連続小問",
    description: "前の小問で出した平均や確率を、次の分散・ベイズ・標準化で再利用する形式。",
    strategy: "途中値を欄外に残し、丸める前の値を次の小問へ使う。",
  },
  {
    id: "table",
    title: "表・分布から読む",
    description: "確率分布表や標準正規分布表を読み、必要な行列・累積確率を選ぶ形式。",
    strategy: "z値の整数1桁＋小数第1位を行、小数第2位を列として確認する。",
  },
  {
    id: "reason",
    title: "式・理由の記述",
    description: "独立の条件、密度関数の条件、最小二乗法などを式や短い文章で説明する形式。",
    strategy: "定義式を1行、その意味を1文で書く。キーワードだけで終わらせない。",
  },
];
import { STATISTICS_PDF12_QUESTIONS } from "./statistics-pdf12-data";
import { STATISTICS_PDF34_FORMULAS, STATISTICS_PDF34_QUESTIONS } from "./statistics-pdf34-data";
