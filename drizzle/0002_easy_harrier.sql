CREATE TABLE `generated_practice_favorites` (
	`question_id` text NOT NULL,
	`actor_key` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`question_id`, `actor_key`),
	FOREIGN KEY (`question_id`) REFERENCES `generated_practice_history`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `generated_practice_favorites_question_idx` ON `generated_practice_favorites` (`question_id`);--> statement-breakpoint
CREATE INDEX `generated_practice_favorites_created_at_idx` ON `generated_practice_favorites` (`created_at`);