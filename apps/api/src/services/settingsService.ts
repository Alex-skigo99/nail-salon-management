import { knex } from "../lib/db";
import { DB_TABLES } from "../constants/dbTables";
import type { Setting } from "../types/dbSchemaTypes";

export async function getAllSettings(): Promise<Setting[]> {
  return knex(DB_TABLES.SETTINGS).select("*").orderBy("key");
}

export async function getSettingByKey(key: string): Promise<Setting | undefined> {
  return knex(DB_TABLES.SETTINGS).where({ key }).first();
}

export async function updateSetting(key: string, value: string): Promise<Setting | null> {
  const [updated] = await knex(DB_TABLES.SETTINGS)
    .where({ key })
    .update({ value, updated_at: knex.fn.now() })
    .returning("*");
  return updated ?? null;
}
