"use client";

import { memo, useEffect, useRef, useState } from "react";
import { decodeEventLog } from "viem";
import {
	useAccount,
	useChainId,
	useReadContract,
	useSignTypedData,
	useWaitForTransactionReceipt,
	useWriteContract,
} from "wagmi";
import { useGachaRefresh } from "../../contexts/GachaRefreshContext";
import { useSoundEffects } from "../../hooks/useSoundEffects";
import {
	gachaTreasuryAbi,
	useReadErc20BalanceOf,
	useReadErc20Decimals,
	useReadErc20Name,
	useReadErc20Symbol,
	useReadGachaFeeToken,
	useReadGachaPaused,
	useReadIerc20PermitNonces,
	useWriteGachaReclaimFailedSpin,
} from "../../generated";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import type { UseGachaSpinMachineReturn } from "../../hooks/useGachaSpinMachine";
import { logger } from "../../lib/logger";
import {
	isUserRejectedError,
	mapTransactionError,
} from "../../lib/transactionErrors";
import { formatTokenAmount } from "../../lib/utils";
import { Card } from "../../ui";
import { SpinErrorModal } from "./SpinErrorModal";
import { SpinRefundModal } from "./SpinRefundModal";
import { SpinTimeoutModal } from "./SpinTimeoutModal";
import { SpinVisual } from "./SpinVisual";
import {
	SpinButton,
	SpinErrorDisplay,
	SpinFeeDisplay,
} from "./spin-controls";

interface SpinControlsProps {
	gachaSpin: UseGachaSpinMachineReturn;
	onRefund?: () => void;
}

// Constants for spin configuration
const SPIN_TIMEOUT_SECONDS = 300;
const PERMIT_DEADLINE_SECONDS = 3600; // 1 hour
const MAX_FEE_SLIPPAGE_BPS = 200; // 2% max-fee buffer for UI

const SpinControls = memo(function SpinControls({
	gachaSpin,
	onRefund,
}: SpinControlsProps) {
	const { address: userAddress, isConnected } = useAccount();
	const chainId = useChainId();

	// Track if component is mounted to avoid hydration mismatch
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Sound effects
	const sound = useSoundEffects();

	// Local state for permit handling
	const [permitDeadline, setPermitDeadline] = useState<bigint | null>(null);
	const [usedSignature, setUsedSignature] = useState<string | null>(null);
	const [processedTxHash, setProcessedTxHash] = useState<string | null>(null);
	const [userCancelledMessage, setUserCancelledMessage] = useState(false);
	const [permitFailed, setPermitFailed] = useState(false);

	// Countdown timer for randomness timeout
	const [countdown, setCountdown] = useState(SPIN_TIMEOUT_SECONDS);
	const [timeoutStarted, setTimeoutStarted] = useState<number | null>(null);

	// Track last spin fee update for stale data detection
	const [lastFeeUpdate, setLastFeeUpdate] = useState<number>(Date.now());
	const [feeStale, setFeeStale] = useState(false);
	const [feeMismatchError, setFeeMismatchError] = useState(false);

	// User-friendly error state
	const [userFriendlyError, setUserFriendlyError] = useState<{
		title: string;
		message: string;
		action?: string;
		canRetry: boolean;
	} | null>(null);

	// Track processed errors to prevent duplicate handling
	const processedPermitErrorRef = useRef<string | null>(null);
	const processedSpinErrorRef = useRef<string | null>(null);
	const processedReceiptErrorRef = useRef<string | null>(null);

	// Get gacha ID and contract addresses
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const { registerRefetch } = useGachaRefresh();

	// Gacha contract data with polling for dynamic spin fee
	const spinFeeQuery = useReadContract({
		address: contracts.gacha as `0x${string}` | undefined,
		abi: [
			{
				type: "function",
				name: "getCurrentSpinFee",
				stateMutability: "view",
				inputs: [],
				outputs: [{ name: "fee", type: "uint256" }],
			},
		],
		functionName: "getCurrentSpinFee",
		query: {
			enabled: !!contracts.gacha,
			refetchInterval: 10000, // Poll every 10 seconds
		},
	});
	const spinFee = spinFeeQuery.data;

	// Update last fee update time on every successful fetch (not just data changes)
	useEffect(() => {
		if (spinFeeQuery.dataUpdatedAt > 0) {
			setLastFeeUpdate(spinFeeQuery.dataUpdatedAt);
			setFeeStale(false);
		}
	}, [spinFeeQuery.dataUpdatedAt]);

	// Mark fee as stale after 15 seconds without updates, but clear it if actively fetching
	// Use ref for feeStale to avoid tearing down the interval when it changes
	const feeStaleRef = useRef(feeStale);
	feeStaleRef.current = feeStale;

	useEffect(() => {
		const interval = setInterval(() => {
			if (Date.now() - lastFeeUpdate > 15000 && !spinFeeQuery.isFetching) {
				setFeeStale(true);
			} else if (spinFeeQuery.isFetching && feeStaleRef.current) {
				// Clear stale flag if we're actively fetching fresh data
				setFeeStale(false);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [lastFeeUpdate, spinFeeQuery.isFetching]);

	const { data: paused } = useReadGachaPaused({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	});

	const { data: feeToken } = useReadGachaFeeToken({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	});

	const { data: isGachaAvailable } = useReadContract({
		address: contracts.treasury as `0x${string}` | undefined,
		abi: gachaTreasuryAbi,
		functionName: "isGachaAvailable",
		query: { enabled: !!contracts.treasury },
	});

	// ERC20 token data
	const { data: tokenDecimals } = useReadErc20Decimals({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const { data: tokenSymbol } = useReadErc20Symbol({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const { data: tokenName } = useReadErc20Name({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const { data: tokenBalance, refetch: refetchBalance } = useReadErc20BalanceOf(
		{
			address: feeToken,
			args: userAddress ? [userAddress] : undefined,
			query: { enabled: !!(feeToken && userAddress) },
		},
	);

	const {
		data: tokenNonce,
		refetch: refetchNonce,
		error: noncesError,
	} = useReadIerc20PermitNonces({
		address: feeToken,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!(feeToken && userAddress) },
	});

	// Fallback: direct spin path if token doesn't support permit
	const {
		writeContract: spin,
		data: spinTxHash,
		isPending: isSpinPending,
	} = useWriteContract();

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

	// Register spin fee refetch with the refresh context
	useEffect(() => {
		const refetchSpinFee = async () => {
			logger.gachaSpin.debug("Refetching spin fee");
			await spinFeeQuery.refetch();
		};

		const cleanup = registerRefetch(refetchSpinFee);
		return cleanup;
	}, [registerRefetch, spinFeeQuery.refetch]);

	// Write operations
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

	// Reclaim failed spin operation
	const {
		writeContract: reclaimFailedSpin,
		data: reclaimTxHash,
		isPending: isReclaimPending,
		isSuccess: _,
		error: reclaimError,
	} = useWriteGachaReclaimFailedSpin();

	// Transaction confirmations
	const {
		isLoading: isSpinWithPermitConfirming,
		isSuccess: isSpinWithPermitSuccess,
		error: spinWithPermitReceiptError,
		data: spinReceiptData,
	} = useWaitForTransactionReceipt({
		hash: spinWithPermitTxHash,
	});

	const { isSuccess: isReclaimReceiptSuccess } = useWaitForTransactionReceipt({
		hash: reclaimTxHash,
	});

	// Derived state from state machine
	const spinWait = useWaitForTransactionReceipt({ hash: spinTxHash });
	const isSpinConfirming = spinWait.isLoading;
	const isSpinSuccess = spinWait.isSuccess;
	const spinReceipt = spinWait.data;

	const isProcessingTransaction =
		isSpinWithPermitPending ||
		isSpinWithPermitConfirming ||
		isSpinPending ||
		isSpinConfirming;

	const maxFee =
		spinFee !== undefined
			? spinFee + (spinFee * BigInt(MAX_FEE_SLIPPAGE_BPS)) / 10_000n
			: undefined;

	const hasSufficientBalance =
		maxFee && tokenBalance ? tokenBalance >= maxFee : false;
	const canSpin =
		isConnected &&
		spinFee &&
		maxFee &&
		hasSufficientBalance &&
		!paused &&
		isGachaAvailable &&
		gachaSpin.isIdle;

	// Formatted values using enhanced utilities
	const formattedBalance =
		tokenBalance && tokenDecimals
			? formatTokenAmount(tokenBalance, tokenDecimals, {
					maxDecimals: 4,
					useGrouping: true,
				})
			: "0";

	// Validation utilities
	const hasPermitSupport = !noncesError && tokenNonce !== undefined && feeToken;
	const isSpinDataReady =
		isConnected &&
		canSpin &&
		userAddress &&
		feeToken &&
		spinFee &&
		(!hasPermitSupport || tokenNonce !== undefined);

	// Enhanced button text logic using state machine states
	const getButtonText = () => {
		// Return consistent text during SSR to prevent hydration mismatch
		if (!mounted) return "Connect Wallet";

		if (!isConnected) return "Connect Wallet";
		if (paused) return "Contract Paused";
		if (isGachaAvailable === false) return "Gacha Unavailable";

		// State machine states
		if (gachaSpin.isError)
			return gachaSpin.canRetry ? "Retry Spin" : "Reset & Try Again";
		if (isSignaturePending) return "Sign Permit...";
		if (isProcessingTransaction) return "Confirming Transaction...";
		if (gachaSpin.isSpinning) return "Preparing Spin...";
		if (gachaSpin.isWaitingForFulfillment) return "Awaiting Randomness...";
		if (gachaSpin.isRevealing) return "Revealing NFT...";

		// Fallback mode
		if (permitFailed) return "SPIN (Direct Approval)";

		// Validation checks
		if (!hasSufficientBalance) return "Insufficient Balance";
		if (hasPermitSupport && tokenNonce === undefined) return "Loading...";

		return "SPIN NOW";
	};

	const isButtonDisabled = () => {
		// Disable button during SSR to prevent hydration mismatch
		if (!mounted) return true;

		return (
			!isConnected ||
			paused ||
			!canSpin ||
			isSignaturePending ||
			isProcessingTransaction ||
			gachaSpin.isSpinning ||
			gachaSpin.isWaitingForFulfillment ||
			(hasPermitSupport && tokenNonce === undefined)
		);
	};

	// Reclaim handler
	const handleReclaim = async () => {
		if (!gachaSpin.triggerId || !contracts.gacha) {
			logger.gachaSpin.error(
				"Missing trigger ID or gacha contract for reclaim",
			);
			return;
		}

		try {
			logger.gachaSpin.log("Reclaiming failed spin:", gachaSpin.triggerId);
			reclaimFailedSpin({
				address: contracts.gacha as `0x${string}`,
				args: [gachaSpin.triggerId],
			});
		} catch (error) {
			logger.gachaSpin.error("Error reclaiming failed spin:", error);
		}
	};

	// Enhanced button click handler
	const onSpinClick = async () => {
		sound.playSpinClick();
		logger.gachaSpin.log("Spin button clicked", {
			state: gachaSpin.state,
			isConnected,
			canSpin,
			userAddress,
			feeToken,
			spinFee: spinFee?.toString(),
			maxFee: maxFee?.toString(),
			tokenNonce: tokenNonce?.toString(),
			hasSufficientBalance,
			paused,
			isGachaAvailable,
			tokenBalance: tokenBalance?.toString(),
			gachaContract: contracts.gacha,
			hasPermitSupport,
			noncesError: noncesError?.message,
			tokenDecimals,
			tokenName,
			chainId,
			permitFailed,
		});

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
				if (!contracts.gacha || !maxFee) {
					logger.gachaSpin.error("Missing max fee or contract for direct spin");
					return;
				}
				gachaSpin.startSpin();
				spin({
					address: contracts.gacha as `0x${string}`,
					abi: [
						{
							type: "function",
							name: "spin",
							stateMutability: "nonpayable",
							inputs: [{ name: "maxFee", type: "uint256" }],
							outputs: [{ name: "triggerId", type: "uint256" }],
						},
					],
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
			logger.gachaSpin.log("Spin conditions not met:", {
				isConnected,
				canSpin,
				userAddress: !!userAddress,
				feeToken: !!feeToken,
				spinFee: !!spinFee,
				maxFee: !!maxFee,
				tokenNonce: tokenNonce !== undefined,
				hasPermitSupport,
				individual_checks: {
					not_connected: !isConnected,
					cannot_spin: !canSpin,
					no_user_address: !userAddress,
					no_fee_token: !feeToken,
					no_spin_fee: !spinFee,
					no_max_fee: !maxFee,
					no_token_nonce: hasPermitSupport && tokenNonce === undefined,
				},
			});
			return;
		}

		try {
			// Start the spin in the state machine
			gachaSpin.startSpin();

			if (!hasPermitSupport) {
				// Fallback: call spin() directly (requires pre-approval)
				spin({
					address: contracts.gacha as `0x${string}`,
					abi: [
						{
							type: "function",
							name: "spin",
							stateMutability: "nonpayable",
							inputs: [{ name: "maxFee", type: "uint256" }],
							outputs: [{ name: "triggerId", type: "uint256" }],
						},
					],
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
				!contracts.gacha
			) {
				logger.gachaSpin.error(
					"Missing required parameters for permit signing:",
					{
						userAddress: !!userAddress,
						feeToken: !!feeToken,
						spinFee: !!spinFee,
						maxFee: !!maxFee,
						tokenNonce: tokenNonce !== undefined,
						gachaContract: !!contracts.gacha,
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

			const domain = {
				name: tokenName || "Token",
				version: "1",
				chainId: chainId,
				verifyingContract: feeToken,
			};

			const message = {
				owner: userAddress,
				spender: contracts.gacha as `0x${string}`,
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

	// Handle permit signature completion
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
				logger.gachaSpin.log(
					"Permit signature received, submitting transaction",
				);

				// Parse signature hex string into r, s, v components
				logger.gachaSpin.debug("Parsing signature:", {
					signatureLength: signature.length,
					signature: `${signature.slice(0, 20)}...`,
				});

				if (signature.length !== 132) {
					// 0x + 130 hex chars (65 bytes)
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
					address: contracts.gacha as `0x${string}`,
					abi: [
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
					],
					args: [
						BigInt(permitDeadline || 0),
						Number(v),
						r as `0x${string}`,
						s as `0x${string}`,
						maxFee as bigint,
					] as const,
					functionName: "spinWithPermit",
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

				// Mark signature as used to prevent reuse
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
		contracts.gacha,
	]);

	// Handle signature errors (user canceled signing)
	useEffect(() => {
		if (signatureError) {
			// Generate unique error ID to prevent duplicate processing
			const errorId = `${signatureError.name}-${signatureError.message}`;
			if (processedPermitErrorRef.current === errorId) {
				return; // Already processed this error
			}
			processedPermitErrorRef.current = errorId;

			// Check if user canceled the signature
			if (isUserRejectedError(signatureError)) {
				// User canceled - silently reset to idle state and show subtle feedback
				logger.gachaSpin.log("User cancelled signature request");
				gachaSpin.reset();
				setUserCancelledMessage(true);
				setTimeout(() => setUserCancelledMessage(false), 2000);
			} else {
				// Real signature error - log detailed debugging info and go to error state
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
						contracts: contracts.gacha,
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
		contracts.gacha,
		chainId,
		tokenName,
	]);

	// Handle transaction submission errors
	useEffect(() => {
		if (spinWithPermitError) {
			// Generate unique error ID to prevent duplicate processing
			const errorId = `${spinWithPermitError.name}-${spinWithPermitError.message}`;
			if (processedReceiptErrorRef.current === errorId) {
				return; // Already processed this error
			}
			processedReceiptErrorRef.current = errorId;

			// Check if user canceled the transaction
			logger.gachaSpin.debug("Analyzing transaction error:", {
				errorMessage: spinWithPermitError.message,
				errorName: spinWithPermitError.name,
				errorCode: (spinWithPermitError as { code?: string }).code,
				isUserRejection: isUserRejectedError(spinWithPermitError),
			});

			if (isUserRejectedError(spinWithPermitError)) {
				// User canceled - silently reset to idle state and show subtle feedback
				logger.gachaSpin.log("User cancelled transaction");
				gachaSpin.reset();
				setUserCancelledMessage(true);
				setTimeout(() => setUserCancelledMessage(false), 2000);
			} else {
				// Real transaction error - log detailed debugging info
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
						contract: contracts.gacha,
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

				// Check if error is related to fee changes
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
					spinFeeQuery.refetch();
					setTimeout(() => setFeeMismatchError(false), 5000);
				}

				// Check if this might be a permit implementation issue
				if (
					errorMessage.includes("invalid signature") ||
					errorMessage.includes("permit") ||
					errorMessage.includes("signature") ||
					errorMessage.includes("execution reverted") ||
					errorMessage.includes("revert")
				) {
					logger.gachaSpin.warn(
						"Permit signature rejected by contract, this might indicate:",
					);
					logger.gachaSpin.warn(
						"  1. Token contract doesn't support EIP-712 permits",
					);
					logger.gachaSpin.warn(
						"  2. Domain separator mismatch (name/version/chainId)",
					);
					logger.gachaSpin.warn(
						"  3. Permit implementation differs from standard",
					);
					logger.gachaSpin.warn(
						"  4. Contract expects different signature format",
					);
					logger.gachaSpin.warn("  5. Permit expired or already used");
					logger.gachaSpin.warn("  6. Insufficient allowance despite permit");

					// Mark permit as failed and enable fallback
					setPermitFailed(true);
					logger.gachaSpin.warn(
						"Trying direct spin as fallback. Make sure you've approved the gacha contract to spend your tokens.",
					);
				}

				gachaSpin.setError(spinWithPermitError.message || "Transaction failed");
			}
		}
	}, [
		spinWithPermitError,
		gachaSpin.reset,
		gachaSpin.setError,
		contracts.gacha,
		userAddress,
		feeToken,
		spinFee,
		maxFee,
		permitDeadline,
		usedSignature,
		tokenName,
		chainId,
		spinFeeQuery.refetch,
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
			// Generate unique error ID to prevent duplicate processing
			const errorId = `${spinError.name}-${spinError.message}`;
			if (processedSpinErrorRef.current === errorId) {
				return; // Already processed this error
			}
			processedSpinErrorRef.current = errorId;

			// Check if user canceled the transaction
			const errorMessage = String(spinError.message || "").toLowerCase();
			if (isUserRejectedError(spinError)) {
				// User canceled - silently reset to idle state and show subtle feedback
				gachaSpin.reset();
				setUserCancelledMessage(true);
				setTimeout(() => setUserCancelledMessage(false), 2000);
			} else {
				// Real transaction error - log and go to error state
				logger.gachaSpin.error("Direct spin transaction error:", spinError);

				// Check if error is related to fee changes
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
					spinFeeQuery.refetch();
					setTimeout(() => setFeeMismatchError(false), 5000);
				}

				gachaSpin.setError(spinError.message || "Transaction failed");
			}
		}
	}, [spinWait.error, gachaSpin.reset, gachaSpin.setError, spinFeeQuery, spinFee]);

	// Handle transaction receipt
	useEffect(() => {
		if (
			(isSpinWithPermitSuccess &&
				spinWithPermitTxHash &&
				processedTxHash !== spinWithPermitTxHash) ||
			(isSpinSuccess && spinTxHash && processedTxHash !== spinTxHash)
		) {
			// Don't process if already moved past the spinning state (race condition guard)
			if (gachaSpin.isRevealing || gachaSpin.isIdle) {
				logger.gachaSpin.log(
					"Skipping receipt processing - state already moved to",
					gachaSpin.state,
				);
				const txHash = isSpinWithPermitSuccess
					? (spinWithPermitTxHash as string)
					: (spinTxHash as string);
				setProcessedTxHash(txHash); // Mark as processed to prevent re-checks
				return;
			}

			logger.gachaSpin.log(
				"Processing spin transaction receipt:",
				spinWithPermitTxHash,
			);

			// Extract trigger ID from RandomnessRequested event in transaction logs
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
						abi: [
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
						],
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
					// Log each decode error for debugging
					logger.gachaSpin.debug(`Log ${i} not a RandomnessRequested event:`, {
						error: (error as Error).message,
						topics: log.topics.length,
						hasData: log.data !== "0x",
					});
				}
			}

			// Mark as processed BEFORE confirming to prevent race with re-render
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
			}

			// Refetch balance after successful spin
			refetchBalance();
			// Refetch nonce for next permit
			refetchNonce();
			// Reset permit deadline
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
		gachaSpin.state,
		gachaSpin.isRevealing,
		gachaSpin.isIdle,
		isSpinSuccess,
		spinTxHash,
		spinReceipt,
	]);

	// Countdown timer effect
	useEffect(() => {
		if (gachaSpin.isWaitingForFulfillment) {
			if (!timeoutStarted) {
				setTimeoutStarted(Date.now());
				setCountdown(SPIN_TIMEOUT_SECONDS);
			}

			const timer = setInterval(() => {
				if (timeoutStarted) {
					const elapsed = Math.floor((Date.now() - timeoutStarted) / 1000);
					const remaining = Math.max(0, SPIN_TIMEOUT_SECONDS - elapsed);
					setCountdown(remaining);

					if (remaining === 0) {
						gachaSpin.timeout();
						clearInterval(timer);
					}
				}
			}, 1000);

			return () => clearInterval(timer);
		} else {
			setTimeoutStarted(null);
			setCountdown(SPIN_TIMEOUT_SECONDS);
		}
	}, [gachaSpin.isWaitingForFulfillment, timeoutStarted, gachaSpin.timeout]);

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
				// User canceled - show subtle feedback and keep them in timeout state
				logger.gachaSpin.log("User cancelled reclaim transaction");
				setUserCancelledMessage(true);
				setTimeout(() => {
					setUserCancelledMessage(false);
				}, 2000);
			} else {
				// Real reclaim error - log detailed debugging info
				logger.gachaSpin.error("Reclaim transaction error:", {
					error: reclaimError,
					message: reclaimError.message,
					name: reclaimError.name,
					cause: reclaimError.cause,
					code: (reclaimError as { code?: unknown }).code,
					data: (reclaimError as { data?: unknown }).data,
					details: {
						triggerId: gachaSpin.triggerId,
						contract: contracts.gacha,
						userAddress,
						chainId,
					},
				});
			}
		}
	}, [reclaimError, gachaSpin.triggerId, contracts.gacha, userAddress]);

	// Map gachaSpin.error to user-friendly error
	useEffect(() => {
		if (gachaSpin.isError && gachaSpin.error) {
			const friendlyError = mapTransactionError(new Error(gachaSpin.error));
			setUserFriendlyError(friendlyError);
		} else {
			setUserFriendlyError(null);
		}
	}, [gachaSpin.isError, gachaSpin.error]);

	return (
		<Card className="relative overflow-hidden border border-white/10 bg-content1/30 p-8 backdrop-blur-2xl">
			{/* Loading skeleton during SSR */}
			{!mounted && (
				<div className="space-y-6">
					<div className="flex justify-between">
						<div className="space-y-2">
							<div className="h-8 bg-content1/30 rounded-lg animate-pulse w-48" />
							<div className="h-4 bg-content1/20 rounded-lg animate-pulse w-64" />
						</div>
						<div className="h-12 w-12 bg-content1/30 rounded-full animate-pulse" />
					</div>
					<div className="flex justify-center">
						<div className="h-64 w-64 bg-content1/30 rounded-full animate-pulse" />
					</div>
					<div className="flex justify-center">
						<div className="h-14 bg-content1/30 rounded-xl animate-pulse w-full max-w-xs" />
					</div>
				</div>
			)}

			{/* Main content - only render when mounted */}
			{mounted && (
				<>
					{/* Enhanced background gradient */}
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,200,87,0.15),_transparent_60%)]" />

					<SpinFeeDisplay
						spinFee={spinFee}
						tokenDecimals={tokenDecimals}
						tokenSymbol={tokenSymbol}
						feeStale={feeStale}
						isFetching={spinFeeQuery.isFetching}
						onRefresh={() => spinFeeQuery.refetch()}
						isMuted={sound.isMuted}
						onToggleMute={sound.toggleMute}
					/>
					<div className="py-16">
						<div className="flex flex-col items-center space-y-10">
							{/* Enhanced Spinner Visual with Lottie Animation */}
							<SpinVisual
								isSpinning={gachaSpin.isSpinning}
								isWaitingForFulfillment={gachaSpin.isWaitingForFulfillment}
								isError={gachaSpin.isError}
							/>

							{/* Timeout Display */}
							<SpinTimeoutModal
								isOpen={gachaSpin.isTimeout}
								isReclaimPending={isReclaimPending}
								onReclaim={handleReclaim}
								onReset={gachaSpin.reset}
							/>

							{/* Refund Display */}
							{gachaSpin.isRefunded && gachaSpin.refundResult && (
								<SpinRefundModal
									isOpen={gachaSpin.isRefunded}
									refundResult={gachaSpin.refundResult}
									tokenDecimals={tokenDecimals}
									tokenSymbol={tokenSymbol}
									onReset={gachaSpin.reset}
								/>
							)}

							{/* Error Display Only */}
							{gachaSpin.isError &&
								!gachaSpin.isTimeout &&
								!gachaSpin.isRefunded && (
									<SpinErrorModal
										isOpen={gachaSpin.isError}
										error={gachaSpin.error}
										userFriendlyError={userFriendlyError}
										retryCount={gachaSpin.retryCount}
										onRetry={gachaSpin.retry}
									/>
								)}

							<SpinErrorDisplay
								userCancelledMessage={userCancelledMessage}
								permitFailed={permitFailed}
								feeMismatchError={feeMismatchError}
								isGachaUnavailable={isConnected && isGachaAvailable === false}
								tokenSymbol={tokenSymbol}
								gachaAddress={contracts.gacha}
							/>
							<SpinButton
								buttonText={getButtonText()}
								disabled={!!isButtonDisabled()}
								isLoading={
									isSignaturePending ||
									isProcessingTransaction ||
									gachaSpin.isSpinning
								}
								isWaitingForFulfillment={gachaSpin.isWaitingForFulfillment}
								isRevealing={gachaSpin.isRevealing}
								isError={gachaSpin.isError}
								onClick={onSpinClick}
							/>

							{/* Balance Display - Under Button */}
							{mounted && isConnected && !gachaSpin.isWaitingForFulfillment && (
								<div className="text-center">
									<p className="text-sm text-success/80">
										Balance: {formattedBalance} {tokenSymbol || "TOKENS"}
									</p>
								</div>
							)}

							{/* Minimalist Countdown Display */}
							{gachaSpin.isWaitingForFulfillment && (
								<div className="flex items-center justify-center gap-3">
									<div className="w-4 h-4 border border-warning/50 border-t-warning rounded-full animate-spin"></div>
									<p className="text-sm text-warning/80 font-medium">
										Awaiting randomness • {countdown}s
									</p>
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</Card>
	);
});

SpinControls.displayName = "SpinControls";

export default SpinControls;
