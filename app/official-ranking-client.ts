"use client";

import {
  getOfficialRankingSpec,
  type OfficialRankingSpec,
} from "./official-ranking-config";
import type {
  OfficialRankingResponse,
  OfficialRankingReviewItem,
  PublicOfficialRankingQuestion,
} from "./official-ranking-questions";
import {
  getRapidClientToken,
  loadRapidRankingProfile,
  normalizeRapidPlayerName,
} from "./rapid-ranking-data";
import { RAPID_CLIENT_TOKEN_HEADER } from "./rapid-ranking-profile";
import type { SubjectId } from "./study-data";

export type OfficialRankingChallenge = {
  challengeId: string;
  spec: OfficialRankingSpec;
  startedAt: number;
  expiresAt: number;
  questions: PublicOfficialRankingQuestion[];
};

export type OfficialRankingResult = {
  saved: true;
  improved: boolean;
  nameUpdated: boolean;
  alias: string;
  boardKey: string;
  correctCount: number;
  questionCount: number;
  bestStreak: number;
  durationMs: number;
  review: OfficialRankingReviewItem[];
};

export type OfficialRankingRequest<T> =
  | { ok: true; value: T }
  | { ok: false; status: number; error: string };

async function readRequest<T>(response: Response): Promise<OfficialRankingRequest<T>> {
  const payload = await response.json().catch(() => null) as (T & { error?: string }) | null;
  if (!response.ok || !payload) {
    return {
      ok: false,
      status: response.status,
      error: payload?.error ?? "LEADERBOARD_UNAVAILABLE",
    };
  }
  return { ok: true, value: payload };
}

function officialHeaders() {
  return {
    "content-type": "application/json",
    [RAPID_CLIENT_TOKEN_HEADER]: getRapidClientToken(),
  };
}

export async function startOfficialRankingChallenge(
  subjectId: SubjectId,
  playerName?: string,
): Promise<OfficialRankingRequest<OfficialRankingChallenge>> {
  const rankingName = normalizeRapidPlayerName(playerName)
    ?? loadRapidRankingProfile()?.rankingName
    ?? undefined;
  const response = await fetch("/api/leaderboard", {
    method: "POST",
    headers: officialHeaders(),
    body: JSON.stringify({ subjectId, ...(rankingName ? { rankingName } : {}) }),
  });
  const result = await readRequest<OfficialRankingChallenge>(response);
  if (!result.ok) return result;
  const expected = getOfficialRankingSpec(subjectId);
  const challenge = result.value;
  if (
    challenge.spec.boardKey !== expected.boardKey
    || challenge.spec.mode !== expected.mode
    || challenge.spec.version !== expected.version
    || challenge.spec.questionCount !== expected.questionCount
    || challenge.spec.timeLimitMs !== expected.timeLimitMs
    || challenge.spec.seed !== expected.seed
    || challenge.questions.length !== expected.questionCount
  ) {
    return { ok: false, status: 502, error: "INVALID_OFFICIAL_CHALLENGE" };
  }
  return result;
}

export async function submitOfficialRankingChallenge(
  challengeId: string,
  answers: readonly OfficialRankingResponse[],
): Promise<OfficialRankingRequest<OfficialRankingResult>> {
  const response = await fetch("/api/leaderboard", {
    method: "PUT",
    headers: officialHeaders(),
    body: JSON.stringify({ challengeId, answers }),
  });
  return readRequest<OfficialRankingResult>(response);
}
