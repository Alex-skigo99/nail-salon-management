import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
  role: z.enum(["ADMIN", "USER"]),
  last_login: z.string(),
  password: z.string(),
  createdAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;
