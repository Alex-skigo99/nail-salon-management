import { useMutation } from "@tanstack/react-query";
import { signIn, signOut } from "next-auth/react";
import apiClient from "@/lib/api-client";
import { apiRoutes } from "@/const/apiRouts";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ─────────────────────────────────────────────
// Register mutation
// ─────────────────────────────────────────────

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      // 1. Register via Express API
      const res = await apiClient.post(apiRoutes.auth.register, data);

      // 2. After successful registration, sign in via Auth.js
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Registration succeeded but auto-login failed");
      }

      return res.data;
    },
  });
}

// ─────────────────────────────────────────────
// Login mutation (via Auth.js credentials)
// ─────────────────────────────────────────────

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      return result;
    },
  });
}

// ─────────────────────────────────────────────
// Google sign-in
// ─────────────────────────────────────────────

export function useGoogleSignIn() {
  return useMutation({
    mutationFn: async () => {
      await signIn("google", { callbackUrl: "/" });
    },
  });
}

// ─────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────

export function useLogout() {
  return useMutation({
    mutationFn: async (callbackUrl: string = "/login") => {
      // Clear the Express API cookie
      try {
        await apiClient.post(apiRoutes.auth.logout);
      } catch {
        // Ignore if API is unreachable
      }
      // Sign out of Auth.js session
      await signOut({ callbackUrl });
    },
  });
}
