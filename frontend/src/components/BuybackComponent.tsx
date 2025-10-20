"use client";

import { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useAccount, useReadContract } from "wagmi";
import { Chip } from "@heroui/react";
import { Button } from "../ui/Button";
import {
	useReadProtocolTreasuryRedemptionPayoutBps,
	useReadProtocolTreasuryPaused,
	useReadErc721IsApprovedForAll,
	useReadNftAppraisalGetAppraisedPrice,
	useReadNftAppraisalHasAppraisal
} from "@/generated";
import { formatCurrency } from "@/lib/utils";
import { useBuybackNotificationsContext } from "./BuybackNotificationProvider";
import { getRarityConfig, Rarity } from "@/lib/rarityConfig";
import { useNFTInteraction } from "@/hooks/useNFTInteraction";

interface BuybackComponentProps {
	collection: string;
	tokenId: string;
	appraisalContractAddress: string;
	protocolTreasuryAddress: string;
	gachaTreasuryAddress?: string;
	rarity?: string;
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
	onSuccess,
	onBuybackSuccess,
	size = "md",
	variant = "card",
	showTreasuryRestock = true
}: BuybackComponentProps) {
	const { address: connectedAddress } = useAccount();
	const { showNotification } = useBuybackNotificationsContext();

	// Build interaction params for NFT interaction hook
	const interactionParams = useMemo(() => {
		const params: any = {
			onAction: (_collection: string, tokenId: string, _hasValidAppraisal?: boolean) => {
				showNotification(`🔄 NFT action initiated for ${tokenId}`, "info");
			},
			onAppraisalStatusChange: (_collection: string, tokenId: string, hasValidAppraisal: boolean) => {
				showNotification(
					hasValidAppraisal
						? `✅ NFT ${tokenId} appraisal confirmed`
						: `❌ NFT ${tokenId} appraisal missing`,
					hasValidAppraisal ? "success" : "error"
				);
			},
			refetchTreasuryCards: async () => {
				// Optional: Implement treasury cards refetch if needed
			}
		};

		if (onSuccess) {
			params.onSuccess = onSuccess;
		}

		if (onBuybackSuccess) {
			params.onBuybackSuccess = onBuybackSuccess;
		}

		return params;
	}, [tokenId, onSuccess, onBuybackSuccess, showNotification]);

	// Use the unified NFT interaction hook
	const {
		currentState,
		context,
		error,
		isLoading,
		startInteraction,
		getActionInfo,
		reset,
	} = useNFTInteraction(interactionParams);

	// Enhanced success state data
	const isSuccessState = currentState === "completed" && (context.successData as any)?.mode === "buyback";
	const successTimestamp = context.successData && context.completedAt
		? new Date(context.completedAt).toLocaleString()
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
				outputs: [{ name: "", type: "address" }]
			}
		] as const,
		functionName: "ownerOf",
		args: [BigInt(tokenId)]
	});

	
	const { data: hasAppraisal } = useReadNftAppraisalHasAppraisal({
		address: appraisalContractAddress as `0x${string}`,
		args: [collection as `0x${string}`, BigInt(tokenId)]
	});

	const { data: appraisalPrice } = useReadNftAppraisalGetAppraisedPrice({
		address: appraisalContractAddress as `0x${string}`,
		args: [collection as `0x${string}`, BigInt(tokenId)],
		query: {
			enabled: !!hasAppraisal
		}
	});

	const { data: payoutBps } = useReadProtocolTreasuryRedemptionPayoutBps({
		address: protocolTreasuryAddress as `0x${string}`
	});

	const { data: isPaused } = useReadProtocolTreasuryPaused({
		address: protocolTreasuryAddress as `0x${string}`
	});

	const { data: isApprovedForAll } = useReadErc721IsApprovedForAll({
		address: collection as `0x${string}`,
		args: [connectedAddress as `0x${string}`, protocolTreasuryAddress as `0x${string}`],
		query: {
			enabled: !!connectedAddress,
			refetchOnWindowFocus: false,
			refetchOnMount: true,
			staleTime: 10000,
		}
	});

	// Derived state
	const isOwner = ownerOf && connectedAddress ?
		ownerOf.toLowerCase() === connectedAddress.toLowerCase() : false;
	const hasEnoughLiquidity = !isPaused;
	const needsApproval = !isApprovedForAll;

	// Calculate payout amount
	const payoutAmount = useMemo(() => {
		if (!appraisalPrice || !payoutBps) return BigInt(0);

		// Handle both tuple and single value cases for appraisalPrice
		let priceValue: bigint;
		if (Array.isArray(appraisalPrice)) {
			priceValue = appraisalPrice[0] as unknown as bigint;
		} else {
			priceValue = appraisalPrice as unknown as bigint;
		}

		if (!priceValue) return BigInt(0);

		// Convert USD (18 decimals) to USDC (6 decimals) and apply payout percentage
		const payoutUSD = (priceValue * BigInt(payoutBps)) / BigInt(10000);
		return payoutUSD / BigInt(1000000000000); // Divide by 1e12 to convert 18 decimals to 6 decimals
	}, [appraisalPrice, payoutBps]);

	// Formatted values
	const formattedPayoutAmount = useMemo(
		() => formatCurrency(payoutAmount?.toString() || "0", 6, "USDC"),
		[payoutAmount],
	);

	const shouldShowPayout = Boolean(hasAppraisal);
	const actionInfo = getActionInfo();
	const defaultActionLabel = currentState === "idle"
		? (needsApproval ? "Approve NFT" : "Accept Buyback")
		: null;

	// Determine button label based on current state
	const getButtonLabel = () => {
		if (currentState === "idle") {
			return needsApproval ? "Approve NFT" : "Accept Buyback";
		}
		if (actionInfo.label) {
			return actionInfo.label;
		}
		return "Accept Buyback";
	};

	// Handle starting the buyback interaction
	const handleStartBuyback = useCallback(async () => {
		const priceValue = Array.isArray(appraisalPrice)
			? appraisalPrice[0] as unknown as bigint
			: appraisalPrice as unknown as bigint;

		const interactionConfig: {
			treasuryAddress: string;
			protocolTreasuryAddress?: string;
			hasAppraisal?: boolean;
			appraisalPrice?: bigint;
			payoutAmount?: bigint;
		} = {
			treasuryAddress: protocolTreasuryAddress,
		};

		if (protocolTreasuryAddress) {
			interactionConfig.protocolTreasuryAddress = protocolTreasuryAddress;
		}
		if (hasAppraisal !== undefined) {
			interactionConfig.hasAppraisal = hasAppraisal;
		}
		if (priceValue) {
			interactionConfig.appraisalPrice = priceValue;
		}
		if (payoutAmount) {
			interactionConfig.payoutAmount = payoutAmount;
		}

		try {
			await startInteraction(collection, tokenId, "buyback", interactionConfig);
		} catch (error) {
			console.error("Buyback interaction failed:", error);
		}
	}, [collection, tokenId, protocolTreasuryAddress, hasAppraisal, appraisalPrice, payoutAmount, startInteraction]);

	// Handle button clicks and state machine actions
	const handleAction = useCallback(async () => {
		if (currentState === "idle") {
			await handleStartBuyback();
			return;
		}
	}, [currentState, handleStartBuyback]);

	// Treasury status helper
	const getTreasuryStatus = () => {
		if (isPaused) {
			return {
				type: "error" as const,
				message: "Redemption is currently paused by the protocol",
				action: "Please check back later"
			};
		}

		if (!hasEnoughLiquidity) {
			return {
				type: "warning" as const,
				message: "Redemption is currently unavailable",
				action: "Please try again later"
			};
		}

		return {
			type: "success" as const,
			message: "Protocol treasury is operating normally",
			action: "You can redeem your NFT instantly"
		};
	};

	const treasuryStatus = getTreasuryStatus();

	// Early return if user doesn't own the NFT
	if (!isOwner && connectedAddress) {
		return null;
	}

	// Size configurations
	const sizeClasses = {
		sm: { button: "", chip: "text-xs", text: "text-xs" },
		md: { button: "", chip: "text-sm", text: "text-sm" },
		lg: { button: "", chip: "text-base", text: "text-base" }
	};

	const classes = sizeClasses[size];

	// Full variant - comprehensive buyback interface
	if (variant === "full") {
		const resultRarity = rarity ? Rarity[rarity as keyof typeof Rarity] || Rarity.Common : Rarity.Common;
		const rarityConfig = getRarityConfig(resultRarity);

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-4"
			>
				{/* Header */}
				<div className="flex items-center justify-between">
					<h3 className={`text-white font-bold ${classes.text}`}>
						Instant Sell Back
					</h3>
					<Chip
						color={treasuryStatus.type === "error" ? "danger" : treasuryStatus.type === "warning" ? "warning" : "success"}
						variant="flat"
						size="sm"
						className={classes.chip}
					>
						{treasuryStatus.type === "error" ? "Paused" : treasuryStatus.type === "warning" ? "Unavailable" : "Available"}
					</Chip>
				</div>

	{isSuccessState ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="text-center space-y-4"
					>
						<div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
							<svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<div>
							<h4 className="text-white font-bold text-lg mb-2">Buyback Successful!</h4>
							<p className="text-emerald-300 font-semibold text-xl mb-2">
								You received {formatCurrency((context.successData as any)?.payoutAmount?.toString() || payoutAmount?.toString() || "0", 6, "USDC")}
							</p>
							{successTimestamp && (
								<p className="text-white/60 text-xs mb-2">
									Completed: {successTimestamp}
								</p>
							)}
							{showTreasuryRestock && (
								<p className="text-white/70 text-sm">
									Your NFT has been restocked in the treasury for other players to win
								</p>
							)}
						</div>
						{(context.successData as any)?.txHash && (
							<div className="flex flex-col gap-2">
								<Button
									size="sm"
									color="glass"
									onPress={() => window.open(`https://etherscan.io/tx/${(context.successData as any)?.txHash}`, "_blank")}
									className="bg-white/10 hover:bg-white/20"
								>
									View Transaction
								</Button>
								<Button
									size="sm"
									color="glass"
									onPress={() => {
										// Reset the state machine to allow new interactions
										reset();
									}}
									className="bg-white/10 hover:bg-white/20"
								>
									Start New Transaction
								</Button>
							</div>
						)}
					</motion.div>
				) : (
					<>
						{/* Appraisal and Payout Information */}
						{hasAppraisal && appraisalPrice ? (
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-white/70">Appraised Value:</span>
									<span className="text-white font-medium">
										{formatCurrency(
											(Array.isArray(appraisalPrice) ? appraisalPrice[0] : appraisalPrice)?.toString() || "0",
											18,
											"USD"
										)}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-white/70">Instant Payout:</span>
									<span className={`font-bold text-lg ${rarityConfig.textColor}`}>
										{formatCurrency(payoutAmount?.toString() || "0", 6, "USDC")}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-white/70">Payout Rate:</span>
									<span className="text-white/80">{Number(payoutBps || 0) / 100}%</span>
								</div>
							</div>
						) : (
							<div className="text-warning-300 text-sm bg-warning-500/10 rounded-lg p-3">
								⚠️ NFT must be appraised before instant sell back is available
							</div>
						)}

						{/* Status Messages */}
						{treasuryStatus.type !== "success" && (
							<div className={`rounded-lg p-3 ${treasuryStatus.type === "error" ? "bg-danger-500/10 text-danger-300" :
									treasuryStatus.type === "warning" ? "bg-warning-500/10 text-warning-300" :
										"bg-success-500/10 text-success-300"
								}`}>
								<p className="text-sm font-medium mb-1">{treasuryStatus.message}</p>
								<p className="text-xs opacity-80">{treasuryStatus.action}</p>
							</div>
						)}

						{/* Action Button */}
						<Button
							color="primary"
							size={size}
							onPress={handleAction}
							isLoading={isLoading || actionInfo.type === "processing"}
							isDisabled={
								!hasAppraisal ||
								!hasEnoughLiquidity ||
								isPaused ||
								actionInfo.type === "checking"
							}
							className="w-full"
						>
							{getButtonLabel() || `Sell for ${formattedPayoutAmount}`}
						</Button>

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
					</>
				)}
			</motion.div>
		);
	}

	// Card variant - standard card display
	if (variant === "card") {
		return (
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-4 space-y-3"
			>
				<div className="flex items-center justify-between">
					<h3 className="text-white font-semibold">Sell to Treasury</h3>
					{isPaused ? (
						<Chip color="danger" variant="flat" size="sm">Paused</Chip>
					) : !hasEnoughLiquidity ? (
						<Chip color="warning" variant="flat" size="sm">Unavailable</Chip>
					) : (
						<Chip color="success" variant="flat" size="sm">Available</Chip>
					)}
				</div>

				{isSuccessState ? (
					<div className="text-center space-y-2">
						<div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
							<svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<p className="text-emerald-300 font-bold">Sold for {formatCurrency((context.successData as any)?.payoutAmount?.toString() || payoutAmount?.toString() || "0", 6, "USDC")}</p>
						{successTimestamp && (
							<p className="text-white/50 text-xs">Completed: {successTimestamp}</p>
						)}
						{showTreasuryRestock && (
							<p className="text-white/60 text-xs">NFT restocked in treasury</p>
						)}
					</div>
				) : (
					<>
						{hasAppraisal && appraisalPrice ? (
							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<span className="text-white/70 text-sm">You receive:</span>
									<span className="text-emerald-300 font-bold">
										{formatCurrency(payoutAmount?.toString() || "0", 6, "USDC")}
									</span>
								</div>
							</div>
						) : (
							<div className="text-warning-300 text-xs">
								Requires appraisal before selling
							</div>
						)}

						<Button
							color={
								actionInfo.type === "approveNFT" ? "primary" :
								actionInfo.type === "redeem" ? "primary" : "glass"
							}
							size="sm"
							onPress={handleAction}
							isLoading={isLoading || actionInfo.type === "processing"}
							isDisabled={
								!hasAppraisal ||
								!hasEnoughLiquidity ||
								isPaused ||
								actionInfo.type === "checking"
							}
							className="flex-1"
						>
							{actionInfo.label || defaultActionLabel || "Sell NFT"}
						</Button>

						{shouldShowPayout && (
							<p className="text-xs text-white/70 text-center">
								You will receive {formattedPayoutAmount}
							</p>
						)}
					</>
				)}
			</motion.div>
		);
	}

	// Button variant - compact button
	return (
		<div className="flex flex-col items-center space-y-2">
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
			>
				{isSuccessState ? (
					<div className="flex flex-col items-center space-y-2">
						<Chip
							color="success"
							variant="flat"
							size="sm"
							className={classes.chip}
							startContent={
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							}
						>
							Sold for {formatCurrency((context.successData as any)?.payoutAmount?.toString() || payoutAmount?.toString() || "0", 6, "USDC")}
						</Chip>
					</div>
				) : !hasAppraisal ? (
					<Chip color="warning" variant="flat" size="sm" className={classes.chip}>
						Requires appraisal
					</Chip>
				) : isPaused ? (
					<Chip color="danger" variant="flat" size="sm" className={classes.chip}>
						Redemption paused
					</Chip>
				) : !hasEnoughLiquidity ? (
					<Chip color="warning" variant="flat" size="sm" className={classes.chip}>
						Unavailable
					</Chip>
				) : (
					<Button
						color="primary"
						size={size}
						onPress={handleAction}
						isLoading={isLoading || actionInfo.type === "processing"}
						isDisabled={
							!hasAppraisal ||
							!hasEnoughLiquidity ||
							isPaused ||
							actionInfo.type === "checking"
						}
						className={classes.button}
					>
						{getButtonLabel() || `Sell for ${formattedPayoutAmount}`}
					</Button>
				)}
			</motion.div>
			{shouldShowPayout && !isSuccessState && (
				<p className={`${classes.text} text-white/80 text-center`}>
					You will receive {formattedPayoutAmount}
				</p>
			)}
		</div>
	);
}