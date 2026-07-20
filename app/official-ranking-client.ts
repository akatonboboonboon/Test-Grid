"use client";

import {
  getOfficialRankingSpec,
  type OfficialRankingSpec,
} from "./official-ranking-config";
import type {
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

export type OfficialRankingReference = {
  label: string;
  quote: string;
  translation?: string;
};

export type OfficialRankingFeedback = OfficialRankingReviewItem & {
  reference?: OfficialRankingReference;
};

export type OfficialRankingSessionState = {
  sessionId: string;
  attemptId: string;
  spec: OfficialRankingSpec;
  alias: string;
  currentStreak: number;
  bestStreak: number;
  totalAnswered: number;
  totalCorrect: number;
  question: PublicOfficialRankingQuestion;
};

export type OfficialRankingSession = OfficialRankingSessionState & {
  resumed: boolean;
};

export type OfficialRankingAnswerResult = OfficialRankingSessionState & {
  feedback: OfficialRankingFeedback;
  improved: boolean;
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

function validStateForSubject(state: OfficialRankingSessionState, subjectId: SubjectId) {
  const expected = getOfficialRankingSpec(subjectId);
  return state.spec?.boardKey === expected.boardKey
    && state.question?.subjectId === subjectId
    && typeof state.sessionId === "string"
    && typeof state.attemptId === "string";
}

export async function startOfficialRankingSession(
  subjectId: SubjectId,
  playerName?: string,
): Promise<OfficialRankingRequest<OfficialRankingSession>> {
  const rankingName = normalizeRapidPlayerName(playerName)
    ?? loadRapidRankingProfile()?.rankingName
    ?? undefined;
  const response = await fetch("/api/leaderboard", {
    method: "POST",
    headers: officialHeaders(),
    body: JSON.stringify({ subjectId, ...(rankingName ? { rankingName } : {}) }),
  });
  const result = await readRequest<OfficialRankingSession>(response);
  if (!result.ok) return result;
  return validStateForSubject(result.value, subjectId)
    ? result
    : { ok: false, status: 502, error: "INVALID_OFFICIAL_SESSION" };
}

export async function submitOfficialRankingAnswer(
  session: Pick<OfficialRankingSessionState, "sessionId" | "attemptId" | "question" | "spec">,
  selected: string,
): Promise<OfficialRankingRequest<OfficialRankingAnswerResult>> {
  const response = await fetch("/api/leaderboard", {
    method: "PUT",
    headers: officialHeaders(),
    body: JSON.stringify({
      subjectId: session.spec.subjectId,
      sessionId: session.sessionId,
      attemptId: session.attemptId,
      questionId: session.question.id,
      selected,
    }),
  });
  const result = await readRequest<OfficialRankingAnswerResult>(response);
  if (!result.ok) return result;
  return validStateForSubject(result.value, session.spec.subjectId)
    ? result
    : { ok: false, status: 502, error: "INVALID_OFFICIAL_SESSION" };
}
