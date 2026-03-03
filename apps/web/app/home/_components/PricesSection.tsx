"use client";

import { useTranslations } from "next-intl";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles } from "lucide-react";

type Props = { t: ReturnType<typeof useTranslations>; isMobile: boolean };

export default function PricesSection({ t, isMobile }: Props) {
  const categories = [
    {
      title: t("pricesCatManicure"),
      items: [
        { name: t("pricesClassicManicure"), price: t("pricesClassicManicurePrice") },
        { name: t("pricesGelManicure"), price: t("pricesGelManicurePrice") },
        { name: t("pricesFrencManicure"), price: t("pricesFrenchManicurePrice") },
        { name: t("pricesNailArt"), price: t("pricesNailArtPrice") },
      ],
    },
    {
      title: t("pricesCatPedicure"),
      items: [
        { name: t("pricesClassicPedicure"), price: t("pricesClassicPedicurePrice") },
        { name: t("pricesGelPedicure"), price: t("pricesGelPedicurePrice") },
        { name: t("pricesLuxuryPedicure"), price: t("pricesLuxuryPedicurePrice") },
      ],
    },
    {
      title: t("pricesCatExtensions"),
      items: [
        { name: t("pricesAcrylicFull"), price: t("pricesAcrylicFullPrice") },
        { name: t("pricesAcrylicFill"), price: t("pricesAcrylicFillPrice") },
        { name: t("pricesGelExtensions"), price: t("pricesGelExtensionsPrice") },
        { name: t("pricesRemoval"), price: t("pricesRemovalPrice") },
      ],
    },
  ];

  return (
    <section id="prices" className="bg-linear-to-b from-white to-pink-50/50 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <h2
            className={`mb-3 font-bold tracking-tight text-gray-900 ${isMobile ? "text-2xl" : "text-3xl lg:text-4xl"}`}
          >
            {t("pricesTitle")}
          </h2>
          <p className="mx-auto max-w-xl text-gray-500">{t("pricesSubtitle")}</p>
        </div>

        <Accordion type="multiple" defaultValue={["cat-0"]} className="border-pink-200/50 shadow-lg">
          {categories.map((cat, ci) => (
            <AccordionItem key={ci} value={`cat-${ci}`}>
              <AccordionTrigger className="text-base font-semibold text-gray-800 hover:text-pink-600 hover:no-underline">
                <span className="flex items-center gap-2">
                  <Sparkles className="size-4 text-pink-400" />
                  {cat.title}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {cat.items.map((item, ii) => (
                    <div key={ii} className="flex items-center justify-between py-1">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="ms-4 font-semibold whitespace-nowrap text-pink-600">{item.price}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
