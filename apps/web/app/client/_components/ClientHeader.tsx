"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import SalonTitle from "@/components/elements/SalonTitle";

export default function ClientHeader() {
  const t = useTranslations("clientPage");
  const tt = useTranslations("home");

  return (
    <header className="border-b border-pink-100 bg-white/80 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4">
        <Link href="/home" className="flex items-center gap-2">
          <SalonTitle salonName={tt("salonName")} />
        </Link>
        <h1 className="font-bold text-violet-600">{t("clientPortal")}</h1>
      </div>
    </header>
  );
}
