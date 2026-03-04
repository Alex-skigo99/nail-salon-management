import { Request, Response } from "express";
import { z } from "zod";
import * as masterService from "../services/masterService";

const CreateMasterSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const UpdateMasterSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
});

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const masters = await masterService.getAllMasters();
    res.json(masters);
  } catch (err) {
    console.error("Error fetching masters:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = CreateMasterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const master = await masterService.createMaster(parsed.data);
    res.status(201).json(master);
  } catch (err) {
    console.error("Error creating master:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = UpdateMasterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const master = await masterService.updateMaster(id, parsed.data);
    if (!master) {
      res.status(404).json({ error: "Master not found" });
      return;
    }
    res.json(master);
  } catch (err) {
    console.error("Error updating master:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const deleted = await masterService.deleteMaster(id);
    if (!deleted) {
      res.status(404).json({ error: "Master not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting master:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
