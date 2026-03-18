const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  client: "pg",
  connection: {
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 1,
    max: 5,
  },
  migrations: {
    directory: path.resolve(__dirname, "migrations"),
    tableName: "knex_migrations",
  },
};
