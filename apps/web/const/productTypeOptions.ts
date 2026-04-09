import type { ProductType } from "@/types/productTypes";

export const PRODUCT_TYPE_OPTIONS: { value: ProductType; label: string }[] = [
  { value: "nail_care", label: "Nail Care" },
  { value: "tools", label: "Tools" },
  { value: "accessories", label: "Accessories" },
  { value: "other", label: "Other" },
];
