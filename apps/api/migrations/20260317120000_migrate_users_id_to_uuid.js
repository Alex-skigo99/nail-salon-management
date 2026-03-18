const { Tables } = require("../db_names");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Enable UUID extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Step 1: Drop appointments table (to remove foreign key constraint on users.id)
  await knex.schema.dropTableIfExists(Tables.APPOINTMENTS);

  // Step 2: Add UUID extension and create new uuid_id column on users
  await knex.schema.alterTable(Tables.USERS, (table) => {
    table.uuid("uuid_id").defaultTo(knex.raw("uuid_generate_v4()"));
  });

  // Step 3: Rename old id to temp column and new uuid_id to id
  await knex.schema.alterTable(Tables.USERS, (table) => {
    table.renameColumn("id", "old_id");
  });

  await knex.schema.alterTable(Tables.USERS, (table) => {
    table.renameColumn("uuid_id", "id");
  });

  // Step 4: Drop the old_id column
  await knex.schema.alterTable(Tables.USERS, (table) => {
    table.dropColumn("old_id");
  });

  // Step 5: Make id primary key
  await knex.schema.alterTable(Tables.USERS, (table) => {
    table.primary(["id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // This is a destructive migration - down is not easily reversible
  // We would need to store the old IDs to restore them
  throw new Error("Cannot rollback this migration as it involves data loss");
};
