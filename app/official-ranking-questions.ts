import {
  getOfficialRankingSpec,
  type OfficialRankingSpec,
} from "./official-ranking-config";
import { OFFICIAL_RANKING_QUESTION_IDS } from "./official-ranking-question-ids";
import {
  getStaticRapidPool,
  type RapidQuestion,
} from "./rapid-quiz-data";
import type { SubjectId } from "./study-data";

export type OfficialRankingResponse = {
  questionId: string;
  selected: string | null;
};

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
>;

export type OfficialRankingReviewItem = {
  questionId: string;
  prompt: string;
  topicLabel: string;
  selected: string | null;
  correct: boolean;
  answer: string;
  acceptedOptions: string[];
  explanation: string;
  steps: string[];
  sourceBasis: string;
  studyHref: string;
  mathOptions?: boolean;
  visual?: RapidQuestion["visual"];
};

export function toPublicOfficialRankingQuestion(
  question: RapidQuestion,
): PublicOfficialRankingQuestion {
  return {
    id: question.id,
    subjectId: question.subjectId,
    topicLabel: question.topicLabel,
    prompt: question.prompt,
    options: question.options,
    mathOptions: question.mathOptions,
    visual: question.visual,
    difficulty: question.difficulty,
    recommendedSeconds: question.recommendedSeconds,
  };
}

export function getOfficialRankingQuestions(subjectId: SubjectId): RapidQuestion[] {
  const spec = getOfficialRankingSpec(subjectId);
  const byId = new Map(getStaticRapidPool(subjectId).map((question) => [question.id, question]));
  const ids = OFFICIAL_RANKING_QUESTION_IDS[subjectId];
  if (ids.length !== spec.questionCount || new Set(ids).size !== spec.questionCount) {
    throw new Error(`Official ranking v${spec.version} for ${subjectId} is not a unique ${spec.questionCount}-question set.`);
  }
  return ids.map((id) => {
    const question = byId.get(id);
    if (!question) throw new Error(`Official ranking question ${id} is missing from ${subjectId}.`);
    return question;
  });
}

export function getOfficialRankingQuestionIds(subjectId: SubjectId) {
  return [...OFFICIAL_RANKING_QUESTION_IDS[subjectId]];
}

export function officialRankingQuestionSetMatches(
  subjectId: SubjectId,
  questionIds: readonly unknown[],
) {
  const expected = OFFICIAL_RANKING_QUESTION_IDS[subjectId];
  return questionIds.length === expected.length
    && questionIds.every((questionId, index) => questionId === expected[index]);
}

export function scoreOfficialRankingResponses(
  spec: OfficialRankingSpec,
  responses: readonly OfficialRankingResponse[],
) {
  const questions = getOfficialRankingQuestions(spec.subjectId);
  let correctCount = 0;
  let streak = 0;
  let bestStreak = 0;
  const review: OfficialRankingReviewItem[] = [];
  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    const response = responses[index];
    const selected = response?.questionId === question.id ? response.selected : null;
    const correct = selected !== null && question.acceptedOptions.includes(selected);
    if (correct) {
      correctCount += 1;
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
    review.push({
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
    });
  }
  return { correctCount, bestStreak, review };
}
