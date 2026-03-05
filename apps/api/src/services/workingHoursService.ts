import { knex } from "../lib/db";
import { DB_TABLES } from "../constants/dbTables";
import { WorkingHours } from "../types/dbSchemaTypes";

export type WorkingHoursInput = Pick<WorkingHours, "day_of_week" | "start_time" | "end_time">;

export const getWorkingHoursByMaster = async (masterId: number): Promise<WorkingHours[]> => {
  return knex(DB_TABLES.WORKING_HOURS).where({ master_id: masterId }).select("*").orderBy("day_of_week", "asc");
};

export const replaceWorkingHours = async (masterId: number, records: WorkingHoursInput[]): Promise<WorkingHours[]> => {
  return knex.transaction(async (trx) => {
    await trx(DB_TABLES.WORKING_HOURS).where({ master_id: masterId }).delete();

    if (records.length === 0) return [];

    const rows = records.map((r) => ({ ...r, master_id: masterId }));
    return trx(DB_TABLES.WORKING_HOURS).insert(rows).returning("*");
  });
};

export const deleteWorkingHoursByMaster = async (masterId: number): Promise<boolean> => {
  const deleted = await knex(DB_TABLES.WORKING_HOURS).where({ master_id: masterId }).delete();
  return deleted > 0;
};
