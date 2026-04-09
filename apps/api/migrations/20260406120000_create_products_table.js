const { Tables } = require("../db_names");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(Tables.PRODUCTS, (table) => {
    table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()")).primary();
    table.string("title").notNullable();
    table.text("description");
    table.decimal("price", 10, 2).notNullable();
    table.decimal("discount", 10, 2).nullable().defaultTo(0);
    table.string("type");
    table.integer("quantity").notNullable().defaultTo(0);
    table.string("image");
    table.boolean("is_available").notNullable().defaultTo(true);
    table.boolean("is_home_display").notNullable().defaultTo(false);
    table.integer("home_sorting").notNullable().defaultTo(100);
    table.text("comment").nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists(Tables.PRODUCTS);
};
