import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock knex ────────────────────────────────────────────────────────────────

const { mockKnex, chain } = vi.hoisted(() => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
    where: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockResolvedValue(0),
    returning: vi.fn().mockResolvedValue([]),
    first: vi.fn().mockResolvedValue(undefined),
  };

  for (const key of ["select", "where", "insert", "update"]) {
    chain[key].mockReturnValue(chain);
  }

  const mockKnex = vi.fn().mockReturnValue(chain);
  return { mockKnex, chain };
});

vi.mock("../../lib/db", () => ({ knex: mockKnex }));

// ─── Imports ──────────────────────────────────────────────────────────────────

import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from "../../services/userService";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+1234567890",
  role: "USER" as const,
  last_login: null,
  image: null,
  created_at: new Date().toISOString(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getAllUsers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all users", async () => {
    chain.select.mockResolvedValue([mockUser]);
    const result = await getAllUsers();
    expect(result).toEqual([mockUser]);
    expect(mockKnex).toHaveBeenCalledWith("users");
  });

  it("returns empty array when no users exist", async () => {
    chain.select.mockResolvedValue([]);
    expect(await getAllUsers()).toEqual([]);
  });
});

describe("getUserById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // getAllUsers overrides chain.select with mockResolvedValue — restore chaining here
    chain.select.mockReturnValue(chain);
    chain.where.mockReturnValue(chain);
  });

  it("returns the user when found", async () => {
    chain.first.mockResolvedValue(mockUser);
    const result = await getUserById(mockUser.id);
    expect(result).toEqual(mockUser);
    expect(chain.where).toHaveBeenCalledWith({ id: mockUser.id });
  });

  it("returns null when user not found", async () => {
    chain.first.mockResolvedValue(undefined);
    const result = await getUserById("non-existent-id");
    expect(result).toBeNull();
  });
});

describe("createUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("inserts and returns the new user", async () => {
    chain.returning.mockResolvedValue([mockUser]);
    const input = { name: "Jane Doe", email: "jane@example.com", role: "USER" as const };

    const result = await createUser(input);

    expect(result).toEqual(mockUser);
    expect(chain.insert).toHaveBeenCalledWith(input);
  });
});

describe("updateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chain.where.mockReturnValue(chain);
    chain.update.mockReturnValue(chain);
  });

  it("updates and returns the user", async () => {
    const updated = { ...mockUser, name: "Jane Smith" };
    chain.returning.mockResolvedValue([updated]);

    const result = await updateUser(mockUser.id, { name: "Jane Smith" });

    expect(result).toEqual(updated);
    expect(chain.where).toHaveBeenCalledWith({ id: mockUser.id });
  });

  it("returns null when user not found", async () => {
    chain.returning.mockResolvedValue([]);
    const result = await updateUser("non-existent-id", { name: "Ghost" });
    expect(result).toBeNull();
  });
});

describe("deleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chain.where.mockReturnValue(chain);
  });

  it("returns true when a row is deleted", async () => {
    chain.delete.mockResolvedValue(1);
    const result = await deleteUser(mockUser.id);
    expect(result).toBe(true);
    expect(chain.where).toHaveBeenCalledWith({ id: mockUser.id });
  });

  it("returns false when no row is deleted", async () => {
    chain.delete.mockResolvedValue(0);
    const result = await deleteUser("non-existent-id");
    expect(result).toBe(false);
  });
});
