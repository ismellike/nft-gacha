import { ponder } from "@/generated";
import {
  spinCompleted,
  spinRefunded,
  spinReclaimed,
  nftDeposited,
} from "../../ponder.schema";
import { desc, eq, count } from "@ponder/core";

// Ponder provides /health and /ready automatically

// ─── Spin History by Address ────────────────────────────────────────────

ponder.get("/api/spins/:address", async (c) => {
  const address = c.req.param("address").toLowerCase();
  const limit = Math.min(Number(c.req.query("limit") ?? "50"), 200);
  const offset = Number(c.req.query("offset") ?? "0");

  const [completed, refunded, reclaimed] = await Promise.all([
    c.db
      .select()
      .from(spinCompleted)
      .where(eq(spinCompleted.requester, address))
      .orderBy(desc(spinCompleted.blockNumber))
      .limit(limit)
      .offset(offset),
    c.db
      .select()
      .from(spinRefunded)
      .where(eq(spinRefunded.requester, address))
      .orderBy(desc(spinRefunded.blockNumber))
      .limit(limit)
      .offset(offset),
    c.db
      .select()
      .from(spinReclaimed)
      .where(eq(spinReclaimed.requester, address))
      .orderBy(desc(spinReclaimed.blockNumber))
      .limit(limit)
      .offset(offset),
  ]);

  return c.json({
    completed: completed.map(toSnakeCase),
    refunded: refunded.map(toSnakeCase),
    reclaimed: reclaimed.map(toSnakeCase),
  });
});

// ─── Spin by Trigger ID ────────────────────────────────────────────────

ponder.get("/api/spin/:triggerId", async (c) => {
  const triggerId = c.req.param("triggerId");

  const [completed, refunded, reclaimed] = await Promise.all([
    c.db
      .select()
      .from(spinCompleted)
      .where(eq(spinCompleted.triggerId, triggerId))
      .limit(1),
    c.db
      .select()
      .from(spinRefunded)
      .where(eq(spinRefunded.triggerId, triggerId))
      .limit(1),
    c.db
      .select()
      .from(spinReclaimed)
      .where(eq(spinReclaimed.triggerId, triggerId))
      .limit(1),
  ]);

  const completedRow = completed[0] ?? null;
  const refundedRow = refunded[0] ?? null;
  const reclaimedRow = reclaimed[0] ?? null;

  if (!completedRow && !refundedRow && !reclaimedRow) {
    return c.json({ error: "Spin not found" }, 404);
  }

  const status = completedRow
    ? "completed"
    : refundedRow
      ? "refunded"
      : "reclaimed";

  return c.json({
    status,
    completed: completedRow ? toSnakeCase(completedRow) : null,
    refunded: refundedRow ? toSnakeCase(refundedRow) : null,
    reclaimed: reclaimedRow ? toSnakeCase(reclaimedRow) : null,
  });
});

// ─── Recent Spins (global) ─────────────────────────────────────────────

ponder.get("/api/spins", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") ?? "20"), 100);

  const recent = await c.db
    .select()
    .from(spinCompleted)
    .orderBy(desc(spinCompleted.blockNumber))
    .limit(limit);

  return c.json({ spins: recent.map(toSnakeCase) });
});

// ─── NFT Deposits ──────────────────────────────────────────────────────

ponder.get("/api/deposits/:address", async (c) => {
  const address = c.req.param("address").toLowerCase();
  const limit = Math.min(Number(c.req.query("limit") ?? "50"), 200);
  const offset = Number(c.req.query("offset") ?? "0");

  const deposits = await c.db
    .select()
    .from(nftDeposited)
    .where(eq(nftDeposited.depositor, address))
    .orderBy(desc(nftDeposited.blockNumber))
    .limit(limit)
    .offset(offset);

  return c.json({ deposits: deposits.map(toSnakeCase) });
});

// ─── Stats ─────────────────────────────────────────────────────────────

ponder.get("/api/stats", async (c) => {
  const [totalSpinsResult, totalRefundsResult, totalReclaimsResult, totalDepositsResult, rarityRows] =
    await Promise.all([
      c.db.select({ count: count() }).from(spinCompleted),
      c.db.select({ count: count() }).from(spinRefunded),
      c.db.select({ count: count() }).from(spinReclaimed),
      c.db.select({ count: count() }).from(nftDeposited),
      c.db
        .select({
          rarity: spinCompleted.rarity,
          count: count(),
        })
        .from(spinCompleted)
        .groupBy(spinCompleted.rarity)
        .orderBy(spinCompleted.rarity),
    ]);

  return c.json({
    totalSpins: totalSpinsResult[0]?.count ?? 0,
    totalRefunds: totalRefundsResult[0]?.count ?? 0,
    totalReclaims: totalReclaimsResult[0]?.count ?? 0,
    totalDeposits: totalDepositsResult[0]?.count ?? 0,
    rarityBreakdown: rarityRows,
  });
});

// ─── Helpers ───────────────────────────────────────────────────────────

/** Convert camelCase row to snake_case for frontend API compatibility */
function toSnakeCase(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    result[snakeKey] = value;
  }
  return result;
}
