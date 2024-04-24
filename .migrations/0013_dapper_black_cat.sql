CREATE TABLE `assesment` (
	`id` text PRIMARY KEY NOT NULL,
	`weight` integer NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`course_id` text NOT NULL,
	`due` integer NOT NULL,
	`assigned_at` integer NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
