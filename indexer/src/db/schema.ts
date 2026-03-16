import Database from "better-sqlite3";

export function initDb(dbPath: string): Database.Database {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS spin_completed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trigger_id TEXT NOT NULL,
      requester TEXT NOT NULL,
      rarity INTEGER NOT NULL,
      collection TEXT NOT NULL,
      token_id TEXT NOT NULL,
      appraised_price TEXT NOT NULL,
      block_number INTEGER NOT NULL,
      tx_hash TEXT NOT NULL,
      log_index INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      UNIQUE(tx_hash, log_index)
    );

    CREATE TABLE IF NOT EXISTS spin_refunded (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trigger_id TEXT NOT NULL,
      requester TEXT NOT NULL,
      selected_rarity INTEGER NOT NULL,
      refund_amount TEXT NOT NULL,
      block_number INTEGER NOT NULL,
      tx_hash TEXT NOT NULL,
      log_index INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      UNIQUE(tx_hash, log_index)
    );

    CREATE TABLE IF NOT EXISTS spin_reclaimed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trigger_id TEXT NOT NULL,
      requester TEXT NOT NULL,
      refund_amount TEXT NOT NULL,
      block_number INTEGER NOT NULL,
      tx_hash TEXT NOT NULL,
      log_index INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      UNIQUE(tx_hash, log_index)
    );

    CREATE TABLE IF NOT EXISTS nft_deposited (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection TEXT NOT NULL,
      token_id TEXT NOT NULL,
      depositor TEXT NOT NULL,
      rarity INTEGER NOT NULL,
      appraised_price TEXT NOT NULL,
      block_number INTEGER NOT NULL,
      tx_hash TEXT NOT NULL,
      log_index INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      UNIQUE(tx_hash, log_index)
    );

    CREATE TABLE IF NOT EXISTS indexer_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_spin_completed_requester ON spin_completed(requester);
    CREATE INDEX IF NOT EXISTS idx_spin_completed_trigger ON spin_completed(trigger_id);
    CREATE INDEX IF NOT EXISTS idx_spin_refunded_requester ON spin_refunded(requester);
    CREATE INDEX IF NOT EXISTS idx_spin_refunded_trigger ON spin_refunded(trigger_id);
    CREATE INDEX IF NOT EXISTS idx_spin_reclaimed_requester ON spin_reclaimed(requester);
    CREATE INDEX IF NOT EXISTS idx_spin_reclaimed_trigger ON spin_reclaimed(trigger_id);
    CREATE INDEX IF NOT EXISTS idx_nft_deposited_depositor ON nft_deposited(depositor);
    CREATE INDEX IF NOT EXISTS idx_nft_deposited_collection ON nft_deposited(collection);
  `);

  return db;
}

export function getLastIndexedBlock(db: Database.Database): bigint {
  const row = db
    .prepare("SELECT value FROM indexer_state WHERE key = 'last_block'")
    .get() as { value: string } | undefined;
  return row ? BigInt(row.value) : 0n;
}

export function setLastIndexedBlock(
  db: Database.Database,
  block: bigint,
): void {
  db.prepare(
    "INSERT OR REPLACE INTO indexer_state (key, value) VALUES ('last_block', ?)",
  ).run(block.toString());
}
