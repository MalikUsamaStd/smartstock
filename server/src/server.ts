// src/server.ts
//
// The real entry point:
//   1. Load .env
//   2. Verify DB connection
//   3. Start Express

import "dotenv/config";
import { createApp } from "./app";
import { testConnection, pool } from "./config/db";

const PORT = Number(process.env.PORT ?? 4000);

async function main() {
  await testConnection();

  const app = createApp();

  const server = app.listen(PORT, () => {
    console.log("SmartStock API listening on http://localhost:" + PORT);
  });

  const shutdown = async (signal: string) => {
    console.log(signal + " received. Shutting down...");
    server.close();
    await pool.end();
    process.exit(0);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
