import { Request, Response } from "express";
import { z } from "zod";
import * as workingHoursService from "../services/workingHoursService";

const WorkingHoursRecordSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:MM"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:MM"),
});

const ReplaceWorkingHoursSchema = z.object({
  master_id: z.number().int().positive(),
  records: z.array(WorkingHoursRecordSchema),
});

export const getByMaster = async (req: Request, res: Response): Promise<void> => {
  try {
    const masterId = Number(req.query.master_id);
    if (isNaN(masterId)) {
      res.status(400).json({ error: "master_id query param is required" });
      return;
    }
    const hours = await workingHoursService.getWorkingHoursByMaster(masterId);
    res.json(hours);
  } catch (err) {
    console.error("Error fetching working hours:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const replace = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = ReplaceWorkingHoursSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const { master_id, records } = parsed.data;
    const hours = await workingHoursService.replaceWorkingHours(master_id, records);
    res.status(201).json(hours);
  } catch (err) {
    console.error("Error replacing working hours:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeByMaster = async (req: Request, res: Response): Promise<void> => {
  try {
    const masterId = Number(req.query.master_id);
    if (isNaN(masterId)) {
      res.status(400).json({ error: "master_id query param is required" });
      return;
    }
    await workingHoursService.deleteWorkingHoursByMaster(masterId);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting working hours:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
