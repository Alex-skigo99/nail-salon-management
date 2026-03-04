const { Tables } = require("../db_names");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(Tables.SERVICES, (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.enum("category", ["manicure", "pedicure", "other"]).notNullable();
    table.text("description");
    table.decimal("price", 10, 2).notNullable();
    table.integer("duration_minutes").notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists(Tables.SERVICES);
};
