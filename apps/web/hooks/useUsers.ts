import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { queryKeys } from "./queryKeys";
import { apiRoutes } from "@/const/apiRouts";
import type { User, UserRetrieve, CreateUserInput, UpdateUserInput, PaginatedUsers } from "@/types/userTypes";
import { CACHE_TIME } from "@/const/cacheTime";

const USERS_QUERY_KEY = [queryKeys.users];

export interface UseUsersParams {
  search?: string;
  sort?: string;
  role?: string;
  master_id?: number;
  page?: number;
  perPage?: number;
}

export function useUsers(params: UseUsersParams = {}, enabled = true) {
  return useQuery({
    queryKey: [queryKeys.users, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set("search", params.search);
      if (params.sort) searchParams.set("sort", params.sort);
      if (params.role) searchParams.set("role", params.role);
      if (params.master_id) searchParams.set("master_id", String(params.master_id));
      if (params.page) searchParams.set("page", String(params.page));
      if (params.perPage) searchParams.set("perPage", String(params.perPage));
      const qs = searchParams.toString();
      const url = qs ? `${apiRoutes.user}?${qs}` : apiRoutes.user;
      const res = await apiClient.get<PaginatedUsers>(url);
      return res.data;
    },
    enabled,
    staleTime: CACHE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string | null) {
  return useQuery({
    queryKey: [queryKeys.users, id],
    queryFn: async () => {
      const res = await apiClient.get<UserRetrieve>(`${apiRoutes.user}/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: CACHE_TIME,
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
