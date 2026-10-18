// src/app.ts
//
// Defines the Express application: middleware + routes.
// No listener here — that lives in server.ts.

import express from "express";
import cors from "cors";
import type { Request, Response, NextFunction } from "express";
import productsRouter from "./routes/products.routes";
import suppliersRouter from "./routes/suppliers.routes";
import customersRouter from "./routes/customers.routes";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    })
  );

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "smartstock-api" });
  });

  // Feature routes
  app.use("/api/products", productsRouter);
  app.use("/api/suppliers", suppliersRouter);
  app.use("/api/customers", customersRouter);

  // 404 handler — runs only if no route above matched
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Centralized error handler — must have 4 args to be recognized by Express
 app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

  return app;
}