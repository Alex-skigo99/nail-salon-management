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

  const trx: any = Object.assign(vi.fn().mockReturnValue(chain), {
    commit: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined),
  });
  // make trx proxy chain methods so trx(table).where(...) works
  trx.mockReturnValue(chain);

  const fn: any = Object.assign(vi.fn().mockReturnValue(chain), {
    fn: { now: vi.fn().mockReturnValue("now()") },
    transaction: vi.fn().mockResolvedValue(trx),
  });
  return { mockKnex: fn, chain };
});

vi.mock("../../lib/db", () => ({ knex: mockKnex }));

// ─── Mock AWS Scheduler ───────────────────────────────────────────────────────

const mockSend = vi.hoisted(() => vi.fn());

vi.mock("@aws-sdk/client-scheduler", () => {
  class ResourceNotFoundException extends Error {
    constructor() {
      super("Resource not found");
      this.name = "ResourceNotFoundException";
    }
  }
  return {
    SchedulerClient: vi.fn().mockImplementation(function () {
      return { send: mockSend };
    }),
    CreateScheduleCommand: vi.fn().mockImplementation(function (this: any, input: any) {
      this.input = input;
    }),
    UpdateScheduleCommand: vi.fn().mockImplementation(function (this: any, input: any) {
      this.input = input;
    }),
    GetScheduleCommand: vi.fn().mockImplementation(function (this: any, input: any) {
      this.input = input;
    }),
    ResourceNotFoundException,
  };
});

// ─── Imports ──────────────────────────────────────────────────────────────────

import { getAllSettings, getSettingByKey, updateSetting, syncReminderScheduler } from "../../services/settingsService";
import {
  CreateScheduleCommand,
  UpdateScheduleCommand,
  GetScheduleCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-scheduler";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockSetting = {
  id: 1,
  key: "slot_duration",
  value: "30",
  description: "Duration of a single time slot in minutes",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockReminderTimeSetting = {
  ...mockSetting,
  key: "reminding_time",
  value: "09:00",
};

const mockReminderBeforeSetting = {
  ...mockSetting,
  key: "reminding_before",
  value: "1",
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

  it("calls syncReminderScheduler when reminding_before is updated", async () => {
    const updated = { ...mockSetting, key: "reminding_before", value: "3" };
    chain.returning.mockResolvedValue([updated]);
    chain.first.mockResolvedValue(mockReminderTimeSetting);
    mockSend.mockResolvedValue({});

    await updateSetting("reminding_before", "3");

    expect(mockSend).toHaveBeenCalled();
  });

  it("calls syncReminderScheduler when reminding_time is updated", async () => {
    const updated = { ...mockSetting, key: "reminding_time", value: "10:30" };
    chain.returning.mockResolvedValue([updated]);
    chain.first.mockResolvedValue(mockReminderBeforeSetting);
    mockSend.mockResolvedValue({});

    await updateSetting("reminding_time", "10:30");

    expect(mockSend).toHaveBeenCalled();
  });

  it("does not call syncReminderScheduler for unrelated keys", async () => {
    const updated = { ...mockSetting, value: "45" };
    chain.returning.mockResolvedValue([updated]);

    await updateSetting("slot_duration", "45");

    expect(mockSend).not.toHaveBeenCalled();
  });

  it("does not call syncReminderScheduler when update returns nothing", async () => {
    chain.returning.mockResolvedValue([]);

    await updateSetting("reminding_before", "3");

    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe("syncReminderScheduler", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a new schedule when none exists", async () => {
    mockSend.mockRejectedValueOnce(new (ResourceNotFoundException as any)()).mockResolvedValueOnce({});

    await syncReminderScheduler({ reminderBefore: 1, reminderTime: "09:00" });

    expect(CreateScheduleCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        ScheduleExpression: "cron(00 09 * * ? *)",
        State: "ENABLED",
      })
    );
    expect(UpdateScheduleCommand).not.toHaveBeenCalled();
  });

  it("updates an existing schedule", async () => {
    mockSend
      .mockResolvedValueOnce({}) // GetScheduleCommand → found
      .mockResolvedValueOnce({}); // UpdateScheduleCommand

    await syncReminderScheduler({ reminderBefore: 5, reminderTime: "18:30" });

    expect(UpdateScheduleCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        ScheduleExpression: "cron(30 18 * * ? *)",
        State: "ENABLED",
      })
    );
    expect(CreateScheduleCommand).not.toHaveBeenCalled();
  });

  it("sets state to DISABLED when reminderBefore is 0", async () => {
    mockSend
      .mockResolvedValueOnce({}) // GetScheduleCommand → found
      .mockResolvedValueOnce({});

    await syncReminderScheduler({ reminderBefore: 0, reminderTime: "09:00" });

    expect(UpdateScheduleCommand).toHaveBeenCalledWith(expect.objectContaining({ State: "DISABLED" }));
  });

  it("passes reminderBefore in Target.Input", async () => {
    mockSend.mockResolvedValueOnce({}).mockResolvedValueOnce({});

    await syncReminderScheduler({ reminderBefore: 3, reminderTime: "09:00" });

    expect(UpdateScheduleCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Target: expect.objectContaining({
          Input: JSON.stringify({ reminderBefore: 3 }),
        }),
      })
    );
  });

  it("includes _NODE_ENV suffix in scheduler name", async () => {
    process.env.NODE_ENV = "test";
    mockSend.mockResolvedValue({});

    await syncReminderScheduler({ reminderBefore: 1, reminderTime: "09:00" });

    const firstCall = (GetScheduleCommand as any).mock.calls[0][0];
    expect(firstCall.Name).toMatch(/_test$/);
  });

  it("creates schedule with DISABLED state when reminderBefore is 0 and schedule does not exist", async () => {
    mockSend.mockRejectedValueOnce(new (ResourceNotFoundException as any)()).mockResolvedValueOnce({});

    await syncReminderScheduler({ reminderBefore: 0, reminderTime: "09:00" });

    expect(CreateScheduleCommand).toHaveBeenCalledWith(expect.objectContaining({ State: "DISABLED" }));
  });

  it("re-throws unexpected errors from GetScheduleCommand", async () => {
    mockSend.mockRejectedValueOnce(new Error("Network error"));

    await expect(syncReminderScheduler({ reminderBefore: 1, reminderTime: "09:00" })).rejects.toThrow("Network error");
  });
});
