/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock knex ────────────────────────────────────────────────────────────────

const { mockKnex, chain } = vi.hoisted(() => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
    where: vi.fn(),
    first: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    returning: vi.fn().mockResolvedValue([]),
    orderBy: vi.fn(),
  };

  chain.where.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);

  const fn: any = Object.assign(vi.fn().mockReturnValue(chain), { fn: { now: vi.fn().mockReturnValue("now()") } });
  return { mockKnex: fn, chain };
});

vi.mock("../../lib/db", () => ({ knex: mockKnex }));

// ─── Imports ──────────────────────────────────────────────────────────────────

import { getAllSettings, getSettingByKey, updateSetting } from "../../services/settingsService";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockSetting = {
  id: 1,
  key: "slot_duration",
  value: "30",
  description: "Duration of a single time slot in minutes",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getAllSettings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all settings ordered by key", async () => {
    chain.orderBy.mockResolvedValue([mockSetting]);
    const result = await getAllSettings();
    expect(result).toEqual([mockSetting]);
    expect(mockKnex).toHaveBeenCalledWith("settings");
  });
});

describe("getSettingByKey", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a single setting by key", async () => {
    chain.first.mockResolvedValue(mockSetting);
    const result = await getSettingByKey("slot_duration");
    expect(result).toEqual(mockSetting);
  });

  it("returns undefined when key not found", async () => {
    chain.first.mockResolvedValue(undefined);
    const result = await getSettingByKey("nonexistent");
    expect(result).toBeUndefined();
  });
});

describe("updateSetting", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates a setting and returns it", async () => {
    const updated = { ...mockSetting, value: "45" };
    chain.returning.mockResolvedValue([updated]);
    const result = await updateSetting("slot_duration", "45");
    expect(result).toEqual(updated);
  });

  it("returns null when setting does not exist", async () => {
    chain.returning.mockResolvedValue([]);
    const result = await updateSetting("nonexistent", "100");
    expect(result).toBeNull();
  });
});
