"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, ChevronRight } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import BookingDialog from "./BookingDialog";

type Props = { t: ReturnType<typeof useTranslations>; isMobile: boolean };

function generateMockSlots(todayLabel: string, tomorrowLabel: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return [
    { id: "1", date: formatDate(today), time: "14:00", label: todayLabel },
    { id: "2", date: formatDate(today), time: "16:30", label: todayLabel },
    { id: "3", date: formatDate(tomorrow), time: "10:00", label: tomorrowLabel },
    { id: "4", date: formatDate(tomorrow), time: "11:30", label: tomorrowLabel },
    { id: "5", date: formatDate(tomorrow), time: "15:00", label: tomorrowLabel },
  ];
}

export default function ScheduleSection({ t, isMobile }: Props) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    id: string;
    date: string;
    time: string;
    label: string;
  } | null>(null);

  const { data: services = [] } = useServices();
  const slots = useMemo(() => generateMockSlots(t("today"), t("tomorrow")), [t]);

  const handleBookSlot = (slot: (typeof slots)[0]) => {
    setSelectedSlot(slot);
    setBookingOpen(true);
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

        {slots.length === 0 ? (
          <p className="text-center text-gray-400">{t("scheduleNoSlots")}</p>
        ) : (
          <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"}`}>
            {slots.map((slot) => (
              <Card
                key={slot.id}
                className="group cursor-pointer border-pink-100 transition-all duration-300 hover:border-pink-300 hover:shadow-lg"
                onClick={() => handleBookSlot(slot)}
              >
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-pink-50 transition-colors group-hover:bg-pink-100">
                      <CalendarDays className="size-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {slot.label} — {slot.date}
                      </p>
                      <p className="flex items-center gap-1 font-medium text-pink-600">
                        <Clock className="size-3.5" />
                        {slot.time}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-gray-300 transition-colors group-hover:text-pink-400" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <BookingDialog
          t={t}
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          selectedSlot={selectedSlot}
          services={services}
          isMobile={isMobile}
        />
      </div>
    </section>
  );
}
