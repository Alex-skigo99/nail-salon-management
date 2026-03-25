import { Sparkles, Menu, X } from "lucide-react";

interface SalonTitleProps {
  salonName: string;
}

export default function SalonTitle({ salonName }: SalonTitleProps) {
  return (
    <>
      <Sparkles className="size-6 text-pink-500" />
      <span className="bg-linear-to-r from-pink-600 to-rose-400 bg-clip-text text-lg font-bold text-transparent">
        {salonName}
      </span>
    </>
  );
}
