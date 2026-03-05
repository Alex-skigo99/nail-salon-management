"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { CACHE_TIME } from "@/const/cacheTime";
import { User } from "@/types/userTypes";

export default function CalendarPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["welcome"],
    queryFn: async () => {
      const response = await apiClient.get<User[]>("/welcome");
      return response.data;
    },
    staleTime: CACHE_TIME,
  });

  if (error) {
    return <div>Error: {error instanceof Error ? error.message : "Failed to fetch"}</div>;
  }

  return (
    <>
      <div>Calendar Page</div>
      <div>{data ? JSON.stringify(data, null, 2) : "Nail Salon Placeholder"}</div>
    </>
  );
}
