CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`semester` integer NOT NULL,
	`year` integer NOT NULL,
	`program` text NOT NULL,
	`assigned_to_id` text NOT NULL,
	FOREIGN KEY (`program`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_to_id`) REFERENCES `user_profile_lecturer`(`registration_number`) ON UPDATE no action ON DELETE no action
);
