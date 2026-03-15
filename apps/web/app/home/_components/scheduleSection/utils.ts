import { isSameDay } from "@/utils/dateUtils";
import type { useTranslations } from "next-intl";

export function formatDateLabel(date: string, t: ReturnType<typeof useTranslations>): string {
  const d = new Date(date);
  const label = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const today = new Date();

  if (isSameDay(d, today)) return `${label} (${t("today")})`;
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (isSameDay(d, tomorrow)) return `${label} (${t("tomorrow")})`;

  return label;
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
