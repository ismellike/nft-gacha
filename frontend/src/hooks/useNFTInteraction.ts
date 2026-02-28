"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { isUserRejectedError } from "../lib/transactionErrors";
import {
	useAccount,
	usePublicClient,
	useWaitForTransactionReceipt,
} from "wagmi";
import {
	erc721Abi,
	useWriteErc721SetApprovalForAll,
	useWriteGachaTreasuryDepositNft,
	useWriteProtocolTreasuryExecuteRedemption,
} from "../generated";
import {
	type InteractionKey,
	type InteractionMode,
	useNFTInteractionStore,
} from "../stores/nftInteractionStore";

type MaybeFn<T> = T | undefined;

type StartInteractionConfig = Parameters<
	ReturnType<typeof useNFTInteractionStore.getState>["startInteraction"]
>[0];

export interface UseNFTInteractionParams {
	collection?: string;
	tokenId?: string;
	mode?: InteractionMode;
	uniqueId?: string | undefined; // Unique identifier to distinguish duplicates
	onSuccess?: MaybeFn<(txHash: string) => void>;
	onAction?: MaybeFn<
		(collection: string, tokenId: string, hasValidAppraisal?: boolean) => void
	>;
	onAppraisalStatusChange?: MaybeFn<
		(collection: string, tokenId: string, hasValidAppraisal: boolean) => void
	>;
	refetchTreasuryCards?: MaybeFn<() => Promise<void>>;
	onBuybackSuccess?: MaybeFn<(txHash: string, payoutAmount: bigint) => void>;
}

export const useNFTInteraction = (params: UseNFTInteractionParams = {}) => {
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();

	// Create interaction key for selector
	const interactionKey = useMemo(() => {
		if (params.collection && params.tokenId && params.mode) {
			return `${params.mode}:${params.collection}:${params.tokenId}:${params.uniqueId ?? "default"}`;
		}
		return null;
	}, [params.collection, params.tokenId, params.mode, params.uniqueId]);

	// Use selector to subscribe to specific interaction state (reactive)
	const specificState = useNFTInteractionStore((state) => {
		if (interactionKey) {
			return state.interactions[interactionKey as InteractionKey] ?? null;
		}
		return null;
	});

	// Active interaction for non-specific usage
	const activeState = useNFTInteractionStore((state) => {
		if (state.activeInteraction) {
			return state.interactions[state.activeInteraction] ?? null;
		}
		return null;
	});

	// If we have a specific NFT, use ONLY its state. Otherwise use global active state.
	const status =
		params.collection && params.tokenId && params.mode
			? (specificState?.status ?? "idle")
			: (specificState?.status ?? activeState?.status ?? "idle");
	const context =
		params.collection && params.tokenId && params.mode
			? (specificState?.context ?? null)
			: (specificState?.context ?? activeState?.context ?? null);
	const {
		startInteraction: storeStart,
		setStatus,
		markApprovalSubmitted,
		markApprovalReceipt,
		markInteractionSubmitted,
		markInteractionSuccess,
		setError,
		resetInteraction: reset,
	} = useNFTInteractionStore();

	// Stable ref for context to avoid recreating callbacks on every context change
	const contextRef = useRef(context);
	contextRef.current = context;
	const statusRef = useRef(status);
	statusRef.current = status;

	// Wagmi writes
	const {
		writeContractAsync: approveCollection,
		reset: resetNFTApproval,
		data: nftApprovalTxHash,
	} = useWriteErc721SetApprovalForAll();

	const {
		writeContractAsync: depositNFT,
		reset: resetDeposit,
		data: depositTxHash,
		isSuccess: isDepositSuccess,
		isError: isDepositError,
		error: depositError,
	} = useWriteGachaTreasuryDepositNft();

	const {
		writeContractAsync: executeRedemption,
		reset: resetRedemption,
		data: redemptionTxHash,
		isSuccess: isRedemptionSuccess,
		isError: isRedemptionError,
		error: redemptionError,
	} = useWriteProtocolTreasuryExecuteRedemption();

	const { data: depositReceipt } = useWaitForTransactionReceipt({
		hash: depositTxHash,
	});
	const { data: redemptionReceipt } = useWaitForTransactionReceipt({
		hash: redemptionTxHash,
	});
	const { data: nftApprovalReceipt } = useWaitForTransactionReceipt({
		hash: nftApprovalTxHash,
	});

	const startInteraction = useCallback(
		(
			collection: string,
			tokenId: string,
			mode: InteractionMode,
			config: {
				treasuryAddress: string;
				protocolTreasuryAddress?: string;
				hasAppraisal?: boolean;
				appraisalPrice?: bigint;
				payoutAmount?: bigint;
			},
		) => {
			if (!userAddress || !publicClient) {
				setError(
					"Wallet not connected or network unavailable. Please check your connection and try again.",
				);
				return;
			}

			// Read from refs to avoid stale closure over context/status
			const ctx = contextRef.current;
			const currentStatus = statusRef.current;

			// Prevent overlapping interactions for the same NFT unless completed
			const currentKey = `${ctx?.collection ?? ""}-${ctx?.tokenId ?? ""}`;
			const nextKey = `${collection}-${tokenId}`;
			if (
				currentStatus !== "idle" &&
				currentStatus !== "completed" &&
				currentKey !== nextKey
			) {
				setError("Another interaction is in progress for a different NFT.");
				return;
			}

			const startConfig: StartInteractionConfig = {
				collection,
				tokenId,
				mode,
				treasuryAddress: config.treasuryAddress,
				userAddress,
				publicClient,
			};

			if (config.protocolTreasuryAddress) {
				startConfig.protocolTreasuryAddress = config.protocolTreasuryAddress;
			}
			if (config.hasAppraisal !== undefined) {
				startConfig.hasAppraisal = config.hasAppraisal;
			}
			if (config.appraisalPrice !== undefined) {
				startConfig.appraisalPrice = config.appraisalPrice;
			}
			if (config.payoutAmount !== undefined) {
				startConfig.payoutAmount = config.payoutAmount;
			}
			if (params.uniqueId !== undefined) {
				startConfig.uniqueId = params.uniqueId;
			}

			storeStart(startConfig);
		},
		[publicClient, setError, storeStart, userAddress, params.uniqueId],
	);

	// Kick off approval automatically when entering checkingApprovals
	const maybeStartApproval = useCallback(async () => {
		const currentStatus = statusRef.current;
		const ctx = contextRef.current;
		if (currentStatus !== "checkingApprovals" || !ctx) return;

		const {
			collection,
			treasuryAddress,
			protocolTreasuryAddress,
			mode,
			publicClient,
		} = ctx;
		const operatorAddress =
			mode === "buyback" ? protocolTreasuryAddress : treasuryAddress;

		if (!collection || !operatorAddress || !userAddress) {
			setError("Missing approval parameters");
			return;
		}

		try {
			const alreadyApproved = await publicClient?.readContract({
				address: collection as `0x${string}`,
				abi: erc721Abi,
				functionName: "isApprovedForAll",
				args: [userAddress as `0x${string}`, operatorAddress as `0x${string}`],
			});

			if (alreadyApproved) {
				setStatus("awaitingInteractionSignature");
				return;
			}

			setStatus("awaitingNFTApprovalSignature");
			const txHash = await approveCollection({
				address: collection as `0x${string}`,
				args: [operatorAddress as `0x${string}`, true],
			});
			if (txHash) {
				markApprovalSubmitted(txHash);
			}
		} catch (error) {
			if (isUserRejectedError(error)) {
				resetNFTApproval();
				setStatus("idle");
			} else {
				setError(
					error instanceof Error
						? error.message
						: "NFT approval failed. Please try again.",
				);
			}
		}
	}, [
		approveCollection,
		markApprovalSubmitted,
		resetNFTApproval,
		setError,
		setStatus,
		userAddress,
	]);

	// Deposit action for deposits or redemption for buybacks when awaitingInteractionSignature
	const maybeExecuteAction = useCallback(async () => {
		const currentStatus = statusRef.current;
		const ctx = contextRef.current;
		if (currentStatus !== "awaitingInteractionSignature" || !ctx) return;
		const {
			collection,
			tokenId,
			mode,
			treasuryAddress,
			protocolTreasuryAddress,
		} = ctx;
		if (!collection || !tokenId) return;

		try {
			if (mode === "deposit" && treasuryAddress) {
				const txHash = await depositNFT({
					address: treasuryAddress as `0x${string}`,
					args: [collection as `0x${string}`, BigInt(tokenId)],
				});
				if (txHash) {
					markInteractionSubmitted(txHash);
				}
			} else if (mode === "buyback" && protocolTreasuryAddress && userAddress) {
				const txHash = await executeRedemption({
					address: protocolTreasuryAddress as `0x${string}`,
					args: [collection as `0x${string}`, BigInt(tokenId)],
				});
				if (txHash) {
					markInteractionSubmitted(txHash);
				}
			} else {
				setError("Missing parameters for interaction execution");
			}
		} catch (error) {
			if (isUserRejectedError(error)) {
				setStatus("idle");
				resetDeposit();
				resetRedemption();
			} else {
				setError(
					error instanceof Error
						? error.message
						: "Transaction failed. Please try again.",
				);
				resetDeposit();
				resetRedemption();
			}
		}
	}, [
		depositNFT,
		executeRedemption,
		markInteractionSubmitted,
		resetDeposit,
		resetRedemption,
		setError,
		setStatus,
		userAddress,
	]);

	// --- Wagmi event reactions ---
	// Wait for NFT approval receipt before transitioning
	useEffect(() => {
		if (nftApprovalReceipt?.status === "success" && nftApprovalTxHash) {
			markApprovalReceipt(nftApprovalTxHash);
		}
		if (nftApprovalReceipt?.status === "reverted") {
			setError("NFT approval transaction reverted. Please try again.");
		}
	}, [nftApprovalReceipt, markApprovalReceipt, nftApprovalTxHash, setError]);

	useEffect(() => {
		if (isDepositSuccess && depositTxHash) {
			markInteractionSubmitted(depositTxHash);
		}
	}, [isDepositSuccess, depositTxHash, markInteractionSubmitted]);

	useEffect(() => {
		if (isRedemptionSuccess && redemptionTxHash) {
			markInteractionSubmitted(redemptionTxHash);
		}
	}, [isRedemptionSuccess, markInteractionSubmitted, redemptionTxHash]);

	useEffect(() => {
		if (isDepositError && depositError) {
			if (isUserRejectedError(depositError)) {
				setStatus("idle");
			} else {
				setError(
					depositError?.message
						? `Deposit failed: ${depositError.message}`
						: "Deposit failed. Please try again.",
				);
			}
		}
	}, [depositError, isDepositError, setError, setStatus]);

	useEffect(() => {
		if (isRedemptionError && redemptionError) {
			if (isUserRejectedError(redemptionError)) {
				setStatus("idle");
			} else {
				setError(
					redemptionError?.message
						? `Redemption failed: ${redemptionError.message}`
						: "Redemption failed. Please try again.",
				);
			}
		}
	}, [isRedemptionError, redemptionError, setError, setStatus]);

	useEffect(() => {
		if (status === "awaitingInteractionReceipt") {
			const receipt = depositReceipt || redemptionReceipt;
			if (receipt?.status === "reverted") {
				setError("Transaction reverted on-chain. Please try again.");
				return;
			}
			if (receipt?.status === "success" && context?.interactionTxHash) {
				markInteractionSuccess(context.interactionTxHash);
				if (params.onSuccess) params.onSuccess(context.interactionTxHash);
				if (
					params.onBuybackSuccess &&
					context.mode === "buyback" &&
					context.payoutAmount
				) {
					params.onBuybackSuccess(
						context.interactionTxHash,
						context.payoutAmount,
					);
				}
			}
		}
	}, [
		context?.interactionTxHash,
		context?.mode,
		context?.payoutAmount,
		depositReceipt,
		markInteractionSuccess,
		params,
		redemptionReceipt,
		status,
		setError,
	]);

	// Trigger side-effects based on status changes
	useEffect(() => {
		if (status === "checkingApprovals") {
			void maybeStartApproval();
		}
		if (status === "awaitingInteractionSignature") {
			void maybeExecuteAction();
		}
	}, [maybeExecuteAction, maybeStartApproval, status]);

	const getActionInfo = useCallback(() => {
		if (status === "checkingApprovals") {
			return { type: "checking", label: "Checking approvals..." } as const;
		}
		if (status === "awaitingNFTApprovalSignature") {
			return { type: "approveNFT", label: "Approve NFT" } as const;
		}
		if (status === "awaitingInteractionSignature") {
			return { type: "sign", label: "Sign transaction" } as const;
		}
		if (status === "awaitingInteractionReceipt") {
			return { type: "processing", label: "Processing..." } as const;
		}
		if (status === "completed") {
			return { type: "completed", label: "Completed" } as const;
		}
		if (status === "error") {
			return { type: "error", label: context?.error || "Error" } as const;
		}
		return { type: "idle", label: "" } as const;
	}, [context?.error, status]);

	const isProcessing = useMemo(() => {
		return (
			status !== "idle" &&
			status !== "completed" &&
			status !== "error" &&
			status !== "awaitingInteractionSignature"
		);
	}, [status]);

	return {
		// state
		status,
		context,
		error: context?.error,
		isLoading: isProcessing,
		isCompleted: status === "completed",
		successData: context?.success,

		// actions
		startInteraction,
		reset: () => {
			reset();
			resetDeposit();
			resetRedemption();
			resetNFTApproval();
		},
		getActionInfo,
	};
};
