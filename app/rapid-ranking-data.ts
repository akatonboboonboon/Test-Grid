import {
  RAPID_CLIENT_STORAGE_KEY,
  RAPID_CLIENT_TOKEN_PATTERN,
  RAPID_PROFILE_STORAGE_KEY,
  normalizeRankingName,
  normalizeRapidRankingProfile,
  type RapidRankingProfile,
} from "./rapid-ranking-profile";

export const RAPID_HISTORY_STORAGE_KEY = "test-grid:rapid-rankings:v1";

export { RAPID_PROFILE_STORAGE_KEY };

export type RapidAttemptSummary = {
  id: string;
  boardKey: string;
  subjectName: string;
  playerName: string;
  correctCount: number;
  questionCount: number;
  bestStreak: number;
  durationMs: number;
  completedAt: number;
};

let fallbackRapidProfile: RapidRankingProfile | null = null;
let fallbackRapidClientToken: string | null = null;

function isFiniteInteger(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value);
}

export function loadRapidRankingProfile() {
  try {
    const stored = normalizeRapidRankingProfile(JSON.parse(
      window.localStorage.getItem(RAPID_PROFILE_STORAGE_KEY) ?? "null",
    ));
    if (stored) fallbackRapidProfile = stored;
    return stored ?? fallbackRapidProfile;
  } catch {
    return fallbackRapidProfile;
  }
}

function persistRapidRankingProfile(profile: RapidRankingProfile) {
  fallbackRapidProfile = profile;
  try {
    window.localStorage.setItem(RAPID_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Keep the in-memory value so a score can still be submitted this session.
  }
  window.dispatchEvent(new CustomEvent("test-grid:ranking-profile-changed"));
  return profile;
}

export function saveRapidRankingName(value: unknown) {
  const rankingName = normalizeRankingName(value);
  if (!rankingName) return null;
  return persistRapidRankingProfile({ version: 1, rankingName, updatedAt: Date.now() });
}

export function clearRapidRankingName() {
  return persistRapidRankingProfile({ version: 1, rankingName: null, updatedAt: Date.now() });
}

export function normalizeRapidPlayerName(value: unknown) {
  return normalizeRankingName(value);
}

export function loadRapidPlayerName() {
  const savedName = loadRapidRankingProfile()?.rankingName;
  if (savedName) return savedName;
  if (typeof document === "undefined") return "";
  return normalizeRapidPlayerName(
    document.querySelector<HTMLElement>("[data-default-ranking-name]")?.dataset.defaultRankingName,
  ) ?? "";
}

export function saveRapidPlayerName(value: unknown) {
  return saveRapidRankingName(value)?.rankingName ?? "";
}

function createRapidClientToken() {
  if (typeof crypto.randomUUID === "function") {
    return `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/gu, "");
  }
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getRapidClientToken() {
  try {
    const stored = window.localStorage.getItem(RAPID_CLIENT_STORAGE_KEY);
    if (stored && RAPID_CLIENT_TOKEN_PATTERN.test(stored)) {
      fallbackRapidClientToken = stored;
      return stored;
    }
  } catch {
    // Fall back to a session-only token below.
  }
  if (!fallbackRapidClientToken) fallbackRapidClientToken = createRapidClientToken();
  try {
    window.localStorage.setItem(RAPID_CLIENT_STORAGE_KEY, fallbackRapidClientToken);
  } catch {
    // A session-only identifier still enables a public submission.
  }
  return fallbackRapidClientToken;
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
    const playerName = normalizeRapidPlayerName(candidate.playerName) ?? "\u4ee5\u524d\u306e\u8a18\u9332";
    return [{ ...candidate as RapidAttemptSummary, playerName }];
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

export async function publishRapidScore(_attempt: RapidAttemptSummary) {
  void _attempt;
  // Variable-count rapid drills and the comprehensive practice are intentionally
  // local-only. Public scores can only be created by the fixed official test.
  return "unavailable" as const;
}
