import "dotenv/config";
import net from "node:net";
import { pathToFileURL } from "node:url";

function fail(message) {
  console.error(`[preflight] ${message}`);
  process.exit(1);
}

function info(message) {
  console.log(`[preflight] ${message}`);
}

function parseDbTarget(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    if (!url.hostname) {
      return null;
    }
    return {
      host: url.hostname,
      port: Number(url.port || "5432"),
    };
  } catch {
    return null;
  }
}

async function probeTcp(host, port, timeoutMs = 5000) {
  return await new Promise((resolve) => {
    const socket = new net.Socket();
    let finished = false;

    const done = (ok) => {
      if (finished) {
        return;
      }
      finished = true;
      socket.destroy();
      resolve(ok);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
    socket.connect(port, host);
  });
}

export async function runPreflight() {
  const missing = [];

  if (!process.env.DATABASE_URL?.trim()) {
    missing.push("DATABASE_URL");
  }

  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_API_TOKEN?.trim()) {
    missing.push("ADMIN_API_TOKEN");
  }

  if (missing.length > 0) {
    fail(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const target = parseDbTarget(process.env.DATABASE_URL);
  if (!target) {
    fail("DATABASE_URL is not a valid URL");
  }

  info(`Checking database network reachability at ${target.host}:${target.port}`);
  const canReachDb = await probeTcp(target.host, target.port);

  if (!canReachDb) {
    fail("Database endpoint is unreachable. Check DATABASE_URL, firewall, or network policy.");
  }

  info("Preflight checks passed");
}

const isDirectExecution =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectExecution) {
  runPreflight().catch((err) => {
    fail(`Unexpected preflight error: ${err instanceof Error ? err.message : String(err)}`);
  });
}