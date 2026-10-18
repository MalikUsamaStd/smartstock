// src/routes/inventory-movements.routes.ts
//
// URL -> controller mapping for /api/inventory-movements.

import { Router } from "express";
import {
  getAllMovements,
  getMovementByIdHandler,
  createMovementHandler,
} from "../controllers/inventory-movements.controller";

const router = Router();

router.get("/", getAllMovements);
router.get("/:id", getMovementByIdHandler);
router.post("/", createMovementHandler);

export default router;
