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
