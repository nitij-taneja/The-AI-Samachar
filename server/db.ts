import { eq, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { InsertUser, users, userPreferences, InsertUserPreference, newsletters, InsertNewsletter, agentExecutions, InsertAgentExecution, agentSteps, InsertAgentStep, agentTemplates, InsertAgentTemplate } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // For SQLite, DATABASE_URL is typically the path to the file (e.g., file:./data.db)
      // We assume drizzle('sqlite', connectionString) or similar if needed, but Drizzle documentation for SQLite
      // often suggests using the adapter library directly, or checking if the default `drizzle` function handles it.
      // Based on current setup, we assume `drizzle(connectionString)` works for sqlite when dialect is set to sqlite in config.
      // Drizzle for SQLite usually requires a connection object or path. If DATABASE_URL is set, we use it directly.
      // For better-sqlite3, the connection requires a Database instance.
      // We will create a new Database instance if DATABASE_URL is provided.
      // If DATABASE_URL is a file path, better-sqlite3 uses it directly.
      let dbPath = process.env.DATABASE_URL!;
      if (dbPath.startsWith("file:")) {
        dbPath = dbPath.substring(5);
      }
      const resolvedPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
      // Ensure the directory exists before connecting
      const dir = path.dirname(resolvedPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const sqlite = new Database(resolvedPath);
      _db = drizzle(sqlite);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // SQLite does not support onDuplicateKeyUpdate. Use `insert or replace into` or separate select and update.
    // For simplicity, we'll perform a select and then an insert/update.
    const existingUser = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);

    if (existingUser.length > 0) {
      await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
    } else {
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) {
    // Return default preferences if database unavailable
    return {
      id: 0,
      userId,
      topics: JSON.stringify([]),
      tone: 'professional',
      contentLength: 'medium',
      newsSourcePreference: 'mixed',
      personalizationLevel: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  if (result.length > 0) {
    return result[0];
  }
  // Return default preferences if none exist for user
  return {
    id: 0,
    userId,
    topics: JSON.stringify([]),
    tone: 'professional',
    contentLength: 'medium',
    newsSourcePreference: 'mixed',
    personalizationLevel: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function upsertUserPreferences(userId: number, prefs: Omit<InsertUserPreference, 'userId'>) {
  const db = await getDb();
  const existing = await getUserPreferences(userId);
  if (db && existing.id > 0) {
    // Update existing preferences
    await db.update(userPreferences).set(prefs).where(eq(userPreferences.userId, userId));
    return { ...existing, ...prefs };
  } else if (db) {
    // Insert new preferences
    await db.insert(userPreferences).values({ ...prefs, userId });
    return { id: 0, userId, ...prefs, createdAt: new Date(), updatedAt: new Date() };
  }
  // Return merged preferences if database unavailable
  return { ...existing, ...prefs };
}

export async function createNewsletter(newsletter: InsertNewsletter) {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot create newsletter: database not available');
    return { id: 0, ...newsletter };
  }
  const result = await db.insert(newsletters).values(newsletter).returning();
  return result[0];
}

export async function getUserNewsletters(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(newsletters).where(eq(newsletters.userId, userId)).orderBy(desc(newsletters.createdAt)).limit(limit);
  console.log(`Fetched ${result.length} newsletters for user ${userId}, newest:`, result[0]?.title, result[0]?.createdAt);
  return result;
}

export async function createAgentExecution(execution: InsertAgentExecution) {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot create agent execution: database not available');
    return execution;
  }
  await db.insert(agentExecutions).values(execution);
  return execution;
}

export async function updateAgentExecution(executionId: string, updates: Partial<InsertAgentExecution>) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(agentExecutions).set(updates).where(eq(agentExecutions.id, executionId));
}

export async function createAgentStep(step: InsertAgentStep) {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot create agent step: database not available');
    return step;
  }
  await db.insert(agentSteps).values(step);
  return step;
}

export async function getAgentExecutionSteps(executionId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(agentSteps).where(eq(agentSteps.executionId, executionId)).orderBy(asc(agentSteps.stepNumber));
}

  // TODO: add feature queries here as your schema grows.
 
  /**
   * Get a single newsletter by ID.
   */
  export async function getNewsletterById(id: number) {
    const db = await getDb();
    if (!db) return undefined;
    const result = await db.select().from(newsletters).where(eq(newsletters.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

 /**
  * Custom agent templates CRUD operations
  */
 export async function getAgentTemplates(userId: number) {
   const db = await getDb();
   if (!db) return [];
   return await db.select().from(agentTemplates).where(eq(agentTemplates.createdBy, userId));
 }

 export async function createAgentTemplate(template: InsertAgentTemplate) {
   const db = await getDb();
   if (!db) {
     console.warn('[Database] Cannot create agent template: database not available');
     return template;
   }
   await db.insert(agentTemplates).values(template);
   return template;
 }

 export async function updateAgentTemplate(id: number, updates: Partial<InsertAgentTemplate>) {
   const db = await getDb();
   if (!db) return;
   await db.update(agentTemplates).set(updates).where(eq(agentTemplates.id, id));
 }

 export async function deleteAgentTemplate(id: number) {
   const db = await getDb();
   if (!db) return;
   await db.delete(agentTemplates).where(eq(agentTemplates.id, id));
 }
