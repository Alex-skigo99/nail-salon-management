import express, { Express } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import masterRouter from "./routes/master";
import workingHoursRouter from "./routes/workingHours";
import serviceRouter from "./routes/service";
import welcomeRouter from "./routes/welcome";

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

// Routes
app.use("/welcome", welcomeRouter);
app.use("/master", masterRouter);
app.use("/working_hours", workingHoursRouter);
app.use("/service", serviceRouter);

// DEV ONLY: serve swagger UI if openapi.json exists and swagger-ui-express is installed
if (process.env.NODE_ENV !== "production") {
  try {
    // require here so production lambda doesn't include the dev-only dependency unless installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const swaggerUi = require("swagger-ui-express");
    // Trying to load generated openapi.json in package root
    // Note: Ensure you run `npm run gen:openapi` before starting dev server
    // or the require will fail; this is fine — it simply skips docs until the spec is generated.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const openapi = require("../openapi.json");
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
    console.log("Swagger UI available at /docs (dev only)");
  } catch (err: any) {
    console.warn(
      "Swagger UI not available (dev-only). Install swagger-ui-express and generate openapi.json to enable it.",
      err?.message
    );
  }
}

// Start server only in development (not in Lambda)
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
