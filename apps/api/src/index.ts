import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// Middleware
// Allow credentials (cookies/auth) from the frontend origin
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.json());

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Nail Salon Management API!");
});

app.get("/welcome", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Nail Salon Management API" });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
