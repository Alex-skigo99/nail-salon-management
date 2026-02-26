import type { Knex } from "knex";

declare global {
  var __db: Knex | undefined;
}

export {};
