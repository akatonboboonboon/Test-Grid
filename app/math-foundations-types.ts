export const MATH_FOUNDATION_SUBJECT_IDS = [
  "subject-3",
  "subject-4",
  "subject-5",
  "subject-6",
  "subject-7",
  "subject-8",
  "subject-9",
] as const;

export type MathFoundationSubjectId = typeof MATH_FOUNDATION_SUBJECT_IDS[number];

export type MathFoundationFormula = {
  label: string;
  tex: string;
  expandedTex?: string;
  note?: string;
};

export type MathFoundationSymbol = {
  symbol: string;
  meaning: string;
  unit?: string;
};

export type MathFoundationExample = {
  prompt: string;
  steps: string[];
  result: string;
};

export type MathFoundationEntry = {
  id: string;
  subjectId: MathFoundationSubjectId;
  category: string;
  title: string;
  overview: string;
  formulas: MathFoundationFormula[];
  symbols?: MathFoundationSymbol[];
  conditions: string[];
  workflow: string[];
  pitfalls: string[];
  example?: MathFoundationExample;
  keywords?: string[];
};

export type MathFoundationSubject = {
  id: MathFoundationSubjectId;
  name: string;
  englishName: string;
  accent: string;
  description: string;
  entries: MathFoundationEntry[];
};
