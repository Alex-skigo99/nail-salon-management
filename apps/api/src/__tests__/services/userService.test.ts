/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock knex ────────────────────────────────────────────────────────────────

const { mockKnex, chain } = vi.hoisted(() => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
    where: vi.fn(),
    whereILike: vi.fn(),
    orWhereILike: vi.fn(),
    orderBy: vi.fn(),
    orderByRaw: vi.fn(),
    leftJoin: vi.fn(),
    join: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockResolvedValue(0),
    returning: vi.fn().mockResolvedValue([]),
    first: vi.fn().mockResolvedValue(undefined),
    as: vi.fn(),
    count: vi.fn(),
    max: vi.fn(),
    groupBy: vi.fn(),
    paginate: vi
      .fn()
      .mockResolvedValue({ data: [], pagination: { currentPage: 1, perPage: 10, total: 0, lastPage: 1 } }),
  };

  for (const key of [
    "select",
    "where",
    "whereILike",
    "orWhereILike",
    "orderBy",
    "orderByRaw",
    "leftJoin",
    "join",
    "insert",
    "update",
    "count",
    "max",
    "groupBy",
  ]) {
    chain[key].mockReturnValue(chain);
  }

  // Make chain thenable so `return query` resolves like a real Knex builder
  chain.then = vi.fn((resolve: (v: unknown) => void) => resolve([]));

  const mockKnex = vi.fn().mockReturnValue(chain);
  (mockKnex as any).raw = vi.fn().mockReturnValue("raw");
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
  master_id: null,
  email_subscribed: true,
  created_at: new Date().toISOString(),
};

const mockUserListItem = {
  ...mockUser,
  appts_count: 3,
  last_appts: "2026-03-20",
  is_google_auth: false,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getAllUsers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns paginated users with appts_count and last_appts", async () => {
    chain.paginate.mockResolvedValue({
      data: [mockUserListItem],
      pagination: { currentPage: 1, perPage: 10, total: 1, lastPage: 1 },
    });
    const result = await getAllUsers();
    expect(result.data).toEqual([mockUserListItem]);
    expect(result.pagination).toBeDefined();
    expect(mockKnex).toHaveBeenCalledWith("users as u");
  });

  it("returns empty data array when no users exist", async () => {
    chain.paginate.mockResolvedValue({ data: [], pagination: { currentPage: 1, perPage: 10, total: 0, lastPage: 1 } });
    const result = await getAllUsers();
    expect(result.data).toEqual([]);
  });

  it("applies search filter", async () => {
    chain.paginate.mockResolvedValue({
      data: [mockUserListItem],
      pagination: { currentPage: 1, perPage: 10, total: 1, lastPage: 1 },
    });
    await getAllUsers({ search: "jane" });
    expect(chain.where).toHaveBeenCalled();
  });

  it("applies role filter", async () => {
    chain.paginate.mockResolvedValue({
      data: [mockUserListItem],
      pagination: { currentPage: 1, perPage: 10, total: 1, lastPage: 1 },
    });
    await getAllUsers({ role: "USER" });
    expect(chain.where).toHaveBeenCalledWith("u.role", "USER");
  });

  it("applies master_id filter", async () => {
    chain.paginate.mockResolvedValue({
      data: [mockUserListItem],
      pagination: { currentPage: 1, perPage: 10, total: 1, lastPage: 1 },
    });
    await getAllUsers({ master_id: 1 });
    expect(chain.where).toHaveBeenCalledWith("u.master_id", 1);
  });

  it("applies sort by name", async () => {
    chain.paginate.mockResolvedValue({
      data: [mockUserListItem],
      pagination: { currentPage: 1, perPage: 10, total: 1, lastPage: 1 },
    });
    await getAllUsers({ sort: "name" });
    expect(chain.orderByRaw).toHaveBeenCalledWith("LOWER(u.name) ASC");
  });

  it("applies sort by appts_count desc", async () => {
    chain.paginate.mockResolvedValue({
      data: [mockUserListItem],
      pagination: { currentPage: 1, perPage: 10, total: 1, lastPage: 1 },
    });
    await getAllUsers({ sort: "appts_count" });
    expect(chain.orderBy).toHaveBeenCalledWith("appts_count", "desc");
  });

  it("passes page and perPage to paginate", async () => {
    chain.paginate.mockResolvedValue({ data: [], pagination: { currentPage: 2, perPage: 5, total: 10, lastPage: 2 } });
    await getAllUsers({ page: 2, perPage: 5 });
    expect(chain.paginate).toHaveBeenCalledWith({ currentPage: 2, perPage: 5, isLengthAware: true });
  });

  it("uses default page=1 and perPage=10 when not specified", async () => {
    chain.paginate.mockResolvedValue({ data: [], pagination: { currentPage: 1, perPage: 10, total: 0, lastPage: 1 } });
    await getAllUsers();
    expect(chain.paginate).toHaveBeenCalledWith({ currentPage: 1, perPage: 10, isLengthAware: true });
  });
});

describe("getUserById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chain.select.mockReturnValue(chain);
    chain.where.mockReturnValue(chain);
    chain.leftJoin.mockReturnValue(chain);
  });

  it("returns the user with master_data when found", async () => {
    const userWithMaster = {
      ...mockUser,
      master_data: null,
      is_google_auth: false,
      appts_count: 3,
      last_appts: "2026-03-20",
    };
    chain.first.mockResolvedValue(userWithMaster);
    const result = await getUserById(mockUser.id);
    expect(result).toEqual(userWithMaster);
    expect(chain.where).toHaveBeenCalledWith("u.id", mockUser.id);
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

  it("inserts user with master_id and email_subscribed", async () => {
    chain.returning.mockResolvedValue([{ ...mockUser, master_id: 1, email_subscribed: false }]);
    const input = {
      name: "Jane Doe",
      email: "jane@example.com",
      role: "USER" as const,
      master_id: 1,
      email_subscribed: false,
    };

    const result = await createUser(input);

    expect(result.master_id).toBe(1);
    expect(result.email_subscribed).toBe(false);
    expect(chain.insert).toHaveBeenCalledWith(input);
  });

  it("inserts user with hashed password", async () => {
    chain.returning.mockResolvedValue([mockUser]);
    const input = {
      name: "Jane Doe",
      email: "jane@example.com",
      role: "USER" as const,
      password: "hashed_password",
    };

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

  it("updates master_id and email_subscribed", async () => {
    const updated = { ...mockUser, master_id: 2, email_subscribed: false };
    chain.returning.mockResolvedValue([updated]);

    const result = await updateUser(mockUser.id, { master_id: 2, email_subscribed: false });

    expect(result).toEqual(updated);
    expect(chain.update).toHaveBeenCalledWith({ master_id: 2, email_subscribed: false });
  });

  it("returns null when user not found", async () => {
    chain.returning.mockResolvedValue([]);
    const result = await updateUser("non-existent-id", { name: "Ghost" });
    expect(result).toBeNull();
  });

  it("updates password when provided", async () => {
    const updated = { ...mockUser };
    chain.returning.mockResolvedValue([updated]);

    const result = await updateUser(mockUser.id, { password: "new_hashed_password" });

    expect(result).toEqual(updated);
    expect(chain.update).toHaveBeenCalledWith({ password: "new_hashed_password" });
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
