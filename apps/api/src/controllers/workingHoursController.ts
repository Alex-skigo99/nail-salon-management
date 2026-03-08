import { Request, Response } from "express";
import { z } from "zod";
import * as workingHoursService from "../services/workingHoursService";

/**
 * @openapi
 * /working-hours:
 *   get:
 *     summary: Get working hours for a master
 *     tags:
 *       - WorkingHours
 *     parameters:
 *       - name: master_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Working hours list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkingHoursRecord'
 *
 *   post:
 *     summary: Replace working hours for a master
 *     tags:
 *       - WorkingHours
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReplaceWorkingHours'
 *     responses:
 *       201:
 *         description: Created/Updated working hours
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkingHoursRecord'
 *
 *   delete:
 *     summary: Delete working hours for a master
 *     tags:
 *       - WorkingHours
 *     parameters:
 *       - name: master_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: No content
 *
 * components:
 *   schemas:
 *     WorkingHoursRecord:
 *       type: object
 *       properties:
 *         day_of_week:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *         start_time:
 *           type: string
 *           pattern: '^\\d{2}:\\d{2}$'
 *         end_time:
 *           type: string
 *           pattern: '^\\d{2}:\\d{2}$'
 *     ReplaceWorkingHours:
 *       type: object
 *       required: [master_id, records]
 *       properties:
 *         master_id:
 *           type: integer
 *         records:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WorkingHoursRecord'
 */

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
