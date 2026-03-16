import type Database from "better-sqlite3";
import cors from "cors";
import express, { type Request, type Response } from "express";

export function createApi(db: Database.Database, port: number) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // ─── Health ─────────────────────────────────────────────────────────

  app.get("/health", (_req: Request, res: Response) => {
    const row = db
      .prepare("SELECT value FROM indexer_state WHERE key = 'last_block'")
      .get() as { value: string } | undefined;
    res.json({ status: "ok", lastBlock: row?.value ?? "0" });
  });

  // ─── Spin History ───────────────────────────────────────────────────

  app.get("/api/spins/:address", (req: Request, res: Response) => {
    const address = (req.params.address as string)?.toLowerCase();
    const limit = Math.min(Number(req.query.limit as string) || 50, 200);
    const offset = Number(req.query.offset as string) || 0;

    const completed = db
      .prepare(
        `SELECT * FROM spin_completed WHERE LOWER(requester) = ? ORDER BY block_number DESC LIMIT ? OFFSET ?`,
      )
      .all(address, limit, offset);

    const refunded = db
      .prepare(
        `SELECT * FROM spin_refunded WHERE LOWER(requester) = ? ORDER BY block_number DESC LIMIT ? OFFSET ?`,
      )
      .all(address, limit, offset);

    const reclaimed = db
      .prepare(
        `SELECT * FROM spin_reclaimed WHERE LOWER(requester) = ? ORDER BY block_number DESC LIMIT ? OFFSET ?`,
      )
      .all(address, limit, offset);

    res.json({ completed, refunded, reclaimed });
  });

  // ─── Spin by Trigger ID ────────────────────────────────────────────

  app.get("/api/spin/:triggerId", (req: Request, res: Response) => {
    const triggerId = req.params.triggerId;

    const completed = db
      .prepare("SELECT * FROM spin_completed WHERE trigger_id = ?")
      .get(triggerId);
    const refunded = db
      .prepare("SELECT * FROM spin_refunded WHERE trigger_id = ?")
      .get(triggerId);
    const reclaimed = db
      .prepare("SELECT * FROM spin_reclaimed WHERE trigger_id = ?")
      .get(triggerId);

    if (!completed && !refunded && !reclaimed) {
      res.status(404).json({ error: "Spin not found" });
      return;
    }

    const status = completed
      ? "completed"
      : refunded
        ? "refunded"
        : "reclaimed";
    res.json({ status, completed, refunded, reclaimed });
  });

  // ─── Recent Spins (global) ─────────────────────────────────────────

  app.get("/api/spins", (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const recent = db
      .prepare(
        `SELECT * FROM spin_completed ORDER BY block_number DESC LIMIT ?`,
      )
      .all(limit);

    res.json({ spins: recent });
  });

  // ─── NFT Deposits ──────────────────────────────────────────────────

  app.get("/api/deposits/:address", (req: Request, res: Response) => {
    const address = (req.params.address as string)?.toLowerCase();
    const limit = Math.min(Number(req.query.limit as string) || 50, 200);
    const offset = Number(req.query.offset as string) || 0;

    const deposits = db
      .prepare(
        `SELECT * FROM nft_deposited WHERE LOWER(depositor) = ? ORDER BY block_number DESC LIMIT ? OFFSET ?`,
      )
      .all(address, limit, offset);

    res.json({ deposits });
  });

  // ─── Stats ─────────────────────────────────────────────────────────

  app.get("/api/stats", (_req: Request, res: Response) => {
    const totalSpins = (
      db.prepare("SELECT COUNT(*) as count FROM spin_completed").get() as {
        count: number;
      }
    ).count;
    const totalRefunds = (
      db.prepare("SELECT COUNT(*) as count FROM spin_refunded").get() as {
        count: number;
      }
    ).count;
    const totalReclaims = (
      db.prepare("SELECT COUNT(*) as count FROM spin_reclaimed").get() as {
        count: number;
      }
    ).count;
    const totalDeposits = (
      db.prepare("SELECT COUNT(*) as count FROM nft_deposited").get() as {
        count: number;
      }
    ).count;

    const rarityBreakdown = db
      .prepare(
        "SELECT rarity, COUNT(*) as count FROM spin_completed GROUP BY rarity ORDER BY rarity",
      )
      .all();

    res.json({
      totalSpins,
      totalRefunds,
      totalReclaims,
      totalDeposits,
      rarityBreakdown,
    });
  });

  app.listen(port, () => {
    console.log(`[api] Listening on http://0.0.0.0:${port}`);
  });

  return app;
}
