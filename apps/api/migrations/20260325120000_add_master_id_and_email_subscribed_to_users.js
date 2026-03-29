const { Tables } = require("../db_names");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable(Tables.USERS, (table) => {
    table.integer("master_id").nullable().references("id").inTable(Tables.MASTERS).onDelete("SET NULL");
    table.boolean("email_subscribed").notNullable().defaultTo(true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable(Tables.USERS, (table) => {
    table.dropColumn("email_subscribed");
    table.dropColumn("master_id");
  });
};
