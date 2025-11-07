"use client";

import { useCallback, useEffect } from "react";
import {
	useAccount,
	usePublicClient,
	useWaitForTransactionReceipt,
} from "wagmi";
import { useMachine } from "@xstate/react";
import { UserRejectedRequestError } from "viem";
import {
	useWriteErc721SetApprovalForAll,
	useWriteGachaTreasuryDepositNft,
	useWriteProtocolTreasuryExecuteRedemption,
} from "../generated";
import {
	nftInteractionMachine,
	type InteractionMode,
} from "../machines/nftInteractionMachine";

interface UseNFTInteractionParams {
	onSuccess?: (txHash: string) => void;
	onAction?: (
		collection: string,
		tokenId: string,
		hasValidAppraisal?: boolean,
	) => void;
	onAppraisalStatusChange?: (
		collection: string,
		tokenId: string,
		hasValidAppraisal: boolean,
	) => void;
	refetchTreasuryCards?: () => Promise<void>;
	onBuybackSuccess?: (txHash: string, payoutAmount: bigint) => void;
}

export const useNFTInteraction = (params: UseNFTInteractionParams = {}) => {
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();

	// XState machine for interaction process
	const [interactionState, sendInteractionEvent] = useMachine(
		nftInteractionMachine,
		{
			input: {
				onSuccess: params.onSuccess,
				onAction: params.onAction,
				onAppraisalStatusChange: params.onAppraisalStatusChange,
				refetchTreasuryCards: params.refetchTreasuryCards,
				onBuybackSuccess: params.onBuybackSuccess,
			},
		},
	);

	// Contract write hooks
	const {
		writeContract: approveNFT,
		isSuccess: isNFTApprovalSuccess,
		isError: isNFTApprovalError,
		error: nftApprovalError,
		data: nftApprovalTxHash,
		reset: resetNFTApproval,
	} = useWriteErc721SetApprovalForAll();

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

	// Reset function
	const reset = useCallback(() => {
		sendInteractionEvent({ type: "RESET" });
	}, [sendInteractionEvent]);

	// Force reset function to clear any stuck state
	const forceReset = useCallback(() => {
		resetNFTApproval();
		resetDeposit();
		resetRedemption();
		sendInteractionEvent({ type: "RESET" });
	}, [sendInteractionEvent, resetNFTApproval, resetDeposit, resetRedemption]);

	// Start interaction function
	const startInteraction = useCallback(
		async (
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
			try {
				if (!userAddress || !publicClient) {
					sendInteractionEvent({
						type: "FAIL",
						error:
							"Wallet not connected or network unavailable. Please check your connection and try again.",
					});
					return;
				}

				// If we're in completed state from a buyback, don't allow new interactions
				// (buybacks should stay completed since the NFT is no longer owned by the user)
				if (
					interactionState.matches("completed") &&
					interactionState.context.mode === "buyback"
				) {
					return;
				}

				// Reset the machine if it's not in idle state to handle previous failed/rejected transactions
				if (!interactionState.matches("idle")) {
					console.log(
						"🔄 Resetting NFT interaction machine from state:",
						interactionState.value,
					);
					console.log("🔄 Current context:", {
						collection: interactionState.context.collection,
						tokenId: interactionState.context.tokenId,
						mode: interactionState.context.mode,
						error: interactionState.context.error,
					});

					sendInteractionEvent({ type: "RESET" });

					// Small delay to ensure reset is processed
					await new Promise((resolve) => setTimeout(resolve, 100));

					// Additional safety check - if still not idle, force reset
					if (!interactionState.matches("idle")) {
						console.warn(
							"⚠️ Force resetting NFT interaction machine - still not idle after RESET",
						);
						forceReset();
						await new Promise((resolve) => setTimeout(resolve, 100));
					}
				}

				// Final safety check before starting the interaction
				if (!interactionState.matches("idle")) {
					console.error(
						"❌ Cannot start NFT interaction - machine is not in idle state:",
						interactionState.value,
					);
					console.error("❌ Machine context:", interactionState.context);

					// Try one more aggressive reset
					forceReset();

					// Show user-friendly error
					throw new Error(
						"Cannot start deposit - previous transaction is still processing. Please wait a moment and try again.",
					);
				}

				console.log("🚀 Starting NFT interaction:", {
					collection,
					tokenId,
					mode,
				});

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
					onBuybackSuccess: params.onBuybackSuccess,
				});
			} catch (error) {
				console.error("💥 Error in startInteraction:", error);
				sendInteractionEvent({
					type: "FAIL",
					error:
						error instanceof Error ? error.message : "Unknown error occurred",
				});
			}
		},
		[
			userAddress,
			publicClient,
			sendInteractionEvent,
			params,
			interactionState,
			forceReset,
		],
	);

	// Handle NFT approval
	const handleNFTApproval = useCallback(
		(collection: string, operatorAddress: string) => {
			try {
				approveNFT({
					address: collection as `0x${string}`,
					args: [operatorAddress as `0x${string}`, true],
				});
			} catch (_error) {
				// Let the useEffect handle user rejection to avoid double processing
				// Just reset the approval state and let the error bubble up
				resetNFTApproval();
			}
		},
		[approveNFT, resetNFTApproval],
	);

	// Handle NFT deposit
	const handleDepositNFT = useCallback(
		(collection: string, tokenId: string, treasuryAddress: string) => {
			try {
				depositNFT({
					address: treasuryAddress as `0x${string}`,
					args: [collection as `0x${string}`, BigInt(tokenId)],
				});
			} catch (_error) {
				// Let the useEffect handle user rejection to avoid double processing
				// Just reset the deposit state and let the error bubble up
				resetDeposit();
			}
		},
		[depositNFT, resetDeposit],
	);

	// Handle NFT buyback (redemption)
	const handleRedemption = useCallback(
		async (
			collection: string,
			tokenId: string,
			protocolTreasuryAddress: string,
		) => {
			try {
				await executeRedemption({
					address: protocolTreasuryAddress as `0x${string}`,
					args: [
						collection! as `0x${string}`,
						BigInt(tokenId),
						userAddress!,
					] as any,
				});
			} catch (_error) {
				// Let the useEffect handle user rejection to avoid double processing
				// Just reset the redemption state and let the error bubble up
				resetRedemption();
			}
		},
		[executeRedemption, userAddress, resetRedemption],
	);

	// Reset transaction flags when starting a new interaction or when machine is reset
	useEffect(() => {
		try {
			if (
				interactionState.matches("checkingApprovals") ||
				interactionState.matches("idle")
			) {
				// Reset all transaction states to ensure fresh start
				resetNFTApproval();
				resetDeposit();
				resetRedemption();
			}
		} catch (error) {
			console.error("💥 Error in reset transaction flags effect:", error);
		}
	}, [interactionState, resetNFTApproval, resetDeposit, resetRedemption]);

	// Handle NFT approval transaction success (transaction submitted)
	useEffect(() => {
		try {
			const currentCollection = interactionState.context.collection;
			const currentTokenId = interactionState.context.tokenId;

			// Only process approval success if we're in the right state AND
			// the approval is for the current NFT (prevents stale approvals from previous interactions)
			if (
				isNFTApprovalSuccess &&
				nftApprovalTxHash &&
				interactionState.matches("awaitingNFTApprovalSignature") &&
				currentCollection &&
				currentTokenId
			) {
				// Get the transaction details to verify this approval is for the current collection
				// This prevents stale approval success from triggering for new NFTs
				sendInteractionEvent({
					type: "NFT_APPROVAL_CONFIRMED",
					txHash: nftApprovalTxHash,
				});
			}
		} catch (error) {
			console.error("💥 Error in NFT approval success effect:", error);
		}
	}, [
		isNFTApprovalSuccess,
		nftApprovalTxHash,
		interactionState,
		sendInteractionEvent,
	]);

	// Handle NFT approval transaction error
	useEffect(() => {
		try {
			if (
				isNFTApprovalError &&
				nftApprovalError &&
				interactionState.matches("awaitingNFTApprovalSignature")
			) {
				const isUserRejected =
					nftApprovalError instanceof UserRejectedRequestError ||
					(nftApprovalError as Error | undefined)?.name ===
						"UserRejectedRequestError" ||
					((nftApprovalError as Error | undefined)?.message || "")
						.toLowerCase()
						.includes("user rejected");

				if (isUserRejected) {
					resetNFTApproval();
					sendInteractionEvent({
						type: "INTERACTION_CANCELLED",
						reason: "NFT approval cancelled by user.",
					});
				} else {
					sendInteractionEvent({
						type: "FAIL",
						error: nftApprovalError?.message
							? `NFT approval transaction failed: ${nftApprovalError.message}`
							: "NFT approval transaction failed. Please check your wallet and try again.",
					});
				}
			}
		} catch (error) {
			console.error("💥 Error in NFT approval error effect:", error);
		}
	}, [
		isNFTApprovalError,
		nftApprovalError,
		interactionState,
		sendInteractionEvent,
		resetNFTApproval,
	]);

	// Handle NFT approval receipt confirmation
	useEffect(() => {
		try {
			if (
				nftApprovalReceipt &&
				interactionState.matches("awaitingNFTApprovalReceipt")
			) {
				sendInteractionEvent({
					type: "NFT_APPROVAL_REQUESTED",
				});
			}
		} catch (error) {
			console.error("💥 Error in NFT approval receipt effect:", error);
		}
	}, [nftApprovalReceipt, interactionState, sendInteractionEvent]);

	// Handle deposit transaction success (transaction submitted)
	useEffect(() => {
		try {
			const currentCollection = interactionState.context.collection;
			const currentTokenId = interactionState.context.tokenId;
			const currentMode = interactionState.context.mode;
			const contextInteractionTxHash =
				interactionState.context.interactionTxHash;

			// Only process deposit success if we're in the right state, in deposit mode, AND
			// the transaction is for the current NFT (prevents stale deposits from previous interactions)
			// AND there's no existing interactionTxHash in context OR the tx hash is different (prevents replay)
			if (
				isDepositSuccess &&
				depositTxHash &&
				interactionState.matches("awaitingInteractionSignature") &&
				currentMode === "deposit" &&
				currentCollection &&
				currentTokenId &&
				(!contextInteractionTxHash ||
					contextInteractionTxHash !== depositTxHash)
			) {
				sendInteractionEvent({
					type: "INTERACTION_CONFIRMED",
					txHash: depositTxHash,
				});
			}
		} catch (error) {
			console.error("💥 Error in deposit success effect:", error);
		}
	}, [isDepositSuccess, depositTxHash, interactionState, sendInteractionEvent]);

	// Handle deposit transaction error
	useEffect(() => {
		try {
			const currentCollection = interactionState.context.collection;
			const currentTokenId = interactionState.context.tokenId;
			const currentMode = interactionState.context.mode;

			// Only process deposit error if we're in the right state, in deposit mode, AND
			// the error is for the current NFT (prevents stale errors from previous interactions)
			if (
				isDepositError &&
				depositError &&
				interactionState.matches("awaitingInteractionSignature") &&
				currentMode === "deposit" &&
				currentCollection &&
				currentTokenId
			) {
				const isUserRejected =
					(depositError as UserRejectedRequestError)?.name ===
						"UserRejectedRequestError" ||
					depositError?.message?.toLowerCase().includes("user rejected");

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
		} catch (error) {
			console.error("💥 Error in deposit error effect:", error);
		}
	}, [
		isDepositError,
		depositError,
		interactionState,
		sendInteractionEvent,
		resetDeposit,
	]);

	// Handle redemption transaction success (transaction submitted)
	useEffect(() => {
		try {
			const currentCollection = interactionState.context.collection;
			const currentTokenId = interactionState.context.tokenId;
			const currentMode = interactionState.context.mode;
			const contextInteractionTxHash =
				interactionState.context.interactionTxHash;

			// Only process redemption success if we're in the right state, in buyback mode, AND
			// the transaction is for the current NFT (prevents stale redemptions from previous interactions)
			// AND there's no existing interactionTxHash in context OR the tx hash is different (prevents replay)
			if (
				isRedemptionSuccess &&
				redemptionTxHash &&
				interactionState.matches("awaitingInteractionSignature") &&
				currentMode === "buyback" &&
				currentCollection &&
				currentTokenId &&
				(!contextInteractionTxHash ||
					contextInteractionTxHash !== redemptionTxHash)
			) {
				sendInteractionEvent({
					type: "INTERACTION_CONFIRMED",
					txHash: redemptionTxHash,
				});
			}
		} catch (error) {
			console.error("💥 Error in redemption success effect:", error);
		}
	}, [
		isRedemptionSuccess,
		redemptionTxHash,
		interactionState,
		sendInteractionEvent,
	]);

	// Handle redemption transaction error
	useEffect(() => {
		try {
			const currentCollection = interactionState.context.collection;
			const currentTokenId = interactionState.context.tokenId;
			const currentMode = interactionState.context.mode;

			// Only process redemption error if we're in the right state, in buyback mode, AND
			// the error is for the current NFT (prevents stale errors from previous interactions)
			if (
				isRedemptionError &&
				redemptionError &&
				interactionState.matches("awaitingInteractionSignature") &&
				currentMode === "buyback" &&
				currentCollection &&
				currentTokenId
			) {
				const isUserRejected =
					(redemptionError as UserRejectedRequestError)?.name ===
						"UserRejectedRequestError" ||
					redemptionError?.message?.toLowerCase().includes("user rejected");

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
		} catch (error) {
			console.error("💥 Error in redemption error effect:", error);
		}
	}, [
		isRedemptionError,
		redemptionError,
		interactionState,
		sendInteractionEvent,
		resetRedemption,
		interactionState.matches,
	]);

	// Handle automatic NFT approval when entering awaitingNFTApprovalSignature
	useEffect(() => {
		try {
			if (interactionState.matches("awaitingNFTApprovalSignature")) {
				const mode = interactionState.context.mode;
				const collection = interactionState.context.collection;
				const operatorAddress =
					mode === "buyback"
						? interactionState.context.protocolTreasuryAddress
						: interactionState.context.treasuryAddress;

				if (collection && operatorAddress) {
					handleNFTApproval(collection, operatorAddress);
				} else {
					console.error(
						"Missing collection or operator address for approval:",
						{ collection, operatorAddress },
					);
					sendInteractionEvent({
						type: "FAIL",
						error: "Missing collection or operator address for NFT approval",
					});
				}
			}
		} catch (error) {
			console.error("💥 Error in automatic NFT approval effect:", error);
		}
	}, [
		interactionState,
		interactionState.context.mode,
		interactionState.context.collection,
		interactionState.context.protocolTreasuryAddress,
		interactionState.context.treasuryAddress,
		handleNFTApproval,
		sendInteractionEvent,
	]);

	// Handle automatic action execution when entering awaitingInteractionSignature
	useEffect(() => {
		try {
			if (interactionState.matches("awaitingInteractionSignature")) {
				console.log(
					"🚀 [useNFTInteraction] Entering awaitingInteractionSignature state",
				);

				// Use a timeout to avoid dependency issues
				const executionTimeoutId = setTimeout(() => {
					const mode = interactionState.context.mode;
					const collection = interactionState.context.collection;
					const tokenId = interactionState.context.tokenId;
					const treasuryAddress = interactionState.context.treasuryAddress;
					const protocolTreasuryAddress =
						interactionState.context.protocolTreasuryAddress;

					console.log("📤 [useNFTInteraction] Executing transaction", {
						mode,
						collection,
						tokenId,
					});

					if (mode === "deposit" && collection && tokenId && treasuryAddress) {
						try {
							depositNFT({
								address: treasuryAddress as `0x${string}`,
								args: [collection as `0x${string}`, BigInt(tokenId)],
							});
						} catch (error) {
							console.error(
								"❌ [useNFTInteraction] Deposit execution failed:",
								error,
							);
							resetDeposit();
						}
					} else if (
						mode === "buyback" &&
						collection &&
						tokenId &&
						protocolTreasuryAddress
					) {
						executeRedemption({
							address: protocolTreasuryAddress as `0x${string}`,
							args: [
								collection! as `0x${string}`,
								BigInt(tokenId),
								userAddress!,
							] as any,
						}).catch((error) => {
							console.error(
								"❌ [useNFTInteraction] Redemption execution failed:",
								error,
							);
							resetRedemption();

							// Notify state machine of the failure
							sendInteractionEvent({
								type: "FAIL",
								error:
									error instanceof Error
										? error.message
										: "Transaction execution failed",
							});
						});
					}
				}, 100);

				// Add a timeout to detect if user doesn't respond to wallet prompt
				// This helps handle cases where wallet popup is missed or ignored
				const walletTimeoutId = setTimeout(() => {
					console.log(
						"⏰ [useNFTInteraction] Wallet response timeout - checking state",
					);

					// If we're still in awaitingInteractionSignature after 2 minutes,
					// the user probably missed the wallet popup
					if (interactionState.matches("awaitingInteractionSignature")) {
						console.warn(
							"⚠️ [useNFTInteraction] Wallet response timeout - resetting state",
						);
						sendInteractionEvent({
							type: "FAIL",
							error:
								"Transaction timed out. Please try again. The wallet popup may have been missed or closed.",
						});
					}
				}, 120000); // 2 minutes

				// Add timeout cleanup
				return () => {
					clearTimeout(executionTimeoutId);
					clearTimeout(walletTimeoutId);
				};
			}
		} catch (error) {
			console.error("💥 Error in automatic action execution effect:", error);
		}
	}, [
		interactionState,
		interactionState.context.mode,
		interactionState.context.collection,
		interactionState.context.tokenId,
		interactionState.context.treasuryAddress,
		interactionState.context.protocolTreasuryAddress,
		depositNFT,
		resetDeposit,
		executeRedemption,
		resetRedemption,
		userAddress,
		sendInteractionEvent,
	]); // Include all necessary dependencies

	// Handle transaction receipt confirmation
	useEffect(() => {
		try {
			const receipt = depositReceipt || redemptionReceipt;
			if (receipt && interactionState.matches("awaitingInteractionReceipt")) {
				sendInteractionEvent({
					type: "INTERACTION_REQUESTED",
				});
			}
		} catch (error) {
			console.error(
				"💥 Error in transaction receipt confirmation effect:",
				error,
			);
		}
	}, [
		depositReceipt,
		redemptionReceipt,
		interactionState,
		sendInteractionEvent,
	]);

	// Get current state info for UI
	const currentState = interactionState.value as string;
	const context = interactionState.context;
	const hookError = context.error;
	const isLoading =
		!interactionState.matches("idle") && !interactionState.matches("completed");

	// Determine current action needed based on state
	const getActionInfo = useCallback(() => {
		try {
			const mode = context.mode;

			if (
				currentState === "checkingApprovals" ||
				currentState === "checkingNFTApproval"
			) {
				return { type: "checking", label: "Checking approvals..." };
			}

			if (currentState === "awaitingNFTApprovalSignature") {
				const operatorAddress =
					mode === "buyback"
						? context.protocolTreasuryAddress
						: context.treasuryAddress;
				if (!operatorAddress) {
					return { type: "idle", label: "Missing approval address" };
				}
				return {
					type: "approveNFT",
					label: "Approve NFT",
					action: () => handleNFTApproval(context.collection!, operatorAddress),
				};
			}

			if (currentState === "awaitingInteractionSignature") {
				if (mode === "deposit") {
					// All values should be non-null in this state due to state machine guards
					if (
						context.collection &&
						context.tokenId &&
						context.treasuryAddress
					) {
						return {
							type: "deposit",
							label: "Deposit NFT",
							action: () =>
								handleDepositNFT(
									context.collection!,
									context.tokenId!,
									context.treasuryAddress!,
								),
						};
					}
					return { type: "idle", label: "Missing data", action: () => {} };
				} else {
					// All values should be non-null in this state due to state machine guards
					if (
						context.collection &&
						context.tokenId &&
						context.protocolTreasuryAddress
					) {
						return {
							type: "redeem",
							label: "Accept Buyback",
							action: () =>
								handleRedemption(
									context.collection!,
									context.tokenId!,
									context.protocolTreasuryAddress!,
								),
						};
					}
					return { type: "idle", label: "Missing data", action: () => {} };
				}
			}

			if (currentState === "completed") {
				return {
					type: "completed",
					label:
						mode === "deposit" ? "Deposited Successfully" : "Buyback Completed",
				};
			}

			if (
				currentState.includes("awaiting") ||
				currentState === "confirmingInteraction"
			) {
				return { type: "processing", label: "Processing..." };
			}

			return { type: "idle", label: "" };
		} catch (error) {
			console.error("💥 Error in getActionInfo:", error);
			return { type: "idle", label: "Error occurred" };
		}
	}, [
		currentState,
		context,
		handleNFTApproval,
		handleDepositNFT,
		handleRedemption,
	]);

	// Final error boundary wrapper for return
	try {
		return {
			// State
			currentState,
			context,
			error: hookError,
			isLoading,

			// Actions
			startInteraction,
			reset,
			forceReset,
			getActionInfo,

			// State machine (for advanced usage)
			interactionState,
			sendInteractionEvent,
		};
	} catch (error) {
		console.error("💥 Error in useNFTInteraction hook return:", error);

		// Return a safe fallback
		return {
			currentState: "idle",
			context: {},
			error: error instanceof Error ? error.message : "Unknown error",
			isLoading: false,
			startInteraction: async () => {},
			reset: () => {},
			forceReset: () => {},
			getActionInfo: () => ({ type: "idle", label: "" }),
			interactionState: {
				value: "idle",
				matches: (_state: string) => false,
				context: {},
			},
			sendInteractionEvent: () => {},
		};
	}
};
