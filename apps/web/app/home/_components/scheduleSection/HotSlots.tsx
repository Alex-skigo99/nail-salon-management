"use client";

import type { useTranslations } from "next-intl";
import type { MasterSuggestion, TimeSlot } from "@/types/appointmentTypes";
import HotSlotsCard from "./HotSlotsCard";
import { formatDateLabel } from "./formatDateLabel";

type Props = {
  slots: (TimeSlot & { id: string })[];
  master: MasterSuggestion["master"];
  isMobile: boolean;
  t: ReturnType<typeof useTranslations>;
  onBook: (master: MasterSuggestion["master"], slot: TimeSlot & { id: string }) => void;
};

export default function HotSlots({ slots, master, isMobile, t, onBook }: Props) {
  if (slots.length === 0) {
    return <p className="py-3 text-center text-sm text-gray-400">{t("scheduleNoSlotsForMaster")}</p>;
  }

  return (
    <div className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-2 xl:grid-cols-3"}`}>
      {slots.map((slot) => (
        <HotSlotsCard
          key={slot.id}
          slot={slot}
          master={master}
          dateLabel={formatDateLabel(slot.date, t)}
          onBook={onBook}
        />
      ))}
    </div>
  );
}
