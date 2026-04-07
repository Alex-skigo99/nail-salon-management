import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { queryKeys } from "./queryKeys";
import { apiRoutes } from "@/const/apiRouts";
import type {
  Product,
  ProductHome,
  CreateProductInput,
  UpdateProductInput,
  PaginatedProducts,
} from "@/types/productTypes";
import { CACHE_TIME } from "@/const/cacheTime";

const PRODUCTS_QUERY_KEY = [queryKeys.products];

export interface UseProductsParams {
  search?: string;
  sort?: string;
  type?: string;
  is_available?: string;
  is_home_display?: string;
  page?: number;
  perPage?: number;
}

export function useProducts(params: UseProductsParams = {}, enabled = true) {
  return useQuery({
    queryKey: [queryKeys.products, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set("search", params.search);
      if (params.sort) searchParams.set("sort", params.sort);
      if (params.type) searchParams.set("type", params.type);
      if (params.is_available) searchParams.set("is_available", params.is_available);
      if (params.is_home_display) searchParams.set("is_home_display", params.is_home_display);
      if (params.page) searchParams.set("page", String(params.page));
      if (params.perPage) searchParams.set("perPage", String(params.perPage));
      const qs = searchParams.toString();
      const url = qs ? `${apiRoutes.product}?${qs}` : apiRoutes.product;
      const res = await apiClient.get<PaginatedProducts>(url);
      return res.data;
    },
    enabled,
    staleTime: CACHE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: [queryKeys.products, id],
    queryFn: async () => {
      const res = await apiClient.get<Product>(`${apiRoutes.product}/${id}`);
      return res.data;
    },
    enabled: id !== null,
    staleTime: CACHE_TIME,
  });
}

export function useHomeProducts() {
  return useQuery({
    queryKey: [queryKeys.homeProducts],
    queryFn: async () => {
      const res = await apiClient.get<ProductHome[]>(`${apiRoutes.product}/home`);
      return res.data;
    },
    staleTime: CACHE_TIME,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const res = await apiClient.post<Product>(apiRoutes.product, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [queryKeys.homeProducts] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductInput }) => {
      const res = await apiClient.put<Product>(`${apiRoutes.product}/${id}`, data);
      return res.data;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [queryKeys.products, id] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.homeProducts] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${apiRoutes.product}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [queryKeys.homeProducts] });
    },
  });
}
