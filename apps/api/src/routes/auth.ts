import express from "express";
import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleAuth);
router.post("/logout", authController.logout);

// Protected routes
router.get("/me", authenticate, authController.me);
router.patch("/me", authenticate, authController.updateMe);
router.delete("/me", authenticate, authController.deleteMe);

export default router;
