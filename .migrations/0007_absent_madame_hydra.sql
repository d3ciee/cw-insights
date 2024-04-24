CREATE TABLE `user_profile_lecturer` (
	`id` text PRIMARY KEY NOT NULL,
	`registration_number` text NOT NULL,
	`f_name` text,
	`l_name` text,
	FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE programs ADD `head_of_department` text NOT NULL REFERENCES user_profile_lecturer(registration_number);--> statement-breakpoint
CREATE UNIQUE INDEX `user_profile_lecturer_registration_number_unique` ON `user_profile_lecturer` (`registration_number`);--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/