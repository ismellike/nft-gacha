import type { PublicClient } from "viem";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { gachaAbi } from "../generated";
import { logger } from "../lib/logger";
import { getSpinKey } from "./storeUtils";

interface PendingSpin {
	triggerId: bigint;
	timestamp: number;
	userAddress: string;
	gachaAddress: string;
}

interface GachaStore {
	// State
	pendingSpins: Record<string, PendingSpin>;

	// Actions
	addPendingSpin: (spin: Omit<PendingSpin, "timestamp">) => void;
	removePendingSpin: (userAddress: string, gachaAddress: string) => void;
	getPendingSpin: (
		userAddress: string,
		gachaAddress: string,
	) => PendingSpin | null;
	validateAndCleanPendingSpins: (publicClient: PublicClient) => Promise<void>;
}

const PENDING_SPIN_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export const useGachaStore = create<GachaStore>()(
	persist(
		(set, get) => ({
			pendingSpins: {},

			addPendingSpin: (spin) => {
				const key = getSpinKey(spin.userAddress, spin.gachaAddress);
				set((state) => ({
					pendingSpins: {
						...state.pendingSpins,
						[key]: {
							...spin,
							timestamp: Date.now(),
						},
					},
				}));
			},

			removePendingSpin: (userAddress, gachaAddress) => {
				const key = getSpinKey(userAddress, gachaAddress);
				set((state) => {
					const { [key]: _removed, ...remaining } = state.pendingSpins;
					return { pendingSpins: remaining };
				});
			},

			getPendingSpin: (userAddress, gachaAddress) => {
				const key = getSpinKey(userAddress, gachaAddress);
				const spin = get().pendingSpins[key];

				if (!spin) return null;

				// Check if expired
				const age = Date.now() - spin.timestamp;
				if (age >= PENDING_SPIN_TIMEOUT) {
					get().removePendingSpin(userAddress, gachaAddress);
					return null;
				}

				return spin;
			},

			validateAndCleanPendingSpins: async (publicClient) => {
				const { pendingSpins } = get();
				const validatedSpins: Record<string, PendingSpin> = {};

				// Check each pending spin against the contract
				for (const [key, spin] of Object.entries(pendingSpins)) {
					try {
						// Query the contract spinRequests mapping to see if this spin is still pending
						const spinRequest = (await publicClient.readContract({
							address: spin.gachaAddress as `0x${string}`,
							abi: gachaAbi,
							functionName: "spinRequests",
							args: [spin.triggerId],
						})) as readonly [bigint, bigint, string, number]; // [feePaid, requestTime, requester, statusFlags]

						const [, , requester, statusFlags] = spinRequest;
						const fulfilled = (statusFlags & 1) === 1; // bit 0 = fulfilled

						// Keep the spin if it exists and isn't fulfilled and belongs to the right user
						const requesterLower = String(requester).toLowerCase();

						if (
							requesterLower === spin.userAddress.toLowerCase() &&
							!fulfilled
						) {
							validatedSpins[key] = spin;
						}
					} catch (error) {
						logger.state.warn(
							`Failed to validate pending spin for ${key}:`,
							error,
						);
						// Keep the spin if we can't validate (network issues, etc.)
						validatedSpins[key] = spin;
					}
				}

				set({ pendingSpins: validatedSpins });
			},
		}),
		{
			name: "gacha-store",
			storage: createJSONStorage(() => localStorage, {
				replacer: (_key, value) =>
					typeof value === "bigint" ? { __bigint: value.toString() } : value,
				reviver: (_key, value) => {
					if (
						value !== null &&
						typeof value === "object" &&
						"__bigint" in value &&
						typeof (value as { __bigint: unknown }).__bigint === "string"
					) {
						return BigInt((value as { __bigint: string }).__bigint);
					}
					return value;
				},
			}),
		},
	),
);
