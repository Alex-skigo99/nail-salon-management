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

// Start server only in development (not in Lambda)
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
