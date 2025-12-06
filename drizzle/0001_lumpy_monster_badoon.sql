PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_agent_executions` (
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
	`createdAt` integer DEFAULT '"2025-12-05T15:04:59.666Z"' NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_agent_executions`("id", "userId", "status", "goal", "constraints", "taskFlow", "result", "errorMessage", "startedAt", "completedAt", "createdAt") SELECT "id", "userId", "status", "goal", "constraints", "taskFlow", "result", "errorMessage", "startedAt", "completedAt", "createdAt" FROM `agent_executions`;--> statement-breakpoint
DROP TABLE `agent_executions`;--> statement-breakpoint
ALTER TABLE `__new_agent_executions` RENAME TO `agent_executions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_agent_steps` (
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
	`createdAt` integer DEFAULT '"2025-12-05T15:04:59.666Z"' NOT NULL,
	FOREIGN KEY (`executionId`) REFERENCES `agent_executions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_agent_steps`("id", "executionId", "stepNumber", "agentName", "taskDescription", "status", "input", "output", "errorMessage", "startedAt", "completedAt", "createdAt") SELECT "id", "executionId", "stepNumber", "agentName", "taskDescription", "status", "input", "output", "errorMessage", "startedAt", "completedAt", "createdAt" FROM `agent_steps`;--> statement-breakpoint
DROP TABLE `agent_steps`;--> statement-breakpoint
ALTER TABLE `__new_agent_steps` RENAME TO `agent_steps`;--> statement-breakpoint
CREATE TABLE `__new_agent_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`prompt` text NOT NULL,
	`defaultParameters` text,
	`createdBy` integer NOT NULL,
	`createdAt` integer DEFAULT '"2025-12-05T15:04:59.667Z"' NOT NULL,
	`updatedAt` integer DEFAULT '"2025-12-05T15:04:59.667Z"' NOT NULL,
	FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_agent_templates`("id", "name", "description", "prompt", "defaultParameters", "createdBy", "createdAt", "updatedAt") SELECT "id", "name", "description", "prompt", "defaultParameters", "createdBy", "createdAt", "updatedAt" FROM `agent_templates`;--> statement-breakpoint
DROP TABLE `agent_templates`;--> statement-breakpoint
ALTER TABLE `__new_agent_templates` RENAME TO `agent_templates`;--> statement-breakpoint
CREATE TABLE `__new_newsletters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`summary` text,
	`topics` text,
	`agentExecutionId` text,
	`generatedAt` integer DEFAULT '"2025-12-05T15:04:59.665Z"' NOT NULL,
	`createdAt` integer DEFAULT '"2025-12-05T15:04:59.665Z"' NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_newsletters`("id", "userId", "title", "content", "summary", "topics", "agentExecutionId", "generatedAt", "createdAt") SELECT "id", "userId", "title", "content", "summary", "topics", "agentExecutionId", "generatedAt", "createdAt" FROM `newsletters`;--> statement-breakpoint
DROP TABLE `newsletters`;--> statement-breakpoint
ALTER TABLE `__new_newsletters` RENAME TO `newsletters`;--> statement-breakpoint
CREATE TABLE `__new_user_preferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`topics` text,
	`tone` text DEFAULT 'professional',
	`contentLength` text DEFAULT 'medium',
	`newsSourcePreference` text DEFAULT 'mixed',
	`personalizationLevel` integer DEFAULT 5,
	`createdAt` integer DEFAULT '"2025-12-05T15:04:59.662Z"' NOT NULL,
	`updatedAt` integer DEFAULT '"2025-12-05T15:04:59.662Z"' NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_preferences`("id", "userId", "topics", "tone", "contentLength", "newsSourcePreference", "personalizationLevel", "createdAt", "updatedAt") SELECT "id", "userId", "topics", "tone", "contentLength", "newsSourcePreference", "personalizationLevel", "createdAt", "updatedAt" FROM `user_preferences`;--> statement-breakpoint
DROP TABLE `user_preferences`;--> statement-breakpoint
ALTER TABLE `__new_user_preferences` RENAME TO `user_preferences`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer DEFAULT '"2025-12-05T15:04:59.660Z"' NOT NULL,
	`updatedAt` integer DEFAULT '"2025-12-05T15:04:59.660Z"' NOT NULL,
	`lastSignedIn` integer DEFAULT '"2025-12-05T15:04:59.660Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "openId", "name", "email", "loginMethod", "role", "createdAt", "updatedAt", "lastSignedIn") SELECT "id", "openId", "name", "email", "loginMethod", "role", "createdAt", "updatedAt", "lastSignedIn" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);