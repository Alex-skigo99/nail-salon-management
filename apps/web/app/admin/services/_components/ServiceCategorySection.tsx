"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Service, ServiceCategory } from "@/types/serviceTypes";
import { ServiceRow } from "./ServiceRow";
import { ServiceForm } from "./ServiceForm";
import { SERVICE_CATEGORY_LABELS } from "./serviceCategoryConfig";

type Props = {
  category: ServiceCategory;
  services: Service[];
};

export function ServiceCategorySection({ category, services }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const config = SERVICE_CATEGORY_LABELS[category];

  return (
    <>
      <section className="bg-background rounded-xl border shadow-sm">
        {/* Category header */}
        <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 className={`text-base font-semibold ${config.color}`}>{config.label}</h2>
            <p className="text-muted-foreground text-xs">{config.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${config.badgeClass}`}>
              {services.length} {services.length === 1 ? "service" : "services"}
            </span>
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </div>

        {/* Services list */}
        <div className="p-4">
          {services.length > 0 ? (
            <div className="space-y-2">
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
