import { isPastTimeSlot } from "@/utils/isPastTimeSlot";
import type { SelectedSlot } from "@/types/appointmentTypes";

const makeSlot = (date: string, time: string): SelectedSlot => ({
  id: "test-id",
  master: { id: 1, name: "Test Master" },
  date,
  time,
});

describe("isPastTimeSlot", () => {
  const TODAY = "2026-03-25";
  const PAST_DATE = "2026-03-20";
  const FUTURE_DATE = "2026-03-30";

  beforeEach(() => {
    // Fix "now" to 2026-03-25 14:30
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-25T14:30:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("when the slot is on a past date", () => {
    it("returns true", () => {
      expect(isPastTimeSlot(makeSlot(PAST_DATE, "09:00"))).toBe(true);
    });

    it("returns true even for a future time", () => {
      expect(isPastTimeSlot(makeSlot(PAST_DATE, "23:59"))).toBe(true);
    });
  });

  describe("when the slot is on today", () => {
    it("returns true for a time equal to the current time", () => {
      expect(isPastTimeSlot(makeSlot(TODAY, "14:30"))).toBe(true);
    });

    it("returns true for a time before the current time", () => {
      expect(isPastTimeSlot(makeSlot(TODAY, "09:00"))).toBe(true);
    });

    it("returns true for one minute before the current time", () => {
      expect(isPastTimeSlot(makeSlot(TODAY, "14:29"))).toBe(true);
    });

    it("returns false for a time after the current time", () => {
      expect(isPastTimeSlot(makeSlot(TODAY, "15:00"))).toBe(false);
    });

    it("returns false for one minute after the current time", () => {
      expect(isPastTimeSlot(makeSlot(TODAY, "14:31"))).toBe(false);
    });

    it("returns false for the last slot of the day", () => {
      expect(isPastTimeSlot(makeSlot(TODAY, "23:59"))).toBe(false);
    });

    it("returns true for the first slot of the day when time has passed", () => {
      expect(isPastTimeSlot(makeSlot(TODAY, "00:00"))).toBe(true);
    });
  });

  describe("when the slot is on a future date", () => {
    it("returns false", () => {
      expect(isPastTimeSlot(makeSlot(FUTURE_DATE, "09:00"))).toBe(false);
    });

    it("returns false for any time on a future date", () => {
      expect(isPastTimeSlot(makeSlot(FUTURE_DATE, "00:00"))).toBe(false);
    });
  });
});
