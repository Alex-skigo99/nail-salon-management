import path from "path";
import dotenv from "dotenv";
import { knex, type Knex } from "knex";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  const message = "DATABASE_URL environment variable is not set";
  console.error(message);
  throw new Error(message);
}

const migrationsDirectory = path.resolve(process.cwd(), "migrations");

const isProduction = process.env.NODE_ENV === "production";

const config: Knex.Config = {
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
    directory: migrationsDirectory,
    tableName: "knex_migrations",
  },
};

const createInstance = () => knex(config);

const globalRef = globalThis as typeof globalThis & { __db?: Knex };

let instance: Knex;

if (isProduction) {
  instance = globalRef.__db || createInstance();
  globalRef.__db = instance;
} else {
  instance = createInstance();
}

export { instance as knex };
