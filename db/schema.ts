import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const leaderboardEntries = sqliteTable("leaderboard_entries", {
  userKey: text("user_key").notNull(),
  boardKey: text("board_key").notNull(),
  alias: text("alias").notNull(),
  correctCount: integer("correct_count").notNull(),
  questionCount: integer("question_count").notNull(),
  bestStreak: integer("best_streak").notNull(),
  durationMs: integer("duration_ms").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  primaryKey({ columns: [table.userKey, table.boardKey] }),
  index("leaderboard_board_rank_idx").on(
    table.boardKey,
    table.correctCount,
    table.bestStreak,
    table.durationMs,
  ),
]);
