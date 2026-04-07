import express from "express";
import * as productController from "../controllers/productController";
import { authenticate, requireRole } from "../middleware/auth";

const router = express.Router();

// Public
router.get("/home", productController.getHomeProducts);

// Admin only
router.get("/", authenticate, requireRole("ADMIN"), productController.getAll);
router.get("/:id", authenticate, requireRole("ADMIN"), productController.getById);
router.post("/", authenticate, requireRole("ADMIN"), productController.create);
router.put("/:id", authenticate, requireRole("ADMIN"), productController.update);
router.delete("/:id", authenticate, requireRole("ADMIN"), productController.remove);

export default router;
