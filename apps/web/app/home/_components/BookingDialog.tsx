"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import type { Service } from "@/types/serviceTypes";

type Props = {
  t: ReturnType<typeof useTranslations>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlot: {
    id: string;
    date: string;
    time: string;
    label: string;
  } | null;
  services: Service[];
  isMobile: boolean;
};

export default function BookingDialog({ t, open, onOpenChange, selectedSlot, services, isMobile }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              {services.length > 0 ? (
                services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))
              ) : (
                <option disabled>{t("scheduleNoSlots")}</option>
              )}
            </select>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">{t("bookingComingSoon")}</p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("bookingClose")}
          </Button>
          <Button className="border-0 bg-linear-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600">
            {t("bookingConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
