import type { NextFunction, Request, Response } from "express";

import { TenantError, verifyJwt, type TenantClaims } from "../lib/tenancy.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenant?: TenantClaims;
    }
  }
}

function jwtSecret(): string {
  return process.env.JWT_SECRET ?? "";
}

/**
 * Express middleware that enforces a valid JWT on every request and attaches
 * the decoded `tenant_id` claim to `req.tenant`.
 *
 * Bypass paths (health, docs, login) are listed in `PUBLIC_PATHS` below.
 */
export function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (PUBLIC_PATHS.has(req.path)) {
    return next();
  }
  const secret = jwtSecret();
  if (!secret) {
    res.status(500).json({ error: "JWT_SECRET not configured" });
    return;
  }
  const auth = req.header("authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    res.status(401).json({ error: "Missing Bearer token" });
    return;
  }
  const token = auth.slice(7).trim();
  try {
    const claims = verifyJwt(token, secret);
    req.tenant = claims;
    next();
  } catch (err) {
    const status = err instanceof TenantError ? err.status : 401;
    const message = err instanceof Error ? err.message : "Unauthorized";
    res.status(status).json({ error: message });
  }
}

const PUBLIC_PATHS = new Set<string>([
  "/api/healthz",
  "/api/docs",
  "/api/redoc",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
]);
