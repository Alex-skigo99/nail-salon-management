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

// export interface User {
//   id: number;
//   name: string;
//   email: string;
//   role: "ADMIN" | "USER";
//   last_login: string;
//   password: string;
//   createdAt: string;
// }

// export interface Appointment {
//   id: number;
//   clientId: number;
//   staffId: number;
//   serviceId: number;
//   startTime: Date;
//   endTime: Date;
//   status: "pending" | "confirmed" | "completed" | "cancelled";
// }

// export interface Client {
//   id: number;
//   name: string;
//   email: string;
//   phone: string;
// }
