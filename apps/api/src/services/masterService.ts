import { knex } from "../lib/db";
import { DB_TABLES } from "../constants/dbTables";
import { Master, MasterCreate, MasterUpdate } from "../types/dbSchemaTypes";
import { resolveImageUrl, isS3Key, deleteObject } from "./s3Service";

async function enrichMasterImage(master: Master): Promise<Master> {
  return { ...master, image: await resolveImageUrl(master.image ?? null) };
}

export const getAllMasters = async (): Promise<Master[]> => {
  const masters = await knex(DB_TABLES.MASTERS).select("*").orderBy("sorting", "asc").orderBy("name", "asc");
  return Promise.all(masters.map(enrichMasterImage));
};

export const getMasterById = async (id: number): Promise<Master | null> => {
  const master = await knex(DB_TABLES.MASTERS).where({ id }).first();
  return master ?? null;
};

export const createMaster = async (data: MasterCreate): Promise<Master> => {
  const [master] = await knex(DB_TABLES.MASTERS).insert(data).returning("*");
  return enrichMasterImage(master);
};

export const updateMaster = async (id: number, data: MasterUpdate): Promise<Master | null> => {
  // Clean up old S3 image if being replaced
  if (data.image !== undefined) {
    const existing = await knex(DB_TABLES.MASTERS).where({ id }).select("image").first();
    if (existing && isS3Key(existing.image)) {
      await deleteObject(existing.image).catch(() => {});
    }
  }
  const [master] = await knex(DB_TABLES.MASTERS).where({ id }).update(data).returning("*");
  if (!master) return null;
  return enrichMasterImage(master);
};

export const deleteMaster = async (id: number): Promise<boolean> => {
  const existing = await knex(DB_TABLES.MASTERS).where({ id }).select("image").first();
  const deleted = await knex(DB_TABLES.MASTERS).where({ id }).delete();
  if (deleted > 0 && existing && isS3Key(existing.image)) {
    await deleteObject(existing.image).catch(() => {});
  }
  return deleted > 0;
};
