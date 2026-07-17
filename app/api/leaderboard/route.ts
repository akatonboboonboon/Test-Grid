import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

const BOARD_PATTERN = /^rapid:(?:overall|network|subject-[2-9]):q([1-9]\d{0,2})$/;
const MAX_DURATION_MS = 86_400_000;
const MAX_LIST_PAGES = 5;

type ScorePayload = {
  boardKey?: unknown;
  correctCount?: unknown;
  questionCount?: unknown;
  bestStreak?: unknown;
  durationMs?: unknown;
};

type LeaderboardEntry = {
  alias: string;
  correctCount: number;
  questionCount: number;
  bestStreak: number;
  durationMs: number;
  updatedAt: number;
};

function normalizeBoardKey(value: unknown) {
  if (typeof value !== "string" || value.length > 80) return null;
  const match = value.match(BOARD_PATTERN);
  if (!match) return null;
  const questionCount = Number(match[1]);
  if (questionCount < 5 || questionCount > 999) return null;
  if (value.startsWith("rapid:overall:") && (questionCount < 9 || questionCount % 9 !== 0)) return null;
  return { boardKey: value, questionCount };
}

function boundedInteger(value: unknown, minimum: number, maximum: number) {
  return typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum
    ? value
    : null;
}

async function userIdentity() {
  const user = await getChatGPTUser();
  if (!user) return null;
  const normalizedEmail = user.email.trim().toLocaleLowerCase("en-US");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalizedEmail));
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return {
    userKey: hex,
    alias: `学習者-${hex.slice(0, 6).toUpperCase()}`,
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
  if (typeof item.alias !== "string" || item.alias.length > 40) return null;
  const questionCount = boundedInteger(item.questionCount, 5, 999);
  if (questionCount === null) return null;
  const correctCount = boundedInteger(item.correctCount, 0, questionCount);
  const bestStreak = boundedInteger(item.bestStreak, 0, questionCount);
  const durationMs = boundedInteger(item.durationMs, 1, MAX_DURATION_MS);
  const updatedAt = boundedInteger(item.updatedAt, 1, Number.MAX_SAFE_INTEGER);
  if (correctCount === null || bestStreak === null || durationMs === null || updatedAt === null) return null;
  return { alias: item.alias, correctCount, questionCount, bestStreak, durationMs, updatedAt };
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
  const identity = await userIdentity();
  if (!identity) return Response.json({ error: "SIGN_IN_REQUIRED" }, { status: 401 });
  if (!request.headers.get("content-type")?.toLocaleLowerCase().startsWith("application/json")) {
    return Response.json({ error: "JSON_REQUIRED" }, { status: 415 });
  }

  try {
    const body = await request.json() as ScorePayload;
    const board = normalizeBoardKey(body.boardKey);
    if (!board) return Response.json({ error: "INVALID_BOARD" }, { status: 400 });
    const questionCount = boundedInteger(body.questionCount, 5, 999);
    if (questionCount === null || questionCount !== board.questionCount) {
      return Response.json({ error: "QUESTION_COUNT_MISMATCH" }, { status: 400 });
    }
    const correctCount = boundedInteger(body.correctCount, 0, questionCount);
    const bestStreak = boundedInteger(body.bestStreak, 0, questionCount);
    const durationMs = boundedInteger(body.durationMs, 1, MAX_DURATION_MS);
    if (correctCount === null || bestStreak === null || durationMs === null) {
      return Response.json({ error: "INVALID_SCORE" }, { status: 400 });
    }

    const entry: LeaderboardEntry = {
      alias: identity.alias,
      correctCount,
      questionCount,
      bestStreak,
      durationMs,
      updatedAt: Date.now(),
    };
    const key = scoreObjectKey(board.boardKey, identity.userKey);
    const existingObject = await env.STUDY_SNAPSHOTS.get(key);
    const existing = existingObject ? parseStoredEntry(JSON.parse(await existingObject.text())) : null;
    if (existing && !scoreIsBetter(entry, existing)) {
      return Response.json({ saved: true, improved: false, alias: identity.alias });
    }
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

    return Response.json({ saved: true, improved: true, alias: identity.alias });
  } catch {
    return storageUnavailable();
  }
}
