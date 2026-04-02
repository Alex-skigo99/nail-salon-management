const { Tables } = require("../db_names");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex(Tables.SETTINGS).insert({
    key: "booking_period",
    value: "30",
    description: "Number of days forward clients can schedule appointments",
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex(Tables.SETTINGS).where({ key: "booking_period" }).delete();
};
