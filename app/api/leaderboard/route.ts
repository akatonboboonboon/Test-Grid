import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import {
  RAPID_CLIENT_TOKEN_HEADER,
  RAPID_CLIENT_TOKEN_PATTERN,
  normalizeRankingName,
} from "../../rapid-ranking-profile";

export const dynamic = "force-dynamic";

const BOARD_PATTERN = /^rapid:(?:overall|network|subject-[2-9]):q([1-9]\d{0,3})$/;
const MAX_DURATION_MS = 4_914 * 300_000;
const MAX_LIST_PAGES = 5;

type ScorePayload = {
  boardKey?: unknown;
  correctCount?: unknown;
  questionCount?: unknown;
  bestStreak?: unknown;
  durationMs?: unknown;
  rankingName?: unknown;
};

type LeaderboardEntry = {
  alias: string;
  correctCount: number;
  questionCount: number;
  bestStreak: number;
  durationMs: number;
  updatedAt: number;
};

type RankingIdentity = {
  userKey: string;
  defaultRankingName: string | null;
};

function normalizeBoardKey(value: unknown) {
  if (typeof value !== "string" || value.length > 80) return null;
  const match = value.match(BOARD_PATTERN);
  if (!match) return null;
  const questionCount = Number(match[1]);
  const isOverall = value.startsWith("rapid:overall:");
  if (isOverall) {
    if (questionCount < 9 || questionCount > 4_914 || questionCount % 9 !== 0) return null;
  } else if (questionCount < 5 || questionCount > 999) {
    return null;
  }
  return { boardKey: value, questionCount };
}

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

async function digestIdentity(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function userIdentity(request: Request): Promise<RankingIdentity | null> {
  const user = await getChatGPTUser();
  if (user?.email) {
    const normalizedEmail = user.email.trim().toLocaleLowerCase("en-US");
    return {
      // Keep the original account key format so existing scores remain attached.
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

function leaderboardPrefix(boardKey: string) {
  return `leaderboards/v1/${encodeURIComponent(boardKey)}/`;
}

function scoreObjectKey(boardKey: string, userKey: string) {
  return `${leaderboardPrefix(boardKey)}${userKey}.json`;
}

function storageUnavailable() {
  return Response.json({ error: "LEADERBOARD_UNAVAILABLE" }, { status: 503 });
}

function scoreIsBetter(candidate: LeaderboardEntry, current: LeaderboardEntry) {
  return candidate.correctCount > current.correctCount
    || (candidate.correctCount === current.correctCount && candidate.bestStreak > current.bestStreak)
    || (candidate.correctCount === current.correctCount
      && candidate.bestStreak === current.bestStreak
      && candidate.durationMs < current.durationMs);
}

function parseStoredEntry(value: unknown): LeaderboardEntry | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (typeof item.alias !== "string") return null;
  const alias = normalizeRankingName(item.alias) ?? (item.alias.length <= 40 ? item.alias : null);
  if (!alias) return null;
  const questionCount = boundedInteger(item.questionCount, 5, 4_914);
  if (questionCount === null) return null;
  const correctCount = boundedInteger(item.correctCount, 0, questionCount);
  const bestStreak = boundedInteger(item.bestStreak, 0, questionCount);
  const durationMs = boundedInteger(item.durationMs, 1, MAX_DURATION_MS);
  const updatedAt = boundedInteger(item.updatedAt, 1, Number.MAX_SAFE_INTEGER);
  if (correctCount === null || bestStreak === null || durationMs === null || updatedAt === null) return null;
  return { alias, correctCount, questionCount, bestStreak, durationMs, updatedAt };
}

function entryFromMetadata(metadata: Record<string, string> | undefined) {
  if (!metadata) return null;
  return parseStoredEntry({
    alias: metadata.alias,
    correctCount: Number(metadata.correctCount),
    questionCount: Number(metadata.questionCount),
    bestStreak: Number(metadata.bestStreak),
    durationMs: Number(metadata.durationMs),
    updatedAt: Number(metadata.updatedAt),
  });
}

async function storeEntry(key: string, entry: LeaderboardEntry) {
  await env.STUDY_SNAPSHOTS.put(key, JSON.stringify(entry), {
    httpMetadata: { contentType: "application/json" },
    customMetadata: {
      alias: entry.alias,
      correctCount: String(entry.correctCount),
      questionCount: String(entry.questionCount),
      bestStreak: String(entry.bestStreak),
      durationMs: String(entry.durationMs),
      updatedAt: String(entry.updatedAt),
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const board = normalizeBoardKey(url.searchParams.get("board"));
  if (!board) return Response.json({ error: "INVALID_BOARD" }, { status: 400 });

  try {
    const collected: LeaderboardEntry[] = [];
    let cursor: string | undefined;
    for (let pageNumber = 0; pageNumber < MAX_LIST_PAGES; pageNumber += 1) {
      const page = await env.STUDY_SNAPSHOTS.list({
        prefix: leaderboardPrefix(board.boardKey),
        cursor,
        limit: 1000,
        include: ["customMetadata"],
      });
      for (const object of page.objects) {
        const entry = entryFromMetadata(object.customMetadata);
        if (entry && entry.questionCount === board.questionCount) collected.push(entry);
      }
      if (!page.truncated || !page.cursor) break;
      cursor = page.cursor;
    }

    const entries = collected
      .sort((left, right) => right.correctCount - left.correctCount
        || right.bestStreak - left.bestStreak
        || left.durationMs - right.durationMs
        || left.updatedAt - right.updatedAt)
      .slice(0, 20)
      .map((entry, index) => ({ rank: index + 1, ...entry }));
    return Response.json({ boardKey: board.boardKey, entries }, {
      headers: { "cache-control": "public, max-age=30" },
    });
  } catch {
    return storageUnavailable();
  }
}

export async function PUT(request: Request) {
  if (!sameSiteWriteAllowed(request)) {
    return Response.json({ error: "CROSS_SITE_WRITE_BLOCKED" }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.toLocaleLowerCase().startsWith("application/json")) {
    return Response.json({ error: "JSON_REQUIRED" }, { status: 415 });
  }

  try {
    const identity = await userIdentity(request);
    if (!identity) return Response.json({ error: "RANKING_IDENTITY_REQUIRED" }, { status: 401 });
    const body = await request.json() as ScorePayload;
    const board = normalizeBoardKey(body.boardKey);
    if (!board) return Response.json({ error: "INVALID_BOARD" }, { status: 400 });
    const questionCount = boundedInteger(body.questionCount, 5, 4_914);
    if (questionCount === null || questionCount !== board.questionCount) {
      return Response.json({ error: "QUESTION_COUNT_MISMATCH" }, { status: 400 });
    }
    const correctCount = boundedInteger(body.correctCount, 0, questionCount);
    const bestStreak = boundedInteger(body.bestStreak, 0, questionCount);
    const durationMs = boundedInteger(body.durationMs, 1, MAX_DURATION_MS);
    if (correctCount === null || bestStreak === null || durationMs === null) {
      return Response.json({ error: "INVALID_SCORE" }, { status: 400 });
    }
    const requestedRankingName = body.rankingName === undefined ? null : normalizeRankingName(body.rankingName);
    if (body.rankingName !== undefined && !requestedRankingName) {
      return Response.json({ error: "INVALID_RANKING_NAME" }, { status: 400 });
    }

    const key = scoreObjectKey(board.boardKey, identity.userKey);
    const existingObject = await env.STUDY_SNAPSHOTS.get(key);
    const existing = existingObject ? parseStoredEntry(JSON.parse(await existingObject.text())) : null;
    const alias = requestedRankingName ?? existing?.alias ?? identity.defaultRankingName;
    if (!alias) return Response.json({ error: "RANKING_NAME_REQUIRED" }, { status: 400 });

    const entry: LeaderboardEntry = {
      alias,
      correctCount,
      questionCount,
      bestStreak,
      durationMs,
      updatedAt: Date.now(),
    };
    if (existing && !scoreIsBetter(entry, existing)) {
      const nameUpdated = existing.alias !== alias;
      if (nameUpdated) await storeEntry(key, { ...existing, alias });
      return Response.json({ saved: true, improved: false, nameUpdated, alias });
    }
    await storeEntry(key, entry);

    return Response.json({ saved: true, improved: true, nameUpdated: existing?.alias !== alias, alias });
  } catch {
    return storageUnavailable();
  }
}
