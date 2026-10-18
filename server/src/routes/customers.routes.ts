// src/routes/customers.routes.ts
//
// URL -> controller mapping for /api/customers.

import { Router } from "express";
import {
  getAllCustomers,
  getCustomerByIdHandler,
  createCustomerHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
} from "../controllers/customers.controller";

const router = Router();

router.get("/", getAllCustomers);
router.get("/:id", getCustomerByIdHandler);
router.post("/", createCustomerHandler);
router.put("/:id", updateCustomerHandler);
router.delete("/:id", deleteCustomerHandler);

export default router;
