CREATE TABLE `agent_executions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`status` text DEFAULT 'pending',
	`goal` text,
	`constraints` text,
	`taskFlow` text,
	`result` text,
	`errorMessage` text,
	`startedAt` integer,
	`completedAt` integer,
	`createdAt` integer DEFAULT '"2025-12-05T06:00:39.887Z"' NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `agent_steps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`executionId` text NOT NULL,
	`stepNumber` integer NOT NULL,
	`agentName` text NOT NULL,
	`taskDescription` text,
	`status` text DEFAULT 'pending',
	`input` text,
	`output` text,
	`errorMessage` text,
	`startedAt` integer,
	`completedAt` integer,
	`createdAt` integer DEFAULT '"2025-12-05T06:00:39.887Z"' NOT NULL,
	FOREIGN KEY (`executionId`) REFERENCES `agent_executions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `agent_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`prompt` text NOT NULL,
	`defaultParameters` text,
	`createdBy` integer NOT NULL,
	`createdAt` integer DEFAULT '"2025-12-05T06:00:39.887Z"' NOT NULL,
	`updatedAt` integer DEFAULT '"2025-12-05T06:00:39.887Z"' NOT NULL,
	FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `newsletters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`summary` text,
	`topics` text,
	`agentExecutionId` text,
	`generatedAt` integer DEFAULT '"2025-12-05T06:00:39.886Z"' NOT NULL,
	`createdAt` integer DEFAULT '"2025-12-05T06:00:39.886Z"' NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`topics` text,
	`tone` text DEFAULT 'professional',
	`contentLength` text DEFAULT 'medium',
	`newsSourcePreference` text DEFAULT 'mixed',
	`personalizationLevel` integer DEFAULT 5,
	`createdAt` integer DEFAULT '"2025-12-05T06:00:39.885Z"' NOT NULL,
	`updatedAt` integer DEFAULT '"2025-12-05T06:00:39.885Z"' NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer DEFAULT '"2025-12-05T06:00:39.882Z"' NOT NULL,
	`updatedAt` integer DEFAULT '"2025-12-05T06:00:39.882Z"' NOT NULL,
	`lastSignedIn` integer DEFAULT '"2025-12-05T06:00:39.882Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);