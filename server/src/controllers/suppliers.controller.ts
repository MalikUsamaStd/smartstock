// src/controllers/suppliers.controller.ts
//
// HTTP layer for suppliers.

import type { Request, Response, NextFunction } from "express";
import * as suppliersService from "../services/suppliers.service";

export async function getAllSuppliers(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const suppliers = await suppliersService.listSuppliers();
    res.json({ data: suppliers });
  } catch (err) {
    next(err);
  }
}

export async function getSupplierByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid supplier id" });
      return;
    }
    const supplier = await suppliersService.getSupplierById(id);
    if (!supplier) {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }
    res.json({ data: supplier });
  } catch (err) {
    next(err);
  }
}

export async function createSupplierHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = req.body ?? {};

    if (typeof body.name !== "string" || body.name.trim() === "") {
      res.status(400).json({ error: "name is required" });
      return;
    }
    if (body.email !== undefined && body.email !== null && typeof body.email !== "string") {
      res.status(400).json({ error: "email must be a string" });
      return;
    }

    const supplier = await suppliersService.createSupplier({
      name: body.name.trim(),
      email: typeof body.email === "string" ? body.email.trim() : null,
      phone: typeof body.phone === "string" ? body.phone.trim() : null,
      address: typeof body.address === "string" ? body.address : null,
    });

    res
      .status(201)
      .location(`/api/suppliers/${supplier.supplier_id}`)
      .json({ data: supplier });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A supplier with this email already exists" });
      return;
    }
    next(err);
  }
}

export async function updateSupplierHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid supplier id" });
      return;
    }

    const body = req.body ?? {};

    if (typeof body.name !== "string" || body.name.trim() === "") {
      res.status(400).json({ error: "name is required" });
      return;
    }
    if (body.email !== undefined && body.email !== null && typeof body.email !== "string") {
      res.status(400).json({ error: "email must be a string" });
      return;
    }

    const supplier = await suppliersService.updateSupplier(id, {
      name: body.name.trim(),
      email: typeof body.email === "string" ? body.email.trim() : null,
      phone: typeof body.phone === "string" ? body.phone.trim() : null,
      address: typeof body.address === "string" ? body.address : null,
    });

    if (!supplier) {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res.json({ data: supplier });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A supplier with this email already exists" });
      return;
    }
    next(err);
  }
}

export async function deleteSupplierHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid supplier id" });
      return;
    }

    const deleted = await suppliersService.deleteSupplier(id);
    if (!deleted) {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res.status(204).send();
  } catch (err: any) {
    const code = err?.code ?? err?.original?.code;
    const msg: string = String(err?.message ?? "");
    const isFkViolation =
      code === "23503" ||
      msg.includes("violates foreign key constraint") ||
      msg.includes("violates RESTRICT setting");
    if (isFkViolation) {
      res.status(409).json({
        error: "Cannot delete supplier: it is referenced by existing products",
      });
      return;
    }
    next(err);
  }
}
