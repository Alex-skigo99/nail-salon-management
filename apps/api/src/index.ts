import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { knex } from "./lib/db";

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
app.get("/welcome", async (req: Request, res: Response) => {
  const allUsers = await knex("users").select("*");
  console.log("All users:", JSON.stringify(allUsers, null, 2));

  res.json(allUsers);
});

// Start server only in development (not in Lambda)
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
