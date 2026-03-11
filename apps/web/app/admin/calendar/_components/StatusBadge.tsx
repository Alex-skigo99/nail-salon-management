"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SlotStatus, AppointmentStatus } from "@/types/appointmentTypes";
import { STATUS_COLORS } from "@/types/appointmentTypes";

type StatusBadgeProps = {
  status: SlotStatus | AppointmentStatus;
  className?: string;
};

const LABELS: Record<SlotStatus | AppointmentStatus, string> = {
  empty: "Empty",
  reserved: "Reserved",
  none: "Off",
  part_book: "Partial",
  book: "Booked",
  new: "New",
  confirmed: "Confirmed",
  pending: "Pending",
  rejected: "Rejected",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("border-0 text-[11px] font-semibold", STATUS_COLORS[status], className)}>
      {LABELS[status]}
    </Badge>
  );
}
