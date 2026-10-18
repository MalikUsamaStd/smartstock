// src/controllers/inventory-movements.controller.ts
//
// HTTP layer for inventory movements.

import type { Request, Response, NextFunction } from "express";
import * as movementsService from "../services/inventory-movements.service";

export async function getAllMovements(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rows = await movementsService.listMovements();
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

export async function getMovementByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid movement id" });
      return;
    }
    const row = await movementsService.getMovementById(id);
    if (!row) {
      res.status(404).json({ error: "Movement not found" });
      return;
    }
    res.json({ data: row });
  } catch (err) {
    next(err);
  }
}

export async function createMovementHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = req.body ?? {};

    if (!Number.isInteger(body.product_id) || body.product_id <= 0) {
      res.status(400).json({ error: "product_id must be a positive integer" });
      return;
    }
    if (
      body.movement_type !== "IN" &&
      body.movement_type !== "OUT" &&
      body.movement_type !== "ADJUSTMENT"
    ) {
      res.status(400).json({
        error: "movement_type must be one of IN, OUT, ADJUSTMENT",
      });
      return;
    }
    if (!Number.isInteger(body.quantity) || body.quantity <= 0) {
      res.status(400).json({ error: "quantity must be a positive integer" });
      return;
    }

    const row = await movementsService.createMovement({
      product_id: body.product_id,
      movement_type: body.movement_type,
      quantity: body.quantity,
      notes: typeof body.notes === "string" ? body.notes : null,
    });

    res
      .status(201)
      .location(`/api/inventory-movements/${row.movement_id}`)
      .json({ data: row });
  } catch (err: any) {
    if (err?.name === "ProductNotFoundError") {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err?.name === "InsufficientStockError") {
      res.status(409).json({ error: err.message });
      return;
    }
    next(err);
  }
}
