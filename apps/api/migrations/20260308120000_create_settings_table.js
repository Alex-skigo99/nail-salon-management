const { Tables } = require("../db_names");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable(Tables.SETTINGS, (table) => {
    table.increments("id").primary();
    table.string("key").notNullable().unique();
    table.text("value").notNullable();
    table.text("description").nullable();
    table.timestamps(true, true);
  });

  await knex(Tables.SETTINGS).insert([
    {
      key: "slot_duration",
      value: "30",
      description: "Duration of a single time slot in minutes",
    },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists(Tables.SETTINGS);
};
