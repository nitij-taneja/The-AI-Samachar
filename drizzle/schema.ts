import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(new Date()).notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).default(new Date()).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User preferences for newsletter generation
 */
export const userPreferences = sqliteTable("user_preferences", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).notNull().references(() => users.id),
  topics: text("topics"), // JSON array of topics
  tone: text("tone").default("professional"), // professional, casual, technical, etc.
  contentLength: text("contentLength").default("medium"), // short, medium, long
  newsSourcePreference: text("newsSourcePreference").default("mixed"), // tech, business, general, etc.
  personalizationLevel: integer("personalizationLevel", { mode: "number" }).default(5), // 1-10 scale
  createdAt: integer("createdAt", { mode: "timestamp" }).default(new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(new Date()).notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Generated newsletters
 */
export const newsletters = sqliteTable("newsletters", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content"), // HTML or markdown content
  summary: text("summary"), // Brief summary of newsletter
  topics: text("topics"), // JSON array of topics used
  agentExecutionId: text("agentExecutionId"), // Reference to agent execution
  generatedAt: integer("generatedAt", { mode: "timestamp" }).default(new Date()).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(new Date()).notNull(),
});

export type Newsletter = typeof newsletters.$inferSelect;
export type InsertNewsletter = typeof newsletters.$inferInsert;

/**
 * Agent execution logs for tracking agent workflow
 */
export const agentExecutions = sqliteTable("agent_executions", {
  id: text("id").primaryKey(),
  userId: integer("userId", { mode: "number" }).notNull().references(() => users.id),
  status: text("status").default("pending"),
  goal: text("goal"), // Agent's goal
  constraints: text("constraints"), // JSON array of constraints
  taskFlow: text("taskFlow"), // JSON representing the execution flow
  result: text("result"), // Final result/output
  errorMessage: text("errorMessage"), // Error details if failed
  startedAt: integer("startedAt", { mode: "timestamp" }),
  completedAt: integer("completedAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(new Date()).notNull(),
});

export type AgentExecution = typeof agentExecutions.$inferSelect;
export type InsertAgentExecution = typeof agentExecutions.$inferInsert;

/**
 * Agent task steps for real-time visualization
 */
export const agentSteps = sqliteTable("agent_steps", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  executionId: text("executionId").notNull().references(() => agentExecutions.id),
  stepNumber: integer("stepNumber", { mode: "number" }).notNull(),
  agentName: text("agentName").notNull(),
  taskDescription: text("taskDescription"),
  status: text("status").default("pending"),
  input: text("input"), // JSON input to the step
  output: text("output"), // JSON output from the step
  errorMessage: text("errorMessage"),
  startedAt: integer("startedAt", { mode: "timestamp" }),
  completedAt: integer("completedAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(new Date()).notNull(),
});

export type AgentStep = typeof agentSteps.$inferSelect;
export type InsertAgentStep = typeof agentSteps.$inferInsert;
/**
 * Custom agent templates for newsletter generation
 */
export const agentTemplates = sqliteTable("agent_templates", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  prompt: text("prompt").notNull(),
  defaultParameters: text("defaultParameters"), // JSON object of default parameters
  createdBy: integer("createdBy", { mode: "number" }).notNull().references(() => users.id),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(new Date()).notNull(),
});

export type AgentTemplate = typeof agentTemplates.$inferSelect;
export type InsertAgentTemplate = typeof agentTemplates.$inferInsert;