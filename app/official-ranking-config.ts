import type { SubjectId } from "./study-data";

export const OFFICIAL_RANKING_MODE = "official-ranking-test" as const;
export const OFFICIAL_RANKING_VERSION = 1 as const;
export const OFFICIAL_RANKING_QUESTION_COUNT = 20 as const;

export type OfficialRankingSpec = {
  subjectId: SubjectId;
  mode: typeof OFFICIAL_RANKING_MODE;
  version: typeof OFFICIAL_RANKING_VERSION;
  questionCount: typeof OFFICIAL_RANKING_QUESTION_COUNT;
  timeLimitMs: number;
  seed: string;
  boardKey: string;
};

const SUBJECT_TIME_LIMITS_MS: Record<SubjectId, number> = {
  "subject-2": 15 * 60_000,
  network: 3 * 60_000,
  "subject-3": 30 * 60_000,
  "subject-4": 30 * 60_000,
  "subject-5": 30 * 60_000,
  "subject-6": 30 * 60_000,
  "subject-7": 30 * 60_000,
  "subject-8": 30 * 60_000,
  "subject-9": 30 * 60_000,
};

export const OFFICIAL_RANKING_SUBJECT_IDS = [
  "subject-2",
  "network",
  "subject-3",
  "subject-4",
  "subject-5",
  "subject-6",
  "subject-7",
  "subject-8",
  "subject-9",
] as const satisfies readonly SubjectId[];

function makeOfficialRankingSpec(subjectId: SubjectId): OfficialRankingSpec {
  return Object.freeze({
    subjectId,
    mode: OFFICIAL_RANKING_MODE,
    version: OFFICIAL_RANKING_VERSION,
    questionCount: OFFICIAL_RANKING_QUESTION_COUNT,
    timeLimitMs: SUBJECT_TIME_LIMITS_MS[subjectId],
    seed: `test-grid-ranking-${subjectId}-v${OFFICIAL_RANKING_VERSION}`,
    boardKey: `ranking:${subjectId}:v${OFFICIAL_RANKING_VERSION}`,
  });
}

export const OFFICIAL_RANKING_SPECS = Object.freeze(Object.fromEntries(
  OFFICIAL_RANKING_SUBJECT_IDS.map((subjectId) => [subjectId, makeOfficialRankingSpec(subjectId)]),
) as Record<SubjectId, OfficialRankingSpec>);

export function isOfficialRankingSubjectId(value: unknown): value is SubjectId {
  return typeof value === "string"
    && Object.prototype.hasOwnProperty.call(OFFICIAL_RANKING_SPECS, value);
}

export function getOfficialRankingSpec(subjectId: SubjectId) {
  return OFFICIAL_RANKING_SPECS[subjectId];
}

export function officialRankingSpecFromBoardKey(value: unknown) {
  if (typeof value !== "string" || value.length > 64) return null;
  return OFFICIAL_RANKING_SUBJECT_IDS
    .map((subjectId) => OFFICIAL_RANKING_SPECS[subjectId])
    .find((spec) => spec.boardKey === value) ?? null;
}

export function officialRankingPayloadMatchesSpec(
  payload: {
    subjectId?: unknown;
    mode?: unknown;
    version?: unknown;
    boardKey?: unknown;
    questionCount?: unknown;
    timeLimitMs?: unknown;
    seed?: unknown;
  },
  spec: OfficialRankingSpec,
) {
  return payload.subjectId === spec.subjectId
    && payload.mode === spec.mode
    && payload.version === spec.version
    && payload.boardKey === spec.boardKey
    && payload.questionCount === spec.questionCount
    && payload.timeLimitMs === spec.timeLimitMs
    && payload.seed === spec.seed;
}
