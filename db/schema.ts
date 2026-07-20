import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const generatedPracticeHistory = sqliteTable(
  "generated_practice_history",
  {
    id: text("id").primaryKey(),
    subjectId: text("subject_id").notNull(),
    subjectName: text("subject_name").notNull(),
    templateId: text("template_id").notNull(),
    format: text("format").notNull(),
    category: text("category").notNull(),
    title: text("title").notNull(),
    payload: text("payload").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("generated_practice_history_created_at_idx").on(table.createdAt),
    index("generated_practice_history_subject_created_at_idx").on(table.subjectId, table.createdAt),
  ],
);
export const generatedPracticeWriteLimits = sqliteTable(
  "generated_practice_write_limits",
  {
    clientKey: text("client_key").notNull(),
    bucket: integer("bucket").notNull(),
    questionCount: integer("question_count").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.clientKey, table.bucket] }),
    index("generated_practice_write_limits_updated_at_idx").on(table.updatedAt),
  ],
);
export const generatedPracticeFavorites = sqliteTable(
  "generated_practice_favorites",
  {
    questionId: text("question_id")
      .notNull()
      .references(() => generatedPracticeHistory.id, { onDelete: "cascade" }),
    actorKey: text("actor_key").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.questionId, table.actorKey] }),
    index("generated_practice_favorites_question_idx").on(table.questionId),
    index("generated_practice_favorites_created_at_idx").on(table.createdAt),
  ],
);

export const officialRankingSessions = sqliteTable(
  "official_ranking_sessions",
  {
    sessionId: text("session_id").primaryKey(),
    userKey: text("user_key").notNull(),
    boardKey: text("board_key").notNull(),
    subjectId: text("subject_id").notNull(),
    version: integer("version").notNull(),
    alias: text("alias").notNull(),
    currentStreak: integer("current_streak").notNull().default(0),
    bestStreak: integer("best_streak").notNull().default(0),
    totalAnswered: integer("total_answered").notNull().default(0),
    totalCorrect: integer("total_correct").notNull().default(0),
    currentQuestionId: text("current_question_id").notNull(),
    currentAttemptId: text("current_attempt_id").notNull(),
    lastQuestionId: text("last_question_id"),
    revision: integer("revision").notNull().default(0),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("official_ranking_sessions_user_board_uidx").on(table.userKey, table.boardKey),
    index("official_ranking_sessions_updated_at_idx").on(table.updatedAt),
  ],
);

export const officialRankingEntries = sqliteTable(
  "official_ranking_entries",
  {
    userKey: text("user_key").notNull(),
    boardKey: text("board_key").notNull(),
    subjectId: text("subject_id").notNull(),
    version: integer("version").notNull(),
    alias: text("alias").notNull(),
    streakCount: integer("streak_count").notNull(),
    achievedAt: integer("achieved_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userKey, table.boardKey] }),
    index("official_ranking_entries_board_rank_idx").on(
      table.boardKey,
      table.streakCount,
      table.achievedAt,
    ),
  ],
);
