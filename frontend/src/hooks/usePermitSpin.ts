"use client";

import { useEffect, useRef, useState } from "react";
import { decodeEventLog } from "viem";
import {
	useSignTypedData,
	useWaitForTransactionReceipt,
	useWriteContract,
} from "wagmi";
import { useWriteGachaReclaimFailedSpin } from "../generated";
import type { UseGachaSpinMachineReturn } from "./useGachaSpinMachine";
import { logger } from "../lib/logger";
import { isUserRejectedError } from "../lib/transactionErrors";

const PERMIT_DEADLINE_SECONDS = 3600; // 1 hour

const SPIN_ABI = [
	{
		type: "function",
		name: "spin",
		stateMutability: "nonpayable",
		inputs: [{ name: "maxFee", type: "uint256" }],
		outputs: [{ name: "triggerId", type: "uint256" }],
	},
] as const;

const SPIN_WITH_PERMIT_ABI = [
	{
		type: "function",
		name: "spinWithPermit",
		stateMutability: "nonpayable",
		inputs: [
			{ name: "deadline", type: "uint256" },
			{ name: "v", type: "uint8" },
			{ name: "r", type: "bytes32" },
			{ name: "s", type: "bytes32" },
			{ name: "maxFee", type: "uint256" },
		],
		outputs: [{ name: "triggerId", type: "uint256" }],
	},
] as const;

const RANDOMNESS_REQUESTED_ABI = [
	{
		type: "event",
		name: "RandomnessRequested",
		inputs: [
			{
				name: "triggerId",
				type: "uint256",
				indexed: false,
			},
		],
	},
] as const;

interface UsePermitSpinParams {
	gachaSpin: UseGachaSpinMachineReturn;
	gachaAddress: `0x${string}` | undefined;
	feeToken: `0x${string}` | undefined;
	spinFee: bigint | undefined;
	maxFee: bigint | undefined;
	tokenNonce: bigint | undefined;
	tokenName: string | undefined;
	chainId: number;
	userAddress: `0x${string}` | undefined;
	hasPermitSupport: boolean;
	isSpinDataReady: boolean;
	refetchBalance: () => void;
	refetchNonce: () => void;
	refetchFee: () => void;
	onRefund: (() => void) | undefined;
	onSpinSound: () => void;
}

interface UsePermitSpinReturn {
	isSignaturePending: boolean;
	isProcessingTransaction: boolean;
	userCancelledMessage: boolean;
	permitFailed: boolean;
	feeMismatchError: boolean;
	onSpinClick: () => Promise<void>;
	handleReclaim: () => Promise<void>;
	isReclaimPending: boolean;
}

/**
 * Manages the full permit-signing and transaction-submission flow for spinning.
 *
 * Handles:
 * - ERC-2612 permit signing and spinWithPermit() call
 * - Fallback to direct spin() if permit is unsupported
 * - Signature and transaction error recovery
 * - Reclaim of failed/timed-out spins
 * - Post-spin balance / nonce refresh
 */
export function usePermitSpin({
	gachaSpin,
	gachaAddress,
	feeToken,
	spinFee,
	maxFee,
	tokenNonce,
	tokenName,
	chainId,
	userAddress,
	hasPermitSupport,
	isSpinDataReady,
	refetchBalance,
	refetchNonce,
	refetchFee,
	onRefund,
	onSpinSound,
}: UsePermitSpinParams): UsePermitSpinReturn {
	const [permitDeadline, setPermitDeadline] = useState<bigint | null>(null);
	const [usedSignature, setUsedSignature] = useState<string | null>(null);
	const [processedTxHash, setProcessedTxHash] = useState<string | null>(null);
	const [userCancelledMessage, setUserCancelledMessage] = useState(false);
	const [permitFailed, setPermitFailed] = useState(false);
	const [feeMismatchError, setFeeMismatchError] = useState(false);

	// Chain ID captured at permit sign time — used to detect chain switches
	// before submitting the signed transaction.
	const signedChainIdRef = useRef<number | null>(null);

	// Track processed errors to prevent duplicate handling
	const processedPermitErrorRef = useRef<string | null>(null);
	const processedSpinErrorRef = useRef<string | null>(null);
	const processedReceiptErrorRef = useRef<string | null>(null);

	// Direct spin (fallback when permit is unsupported)
	const {
		writeContract: spin,
		data: spinTxHash,
		isPending: isSpinPending,
	} = useWriteContract();

	// Permit-based spin
	const {
		writeContract: spinWithPermit,
		data: spinWithPermitTxHash,
		isPending: isSpinWithPermitPending,
		error: spinWithPermitError,
	} = useWriteContract();

	const {
		signTypedData,
		data: signature,
		isPending: isSignaturePending,
		error: signatureError,
	} = useSignTypedData();

	// Reclaim for failed/timed-out spins
	const {
		writeContract: reclaimFailedSpin,
		data: reclaimTxHash,
		isPending: isReclaimPending,
		error: reclaimError,
	} = useWriteGachaReclaimFailedSpin();

	// Transaction confirmations
	const {
		isLoading: isSpinWithPermitConfirming,
		isSuccess: isSpinWithPermitSuccess,
		error: spinWithPermitReceiptError,
		data: spinReceiptData,
	} = useWaitForTransactionReceipt({ hash: spinWithPermitTxHash });

	const { isSuccess: isReclaimReceiptSuccess } = useWaitForTransactionReceipt({
		hash: reclaimTxHash,
	});

	const spinWait = useWaitForTransactionReceipt({ hash: spinTxHash });
	const isSpinConfirming = spinWait.isLoading;
	const isSpinSuccess = spinWait.isSuccess;
	const spinReceipt = spinWait.data;

	const isProcessingTransaction =
		isSpinWithPermitPending ||
		isSpinWithPermitConfirming ||
		isSpinPending ||
		isSpinConfirming;

	// Handle refund detection to refresh balances
	useEffect(() => {
		if (gachaSpin.isRefunded && gachaSpin.refundResult) {
			logger.gachaSpin.log("Refund detected, refreshing balances");
			refetchBalance();
			refetchNonce();
			onRefund?.();
		}
	}, [
		gachaSpin.isRefunded,
		gachaSpin.refundResult,
		refetchBalance,
		refetchNonce,
		onRefund,
	]);

	// Handle permit signature completion – submit the spinWithPermit transaction
	useEffect(() => {
		if (
			signature &&
			spinFee &&
			maxFee &&
			feeToken &&
			permitDeadline &&
			signature !== usedSignature
		) {
			try {
				// Verify the chain hasn't changed since the permit was signed
				if (signedChainIdRef.current !== null && chainId !== signedChainIdRef.current) {
					logger.gachaSpin.warn(
						"Chain changed since permit was signed, aborting transaction",
						{ signedChainId: signedChainIdRef.current, currentChainId: chainId },
					);
					signedChainIdRef.current = null;
					gachaSpin.setError("Network changed since permit was signed. Please try again.");
					return;
				}

				logger.gachaSpin.log(
					"Permit signature received, submitting transaction",
				);

				logger.gachaSpin.debug("Parsing signature:", {
					signatureLength: signature.length,
					signature: `${signature.slice(0, 20)}...`,
				});

				if (signature.length !== 132) {
					throw new Error(
						`Invalid signature length: expected 132 chars, got ${signature.length}`,
					);
				}

				const sig = signature.slice(2); // remove 0x
				const r = `0x${sig.slice(0, 64)}` as `0x${string}`;
				const s = `0x${sig.slice(64, 128)}` as `0x${string}`;
				let v = parseInt(sig.slice(128, 130), 16);

				logger.gachaSpin.debug("Parsed signature components:", {
					r: `${r.slice(0, 20)}...`,
					s: `${s.slice(0, 20)}...`,
					vOriginal: sig.slice(128, 130),
					vDecimal: v,
				});

				// Ensure v is 27 or 28 for Ethereum
				if (v < 27) {
					v += 27;
					logger.gachaSpin.debug("Adjusted v value to:", v);
				}

				const txParams = {
					address: gachaAddress as `0x${string}`,
					abi: SPIN_WITH_PERMIT_ABI,
					args: [
						BigInt(permitDeadline || 0),
						Number(v),
						r,
						s,
						maxFee as bigint,
					] as const,
					functionName: "spinWithPermit" as const,
				};

				logger.gachaSpin.log("Submitting spinWithPermit transaction:", {
					contract: txParams.address,
					deadline: permitDeadline?.toString(),
					v,
					r,
					s,
					maxFee: maxFee?.toString(),
					signature: `${signature.slice(0, 10)}...`,
					rawSignature: signature,
					expectedFunction:
						"spinWithPermit(uint256,uint8,bytes32,bytes32,uint256)",
				});

				setUsedSignature(signature);
				spinWithPermit(txParams);
			} catch (error) {
				logger.gachaSpin.error("Error calling spinWithPermit:", error);
				gachaSpin.reset();
			}
		}
	}, [
		signature,
		spinFee,
		maxFee,
		feeToken,
		permitDeadline,
		usedSignature,
		spinWithPermit,
		gachaSpin.reset,
		gachaSpin.setError,
		gachaAddress,
		chainId,
	]);

	// Handle signature errors (user canceled or signing failed)
	useEffect(() => {
		if (signatureError) {
			const errorId = `${signatureError.name}-${signatureError.message}`;
			if (processedPermitErrorRef.current === errorId) return;
			processedPermitErrorRef.current = errorId;

			if (isUserRejectedError(signatureError)) {
				logger.gachaSpin.log("User cancelled signature request");
				gachaSpin.reset();
				setUserCancelledMessage(true);
				setTimeout(() => setUserCancelledMessage(false), 2000);
			} else {
				logger.gachaSpin.error("Signature error occurred:", {
					error: signatureError,
					message: signatureError.message,
					name: signatureError.name,
					stack: signatureError.stack,
					details: {
						userAddress,
						feeToken,
						spinFee: spinFee?.toString(),
						maxFee: maxFee?.toString(),
						tokenNonce: tokenNonce?.toString(),
						contracts: gachaAddress,
						chainId,
						tokenName,
					},
				});
				gachaSpin.setError(signatureError.message || "Signature failed");
			}
		}
	}, [
		signatureError,
		gachaSpin.reset,
		gachaSpin.setError,
		userAddress,
		feeToken,
		spinFee,
		maxFee,
		tokenNonce,
		gachaAddress,
		chainId,
		tokenName,
	]);

	// Handle transaction submission errors (spinWithPermit path)
	useEffect(() => {
		if (spinWithPermitError) {
			const errorId = `${spinWithPermitError.name}-${spinWithPermitError.message}`;
			if (processedReceiptErrorRef.current === errorId) return;
			processedReceiptErrorRef.current = errorId;

			logger.gachaSpin.debug("Analyzing transaction error:", {
				errorMessage: spinWithPermitError.message,
				errorName: spinWithPermitError.name,
				errorCode: (spinWithPermitError as { code?: string }).code,
				isUserRejection: isUserRejectedError(spinWithPermitError),
			});

			if (isUserRejectedError(spinWithPermitError)) {
				logger.gachaSpin.log("User cancelled transaction");
				gachaSpin.reset();
				setUserCancelledMessage(true);
				setTimeout(() => setUserCancelledMessage(false), 2000);
			} else {
				const errorMessage = String(
					spinWithPermitError.message || "",
				).toLowerCase();

				logger.gachaSpin.error("Transaction submission error:", {
					error: spinWithPermitError,
					message: spinWithPermitError.message,
					name: spinWithPermitError.name,
					cause: spinWithPermitError.cause,
					code: (spinWithPermitError as { code?: unknown }).code,
					data: (spinWithPermitError as { data?: unknown }).data,
					details: {
						contract: gachaAddress,
						userAddress,
						feeToken,
						spinFee: spinFee?.toString(),
						maxFee: maxFee?.toString(),
						permitDeadline: permitDeadline?.toString(),
						signatureUsed: !!usedSignature,
						tokenName,
						tokenVersion: "1",
						chainId,
					},
				});

				if (
					errorMessage.includes("fee") ||
					errorMessage.includes("maxFee") ||
					errorMessage.includes("insufficient funds") ||
					(errorMessage.includes("revert") && spinFee)
				) {
					logger.gachaSpin.warn(
						"Possible fee mismatch - refetching current fee",
					);
					setFeeMismatchError(true);
					refetchFee();
					setTimeout(() => setFeeMismatchError(false), 5000);
				}

				if (
					errorMessage.includes("invalid signature") ||
					errorMessage.includes("permit") ||
					errorMessage.includes("signature") ||
					errorMessage.includes("execution reverted") ||
					errorMessage.includes("revert")
				) {
					logger.gachaSpin.warn("Permit signature rejected by contract");
					setPermitFailed(true);
					logger.gachaSpin.warn(
						"Trying direct spin as fallback. Make sure you've approved the gacha contract to spend your tokens.",
					);
					// Reset spin state so button is re-enabled for direct approval fallback
					gachaSpin.reset();
					return;
				}

				gachaSpin.setError(spinWithPermitError.message || "Transaction failed");
			}
		}
	}, [
		spinWithPermitError,
		gachaSpin.reset,
		gachaSpin.setError,
		gachaAddress,
		userAddress,
		feeToken,
		spinFee,
		maxFee,
		permitDeadline,
		usedSignature,
		tokenName,
		chainId,
		refetchFee,
	]);

	// Handle transaction receipt errors
	useEffect(() => {
		if (spinWithPermitReceiptError) {
			logger.gachaSpin.error(
				"Transaction receipt error:",
				spinWithPermitReceiptError,
			);
			gachaSpin.setError(
				spinWithPermitReceiptError.message || "Transaction receipt error",
			);
		}
	}, [spinWithPermitReceiptError, gachaSpin.setError]);

	// Handle direct spin transaction errors (fallback path)
	useEffect(() => {
		const spinError = spinWait.error;
		if (spinError) {
			const errorId = `${spinError.name}-${spinError.message}`;
			if (processedSpinErrorRef.current === errorId) return;
			processedSpinErrorRef.current = errorId;

			const errorMessage = String(spinError.message || "").toLowerCase();
			if (isUserRejectedError(spinError)) {
				gachaSpin.reset();
				setUserCancelledMessage(true);
				setTimeout(() => setUserCancelledMessage(false), 2000);
			} else {
				logger.gachaSpin.error("Direct spin transaction error:", spinError);

				if (
					errorMessage.includes("fee") ||
					errorMessage.includes("maxFee") ||
					errorMessage.includes("insufficient funds") ||
					(errorMessage.includes("revert") && spinFee)
				) {
					logger.gachaSpin.warn(
						"Possible fee mismatch - refetching current fee",
					);
					setFeeMismatchError(true);
					refetchFee();
					setTimeout(() => setFeeMismatchError(false), 5000);
				}

				gachaSpin.setError(spinError.message || "Transaction failed");
			}
		}
	}, [
		spinWait.error,
		gachaSpin.reset,
		gachaSpin.setError,
		refetchFee,
		spinFee,
	]);

	// Handle successful transaction receipt – extract triggerId from logs
	useEffect(() => {
		if (
			(isSpinWithPermitSuccess &&
				spinWithPermitTxHash &&
				processedTxHash !== spinWithPermitTxHash) ||
			(isSpinSuccess && spinTxHash && processedTxHash !== spinTxHash)
		) {
			// Guard against race: skip if state machine already moved on
			if (gachaSpin.isRevealing || gachaSpin.isIdle) {
				logger.gachaSpin.log(
					"Skipping receipt processing - state already moved to",
					gachaSpin.state,
				);
				const txHash = isSpinWithPermitSuccess
					? (spinWithPermitTxHash as string)
					: (spinTxHash as string);
				setProcessedTxHash(txHash);
				return;
			}

			logger.gachaSpin.log(
				"Processing spin transaction receipt:",
				spinWithPermitTxHash,
			);

			let triggerId: bigint | null = null;
			const receipt = isSpinWithPermitSuccess ? spinReceiptData : spinReceipt;

			if (!receipt) {
				logger.gachaSpin.warn("No receipt available yet");
				return;
			}

			logger.gachaSpin.debug(
				`Searching through ${receipt.logs.length} logs for RandomnessRequested event`,
			);

			for (let i = 0; i < receipt.logs.length; i++) {
				const log = receipt.logs[i];
				try {
					const decoded = decodeEventLog({
						abi: RANDOMNESS_REQUESTED_ABI,
						data: log.data,
						topics: log.topics,
					});

					if (decoded.eventName === "RandomnessRequested") {
						triggerId = decoded.args.triggerId as bigint;
						logger.gachaSpin.log(
							`Found RandomnessRequested event at log index ${i}:`,
							triggerId.toString(),
						);
						break;
					}
				} catch (error) {
					logger.gachaSpin.debug(`Log ${i} not a RandomnessRequested event:`, {
						error: (error as Error).message,
						topics: log.topics.length,
						hasData: log.data !== "0x",
					});
				}
			}

			const txHash = isSpinWithPermitSuccess
				? (spinWithPermitTxHash as string)
				: (spinTxHash as string);
			setProcessedTxHash(txHash);

			if (triggerId !== null) {
				logger.gachaSpin.log(
					"Confirming transaction with trigger ID:",
					triggerId.toString(),
				);
				gachaSpin.confirmTransaction(triggerId);
			} else {
				logger.gachaSpin.error(
					"RandomnessRequested event not found in receipt! This may indicate a contract issue.",
					{
						logCount: receipt.logs.length,
						txHash: isSpinWithPermitSuccess ? spinWithPermitTxHash : spinTxHash,
					},
				);
				gachaSpin.setError(
					"Spin transaction succeeded but no randomness request was found. Please try again.",
				);
			}

			refetchBalance();
			refetchNonce();
			setPermitDeadline(null);
		}
	}, [
		isSpinWithPermitSuccess,
		spinReceiptData,
		spinWithPermitTxHash,
		processedTxHash,
		refetchBalance,
		refetchNonce,
		gachaSpin.confirmTransaction,
		gachaSpin.setError,
		gachaSpin.state,
		gachaSpin.isRevealing,
		gachaSpin.isIdle,
		isSpinSuccess,
		spinTxHash,
		spinReceipt,
	]);

	// Handle reclaim success
	useEffect(() => {
		if (isReclaimReceiptSuccess) {
			logger.gachaSpin.log(
				"Reclaim transaction confirmed, resetting state machine",
			);
			gachaSpin.reset();
			refetchBalance();
			refetchNonce();
		}
	}, [isReclaimReceiptSuccess, gachaSpin.reset, refetchBalance, refetchNonce]);

	// Handle reclaim rejection
	useEffect(() => {
		if (reclaimError) {
			logger.gachaSpin.debug("Analyzing reclaim error:", {
				errorMessage: reclaimError.message,
				errorName: reclaimError.name,
				errorCode: (reclaimError as { code?: number }).code,
				cause: (reclaimError as { cause?: string }).cause,
			});

			if (isUserRejectedError(reclaimError)) {
				logger.gachaSpin.log("User cancelled reclaim transaction");
				setUserCancelledMessage(true);
				setTimeout(() => {
					setUserCancelledMessage(false);
				}, 2000);
			} else {
				logger.gachaSpin.error("Reclaim transaction error:", {
					error: reclaimError,
					message: reclaimError.message,
					name: reclaimError.name,
					cause: reclaimError.cause,
					code: (reclaimError as { code?: unknown }).code,
					data: (reclaimError as { data?: unknown }).data,
					details: {
						triggerId: gachaSpin.triggerId,
						contract: gachaAddress,
						userAddress,
						chainId,
					},
				});
			}
		}
	}, [reclaimError, gachaSpin.triggerId, gachaAddress, userAddress, chainId]);

	// Reclaim handler
	const handleReclaim = async () => {
		if (!gachaSpin.triggerId || !gachaAddress) {
			logger.gachaSpin.error(
				"Missing trigger ID or gacha contract for reclaim",
			);
			return;
		}

		try {
			logger.gachaSpin.log("Reclaiming failed spin:", gachaSpin.triggerId);
			reclaimFailedSpin({
				address: gachaAddress,
				args: [gachaSpin.triggerId],
			});
		} catch (error) {
			logger.gachaSpin.error("Error reclaiming failed spin:", error);
		}
	};

	// Spin button click handler
	const onSpinClick = async () => {
		onSpinSound();

		// Handle retry for error state
		if (gachaSpin.isError) {
			if (gachaSpin.canRetry) {
				gachaSpin.retry();
			} else {
				gachaSpin.reset();
			}
			return;
		}

		// If permit failed before, try direct spin
		if (permitFailed) {
			logger.gachaSpin.log(
				"Permit failed previously, trying direct spin (requires pre-approval)",
			);
			try {
				if (!gachaAddress || !maxFee) {
					logger.gachaSpin.error("Missing max fee or contract for direct spin");
					return;
				}
				gachaSpin.startSpin();
				spin({
					address: gachaAddress,
					abi: SPIN_ABI,
					functionName: "spin",
					args: [maxFee as bigint],
				});
			} catch (error) {
				logger.gachaSpin.error("Direct spin error:", error);
				gachaSpin.reset();
			}
			return;
		}

		// Validate spin conditions
		if (!isSpinDataReady) {
			logger.gachaSpin.log("Spin conditions not met");
			return;
		}

		try {
			gachaSpin.startSpin();

			if (!hasPermitSupport) {
				// Fallback: call spin() directly (requires pre-approval)
				spin({
					address: gachaAddress as `0x${string}`,
					abi: SPIN_ABI,
					functionName: "spin",
					args: [maxFee as bigint],
				});
				return;
			}

			// Validate all required parameters before signing
			if (
				!userAddress ||
				!feeToken ||
				!spinFee ||
				!maxFee ||
				tokenNonce === undefined ||
				!gachaAddress
			) {
				logger.gachaSpin.error(
					"Missing required parameters for permit signing:",
					{
						userAddress: !!userAddress,
						feeToken: !!feeToken,
						spinFee: !!spinFee,
						maxFee: !!maxFee,
						tokenNonce: tokenNonce !== undefined,
						gachaContract: !!gachaAddress,
					},
				);
				gachaSpin.reset();
				return;
			}

			// Create permit signature
			const deadline = BigInt(
				Math.floor(Date.now() / 1000) + PERMIT_DEADLINE_SECONDS,
			);
			setPermitDeadline(deadline);
			signedChainIdRef.current = chainId;

			const domain = {
				name: tokenName || "Token",
				version: "1",
				chainId: chainId,
				verifyingContract: feeToken,
			};

			const message = {
				owner: userAddress,
				spender: gachaAddress,
				value: maxFee,
				nonce: tokenNonce as bigint,
				deadline,
			};

			logger.gachaSpin.log("Requesting permit signature with params:", {
				domain,
				message: {
					...message,
					value: message.value.toString(),
					nonce: message.nonce.toString(),
					deadline: message.deadline.toString(),
				},
				maxFee: maxFee?.toString(),
			});

			signTypedData({
				domain,
				types: {
					Permit: [
						{ name: "owner", type: "address" },
						{ name: "spender", type: "address" },
						{ name: "value", type: "uint256" },
						{ name: "nonce", type: "uint256" },
						{ name: "deadline", type: "uint256" },
					],
				},
				primaryType: "Permit",
				message,
			});
		} catch (error) {
			logger.gachaSpin.error("Error in spin click handler:", error);
			gachaSpin.reset();
		}
	};

	return {
		isSignaturePending,
		isProcessingTransaction,
		userCancelledMessage,
		permitFailed,
		feeMismatchError,
		onSpinClick,
		handleReclaim,
		isReclaimPending,
	};
}
