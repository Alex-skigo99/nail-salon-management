/**
 * Calendar date utilities – all weeks run Sunday → Saturday.
 */

/** Return the Sunday that starts the week containing `date`. */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Sunday = 0
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Return the Saturday that ends the week containing `date`. */
export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

/** Format a Date as YYYY-MM-DD. */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Short display: "Mar 9" */
export function formatShortDate(date: Date, monthFormat: "short" | "long" = "short"): string {
  return date.toLocaleDateString("en-US", { month: monthFormat, day: "numeric" });
}

/** "Mar 9 – Mar 15, 2026" style range label */
export function formatWeekRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const s = start.toLocaleDateString("en-US", opts);
  const e = end.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  return `${s} – ${e}`;
}

/** "March 2026" */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Get the first day of the month. */
export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Get the last day of the month. */
export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** Return all weeks (Sun-Sat rows) that overlap the given month. */
export function getMonthWeeks(date: Date): { start: Date; end: Date }[] {
  const first = getMonthStart(date);
  const last = getMonthEnd(date);
  const weeks: { start: Date; end: Date }[] = [];

  let cursor = getWeekStart(first);
  while (cursor <= last) {
    const end = getWeekEnd(cursor);
    weeks.push({ start: new Date(cursor), end: new Date(end) });
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + 7);
  }
  return weeks;
}

/** Get array of 7 dates for a week starting at `start`. */
export function getWeekDays(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/** Check if a date string (YYYY-MM-DD) is in the past relative to today. */
export function isPastDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return d < today;
}

/** Check if two dates are the same day. */
export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Parse a YYYY-MM-DD string into a local Date. */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Helper to ensure date is in YYYY-MM-DD format for HTML date input (using local time, not UTC)
export function formatDateForInput(dateStr: string): string {
  // If already in YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Try to parse and reformat using local time
  try {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
}

/** Format YYYY-MM-DD → Date, and shift by `days`. Returns YYYY-MM-DD string. */
export function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Today as YYYY-MM-DD */
export function todayStr(): string {
  return shiftDate(new Date().toISOString().slice(0, 10), 0);
}

/** Get created at string in YYYY-MM-DD hh:mm format */
export function getCreatedAtString(date: string | null | undefined): string | null {
  return date
    ? new Date(date)
        .toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(",", "")
    : null;
}
