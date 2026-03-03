"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type Props = { t: ReturnType<typeof useTranslations>; isMobile: boolean };

export default function HeroSection({ t, isMobile }: Props) {
  return (
    <section id="hero" className="relative flex min-h-[60vh] items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 z-0">
        <Image src="/Nail-Salons-1.jpeg" alt="Nail salon" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Badge variant="secondary" className="mb-6 border-white/30 bg-white/20 px-4 py-1 text-white backdrop-blur-sm">
          <Sparkles className="mr-1 size-3" />
          {t("salonName")}
        </Badge>
        <h1
          className={`mb-6 leading-tight font-bold tracking-tight text-white ${
            isMobile ? "text-3xl" : "text-5xl lg:text-6xl"
          }`}
        >
          {t("heroTitle")}
        </h1>
        <p className={`mx-auto mb-8 max-w-2xl leading-relaxed text-white/90 ${isMobile ? "text-base" : "text-lg"}`}>
          {t("heroSubtitle")}
        </p>
        <div className={`flex justify-center gap-4 ${isMobile ? "flex-col items-center" : ""}`}>
          <Button
            asChild
            size="lg"
            className="border-0 bg-linear-to-r from-pink-500 to-rose-500 px-8 text-base text-white shadow-lg shadow-pink-500/25 hover:from-pink-600 hover:to-rose-600"
          >
            <a href="#schedule">{t("heroBookBtn")}</a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/40 px-8 text-base text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
          >
            <a href="#prices">{t("heroPricesBtn")}</a>
          </Button>
        </div>
      </div>

      <div className="absolute right-0 bottom-0 left-0 z-10 h-24 bg-linear-to-t from-white to-transparent" />
    </section>
  );
}
