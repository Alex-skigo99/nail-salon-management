import { Request, Response } from "express";
import { knex } from "../lib/db";

export const welcome = async (_req: Request, res: Response): Promise<void> => {
  try {
    const allUsers = await knex("users").select("*");
    console.log("All users:", JSON.stringify(allUsers, null, 2));
    res.json(allUsers);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
