export const RAPID_HISTORY_STORAGE_KEY = "test-grid:rapid-rankings:v1";

export type RapidAttemptSummary = {
  id: string;
  boardKey: string;
  subjectName: string;
  correctCount: number;
  questionCount: number;
  bestStreak: number;
  durationMs: number;
  completedAt: number;
};

function isFiniteInteger(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value);
}

export function normalizeRapidHistory(value: unknown): RapidAttemptSummary[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const candidate = entry as Partial<RapidAttemptSummary>;
    if (
      typeof candidate.id !== "string" ||
      typeof candidate.boardKey !== "string" ||
      typeof candidate.subjectName !== "string" ||
      !isFiniteInteger(candidate.correctCount) ||
      !isFiniteInteger(candidate.questionCount) ||
      !isFiniteInteger(candidate.bestStreak) ||
      !isFiniteInteger(candidate.durationMs) ||
      !isFiniteInteger(candidate.completedAt) ||
      candidate.questionCount! < 1 ||
      candidate.correctCount! < 0 ||
      candidate.correctCount! > candidate.questionCount! ||
      candidate.bestStreak! < 0 ||
      candidate.bestStreak! > candidate.questionCount! ||
      candidate.durationMs! < 1
    ) return [];
    return [candidate as RapidAttemptSummary];
  });
}

export function compareRapidAttempts(left: RapidAttemptSummary, right: RapidAttemptSummary) {
  const leftAccuracy = left.correctCount / left.questionCount;
  const rightAccuracy = right.correctCount / right.questionCount;
  return rightAccuracy - leftAccuracy ||
    right.correctCount - left.correctCount ||
    right.bestStreak - left.bestStreak ||
    left.durationMs - right.durationMs ||
    right.completedAt - left.completedAt;
}

export function historyForBoard(history: RapidAttemptSummary[], boardKey: string, limit = 10) {
  return history.filter((attempt) => attempt.boardKey === boardKey).sort(compareRapidAttempts).slice(0, limit);
}

export function mergeRapidHistories(left: unknown, right: unknown, limit = 120) {
  const byId = new Map<string, RapidAttemptSummary>();
  for (const attempt of [...normalizeRapidHistory(left), ...normalizeRapidHistory(right)]) {
    const existing = byId.get(attempt.id);
    if (!existing || attempt.completedAt > existing.completedAt) byId.set(attempt.id, attempt);
  }
  return [...byId.values()].sort((a, b) => b.completedAt - a.completedAt).slice(0, limit);
}

export function loadRapidHistory() {
  try {
    return normalizeRapidHistory(JSON.parse(window.localStorage.getItem(RAPID_HISTORY_STORAGE_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

export function saveRapidAttempt(attempt: RapidAttemptSummary) {
  const merged = mergeRapidHistories(loadRapidHistory(), [attempt]);
  try {
    window.localStorage.setItem(RAPID_HISTORY_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // A practice result should still complete when storage is unavailable.
  }
  return merged;
}

export function makeRapidBoardKey(scope: string, questionCount: number) {
  return `rapid:${scope}:q${questionCount}`;
}

export async function publishRapidScore(attempt: RapidAttemptSummary) {
  try {
    const response = await fetch("/api/leaderboard", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        boardKey: attempt.boardKey,
        correctCount: attempt.correctCount,
        questionCount: attempt.questionCount,
        bestStreak: attempt.bestStreak,
        durationMs: attempt.durationMs,
      }),
    });
    if (response.ok) return "saved" as const;
    if (response.status === 401) return "sign-in-required" as const;
    return "unavailable" as const;
  } catch {
    return "unavailable" as const;
  }
}
