import { runPreflight } from "./pm2-preflight.mjs";

await runPreflight();
await import("../artifacts/api-server/dist/index.mjs");