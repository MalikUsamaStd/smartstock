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
    next(err);
  }
}

export async function getProductByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid product id" });
      return;
    }

    const product = await productsService.getProductById(id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({ data: product });
  } catch (err) {
    next(err);
  }
}
