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

export const ServiceSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.string(),
  duration_minutes: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Service = z.infer<typeof ServiceSchema>;

export const MasterSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
});

export type Master = z.infer<typeof MasterSchema>;

export const WorkingHoursSchema = z.object({
  id: z.number(),
  master_id: z.number(),
  day_of_week: z.number(),
  start_time: z.string(),
  end_time: z.string(),
});

export type WorkingHours = z.infer<typeof WorkingHoursSchema>;
