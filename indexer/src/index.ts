import { createPublicClient, http, type Address } from "viem";
import { polygon, polygonAmoy, hardhat } from "viem/chains";
import { initDb } from "./db/schema.js";
import { EventIndexer } from "./indexer.js";
import { createApi } from "./api.js";

// ─── Configuration ───────────────────────────────────────────────────

const RPC_URL = process.env.RPC_URL ?? "http://localhost:8545";
const GACHA_ADDRESS = process.env.GACHA_ADDRESS as Address | undefined;
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS as Address | undefined;
const DB_PATH = process.env.DB_PATH ?? "./data/indexer.db";
const API_PORT = Number(process.env.API_PORT) || 3001;
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS) || 5_000;
const BATCH_SIZE = BigInt(process.env.BATCH_SIZE ?? "2000");

const CHAIN_ID = Number(process.env.CHAIN_ID ?? "31337");

if (!GACHA_ADDRESS || !TREASURY_ADDRESS) {
  console.error(
    "ERROR: GACHA_ADDRESS and TREASURY_ADDRESS environment variables are required",
  );
  process.exit(1);
}

// ─── Chain selection ─────────────────────────────────────────────────

function getChain(chainId: number) {
  switch (chainId) {
    case 137:
      return polygon;
    case 80002:
      return polygonAmoy;
    default:
      return hardhat;
  }
}

// ─── Bootstrap ───────────────────────────────────────────────────────

const chain = getChain(CHAIN_ID);

const client = createPublicClient({
  chain,
  transport: http(RPC_URL),
});

// Ensure data directory exists
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
mkdirSync(dirname(DB_PATH), { recursive: true });

const db = initDb(DB_PATH);

const indexer = new EventIndexer(db, client, {
  gachaAddress: GACHA_ADDRESS,
  treasuryAddress: TREASURY_ADDRESS,
  pollIntervalMs: POLL_INTERVAL_MS,
  batchSize: BATCH_SIZE,
});

createApi(db, API_PORT);
indexer.start();

// ─── Graceful shutdown ───────────────────────────────────────────────

function shutdown() {
  console.log("[shutdown] Stopping indexer...");
  indexer.stop();
  db.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
