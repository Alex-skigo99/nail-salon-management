// Import your Express app
import app from "./index";
import { prisma } from "./lib/prisma";

// Wrap Express for Lambda
import serverless from "serverless-http";

// Run migrations on first Lambda invocation
let migrationsRun = false;

export const handler = async (event: any, context: any) => {
  if (!migrationsRun) {
    try {
      console.log("Running Prisma migrations...");
      await prisma.$executeRawUnsafe(
        'SELECT 1' // Test connection
      );
      console.log("Database connection verified");
      migrationsRun = true;
    } catch (error) {
      console.error("Migration/database check failed:", error);
      throw error;
    }
  }

  return serverless(app)(event, context);
};
