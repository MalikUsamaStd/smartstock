// src/services/products.service.ts
//
// SQL + business logic for the products table.
// No HTTP here. No req/res. Just data in / data out.

import { pool } from "../config/db";

export type Product = {
  product_id: number;
  supplier_id: number | null;
  sku: string;
  name: string;
  description: string | null;
  unit_price: string;
  stock_quantity: number;
  reorder_level: number;
  created_at: Date;
  updated_at: Date;
};

export async function listProducts(): Promise<Product[]> {
  const result = await pool.query<Product>(
    `SELECT product_id, supplier_id, sku, name, description,
            unit_price, stock_quantity, reorder_level,
            created_at, updated_at
       FROM products
      ORDER BY product_id ASC`
  );
  return result.rows;
}

export async function getProductById(id: number): Promise<Product | null> {
  const result = await pool.query<Product>(
    `SELECT product_id, supplier_id, sku, name, description,
            unit_price, stock_quantity, reorder_level,
            created_at, updated_at
       FROM products
      WHERE product_id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}
