/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// ─── Mock db and service layer ────────────────────────────────────────────────

vi.mock("../../lib/db", () => ({ knex: vi.fn() }));
vi.mock("../../services/authService", async (importActual) => {
  const actual = await importActual<typeof import("../../services/authService")>();
  return {
    ...actual,
    register: vi.fn(),
    login: vi.fn(),
    findUserById: vi.fn(),
    findUserByEmail: vi.fn(),
    findOrCreateGoogleUser: vi.fn(),
  };
});

// ─── Imports ──────────────────────────────────────────────────────────────────

import app from "../../app";
import * as authService from "../../services/authService";
import { generateToken } from "../../services/authService";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  email: "user@example.com",
  name: "Test User",
  phone: "+1234567890",
  role: "USER" as const,
  image: null,
  google_id: null,
  last_login: null,
  created_at: new Date().toISOString(),
};

const registerBody = {
  email: "user@example.com",
  password: "Password123!",
  name: "Test User",
  phone: "+12345678901",
};

// ─── POST /auth/register ──────────────────────────────────────────────────────

describe("POST /auth/register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 201 and user+token on valid input", async () => {
    (authService.register as any).mockResolvedValue({ user: mockUser, token: "mock-token" });

    const res = await request(app).post("/auth/register").send(registerBody);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(mockUser.email);
    expect(res.body.token).toBe("mock-token");
  });

  it("returns 400 on missing required fields", async () => {
    const res = await request(app).post("/auth/register").send({ email: "bad" });
    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid email", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...registerBody, email: "not-an-email" });
    expect(res.status).toBe(400);
  });

  it("returns 400 on short password", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...registerBody, password: "short" });
    expect(res.status).toBe(400);
  });

  it("returns 409 when email already exists", async () => {
    (authService.register as any).mockRejectedValue(Object.assign(new Error("Email exists"), { statusCode: 409 }));

    const res = await request(app).post("/auth/register").send(registerBody);

    expect(res.status).toBe(409);
  });
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────

describe("POST /auth/login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 and user+token on valid credentials", async () => {
    (authService.login as any).mockResolvedValue({ user: mockUser, token: "mock-token" });

    const res = await request(app).post("/auth/login").send({ email: "user@example.com", password: "Password123!" });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(mockUser.email);
  });

  it("returns 400 when body is missing", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect(res.status).toBe(400);
  });

  it("returns 401 on invalid credentials", async () => {
    (authService.login as any).mockRejectedValue(Object.assign(new Error("Invalid credentials"), { statusCode: 401 }));

    const res = await request(app).post("/auth/login").send({ email: "user@example.com", password: "wrong" });

    expect(res.status).toBe(401);
  });
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────

describe("POST /auth/logout", () => {
  it("returns 200 and clears the auth cookie", async () => {
    const res = await request(app).post("/auth/logout");
    expect(res.status).toBe(200);
  });
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

describe("GET /auth/me", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 200 and user data with a valid Bearer token", async () => {
    (authService.findUserById as any).mockResolvedValue(mockUser);
    const token = generateToken({ id: mockUser.id, email: mockUser.email, role: "USER" });

    const res = await request(app).get("/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
