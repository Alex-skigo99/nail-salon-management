"use client";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { DAY_NAMES } from "@/const/days";
import { formatTimeToHHMM } from "@/utils/formatTime";
import { STATUS_DOT_COLORS } from "@/types/appointmentTypes";
import type { DaySlots, Slot } from "@/types/appointmentTypes";
import { getMonthWeeks, getWeekDays, formatDate, isPastDate, isSameDay } from "@/utils/dateUtils";

type MonthViewProps = {
  /** All slot data for the entire month (multiple weeks). */
  days: DaySlots[] | undefined;
  isLoading: boolean;
  currentDate: Date;
  onWeekClick: (weekStart: Date, isCurrentWeek: boolean) => void;
};

export function MonthView({ days, isLoading, currentDate, onWeekClick }: MonthViewProps) {
  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const dayMap = new Map<string, DaySlots>();
  days?.forEach((d) => dayMap.set(d.date, d));

  const weeks = getMonthWeeks(currentDate);
  const today = new Date();

  const isToday = (date: Date) => isSameDay(date, today);

  const handleWeekClick = (start: Date, d: Date, weekHasToday: boolean) => {
    onWeekClick(start, weekHasToday);
  };

  return (
    <div className="overflow-x-auto">
      {/* Header row */}
      <div className="bg-muted/30 grid grid-cols-7 border-b text-xs font-medium">
        {DAY_NAMES.map((d) => (
          <div key={d} className="px-1 py-2 text-center">
            {d}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map(({ start }) => {
        const weekDays = getWeekDays(start);
        const weekHasToday = weekDays.some((d) => isSameDay(d, today));
        return (
          <div key={formatDate(start)} className="grid grid-cols-7 border-b">
            {weekDays.map((d) => {
              const dateStr = formatDate(d);
              const dayData = dayMap.get(dateStr);
              const past = isPastDate(dateStr);
              const isCurrentMonth = d.getMonth() === currentDate.getMonth();
              const isTodayDate = isToday(d);
              const isOff = !dayData || dayData.slots.length === 0 || dayData.slots.every((s) => s.status === "none");

              return (
                <div
                  key={dateStr}
                  onClick={() => handleWeekClick(start, d, weekHasToday)}
                  className={cn(
                    "min-h-20 border-r px-1 py-1 last:border-r-0",
                    !isCurrentMonth && "bg-muted/10 opacity-40",
                    isCurrentMonth && isTodayDate && "bg-violet-100",
                    isCurrentMonth && !isTodayDate && !past && "bg-green-50",
                    isCurrentMonth && "cursor-pointer transition-opacity hover:opacity-75"
                  )}
                >
                  {/* Date label */}
                  <div className={cn("mb-0.5 text-[11px] font-medium", !isCurrentMonth && "text-muted-foreground")}>
                    {d.getDate()}
                  </div>

                  {/* Slot lines */}
                  {!isOff && dayData && (
                    <div className="flex flex-col">
                      {dayData.slots.map((slot: Slot, i: number) => {
                        const clientName = slot.appointment_data?.guest_name || "No client";
                        const slotStatus = slot.appointment_data?.status;
                        const isPartBook = slot.status === "part_book";
                        const tooltipText = `${formatTimeToHHMM(slot.start_time)} – ${slotStatus} (${clientName})`;
                        let dotColor = STATUS_DOT_COLORS[slot.status];
                        if (isPartBook && i !== 0) {
                          let ii = i;
                          do {
                            ii--;
                          } while (ii > 0 && dayData.slots[ii].status === "part_book");
                          dotColor = STATUS_DOT_COLORS[dayData.slots[ii].status];
                        }
                        return (
                          <div key={i} className={cn("h-1.5", dotColor, !isPartBook && "mt-0.5")} title={tooltipText} />
                        );
                      })}
                    </div>
                  )}

                  {isOff && isCurrentMonth && <span className="text-muted-foreground text-[10px]">Off</span>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
