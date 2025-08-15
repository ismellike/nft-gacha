"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useWriteContract } from "wagmi";
import {
	GiftIcon,
	MagnifyingGlassIcon,
	CheckBadgeIcon,
	ExclamationTriangleIcon,
	SparklesIcon,
	InformationCircleIcon,
	WalletIcon,
} from "@heroicons/react/24/outline";

import { GlassCard, GlassButton, LoadingState } from "./ui";
import { NFTCard } from "./NFTCard";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import {
	useWriteGachaTreasuryDepositNft,
	useWriteErc721Approve,
	useReadErc721GetApproved,
	useReadErc721IsApprovedForAll,
	gachaTreasuryAbi,
	erc721Abi,
} from "../generated";
import { RARITY_CONFIG, Rarity, rarityFromNumber } from "../lib/rarityConfig";
import { formatCurrency } from "../lib/utils";

interface AppraisedNFT {
	collection: string;
	tokenId: string;
	priceUSD: bigint;
	status: number; // 0: Pending, 1: Completed, 2: OwnerOverride
	requester: string;
	timestamp: bigint;
	lastUpdated: bigint;
}

interface NFTAvailabilitySectionProps {
	className?: string;
}

// Helper function to determine rarity based on appraised value
const determineRarity = (priceUSD: bigint): Rarity => {
	const priceInUSD = Number(priceUSD) / Math.pow(10, 18);

	if (priceInUSD >= 10000) return Rarity.Legendary;
	if (priceInUSD >= 5000) return Rarity.Epic;
	if (priceInUSD >= 1000) return Rarity.Rare;
	if (priceInUSD >= 100) return Rarity.Uncommon;
	return Rarity.Common;
};

interface DepositableNFTCardProps {
	nft: AppraisedNFT;
	onDeposit: (collection: string, tokenId: string) => void;
	isDepositing: boolean;
}

const DepositableNFTCard = ({
	nft,
	onDeposit,
	isDepositing,
}: DepositableNFTCardProps) => {
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const rarity = determineRarity(nft.priceUSD);
	const rarityConfig = RARITY_CONFIG[rarity];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="group relative"
		>
			{/* Rarity glow effect */}
			<div
				className={`absolute -inset-2 bg-gradient-to-r ${rarityConfig.bgGradient} rounded-xl blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
			/>

			<GlassCard variant="interactive" className="relative h-full">
				<div className="p-6 space-y-4">
					{/* Rarity Badge */}
					<div className="flex items-center justify-between">
						<div
							className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${rarityConfig.bgGradient} backdrop-blur-xl border border-white/30 rounded-full`}
						>
							<span className="text-sm">{rarityConfig.emoji}</span>
							<span className="text-sm font-medium text-white">
								{rarityConfig.name}
							</span>
						</div>

						{/* Sparkle icon for visual appeal */}
						<SparklesIcon className={`w-5 h-5 ${rarityConfig.textColor}`} />
					</div>

					{/* NFT Preview */}
					<div className="flex justify-center">
						<div className="w-48 h-48">
							{contracts.appraisal && (
								<NFTCard
									collection={nft.collection}
									tokenId={nft.tokenId}
									variant="compact"
									showAppraisal={false}
									animate={true}
									appraisalContractAddress={contracts.appraisal}
									className="w-full h-full"
								/>
							)}
						</div>
					</div>

					{/* NFT Details */}
					<div className="space-y-3">
						<div>
							<p className="text-xs text-foreground/60 uppercase tracking-wide mb-1">
								Collection
							</p>
							<p className="text-sm font-mono text-foreground break-all">
								{nft.collection.slice(0, 6)}...{nft.collection.slice(-4)}
							</p>
						</div>
						<div>
							<p className="text-xs text-foreground/60 uppercase tracking-wide mb-1">
								Token ID
							</p>
							<p className="text-sm font-bold text-foreground">
								#{nft.tokenId}
							</p>
						</div>
					</div>

					{/* Appraised Value with rarity styling */}
					<div
						className={`bg-gradient-to-r ${rarityConfig.bgGradient} bg-opacity-20 backdrop-blur-xl border border-white/20 rounded-xl p-4`}
					>
						<div className="text-center space-y-2">
							<p className="text-xs text-foreground/60 uppercase tracking-wide">
								Appraised Value
							</p>
							<p
								className={`text-2xl font-bold bg-gradient-to-r ${rarityConfig.bgGradient} bg-clip-text text-transparent`}
							>
								{formatCurrency(nft.priceUSD.toString(), 18, "USD")}
							</p>
							<p className="text-xs text-foreground/60">
								Rarity: {rarityConfig.name} • {rarityConfig.description}
							</p>
						</div>
					</div>

					{/* Deposit Button */}
					<div className="pt-2">
						<GlassButton
							variant="primary"
							size="md"
							className="w-full"
							startIcon="gift"
							onClick={() => onDeposit(nft.collection, nft.tokenId)}
							isLoading={isDepositing}
							loadingText="Depositing..."
							animate={true}
						>
							Deposit to Gacha
						</GlassButton>
					</div>
				</div>
			</GlassCard>
		</motion.div>
	);
};

export function NFTAvailabilitySection({
	className,
}: NFTAvailabilitySectionProps) {
	const { address: userAddress, isConnected } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const [availableNFTs, setAvailableNFTs] = useState<AppraisedNFT[]>([]);
	const [loading, setLoading] = useState(true);
	const [depositingNFT, setDepositingNFT] = useState<string | null>(null);
	const [showSuccess, setShowSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Contract interactions
	const { writeContract: approveNFT, isPending: isApprovingNFT } =
		useWriteContract();
	const { writeContract: depositNFT, isPending: isDepositingNFT } =
		useWriteContract();

	// Load available appraised NFTs from localStorage
	const loadAvailableNFTs = () => {
		if (!userAddress) {
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const storageKey = `nft-appraisals-${userAddress.toLowerCase()}`;
			const stored = localStorage.getItem(storageKey);

			if (stored) {
				const submittedNFTs = JSON.parse(stored);

				// Mock appraised NFTs with completed status and values
				// In production, this would fetch real appraisal data
				const mockAvailableNFTs: AppraisedNFT[] = submittedNFTs.map(
					(nft: any) => ({
						collection: nft.collection,
						tokenId: nft.tokenId,
						priceUSD:
							BigInt(Math.floor(Math.random() * 5000) + 100) *
							BigInt(Math.pow(10, 18)),
						status: 1, // Completed
						requester: userAddress,
						timestamp: BigInt(Math.floor((nft.timestamp || Date.now()) / 1000)),
						lastUpdated: BigInt(Math.floor(Date.now() / 1000)),
					}),
				);

				setAvailableNFTs(mockAvailableNFTs);
			} else {
				setAvailableNFTs([]);
			}
		} catch (error) {
			console.error("Failed to load available NFTs:", error);
			setError("Failed to load available NFTs");
			setAvailableNFTs([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadAvailableNFTs();
	}, [userAddress]);

	// Handle NFT deposit to gacha treasury
	const handleDeposit = async (collection: string, tokenId: string) => {
		if (!userAddress || !contracts.treasury) {
			console.error("Wallet not connected or treasury contract not available");
			return;
		}

		const nftKey = `${collection}:${tokenId}`;
		setDepositingNFT(nftKey);

		try {
			// Step 1: Check if NFT needs approval
			// For demo purposes, assume approval is always needed
			const needsApproval = true;

			if (needsApproval) {
				console.log("Approving NFT for treasury...");
				approveNFT({
					address: collection as `0x${string}`,
					abi: erc721Abi,
					functionName: "approve",
					args: [contracts.treasury, BigInt(tokenId)],
				});

				// Wait for approval transaction
				await new Promise((resolve) => setTimeout(resolve, 3000));
			}

			// Step 2: Deposit NFT to treasury
			console.log("Depositing NFT to treasury...");
			depositNFT({
				address: contracts.treasury,
				abi: gachaTreasuryAbi,
				functionName: "depositNFT",
				args: [collection as `0x${string}`, BigInt(tokenId)],
			});

			// Remove NFT from available list and localStorage after successful deposit
			const updatedNFTs = availableNFTs.filter(
				(nft) => !(nft.collection === collection && nft.tokenId === tokenId),
			);
			setAvailableNFTs(updatedNFTs);

			// Update localStorage
			if (userAddress) {
				const storageKey = `nft-appraisals-${userAddress.toLowerCase()}`;
				const stored = localStorage.getItem(storageKey);
				if (stored) {
					const submittedNFTs = JSON.parse(stored);
					const filteredNFTs = submittedNFTs.filter(
						(nft: any) =>
							!(nft.collection === collection && nft.tokenId === tokenId),
					);
					localStorage.setItem(storageKey, JSON.stringify(filteredNFTs));
				}
			}

			// Show success message
			setShowSuccess(true);
			setTimeout(() => setShowSuccess(false), 3000);
		} catch (error: any) {
			console.error("Deposit failed:", error);
			setError("Failed to deposit NFT. Please try again.");
		} finally {
			setDepositingNFT(null);
		}
	};

	// Group NFTs by rarity for better display
	const nftsByRarity = useMemo(() => {
		const groups: Record<Rarity, AppraisedNFT[]> = {
			[Rarity.Legendary]: [],
			[Rarity.Epic]: [],
			[Rarity.Rare]: [],
			[Rarity.Uncommon]: [],
			[Rarity.Common]: [],
		};

		availableNFTs.forEach((nft) => {
			const rarity = determineRarity(nft.priceUSD);
			groups[rarity].push(nft);
		});

		return groups;
	}, [availableNFTs]);

	if (!isConnected) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className={className}
			>
				<GlassCard variant="base" padding="lg">
					<div className="text-center space-y-4">
						<div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto">
							<WalletIcon className="w-8 h-8 text-warning" />
						</div>
						<div>
							<h3 className="text-2xl font-medium text-foreground mb-2">
								Connect Your Wallet
							</h3>
							<p className="text-foreground/70">
								Connect your wallet to view available NFTs for deposit
							</p>
						</div>
					</div>
				</GlassCard>
			</motion.div>
		);
	}

	if (loading) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className={className}
			>
				<GlassCard variant="base" padding="lg">
					<div className="text-center space-y-4">
						<LoadingState size="lg" />
						<p className="text-foreground/70">Loading available NFTs...</p>
					</div>
				</GlassCard>
			</motion.div>
		);
	}

	if (error) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className={className}
			>
				<GlassCard variant="error" padding="lg">
					<div className="text-center space-y-4">
						<ExclamationTriangleIcon className="w-12 h-12 text-danger mx-auto" />
						<div>
							<h3 className="text-lg font-medium text-danger mb-2">Error</h3>
							<p className="text-foreground/70 mb-4">{error}</p>
							<GlassButton variant="danger" onClick={loadAvailableNFTs}>
								Try Again
							</GlassButton>
						</div>
					</div>
				</GlassCard>
			</motion.div>
		);
	}

	if (availableNFTs.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className={className}
			>
				<GlassCard variant="base" padding="lg">
					<div className="text-center space-y-4">
						<div className="w-16 h-16 bg-gradient-to-br from-content1/20 to-content1/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto">
							<MagnifyingGlassIcon className="w-8 h-8 text-foreground/60" />
						</div>
						<div>
							<h3 className="text-xl font-medium text-foreground mb-2">
								No NFTs Available
							</h3>
							<p className="text-foreground/70 mb-4">
								You don't have any appraised NFTs ready for deposit.
							</p>
							<GlassButton
								variant="secondary"
								startIcon="gem"
								onClick={() => (window.location.href = "/appraisal")}
							>
								Get NFT Appraised
							</GlassButton>
						</div>
					</div>
				</GlassCard>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6 }}
			className={className}
		>
			<div className="space-y-8">
				{/* Header */}
				<div className="text-center space-y-4">
					<h2 className="text-3xl font-light tracking-tight">
						<span className="bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
							Available NFTs for Deposit
						</span>
					</h2>
					<p className="text-foreground/70 max-w-2xl mx-auto">
						Your appraised NFTs ready to be deposited into this gacha
					</p>
				</div>

				{/* Statistics */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<GlassCard variant="floating" padding="md">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Total Available
							</p>
							<p className="text-2xl font-bold text-foreground">
								{availableNFTs.length}
							</p>
						</div>
					</GlassCard>

					<GlassCard variant="floating" padding="md">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Legendary
							</p>
							<p className="text-2xl font-bold text-orange-400">
								{nftsByRarity[Rarity.Legendary].length}
							</p>
						</div>
					</GlassCard>

					<GlassCard variant="floating" padding="md">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Epic
							</p>
							<p className="text-2xl font-bold text-purple-400">
								{nftsByRarity[Rarity.Epic].length}
							</p>
						</div>
					</GlassCard>

					<GlassCard variant="floating" padding="md">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Other
							</p>
							<p className="text-2xl font-bold text-blue-400">
								{nftsByRarity[Rarity.Rare].length +
									nftsByRarity[Rarity.Uncommon].length +
									nftsByRarity[Rarity.Common].length}
							</p>
						</div>
					</GlassCard>
				</div>

				{/* NFT Grid organized by rarity */}
				{Object.entries(nftsByRarity)
					.filter(([_, nfts]) => nfts.length > 0)
					.map(([rarityStr, nfts]) => {
						const rarity = parseInt(rarityStr) as Rarity;
						const rarityConfig = RARITY_CONFIG[rarity];

						return (
							<div key={rarity} className="space-y-4">
								<h3 className="text-xl font-medium text-foreground flex items-center gap-2">
									<span className="text-lg">{rarityConfig.emoji}</span>
									{rarityConfig.name} ({nfts.length})
									<div
										className={`h-px flex-1 bg-gradient-to-r ${rarityConfig.bgGradient} opacity-30`}
									/>
								</h3>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									<AnimatePresence>
										{nfts.map((nft) => (
											<DepositableNFTCard
												key={`${nft.collection}:${nft.tokenId}`}
												nft={nft}
												onDeposit={handleDeposit}
												isDepositing={
													depositingNFT === `${nft.collection}:${nft.tokenId}`
												}
											/>
										))}
									</AnimatePresence>
								</div>
							</div>
						);
					})}

				{/* Info Banner */}
				<GlassCard
					variant="base"
					className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20"
				>
					<div className="flex items-start gap-3 p-4">
						<InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
						<div className="text-sm text-foreground/70">
							<p className="font-medium text-blue-400 mb-1">Rarity System</p>
							<p>
								NFT rarity is determined by appraised value: Legendary ($10K+),
								Epic ($5K+), Rare ($1K+), Uncommon ($100+), Common (under $100).
								Higher rarity NFTs contribute more to gacha rewards.
							</p>
						</div>
					</div>
				</GlassCard>

				{/* Success Toast */}
				<AnimatePresence>
					{showSuccess && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="fixed bottom-8 right-8 z-50 max-w-sm"
						>
							<GlassCard variant="success" className="p-4 border-success/20">
								<div className="flex items-center gap-3">
									<CheckBadgeIcon className="w-6 h-6 text-success flex-shrink-0" />
									<div>
										<h4 className="font-semibold text-success text-sm">
											Success!
										</h4>
										<p className="text-success/80 text-sm">
											NFT has been deposited to the gacha treasury
										</p>
									</div>
								</div>
							</GlassCard>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
}
