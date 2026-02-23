"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// Import your Express app
const index_1 = __importDefault(require("./index"));
const prisma_1 = require("./lib/prisma");
// Wrap Express for Lambda
const serverless_http_1 = __importDefault(require("serverless-http"));
// Run migrations on first Lambda invocation
let migrationsRun = false;
const handler = async (event, context) => {
    try {
        if (!migrationsRun) {
            try {
                console.log("Verifying database connection...");
                await prisma_1.prisma.$executeRawUnsafe('SELECT 1');
                console.log("Database connection verified");
                migrationsRun = true;
            }
            catch (error) {
                console.error("Database connection failed:", error);
                // Still allow requests to continue, but log the error
                // The database may be temporarily unavailable but could reconnect
            }
        }
        return (0, serverless_http_1.default)(index_1.default)(event, context);
    }
    catch (error) {
        console.error("Handler execution failed:", error);
        return {
            statusCode: 502,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
};
exports.handler = handler;
