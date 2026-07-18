import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
