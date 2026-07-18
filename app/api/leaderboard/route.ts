import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import {
  getOfficialRankingSpec,
  isOfficialRankingSubjectId,
  officialRankingPayloadMatchesSpec,
  officialRankingSpecFromBoardKey,
  type OfficialRankingSpec,
} from "../../official-ranking-config";
import {
  getOfficialRankingQuestionIds,
  getOfficialRankingQuestions,
  officialRankingQuestionSetMatches,
  scoreOfficialRankingResponses,
  toPublicOfficialRankingQuestion,
  type OfficialRankingResponse,
} from "../../official-ranking-questions";
import {
  RAPID_CLIENT_TOKEN_HEADER,
  RAPID_CLIENT_TOKEN_PATTERN,
  normalizeRankingName,
} from "../../rapid-ranking-profile";

export const dynamic = "force-dynamic";

const MAX_LIST_PAGES = 5;
const SUBMISSION_GRACE_MS = 30_000;
const CHALLENGE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

type StartPayload = {
  subjectId?: unknown;
  rankingName?: unknown;
};

type SubmitPayload = {
  challengeId?: unknown;
  answers?: unknown;
};

type OfficialChallengeRecord = {
  challengeId: string;
  subjectId: OfficialRankingSpec["subjectId"];
  mode: OfficialRankingSpec["mode"];
  version: OfficialRankingSpec["version"];
  boardKey: string;
  questionCount: number;
  timeLimitMs: number;
  seed: string;
  questionIds: string[];
  rankingName: string;
  startedAt: number;
  expiresAt: number;
  completedAt?: number;
};

type LeaderboardEntry = {
  alias: string;
  subjectId: OfficialRankingSpec["subjectId"];
  mode: OfficialRankingSpec["mode"];
  version: OfficialRankingSpec["version"];
  boardKey: string;
  questionCount: number;
  timeLimitMs: number;
  seed: string;
  correctCount: number;
  bestStreak: number;
  durationMs: number;
  updatedAt: number;
};

type RankingIdentity = {
  userKey: string;
  defaultRankingName: string | null;
};

function boundedInteger(value: unknown, minimum: number, maximum: number) {
  return typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum
    ? value
    : null;
}

function sameSiteWriteAllowed(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return (!origin || origin === requestUrl.origin)
    && (!fetchSite || fetchSite === "same-origin" || fetchSite === "same-site");
}

function jsonWriteAllowed(request: Request) {
  return request.headers.get("content-type")?.toLocaleLowerCase().startsWith("application/json") ?? false;
}

async function digestIdentity(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function userIdentity(request: Request): Promise<RankingIdentity | null> {
  const user = await getChatGPTUser();
  if (user?.email) {
    const normalizedEmail = user.email.trim().toLocaleLowerCase("en-US");
    return {
      userKey: await digestIdentity(normalizedEmail),
      defaultRankingName: normalizeRankingName(user.fullName),
    };
  }
  const clientToken = request.headers.get(RAPID_CLIENT_TOKEN_HEADER)?.trim() ?? "";
  if (!RAPID_CLIENT_TOKEN_PATTERN.test(clientToken)) return null;
  return {
    userKey: await digestIdentity(`device:${clientToken}`),
    defaultRankingName: null,
  };
}

function officialLeaderboardPrefix(boardKey: string) {
  return `leaderboards/official-v1/scores/${encodeURIComponent(boardKey)}/`;
}

function scoreObjectKey(boardKey: string, userKey: string) {
  return `${officialLeaderboardPrefix(boardKey)}${userKey}.json`;
}

function challengeObjectKey(userKey: string, challengeId: string) {
  return `leaderboards/official-v1/challenges/${userKey}/${challengeId}.json`;
}

function storageUnavailable() {
  return Response.json({ error: "LEADERBOARD_UNAVAILABLE" }, { status: 503 });
}

function scoreIsBetter(candidate: LeaderboardEntry, current: LeaderboardEntry) {
  return candidate.correctCount > current.correctCount
    || (candidate.correctCount === current.correctCount && candidate.durationMs < current.durationMs)
    || (candidate.correctCount === current.correctCount
      && candidate.durationMs === current.durationMs
      && candidate.bestStreak > current.bestStreak);
}

function parseStoredEntry(value: unknown, expectedSpec?: OfficialRankingSpec): LeaderboardEntry | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  const spec = officialRankingSpecFromBoardKey(item.boardKey);
  if (!spec || (expectedSpec && spec.boardKey !== expectedSpec.boardKey)) return null;
  if (!officialRankingPayloadMatchesSpec(item, spec)) return null;
  if (typeof item.alias !== "string") return null;
  const alias = normalizeRankingName(item.alias) ?? (item.alias.length <= 40 ? item.alias : null);
  if (!alias) return null;
  const correctCount = boundedInteger(item.correctCount, 0, spec.questionCount);
  const bestStreak = boundedInteger(item.bestStreak, 0, spec.questionCount);
  const durationMs = boundedInteger(item.durationMs, 1, spec.timeLimitMs);
  const updatedAt = boundedInteger(item.updatedAt, 1, Number.MAX_SAFE_INTEGER);
  if (correctCount === null || bestStreak === null || durationMs === null || updatedAt === null) return null;
  return {
    alias,
    subjectId: spec.subjectId,
    mode: spec.mode,
    version: spec.version,
    boardKey: spec.boardKey,
    questionCount: spec.questionCount,
    timeLimitMs: spec.timeLimitMs,
    seed: spec.seed,
    correctCount,
    bestStreak,
    durationMs,
    updatedAt,
  };
}

function entryFromMetadata(metadata: Record<string, string> | undefined, spec: OfficialRankingSpec) {
  if (!metadata) return null;
  return parseStoredEntry({
    alias: metadata.alias,
    subjectId: metadata.subjectId,
    mode: metadata.mode,
    version: Number(metadata.version),
    boardKey: metadata.boardKey,
    questionCount: Number(metadata.questionCount),
    timeLimitMs: Number(metadata.timeLimitMs),
    seed: metadata.seed,
    correctCount: Number(metadata.correctCount),
    bestStreak: Number(metadata.bestStreak),
    durationMs: Number(metadata.durationMs),
    updatedAt: Number(metadata.updatedAt),
  }, spec);
}

async function storeEntry(key: string, entry: LeaderboardEntry) {
  await env.STUDY_SNAPSHOTS.put(key, JSON.stringify(entry), {
    httpMetadata: { contentType: "application/json" },
    customMetadata: {
      alias: entry.alias,
      subjectId: entry.subjectId,
      mode: entry.mode,
      version: String(entry.version),
      boardKey: entry.boardKey,
      questionCount: String(entry.questionCount),
      timeLimitMs: String(entry.timeLimitMs),
      seed: entry.seed,
      correctCount: String(entry.correctCount),
      bestStreak: String(entry.bestStreak),
      durationMs: String(entry.durationMs),
      updatedAt: String(entry.updatedAt),
    },
  });
}

function parseChallengeRecord(value: unknown): { record: OfficialChallengeRecord; spec: OfficialRankingSpec } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (!isOfficialRankingSubjectId(item.subjectId)) return null;
  const spec = getOfficialRankingSpec(item.subjectId);
  if (!officialRankingPayloadMatchesSpec(item, spec)) return null;
  if (typeof item.challengeId !== "string" || !CHALLENGE_ID_PATTERN.test(item.challengeId)) return null;
  if (typeof item.rankingName !== "string" || !normalizeRankingName(item.rankingName)) return null;
  if (!Array.isArray(item.questionIds) || !officialRankingQuestionSetMatches(spec.subjectId, item.questionIds)) return null;
  const startedAt = boundedInteger(item.startedAt, 1, Number.MAX_SAFE_INTEGER);
  const expiresAt = boundedInteger(item.expiresAt, 1, Number.MAX_SAFE_INTEGER);
  const completedAt = item.completedAt === undefined
    ? undefined
    : boundedInteger(item.completedAt, 1, Number.MAX_SAFE_INTEGER) ?? undefined;
  if (startedAt === null || expiresAt === null || expiresAt !== startedAt + spec.timeLimitMs + SUBMISSION_GRACE_MS) {
    return null;
  }
  return {
    spec,
    record: {
      challengeId: item.challengeId,
      subjectId: spec.subjectId,
      mode: spec.mode,
      version: spec.version,
      boardKey: spec.boardKey,
      questionCount: spec.questionCount,
      timeLimitMs: spec.timeLimitMs,
      seed: spec.seed,
      questionIds: item.questionIds as string[],
      rankingName: normalizeRankingName(item.rankingName) as string,
      startedAt,
      expiresAt,
      ...(completedAt ? { completedAt } : {}),
    },
  };
}

function normalizeAnswers(value: unknown, spec: OfficialRankingSpec): OfficialRankingResponse[] | null {
  if (!Array.isArray(value) || value.length !== spec.questionCount) return null;
  const answers: OfficialRankingResponse[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const response = item as Record<string, unknown>;
    if (typeof response.questionId !== "string" || response.questionId.length > 240) return null;
    if (response.selected !== null && (typeof response.selected !== "string" || response.selected.length > 2_000)) {
      return null;
    }
    answers.push({ questionId: response.questionId, selected: response.selected as string | null });
  }
  return officialRankingQuestionSetMatches(spec.subjectId, answers.map((answer) => answer.questionId))
    ? answers
    : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const spec = officialRankingSpecFromBoardKey(url.searchParams.get("board"));
  if (!spec) return Response.json({ error: "INVALID_OFFICIAL_BOARD" }, { status: 400 });

  try {
    const collected: LeaderboardEntry[] = [];
    let cursor: string | undefined;
    for (let pageNumber = 0; pageNumber < MAX_LIST_PAGES; pageNumber += 1) {
      const page = await env.STUDY_SNAPSHOTS.list({
        prefix: officialLeaderboardPrefix(spec.boardKey),
        cursor,
        limit: 1000,
        include: ["customMetadata"],
      });
      for (const object of page.objects) {
        const entry = entryFromMetadata(object.customMetadata, spec);
        if (entry) collected.push(entry);
      }
      if (!page.truncated || !page.cursor) break;
      cursor = page.cursor;
    }
    const entries = collected
      .sort((left, right) => right.correctCount - left.correctCount
        || left.durationMs - right.durationMs
        || right.bestStreak - left.bestStreak
        || left.updatedAt - right.updatedAt)
      .slice(0, 20)
      .map((entry, index) => ({ rank: index + 1, ...entry }));
    return Response.json({ boardKey: spec.boardKey, spec, entries }, {
      headers: { "cache-control": "public, max-age=30" },
    });
  } catch {
    return storageUnavailable();
  }
}

export async function POST(request: Request) {
  if (!sameSiteWriteAllowed(request)) return Response.json({ error: "CROSS_SITE_WRITE_BLOCKED" }, { status: 403 });
  if (!jsonWriteAllowed(request)) return Response.json({ error: "JSON_REQUIRED" }, { status: 415 });
  try {
    const identity = await userIdentity(request);
    if (!identity) return Response.json({ error: "RANKING_IDENTITY_REQUIRED" }, { status: 401 });
    const body = await request.json() as StartPayload;
    if (!isOfficialRankingSubjectId(body.subjectId)) {
      return Response.json({ error: "INVALID_OFFICIAL_SUBJECT" }, { status: 400 });
    }
    const requestedRankingName = body.rankingName === undefined ? null : normalizeRankingName(body.rankingName);
    if (body.rankingName !== undefined && !requestedRankingName) {
      return Response.json({ error: "INVALID_RANKING_NAME" }, { status: 400 });
    }
    const rankingName = requestedRankingName ?? identity.defaultRankingName;
    if (!rankingName) return Response.json({ error: "RANKING_NAME_REQUIRED" }, { status: 400 });

    const spec = getOfficialRankingSpec(body.subjectId);
    const questions = getOfficialRankingQuestions(spec.subjectId);
    const challengeId = crypto.randomUUID();
    const startedAt = Date.now();
    const challenge: OfficialChallengeRecord = {
      ...spec,
      challengeId,
      questionIds: getOfficialRankingQuestionIds(spec.subjectId),
      rankingName,
      startedAt,
      expiresAt: startedAt + spec.timeLimitMs + SUBMISSION_GRACE_MS,
    };
    await env.STUDY_SNAPSHOTS.put(
      challengeObjectKey(identity.userKey, challengeId),
      JSON.stringify(challenge),
      { httpMetadata: { contentType: "application/json" } },
    );
    return Response.json({
      challengeId,
      spec,
      startedAt,
      expiresAt: startedAt + spec.timeLimitMs,
      questions: questions.map(toPublicOfficialRankingQuestion),
    });
  } catch {
    return storageUnavailable();
  }
}

export async function PUT(request: Request) {
  if (!sameSiteWriteAllowed(request)) return Response.json({ error: "CROSS_SITE_WRITE_BLOCKED" }, { status: 403 });
  if (!jsonWriteAllowed(request)) return Response.json({ error: "JSON_REQUIRED" }, { status: 415 });
  try {
    const identity = await userIdentity(request);
    if (!identity) return Response.json({ error: "RANKING_IDENTITY_REQUIRED" }, { status: 401 });
    const body = await request.json() as SubmitPayload;
    if (typeof body.challengeId !== "string" || !CHALLENGE_ID_PATTERN.test(body.challengeId)) {
      return Response.json({ error: "INVALID_CHALLENGE" }, { status: 400 });
    }
    const challengeKey = challengeObjectKey(identity.userKey, body.challengeId);
    const challengeObject = await env.STUDY_SNAPSHOTS.get(challengeKey);
    if (!challengeObject) return Response.json({ error: "CHALLENGE_NOT_FOUND" }, { status: 404 });
    const parsed = parseChallengeRecord(JSON.parse(await challengeObject.text()));
    if (!parsed || parsed.record.challengeId !== body.challengeId) {
      return Response.json({ error: "INVALID_CHALLENGE" }, { status: 400 });
    }
    const { record: challenge, spec } = parsed;
    if (challenge.completedAt) return Response.json({ error: "CHALLENGE_ALREADY_SUBMITTED" }, { status: 409 });
    const completedAt = Date.now();
    if (completedAt > challenge.expiresAt) return Response.json({ error: "CHALLENGE_EXPIRED" }, { status: 410 });
    const answers = normalizeAnswers(body.answers, spec);
    if (!answers) return Response.json({ error: "INVALID_OFFICIAL_ANSWERS" }, { status: 400 });

    const { correctCount, bestStreak, review } = scoreOfficialRankingResponses(spec, answers);
    const durationMs = Math.min(spec.timeLimitMs, Math.max(1, completedAt - challenge.startedAt));
    const key = scoreObjectKey(spec.boardKey, identity.userKey);
    const existingObject = await env.STUDY_SNAPSHOTS.get(key);
    const existing = existingObject ? parseStoredEntry(JSON.parse(await existingObject.text()), spec) : null;
    const entry: LeaderboardEntry = {
      alias: challenge.rankingName,
      subjectId: spec.subjectId,
      mode: spec.mode,
      version: spec.version,
      boardKey: spec.boardKey,
      questionCount: spec.questionCount,
      timeLimitMs: spec.timeLimitMs,
      seed: spec.seed,
      correctCount,
      bestStreak,
      durationMs,
      updatedAt: completedAt,
    };
    const improved = !existing || scoreIsBetter(entry, existing);
    const nameUpdated = existing?.alias !== entry.alias;
    if (improved) await storeEntry(key, entry);
    else if (existing && nameUpdated) await storeEntry(key, { ...existing, alias: entry.alias });
    await env.STUDY_SNAPSHOTS.put(
      challengeKey,
      JSON.stringify({ ...challenge, completedAt }),
      { httpMetadata: { contentType: "application/json" } },
    );
    return Response.json({
      saved: true,
      improved,
      nameUpdated,
      alias: entry.alias,
      boardKey: spec.boardKey,
      correctCount,
      questionCount: spec.questionCount,
      bestStreak,
      durationMs,
      review,
    });
  } catch {
    return storageUnavailable();
  }
}
