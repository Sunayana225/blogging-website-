import "dotenv/config";

import type { Server } from "node:http";
import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";
import { validateDatabaseConnectivity, validateStartupEnv } from "./lib/startup";

const rawPort = process.env["PORT"] ?? "3000";

function parsePort(value: string): number {
  const port = Number(value);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${value}"`);
  }

  return port;
}

function registerGracefulShutdown(server: Server) {
  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    logger.info({ signal }, "Shutdown signal received. Closing server.");

    const forceExitTimer = setTimeout(() => {
      logger.error("Graceful shutdown timed out. Forcing process exit.");
      process.exit(1);
    }, 10_000);

    try {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        });
      });

      await pool.end();
      clearTimeout(forceExitTimer);
      logger.info("Graceful shutdown completed");
      process.exit(0);
    } catch (err) {
      clearTimeout(forceExitTimer);
      logger.error({ err }, "Error during graceful shutdown");
      process.exit(1);
    }
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

export async function startServer(): Promise<Server> {
  const validation = validateStartupEnv();
  if (!validation.ok) {
    process.exitCode = 1;
    throw new Error("Startup validation failed");
  }

  const dbOk = await validateDatabaseConnectivity();
  if (!dbOk) {
    process.exitCode = 1;
    throw new Error("Database preflight failed");
  }

  const port = parsePort(rawPort);

  const server = await new Promise<Server>((resolve, reject) => {
    const startedServer = app.listen(port, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(startedServer);
    });
  });

  registerGracefulShutdown(server);
  logger.info({ port }, "Server listening");
  return server;
}

startServer().catch((err) => {
  logger.error({ err }, "Server failed to start");
  process.exit(1);
});
