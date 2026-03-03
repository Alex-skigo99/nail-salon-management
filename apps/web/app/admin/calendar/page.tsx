"use client";

import CalendarPage from "./CalendarPage";
import { useTranslations } from "next-intl";

export default function Dashboard() {
  const t = useTranslations("home");

  return (
    <div className="flex-1 p-8">
      <CalendarPage />
    </div>
  );
}
