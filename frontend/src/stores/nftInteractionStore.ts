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
	collection: string | null;
	tokenId: string | null;
};

type InteractionContext = {
	collection: string | null;
	tokenId: string | null;
	treasuryAddress: string | null;
	protocolTreasuryAddress: string | null;
	userAddress: string | null;
	publicClient: PublicClient | null;
	nftApprovalNeeded: boolean;
	hasAppraisal: boolean;
	appraisalPrice: bigint | null;
	payoutAmount: bigint | null;
	interactionTxHash: string | null;
	nftApprovalTxHash: string | null;
	error: string | null;
	success: InteractionSuccess | null;
	mode: InteractionMode;
};

type StartConfig = {
	collection: string;
	tokenId: string;
	mode: InteractionMode;
	treasuryAddress: string;
	protocolTreasuryAddress?: string;
	userAddress: string;
	publicClient: PublicClient;
	hasAppraisal?: boolean;
	appraisalPrice?: bigint;
	payoutAmount?: bigint;
};

type InteractionStore = {
	status: InteractionStatus;
	context: InteractionContext;
	startInteraction: (config: StartConfig) => void;
	setStatus: (status: InteractionStatus) => void;
	markApprovalSubmitted: (txHash: string) => void;
	markApprovalReceipt: (txHash: string) => void;
	markInteractionSubmitted: (txHash: string) => void;
	markInteractionSuccess: (txHash: string) => void;
	setError: (message: string) => void;
	reset: () => void;
};

const initialContext: InteractionContext = {
	collection: null,
	tokenId: null,
	treasuryAddress: null,
	protocolTreasuryAddress: null,
	userAddress: null,
	publicClient: null,
	nftApprovalNeeded: true,
	hasAppraisal: false,
	appraisalPrice: null,
	payoutAmount: null,
	interactionTxHash: null,
	nftApprovalTxHash: null,
	error: null,
	success: null,
	mode: "deposit",
};

export const useNFTInteractionStore = create<InteractionStore>((set) => ({
	status: "idle",
	context: initialContext,

	startInteraction: (config) =>
		set(() => ({
			status: "checkingApprovals",
			context: {
				...initialContext,
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
			},
		})),

	setStatus: (status) => set(() => ({ status })),

	markApprovalSubmitted: (txHash) =>
		set((state) => ({
			status: "awaitingNFTApprovalReceipt",
			context: { ...state.context, nftApprovalTxHash: txHash },
		})),

	markApprovalReceipt: (txHash) =>
		set((state) => ({
			status: "awaitingInteractionSignature",
			context: { ...state.context, nftApprovalTxHash: txHash },
		})),

	markInteractionSubmitted: (txHash) =>
		set((state) => ({
			status: "awaitingInteractionReceipt",
			context: { ...state.context, interactionTxHash: txHash },
		})),

	markInteractionSuccess: (txHash) =>
		set((state) => ({
			status: "completed",
			context: {
				...state.context,
				interactionTxHash: txHash,
				success:
					state.context.payoutAmount !== null
						? {
								mode: state.context.mode,
								txHash,
								payoutAmount: state.context.payoutAmount,
								completedAt: Date.now(),
								collection: state.context.collection,
								tokenId: state.context.tokenId,
							}
						: null,
				error: null,
			},
		})),

	setError: (message) =>
		set((state) => ({
			status: "error",
			context: { ...state.context, error: message, success: null },
		})),

	reset: () => set({ status: "idle", context: initialContext }),
}));
