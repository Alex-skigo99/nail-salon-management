import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { CACHE_TIME } from "@/const/cacheTime";
import { queryKeys } from "./queryKeys";
import { apiRoutes } from "@/const/apiRouts";
import { SETTING_LABELS } from "@/const/setting_labels";

export type Setting = {
  id: number;
  key: string;
  value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

const SETTINGS_QUERY_KEY = [queryKeys.settings];

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<Setting[]>(apiRoutes.settings);
      const settings = res.data.map((setting) => ({
        ...setting,
        label: SETTING_LABELS[setting.key]?.label ?? setting.key,
        description: SETTING_LABELS[setting.key]?.description ?? setting.description ?? "",
        type: SETTING_LABELS[setting.key]?.type ?? "text",
      }));
      return settings;
    },
    staleTime: CACHE_TIME,
  });
}

export function useSetting(key: string) {
  return useQuery({
    queryKey: [queryKeys.settings, key],
    queryFn: async () => {
      const res = await apiClient.get<Setting>(apiRoutes.settings, { params: { key } });
      const setting = res.data;
      return {
        ...setting,
        label: SETTING_LABELS[setting.key]?.label ?? setting.key,
        description: SETTING_LABELS[setting.key]?.description ?? setting.description ?? "",
        type: SETTING_LABELS[setting.key]?.type ?? "text",
      };
    },
    staleTime: CACHE_TIME,
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await apiClient.patch<Setting>(`${apiRoutes.settings}/${key}`, { value });
      return {
        ...res.data,
        label: SETTING_LABELS[res.data.key]?.label ?? res.data.key,
        description: SETTING_LABELS[res.data.key]?.description ?? res.data.description ?? "",
        type: SETTING_LABELS[res.data.key]?.type ?? "text",
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
}
