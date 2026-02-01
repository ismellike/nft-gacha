/**
 * Transaction History Store
 *
 * Persists transaction receipts in localStorage for later viewing.
 * Stores successful and failed transactions with their details.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TransactionType =
	| "spin"
	| "appraisal"
	| "deposit"
	| "withdrawal"
	| "claim";

export interface TransactionReceipt {
	hash: string;
	type: TransactionType;
	status: "success" | "failed";
	timestamp: number;
	blockNumber?: bigint;
	gasUsed?: bigint;
	// Additional metadata
	gachaAddress?: string;
	userAddress?: string;
}

interface TransactionHistoryStore {
	receipts: Record<string, TransactionReceipt>;
	addReceipt: (receipt: TransactionReceipt) => void;
	getReceipt: (hash: string) => TransactionReceipt | null;
	getReceiptsByType: (type: TransactionType) => TransactionReceipt[];
	getReceiptsByAddress: (address: string) => TransactionReceipt[];
	clearHistory: () => void;
	clearOldReceipts: (olderThanTimestamp: number) => void;
}

export const useTransactionHistoryStore = create<TransactionHistoryStore>()(
	persist(
		(set, get) => ({
			receipts: {},

			addReceipt: (receipt) =>
				set((state) => ({
					receipts: { ...state.receipts, [receipt.hash]: receipt },
				})),

			getReceipt: (hash) => {
				const receipt = get().receipts[hash];
				return receipt || null;
			},

			getReceiptsByType: (type) => {
				const receipts = get().receipts;
				return Object.values(receipts).filter((r) => r.type === type);
			},

			getReceiptsByAddress: (address) => {
				const receipts = get().receipts;
				return Object.values(receipts).filter(
					(r) => r.userAddress?.toLowerCase() === address.toLowerCase(),
				);
			},

			clearHistory: () => set({ receipts: {} }),

			clearOldReceipts: (olderThanTimestamp) =>
				set((state) => {
					const filtered = Object.entries(state.receipts).filter(
						([, receipt]) => receipt.timestamp >= olderThanTimestamp,
					);
					return {
						receipts: Object.fromEntries(filtered),
					};
				}),
		}),
		{
			name: "transaction-history",
			// Only persist essential data
			partialize: (state) => ({
				receipts: state.receipts,
			}),
		},
	),
);
