// Import your Express app
import app from "./index";
import { prisma } from "./lib/prisma";

import serverless from "serverless-http";

// Run migrations on first Lambda invocation
let migrationsRun = false;

export const handler = async (event: any, context: any) => {
  try {
    console.log("Lambda handler invoked with event:", JSON.stringify(event));

    if (!migrationsRun) {
      try {
        console.log("Verifying database connection...");
        await prisma.$executeRawUnsafe("SELECT 1");
        console.log("Database connection verified");
        migrationsRun = true;
      } catch (error) {
        console.error("Database connection failed:", error);
        // Still allow requests to continue, but log the error
        // The database may be temporarily unavailable but could reconnect
      }
    }

    return serverless(app)(event, context);
  } catch (error) {
    console.error("Handler execution failed:", error);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
