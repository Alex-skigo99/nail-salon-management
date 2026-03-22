"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Gem, Sparkles, Armchair, ShieldCheck } from "lucide-react";

type SimpleT = (key: string) => string;
type Props = { t: ReturnType<typeof useTranslations> | SimpleT; isMobile: boolean };

export default function AboutSection({ t, isMobile }: Props) {
  const cards = [
    { icon: Gem, title: t("aboutCard1Title"), desc: t("aboutCard1Desc"), color: "text-pink-500", bg: "bg-pink-50" },
    {
      icon: Sparkles,
      title: t("aboutCard2Title"),
      desc: t("aboutCard2Desc"),
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      icon: Armchair,
      title: t("aboutCard3Title"),
      desc: t("aboutCard3Desc"),
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      icon: ShieldCheck,
      title: t("aboutCard4Title"),
      desc: t("aboutCard4Desc"),
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <h2
            className={`mb-3 font-bold tracking-tight text-gray-900 ${isMobile ? "text-2xl" : "text-3xl lg:text-4xl"}`}
          >
            {t("aboutTitle")}
          </h2>
          <p className="mx-auto max-w-xl text-gray-500">{t("aboutSubtitle")}</p>
        </div>

        <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4"}`}>
          {cards.map((card, i) => (
            <Card key={i} className="border-0 bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
              <CardContent className="pt-6 text-center">
                <div className={`inline-flex size-14 items-center justify-center rounded-2xl ${card.bg} mb-4`}>
                  <card.icon className={`size-7 ${card.color}`} />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{card.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{card.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
