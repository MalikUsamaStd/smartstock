// src/services/orders.service.ts
//
// Orders use a multi-step transaction:
//   1) lock & validate each product (FOR UPDATE, stock check)
//   2) insert the order header
//   3) insert each order_items row
//   4) deduct stock on each product
//   5) append an OUT movement per line for the audit trail
// All inside one BEGIN/COMMIT so a failure on line 3 leaves nothing behind.

import { pool } from "../config/db";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderSummary = {
  order_id: number;
  customer_id: number;
  order_date: Date;
  status: OrderStatus;
  notes: string | null;
};

export type OrderItem = {
  order_item_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
};

export type OrderWithItems = OrderSummary & { items: OrderItem[] };

export type CreateOrderInput = {
  customer_id: number;
  notes?: string | null;
  items: { product_id: number; quantity: number }[];
};

// Custom errors so the controller can map to HTTP codes.
export class CustomerNotFoundError extends Error {
  constructor(message = "Customer not found") {
    super(message);
    this.name = "CustomerNotFoundError";
  }
}
export class OrderProductNotFoundError extends Error {
  constructor(productId: number) {
    super(`Product not found: ${productId}`);
    this.name = "OrderProductNotFoundError";
  }
}
export class OrderInsufficientStockError extends Error {
  constructor(productId: number, current: number, requested: number) {
    super(
      `Insufficient stock for product ${productId}: current ${current}, requested ${requested}`
    );
    this.name = "OrderInsufficientStockError";
  }
}
export class OrderNotFoundError extends Error {
  constructor(message = "Order not found") {
    super(message);
    this.name = "OrderNotFoundError";
  }
}
export class InvalidStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Cannot transition from ${from} to ${to}`);
    this.name = "InvalidStatusTransitionError";
  }
}

export async function listOrders(): Promise<OrderSummary[]> {
  const result = await pool.query<OrderSummary>(
    `SELECT order_id, customer_id, order_date, status, notes
       FROM orders
      ORDER BY order_id ASC`
  );
  return result.rows;
}

export async function getOrderById(id: number): Promise<OrderWithItems | null> {
  const orderResult = await pool.query<OrderSummary>(
    `SELECT order_id, customer_id, order_date, status, notes
       FROM orders
      WHERE order_id = $1`,
    [id]
  );
  if (orderResult.rowCount === 0) return null;

  const itemsResult = await pool.query<OrderItem>(
    `SELECT order_item_id, order_id, product_id, quantity, unit_price
       FROM order_items
      WHERE order_id = $1
      ORDER BY order_item_id ASC`,
    [id]
  );

  return { ...orderResult.rows[0], items: itemsResult.rows };
}

export async function createOrder(
  input: CreateOrderInput
): Promise<OrderWithItems> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Verify the customer exists.
    const custRes = await client.query(
      "SELECT customer_id FROM customers WHERE customer_id = $1",
      [input.customer_id]
    );
    if (custRes.rowCount === 0) {
      throw new CustomerNotFoundError();
    }

    // 2. Lock every referenced product in a stable order (by id) so concurrent
    //    orders touching the same products serialize deterministically and
    //    cannot deadlock.
    const sortedItems = [...input.items].sort(
      (a, b) => a.product_id - b.product_id
    );
    const productIds = sortedItems.map((i) => i.product_id);
    const lockRes = await client.query<{
      product_id: number;
      stock_quantity: number;
      unit_price: string;
    }>(
      `SELECT product_id, stock_quantity, unit_price
         FROM products
        WHERE product_id = ANY($1::bigint[])
        ORDER BY product_id
        FOR UPDATE`,
      [productIds]
    );

    const productMap = new Map<number, { stock: number; price: string }>();
    for (const row of lockRes.rows) {
      productMap.set(Number(row.product_id), {
        stock: row.stock_quantity,
        price: row.unit_price,
      });
    }

    // 3. Every requested product must exist and have enough stock.
    for (const item of sortedItems) {
      const p = productMap.get(item.product_id);
      if (!p) {
        throw new OrderProductNotFoundError(item.product_id);
      }
      if (p.stock < item.quantity) {
        throw new OrderInsufficientStockError(
          item.product_id,
          p.stock,
          item.quantity
        );
      }
    }

    // 4. Insert the order header.
    const orderRes = await client.query<OrderSummary>(
      `INSERT INTO orders (customer_id, status, notes)
       VALUES ($1, 'PENDING', $2)
       RETURNING order_id, customer_id, order_date, status, notes`,
      [input.customer_id, input.notes ?? null]
    );
    const order = orderRes.rows[0];

    // 5. Insert order_items + deduct stock + append OUT movements.
    const items: OrderItem[] = [];
    for (const item of sortedItems) {
      const p = productMap.get(item.product_id)!;

      const itemRes = await client.query<OrderItem>(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)
         RETURNING order_item_id, order_id, product_id, quantity, unit_price`,
        [order.order_id, item.product_id, item.quantity, p.price]
      );
      items.push(itemRes.rows[0]);

      await client.query(
        `UPDATE products
            SET stock_quantity = stock_quantity - $1,
                updated_at     = NOW()
          WHERE product_id     = $2`,
        [item.quantity, item.product_id]
      );

      await client.query(
        `INSERT INTO inventory_movements (product_id, movement_type, quantity, notes)
         VALUES ($1, 'OUT', $2, $3)`,
        [item.product_id, item.quantity, `Order #${order.order_id}`]
      );
    }

    await client.query("COMMIT");
    return { ...order, items };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

// Status lifecycle: PENDING -> CONFIRMED -> SHIPPED -> DELIVERED.
// CANCELLED is allowed from PENDING or CONFIRMED.
// Terminal states (DELIVERED, CANCELLED) cannot transition further.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function updateOrderStatus(
  id: number,
  newStatus: OrderStatus
): Promise<OrderSummary> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const curRes = await client.query<{ status: OrderStatus }>(
      "SELECT status FROM orders WHERE order_id = $1 FOR UPDATE",
      [id]
    );
    if (curRes.rowCount === 0) {
      throw new OrderNotFoundError();
    }
    const current = curRes.rows[0].status;
    if (!ALLOWED_TRANSITIONS[current].includes(newStatus)) {
      throw new InvalidStatusTransitionError(current, newStatus);
    }

    const updRes = await client.query<OrderSummary>(
      `UPDATE orders SET status = $1
        WHERE order_id = $2
        RETURNING order_id, customer_id, order_date, status, notes`,
      [newStatus, id]
    );
    await client.query("COMMIT");
    return updRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
