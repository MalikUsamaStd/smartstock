// src/services/inventory-movements.service.ts
//
// Inventory movements use a PostgreSQL transaction: insert the movement log
// AND update products.stock_quantity atomically.

import { pool } from "../config/db";

export type MovementType = "IN" | "OUT" | "ADJUSTMENT";

export type InventoryMovement = {
  movement_id: number;
  product_id: number;
  movement_type: MovementType;
  quantity: number;
  notes: string | null;
  created_at: Date;
};

export type CreateMovementInput = {
  product_id: number;
  movement_type: MovementType;
  quantity: number;
  notes?: string | null;
};

// Custom error so the controller can map business-rule violations to 409.
export class InsufficientStockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientStockError";
  }
}

export class ProductNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductNotFoundError";
  }
}

export async function listMovements(): Promise<InventoryMovement[]> {
  const result = await pool.query<InventoryMovement>(
    `SELECT movement_id, product_id, movement_type, quantity, notes, created_at
       FROM inventory_movements
      ORDER BY movement_id ASC`
  );
  return result.rows;
}

export async function getMovementById(id: number): Promise<InventoryMovement | null> {
  const result = await pool.query<InventoryMovement>(
    `SELECT movement_id, product_id, movement_type, quantity, notes, created_at
       FROM inventory_movements
      WHERE movement_id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function createMovement(
  input: CreateMovementInput
): Promise<InventoryMovement> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock the product row so concurrent movements on the same product
    // serialize — prevents two OUTs from both passing the stock check.
    const productResult = await client.query<{ stock_quantity: number }>(
      "SELECT stock_quantity FROM products WHERE product_id = $1 FOR UPDATE",
      [input.product_id]
    );
    if (productResult.rowCount === 0) {
      throw new ProductNotFoundError("Product not found");
    }

    const currentStock = productResult.rows[0].stock_quantity;
    let recordedQuantity: number;
    let newStock: number;

    if (input.movement_type === "IN") {
      recordedQuantity = input.quantity;
      newStock = currentStock + input.quantity;
    } else if (input.movement_type === "OUT") {
      if (currentStock < input.quantity) {
        throw new InsufficientStockError(
          `Insufficient stock: current ${currentStock}, requested ${input.quantity}`
        );
      }
      recordedQuantity = input.quantity;
      newStock = currentStock - input.quantity;
    } else {
      // ADJUSTMENT: set stock to the requested quantity. Log the absolute delta
      // because the DB constraint requires quantity > 0.
      const delta = Math.abs(input.quantity - currentStock);
      if (delta === 0) {
        // No-op adjustment; still log a movement row so the audit trail shows it.
        recordedQuantity = 1;
        newStock = currentStock;
      } else {
        recordedQuantity = delta;
        newStock = input.quantity;
      }
    }

    const insertResult = await client.query<InventoryMovement>(
      `INSERT INTO inventory_movements (product_id, movement_type, quantity, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING movement_id, product_id, movement_type, quantity, notes, created_at`,
      [
        input.product_id,
        input.movement_type,
        recordedQuantity,
        input.notes ?? null,
      ]
    );

    await client.query(
      `UPDATE products
          SET stock_quantity = $1,
              updated_at     = NOW()
        WHERE product_id     = $2`,
      [newStock, input.product_id]
    );

    await client.query("COMMIT");
    return insertResult.rows[0];
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
