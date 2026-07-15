CREATE TABLE `user_study_snapshots` (
	`user_email` text PRIMARY KEY NOT NULL,
	`snapshot_json` text NOT NULL,
	`updated_at` integer NOT NULL
);
