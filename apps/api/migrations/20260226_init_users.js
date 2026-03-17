exports.up = async function (knex) {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.string("email").notNullable().unique();
    table.string("name");
    table.enu("role", ["USER", "ADMIN"], { useNative: true, enumName: "user_role" }).notNullable().defaultTo("USER");
    table.string("password").notNullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("users");
  await knex.raw("DROP TYPE IF EXISTS user_role");
};
