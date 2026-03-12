import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
  role: z.enum(["ADMIN", "USER"]),
  last_login: z.string().nullable(),
  image: z.string().nullable().optional(),
  google_id: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;
