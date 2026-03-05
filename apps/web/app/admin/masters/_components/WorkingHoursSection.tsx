"use client";

import { useState } from "react";
import { ChevronDown, Clock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { useWorkingHours } from "@/hooks/useWorkingHours";
import type { WorkingHours } from "@/types/workingHoursTypes";
import { WorkingHoursForm } from "./WorkingHoursForm";
import { cn } from "@/lib/utils";
import { DAY_NAMES } from "@/const/days";
import { formatTimeToHHMM } from "@/utils/formatTime";

type DayRowProps = {
  hours: WorkingHours;
};

function DayRow({ hours }: DayRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground w-8 text-xs font-medium">{DAY_NAMES[hours.day_of_week]}</span>
      <span className="text-sm">
        {formatTimeToHHMM(hours.start_time)} – {formatTimeToHHMM(hours.end_time)}
      </span>
    </div>
  );
}

type Props = {
  masterId: number;
  masterName: string;
};

export function WorkingHoursSection({ masterId, masterName }: Props) {
  const { data: hours, isLoading } = useWorkingHours(masterId);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const hasHours = hours && hours.length > 0;

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground flex w-full items-center gap-1.5 py-1 text-xs font-medium transition-colors"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Working Hours</span>
            {hasHours && (
              <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-xs">
                {hours.length}d
              </Badge>
            )}
            {isLoading && <Spinner className="ml-1 h-3 w-3" />}
            <ChevronDown className={cn("ml-auto h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-1">
          <Separator className="mb-3" />
          {isLoading ? (
            <div className="flex justify-center py-3">
              <Spinner className="h-4 w-4" />
            </div>
          ) : hasHours ? (
            <div className="space-y-1.5">
              {hours.map((h) => (
                <DayRow key={h.id} hours={h} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-1 text-xs">No working hours set.</p>
          )}
          <Button size="sm" variant="outline" className="mt-3 h-7 gap-1.5 text-xs" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3 w-3" />
            Edit Schedule
          </Button>
        </CollapsibleContent>
      </Collapsible>

      <WorkingHoursForm
        open={editOpen}
        onOpenChange={setEditOpen}
        masterId={masterId}
        masterName={masterName}
        existingHours={hours ?? []}
      />
    </>
  );
}
