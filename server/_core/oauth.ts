import type { Express, Request as ExpressRequest } from "express";
// OAuth routes removed: no-op

function getQueryParam(req: ExpressRequest, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express): void {
  // No OAuth callbacks; authentication removed.
}
