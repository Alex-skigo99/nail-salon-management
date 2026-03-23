"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { PaginationState, ColumnDef } from "@tanstack/react-table";
import { useUserAppointments } from "@/hooks/useAppointments";
import GeneralTable from "@/components/tables/GeneralTable";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentRetrieveOfUser } from "@/types/appointmentTypes";
import { STATUS_COLORS } from "@/types/appointmentTypes";

type HistoryPageProps = {
  isMobile: boolean;
};

export default function HistoryPage({ isMobile }: HistoryPageProps) {
  const { data: session } = useSession();
  const t = useTranslations("clientPage.history");
  const userId = session?.user?.id;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isPending } = useUserAppointments(userId, {
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  });

  const columns: ColumnDef<AppointmentRetrieveOfUser>[] = [
    {
      accessorKey: "date",
      header: t("date"),
      size: isMobile ? 90 : 110,
    },
    {
      accessorKey: "time",
      header: t("time"),
      size: 70,
      cell: ({ getValue }) => (getValue() as string)?.slice(0, 5),
    },
    {
      id: "master",
      header: t("master"),
      size: isMobile ? 80 : 120,
      accessorFn: (row) => row.master_data?.name ?? "—",
    },
    {
      accessorKey: "duration_minutes",
      header: t("duration"),
      size: 70,
      cell: ({ getValue }) => `${getValue()} ${t("minutes")}`,
    },
    ...(!isMobile
      ? [
          {
            accessorKey: "services" as const,
            header: t("services"),
            size: 150,
            cell: ({ getValue }: { getValue: () => unknown }) => (getValue() as string | null) || "—",
          },
        ]
      : []),
    {
      accessorKey: "status",
      header: t("status"),
      size: 90,
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return <Badge className={cn(STATUS_COLORS[status as keyof typeof STATUS_COLORS], "text-xs")}>{status}</Badge>;
      },
    },
    ...(!isMobile
      ? [
          {
            accessorKey: "comments" as const,
            header: t("comments"),
            size: 160,
            cell: ({ getValue }: { getValue: () => unknown }) => (getValue() as string | null) || "—",
          },
        ]
      : []),
  ];

  return (
    <div className={cn(isMobile ? "" : "rounded-4xl border-2 border-blue-100 bg-blue-50 p-6")}>
      <h2 className="mb-4 text-xl font-semibold">{t("title")}</h2>
      <GeneralTable<AppointmentRetrieveOfUser, AppointmentRetrieveOfUser, unknown>
        columns={columns}
        data={data?.data ?? []}
        isPending={isPending}
        customNoResultsMessage={t("noHistory")}
        isPaginationNeeded
        pagination={pagination}
        setPagination={setPagination}
        totalRows={data?.pagination?.total ?? 0}
        headerClass="bg-blue-50"
      />
    </div>
  );
}
