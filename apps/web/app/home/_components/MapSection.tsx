"use client";

import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { HOME_MAKET } from "@/const/homeMaket";
import { cn } from "@/lib/utils";

type Props = { t: ReturnType<typeof useTranslations>; isMobile: boolean };

export default function MapSection({ t, isMobile }: Props) {
  return (
    <section id="map" className={cn("bg-linear-to-b from-pink-50/50 to-white", HOME_MAKET.section_py)}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <h2
            className={`mb-3 font-bold tracking-tight text-gray-900 ${isMobile ? "text-2xl" : "text-3xl lg:text-4xl"}`}
          >
            {t("mapTitle")}
          </h2>
          <p className="mx-auto max-w-xl text-gray-500">{t("mapSubtitle")}</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-pink-100 shadow-xl">
          <iframe
            title="Salon location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d845.11057143162!2d34.80781496967162!3d32.084330134646784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d4bc8662ad3b1%3A0xcef11f5a5e415da7!2sJabotinsky%20St%2043%2C%20Ramat%20Gan!5e0!3m2!1sen!2sil!4v1772556431068!5m2!1sen!2sil"
            width="100%"
            height={isMobile ? "300" : "400"}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
          <MapPin className="size-4 text-pink-500" />
          <span className="text-sm">{t("mapAddress")}</span>
        </div>
      </div>
    </section>
  );
}
