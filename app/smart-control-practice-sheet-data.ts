export type SmartControlPracticePole = {
  re: number;
  im: number;
  multiplicity?: number;
  label: string;
};

export type SmartControlInverseLaplacePractice = {
  id: string;
  number: number;
  functionTex: string;
  factorizedTex: string;
  decompositionTex: string;
  inverseTex: string;
  polesTex: string;
  poles: readonly SmartControlPracticePole[];
  stability: string;
  stabilityKind: "stable" | "marginal" | "unstable";
  steps: readonly string[];
  sourceRole: "provided-practice";
  inExamScope: false;
};

export type SmartControlFeedbackPractice = {
  id: string;
  number: number;
  plantTex: string;
  closedLoopTex: string;
  characteristicTex: string;
  atOnePolesTex: string;
  atOneVerdict: string;
  stableRangeTex: string;
  stableRangeLabel: string;
  steps: readonly string[];
  sourceRole: "provided-practice";
  inExamScope: false;
};

export const SMART_CONTROL_PRACTICE_SHEET_META = {
  title: "スマート制御I 前期期末 練習問題",
  sourceLabel: "2026年7月23日受領・配布練習プリント",
  sourceRole: "provided-practice",
  inExamScope: false,
  note: "追加範囲ではありません。現在の範囲を、本番に近い計算手順で練習するための配布問題です。",
} as const;

export const SMART_CONTROL_INVERSE_LAPLACE_PRACTICE: readonly SmartControlInverseLaplacePractice[] = [
  {
    id: "smart-provided-practice-1-01",
    number: 1,
    functionTex: "F(s)=\\frac{2s+8}{s^2-2s+5}",
    factorizedTex: "F(s)=\\frac{2(s-1)+10}{(s-1)^2+2^2}",
    decompositionTex: "F(s)=2\\frac{s-1}{(s-1)^2+2^2}+5\\frac{2}{(s-1)^2+2^2}",
    inverseTex: "f(t)=2e^t\\cos 2t+5e^t\\sin 2t",
    polesTex: "s=1\\pm 2j",
    poles: [{ re: 1, im: 2, label: "1+2j" }, { re: 1, im: -2, label: "1-2j" }],
    stability: "右半平面に極があるため不安定。振幅は e^t で増大する。",
    stabilityKind: "unstable",
    steps: [
      "分母を \\((s-1)^2+2^2\\) に平方完成する。",
      "分子を \\(2(s-1)+10\\) に直し、余弦項と正弦項へ分ける。",
      "極 \\(1\\pm2j\\) は実部が正なので不安定と判定する。",
    ],
    sourceRole: "provided-practice",
    inExamScope: false,
  },
  {
    id: "smart-provided-practice-1-02",
    number: 2,
    functionTex: "F(s)=\\frac{s+3}{(s^2-1)(s+2)}",
    factorizedTex: "F(s)=\\frac{s+3}{(s-1)(s+1)(s+2)}",
    decompositionTex: "F(s)=\\frac{2}{3(s-1)}-\\frac{1}{s+1}+\\frac{1}{3(s+2)}",
    inverseTex: "f(t)=\\frac{2}{3}e^t-e^{-t}+\\frac{1}{3}e^{-2t}",
    polesTex: "s=1,\\,-1,\\,-2",
    poles: [{ re: 1, im: 0, label: "1" }, { re: -1, im: 0, label: "-1" }, { re: -2, im: 0, label: "-2" }],
    stability: "右半平面の極 s=1 があるため不安定。",
    stabilityKind: "unstable",
    steps: [
      "\\(s^2-1=(s-1)(s+1)\\) と因数分解する。",
      "各一次因子に対して部分分数分解する。",
      "極のうち \\(s=1\\) が右半平面にあるので不安定と判定する。",
    ],
    sourceRole: "provided-practice",
    inExamScope: false,
  },
  {
    id: "smart-provided-practice-1-03",
    number: 3,
    functionTex: "F(s)=\\frac{s+1}{s^2(s-1)}",
    factorizedTex: "F(s)=\\frac{s+1}{s^2(s-1)}",
    decompositionTex: "F(s)=-\\frac{2}{s}-\\frac{1}{s^2}+\\frac{2}{s-1}",
    inverseTex: "f(t)=-2-t+2e^t",
    polesTex: "s=0\\;\\text{（2重極）},\\quad s=1",
    poles: [{ re: 0, im: 0, multiplicity: 2, label: "0（2重）" }, { re: 1, im: 0, label: "1" }],
    stability: "右半平面の極 s=1 を含むため不安定。",
    stabilityKind: "unstable",
    steps: [
      "\\(s=0\\) は2重極なので \\(A/s+B/s^2\\) の両方を置く。",
      "部分分数から \\(1/s^2\\leftrightarrow t\\) を使って逆変換する。",
      "右半平面の極 \\(s=1\\) があるため不安定と判定する。",
    ],
    sourceRole: "provided-practice",
    inExamScope: false,
  },
  {
    id: "smart-provided-practice-1-04",
    number: 4,
    functionTex: "F(s)=\\frac{2s+1}{(s^2-s-6)(s+1)}",
    factorizedTex: "F(s)=\\frac{2s+1}{(s-3)(s+2)(s+1)}",
    decompositionTex: "F(s)=\\frac{7}{20(s-3)}-\\frac{3}{5(s+2)}+\\frac{1}{4(s+1)}",
    inverseTex: "f(t)=\\frac{7}{20}e^{3t}-\\frac{3}{5}e^{-2t}+\\frac{1}{4}e^{-t}",
    polesTex: "s=3,\\,-2,\\,-1",
    poles: [{ re: 3, im: 0, label: "3" }, { re: -2, im: 0, label: "-2" }, { re: -1, im: 0, label: "-1" }],
    stability: "右半平面の極 s=3 があるため不安定。",
    stabilityKind: "unstable",
    steps: [
      "\\(s^2-s-6=(s-3)(s+2)\\) と因数分解する。",
      "3本の一次分数へ分けて係数を求める。",
      "\\(e^{3t}\\) に対応する右半平面極があるので不安定と判定する。",
    ],
    sourceRole: "provided-practice",
    inExamScope: false,
  },
  {
    id: "smart-provided-practice-1-05",
    number: 5,
    functionTex: "F(s)=\\frac{s+1}{s^2-4s+13}",
    factorizedTex: "F(s)=\\frac{(s-2)+3}{(s-2)^2+3^2}",
    decompositionTex: "F(s)=\\frac{s-2}{(s-2)^2+3^2}+\\frac{3}{(s-2)^2+3^2}",
    inverseTex: "f(t)=e^{2t}(\\cos 3t+\\sin 3t)",
    polesTex: "s=2\\pm 3j",
    poles: [{ re: 2, im: 3, label: "2+3j" }, { re: 2, im: -3, label: "2-3j" }],
    stability: "右半平面に共役極があるため不安定。",
    stabilityKind: "unstable",
    steps: [
      "分母を \\((s-2)^2+3^2\\) に平方完成する。",
      "分子を \\((s-2)+3\\) と書き換える。",
      "極の実部が2なので、振動しながら増大する不安定系と判定する。",
    ],
    sourceRole: "provided-practice",
    inExamScope: false,
  },
  {
    id: "smart-provided-practice-1-06",
    number: 6,
    functionTex: "F(s)=\\frac{2s-3}{(s^2+4)(s+1)}",
    factorizedTex: "F(s)=\\frac{2s-3}{(s^2+2^2)(s+1)}",
    decompositionTex: "F(s)=-\\frac{1}{s+1}+\\frac{s}{s^2+4}+\\frac{1}{s^2+4}",
    inverseTex: "f(t)=-e^{-t}+\\cos 2t+\\frac{1}{2}\\sin 2t",
    polesTex: "s=-1,\\quad s=\\pm 2j",
    poles: [{ re: -1, im: 0, label: "-1" }, { re: 0, im: 2, label: "2j" }, { re: 0, im: -2, label: "-2j" }],
    stability: "虚軸上に単純極があるため限界安定。漸近安定でもBIBO安定でもない。",
    stabilityKind: "marginal",
    steps: [
      "\\((As+B)/(s^2+4)+C/(s+1)\\) と置いて係数を比較する。",
      "\\(1/(s^2+4)\\leftrightarrow (1/2)\\sin2t\\) に注意する。",
      "単純な虚軸上極は持続振動を生むため、厳密な安定ではなく限界安定とする。",
    ],
    sourceRole: "provided-practice",
    inExamScope: false,
  },
  {
    id: "smart-provided-practice-1-07",
    number: 7,
    functionTex: "F(s)=\\frac{s-7}{s^3-5s^2+7s-3}",
    factorizedTex: "F(s)=\\frac{s-7}{(s-1)^2(s-3)}",
    decompositionTex: "F(s)=\\frac{3}{(s-1)^2}+\\frac{1}{s-1}-\\frac{1}{s-3}",
    inverseTex: "f(t)=3te^t+e^t-e^{3t}",
    polesTex: "s=1\\;\\text{（2重極）},\\quad s=3",
    poles: [{ re: 1, im: 0, multiplicity: 2, label: "1（2重）" }, { re: 3, im: 0, label: "3" }],
    stability: "すべての極が右半平面にあるため不安定。",
    stabilityKind: "unstable",
    steps: [
      "分母を \\((s-1)^2(s-3)\\) に因数分解する。",
      "2重極には \\(A/(s-1)^2+B/(s-1)\\) を置く。",
      "\\(s=1,3\\) はともに右半平面なので不安定と判定する。",
    ],
    sourceRole: "provided-practice",
    inExamScope: false,
  },
  {
    id: "smart-provided-practice-1-08",
    number: 8,
    functionTex: "F(s)=\\frac{s+1}{s^2}",
    factorizedTex: "F(s)=\\frac{1}{s}+\\frac{1}{s^2}",
    decompositionTex: "F(s)=\\frac{1}{s}+\\frac{1}{s^2}",
    inverseTex: "f(t)=1+t",
    polesTex: "s=0\\;\\text{（2重極）}",
    poles: [{ re: 0, im: 0, multiplicity: 2, label: "0（2重）" }],
    stability: "原点の2重極により t に比例して応答が増大するため不安定。",
    stabilityKind: "unstable",
    steps: [
      "分子を分けて \\(1/s+1/s^2\\) とする。",
      "\\(1/s\\leftrightarrow1\\)、\\(1/s^2\\leftrightarrow t\\) を使う。",
      "虚軸上の重極は無界応答を生むため不安定と判定する。",
    ],
    sourceRole: "provided-practice",
    inExamScope: false,
  },
  {
    id: "smart-provided-practice-1-09",
    number: 9,
    functionTex: "F(s)=\\frac{4s+7}{s^2+2s+10}",
    factorizedTex: "F(s)=\\frac{4(s+1)+3}{(s+1)^2+3^2}",
    decompositionTex: "F(s)=4\\frac{s+1}{(s+1)^2+3^2}+\\frac{3}{(s+1)^2+3^2}",
    inverseTex: "f(t)=e^{-t}(4\\cos 3t+\\sin 3t)",
    polesTex: "s=-1\\pm 3j",
    poles: [{ re: -1, im: 3, label: "-1+3j" }, { re: -1, im: -3, label: "-1-3j" }],
    stability: "すべての極が左半平面にあるため安定。",
    stabilityKind: "stable",
    steps: [
      "分母を \\((s+1)^2+3^2\\) に平方完成する。",
      "分子を \\(4(s+1)+3\\) と書き換える。",
      "共役極の実部が -1 なので、振動しながら減衰する安定系と判定する。",
    ],
    sourceRole: "provided-practice",
    inExamScope: false,
  },
  {
    id: "smart-provided-practice-1-10",
    number: 10,
    functionTex: "F(s)=\\frac{s-9}{(s+1)^2(s-1)}",
    factorizedTex: "F(s)=\\frac{s-9}{(s+1)^2(s-1)}",
    decompositionTex: "F(s)=\\frac{5}{(s+1)^2}+\\frac{2}{s+1}-\\frac{2}{s-1}",
    inverseTex: "f(t)=5te^{-t}+2e^{-t}-2e^t",
    polesTex: "s=-1\\;\\text{（2重極）},\\quad s=1",
    poles: [{ re: -1, im: 0, multiplicity: 2, label: "-1（2重）" }, { re: 1, im: 0, label: "1" }],
    stability: "右半平面の極 s=1 があるため不安定。",
    stabilityKind: "unstable",
    steps: [
      "2重極 \\(s=-1\\) に対し2つの分数項を置く。",
      "\\(1/(s+1)^2\\leftrightarrow te^{-t}\\) を使って逆変換する。",
      "右半平面の極 \\(s=1\\) があるため不安定と判定する。",
    ],
    sourceRole: "provided-practice",
    inExamScope: false,
  },
  {
    id: "smart-provided-practice-1-11",
    number: 11,
    functionTex: "F(s)=\\frac{5s-1}{s^3+s^2-s-1}",
    factorizedTex: "F(s)=\\frac{5s-1}{(s+1)^2(s-1)}",
    decompositionTex: "F(s)=\\frac{3}{(s+1)^2}-\\frac{1}{s+1}+\\frac{1}{s-1}",
    inverseTex: "f(t)=3te^{-t}-e^{-t}+e^t",
    polesTex: "s=-1\\;\\text{（2重極）},\\quad s=1",
    poles: [{ re: -1, im: 0, multiplicity: 2, label: "-1（2重）" }, { re: 1, im: 0, label: "1" }],
    stability: "右半平面の極 s=1 があるため不安定。",
    stabilityKind: "unstable",
    steps: [
      "分母を \\(s^3+s^2-s-1=(s+1)^2(s-1)\\) と因数分解する。",
      "2重極を含む部分分数に分解して逆変換する。",
      "右半平面の極 \\(s=1\\) があるため不安定と判定する。",
    ],
    sourceRole: "provided-practice",
    inExamScope: false,
  },
] as const;

export const SMART_CONTROL_FEEDBACK_PRACTICE: readonly SmartControlFeedbackPractice[] = [
  {
    id: "smart-provided-practice-2-01",
    number: 1,
    plantTex: "G(s)=\\frac{1}{(s-1)(s+2)}",
    closedLoopTex: "T(s)=\\frac{K}{(s-1)(s+2)+K}=\\frac{K}{s^2+s+(K-2)}",
    characteristicTex: "s^2+s+(K-2)=0",
    atOnePolesTex: "K=1:\\quad s=\\frac{-1\\pm\\sqrt{5}}{2}",
    atOneVerdict: "一方の極 (-1+√5)/2 が正なので、K=1では不安定。",
    stableRangeTex: "K>2",
    stableRangeLabel: "安定範囲は K>2。K=2では極が0と-1になり、漸近安定ではない。",
    steps: [
      "単位負帰還なので \\(T(s)=KG(s)/(1+KG(s))\\) を使う。",
      "特性多項式 \\(s^2+s+(K-2)\\) を作る。",
      "2次系の係数がすべて正という条件から \\(K-2>0\\) を得る。",
      "\\(K=1\\) では正の実極を1つ持つため不安定。",
    ],
    sourceRole: "provided-practice",
    inExamScope: false,
  },
  {
    id: "smart-provided-practice-2-02",
    number: 2,
    plantTex: "G(s)=\\frac{1}{s^2}",
    closedLoopTex: "T(s)=\\frac{K}{s^2+K}",
    characteristicTex: "s^2+K=0",
    atOnePolesTex: "K=1:\\quad s=\\pm j",
    atOneVerdict: "K=1では虚軸上の単純極となるため限界安定。漸近安定・BIBO安定ではない。",
    stableRangeTex: "\\nexists K\\in\\mathbb{R}\\;\\text{ such that all poles satisfy }\\operatorname{Re}(s)<0",
    stableRangeLabel: "極をすべて左半平面へ移す実数Kは存在せず、厳密には安定化できない。",
    steps: [
      "閉ループ特性方程式は \\(s^2+K=0\\) となる。",
      "\\(K>0\\) では極は \\(\\pm j\\sqrt{K}\\) で虚軸上、\\(K=0\\) では原点の2重極。",
      "\\(K<0\\) では極は \\(\\pm\\sqrt{-K}\\) となり、一方が右半平面へ入る。",
      "したがって厳密な漸近安定となる実数Kは存在しない。",
    ],
    sourceRole: "provided-practice",
    inExamScope: false,
  },
] as const;

export const SMART_CONTROL_PROVIDED_PRACTICE_IDS = [
  ...SMART_CONTROL_INVERSE_LAPLACE_PRACTICE.map((problem) => problem.id),
  ...SMART_CONTROL_FEEDBACK_PRACTICE.map((problem) => problem.id),
] as const;
