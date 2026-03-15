"use client";

import { useTranslations } from "next-intl";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import type { Service, ServiceCategory } from "@/types/serviceTypes";
import { CURRENCY_SYMBOL } from "@/const/currency";

type Props = { t: ReturnType<typeof useTranslations>; isMobile: boolean };

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  manicure: "Manicure",
  pedicure: "Pedicure",
  other: "Extensions & Extras",
};

const CATEGORY_ORDER: ServiceCategory[] = ["manicure", "pedicure", "other"];

export default function PricesSection({ t, isMobile }: Props) {
  const { data: services = [] } = useServices();

  const groupedServices = services.reduce<Record<ServiceCategory, Service[]>>(
    (acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    },
    {} as Record<ServiceCategory, Service[]>
  );

  const categories = CATEGORY_ORDER.map((categoryKey) => ({
    title: CATEGORY_LABELS[categoryKey],
    items: groupedServices[categoryKey] || [],
  }));

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

        <Accordion type="multiple" className="border-pink-200/50 shadow-lg">
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
                  {cat.items.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">{item.name}</span>
                        <span className="ms-4 font-semibold whitespace-nowrap text-pink-600">
                          {CURRENCY_SYMBOL}
                          {parseFloat(item.price).toFixed(0)}
                        </span>
                      </div>
                      {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
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
