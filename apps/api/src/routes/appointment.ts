import express from "express";
import * as appointmentController from "../controllers/appointmentController";
import { requireRole } from "../middleware/auth";

const router = express.Router();

// ── Static / parameterless routes first to avoid Express ambiguity ──

// GET /appointment/slots/available?masterId=&date=&time=&duration=
router.get("/slots/available", appointmentController.checkAvailability);

// GET /appointment/suggestions?masterId=
router.get("/suggestions", appointmentController.getSuggestions);

// ── Master-scoped routes ──

// GET /appointment/master/:masterId?from=&to=
router.get("/master/:masterId", appointmentController.getMasterAppointments);

// GET /appointment/master/:masterId/slots?from=&to= (ADMIN only)
router.get("/master/:masterId/slots", requireRole("ADMIN"), appointmentController.getSlotsMap);

// GET /appointment/master/:masterId/empty_slots?from=&to=
router.get("/master/:masterId/empty_slots", appointmentController.getEmptySlots);

// ── CRUD ──

// POST /appointment
router.post("/", appointmentController.create);

// PUT /appointment/:id/reschedule  (move date/time with availability check)
router.put("/:id/reschedule", appointmentController.reschedule);

// PUT /appointment/:id  (edit non-scheduling fields)
router.put("/:id", appointmentController.update);

// DELETE /appointment/:id
router.delete("/:id", appointmentController.remove);

export default router;
