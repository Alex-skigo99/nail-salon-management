"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Service, ServiceCategory } from "@/types/serviceTypes";
import { ServiceRow } from "./ServiceRow";
import { ServiceForm } from "./ServiceForm";
import { SERVICE_CATEGORY_LABELS } from "./serviceCategoryConfig";
import { cn } from "@/lib/utils";

type Props = {
  category: ServiceCategory;
  services: Service[];
};

export function ServiceCategorySection({ category, services }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const isMobile = useIsMobile();
  const config = SERVICE_CATEGORY_LABELS[category];

  return (
    <>
      <section className="bg-background rounded-lg">
        {/* Category header */}
        <div className="flex items-center justify-between gap-2 px-3 py-3 md:gap-4 md:px-5 md:py-4">
          <div className="min-w-0">
            <h2 className={`text-sm font-semibold md:text-base ${config.color}`}>{config.label}</h2>
            <p className="text-muted-foreground hidden text-xs md:block">{config.description}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", config.badgeClass)}>
              {services.length} {!isMobile && (services.length === 1 ? "service" : "services")}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddOpen(true)}
              className={isMobile ? "gap-1" : "gap-1.5"}
            >
              <Plus className="h-3.5 w-3.5" />
              {!isMobile && "Add"}
            </Button>
          </div>
        </div>

        {/* Services list */}
        <div className="px-2 py-2 md:p-4">
          {services.length > 0 ? (
            <div className="space-y-1 md:space-y-2">
              {services.map((service) => (
                <ServiceRow key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <p className="text-muted-foreground text-sm">No services yet</p>
              <Button size="sm" variant="ghost" onClick={() => setAddOpen(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add first service
              </Button>
            </div>
          )}
        </div>
      </section>

      <ServiceForm open={addOpen} onOpenChange={setAddOpen} defaultCategory={category} />
    </>
  );
}
