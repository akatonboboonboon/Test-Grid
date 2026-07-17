CREATE TABLE `generated_practice_write_limits` (
	`client_key` text NOT NULL,
	`bucket` integer NOT NULL,
	`question_count` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`client_key`, `bucket`)
);
--> statement-breakpoint
CREATE INDEX `generated_practice_write_limits_updated_at_idx` ON `generated_practice_write_limits` (`updated_at`);