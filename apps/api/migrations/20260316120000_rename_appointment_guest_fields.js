/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.table("appointments", (table) => {
    table.renameColumn("user_name", "guest_name");
    table.renameColumn("whatsapp_phone", "guest_phone");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.table("appointments", (table) => {
    table.renameColumn("guest_name", "user_name");
    table.renameColumn("guest_phone", "whatsapp_phone");
  });
};
