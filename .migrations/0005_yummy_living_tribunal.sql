ALTER TABLE `program` RENAME TO `programs`;--> statement-breakpoint
ALTER TABLE `school` RENAME TO `schools`;--> statement-breakpoint
ALTER TABLE `users_profile_student` RENAME TO `user_profile_students`;--> statement-breakpoint
ALTER TABLE `user_session` RENAME TO `user_sessions`;--> statement-breakpoint
DROP INDEX IF EXISTS `users_profile_student_registration_number_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_profile_students_registration_number_unique` ON `user_profile_students` (`registration_number`);