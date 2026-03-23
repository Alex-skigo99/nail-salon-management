"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type ClientTab = "back" | "appointments" | "history" | "profile" | "feedback";

type ClientNavProps = {
  activeTab: ClientTab;
  onTabChange: (tab: ClientTab) => void;
  isMobile: boolean;
};

const tabs: ClientTab[] = ["back", "appointments", "history", "profile", "feedback"];

export default function ClientNav({ activeTab, onTabChange, isMobile }: ClientNavProps) {
  const t = useTranslations("clientPage.nav");

  const labelMap: Record<ClientTab, string> = {
    back: t("backToMain"),
    appointments: t("activeAppointments"),
    history: t("history"),
    profile: t("profile"),
    feedback: t("feedback"),
  };

  return (
    <nav className={cn("flex gap-2", isMobile ? "flex-wrap justify-center" : "justify-center")}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-colors",
            tab === activeTab ? "bg-pink-200 text-pink-900" : "bg-pink-50 text-pink-700 hover:bg-pink-100",
            isMobile && "px-3 py-1.5 text-xs"
          )}
        >
          {labelMap[tab]}
        </button>
      ))}
    </nav>
  );
}
