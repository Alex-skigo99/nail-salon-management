const { Tables } = require("../db_names");

/**
 * Add auth-related columns to the users table:
 * - google_id: for Google OAuth linking
 * - image: user avatar URL (from Google profile or uploaded)
 * - Make password nullable (Google-only users don't have passwords)
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable(Tables.USERS, (table) => {
    table.string("google_id").nullable().unique();
    table.text("image").nullable();
  });

  // Make password nullable for Google-only users
  await knex.raw(`ALTER TABLE "${Tables.USERS}" ALTER COLUMN "password" DROP NOT NULL`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // Set a placeholder password for any users without one before making it NOT NULL again
  await knex(Tables.USERS).whereNull("password").update({ password: "placeholder" });

  await knex.raw(`ALTER TABLE "${Tables.USERS}" ALTER COLUMN "password" SET NOT NULL`);

  await knex.schema.alterTable(Tables.USERS, (table) => {
    table.dropColumn("google_id");
    table.dropColumn("image");
  });
};
