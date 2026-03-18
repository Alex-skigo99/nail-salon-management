import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { queryKeys } from "./queryKeys";
import { apiRoutes } from "@/const/apiRouts";
import type { User, CreateUserInput, UpdateUserInput } from "@/types/userTypes";

const USERS_QUERY_KEY = [queryKeys.users];

export function useUsers() {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<User[]>(apiRoutes.user);
      return res.data;
    },
  });
}

export function useUser(id: string | null) {
  return useQuery({
    queryKey: [queryKeys.users, id],
    queryFn: async () => {
      const res = await apiClient.get<User>(`${apiRoutes.user}/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const res = await apiClient.post<User>(apiRoutes.user, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserInput }) => {
      const res = await apiClient.put<User>(`${apiRoutes.user}/${id}`, data);
      return res.data;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [queryKeys.users, id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${apiRoutes.user}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}
