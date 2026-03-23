import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { queryKeys } from "./queryKeys";
import { apiRoutes } from "@/const/apiRouts";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  image: string | null;
  isGoogleAuth: boolean;
  last_login: string | null;
  created_at: string;
};

export type UpdateMeInput = {
  name?: string;
  email?: string;
  phone?: string;
  oldPassword?: string;
  newPassword?: string;
};

export function useProfile() {
  return useQuery({
    queryKey: [queryKeys.userProfile],
    queryFn: async () => {
      const res = await apiClient.get<AuthUser>(apiRoutes.auth.me);
      return res.data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateMeInput) => {
      const res = await apiClient.patch<AuthUser>(apiRoutes.auth.me, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.userProfile] });
    },
  });
}
