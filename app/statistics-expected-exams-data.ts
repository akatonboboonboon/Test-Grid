import type { StatisticsQuestion, StatisticsTopicId } from "./statistics-data";

export type ExpectedSourceFamily =
  | "past-format"
  | "exercise-pdf1"
  | "exercise-pdf2"
  | "exercise-pdf3"
  | "exercise-pdf4";

export type ExpectedExamDefinition = {
  id: string;
  number: number;
  title: string;
  variant: number;
};

export type ExpectedExamQuestion = StatisticsQuestion & {
  major: number;
  sub: number;
  points: number;
  estimatedMinutes: number;
  sourceFamily: ExpectedSourceFamily;
  linkedCalculation: boolean;
  usesTable: boolean;
};

export type ExpectedExamSection = {
  number: number;
  title: string;
  context: string;
  questions: ExpectedExamQuestion[];
};

export type ExpectedExamPaper = {
  definition: ExpectedExamDefinition;
  sections: ExpectedExamSection[];
  questions: ExpectedExamQuestion[];
  totalPoints: number;
  estimatedMinutes: number;
};

type ExpectedQuestionInput = Omit<StatisticsQuestion, "id" | "source">;

export const EXAM_SECONDS = 50 * 60;
export const PASS_SCORE = 60;
export const TOTAL_POINTS = 100;
export const EXPECTED_MAJOR_COUNT = 11;
export const EXPECTED_SUBQUESTION_COUNT = 32;

const REQUIRED_TOPICS: StatisticsTopicId[] = [
  "descriptive",
  "relation",
  "counting",
  "conditional",
  "random-variable",
  "continuous",
];

const REQUIRED_SOURCE_FAMILIES: ExpectedSourceFamily[] = [
  "past-format",
  "exercise-pdf1",
  "exercise-pdf2",
  "exercise-pdf3",
  "exercise-pdf4",
];

const REQUIRED_GENRES = [
  "2群の統合",
  "エントロピー",
  "算術平均",
  "幾何平均",
  "調和平均",
  "スピアマン順位相関",
  "ケンドール順位相関",
  "平方和の恒等式",
];

export const STATISTICS_EXPECTED_EXAMS: ExpectedExamDefinition[] = Array.from(
  { length: 12 },
  (_, index) => ({
    id: `expected-${String(index + 1).padStart(2, "0")}`,
    number: index + 1,
    title: `過去問準拠・全範囲実戦 ${String(index + 1).padStart(2, "0")}`,
    variant: index + 1,
  }),
);

export const EXPECTED_EXAM_DEFINITIONS_BY_ID = new Map(
  STATISTICS_EXPECTED_EXAMS.map((exam) => [exam.id, exam]),
);

function formatDecimal(value: number, digits = 4) {
  return Number(value.toFixed(digits)).toString();
}

function probabilityAnswer(value: number, digits = 5) {
  return `${formatDecimal(value, digits)}（${formatDecimal(value * 100, 2)}%）`;
}

function combination(n: number, r: number) {
  if (r < 0 || r > n) return 0;
  const shortR = Math.min(r, n - r);
  let result = 1;
  for (let i = 1; i <= shortR; i += 1) result = (result * (n - shortR + i)) / i;
  return result;
}

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function populationVariance(values: number[]) {
  const average = mean(values);
  return values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
}

function populationCovariance(xValues: number[], yValues: number[]) {
  const xAverage = mean(xValues);
  const yAverage = mean(yValues);
  return xValues.reduce(
    (sum, x, index) => sum + (x - xAverage) * (yValues[index] - yAverage),
    0,
  ) / xValues.length;
}

function entropy(probabilities: number[]) {
  return probabilities.reduce(
    (sum, probability) => sum - probability * Math.log2(probability),
    0,
  );
}

function inversionCount(values: number[]) {
  let result = 0;
  for (let left = 0; left < values.length; left += 1) {
    for (let right = left + 1; right < values.length; right += 1) {
      if (values[left] > values[right]) result += 1;
    }
  }
  return result;
}

function makeQuestion(
  definition: ExpectedExamDefinition,
  major: number,
  sub: number,
  points: number,
  estimatedMinutes: number,
  sourceFamily: ExpectedSourceFamily,
  metadata: { linkedCalculation?: boolean; usesTable?: boolean },
  input: ExpectedQuestionInput,
): ExpectedExamQuestion {
  return {
    ...input,
    id: `${definition.id}-m${String(major).padStart(2, "0")}-s${sub}`,
    source: "course-range",
    major,
    sub,
    points,
    estimatedMinutes,
    sourceFamily,
    linkedCalculation: metadata.linkedCalculation ?? false,
    usesTable: metadata.usesTable ?? false,
  };
}

type ProbabilityScenario = {
  context: string;
  first: Pick<ExpectedQuestionInput, "genre" | "prompt" | "answer" | "numericAnswer" | "tolerance" | "formula" | "steps" | "explanation">;
  second: Pick<ExpectedQuestionInput, "genre" | "prompt" | "answer" | "numericAnswer" | "tolerance" | "formula" | "steps" | "explanation">;
};

function buildProbabilityScenario(variant: number): ProbabilityScenario {
  const kind = (variant - 1) % 4;
  if (kind === 0) {
    const red = 4 + (variant % 2);
    const blue = 5 + ((variant + 1) % 2);
    const total = red + blue;
    const denominator = combination(total, 3);
    const exactlyTwo = (combination(red, 2) * blue) / denominator;
    const atLeastOne = 1 - combination(blue, 3) / denominator;
    return {
      context: `赤${red}枚、青${blue}枚のカードから同時に3枚を無作為に取り出す。`,
      first: {
        genre: "組合せ確率",
        prompt: "赤がちょうど2枚となる確率を求めよ。",
        answer: probabilityAnswer(exactlyTwo),
        numericAnswer: exactlyTwo,
        tolerance: 0.0001,
        formula: "P=\\frac{{}_rC_2\\,{}_bC_1}{{}_{r+b}C_3}",
        steps: [`全事象は \\({}_{${total}}C_3=${denominator}\\) 通り。`, `該当する選び方は \\({}_{${red}}C_2\\times{}_{${blue}}C_1=${combination(red, 2) * blue}\\) 通り。`, `したがって \\(P=${formatDecimal(exactlyTwo, 5)}\\)。`],
        explanation: "同時に選ぶため順序を区別せず、赤2枚と青1枚の組合せを全組合せで割る。",
      },
      second: {
        genre: "余事象",
        prompt: "赤が少なくとも1枚含まれる確率を求めよ。",
        answer: probabilityAnswer(atLeastOne),
        numericAnswer: atLeastOne,
        tolerance: 0.0001,
        formula: "P(R\\ge1)=1-P(R=0)",
        steps: [`赤が0枚、すなわち青3枚の確率は \\(\\frac{{}_{${blue}}C_3}{{}_{${total}}C_3}\\)。`, `よって \\(1-\\frac{${combination(blue, 3)}}{${denominator}}=${formatDecimal(atLeastOne, 5)}\\)。`],
        explanation: "『少なくとも1枚』は、赤が1・2・3枚の場合を足すより、赤が0枚の余事象を引くと速い。",
      },
    };
  }

  if (kind === 1) {
    const total = 11 + variant;
    const winners = 3 + (variant % 3);
    const blanks = total - winners;
    const denominator = combination(total, 2);
    const atLeastOne = 1 - combination(blanks, 2) / denominator;
    const exactlyOne = (winners * blanks) / denominator;
    return {
      context: `${total}本のくじに当たりが${winners}本ある。戻さずに同時に2本引く。`,
      first: {
        genre: "くじ・余事象",
        prompt: "少なくとも1本が当たりとなる確率を求めよ。",
        answer: probabilityAnswer(atLeastOne),
        numericAnswer: atLeastOne,
        tolerance: 0.0001,
        formula: "P(W\\ge1)=1-\\frac{{}_bC_2}{{}_nC_2}",
        steps: [`2本とも外れは \\(\\frac{{}_{${blanks}}C_2}{{}_{${total}}C_2}\\)。`, `したがって \\(P=${formatDecimal(atLeastOne, 5)}\\)。`],
        explanation: "戻さず2本を選ぶので組合せを用い、2本とも外れの余事象を取る。",
      },
      second: {
        genre: "くじ・組合せ",
        prompt: "当たりがちょうど1本となる確率を求めよ。",
        answer: probabilityAnswer(exactlyOne),
        numericAnswer: exactlyOne,
        tolerance: 0.0001,
        formula: "P(W=1)=\\frac{{}_wC_1\\,{}_bC_1}{{}_nC_2}",
        steps: [`当たり1本と外れ1本の選び方は \\(${winners}\\times${blanks}=${winners * blanks}\\) 通り。`, `全 \\({}_{${total}}C_2=${denominator}\\) 通りで割り、\\(${formatDecimal(exactlyOne, 5)}\\)。`],
        explanation: "当たり側と外れ側から1本ずつ選ぶ積の法則を使う。",
      },
    };
  }

  if (kind === 2) {
    const greater = 15 / 36;
    const integerRatio = 8 / 36;
    return {
      context: "区別できる公平な6面体さいころA、Bを1回ずつ振り、出目をそれぞれ \\(a,b\\) とする。36通りは同様に確からしい。",
      first: {
        genre: "さいころ",
        prompt: "\\(a>b\\) となる確率を求めよ。",
        answer: probabilityAnswer(greater),
        numericAnswer: greater,
        tolerance: 0.0001,
        formula: "P(A)=\\frac{|A|}{|\\Omega|}",
        steps: ["該当する順序対は、\\(a=2,3,4,5,6\\) ごとに \\(1+2+3+4+5=15\\) 通り。", `よって \\(P=\\frac{15}{36}=${formatDecimal(greater, 5)}\\)。`],
        explanation: "AとBは区別するため順序対で数える。対称性から \\(a>b\\) と \\(a<b\\) は各15通りでもよい。",
      },
      second: {
        genre: "さいころ・比",
        prompt: "\\(a/b\\) が2以上の整数となる確率を求めよ。",
        answer: probabilityAnswer(integerRatio),
        numericAnswer: integerRatio,
        tolerance: 0.0001,
        formula: "P(A)=\\frac{|A|}{36}",
        steps: ["該当する順序対は \\((2,1),(3,1),(4,1),(5,1),(6,1),(4,2),(6,2),(6,3)\\) の8通り。", `したがって \\(P=\\frac{8}{36}=${formatDecimal(integerRatio, 5)}\\)。`],
        explanation: "比が整数という条件を満たす順序対を、分母 \\(b=1,2,3\\) ごとに漏れなく列挙する。",
      },
    };
  }

  const allOnce = 24 / 4 ** 4;
  const exactlyOneA = (combination(4, 1) * 3 ** 3) / 4 ** 4;
  return {
    context: "A、B、C、Dの4文字から毎回等確率で1文字を選び、元に戻す操作を4回行う。結果の順序は区別する。",
    first: {
      genre: "復元抽出",
      prompt: "4文字が1回ずつ現れる確率を求めよ。",
      answer: probabilityAnswer(allOnce),
      numericAnswer: allOnce,
      tolerance: 0.0001,
      formula: "P=\\frac{4!}{4^4}",
      steps: ["全結果は \\(4^4=256\\) 通り。", "4文字を1回ずつ並べる順序は \\(4!=24\\) 通り。", `よって \\(P=${formatDecimal(allOnce, 5)}\\)。`],
      explanation: "復元抽出なので各回4通り。分子は異なる4文字の順列である。",
    },
    second: {
      genre: "二項型計数",
      prompt: "Aがちょうど1回現れる確率を求めよ。",
      answer: probabilityAnswer(exactlyOneA),
      numericAnswer: exactlyOneA,
      tolerance: 0.0001,
      formula: "P=\\frac{{}_4C_1\\,3^3}{4^4}",
      steps: ["Aの位置は \\({}_4C_1=4\\) 通り。", "残り3位置はB、C、Dのいずれでもよく \\(3^3\\) 通り。", `よって \\(P=${formatDecimal(exactlyOneA, 5)}\\)。`],
      explanation: "Aを置く位置を選んだ後、残りをA以外の3文字で埋める。",
    },
  };
}

export function buildExpectedPaper(definition: ExpectedExamDefinition): ExpectedExamPaper {
  const v = definition.variant;

  const descriptiveBase = 18 + 2 * v;
  const descriptiveScale = 1 + (v % 3);
  const offsets = [-4, -2, -1, 0, 1, 2, 3, 5];
  const descriptiveData = offsets.map((offset) => descriptiveBase + offset * descriptiveScale);
  const descriptiveMean = mean(descriptiveData);
  const descriptiveMedian = (descriptiveData[3] + descriptiveData[4]) / 2;
  const descriptiveRange = descriptiveData.at(-1)! - descriptiveData[0];
  const descriptiveMad = descriptiveData.reduce((sum, value) => sum + Math.abs(value - descriptiveMean), 0) / descriptiveData.length;
  const descriptiveVariance = populationVariance(descriptiveData);
  const descriptiveSd = Math.sqrt(descriptiveVariance);
  const descriptiveContext = `次の8個のデータについて答えよ。\\[${descriptiveData.join(",\\quad ")}\\] 分散は母分散（\\(n\\) で割る）とする。`;

  const n1 = 20 + 5 * (v % 3);
  const n2 = 25 + 5 * ((v + 1) % 3);
  const pooledMean1 = 60 + v;
  const pooledMean2 = pooledMean1 + 4 + (v % 4);
  const pooledSd1 = 6 + (v % 3);
  const pooledSd2 = 8 + (v % 4);
  const pooledN = n1 + n2;
  const pooledMean = (n1 * pooledMean1 + n2 * pooledMean2) / pooledN;
  const pooledVariance = (
    n1 * (pooledSd1 ** 2 + (pooledMean1 - pooledMean) ** 2)
    + n2 * (pooledSd2 ** 2 + (pooledMean2 - pooledMean) ** 2)
  ) / pooledN;
  const pooledSd = Math.sqrt(pooledVariance);
  const pooledContext = `同じ満点のテストを2クラスで実施した。各標準偏差は母標準偏差である。\\[\\begin{array}{c|ccc} & 人数 & 平均 & 標準偏差 \\\\ \\hline 1組 & ${n1} & ${pooledMean1} & ${pooledSd1} \\\\ 2組 & ${n2} & ${pooledMean2} & ${pooledSd2} \\end{array}\\]`;

  const residualPatterns = [
    [-2, 1, 1, 1, -1], [-1, 2, -1, 0, 0], [0, -1, 2, -1, 0], [1, -2, 0, 2, -1],
  ] as const;
  const xValues = [1, 2, 3, 4, 5];
  const slope = 2 + (v % 4);
  const intercept = 7 + v;
  const residuals = residualPatterns[(v - 1) % residualPatterns.length];
  const yValues = xValues.map((x, index) => intercept + slope * x + residuals[index]);
  const xMean = mean(xValues);
  const yMean = mean(yValues);
  const xVariance = populationVariance(xValues);
  const yVariance = populationVariance(yValues);
  const covariance = populationCovariance(xValues, yValues);
  const correlation = covariance / Math.sqrt(xVariance * yVariance);
  const regressionSlope = covariance / xVariance;
  const regressionIntercept = yMean - regressionSlope * xMean;
  const predictionX = 6 + (v % 3);
  const predictionY = regressionIntercept + regressionSlope * predictionX;
  const relationContext = `次の対応表を用い、分散・共分散は \\(n\\) で割る。\\[\\begin{array}{c|ccccc}i&1&2&3&4&5\\\\\\hline X_i&${xValues.join("&")}\\\\Y_i&${yValues.join("&")}\\end{array}\\]`;

  const probabilityScenario = buildProbabilityScenario(v);

  const xWhite = 2 + (v % 3);
  const xRed = 3 + ((v + 1) % 2);
  const yWhite = 4 + ((v + 1) % 2);
  const yRed = 1 + (v % 3);
  const pWhiteGivenX = xWhite / (xWhite + xRed);
  const pWhiteGivenY = yWhite / (yWhite + yRed);
  const pWhite = 0.5 * pWhiteGivenX + 0.5 * pWhiteGivenY;
  const pXGivenWhite = (0.5 * pWhiteGivenX) / pWhite;
  const pYGivenWhite = (0.5 * pWhiteGivenY) / pWhite;
  const bayesContext = `箱X、Yをそれぞれ確率 \\(1/2\\) で選び、選んだ箱から球を1個取り出す。箱Xには白${xWhite}個・赤${xRed}個、箱Yには白${yWhite}個・赤${yRed}個が入っている。`;

  const discretePatterns = [
    [0.5, 0.25, 0.125, 0.125],
    [0.4, 0.3, 0.2, 0.1],
    [0.25, 0.25, 0.25, 0.25],
    [0.6, 0.2, 0.1, 0.1],
  ];
  const probabilities = discretePatterns[(v - 1) % discretePatterns.length];
  const values = [0, 1, 2, 3];
  const discreteMean = values.reduce((sum, value, index) => sum + value * probabilities[index], 0);
  const discreteVariance = values.reduce((sum, value, index) => sum + (value - discreteMean) ** 2 * probabilities[index], 0);
  const discreteEntropy = entropy(probabilities);
  const discreteContext = `確率変数 \\(X\\) の分布は次のとおりである。\\[\\begin{array}{c|cccc}x&0&1&2&3\\\\\\hline P(X=x)&${formatDecimal(probabilities[0], 3)}&${formatDecimal(probabilities[1], 3)}&${formatDecimal(probabilities[2], 3)}&k\\end{array}\\] 対数は底2とする。`;

  const meanScale = 1 + (v % 4);
  const meanData = [1, 2, 4, 8].map((value) => value * meanScale);
  const arithmeticMean = mean(meanData);
  const geometricMean = (meanData.reduce((product, value) => product * value, 1)) ** 0.25;
  const harmonicMean = meanData.length / meanData.reduce((sum, value) => sum + 1 / value, 0);
  const meansContext = `正のデータ \\(${meanData.join(",\\ ")}\\) について、3種類の平均を求めよ。`;

  const densityLimit = 2 + 0.5 * (v % 4);
  const densityConstant = 2 / densityLimit ** 2;
  const densityLower = 0.5;
  const densityUpper = densityLimit - 0.5;
  const densityProbability = (densityUpper ** 2 - densityLower ** 2) / densityLimit ** 2;
  const densityContext = `確率密度関数を \\(f(x)=kx\\ (0\\le x\\le ${formatDecimal(densityLimit, 2)})\\)、それ以外では0とする。`;

  const normalRows = [
    { z: 0.5, phi: 0.6915 }, { z: 0.67, phi: 0.7486 }, { z: 0.84, phi: 0.7995 },
    { z: 1, phi: 0.8413 }, { z: 1.15, phi: 0.8749 }, { z: 1.28, phi: 0.8997 },
    { z: 1.41, phi: 0.9207 }, { z: 1.5, phi: 0.9332 }, { z: 1.64, phi: 0.9495 },
    { z: 1.75, phi: 0.9599 }, { z: 1.96, phi: 0.975 }, { z: 2, phi: 0.9772 },
  ] as const;
  const normal = normalRows[v - 1];
  const normalMean = 45 + 3 * v;
  const normalSd = 4 + (v % 5);
  const normalLower = normalMean - normal.z * normalSd;
  const normalUpper = normalMean + normal.z * normalSd;
  const normalProbability = 2 * normal.phi - 1;
  const chebyshevK = 2 + (v % 3);
  const chebyshevProbability = 1 - 1 / chebyshevK ** 2;
  const distributionContext = `\\(X\\sim N(${normalMean},${normalSd}^2)\\) とし、標準正規分布表から \\(\\Phi(${formatDecimal(normal.z, 2)})=${formatDecimal(normal.phi, 4)}\\) を用いてよい。別問では分布形を仮定せずチェビシェフの不等式を用いる。`;

  const rankPatterns = [
    [1, 3, 2, 5, 4, 6, 8, 7], [2, 1, 4, 3, 6, 5, 8, 7], [1, 4, 2, 3, 5, 8, 6, 7],
    [3, 1, 2, 6, 4, 5, 8, 7], [2, 4, 1, 3, 6, 8, 5, 7], [4, 1, 3, 2, 7, 5, 8, 6],
    [1, 5, 2, 6, 3, 7, 4, 8], [5, 1, 6, 2, 7, 3, 8, 4], [8, 1, 7, 2, 6, 3, 5, 4],
    [3, 6, 1, 7, 2, 8, 4, 5], [6, 2, 7, 1, 8, 3, 5, 4], [7, 3, 8, 2, 6, 1, 5, 4],
  ];
  const yRanks = rankPatterns[v - 1];
  const xRanks = [1, 2, 3, 4, 5, 6, 7, 8];
  const rankDifferences = xRanks.map((rank, index) => rank - yRanks[index]);
  const rankSquaredSum = rankDifferences.reduce((sum, difference) => sum + difference ** 2, 0);
  const spearman = 1 - (6 * rankSquaredSum) / (8 * (8 ** 2 - 1));
  const totalPairs = combination(8, 2);
  const discordantPairs = inversionCount(yRanks);
  const concordantPairs = totalPairs - discordantPairs;
  const kendall = (concordantPairs - discordantPairs) / totalPairs;
  const rankContext = `同順位はない。Xの順位を1〜8、対応するYの順位を次表に示す。\\[\\begin{array}{c|cccccccc}i&1&2&3&4&5&6&7&8\\\\\\hline R_{Xi}&${xRanks.join("&")}\\\\R_{Yi}&${yRanks.join("&")}\\end{array}\\]`;

  const sections: ExpectedExamSection[] = [
    {
      number: 1,
      title: "記述統計（過去問型）",
      context: descriptiveContext,
      questions: [
        makeQuestion(definition, 1, 1, 2, 1, "past-format", { linkedCalculation: true, usesTable: true }, { topic: "descriptive", genre: "平均", difficulty: 1, format: "number", prompt: "平均値を求めよ。", context: descriptiveContext, answer: formatDecimal(descriptiveMean), numericAnswer: descriptiveMean, formula: "\\bar{x}=\\frac{1}{n}\\sum_{i=1}^{n}x_i", expandedFormula: `\\bar{x}=\\frac{${descriptiveData.join("+")}}{8}`, steps: [`合計は \\(${formatDecimal(descriptiveData.reduce((sum, value) => sum + value, 0))}\\)。`, `8で割り、\\(\\bar{x}=${formatDecimal(descriptiveMean)}\\)。`], explanation: "平均は全データの合計を個数で割る。後続の平均偏差・分散でも同じ平均を使う。" }),
        makeQuestion(definition, 1, 2, 2, 1, "past-format", { linkedCalculation: true, usesTable: true }, { topic: "descriptive", genre: "中央値", difficulty: 1, format: "number", prompt: "中央値を求めよ。", context: descriptiveContext, answer: formatDecimal(descriptiveMedian), numericAnswer: descriptiveMedian, formula: "\\operatorname{Med}=\\frac{x_{(4)}+x_{(5)}}{2}", steps: [`8個なので中央は4番目 \\(${descriptiveData[3]}\\) と5番目 \\(${descriptiveData[4]}\\)。`, `平均して \\(${formatDecimal(descriptiveMedian)}\\)。`], explanation: "偶数個の中央値は、昇順で中央に並ぶ2値の平均である。" }),
        makeQuestion(definition, 1, 3, 2, 1, "past-format", { linkedCalculation: true, usesTable: true }, { topic: "descriptive", genre: "レンジ", difficulty: 1, format: "number", prompt: "レンジ（範囲）を求めよ。", context: descriptiveContext, answer: formatDecimal(descriptiveRange), numericAnswer: descriptiveRange, formula: "R=x_{\\max}-x_{\\min}", steps: [`最大値${descriptiveData.at(-1)}から最小値${descriptiveData[0]}を引く。`, `\\(R=${descriptiveRange}\\)。`], explanation: "レンジは最大値と最小値の差であり、データ個数では割らない。" }),
        makeQuestion(definition, 1, 4, 2, 1, "past-format", { linkedCalculation: true, usesTable: true }, { topic: "descriptive", genre: "平均偏差", difficulty: 2, format: "number", prompt: "平均偏差を求めよ。", context: descriptiveContext, answer: formatDecimal(descriptiveMad, 5), numericAnswer: descriptiveMad, tolerance: 0.001, formula: "MD=\\frac{1}{n}\\sum_{i=1}^{n}|x_i-\\bar{x}|", expandedFormula: `MD=\\frac{${descriptiveData.map((value) => `|${value}-${formatDecimal(descriptiveMean)}|`).join("+")}}{8}`, steps: [`(1)の平均 \\(${formatDecimal(descriptiveMean)}\\) からの距離をすべて足す。`, `8で割り、\\(MD=${formatDecimal(descriptiveMad, 5)}\\)。`], explanation: "平均との差の符号を消すため絶対値を用いる。分散のように二乗しない。" }),
        makeQuestion(definition, 1, 5, 3, 1.5, "past-format", { linkedCalculation: true, usesTable: true }, { topic: "descriptive", genre: "母分散", difficulty: 2, format: "number", prompt: "母分散を求めよ。", context: descriptiveContext, answer: formatDecimal(descriptiveVariance, 5), numericAnswer: descriptiveVariance, tolerance: 0.001, formula: "\\sigma^2=\\frac{1}{n}\\sum_{i=1}^{n}(x_i-\\bar{x})^2", expandedFormula: `\\sigma^2=\\frac{${descriptiveData.map((value) => `(${value}-${formatDecimal(descriptiveMean)})^2`).join("+")}}{8}`, steps: [`平均 \\(${formatDecimal(descriptiveMean)}\\) からの偏差を二乗して合計する。`, `母分散なので8で割り、\\(\\sigma^2=${formatDecimal(descriptiveVariance, 5)}\\)。`], explanation: "設問指定どおり母分散を使うため、分母は \\(n-1\\) ではなく \\(n=8\\) である。" }),
        makeQuestion(definition, 1, 6, 3, 1.5, "past-format", { linkedCalculation: true, usesTable: true }, { topic: "descriptive", genre: "母標準偏差", difficulty: 2, format: "number", prompt: "母標準偏差を求めよ。", context: descriptiveContext, answer: formatDecimal(descriptiveSd, 5), numericAnswer: descriptiveSd, tolerance: 0.001, formula: "\\sigma=\\sqrt{\\sigma^2}", steps: [`(5)の母分散 \\(${formatDecimal(descriptiveVariance, 5)}\\) の正の平方根を取る。`, `\\(\\sigma=${formatDecimal(descriptiveSd, 5)}\\)。`], explanation: "標準偏差は分散の正の平方根。単位が元データと同じに戻る。" }),
      ],
    },
    {
      number: 2,
      title: "2群の平均・標準偏差",
      context: pooledContext,
      questions: [
        makeQuestion(definition, 2, 1, 4, 1.5, "past-format", { linkedCalculation: true, usesTable: true }, { topic: "descriptive", genre: "2群の統合", difficulty: 2, format: "number", prompt: `全体${pooledN}人の平均点を求めよ。`, context: pooledContext, answer: formatDecimal(pooledMean, 5), numericAnswer: pooledMean, tolerance: 0.001, formula: "\\bar{x}=\\frac{n_1\\bar{x}_1+n_2\\bar{x}_2}{n_1+n_2}", steps: [`総得点は \\(${n1}\\times${pooledMean1}+${n2}\\times${pooledMean2}\\)。`, `人数${pooledN}で割り、\\(\\bar{x}=${formatDecimal(pooledMean, 5)}\\)。`], explanation: "クラス平均を単純平均せず、人数を重みとして全得点を復元する。" }),
        makeQuestion(definition, 2, 2, 4, 2.5, "past-format", { linkedCalculation: true, usesTable: true }, { topic: "descriptive", genre: "2群の統合標準偏差", difficulty: 3, format: "number", prompt: "全体の母標準偏差を求めよ。", context: pooledContext, answer: formatDecimal(pooledSd, 5), numericAnswer: pooledSd, tolerance: 0.001, formula: "\\sigma^2=\\frac{n_1\\{\\sigma_1^2+(\\bar{x}_1-\\bar{x})^2\\}+n_2\\{\\sigma_2^2+(\\bar{x}_2-\\bar{x})^2\\}}{n_1+n_2}", steps: [`全体平均は \\(${formatDecimal(pooledMean, 5)}\\)。`, `群内分散に群平均と全体平均のずれを加え、人数で重み付けする。`, `\\(\\sigma^2=${formatDecimal(pooledVariance, 5)}\\)、したがって \\(\\sigma=${formatDecimal(pooledSd, 5)}\\)。`], explanation: "全体のばらつきは『各群内のばらつき』と『群平均どうしのずれ』の両方を含む。標準偏差だけを加重平均してはいけない。" }),
      ],
    },
    {
      number: 3,
      title: "相関・回帰（表データ）",
      context: relationContext,
      questions: [
        makeQuestion(definition, 3, 1, 3, 1, "exercise-pdf1", { linkedCalculation: true, usesTable: true }, { topic: "relation", genre: "2変量の平均", difficulty: 1, format: "text", prompt: "\\(\\bar{X},\\bar{Y}\\) を求めよ。", context: relationContext, answer: `\\(\\bar{X}=${formatDecimal(xMean)},\\quad\\bar{Y}=${formatDecimal(yMean)}\\)`, accepted: [`${formatDecimal(xMean)}, ${formatDecimal(yMean)}`], keywords: [formatDecimal(xMean), formatDecimal(yMean)], minKeywords: 2, formula: "\\bar{X}=\\frac{x_1+\\cdots+x_n}{n},\\quad\\bar{Y}=\\frac{y_1+\\cdots+y_n}{n}", steps: [`Xの合計を5で割ると \\(${formatDecimal(xMean)}\\)。`, `Yの合計を5で割ると \\(${formatDecimal(yMean)}\\)。`], explanation: "後続の共分散で使うため、XとYを別々に平均する。" }),
        makeQuestion(definition, 3, 2, 3, 2, "exercise-pdf1", { linkedCalculation: true, usesTable: true }, { topic: "relation", genre: "母共分散", difficulty: 2, format: "number", prompt: "母共分散 \\(\\sigma_{XY}\\) を求めよ。", context: relationContext, answer: formatDecimal(covariance, 5), numericAnswer: covariance, tolerance: 0.001, formula: "\\sigma_{XY}=\\frac{1}{n}\\sum_{i=1}^{n}(x_i-\\bar{x})(y_i-\\bar{y})", expandedFormula: `\\sigma_{XY}=\\frac{${xValues.map((x, index) => `(${x}-${formatDecimal(xMean)})(${yValues[index]}-${formatDecimal(yMean)})`).join("+")}}{5}`, steps: [`各組の偏差積を計算して合計する。`, `5で割り、\\(\\sigma_{XY}=${formatDecimal(covariance, 5)}\\)。`], explanation: "対応のない値を掛けないこと。表の同じ列にあるXとYの偏差どうしを掛ける。" }),
        makeQuestion(definition, 3, 3, 3, 2, "exercise-pdf1", { linkedCalculation: true, usesTable: true }, { topic: "relation", genre: "ピアソン相関", difficulty: 2, format: "number", prompt: "ピアソンの相関係数 \\(r\\) を求めよ。", context: relationContext, answer: formatDecimal(correlation, 5), numericAnswer: correlation, tolerance: 0.001, formula: "r=\\frac{\\sigma_{XY}}{\\sigma_X\\sigma_Y}", steps: [`\\(\\sigma_X^2=${formatDecimal(xVariance, 5)},\\ \\sigma_Y^2=${formatDecimal(yVariance, 5)}\\)。`, `(2)の共分散を標準偏差の積で割り、\\(r=${formatDecimal(correlation, 5)}\\)。`], explanation: "相関係数は共分散を無次元化した値。必ず \\(-1\\) から1の範囲に入る。" }),
        makeQuestion(definition, 3, 4, 3, 2, "exercise-pdf1", { linkedCalculation: true, usesTable: true }, { topic: "relation", genre: "回帰予測", difficulty: 3, format: "number", prompt: `YのXへの回帰直線を求め、\\(X=${predictionX}\\) のときのYを予測せよ。解答欄には予測値を書くこと。`, context: relationContext, answer: formatDecimal(predictionY, 5), numericAnswer: predictionY, tolerance: 0.01, formula: "b=\\frac{\\sigma_{XY}}{\\sigma_X^2},\\quad a=\\bar{y}-b\\bar{x},\\quad\\hat{y}=a+bx", steps: [`傾き \\(b=${formatDecimal(regressionSlope, 5)}\\)、切片 \\(a=${formatDecimal(regressionIntercept, 5)}\\)。`, `回帰直線は \\(\\hat{y}=${formatDecimal(regressionIntercept, 5)}+${formatDecimal(regressionSlope, 5)}x\\)。`, `\\(x=${predictionX}\\) を代入し、\\(\\hat{y}=${formatDecimal(predictionY, 5)}\\)。`], explanation: "傾きは共分散をXの分散で割る。直線が平均点 \\((\\bar{x},\\bar{y})\\) を通ることも確認する。" }),
      ],
    },
    {
      number: 4,
      title: "場合の数と確率（演習PDF2型）",
      context: probabilityScenario.context,
      questions: [
        makeQuestion(definition, 4, 1, 3, 2, "exercise-pdf2", { linkedCalculation: true }, { topic: "counting", difficulty: 2, format: "number", context: probabilityScenario.context, ...probabilityScenario.first }),
        makeQuestion(definition, 4, 2, 4, 2, "exercise-pdf2", { linkedCalculation: true }, { topic: "counting", difficulty: 2, format: "number", context: probabilityScenario.context, ...probabilityScenario.second }),
      ],
    },
    {
      number: 5,
      title: "全確率・Bayes（演習PDF3型）",
      context: bayesContext,
      questions: [
        makeQuestion(definition, 5, 1, 3, 1, "exercise-pdf3", { linkedCalculation: true }, { topic: "conditional", genre: "全確率", difficulty: 2, format: "number", prompt: "白球が出る確率を求めよ。", context: bayesContext, answer: probabilityAnswer(pWhite), numericAnswer: pWhite, tolerance: 0.0001, formula: "P(W)=P(X)P(W\\mid X)+P(Y)P(W\\mid Y)", steps: [`X経路は \\(\\frac12\\cdot\\frac{${xWhite}}{${xWhite + xRed}}\\)、Y経路は \\(\\frac12\\cdot\\frac{${yWhite}}{${yWhite + yRed}}\\)。`, `加えて \\(P(W)=${formatDecimal(pWhite, 5)}\\)。`], explanation: "白球に至る互いに排反なX経路とY経路の確率を足す。" }),
        makeQuestion(definition, 5, 2, 3, 1.5, "exercise-pdf3", { linkedCalculation: true }, { topic: "conditional", genre: "Bayes・箱X", difficulty: 3, format: "number", prompt: "白球が出たとき、それが箱Xから出た条件付き確率を求めよ。", context: bayesContext, answer: probabilityAnswer(pXGivenWhite), numericAnswer: pXGivenWhite, tolerance: 0.001, formula: "P(X\\mid W)=\\frac{P(X)P(W\\mid X)}{P(W)}", steps: [`分子は \\(\\frac12\\cdot\\frac{${xWhite}}{${xWhite + xRed}}\\)。`, `分母には(1)の \\(P(W)=${formatDecimal(pWhite, 5)}\\) を使う。`, `\\(P(X\\mid W)=${formatDecimal(pXGivenWhite, 5)}\\)。`], explanation: "観測後の確率なのでBayesの定理を使う。分母は白球が出る全経路である。" }),
        makeQuestion(definition, 5, 3, 3, 1.5, "exercise-pdf3", { linkedCalculation: true }, { topic: "conditional", genre: "Bayes・箱Y", difficulty: 3, format: "number", prompt: "白球が出たとき、それが箱Yから出た条件付き確率を求めよ。", context: bayesContext, answer: probabilityAnswer(pYGivenWhite), numericAnswer: pYGivenWhite, tolerance: 0.001, formula: "P(Y\\mid W)=\\frac{P(Y)P(W\\mid Y)}{P(W)}", steps: [`分子は \\(\\frac12\\cdot\\frac{${yWhite}}{${yWhite + yRed}}\\)。`, `分母は(1)の \\(P(W)\\)。`, `\\(P(Y\\mid W)=${formatDecimal(pYGivenWhite, 5)}\\)。なお(2)との和は1。`], explanation: "箱はXかYのどちらかなので、検算として \\(P(X\\mid W)+P(Y\\mid W)=1\\) になる。" }),
      ],
    },
    {
      number: 6,
      title: "離散分布・エントロピー",
      context: discreteContext,
      questions: [
        makeQuestion(definition, 6, 1, 3, 1, "past-format", { linkedCalculation: true, usesTable: true }, { topic: "random-variable", genre: "確率分布", difficulty: 1, format: "number", prompt: "定数 \\(k\\) を求めよ。", context: discreteContext, answer: formatDecimal(probabilities[3], 3), numericAnswer: probabilities[3], formula: "\\sum_{i=0}^{3}p_i=1", expandedFormula: `${formatDecimal(probabilities[0], 3)}+${formatDecimal(probabilities[1], 3)}+${formatDecimal(probabilities[2], 3)}+k=1`, steps: [`既知の3確率を1から引く。`, `\\(k=${formatDecimal(probabilities[3], 3)}\\)。`], explanation: "離散確率分布の確率の総和は1である。" }),
        makeQuestion(definition, 6, 2, 3, 1.5, "past-format", { linkedCalculation: true, usesTable: true }, { topic: "random-variable", genre: "期待値", difficulty: 2, format: "number", prompt: "期待値 \\(E[X]\\) を求めよ。", context: discreteContext, answer: formatDecimal(discreteMean, 5), numericAnswer: discreteMean, tolerance: 0.0001, formula: "E[X]=\\sum_{i=0}^{3}x_ip_i", expandedFormula: `E[X]=0\\times${probabilities[0]}+1\\times${probabilities[1]}+2\\times${probabilities[2]}+3\\times${probabilities[3]}`, steps: [`値と対応する確率を掛けて加える。`, `\\(E[X]=${formatDecimal(discreteMean, 5)}\\)。`], explanation: "表の同じ列の \\(x\\) と確率を掛け、すべて足す。" }),
        makeQuestion(definition, 6, 3, 3, 2, "past-format", { linkedCalculation: true, usesTable: true }, { topic: "random-variable", genre: "離散分散", difficulty: 3, format: "number", prompt: "分散 \\(V(X)\\) を求めよ。", context: discreteContext, answer: formatDecimal(discreteVariance, 5), numericAnswer: discreteVariance, tolerance: 0.0001, formula: "V(X)=\\sum_{i=0}^{3}(x_i-\\mu)^2p_i", expandedFormula: `V(X)=(0-${formatDecimal(discreteMean)})^2\\times${probabilities[0]}+(1-${formatDecimal(discreteMean)})^2\\times${probabilities[1]}+(2-${formatDecimal(discreteMean)})^2\\times${probabilities[2]}+(3-${formatDecimal(discreteMean)})^2\\times${probabilities[3]}`, steps: [`(2)の平均 \\(\\mu=${formatDecimal(discreteMean)}\\) を用いる。`, `各偏差平方を確率で重み付けし、\\(V(X)=${formatDecimal(discreteVariance, 5)}\\)。`], explanation: "確率付きデータの分散。各値が現れる頻度の代わりに確率を重みとして使う。" }),
        makeQuestion(definition, 6, 4, 3, 1.5, "past-format", { linkedCalculation: true, usesTable: true }, { topic: "random-variable", genre: "エントロピー", difficulty: 3, format: "number", prompt: "エントロピー \\(H(X)\\) をbit単位で求めよ。", context: discreteContext, answer: `${formatDecimal(discreteEntropy, 5)} bit`, numericAnswer: discreteEntropy, tolerance: 0.001, formula: "H(X)=-\\sum_{i=0}^{3}p_i\\log_2p_i", expandedFormula: `H(X)=-(${probabilities.map((probability) => `${probability}\\log_2${probability}`).join("+")})`, steps: ["各確率について \\(-p\\log_2p\\) を計算する。", `合計して \\(H(X)=${formatDecimal(discreteEntropy, 5)}\\,\\mathrm{bit}\\)。`], explanation: "底2なので単位はbit。確率が均等に近いほど不確実性が大きく、エントロピーも大きい。" }),
      ],
    },
    {
      number: 7,
      title: "算術・幾何・調和平均",
      context: meansContext,
      questions: [
        makeQuestion(definition, 7, 1, 2, 1, "past-format", { linkedCalculation: true }, { topic: "descriptive", genre: "算術平均", difficulty: 1, format: "number", prompt: "算術平均 \\(A\\) を求めよ。", context: meansContext, answer: formatDecimal(arithmeticMean, 5), numericAnswer: arithmeticMean, formula: "A=\\frac{x_1+x_2+x_3+x_4}{4}", steps: [`\\(A=\\frac{${meanData.join("+")}}{4}=${formatDecimal(arithmeticMean, 5)}\\)。`], explanation: "通常の平均であり、値を足して個数で割る。" }),
        makeQuestion(definition, 7, 2, 2, 1, "past-format", { linkedCalculation: true }, { topic: "descriptive", genre: "幾何平均", difficulty: 2, format: "number", prompt: "幾何平均 \\(G\\) を求めよ。", context: meansContext, answer: formatDecimal(geometricMean, 5), numericAnswer: geometricMean, tolerance: 0.001, formula: "G=\\sqrt[4]{x_1x_2x_3x_4}", steps: [`\\(G=\\sqrt[4]{${meanData.join("\\times")}}\\)。`, `\\(G=${formatDecimal(geometricMean, 5)}\\)。`], explanation: "正の値の積の4乗根。倍率や成長率の代表値に向く。" }),
        makeQuestion(definition, 7, 3, 2, 1, "past-format", { linkedCalculation: true }, { topic: "descriptive", genre: "調和平均", difficulty: 2, format: "number", prompt: "調和平均 \\(H\\) を求めよ。", context: meansContext, answer: formatDecimal(harmonicMean, 5), numericAnswer: harmonicMean, tolerance: 0.001, formula: "H=\\frac{4}{\\frac1{x_1}+\\frac1{x_2}+\\frac1{x_3}+\\frac1{x_4}}", steps: [`逆数和は \\(\\frac1{${meanData[0]}}+\\frac1{${meanData[1]}}+\\frac1{${meanData[2]}}+\\frac1{${meanData[3]}}\\)。`, `4を逆数和で割り、\\(H=${formatDecimal(harmonicMean, 5)}\\)。`], explanation: "逆数を算術平均してから、もう一度逆数を取る平均である。" }),
      ],
    },
    {
      number: 8,
      title: "連続型確率変数（演習PDF4型）",
      context: densityContext,
      questions: [
        makeQuestion(definition, 8, 1, 4, 1.5, "exercise-pdf4", { linkedCalculation: true }, { topic: "continuous", genre: "密度の正規化", difficulty: 2, format: "number", prompt: "\\(f(x)\\) が確率密度関数となる定数 \\(k\\) を求めよ。", context: densityContext, answer: formatDecimal(densityConstant, 5), numericAnswer: densityConstant, tolerance: 0.0001, formula: "\\int_0^Lkx\\,dx=1", steps: [`\\(\\frac{kL^2}{2}=1\\) より \\(k=\\frac{2}{L^2}\\)。`, `\\(L=${formatDecimal(densityLimit, 2)}\\) を代入し、\\(k=${formatDecimal(densityConstant, 5)}\\)。`], explanation: "密度曲線の定義域全体にわたる面積を1に合わせる。" }),
        makeQuestion(definition, 8, 2, 4, 2.5, "exercise-pdf4", { linkedCalculation: true }, { topic: "continuous", genre: "区間確率", difficulty: 3, format: "number", prompt: `\\(P(${formatDecimal(densityLower, 2)}\\le X\\le ${formatDecimal(densityUpper, 2)})\\) を求めよ。`, context: densityContext, answer: probabilityAnswer(densityProbability), numericAnswer: densityProbability, tolerance: 0.0001, formula: "P(a\\le X\\le b)=\\int_a^bf(x)\\,dx", steps: [`(1)の \\(k=${formatDecimal(densityConstant, 5)}\\) を使う。`, `\\(\\int_{${densityLower}}^{${formatDecimal(densityUpper, 2)}}kx\\,dx=\\frac{k}{2}(b^2-a^2)\\)。`, `\\(P=${formatDecimal(densityProbability, 5)}\\)。`], explanation: "指定区間だけ密度を積分する。連続分布では端点を含むかどうかで確率は変わらない。" }),
      ],
    },
    {
      number: 9,
      title: "正規分布・チェビシェフ",
      context: distributionContext,
      questions: [
        makeQuestion(definition, 9, 1, 4, 2, "exercise-pdf4", { linkedCalculation: true }, { topic: "continuous", genre: "正規分布表", difficulty: 2, format: "number", prompt: `\\(P(${formatDecimal(normalLower, 2)}\\le X\\le ${formatDecimal(normalUpper, 2)})\\) を求めよ。`, context: distributionContext, answer: probabilityAnswer(normalProbability, 4), numericAnswer: normalProbability, tolerance: 0.0001, formula: "P(-z\\le Z\\le z)=2\\Phi(z)-1", steps: [`両端を標準化すると \\(-${formatDecimal(normal.z, 2)}\\) と \\(${formatDecimal(normal.z, 2)}\\)。`, `対称性より \\(2\\Phi(${formatDecimal(normal.z, 2)})-1=${formatDecimal(normalProbability, 4)}\\)。`], explanation: "平均を中心とする左右対称区間なので、上側累積確率から中央確率へ変換する。" }),
        makeQuestion(definition, 9, 2, 3, 2, "exercise-pdf4", { linkedCalculation: true }, { topic: "continuous", genre: "チェビシェフ", difficulty: 2, format: "number", prompt: `分布形を仮定しないとき、平均から${chebyshevK}標準偏差以内に入る確率の下限を求めよ。`, context: distributionContext, answer: probabilityAnswer(chebyshevProbability), numericAnswer: chebyshevProbability, tolerance: 0.0001, formula: "P(|X-\\mu|<k\\sigma)\\ge1-\\frac1{k^2}", steps: [`\\(k=${chebyshevK}\\) を代入する。`, `下限は \\(1-\\frac1{${chebyshevK}^2}=${formatDecimal(chebyshevProbability, 5)}\\)。`], explanation: "正規分布表は使わない。チェビシェフの不等式は分布形を問わず保証される下限である。" }),
      ],
    },
    {
      number: 10,
      title: "順位相関（過去問型）",
      context: rankContext,
      questions: [
        makeQuestion(definition, 10, 1, 4, 2, "past-format", { linkedCalculation: true, usesTable: true }, { topic: "relation", genre: "スピアマン順位相関", difficulty: 3, format: "number", prompt: "スピアマンの順位相関係数 \\(r_s\\) を求めよ。", context: rankContext, answer: formatDecimal(spearman, 5), numericAnswer: spearman, tolerance: 0.001, formula: "r_s=1-\\frac{6\\sum_{i=1}^{8}d_i^2}{8(8^2-1)}", expandedFormula: `r_s=1-\\frac{6\\{${rankDifferences.map((difference) => `(${difference})^2`).join("+")}\\}}{8(8^2-1)}`, steps: [`順位差は \\(${rankDifferences.join(",")}\\)、平方和は \\(${rankSquaredSum}\\)。`, `公式へ代入し、\\(r_s=${formatDecimal(spearman, 5)}\\)。`], explanation: "同順位がないため基本公式をそのまま使える。順位差はX順位−Y順位で統一する。" }),
        makeQuestion(definition, 10, 2, 3, 1.5, "past-format", { linkedCalculation: true, usesTable: true }, { topic: "relation", genre: "ケンドールのペア", difficulty: 2, format: "text", prompt: "全ペア数 \\(N\\)、順方向ペア数 \\(C\\)、逆方向ペア数 \\(D\\) を求めよ。", context: rankContext, answer: `\\(N=${totalPairs},\\ C=${concordantPairs},\\ D=${discordantPairs}\\)`, accepted: [`${totalPairs}, ${concordantPairs}, ${discordantPairs}`], keywords: [String(totalPairs), String(concordantPairs), String(discordantPairs)], minKeywords: 3, formula: "N={}_8C_2,\\quad C+D=N", steps: [`全ペア数は \\({}_8C_2=${totalPairs}\\)。`, `Y順位列の転倒数を数えると \\(D=${discordantPairs}\\)。`, `\\(C=${totalPairs}-${discordantPairs}=${concordantPairs}\\)。`], explanation: "X順位は昇順なので、Y順位が逆転するペアが不一致D、それ以外が一致Cである。" }),
        makeQuestion(definition, 10, 3, 4, 1.5, "past-format", { linkedCalculation: true, usesTable: true }, { topic: "relation", genre: "ケンドール順位相関", difficulty: 3, format: "number", prompt: "ケンドールの順位相関係数 \\(r_K\\) を求めよ。", context: rankContext, answer: formatDecimal(kendall, 5), numericAnswer: kendall, tolerance: 0.001, formula: "r_K=\\frac{C-D}{{}_nC_2}", steps: [`(2)の \\(C=${concordantPairs},D=${discordantPairs},N=${totalPairs}\\) を使う。`, `\\(r_K=\\frac{${concordantPairs}-${discordantPairs}}{${totalPairs}}=${formatDecimal(kendall, 5)}\\)。`], explanation: "一致ペアが多いほど正、逆転ペアが多いほど負に近づく。範囲は \\(-1\\) から1。" }),
      ],
    },
    {
      number: 11,
      title: "平方和の恒等式（証明）",
      context: "任意の実数 \\(a\\) とデータ \\(x_1,\\ldots,x_n\\) を考える。",
      questions: [
        makeQuestion(definition, 11, 1, 6, 2, "past-format", { linkedCalculation: true }, { topic: "descriptive", genre: "平方和の恒等式", difficulty: 3, format: "text", prompt: "次の等式を証明せよ。\\[\\sum_{i=1}^{n}(x_i-a)^2=\\sum_{i=1}^{n}(x_i-\\bar{x})^2+n(\\bar{x}-a)^2\\]", context: "途中で交差項が0になる理由まで書くこと。", answer: "\\(x_i-a=(x_i-\\bar{x})+(\\bar{x}-a)\\) と分解して二乗和を展開する。交差項は \\(2(\\bar{x}-a)\\sum(x_i-\\bar{x})=0\\) であるため、目的の等式を得る。", accepted: ["平均との差の和が0なので、展開した交差項が消える"], keywords: ["展開", "交差項", "0"], minKeywords: 3, formula: "\\sum_{i=1}^{n}(x_i-a)^2=\\sum_{i=1}^{n}(x_i-\\bar{x})^2+n(\\bar{x}-a)^2", expandedFormula: `(x_1-a)^2+\\cdots+(x_n-a)^2=(x_1-\\bar{x})^2+\\cdots+(x_n-\\bar{x})^2+n(\\bar{x}-a)^2`, steps: [`\\(x_i-a=(x_i-\\bar{x})+(\\bar{x}-a)\\) と書く。`, `二乗して全iについて足すと、偏差平方和、交差項、\\(n(\\bar{x}-a)^2\\) に分かれる。`, `交差項は \\(2(\\bar{x}-a)\\{(x_1-\\bar{x})+\\cdots+(x_n-\\bar{x})\\}=0\\)。`, `よって右辺の2項だけが残り、等式が成り立つ。`], explanation: "平均からの偏差の和が0になる性質が核心。この恒等式は平均が平方誤差を最小にすることにもつながる。" }),
      ],
    },
  ];

  const questions = sections.flatMap((section) => section.questions);
  return {
    definition,
    sections,
    questions,
    totalPoints: questions.reduce((sum, question) => sum + question.points, 0),
    estimatedMinutes: questions.reduce((sum, question) => sum + question.estimatedMinutes, 0),
  };
}

function validateExpectedPaper(paper: ExpectedExamPaper) {
  if (paper.sections.length !== EXPECTED_MAJOR_COUNT) throw new Error(`${paper.definition.id}: expected ${EXPECTED_MAJOR_COUNT} major questions`);
  if (paper.questions.length !== EXPECTED_SUBQUESTION_COUNT) throw new Error(`${paper.definition.id}: expected ${EXPECTED_SUBQUESTION_COUNT} subquestions`);
  if (paper.totalPoints !== TOTAL_POINTS) throw new Error(`${paper.definition.id}: point total is ${paper.totalPoints}, expected ${TOTAL_POINTS}`);
  if (Math.abs(paper.estimatedMinutes - 50) > 1e-9) throw new Error(`${paper.definition.id}: estimated time is ${paper.estimatedMinutes}, expected 50`);
  if (new Set(paper.questions.map((question) => question.id)).size !== paper.questions.length) throw new Error(`${paper.definition.id}: duplicate subquestion IDs`);
  for (const topic of REQUIRED_TOPICS) {
    if (!paper.questions.some((question) => question.topic === topic)) throw new Error(`${paper.definition.id}: missing topic ${topic}`);
  }
  for (const sourceFamily of REQUIRED_SOURCE_FAMILIES) {
    if (!paper.questions.some((question) => question.sourceFamily === sourceFamily)) throw new Error(`${paper.definition.id}: missing source family ${sourceFamily}`);
  }
  for (const genre of REQUIRED_GENRES) {
    if (!paper.questions.some((question) => question.genre === genre)) throw new Error(`${paper.definition.id}: missing genre ${genre}`);
  }
  if (paper.questions.filter((question) => question.difficulty === 3).length < 8) throw new Error(`${paper.definition.id}: too few difficult questions`);
  if (paper.questions.filter((question) => question.linkedCalculation).length < 24) throw new Error(`${paper.definition.id}: too few linked calculations`);
  if (paper.questions.filter((question) => question.usesTable).length < 16) throw new Error(`${paper.definition.id}: too few table-data questions`);
  const searchableText = paper.questions.map((question) => `${question.genre} ${question.prompt} ${question.context ?? ""}`).join(" ");
  if (/モンティ|Monty/i.test(searchableText)) throw new Error(`${paper.definition.id}: excluded Monty Hall topic found`);
  for (const question of paper.questions) {
    if (!question.answer.trim() || question.steps.length === 0 || !question.explanation.trim()) throw new Error(`${question.id}: incomplete answer material`);
    if (question.format === "number" && !Number.isFinite(question.numericAnswer)) throw new Error(`${question.id}: numeric question lacks numericAnswer`);
    if (!question.formula?.includes("\\sum")) continue;
    if (!question.expandedFormula || question.expandedFormula.includes("\\sum")) {
      throw new Error(`${question.id}: every Sigma formula requires a Sigma-free expandedFormula`);
    }
  }
}

export const EXPECTED_PAPERS_BY_ID = new Map(
  STATISTICS_EXPECTED_EXAMS.map((definition) => {
    const paper = buildExpectedPaper(definition);
    validateExpectedPaper(paper);
    return [definition.id, paper];
  }),
);

/** 予想模試と同じ計算密度を通常演習・ランダム確認でも使うためのプール。 */
export const STATISTICS_EXAM_LEVEL_QUESTIONS: StatisticsQuestion[] = [
  ...EXPECTED_PAPERS_BY_ID.values(),
].flatMap((paper) =>
  paper.sections.flatMap((section) =>
    section.questions
      .map((question, index) => {
        const previousPrompts = section.questions.slice(0, index)
          .map((previous) => `大問${previous.major}(${previous.sub})：${previous.prompt}`)
          .join(" ／ ");
        return {
          ...question,
          context: [section.context, question.context !== section.context ? question.context : "",
            question.linkedCalculation && previousPrompts ? `【同じ大問の前問】${previousPrompts}` : "",
          ].filter(Boolean).join("\n"),
          prompt: `${question.prompt} 必要な中間量は、GIVENの条件から自分で求めること。`,
        };
      })
      .filter((question) => question.difficulty >= 2),
  ),
);

export const STATISTICS_EXPECTED_EXAM_AUDIT = STATISTICS_EXPECTED_EXAMS.map((definition) => {
  const paper = EXPECTED_PAPERS_BY_ID.get(definition.id)!;
  return {
    id: definition.id,
    majorQuestions: paper.sections.length,
    subquestions: paper.questions.length,
    points: paper.totalPoints,
    estimatedMinutes: paper.estimatedMinutes,
    difficultQuestions: paper.questions.filter((question) => question.difficulty === 3).length,
    linkedQuestions: paper.questions.filter((question) => question.linkedCalculation).length,
    tableQuestions: paper.questions.filter((question) => question.usesTable).length,
    sourceFamilies: [...new Set(paper.questions.map((question) => question.sourceFamily))],
    genres: [...new Set(paper.questions.map((question) => question.genre))],
  };
});
