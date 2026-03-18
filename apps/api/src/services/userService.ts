import { knex } from "../lib/db";
import { DB_TABLES } from "../constants/dbTables";
import { User } from "../types/dbSchemaTypes";

type SafeUser = Omit<User, "password" | "google_id">;

const SAFE_COLUMNS: (keyof User)[] = ["id", "name", "email", "phone", "role", "last_login", "image", "created_at"];

export const getAllUsers = async (): Promise<SafeUser[]> => {
  return knex(DB_TABLES.USERS).select(SAFE_COLUMNS);
};

export const getUserById = async (id: string): Promise<SafeUser | null> => {
  const user = await knex(DB_TABLES.USERS).select(SAFE_COLUMNS).where({ id }).first();
  return user ?? null;
};

export const createUser = async (
  data: Pick<User, "name" | "email" | "role"> & Partial<Pick<User, "phone" | "image">>
): Promise<SafeUser> => {
  const [user] = await knex(DB_TABLES.USERS).insert(data).returning(SAFE_COLUMNS);
  return user;
};

export const updateUser = async (
  id: string,
  data: Partial<Pick<User, "name" | "email" | "phone" | "role" | "image">>
): Promise<SafeUser | null> => {
  const [user] = await knex(DB_TABLES.USERS).where({ id }).update(data).returning(SAFE_COLUMNS);
  return user ?? null;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const deleted = await knex(DB_TABLES.USERS).where({ id }).delete();
  return deleted > 0;
};
