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
import { useNFTWithMetadata } from "../hooks/useNFTWithMetadata";
import {
	useWriteGachaTreasuryDepositNft,
	useWriteErc721Approve,
	useReadErc721GetApproved,
	useReadErc721IsApprovedForAll,
	useReadGachaTreasuryGetWhitelistedCollections,
	useReadErc721BalanceOf,
	useReadErc721Name,
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

interface UserNFT {
	collection: string;
	tokenId: string;
	collectionName?: string;
	isAppraised: boolean;
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

interface UserNFTCardProps {
	nft: UserNFT;
	onAction: (collection: string, tokenId: string) => void;
	isProcessing: boolean;
}

const UserNFTCard = ({
	nft,
	onAction,
	isProcessing,
}: UserNFTCardProps) => {
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const nftData = useNFTWithMetadata(nft.collection, nft.tokenId);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="group relative"
		>
			<GlassCard variant="interactive" className="relative h-full">
				<div className="p-6 space-y-4">
					{/* Status Badge */}
					<div className="flex items-center justify-between">
						<div
							className={`inline-flex items-center gap-2 px-3 py-1.5 backdrop-blur-xl border border-white/30 rounded-full ${
								nft.isAppraised 
									? 'bg-gradient-to-r from-green-500 to-green-600' 
									: 'bg-gradient-to-r from-blue-500 to-blue-600'
							}`}
						>
							<span className="text-sm">
								{nft.isAppraised ? '✅' : '🔍'}
							</span>
							<span className="text-sm font-medium text-white">
								{nft.isAppraised ? 'Ready to Deposit' : 'Needs Appraisal'}
							</span>
						</div>

						<SparklesIcon className="w-5 h-5 text-warning" />
					</div>

					{/* NFT Preview */}
					<div className="flex justify-center">
						<div className="w-48 h-48 bg-content1/20 rounded-xl overflow-hidden">
							{nftData.isLoading ? (
								<div className="w-full h-full flex items-center justify-center">
									<div className="w-8 h-8 border-2 border-warning border-t-transparent rounded-full animate-spin" />
								</div>
							) : nftData.imageUrl ? (
								<img
									src={nftData.imageUrl}
									alt={nftData.metadata?.name || `Token #${nft.tokenId}`}
									className="w-full h-full object-cover"
									onError={(e) => {
										e.currentTarget.style.display = "none";
									}}
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<GiftIcon className="w-12 h-12 text-foreground/40" />
								</div>
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
								{nft.collectionName || `${nft.collection.slice(0, 6)}...${nft.collection.slice(-4)}`}
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
						{nftData.metadata?.name && (
							<div>
								<p className="text-xs text-foreground/60 uppercase tracking-wide mb-1">
									Name
								</p>
								<p className="text-sm text-foreground">
									{nftData.metadata.name}
								</p>
							</div>
						)}
					</div>

					{/* Action Button */}
					<div className="pt-2">
						<GlassButton
							variant={nft.isAppraised ? "primary" : "secondary"}
							size="md"
							className="w-full"
							startIcon={nft.isAppraised ? "gift" : "gem"}
							onClick={() => onAction(nft.collection, nft.tokenId)}
							isLoading={isProcessing}
							loadingText={nft.isAppraised ? "Depositing..." : "Redirecting..."}
							animate={true}
						>
							{nft.isAppraised ? 'Deposit to Gacha' : 'Get Appraised'}
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

	const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
	const [loading, setLoading] = useState(true);
	const [processingNFT, setProcessingNFT] = useState<string | null>(null);
	const [showSuccess, setShowSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Get whitelisted collections
	const { data: whitelistedCollections } = useReadGachaTreasuryGetWhitelistedCollections({
		address: contracts.treasury,
		query: { enabled: !!contracts.treasury },
	});

	// Contract interactions
	const { writeContract: approveNFT } = useWriteContract();
	const { writeContract: depositNFT } = useWriteContract();

	// Load user NFTs from whitelisted collections
	const loadUserNFTs = async () => {
		if (!userAddress || !whitelistedCollections) {
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const allUserNFTs: UserNFT[] = [];
			
			// Get appraised NFTs from localStorage
			const storageKey = `nft-appraisals-${userAddress.toLowerCase()}`;
			const stored = localStorage.getItem(storageKey);
			const appraisedNFTs = stored ? JSON.parse(stored) : [];
			
			// For demo purposes, add some mock NFTs for each whitelisted collection
			// In production, you would use the contract calls to get actual user NFTs
			for (const collection of whitelistedCollections) {
				// Add a few mock NFTs per collection for demonstration
				const mockTokenIds = ['1', '42', '123'];
				for (const tokenId of mockTokenIds) {
					const isAppraised = appraisedNFTs.some(
						(appraised: any) => 
							appraised.collection.toLowerCase() === collection.toLowerCase() && 
							appraised.tokenId === tokenId
					);
					
					allUserNFTs.push({
						collection,
						tokenId,
						isAppraised,
					});
				}
			}

			setUserNFTs(allUserNFTs);
		} catch (error) {
			console.error("Failed to load user NFTs:", error);
			setError("Failed to load user NFTs");
			setUserNFTs([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadUserNFTs();
	}, [userAddress, whitelistedCollections]);

	// Handle NFT action (deposit or appraise)
	const handleNFTAction = async (collection: string, tokenId: string) => {
		const nft = userNFTs.find(n => n.collection === collection && n.tokenId === tokenId);
		if (!nft) return;

		const nftKey = `${collection}:${tokenId}`;
		setProcessingNFT(nftKey);

		try {
			if (nft.isAppraised) {
				// Handle deposit
				if (!userAddress || !contracts.treasury) {
					console.error("Wallet not connected or treasury contract not available");
					return;
				}

				// Step 1: Approve NFT
				console.log("Approving NFT for treasury...");
				approveNFT({
					address: collection as `0x${string}`,
					abi: erc721Abi,
					functionName: "approve",
					args: [contracts.treasury, BigInt(tokenId)],
				});

				// Wait for approval transaction
				await new Promise((resolve) => setTimeout(resolve, 3000));

				// Step 2: Deposit NFT to treasury
				console.log("Depositing NFT to treasury...");
				depositNFT({
					address: contracts.treasury,
					abi: gachaTreasuryAbi,
					functionName: "depositNFT",
					args: [collection as `0x${string}`, BigInt(tokenId)],
				});

				// Remove NFT from list after successful deposit
				const updatedNFTs = userNFTs.filter(
					(nft) => !(nft.collection === collection && nft.tokenId === tokenId)
				);
				setUserNFTs(updatedNFTs);

				// Show success message
				setShowSuccess(true);
				setTimeout(() => setShowSuccess(false), 3000);
			} else {
				// Handle appraisal - redirect to appraisal page with pre-populated data
				const appraisalUrl = `/appraisal?collection=${encodeURIComponent(collection)}&tokenId=${encodeURIComponent(tokenId)}`;
				window.location.href = appraisalUrl;
			}
		} catch (error: any) {
			console.error("NFT action failed:", error);
			setError(`Failed to ${nft.isAppraised ? 'deposit' : 'process'} NFT. Please try again.`);
		} finally {
			setProcessingNFT(null);
		}
	};

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
							<GlassButton variant="danger" onClick={loadUserNFTs}>
								Try Again
							</GlassButton>
						</div>
					</div>
				</GlassCard>
			</motion.div>
		);
	}

	if (userNFTs.length === 0) {
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
								No NFTs Found
							</h3>
							<p className="text-foreground/70 mb-4">
								You don't have any NFTs from the whitelisted collections for this gacha, or they haven't been loaded yet.
							</p>
							<GlassButton
								variant="secondary"
								startIcon="refresh"
								onClick={loadUserNFTs}
							>
								Refresh
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
							Your NFTs from Whitelisted Collections
						</span>
					</h2>
					<p className="text-foreground/70 max-w-2xl mx-auto">
						NFTs from collections accepted by this gacha. Get them appraised to deposit them into the treasury.
					</p>
				</div>

				{/* Statistics */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<GlassCard variant="floating" padding="md">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Total NFTs
							</p>
							<p className="text-2xl font-bold text-foreground">
								{userNFTs.length}
							</p>
						</div>
					</GlassCard>

					<GlassCard variant="floating" padding="md">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Ready to Deposit
							</p>
							<p className="text-2xl font-bold text-green-400">
								{userNFTs.filter(nft => nft.isAppraised).length}
							</p>
						</div>
					</GlassCard>

					<GlassCard variant="floating" padding="md">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Need Appraisal
							</p>
							<p className="text-2xl font-bold text-blue-400">
								{userNFTs.filter(nft => !nft.isAppraised).length}
							</p>
						</div>
					</GlassCard>

					<GlassCard variant="floating" padding="md">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Collections
							</p>
							<p className="text-2xl font-bold text-purple-400">
								{new Set(userNFTs.map(nft => nft.collection)).size}
							</p>
						</div>
					</GlassCard>
				</div>

				{/* NFT Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<AnimatePresence>
						{userNFTs.map((nft) => (
							<UserNFTCard
								key={`${nft.collection}:${nft.tokenId}`}
								nft={nft}
								onAction={handleNFTAction}
								isProcessing={
									processingNFT === `${nft.collection}:${nft.tokenId}`
								}
							/>
						))}
					</AnimatePresence>
				</div>

				{/* Info Banner */}
				<GlassCard
					variant="base"
					className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20"
				>
					<div className="flex items-start gap-3 p-4">
						<InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
						<div className="text-sm text-foreground/70">
							<p className="font-medium text-blue-400 mb-1">How it Works</p>
							<p>
								1. Click "Get Appraised" on any NFT to get its value assessed.
								2. Once appraised, return here and click "Deposit to Gacha" to add it to the treasury.
								3. Deposited NFTs contribute to rewards and can be won by other players.
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
