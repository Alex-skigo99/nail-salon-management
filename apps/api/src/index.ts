import express, { Express } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import masterRouter from "./routes/master";
import workingHoursRouter from "./routes/workingHours";
import serviceRouter from "./routes/service";
import welcomeRouter from "./routes/welcome";
import appointmentRouter from "./routes/appointment";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app: Express = express();
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.use("/auth", authRouter);
app.use("/welcome", welcomeRouter);
app.use("/master", masterRouter);
app.use("/working_hours", workingHoursRouter);
app.use("/service", serviceRouter);
app.use("/appointment", appointmentRouter);
app.use("/user", userRouter);

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
