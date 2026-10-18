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

export type NewProductInput = {
  supplier_id?: number | null;
  sku: string;
  name: string;
  description?: string | null;
  unit_price: number;
  stock_quantity?: number;
  reorder_level?: number;
};

export async function createProduct(input: NewProductInput): Promise<Product> {
  const result = await pool.query<Product>(
    `INSERT INTO products
       (supplier_id, sku, name, description, unit_price, stock_quantity, reorder_level)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING product_id, supplier_id, sku, name, description,
               unit_price, stock_quantity, reorder_level,
               created_at, updated_at`,
    [
      input.supplier_id ?? null,
      input.sku,
      input.name,
      input.description ?? null,
      input.unit_price,
      input.stock_quantity ?? 0,
      input.reorder_level ?? 10,
    ]
  );
  return result.rows[0];
}

export type UpdateProductInput = {
  supplier_id?: number | null;
  sku: string;
  name: string;
  description?: string | null;
  unit_price: number;
  stock_quantity?: number;
  reorder_level?: number;
};

export async function updateProduct(
  id: number,
  input: UpdateProductInput
): Promise<Product | null> {
  const result = await pool.query<Product>(
    `UPDATE products
        SET supplier_id    = $1,
            sku            = $2,
            name           = $3,
            description    = $4,
            unit_price     = $5,
            stock_quantity = $6,
            reorder_level  = $7,
            updated_at     = NOW()
      WHERE product_id     = $8
      RETURNING product_id, supplier_id, sku, name, description,
                unit_price, stock_quantity, reorder_level,
                created_at, updated_at`,
    [
      input.supplier_id ?? null,
      input.sku,
      input.name,
      input.description ?? null,
      input.unit_price,
      input.stock_quantity ?? 0,
      input.reorder_level ?? 10,
      id,
    ]
  );
  return result.rows[0] ?? null;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM products WHERE product_id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}
