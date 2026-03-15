import { Request, Response } from "express";
import { z } from "zod";
import * as serviceService from "../services/serviceService";

/**
 * @openapi
 * /services:
 *   get:
 *     summary: Get all services
 *     tags:
 *       - Services
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *   post:
 *     summary: Create a new service (ADMIN only)
 *     tags:
 *       - Services
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateService'
 *     responses:
 *       201:
 *         description: Created service
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *
 * /services/{id}:
 *   put:
 *     summary: Update a service (ADMIN only)
 *     tags:
 *       - Services
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateService'
 *     responses:
 *       200:
 *         description: Updated service
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Service not found
 *   delete:
 *     summary: Delete a service (ADMIN only)
 *     tags:
 *       - Services
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: No content
 *
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         category:
 *           type: string
 *           enum: [manicure, pedicure, other]
 *         price:
 *           type: string
 *           description: Price as string with two decimals
 *         duration_minutes:
 *           type: integer
 *     CreateService:
 *       type: object
 *       required: [name, category, price, duration_minutes]
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         category:
 *           type: string
 *           enum: [manicure, pedicure, other]
 *         price:
 *           type: string
 *           pattern: '^\\d+(\\.\\d{1,2})?$'
 *         duration_minutes:
 *           type: integer
 *     UpdateService:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateService'
 *       nullable: true
 */

const CreateServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.enum(["manicure", "pedicure", "other"]),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  duration_minutes: z.number().int().min(0),
});

const UpdateServiceSchema = CreateServiceSchema.partial();

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await serviceService.getAllServices();
    res.json(services);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = CreateServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const service = await serviceService.createService(parsed.data);
    res.status(201).json(service);
  } catch (err) {
    console.error("Error creating service:", err);
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
    const parsed = UpdateServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const service = await serviceService.updateService(id, parsed.data);
    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.json(service);
  } catch (err) {
    console.error("Error updating service:", err);
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
    const deleted = await serviceService.deleteService(id);
    if (!deleted) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting service:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
