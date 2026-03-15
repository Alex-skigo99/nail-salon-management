"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ChevronRight, Clock, ChevronsUpDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { useAppointmentSuggestions } from "@/hooks/useAppointments";
import type { MasterSuggestion, TimeSlot } from "@/types/appointmentTypes";
import BookingDialog from "@/components/modals/bookingDialog/BookingDialog";
import { isSameDay } from "@/utils/dateUtils";
import { useTranslations } from "next-intl";

type Props = { isMobile: boolean; t: ReturnType<typeof useTranslations> };

type SelectedSlot = {
  id: string;
  master: MasterSuggestion["master"];
  date: string;
  time: string;
};

function formatDateLabel(date: string, t: ReturnType<typeof useTranslations>): string {
  const d = new Date(date);
  const label = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const today = new Date();

  if (isSameDay(d, today)) return `${label} (${t("today")})`;
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (isSameDay(d, tomorrow)) return `${label} (${t("tomorrow")})`;

  return label;
}

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
    setSelectedSlot({
      id: slot.id,
      master,
      date: slot.date,
      time: slot.time,
    });
    setBookingOpen(true);
  };

  const toggleMaster = (masterId: number) => {
    setOpenMasters((prev) => ({
      ...prev,
      [masterId]: !prev[masterId],
    }));
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
                    <div className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-2 xl:grid-cols-3"}`}>
                      {group.slots.length > 0 ? (
                        group.slots.map((slot) => (
                          <Card
                            key={slot.id}
                            className="group cursor-pointer border-pink-100 transition-all duration-300 hover:border-pink-300 hover:shadow-lg"
                            onClick={() => handleBookSlot(group.master, slot)}
                          >
                            <CardContent className="flex items-center justify-between py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-pink-50 transition-colors group-hover:bg-pink-100">
                                  <CalendarDays className="size-5 text-pink-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{formatDateLabel(slot.date, t)}</p>
                                  <p className="flex items-center gap-1 font-medium text-pink-600">
                                    <Clock className="size-3.5" />
                                    {slot.time}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="size-5 text-gray-300 transition-colors group-hover:text-pink-400" />
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p className="col-span-full py-3 text-center text-sm text-gray-400">
                          {t("scheduleNoSlotsForMaster")}
                        </p>
                      )}
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
