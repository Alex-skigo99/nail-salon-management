/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("masters", (table) => {
    table.boolean("is_booking_available").notNullable().defaultTo(true);
    table.integer("sorting").notNullable().defaultTo(100);
    table.string("email").nullable();
    table.boolean("is_new_appt_email_notification").notNullable().defaultTo(false);
    table.boolean("is_del_appt_email_notification").notNullable().defaultTo(false);
    table.boolean("is_update_appt_email_notification").notNullable().defaultTo(false);
    table.boolean("is_user_comment_appt_email_notification").notNullable().defaultTo(false);
    table.boolean("is_reschedule_appt_email_notification").notNullable().defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("masters", (table) => {
    table.dropColumn("is_booking_available");
    table.dropColumn("sorting");
    table.dropColumn("email");
    table.dropColumn("is_new_appt_email_notification");
    table.dropColumn("is_del_appt_email_notification");
    table.dropColumn("is_update_appt_email_notification");
    table.dropColumn("is_user_comment_appt_email_notification");
    table.dropColumn("is_reschedule_appt_email_notification");
  });
};
