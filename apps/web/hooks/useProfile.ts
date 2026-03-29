import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { queryKeys } from "./queryKeys";
import { apiRoutes } from "@/const/apiRouts";
import type { AuthUser, UpdateMeInput } from "@/types/authUserType";
import { CACHE_TIME } from "@/const/cacheTime";

export function useProfile() {
  return useQuery({
    queryKey: [queryKeys.userProfile],
    queryFn: async () => {
      const res = await apiClient.get<{ user: AuthUser }>(apiRoutes.auth.me);
      return res.data.user;
    },
    staleTime: CACHE_TIME,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateMeInput) => {
      const res = await apiClient.patch<{ user: AuthUser }>(apiRoutes.auth.me, data);
      return res.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.userProfile] });
    },
  });
}
