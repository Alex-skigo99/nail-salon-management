import { Request, Response } from "express";
import { z } from "zod";
import * as settingsService from "../services/settingsService";

// ─────────────────────────────────────────────
// OpenAPI Component Schemas
// ─────────────────────────────────────────────

/**
 * @openapi
 * components:
 *   schemas:
 *     Setting:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         key:
 *           type: string
 *           example: "slot_duration"
 *         value:
 *           type: string
 *           example: "30"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "Duration of a single time slot in minutes"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

// ─────────────────────────────────────────────

const UpdateSettingSchema = z.object({
  value: z.string().min(1),
});

/**
 * @openapi
 * /settings:
 *   get:
 *     summary: Get settings (all or by key)
 *     tags: [Settings]
 *     parameters:
 *       - in: query
 *         name: key
 *         schema: { type: string }
 *         required: false
 *         description: Setting key to retrieve. If omitted, returns all settings.
 *     responses:
 *       200:
 *         description: Setting(s)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Setting'
 *                 - $ref: '#/components/schemas/Setting'
 *       404:
 *         description: Setting not found (when key is specified)
 *       500:
 *         description: Internal server error
 */
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.query;
    if (key && typeof key === "string") {
      const setting = await settingsService.getSettingByKey(key);
      if (!setting) {
        res.status(404).json({ error: "Setting not found" });
        return;
      }
      res.json(setting);
      return;
    }
    const settings = await settingsService.getAllSettings();
    res.json(settings);
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @openapi
 * /settings/{key}:
 *   patch:
 *     summary: Update a setting value (ADMIN only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         schema: { type: string }
 *         required: true
 *         description: The setting key to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [value]
 *             properties:
 *               value:
 *                 type: string
 *                 example: "30"
 *     responses:
 *       200:
 *         description: Updated setting
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Setting'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Setting not found
 *       500:
 *         description: Internal server error
 */
export const updateSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const parsed = UpdateSettingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const updated = await settingsService.updateSetting(key as string, parsed.data.value);
    if (!updated) {
      res.status(404).json({ error: "Setting not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error("Error updating setting:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
