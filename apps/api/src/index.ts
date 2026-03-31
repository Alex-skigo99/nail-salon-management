import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// dotenv.config() must run BEFORE these imports so that env vars
// (e.g. AWS_ENDPOINT_URL) are available when modules initialise.
import express from "express";
import app from "./app";

// DEV ONLY: serve swagger UI if openapi.json exists and swagger-ui-express is installed
if (process.env.NODE_ENV !== "production") {
  (async () => {
    try {
      const swaggerModule = await import("swagger-ui-express");
      const swaggerUi = (swaggerModule as { default?: unknown }).default ?? swaggerModule;
      const openapiModule = await import("../openapi.json");
      const openapi = (openapiModule as { default?: unknown }).default ?? openapiModule;
      const serve = (swaggerUi as unknown as { serve: express.RequestHandler }).serve;
      const setup = (
        swaggerUi as unknown as {
          setup: (doc: unknown) => express.RequestHandler;
        }
      ).setup;
      app.use("/docs", serve, setup(openapi));
      console.log("Swagger UI available at /docs (dev only)");
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      console.warn(
        "Swagger UI not available (dev-only). Install swagger-ui-express and generate openapi.json to enable it.",
        errMessage
      );
    }
  })();
}

// Start server only in development (not in Lambda)
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
