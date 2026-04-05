"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { DaySlotTable } from "./DaySlotTable";
import { AdminAppointmentDialog } from "@/components/modals/adminAppointmentDialog/AdminAppointmentDialog";
import type { DaySlots, Slot } from "@/types/appointmentTypes";
import { isPastDate } from "@/utils/dateUtils";

type WeekViewProps = {
  days: DaySlots[] | undefined;
  isLoading: boolean;
  masterId: number;
  isCurrentWeek?: boolean;
};

export function WeekView({ days, isLoading, masterId, isCurrentWeek = true }: WeekViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDate, setSelectedDate] = useState("");

  const handleSlotClick = (slot: Slot, date: string) => {
    setSelectedSlot(slot);
    setSelectedDate(date);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!days || days.length === 0) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center">
        No data available for this period.
      </div>
    );
  }

  // Sort by date, past days at the bottom? No – keep chronological, Sun-Sat.
  const sorted = [...days].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      <div className="space-y-2">
        {sorted.map((day) => (
          <DaySlotTable
            key={day.date}
            daySlots={day}
            onSlotClick={handleSlotClick}
            defaultOpen={isCurrentWeek && !isPastDate(day.date)}
          />
        ))}
      </div>

      <AdminAppointmentDialog
        open={modalOpen && selectedSlot !== null}
        onOpenChange={setModalOpen}
        slot={selectedSlot as Slot}
        date={selectedDate}
        masterId={masterId}
      />
    </>
  );
}
