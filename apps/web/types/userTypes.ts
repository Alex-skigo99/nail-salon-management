import { z } from "zod";

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
  createdAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export type CreateUserInput = {
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  image?: string | null;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
  phone?: string | null;
  role?: UserRole;
  image?: string | null;
};
