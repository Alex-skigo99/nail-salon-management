"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { useReplaceWorkingHours } from "@/hooks/useWorkingHours";
import type { WorkingHours } from "@/types/workingHoursTypes";
import { DAYS } from "@/const/days";
import { formatTimeToHHMM } from "@/utils/formatTime";

type DayRow = {
  enabled: boolean;
  start_time: string;
  end_time: string;
};

const DEFAULT_ROW: DayRow = { enabled: false, start_time: "09:00", end_time: "18:00" };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  masterId: number;
  masterName: string;
  existingHours: WorkingHours[];
};

export function WorkingHoursForm({ open, onOpenChange, masterId, masterName, existingHours }: Props) {
  const replaceWorkingHours = useReplaceWorkingHours();
  const [rows, setRows] = useState<DayRow[]>(DAYS.map(() => ({ ...DEFAULT_ROW })));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open) {
      const next = DAYS.map((day) => {
        const existing = existingHours.find((h) => h.day_of_week === day.value);
        if (existing) {
          return {
            enabled: true,
            start_time: formatTimeToHHMM(existing.start_time),
            end_time: formatTimeToHHMM(existing.end_time),
          };
        }
        return { ...DEFAULT_ROW };
      });
      setRows(next);
    }
  }, [open, existingHours]);

  const setRow = (index: number, patch: Partial<DayRow>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const records = rows
      .map((row, index) => ({ ...row, day_of_week: DAYS[index].value }))
      .filter((row) => row.enabled)
      .map(({ day_of_week, start_time, end_time }) => ({
        day_of_week,
        start_time: formatTimeToHHMM(start_time),
        end_time: formatTimeToHHMM(end_time),
      }));

    await replaceWorkingHours.mutateAsync({ master_id: masterId, records });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Working Hours — {masterName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-1 py-2">
            <div className="mb-3 grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 px-1">
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Day</span>
              <span className="text-muted-foreground w-24 text-center text-xs font-medium tracking-wide uppercase">
                Start
              </span>
              <span className="text-muted-foreground w-24 text-center text-xs font-medium tracking-wide uppercase">
                End
              </span>
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">On</span>
            </div>
            <Separator />
            {DAYS.map((day, index) => {
              const row = rows[index];
              return (
                <div
                  key={day.value}
                  className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 rounded-lg px-1 py-2 transition-colors ${row.enabled ? "bg-muted/40" : "opacity-60"}`}
                >
                  <Label className="font-medium">{day.label}</Label>
                  <Input
                    type="time"
                    value={row.start_time}
                    onChange={(e) => setRow(index, { start_time: e.target.value })}
                    disabled={!row.enabled || replaceWorkingHours.isPending}
                    className="w-24"
                    required={row.enabled}
                  />
                  <Input
                    type="time"
                    value={row.end_time}
                    onChange={(e) => setRow(index, { end_time: e.target.value })}
                    disabled={!row.enabled || replaceWorkingHours.isPending}
                    className="w-24"
                    required={row.enabled}
                  />
                  <Switch
                    checked={row.enabled}
                    onCheckedChange={(checked) => setRow(index, { enabled: checked })}
                    disabled={replaceWorkingHours.isPending}
                  />
                </div>
              );
            })}
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={replaceWorkingHours.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={replaceWorkingHours.isPending}>
              {replaceWorkingHours.isPending && <Spinner className="mr-2 h-4 w-4" />}
              Save Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
