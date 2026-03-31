"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type ShopSectionProps = {
  t: ReturnType<typeof useTranslations>;
  isMobile: boolean;
};

export default function ShopSection({ t, isMobile }: ShopSectionProps) {
  const router = useRouter();

  return (
    <section id="shop" className="bg-blue-50 py-20 sm:py-28">
      <div className="container mx-auto px-4 text-center">
        <h2 className={cn("mb-4 font-bold", isMobile ? "text-2xl" : "text-3xl")}>{t("shopSection.title")}</h2>
        <p className="mb-6 text-lg">{t("shopSection.description")}</p>
        <p className="mt-10 text-sm text-gray-500">{t("shopSection.comingSoon")}</p>
      </div>
    </section>
  );
}
