import { z } from "zod";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  last_login: string;
  password: string;
  createdAt: string;
};

export type Service = {
  id: number;
  name: string;
  description?: string | null;
  category: "manicure" | "pedicure" | "other";
  price: string;
  duration_minutes: number;
  createdAt: string;
  updatedAt: string;
};

export type Master = {
  id: number;
  name: string;
  description?: string | null;
};

export type WorkingHours = {
  id: number;
  master_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
};
