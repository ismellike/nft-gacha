import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PublicClient } from "viem";
import { gachaAbi } from "../generated";

export interface PendingSpin {
	triggerId: bigint;
	timestamp: number;
	userAddress: string;
	gachaAddress: string;
}

export interface GachaStore {
	// State
	pendingSpins: Record<string, PendingSpin>;

	// Actions
	addPendingSpin: (spin: Omit<PendingSpin, "timestamp">) => void;
	removePendingSpin: (userAddress: string, gachaAddress: string) => void;
	getPendingSpin: (
		userAddress: string,
		gachaAddress: string,
	) => PendingSpin | null;
	clearExpiredSpins: () => void;
	validateAndCleanPendingSpins: (publicClient: PublicClient) => Promise<void>;
}

const PENDING_SPIN_TIMEOUT = 10 * 60 * 1000; // 10 minutes

// Generate a unique key for user + gacha contract combination
const getSpinKey = (userAddress: string, gachaAddress: string) =>
	`${userAddress.toLowerCase()}_${gachaAddress.toLowerCase()}`;

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

			clearExpiredSpins: () => {
				const now = Date.now();
				set((state) => {
					const validSpins = Object.fromEntries(
						Object.entries(state.pendingSpins).filter(
							([_, spin]) => now - spin.timestamp < PENDING_SPIN_TIMEOUT,
						),
					);
					return { pendingSpins: validSpins };
				});
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
						})) as [string, boolean]; // [requester, fulfilled]

						const [requester, fulfilled] = spinRequest;

						// Keep the spin if it exists and isn't fulfilled and belongs to the right user
						if (
							requester.toLowerCase() === spin.userAddress.toLowerCase() &&
							!fulfilled
						) {
							validatedSpins[key] = spin;
						} else {
							console.log(
								`🧹 Removing invalid pending spin for ${spin.userAddress} on ${spin.gachaAddress} (${fulfilled ? "fulfilled" : "not found"})`,
							);
						}
					} catch (error) {
						console.warn(`Failed to validate pending spin for ${key}:`, error);
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
					typeof value === "bigint" ? value.toString() : value,
				reviver: (key, value) => {
					// Convert triggerId strings back to BigInt for specific keys
					if (
						key === "triggerId" &&
						typeof value === "string" &&
						value.match(/^\d+$/)
					) {
						return BigInt(value);
					}
					return value;
				},
			}),
		},
	),
);
