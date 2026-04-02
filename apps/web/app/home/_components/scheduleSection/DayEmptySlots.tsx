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
import { shiftDate, todayStr, compareTimes, isSameDay } from "@/utils/dateUtils";
import { useSetting } from "@/hooks/useSettings";

type Props = {
  master: MasterSuggestion["master"];
  isMobile: boolean;
  t: ReturnType<typeof useTranslations>;
  onBook: (master: MasterSuggestion["master"], slot: TimeSlot & { id: string }) => void;
};

export default function DayEmptySlots({ master, isMobile, t, onBook }: Props) {
  const { data: bookingPeriodSetting } = useSetting("booking_period");
  const bookingPeriod = bookingPeriodSetting ? Number(bookingPeriodSetting.value) : 30;
  const maxDate = shiftDate(todayStr(), bookingPeriod);

  const [selectedDate, setSelectedDate] = useState(todayStr);

  const { data: daySlots = [], isLoading, isError } = useMasterEmptySlots(master.id, selectedDate);

  const slots = daySlots[0]?.slots ?? [];
  // Filter out past time slots if the selected date is today
  let availableSlots = slots;
  if (isSameDay(new Date(selectedDate), new Date())) {
    const currentTime = new Date()
      .toLocaleString("en-CA", { hour: "2-digit", minute: "2-digit", hour12: false })
      .slice(0, 5);
    availableSlots = slots.filter((slot) => compareTimes(slot.start_time, currentTime) > 0);
  }

  const handlePrevDay = () => {
    const newDate = shiftDate(selectedDate, -1);
    if (newDate < todayStr()) return;
    setSelectedDate(newDate);
  };
  const handleNextDay = () => {
    const newDate = shiftDate(selectedDate, 1);
    if (newDate > maxDate) return;
    setSelectedDate(newDate);
  };

  const prevDisabled = selectedDate <= todayStr();
  const nextDisabled = selectedDate >= maxDate;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    // Prevent selecting dates in the past
    if (e.target.value < todayStr()) {
      setSelectedDate(todayStr());
      return;
    }
    // Prevent selecting dates beyond booking period
    if (e.target.value > maxDate) {
      setSelectedDate(maxDate);
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
            max={maxDate}
            className="rounded-lg border border-pink-100 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-pink-300 transition-all outline-none focus:border-pink-300 focus:ring-1"
            aria-label={t("scheduleSelectDate")}
          />

          <Button
            variant="outline"
            size="icon"
            className="size-8 border-pink-100 hover:border-pink-300 hover:bg-pink-50"
            onClick={handleNextDay}
            disabled={nextDisabled}
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

      {!isLoading && !isError && availableSlots.length === 0 && (
        <p className="py-4 text-center text-sm text-gray-400">{t("scheduleNoEmptySlotsForDay")}</p>
      )}

      {!isLoading && !isError && availableSlots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableSlots.map((slot) => (
            <DaySlotsCard key={slot.start_time} time={slot.start_time} onClick={() => handleBookSlot(slot)} />
          ))}
        </div>
      )}
    </div>
  );
}
