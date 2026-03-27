"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import type { UserListItem } from "@/types/userTypes";
import type { Master } from "@/types/masterTypes";
import { getAppointmentDateString } from "@/utils/dateUtils";
import { GoogleIcon } from "@/components/icons/GoogleIcon";

export function usersColumns(masters: Master[]): ColumnDef<UserListItem, unknown>[] {
  return [
    {
      id: "image",
      header: "",
      size: 40,
      cell: ({ row }) => {
        const user = row.original;
        return user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            width={28}
            height={28}
            className="rounded-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="bg-muted text-muted-foreground flex h-7 w-7 items-center justify-center rounded-full">
            <UserIcon className="h-3.5 w-3.5" />
          </span>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      size: 150,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ getValue }) => {
        const email = getValue() as string | null;
        return email ? (
          <span className="block truncate text-sm" title={email}>
            {email}
          </span>
        ) : (
          "—"
        );
      },
      size: 200,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      size: 130,
      cell: ({ getValue }) => (getValue() as string | null) ?? "—",
    },
    {
      accessorKey: "role",
      header: "Role",
      size: 90,
      cell: ({ getValue }) => {
        const role = getValue() as string;
        return (
          <Badge variant={role === "ADMIN" ? "default" : "secondary"} className="text-xs">
            {role}
          </Badge>
        );
      },
    },
    {
      id: "master",
      header: "Master",
      size: 120,
      accessorFn: (row) => row.master_id ?? null,
      cell: ({ row }) => {
        const masterId = row.original.master_id;
        if (!masterId) return "—";
        const master = masters.find((m) => m.id === masterId);
        return master ? master.name : `#${masterId}`;
      },
    },
    {
      accessorKey: "appts_count",
      header: "Appts",
      size: 70,
    },
    {
      accessorKey: "last_appts",
      header: "Last Appt",
      size: 110,
      cell: ({ getValue }) => {
        const val = getValue() as string | null;
        if (!val) return "—";
        return <span className="text-xs">{getAppointmentDateString(val)}</span>;
      },
    },
    {
      accessorKey: "is_google_auth",
      header: "Auth",
      size: 40,
      cell: ({ getValue }) => {
        const isGoogle = getValue() as boolean;
        return isGoogle ? (
          <GoogleIcon className="size-4" />
        ) : (
          <span className="bg-muted text-muted-foreground flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold">
            PW
          </span>
        );
      },
    },
  ];
}
