import { z } from "zod";
import type { Master } from "./masterTypes";
import type { Pagination } from "./paginationTypes";

export const UserRoleSchema = z.enum(["ADMIN", "USER"]);

export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  phone: z.string().nullable().optional(),
  role: UserRoleSchema,
  last_login: z.string().nullable(),
  image: z.string().nullable().optional(),
  google_id: z.string().nullable().optional(),
  master_id: z.number().nullable().optional(),
  email_subscribed: z.boolean().optional(),
  created_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export type UserListItem = Omit<User, "google_id"> & {
  appts_count: number;
  last_appts: string | null;
  is_google_auth: boolean;
};

export type UserRetrieve = Omit<User, "google_id"> & {
  master_data: Master | null;
  is_google_auth: boolean;
  appts_count: number;
  last_appts: string | null;
};

export type CreateUserInput = {
  name: string;
  email: string;
  role: UserRole;
  password: string;
  phone?: string | null;
  image?: string | null;
  master_id?: number | null;
  email_subscribed?: boolean;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
  phone?: string | null;
  role?: UserRole;
  image?: string | null;
  master_id?: number | null;
  email_subscribed?: boolean;
  password?: string | null;
};

export type PaginatedUsers = {
  data: UserListItem[];
  pagination?: Pagination;
};
