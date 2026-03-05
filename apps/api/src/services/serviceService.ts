import { knex } from "../lib/db";
import { DB_TABLES } from "../constants/dbTables";
import { Service } from "../types/dbSchemaTypes";

export type ServiceInput = Pick<Service, "name" | "price" | "duration_minutes"> & Partial<Pick<Service, "description">>;

export const getAllServices = async (): Promise<Service[]> => {
  return knex(DB_TABLES.SERVICES).select("*");
};

export const createService = async (data: ServiceInput): Promise<Service> => {
  const [service] = await knex(DB_TABLES.SERVICES).insert(data).returning("*");
  return service;
};

export const updateService = async (id: number, data: Partial<ServiceInput>): Promise<Service | null> => {
  const [service] = await knex(DB_TABLES.SERVICES)
    .where({ id })
    .update({ ...data, updated_at: new Date().toISOString() })
    .returning("*");
  return service ?? null;
};

export const deleteService = async (id: number): Promise<boolean> => {
  const deleted = await knex(DB_TABLES.SERVICES).where({ id }).delete();
  return deleted > 0;
};
