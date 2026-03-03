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

  const {
    data: homeData,
    isLoading: homeLoading,
    error: homeError,
  } = useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const response = await apiClient.get<string>("/");
      return response.data;
    },
  });

  if (homeLoading) {
    return <div>Loading...</div>;
  }

  if (homeError) {
    return <div>Error: {homeError instanceof Error ? homeError.message : "Failed to fetch"}</div>;
  }

  return (
    <>
      <div>Calendar Page</div>
      <div>{homeData || "Nail Salon Placeholder"}</div>
      <div>{data ? JSON.stringify(data, null, 2) : "no message"}</div>
    </>
  );
}
