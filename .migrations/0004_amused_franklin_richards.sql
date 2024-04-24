CREATE TABLE `program` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`number_of_years` integer NOT NULL,
	`school_id` text NOT NULL
);
