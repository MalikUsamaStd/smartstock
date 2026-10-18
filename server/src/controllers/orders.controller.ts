// src/controllers/orders.controller.ts
//
// HTTP layer for orders.

import type { Request, Response, NextFunction } from "express";
import * as ordersService from "../services/orders.service";

const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export async function getAllOrders(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const orders = await ordersService.listOrders();
    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrderByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid order id" });
      return;
    }
    const order = await ordersService.getOrderById(id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json({ data: order });
  } catch (err) {
    next(err);
  }
}

export async function createOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = req.body ?? {};

    if (!Number.isInteger(body.customer_id) || body.customer_id <= 0) {
      res.status(400).json({ error: "customer_id must be a positive integer" });
      return;
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      res.status(400).json({ error: "items must be a non-empty array" });
      return;
    }
    for (const [i, item] of body.items.entries()) {
      if (
        !item ||
        !Number.isInteger(item.product_id) ||
        item.product_id <= 0
      ) {
        res
          .status(400)
          .json({ error: `items[${i}].product_id must be a positive integer` });
        return;
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        res
          .status(400)
          .json({ error: `items[${i}].quantity must be a positive integer` });
        return;
      }
    }

    const order = await ordersService.createOrder({
      customer_id: body.customer_id,
      notes: typeof body.notes === "string" ? body.notes : null,
      items: body.items.map((it: any) => ({
        product_id: it.product_id,
        quantity: it.quantity,
      })),
    });

    res
      .status(201)
      .location(`/api/orders/${order.order_id}`)
      .json({ data: order });
  } catch (err: any) {
    if (err?.name === "CustomerNotFoundError") {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err?.name === "OrderProductNotFoundError") {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err?.name === "OrderInsufficientStockError") {
      res.status(409).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function updateOrderStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const body = req.body ?? {};
    if (
      typeof body.status !== "string" ||
      !(VALID_STATUSES as readonly string[]).includes(body.status)
    ) {
      res.status(400).json({
        error: `status must be one of ${VALID_STATUSES.join(", ")}`,
      });
      return;
    }

    const order = await ordersService.updateOrderStatus(
      id,
      body.status as (typeof VALID_STATUSES)[number]
    );
    res.json({ data: order });
  } catch (err: any) {
    if (err?.name === "OrderNotFoundError") {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err?.name === "InvalidStatusTransitionError") {
      res.status(409).json({ error: err.message });
      return;
    }
    next(err);
  }
}
