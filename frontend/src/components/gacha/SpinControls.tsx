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
import { cn, glassTypography } from "../../lib/theme-config";
import {
	isUserRejectedError,
	mapTransactionError,
} from "../../lib/transactionErrors";
import { formatCurrency, formatTokenAmount } from "../../lib/utils";
import { Button, Card } from "../../ui";
import { SpinErrorModal } from "./SpinErrorModal";
import { SpinRefundModal } from "./SpinRefundModal";
import { SpinTimeoutModal } from "./SpinTimeoutModal";
import { SpinVisual } from "./SpinVisual";

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

	// Update last fee update time when data changes
	useEffect(() => {
		if (spinFeeQuery.data) {
			setLastFeeUpdate(Date.now());
			setFeeStale(false);
		}
	}, [spinFeeQuery.data]);

	// Mark fee as stale after 15 seconds without updates, but clear it if actively fetching
	useEffect(() => {
		const interval = setInterval(() => {
			if (Date.now() - lastFeeUpdate > 15000 && !spinFeeQuery.isFetching) {
				setFeeStale(true);
			} else if (spinFeeQuery.isFetching && feeStale) {
				// Clear stale flag if we're actively fetching fresh data
				setFeeStale(false);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [lastFeeUpdate, spinFeeQuery.isFetching, feeStale]);

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
	}, [registerRefetch, spinFeeQuery]);

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

	const formatSpinFee = () => {
		if (!spinFee || !tokenDecimals) return "Loading...";
		return formatCurrency(spinFee, tokenDecimals, tokenSymbol || "TOKENS");
	};

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
		gachaSpin,
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
		gachaSpin,
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
						blockExplorer: `https://holesky.etherscan.io/address/${contracts.gacha}`,
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
		gachaSpin,
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
	}, [spinWithPermitReceiptError, gachaSpin]);

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
	}, [spinWait.error, gachaSpin, spinFeeQuery, spinFee]);

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

			// Mark as processed regardless of outcome to prevent infinite loops
			const txHash = isSpinWithPermitSuccess
				? (spinWithPermitTxHash as string)
				: (spinTxHash as string);
			setProcessedTxHash(txHash);

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
		gachaSpin,
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
	}, [isReclaimReceiptSuccess, gachaSpin, refetchBalance, refetchNonce]);

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
						blockExplorer: `https://holesky.etherscan.io/address/${contracts.gacha}`,
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

					{/* Enhanced header with better balance and fee display */}
					<div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
						<div className="space-y-2">
							<div className="flex items-center gap-3">
								<h2 className={glassTypography({ variant: "mainHeading" })}>
									Gacha Spinner
								</h2>
								<button
									type="button"
									onClick={sound.toggleMute}
									className="p-2 rounded-xl bg-content1/30 hover:bg-content1/50 border border-white/10 backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
									aria-label={
										sound.isMuted
											? "Unmute sound effects"
											: "Mute sound effects"
									}
									title={sound.isMuted ? "Unmute sounds" : "Mute sounds"}
								>
									{sound.isMuted ? (
										<svg
											className="w-4 h-4 text-foreground/50"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											strokeWidth={2}
										>
											<title>Sound off</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
											/>
										</svg>
									) : (
										<svg
											className="w-4 h-4 text-foreground/70"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											strokeWidth={2}
										>
											<title>Sound on</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
											/>
										</svg>
									)}
								</button>
							</div>
							<p className="text-sm text-foreground/60">
								Provably fair randomness with instant NFT reveals
							</p>
						</div>

						{/* Enhanced Entry Fee Display */}
						<div className="flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-4 shadow-inner relative">
							{/* Stale data indicator */}
							{feeStale && (
								<div className="absolute -top-2 -right-2 flex items-center gap-1.5 px-2 py-1 bg-danger/20 border border-danger/40 rounded-full animate-pulse">
									<div className="w-1.5 h-1.5 rounded-full bg-danger animate-ping" />
									<span className="text-[10px] font-semibold text-danger uppercase">
										Updating...
									</span>
								</div>
							)}
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-warning/30 bg-warning/10">
									<svg
										className="w-5 h-5 text-warning"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										strokeWidth={2}
									>
										<title>Entry Fee</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<p className="text-xs uppercase tracking-wide text-warning/70 font-medium">
											Entry Fee
										</p>
										<button
											type="button"
											onClick={() => spinFeeQuery.refetch()}
											disabled={spinFeeQuery.isFetching}
											className="p-1 rounded hover:bg-warning/20 transition-colors disabled:opacity-50"
											aria-label="Refresh spin fee"
											title="Refresh spin fee"
										>
											<svg
												className={`w-3.5 h-3.5 text-warning/70 hover:text-warning ${
													spinFeeQuery.isFetching ? "animate-spin" : ""
												}`}
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												strokeWidth={2}
											>
												<title>Refresh</title>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
												/>
											</svg>
										</button>
									</div>
									<p className="text-xl font-bold text-warning">
										{formatSpinFee()}
									</p>
								</div>
							</div>
							{tokenSymbol && (
								<p className="text-xs text-warning/60">
									Per spin in {tokenSymbol}
									{feeStale && " • Updating..."}
								</p>
							)}
						</div>
					</div>
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

							{/* User Cancelled Message */}
							{userCancelledMessage && (
								<div className="animate-fade-in text-center text-xs text-foreground/50 px-4 py-2">
									Transaction cancelled
								</div>
							)}

							{/* Permit Fallback Message */}
							{permitFailed && (
								<output
									className="text-center p-4 bg-warning/10 border border-warning/20 rounded-2xl"
									aria-live="polite"
								>
									<div>
										<p className="text-sm mb-2 font-semibold text-warning">
											Using Direct Approval Mode
										</p>
										<p className="text-xs opacity-60 mb-3">
											Permit signing failed. Using direct approval instead. Make
											sure you've approved the gacha contract to spend your{" "}
											{tokenSymbol || "tokens"}.
										</p>
										<div className="text-xs opacity-50">
											Contract: {contracts.gacha?.slice(0, 8)}...
											{contracts.gacha?.slice(-6)}
										</div>
									</div>
								</output>
							)}

							{/* Fee Mismatch Error Message */}
							{feeMismatchError && (
								<output
									className="animate-fade-in text-center p-4 bg-warning/10 border border-warning/30 rounded-2xl"
									aria-live="polite"
								>
									<div className="flex items-center justify-center gap-2 mb-2">
										<svg
											className="w-4 h-4 text-warning"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											strokeWidth={2}
										>
											<title>Warning</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
											/>
										</svg>
										<p className="text-sm font-semibold text-warning">
											Spin Fee Updated
										</p>
									</div>
									<p className="text-xs text-foreground/70 mb-2">
										The spin fee has changed. Please check the updated fee above
										and try again.
									</p>
									<p className="text-[10px] text-foreground/50">
										This happens when the treasury inventory changes from new
										deposits.
									</p>
								</output>
							)}

							{/* Gacha Unavailable Warning */}
							{isConnected && isGachaAvailable === false && (
								<Card
									className="text-center p-4 bg-warning/10 border border-warning/20 rounded-2xl"
									role="alert"
									aria-live="assertive"
								>
									<div>
										<p className="text-sm mb-2">Gacha System Unavailable</p>
										<p className="text-xs opacity-60">
											No whitelisted collections or NFTs available for spinning
										</p>
									</div>
								</Card>
							)}
							{/* Enhanced Spin Button */}
							<div className="relative group">
								{/* Glow effect on hover */}
								<div className="absolute inset-0 bg-gradient-to-r from-warning/30 via-warning/20 to-orange-400/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-110"></div>

								{/* Removed particle effects for cleaner look */}

								<Button
									color="glassPrimary"
									size="lg"
									onPress={onSpinClick}
									disabled={isButtonDisabled()}
									isLoading={
										isSignaturePending ||
										isProcessingTransaction ||
										gachaSpin.isSpinning
									}
									className={cn(
										// Dynamic styling based on state
										gachaSpin.isWaitingForFulfillment
											? "border-orange-400/60 shadow-orange-400/40"
											: undefined,
										gachaSpin.isSpinning
											? "border-orange-400 shadow-orange-400/30"
											: undefined,
										gachaSpin.isRevealing
											? "bg-gradient-to-r from-success via-success/90 to-emerald-400 border-success/40 shadow-success/30"
											: undefined,
										gachaSpin.isError
											? "bg-gradient-to-r from-danger via-danger/90 to-red-600 border-danger/40 shadow-danger/30"
											: undefined,
									)}
									aria-label={getButtonText()}
								>
									{/* Button content with icon */}
									<div className="flex items-center justify-center gap-3">
										{/* Dynamic icon based on state */}
										{gachaSpin.isWaitingForFulfillment && (
											<svg
												className="w-6 h-6 animate-spin"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												strokeWidth={2}
											>
												<title>Processing</title>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
												/>
											</svg>
										)}
										{gachaSpin.isRevealing && (
											<svg
												className="w-6 h-6"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												strokeWidth={2}
											>
												<title>Revealing</title>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
												/>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
												/>
											</svg>
										)}
										{gachaSpin.isError && (
											<svg
												className="w-6 h-6"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												strokeWidth={2}
											>
												<title>Error</title>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
												/>
											</svg>
										)}
										{!gachaSpin.isWaitingForFulfillment &&
											!gachaSpin.isRevealing &&
											!gachaSpin.isError && (
												<svg
													className="w-6 h-6"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													strokeWidth={2}
												>
													<title>Spin</title>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M13 10V3L4 14h7v7l9-11h-7z"
													/>
												</svg>
											)}

										<span className="font-bold tracking-wide">
											{getButtonText()}
										</span>
									</div>
								</Button>
							</div>

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
