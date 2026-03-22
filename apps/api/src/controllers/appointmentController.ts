import { Request, Response } from "express";
import { z } from "zod";
import * as appointmentService from "../services/appointmentService";
import type { SlotStatus } from "../types/appointmentTypes";

// ─────────────────────────────────────────────
// Validation schemas
// ─────────────────────────────────────────────

const AppointmentStatusEnum = z.enum(["new", "confirmed", "reserved", "pending", "rejected"]);

const CreateAppointmentSchema = z.object({
  master_id: z.number().int().positive(),
  user_id: z.uuid().optional().nullable(),
  guest_name: z.string().optional().nullable(),
  guest_phone: z.string().optional().nullable(),
  need_store_phone: z.boolean().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "time must be HH:MM or HH:MM:SS"),
  duration_minutes: z.number().int().positive(),
  services: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
  status: AppointmentStatusEnum.optional(),
});

const UpdateAppointmentSchema = z.object({
  user_id: z.uuid().optional().nullable(),
  guest_name: z.string().optional().nullable(),
  guest_phone: z.string().optional().nullable(),
  services: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
  status: AppointmentStatusEnum.optional(),
});

const RescheduleSchema = z.object({
  master_id: z.number().int().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "time must be HH:MM or HH:MM:SS"),
  duration_minutes: z.number().int().positive().optional(),
  services: z.string().optional().nullable(),
});

// ─────────────────────────────────────────────
// OpenAPI Component Schemas
// ─────────────────────────────────────────────

/**
 * @openapi
 * components:
 *   schemas:
 *     AppointmentCreate:
 *       type: object
 *       required:
 *         - master_id
 *         - date
 *         - time
 *         - duration_minutes
 *       properties:
 *         master_id:
 *           type: integer
 *           example: 1
 *         user_id:
 *           type: integer
 *           nullable: true
 *           example: null
 *         guest_name:
 *           type: string
 *           nullable: true
 *           example: "John Doe"
 *         guest_phone:
 *           type: string
 *           nullable: true
 *           example: "+1234567890"
 *         need_store_phone:
 *           type: boolean
 *           description: Save provided guest_phone to the user profile when user_id is present
 *           example: true
 *         date:
 *           type: string
 *           format: date
 *           example: "2026-03-15"
 *         time:
 *           type: string
 *           example: "10:00"
 *           description: "Time in HH:MM or HH:MM:SS format"
 *         duration_minutes:
 *           type: integer
 *           example: 60
 *         services:
 *           type: string
 *           nullable: true
 *           example: "Manicure, Pedicure"
 *         comments:
 *           type: string
 *           nullable: true
 *           example: "Any special requests"
 *         status:
 *           type: string
 *           enum: ["new", "confirmed", "reserved", "pending", "rejected"]
 *           default: "new"
 *     AppointmentUpdate:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           nullable: true
 *           example: null
 *         guest_name:
 *           type: string
 *           nullable: true
 *           example: "John Doe"
 *         guest_phone:
 *           type: string
 *           nullable: true
 *           example: "+1234567890"
 *         services:
 *           type: string
 *           nullable: true
 *           example: "Manicure, Pedicure"
 *         comments:
 *           type: string
 *           nullable: true
 *           example: "Any special requests"
 *         status:
 *           type: string
 *           enum: ["new", "confirmed", "reserved", "pending", "rejected"]
 *     AppointmentReschedule:
 *       type: object
 *       required:
 *         - date
 *         - time
 *       properties:
 *         master_id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *           description: "New master for the appointment (optional, defaults to current master)"
 *         date:
 *           type: string
 *           format: date
 *           example: "2026-03-15"
 *         time:
 *           type: string
 *           example: "10:00"
 *           description: "Time in HH:MM or HH:MM:SS format"
 *         duration_minutes:
 *           type: integer
 *           nullable: true
 *           example: 60
 *         services:
 *           type: string
 *           nullable: true
 *           example: "Manicure, Pedicure"
 *     TimeSlot:
 *       type: object
 *       required:
 *         - date
 *         - time
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           example: "2026-03-15"
 *         time:
 *           type: string
 *           example: "10:00"
 */

// ─────────────────────────────────────────────

/**
 * @openapi
 * /appointment:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentCreate'
 *     responses:
 *       201:
 *         description: Created appointment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation error or slot unavailable
 *       409:
 *         description: The requested time slot is not available
 *       500:
 *         description: Internal server error
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = CreateAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const appt = await appointmentService.createAppointment(parsed.data);
    res.status(201).json(appt);
  } catch (err: unknown) {
    if ((err as { message?: string })?.message === "SLOT_UNAVAILABLE") {
      res.status(409).json({ error: "The requested time slot is not available" });
      return;
    }
    console.error("Error creating appointment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @openapi
 * /appointment/{id}:
 *   put:
 *     summary: Update non-scheduling fields of an appointment (ADMIN only)
 *     tags: [Appointment]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentUpdate'
 *     responses:
 *       200:
 *         description: Updated appointment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation error or invalid id
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = UpdateAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const appt = await appointmentService.updateAppointment(id, parsed.data);
    if (!appt) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }
    res.json(appt);
  } catch (err) {
    console.error("Error updating appointment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @openapi
 * /appointment/{id}/reschedule:
 *   put:
 *     summary: Move appointment to a new date/time (checks availability) (ADMIN only)
 *     tags: [Appointment]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentReschedule'
 *     responses:
 *       200:
 *         description: Rescheduled appointment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation error or invalid id
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Slot unavailable
 *       500:
 *         description: Internal server error
 */
export const reschedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = RescheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const appt = await appointmentService.rescheduleAppointment(id, parsed.data);
    res.json(appt);
  } catch (err: unknown) {
    if ((err as { message?: string })?.message === "APPOINTMENT_NOT_FOUND") {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }
    if ((err as { message?: string })?.message === "SLOT_UNAVAILABLE") {
      res.status(409).json({ error: "The requested time slot is not available" });
      return;
    }
    console.error("Error rescheduling appointment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @openapi
 * /appointment/{id}:
 *   delete:
 *     summary: Delete an appointment
 *     tags: [Appointment]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       204:
 *         description: Deleted successfully (no content)
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const deleted = await appointmentService.deleteAppointment(id);
    if (!deleted) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting appointment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @openapi
 * /appointment/master/{masterId}:
 *   get:
 *     summary: Get all appointments for a master within a date range
 *     tags: [Appointment]
 *     parameters:
 *       - in: path
 *         name: masterId
 *         schema: { type: integer }
 *         required: true
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-03-01" }
 *         required: true
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-03-31" }
 *         required: true
 *     responses:
 *       200:
 *         description: Array of appointments
 *         content:
 *          application/json:
 *            schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/AppointmentRetrieve'
 *       400:
 *         description: Missing or invalid parameters
 *       500:
 *         description: Internal server error
 */
export const getMasterAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const masterId = Number(req.params.masterId);
    if (isNaN(masterId)) {
      res.status(400).json({ error: "Invalid masterId" });
      return;
    }
    const { from, to } = req.query;
    if (!from || !to || typeof from !== "string" || typeof to !== "string") {
      res.status(400).json({ error: "Query params 'from' and 'to' (YYYY-MM-DD) are required" });
      return;
    }
    const appointments = await appointmentService.getAppointmentsForMaster(masterId, from, to);
    res.json(appointments);
  } catch (err) {
    console.error("Error fetching master appointments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @openapi
 * /appointment/master/{masterId}/slots:
 *   get:
 *     summary: Get slot map for a master over a date range (ADMIN only)
 *     description: >
 *       Returns one entry per day containing the date, working hours, slot duration,
 *       slot count, and an array of slots where each slot has status:
 *       empty | book | part_book | reserved | none. Only ADMIN can access this endpoint.
 *     tags: [Appointment]
 *     parameters:
 *       - in: path
 *         name: masterId
 *         schema: { type: integer }
 *         required: true
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-03-01" }
 *         required: true
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-03-07" }
 *         required: true
 *     responses:
 *       200:
 *         description: Array of DaySlots objects
 *         content:
 *          application/json:
 *            schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/DaySlots'
 *       400:
 *         description: Missing or invalid parameters
 *       500:
 *         description: Internal server error
 */
export const getSlotsMap = async (req: Request, res: Response): Promise<void> => {
  try {
    const masterId = Number(req.params.masterId);
    if (isNaN(masterId)) {
      res.status(400).json({ error: "Invalid masterId" });
      return;
    }
    const { from, to } = req.query;
    if (!from || !to || typeof from !== "string" || typeof to !== "string") {
      res.status(400).json({ error: "Query params 'from' and 'to' (YYYY-MM-DD) are required" });
      return;
    }
    const slotsMap = await appointmentService.getSlotsMap(masterId, from, to);
    res.json(slotsMap);
  } catch (err) {
    console.error("Error fetching slots map:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @openapi
 * /appointment/master/{masterId}/empty_slots:
 *   get:
 *     summary: Get empty slots for a master over a date range
 *     description: >
 *       Returns one entry per day containing the date, working hours, slot duration,
 *       slot count, and an array of slots where each slot has status:
 *       empty | book | part_book | reserved | none.
 *     tags: [Appointment]
 *     parameters:
 *       - in: path
 *         name: masterId
 *         schema: { type: integer }
 *         required: true
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-03-01" }
 *         required: true
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-03-07" }
 *         required: true
 *     responses:
 *       200:
 *         description: Array of DaySlots objects
 *         content:
 *          application/json:
 *            schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/DaySlots'
 *       400:
 *         description: Missing or invalid parameters
 *       500:
 *         description: Internal server error
 */
export const getEmptySlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const masterId = Number(req.params.masterId);
    if (isNaN(masterId)) {
      res.status(400).json({ error: "Invalid masterId" });
      return;
    }
    const { from, to } = req.query;
    if (!from || !to || typeof from !== "string" || typeof to !== "string") {
      res.status(400).json({ error: "Query params 'from' and 'to' (YYYY-MM-DD) are required" });
      return;
    }
    const slotStatusFilter: SlotStatus = "empty";
    const emptySlots = await appointmentService.getSlotsMap(masterId, from, to, slotStatusFilter);
    res.json(emptySlots);
  } catch (err) {
    console.error("Error fetching slots map:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @openapi
 * /appointment/slots/available:
 *   get:
 *     summary: Check if a slot is available; if not, return suggestions
 *     description: >
 *       Checks whether the requested masterId/date/time/duration slot is free.
 *       If occupied, returns suggestions: same-day slots just before & after the
 *       requested time, plus the nearest available days that have the same time.
 *     tags: [Appointment]
 *     parameters:
 *       - in: query
 *         name: masterId
 *         schema: { type: integer }
 *         required: true
 *       - in: query
 *         name: date
 *         schema: { type: string, example: "2026-03-10" }
 *         required: true
 *       - in: query
 *         name: time
 *         schema: { type: string, example: "10:00" }
 *         required: true
 *       - in: query
 *         name: duration
 *         schema: { type: integer, example: 60 }
 *         required: true
 *     responses:
 *       200:
 *         description: Availability result - either available slot or suggestions for alternatives
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   required: [available, slot]
 *                   properties:
 *                     available:
 *                       type: boolean
 *                       enum: [true]
 *                     slot:
 *                       $ref: '#/components/schemas/TimeSlot'
 *                   additionalProperties: false
 *                 - type: object
 *                   required: [available, suggestions]
 *                   properties:
 *                     available:
 *                       type: boolean
 *                       enum: [false]
 *                     suggestions:
 *                       type: object
 *                       required: [same_day, same_time]
 *                       properties:
 *                         same_day:
 *                           type: object
 *                           required: [before, after]
 *                           properties:
 *                             before:
 *                               oneOf:
 *                                 - type: "null"
 *                                 - $ref: '#/components/schemas/TimeSlot'
 *                             after:
 *                               oneOf:
 *                                 - type: "null"
 *                                 - $ref: '#/components/schemas/TimeSlot'
 *                         same_time:
 *                           type: object
 *                           required: [before, after]
 *                           properties:
 *                             before:
 *                               oneOf:
 *                                 - type: "null"
 *                                 - $ref: '#/components/schemas/TimeSlot'
 *                             after:
 *                               oneOf:
 *                                 - type: "null"
 *                                 - $ref: '#/components/schemas/TimeSlot'
 *                   additionalProperties: false
 *       400:
 *         description: Missing or invalid parameters
 *       500:
 *         description: Internal server error
 */
export const checkAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { masterId, date, time, duration } = req.query;

    if (!masterId || !date || !time || !duration) {
      res.status(400).json({ error: "Query params 'masterId', 'date', 'time', and 'duration' are required" });
      return;
    }

    const masterIdNum = Number(masterId);
    const durationNum = Number(duration);

    if (isNaN(masterIdNum) || isNaN(durationNum)) {
      res.status(400).json({ error: "'masterId' and 'duration' must be numbers" });
      return;
    }

    const result = await appointmentService.checkAvailability(masterIdNum, String(date), String(time), durationNum);

    res.json(result);
  } catch (err) {
    console.error("Error checking availability:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @openapi
 * /appointment/suggestions:
 *   get:
 *     summary: Get up to 6 appointment slot suggestions grouped by master
 *     description: >
 *       Returns upcoming empty time slots grouped by master.
 *       If masterId is provided, returns only that master.
 *     tags: [Appointment]
 *     parameters:
 *       - in: query
 *         name: masterId
 *         schema: { type: integer }
 *         required: false
 *     responses:
 *       200:
 *         description: Array of grouped suggestions by master
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 required: [master, slots]
 *                 properties:
 *                   master:
 *                     $ref: '#/components/schemas/Master'
 *                   slots:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/TimeSlot'
 *       400:
 *         description: Invalid masterId
 *       500:
 *         description: Internal server error
 */
export const getSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const queryMasterId = req.query.masterId;
    let masterId: number | undefined;

    if (queryMasterId !== undefined) {
      masterId = Number(queryMasterId);
      if (isNaN(masterId)) {
        res.status(400).json({ error: "Query param 'masterId' must be a number" });
        return;
      }
    }

    const suggestions = await appointmentService.getSuggestionsByMaster(masterId);
    res.json(suggestions);
  } catch (err) {
    console.error("Error fetching suggestions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const UpdateCommentSchema = z.object({
  comments: z.string().nullable(),
});

/**
 * @openapi
 * /appointment/{id}:
 *   patch:
 *     summary: Update the comment of an appointment
 *     tags: [Appointment]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comments]
 *             properties:
 *               comments:
 *                 type: string
 *                 nullable: true
 *                 example: "Please use gel polish"
 *     responses:
 *       200:
 *         description: Updated appointment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation error or invalid id
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = UpdateCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const appt = await appointmentService.updateAppointmentComment(id, parsed.data.comments);
    if (!appt) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }
    res.json(appt);
  } catch (err) {
    console.error("Error updating appointment comment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @openapi
 * /appointment/user/{userId}:
 *   get:
 *     summary: Get appointments for a user with pagination and optional date filters
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema: { type: string, format: uuid }
 *         required: true
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-01-01" }
 *         description: Filter appointments from this date (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-12-31" }
 *         description: Filter appointments up to this date (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AppointmentRetrieve'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 *                     from:
 *                       type: integer
 *                     to:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     lastPage:
 *                       type: integer
 *                     prevPage:
 *                       type: integer
 *                     nextPage:
 *                       type: integer
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
export const getUserAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }

    const page = req.query.page ? Number(req.query.page) : 1;
    const perPage = req.query.perPage ? Number(req.query.perPage) : 10;
    if (isNaN(page) || page < 1) {
      res.status(400).json({ error: "Query param 'page' must be a positive integer" });
      return;
    }
    if (isNaN(perPage) || perPage < 1) {
      res.status(400).json({ error: "Query param 'perPage' must be a positive integer" });
      return;
    }

    const { from, to } = req.query;
    const result = await appointmentService.getAppointmentsByUserId({
      userId: userId as string,
      from: typeof from === "string" ? from : undefined,
      to: typeof to === "string" ? to : undefined,
      page,
      perPage,
    });
    res.json(result);
  } catch (err) {
    console.error("Error fetching user appointments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
