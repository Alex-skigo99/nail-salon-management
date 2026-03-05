import { Request, Response } from "express";
import { z } from "zod";
import * as serviceService from "../services/serviceService";

const CreateServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.enum(["manicure", "pedicure", "other"]),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  duration_minutes: z.number().int().positive(),
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
