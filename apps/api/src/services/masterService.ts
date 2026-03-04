import { knex } from "../lib/db";
import { DB_TABLES } from "../constants/dbTables";
import { Master } from "../types/dbSchemaTypes";

export const getAllMasters = async (): Promise<Master[]> => {
  return knex(DB_TABLES.MASTERS).select("*");
};

export const createMaster = async (
  data: Pick<Master, "name"> & Partial<Pick<Master, "description">>
): Promise<Master> => {
  const [master] = await knex(DB_TABLES.MASTERS).insert(data).returning("*");
  return master;
};

export const updateMaster = async (
  id: number,
  data: Partial<Pick<Master, "name" | "description">>
): Promise<Master | null> => {
  const [master] = await knex(DB_TABLES.MASTERS).where({ id }).update(data).returning("*");
  return master ?? null;
};

export const deleteMaster = async (id: number): Promise<boolean> => {
  const deleted = await knex(DB_TABLES.MASTERS).where({ id }).delete();
  return deleted > 0;
};
