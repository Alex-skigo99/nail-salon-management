import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock knex before any imports that touch db ───────────────────────────────

const { mockKnex, chain } = vi.hoisted(() => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
    where: vi.fn(),
    whereNot: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockResolvedValue(0),
    returning: vi.fn().mockResolvedValue([]),
    first: vi.fn().mockResolvedValue(undefined),
  };

  for (const key of ["where", "whereNot", "insert", "update"]) {
    chain[key].mockReturnValue(chain);
  }

  const mockKnex = Object.assign(vi.fn().mockReturnValue(chain), {
    fn: { now: vi.fn(() => "NOW()") },
  });

  return { mockKnex, chain };
});

vi.mock("../../lib/db", () => ({ knex: mockKnex }));

// ─── Imports (after mock) ─────────────────────────────────────────────────────

import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  register,
  login,
  findUserByEmail,
  findUserById,
  ConflictError,
  UnauthorizedError,
} from "../../services/authService";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "test@example.com",
  name: "Test User",
  phone: "+1234567890",
  role: "USER" as const,
  image: null,
  google_id: null,
  last_login: null,
  created_at: new Date().toISOString(),
};

const mockUserWithPassword = { ...mockUser, password: "$2b$12$hashedpassword" };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("generateToken / verifyToken", () => {
  it("generates a token and verifies it back", () => {
    const token = generateToken({ id: mockUser.id, email: mockUser.email, role: "USER" });
    const payload = verifyToken(token);
    expect(payload.userId).toBe(mockUser.id);
    expect(payload.email).toBe(mockUser.email);
    expect(payload.role).toBe("USER");
  });

  it("throws on an invalid token", () => {
    expect(() => verifyToken("not-a-token")).toThrow();
  });

  it("throws on a tampered token", () => {
    const token = generateToken({ id: mockUser.id, email: mockUser.email, role: "USER" });
    expect(() => verifyToken(token + "tampered")).toThrow();
  });
});

describe("hashPassword / comparePassword", () => {
  it("hashes a password and matches it correctly", async () => {
    const hash = await hashPassword("securePassword123");
    await expect(comparePassword("securePassword123", hash)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("correctPassword");
    await expect(comparePassword("wrongPassword", hash)).resolves.toBe(false);
  });
});

describe("findUserByEmail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a user when found", async () => {
    chain.where.mockReturnValue(chain);
    chain.first.mockResolvedValue(mockUserWithPassword);

    const result = await findUserByEmail("test@example.com");
    expect(result).toEqual(mockUserWithPassword);
    expect(mockKnex).toHaveBeenCalledWith("users");
  });

  it("returns undefined when not found", async () => {
    chain.first.mockResolvedValue(undefined);
    const result = await findUserByEmail("nobody@example.com");
    expect(result).toBeUndefined();
  });
});

describe("findUserById", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns safe user columns when found", async () => {
    chain.select.mockReturnValue(chain);
    chain.where.mockReturnValue(chain);
    chain.first.mockResolvedValue(mockUser);

    const result = await findUserById(mockUser.id);
    expect(result).toEqual(mockUser);
  });
});

describe("register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a new user and returns user + token", async () => {
    // findUserByEmail → no existing user
    chain.first.mockResolvedValueOnce(undefined);
    // insert → returning
    chain.returning.mockResolvedValueOnce([mockUser]);

    const result = await register({
      email: "new@example.com",
      password: "password123",
      name: "New User",
      phone: "+1234567890",
    });

    expect(result.user).toMatchObject({ email: mockUser.email });
    expect(typeof result.token).toBe("string");
  });

  it("throws ConflictError when email already exists", async () => {
    chain.first.mockResolvedValueOnce(mockUserWithPassword);

    await expect(
      register({ email: "test@example.com", password: "pw", name: "N", phone: "+1" })
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("login", () => {
  const validPassword = "correctPassword";

  beforeEach(() => vi.clearAllMocks());

  it("returns user + token on valid credentials", async () => {
    const hash = await hashPassword(validPassword);
    const userWithHash = { ...mockUserWithPassword, password: hash };

    chain.first.mockResolvedValueOnce(userWithHash); // findUserByEmail
    chain.update.mockReturnValue(chain); // update last_login
    chain.first.mockResolvedValue(undefined);

    const result = await login("test@example.com", validPassword);
    expect(result.user).not.toHaveProperty("password");
    expect(typeof result.token).toBe("string");
  });

  it("throws UnauthorizedError when user not found", async () => {
    chain.first.mockResolvedValueOnce(undefined);
    await expect(login("nobody@example.com", "pw")).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("throws UnauthorizedError on wrong password", async () => {
    const hash = await hashPassword(validPassword);
    chain.first.mockResolvedValueOnce({ ...mockUserWithPassword, password: hash });
    await expect(login("test@example.com", "wrongPassword")).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
