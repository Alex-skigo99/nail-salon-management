import { DefaultSession } from "next-auth";
import type { UserRole } from "./userTypes";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      phone?: string | null;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    role?: UserRole;
    phone?: string | null;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    phone?: string | null;
    accessToken?: string;
  }
}
