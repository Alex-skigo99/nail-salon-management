const { Tables } = require("../db_names");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable(Tables.WORKING_HOURS, (table) => {
      table.increments("id").primary();
      table.integer("master_id").notNullable().references("id").inTable(Tables.MASTERS).onDelete("CASCADE");
      table.integer("day_of_week").notNullable(); // 0 - Sunday, 1 - Monday, ..., 6 - Saturday
      table.time("start_time").notNullable();
      table.time("end_time").notNullable();

      table.unique(["master_id", "day_of_week"]);
    })
    .then(() => {
      return knex.raw(
        `ALTER TABLE "${Tables.WORKING_HOURS}" ADD CONSTRAINT working_hours_end_after_start CHECK (end_time > start_time)`
      );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists(Tables.WORKING_HOURS);
};
