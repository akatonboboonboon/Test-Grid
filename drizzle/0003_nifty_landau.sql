CREATE TABLE `official_ranking_entries` (
	`user_key` text NOT NULL,
	`board_key` text NOT NULL,
	`subject_id` text NOT NULL,
	`version` integer NOT NULL,
	`alias` text NOT NULL,
	`streak_count` integer NOT NULL,
	`achieved_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_key`, `board_key`)
);
--> statement-breakpoint
CREATE INDEX `official_ranking_entries_board_rank_idx` ON `official_ranking_entries` (`board_key`,`streak_count`,`achieved_at`);--> statement-breakpoint
CREATE TABLE `official_ranking_sessions` (
	`session_id` text PRIMARY KEY NOT NULL,
	`user_key` text NOT NULL,
	`board_key` text NOT NULL,
	`subject_id` text NOT NULL,
	`version` integer NOT NULL,
	`alias` text NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`best_streak` integer DEFAULT 0 NOT NULL,
	`total_answered` integer DEFAULT 0 NOT NULL,
	`total_correct` integer DEFAULT 0 NOT NULL,
	`current_question_id` text NOT NULL,
	`current_attempt_id` text NOT NULL,
	`last_question_id` text,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `official_ranking_sessions_user_board_uidx` ON `official_ranking_sessions` (`user_key`,`board_key`);--> statement-breakpoint
CREATE INDEX `official_ranking_sessions_updated_at_idx` ON `official_ranking_sessions` (`updated_at`);