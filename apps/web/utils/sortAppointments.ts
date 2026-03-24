import type { Appointment } from "@/types/appointmentTypes";

type SortOption = "asc" | "desc";

export function sortAppointments<T extends Appointment>(appointments: T[], sortOption: SortOption = "asc"): T[] {
  return [...appointments].sort((a, b) => {
    const dateA = new Date(a.date);
    const [hoursA, minutesA] = a.time.split(":").map(Number);
    dateA.setHours(hoursA, minutesA, 0, 0);

    const dateB = new Date(b.date);
    const [hoursB, minutesB] = b.time.split(":").map(Number);
    dateB.setHours(hoursB, minutesB, 0, 0);

    if (sortOption === "asc") {
      return dateA.getTime() - dateB.getTime();
    } else {
      return dateB.getTime() - dateA.getTime();
    }
  });
}
