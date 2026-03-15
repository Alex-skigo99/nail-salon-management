import express from "express";
import * as masterController from "../controllers/masterController";
import { authenticate, requireRole } from "../middleware/auth";

const router = express.Router();

router.get("/", authenticate, requireRole("ADMIN"), masterController.getAll);
router.post("/", authenticate, requireRole("ADMIN"), masterController.create);
router.put("/:id", authenticate, requireRole("ADMIN"), masterController.update);
router.delete("/:id", authenticate, requireRole("ADMIN"), masterController.remove);

export default router;
