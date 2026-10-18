// src/routes/orders.routes.ts
//
// URL -> controller mapping for /api/orders.

import { Router } from "express";
import {
  getAllOrders,
  getOrderByIdHandler,
  createOrderHandler,
  updateOrderStatusHandler,
} from "../controllers/orders.controller";

const router = Router();

router.get("/", getAllOrders);
router.get("/:id", getOrderByIdHandler);
router.post("/", createOrderHandler);
router.put("/:id/status", updateOrderStatusHandler);

export default router;
