"use client";

import { Clock } from "lucide-react";

type Props = {
  time: string;
  onClick: () => void;
};

export default function DaySlotsCard({ time, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-1.5 rounded-lg border border-pink-100 bg-white px-3 py-2 text-sm font-medium text-pink-700 shadow-sm transition-all hover:border-pink-300 hover:bg-pink-50 hover:shadow-md active:scale-95"
    >
      <Clock className="size-3.5 shrink-0 text-pink-400 transition-colors group-hover:text-pink-500" />
      {time.slice(0, 5)}
    </button>
  );
}
