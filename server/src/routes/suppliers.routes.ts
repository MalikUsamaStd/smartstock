// src/routes/suppliers.routes.ts
//
// URL -> controller mapping for /api/suppliers.

import { Router } from "express";
import {
  getAllSuppliers,
  getSupplierByIdHandler,
  createSupplierHandler,
  updateSupplierHandler,
  deleteSupplierHandler,
} from "../controllers/suppliers.controller";

const router = Router();

router.get("/", getAllSuppliers);
router.get("/:id", getSupplierByIdHandler);
router.post("/", createSupplierHandler);
router.put("/:id", updateSupplierHandler);
router.delete("/:id", deleteSupplierHandler);

export default router;
