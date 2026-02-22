import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { Pool } from "pg";

// Only load .env in development; production uses Lambda environment variables
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create adapter with connection pooling for better Lambda performance
const pool = new Pool({
  connectionString,
  min: 1,
  max: 5,
});

const adapter = new PrismaPg(pool);

// Cache PrismaClient in module scope for Lambda container reuse
// This ensures:
// 1. Connection is reused across multiple Lambda invocations
// 2. Only one connection pool per container
// 3. Reduces connection churn and improves performance
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // In production, reuse the existing instance from module cache
  prisma = global.prisma || new PrismaClient({ adapter });
  global.prisma = prisma;
} else {
  // In development, recreate to pick up schema changes during hot reload
  prisma = new PrismaClient({ adapter });
}

export { prisma };
