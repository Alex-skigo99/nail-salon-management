"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "back", path: "/home" },
  { id: "appointments", path: "/client/appointments" },
  { id: "history", path: "/client/history" },
  { id: "profile", path: "/client/profile" },
  { id: "feedback", path: "/client/feedback" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function ClientNav() {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const t = useTranslations("clientPage.nav");

  const labelMap: Record<TabId, string> = {
    back: t("backToMain"),
    appointments: t("activeAppointments"),
    history: t("history"),
    profile: t("profile"),
    feedback: t("feedback"),
  };

  const isActive = (tabId: TabId, path: string) => {
    if (tabId === "back") return false;
    return pathname === path || (tabId === "appointments" && pathname === "/client");
  };

  return (
    <nav className={cn("flex w-full gap-2", isMobile ? "flex-wrap justify-end" : "")}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => router.push(tab.path)}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-colors first:mr-auto",
            isActive(tab.id, tab.path) ? "bg-pink-200 text-pink-900" : "bg-pink-50 text-pink-700 hover:bg-pink-100",
            isMobile && "px-3 py-1.5 text-xs"
          )}
        >
          {labelMap[tab.id]}
        </button>
      ))}
    </nav>
  );
}
