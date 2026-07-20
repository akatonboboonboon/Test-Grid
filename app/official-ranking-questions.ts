import {
  getOfficialRankingEligiblePool,
  type RapidQuestion,
} from "./rapid-quiz-data";
import type { SubjectId } from "./study-data";

export type OfficialRankingResponse = {
  questionId: string;
  selected: string | null;
};

export type PublicOfficialRankingReference = Pick<
  NonNullable<RapidQuestion["reference"]>,
  "label" | "quote"
>;

export type PublicOfficialRankingQuestion = Pick<
  RapidQuestion,
  | "id"
  | "subjectId"
  | "topicLabel"
  | "prompt"
  | "options"
  | "mathOptions"
  | "visual"
  | "difficulty"
  | "recommendedSeconds"
> & {
  instruction: string;
  reference?: PublicOfficialRankingReference;
};

export type OfficialRankingFeedback = {
  questionId: string;
  prompt: string;
  topicLabel: string;
  selected: string;
  correct: boolean;
  answer: string;
  acceptedOptions: string[];
  explanation: string;
  steps: string[];
  sourceBasis: string;
  studyHref: string;
  mathOptions?: boolean;
  visual?: RapidQuestion["visual"];
  reference: RapidQuestion["reference"];
};

export type OfficialRankingReviewItem = OfficialRankingFeedback;

export function officialRankingInstruction(question: RapidQuestion) {
  const topic = question.topicLabel;
  if (/True\s*\/\s*False/iu.test(topic)) {
    return "参照本文と一致するなら T、異なるなら F を選んでください。";
  }
  if (/語彙・熟語（日→英）/u.test(topic)) {
    return "示された日本語に対応する英語を選んでください。";
  }
  if (/語彙・熟語（英→日）/u.test(topic)) {
    return "示された英語に対応する日本語を選んでください。";
  }
  if (/本文抜粋・日→英/u.test(topic)) {
    return "日本語に対応する本文中の英文を選んでください。";
  }
  if (/(?:長文和訳|和訳)/u.test(topic)) {
    return "英文の意味に最も合う日本語を選んでください。";
  }
  if (/(?:一文整序|語順整序|並び替え)/u.test(topic)) {
    return "語句を正しい順に並べた英文を選んでください。";
  }
  if (question.subjectId === "network" && question.options.some((option) => /^L[1-7]$/iu.test(option.trim()))) {
    return "表示されたプロトコルが属するOSI参照モデルの層を選んでください。";
  }
  return "設問を読み、最も適切な選択肢を選んでください。";
}

export function toPublicOfficialRankingQuestion(
  question: RapidQuestion,
): PublicOfficialRankingQuestion {
  return {
    id: question.id,
    subjectId: question.subjectId,
    topicLabel: question.topicLabel,
    prompt: question.prompt,
    options: [...question.options],
    mathOptions: question.mathOptions,
    visual: question.visual,
    difficulty: question.difficulty,
    recommendedSeconds: question.recommendedSeconds,
    instruction: officialRankingInstruction(question),
    reference: question.reference
      ? { label: question.reference.label, quote: question.reference.quote }
      : undefined,
  };
}

export function getOfficialRankingQuestions(subjectId: SubjectId): RapidQuestion[] {
  const questions = getOfficialRankingEligiblePool(subjectId);
  if (!questions.length || new Set(questions.map((question) => question.id)).size !== questions.length) {
    throw new Error(`Official ranking eligible pool for ${subjectId} must contain unique questions.`);
  }
  return questions;
}

export function getOfficialRankingQuestion(subjectId: SubjectId, questionId: string) {
  return getOfficialRankingQuestions(subjectId).find((question) => question.id === questionId) ?? null;
}

export function updateOfficialRankingStreak(
  currentStreak: number,
  bestStreak: number,
  correct: boolean,
) {
  const nextCurrent = correct ? currentStreak + 1 : 0;
  return {
    currentStreak: nextCurrent,
    bestStreak: Math.max(currentStreak, bestStreak, nextCurrent),
  };
}

export function scoreOfficialRankingAnswer(question: RapidQuestion, selected: string) {
  const correct = question.acceptedOptions.includes(selected);
  const feedback: OfficialRankingFeedback = {
    questionId: question.id,
    prompt: question.prompt,
    topicLabel: question.topicLabel,
    selected,
    correct,
    answer: question.answer,
    acceptedOptions: [...question.acceptedOptions],
    explanation: question.explanation,
    steps: [...question.steps],
    sourceBasis: question.sourceBasis,
    studyHref: question.studyHref,
    mathOptions: question.mathOptions,
    visual: question.visual,
    reference: question.reference,
  };
  return { correct, feedback };
}
