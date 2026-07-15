"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  STATISTICS_TOPICS,
  type StatisticsQuestion,
  type StatisticsTopicId,
} from "./statistics-data";
import { DisplayMath, RichMathText } from "./statistics-math";
import styles from "./statistics-expected-exams.module.css";

type ExamPhase = "catalog" | "active" | "result";

type ExpectedExamDefinition = {
  id: string;
  number: number;
  title: string;
  variant: number;
};

type ExpectedExamQuestion = StatisticsQuestion & {
  major: number;
  sub: number;
  points: number;
};

type ExpectedExamSection = {
  number: number;
  title: string;
  context: string;
  questions: ExpectedExamQuestion[];
};

type ExpectedExamPaper = {
  definition: ExpectedExamDefinition;
  sections: ExpectedExamSection[];
  questions: ExpectedExamQuestion[];
  totalPoints: number;
};

type SavedExpectedExam = {
  version: 2;
  examId: string;
  questionIds: string[];
  index: number;
  responses: Record<string, string>;
  remainingSeconds: number;
  savedAt: number;
};

type ExpectedQuestionInput = Omit<StatisticsQuestion, "id" | "source">;

const EXPECTED_EXAM_KEY = "test-grid:subject-7:expected-exam:v1";
const EXAM_SECONDS = 50 * 60;
const PASS_SCORE = 60;
const TOTAL_POINTS = 100;
const EXPECTED_MAJOR_COUNT = 11;
const EXPECTED_SUBQUESTION_COUNT = 26;
const REQUIRED_TOPICS: StatisticsTopicId[] = ["descriptive", "relation", "counting", "conditional", "random-variable", "continuous"];

export const STATISTICS_EXPECTED_EXAMS: ExpectedExamDefinition[] = [
  { id: "expected-01", number: 1, title: "全範囲実戦 01", variant: 1 },
  { id: "expected-02", number: 2, title: "全範囲実戦 02", variant: 2 },
  { id: "expected-03", number: 3, title: "全範囲実戦 03", variant: 3 },
  { id: "expected-04", number: 4, title: "全範囲実戦 04", variant: 4 },
  { id: "expected-05", number: 5, title: "全範囲実戦 05", variant: 5 },
  { id: "expected-06", number: 6, title: "全範囲実戦 06", variant: 6 },
  { id: "expected-07", number: 7, title: "全範囲実戦 07", variant: 7 },
  { id: "expected-08", number: 8, title: "全範囲実戦 08", variant: 8 },
  { id: "expected-09", number: 9, title: "全範囲実戦 09", variant: 9 },
  { id: "expected-10", number: 10, title: "全範囲実戦 10", variant: 10 },
  { id: "expected-11", number: 11, title: "全範囲実戦 11", variant: 11 },
  { id: "expected-12", number: 12, title: "全範囲実戦 12", variant: 12 },
];

const EXPECTED_EXAM_DEFINITIONS_BY_ID = new Map(STATISTICS_EXPECTED_EXAMS.map((exam) => [exam.id, exam]));

function formatDecimal(value: number, digits = 4) {
  return Number(value.toFixed(digits)).toString();
}

function probabilityAnswer(value: number, digits = 5) {
  return `${formatDecimal(value, digits)}（${formatDecimal(value * 100, 2)}%）`;
}

function factorial(value: number) {
  let result = 1;
  for (let current = 2; current <= value; current += 1) result *= current;
  return result;
}

function permutation(n: number, r: number) {
  return factorial(n) / factorial(n - r);
}

function combination(n: number, r: number) {
  return factorial(n) / (factorial(r) * factorial(n - r));
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
  return xValues.reduce((sum, x, index) => sum + (x - xAverage) * (yValues[index] - yAverage), 0) / xValues.length;
}

function makeQuestion(
  definition: ExpectedExamDefinition,
  major: number,
  sub: number,
  points: number,
  input: ExpectedQuestionInput,
): ExpectedExamQuestion {
  return {
    ...input,
    id: `${definition.id}-m${String(major).padStart(2, "0")}-s${sub}`,
    source: "course-range",
    major,
    sub,
    points,
  };
}

function buildExpectedPaper(definition: ExpectedExamDefinition): ExpectedExamPaper {
  const v = definition.variant;

  const descriptiveCenter = 10 + 2 * v;
  const descriptiveSpread = 1 + (v % 4);
  const descriptiveData = [
    descriptiveCenter - 2 * descriptiveSpread,
    descriptiveCenter - descriptiveSpread,
    descriptiveCenter,
    descriptiveCenter,
    descriptiveCenter + descriptiveSpread,
    descriptiveCenter + 2 * descriptiveSpread,
  ];
  const descriptiveVariance = (5 * descriptiveSpread ** 2) / 3;
  const descriptiveDeviation = Math.sqrt(descriptiveVariance);
  const descriptiveContext = `次の6個のデータを用いる。\\(${descriptiveData.join(",\\ ")}\\)。分散は \\(n\\) で割る母分散とする。`;

  const baseIntercept = 8 + v;
  const slope = 2 + (v % 4);
  const residualPatterns = [
    [-2, 1, 1, 1, -1],
    [-1, 2, -1, 0, 0],
    [0, -1, 2, -1, 0],
    [1, -2, 0, 2, -1],
  ] as const;
  const residuals = residualPatterns[(v - 1) % residualPatterns.length];
  const xValues = [1, 2, 3, 4, 5];
  const yValues = xValues.map((x, index) => baseIntercept + slope * x + residuals[index]);
  const xAverage = mean(xValues);
  const yAverage = mean(yValues);
  const xVariance = populationVariance(xValues);
  const yVariance = populationVariance(yValues);
  const covariance = populationCovariance(xValues, yValues);
  const correlation = covariance / Math.sqrt(xVariance * yVariance);
  const determination = correlation ** 2;
  const regressionSlope = covariance / xVariance;
  const regressionIntercept = yAverage - regressionSlope * xAverage;
  const predictionX = 6 + (v % 3);
  const predictionY = regressionIntercept + regressionSlope * predictionX;
  const relationContext = `次の5組のデータを用いる。\\(X=(${xValues.join(",")}),\\ Y=(${yValues.join(",")})\\)。分散・共分散は \\(n\\) で割る。`;

  const permutationN = 5 + v;
  const permutationR = 2 + (v % 2);
  const combinationN = 7 + v;
  const combinationR = 2 + (v % 3);
  const countingContext = "順序を区別する場合と区別しない場合を見分け、必要なら階乗を用いよ。";

  const coinTosses = 2 + v;
  const cardColors = 3 + (v % 3);
  const cardNumbers = 4 + (v % 4);
  const cardTotal = cardColors * cardNumbers;
  const sameNumberWays = cardNumbers * combination(cardColors, 3);
  const sameNumberProbability = sameNumberWays / combination(cardTotal, 3);
  const basicProbabilityContext = `${cardColors}色のカードがあり、各色には1から${cardNumbers}までの番号が1枚ずつ書かれている。また、コインは公平で各試行は独立とする。`;

  const machineAPrior = (35 + 2 * v) / 100;
  const machineADefect = (1 + (v % 4)) / 100;
  const machineBDefect = (5 + (v % 5)) / 100;
  const machineAJoint = machineAPrior * machineADefect;
  const defectTotal = machineAJoint + (1 - machineAPrior) * machineBDefect;
  const machinePosterior = machineAJoint / defectTotal;
  const bayesContext = `工場Aが全製品の${formatDecimal(machineAPrior * 100, 0)}%を、工場Bが残りを生産する。Aの不良率は${formatDecimal(machineADefect * 100, 0)}%、Bの不良率は${formatDecimal(machineBDefect * 100, 0)}%である。`;

  const probability0 = (10 + v) / 100;
  const probability1 = (35 + v) / 100;
  const probability2 = Number((1 - probability0 - probability1).toFixed(10));
  const discreteMean = probability1 + 2 * probability2;
  const discreteSecondMoment = probability1 + 4 * probability2;
  const discreteVariance = discreteSecondMoment - discreteMean ** 2;
  const discreteContext = `離散型確率変数 \\(X\\) の分布を次で与える。\\(P(X=0)=${formatDecimal(probability0, 2)},\\ P(X=1)=${formatDecimal(probability1, 2)},\\ P(X=2)=k\\)。`;

  const transformMean = 2 + v;
  const transformVariance = 1 + (v % 5);
  const transformScale = 2 + (v % 3);
  const transformShift = v - 6;
  const transformContext = `確率変数 \\(X\\) は \\(E[X]=${transformMean},\\ V(X)=${transformVariance}\\) を満たす。\\(Y=${transformScale}X${transformShift >= 0 ? "+" : ""}${transformShift}\\) とする。`;

  const densityLimit = 2 + v * 0.25;
  const densityConstant = 2 / densityLimit ** 2;
  const densityCut = densityLimit - 0.5;
  const densityProbability = densityCut ** 2 / densityLimit ** 2;
  const densityMean = (2 * densityLimit) / 3;
  const densityContext = `連続型確率変数 \\(X\\) の確率密度関数を \\(f(x)=kx\\ (0\\le x\\le ${formatDecimal(densityLimit, 2)})\\)、それ以外では0とする。`;

  const normalRows = [
    { z: 0.5, phi: 0.6915 }, { z: 0.67, phi: 0.7486 }, { z: 0.84, phi: 0.7995 },
    { z: 1, phi: 0.8413 }, { z: 1.15, phi: 0.8749 }, { z: 1.28, phi: 0.8997 },
    { z: 1.41, phi: 0.9207 }, { z: 1.5, phi: 0.9332 }, { z: 1.64, phi: 0.9495 },
    { z: 1.75, phi: 0.9599 }, { z: 1.96, phi: 0.975 }, { z: 2, phi: 0.9772 },
  ] as const;
  const normalRow = normalRows[v - 1];
  const normalMean = 45 + 3 * v;
  const normalSigma = 4 + (v % 5);
  const normalValue = normalMean + normalRow.z * normalSigma;
  const normalContext = `\\(X\\sim N(${normalMean},${normalSigma}^2)\\) とする。標準正規分布表より \\(\\Phi(${formatDecimal(normalRow.z, 2)})=${formatDecimal(normalRow.phi, 4)}\\) を用いてよい。`;

  const chebyshevMean = 60 + v;
  const chebyshevSigma = 2 + (v % 4);
  const chebyshevK = 2 + (v % 4);
  const chebyshevOutside = 1 / chebyshevK ** 2;
  const chebyshevInside = 1 - chebyshevOutside;
  const chebyshevContext = `平均 \\(\\mu=${chebyshevMean}\\)、標準偏差 \\(\\sigma=${chebyshevSigma}\\) の任意の分布を考える。正規分布とは限らない。`;

  const sections: ExpectedExamSection[] = [
    {
      number: 1,
      title: "記述統計",
      context: descriptiveContext,
      questions: [
        makeQuestion(definition, 1, 1, 3, { topic: "descriptive", genre: "平均", difficulty: 1, format: "number", prompt: "平均 \\(\\bar{x}\\) を求めよ。", context: descriptiveContext, answer: formatDecimal(descriptiveCenter), numericAnswer: descriptiveCenter, formula: "\\bar{x}=\\frac{1}{n}\\sum_{i=1}^{n}x_i", steps: [`データは \\(${descriptiveCenter}\\) を中心に対称である。`, `したがって \\(\\bar{x}=${descriptiveCenter}\\)`], explanation: "全データの合計を個数6で割る。対称性を使ってもよい。" }),
        makeQuestion(definition, 1, 2, 3, { topic: "descriptive", genre: "母分散", difficulty: 2, format: "number", prompt: "母分散 \\(\\sigma^2\\) を求めよ。小数第3位まで可。", context: descriptiveContext, answer: formatDecimal(descriptiveVariance, 5), numericAnswer: descriptiveVariance, tolerance: 0.001, formula: "\\sigma^2=\\frac{1}{n}\\sum_{i=1}^{n}(x_i-\\bar{x})^2", steps: [`偏差は \\(-${2 * descriptiveSpread},-${descriptiveSpread},0,0,${descriptiveSpread},${2 * descriptiveSpread}\\)`, `偏差平方和は \\(${10 * descriptiveSpread ** 2}\\)`, `\\(\\sigma^2=${10 * descriptiveSpread ** 2}/6=${formatDecimal(descriptiveVariance, 5)}\\)`], explanation: "母分散なので偏差平方和をデータ数6で割る。" }),
        makeQuestion(definition, 1, 3, 3, { topic: "descriptive", genre: "母標準偏差", difficulty: 2, format: "number", prompt: "母標準偏差 \\(\\sigma\\) を求めよ。小数第3位まで可。", context: descriptiveContext, answer: formatDecimal(descriptiveDeviation, 5), numericAnswer: descriptiveDeviation, tolerance: 0.001, formula: "\\sigma=\\sqrt{\\sigma^2}", steps: [`\\(\\sigma=\\sqrt{${formatDecimal(descriptiveVariance, 5)}}=${formatDecimal(descriptiveDeviation, 5)}\\)`], explanation: "標準偏差は分散の正の平方根である。" }),
      ],
    },
    {
      number: 2,
      title: "相関・回帰・予測",
      context: relationContext,
      questions: [
        makeQuestion(definition, 2, 1, 3, { topic: "relation", genre: "共分散", difficulty: 2, format: "number", prompt: "母共分散 \\(\\sigma_{XY}\\) を求めよ。小数第3位まで可。", context: relationContext, answer: formatDecimal(covariance, 5), numericAnswer: covariance, tolerance: 0.001, formula: "\\sigma_{XY}=\\frac{1}{n}\\sum_{i=1}^{n}(x_i-\\bar{x})(y_i-\\bar{y})", steps: [`\\(\\bar{x}=${formatDecimal(xAverage)},\\ \\bar{y}=${formatDecimal(yAverage)}\\)`, `偏差積和を5で割り、\\(\\sigma_{XY}=${formatDecimal(covariance, 5)}\\)`], explanation: "対応するXとYの偏差の積を平均する。" }),
        makeQuestion(definition, 2, 2, 3, { topic: "relation", genre: "相関係数", difficulty: 2, format: "number", prompt: "ピアソンの相関係数 \\(r\\) を求めよ。小数第3位まで可。", context: relationContext, answer: formatDecimal(correlation, 5), numericAnswer: correlation, tolerance: 0.001, formula: "r=\\frac{\\sigma_{XY}}{\\sigma_X\\sigma_Y}", steps: [`\\(\\sigma_X^2=${formatDecimal(xVariance, 5)},\\ \\sigma_Y^2=${formatDecimal(yVariance, 5)}\\)`, `\\(r=${formatDecimal(correlation, 5)}\\)`], explanation: "共分散を両変数の標準偏差の積で標準化する。" }),
        makeQuestion(definition, 2, 3, 3, { topic: "relation", genre: "決定係数", difficulty: 2, format: "number", prompt: "決定係数 \\(R^2\\) を求めよ。小数第3位まで可。", context: relationContext, answer: formatDecimal(determination, 5), numericAnswer: determination, tolerance: 0.001, formula: "R^2=r^2", steps: [`\\(R^2=${formatDecimal(correlation, 5)}^2=${formatDecimal(determination, 5)}\\)`], explanation: "単回帰の決定係数は相関係数の二乗である。" }),
        makeQuestion(definition, 2, 4, 3, { topic: "relation", genre: "回帰予測", difficulty: 3, format: "number", prompt: `\\(Y\\) の \\(X\\) への回帰直線を用いて、\\(X=${predictionX}\\) のときの \\(Y\\) を予測せよ。小数第2位まで可。`, context: relationContext, answer: formatDecimal(predictionY, 5), numericAnswer: predictionY, tolerance: 0.01, formula: "b=\\frac{\\sigma_{XY}}{\\sigma_X^2},\\quad a=\\bar{y}-b\\bar{x},\\quad \\hat{y}=a+bx", steps: [`\\(b=${formatDecimal(regressionSlope, 5)},\\ a=${formatDecimal(regressionIntercept, 5)}\\)`, `回帰直線は \\(\\hat{y}=${formatDecimal(regressionIntercept, 5)}+${formatDecimal(regressionSlope, 5)}x\\)`, `\\(x=${predictionX}\\) より \\(\\hat{y}=${formatDecimal(predictionY, 5)}\\)`], explanation: "共分散とXの分散から傾きを求め、平均点を通るよう切片を定めて予測する。" }),
      ],
    },
    {
      number: 3,
      title: "場合の数",
      context: countingContext,
      questions: [
        makeQuestion(definition, 3, 1, 4, { topic: "counting", genre: "順列", difficulty: 1, format: "number", prompt: `${permutationN}人から${permutationR}人を選び、順番をつけて並べる方法は何通りか。`, context: countingContext, answer: `${permutation(permutationN, permutationR)}通り`, numericAnswer: permutation(permutationN, permutationR), formula: "{}_nP_r=\\frac{n!}{(n-r)!}", steps: [`\\({}_{${permutationN}}P_{${permutationR}}=${Array.from({ length: permutationR }, (_, index) => permutationN - index).join("\\times")}\\)`, `\\(=${permutation(permutationN, permutationR)}\\)`], explanation: "選ぶ順番を区別するので順列を使う。" }),
        makeQuestion(definition, 3, 2, 4, { topic: "counting", genre: "組合せ", difficulty: 1, format: "number", prompt: `${combinationN}人から${combinationR}人の委員を選ぶ方法は何通りか。`, context: countingContext, answer: `${combination(combinationN, combinationR)}通り`, numericAnswer: combination(combinationN, combinationR), formula: "{}_nC_r=\\frac{n!}{r!(n-r)!}", steps: [`\\({}_{${combinationN}}C_{${combinationR}}=${combination(combinationN, combinationR)}\\)`], explanation: "委員内の順番を区別しないので組合せを使う。" }),
      ],
    },
    {
      number: 4,
      title: "確率の基本",
      context: basicProbabilityContext,
      questions: [
        makeQuestion(definition, 4, 1, 4, { topic: "counting", genre: "組合せ確率", difficulty: 2, format: "number", prompt: `${cardTotal}枚から同時に3枚を選ぶとき、3枚の番号がすべて同じになる確率を求めよ。`, context: basicProbabilityContext, answer: probabilityAnswer(sameNumberProbability), numericAnswer: sameNumberProbability, tolerance: 0.0001, formula: "P(A)=\\frac{|A|}{|\\Omega|}", steps: [`全事象は \\({}_{${cardTotal}}C_3=${combination(cardTotal, 3)}\\) 通り`, `同じ番号を選ぶ方法は \\(${cardNumbers}\\times{}_{${cardColors}}C_3=${sameNumberWays}\\) 通り`, `\\(${sameNumberWays}/${combination(cardTotal, 3)}=${formatDecimal(sameNumberProbability, 5)}\\)`], explanation: "番号を1つ選び、その番号をもつ異なる色3枚を組合せで選ぶ。" }),
        makeQuestion(definition, 4, 2, 4, { topic: "counting", genre: "余事象", difficulty: 2, format: "number", prompt: `コインを${coinTosses}回投げるとき、少なくとも1回表が出る確率を求めよ。`, context: basicProbabilityContext, answer: probabilityAnswer(1 - 1 / 2 ** coinTosses), numericAnswer: 1 - 1 / 2 ** coinTosses, tolerance: 0.00001, formula: "P(A^c)=1-P(A)", steps: [`1回も表が出ない確率は \\((1/2)^{${coinTosses}}=1/${2 ** coinTosses}\\)`, `\\(1-1/${2 ** coinTosses}=${formatDecimal(1 - 1 / 2 ** coinTosses, 5)}\\)`], explanation: "「少なくとも1回」は「すべて裏」の余事象を使う。" }),
      ],
    },
    {
      number: 5,
      title: "条件付き確率・Bayes",
      context: bayesContext,
      questions: [
        makeQuestion(definition, 5, 1, 4, { topic: "conditional", genre: "乗法定理", difficulty: 1, format: "number", prompt: "無作為に選んだ製品が工場A製かつ不良品である確率を求めよ。", context: bayesContext, answer: probabilityAnswer(machineAJoint), numericAnswer: machineAJoint, tolerance: 0.00001, formula: "P(A\\cap D)=P(A)P(D\\mid A)", steps: [`\\(${formatDecimal(machineAPrior, 2)}\\times${formatDecimal(machineADefect, 2)}=${formatDecimal(machineAJoint, 5)}\\)`], explanation: "Aを通る経路の確率を掛け合わせる。" }),
        makeQuestion(definition, 5, 2, 4, { topic: "conditional", genre: "全確率", difficulty: 2, format: "number", prompt: "無作為に選んだ製品が不良品である確率を求めよ。", context: bayesContext, answer: probabilityAnswer(defectTotal), numericAnswer: defectTotal, tolerance: 0.00001, formula: "P(D)=P(A)P(D\\mid A)+P(B)P(D\\mid B)", steps: [`A経路は \\(${formatDecimal(machineAJoint, 5)}\\)`, `B経路は \\(${formatDecimal((1 - machineAPrior) * machineBDefect, 5)}\\)`, `合計 \\(${formatDecimal(defectTotal, 5)}\\)`], explanation: "不良になる互いに排反な経路をすべて加える。" }),
        makeQuestion(definition, 5, 3, 4, { topic: "conditional", genre: "Bayes", difficulty: 3, format: "number", prompt: "不良品であると分かったとき、それが工場A製である条件付き確率を求めよ。小数第3位まで可。", context: bayesContext, answer: probabilityAnswer(machinePosterior), numericAnswer: machinePosterior, tolerance: 0.001, formula: "P(A\\mid D)=\\frac{P(A)P(D\\mid A)}{P(D)}", steps: [`分子は \\(${formatDecimal(machineAJoint, 5)}\\)`, `分母は \\(${formatDecimal(defectTotal, 5)}\\)`, `\\(${formatDecimal(machineAJoint, 5)}/${formatDecimal(defectTotal, 5)}=${formatDecimal(machinePosterior, 5)}\\)`], explanation: "目的のA経路を、不良になる全経路で割る。" }),
      ],
    },
    {
      number: 6,
      title: "離散型確率変数",
      context: discreteContext,
      questions: [
        makeQuestion(definition, 6, 1, 3, { topic: "random-variable", genre: "確率分布", difficulty: 1, format: "number", prompt: "定数 \\(k\\) を求めよ。", context: discreteContext, answer: formatDecimal(probability2, 2), numericAnswer: probability2, formula: "\\sum_i p_i=1", steps: [`\\(k=1-${formatDecimal(probability0, 2)}-${formatDecimal(probability1, 2)}=${formatDecimal(probability2, 2)}\\)`], explanation: "確率の総和は1である。" }),
        makeQuestion(definition, 6, 2, 4, { topic: "random-variable", genre: "期待値", difficulty: 2, format: "number", prompt: "期待値 \\(E[X]\\) を求めよ。", context: discreteContext, answer: formatDecimal(discreteMean, 4), numericAnswer: discreteMean, tolerance: 0.00001, formula: "E[X]=\\sum_i x_ip_i", steps: [`\\(0\\times${formatDecimal(probability0, 2)}+1\\times${formatDecimal(probability1, 2)}+2\\times${formatDecimal(probability2, 2)}\\)`, `\\(=${formatDecimal(discreteMean, 4)}\\)`], explanation: "各値とその確率の積を加える。" }),
        makeQuestion(definition, 6, 3, 5, { topic: "random-variable", genre: "分散", difficulty: 2, format: "number", prompt: "分散 \\(V(X)\\) を求めよ。小数第4位まで可。", context: discreteContext, answer: formatDecimal(discreteVariance, 5), numericAnswer: discreteVariance, tolerance: 0.0001, formula: "V(X)=E[X^2]-E[X]^2", steps: [`\\(E[X^2]=${formatDecimal(discreteSecondMoment, 4)}\\)`, `\\(V(X)=${formatDecimal(discreteSecondMoment, 4)}-${formatDecimal(discreteMean, 4)}^2\\)`, `\\(=${formatDecimal(discreteVariance, 5)}\\)`], explanation: "二乗の期待値から期待値の二乗を引く。" }),
      ],
    },
    {
      number: 7,
      title: "期待値・分散の一次変換",
      context: transformContext,
      questions: [
        makeQuestion(definition, 7, 1, 4, { topic: "random-variable", genre: "期待値の一次変換", difficulty: 1, format: "number", prompt: "\\(E[Y]\\) を求めよ。", context: transformContext, answer: formatDecimal(transformScale * transformMean + transformShift), numericAnswer: transformScale * transformMean + transformShift, formula: "E[aX+b]=aE[X]+b", steps: [`\\(E[Y]=${transformScale}\\times${transformMean}${transformShift >= 0 ? "+" : ""}${transformShift}\\)`, `\\(=${transformScale * transformMean + transformShift}\\)`], explanation: "期待値には定数項も加わる。" }),
        makeQuestion(definition, 7, 2, 4, { topic: "random-variable", genre: "分散の一次変換", difficulty: 2, format: "number", prompt: "\\(V(Y)\\) を求めよ。", context: transformContext, answer: formatDecimal(transformScale ** 2 * transformVariance), numericAnswer: transformScale ** 2 * transformVariance, formula: "V(aX+b)=a^2V(X)", steps: [`\\(V(Y)=${transformScale}^2\\times${transformVariance}\\)`, `\\(=${transformScale ** 2 * transformVariance}\\)`], explanation: "定数項は分散に影響せず、倍率は二乗される。" }),
      ],
    },
    {
      number: 8,
      title: "連続型確率変数",
      context: densityContext,
      questions: [
        makeQuestion(definition, 8, 1, 4, { topic: "continuous", genre: "確率密度", difficulty: 2, format: "number", prompt: "\\(f(x)\\) が確率密度関数となるように \\(k\\) を求めよ。小数第4位まで可。", context: densityContext, answer: formatDecimal(densityConstant, 5), numericAnswer: densityConstant, tolerance: 0.0001, formula: "\\int_{-\\infty}^{\\infty}f(x)\\,dx=1", steps: [`\\(\\int_0^{${formatDecimal(densityLimit, 2)}}kx\\,dx=1\\)`, `\\(k\\cdot ${formatDecimal(densityLimit ** 2 / 2, 5)}=1\\)`, `\\(k=${formatDecimal(densityConstant, 5)}\\)`], explanation: "密度曲線全体の面積を1に合わせる。" }),
        makeQuestion(definition, 8, 2, 4, { topic: "continuous", genre: "区間確率", difficulty: 2, format: "number", prompt: `\\(P(0\\le X\\le ${formatDecimal(densityCut, 2)})\\) を求めよ。小数第4位まで可。`, context: densityContext, answer: probabilityAnswer(densityProbability), numericAnswer: densityProbability, tolerance: 0.0001, formula: "P(a\\le X\\le b)=\\int_a^b f(x)\\,dx", steps: [`\\(\\int_0^{${formatDecimal(densityCut, 2)}}${formatDecimal(densityConstant, 5)}x\\,dx\\)`, `\\(=${formatDecimal(densityProbability, 5)}\\)`], explanation: "指定区間で密度関数を積分する。" }),
        makeQuestion(definition, 8, 3, 4, { topic: "continuous", genre: "連続型期待値", difficulty: 3, format: "number", prompt: "期待値 \\(E[X]\\) を求めよ。小数第3位まで可。", context: densityContext, answer: formatDecimal(densityMean, 5), numericAnswer: densityMean, tolerance: 0.001, formula: "E[X]=\\int_{-\\infty}^{\\infty}xf(x)\\,dx", steps: [`\\(E[X]=\\int_0^{${formatDecimal(densityLimit, 2)}}x\\cdot ${formatDecimal(densityConstant, 5)}x\\,dx\\)`, `\\(=${formatDecimal(densityMean, 5)}\\)`], explanation: "連続型では値と密度の積を積分する。" }),
      ],
    },
    {
      number: 9,
      title: "正規分布・標準化",
      context: normalContext,
      questions: [
        makeQuestion(definition, 9, 1, 4, { topic: "continuous", genre: "標準化", difficulty: 1, format: "number", prompt: `\\(X=${formatDecimal(normalValue, 2)}\\) に対応する標準得点 \\(z\\) を求めよ。`, context: normalContext, answer: formatDecimal(normalRow.z, 2), numericAnswer: normalRow.z, tolerance: 0.0001, formula: "z=\\frac{x-\\mu}{\\sigma}", steps: [`\\(z=(${formatDecimal(normalValue, 2)}-${normalMean})/${normalSigma}\\)`, `\\(=${formatDecimal(normalRow.z, 2)}\\)`], explanation: "平均との差を標準偏差で割る。" }),
        makeQuestion(definition, 9, 2, 4, { topic: "continuous", genre: "正規分布表", difficulty: 2, format: "number", prompt: `\\(P(X\\le ${formatDecimal(normalValue, 2)})\\) を求めよ。`, context: normalContext, answer: probabilityAnswer(normalRow.phi, 4), numericAnswer: normalRow.phi, tolerance: 0.00005, formula: "P(X\\le x)=\\Phi\\!\\left(\\frac{x-\\mu}{\\sigma}\\right)", steps: [`標準化すると \\(z=${formatDecimal(normalRow.z, 2)}\\)`, `表より \\(\\Phi(${formatDecimal(normalRow.z, 2)})=${formatDecimal(normalRow.phi, 4)}\\)`], explanation: "標準化した値を累積標準正規分布表で読む。" }),
      ],
    },
    {
      number: 10,
      title: "チェビシェフの不等式",
      context: chebyshevContext,
      questions: [
        makeQuestion(definition, 10, 1, 5, { topic: "continuous", genre: "チェビシェフ", difficulty: 2, format: "number", prompt: `区間 \\(${chebyshevMean - chebyshevK * chebyshevSigma}\\le X\\le ${chebyshevMean + chebyshevK * chebyshevSigma}\\) に入る確率の下限を求めよ。`, context: chebyshevContext, answer: probabilityAnswer(chebyshevInside), numericAnswer: chebyshevInside, tolerance: 0.0001, formula: "P(|X-\\mu|<k\\sigma)\\ge1-\\frac{1}{k^2}", steps: [`区間は平均から \\(\\pm${chebyshevK}\\sigma\\)`, `外側確率の上限は \\(1/${chebyshevK}^2=${formatDecimal(chebyshevOutside, 5)}\\)`, `\\(1-1/${chebyshevK}^2=${formatDecimal(chebyshevInside, 5)}\\)`], explanation: "外側確率の上限を1から引くと内側確率の下限になる。" }),
      ],
    },
    {
      number: 11,
      title: "独立と排反の説明",
      context: "事象 \\(A,B\\) は排反であり、\\(P(A)>0,\\ P(B)>0\\) とする。",
      questions: [
        makeQuestion(definition, 11, 1, 6, { topic: "conditional", genre: "独立性の説明", difficulty: 3, format: "text", prompt: "このとき \\(A,B\\) が独立でないことを、確率の式を用いて説明せよ。", context: "事象 \\(A,B\\) は排反であり、\\(P(A)>0,\\ P(B)>0\\) とする。", answer: "排反なので \\(P(A\\cap B)=0\\) である。一方、\\(P(A)>0\\) かつ \\(P(B)>0\\) だから \\(P(A)P(B)>0\\)。したがって \\(P(A\\cap B)\\ne P(A)P(B)\\) となり、独立ではない。", accepted: ["排反だから共通部分の確率は0だが確率の積は正なので独立ではない"], keywords: ["排反", "0", "積", "正", "独立"], minKeywords: 3, formula: "P(A\\cap B)\\ne P(A)P(B)", steps: ["排反より \\(A\\cap B=\\varnothing\\) なので \\(P(A\\cap B)=0\\)。", "仮定より \\(P(A)P(B)>0\\)。", "独立の条件 \\(P(A\\cap B)=P(A)P(B)\\) を満たさない。"], explanation: "排反と独立は同じ意味ではない。正の確率をもつ排反事象は、片方が起きると他方が起きないため独立ではない。" }),
      ],
    },
  ];

  const questions = sections.flatMap((section) => section.questions);
  return {
    definition,
    sections,
    questions,
    totalPoints: questions.reduce((sum, question) => sum + question.points, 0),
  };
}

function validateExpectedPaper(paper: ExpectedExamPaper) {
  if (paper.sections.length !== EXPECTED_MAJOR_COUNT) throw new Error(`${paper.definition.id}: expected ${EXPECTED_MAJOR_COUNT} major questions`);
  if (paper.questions.length !== EXPECTED_SUBQUESTION_COUNT) throw new Error(`${paper.definition.id}: expected ${EXPECTED_SUBQUESTION_COUNT} subquestions`);
  if (paper.totalPoints !== TOTAL_POINTS) throw new Error(`${paper.definition.id}: point total is ${paper.totalPoints}, expected ${TOTAL_POINTS}`);
  if (new Set(paper.questions.map((question) => question.id)).size !== paper.questions.length) throw new Error(`${paper.definition.id}: duplicate subquestion IDs`);
  for (const topic of REQUIRED_TOPICS) {
    if (!paper.questions.some((question) => question.topic === topic)) throw new Error(`${paper.definition.id}: missing topic ${topic}`);
  }
  if (paper.questions.filter((question) => question.format === "text").length !== 1) throw new Error(`${paper.definition.id}: exactly one proof/explanation question is required`);
}

const EXPECTED_PAPERS_BY_ID = new Map(STATISTICS_EXPECTED_EXAMS.map((definition) => {
  const paper = buildExpectedPaper(definition);
  validateExpectedPaper(paper);
  return [definition.id, paper];
}));

export const STATISTICS_EXPECTED_EXAM_AUDIT = STATISTICS_EXPECTED_EXAMS.map((definition) => {
  const paper = EXPECTED_PAPERS_BY_ID.get(definition.id)!;
  return { id: definition.id, majorQuestions: paper.sections.length, subquestions: paper.questions.length, points: paper.totalPoints };
});

function normalizeText(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/[−–—]/g, "-")
    .replace(/[×·]/g, "*")
    .replace(/[「」『』（）()。、，,.!！?？・\s]/g, "")
    .trim();
}

function parseNumericResponse(value: string) {
  let normalized = value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[−–—]/g, "-")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .replace(/^約/, "");

  const percent = normalized.includes("%");
  normalized = normalized.replace(/%/g, "");
  const pieces = normalized.split(/(?:=|≈|≒)/).filter(Boolean);
  normalized = pieces.at(-1) ?? normalized;
  normalized = normalized.replace(/(?:通り|個|人|点|回|本|枚|以上|以下)$/u, "");

  const fraction = normalized.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\/([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/);
  let parsed: number;
  if (fraction) {
    const denominator = Number(fraction[2]);
    if (denominator === 0) return null;
    parsed = Number(fraction[1]) / denominator;
  } else if (/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) {
    parsed = Number(normalized);
  } else {
    return null;
  }

  if (!Number.isFinite(parsed)) return null;
  return percent ? parsed / 100 : parsed;
}

function isCorrectAnswer(question: ExpectedExamQuestion, response: string) {
  if (question.format === "number") {
    const parsed = parseNumericResponse(response);
    if (parsed === null || question.numericAnswer === undefined) return false;
    const tolerance = question.tolerance ?? Math.max(1e-9, Math.abs(question.numericAnswer) * 1e-9);
    return Math.abs(parsed - question.numericAnswer) <= tolerance;
  }

  const normalized = normalizeText(response);
  const references = [question.answer, ...(question.accepted ?? [])];
  if (references.some((answer) => normalizeText(answer) === normalized)) return true;
  if (question.format === "choice") return false;

  const keywords = question.keywords ?? [];
  if (!keywords.length) return false;
  const matched = keywords.filter((keyword) => normalized.includes(normalizeText(keyword))).length;
  return matched >= (question.minKeywords ?? keywords.length);
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function restoreSavedExam(): SavedExpectedExam | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(EXPECTED_EXAM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedExpectedExam>;
    if (parsed.version !== 2 || typeof parsed.examId !== "string") return null;
    const paper = EXPECTED_PAPERS_BY_ID.get(parsed.examId);
    if (!paper || !Array.isArray(parsed.questionIds)) return null;
    const expectedIds = paper.questions.map((question) => question.id);
    if (parsed.questionIds.length !== expectedIds.length || parsed.questionIds.some((id, index) => id !== expectedIds[index])) return null;
    const knownIds = new Set(expectedIds);
    return {
      version: 2,
      examId: parsed.examId,
      questionIds: expectedIds,
      index: typeof parsed.index === "number" ? Math.max(0, Math.min(expectedIds.length - 1, Math.floor(parsed.index))) : 0,
      responses: parsed.responses && typeof parsed.responses === "object" && !Array.isArray(parsed.responses)
        ? Object.fromEntries(Object.entries(parsed.responses).filter((entry): entry is [string, string] => knownIds.has(entry[0]) && typeof entry[1] === "string"))
        : {},
      remainingSeconds: typeof parsed.remainingSeconds === "number"
        ? Math.max(0, Math.min(EXAM_SECONDS, Math.floor(parsed.remainingSeconds)))
        : EXAM_SECONDS,
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function ExamPaper({ paper }: { paper: ExpectedExamPaper }) {
  return (
    <article className={styles.paper}>
      <header className={styles.paperHeader}>
        <div><h2>確率統計　予想問題 第{paper.definition.number}回</h2><p>全範囲実戦問題用紙</p></div>
        <div className={styles.paperMeta}><span>試験時間</span><strong>50分</strong><span>満点</span><strong>100点</strong><span>合格</span><strong>60点</strong></div>
        <div className={styles.identityLine}><span>学籍番号：</span><span>氏名：</span></div>
      </header>
      <div className={styles.paperInstructions}>電卓のみ使用可。数値の丸め指定がない場合は、小数第4位までを目安に答えること。大問11題・小問{paper.questions.length}問。途中式も採点対象とする。</div>
      <div className={styles.paperColumns}>
        {paper.sections.map((section) => (
          <section className={styles.majorSection} key={section.number}>
            <h3 className={styles.majorHeading}><span>第{section.number}問　{section.title}</span><small>{section.questions.reduce((sum, question) => sum + question.points, 0)}点</small></h3>
            <p className={styles.sectionContext}><RichMathText text={section.context} /></p>
            {section.questions.map((question) => (
              <div className={styles.paperQuestion} key={question.id}>
                <div className={styles.paperQuestionHeader}><span>({question.sub})</span><span><RichMathText text={question.prompt} /></span><span>〔{question.points}点〕</span></div>
                <div className={`${styles.answerLine} ${question.format === "text" ? styles.isLong : ""}`} />
              </div>
            ))}
          </section>
        ))}
      </div>
      <footer className={styles.paperFooter}><span>確率統計・全範囲</span><span>第{paper.definition.number}回　問題用紙</span></footer>
    </article>
  );
}

function AnswerBooklet({ paper }: { paper: ExpectedExamPaper }) {
  return (
    <article className={styles.answerBooklet}>
      <header><h2>第{paper.definition.number}回　解答・途中式・解説</h2><p>問題用紙とは別ページです。各小問の配点合計：{paper.totalPoints}点</p></header>
      <div className={styles.answerColumns}>
        {paper.sections.map((section) => (
          <section className={styles.answerSection} key={section.number}>
            <h3 className={styles.answerHeading}><span>第{section.number}問　{section.title}</span><small>{section.questions.reduce((sum, question) => sum + question.points, 0)}点</small></h3>
            {section.questions.map((question) => (
              <div className={styles.answerItem} key={question.id}>
                <h4>({question.sub}) 正答：<RichMathText text={question.answer} />〔{question.points}点〕</h4>
                {question.formula && <DisplayMath tex={question.formula} />}
                <ol>{question.steps.map((step, index) => <li key={`${question.id}-print-${index}`}><RichMathText text={step} /></li>)}</ol>
                <p><b>解説：</b><RichMathText text={question.explanation} /></p>
              </div>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}

function PrintableBundle({ paper, includeAnswers }: { paper: ExpectedExamPaper; includeAnswers: boolean }) {
  return <div className={styles.printBundle}><ExamPaper paper={paper} />{includeAnswers && <AnswerBooklet paper={paper} />}</div>;
}

export default function StatisticsExpectedExams() {
  const [phase, setPhase] = useState<ExamPhase>("catalog");
  const [examId, setExamId] = useState(STATISTICS_EXPECTED_EXAMS[0].id);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(EXAM_SECONDS);
  const [savedExam, setSavedExam] = useState<SavedExpectedExam | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [printExamId, setPrintExamId] = useState(STATISTICS_EXPECTED_EXAMS[0].id);
  const [printIncludeAnswers, setPrintIncludeAnswers] = useState(false);

  const paper = EXPECTED_PAPERS_BY_ID.get(examId) ?? EXPECTED_PAPERS_BY_ID.get(STATISTICS_EXPECTED_EXAMS[0].id)!;
  const definition = paper.definition;
  const questions = paper.questions;
  const questionIds = useMemo(() => questions.map((question) => question.id), [questions]);
  const currentQuestion = questions[index];
  const printPaper = EXPECTED_PAPERS_BY_ID.get(printExamId) ?? paper;

  const resultRows = useMemo(() => questions.map((question) => {
    const response = responses[question.id] ?? "";
    return { question, response, correct: isCorrectAnswer(question, response), points: question.points };
  }), [questions, responses]);
  const score = resultRows.reduce((total, row) => total + (row.correct ? row.points : 0), 0);

  const topicResults = useMemo(() => STATISTICS_TOPICS.map((topic) => {
    const rows = resultRows.filter((row) => row.question.topic === topic.id);
    return {
      topic,
      earned: rows.reduce((sum, row) => sum + (row.correct ? row.points : 0), 0),
      possible: rows.reduce((sum, row) => sum + row.points, 0),
    };
  }).filter((row) => row.possible > 0), [resultRows]);

  /* Device-local exam state is restored after hydration. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSavedExam(restoreSavedExam());
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (phase !== "active") return;
    const timer = window.setInterval(() => setRemainingSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const finishExam = useCallback(() => {
    setPhase("result");
    try { window.localStorage.removeItem(EXPECTED_EXAM_KEY); } catch { /* Storage can be unavailable. */ }
    setSavedExam(null);
  }, []);

  useEffect(() => {
    if (phase !== "active" || remainingSeconds !== 0) return;
    const timeout = window.setTimeout(finishExam, 0);
    return () => window.clearTimeout(timeout);
  }, [finishExam, phase, remainingSeconds]);

  useEffect(() => {
    if (!hydrated || phase !== "active") return;
    const session: SavedExpectedExam = { version: 2, examId, questionIds, index, responses, remainingSeconds, savedAt: Date.now() };
    try {
      window.localStorage.setItem(EXPECTED_EXAM_KEY, JSON.stringify(session));
    } catch {
      // The exam remains usable when browser storage is blocked.
    }
  }, [examId, hydrated, index, phase, questionIds, remainingSeconds, responses]);

  function startExam(nextExam: ExpectedExamDefinition) {
    setExamId(nextExam.id);
    setPrintExamId(nextExam.id);
    setIndex(0);
    setResponses({});
    setRemainingSeconds(EXAM_SECONDS);
    setPhase("active");
  }

  function resumeExam() {
    if (!savedExam) return;
    setExamId(savedExam.examId);
    setPrintExamId(savedExam.examId);
    setIndex(savedExam.index);
    setResponses(savedExam.responses);
    setRemainingSeconds(savedExam.remainingSeconds);
    setPhase("active");
  }

  function deleteSavedExam() {
    try { window.localStorage.removeItem(EXPECTED_EXAM_KEY); } catch { /* Ignore unavailable storage. */ }
    setSavedExam(null);
  }

  function updateResponse(value: string) {
    setResponses((current) => ({ ...current, [currentQuestion.id]: value }));
  }

  function makeCurrentSession(): SavedExpectedExam {
    return { version: 2, examId, questionIds, index, responses, remainingSeconds, savedAt: Date.now() };
  }

  function pauseExam() {
    const session = makeCurrentSession();
    try { window.localStorage.setItem(EXPECTED_EXAM_KEY, JSON.stringify(session)); } catch { /* Ignore unavailable storage. */ }
    setSavedExam(session);
    setPhase("catalog");
  }

  function requestPrint(nextExam: ExpectedExamDefinition, includeAnswers: boolean) {
    setPrintExamId(nextExam.id);
    setPrintIncludeAnswers(includeAnswers);
    window.setTimeout(() => window.print(), 0);
  }

  const printPortal = hydrated
    ? createPortal(<PrintableBundle paper={printPaper} includeAnswers={printIncludeAnswers} />, document.body)
    : null;

  if (phase === "catalog") {
    return (
      <>
        <section className="english-guide-workspace statistics-expected-workspace" aria-labelledby="statistics-expected-title">
          <div className="english-panel-heading statistics-panel-heading">
            <div><span>12 FULL-RANGE EXAMS</span><h2 id="statistics-expected-title">想定試験</h2></div>
            <p>全12回とも同じ出題バランスの50分・100点満点です。大問11題・小問26問で、全範囲を毎回まんべんなく確認します。</p>
          </div>

          {savedExam && (
            <div className="generic-test-answer english-test-feedback english-saved-test statistics-saved-test">
              <strong>途中の想定試験があります</strong>
              <p><span>試験</span>第{EXPECTED_EXAM_DEFINITIONS_BY_ID.get(savedExam.examId)?.number ?? "?"}回・小問{savedExam.index + 1} / {savedExam.questionIds.length}</p>
              <p><span>残り時間</span>{formatTime(savedExam.remainingSeconds)}（{new Date(savedExam.savedAt).toLocaleString("ja-JP")} 保存）</p>
              <div className="english-result-actions statistics-saved-actions"><button type="button" onClick={resumeExam}>続きから再開</button><button type="button" onClick={deleteSavedExam}>保存データを削除</button></div>
            </div>
          )}

          <div className="statistics-exam-rules">
            <div><span>TIME</span><strong>50:00</strong><small>自動保存・時間切れ採点</small></div>
            <div><span>SCORE</span><strong>100</strong><small>大問11題・小問26問</small></div>
            <div><span>PASS</span><strong>60</strong><small>59点以下は赤点</small></div>
          </div>

          <div className="statistics-expected-grid">
            {STATISTICS_EXPECTED_EXAMS.map((exam) => (
              <article key={exam.id}>
                <span>予想 第{String(exam.number).padStart(2, "0")}回</span>
                <h3>{exam.title}</h3>
                <p>記述統計・相関回帰・場合の数と確率・確率変数・連続分布を毎回まとめて出題します。</p>
                <small>大問11題 ／ 小問26問 ／ 50分 ／ 100点</small>
                <div className={styles.catalogActions}>
                  <button className={styles.secondaryButton} type="button" onClick={() => requestPrint(exam, false)}>A4問題用紙を印刷</button>
                  <button type="button" onClick={() => startExam(exam)}>ブラウザで開始 →</button>
                </div>
              </article>
            ))}
          </div>
        </section>
        {printPortal}
      </>
    );
  }

  if (phase === "active" && currentQuestion) {
    const response = responses[currentQuestion.id] ?? "";
    return (
      <>
        <section className="generic-test-workspace english-test-workspace statistics-expected-active" aria-labelledby="statistics-expected-active-title">
          <div className="statistics-expected-exam-bar">
            <div><span>予想 第{String(definition.number).padStart(2, "0")}回</span><strong id="statistics-expected-active-title">{definition.title}</strong></div>
            <div className={remainingSeconds <= 300 ? "is-urgent" : ""}><span>残り時間</span><strong>{formatTime(remainingSeconds)}</strong></div>
          </div>

          <div className={styles.activeTools}>
            <span>A4二段組・問題用紙と解答冊子は別ページ</span>
            <button className={styles.secondaryButton} type="button" onClick={() => requestPrint(definition, false)}>問題用紙のみ印刷</button>
            <button type="button" onClick={() => requestPrint(definition, true)}>問題＋解答を印刷</button>
          </div>

          <details className={styles.paperPreview}>
            <summary className={styles.previewSummary}>A4問題用紙を画面で一覧表示</summary>
            <div className={styles.paperPreviewViewport}><ExamPaper paper={paper} /></div>
          </details>

          <div className="generic-deck-meta english-test-meta statistics-question-meta">
            <span>第{currentQuestion.major}問 ({currentQuestion.sub}) · 小問 {index + 1} / {questions.length}</span>
            <span>{currentQuestion.points}点 · {currentQuestion.genre} · 難度{currentQuestion.difficulty}</span>
          </div>
          <div className="statistics-exam-progress" aria-label={`解答済み ${Object.values(responses).filter((value) => value.trim()).length}問`}>
            {questions.map((question, questionIndex) => (
              <button type="button" key={question.id} className={(questionIndex === index ? "is-current " : "") + ((responses[question.id] ?? "").trim() ? "is-answered" : "")} onClick={() => setIndex(questionIndex)} aria-label={`第${question.major}問 (${question.sub})${(responses[question.id] ?? "").trim() ? " 解答済み" : " 未回答"}`}>{questionIndex + 1}</button>
            ))}
          </div>

          {currentQuestion.context && <div className="english-guide-tip statistics-question-context"><span>共通データ</span><p><RichMathText text={currentQuestion.context} /></p></div>}
          <div className="generic-test-question english-test-question statistics-test-question"><span>第{currentQuestion.major}問 ({currentQuestion.sub})</span><h2><RichMathText text={currentQuestion.prompt} /></h2></div>

          <div className="english-answer-form statistics-answer-form statistics-expected-answer">
            {currentQuestion.format === "text" ? (
              <label className="english-input-answer english-translation-answer statistics-text-answer"><span>証明・理由を入力</span><textarea rows={7} value={response} onChange={(event) => updateResponse(event.target.value)} /></label>
            ) : (
              <label className="english-input-answer statistics-number-answer"><span>数値を入力</span><input autoComplete="off" inputMode="decimal" value={response} onChange={(event) => updateResponse(event.target.value)} placeholder="小数・分数・%で入力できます" /></label>
            )}
          </div>

          <div className="statistics-expected-navigation">
            <button type="button" disabled={index === 0} onClick={() => setIndex((current) => Math.max(0, current - 1))}>← 前の小問</button>
            <button type="button" onClick={pauseExam}>中断して保存</button>
            {index < questions.length - 1 ? <button type="button" onClick={() => setIndex((current) => current + 1)}>次の小問 →</button> : <button className="is-submit" type="button" onClick={finishExam}>提出して採点 →</button>}
          </div>
        </section>
        {printPortal}
      </>
    );
  }

  return (
    <>
      <section className="generic-test-workspace english-test-workspace statistics-expected-result" aria-labelledby="statistics-expected-result-title">
        <div className={`statistics-score-panel ${score >= PASS_SCORE ? "is-pass" : "is-fail"}`}>
          <span>{score >= PASS_SCORE ? "PASS" : "RED SCORE"}</span>
          <h2 id="statistics-expected-result-title">{score} <small>/ 100</small></h2>
          <strong>{score >= PASS_SCORE ? "合格です" : "赤点です（合格ライン60点）"}</strong>
          <p>予想 第{String(definition.number).padStart(2, "0")}回「{definition.title}」</p>
        </div>

        <div className={styles.activeTools}><span>問題用紙と模範解答を別ページで印刷できます</span><button type="button" onClick={() => requestPrint(definition, true)}>A4問題＋解答を印刷</button></div>

        <div className="statistics-topic-score-grid">
          {topicResults.map((row) => <div key={row.topic.id}><span>{row.topic.shortTitle}</span><strong>{row.earned} / {row.possible}</strong><progress value={row.earned} max={row.possible} /></div>)}
        </div>

        <div className="statistics-expected-solutions">
          <div className="english-panel-heading statistics-panel-heading"><div><span>MODEL ANSWERS</span><h2>解答・途中式・解説</h2></div><p>全26小問の模範解答です。説明問題は要点のキーワードで自動採点します。</p></div>
          {resultRows.map((row) => (
            <article key={row.question.id} className={row.correct ? "is-correct" : "is-wrong"}>
              <header><span>{row.correct ? "○" : "×"} 第{row.question.major}問 ({row.question.sub})</span><strong>{row.points}点</strong></header>
              <h3><RichMathText text={row.question.prompt} /></h3>
              <p><b>あなたの解答：</b><RichMathText text={row.response || "未回答"} /></p>
              <p><b>正答：</b><RichMathText text={row.question.answer} /></p>
              {row.question.formula && <div className="statistics-solution-formula"><span>使う公式</span><DisplayMath tex={row.question.formula} /></div>}
              <div className="statistics-solution-steps"><span>途中式</span><ol>{row.question.steps.map((step, stepIndex) => <li key={`${row.question.id}-${stepIndex}`}><RichMathText text={step} /></li>)}</ol></div>
              <p><b>解説：</b><RichMathText text={row.question.explanation} /></p>
            </article>
          ))}
        </div>

        <div className="english-result-actions statistics-result-actions"><button type="button" onClick={() => startExam(definition)}>同じ回をもう一度</button><button type="button" onClick={() => setPhase("catalog")}>別の想定試験を選ぶ</button></div>
      </section>
      {printPortal}
    </>
  );
}
