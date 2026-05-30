import { pool } from "@workspace/db";
import { logger } from "./logger";

type StartupValidationResult = {
  ok: boolean;
  missing: string[];
};

export function validateStartupEnv(): StartupValidationResult {
  const missing: string[] = [];

  if (!process.env.DATABASE_URL?.trim()) {
    missing.push("DATABASE_URL");
  }

  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_API_TOKEN?.trim()) {
    missing.push("ADMIN_API_TOKEN");
  }

  if (!process.env.PORT?.trim()) {
    logger.warn({ defaultPort: 3000 }, "PORT is not set, falling back to default port");
  }

  if (missing.length > 0) {
    logger.error(
      { missing },
      "Startup validation failed. Set the missing environment variables before starting the server.",
    );
    return { ok: false, missing };
  }

  logger.info("Startup environment validation passed");
  return { ok: true, missing: [] };
}

export async function validateDatabaseConnectivity(): Promise<boolean> {
  try {
    await pool.query("select 1");
    logger.info("Database connectivity check passed");
    return true;
  } catch (err) {
    logger.error(
      { err },
      "Database connectivity check failed. Verify DATABASE_URL and network access.",
    );
    return false;
  }
}