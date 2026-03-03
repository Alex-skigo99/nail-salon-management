"use client";

import { useTranslations } from "next-intl";
import { Sparkles, Phone, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type Props = { t: ReturnType<typeof useTranslations>; isMobile: boolean };

export default function Footer({ t, isMobile }: Props) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className={`grid gap-10 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}>
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
              <Sparkles className="size-4 text-pink-400" />
              {t("salonName")}
            </h3>
            <div className="space-y-3 text-sm">
              <a
                href={`tel:${t("footerPhone")}`}
                className="flex items-center gap-2 transition-colors hover:text-pink-400"
              >
                <Phone className="size-4" />
                {t("footerPhone")}
              </a>
              <a
                href={`mailto:${t("footerEmail")}`}
                className="flex items-center gap-2 transition-colors hover:text-pink-400"
              >
                <Mail className="size-4" />
                {t("footerEmail")}
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>{t("footerAddress")}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">{t("footerHoursTitle")}</h3>
            <div className="flex items-start gap-2 text-sm">
              <Clock className="mt-0.5 size-4 shrink-0 text-pink-400" />
              <span>{t("footerHours")}</span>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">{t("footerFollowUs")}</h3>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-10 items-center justify-center rounded-xl bg-gray-800 transition-colors hover:bg-pink-500"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-10 items-center justify-center rounded-xl bg-gray-800 transition-colors hover:bg-pink-500"
                aria-label="Facebook"
              >
                <Facebook className="size-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        <div className="text-center text-xs text-gray-500">
          © {currentYear} {t("salonName")}. {t("footerRights")}
        </div>
      </div>
    </footer>
  );
}
