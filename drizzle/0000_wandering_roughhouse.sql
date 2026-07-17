CREATE TABLE `leaderboard_entries` (
	`user_key` text NOT NULL,
	`board_key` text NOT NULL,
	`alias` text NOT NULL,
	`correct_count` integer NOT NULL,
	`question_count` integer NOT NULL,
	`best_streak` integer NOT NULL,
	`duration_ms` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_key`, `board_key`)
);
--> statement-breakpoint
CREATE INDEX `leaderboard_board_rank_idx` ON `leaderboard_entries` (`board_key`,`correct_count`,`best_streak`,`duration_ms`);