import {
  COMPREHENSIVE_MAX_QUESTIONS,
  RAPID_SUBJECT_IDS,
  type RapidQuestion,
  type RapidQuestionInstance,
} from "./rapid-quiz-data";
import type { SubjectId } from "./study-data";

export const OVERALL_PAUSE_STORAGE_KEY = "test-grid:comprehensive-challenge:v1";

type PauseQuestionRef = {
  subjectId: SubjectId;
  id: string;
  instanceId: string;
};

type PauseResult = {
  questionIndex: number;
  selected: string | null;
  correct: boolean;
  timedOut: boolean;
  elapsedMs: number;
};

type AnswerResultLike = {
  question: RapidQuestionInstance;
  selected: string | null;
  correct: boolean;
  timedOut: boolean;
  elapsedMs: number;
};

type PauseRunnerLike = {
  session: RapidQuestionInstance[];
  index: number;
  remainingMs: number;
  results: AnswerResultLike[];
  correctCount: number;
  streak: number;
  bestStreak: number;
};

export type OverallPauseSnapshot = {
  version: 1;
  phase: "paused";
  questionCount: number;
  limitSeconds: number;
  session: PauseQuestionRef[];
  index: number;
  remainingMs: number;
  results: PauseResult[];
  correctCount: number;
  streak: number;
  bestStreak: number;
  activeElapsedMs: number;
  savedAt: number;
};

export type RestoredOverallPause = Omit<OverallPauseSnapshot, "session" | "results"> & {
  session: RapidQuestionInstance[];
  results: AnswerResultLike[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeInteger(value: unknown, minimum: number, maximum: number): value is number {
  return Number.isSafeInteger(value) && (value as number) >= minimum && (value as number) <= maximum;
}

function isFiniteNumber(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum;
}

export function createOverallPauseSnapshot(
  runner: PauseRunnerLike,
  questionCount: number,
  limitSeconds: number,
  activeElapsedMs: number,
): OverallPauseSnapshot {
  const questionIndexes = new Map(runner.session.map((question, index) => [question.instanceId, index]));
  return {
    version: 1,
    phase: "paused",
    questionCount,
    limitSeconds,
    session: runner.session.map((question) => ({
      subjectId: question.subjectId,
      id: question.id,
      instanceId: question.instanceId,
    })),
    index: runner.index,
    remainingMs: runner.remainingMs,
    results: runner.results.map((result, resultIndex) => ({
      questionIndex: questionIndexes.get(result.question.instanceId) ?? resultIndex,
      selected: result.selected,
      correct: result.correct,
      timedOut: result.timedOut,
      elapsedMs: result.elapsedMs,
    })),
    correctCount: runner.correctCount,
    streak: runner.streak,
    bestStreak: runner.bestStreak,
    activeElapsedMs: Math.max(0, activeElapsedMs),
    savedAt: Date.now(),
  };
}

export function restoreOverallPauseSnapshot(
  raw: string | null,
  pools: Record<SubjectId, RapidQuestion[]>,
): RestoredOverallPause | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 1 || parsed.phase !== "paused") return null;
    if (!Array.isArray(parsed.session) || !Array.isArray(parsed.results)) return null;
    const sessionLength = parsed.session.length;
    if (!isSafeInteger(sessionLength, 9, COMPREHENSIVE_MAX_QUESTIONS) || sessionLength % 9 !== 0) return null;
    if (parsed.questionCount !== sessionLength) return null;
    if (!isSafeInteger(parsed.limitSeconds, 1, 300)) return null;
    if (!isSafeInteger(parsed.index, 0, sessionLength - 1)) return null;
    if (!isFiniteNumber(parsed.remainingMs, 0, parsed.limitSeconds * 1000)) return null;
    if (!isFiniteNumber(parsed.activeElapsedMs, 0, Number.MAX_SAFE_INTEGER)) return null;
    if (!isFiniteNumber(parsed.savedAt, 0, Number.MAX_SAFE_INTEGER)) return null;
    if (!isSafeInteger(parsed.correctCount, 0, parsed.index)) return null;
    if (!isSafeInteger(parsed.streak, 0, parsed.index)) return null;
    if (!isSafeInteger(parsed.bestStreak, parsed.streak, parsed.index)) return null;
    if (parsed.results.length !== parsed.index) return null;

    const validSubjects = new Set<SubjectId>(RAPID_SUBJECT_IDS);
    const questionMaps = Object.fromEntries(RAPID_SUBJECT_IDS.map((subjectId) => [
      subjectId,
      new Map((pools[subjectId] ?? []).map((question) => [question.id, question])),
    ])) as Record<SubjectId, Map<string, RapidQuestion>>;

    const session: RapidQuestionInstance[] = [];
    const seenInstances = new Set<string>();
    for (const value of parsed.session) {
      if (!isRecord(value) || typeof value.id !== "string" || typeof value.instanceId !== "string") return null;
      if (typeof value.subjectId !== "string" || !validSubjects.has(value.subjectId as SubjectId)) return null;
      if (!value.instanceId || seenInstances.has(value.instanceId)) return null;
      const subjectId = value.subjectId as SubjectId;
      const question = questionMaps[subjectId].get(value.id);
      if (!question) return null;
      seenInstances.add(value.instanceId);
      session.push({ ...question, instanceId: value.instanceId });
    }

    const results: AnswerResultLike[] = [];
    for (let resultIndex = 0; resultIndex < parsed.results.length; resultIndex += 1) {
      const value = parsed.results[resultIndex];
      if (!isRecord(value) || value.questionIndex !== resultIndex) return null;
      if (value.selected !== null && typeof value.selected !== "string") return null;
      if (typeof value.correct !== "boolean" || typeof value.timedOut !== "boolean") return null;
      if (!isFiniteNumber(value.elapsedMs, 0, parsed.limitSeconds * 1000)) return null;
      const question = session[resultIndex];
      if (!question) return null;
      results.push({
        question,
        selected: value.selected as string | null,
        correct: value.correct,
        timedOut: value.timedOut,
        elapsedMs: value.elapsedMs,
      });
    }

    return {
      version: 1,
      phase: "paused",
      questionCount: sessionLength,
      limitSeconds: parsed.limitSeconds,
      session,
      index: parsed.index,
      remainingMs: parsed.remainingMs,
      results,
      correctCount: parsed.correctCount,
      streak: parsed.streak,
      bestStreak: parsed.bestStreak,
      activeElapsedMs: parsed.activeElapsedMs,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}
