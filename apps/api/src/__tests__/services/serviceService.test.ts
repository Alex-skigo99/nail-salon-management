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
  };

  for (const key of ["where", "insert", "update"]) {
    chain[key].mockReturnValue(chain);
  }

  const mockKnex = vi.fn().mockReturnValue(chain);
  return { mockKnex, chain };
});

vi.mock("../../lib/db", () => ({ knex: mockKnex }));

// ─── Imports ──────────────────────────────────────────────────────────────────

import { getAllServices, createService, updateService, deleteService } from "../../services/serviceService";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockService = {
  id: 1,
  name: "Manicure",
  price: "30",
  duration_minutes: 45,
  description: "Basic manicure",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getAllServices", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all services", async () => {
    chain.select.mockResolvedValue([mockService]);
    const result = await getAllServices();
    expect(result).toEqual([mockService]);
    expect(mockKnex).toHaveBeenCalledWith("services");
  });

  it("returns an empty array when no services exist", async () => {
    chain.select.mockResolvedValue([]);
    const result = await getAllServices();
    expect(result).toEqual([]);
  });
});

describe("createService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("inserts and returns the new service", async () => {
    chain.returning.mockResolvedValue([mockService]);
    const input = { name: "Manicure", price: "30", duration_minutes: 45 };

    const result = await createService(input);

    expect(result).toEqual(mockService);
    expect(chain.insert).toHaveBeenCalledWith(input);
    expect(chain.returning).toHaveBeenCalledWith("*");
  });
});

describe("updateService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates and returns the service", async () => {
    const updated = { ...mockService, name: "Gel Manicure", price: "45" };
    chain.returning.mockResolvedValue([updated]);

    const result = await updateService(1, { name: "Gel Manicure", price: "45" });

    expect(result).toEqual(updated);
    expect(chain.where).toHaveBeenCalledWith({ id: 1 });
  });

  it("returns null when service not found", async () => {
    chain.returning.mockResolvedValue([]);
    const result = await updateService(999, { name: "Ghost" });
    expect(result).toBeNull();
  });
});

describe("deleteService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns true when a row is deleted", async () => {
    chain.delete.mockResolvedValue(1);
    const result = await deleteService(1);
    expect(result).toBe(true);
    expect(chain.where).toHaveBeenCalledWith({ id: 1 });
  });

  it("returns false when no row is deleted", async () => {
    chain.delete.mockResolvedValue(0);
    const result = await deleteService(999);
    expect(result).toBe(false);
  });
});
