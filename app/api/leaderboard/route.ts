import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

const BOARD_PATTERN = /^rapid:(?:overall|network|subject-[2-9]):q([1-9]\d{0,2})$/;
const MAX_DURATION_MS = 86_400_000;

type ScorePayload = {
  boardKey?: unknown;
  correctCount?: unknown;
  questionCount?: unknown;
  bestStreak?: unknown;
  durationMs?: unknown;
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

function databaseUnavailable() {
  return Response.json({ error: "LEADERBOARD_UNAVAILABLE" }, { status: 503 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const board = normalizeBoardKey(url.searchParams.get("board"));
  if (!board) return Response.json({ error: "INVALID_BOARD" }, { status: 400 });

  try {
    const result = await env.DB.prepare(
      `SELECT alias, correct_count AS correctCount, question_count AS questionCount,
              best_streak AS bestStreak, duration_ms AS durationMs, updated_at AS updatedAt
         FROM leaderboard_entries
        WHERE board_key = ?
        ORDER BY correct_count DESC, best_streak DESC, duration_ms ASC, updated_at ASC
        LIMIT 20`,
    ).bind(board.boardKey).all();
    const entries = (result.results ?? []).map((entry, index) => ({ rank: index + 1, ...entry }));
    return Response.json({ boardKey: board.boardKey, entries }, {
      headers: { "cache-control": "public, max-age=30" },
    });
  } catch {
    return databaseUnavailable();
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

    const updatedAt = Date.now();
    await env.DB.prepare(
      `INSERT INTO leaderboard_entries
         (user_key, board_key, alias, correct_count, question_count, best_streak, duration_ms, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_key, board_key) DO UPDATE SET
         alias = excluded.alias,
         correct_count = excluded.correct_count,
         question_count = excluded.question_count,
         best_streak = excluded.best_streak,
         duration_ms = excluded.duration_ms,
         updated_at = excluded.updated_at
       WHERE excluded.correct_count > leaderboard_entries.correct_count
          OR (excluded.correct_count = leaderboard_entries.correct_count
              AND excluded.best_streak > leaderboard_entries.best_streak)
          OR (excluded.correct_count = leaderboard_entries.correct_count
              AND excluded.best_streak = leaderboard_entries.best_streak
              AND excluded.duration_ms < leaderboard_entries.duration_ms)`,
    ).bind(
      identity.userKey,
      board.boardKey,
      identity.alias,
      correctCount,
      questionCount,
      bestStreak,
      durationMs,
      updatedAt,
    ).run();

    return Response.json({ saved: true, alias: identity.alias });
  } catch {
    return databaseUnavailable();
  }
}
