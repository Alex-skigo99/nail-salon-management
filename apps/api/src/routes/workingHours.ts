import express from "express";
import * as workingHoursController from "../controllers/workingHoursController";
import { authenticate, requireRole } from "../middleware/auth";

const router = express.Router();

router.get("/", authenticate, requireRole("ADMIN"), workingHoursController.getByMaster);
router.post("/", authenticate, requireRole("ADMIN"), workingHoursController.replace);
router.delete("/", authenticate, requireRole("ADMIN"), workingHoursController.removeByMaster);

export default router;
