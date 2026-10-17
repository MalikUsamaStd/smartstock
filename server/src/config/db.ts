// src/config/db.ts
//
// Creates a single PostgreSQL connection pool that the whole backend shares.
// Reads credentials from environment variables (loaded from .env by server.ts).

import { Pool } from "pg";

if (!process.env.PGDATABASE) {
  throw new Error(
    "PGDATABASE is not set. Did you create server/.env from server/.env.example?"
  );
}

export const pool = new Pool({
  host: process.env.PGHOST ?? "localhost",
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

export async function testConnection(): Promise<void> {
  const result = await pool.query<{ now: Date }>("SELECT NOW() AS now");
  console.log("PostgreSQL connected. Server time: " + result.rows[0].now);
}
