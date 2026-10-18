// src/routes/products.routes.ts
//
// URL -> controller mapping for /api/products.

import { Router } from "express";
import {
  getAllProducts,
  getProductByIdHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from "../controllers/products.controller";

const router = Router();

router.get("/", getAllProducts);
router.get("/:id", getProductByIdHandler);
router.post("/", createProductHandler);
router.put("/:id", updateProductHandler);
router.delete("/:id", deleteProductHandler);

export default router;
