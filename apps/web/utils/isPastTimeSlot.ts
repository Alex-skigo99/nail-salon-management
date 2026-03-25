import { compareTimes, isSameDay } from "@/utils/dateUtils";
import type { SelectedSlot } from "@/types/appointmentTypes";

export function isPastTimeSlot(selectedSlot: SelectedSlot): boolean {
  if (isSameDay(new Date(selectedSlot.date), new Date())) {
    const currentTime = new Date()
      .toLocaleString("en-CA", { hour: "2-digit", minute: "2-digit", hour12: false })
      .slice(0, 5);
    return compareTimes(selectedSlot.time, currentTime) <= 0;
  }
  return true;
}
