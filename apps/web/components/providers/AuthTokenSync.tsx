"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { setAuthToken } from "@/lib/api-client";

/**
 * Invisible component that keeps the API client's Authorization header
 * in sync with the current Auth.js session token.
 */
export function AuthTokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    setAuthToken(session?.accessToken ?? null);
  }, [session?.accessToken]);

  return null;
}
