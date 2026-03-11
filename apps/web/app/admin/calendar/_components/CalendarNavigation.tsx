"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ViewMode } from "@/types/appointmentTypes";
import { formatWeekRange, formatMonthYear, getWeekStart, getWeekEnd } from "../../../../utils/dateUtils";

type CalendarNavigationProps = {
  currentDate: Date;
  viewMode: ViewMode;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export function CalendarNavigation({ currentDate, viewMode, onPrev, onNext, onToday }: CalendarNavigationProps) {
  const label =
    viewMode === "week"
      ? formatWeekRange(getWeekStart(currentDate), getWeekEnd(currentDate))
      : formatMonthYear(currentDate);

  return (
    <div className="flex items-center justify-between border-t px-3 py-3 md:px-6">
      <Button variant="outline" size="sm" onClick={onPrev}>
        <ChevronLeft className="mr-1 h-4 w-4" />
        <span className="hidden sm:inline">{viewMode === "week" ? "Prev Week" : "Prev Month"}</span>
        <span className="sm:hidden">Prev</span>
      </Button>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onToday} className="text-xs">
          Today
        </Button>
        <span className="text-sm font-medium">{label}</span>
      </div>

      <Button variant="outline" size="sm" onClick={onNext}>
        <span className="hidden sm:inline">{viewMode === "week" ? "Next Week" : "Next Month"}</span>
        <span className="sm:hidden">Next</span>
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}
