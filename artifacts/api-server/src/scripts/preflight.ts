import "dotenv/config";

import { logger } from "../lib/logger";
import { validateDatabaseConnectivity, validateStartupEnv } from "../lib/startup";
import { pool } from "@workspace/db";

async function main() {
  const envValidation = validateStartupEnv();
  if (!envValidation.ok) {
    process.exit(1);
  }

  const dbOk = await validateDatabaseConnectivity();
  await pool.end();

  if (!dbOk) {
    process.exit(1);
  }

  logger.info("Preflight checks passed");
}

main().catch((err) => {
  logger.error({ err }, "Preflight checks failed unexpectedly");
  process.exit(1);
});