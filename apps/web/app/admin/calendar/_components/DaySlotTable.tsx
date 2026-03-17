"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { DAY_NAMES } from "@/const/days";
import { formatTimeToHHMM } from "@/utils/formatTime";
import { StatusBadge } from "./StatusBadge";
import { TruncatedText } from "./TruncatedText";
import { AvatarPopup } from "./AvatarPopup";
import type { DaySlots, Slot, SlotStatus } from "@/types/appointmentTypes";
import { isPastDate, parseLocalDate, formatShortDate, isSameDay, getCreatedAtString } from "@/utils/dateUtils";
import { useIsMobile } from "@/hooks/use-mobile";

type DaySlotTableProps = {
  daySlots: DaySlots;
  onSlotClick: (slot: Slot, date: string) => void;
  defaultOpen?: boolean;
};

/** Count how many slots have each status. */
function countStatuses(slots: Slot[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of slots) {
    counts[s.status] = (counts[s.status] ?? 0) + 1;
  }
  return counts;
}

export function DaySlotTable({ daySlots, onSlotClick, defaultOpen = true }: DaySlotTableProps) {
  const [open, setOpen] = useState(defaultOpen);
  const date = parseLocalDate(daySlots.date);
  const dayName = DAY_NAMES[date.getDay()];
  const past = isPastDate(daySlots.date);
  const statusCounts = countStatuses(daySlots.slots);
  const isMobile = useIsMobile();
  const isOff = daySlots.slots.length === 0 || daySlots.slots.every((s) => s.status === "none");

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn("w-full", isSameDay(date, new Date()) ? "bg-green-100" : "bg-green-50")}
        asChild
      >
        <button
          className={cn(
            "hover:bg-muted/50 flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
            past && "opacity-50",
            isOff && "opacity-40"
          )}
        >
          {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}

          {/* Day label */}
          <span className="min-w-24 text-sm font-semibold">
            {dayName}, {formatShortDate(parseLocalDate(daySlots.date), "long")}{" "}
            {isSameDay(date, new Date()) && "(Today)"}
          </span>

          {/* Total slots */}
          <span className="text-muted-foreground text-xs">{daySlots.slots_count} slots</span>

          {/* Status summary */}
          <div className="ml-auto flex flex-wrap items-center gap-1">
            {Object.entries(statusCounts).map(([status, count]) => (
              <span key={status} className="text-muted-foreground flex items-center gap-0.5 text-xs">
                <StatusBadge status={status as SlotStatus} className="h-4 text-[10px]" />
                <span>{count}</span>
              </span>
            ))}
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        {isOff ? (
          <div className="text-muted-foreground py-3 text-center text-sm">Day off</div>
        ) : (
          <div className="mt-1 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b">
                  <th className="w-18 px-3 py-2 text-left font-medium">Status</th>
                  <th className="w-18 px-3 py-2 text-left font-medium">Time</th>
                  <th className="w-15 px-3 py-2 text-left font-medium">Dur.</th>
                  <th className={cn("px-3 py-2 text-left font-medium", isMobile && "hidden")}>Services</th>
                  <th className="px-3 py-2 text-left font-medium">Client</th>
                  <th className="px-3 py-2 text-left font-medium">Avatar</th>
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className={cn("px-3 py-2 text-left font-medium", !isMobile && "hidden md:table-cell")}>Phone</th>
                  <th className="hidden px-3 py-2 text-left font-medium lg:table-cell">Comments</th>
                  <th className="hidden px-3 py-2 text-left font-medium sm:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {daySlots.slots.map((slot, idx) => {
                  const appointmentData = slot.appointment_data;
                  const isPartBook = slot.status === "part_book";
                  const isEmpty = slot.status === "empty";

                  return (
                    <tr
                      key={idx}
                      className={cn(
                        "hover:bg-muted/40 cursor-pointer border-b transition-colors last:border-b-0",
                        past && "opacity-60",
                        isPartBook && "border-t-0"
                      )}
                      onClick={() => onSlotClick(slot, daySlots.date)}
                    >
                      <td className="px-3 py-1.5">
                        <StatusBadge status={appointmentData ? appointmentData.status : slot.status} />
                      </td>
                      <td className="px-3 py-1.5 font-mono text-xs">{formatTimeToHHMM(slot.start_time)}</td>

                      {!isPartBook && (
                        <>
                          <td className="text-muted-foreground px-3 py-1.5 text-xs">
                            {appointmentData ? `${appointmentData.duration_minutes}m` : `${daySlots.slot_duration}m`}
                          </td>
                          <td className={cn("px-3 py-1.5", isMobile && "hidden")}>
                            <TruncatedText text={appointmentData?.services} />
                          </td>
                          <td className="px-3 py-1.5 text-xs font-medium">
                            {!isEmpty ? (
                              appointmentData?.user_id ? (
                                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">User</span>
                              ) : (
                                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">Guest</span>
                              )
                            ) : null}
                          </td>
                          <td className="px-3 py-1.5">
                            {appointmentData?.user_data?.image ? (
                              <AvatarPopup src={appointmentData.user_data.image} alt={appointmentData.user_data.name} />
                            ) : null}
                          </td>
                          <td className={cn("px-3 py-1.5", isMobile && "text-xs")}>
                            <TruncatedText text={appointmentData?.user_data?.name ?? appointmentData?.guest_name} />
                          </td>
                          <td className={cn("px-3 py-1.5 text-xs", !isMobile && "hidden text-sm md:table-cell")}>
                            <TruncatedText text={appointmentData?.user_data?.phone ?? appointmentData?.guest_phone} />
                          </td>
                          <td className={cn("hidden px-3 py-1.5 lg:table-cell", isMobile && "text-xs")}>
                            <TruncatedText text={appointmentData?.comments} />
                          </td>
                          <td className={cn("hidden px-3 py-1.5 sm:table-cell", isMobile && "text-xs")}>
                            <TruncatedText text={getCreatedAtString(appointmentData?.created_at)} />
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
