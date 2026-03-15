"use client";

import { CalendarDays, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { MasterSuggestion, TimeSlot } from "@/types/appointmentTypes";

type Props = {
  slot: TimeSlot & { id: string };
  master: MasterSuggestion["master"];
  dateLabel: string;
  onBook: (master: MasterSuggestion["master"], slot: TimeSlot & { id: string }) => void;
};

export default function HotSlotsCard({ slot, master, dateLabel, onBook }: Props) {
  return (
    <Card
      className="group cursor-pointer border-pink-100 transition-all duration-300 hover:border-pink-300 hover:shadow-lg"
      onClick={() => onBook(master, slot)}
    >
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-pink-50 transition-colors group-hover:bg-pink-100">
            <CalendarDays className="size-5 text-pink-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{dateLabel}</p>
            <p className="flex items-center gap-1 font-medium text-pink-600">
              <Clock className="size-3.5" />
              {slot.time}
            </p>
          </div>
        </div>
        <ChevronRight className="size-5 text-gray-300 transition-colors group-hover:text-pink-400" />
      </CardContent>
    </Card>
  );
}
