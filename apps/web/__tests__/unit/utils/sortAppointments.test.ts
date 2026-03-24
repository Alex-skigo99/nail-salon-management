import { sortAppointments } from "@/utils/sortAppointments";
import type { Appointment } from "@/types/appointmentTypes";

describe("sortAppointments", () => {
  const base = (overrides: Partial<Appointment>): Appointment => ({
    id: 0,
    master_id: 1,
    user_id: null,
    guest_name: null,
    guest_phone: null,
    date: "2026-03-24",
    time: "09:00",
    duration_minutes: 60,
    status: "new",
    services: null,
    comments: null,
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    ...overrides,
  });

  it("sorts ascending by date+time", () => {
    const items = [
      base({ id: 1, date: "2026-03-24", time: "10:00" }),
      base({ id: 2, date: "2026-03-23", time: "12:00" }),
      base({ id: 3, date: "2026-03-24", time: "08:30" }),
    ];

    const sorted = sortAppointments(items, "asc");

    expect(sorted.map((s) => s.id)).toEqual([2, 3, 1]);
  });

  it("sorts descending by date+time", () => {
    const items = [
      base({ id: 1, date: "2026-03-24", time: "10:00" }),
      base({ id: 2, date: "2026-03-23", time: "12:00" }),
      base({ id: 3, date: "2026-03-24", time: "08:30" }),
    ];

    const sorted = sortAppointments(items, "desc");

    expect(sorted.map((s) => s.id)).toEqual([1, 3, 2]);
  });
});
