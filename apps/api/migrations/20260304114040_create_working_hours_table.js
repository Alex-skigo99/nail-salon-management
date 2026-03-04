const { Tables } = require("../db_names");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(Tables.WORKING_HOURS, (table) => {
    table.increments("id").primary();
    table.integer("master_id").notNullable().references("id").inTable(Tables.MASTERS);
    table.integer("day_of_week").notNullable(); // 0 - Sunday, 1 - Monday, ..., 6 - Saturday
    table.time("start_time").notNullable();
    table.time("end_time").notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists(Tables.WORKING_HOURS);
};
