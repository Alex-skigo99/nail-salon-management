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
