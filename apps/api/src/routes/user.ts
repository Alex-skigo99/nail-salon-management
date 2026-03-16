import express from "express";
import * as userController from "../controllers/userController";
import { authenticate, requireRole } from "../middleware/auth";

const router = express.Router();

router.get("/", authenticate, requireRole("ADMIN"), userController.getAll);
router.get("/:id", authenticate, requireRole("ADMIN"), userController.getById);
router.post("/", authenticate, requireRole("ADMIN"), userController.create);
router.put("/:id", authenticate, requireRole("ADMIN"), userController.update);
router.delete("/:id", authenticate, requireRole("ADMIN"), userController.remove);

export default router;
