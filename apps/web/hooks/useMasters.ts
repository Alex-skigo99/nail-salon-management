import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { CACHE_TIME } from "@/const/cacheTime";
import type { Master, CreateMasterInput, UpdateMasterInput } from "@/types/masterTypes";

const MASTERS_QUERY_KEY = ["masters"];

export function useMasters() {
  return useQuery({
    queryKey: MASTERS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<Master[]>("/master");
      return res.data;
    },
    staleTime: CACHE_TIME,
  });
}

export function useCreateMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMasterInput) => {
      const res = await apiClient.post<Master>("/master", data);
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
      const res = await apiClient.put<Master>(`/master/${id}`, data);
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
      await apiClient.delete(`/master/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTERS_QUERY_KEY });
    },
  });
}
