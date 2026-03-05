"use client";

import { Scissors } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useServices } from "@/hooks/useServices";
import { ServiceCategorySection } from "./_components/ServiceCategorySection";
import { SERVICE_CATEGORIES } from "./_components/serviceCategoryConfig";
import type { ServiceCategory } from "@/types/serviceTypes";

export default function ServicesPage() {
  const { data: services, isLoading, error } = useServices();

  const servicesByCategory = (category: ServiceCategory) => (services ?? []).filter((s) => s.category === category);

  return (
    <div className="flex flex-1 flex-col">
      {/* Page header */}
      <div className="border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
            <Scissors className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Services</h1>
            <p className="text-muted-foreground text-sm">Manage your price list and service catalog</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <p className="text-destructive font-medium">Failed to load services</p>
            <p className="text-muted-foreground text-sm">Please try refreshing the page</p>
          </div>
        ) : (
          <div className="space-y-6">
            {SERVICE_CATEGORIES.map((category) => (
              <ServiceCategorySection key={category} category={category} services={servicesByCategory(category)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
