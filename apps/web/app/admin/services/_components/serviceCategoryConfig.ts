import type { ServiceCategory } from "@/types/serviceTypes";

type CategoryConfig = {
  label: string;
  description: string;
  color: string;
  badgeClass: string;
};

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, CategoryConfig> = {
  manicure: {
    label: "Manicure",
    description: "Hand & nail care services",
    color: "text-pink-600",
    badgeClass: "bg-pink-50 text-pink-700 border-pink-200",
  },
  pedicure: {
    label: "Pedicure",
    description: "Foot & nail care services",
    color: "text-violet-600",
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
  },
  other: {
    label: "Other",
    description: "Additional services",
    color: "text-sky-600",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
};

export const SERVICE_CATEGORIES: ServiceCategory[] = ["manicure", "pedicure", "other"];
