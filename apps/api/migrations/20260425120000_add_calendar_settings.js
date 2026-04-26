const { Tables } = require("../db_names");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex(Tables.SETTINGS).insert([
    {
      key: "active_calendar",
      value: "internal",
      description: "Active calendar source: 'internal' (app-managed only) or 'icloud' (sync from iCloud CalDAV)",
    },
    {
      key: "calendar_sync_exp",
      value: "rate(1 day)",
      description:
        "EventBridge Scheduler expression used to trigger iCloud calendar sync (cron or rate format, e.g. 'rate(1 day)' or 'cron(0 3 * * ? *)')",
    },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex(Tables.SETTINGS).where({ key: "active_calendar" }).orWhere({ key: "calendar_sync_exp" }).delete();
};
