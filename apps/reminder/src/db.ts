import dotenv from "dotenv";
import Knex from "knex";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isProduction = process.env.NODE_ENV === "production";

export const db = Knex({
  client: "pg",
  connection: {
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 1,
    max: 2,
  },
});
