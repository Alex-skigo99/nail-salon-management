"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { HistoryTable } from "@/components/tables/HistoryTable";
import { cn } from "@/lib/utils";

type HistoryPageProps = {
  isMobile: boolean;
};

export default function HistoryPage({ isMobile }: HistoryPageProps) {
  const { data: session } = useSession();
  const t = useTranslations("clientPage.history");
  const userId = session?.user?.id;

  const translations = {
    date: t("date"),
    time: t("time"),
    master: t("master"),
    duration: t("duration"),
    minutes: t("minutes"),
    services: t("services"),
    status: t("status"),
    comments: t("comments"),
  };

  return (
    <div className={cn(!isMobile && "rounded-4xl border-2 border-blue-100 bg-blue-50/50 p-6")}>
      <h2 className="mb-4 text-xl font-semibold">{t("title")}</h2>
      <HistoryTable
        userId={userId}
        isMobile={isMobile}
        noResultsMessage={t("noHistory")}
        translations={translations}
        headerClass="bg-blue-50/50"
        cellClass="bg-blue-50/50"
      />
    </div>
  );
}
