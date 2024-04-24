CREATE TABLE `users_profile_student` (
	`id` text PRIMARY KEY NOT NULL,
	`registration_number` text NOT NULL,
	`f_name` text,
	`l_name` text,
	`program_id` text,
	`enrolled_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_profile_student_registration_number_unique` ON `users_profile_student` (`registration_number`);