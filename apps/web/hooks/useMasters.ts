import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { CACHE_TIME } from "@/const/cacheTime";
import type { Master, CreateMasterInput, UpdateMasterInput } from "@/types/masterTypes";
import { queryKeys } from "./queryKeys";
import { apiRoutes } from "@/const/apiRouts";

const MASTERS_QUERY_KEY = [queryKeys.masters];

export function useMasters(enabled = true) {
  return useQuery({
    queryKey: MASTERS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<Master[]>(apiRoutes.masters);
      return res.data;
    },
    staleTime: CACHE_TIME,
    enabled,
  });
}

export function useCreateMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMasterInput) => {
      const res = await apiClient.post<Master>(apiRoutes.masters, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTERS_QUERY_KEY });
    },
  });
}

export function useUpdateMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateMasterInput }) => {
      const res = await apiClient.put<Master>(`${apiRoutes.masters}/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTERS_QUERY_KEY });
    },
  });
}

export function useDeleteMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${apiRoutes.masters}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTERS_QUERY_KEY });
    },
  });
}
