// src/app.ts
//
// Defines the Express application: middleware + routes.
// No listener here — that lives in server.ts.
// Keeping app separate makes it easy to test later.

import express from "express";
import cors from "cors";

export function createApp() {
  const app = express();

  // Parse JSON request bodies.
  app.use(express.json());

  // Allow the future React frontend (different port) to call us.
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    })
  );

  // Health check — proves the server is alive.
  // We'll add a deeper /health/db later.
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "smartstock-api" });
  });

  return app;
}