import { getD1 } from "../../../db";
import { getChatGPTUser } from "../../chatgpt-auth";
import {
  getOfficialRankingSpec,
  isOfficialRankingSubjectId,
  officialRankingSpecFromBoardKey,
  type OfficialRankingSpec,
} from "../../official-ranking-config";
import {
  getOfficialRankingQuestion,
  getOfficialRankingQuestions,
  scoreOfficialRankingAnswer,
  toPublicOfficialRankingQuestion,
  updateOfficialRankingStreak,
} from "../../official-ranking-questions";
import {
  RAPID_CLIENT_TOKEN_HEADER,
  RAPID_CLIENT_TOKEN_PATTERN,
  normalizeRankingName,
} from "../../rapid-ranking-profile";

export const dynamic = "force-dynamic";

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const MAX_QUESTION_ID_LENGTH = 240;
const MAX_SELECTED_LENGTH = 2_000;
const SESSION_UPDATE_RETRIES = 4;

type StartPayload = {
  subjectId?: unknown;
  rankingName?: unknown;
};

type AnswerPayload = {
  subjectId?: unknown;
  sessionId?: unknown;
  attemptId?: unknown;
  questionId?: unknown;
  selected?: unknown;
};

type RankingIdentity = {
  userKey: string;
  defaultRankingName: string | null;
};

type SessionRow = {
  session_id: string;
  board_key: string;
  subject_id: string;
  version: number;
  alias: string;
  current_streak: number;
  best_streak: number;
  total_answered: number;
  total_correct: number;
  current_question_id: string;
  current_attempt_id: string;
  last_question_id: string | null;
  revision: number;
  created_at: number;
  updated_at: number;
};

type EntryRow = {
  alias: string;
  streak_count: number;
  achieved_at: number;
  updated_at: number;
};

function sameSiteWriteAllowed(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (!origin || !fetchSite) return false;
  return origin === requestUrl.origin
    && (fetchSite === "same-origin" || fetchSite === "same-site");
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

function storageUnavailable() {
  return Response.json({ error: "LEADERBOARD_UNAVAILABLE" }, { status: 503 });
}

function chooseQuestion(
  spec: OfficialRankingSpec,
  currentQuestionId?: string | null,
  lastQuestionId?: string | null,
) {
  const pool = getOfficialRankingQuestions(spec.subjectId);
  if (pool.length < 2) {
    throw new Error(`Official ranking pool for ${spec.subjectId} needs at least two questions.`);
  }
  let eligible = pool.filter((question) => (
    question.id !== currentQuestionId && question.id !== lastQuestionId
  ));
  if (!eligible.length) {
    eligible = pool.filter((question) => question.id !== currentQuestionId);
  }
  if (!eligible.length) throw new Error("NO_OFFICIAL_RANKING_QUESTION");
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  return eligible[random[0] % eligible.length];
}

async function readSession(
  database: ReturnType<typeof getD1>,
  userKey: string,
  boardKey: string,
) {
  return database.prepare(`
      SELECT session_id, board_key, subject_id, version, alias,
             current_streak, best_streak, total_answered, total_correct,
             current_question_id, current_attempt_id, last_question_id,
             revision, created_at, updated_at
      FROM official_ranking_sessions
      WHERE user_key = ? AND board_key = ?
    `).bind(userKey, boardKey).first<SessionRow>();
}

function sessionPayload(
  row: SessionRow,
  spec: OfficialRankingSpec,
  resumed: boolean,
  question = getOfficialRankingQuestion(spec.subjectId, row.current_question_id),
) {
  if (!question) throw new Error("MISSING_OFFICIAL_RANKING_QUESTION");
  return {
    sessionId: row.session_id,
    attemptId: row.current_attempt_id,
    spec,
    resumed,
    alias: row.alias,
    currentStreak: row.current_streak,
    bestStreak: row.best_streak,
    totalAnswered: row.total_answered,
    totalCorrect: row.total_correct,
    question: toPublicOfficialRankingQuestion(question),
  };
}

export async function GET(request: Request) {
  const spec = officialRankingSpecFromBoardKey(new URL(request.url).searchParams.get("board"));
  if (!spec) return Response.json({ error: "INVALID_OFFICIAL_BOARD" }, { status: 400 });

  try {
    const result = await getD1().prepare(`
        SELECT alias, streak_count, achieved_at, updated_at
        FROM official_ranking_entries
        WHERE board_key = ?
        ORDER BY streak_count DESC, achieved_at ASC, user_key ASC
        LIMIT 20
      `).bind(spec.boardKey).all<EntryRow>();
    const entries = (result.results ?? []).map((entry: EntryRow, index: number) => ({
      rank: index + 1,
      alias: entry.alias,
      streakCount: Number(entry.streak_count),
      bestStreak: Number(entry.streak_count),
      achievedAt: Number(entry.achieved_at),
      updatedAt: Number(entry.updated_at),
    }));
    return Response.json({
      boardKey: spec.boardKey,
      spec,
      metric: spec.scoring,
      entries,
    }, {
      headers: { "cache-control": "public, max-age=10" },
    });
  } catch {
    return storageUnavailable();
  }
}

export async function POST(request: Request) {
  if (!sameSiteWriteAllowed(request)) {
    return Response.json({ error: "CROSS_SITE_WRITE_BLOCKED" }, { status: 403 });
  }
  if (!jsonWriteAllowed(request)) {
    return Response.json({ error: "JSON_REQUIRED" }, { status: 415 });
  }

  let body: StartPayload;
  try {
    body = await request.json() as StartPayload;
  } catch {
    return Response.json({ error: "INVALID_RANKING_REQUEST" }, { status: 400 });
  }

  try {
    const identity = await userIdentity(request);
    if (!identity) return Response.json({ error: "RANKING_IDENTITY_REQUIRED" }, { status: 401 });
    if (!isOfficialRankingSubjectId(body.subjectId)) {
      return Response.json({ error: "INVALID_OFFICIAL_SUBJECT" }, { status: 400 });
    }
    const requestedRankingName = body.rankingName === undefined
      ? null
      : normalizeRankingName(body.rankingName);
    if (body.rankingName !== undefined && !requestedRankingName) {
      return Response.json({ error: "INVALID_RANKING_NAME" }, { status: 400 });
    }

    const spec = getOfficialRankingSpec(body.subjectId);
    const database = getD1();
    for (let retry = 0; retry < SESSION_UPDATE_RETRIES; retry += 1) {
      const existing = await readSession(database, identity.userKey, spec.boardKey);
      const now = Date.now();
      if (existing) {
        if (existing.subject_id !== spec.subjectId || existing.version !== spec.version) {
          return Response.json({ error: "INVALID_RANKING_SESSION" }, { status: 409 });
        }
        const rankingName = requestedRankingName ?? existing.alias ?? identity.defaultRankingName;
        if (!rankingName) return Response.json({ error: "RANKING_NAME_REQUIRED" }, { status: 400 });
        const question = chooseQuestion(spec, existing.current_question_id, existing.last_question_id);
        const attemptId = crypto.randomUUID();
        const update = await database.prepare(`
            UPDATE official_ranking_sessions
            SET alias = ?,
                last_question_id = current_question_id,
                current_question_id = ?,
                current_attempt_id = ?,
                revision = revision + 1,
                updated_at = ?
            WHERE session_id = ? AND user_key = ? AND board_key = ? AND revision = ?
          `).bind(
          rankingName,
          question.id,
          attemptId,
          now,
          existing.session_id,
          identity.userKey,
          spec.boardKey,
          existing.revision,
        ).run();
        if (!Number(update.meta.changes ?? 0)) continue;
        await database.prepare(`
            UPDATE official_ranking_entries
            SET alias = ?, updated_at = ?
            WHERE user_key = ? AND board_key = ?
          `).bind(rankingName, now, identity.userKey, spec.boardKey).run();
        return Response.json(sessionPayload({
          ...existing,
          alias: rankingName,
          last_question_id: existing.current_question_id,
          current_question_id: question.id,
          current_attempt_id: attemptId,
          revision: existing.revision + 1,
          updated_at: now,
        }, spec, true, question));
      }

      const rankingName = requestedRankingName ?? identity.defaultRankingName;
      if (!rankingName) return Response.json({ error: "RANKING_NAME_REQUIRED" }, { status: 400 });
      const question = chooseQuestion(spec);
      const sessionId = crypto.randomUUID();
      const attemptId = crypto.randomUUID();
      const insert = await database.prepare(`
          INSERT OR IGNORE INTO official_ranking_sessions
            (session_id, user_key, board_key, subject_id, version, alias,
             current_streak, best_streak, total_answered, total_correct,
             current_question_id, current_attempt_id, last_question_id,
             revision, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?, NULL, 0, ?, ?)
        `).bind(
        sessionId,
        identity.userKey,
        spec.boardKey,
        spec.subjectId,
        spec.version,
        rankingName,
        question.id,
        attemptId,
        now,
        now,
      ).run();
      if (!Number(insert.meta.changes ?? 0)) continue;
      return Response.json({
        sessionId,
        attemptId,
        spec,
        resumed: false,
        alias: rankingName,
        currentStreak: 0,
        bestStreak: 0,
        totalAnswered: 0,
        totalCorrect: 0,
        question: toPublicOfficialRankingQuestion(question),
      });
    }
    return Response.json({ error: "RANKING_SESSION_CONFLICT" }, { status: 409 });
  } catch {
    return storageUnavailable();
  }
}

export async function PUT(request: Request) {
  if (!sameSiteWriteAllowed(request)) {
    return Response.json({ error: "CROSS_SITE_WRITE_BLOCKED" }, { status: 403 });
  }
  if (!jsonWriteAllowed(request)) {
    return Response.json({ error: "JSON_REQUIRED" }, { status: 415 });
  }

  let body: AnswerPayload;
  try {
    body = await request.json() as AnswerPayload;
  } catch {
    return Response.json({ error: "INVALID_OFFICIAL_ANSWER" }, { status: 400 });
  }

  try {
    const identity = await userIdentity(request);
    if (!identity) return Response.json({ error: "RANKING_IDENTITY_REQUIRED" }, { status: 401 });
    if (
      !isOfficialRankingSubjectId(body.subjectId)
      || typeof body.sessionId !== "string"
      || !ID_PATTERN.test(body.sessionId)
      || typeof body.attemptId !== "string"
      || !ID_PATTERN.test(body.attemptId)
      || typeof body.questionId !== "string"
      || body.questionId.length > MAX_QUESTION_ID_LENGTH
      || typeof body.selected !== "string"
      || body.selected.length > MAX_SELECTED_LENGTH
    ) {
      return Response.json({ error: "INVALID_OFFICIAL_ANSWER" }, { status: 400 });
    }

    const spec = getOfficialRankingSpec(body.subjectId);
    const database = getD1();
    const existing = await readSession(database, identity.userKey, spec.boardKey);
    if (!existing || existing.session_id !== body.sessionId) {
      return Response.json({ error: "RANKING_SESSION_NOT_FOUND" }, { status: 404 });
    }
    if (
      existing.current_attempt_id !== body.attemptId
      || existing.current_question_id !== body.questionId
    ) {
      return Response.json({ error: "ATTEMPT_ALREADY_ANSWERED" }, { status: 409 });
    }

    const answeredQuestion = getOfficialRankingQuestion(spec.subjectId, body.questionId);
    if (!answeredQuestion || !answeredQuestion.options.includes(body.selected)) {
      return Response.json({ error: "INVALID_OFFICIAL_ANSWER" }, { status: 400 });
    }
    const { correct, feedback } = scoreOfficialRankingAnswer(answeredQuestion, body.selected);
    const streak = updateOfficialRankingStreak(
      existing.current_streak,
      existing.best_streak,
      correct,
    );
    const nextQuestion = chooseQuestion(
      spec,
      existing.current_question_id,
      existing.last_question_id,
    );
    const nextAttemptId = crypto.randomUUID();
    const now = Date.now();
    const totalAnswered = existing.total_answered + 1;
    const totalCorrect = existing.total_correct + (correct ? 1 : 0);
    const improved = streak.bestStreak > existing.best_streak;

    const sessionUpdate = database.prepare(`
        UPDATE official_ranking_sessions
        SET current_streak = ?,
            best_streak = ?,
            total_answered = ?,
            total_correct = ?,
            last_question_id = current_question_id,
            current_question_id = ?,
            current_attempt_id = ?,
            revision = revision + 1,
            updated_at = ?
        WHERE session_id = ?
          AND user_key = ?
          AND board_key = ?
          AND revision = ?
          AND current_attempt_id = ?
          AND current_question_id = ?
      `).bind(
      streak.currentStreak,
      streak.bestStreak,
      totalAnswered,
      totalCorrect,
      nextQuestion.id,
      nextAttemptId,
      now,
      existing.session_id,
      identity.userKey,
      spec.boardKey,
      existing.revision,
      body.attemptId,
      body.questionId,
    );

    let updateChanges = 0;
    if (improved) {
      const entryUpdate = database.prepare(`
          INSERT INTO official_ranking_entries
            (user_key, board_key, subject_id, version, alias,
             streak_count, achieved_at, updated_at)
          SELECT ?, ?, ?, ?, ?, ?, ?, ?
          FROM official_ranking_sessions
          WHERE session_id = ?
            AND user_key = ?
            AND board_key = ?
            AND revision = ?
            AND current_attempt_id = ?
            AND current_question_id = ?
          ON CONFLICT(user_key, board_key) DO UPDATE SET
            alias = excluded.alias,
            streak_count = excluded.streak_count,
            achieved_at = excluded.achieved_at,
            updated_at = excluded.updated_at
          WHERE excluded.streak_count > official_ranking_entries.streak_count
        `).bind(
        identity.userKey,
        spec.boardKey,
        spec.subjectId,
        spec.version,
        existing.alias,
        streak.bestStreak,
        now,
        now,
        existing.session_id,
        identity.userKey,
        spec.boardKey,
        existing.revision + 1,
        nextAttemptId,
        nextQuestion.id,
      );
      const results = await database.batch([sessionUpdate, entryUpdate]);
      updateChanges = Number(results[0]?.meta.changes ?? 0);
    } else {
      const result = await sessionUpdate.run();
      updateChanges = Number(result.meta.changes ?? 0);
    }
    if (!updateChanges) {
      return Response.json({ error: "ATTEMPT_ALREADY_ANSWERED" }, { status: 409 });
    }

    return Response.json({
      sessionId: existing.session_id,
      attemptId: nextAttemptId,
      spec,
      alias: existing.alias,
      currentStreak: streak.currentStreak,
      bestStreak: streak.bestStreak,
      totalAnswered,
      totalCorrect,
      feedback,
      question: toPublicOfficialRankingQuestion(nextQuestion),
      improved,
    });
  } catch {
    return storageUnavailable();
  }
}
