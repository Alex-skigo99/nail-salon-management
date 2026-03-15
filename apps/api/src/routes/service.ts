import express from "express";
import * as serviceController from "../controllers/serviceController";
import { authenticate, requireRole } from "../middleware/auth";

const router = express.Router();

router.get("/", serviceController.getAll);
router.post("/", authenticate, requireRole("ADMIN"), serviceController.create);
router.put("/:id", authenticate, requireRole("ADMIN"), serviceController.update);
router.delete("/:id", authenticate, requireRole("ADMIN"), serviceController.remove);

export default router;
