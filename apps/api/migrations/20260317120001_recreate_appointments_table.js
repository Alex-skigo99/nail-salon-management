const { Tables } = require("../db_names");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(Tables.APPOINTMENTS, (table) => {
    table.increments("id").primary();

    // Master reference
    table.integer("master_id").notNullable().references("id").inTable(Tables.MASTERS).onDelete("CASCADE");

    // Client info – either a registered user or a walk-in
    table.uuid("user_id").nullable().references("id").inTable(Tables.USERS).onDelete("SET NULL");
    table.string("guest_name").nullable();
    table.string("guest_phone").nullable();

    // Scheduling
    table.date("date").notNullable();
    table.time("time").notNullable(); // start time (HH:MM:SS)
    table.integer("duration_minutes").notNullable().defaultTo(30);

    // Status
    table.enum("status", ["new", "confirmed", "reserved", "pending", "rejected"]).notNullable().defaultTo("new");

    // Details
    table.text("services").nullable(); // comma-separated or JSON string of service names/ids
    table.text("comments").nullable(); // free-text comment from the client

    // Audit
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists(Tables.APPOINTMENTS);
};
