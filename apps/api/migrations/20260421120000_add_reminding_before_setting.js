const { Tables } = require("../db_names");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex(Tables.SETTINGS).insert([
    {
      key: "reminding_before",
      value: "1",
      description: "Days before the appointment to send a WhatsApp reminder (1–10, 0 means disabled)",
    },
    {
      key: "reminding_time",
      value: "10:00",
      description: "Time of day to send WhatsApp reminders (HH:mm, 24-hour format, e.g. 09:00 or 18:30)",
    },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex(Tables.SETTINGS).where({ key: "reminding_before" }).orWhere({ key: "reminding_time" }).delete();
};
