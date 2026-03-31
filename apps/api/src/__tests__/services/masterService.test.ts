/* eslint-disable @typescript-eslint/no-explicit-any */
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
    first: vi.fn().mockResolvedValue(null),
  };

  // select returns a thenable chain: resolves like a promise but also supports .first()
  chain.select.mockImplementation(() => {
    const thenableChain = {
      ...chain,
      then: (resolve: (v: unknown) => void) => resolve((chain.select as any)._resolveValue ?? []),
    };
    return thenableChain;
  });

  for (const key of ["where", "insert", "update"]) {
    chain[key].mockReturnValue(chain);
  }

  const mockKnex = vi.fn().mockReturnValue(chain);
  return { mockKnex, chain };
});

vi.mock("../../lib/db", () => ({ knex: mockKnex }));
vi.mock("../../services/s3Service", () => ({
  resolveImageUrl: vi.fn(async (v: string | null) => v),
  isS3Key: vi.fn(() => false),
  deleteObject: vi.fn(async () => {}),
}));

// ─── Imports ──────────────────────────────────────────────────────────────────

import { getAllMasters, createMaster, updateMaster, deleteMaster } from "../../services/masterService";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockMaster = {
  id: 1,
  name: "Jane Doe",
  description: "Senior nail technician",
  image: null,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getAllMasters", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all masters", async () => {
    (chain.select as any)._resolveValue = [mockMaster];
    const result = await getAllMasters();
    expect(result).toEqual([mockMaster]);
    expect(mockKnex).toHaveBeenCalledWith("masters");
  });

  it("returns empty array when no masters exist", async () => {
    (chain.select as any)._resolveValue = [];
    expect(await getAllMasters()).toEqual([]);
  });
});

describe("createMaster", () => {
  beforeEach(() => vi.clearAllMocks());

  it("inserts and returns the new master", async () => {
    chain.returning.mockResolvedValue([mockMaster]);
    const result = await createMaster({ name: "Jane Doe", description: "Senior nail technician" });
    expect(result).toEqual(mockMaster);
    expect(chain.returning).toHaveBeenCalledWith("*");
  });
});

describe("updateMaster", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates and returns the master", async () => {
    const updated = { ...mockMaster, name: "Jane Smith" };
    chain.first.mockResolvedValue(null); // no existing image
    chain.returning.mockResolvedValue([updated]);
    const result = await updateMaster(1, { name: "Jane Smith" });
    expect(result).toEqual(updated);
    expect(chain.where).toHaveBeenCalledWith({ id: 1 });
  });

  it("returns null when master not found", async () => {
    chain.returning.mockResolvedValue([]);
    const result = await updateMaster(999, { name: "Ghost" });
    expect(result).toBeNull();
  });
});

describe("deleteMaster", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns true when a row is deleted", async () => {
    chain.delete.mockResolvedValue(1);
    const result = await deleteMaster(1);
    expect(result).toBe(true);
  });

  it("returns false when no row is deleted", async () => {
    chain.delete.mockResolvedValue(0);
    const result = await deleteMaster(999);
    expect(result).toBe(false);
  });
});
