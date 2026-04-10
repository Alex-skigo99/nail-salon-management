"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowDownAZ, ArrowDownZA, ArrowDown, Funnel } from "lucide-react";
import type { AppointmentRetrieveFull } from "@/types/appointmentTypes";
import type { Master } from "@/types/masterTypes";
import { TruncatedText } from "@/components/elements/TruncatedText";
import { StatusBadge } from "@/app/admin/calendar/_components/StatusBadge";
import { formatTimeToHHMM } from "@/utils/formatTime";
import { getCreatedAtString, formatDateForInput } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";

export function appointmentsColumns(
  masters: Master[],
  sort?: string,
  activeFilters?: { status?: string; master_id?: number; hasDateFilter?: boolean }
): ColumnDef<AppointmentRetrieveFull, unknown>[] {
  return [
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span className={cn(activeFilters?.status && "text-primary font-medium")}>Status</span>
          {activeFilters?.status && <Funnel className="text-primary h-4 w-4" />}
        </div>
      ),
      size: 100,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span className={cn((sort === "date_desc" || activeFilters?.hasDateFilter) && "text-primary font-medium")}>
            Date
          </span>
          {(sort === "date_desc" || activeFilters?.hasDateFilter) && <Funnel className="text-primary h-4 w-4" />}
          {sort === "date_desc" && !activeFilters?.hasDateFilter && <ArrowDown className="text-primary h-4 w-4" />}
        </div>
      ),
      size: 110,
      cell: ({ row }) => <span className="font-mono text-xs">{formatDateForInput(row.original.date)}</span>,
    },
    {
      accessorKey: "time",
      header: "Time",
      size: 80,
      cell: ({ row }) => <span className="font-mono text-xs">{formatTimeToHHMM(row.original.time)}</span>,
    },
    {
      accessorKey: "duration_minutes",
      header: "Dur.",
      size: 60,
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.duration_minutes}m</span>,
    },
    {
      accessorKey: "services",
      header: "Services",
      size: 150,
      cell: ({ row }) => <TruncatedText text={row.original.services} />,
    },
    {
      id: "client_type",
      header: "Client",
      size: 80,
      cell: ({ row }) =>
        row.original.user_id ? (
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">User</span>
        ) : row.original.guest_name ? (
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">Guest</span>
        ) : null,
    },
    {
      id: "client_name",
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span className={cn((sort === "username_asc" || sort === "username_desc") && "text-primary font-medium")}>
            Name
          </span>
          {sort === "username_asc" && <ArrowDownAZ className="text-primary h-4 w-4" />}
          {sort === "username_desc" && <ArrowDownZA className="text-primary h-4 w-4" />}
        </div>
      ),
      size: 140,
      cell: ({ row }) => <TruncatedText text={row.original.user_data?.name ?? row.original.guest_name} />,
    },
    {
      id: "phone",
      header: "Phone",
      size: 120,
      cell: ({ row }) => (
        <TruncatedText text={row.original.user_data?.phone ?? row.original.guest_phone} isTooltipDisabled />
      ),
    },
    {
      id: "master_name",
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span className={cn(activeFilters?.master_id && "text-primary font-medium")}>Master</span>
          {activeFilters?.master_id && <Funnel className="text-primary h-4 w-4" />}
        </div>
      ),
      size: 120,
      cell: ({ row }) => {
        const master = masters.find((m) => m.id === row.original.master_id);
        return <TruncatedText text={master?.name ?? row.original.master_data?.name} />;
      },
    },
    {
      accessorKey: "comments",
      header: "Comments",
      size: 150,
      cell: ({ row }) => <TruncatedText text={row.original.comments} />,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span className={cn(sort === "created_desc" && "text-primary font-medium")}>Created</span>
          {sort === "created_desc" && <ArrowDown className="text-primary h-4 w-4" />}
        </div>
      ),
      size: 130,
      cell: ({ row }) => <TruncatedText text={getCreatedAtString(row.original.created_at)} isTooltipDisabled />,
    },
  ];
}
