import { onchainTable, index } from "@ponder/core";

export const spinCompleted = onchainTable(
  "spin_completed",
  (t) => ({
    id: t.text().primaryKey(),
    triggerId: t.text().notNull(),
    requester: t.text().notNull(),
    rarity: t.integer().notNull(),
    collection: t.text().notNull(),
    tokenId: t.text().notNull(),
    appraisedPrice: t.text().notNull(),
    blockNumber: t.integer().notNull(),
    txHash: t.text().notNull(),
    logIndex: t.integer().notNull(),
    timestamp: t.integer().notNull(),
  }),
  (table) => ({
    requesterIdx: index().on(table.requester),
    triggerIdIdx: index().on(table.triggerId),
  }),
);

export const spinRefunded = onchainTable(
  "spin_refunded",
  (t) => ({
    id: t.text().primaryKey(),
    triggerId: t.text().notNull(),
    requester: t.text().notNull(),
    selectedRarity: t.integer().notNull(),
    refundAmount: t.text().notNull(),
    blockNumber: t.integer().notNull(),
    txHash: t.text().notNull(),
    logIndex: t.integer().notNull(),
    timestamp: t.integer().notNull(),
  }),
  (table) => ({
    requesterIdx: index().on(table.requester),
    triggerIdIdx: index().on(table.triggerId),
  }),
);

export const spinReclaimed = onchainTable(
  "spin_reclaimed",
  (t) => ({
    id: t.text().primaryKey(),
    triggerId: t.text().notNull(),
    requester: t.text().notNull(),
    refundAmount: t.text().notNull(),
    blockNumber: t.integer().notNull(),
    txHash: t.text().notNull(),
    logIndex: t.integer().notNull(),
    timestamp: t.integer().notNull(),
  }),
  (table) => ({
    requesterIdx: index().on(table.requester),
    triggerIdIdx: index().on(table.triggerId),
  }),
);

export const nftDeposited = onchainTable(
  "nft_deposited",
  (t) => ({
    id: t.text().primaryKey(),
    collection: t.text().notNull(),
    tokenId: t.text().notNull(),
    depositor: t.text().notNull(),
    rarity: t.integer().notNull(),
    appraisedPrice: t.text().notNull(),
    blockNumber: t.integer().notNull(),
    txHash: t.text().notNull(),
    logIndex: t.integer().notNull(),
    timestamp: t.integer().notNull(),
  }),
  (table) => ({
    depositorIdx: index().on(table.depositor),
    collectionIdx: index().on(table.collection),
  }),
);
