"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import {
	useReadErc721IsApprovedForAll,
	useReadNftAppraisalGetAppraisedPrice,
	useReadNftAppraisalHasAppraisal,
	useReadProtocolTreasuryPaused,
	useReadProtocolTreasuryRedemptionPayoutBps,
} from "@/generated";
import {
	type UseNFTInteractionParams,
	useNFTInteraction,
} from "@/hooks/useNFTInteraction";
import { logger } from "@/lib/logger";
import { useRedemptionWindow } from "@/hooks/useRedemptionWindow";
import { getRarityConfig } from "@/lib/rarityConfig";
import { formatCurrency } from "@/lib/utils";
import { useBuybackActions } from "../../hooks/useBuybackActions";
import { RedemptionCountdown } from "./RedemptionCountdown";
import { BuybackSuccessView } from "./BuybackSuccessView";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Chip } from "../../ui/Chip";
import { useBuybackNotificationsContext } from "./BuybackNotificationProvider";

interface BuybackComponentProps {
	collection: string;
	tokenId: string;
	appraisalContractAddress: string;
	protocolTreasuryAddress: string;
	gachaTreasuryAddress?: string | undefined;
	rarity?: string;
	historicalAppraisedPrice?: bigint | undefined; // Historical price from spin history
	uniqueId?: string; // Unique identifier (e.g., triggerId) to distinguish duplicates
	onSuccess?: (txHash: string) => void;
	onBuybackSuccess?: (txHash: string, payoutAmount: bigint) => void;
	size?: "sm" | "md" | "lg";
	variant?: "button" | "card" | "full";
	showTreasuryRestock?: boolean;
}

export default function BuybackComponent({
	collection,
	tokenId,
	appraisalContractAddress,
	protocolTreasuryAddress,
	gachaTreasuryAddress,
	rarity,
	historicalAppraisedPrice,
	uniqueId,
	onSuccess,
	onBuybackSuccess,
	size = "md",
	variant = "card",
	showTreasuryRestock = true,
}: BuybackComponentProps) {
	const { address: connectedAddress } = useAccount();
	const { showNotification } = useBuybackNotificationsContext();

	// Build stable callbacks first to avoid recreating on every render
	const handleInteractionAction = useCallback(
		(_collection: string, _tokenId: string, _hasValidAppraisal?: boolean) => {
			showNotification(`🔄 NFT action initiated for ${tokenId}`, "info");
		},
		[tokenId, showNotification],
	);

	const handleAppraisalStatusChange = useCallback(
		(_collection: string, _tokenId: string, hasValidAppraisal: boolean) => {
			showNotification(
				hasValidAppraisal
					? `✅ NFT ${tokenId} appraisal confirmed`
					: `❌ NFT ${tokenId} appraisal missing`,
				hasValidAppraisal ? "success" : "error",
			);
		},
		[tokenId, showNotification],
	);

	// Build interaction params for NFT interaction hook with stable callbacks
	const interactionParams = useMemo<UseNFTInteractionParams>(
		() => ({
			collection,
			tokenId,
			mode: "buyback" as const,
			uniqueId,
			onAction: handleInteractionAction,
			onAppraisalStatusChange: handleAppraisalStatusChange,
			onSuccess,
			onBuybackSuccess,
		}),
		[
			collection,
			tokenId,
			uniqueId,
			onSuccess,
			onBuybackSuccess,
			handleInteractionAction,
			handleAppraisalStatusChange,
		],
	);

	// Use the unified NFT interaction hook
	const {
		status,
		error,
		isLoading,
		isCompleted,
		successData: hookSuccessData,
		startInteraction,
		getActionInfo,
		reset,
	} = useNFTInteraction(interactionParams);

	// Enhanced success state data
	type SuccessData = {
		mode: string;
		completedAt: number;
		payoutAmount?: bigint;
		txHash: string;
		collection?: string | null;
		tokenId?: string | null;
	};

	const successData = hookSuccessData as SuccessData | null;
	const isSuccessState =
		isCompleted &&
		successData?.mode === "buyback" &&
		!!successData.txHash &&
		successData.collection === collection &&
		successData.tokenId === tokenId;
	const isCompletedOtherNFT = status === "completed" && !isSuccessState;

	// If we previously completed a different NFT, reset to avoid showing stale "Completed" state
	useEffect(() => {
		if (isCompletedOtherNFT) {
			reset();
		}
	}, [isCompletedOtherNFT, reset]);
	const successTimestamp =
		successData?.completedAt != null
			? new Date(successData.completedAt).toLocaleString()
			: null;

	// Contract data hooks
	const { data: ownerOf } = useReadContract({
		address: collection as `0x${string}`,
		abi: [
			{
				name: "ownerOf",
				type: "function",
				stateMutability: "view",
				inputs: [{ name: "tokenId", type: "uint256" }],
				outputs: [{ name: "", type: "address" }],
			},
		] as const,
		functionName: "ownerOf",
		args: [BigInt(tokenId)],
	});

	const { data: hasAppraisal } = useReadNftAppraisalHasAppraisal({
		address: appraisalContractAddress as `0x${string}`,
		args: [collection as `0x${string}`, BigInt(tokenId)],
	});

	const { data: appraisalPrice } = useReadNftAppraisalGetAppraisedPrice({
		address: appraisalContractAddress as `0x${string}`,
		args: [collection as `0x${string}`, BigInt(tokenId)],
		query: {
			enabled: true, // Always fetch to get current appraisal price
			refetchOnMount: true,
		},
	});

	const { data: payoutBps } = useReadProtocolTreasuryRedemptionPayoutBps({
		address: protocolTreasuryAddress as `0x${string}`,
	});

	const { data: isPaused } = useReadProtocolTreasuryPaused({
		address: protocolTreasuryAddress as `0x${string}`,
	});

	const { data: isApprovedForAll } = useReadErc721IsApprovedForAll({
		address: collection as `0x${string}`,
		args: [
			connectedAddress as `0x${string}`,
			protocolTreasuryAddress as `0x${string}`,
		],
		query: {
			enabled: !!connectedAddress,
			refetchOnWindowFocus: false,
			refetchOnMount: true,
			staleTime: 10000,
		},
	});

	// Redemption window countdown
	const redemptionWindow = useRedemptionWindow({
		protocolTreasuryAddress,
		gachaTreasuryAddress,
		collection,
		tokenId,
		enabled: !!connectedAddress,
	});

	// Derived state
	const isOwner =
		ownerOf && connectedAddress
			? ownerOf.toLowerCase() === connectedAddress.toLowerCase()
			: false;
	const hasEnoughLiquidity = !isPaused;
	const needsApproval = !isApprovedForAll;
	const hasAppraisalData = hasAppraisal === true;
	const isNotOwned = !isOwner;

	// Calculate payout amount FIRST (before other derived state that depends on it)
	const payoutAmount = useMemo(() => {
		if (!payoutBps) return null; // Return null instead of 0 to indicate "no payout"

		// Try to use current appraisal price first, fall back to historical price
		let priceValue: bigint | undefined;

		if (appraisalPrice) {
			// Handle both tuple and single value cases for appraisalPrice
			if (Array.isArray(appraisalPrice)) {
				priceValue = appraisalPrice[0] as unknown as bigint;
			} else {
				priceValue = appraisalPrice as unknown as bigint;
			}
		}

		// Fall back to historical appraised price if current appraisal is not available
		if (!priceValue && historicalAppraisedPrice) {
			priceValue = historicalAppraisedPrice;
		}

		if (!priceValue || priceValue === 0n) return null;

		// Convert USD (18 decimals) to USDC (6 decimals) and apply payout percentage
		const payoutUSD = (priceValue * BigInt(payoutBps)) / BigInt(10000);
		const result = payoutUSD / BigInt(1000000000000); // Divide by 1e12 to convert 18 decimals to 6 decimals

		return result === 0n ? null : result;
	}, [appraisalPrice, historicalAppraisedPrice, payoutBps]);

	const hasValidPayout = payoutAmount !== null && payoutAmount > 0n;

	// Formatted values
	const formattedPayoutAmount = useMemo(
		() =>
			payoutAmount ? formatCurrency(payoutAmount.toString(), 6, "USDC") : null,
		[payoutAmount],
	);

	const actionInfo = getActionInfo();
	const isProcessing = isLoading || actionInfo.type === "processing";

	// Don't disable button when waiting for wallet signature - allow user to reject in wallet
	// Also don't disable when there's an error, to allow user to retry
	const isActionDisabled =
		!hasEnoughLiquidity ||
		isPaused ||
		isNotOwned || // Disable if user no longer owns the NFT (already bought back)
		redemptionWindow.isExpired || // Disable if redemption window has expired
		actionInfo.type === "checking" ||
		(isLoading &&
			status !== "awaitingInteractionSignature" &&
			status !== "awaitingNFTApprovalSignature" &&
			!error) ||
		isSuccessState; // Disable if already completed successfully

	const shouldShowPayout = hasAppraisalData;

	// Extract button handlers and label derivation into a dedicated hook
	const { handleInteractionButtonClick, primaryButtonLabel } = useBuybackActions({
		collection,
		tokenId,
		protocolTreasuryAddress,
		hasAppraisal,
		appraisalPrice,
		payoutAmount,
		startInteraction,
		status,
		isSuccessState,
		isCompletedOtherNFT,
		error,
		actionInfo,
		reset,
		redemptionWindowIsExpired: redemptionWindow.isExpired,
		needsApproval,
		isNotOwned,
	});

	// Treasury status helper
	const getTreasuryStatus = () => {
		if (isPaused) {
			return {
				type: "error" as const,
				message: "Redemption is currently paused by the protocol",
				action: "Please check back later",
			};
		}

		if (!hasEnoughLiquidity) {
			return {
				type: "warning" as const,
				message: "Redemption is currently unavailable",
				action: "Please try again later",
			};
		}

		return {
			type: "success" as const,
			message: "Protocol treasury is operating normally",
			action: "You can redeem your NFT instantly",
		};
	};

	const treasuryStatus = getTreasuryStatus();

	// Size configurations
	const sizeClasses = {
		sm: { button: "", chip: "text-xs", text: "text-xs" },
		md: { button: "", chip: "text-sm", text: "text-sm" },
		lg: { button: "", chip: "text-base", text: "text-base" },
	};

	const classes = sizeClasses[size];

	// Return null if conditions aren't met (after all hooks have been called)
	if (!hasValidPayout && !isSuccessState) {
		return null;
	}

	if (!isOwner && connectedAddress) {
		return null;
	}

	// Full variant - comprehensive buyback interface
	if (variant === "full") {
		const resultRarity = rarity ? (Number.parseInt(rarity, 10) || 0) : 0;
		const rarityConfig = getRarityConfig(resultRarity);

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<Card color="glass" className="p-6 space-y-4">
					{/* Header */}
					<div className="flex items-center justify-between">
						<h3 className={`text-white font-bold ${classes.text}`}>
							Instant Sell Back
						</h3>
						<Chip
							color={
								treasuryStatus.type === "error"
									? "danger"
									: treasuryStatus.type === "warning"
										? "warning"
										: "success"
							}
							variant="flat"
							size="sm"
							className={classes.chip}
						>
							{treasuryStatus.type === "error"
								? "Paused"
								: treasuryStatus.type === "warning"
									? "Unavailable"
									: "Available"}
						</Chip>
					</div>

					{isSuccessState ? (
						<BuybackSuccessView
							variant="full"
							successData={successData}
							payoutAmount={payoutAmount}
							successTimestamp={successTimestamp}
							showTreasuryRestock={showTreasuryRestock}
							onReset={reset}
						/>
					) : (
						<>
							{/* Appraisal and Payout Information */}
							{hasAppraisalData && appraisalPrice ? (
								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-white/70">Appraised Value:</span>
										<span className="text-white font-medium">
											{formatCurrency(
												(Array.isArray(appraisalPrice)
													? appraisalPrice[0]
													: appraisalPrice
												)?.toString() || "0",
												18,
												"USD",
											)}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-white/70">Instant Payout:</span>
										<span
											className={`font-bold text-lg ${rarityConfig.textColor}`}
										>
											{formatCurrency(
												payoutAmount?.toString() || "0",
												6,
												"USDC",
											)}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-white/70">Payout Rate:</span>
										<span className="text-white/80">
											{Number(payoutBps || 0) / 100}%
										</span>
									</div>
								</div>
							) : (
								<div className="text-warning-300 text-sm bg-warning-500/10 rounded-lg p-3">
									⚠️ NFT must be appraised before instant sell back is available
								</div>
							)}

							{/* Redemption Countdown */}
							<RedemptionCountdown state={redemptionWindow} variant="full" />

							{/* Status Messages */}
							{treasuryStatus.type !== "success" && (
								<div
									className={`rounded-lg p-3 ${
										treasuryStatus.type === "error"
											? "bg-danger-500/10 text-danger-300"
											: treasuryStatus.type === "warning"
												? "bg-warning-500/10 text-warning-300"
												: "bg-success-500/10 text-success-300"
									}`}
								>
									<p className="text-sm font-medium mb-1">
										{treasuryStatus.message}
									</p>
									<p className="text-xs opacity-80">{treasuryStatus.action}</p>
								</div>
							)}

							{/* Action Button */}
							<div data-buyback-area="true" className="w-full">
								<Button
									data-buyback-area="true"
									onPress={handleInteractionButtonClick}
									disabled={isActionDisabled}
									isLoading={isProcessing}
									size="lg"
									color="glassPrimary"
									className="w-full"
								>
									{primaryButtonLabel}
								</Button>
							</div>

							{shouldShowPayout && (
								<p className={`${classes.text} text-white/80 mt-2 text-center`}>
									Sell for {formattedPayoutAmount}
								</p>
							)}

							{/* Error Display */}
							{error && (
								<div className="text-danger-300 text-sm bg-danger-500/10 rounded-lg p-3">
									❌ {error}
								</div>
							)}

							{/* Wallet Confirmation Message */}
							{status === "awaitingInteractionSignature" && !error && (
								<div className="text-info-300 text-sm bg-info-500/10 rounded-lg p-3">
									💡 Waiting for wallet confirmation... Please check your wallet
									popup. If you missed it, click the button above to retry.
								</div>
							)}
						</>
					)}
				</Card>
			</motion.div>
		);
	}

	// Card variant - standard card display
	if (variant === "card") {
		return (
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<Card color="glass" className="p-4 space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="text-white font-semibold">Sell to Treasury</h3>
						{isPaused ? (
							<Chip color="danger" variant="flat" size="sm">
								Paused
							</Chip>
						) : !hasEnoughLiquidity ? (
							<Chip color="warning" variant="flat" size="sm">
								Unavailable
							</Chip>
						) : (
							<Chip color="success" variant="flat" size="sm">
								Available
							</Chip>
						)}
					</div>

					{isSuccessState ? (
						<BuybackSuccessView
							variant="card"
							successData={successData}
							payoutAmount={payoutAmount}
							successTimestamp={successTimestamp}
							showTreasuryRestock={showTreasuryRestock}
						/>
					) : (
						<>
							{hasAppraisalData && appraisalPrice ? (
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-white/70 text-sm">You receive:</span>
										<span className="text-emerald-300 font-bold">
											{formatCurrency(
												payoutAmount?.toString() || "0",
												6,
												"USDC",
											)}
										</span>
									</div>
								</div>
							) : (
								<div className="text-warning-300 text-xs">
									Requires appraisal before selling
								</div>
							)}

							<RedemptionCountdown state={redemptionWindow} variant="card" />

							<Button
								data-buyback-area="true"
								onPress={handleInteractionButtonClick}
								disabled={isActionDisabled}
								isLoading={isProcessing}
								color="glassPrimary"
								className="flex-1"
							>
								{primaryButtonLabel}
							</Button>

							{shouldShowPayout && (
								<p className="text-xs text-white/70 text-center">
									You will receive {formattedPayoutAmount}
								</p>
							)}
						</>
					)}
				</Card>
			</motion.div>
		);
	}

	// Button variant - compact button
	return (
		<div className="flex flex-col items-center space-y-2">
			<div className="flex flex-col items-center space-y-2">
				{isSuccessState ? (
					<BuybackSuccessView
						variant="button"
						successData={successData}
						payoutAmount={payoutAmount}
						successTimestamp={successTimestamp}
						chipClassName={classes.chip}
					/>
				) : (
					<>
						{isNotOwned ? (
							<Chip
								color="glass"
								variant="flat"
								size="sm"
								className={classes.chip}
							>
								Sold
							</Chip>
						) : hasAppraisal === false ? (
							<Chip
								color="warning"
								variant="flat"
								size="sm"
								className={classes.chip}
							>
								Requires appraisal
							</Chip>
						) : isPaused ? (
							<Chip
								color="danger"
								variant="flat"
								size="sm"
								className={classes.chip}
							>
								Redemption paused
							</Chip>
						) : !hasEnoughLiquidity ? (
							<Chip
								color="warning"
								variant="flat"
								size="sm"
								className={classes.chip}
							>
								Unavailable
							</Chip>
						) : null}
						<RedemptionCountdown state={redemptionWindow} variant="button" />
						<Button
							data-buyback-area="true"
							onPress={handleInteractionButtonClick}
							disabled={isActionDisabled}
							isLoading={isProcessing}
							size="lg"
							color="glassPrimary"
						>
							{primaryButtonLabel}
						</Button>
					</>
				)}

				{shouldShowPayout && !isSuccessState && (
					<p className={`${classes.text} text-white/80 text-center`}>
						You will receive {formattedPayoutAmount}
					</p>
				)}
			</div>
		</div>
	);
}
