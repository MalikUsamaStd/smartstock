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

export async function createProductHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = req.body ?? {};

    if (typeof body.sku !== "string" || body.sku.trim() === "") {
      res.status(400).json({ error: "sku is required" });
      return;
    }
    if (typeof body.name !== "string" || body.name.trim() === "") {
      res.status(400).json({ error: "name is required" });
      return;
    }
    if (typeof body.unit_price !== "number" || body.unit_price < 0) {
      res.status(400).json({ error: "unit_price must be a non-negative number" });
      return;
    }
    if (
      body.supplier_id !== undefined &&
      body.supplier_id !== null &&
      (!Number.isInteger(body.supplier_id) || body.supplier_id <= 0)
    ) {
      res.status(400).json({ error: "supplier_id must be a positive integer" });
      return;
    }
    if (
      body.stock_quantity !== undefined &&
      (!Number.isInteger(body.stock_quantity) || body.stock_quantity < 0)
    ) {
      res.status(400).json({ error: "stock_quantity must be a non-negative integer" });
      return;
    }
    if (
      body.reorder_level !== undefined &&
      (!Number.isInteger(body.reorder_level) || body.reorder_level < 0)
    ) {
      res.status(400).json({ error: "reorder_level must be a non-negative integer" });
      return;
    }

    const product = await productsService.createProduct({
      supplier_id: body.supplier_id ?? null,
      sku: body.sku.trim(),
      name: body.name.trim(),
      description: typeof body.description === "string" ? body.description : null,
      unit_price: body.unit_price,
      stock_quantity: body.stock_quantity,
      reorder_level: body.reorder_level,
    });

    res
      .status(201)
      .location(`/api/products/${product.product_id}`)
      .json({ data: product });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A product with this sku already exists" });
      return;
    }
    if (err?.code === "23503") {
      res.status(400).json({ error: "supplier_id does not reference an existing supplier" });
      return;
    }
    if (err?.code === "23514") {
      res.status(400).json({ error: "Value violates a database check constraint" });
      return;
    }
    next(err);
  }
}
