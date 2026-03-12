"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type ShopSectionProps = {
  t: ReturnType<typeof useTranslations>;
  isMobile: boolean;
};

export default function ShopSection({ t, isMobile }: ShopSectionProps) {
  const router = useRouter();

  return (
    <section id="shop" className="bg-blue-50 py-20 sm:py-28">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold">{t("shopSection.title")}</h2>
        <p className="mb-6 text-lg">{t("shopSection.description")}</p>
        <Button disabled onClick={() => router.push("/shop")}>
          {t("shopSection.buttonText")}
        </Button>
        <p className="mt-4 text-sm text-gray-500">{t("shopSection.comingSoon")}</p>
      </div>
    </section>
  );
}
