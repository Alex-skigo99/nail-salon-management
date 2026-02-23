"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../../generated/prisma/client");
const pg_1 = require("pg");
// Only load .env in development; production uses Lambda environment variables
if (process.env.NODE_ENV !== "production") {
    dotenv_1.default.config();
}
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    const message = "DATABASE_URL environment variable is not set";
    if (process.env.NODE_ENV === "production") {
        console.error(message);
        throw new Error(message);
    }
    throw new Error(message);
}
// Create adapter with connection pooling for better Lambda performance
const pool = new pg_1.Pool({
    connectionString,
    min: 1,
    max: 5,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
// Cache PrismaClient in module scope for Lambda container reuse
// This ensures:
// 1. Connection is reused across multiple Lambda invocations
// 2. Only one connection pool per container
// 3. Reduces connection churn and improves performance
let prisma;
if (process.env.NODE_ENV === "production") {
    // In production, reuse the existing instance from module cache
    exports.prisma = prisma = global.prisma || new client_1.PrismaClient({ adapter });
    global.prisma = prisma;
}
else {
    // In development, recreate to pick up schema changes during hot reload
    exports.prisma = prisma = new client_1.PrismaClient({ adapter });
}
