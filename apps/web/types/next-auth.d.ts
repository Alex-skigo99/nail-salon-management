import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "USER";
      phone?: string | null;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    role?: "ADMIN" | "USER";
    phone?: string | null;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "USER";
    phone?: string | null;
    accessToken?: string;
  }
}
