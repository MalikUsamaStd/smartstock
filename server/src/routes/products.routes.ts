// src/routes/products.routes.ts
//
// URL -> controller mapping for /api/products.

import { Router } from "express";
import {
  getAllProducts,
  getProductByIdHandler,
} from "../controllers/products.controller";

const router = Router();

router.get("/", getAllProducts);
router.get("/:id", getProductByIdHandler);

export default router;
