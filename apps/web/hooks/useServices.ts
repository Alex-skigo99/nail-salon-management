import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { CACHE_TIME } from "@/const/cacheTime";
import type { Service, CreateServiceInput, UpdateServiceInput } from "@/types/serviceTypes";
import { queryKeys } from "./queryKeys";
import { apiRoutes } from "@/const/apiRouts";

const SERVICES_QUERY_KEY = [queryKeys.services];

export function useServices() {
  return useQuery({
    queryKey: SERVICES_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<Service[]>(apiRoutes.service);
      return res.data;
    },
    staleTime: CACHE_TIME,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateServiceInput) => {
      const res = await apiClient.post<Service>(apiRoutes.service, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateServiceInput }) => {
      const res = await apiClient.put<Service>(`${apiRoutes.service}/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${apiRoutes.service}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
    },
  });
}
