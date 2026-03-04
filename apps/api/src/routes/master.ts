import express from "express";
import * as masterController from "../controllers/masterController";

const router = express.Router();

router.get("/", masterController.getAll);
router.post("/", masterController.create);
router.put("/:id", masterController.update);
router.delete("/:id", masterController.remove);

export default router;
