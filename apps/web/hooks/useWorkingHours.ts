import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { WorkingHours, ReplaceWorkingHoursInput } from "@/types/workingHoursTypes";

export const workingHoursQueryKey = (masterId: number) => ["working_hours", masterId];

export function useWorkingHours(masterId: number) {
  return useQuery({
    queryKey: workingHoursQueryKey(masterId),
    queryFn: async () => {
      const res = await apiClient.get<WorkingHours[]>("/working_hours", {
        params: { master_id: masterId },
      });
      return res.data;
    },
  });
}

export function useReplaceWorkingHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReplaceWorkingHoursInput) => {
      const res = await apiClient.post<WorkingHours[]>("/working_hours", data);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: workingHoursQueryKey(variables.master_id) });
    },
  });
}
