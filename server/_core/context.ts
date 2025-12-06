import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { upsertUser } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // For development: provide mock user
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    user = {
      id: 1,
      openId: "dev-user",
      name: "Developer",
      email: "dev@example.com",
      loginMethod: "dev",
      lastSignedIn: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    // Ensure the dev user exists in the database for foreign key constraints
    await upsertUser({
      openId: user.openId,
      name: user.name,
      email: user.email!,
      loginMethod: user.loginMethod!,
    });
  } else {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
