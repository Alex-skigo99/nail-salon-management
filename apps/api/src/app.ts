import express, { Express } from "express";
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
import uploadRouter from "./routes/upload";
import settingsRouter from "./routes/settings";

const app: Express = express();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: frontendUrl.split(","),
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
app.use("/upload", uploadRouter);
app.use("/settings", settingsRouter);

export default app;
