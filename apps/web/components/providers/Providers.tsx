"use client";

import React from "react";
// import { GoogleOAuthProvider } from "@react-oauth/google";
// import { googleProviderKey } from "@/constants/googleProviderKey";
// import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type tProviders = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();

export default function Providers({ children }: tProviders) {
  return (
    // <GoogleOAuthProvider clientId={googleProviderKey}>
    //   <SessionProvider>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    //   </SessionProvider>
    // </GoogleOAuthProvider>
  );
}
