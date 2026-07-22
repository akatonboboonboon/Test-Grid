export type MathFoundationSubjectId = "subject-7" | "subject-8";

export type MathFoundationScope = "exam-range" | "prerequisite";

export type MathFoundationSymbol = {
  symbol: string;
  meaning: string;
  unit?: string;
  note?: string;
};

export type MathFoundationExample = {
  given: string;
  working: string;
  answer: string;
};

export type MathFoundationEntry = {
  id: string;
  subjectId: MathFoundationSubjectId;
  topic: string;
  title: string;
  formula: string;
  /** 統計で formula に \\sum がある場合は、必ず \\sum を使わない同値な展開を書く。 */
  expandedFormula?: string;
  symbols: MathFoundationSymbol[];
  conditions: string[];
  purpose: string;
  commonMistakes: string[];
  example?: MathFoundationExample;
  scope: MathFoundationScope;
  sourceBasis: string[];
};

const STATISTICS_RANGE = ["確率統計範囲ZIP・演習PDF1〜4", "確率統計追加範囲5枚（2026-07-22）", "確率統計過去問形式"];
const APPLIED_RANGE = ["応用数学範囲・追加範囲 全22枚", "応用数学テスト形式1〜3の出題構成"];

function statistics(entry: Omit<MathFoundationEntry, "subjectId" | "sourceBasis">): MathFoundationEntry {
  return { ...entry, subjectId: "subject-7", sourceBasis: STATISTICS_RANGE };
}

function applied(entry: Omit<MathFoundationEntry, "subjectId" | "sourceBasis">): MathFoundationEntry {
  return { ...entry, subjectId: "subject-8", sourceBasis: APPLIED_RANGE };
}

export const STATISTICS_MATH_FOUNDATIONS: MathFoundationEntry[] = [
  statistics({
    id: "foundation-stats-arithmetic-mean", topic: "descriptive", title: "算術平均",
    formula: "\\bar{x}=\\frac{1}{n}\\sum_{i=1}^{n}x_i",
    expandedFormula: "\\bar{x}=\\frac{x_1+x_2+\\cdots+x_n}{n}",
    symbols: [{ symbol: "\\bar{x}", meaning: "標本データの算術平均" }, { symbol: "x_i", meaning: "i番目のデータ" }, { symbol: "n", meaning: "データ数" }],
    conditions: ["同じ量・同じ単位のデータを平均する", "度数表では値×度数の総和を総度数で割る"],
    purpose: "後続の偏差、分散、共分散、回帰を計算する基準値を作る。",
    commonMistakes: ["合計だけを答える", "度数をデータ数として扱わず階級数で割る"],
    example: { given: "x=(4,6,8)", working: "\\bar{x}=\\frac{4+6+8}{3}", answer: "6" },
    scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-population-variance", topic: "descriptive", title: "母分散",
    formula: "\\sigma^2=\\frac{1}{n}\\sum_{i=1}^{n}(x_i-\\bar{x})^2",
    expandedFormula: "\\sigma^2=\\frac{(x_1-\\bar{x})^2+(x_2-\\bar{x})^2+\\cdots+(x_n-\\bar{x})^2}{n}",
    symbols: [{ symbol: "\\sigma^2", meaning: "母分散", unit: "元データの単位の2乗" }, { symbol: "x_i-\\bar{x}", meaning: "平均からの偏差" }, { symbol: "n", meaning: "母集団として扱うデータ数" }],
    conditions: ["今回の過去問・模試の『母分散』指定ではnで割る", "平均との差を二乗してから平均する"],
    purpose: "データのばらつきを平均からの二乗距離で表す。",
    commonMistakes: ["n-1で割る", "偏差を二乗せず足して0にする", "標準偏差と取り違える"],
    example: { given: "x=(2,4,6)", working: "\\sigma^2=\\frac{(2-4)^2+(4-4)^2+(6-4)^2}{3}", answer: "\\frac{8}{3}" },
    scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-sample-variance", topic: "descriptive", title: "不偏分散との区別",
    formula: "s^2=\\frac{1}{n-1}\\sum_{i=1}^{n}(x_i-\\bar{x})^2",
    expandedFormula: "s^2=\\frac{(x_1-\\bar{x})^2+(x_2-\\bar{x})^2+\\cdots+(x_n-\\bar{x})^2}{n-1}",
    symbols: [{ symbol: "s^2", meaning: "不偏分散" }, { symbol: "n-1", meaning: "自由度" }],
    conditions: ["標本から母分散を不偏推定すると明示された場合に使う", "今回の『母分散』指定問題には使わない"],
    purpose: "nとn-1を混同しないための対照公式。",
    commonMistakes: ["母分散の問題でも機械的にn-1で割る", "標本標準偏差の定義と混同する"],
    scope: "prerequisite",
  }),
  statistics({
    id: "foundation-stats-standard-deviation", topic: "descriptive", title: "標準偏差",
    formula: "\\sigma=\\sqrt{\\sigma^2}=\\sqrt{V(X)}",
    symbols: [{ symbol: "\\sigma", meaning: "母標準偏差", unit: "元データと同じ単位" }, { symbol: "\\sigma^2", meaning: "母分散" }],
    conditions: ["分散の非負の平方根を取る"], purpose: "ばらつきを元データと同じ単位へ戻す。",
    commonMistakes: ["負の平方根も答える", "分散をそのまま標準偏差とする"],
    example: { given: "\\sigma^2=9", working: "\\sigma=\\sqrt9", answer: "3" }, scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-mean-absolute-deviation", topic: "descriptive", title: "平均偏差",
    formula: "MD=\\frac{1}{n}\\sum_{i=1}^{n}|x_i-\\bar{x}|",
    expandedFormula: "MD=\\frac{|x_1-\\bar{x}|+|x_2-\\bar{x}|+\\cdots+|x_n-\\bar{x}|}{n}",
    symbols: [{ symbol: "MD", meaning: "平均偏差" }, { symbol: "|x_i-\\bar{x}|", meaning: "平均からの絶対距離" }],
    conditions: ["平均との差に絶対値を付ける", "母分散のような二乗はしない"], purpose: "平均からの典型的な距離を絶対値で測る。",
    commonMistakes: ["偏差をそのまま足して0にする", "分散の平方根と同じだと考える"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-variance-shortcut", topic: "descriptive", title: "分散の計算公式",
    formula: "V(X)=E[X^2]-\\{E[X]\\}^2",
    symbols: [{ symbol: "E[X]", meaning: "Xの期待値・平均" }, { symbol: "E[X^2]", meaning: "Xの二乗の期待値" }],
    conditions: ["E[X^2]とE[X]^2は別物", "母分散・確率変数の分散に使える"], purpose: "偏差を一つずつ作らず分散を速く計算する。",
    commonMistakes: ["E[X^2]をE[X]^2と置く", "引く順序を逆にして負の分散を作る"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-linear-transform", topic: "descriptive", title: "一次変換の平均・分散",
    formula: "E[aX+b]=aE[X]+b,\\qquad V(aX+b)=a^2V(X)",
    symbols: [{ symbol: "a", meaning: "倍率" }, { symbol: "b", meaning: "平行移動する定数" }],
    conditions: ["a,bは定数"], purpose: "換算点や標準化前後の平均・分散を求める。",
    commonMistakes: ["分散にも+bを入れる", "分散へaではなくaの二乗が掛かることを忘れる"],
    example: { given: "E[X]=5,V(X)=4,Y=3X+2", working: "E[Y]=3\\cdot5+2,\\ V(Y)=3^2\\cdot4", answer: "E[Y]=17,\\ V(Y)=36" }, scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-pooled-groups", topic: "descriptive", title: "2群の統合平均・母分散",
    formula: "\\bar{x}=\\frac{n_1\\bar{x}_1+n_2\\bar{x}_2}{n_1+n_2},\\quad \\sigma^2=\\frac{n_1\\{\\sigma_1^2+(\\bar{x}_1-\\bar{x})^2\\}+n_2\\{\\sigma_2^2+(\\bar{x}_2-\\bar{x})^2\\}}{n_1+n_2}",
    symbols: [{ symbol: "n_j", meaning: "第j群の人数" }, { symbol: "\\bar{x}_j", meaning: "第j群の平均" }, { symbol: "\\sigma_j", meaning: "第j群の母標準偏差" }],
    conditions: ["群の標準偏差が母標準偏差として与えられる", "全体平均を先に求める"], purpose: "人数・平均・標準偏差だけから全体の平均と母標準偏差を復元する。",
    commonMistakes: ["群平均や標準偏差を単純平均する", "群間の平均差によるばらつきを落とす", "最後に平方根を取らず分散を答える"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-covariance", topic: "relation", title: "母共分散",
    formula: "\\sigma_{XY}=\\frac{1}{n}\\sum_{i=1}^{n}(x_i-\\bar{x})(y_i-\\bar{y})",
    expandedFormula: "\\sigma_{XY}=\\frac{(x_1-\\bar{x})(y_1-\\bar{y})+\\cdots+(x_n-\\bar{x})(y_n-\\bar{y})}{n}",
    symbols: [{ symbol: "\\sigma_{XY}", meaning: "XとYの母共分散" }, { symbol: "(x_i,y_i)", meaning: "同じ観測対象の対応データ" }],
    conditions: ["同じ列・同じ対象のXとYを組にする", "母共分散指定ではnで割る"], purpose: "2変量が同方向・逆方向へ動く傾向を測る。",
    commonMistakes: ["対応の異なる列を掛ける", "標準偏差の積で割って相関係数まで計算する"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-correlation", topic: "relation", title: "ピアソンの相関係数",
    formula: "r=\\frac{\\sigma_{XY}}{\\sigma_X\\sigma_Y}",
    symbols: [{ symbol: "r", meaning: "相関係数（-1以上1以下）" }, { symbol: "\\sigma_X,\\sigma_Y", meaning: "X,Yの標準偏差" }],
    conditions: ["両変数の標準偏差が0でない", "直線的な関連を測る"], purpose: "共分散を単位に依存しない強さへ標準化する。",
    commonMistakes: ["分母へ分散を入れる", "相関を因果関係と断定する"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-regression", topic: "relation", title: "単回帰直線",
    formula: "b=\\frac{\\sigma_{XY}}{\\sigma_X^2},\\qquad a=\\bar{y}-b\\bar{x},\\qquad \\hat{y}=a+bx",
    symbols: [{ symbol: "b", meaning: "YのXへの回帰係数・傾き" }, { symbol: "a", meaning: "切片" }, { symbol: "\\hat{y}", meaning: "予測値" }],
    conditions: ["Xを説明変数、Yを目的変数とする", "Xの分散が0でない"], purpose: "XからYを最小二乗法で予測する。",
    commonMistakes: ["分母へYの分散を入れる", "XとYを逆にしても同じ直線だと考える", "切片の符号を誤る"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-determination", topic: "relation", title: "決定係数",
    formula: "R^2=r^2",
    symbols: [{ symbol: "R^2", meaning: "単回帰の決定係数" }, { symbol: "r", meaning: "ピアソンの相関係数" }],
    conditions: ["切片を含む単回帰で用いる"], purpose: "回帰直線が変動を説明する割合の目安を得る。",
    commonMistakes: ["負の相関ならR²も負にする", "rそのものを割合として読む"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-permutation-combination", topic: "counting", title: "順列と組合せ",
    formula: "{}_nP_r=\\frac{n!}{(n-r)!},\\qquad {}_nC_r=\\frac{n!}{r!(n-r)!}",
    symbols: [{ symbol: "{}_nP_r", meaning: "n個からr個を選び順に並べる数" }, { symbol: "{}_nC_r", meaning: "n個からr個を順不同で選ぶ数" }],
    conditions: ["順番を区別するならP、区別しないならC", "0以上r以下n"], purpose: "同様に確からしい結果の総数・有利な結果数を数える。",
    commonMistakes: ["同時抽出で順番を二重に数える", "復元抽出に組合せをそのまま使う"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-probability-rules", topic: "counting", title: "加法定理・余事象",
    formula: "P(A\\cup B)=P(A)+P(B)-P(A\\cap B),\\qquad P(A^c)=1-P(A)",
    symbols: [{ symbol: "A\\cup B", meaning: "AまたはB" }, { symbol: "A\\cap B", meaning: "AかつB" }, { symbol: "A^c", meaning: "Aの余事象" }],
    conditions: ["共通部分を二重に数えない", "少なくとも1回では余事象が有効"], purpose: "重なりのある和事象と『起こらない』確率を求める。",
    commonMistakes: ["共通部分を引かない", "排反と独立を混同する"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-conditional-independent", topic: "conditional", title: "条件付き確率・乗法定理・独立",
    formula: "P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)},\\quad P(A\\cap B)=P(A\\mid B)P(B),\\quad A\\perp B\\Rightarrow P(A\\cap B)=P(A)P(B)",
    symbols: [{ symbol: "P(A\\mid B)", meaning: "Bが起きた条件でAが起きる確率" }, { symbol: "A\\perp B", meaning: "AとBが独立" }],
    conditions: ["P(B)>0", "積P(A)P(B)を使えるのは独立な場合だけ"], purpose: "条件で標本空間を絞り、同時確率を求める。",
    commonMistakes: ["縦棒の左を分母にする", "戻さない抽出を独立とみなす"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-total-bayes", topic: "conditional", title: "全確率とBayesの定理",
    formula: "P(A)=\\sum_{i=1}^{k}P(A\\mid H_i)P(H_i),\\qquad P(H_j\\mid A)=\\frac{P(A\\mid H_j)P(H_j)}{P(A)}",
    expandedFormula: "P(A)=P(A\\mid H_1)P(H_1)+\\cdots+P(A\\mid H_k)P(H_k),\\qquad P(H_j\\mid A)=\\frac{P(A\\mid H_j)P(H_j)}{P(A)}",
    symbols: [{ symbol: "H_i", meaning: "互いに排反で全体を尽くす原因・場合" }, { symbol: "P(H_j\\mid A)", meaning: "結果Aを観測した後の原因Hjの事後確率" }],
    conditions: ["H1からHkが場合分けを尽くす", "分母P(A)>0"], purpose: "複数経路の結果確率と、結果から原因を逆算した確率を求める。",
    commonMistakes: ["分母へ目的経路だけを置く", "事前確率P(Hi)を掛け忘れる"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-discrete-expectation", topic: "random-variable", title: "離散型の期待値",
    formula: "E[X]=\\sum_{i=1}^{k}x_ip_i",
    expandedFormula: "E[X]=x_1p_1+x_2p_2+\\cdots+x_kp_k",
    symbols: [{ symbol: "x_i", meaning: "確率変数の値" }, { symbol: "p_i", meaning: "P(X=xi)" }],
    conditions: ["確率の総和が1", "各値と同じ列の確率を掛ける"], purpose: "確率で重み付けした長期平均を求める。",
    commonMistakes: ["値だけを単純平均する", "確率表の列をずらす"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-discrete-variance", topic: "random-variable", title: "離散型の分散",
    formula: "V(X)=\\sum_{i=1}^{k}(x_i-\\mu)^2p_i",
    expandedFormula: "V(X)=(x_1-\\mu)^2p_1+(x_2-\\mu)^2p_2+\\cdots+(x_k-\\mu)^2p_k",
    symbols: [{ symbol: "\\mu=E[X]", meaning: "確率変数Xの平均" }, { symbol: "p_i", meaning: "値xiを取る確率" }],
    conditions: ["先に期待値muを求める", "確率で偏差平方を重み付けする"], purpose: "離散確率分布のばらつきを求める。",
    commonMistakes: ["最後に確率piを掛けない", "E[X²]-E[X]²の引き算を逆にする"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-entropy", topic: "random-variable", title: "エントロピー",
    formula: "H(X)=-\\sum_{i=1}^{k}p_i\\log_2p_i",
    expandedFormula: "H(X)=-(p_1\\log_2p_1+p_2\\log_2p_2+\\cdots+p_k\\log_2p_k)",
    symbols: [{ symbol: "H(X)", meaning: "平均情報量", unit: "bit" }, { symbol: "p_i", meaning: "各結果の確率" }],
    conditions: ["対数の底は2", "pi=0の項は極限により0とする"], purpose: "分布の不確実さをbitで測る。",
    commonMistakes: ["先頭の負号を落とす", "自然対数を使ってbitと答える"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-density", topic: "continuous", title: "確率密度と区間確率",
    formula: "f(x)\\ge0,\\quad \\int_{-\\infty}^{\\infty}f(x)\\,dx=1,\\quad P(a\\le X\\le b)=\\int_a^bf(x)\\,dx",
    symbols: [{ symbol: "f(x)", meaning: "確率密度関数" }, { symbol: "P(a\\le X\\le b)", meaning: "密度曲線下の区間面積" }],
    conditions: ["密度は非負で全面積1", "連続型では一点の確率は0"], purpose: "定数の正規化と指定区間の確率を積分で求める。",
    commonMistakes: ["f(c)をP(X=c)とする", "密度が0の定義域外まで積分する"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-continuous-moments", topic: "continuous", title: "連続型の期待値・分散",
    formula: "E[X]=\\int_{-\\infty}^{\\infty}xf(x)\\,dx,\\qquad V(X)=\\int_{-\\infty}^{\\infty}x^2f(x)\\,dx-\\{E[X]\\}^2",
    symbols: [{ symbol: "E[X]", meaning: "連続型確率変数の期待値" }, { symbol: "V(X)", meaning: "連続型確率変数の分散" }],
    conditions: ["対応する積分が収束する", "定義域外では密度0として扱う"], purpose: "連続分布の平均とばらつきを求める。",
    commonMistakes: ["期待値でxを掛け忘れる", "E[X²]の積分でx²を掛け忘れる"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-second-moment", topic: "random-variable", title: "二乗の期待値（2次モーメント）",
    formula: "E[X^2]=\\sum_{i=1}^{k}x_i^2p_i",
    expandedFormula: "E[X^2]=x_1^2p_1+x_2^2p_2+\\cdots+x_k^2p_k",
    symbols: [{ symbol: "E[X^2]", meaning: "Xを二乗した量の期待値" }, { symbol: "p_i", meaning: "X=xiとなる確率" }],
    conditions: ["値を二乗してから対応確率を掛ける", "E[X²]とE[X]²を区別する"], purpose: "分散をV(X)=E[X²]−E[X]²で計算する。",
    commonMistakes: ["期待値を先に求めて二乗する", "値を二乗せず確率だけ掛ける"],
    example: { given: "公平な6面サイコロ", working: "E[X^2]=\\frac{1^2+2^2+3^2+4^2+5^2+6^2}{6}", answer: "\\frac{91}{6}" }, scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-variance-properties", topic: "random-variable", title: "分散の性質と独立な平均",
    formula: "V(c)=0,\\quad V(X+c)=V(X),\\quad V(cX)=c^2V(X),\\quad V\\!\\left(\\frac{X_1+X_2}{2}\\right)=\\frac{V(X)}{2}",
    symbols: [{ symbol: "c", meaning: "定数" }, { symbol: "X_1,X_2", meaning: "独立で同じ分散を持つ確率変数" }],
    conditions: ["最後の式ではX1とX2が独立かつ同分布"], purpose: "平行移動・尺度変更と、標本平均によるばらつき減少を計算する。",
    commonMistakes: ["V(X+c)へcを足す", "V(cX)をcV(X)とする", "独立でない変数の共分散を落とす"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-special-variances", topic: "continuous", title: "指数分布・[0,1]一様分布の分散",
    formula: "X\\sim\\operatorname{Exp}(\\lambda):V(X)=\\frac1{\\lambda^2},\\qquad X\\sim U(0,1):V(X)=\\frac1{12}",
    symbols: [{ symbol: "\\lambda", meaning: "指数分布の率パラメータ" }, { symbol: "U(0,1)", meaning: "0以上1以下の一様分布" }],
    conditions: ["指数分布は密度λe^{-λx}（x以上0）", "一様分布は[0,1]で密度1"], purpose: "追加範囲の代表分布の分散を即答する。",
    commonMistakes: ["指数分布の分散を1/λとする", "一様分布のE[X²]=1/3を分散とする"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-general-standardize", topic: "continuous", title: "一般の標準化",
    formula: "Z=\\frac{X-E[X]}{\\sqrt{V(X)}},\\qquad E[Z]=0,\\qquad V(Z)=1",
    symbols: [{ symbol: "Z", meaning: "標準化された無次元の確率変数" }, { symbol: "\\sqrt{V(X)}", meaning: "Xの標準偏差" }],
    conditions: ["0<V(X)<∞", "平均と分散が存在する"], purpose: "単位の異なる確率変数を平均0・分散1へそろえて比較する。",
    commonMistakes: ["分母へV(X)をそのまま置く", "正規分布にしか標準化できないと考える"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-normal-standardize", topic: "continuous", title: "正規分布と標準化",
    formula: "X\\sim N(\\mu,\\sigma^2),\\qquad Z=\\frac{X-\\mu}{\\sigma}\\sim N(0,1)",
    symbols: [{ symbol: "\\mu", meaning: "平均" }, { symbol: "\\sigma", meaning: "標準偏差（正）" }, { symbol: "Z", meaning: "標準得点" }],
    conditions: ["sigma>0", "表が下側累積確率Phi(z)か確認する"], purpose: "異なる平均・標準偏差の値を標準正規表で扱う。",
    commonMistakes: ["分母へ分散sigma²を入れる", "X-muの符号を逆にする"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-normal-symmetry", topic: "continuous", title: "標準正規分布の対称性",
    formula: "\\Phi(-z)=1-\\Phi(z),\\qquad P(-z\\le Z\\le z)=2\\Phi(z)-1",
    symbols: [{ symbol: "\\Phi(z)", meaning: "P(Z以下z)で表す下側累積確率" }],
    conditions: ["標準正規分布は0を中心に左右対称", "中央区間ではzは0以上"], purpose: "負のzや平均中心の区間確率を表の正側から求める。",
    commonMistakes: ["中央確率をPhi(z)のままにする", "上側確率と下側確率を取り違える"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-chebyshev", topic: "continuous", title: "チェビシェフの不等式",
    formula: "P(|X-\\mu|<k\\sigma)\\ge1-\\frac{1}{k^2}",
    symbols: [{ symbol: "k", meaning: "平均から測る標準偏差の個数" }, { symbol: "1-1/k^2", meaning: "区間内確率の保証下限" }],
    conditions: ["k>1", "分布形を仮定しない"], purpose: "正規分布でない場合にも平均周辺へ入る確率の下限を保証する。",
    commonMistakes: ["等号で正確な確率だとする", "正規分布の68-95-99.7則と混同する"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-three-means", topic: "descriptive", title: "算術・幾何・調和平均",
    formula: "A=\\frac{x_1+\\cdots+x_n}{n},\\quad G=(x_1\\cdots x_n)^{1/n},\\quad H=\\frac{n}{\\frac1{x_1}+\\cdots+\\frac1{x_n}}",
    symbols: [{ symbol: "A", meaning: "算術平均" }, { symbol: "G", meaning: "幾何平均" }, { symbol: "H", meaning: "調和平均" }],
    conditions: ["幾何平均・調和平均ではxi>0", "同じ正のデータに対してH以下G以下A"], purpose: "加法・倍率・率に応じて適切な代表値を求める。",
    commonMistakes: ["幾何平均でn乗根を忘れる", "調和平均を逆数和だけで終える"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-spearman", topic: "relation", title: "スピアマンの順位相関",
    formula: "r_s=1-\\frac{6\\sum_{i=1}^{n}d_i^2}{n(n^2-1)}",
    expandedFormula: "r_s=1-\\frac{6(d_1^2+d_2^2+\\cdots+d_n^2)}{n(n^2-1)}",
    symbols: [{ symbol: "d_i=R_{Xi}-R_{Yi}", meaning: "i番目の順位差" }, { symbol: "n", meaning: "組の数" }],
    conditions: ["同順位がない基本公式", "同順位がある場合は順位付けと補正を別途確認する"], purpose: "値そのものではなく順位の単調な対応を測る。",
    commonMistakes: ["順位1の向きをXとYで逆にする", "順位差を二乗せず足す"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-kendall", topic: "relation", title: "ケンドールの順位相関",
    formula: "r_K=\\frac{C-D}{{}_nC_2}",
    symbols: [{ symbol: "C", meaning: "順方向・一致ペア数" }, { symbol: "D", meaning: "逆方向・不一致ペア数" }, { symbol: "{}_nC_2", meaning: "全ペア数" }],
    conditions: ["同順位がない基本形", "C+Dは全ペア数"], purpose: "全てのペアの順序一致・逆転から順位相関を求める。",
    commonMistakes: ["全ペア数をn²とする", "転倒数Dを数えた後CをDと同じにする"], scope: "exam-range",
  }),
  statistics({
    id: "foundation-stats-square-sum-identity", topic: "descriptive", title: "平方和の恒等式",
    formula: "\\sum_{i=1}^{n}(x_i-a)^2=\\sum_{i=1}^{n}(x_i-\\bar{x})^2+n(\\bar{x}-a)^2",
    expandedFormula: "(x_1-a)^2+\\cdots+(x_n-a)^2=(x_1-\\bar{x})^2+\\cdots+(x_n-\\bar{x})^2+n(\\bar{x}-a)^2",
    symbols: [{ symbol: "a", meaning: "任意の実数" }, { symbol: "\\bar{x}", meaning: "データ平均" }],
    conditions: ["偏差和(x1-xbar)+…+(xn-xbar)=0を使う"], purpose: "平均を中心にした平方和分解と証明問題を処理する。",
    commonMistakes: ["展開時の交差項を理由なく消す", "最後の項の係数nを落とす"], scope: "exam-range",
  }),
];

export const APPLIED_MATH_FOUNDATIONS: MathFoundationEntry[] = [
  applied({
    id: "foundation-applied-vector-norm", topic: "vectors", title: "ベクトルの大きさ",
    formula: "|\\mathbf a|=\\sqrt{a_x^2+a_y^2+a_z^2}",
    symbols: [{ symbol: "\\mathbf a=(a_x,a_y,a_z)", meaning: "3次元ベクトル" }, { symbol: "|\\mathbf a|", meaning: "ベクトルのノルム" }],
    conditions: ["平方根は非負値を取る"], purpose: "単位ベクトル、速さ、外積の正規化の基礎にする。",
    commonMistakes: ["負成分を括弧なしで二乗する", "成分を足してから二乗する"],
    example: { given: "\\mathbf a=(2,-1,2)", working: "|\\mathbf a|=\\sqrt{2^2+(-1)^2+2^2}", answer: "3" }, scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-unit-vector", topic: "vectors", title: "単位ベクトル",
    formula: "\\mathbf e=\\frac{\\mathbf a}{|\\mathbf a|}",
    symbols: [{ symbol: "\\mathbf e", meaning: "aと同方向の単位ベクトル" }],
    conditions: ["aは零ベクトルでない"], purpose: "向きを保って長さを1にする。",
    commonMistakes: ["各成分をノルムの二乗で割る", "反対向きを同方向とする"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-dot-product", topic: "vectors", title: "内積・直交",
    formula: "\\mathbf a\\cdot\\mathbf b=a_xb_x+a_yb_y+a_zb_z=|\\mathbf a||\\mathbf b|\\cos\\theta,\\qquad \\mathbf a\\perp\\mathbf b\\iff\\mathbf a\\cdot\\mathbf b=0",
    symbols: [{ symbol: "\\theta", meaning: "aとbのなす角" }],
    conditions: ["角度式ではa,bが零ベクトルでない"], purpose: "なす角、直交条件、方向微分を計算する。",
    commonMistakes: ["対応しない成分を掛ける", "直交を外積0とする"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-cross-product", topic: "vectors", title: "外積",
    formula: "\\mathbf a\\times\\mathbf b=(a_yb_z-a_zb_y,\\ a_zb_x-a_xb_z,\\ a_xb_y-a_yb_x)",
    symbols: [{ symbol: "\\mathbf a\\times\\mathbf b", meaning: "a,bの両方に垂直なベクトル" }],
    conditions: ["右手系", "順序を逆にすると符号反転"], purpose: "法線、面積、回転を求める。",
    commonMistakes: ["第2成分の符号を誤る", "b×aと同じとする"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-cross-area", topic: "vectors", title: "外積と面積",
    formula: "S_{\\mathrm{parallelogram}}=|\\mathbf a\\times\\mathbf b|,\\qquad S_{\\triangle ABC}=\\frac12|\\overrightarrow{AB}\\times\\overrightarrow{AC}|",
    symbols: [{ symbol: "S", meaning: "面積" }],
    conditions: ["三角形では共通始点AからAB,ACを作る"], purpose: "3次元座標の三角形・平行四辺形の面積を求める。",
    commonMistakes: ["三角形で1/2を忘れる", "位置ベクトルB,Cをそのまま使う"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-vector-derivative", topic: "vector-functions", title: "ベクトル関数の微分",
    formula: "\\frac{d\\mathbf r}{dt}=\\left(\\frac{dx}{dt},\\frac{dy}{dt},\\frac{dz}{dt}\\right)",
    symbols: [{ symbol: "\\mathbf r(t)", meaning: "位置ベクトル" }, { symbol: "\\mathbf r'(t)", meaning: "速度・接ベクトル" }],
    conditions: ["各成分が微分可能"], purpose: "速度、加速度、接線方向を成分ごとに求める。",
    commonMistakes: ["定数成分を残す", "ベクトル全体をスカラーのように扱う"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-product-rules", topic: "vector-functions", title: "内積・外積の微分",
    formula: "\\frac{d}{dt}(\\mathbf a\\cdot\\mathbf b)=\\mathbf a'\\cdot\\mathbf b+\\mathbf a\\cdot\\mathbf b',\\qquad \\frac{d}{dt}(\\mathbf a\\times\\mathbf b)=\\mathbf a'\\times\\mathbf b+\\mathbf a\\times\\mathbf b'",
    symbols: [{ symbol: "'", meaning: "tによる微分" }],
    conditions: ["a,bが微分可能", "外積では積の順序を保つ"], purpose: "内積・外積を展開せず微分する。",
    commonMistakes: ["a'とb'だけを掛ける", "外積の第2項で順序を逆にする"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-speed-tangent", topic: "curves", title: "速さと単位接ベクトル",
    formula: "v=|\\mathbf r'(t)|,\\qquad \\mathbf T(t)=\\frac{\\mathbf r'(t)}{|\\mathbf r'(t)|}",
    symbols: [{ symbol: "v", meaning: "速さ" }, { symbol: "\\mathbf T", meaning: "単位接ベクトル" }],
    conditions: ["正則曲線r'(t)が零ベクトルでない"], purpose: "曲線に沿う移動の速さと接線方向を得る。",
    commonMistakes: ["速度ベクトルと速さを同じものとする", "Tを正規化しない"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-arc-length", topic: "curves", title: "弧長",
    formula: "s=\\int_a^b|\\mathbf r'(t)|\\,dt=\\int_a^b\\sqrt{(x')^2+(y')^2+(z')^2}\\,dt",
    symbols: [{ symbol: "s", meaning: "曲線長" }, { symbol: "a,b", meaning: "パラメータ区間の端点" }],
    conditions: ["区分的に滑らかな曲線"], purpose: "速度の大きさを積み重ねて曲線の長さを求める。",
    commonMistakes: ["ベクトルr'をそのまま積分する", "根号を付けず二乗和を積分する"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-surface-tangents", topic: "surfaces", title: "曲面の接ベクトルと正則条件",
    formula: "\\mathbf r_u=\\frac{\\partial\\mathbf r}{\\partial u},\\qquad \\mathbf r_v=\\frac{\\partial\\mathbf r}{\\partial v},\\qquad \\mathbf r_u\\times\\mathbf r_v\\ne\\mathbf0",
    symbols: [{ symbol: "\\mathbf r_u,\\mathbf r_v", meaning: "パラメータ曲面の2本の接ベクトル" }],
    conditions: ["外積が零でない点で正則"], purpose: "接平面・法線・面積要素を作る。",
    commonMistakes: ["u微分でvまで微分する", "外積0でも単位法線を作る"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-surface-normal", topic: "surfaces", title: "単位法線",
    formula: "\\mathbf n=\\pm\\frac{\\mathbf r_u\\times\\mathbf r_v}{|\\mathbf r_u\\times\\mathbf r_v|}",
    symbols: [{ symbol: "\\mathbf n", meaning: "単位法線ベクトル" }],
    conditions: ["曲面が正則", "上向き・外向きなど指定方向へ符号を選ぶ"], purpose: "面積分・流束で向きを決める。",
    commonMistakes: ["外積を正規化しない", "指定と逆向きの法線を使う"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-surface-area", topic: "surfaces", title: "曲面積",
    formula: "dS=|\\mathbf r_u\\times\\mathbf r_v|\\,du\\,dv,\\qquad S=\\iint_D|\\mathbf r_u\\times\\mathbf r_v|\\,du\\,dv",
    symbols: [{ symbol: "dS", meaning: "曲面上の微小面積" }, { symbol: "D", meaning: "uv平面のパラメータ領域" }],
    conditions: ["幾何学的面積なので外積の大きさを使う"], purpose: "パラメータ領域から実際の曲面積を求める。",
    commonMistakes: ["外積ベクトルをそのまま積分する", "uv領域の面積だけで終える"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-gradient", topic: "gradient", title: "勾配",
    formula: "\\nabla\\phi=\\left(\\frac{\\partial\\phi}{\\partial x},\\frac{\\partial\\phi}{\\partial y},\\frac{\\partial\\phi}{\\partial z}\\right)",
    symbols: [{ symbol: "\\phi", meaning: "スカラー場" }, { symbol: "\\nabla\\phi", meaning: "最急増加方向を向くベクトル" }],
    conditions: ["phiが各変数で偏微分可能"], purpose: "等位面の法線・方向微分・保存場の線積分を求める。",
    commonMistakes: ["全微分と偏微分を混同する", "成分の順序x,y,zを入れ替える"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-directional", topic: "gradient", title: "方向微分",
    formula: "D_{\\mathbf e}\\phi=\\nabla\\phi\\cdot\\mathbf e,\\qquad \\mathbf e=\\frac{\\mathbf v}{|\\mathbf v|}",
    symbols: [{ symbol: "\\mathbf e", meaning: "指定方向の単位ベクトル" }, { symbol: "D_{\\mathbf e}\\phi", meaning: "e方向の変化率" }],
    conditions: ["方向ベクトルvは零でない", "vを先に単位化する"], purpose: "指定方向へ進んだときのスカラー場の増加率を求める。",
    commonMistakes: ["vを単位化せず内積を取る", "勾配を点へ代入し忘れる"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-directional-max", topic: "gradient", title: "最大方向微分",
    formula: "\\max_{|\\mathbf e|=1}D_{\\mathbf e}\\phi=|\\nabla\\phi|,\\qquad \\mathbf e_{\\max}=\\frac{\\nabla\\phi}{|\\nabla\\phi|}",
    symbols: [{ symbol: "\\mathbf e_{\\max}", meaning: "最大増加方向の単位ベクトル" }],
    conditions: ["勾配が零でない点では最大方向が勾配方向", "勾配0なら全方向の方向微分が0"], purpose: "最も急に増える方向と最大増加率を求める。",
    commonMistakes: ["最大値を勾配ベクトルそのものとする", "最大方向を単位化しない"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-divergence", topic: "divergence-curl", title: "発散",
    formula: "\\nabla\\cdot\\mathbf a=\\frac{\\partial a_x}{\\partial x}+\\frac{\\partial a_y}{\\partial y}+\\frac{\\partial a_z}{\\partial z}",
    symbols: [{ symbol: "\\mathbf a=(a_x,a_y,a_z)", meaning: "ベクトル場" }, { symbol: "\\nabla\\cdot\\mathbf a", meaning: "正味の湧き出しを表すスカラー" }],
    conditions: ["各成分を対応する座標で偏微分する"], purpose: "流れ場の湧き出し・吸い込みを測る。",
    commonMistakes: ["x成分をyで微分する", "発散をベクトルで答える"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-curl", topic: "divergence-curl", title: "回転",
    formula: "\\nabla\\times\\mathbf a=\\left(\\frac{\\partial a_z}{\\partial y}-\\frac{\\partial a_y}{\\partial z},\\frac{\\partial a_x}{\\partial z}-\\frac{\\partial a_z}{\\partial x},\\frac{\\partial a_y}{\\partial x}-\\frac{\\partial a_x}{\\partial y}\\right)",
    symbols: [{ symbol: "\\nabla\\times\\mathbf a", meaning: "局所的な回転軸・強さを表すベクトル" }],
    conditions: ["右手系の成分順序を使う"], purpose: "ベクトル場の局所的な旋回を求める。",
    commonMistakes: ["第2成分の引き算を逆にする", "z成分Qx-Pyの順序を逆にする"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-vector-identities", topic: "divergence-curl", title: "grad・div・curlの基本恒等式",
    formula: "\\nabla\\times(\\nabla\\phi)=\\mathbf0,\\qquad \\nabla\\cdot(\\nabla\\times\\mathbf a)=0",
    symbols: [{ symbol: "\\mathbf0", meaning: "零ベクトル" }],
    conditions: ["必要な混合偏微分が連続"], purpose: "計算結果の検算と保存場・回転場の基本性質を理解する。",
    commonMistakes: ["div grad=0だと誤記する", "curl divという未定義の演算を書く"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-scalar-line-integral", topic: "line-integrals", title: "スカラー場の線積分",
    formula: "\\int_C\\phi\\,ds=\\int_a^b\\phi(\\mathbf r(t))|\\mathbf r'(t)|\\,dt",
    symbols: [{ symbol: "ds", meaning: "曲線の向きに依存しない長さ要素" }, { symbol: "C", meaning: "積分経路" }],
    conditions: ["曲線をaからbまでパラメータ表示する"], purpose: "曲線上の密度・温度などを長さで重み付けして足す。",
    commonMistakes: ["速さ|r'|を掛け忘れる", "dx型の線積分と混同する"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-component-line-integral", topic: "line-integrals", title: "dx・dy・dzを含む線積分",
    formula: "\\int_C\\phi\\,dx=\\int_a^b\\phi(\\mathbf r(t))x'(t)\\,dt",
    symbols: [{ symbol: "dx", meaning: "x座標の向き付き変化" }],
    conditions: ["dy,dzでは対応するy'(t),z'(t)へ置き換える"], purpose: "座標成分に関する向き付き線積分をパラメータ積分へ直す。",
    commonMistakes: ["x'の代わりに速さ|r'|を掛ける", "経路反転時も符号不変とする"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-vector-line-integral", topic: "line-integrals", title: "ベクトル場の線積分",
    formula: "\\int_C\\mathbf a\\cdot d\\mathbf r=\\int_a^b\\mathbf a(\\mathbf r(t))\\cdot\\mathbf r'(t)\\,dt=\\int_C(a_x\\,dx+a_y\\,dy+a_z\\,dz)",
    symbols: [{ symbol: "d\\mathbf r", meaning: "経路に沿う向き付き微小変位" }],
    conditions: ["場aへ曲線r(t)を代入する", "経路を逆にすると符号反転"], purpose: "力場が経路に沿ってする仕事などを求める。",
    commonMistakes: ["aとr'の内積を取らず成分を足す", "r(t)を場へ代入し忘れる"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-gradient-theorem", topic: "line-integrals", title: "勾配定理",
    formula: "\\int_C\\nabla\\phi\\cdot d\\mathbf r=\\phi(B)-\\phi(A),\\qquad \\oint_C\\nabla\\phi\\cdot d\\mathbf r=0",
    symbols: [{ symbol: "A,B", meaning: "経路Cの始点・終点" }],
    conditions: ["ベクトル場が勾配場nabla phi", "phiが経路を含む領域で定義される"], purpose: "線積分を経路計算せず端点差で求める。",
    commonMistakes: ["始点−終点の順にする", "一般のベクトル場にも無条件で使う"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-scalar-surface-integral", topic: "surface-integrals", title: "スカラー場の面積分",
    formula: "\\int_S\\phi\\,dS=\\iint_D\\phi(\\mathbf r(u,v))|\\mathbf r_u\\times\\mathbf r_v|\\,du\\,dv",
    symbols: [{ symbol: "S", meaning: "曲面" }, { symbol: "D", meaning: "パラメータ領域" }],
    conditions: ["スカラー場phiへ曲面を代入する", "向きには依存しない"], purpose: "曲面上のスカラー量を面積で重み付けして足す。",
    commonMistakes: ["外積の大きさを掛け忘れる", "流束の内積を余計に取る"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-flux", topic: "surface-integrals", title: "流束面積分",
    formula: "\\int_S\\mathbf a\\cdot\\mathbf n\\,dS=\\iint_D\\mathbf a(\\mathbf r(u,v))\\cdot(\\mathbf r_u\\times\\mathbf r_v)\\,du\\,dv",
    symbols: [{ symbol: "\\mathbf n", meaning: "指定向きの単位法線" }, { symbol: "\\mathbf r_u\\times\\mathbf r_v", meaning: "向き付き面積ベクトル" }],
    conditions: ["外積の順序を指定法線方向へ合わせる"], purpose: "曲面を通過するベクトル場の正味量を求める。",
    commonMistakes: ["単位法線と外積の大きさを両方掛けて二重計上する", "向きを逆にして符号を誤る"], scope: "exam-range",
  }),
  applied({
    id: "foundation-applied-green", topic: "green-theorem", title: "グリーンの定理",
    formula: "\\oint_C(P\\,dx+Q\\,dy)=\\iint_D\\left(\\frac{\\partial Q}{\\partial x}-\\frac{\\partial P}{\\partial y}\\right)dA",
    symbols: [{ symbol: "C=\\partial D", meaning: "平面領域Dの境界" }, { symbol: "P,Q", meaning: "平面ベクトル場の成分" }],
    conditions: ["Cは単純閉曲線を正向き（反時計回り）に回る", "P,Qと偏導関数が領域で連続"], purpose: "閉曲線の線積分を領域内の二重積分へ変換する。",
    commonMistakes: ["Px-Qyを使う", "時計回りなのに符号を変えない", "閉じていない曲線へ使う"], scope: "exam-range",
  }),
];

export const STATISTICS_APPLIED_MATH_FOUNDATIONS: MathFoundationEntry[] = [
  ...STATISTICS_MATH_FOUNDATIONS,
  ...APPLIED_MATH_FOUNDATIONS,
];

export const MATH_FOUNDATIONS_BY_SUBJECT: Record<MathFoundationSubjectId, MathFoundationEntry[]> = {
  "subject-7": STATISTICS_MATH_FOUNDATIONS,
  "subject-8": APPLIED_MATH_FOUNDATIONS,
};
