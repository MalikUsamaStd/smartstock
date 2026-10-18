// src/services/suppliers.service.ts
//
// SQL + business logic for the suppliers table.

import { pool } from "../config/db";

export type Supplier = {
  supplier_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: Date;
};

export async function listSuppliers(): Promise<Supplier[]> {
  const result = await pool.query<Supplier>(
    `SELECT supplier_id, name, email, phone, address, created_at
       FROM suppliers
      ORDER BY supplier_id ASC`
  );
  return result.rows;
}

export async function getSupplierById(id: number): Promise<Supplier | null> {
  const result = await pool.query<Supplier>(
    `SELECT supplier_id, name, email, phone, address, created_at
       FROM suppliers
      WHERE supplier_id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export type NewSupplierInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export async function createSupplier(input: NewSupplierInput): Promise<Supplier> {
  const result = await pool.query<Supplier>(
    `INSERT INTO suppliers (name, email, phone, address)
     VALUES ($1, $2, $3, $4)
     RETURNING supplier_id, name, email, phone, address, created_at`,
    [
      input.name,
      input.email ?? null,
      input.phone ?? null,
      input.address ?? null,
    ]
  );
  return result.rows[0];
}

export type UpdateSupplierInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export async function updateSupplier(
  id: number,
  input: UpdateSupplierInput
): Promise<Supplier | null> {
  const result = await pool.query<Supplier>(
    `UPDATE suppliers
        SET name    = $1,
            email   = $2,
            phone   = $3,
            address = $4
      WHERE supplier_id = $5
      RETURNING supplier_id, name, email, phone, address, created_at`,
    [
      input.name,
      input.email ?? null,
      input.phone ?? null,
      input.address ?? null,
      id,
    ]
  );
  return result.rows[0] ?? null;
}

export async function deleteSupplier(id: number): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM suppliers WHERE supplier_id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}
