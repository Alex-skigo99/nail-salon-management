import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock knex ────────────────────────────────────────────────────────────────
// The appointmentService queries multiple tables via chained knex calls.
// We build chain/trxChain objects with all needed methods, and reset them in a
// top-level beforeEach using vi.resetAllMocks() to prevent cross-test queue bleed.

const { mockKnex, chain, trxChain } = vi.hoisted(() => {
  const makeChain = (): Record<string, ReturnType<typeof vi.fn>> => ({
    select: vi.fn(),
    where: vi.fn(),
    whereNot: vi.fn(),
    whereBetween: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    returning: vi.fn(),
    first: vi.fn(),
    leftJoin: vi.fn(),
    orderBy: vi.fn(),
  });

  const chain = makeChain();
  const trxChain = makeChain();
  const mockKnex = Object.assign(vi.fn(), {
    fn: { now: vi.fn(() => "NOW()") },
    raw: vi.fn((sql: string) => sql),
    transaction: vi.fn(),
  });

  return { mockKnex, chain, trxChain };
});

vi.mock("../../lib/db", () => ({ knex: mockKnex }));

// ─── Imports (after mock) ─────────────────────────────────────────────────────

import {
  createAppointment,
  updateAppointment,
  rescheduleAppointment,
  deleteAppointment,
  getAppointmentsForMaster,
} from "../../services/appointmentService";

// ─── Shared setup ─────────────────────────────────────────────────────────────

/**
 * Reset all mocks and re-establish chain method defaults before every test.
 * Using resetAllMocks() clears both call history AND mockReturnValueOnce queues,
 * preventing state from leaking between tests.
 */
beforeEach(() => {
  vi.resetAllMocks();

  // Restore chain method chaining
  for (const key of ["where", "whereNot", "whereBetween", "select", "leftJoin", "insert", "update"]) {
    chain[key].mockReturnValue(chain);
    trxChain[key].mockReturnValue(trxChain);
  }
  // Default return values
  chain.first.mockResolvedValue(undefined);
  chain.delete.mockResolvedValue(0);
  chain.returning.mockResolvedValue([]);
  trxChain.returning.mockResolvedValue([]);

  mockKnex.mockReturnValue(chain);
  mockKnex.fn.now.mockReturnValue("NOW()");
  mockKnex.raw.mockImplementation((sql: string) => sql);
  mockKnex.transaction.mockImplementation(async (cb: (trx: unknown) => unknown) =>
    cb(Object.assign(vi.fn().mockReturnValue(trxChain)))
  );
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockWorkingHours = {
  master_id: 1,
  day_of_week: 2, // 2026-04-14 is a Tuesday (getUTCDay() === 2)
  start_time: "09:00",
  end_time: "18:00",
};

const mockAppointment = {
  id: 1,
  master_id: 1,
  user_id: null,
  guest_name: "John Doe",
  guest_phone: null,
  date: "2026-04-14",
  time: "10:00:00",
  duration_minutes: 60,
  services: "Manicure",
  comments: null,
  status: "new" as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const createInput = {
  master_id: 1,
  date: "2026-04-14",
  time: "10:00",
  duration_minutes: 60,
};

// ─── createAppointment ────────────────────────────────────────────────────────

describe("createAppointment", () => {
  it("creates appointment when slot is available", async () => {
    // isSlotAvailable: working_hours found → slot within hours, no conflicts
    chain.first.mockResolvedValueOnce(mockWorkingHours);
    chain.whereNot.mockReturnValue({ ...chain, then: (resolve: (v: unknown[]) => void) => resolve([]) });

    // transaction insert
    trxChain.returning.mockResolvedValue([mockAppointment]);

    const result = await createAppointment(createInput);

    expect(result).toEqual(mockAppointment);
    expect(mockKnex.transaction).toHaveBeenCalled();
  });

  it("throws SLOT_UNAVAILABLE when no working hours exist for that day", async () => {
    chain.first.mockResolvedValue(undefined); // no working hours row

    await expect(createAppointment(createInput)).rejects.toThrow("SLOT_UNAVAILABLE");
  });

  it("throws SLOT_UNAVAILABLE when slot conflicts with an existing appointment", async () => {
    const conflictingAppt = { ...mockAppointment, time: "10:00", duration_minutes: 120 };

    chain.first.mockResolvedValueOnce(mockWorkingHours);
    chain.whereNot.mockReturnValue({
      ...chain,
      then: (resolve: (v: unknown[]) => void) => resolve([conflictingAppt]),
    });

    await expect(createAppointment(createInput)).rejects.toThrow("SLOT_UNAVAILABLE");
  });
});

// ─── updateAppointment ────────────────────────────────────────────────────────

describe("updateAppointment", () => {
  it("updates and returns the appointment", async () => {
    const updated = { ...mockAppointment, status: "confirmed" };
    chain.update.mockReturnValue(chain);
    chain.returning.mockResolvedValue([updated]);

    const result = await updateAppointment(1, { status: "confirmed" });

    expect(result).toEqual(updated);
    expect(chain.where).toHaveBeenCalledWith({ id: 1 });
  });

  it("returns null when appointment not found", async () => {
    chain.update.mockReturnValue(chain);
    chain.returning.mockResolvedValue([]);

    const result = await updateAppointment(999, { status: "confirmed" });

    expect(result).toBeNull();
  });
});

// ─── rescheduleAppointment ────────────────────────────────────────────────────

describe("rescheduleAppointment", () => {
  it("throws APPOINTMENT_NOT_FOUND when appointment does not exist", async () => {
    chain.first.mockResolvedValue(undefined);

    await expect(rescheduleAppointment(999, { date: "2026-04-15", time: "11:00" })).rejects.toThrow(
      "APPOINTMENT_NOT_FOUND"
    );
  });

  it("reschedules appointment when slot is available", async () => {
    const rescheduled = { ...mockAppointment, date: "2026-04-14", time: "11:00:00" };

    chain.first
      .mockResolvedValueOnce(mockAppointment) // fetch existing
      .mockResolvedValueOnce(mockWorkingHours); // working hours in isSlotAvailable

    // No conflicting appointments
    chain.whereNot.mockReturnValue({ ...chain, then: (resolve: (v: unknown[]) => void) => resolve([]) });

    chain.update.mockReturnValue(chain);
    chain.returning.mockResolvedValue([rescheduled]);

    const result = await rescheduleAppointment(1, { date: "2026-04-14", time: "11:00" });

    expect(result).toEqual(rescheduled);
  });

  it("throws SLOT_UNAVAILABLE when new slot has no working hours", async () => {
    chain.first
      .mockResolvedValueOnce(mockAppointment) // existing appointment
      .mockResolvedValueOnce(undefined); // no working hours for target day

    await expect(rescheduleAppointment(1, { date: "2026-04-15", time: "08:00" })).rejects.toThrow("SLOT_UNAVAILABLE");
  });
});

// ─── deleteAppointment ────────────────────────────────────────────────────────

describe("deleteAppointment", () => {
  it("returns true when a row is deleted", async () => {
    chain.delete.mockResolvedValue(1);

    const result = await deleteAppointment(1);

    expect(result).toBe(true);
    expect(chain.where).toHaveBeenCalledWith({ id: 1 });
  });

  it("returns false when no row is deleted", async () => {
    chain.delete.mockResolvedValue(0);

    const result = await deleteAppointment(999);

    expect(result).toBe(false);
  });
});

// ─── getAppointmentsForMaster ─────────────────────────────────────────────────

describe("getAppointmentsForMaster", () => {
  it("returns appointments for a master in a date range", async () => {
    // The service calls .orderBy() twice; first returns chain, second resolves data
    chain.orderBy.mockReturnValueOnce(chain).mockResolvedValue([mockAppointment]);

    const result = await getAppointmentsForMaster(1, "2026-04-01", "2026-04-30");

    expect(result).toEqual([mockAppointment]);
  });

  it("returns empty array when no appointments exist in range", async () => {
    chain.orderBy.mockReturnValueOnce(chain).mockResolvedValue([]);

    const result = await getAppointmentsForMaster(1, "2026-04-01", "2026-04-30");

    expect(result).toEqual([]);
  });
});
