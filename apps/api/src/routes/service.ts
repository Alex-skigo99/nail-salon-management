import express from "express";
import * as serviceController from "../controllers/serviceController";

const router = express.Router();

router.get("/", serviceController.getAll);
router.post("/", serviceController.create);
router.put("/:id", serviceController.update);
router.delete("/:id", serviceController.remove);

export default router;
