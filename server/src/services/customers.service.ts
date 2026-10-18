// src/services/customers.service.ts
//
// SQL + business logic for the customers table.

import { pool } from "../config/db";

export type Customer = {
  customer_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: Date;
};

export async function listCustomers(): Promise<Customer[]> {
  const result = await pool.query<Customer>(
    `SELECT customer_id, name, email, phone, address, created_at
       FROM customers
      ORDER BY customer_id ASC`
  );
  return result.rows;
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const result = await pool.query<Customer>(
    `SELECT customer_id, name, email, phone, address, created_at
       FROM customers
      WHERE customer_id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export type NewCustomerInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export async function createCustomer(input: NewCustomerInput): Promise<Customer> {
  const result = await pool.query<Customer>(
    `INSERT INTO customers (name, email, phone, address)
     VALUES ($1, $2, $3, $4)
     RETURNING customer_id, name, email, phone, address, created_at`,
    [
      input.name,
      input.email ?? null,
      input.phone ?? null,
      input.address ?? null,
    ]
  );
  return result.rows[0];
}

export type UpdateCustomerInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export async function updateCustomer(
  id: number,
  input: UpdateCustomerInput
): Promise<Customer | null> {
  const result = await pool.query<Customer>(
    `UPDATE customers
        SET name    = $1,
            email   = $2,
            phone   = $3,
            address = $4
      WHERE customer_id = $5
      RETURNING customer_id, name, email, phone, address, created_at`,
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

export async function deleteCustomer(id: number): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM customers WHERE customer_id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}
