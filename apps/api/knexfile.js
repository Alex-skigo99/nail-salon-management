const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

module.exports = {
  client: "pg",
  connection: connectionString,
  pool: {
    min: 1,
    max: 5,
  },
  migrations: {
    directory: path.resolve(__dirname, "migrations"),
    tableName: "knex_migrations",
  },
};
