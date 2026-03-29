"use client";

import { useState } from "react";
import { PaginationState, ColumnDef } from "@tanstack/react-table";
import { useUserAppointments } from "@/hooks/useAppointments";
import GeneralTable from "@/components/tables/GeneralTable";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentRetrieveOfUser } from "@/types/appointmentTypes";
import { STATUS_COLORS } from "@/types/appointmentTypes";
import { getAppointmentDateString } from "@/utils/dateUtils";

type HistoryTableProps = {
  userId: string | undefined;
  isMobile: boolean;
  noResultsMessage?: string;
  translations: {
    date: string;
    time: string;
    master: string;
    duration: string;
    minutes: string;
    services: string;
    status: string;
    comments: string;
  };
  headerClass?: string;
  cellClass?: string;
};

export function HistoryTable({
  userId,
  isMobile,
  noResultsMessage,
  translations: t,
  headerClass,
  cellClass,
}: HistoryTableProps) {
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
      header: t.date,
      cell: ({ getValue }) => getAppointmentDateString(getValue() as string),
      size: isMobile ? 90 : 110,
    },
    {
      accessorKey: "time",
      header: t.time,
      size: 70,
      cell: ({ getValue }) => (getValue() as string)?.slice(0, 5),
    },
    {
      id: "master",
      header: t.master,
      size: isMobile ? 80 : 120,
      accessorFn: (row) => row.master_data?.name ?? "—",
    },
    {
      accessorKey: "duration_minutes",
      header: t.duration,
      size: 70,
      cell: ({ getValue }) => `${getValue()} ${t.minutes}`,
    },
    ...(!isMobile
      ? [
          {
            accessorKey: "services" as const,
            header: t.services,
            size: 150,
            cell: ({ getValue }: { getValue: () => unknown }) => (getValue() as string | null) || "—",
          },
        ]
      : []),
    {
      accessorKey: "status",
      header: t.status,
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
            header: t.comments,
            size: 160,
            cell: ({ getValue }: { getValue: () => unknown }) => (getValue() as string | null) || "—",
          },
        ]
      : []),
  ];

  return (
    <GeneralTable<AppointmentRetrieveOfUser, AppointmentRetrieveOfUser, unknown>
      columns={columns}
      data={data?.data ?? []}
      isPending={isPending}
      customNoResultsMessage={noResultsMessage}
      isPaginationNeeded
      pagination={pagination}
      setPagination={setPagination}
      totalRows={data?.pagination?.total ?? 0}
      headerClass={headerClass}
      cellClass={cellClass}
    />
  );
}
