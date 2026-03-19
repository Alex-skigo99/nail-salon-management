import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock knex ────────────────────────────────────────────────────────────────

const { mockKnex, chain, trxChain } = vi.hoisted(() => {
  const makeChain = () => {
    const c: Record<string, ReturnType<typeof vi.fn>> = {
      select: vi.fn(),
      where: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(0),
      returning: vi.fn().mockResolvedValue([]),
      orderBy: vi.fn(),
    };
    for (const key of ["where", "insert", "select", "orderBy"]) {
      c[key].mockReturnValue(c);
    }
    return c;
  };

  const chain = makeChain();
  const trxChain = makeChain();

  const mockKnex = Object.assign(vi.fn().mockReturnValue(chain), {
    transaction: vi.fn(async (cb: (trx: unknown) => unknown) => cb(Object.assign(vi.fn().mockReturnValue(trxChain)))),
  });

  return { mockKnex, chain, trxChain };
});

vi.mock("../../lib/db", () => ({ knex: mockKnex }));

// ─── Imports ──────────────────────────────────────────────────────────────────

import {
  getWorkingHoursByMaster,
  replaceWorkingHours,
  deleteWorkingHoursByMaster,
} from "../../services/workingHoursService";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockHours = [
  { id: 1, master_id: 1, day_of_week: 1, start_time: "09:00", end_time: "18:00" },
  { id: 2, master_id: 1, day_of_week: 2, start_time: "09:00", end_time: "18:00" },
];

const records = [
  { day_of_week: 1, start_time: "09:00", end_time: "18:00" },
  { day_of_week: 2, start_time: "09:00", end_time: "18:00" },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getWorkingHoursByMaster", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns working hours for a master ordered by day", async () => {
    for (const key of ["where", "select", "orderBy"]) chain[key].mockReturnValue(chain);
    chain.orderBy.mockResolvedValue(mockHours);

    const result = await getWorkingHoursByMaster(1);
    expect(result).toEqual(mockHours);
    expect(chain.where).toHaveBeenCalledWith({ master_id: 1 });
  });

  it("returns empty array when no hours exist", async () => {
    for (const key of ["where", "select", "orderBy"]) chain[key].mockReturnValue(chain);
    chain.orderBy.mockResolvedValue([]);

    const result = await getWorkingHoursByMaster(99);
    expect(result).toEqual([]);
  });
});

describe("replaceWorkingHours", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of ["where", "insert", "select", "orderBy"]) {
      trxChain[key].mockReturnValue(trxChain);
    }
  });

  it("deletes existing hours and inserts new records", async () => {
    trxChain.delete.mockResolvedValue(2);
    trxChain.returning.mockResolvedValue(mockHours);

    const result = await replaceWorkingHours(1, records);

    expect(result).toEqual(mockHours);
    expect(trxChain.delete).toHaveBeenCalled();
    expect(trxChain.insert).toHaveBeenCalledWith(records.map((r) => ({ ...r, master_id: 1 })));
  });

  it("returns empty array when records is empty", async () => {
    trxChain.delete.mockResolvedValue(2);

    const result = await replaceWorkingHours(1, []);

    expect(result).toEqual([]);
    expect(trxChain.insert).not.toHaveBeenCalled();
  });
});

describe("deleteWorkingHoursByMaster", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chain.where.mockReturnValue(chain);
  });

  it("returns true when rows are deleted", async () => {
    chain.delete.mockResolvedValue(2);
    const result = await deleteWorkingHoursByMaster(1);
    expect(result).toBe(true);
    expect(chain.where).toHaveBeenCalledWith({ master_id: 1 });
  });

  it("returns false when no rows are deleted", async () => {
    chain.delete.mockResolvedValue(0);
    const result = await deleteWorkingHoursByMaster(99);
    expect(result).toBe(false);
  });
});
