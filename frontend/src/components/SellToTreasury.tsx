"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "react-hot-toast";
import { Button, Chip } from "@heroui/react";
import {
	useWriteBuybackVaultExecuteBuyback,
	useReadBuybackVaultAvailableLiquidity,
	useReadBuybackVaultBuybackPayoutBps,
	useReadBuybackVaultAsset,
	useReadErc20Allowance,
	useWriteErc20Approve,
	useReadNftAppraisalGetAppraisedPrice,
	useReadNftAppraisalHasAppraisal
} from "../generated";
import { formatCurrency, formatAddress, formatTokenId } from "../lib/utils";
import { useNFTMetadata } from "../hooks/useNFTMetadata";
import { useBuybackNotificationsContext } from "./BuybackNotificationProvider";

interface SellToTreasuryProps {
	collection: string;
	tokenId: string;
	appraisalContractAddress: string;
	buybackVaultAddress: string;
	onSuccess?: (txHash: string) => void;
	size?: "sm" | "md" | "lg";
	variant?: "button" | "card";
}

export default function SellToTreasury({
	collection,
	tokenId,
	appraisalContractAddress,
	buybackVaultAddress,
	onSuccess,
	size = "md",
	variant = "button"
}: SellToTreasuryProps) {
	const { address: connectedAddress } = useAccount();
	const [isApproving, setIsApproving] = useState(false);
	const [isSelling, setIsSelling] = useState(false);

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

	// Get NFT metadata for display
	const { data: nftMetadata } = useNFTMetadata(collection, tokenId, {
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

	// Calculate payout amount
	const payoutAmount = useMemo(() => {
		if (!appraisalPrice || !payoutBps) return 0n;
		const priceUSD = Array.isArray(appraisalPrice) ? appraisalPrice[0] : appraisalPrice;
		if (!priceUSD) return 0n;
		// Convert USD (18 decimals) to USDC (6 decimals) and apply payout percentage
		const payoutUSD = (priceUSD * BigInt(payoutBps)) / 10000n;
		return payoutUSD / 1000000000000n; // Divide by 1e12 to convert 18 decimals to 6 decimals
	}, [appraisalPrice, payoutBps]);

	// Check USDC allowance
	const { data: usdcAllowance } = useReadErc20Allowance({
		address: usdcAddress as `0x${string}`,
		args: [connectedAddress, buybackVaultAddress as `0x${string}`],
		query: {
			enabled: !!connectedAddress && !!usdcAddress
		}
	});

	// Check if vault has enough liquidity
	const hasEnoughLiquidity = availableLiquidity && payoutAmount ? availableLiquidity >= payoutAmount : false;

	// Check if user owns the NFT
	const isOwner = ownerOf && connectedAddress ? ownerOf.toLowerCase() === connectedAddress.toLowerCase() : false;

	// Get notification context
	const { showNotification } = useBuybackNotificationsContext();

	// Approve USDC spend
	const { writeContractAsync: approveUSDC } = useWriteErc20Approve();
	const { writeContractAsync: executeBuyback } = useWriteBuybackVaultExecuteBuyback();

	// Handle USDC approval
	const handleApprove = async () => {
		if (!usdcAddress || !buybackVaultAddress) {
			toast.error("USDC or BuybackVault address not found");
			return;
		}

		setIsApproving(true);
		try {
			const approveAmount = payoutAmount * 2n; // Approve extra for buffer
			await approveUSDC({
				address: usdcAddress as `0x${string}`,
				args: [buybackVaultAddress as `0x${string}`, approveAmount]
			});

			toast.success("USDC approved for buyback");
			showNotification("✅ USDC approval granted. You can now sell your NFT!", "success");
		} catch (error) {
			console.error("Approval error:", error);
			toast.error("Failed to approve USDC");
			showNotification("❌ USDC approval failed. Please try again.", "error");
		} finally {
			setIsApproving(false);
		}
	};

	// Handle buyback execution
	const handleSell = async () => {
		if (!connectedAddress) {
			toast.error("Please connect your wallet");
			return;
		}

		if (!isOwner) {
			toast.error("You don't own this NFT");
			return;
		}

		if (!hasAppraisal) {
			toast.error("NFT must be appraised before selling");
			return;
		}

		if (!hasEnoughLiquidity) {
			toast.error("Insufficient liquidity in buyback vault");
			return;
		}

		setIsSelling(true);
		try {
			const txHash = await executeBuyback({
				address: buybackVaultAddress as `0x${string}`,
				args: [collection as `0x${string}`, BigInt(tokenId), connectedAddress]
			});

			const payoutFormatted = formatCurrency(payoutAmount.toString(), 6, "USDC");
			toast.success(`NFT sold for ${payoutFormatted}`);
			showNotification(
				`🎉 NFT successfully sold!\nYou received ${payoutFormatted}\nThe NFT has been restocked in the treasury.`,
				"success"
			);
			onSuccess?.(txHash);
		} catch (error) {
			console.error("Buyback error:", error);
			toast.error("Failed to sell NFT to treasury");
			showNotification("❌ Sale failed. Please check your approval and try again.", "error");
		} finally {
			setIsSelling(false);
		}
	};

	// Determine if approval is needed
	const needsApproval = usdcAllowance && payoutAmount ? usdcAllowance < payoutAmount : true;

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

	// Card variant shows more detailed information
	if (variant === "card") {
		return (
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-4 space-y-3"
			>
				<div className="flex items-center justify-between">
					<h3 className="text-white font-semibold">Sell to Treasury</h3>
					<Chip
						color="success"
						variant="flat"
						size="sm"
						className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
					>
						90% of appraisal
					</Chip>
				</div>

				{hasAppraisal && appraisalPrice ? (
					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<span className="text-white/70">Appraisal:</span>
							<span className="text-white font-medium">
								{formatCurrency(
									(Array.isArray(appraisalPrice) ? appraisalPrice[0] : appraisalPrice)?.toString() || "0",
									18,
									"USD"
								)}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-white/70">You receive:</span>
							<span className="text-emerald-300 font-bold text-lg">
								{formatCurrency(payoutAmount?.toString() || "0", 6, "USDC")}
							</span>
						</div>
					</div>
				) : (
					<div className="text-warning-300 text-sm">
						NFT must be appraised before selling
					</div>
				)}

				{availableLiquidity && (
					<div className="flex justify-between items-center text-xs">
						<span className="text-white/60">Vault liquidity:</span>
						<span className="text-white/80">
							{formatCurrency(availableLiquidity.toString(), 6, "USDC")}
						</span>
					</div>
				)}

				<div className="flex gap-2">
					{needsApproval ? (
						<Button
							color="warning"
							variant="flat"
							size="sm"
							onClick={handleApprove}
							isLoading={isApproving}
							isDisabled={!hasAppraisal || !hasEnoughLiquidity}
							className="flex-1"
						>
							{isApproving ? "Approving..." : "Approve USDC"}
						</Button>
					) : (
						<Button
							color="success"
							variant="flat"
							size="sm"
							onClick={handleSell}
							isLoading={isSelling}
							isDisabled={!hasAppraisal || !hasEnoughLiquidity}
							className="flex-1"
						>
							{isSelling ? "Selling..." : "Sell NFT"}
						</Button>
					)}
				</div>
			</motion.div>
		);
	}

	// Button variant - compact sell button
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
		>
			{!hasAppraisal ? (
				<Chip
					color="warning"
					variant="flat"
					size="sm"
					className={classes.chip}
				>
					Requires appraisal
				</Chip>
			) : !hasEnoughLiquidity ? (
				<Chip
					color="danger"
					variant="flat"
					size="sm"
					className={classes.chip}
				>
					Insufficient liquidity
				</Chip>
			) : needsApproval ? (
				<Button
					color="warning"
					variant="flat"
					size={size}
					onClick={handleApprove}
					isLoading={isApproving}
					className={classes.button}
				>
					{isApproving ? "Approving..." : "Approve USDC"}
				</Button>
			) : (
				<Button
					color="success"
					variant="flat"
					size={size}
					onClick={handleSell}
					isLoading={isSelling}
					className={classes.button}
				>
					{isSelling ? "Selling..." : `Sell for ${formatCurrency(payoutAmount?.toString() || "0", 6, "USDC")}`}
				</Button>
			)}
		</motion.div>
	);
}