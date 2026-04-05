const { Tables } = require("../db_names");
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable(Tables.USERS, (table) => {
    table.string("language").notNullable().defaultTo("en");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable(Tables.USERS, (table) => {
    table.dropColumn("language");
  });
};
