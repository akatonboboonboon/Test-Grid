CREATE TABLE `generated_practice_history` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_id` text NOT NULL,
	`subject_name` text NOT NULL,
	`template_id` text NOT NULL,
	`format` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `generated_practice_history_created_at_idx` ON `generated_practice_history` (`created_at`);--> statement-breakpoint
CREATE INDEX `generated_practice_history_subject_created_at_idx` ON `generated_practice_history` (`subject_id`,`created_at`);