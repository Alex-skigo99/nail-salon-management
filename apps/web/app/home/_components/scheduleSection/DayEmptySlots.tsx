"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import type { useTranslations } from "next-intl";
import type { MasterSuggestion, TimeSlot } from "@/types/appointmentTypes";
import { useMasterEmptySlots } from "@/hooks/useAppointments";
import DaySlotsCard from "./DaySlotsCard";
import { formatDateLabel } from "./formatDateLabel";
import { shiftDate, todayStr } from "@/utils/dateUtils";

type Props = {
  master: MasterSuggestion["master"];
  isMobile: boolean;
  t: ReturnType<typeof useTranslations>;
  onBook: (master: MasterSuggestion["master"], slot: TimeSlot & { id: string }) => void;
};

export default function DayEmptySlots({ master, isMobile, t, onBook }: Props) {
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const { data: daySlots = [], isLoading, isError } = useMasterEmptySlots(master.id, selectedDate);

  const slots = daySlots[0]?.slots ?? [];

  const handlePrevDay = () => {
    const newDate = shiftDate(selectedDate, -1);
    if (newDate < todayStr()) return;
    setSelectedDate(newDate);
  };
  const handleNextDay = () => setSelectedDate((d) => shiftDate(d, 1));

  const prevDisabled = selectedDate <= todayStr();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    // Prevent selecting dates in the past
    if (e.target.value < todayStr()) {
      setSelectedDate(todayStr());
      return;
    }

    setSelectedDate(e.target.value);
  };

  const handleBookSlot = (slot: { start_time: string }) => {
    const id = `${master.id}-${selectedDate}-${slot.start_time}`;
    onBook(master, { id, date: selectedDate, time: slot.start_time.slice(0, 5) });
  };

  return (
    <div className="space-y-4 pt-1">
      {/* Date navigation */}
      <div className={`flex items-center gap-2 ${isMobile ? "flex-col" : "flex-row"}`}>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8 border-pink-100 hover:border-pink-300 hover:bg-pink-50"
            onClick={handlePrevDay}
            disabled={prevDisabled}
            aria-label={t("schedulePrevDay")}
          >
            <ChevronLeft className="size-4 text-pink-500" />
          </Button>

          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min={todayStr()}
            className="rounded-lg border border-pink-100 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-pink-300 transition-all outline-none focus:border-pink-300 focus:ring-1"
            aria-label={t("scheduleSelectDate")}
          />

          <Button
            variant="outline"
            size="icon"
            className="size-8 border-pink-100 hover:border-pink-300 hover:bg-pink-50"
            onClick={handleNextDay}
            aria-label={t("scheduleNextDay")}
          >
            <ChevronRight className="size-4 text-pink-500" />
          </Button>
        </div>

        <span className="text-sm font-medium text-pink-600">{formatDateLabel(selectedDate, t)}</span>
      </div>

      {/* Slots */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-6 text-gray-400">
          <Spinner className="size-4" />
          <span className="text-sm">{t("scheduleLoadingEmptySlots")}</span>
        </div>
      )}

      {!isLoading && isError && <p className="py-4 text-center text-sm text-red-500">{t("loadingError")}</p>}

      {!isLoading && !isError && slots.length === 0 && (
        <p className="py-4 text-center text-sm text-gray-400">{t("scheduleNoEmptySlotsForDay")}</p>
      )}

      {!isLoading && !isError && slots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <DaySlotsCard key={slot.start_time} time={slot.start_time} onClick={() => handleBookSlot(slot)} />
          ))}
        </div>
      )}
    </div>
  );
}
