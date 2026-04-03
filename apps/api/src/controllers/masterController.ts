import { Request, Response } from "express";
import { z } from "zod";
import * as masterService from "../services/masterService";
import { MasterCreate, MasterUpdate } from "../types/dbSchemaTypes";

/**
 * @openapi
 * /master:
 *   get:
 *     summary: Retrieve a list of masters
 *     tags:
 *       - Master
 *     responses:
 *       200:
 *         description: A list of masters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Master'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new master (ADMIN only)
 *     tags:
 *       - Master
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MasterCreate'
 *     responses:
 *       201:
 *         description: Created master
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Master'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 *
 * /master/{id}:
 *   put:
 *     summary: Update an existing master (ADMIN only)
 *     tags:
 *       - Master
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the master to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MasterUpdate'
 *     responses:
 *       200:
 *         description: Updated master
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Master'
 *       400:
 *         description: Validation error or invalid id
 *       404:
 *         description: Master not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a master (ADMIN only)
 *     tags:
 *       - Master
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the master to delete
 *     responses:
 *       204:
 *         description: No content (deleted)
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Master not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     Master:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Jane Doe"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "Senior nail technician"
 *         image:
 *           type: string
 *           nullable: true
 *           description: Presigned URL or null
 *         is_booking_available:
 *           type: boolean
 *           example: true
 *         sorting:
 *           type: integer
 *           example: 100
 *         email:
 *           type: string
 *           nullable: true
 *           example: "jane@example.com"
 *         is_new_appt_email_notification:
 *           type: boolean
 *           example: false
 *         is_del_appt_email_notification:
 *           type: boolean
 *           example: false
 *         is_update_appt_email_notification:
 *           type: boolean
 *           example: false
 *         is_user_comment_appt_email_notification:
 *           type: boolean
 *           example: false
 *         is_reschedule_appt_email_notification:
 *           type: boolean
 *           example: false
 *     MasterCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Jane Doe"
 *         description:
 *           type: string
 *           nullable: true
 *         image:
 *           type: string
 *           nullable: true
 *           description: S3 key returned from upload endpoint
 *         is_booking_available:
 *           type: boolean
 *         sorting:
 *           type: integer
 *         email:
 *           type: string
 *           nullable: true
 *         is_new_appt_email_notification:
 *           type: boolean
 *         is_del_appt_email_notification:
 *           type: boolean
 *         is_update_appt_email_notification:
 *           type: boolean
 *         is_user_comment_appt_email_notification:
 *           type: boolean
 *         is_reschedule_appt_email_notification:
 *           type: boolean
 *     MasterUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Jane Doe"
 *         description:
 *           type: string
 *           nullable: true
 *         image:
 *           type: string
 *           nullable: true
 *           description: S3 key returned from upload endpoint
 *         is_booking_available:
 *           type: boolean
 *         sorting:
 *           type: integer
 *         email:
 *           type: string
 *           nullable: true
 *         is_new_appt_email_notification:
 *           type: boolean
 *         is_del_appt_email_notification:
 *           type: boolean
 *         is_update_appt_email_notification:
 *           type: boolean
 *         is_user_comment_appt_email_notification:
 *           type: boolean
 *         is_reschedule_appt_email_notification:
 *           type: boolean
 */

const OptionalMasterSchema = z.object({
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  is_booking_available: z.boolean().optional(),
  sorting: z.number().int().optional(),
  email: z.email().nullable().optional(),
  is_new_appt_email_notification: z.boolean().optional(),
  is_del_appt_email_notification: z.boolean().optional(),
  is_update_appt_email_notification: z.boolean().optional(),
  is_user_comment_appt_email_notification: z.boolean().optional(),
  is_reschedule_appt_email_notification: z.boolean().optional(),
});

const CreateMasterSchema = z
  .object({
    name: z.string().min(1),
  })
  .merge(OptionalMasterSchema);

const UpdateMasterSchema = z
  .object({
    name: z.string().min(1).optional(),
  })
  .merge(OptionalMasterSchema);

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
    const master = await masterService.createMaster(parsed.data as MasterCreate);
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
    const master = await masterService.updateMaster(id, parsed.data as MasterUpdate);
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
