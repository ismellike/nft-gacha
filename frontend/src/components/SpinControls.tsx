"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useState, useEffect } from "react";
import {
	useAccount,
	useWaitForTransactionReceipt,
	useSignTypedData,
	useChainId,
} from "wagmi";
import { cn } from "../lib/theme";
import { glassTypography, glassStatus } from "../lib/theme-config";
import { GlassCard, GlassButton, GlassBadge, TokenFeeDisplay } from "./ui";
import { ThemedIcon } from "../lib/icons";
import { formatUnits, decodeEventLog } from "viem";
import { formatTokenAmount, formatCurrency } from "../lib/utils";
import { env } from "../env";
import {
	useReadGachaSpinFee,
	useReadGachaPaused,
	useReadGachaFeeToken,
	useWriteGachaSpinWithPermit,
	useReadErc20Decimals,
	useReadErc20Symbol,
	useReadErc20Name,
	useReadErc20BalanceOf,
	useReadTestTokenNonces,
	useReadGachaTreasuryIsGachaAvailable,
	gachaAbi,
} from "../generated";
import { useGachaSpinMachine } from "../hooks/useGachaSpinMachine";
import type { UseGachaSpinMachineReturn } from "../hooks/useGachaSpinMachine";

interface SpinControlsProps {
	gachaSpin: UseGachaSpinMachineReturn;
}

export default function SpinControls({ gachaSpin }: SpinControlsProps) {
	const { address: userAddress, isConnected } = useAccount();
	const chainId = useChainId();

	// Local state for permit handling
	const [permitDeadline, setPermitDeadline] = useState<bigint | null>(null);
	const [usedSignature, setUsedSignature] = useState<string | null>(null);
	const [processedTxHash, setProcessedTxHash] = useState<string | null>(null);

	// Gacha contract data
	const { data: spinFee } = useReadGachaSpinFee({
		address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
	});

	const { data: paused } = useReadGachaPaused({
		address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
	});

	const { data: feeToken } = useReadGachaFeeToken({
		address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
	});

	const { data: isGachaAvailable } = useReadGachaTreasuryIsGachaAvailable({
		address: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
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

	const { data: tokenNonce, refetch: refetchNonce } = useReadTestTokenNonces({
		address: feeToken,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!(feeToken && userAddress) },
	});

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

	// Transaction confirmations
	const {
		isLoading: isSpinWithPermitConfirming,
		isSuccess: isSpinWithPermitSuccess,
		error: spinWithPermitReceiptError,
		data: spinReceiptData,
	} = useWaitForTransactionReceipt({
		hash: spinWithPermitTxHash,
	});

	// Derived state from state machine
	const isProcessingTransaction =
		isSpinWithPermitPending || isSpinWithPermitConfirming;
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
		if (tokenNonce === undefined) return "Loading...";

		return "SPIN NOW";
	};

	const getButtonColor = () => {
		if (!isConnected) return "primary";
		if (paused || !hasSufficientBalance || isGachaAvailable === false)
			return "danger";
		if (gachaSpin.isError) return "warning";
		return "warning";
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
			tokenNonce === undefined
		);
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
			gachaContract: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
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
		if (
			!isConnected ||
			!canSpin ||
			!userAddress ||
			!feeToken ||
			!spinFee ||
			tokenNonce === undefined
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
					no_token_nonce: tokenNonce === undefined,
				},
			});
			return;
		}

		try {
			// Start the spin in the state machine
			gachaSpin.startSpin();

			// Create permit signature
			const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
			setPermitDeadline(deadline);

			console.log("📝 [SpinControls] Requesting permit signature...");
			signTypedData({
				domain: {
					name: tokenName,
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
					spender: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
					value: spinFee,
					nonce: tokenNonce,
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
					address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
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
	]);

	// Handle transaction receipt
	useEffect(() => {
		if (
			isSpinWithPermitSuccess &&
			spinReceiptData &&
			spinWithPermitTxHash &&
			processedTxHash !== spinWithPermitTxHash
		) {
			console.log(
				"📋 [SpinControls] Processing spin transaction receipt:",
				spinWithPermitTxHash,
			);

			// Extract trigger ID from RandomnessRequested event in transaction logs
			let triggerId: bigint | null = null;

			for (const log of spinReceiptData.logs) {
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
				} catch (error) {
					// Skip logs that can't be decoded with our ABI
					continue;
				}
			}

			if (triggerId !== null) {
				console.log(
					"✅ [SpinControls] Found trigger ID in receipt:",
					triggerId,
				);
				gachaSpin.confirmTransaction(triggerId);
				setProcessedTxHash(spinWithPermitTxHash); // Mark as processed
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
	]);

	// Enhanced error handling
	const hasError =
		spinWithPermitError ||
		spinWithPermitReceiptError ||
		signatureError ||
		gachaSpin.isError;

	return (
		<GlassCard
			header={
				<div className="flex justify-between items-center w-full">
					<h2 className={glassTypography({ variant: "mainHeading" })}>
						Gacha Spinner
					</h2>
					<TokenFeeDisplay
						address={feeToken}
						name={tokenName}
						symbol={tokenSymbol}
						amount={formatSpinFee()}
					/>
				</div>
			}
		>
			<div className="py-16">
				<div className="flex flex-col items-center space-y-10">
					{/* Enhanced Spinner Visual with Lottie Animation */}
					<div className="relative group">
						{/* Outer glow rings */}
						<div
							className={`absolute inset-0 w-64 h-64 rounded-full ${
								gachaSpin.isWaitingForFulfillment || gachaSpin.isSpinning
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
							className={`absolute inset-2 w-60 h-60 rounded-full ${
								gachaSpin.isWaitingForFulfillment || gachaSpin.isSpinning
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
								"relative w-64 h-64 rounded-full bg-gradient-to-r from-primary via-warning to-orange-500 p-3 shadow-2xl shadow-warning/20",
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

					{/* Error Display Only */}
					{gachaSpin.isError && (
						<GlassBadge variant="danger" className="text-center p-4">
							<div>
								<p className="text-sm mb-2">{gachaSpin.error}</p>
								<p className="text-xs opacity-60">
									Retry attempts: {gachaSpin.retryCount}/5
								</p>
							</div>
						</GlassBadge>
					)}

					{/* Gacha Unavailable Warning */}
					{isConnected && isGachaAvailable === false && (
						<GlassBadge variant="warning" className="text-center p-4">
							<div>
								<p className="text-sm mb-2">Gacha System Unavailable</p>
								<p className="text-xs opacity-60">
									No whitelisted collections or NFTs available for spinning
								</p>
							</div>
						</GlassBadge>
					)}

					{/* User balance display */}
					{isConnected && (
						<GlassBadge variant="info">
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
						</GlassBadge>
					)}

					{/* Error display for transaction errors */}
					{(spinWithPermitError ||
						spinWithPermitReceiptError ||
						signatureError) && (
						<GlassBadge variant="danger" className="text-center p-4">
							<p className="text-sm">Transaction failed. Please try again.</p>
						</GlassBadge>
					)}

					{/* Spin Button */}
					<GlassButton
						variant={
							getButtonColor() === "primary"
								? "primary"
								: getButtonColor() === "danger"
									? "danger"
									: "secondary"
						}
						size="lg"
						className="px-20 py-5 text-xl tracking-wide"
						isLoading={
							isSignaturePending ||
							isProcessingTransaction ||
							gachaSpin.isSpinning
						}
						loadingText={
							isSignaturePending
								? "Sign Permit..."
								: isProcessingTransaction
									? "Confirming..."
									: gachaSpin.isSpinning
										? "Preparing..."
										: gachaSpin.isWaitingForFulfillment
											? "Awaiting..."
											: "Processing..."
						}
						onClick={onSpinClick}
						isDisabled={isButtonDisabled()}
						animate={true}
					>
						{getButtonText()}
					</GlassButton>
				</div>
			</div>
		</GlassCard>
	);
}
