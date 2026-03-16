import type Database from "better-sqlite3";
import {
  type Address,
  type PublicClient,
  decodeEventLog,
  parseAbiItem,
} from "viem";
import { GachaAbi, GachaTreasuryAbi } from "./abi.js";
import { getLastIndexedBlock, setLastIndexedBlock } from "./db/schema.js";

interface IndexerConfig {
  gachaAddress: Address;
  treasuryAddress: Address;
  pollIntervalMs: number;
  batchSize: bigint;
}

export class EventIndexer {
  private db: Database.Database;
  private client: PublicClient;
  private config: IndexerConfig;
  private running = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  // Prepared statements for insert performance
  private stmts: {
    spinCompleted: Database.Statement;
    spinRefunded: Database.Statement;
    spinReclaimed: Database.Statement;
    nftDeposited: Database.Statement;
  };

  constructor(
    db: Database.Database,
    client: PublicClient,
    config: IndexerConfig,
  ) {
    this.db = db;
    this.client = client;
    this.config = config;

    this.stmts = {
      spinCompleted: db.prepare(`
        INSERT OR IGNORE INTO spin_completed
          (trigger_id, requester, rarity, collection, token_id, appraised_price, block_number, tx_hash, log_index, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),
      spinRefunded: db.prepare(`
        INSERT OR IGNORE INTO spin_refunded
          (trigger_id, requester, selected_rarity, refund_amount, block_number, tx_hash, log_index, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `),
      spinReclaimed: db.prepare(`
        INSERT OR IGNORE INTO spin_reclaimed
          (trigger_id, requester, refund_amount, block_number, tx_hash, log_index, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `),
      nftDeposited: db.prepare(`
        INSERT OR IGNORE INTO nft_deposited
          (collection, token_id, depositor, rarity, appraised_price, block_number, tx_hash, log_index, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),
    };
  }

  async start(): Promise<void> {
    this.running = true;
    console.log(
      `[indexer] Starting event indexer for gacha=${this.config.gachaAddress} treasury=${this.config.treasuryAddress}`,
    );
    await this.poll();
  }

  stop(): void {
    this.running = false;
    if (this.timer) clearTimeout(this.timer);
    console.log("[indexer] Stopped");
  }

  private async poll(): Promise<void> {
    if (!this.running) return;

    try {
      await this.indexNewBlocks();
    } catch (err) {
      console.error("[indexer] Poll error:", err);
    }

    this.timer = setTimeout(
      () => this.poll(),
      this.config.pollIntervalMs,
    );
  }

  private async indexNewBlocks(): Promise<void> {
    const lastIndexed = getLastIndexedBlock(this.db);
    const currentBlock = await this.client.getBlockNumber();

    if (currentBlock <= lastIndexed) return;

    let fromBlock = lastIndexed + 1n;
    const toBlock = currentBlock;

    // Process in batches to avoid RPC limits
    while (fromBlock <= toBlock) {
      const batchEnd =
        fromBlock + this.config.batchSize - 1n > toBlock
          ? toBlock
          : fromBlock + this.config.batchSize - 1n;

      const [gachaLogs, treasuryLogs] = await Promise.all([
        this.client.getLogs({
          address: this.config.gachaAddress,
          fromBlock,
          toBlock: batchEnd,
        }),
        this.client.getLogs({
          address: this.config.treasuryAddress,
          fromBlock,
          toBlock: batchEnd,
        }),
      ]);

      // Get block timestamps for logs
      const blockNumbers = new Set<bigint>();
      for (const log of [...gachaLogs, ...treasuryLogs]) {
        blockNumbers.add(log.blockNumber);
      }
      const timestamps = new Map<bigint, number>();
      await Promise.all(
        [...blockNumbers].map(async (bn) => {
          const block = await this.client.getBlock({ blockNumber: bn });
          timestamps.set(bn, Number(block.timestamp));
        }),
      );

      // Insert in a transaction for atomicity
      const insertAll = this.db.transaction(() => {
        for (const log of gachaLogs) {
          this.processGachaLog(log, timestamps.get(log.blockNumber) ?? 0);
        }
        for (const log of treasuryLogs) {
          this.processTreasuryLog(
            log,
            timestamps.get(log.blockNumber) ?? 0,
          );
        }
        setLastIndexedBlock(this.db, batchEnd);
      });
      insertAll();

      const total = gachaLogs.length + treasuryLogs.length;
      if (total > 0) {
        console.log(
          `[indexer] Indexed blocks ${fromBlock}-${batchEnd}: ${total} events`,
        );
      }

      fromBlock = batchEnd + 1n;
    }
  }

  private processGachaLog(
    log: { topics: readonly `0x${string}`[]; data: `0x${string}`; transactionHash: `0x${string}` | null; blockNumber: bigint; logIndex: number | null },
    timestamp: number,
  ): void {
    try {
      const decoded = decodeEventLog({
        abi: GachaAbi,
        data: log.data,
        topics: log.topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
      });

      const txHash = log.transactionHash ?? "0x";
      const logIndex = log.logIndex ?? 0;

      switch (decoded.eventName) {
        case "SpinCompleted":
          this.stmts.spinCompleted.run(
            decoded.args.triggerId.toString(),
            decoded.args.requester,
            decoded.args.rarity,
            decoded.args.collection,
            decoded.args.tokenId.toString(),
            decoded.args.appraisedPrice.toString(),
            Number(log.blockNumber),
            txHash,
            logIndex,
            timestamp,
          );
          break;
        case "SpinRefunded":
          this.stmts.spinRefunded.run(
            decoded.args.triggerId.toString(),
            decoded.args.requester,
            decoded.args.selectedRarity,
            decoded.args.refundAmount.toString(),
            Number(log.blockNumber),
            txHash,
            logIndex,
            timestamp,
          );
          break;
        case "SpinReclaimed":
          this.stmts.spinReclaimed.run(
            decoded.args.triggerId.toString(),
            decoded.args.requester,
            decoded.args.refundAmount.toString(),
            Number(log.blockNumber),
            txHash,
            logIndex,
            timestamp,
          );
          break;
      }
    } catch {
      // Unknown event topic — skip
    }
  }

  private processTreasuryLog(
    log: { topics: readonly `0x${string}`[]; data: `0x${string}`; transactionHash: `0x${string}` | null; blockNumber: bigint; logIndex: number | null },
    timestamp: number,
  ): void {
    try {
      const decoded = decodeEventLog({
        abi: GachaTreasuryAbi,
        data: log.data,
        topics: log.topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
      });

      const txHash = log.transactionHash ?? "0x";
      const logIndex = log.logIndex ?? 0;

      if (decoded.eventName === "NFTDeposited") {
        this.stmts.nftDeposited.run(
          decoded.args.collection,
          decoded.args.tokenId.toString(),
          decoded.args.depositor,
          decoded.args.rarity,
          decoded.args.appraisedPrice.toString(),
          Number(log.blockNumber),
          txHash,
          logIndex,
          timestamp,
        );
      }
    } catch {
      // Unknown event topic — skip
    }
  }
}
