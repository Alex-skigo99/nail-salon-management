import type { Pagination } from "./paginationTypes";

export type ProductType = "nail_care" | "tools" | "accessories" | "other";

export type Product = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  discount: string | null;
  type: ProductType;
  quantity: number;
  image: string | null;
  is_available: boolean;
  is_home_display: boolean;
  home_sorting: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductHome = Omit<Product, "comment" | "quantity" | "created_at" | "updated_at">;

export type CreateProductInput = {
  title: string;
  description?: string | null;
  price: string;
  discount?: string | null;
  type: ProductType;
  quantity?: number;
  image?: string | null;
  is_available?: boolean;
  is_home_display?: boolean;
  home_sorting?: number;
  comment?: string | null;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type PaginatedProducts = {
  data: Product[];
  pagination?: Pagination;
};
