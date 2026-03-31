"use client";

import { CalendarDays, BarChart3, Calendar, Table2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Master } from "@/types/masterTypes";
import type { ViewMode, DisplayMode } from "@/types/appointmentTypes";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { EntityAvatar } from "@/components/elements/EntityAvatar";

type CalendarHeaderProps = {
  masters: Master[] | undefined;
  isLoadingMasters: boolean;
  selectedMasterId: number | null;
  onMasterChange: (id: number) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
};

export function CalendarHeader({
  masters,
  isLoadingMasters,
  selectedMasterId,
  onMasterChange,
  viewMode,
  onViewModeChange,
  displayMode,
  onDisplayModeChange,
}: CalendarHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn("border-b-0 px-3 py-3 md:px-6 md:py-4", !isMobile && "h-21")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left – title */}
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Calendar</h1>
            <p className="text-muted-foreground text-sm">Manage appointments</p>
          </div>
        </div>

        {/* Right – controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Master selector */}
          {isLoadingMasters ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <Select value={selectedMasterId?.toString() ?? ""} onValueChange={(v) => onMasterChange(Number(v))}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Select master" />
              </SelectTrigger>
              <SelectContent>
                {masters?.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    <span className="flex items-center gap-2">
                      <EntityAvatar src={m.image} alt={m.name} size="xs" />
                      {m.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* View mode toggle */}
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("week")}
              className="rounded-r-none"
            >
              <Calendar className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Week</span>
            </Button>
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("month")}
              className="rounded-l-none"
            >
              <Table2 className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Month</span>
            </Button>
          </div>

          {/* Display mode toggle */}
          <div className="flex rounded-lg border">
            <Button
              variant={displayMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => onDisplayModeChange("table")}
              className="rounded-r-none"
            >
              <Table2 className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </Button>
            <Button
              variant={displayMode === "graph" ? "default" : "ghost"}
              size="sm"
              onClick={() => onDisplayModeChange("graph")}
              className="rounded-l-none"
              disabled
              title="Coming soon"
            >
              <BarChart3 className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Graph</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
