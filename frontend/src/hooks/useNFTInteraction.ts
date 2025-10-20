"use client";

import { useCallback, useEffect } from "react";
import { useAccount, useWriteContract, usePublicClient, useWaitForTransactionReceipt } from "wagmi";
import { useMachine } from "@xstate/react";
import { UserRejectedRequestError } from "viem";
import { erc721Abi, useWriteGachaTreasuryDepositNft, useWriteProtocolTreasuryExecuteRedemption } from "../generated";
import { nftInteractionMachine, type InteractionMode } from "../machines/nftInteractionMachine";

interface UseNFTInteractionParams {
	onSuccess?: (txHash: string) => void;
	onAction?: (collection: string, tokenId: string, hasValidAppraisal?: boolean) => void;
	onAppraisalStatusChange?: (collection: string, tokenId: string, hasValidAppraisal: boolean) => void;
	refetchTreasuryCards?: () => Promise<void>;
}

export const useNFTInteraction = (params: UseNFTInteractionParams = {}) => {
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();

	// XState machine for interaction process
	const [interactionState, sendInteractionEvent] = useMachine(nftInteractionMachine, {
		input: {
			onSuccess: params.onSuccess,
			onAction: params.onAction,
			onAppraisalStatusChange: params.onAppraisalStatusChange,
			refetchTreasuryCards: params.refetchTreasuryCards,
		},
	});

	// Contract write hooks
	const {
		writeContract: approveNFT,
		isSuccess: isNFTApprovalSuccess,
		isError: isNFTApprovalError,
		error: nftApprovalError,
		data: nftApprovalTxHash,
		reset: resetNFTApproval,
	} = useWriteContract();

	const {
		writeContract: depositNFT,
		isSuccess: isDepositSuccess,
		isError: isDepositError,
		error: depositError,
		data: depositTxHash,
		reset: resetDeposit,
	} = useWriteGachaTreasuryDepositNft();

	const {
		writeContractAsync: executeRedemption,
		isSuccess: isRedemptionSuccess,
		isError: isRedemptionError,
		error: redemptionError,
		data: redemptionTxHash,
		reset: resetRedemption,
	} = useWriteProtocolTreasuryExecuteRedemption();

	// Transaction receipt hooks
	const { data: nftApprovalReceipt } = useWaitForTransactionReceipt({
		hash: nftApprovalTxHash as `0x${string}`,
		query: {
			enabled: !!nftApprovalTxHash,
		},
	});

	const { data: depositReceipt } = useWaitForTransactionReceipt({
		hash: depositTxHash as `0x${string}`,
		query: {
			enabled: !!depositTxHash,
		},
	});

	const { data: redemptionReceipt } = useWaitForTransactionReceipt({
		hash: redemptionTxHash as `0x${string}`,
		query: {
			enabled: !!redemptionTxHash,
		},
	});

	// Start interaction function
	const startInteraction = useCallback(async (
		collection: string,
		tokenId: string,
		mode: InteractionMode,
		config: {
			treasuryAddress: string;
			protocolTreasuryAddress?: string;
			hasAppraisal?: boolean;
			appraisalPrice?: bigint;
			payoutAmount?: bigint;
		}
	) => {
		if (!userAddress || !publicClient) {
			sendInteractionEvent({
				type: "FAIL",
				error: "Wallet not connected or network unavailable. Please check your connection and try again.",
			});
			return;
		}

		sendInteractionEvent({
			type: "START_INTERACTION",
			collection,
			tokenId,
			mode,
			treasuryAddress: config.treasuryAddress,
			protocolTreasuryAddress: config.protocolTreasuryAddress,
			userAddress,
			publicClient,
			hasAppraisal: config.hasAppraisal,
			appraisalPrice: config.appraisalPrice,
			payoutAmount: config.payoutAmount,
			onSuccess: params.onSuccess,
			onAction: params.onAction,
			onAppraisalStatusChange: params.onAppraisalStatusChange,
			refetchTreasuryCards: params.refetchTreasuryCards,
		});
	}, [userAddress, publicClient, sendInteractionEvent, params]);

	// Handle NFT approval
	const handleNFTApproval = useCallback((collection: string, operatorAddress: string) => {
		try {
			approveNFT({
				address: collection as `0x${string}`,
				abi: erc721Abi,
				functionName: "setApprovalForAll",
				args: [operatorAddress as `0x${string}`, true],
			});
		} catch (error) {
			sendInteractionEvent({
				type: "FAIL",
				error: error instanceof Error
					? `NFT approval failed: ${error.message}`
					: "Failed to initiate NFT approval. Please check your wallet and try again.",
			});
		}
	}, [approveNFT, sendInteractionEvent]);

	// Handle NFT deposit
	const handleDepositNFT = useCallback((collection: string, tokenId: string, treasuryAddress: string) => {
		try {
			depositNFT({
				address: treasuryAddress as `0x${string}`,
				args: [collection as `0x${string}`, BigInt(tokenId)],
			});
		} catch (error) {
			const isUserRejected = error instanceof UserRejectedRequestError
				|| (error instanceof Error && error.name === "UserRejectedRequestError")
				|| (error instanceof Error && error.message?.toLowerCase().includes("user rejected"));

			if (isUserRejected) {
				resetDeposit();
				sendInteractionEvent({
					type: "INTERACTION_CANCELLED",
					reason: "Deposit cancelled by user.",
				});
			} else {
				sendInteractionEvent({
					type: "FAIL",
					error: error instanceof Error
						? `Deposit failed: ${error.message}`
						: "Failed to initiate NFT deposit. Please check your wallet and try again.",
				});
			}
		}
	}, [depositNFT, sendInteractionEvent, resetDeposit]);

	// Handle NFT buyback (redemption)
	const handleRedemption = useCallback(async (collection: string, tokenId: string, protocolTreasuryAddress: string) => {
		try {
			await executeRedemption({
				address: protocolTreasuryAddress as `0x${string}`,
				args: [collection as `0x${string}`, BigInt(tokenId), userAddress!]
			});
		} catch (error) {
			const isUserRejected = error instanceof UserRejectedRequestError
				|| (error instanceof Error && error.name === "UserRejectedRequestError")
				|| (error instanceof Error && error.message?.toLowerCase().includes("user rejected"));

			if (isUserRejected) {
				resetRedemption();
				sendInteractionEvent({
					type: "INTERACTION_CANCELLED",
					reason: "Redemption cancelled by user.",
				});
			} else {
				sendInteractionEvent({
					type: "FAIL",
					error: error instanceof Error
						? `Redemption failed: ${error.message}`
						: "Failed to initiate NFT redemption. Please check your wallet and try again.",
				});
			}
		}
	}, [executeRedemption, userAddress, sendInteractionEvent, resetRedemption]);

	// Reset transaction flags when starting a new interaction or when machine is reset
	useEffect(() => {
		if (interactionState.matches("checkingApprovals") || interactionState.matches("idle")) {
			// Reset all transaction states to ensure fresh start
			resetNFTApproval();
			resetDeposit();
			resetRedemption();
		}
	}, [interactionState, resetNFTApproval, resetDeposit, resetRedemption]);

	// Handle NFT approval transaction success (transaction submitted)
	useEffect(() => {
		const currentCollection = interactionState.context.collection;
		const currentTokenId = interactionState.context.tokenId;

		// Only process approval success if we're in the right state AND
		// the approval is for the current NFT (prevents stale approvals from previous interactions)
		if (isNFTApprovalSuccess && nftApprovalTxHash &&
			interactionState.matches("awaitingNFTApprovalSignature") &&
			currentCollection && currentTokenId) {

			// Get the transaction details to verify this approval is for the current collection
			// This prevents stale approval success from triggering for new NFTs
			sendInteractionEvent({
				type: "NFT_APPROVAL_CONFIRMED",
				txHash: nftApprovalTxHash,
			});
		}
	}, [isNFTApprovalSuccess, nftApprovalTxHash, interactionState, sendInteractionEvent]);

	// Handle NFT approval transaction error
	useEffect(() => {
		if (isNFTApprovalError && nftApprovalError && interactionState.matches("awaitingNFTApprovalSignature")) {
			sendInteractionEvent({
				type: "FAIL",
				error: nftApprovalError?.message
					? `NFT approval transaction failed: ${nftApprovalError.message}`
					: "NFT approval transaction failed. Please check your wallet and try again.",
			});
		}
	}, [isNFTApprovalError, nftApprovalError, interactionState, sendInteractionEvent]);

	// Handle NFT approval receipt confirmation
	useEffect(() => {
		if (nftApprovalReceipt && interactionState.matches("awaitingNFTApprovalReceipt")) {
			sendInteractionEvent({
				type: "NFT_APPROVAL_REQUESTED",
			});
		}
	}, [nftApprovalReceipt, interactionState, sendInteractionEvent]);

	// Handle deposit transaction success (transaction submitted)
	useEffect(() => {
		const currentCollection = interactionState.context.collection;
		const currentTokenId = interactionState.context.tokenId;
		const currentMode = interactionState.context.mode;
		const contextInteractionTxHash = interactionState.context.interactionTxHash;

		// Only process deposit success if we're in the right state, in deposit mode, AND
		// the transaction is for the current NFT (prevents stale deposits from previous interactions)
		// AND there's no existing interactionTxHash in context OR the tx hash is different (prevents replay)
		if (isDepositSuccess && depositTxHash &&
			interactionState.matches("awaitingInteractionSignature") &&
			currentMode === "deposit" &&
			currentCollection && currentTokenId &&
			(!contextInteractionTxHash || contextInteractionTxHash !== depositTxHash)) {

			console.log("📤 Sending INTERACTION_CONFIRMED event for deposit:", depositTxHash);
			sendInteractionEvent({
				type: "INTERACTION_CONFIRMED",
				txHash: depositTxHash,
			});
		}
	}, [isDepositSuccess, depositTxHash, interactionState, sendInteractionEvent]);

	// Handle deposit transaction error
	useEffect(() => {
		const currentCollection = interactionState.context.collection;
		const currentTokenId = interactionState.context.tokenId;
		const currentMode = interactionState.context.mode;

		// Only process deposit error if we're in the right state, in deposit mode, AND
		// the error is for the current NFT (prevents stale errors from previous interactions)
		if (isDepositError && depositError &&
			interactionState.matches("awaitingInteractionSignature") &&
			currentMode === "deposit" &&
			currentCollection && currentTokenId) {
			const isUserRejected = depositError instanceof UserRejectedRequestError
				|| depositError?.name === "UserRejectedRequestError"
				|| depositError?.message?.toLowerCase().includes("user rejected");

			if (isUserRejected) {
				resetDeposit();
				sendInteractionEvent({
					type: "INTERACTION_CANCELLED",
					reason: "Deposit cancelled by user.",
				});
			} else {
				sendInteractionEvent({
					type: "FAIL",
					error: depositError?.message
						? `Deposit transaction failed: ${depositError.message}`
						: "Deposit transaction failed. Please check your wallet and try again.",
				});
			}
		}
	}, [isDepositError, depositError, interactionState, sendInteractionEvent, resetDeposit]);

	// Handle redemption transaction success (transaction submitted)
	useEffect(() => {
		const currentCollection = interactionState.context.collection;
		const currentTokenId = interactionState.context.tokenId;
		const currentMode = interactionState.context.mode;
		const contextInteractionTxHash = interactionState.context.interactionTxHash;

		// Only process redemption success if we're in the right state, in buyback mode, AND
		// the transaction is for the current NFT (prevents stale redemptions from previous interactions)
		// AND there's no existing interactionTxHash in context OR the tx hash is different (prevents replay)
		if (isRedemptionSuccess && redemptionTxHash &&
			interactionState.matches("awaitingInteractionSignature") &&
			currentMode === "buyback" &&
			currentCollection && currentTokenId &&
			(!contextInteractionTxHash || contextInteractionTxHash !== redemptionTxHash)) {

			console.log("📤 Sending INTERACTION_CONFIRMED event for redemption:", redemptionTxHash);
			sendInteractionEvent({
				type: "INTERACTION_CONFIRMED",
				txHash: redemptionTxHash,
			});
		}
	}, [isRedemptionSuccess, redemptionTxHash, interactionState, sendInteractionEvent]);

	// Handle redemption transaction error
	useEffect(() => {
		const currentCollection = interactionState.context.collection;
		const currentTokenId = interactionState.context.tokenId;
		const currentMode = interactionState.context.mode;

		// Only process redemption error if we're in the right state, in buyback mode, AND
		// the error is for the current NFT (prevents stale errors from previous interactions)
		if (isRedemptionError && redemptionError &&
			interactionState.matches("awaitingInteractionSignature") &&
			currentMode === "buyback" &&
			currentCollection && currentTokenId) {
			const isUserRejected = redemptionError instanceof UserRejectedRequestError
				|| redemptionError?.name === "UserRejectedRequestError"
				|| redemptionError?.message?.toLowerCase().includes("user rejected");

			if (isUserRejected) {
				resetRedemption();
				sendInteractionEvent({
					type: "INTERACTION_CANCELLED",
					reason: "Redemption cancelled by user.",
				});
			} else {
				sendInteractionEvent({
					type: "FAIL",
					error: redemptionError?.message
						? `Redemption transaction failed: ${redemptionError.message}`
						: "Redemption transaction failed. Please check your wallet and try again.",
				});
			}
		}
	}, [isRedemptionError, redemptionError, interactionState, sendInteractionEvent, resetRedemption]);

	// Handle transaction receipt confirmation
	useEffect(() => {
		const receipt = depositReceipt || redemptionReceipt;
		console.log("🔍 Checking receipt:", {
			receipt: !!receipt,
			depositReceipt: !!depositReceipt,
			redemptionReceipt: !!redemptionReceipt,
			currentState: interactionState.value,
			isAwaitingReceipt: interactionState.matches("awaitingInteractionReceipt")
		});
		if (receipt && interactionState.matches("awaitingInteractionReceipt")) {
			console.log("📤 Sending INTERACTION_REQUESTED event");
			sendInteractionEvent({
				type: "INTERACTION_REQUESTED",
			});
		}
	}, [depositReceipt, redemptionReceipt, interactionState, sendInteractionEvent]);

	// Reset function
	const reset = useCallback(() => {
		sendInteractionEvent({ type: "RESET" });
	}, [sendInteractionEvent]);

	// Get current state info for UI
	const currentState = interactionState.value as string;
	const context = interactionState.context;
	const error = context.error;
	const isLoading = !interactionState.matches("idle") && !interactionState.matches("completed");

	// Determine current action needed based on state
	const getActionInfo = useCallback(() => {
		const mode = context.mode;

		if (currentState === "checkingApprovals" || currentState === "checkingNFTApproval") {
			return { type: "checking", label: "Checking approvals..." };
		}

		if (currentState === "awaitingNFTApprovalSignature") {
			const operatorAddress = mode === "buyback" ? context.protocolTreasuryAddress : context.treasuryAddress;
			if (!operatorAddress) {
				return { type: "idle", label: "Missing approval address" };
			}
			return {
				type: "approveNFT",
				label: "Approve NFT",
				action: () => handleNFTApproval(context.collection!, operatorAddress)
			};
		}

		if (currentState === "awaitingInteractionSignature") {
			if (mode === "deposit") {
				return {
					type: "deposit",
					label: "Deposit NFT",
					action: () => handleDepositNFT(context.collection!, context.tokenId!, context.treasuryAddress!)
				};
			} else {
				return {
					type: "redeem",
					label: "Accept Buyback",
					action: () => handleRedemption(context.collection!, context.tokenId!, context.protocolTreasuryAddress!)
				};
			}
		}

		if (currentState === "completed") {
			return { type: "completed", label: mode === "deposit" ? "Deposited Successfully" : "Buyback Completed" };
		}

		if (currentState.includes("awaiting") || currentState === "confirmingInteraction") {
			return { type: "processing", label: "Processing..." };
		}

		return { type: "idle", label: "" };
	}, [currentState, context, handleNFTApproval, handleDepositNFT, handleRedemption]);

	return {
		// State
		currentState,
		context,
		error,
		isLoading,

		// Actions
		startInteraction,
		reset,
		getActionInfo,

		// State machine (for advanced usage)
		interactionState,
		sendInteractionEvent,
	};
};
