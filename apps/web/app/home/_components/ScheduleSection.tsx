"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarDays, Clock, ChevronRight } from "lucide-react";

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

        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogContent className={isMobile ? "max-w-[95vw]" : ""}>
            <DialogHeader>
              <DialogTitle>{t("bookingModalTitle")}</DialogTitle>
              <DialogDescription>{t("bookingModalDesc")}</DialogDescription>
            </DialogHeader>

            {selectedSlot && (
              <div className="flex items-center gap-3 rounded-xl bg-pink-50 p-4">
                <CalendarDays className="size-5 text-pink-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSlot.label} — {selectedSlot.date}
                  </p>
                  <p className="text-sm text-pink-600">{selectedSlot.time}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("bookingName")}</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
                  placeholder="..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("bookingPhone")}</label>
                <input
                  type="tel"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
                  placeholder="+972-..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("bookingService")}</label>
                <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none">
                  <option value="">{t("bookingSelectService")}</option>
                  <option>{t("pricesClassicManicure")}</option>
                  <option>{t("pricesGelManicure")}</option>
                  <option>{t("pricesFrencManicure")}</option>
                  <option>{t("pricesClassicPedicure")}</option>
                  <option>{t("pricesGelPedicure")}</option>
                  <option>{t("pricesLuxuryPedicure")}</option>
                  <option>{t("pricesAcrylicFull")}</option>
                  <option>{t("pricesGelExtensions")}</option>
                </select>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400">{t("bookingComingSoon")}</p>

            <DialogFooter>
              <Button variant="outline" onClick={() => setBookingOpen(false)}>
                {t("bookingClose")}
              </Button>
              <Button className="border-0 bg-linear-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600">
                {t("bookingConfirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
