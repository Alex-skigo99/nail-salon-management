import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { prisma } from "./lib/prisma";

// Only load .env in development; production uses Lambda environment variables
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

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

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Nail Salon Management API!");
});

app.get("/welcome", async (req: Request, res: Response) => {
  // Fetch all users with their posts
  const allUsers = await prisma.user.findMany();
  console.log("All users:", JSON.stringify(allUsers, null, 2));

  res.json(allUsers);
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
