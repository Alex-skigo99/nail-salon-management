"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { useAppointmentSuggestions } from "@/hooks/useAppointments";
import type { MasterSuggestion, TimeSlot, SelectedSlot } from "@/types/appointmentTypes";
import BookingDialog from "@/components/modals/bookingDialog/BookingDialog";
import { useTranslations } from "next-intl";
import HotSlots from "./scheduleSection/HotSlots";
import DayEmptySlots from "./scheduleSection/DayEmptySlots";

type Props = { isMobile: boolean; t: ReturnType<typeof useTranslations> };

export default function ScheduleSection({ isMobile, t }: Props) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

  const { data: suggestions = [], isLoading, isError } = useAppointmentSuggestions();

  const [openMasters, setOpenMasters] = useState<Record<number, boolean>>(
    suggestions.reduce(
      (acc, item, idx) => {
        acc[item.master.id] = idx === 0 ? true : false; // open first master by default
        return acc;
      },
      {} as Record<number, boolean>
    )
  );

  // Tracks which masters are in "day view" (DayEmptySlots) vs "hot slots" view
  const [dayViewMasters, setDayViewMasters] = useState<Record<number, boolean>>({});

  const suggestionGroups = useMemo(() => {
    return suggestions.map((item) => ({
      ...item,
      slots: item.slots.map((slot, index) => ({
        ...slot,
        id: `${item.master.id}-${slot.date}-${slot.time}-${index}`,
      })),
    }));
  }, [suggestions]);

  const handleBookSlot = (master: MasterSuggestion["master"], slot: TimeSlot & { id: string }) => {
    setSelectedSlot({ id: slot.id, master, date: slot.date, time: slot.time });
    setBookingOpen(true);
  };

  const toggleMaster = (masterId: number) => {
    setOpenMasters((prev) => ({ ...prev, [masterId]: !prev[masterId] }));
  };

  const toggleDayView = (masterId: number) => {
    setDayViewMasters((prev) => ({ ...prev, [masterId]: !prev[masterId] }));
  };

  return (
    <section id="schedule" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <h2
            className={`mb-3 font-bold tracking-tight text-gray-900 ${isMobile ? "text-2xl" : "text-3xl lg:text-4xl"}`}
          >
            {t("scheduleTitle")}
          </h2>
          <p className="mx-auto max-w-xl text-gray-500">{t("scheduleSubtitle")}</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
            <Spinner className="size-4" />
            {t("loadingSlots")}
          </div>
        )}

        {!isLoading && isError && <p className="text-center text-red-600">{t("loadingError")}</p>}

        {!isLoading && !isError && suggestionGroups.length === 0 && (
          <p className="text-center text-gray-400">{t("scheduleNoSlots")}</p>
        )}

        {!isLoading && !isError && suggestionGroups.length > 0 && (
          <div className="space-y-4">
            {suggestionGroups.map((group) => {
              const isOpen = openMasters[group.master.id] ?? true;
              const isDayView = dayViewMasters[group.master.id] ?? false;

              return (
                <Collapsible
                  key={group.master.id}
                  open={isOpen}
                  onOpenChange={() => toggleMaster(group.master.id)}
                  className="rounded-2xl border border-pink-100 bg-pink-50/20"
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-pink-50">
                    <div>
                      <p className="font-semibold text-gray-900">{group.master.name}</p>
                      <p className="text-xs text-gray-500">
                        {group.master.description || t("scheduleAvailableSpecialist")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <ChevronsUpDown className="size-4" />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="px-4 pb-4">
                    {isDayView ? (
                      <DayEmptySlots master={group.master} isMobile={isMobile} t={t} onBook={handleBookSlot} />
                    ) : (
                      <HotSlots
                        slots={group.slots}
                        master={group.master}
                        isMobile={isMobile}
                        t={t}
                        onBook={handleBookSlot}
                      />
                    )}

                    <div className="mt-4 flex justify-start">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDayView(group.master.id);
                        }}
                        className="text-sm font-medium text-pink-500 underline-offset-2 hover:text-pink-700 hover:underline"
                      >
                        {isDayView ? t("scheduleBackToHotSlots") : t("scheduleMoreSlots")}
                      </button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}

        <BookingDialog
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          selectedSlot={selectedSlot}
          isMobile={isMobile}
        />
      </div>
    </section>
  );
}
