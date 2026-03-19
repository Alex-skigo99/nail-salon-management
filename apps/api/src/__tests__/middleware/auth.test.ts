import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// ─── Mock db (auth middleware imports authService which imports db) ────────────
vi.mock("../../lib/db", () => ({ knex: vi.fn() }));

// ─── Imports ──────────────────────────────────────────────────────────────────

import { authenticate, requireRole, optionalAuth } from "../../middleware/auth";
import { generateToken } from "../../services/authService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockReqRes(overrides: Partial<Request> = {}): {
  req: Request;
  res: Response;
  next: NextFunction;
  json: ReturnType<typeof vi.fn>;
  status: ReturnType<typeof vi.fn>;
} {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const res = { status, json } as unknown as Response;
  const next = vi.fn() as NextFunction;
  const req = { headers: {}, cookies: {}, ...overrides } as unknown as Request;
  return { req, res, next, json, status };
}

const adminPayload = { id: "uuid-admin", email: "admin@example.com", role: "ADMIN" as const };
const userPayload = { id: "uuid-user", email: "user@example.com", role: "USER" as const };

// ─── authenticate ─────────────────────────────────────────────────────────────

describe("authenticate", () => {
  it("calls next and sets req.user when Bearer token is valid", () => {
    const token = generateToken(adminPayload);
    const { req, res, next } = mockReqRes({
      headers: { authorization: `Bearer ${token}` },
    });

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((req as any).user.userId).toBe(adminPayload.id);
  });

  it("calls next and sets req.user when cookie token is valid", () => {
    const token = generateToken(userPayload);
    const { req, res, next } = mockReqRes({ cookies: { auth_token: token } });

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((req as any).user.role).toBe("USER");
  });

  it("responds 401 when no token is provided", () => {
    const { req, res, next } = mockReqRes();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("responds 401 when token is invalid", () => {
    const { req, res, next } = mockReqRes({
      headers: { authorization: "Bearer invalid.token.here" },
    });

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ─── requireRole ─────────────────────────────────────────────────────────────

describe("requireRole", () => {
  it("calls next when user has the required role", () => {
    const token = generateToken(adminPayload);
    const { req, res, next } = mockReqRes({
      headers: { authorization: `Bearer ${token}` },
    });
    authenticate(req, res, next);
    (next as ReturnType<typeof vi.fn>).mockClear();

    requireRole("ADMIN")(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalledWith(403);
  });

  it("responds 403 when user does not have the required role", () => {
    const token = generateToken(userPayload);
    const { req, res, next } = mockReqRes({
      headers: { authorization: `Bearer ${token}` },
    });
    authenticate(req, res, next);
    (next as ReturnType<typeof vi.fn>).mockClear();

    requireRole("ADMIN")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("responds 401 when req.user is not set", () => {
    const { req, res, next } = mockReqRes();

    requireRole("ADMIN")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ─── optionalAuth ─────────────────────────────────────────────────────────────

describe("optionalAuth", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets req.user when a valid token is present", () => {
    const token = generateToken(userPayload);
    const { req, res, next } = mockReqRes({ cookies: { auth_token: token } });

    optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((req as any).user?.email).toBe(userPayload.email);
  });

  it("still calls next when no token is provided (does not reject)", () => {
    const { req, res, next } = mockReqRes();

    optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((req as any).user).toBeUndefined();
  });

  it("still calls next when the token is invalid (does not reject)", () => {
    const { req, res, next } = mockReqRes({
      headers: { authorization: "Bearer bad.token" },
    });

    optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((req as any).user).toBeUndefined();
  });
});
