"use client";

import { useState, useCallback, useMemo } from "react";
import { useMasters } from "@/hooks/useMasters";
import { useMasterSlots } from "@/hooks/useAppointments";
import { CalendarHeader } from "./_components/CalendarHeader";
import { CalendarNavigation } from "./_components/CalendarNavigation";
import { WeekView } from "./_components/WeekView";
import { MonthView } from "./_components/MonthView";
import type { ViewMode, DisplayMode } from "@/types/appointmentTypes";
import { getWeekStart, getWeekEnd, getMonthStart, getMonthEnd, formatDate } from "@/utils/dateUtils";
import { useSession } from "next-auth/react";
import { is } from "date-fns/locale";

export default function CalendarPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const isAdmin = userRole === "ADMIN";
  // ── Master selection ─────────────────────────────────
  // TODO Only fetch masters if admin, otherwise we assume the user is a master and will get their own slots
  const { data: masters, isLoading: isLoadingMasters } = useMasters(isAdmin);
  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null);

  // Auto-select first master when loaded
  const masterId = useMemo(() => {
    if (selectedMasterId) return selectedMasterId;
    if (masters && masters.length > 0) return masters[0].id;
    return null;
  }, [selectedMasterId, masters]);

  // ── View state ───────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("table");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [isCurrentWeek, setIsCurrentWeek] = useState(true);

  // ── Computed date ranges ─────────────────────────────
  const { from, to } = useMemo(() => {
    if (viewMode === "week") {
      return {
        from: formatDate(getWeekStart(currentDate)),
        to: formatDate(getWeekEnd(currentDate)),
      };
    }
    // Month mode – fetch from first Sunday to last Saturday covering the month
    const monthStart = getMonthStart(currentDate);
    const monthEnd = getMonthEnd(currentDate);
    return {
      from: formatDate(getWeekStart(monthStart)),
      to: formatDate(getWeekEnd(monthEnd)),
    };
  }, [viewMode, currentDate]);

  // ── Data fetching ────────────────────────────────────
  const { data: slots, isLoading: isLoadingSlots } = useMasterSlots(masterId, from, to);

  // ── Navigation handlers ──────────────────────────────
  const handlePrev = useCallback(() => {
    setCurrentDate((d) => {
      const next = new Date(d);
      if (viewMode === "week") next.setDate(next.getDate() - 7);
      else next.setMonth(next.getMonth() - 1);
      return next;
    });
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setCurrentDate((d) => {
      const next = new Date(d);
      if (viewMode === "week") next.setDate(next.getDate() + 7);
      else next.setMonth(next.getMonth() + 1);
      return next;
    });
  }, [viewMode]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
    setIsCurrentWeek(true);
  }, []);

  const handleWeekClick = useCallback((weekStart: Date, isCurrentDayWeek: boolean) => {
    setCurrentDate(weekStart);
    setIsCurrentWeek(isCurrentDayWeek);
    setViewMode("week");
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (mode === "month") {
      setIsCurrentWeek(true);
    }
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <CalendarHeader
        masters={masters}
        isLoadingMasters={isLoadingMasters}
        selectedMasterId={masterId}
        onMasterChange={setSelectedMasterId}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
      />

      {/* Navigation */}
      <CalendarNavigation
        currentDate={currentDate}
        viewMode={viewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />

      {/* Main content */}
      <div className="flex-1 overflow-auto px-2 py-3 md:px-6 md:py-4">
        {!masterId ? (
          <div className="text-muted-foreground flex h-48 items-center justify-center">
            Select a master to view calendar
          </div>
        ) : displayMode === "graph" ? (
          <div className="text-muted-foreground flex h-48 items-center justify-center">Graph view coming soon</div>
        ) : viewMode === "week" ? (
          <WeekView days={slots} isLoading={isLoadingSlots} masterId={masterId} isCurrentWeek={isCurrentWeek} />
        ) : (
          <MonthView days={slots} isLoading={isLoadingSlots} currentDate={currentDate} onWeekClick={handleWeekClick} />
        )}
      </div>
    </div>
  );
}
