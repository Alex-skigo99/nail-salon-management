import { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../services/authService";

/**
 * Express middleware that extracts and verifies the JWT from:
 *   1. `Authorization: Bearer <token>` header
 *   2. `auth_token` HTTP-only cookie
 *
 * On success, sets `req.user` to the decoded JWT payload.
 * On failure, responds with 401.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const payload = verifyToken(token);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Middleware factory that checks user role.
 * Must be used AFTER `authenticate`.
 */
export function requireRole(...roles: Array<"ADMIN" | "USER">) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user: JwtPayload | undefined = (req as any).user;
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (!roles.includes(user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}

/**
 * Optional auth middleware — same as `authenticate` but does NOT reject
 * unauthenticated requests. Sets `req.user` if a valid token is present.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (token) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).user = verifyToken(token);
    } catch {
      // Token is invalid — treat as unauthenticated
    }
  }
  next();
}

// ─── helpers ─────────────────────────────────

function extractToken(req: Request): string | null {
  // 1. Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // 2. Cookie
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cookieToken = (req as any).cookies?.auth_token;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}
