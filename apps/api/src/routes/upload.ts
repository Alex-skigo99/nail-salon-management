import express from "express";
import * as uploadController from "../controllers/uploadController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.post("/presigned-url", authenticate, uploadController.getPresignedUrl);

export default router;
