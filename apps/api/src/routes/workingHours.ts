import express from "express";
import * as workingHoursController from "../controllers/workingHoursController";

const router = express.Router();

router.get("/", workingHoursController.getByMaster);
router.post("/", workingHoursController.replace);
router.delete("/", workingHoursController.removeByMaster);

export default router;
