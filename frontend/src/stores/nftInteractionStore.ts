import { create } from "zustand";
import type { PublicClient } from "viem";

export type InteractionMode = "deposit" | "buyback";

type InteractionStatus =
	| "idle"
	| "checkingApprovals"
	| "awaitingNFTApprovalSignature"
	| "awaitingNFTApprovalReceipt"
	| "awaitingInteractionSignature"
	| "awaitingInteractionReceipt"
	| "completed"
	| "error";

type InteractionSuccess = {
	mode: InteractionMode;
	txHash: string;
	payoutAmount: bigint;
	completedAt: number;
	collection: string;
	tokenId: string;
};

type InteractionContext = {
	collection: string;
	tokenId: string;
	treasuryAddress: string;
	protocolTreasuryAddress: string | null;
	userAddress: string;
	publicClient: PublicClient;
	nftApprovalNeeded: boolean;
	hasAppraisal: boolean;
	appraisalPrice: bigint | null;
	payoutAmount: bigint | null;
	interactionTxHash: string | null;
	nftApprovalTxHash: string | null;
	error: string | null;
	success: InteractionSuccess | null;
	mode: InteractionMode;
	uniqueId: string | null; // Unique identifier to distinguish duplicates
};

type InteractionState = {
	status: InteractionStatus;
	context: InteractionContext | null;
};

export type InteractionKey = `${InteractionMode}:${string}:${string}:${string}`;

type StartConfig = {
	collection: string;
	tokenId: string;
	mode: InteractionMode;
	uniqueId?: string; // Unique identifier (e.g., triggerId for spin history)
	treasuryAddress: string;
	protocolTreasuryAddress?: string;
	userAddress: string;
	publicClient: PublicClient;
	hasAppraisal?: boolean;
	appraisalPrice?: bigint;
	payoutAmount?: bigint;
};

type InteractionStore = {
	interactions: Map<InteractionKey, InteractionState>;
	activeInteraction: InteractionKey | null;
	startInteraction: (config: StartConfig) => void;
	setStatus: (status: InteractionStatus) => void;
	markApprovalSubmitted: (txHash: string) => void;
	markApprovalReceipt: (txHash: string) => void;
	markInteractionSubmitted: (txHash: string) => void;
	markInteractionSuccess: (txHash: string) => void;
	setError: (message: string) => void;
	resetInteraction: () => void;
	resetAll: () => void;
	getActiveInteraction: () => InteractionState | null;
	getInteraction: (mode: InteractionMode, collection: string, tokenId: string, uniqueId?: string) => InteractionState | null;
};

const createInteractionKey = (
	mode: InteractionMode,
	collection: string,
	tokenId: string,
	uniqueId?: string,
): InteractionKey => `${mode}:${collection}:${tokenId}:${uniqueId ?? 'default'}`;

export const useNFTInteractionStore = create<InteractionStore>((set, get) => ({
	interactions: new Map(),
	activeInteraction: null,

	startInteraction: (config) => {
		const key = createInteractionKey(
			config.mode,
			config.collection,
			config.tokenId,
			config.uniqueId,
		);

		const newContext: InteractionContext = {
			collection: config.collection,
			tokenId: config.tokenId,
			mode: config.mode,
			treasuryAddress: config.treasuryAddress,
			protocolTreasuryAddress: config.protocolTreasuryAddress || null,
			userAddress: config.userAddress,
			publicClient: config.publicClient,
			hasAppraisal: config.hasAppraisal ?? false,
			appraisalPrice: config.appraisalPrice ?? null,
			payoutAmount: config.payoutAmount ?? null,
			nftApprovalNeeded: true,
			nftApprovalTxHash: null,
			interactionTxHash: null,
			error: null,
			success: null,
			uniqueId: config.uniqueId ?? null, // Store the uniqueId in context
		};

		set((state) => {
			const newInteractions = new Map(state.interactions);
			newInteractions.set(key, {
				status: "checkingApprovals",
				context: newContext,
			});
			return {
				interactions: newInteractions,
				activeInteraction: key,
			};
		});
	},

	setStatus: (status) =>
		set((state) => {
			if (!state.activeInteraction) return state;
			const newInteractions = new Map(state.interactions);
			const current = newInteractions.get(state.activeInteraction);
			if (current) {
				newInteractions.set(state.activeInteraction, {
					...current,
					status,
				});
			}
			return { interactions: newInteractions };
		}),

	markApprovalSubmitted: (txHash) =>
		set((state) => {
			if (!state.activeInteraction) return state;
			const newInteractions = new Map(state.interactions);
			const current = newInteractions.get(state.activeInteraction);
			if (current?.context) {
				newInteractions.set(state.activeInteraction, {
					status: "awaitingNFTApprovalReceipt",
					context: {
						...current.context,
						nftApprovalTxHash: txHash,
					},
				});
			}
			return { interactions: newInteractions };
		}),

	markApprovalReceipt: (txHash) =>
		set((state) => {
			if (!state.activeInteraction) return state;
			const newInteractions = new Map(state.interactions);
			const current = newInteractions.get(state.activeInteraction);
			if (current?.context) {
				newInteractions.set(state.activeInteraction, {
					status: "awaitingInteractionSignature",
					context: {
						...current.context,
						nftApprovalTxHash: txHash,
					},
				});
			}
			return { interactions: newInteractions };
		}),

	markInteractionSubmitted: (txHash) =>
		set((state) => {
			if (!state.activeInteraction) return state;
			const newInteractions = new Map(state.interactions);
			const current = newInteractions.get(state.activeInteraction);
			if (current?.context) {
				newInteractions.set(state.activeInteraction, {
					status: "awaitingInteractionReceipt",
					context: {
						...current.context,
						interactionTxHash: txHash,
					},
				});
			}
			return { interactions: newInteractions };
		}),

	markInteractionSuccess: (txHash) =>
		set((state) => {
			if (!state.activeInteraction) return state;
			const newInteractions = new Map(state.interactions);
			const current = newInteractions.get(state.activeInteraction);
			if (current?.context) {
				const success =
					current.context.payoutAmount !== null
						? {
								mode: current.context.mode,
								txHash,
								payoutAmount: current.context.payoutAmount,
								completedAt: Date.now(),
								collection: current.context.collection,
								tokenId: current.context.tokenId,
							}
						: null;

				newInteractions.set(state.activeInteraction, {
					status: "completed",
					context: {
						...current.context,
						interactionTxHash: txHash,
						success,
						error: null,
					},
				});
			}
			return { interactions: newInteractions };
		}),

	setError: (message) =>
		set((state) => {
			if (!state.activeInteraction) return state;
			const newInteractions = new Map(state.interactions);
			const current = newInteractions.get(state.activeInteraction);
			if (current?.context) {
				newInteractions.set(state.activeInteraction, {
					status: "error",
					context: {
						...current.context,
						error: message,
						success: null,
					},
				});
			}
			return { interactions: newInteractions };
		}),

	resetInteraction: () =>
		set((state) => {
			if (!state.activeInteraction) return state;
			const newInteractions = new Map(state.interactions);
			newInteractions.delete(state.activeInteraction);
			return {
				interactions: newInteractions,
				activeInteraction: null,
			};
		}),

	resetAll: () => ({
		interactions: new Map(),
		activeInteraction: null,
	}),

	getActiveInteraction: () => {
		const state = get();
		if (!state.activeInteraction) return null;
		return state.interactions.get(state.activeInteraction) ?? null;
	},

	getInteraction: (mode, collection, tokenId, uniqueId) => {
		const state = get();
		const key = createInteractionKey(mode, collection, tokenId, uniqueId);
		return state.interactions.get(key) ?? null;
	},
}));
