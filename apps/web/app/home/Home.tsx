"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { CACHE_TIME } from "@/const/cacheTime";

interface WelcomeResponse {
  message: string;
}

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["welcome"],
    queryFn: async () => {
      const response = await apiClient.get<WelcomeResponse>("/welcome");
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
      <div>{homeData || "Nail Salon Placeholder"}</div>
      <div>{data?.message || "no message"}</div>
    </>
  );
}
