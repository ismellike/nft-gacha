"use client";

import { useCallback, useEffect, useRef } from "react";
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

	// Refs to persist success values across machine resets
	const depositSuccessRef = useRef(false);
	const depositTxHashRef = useRef<string | undefined>(undefined);

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

	// Helper to create a key for collection + tokenId
	const createNFTKey = useCallback((collection: string, tokenId: string) => {
		return `${collection.toLowerCase()}-${tokenId}`;
	}, []);

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

	// Capture success values in refs when they become available and log state
	useEffect(() => {
		// Update refs when success is detected
		if (isDepositSuccess && depositTxHash && !depositSuccessRef.current) {
			depositSuccessRef.current = true;
			depositTxHashRef.current = depositTxHash;
			console.log("💾 [useNFTInteraction] Captured success in refs:", {
				success: isDepositSuccess,
				txHash: depositTxHash,
			});
		}

		console.log("🔍 [useNFTInteraction] Wagmi deposit hook state:", {
			isDepositSuccess,
			isDepositError,
			hasDepositTxHash: !!depositTxHash,
			depositTxHash,
			depositError,
			cachedSuccess: depositSuccessRef.current,
			cachedTxHash: depositTxHashRef.current,
		});
	}, [isDepositSuccess, isDepositError, depositTxHash, depositError]);

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

				// If we're in completed state from a deposit, reset immediately since deposits should be reusable
				if (
					interactionState.matches("completed") &&
					interactionState.context.mode === "deposit"
				) {
					console.log(
						"🔄 Auto-resetting completed deposit state for new interaction",
					);
					sendInteractionEvent({ type: "RESET" });
					// Small delay to ensure reset is processed before continuing
					await new Promise((resolve) => setTimeout(resolve, 100));
				}

				// Check if the current interaction is for a different NFT
				const currentNFTKey = createNFTKey(
					interactionState.context.collection || "",
					interactionState.context.tokenId || "",
				);
				const newNFTKey = createNFTKey(collection, tokenId);
				const isDifferentNFT = currentNFTKey !== newNFTKey;

				console.log("🔍 NFT comparison:", {
					currentNFTKey,
					newNFTKey,
					currentState: interactionState.value,
					isDifferentNFT,
					currentCollection: interactionState.context.collection,
					currentTokenId: interactionState.context.tokenId,
					requestedCollection: collection,
					requestedTokenId: tokenId,
				});

				// Reset logic based on state and NFT differences
				if (!interactionState.matches("idle")) {
					// Allow proceeding if it's the same NFT in processing state
					if (!isDifferentNFT && !interactionState.matches("completed")) {
						console.log("✅ Continuing existing interaction for the same NFT");
						// Don't reset, just continue with the current interaction
					} else {
						// Different NFT or completed state, need to reset
						const resetReason = isDifferentNFT
							? "Different NFT requested"
							: "Previous interaction completed";

						console.log(
							`🔄 Resetting machine: ${resetReason}. Current state:`,
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
				}

				// Final safety check before starting the interaction
				if (!interactionState.matches("idle")) {
					console.error(
						"❌ Cannot start NFT interaction - machine is not in idle state:",
						interactionState.value,
					);
					console.error("❌ Machine context:", interactionState.context);

					// For completed states, always try to reset one more time
					if (interactionState.matches("completed")) {
						console.log(
							"🔄 Completed state detected, attempting final reset...",
						);
						forceReset();

						// Wait a bit longer for the final reset to take effect
						await new Promise((resolve) => setTimeout(resolve, 200));

						// Check one last time after the final reset
						if (!interactionState.matches("idle")) {
							console.error(
								"💀 Machine still not idle after final reset. Giving up.",
							);
							throw new Error(
								"Cannot start deposit - previous transaction is still processing. Please refresh the page and try again.",
							);
						} else {
							console.log(
								"✅ Final reset successful, proceeding with interaction",
							);
						}
					} else if (isDifferentNFT) {
						// For different NFTs in non-completed states, we should wait
						throw new Error(
							"Cannot start deposit - previous transaction is still processing. Please wait a moment and try again.",
						);
					} else {
						console.log(
							"⚠️ Same NFT is still processing, will continue with existing interaction",
						);
						// Don't throw error for same NFT in progress
						return; // Exit early since the same NFT is already being processed
					}
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
			createNFTKey,
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
					args: [collection as `0x${string}`, BigInt(tokenId), userAddress] as [
						`0x${string}`,
						bigint,
						`0x${string}`,
					],
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

			// Use cached values from refs to survive machine resets
			const cachedSuccess = depositSuccessRef.current || isDepositSuccess;
			const cachedTxHash = depositTxHashRef.current || depositTxHash;

			// Log success when detected
			if (cachedSuccess && cachedTxHash) {
				console.log("📋 [useNFTInteraction] SUCCESS DETECTED!", {
					cachedTxHash,
					currentState: interactionState.value,
					source: depositSuccessRef.current ? "cached" : "live",
				});
			}

			// Handle success in all deposit-related states including idle (in case machine resets)
			const isInDepositState =
				interactionState.matches("idle") ||
				interactionState.matches("awaitingInteractionSignature") ||
				interactionState.matches("awaitingInteractionReceipt") ||
				interactionState.matches("confirmingInteraction") ||
				interactionState.matches("completed");

			const isInIdleState = interactionState.matches("idle");
			const hasContext = currentCollection && currentTokenId;

			// Different logic for idle state vs other states, using cached values to survive machine resets
			const shouldProcessSuccess = isInIdleState
				? // In idle state, process any deposit success since context is cleared (use cached values)
					cachedSuccess &&
					cachedTxHash &&
					currentMode === "deposit" &&
					(!contextInteractionTxHash ||
						contextInteractionTxHash !== cachedTxHash)
				: // In other states, require full context validation (use live values)
					isDepositSuccess &&
					depositTxHash &&
					isInDepositState &&
					currentMode === "deposit" &&
					hasContext &&
					(!contextInteractionTxHash ||
						contextInteractionTxHash !== depositTxHash);

			if (shouldProcessSuccess) {
				console.log(
					"✅ [useNFTInteraction] Sending INTERACTION_CONFIRMED event",
				);
				sendInteractionEvent({
					type: "INTERACTION_CONFIRMED",
					txHash: cachedTxHash, // Use cached tx hash to survive resets
				});

				// Clear the refs after successful processing to prevent duplicate events
				depositSuccessRef.current = false;
				depositTxHashRef.current = undefined;
				console.log(
					"🧹 [useNFTInteraction] Cleared success refs after processing",
				);
			} else if (cachedSuccess && cachedTxHash) {
				// Only log as failure if it's a genuine issue, not if already processed
				console.log("ℹ️ [useNFTInteraction] Deposit success already processed", {
					currentState: interactionState.value,
					contextInteractionTxHash,
					reason: "Transaction hash already processed",
					cachedTxHash,
				});
			} else {
				console.log(
					"⚠️ [useNFTInteraction] Deposit success not processed due to failed conditions",
					{
						isDepositSuccess,
						hasTxHash: !!depositTxHash,
						currentState: interactionState.value,
						currentMode,
						hasCollection: !!currentCollection,
						hasTokenId: !!currentTokenId,
						contextInteractionTxHash,
						txHashMismatch: contextInteractionTxHash !== depositTxHash,
						isInIdleState,
					},
				);
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
							console.log(
								"🚀 [useNFTInteraction] Executing deposit transaction:",
								{
									address: treasuryAddress as `0x${string}`,
									args: [collection as `0x${string}`, BigInt(tokenId)],
								},
							);

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

							// Check if it's a user rejection
							const errorCode = (error as Error & { code?: number | string })
								?.code;
							const isUserRejected =
								error instanceof Error &&
								(error.message.toLowerCase().includes("user rejected") ||
									error.message.toLowerCase().includes("user denied") ||
									error.message.toLowerCase().includes("cancelled") ||
									error.message.toLowerCase().includes("rejected") ||
									error.message.toLowerCase().includes("denied") ||
									error.name === "UserRejectedRequestError" ||
									errorCode === 4001 || // MetaMask user rejected error
									(typeof errorCode === "string" &&
										errorCode.includes("ACTION_REJECTED")));

							if (isUserRejected) {
								sendInteractionEvent({
									type: "INTERACTION_CANCELLED",
									reason: "Deposit cancelled by user.",
								});
							} else {
								sendInteractionEvent({
									type: "FAIL",
									error:
										error instanceof Error
											? `Deposit transaction failed: ${error.message}`
											: "Deposit transaction failed. Please check your wallet and try again.",
								});
							}
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
								collection as `0x${string}`,
								BigInt(tokenId),
								userAddress,
							] as [`0x${string}`, bigint, `0x${string}`],
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
			console.log("🔍 [useNFTInteraction] Receipt confirmation check:", {
				hasDepositReceipt: !!depositReceipt,
				hasRedemptionReceipt: !!redemptionReceipt,
				receipt,
				currentState: interactionState.value,
				isAwaitingInteractionReceipt: interactionState.matches(
					"awaitingInteractionReceipt",
				),
			});

			// Handle receipt confirmation in multiple states including idle
			const isInAwaitingOrCompletedState =
				interactionState.matches("idle") ||
				interactionState.matches("awaitingInteractionReceipt") ||
				interactionState.matches("confirmingInteraction") ||
				interactionState.matches("completed");

			if (receipt && isInAwaitingOrCompletedState) {
				console.log(
					"✅ [useNFTInteraction] Sending INTERACTION_REQUESTED event",
				);
				sendInteractionEvent({
					type: "INTERACTION_REQUESTED",
				});
			} else {
				console.log("⚠️ [useNFTInteraction] Receipt not processed", {
					hasReceipt: !!receipt,
					currentState: interactionState.value,
					isIdle: interactionState.matches("idle"),
					isAwaitingInteractionReceipt: interactionState.matches(
						"awaitingInteractionReceipt",
					),
					isConfirmingInteraction: interactionState.matches(
						"confirmingInteraction",
					),
					isCompleted: interactionState.matches("completed"),
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
					action: () =>
						context.collection
							? handleNFTApproval(context.collection, operatorAddress)
							: null,
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
								context.collection && context.tokenId && context.treasuryAddress
									? handleDepositNFT(
											context.collection,
											context.tokenId,
											context.treasuryAddress,
										)
									: null,
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
								context.collection &&
								context.tokenId &&
								context.protocolTreasuryAddress
									? handleRedemption(
											context.collection,
											context.tokenId,
											context.protocolTreasuryAddress,
										)
									: null,
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

	// Handle success callback triggering for both deposits and buybacks
	useEffect(() => {
		if (interactionState.matches("completed") && params.onSuccess) {
			const context = interactionState.context;

			// Only trigger success if we have a transaction hash
			if (context.interactionTxHash) {
				console.log("✅ [useNFTInteraction] Triggering success callback", {
					mode: context.mode,
					txHash: context.interactionTxHash,
				});

				// For deposits, trigger success immediately
				// For buybacks, ensure we have payout data
				if (
					context.mode === "deposit" ||
					(context.mode === "buyback" && context.payoutAmount)
				) {
					params.onSuccess?.(context.interactionTxHash);
				}
			}
		}
	}, [interactionState, params.onSuccess]);

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
