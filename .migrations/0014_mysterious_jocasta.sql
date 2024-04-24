CREATE TABLE `assesment_mark` (
	`id` text PRIMARY KEY NOT NULL,
	`student_mark` text NOT NULL,
	`assesment_mark` text NOT NULL,
	`mark` integer NOT NULL,
	FOREIGN KEY (`student_mark`) REFERENCES `user_profile_students`(`registration_number`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assesment_mark`) REFERENCES `assesment`(`id`) ON UPDATE no action ON DELETE no action
);
