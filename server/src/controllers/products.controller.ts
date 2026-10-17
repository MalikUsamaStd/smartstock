// src/controllers/products.controller.ts
//
// HTTP layer for products. Translates between req/res and the service.

import type { Request, Response, NextFunction } from "express";
import * as productsService from "../services/products.service";

export async function getAllProducts(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const products = await productsService.listProducts();
    res.json({ data: products });
  } catch (err) {
    next(err); // hand off to the centralized error handler
  }
}