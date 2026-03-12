"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthTokenSync } from "./AuthTokenSync";

type tProviders = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();

export default function Providers({ children }: tProviders) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AuthTokenSync />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
