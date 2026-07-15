import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userStudySnapshots = sqliteTable("user_study_snapshots", {
  userEmail: text("user_email").primaryKey(),
  snapshotJson: text("snapshot_json").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
