// src/controllers/customers.controller.ts
//
// HTTP layer for customers.

import type { Request, Response, NextFunction } from "express";
import * as customersService from "../services/customers.service";

export async function getAllCustomers(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const customers = await customersService.listCustomers();
    res.json({ data: customers });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid customer id" });
      return;
    }
    const customer = await customersService.getCustomerById(id);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.json({ data: customer });
  } catch (err) {
    next(err);
  }
}

export async function createCustomerHandler(
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

    const customer = await customersService.createCustomer({
      name: body.name.trim(),
      email: typeof body.email === "string" ? body.email.trim() : null,
      phone: typeof body.phone === "string" ? body.phone.trim() : null,
      address: typeof body.address === "string" ? body.address : null,
    });

    res
      .status(201)
      .location(`/api/customers/${customer.customer_id}`)
      .json({ data: customer });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A customer with this email already exists" });
      return;
    }
    next(err);
  }
}

export async function updateCustomerHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid customer id" });
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

    const customer = await customersService.updateCustomer(id, {
      name: body.name.trim(),
      email: typeof body.email === "string" ? body.email.trim() : null,
      phone: typeof body.phone === "string" ? body.phone.trim() : null,
      address: typeof body.address === "string" ? body.address : null,
    });

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json({ data: customer });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A customer with this email already exists" });
      return;
    }
    next(err);
  }
}

export async function deleteCustomerHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid customer id" });
      return;
    }

    const deleted = await customersService.deleteCustomer(id);
    if (!deleted) {
      res.status(404).json({ error: "Customer not found" });
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
        error: "Cannot delete customer: it is referenced by existing orders",
      });
      return;
    }
    next(err);
  }
}
