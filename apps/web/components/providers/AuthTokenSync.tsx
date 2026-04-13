"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { setAuthToken } from "@/lib/api-client";

/**
 * Invisible component that keeps the API client's Authorization header
 * in sync with the current Auth.js session token.
 * Also handles global 401 responses by signing out and redirecting to /login.
 */
export function AuthTokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    setAuthToken(session?.accessToken ?? null);
  }, [session?.accessToken]);

  useEffect(() => {
    const handleUnauthorized = () => {
      signOut({ callbackUrl: "/login" });
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  return null;
}
