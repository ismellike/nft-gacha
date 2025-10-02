"use client";

import { useState, useEffect } from "react";
import {
	useAccount,
	useWaitForTransactionReceipt,
	useSignTypedData,
	useChainId,
} from "wagmi";
import { glassTypography, cn } from "../lib/theme-config";
import { Card, Button, Chip } from "./ui/GlassComponents";
import { TokenFeeDisplay } from "./ui";
import { formatUnits, decodeEventLog } from "viem";
import { formatTokenAmount, formatCurrency } from "../lib/utils";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import {
	useReadGachaSpinFee,
	useReadGachaPaused,
	useReadGachaFeeToken,
	useWriteGachaSpinWithPermit,
	useReadErc20Decimals,
	useReadErc20Symbol,
	useReadErc20Name,
	useReadErc20BalanceOf,
	useReadIerc20PermitNonces,
	useReadGachaTreasuryIsGachaAvailable,
	useWriteGachaReclaimFailedSpin,
	useWriteGachaSpin,
	gachaAbi,
} from "../generated";
import type { UseGachaSpinMachineReturn } from "../hooks/useGachaSpinMachine";

interface SpinControlsProps {
	gachaSpin: UseGachaSpinMachineReturn;
	onRefund?: () => void;
}

export default function SpinControls({
	gachaSpin,
	onRefund,
}: SpinControlsProps) {
	const { address: userAddress, isConnected } = useAccount();
	const chainId = useChainId();

	// Local state for permit handling
	const [permitDeadline, setPermitDeadline] = useState<bigint | null>(null);
	const [usedSignature, setUsedSignature] = useState<string | null>(null);
	const [processedTxHash, setProcessedTxHash] = useState<string | null>(null);

	// Countdown timer for randomness timeout
	const [countdown, setCountdown] = useState(30);
	const [timeoutStarted, setTimeoutStarted] = useState<number | null>(null);

	// Get gacha ID and contract addresses
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	// Gacha contract data
	const { data: spinFee } = useReadGachaSpinFee({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	});

	const { data: paused } = useReadGachaPaused({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	});

	const { data: feeToken } = useReadGachaFeeToken({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	});

	const { data: isGachaAvailable } = useReadGachaTreasuryIsGachaAvailable({
		address: contracts.treasury as `0x${string}` | undefined,
		query: { enabled: !!contracts.treasury },
	} as Parameters<typeof useReadGachaTreasuryIsGachaAvailable>[0]);

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
	} = useWriteGachaSpin();

	// Handle refund detection to refresh balances
	useEffect(() => {
		if (gachaSpin.isRefunded && gachaSpin.refundResult) {
			console.log("💰 [SpinControls] Refund detected, refreshing balances");
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

	// Write operations
	const {
		writeContract: spinWithPermit,
		data: spinWithPermitTxHash,
		isPending: isSpinWithPermitPending,
		error: spinWithPermitError,
	} = useWriteGachaSpinWithPermit();

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
	const hasSufficientBalance =
		spinFee && tokenBalance ? tokenBalance >= spinFee : false;
	const canSpin =
		isConnected &&
		spinFee &&
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

	// Enhanced button text logic using state machine states
	const getButtonText = () => {
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

		// Validation checks
		if (!hasSufficientBalance) return "Insufficient Balance";
		const hasPermitSupport = !noncesError;
		if (hasPermitSupport && tokenNonce === undefined) return "Loading...";

		return "SPIN NOW";
	};

	const isButtonDisabled = () => {
		return (
			!isConnected ||
			paused ||
			!canSpin ||
			isSignaturePending ||
			isProcessingTransaction ||
			gachaSpin.isSpinning ||
			gachaSpin.isWaitingForFulfillment ||
			(!noncesError && tokenNonce === undefined)
		);
	};

	// Reclaim handler
	const handleReclaim = async () => {
		if (!gachaSpin.triggerId || !contracts.gacha) {
			console.error("Missing trigger ID or gacha contract for reclaim");
			return;
		}

		try {
			console.log(
				"🔄 [SpinControls] Reclaiming failed spin:",
				gachaSpin.triggerId,
			);
			reclaimFailedSpin({
				address: contracts.gacha,
				args: [gachaSpin.triggerId],
			});
		} catch (error) {
			console.error("Error reclaiming failed spin:", error);
		}
	};

	// Enhanced button click handler
	const onSpinClick = async () => {
		console.log("🎯 [SpinControls] Spin button clicked", {
			state: gachaSpin.state,
			isConnected,
			canSpin,
			userAddress,
			feeToken,
			spinFee: spinFee?.toString(),
			tokenNonce: tokenNonce?.toString(),
			hasSufficientBalance,
			paused,
			isGachaAvailable,
			tokenBalance: tokenBalance?.toString(),
			gachaContract: contracts.gacha,
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

		// Validate spin conditions
		const hasPermitSupport = !noncesError;
		if (
			!isConnected ||
			!canSpin ||
			!userAddress ||
			!feeToken ||
			!spinFee ||
			(hasPermitSupport && tokenNonce === undefined)
		) {
			console.log("❌ [SpinControls] Spin conditions not met:", {
				isConnected,
				canSpin,
				userAddress: !!userAddress,
				feeToken: !!feeToken,
				spinFee: !!spinFee,
				tokenNonce: tokenNonce !== undefined,
				individual_checks: {
					not_connected: !isConnected,
					cannot_spin: !canSpin,
					no_user_address: !userAddress,
					no_fee_token: !feeToken,
					no_spin_fee: !spinFee,
					no_token_nonce: hasPermitSupport && tokenNonce === undefined,
				},
			});
			return;
		}

		try {
			// Start the spin in the state machine
			gachaSpin.startSpin();

			const hasPermitSupport = !noncesError;
			if (!hasPermitSupport) {
				// Fallback: call spin() directly (requires pre-approval)
				spin({ address: contracts.gacha as `0x${string}` });
				return;
			}

			// Create permit signature
			const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
			setPermitDeadline(deadline);

			console.log("📝 [SpinControls] Requesting permit signature...");
			signTypedData({
				domain: {
					name: tokenName || "Token",
					version: "1",
					chainId: chainId,
					verifyingContract: feeToken,
				},
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
				message: {
					owner: userAddress,
					spender: contracts.gacha as `0x${string}`,
					value: spinFee,
					nonce: tokenNonce as bigint,
					deadline,
				},
			});
		} catch (error) {
			console.error("[SpinControls] Error in spin click handler:", error);
			gachaSpin.reset();
		}
	};

	// Handle permit signature completion
	useEffect(() => {
		if (
			signature &&
			spinFee &&
			feeToken &&
			permitDeadline &&
			signature !== usedSignature
		) {
			try {
				console.log(
					"✅ [SpinControls] Permit signature received, submitting transaction...",
				);

				// Parse signature hex string into r, s, v components
				const sig = signature.slice(2); // remove 0x
				const r = `0x${sig.slice(0, 64)}` as `0x${string}`;
				const s = `0x${sig.slice(64, 128)}` as `0x${string}`;
				let v = parseInt(sig.slice(128, 130), 16);

				// Ensure v is 27 or 28 for Ethereum
				if (v < 27) {
					v += 27;
				}

				// Mark signature as used to prevent reuse
				setUsedSignature(signature);

				spinWithPermit({
					address: contracts.gacha as `0x${string}`,
					args: [permitDeadline, v, r, s],
				});
			} catch (error) {
				console.error("[SpinControls] Error calling spinWithPermit:", error);
				gachaSpin.reset();
			}
		}
	}, [
		signature,
		spinFee,
		feeToken,
		permitDeadline,
		usedSignature,
		spinWithPermit,
		gachaSpin,
		contracts.gacha,
	]);

	// Handle transaction receipt
	useEffect(() => {
		if (
			(isSpinWithPermitSuccess &&
				spinWithPermitTxHash &&
				processedTxHash !== spinWithPermitTxHash) ||
			(isSpinSuccess && spinTxHash && processedTxHash !== spinTxHash)
		) {
			console.log(
				"📋 [SpinControls] Processing spin transaction receipt:",
				spinWithPermitTxHash,
			);

			// Extract trigger ID from RandomnessRequested event in transaction logs
			let triggerId: bigint | null = null;

			const receipt = isSpinWithPermitSuccess ? spinReceiptData : spinReceipt;
			if (!receipt) return;
			for (const log of receipt.logs) {
				try {
					const decoded = decodeEventLog({
						abi: gachaAbi,
						data: log.data,
						topics: log.topics,
					});

					if (decoded.eventName === "RandomnessRequested") {
						triggerId = decoded.args.triggerId as bigint;
						break;
					}
				} catch (_error) { }
			}

			if (triggerId !== null) {
				console.log(
					"✅ [SpinControls] Found trigger ID in receipt:",
					triggerId,
				);
				gachaSpin.confirmTransaction(triggerId);
				setProcessedTxHash(
					isSpinWithPermitSuccess
						? (spinWithPermitTxHash as string)
						: (spinTxHash as string),
				); // Mark as processed
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
		gachaSpin,
		isSpinSuccess,
		spinTxHash,
		spinReceipt,
	]);

	// Countdown timer effect
	useEffect(() => {
		if (gachaSpin.isWaitingForFulfillment) {
			if (!timeoutStarted) {
				setTimeoutStarted(Date.now());
				setCountdown(30);
			}

			const timer = setInterval(() => {
				if (timeoutStarted) {
					const elapsed = Math.floor((Date.now() - timeoutStarted) / 1000);
					const remaining = Math.max(0, 30 - elapsed);
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
			setCountdown(30);
		}
	}, [gachaSpin.isWaitingForFulfillment, timeoutStarted, gachaSpin.timeout]);

	// Handle reclaim success
	useEffect(() => {
		if (isReclaimReceiptSuccess) {
			console.log(
				"✅ [SpinControls] Reclaim transaction confirmed, resetting state machine",
			);
			gachaSpin.reset();
			refetchBalance();
			refetchNonce();
		}
	}, [isReclaimReceiptSuccess, gachaSpin, refetchBalance, refetchNonce]);

	return (
		<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
			<div className="flex justify-between items-center w-full">
				<h2 className={glassTypography({ variant: "mainHeading" })}>
					Gacha Spinner
				</h2>
				<TokenFeeDisplay
					{...(feeToken && { address: feeToken })}
					{...(tokenName && { name: tokenName })}
					{...(tokenSymbol && { symbol: tokenSymbol })}
					amount={formatSpinFee()}
				/>
			</div>
			<div className="py-16">
				<div className="flex flex-col items-center space-y-10">
					{/* Enhanced Spinner Visual with Lottie Animation */}
					<div className="relative group">
						{/* Outer glow rings */}
						<div
							className={`absolute inset-0 w-64 h-64 rounded-full ${gachaSpin.isWaitingForFulfillment || gachaSpin.isSpinning
									? "animate-pulse"
									: ""
								}`}
						>
							<div
								className="w-full h-full rounded-full border-2 border-warning/20 animate-spin"
								style={{ animationDuration: "8s" }}
							></div>
						</div>
						<div
							className={`absolute inset-2 w-60 h-60 rounded-full ${gachaSpin.isWaitingForFulfillment || gachaSpin.isSpinning
									? "animate-pulse"
									: ""
								}`}
						>
							<div
								className="w-full h-full rounded-full border border-warning/10 animate-spin"
								style={{
									animationDuration: "12s",
									animationDirection: "reverse",
								}}
							></div>
						</div>

						{/* Main spinner with enhanced state-based styling */}
						<div
							className={cn(
								"relative w-64 h-64 rounded-full bg-gradient-to-r from-primary via-warning to-warning p-3 shadow-2xl shadow-warning/20",
								gachaSpin.isWaitingForFulfillment || gachaSpin.isSpinning
									? "spin-wobble"
									: gachaSpin.isError
										? "animate-bounce"
										: "hover:shadow-3xl hover:shadow-warning/30 transition-all duration-300",
							)}
						>
							{/* Inner glass surface */}
							<div className="w-full h-full rounded-full bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl flex items-center justify-center border border-warning/30 relative overflow-hidden">
								{/* Shimmer effect */}
								<div className="absolute inset-0 bg-gradient-to-r from-transparent via-warning/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>

								{/* Spin-Fi Logo */}
								<div className="relative z-10 filter drop-shadow-2xl">
									<svg
										className="w-20 h-20 drop-shadow-lg text-warning"
										viewBox="227 210 589 590"
										xmlns="http://www.w3.org/2000/svg"
									>
										<title>Spin-Fi logo</title>
										<path
											d="M0,0 L47,0 L78,4 L101,9 L125,17 L149,28 L164,37 L181,49 L194,60 L202,67 L209,74 L218,85 L228,98 L239,115 L250,135 L260,160 L267,185 L271,208 L272,218 L272,258 L269,281 L264,302 L259,319 L248,347 L236,370 L225,386 L217,396 L208,406 L201,413 L196,418 L188,426 L175,436 L160,446 L142,456 L125,464 L102,471 L80,475 L58,476 L41,475 L22,471 L7,466 L-12,457 L-23,450 L-36,440 L-48,428 L-59,414 L-68,399 L-75,383 L-79,371 L-82,353 L-83,328 L-81,310 L-76,291 L-68,275 L-56,259 L-46,249 L-31,240 L-16,234 L-7,232 L11,232 L25,236 L35,242 L42,248 L48,257 L52,268 L53,278 L49,276 L40,269 L34,267 L22,267 L12,272 L4,279 L-5,291 L-11,303 L-13,311 L-13,331 L-10,345 L-5,358 L2,368 L11,378 L21,385 L38,393 L56,397 L82,397 L98,394 L114,388 L126,382 L142,370 L155,358 L164,347 L174,333 L185,312 L192,293 L197,272 L199,251 L199,240 L197,214 L192,192 L184,171 L174,152 L163,136 L154,125 L146,117 L135,108 L122,98 L109,90 L93,82 L79,76 L58,70 L41,67 L31,66 L-1,66 L-24,69 L-47,74 L-71,82 L-98,95 L-117,107 L-134,120 L-148,132 L-163,147 L-172,158 L-185,175 L-195,190 L-205,208 L-216,231 L-222,246 L-229,271 L-234,296 L-236,312 L-237,326 L-237,348 L-234,380 L-229,406 L-223,430 L-224,432 L-230,422 L-241,399 L-249,377 L-256,349 L-260,325 L-262,304 L-262,269 L-259,240 L-254,214 L-246,188 L-238,168 L-228,148 L-215,127 L-202,110 L-191,97 L-182,87 L-165,70 L-151,59 L-136,48 L-112,33 L-97,25 L-70,14 L-45,7 L-25,3 Z "
											fill="currentColor"
											transform="translate(489,210)"
										/>
										<path
											d="M0,0 L26,0 L46,3 L67,9 L83,16 L94,22 L105,30 L119,41 L136,58 L144,69 L154,87 L160,101 L164,116 L166,128 L166,161 L162,179 L155,195 L149,206 L139,220 L130,229 L116,238 L105,243 L85,247 L74,247 L57,243 L45,236 L37,227 L32,217 L32,212 L43,215 L56,215 L67,211 L76,205 L82,200 L90,189 L94,180 L96,171 L96,146 L92,130 L86,118 L78,108 L67,98 L54,90 L38,83 L19,78 L10,77 L-3,77 L-17,79 L-35,85 L-50,93 L-63,103 L-74,113 L-83,124 L-92,136 L-100,150 L-108,167 L-115,191 L-118,212 L-118,246 L-113,276 L-108,292 L-99,313 L-88,332 L-75,349 L-64,361 L-52,372 L-38,382 L-22,391 L-4,399 L14,405 L34,409 L55,411 L66,411 L92,409 L114,405 L138,398 L162,388 L181,378 L199,366 L212,356 L222,348 L234,337 L246,325 L255,314 L269,295 L280,277 L291,256 L300,233 L306,214 L311,192 L314,172 L316,143 L316,130 L314,101 L311,78 L314,81 L322,100 L329,124 L334,151 L336,176 L336,201 L333,235 L328,260 L321,285 L312,309 L300,334 L291,350 L279,367 L268,381 L259,391 L252,399 L239,412 L228,421 L213,432 L193,445 L169,457 L140,468 L111,476 L89,480 L73,482 L31,482 L6,479 L-21,473 L-44,465 L-62,457 L-81,447 L-93,439 L-106,429 L-120,417 L-130,407 L-139,396 L-151,381 L-163,361 L-174,338 L-181,319 L-187,295 L-191,268 L-191,231 L-188,203 L-183,177 L-177,155 L-167,131 L-154,106 L-144,91 L-135,79 L-124,66 L-113,54 L-103,45 L-83,30 L-64,19 L-47,11 L-29,5 L-9,1 Z "
											fill="currentColor"
											transform="translate(480,318)"
										/>
									</svg>
								</div>
							</div>
						</div>
					</div>

					{/* Timeout Display */}
					{gachaSpin.isTimeout && (
						<Card className="text-center p-4 bg-danger/10 border border-danger/20 rounded-2xl">
							<div>
								<div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-3">
									<svg
										className="w-8 h-8 text-danger"
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
								</div>
								<p className="text-sm mb-2 font-semibold text-danger">
									Randomness Timeout
								</p>
								<p className="text-xs opacity-60 mb-3">
									The random number generation took longer than expected. This
									may indicate a network issue or VRF coordinator problem.
								</p>
								<div className="flex flex-col gap-2">
									<button
										type="button"
										onClick={handleReclaim}
										disabled={isReclaimPending}
										className="px-4 py-2 bg-warning hover:bg-warning/90 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
									>
										{isReclaimPending ? "Reclaiming..." : "Reclaim Funds"}
									</button>
									<button
										type="button"
										onClick={gachaSpin.reset}
										className="px-4 py-2 bg-content2 hover:bg-content3 text-foreground rounded-lg transition-colors text-sm"
									>
										Try Again
									</button>
									<p className="text-xs opacity-50">
										Reclaim refunds your spin fee and invalidates this request
										to prevent late fulfillment.
									</p>
								</div>
							</div>
						</Card>
					)}

					{/* Refund Display */}
					{gachaSpin.isRefunded && gachaSpin.refundResult && (
						<Card className="text-center p-4 bg-warning/10 border border-warning/20 rounded-2xl">
							<div>
								<div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-3">
									<svg
										className="w-8 h-8 text-warning"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										strokeWidth={2}
									>
										<title>Warning</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M9 8h6m-5 0a3 3 0 110 6H9l3 3-3-3m1 0h6m-6 0a3 3 0 110-6m6 0a3 3 0 110 6M9 8a3 3 0 000 6m0-6a3 3 0 016 0 201 201 0 00.999 1M15 14a3 3 0 000-6m0 6a3 3 0 000-6M10 21l-3-3 3-3"
										/>
									</svg>
								</div>
								<p className="text-sm mb-2 font-semibold text-warning">
									Spin Refunded
								</p>
								<p className="text-xs opacity-60 mb-3">
									Your spin was automatically refunded because the selected
									rarity ({gachaSpin.refundResult.selectedRarity}) had no
									available NFTs.
								</p>
								<div className="space-y-2">
									<div className="bg-content1/20 rounded-lg p-3">
										<p className="text-xs font-medium mb-1">Refund Details:</p>
										<p className="text-sm">
											<span className="font-semibold">Rarity:</span>{" "}
											{gachaSpin.refundResult.selectedRarity}
										</p>
										<p className="text-sm">
											<span className="font-semibold">Amount:</span>{" "}
											{formatUnits(
												gachaSpin.refundResult.refundAmount,
												tokenDecimals || 18,
											)}{" "}
											{tokenSymbol}
										</p>
									</div>
									<button
										type="button"
										onClick={gachaSpin.reset}
										className="px-4 py-2 bg-warning hover:bg-warning/90 text-white rounded-lg transition-colors text-sm w-full"
									>
										Try Another Spin
									</button>
									<p className="text-xs opacity-50">
										Your funds have been automatically returned to your wallet.
									</p>
								</div>
							</div>
						</Card>
					)}

					{/* Error Display Only */}
					{gachaSpin.isError &&
						!gachaSpin.isTimeout &&
						!gachaSpin.isRefunded && (
							<Card className="text-center p-4 bg-danger/10 border border-danger/20 rounded-2xl">
								<div>
									<p className="text-sm mb-2">{gachaSpin.error}</p>
									<p className="text-xs opacity-60">
										Retry attempts: {gachaSpin.retryCount}/5
									</p>
								</div>
							</Card>
						)}

					{/* Gacha Unavailable Warning */}
					{isConnected && isGachaAvailable === false && (
						<Card className="text-center p-4 bg-warning/10 border border-warning/20 rounded-2xl">
							<div>
								<p className="text-sm mb-2">Gacha System Unavailable</p>
								<p className="text-xs opacity-60">
									No whitelisted collections or NFTs available for spinning
								</p>
							</div>
						</Card>
					)}

					{/* User balance display */}
					{isConnected && (
						<Chip className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-xl backdrop-blur-xl">
							<div className="text-center">
								<p className={glassTypography({ variant: "bodyMuted" })}>
									Your Balance
								</p>
								<p
									className={cn(
										"text-lg font-semibold",
										glassTypography({ variant: "body" }),
									)}
								>
									{formattedBalance} {tokenSymbol || "TOKENS"}
								</p>
							</div>
						</Chip>
					)}

					{/* Error display for transaction errors */}
					{(spinWithPermitError ||
						spinWithPermitReceiptError ||
						signatureError ||
						reclaimError) && (
							<Card className="text-center p-4 bg-danger/10 border border-danger/20 rounded-2xl">
								<div>
									<p className="text-sm mb-2">
										Transaction failed. Please try again.
									</p>
									{reclaimError && (
										<p className="text-xs opacity-60">
											Reclaim error: {reclaimError.message}
										</p>
									)}
								</div>
							</Card>
						)}

					{/* Spin Button */}
					<Button
						size="lg"
						onPress={onSpinClick}
						disabled={isButtonDisabled()}
						isLoading={
							isSignaturePending ||
							isProcessingTransaction ||
							gachaSpin.isSpinning
						}
					>
						{getButtonText()}
					</Button>

					{/* Countdown Display - Under Button */}
					{gachaSpin.isWaitingForFulfillment && (
						<div className="text-center">
							<p className="text-2xl font-mono font-bold text-warning">
								{countdown}s
							</p>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
}
