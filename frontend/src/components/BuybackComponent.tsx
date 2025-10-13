"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAccount, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { toast } from "react-hot-toast";
import { Button, Chip, Progress } from "@heroui/react";
import {
	useWriteBuybackVaultExecuteBuyback,
	useReadBuybackVaultAvailableLiquidity,
	useReadBuybackVaultBuybackPayoutBps,
	useReadBuybackVaultAsset,
	useReadBuybackVaultPaused,
	useReadErc20Allowance,
	useWriteErc20Approve,
	useReadNftAppraisalGetAppraisedPrice,
	useReadNftAppraisalHasAppraisal
} from "@/generated";
import { formatCurrency } from "@/lib/utils";
import { useNFTMetadata } from "@/hooks/useNFTMetadata";
import { useBuybackNotificationsContext } from "./BuybackNotificationProvider";
import { getRarityConfig, Rarity } from "@/lib/rarityConfig";

interface BuybackComponentProps {
	collection: string;
	tokenId: string;
	appraisalContractAddress: string;
	buybackVaultAddress: string;
	rarity?: string;
	onSuccess?: (txHash: string) => void;
	size?: "sm" | "md" | "lg";
	variant?: "button" | "card" | "full";
	showTreasuryRestock?: boolean;
}

interface BuybackState {
	status: "idle" | "approving" | "selling" | "success" | "error";
	error?: string;
	txHash?: string;
	payout?: string;
	treasuryRestocked?: boolean;
}

export default function BuybackComponent({
	collection,
	tokenId,
	appraisalContractAddress,
	buybackVaultAddress,
	rarity,
	onSuccess,
	size = "md",
	variant = "card",
	showTreasuryRestock = true
}: BuybackComponentProps) {
	const { address: connectedAddress } = useAccount();
	const [buybackState, setBuybackState] = useState<BuybackState>({ status: "idle" });

	// Check if user owns this NFT
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

	// Get NFT metadata for display (not currently used but available for future enhancements)
	const nftData = useNFTMetadata(collection, tokenId, {
		enabled: true,
		skipFetch: false
	});

	// Get appraisal data
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

	// Get buyback vault data
	const { data: availableLiquidity } = useReadBuybackVaultAvailableLiquidity({
		address: buybackVaultAddress as `0x${string}`
	});

	const { data: payoutBps } = useReadBuybackVaultBuybackPayoutBps({
		address: buybackVaultAddress as `0x${string}`
	});

	const { data: usdcAddress } = useReadBuybackVaultAsset({
		address: buybackVaultAddress as `0x${string}`
	});

	const { data: isPaused } = useReadBuybackVaultPaused({
		address: buybackVaultAddress as `0x${string}`
	});

	// Calculate payout amount
	const payoutAmount = useMemo(() => {
		if (!appraisalPrice || !payoutBps) return 0n;
		const priceUSD = Array.isArray(appraisalPrice) ? appraisalPrice[0] : appraisalPrice;
		if (!priceUSD) return 0n;
		// Ensure priceUSD is a bigint
		const priceBigInt = typeof priceUSD === 'bigint' ? priceUSD : BigInt(priceUSD);
		// Convert USD (18 decimals) to USDC (6 decimals) and apply payout percentage
		const payoutUSD = (priceBigInt * BigInt(payoutBps)) / 10000n;
		return payoutUSD / 1000000000000n; // Divide by 1e12 to convert 18 decimals to 6 decimals
	}, [appraisalPrice, payoutBps]);

	// Check USDC allowance
	const { data: usdcAllowance } = useReadErc20Allowance({
		address: usdcAddress as `0x${string}`,
		args: [connectedAddress as `0x${string}`, buybackVaultAddress as `0x${string}`],
		query: {
			enabled: !!connectedAddress && !!usdcAddress
		}
	});

	// Check if vault has enough liquidity
	const hasEnoughLiquidity = availableLiquidity && payoutAmount ? availableLiquidity >= payoutAmount : false;

	// Check if user owns the NFT
	const isOwner = ownerOf && connectedAddress ? ownerOf.toLowerCase() === connectedAddress.toLowerCase() : false;

	// Calculate liquidity health
	const liquidityHealth = useMemo(() => {
		if (!availableLiquidity || !payoutAmount) return 100;
		const health = (Number(availableLiquidity) / Number(payoutAmount)) * 100;
		return Math.min(health, 100);
	}, [availableLiquidity, payoutAmount]);

	// Get notification context
	const { showNotification } = useBuybackNotificationsContext();

	// Write contracts
	const { writeContractAsync: approveUSDC } = useWriteErc20Approve();
	const { writeContractAsync: executeBuyback } = useWriteBuybackVaultExecuteBuyback();

	// Wait for transaction receipt
	const { isLoading: isConfirming } = useWaitForTransactionReceipt({
		hash: buybackState.txHash as `0x${string}`,
		query: {
			enabled: !!buybackState.txHash
		}
	});

	// Handle USDC approval
	const handleApprove = async () => {
		if (!usdcAddress || !buybackVaultAddress) {
			const error = "USDC or BuybackVault address not found";
			toast.error(error);
			setBuybackState({ status: "error", error });
			return;
		}

		setBuybackState({ status: "approving" });
		try {
			const approveAmount = payoutAmount * 2n; // Approve extra for buffer
			const txHash = await approveUSDC({
				address: usdcAddress as `0x${string}`,
				args: [buybackVaultAddress as `0x${string}`, approveAmount]
			});

			toast.success("USDC approved for buyback");
			showNotification("✅ USDC approval granted. You can now sell your NFT!", "success");
			setBuybackState({ status: "idle" });
		} catch (error) {
			console.error("Approval error:", error);
			const errorMsg = "Failed to approve USDC";
			toast.error(errorMsg);
			showNotification("❌ USDC approval failed. Please try again.", "error");
			setBuybackState({ status: "error", error: errorMsg });
		}
	};

	// Handle buyback execution
	const handleSell = async () => {
		if (!connectedAddress) {
			const error = "Please connect your wallet";
			toast.error(error);
			setBuybackState({ status: "error", error });
			return;
		}

		if (!isOwner) {
			const error = "You don't own this NFT";
			toast.error(error);
			setBuybackState({ status: "error", error });
			return;
		}

		if (!hasAppraisal) {
			const error = "NFT must be appraised before selling";
			toast.error(error);
			setBuybackState({ status: "error", error });
			return;
		}

		if (!hasEnoughLiquidity) {
			const error = "Insufficient liquidity in buyback vault";
			toast.error(error);
			setBuybackState({ status: "error", error });
			return;
		}

		if (isPaused) {
			const error = "Buyback is currently paused";
			toast.error(error);
			setBuybackState({ status: "error", error });
			return;
		}

		setBuybackState({ status: "selling" });
		try {
			const txHash = await executeBuyback({
				address: buybackVaultAddress as `0x${string}`,
				args: [collection as `0x${string}`, BigInt(tokenId), connectedAddress]
			});

			const payoutFormatted = formatCurrency(payoutAmount.toString(), 6, "USDC");

			setBuybackState({
				status: "success",
				txHash,
				payout: payoutFormatted,
				treasuryRestocked: true
			});

			toast.success(`NFT sold for ${payoutFormatted}`);
			showNotification(
				`🎉 NFT successfully sold!\nYou received ${payoutFormatted}\nThe NFT has been restocked in the treasury.`,
				"success"
			);

			onSuccess?.(txHash);
		} catch (error) {
			console.error("Buyback error:", error);
			const errorMsg = "Failed to sell NFT to treasury";
			toast.error(errorMsg);
			showNotification("❌ Sale failed. Please check your approval and try again.", "error");
			setBuybackState({ status: "error", error: errorMsg });
		}
	};

	// Determine if approval is needed
	const needsApproval = usdcAllowance && payoutAmount ? usdcAllowance < payoutAmount : true;

	// Get vault status message
	const getVaultStatusMessage = () => {
		if (isPaused) {
			return {
				type: "error",
				message: "Buyback is currently paused by the protocol",
				action: "Please check back later"
			};
		}

		if (!hasEnoughLiquidity) {
			return {
				type: "warning",
				message: "Insufficient liquidity in buyback vault",
				action: "Liquidity is being restocked periodically"
			};
		}

		if (liquidityHealth < 50) {
			return {
				type: "warning",
				message: "Low liquidity in buyback vault",
				action: "Sell now to guarantee your payout"
			};
		}

		return {
			type: "success",
			message: "Buyback vault is operating normally",
			action: "You can sell your NFT instantly"
		};
	};

	const vaultStatus = getVaultStatusMessage();

	// Size configurations
	const sizeClasses = {
		sm: { button: "text-xs px-3 py-1", chip: "text-xs", text: "text-xs" },
		md: { button: "text-sm px-4 py-2", chip: "text-sm", text: "text-sm" },
		lg: { button: "text-base px-6 py-3", chip: "text-base", text: "text-base" }
	};

	const classes = sizeClasses[size];

	// If user doesn't own the NFT, don't show anything
	if (!isOwner && connectedAddress) {
		return null;
	}

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
						color={vaultStatus.type === "error" ? "danger" : vaultStatus.type === "warning" ? "warning" : "success"}
						variant="flat"
						size="sm"
						className={classes.chip}
					>
						{vaultStatus.type === "error" ? "Paused" : vaultStatus.type === "warning" ? "Low Liquidity" : "Available"}
					</Chip>
				</div>

				{buybackState.status === "success" ? (
					/* Success State */
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
							<h4 className="text-white font-bold text-lg mb-2">Sale Successful!</h4>
							<p className="text-emerald-300 font-semibold text-xl mb-2">
								You received {buybackState.payout}
							</p>
							{showTreasuryRestock && (
								<p className="text-white/70 text-sm">
									Your NFT has been restocked in the treasury for other players to win
								</p>
							)}
						</div>
						{buybackState.txHash && (
							<Button
								variant="flat"
								size="sm"
								onClick={() => window.open(`https://etherscan.io/tx/${buybackState.txHash}`, "_blank")}
								className="bg-white/10 hover:bg-white/20"
							>
								View Transaction
							</Button>
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

						{/* Liquidity Information */}
						<div className="space-y-2">
							<div className="flex justify-between items-center text-sm">
								<span className="text-white/60">Vault Liquidity:</span>
								<span className="text-white/80">
									{formatCurrency(availableLiquidity?.toString() || "0", 6, "USDC")}
								</span>
							</div>
							{liquidityHealth < 100 && (
								<Progress
									value={liquidityHealth}
									color={liquidityHealth > 50 ? "success" : "warning"}
									size="sm"
									className="h-2"
									label="Liquidity Health"
									showValueLabel={false}
								/>
							)}
						</div>

						{/* Status Messages */}
						{vaultStatus.type !== "success" && (
							<div className={`rounded-lg p-3 ${
								vaultStatus.type === "error" ? "bg-danger-500/10 text-danger-300" :
								vaultStatus.type === "warning" ? "bg-warning-500/10 text-warning-300" :
								"bg-success-500/10 text-success-300"
							}`}>
								<p className="text-sm font-medium mb-1">{vaultStatus.message}</p>
								<p className="text-xs opacity-80">{vaultStatus.action}</p>
							</div>
						)}

						{/* Action Buttons */}
						<div className="flex gap-3">
							{needsApproval ? (
								<Button
									color="warning"
									variant="flat"
									size={size}
									onClick={handleApprove}
									isLoading={buybackState.status === "approving"}
									isDisabled={!hasAppraisal || !hasEnoughLiquidity || isPaused}
									className="flex-1"
								>
									{buybackState.status === "approving" ? "Approving..." : "Approve USDC"}
								</Button>
							) : (
								<Button
									color={vaultStatus.type === "error" ? "default" : "success"}
									variant="flat"
									size={size}
									onClick={handleSell}
									isLoading={buybackState.status === "selling" || isConfirming}
									isDisabled={!hasAppraisal || !hasEnoughLiquidity || isPaused}
									className="flex-1"
								>
									{buybackState.status === "selling" ? "Selling..." : `Sell for ${formatCurrency(payoutAmount?.toString() || "0", 6, "USDC")}`}
								</Button>
							)}
						</div>

						{/* Error Display */}
						{buybackState.status === "error" && (
							<div className="text-danger-300 text-sm bg-danger-500/10 rounded-lg p-3">
								❌ {buybackState.error}
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
						<Chip color="warning" variant="flat" size="sm">Low Liquidity</Chip>
					) : (
						<Chip color="success" variant="flat" size="sm">Available</Chip>
					)}
				</div>

				{buybackState.status === "success" ? (
					<div className="text-center space-y-2">
						<div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
							<svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<p className="text-emerald-300 font-bold">Sold for {buybackState.payout}</p>
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

						{!isPaused && !hasEnoughLiquidity && (
							<div className="text-warning-300 text-xs">
								Low liquidity - restocking soon
							</div>
						)}

						{isPaused && (
							<div className="text-danger-300 text-xs">
								Buyback temporarily paused
							</div>
						)}

						<div className="flex gap-2">
							{needsApproval ? (
								<Button
									color="warning"
									variant="flat"
									size="sm"
									onClick={handleApprove}
									isLoading={buybackState.status === "approving"}
									isDisabled={!hasAppraisal || !hasEnoughLiquidity || isPaused}
									className="flex-1"
								>
									{buybackState.status === "approving" ? "Approving..." : "Approve USDC"}
								</Button>
							) : (
								<Button
									color="success"
									variant="flat"
									size="sm"
									onClick={handleSell}
									isLoading={buybackState.status === "selling"}
									isDisabled={!hasAppraisal || !hasEnoughLiquidity || isPaused}
									className="flex-1"
								>
									{buybackState.status === "selling" ? "Selling..." : "Sell NFT"}
								</Button>
							)}
						</div>
					</>
				)}
			</motion.div>
		);
	}

	// Button variant - compact button
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
		>
			{!hasAppraisal ? (
				<Chip color="warning" variant="flat" size="sm" className={classes.chip}>
					Requires appraisal
				</Chip>
			) : isPaused ? (
				<Chip color="danger" variant="flat" size="sm" className={classes.chip}>
					Buyback paused
				</Chip>
			) : !hasEnoughLiquidity ? (
				<Chip color="warning" variant="flat" size="sm" className={classes.chip}>
					Low liquidity
				</Chip>
			) : needsApproval ? (
				<Button
					color="warning"
					variant="flat"
					size={size}
					onClick={handleApprove}
					isLoading={buybackState.status === "approving"}
					className={classes.button}
				>
					{buybackState.status === "approving" ? "Approving..." : "Approve USDC"}
				</Button>
			) : (
				<Button
					color="success"
					variant="flat"
					size={size}
					onClick={handleSell}
					isLoading={buybackState.status === "selling"}
					className={classes.button}
				>
					{buybackState.status === "selling" ? "Selling..." : `Sell for ${formatCurrency(payoutAmount?.toString() || "0", 6, "USDC")}`}
				</Button>
			)}
		</motion.div>
	);
}