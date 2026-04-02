import express from "express";
import * as settingsController from "../controllers/settingsController";
import { authenticate, requireRole } from "../middleware/auth";

const router = express.Router();

router.get("/", settingsController.getSettings);
router.patch("/:key", authenticate, requireRole("ADMIN"), settingsController.updateSetting);

export default router;
