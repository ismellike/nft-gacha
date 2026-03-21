import type { PublicClient } from "viem";
import { create } from "zustand";

export type InteractionMode = "deposit" | "buyback";

export type InteractionStatus =
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

const STALE_INTERACTION_MS = 5 * 60 * 1000; // 5 minutes

type InteractionStore = {
	interactions: Record<string, InteractionState>;
	activeInteraction: InteractionKey | null;
	startInteraction: (config: StartConfig) => void;
	setStatus: (status: InteractionStatus) => void;
	markApprovalSubmitted: (txHash: string) => void;
	markApprovalReceipt: (txHash: string) => void;
	markInteractionSubmitted: (txHash: string) => void;
	markInteractionSuccess: (txHash: string) => void;
	setError: (message: string) => void;
	resetInteraction: () => void;
	removeInteraction: (key: InteractionKey) => void;
	cleanupStaleInteractions: () => void;
	getActiveInteraction: () => InteractionState | null;
	getInteraction: (
		mode: InteractionMode,
		collection: string,
		tokenId: string,
		uniqueId?: string,
	) => InteractionState | null;
};

const createInteractionKey = (
	mode: InteractionMode,
	collection: string,
	tokenId: string,
	uniqueId?: string,
): InteractionKey =>
	`${mode}:${collection}:${tokenId}:${uniqueId ?? "default"}`;

export const useNFTInteractionStore = create<InteractionStore>((set, get) => ({
	interactions: {},
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
			protocolTreasuryAddress: config.protocolTreasuryAddress ?? null,
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
			uniqueId: config.uniqueId ?? null,
		};

		set((state) => ({
			interactions: {
				...state.interactions,
				[key]: {
					status: "checkingApprovals" as const,
					context: newContext,
				},
			},
			activeInteraction: key,
		}));
	},

	setStatus: (status) =>
		set((state) => {
			if (!state.activeInteraction) return state;
			const current = state.interactions[state.activeInteraction];
			if (!current) return state;
			return {
				interactions: {
					...state.interactions,
					[state.activeInteraction]: { ...current, status },
				},
			};
		}),

	markApprovalSubmitted: (txHash) =>
		set((state) => {
			if (!state.activeInteraction) return state;
			const current = state.interactions[state.activeInteraction];
			if (!current?.context) return state;
			return {
				interactions: {
					...state.interactions,
					[state.activeInteraction]: {
						status: "awaitingNFTApprovalReceipt",
						context: { ...current.context, nftApprovalTxHash: txHash },
					},
				},
			};
		}),

	markApprovalReceipt: (txHash) =>
		set((state) => {
			if (!state.activeInteraction) return state;
			const current = state.interactions[state.activeInteraction];
			if (!current?.context) return state;
			return {
				interactions: {
					...state.interactions,
					[state.activeInteraction]: {
						status: "awaitingInteractionSignature",
						context: { ...current.context, nftApprovalTxHash: txHash },
					},
				},
			};
		}),

	markInteractionSubmitted: (txHash) =>
		set((state) => {
			if (!state.activeInteraction) return state;
			const current = state.interactions[state.activeInteraction];
			if (!current?.context) return state;
			return {
				interactions: {
					...state.interactions,
					[state.activeInteraction]: {
						status: "awaitingInteractionReceipt",
						context: { ...current.context, interactionTxHash: txHash },
					},
				},
			};
		}),

	markInteractionSuccess: (txHash) =>
		set((state) => {
			if (!state.activeInteraction) return state;
			const current = state.interactions[state.activeInteraction];
			if (!current?.context) return state;
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
			return {
				interactions: {
					...state.interactions,
					[state.activeInteraction]: {
						status: "completed",
						context: {
							...current.context,
							interactionTxHash: txHash,
							success,
							error: null,
						},
					},
				},
			};
		}),

	setError: (message) =>
		set((state) => {
			if (!state.activeInteraction) return state;
			const current = state.interactions[state.activeInteraction];
			if (!current?.context) return state;
			return {
				interactions: {
					...state.interactions,
					[state.activeInteraction]: {
						status: "error",
						context: {
							...current.context,
							error: message,
							success: null,
						},
					},
				},
			};
		}),

	resetInteraction: () => {
		get().cleanupStaleInteractions();
		set((state) => {
			if (!state.activeInteraction) return state;
			const { [state.activeInteraction]: _removed, ...remaining } =
				state.interactions;
			return {
				interactions: remaining,
				activeInteraction: null,
			};
		});
	},

	removeInteraction: (key) =>
		set((state) => {
			if (!(key in state.interactions)) return state;
			const { [key]: _removed, ...remaining } = state.interactions;
			return {
				interactions: remaining,
				activeInteraction:
					state.activeInteraction === key ? null : state.activeInteraction,
			};
		}),

	cleanupStaleInteractions: () =>
		set((state) => {
			const now = Date.now();
			const cleaned: Record<string, InteractionState> = {};
			for (const [key, interaction] of Object.entries(state.interactions)) {
				const isTerminal =
					interaction.status === "completed" || interaction.status === "error";
				const completedAt = interaction.context?.success?.completedAt;
				const isStale =
					isTerminal && completedAt && now - completedAt > STALE_INTERACTION_MS;
				if (!isStale) {
					cleaned[key] = interaction;
				}
			}
			return { interactions: cleaned };
		}),

	getActiveInteraction: () => {
		const state = get();
		if (!state.activeInteraction) return null;
		return state.interactions[state.activeInteraction] ?? null;
	},

	getInteraction: (mode, collection, tokenId, uniqueId) => {
		const state = get();
		const key = createInteractionKey(mode, collection, tokenId, uniqueId);
		return state.interactions[key] ?? null;
	},
}));
