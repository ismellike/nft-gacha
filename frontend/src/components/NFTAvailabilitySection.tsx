"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { useMachine } from "@xstate/react";
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
import { useUserOwnedNFTsMultipleCollections } from "../hooks/useUserOwnedNFTs";
import {
	useWriteGachaTreasuryDepositNft,
	useWriteErc721Approve,
	useReadErc721GetApproved,
	useReadErc721IsApprovedForAll,
	useReadGachaTreasuryGetWhitelistedCollections,
	useReadErc721BalanceOf,
	useReadErc721Name,
	useReadNftAppraisalGetAppraisal,
	gachaTreasuryAbi,
	erc721Abi,
} from "../generated";
import { RARITY_CONFIG, Rarity, rarityFromNumber } from "../lib/rarityConfig";
import { formatCurrency } from "../lib/utils";
import { nftDepositMachine } from "../machines/nftDepositMachine";

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
	appraisalValue?: bigint;
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
	onAction: (collection: string, tokenId: string, hasValidAppraisal?: boolean) => void;
	onAppraisalStatusChange?: (collection: string, tokenId: string, hasValidAppraisal: boolean) => void;
}

const UserNFTCard = ({
	nft,
	onAction,
	onAppraisalStatusChange,
}: UserNFTCardProps) => {
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const nftData = useNFTWithMetadata(nft.collection, nft.tokenId);

	// XState machine for deposit process
	const [depositState, sendDepositEvent] = useMachine(nftDepositMachine);

	// Contract write hooks
	const { 
		writeContract: approveNFT, 
		isSuccess: isApprovalSuccess,
		isError: isApprovalError,
		error: approvalError 
	} = useWriteContract();
	const { 
		writeContract: depositNFT, 
		isSuccess: isDepositSuccess,
		isError: isDepositError,
		error: depositError 
	} = useWriteContract();

	// Get appraisal data from contract
	const { data: appraisalData } = useReadNftAppraisalGetAppraisal({
		address: contracts.appraisal,
		args: [nft.collection as `0x${string}`, BigInt(nft.tokenId)],
		query: { enabled: !!contracts.appraisal },
	});

	// Extract appraisal info
	// Accept both Completed (1) and OwnerOverride (2) statuses as valid appraisals
	const hasValidAppraisal: boolean = !!(appraisalData && appraisalData.priceUSD > BigInt(0) && (appraisalData.status === 1 || appraisalData.status === 2));
	const appraisalValue = hasValidAppraisal && appraisalData ? appraisalData.priceUSD : BigInt(0);

	// Report appraisal status change to parent component (with ref to prevent loops)
	const lastReportedStatusRef = useRef<boolean | null>(null);
	
	useEffect(() => {
		if (onAppraisalStatusChange && lastReportedStatusRef.current !== hasValidAppraisal) {
			lastReportedStatusRef.current = hasValidAppraisal;
			onAppraisalStatusChange(nft.collection, nft.tokenId, hasValidAppraisal);
		}
	}, [hasValidAppraisal, nft.collection, nft.tokenId, onAppraisalStatusChange]);

	// Handle deposit flow using state machine
	const handleDeposit = useCallback(async () => {
		if (!userAddress || !publicClient || !contracts.treasury) {
			console.error("Missing required parameters for deposit");
			return;
		}

		// Start the deposit process
		sendDepositEvent({
			type: "START_DEPOSIT",
			collection: nft.collection,
			tokenId: nft.tokenId,
			treasuryAddress: contracts.treasury,
			userAddress,
			publicClient,
		});
	}, [userAddress, publicClient, contracts.treasury, nft.collection, nft.tokenId, sendDepositEvent]);

	// Handle approval step
	const handleApproval = useCallback(async () => {
		if (!contracts.treasury) return;

		try {
			approveNFT({
				address: nft.collection as `0x${string}`,
				abi: erc721Abi,
				functionName: "approve",
				args: [contracts.treasury, BigInt(nft.tokenId)],
			});
			// Transaction success/failure will be handled by useEffect
		} catch (error) {
			sendDepositEvent({
				type: "ERROR",
				error: error instanceof Error ? error.message : "Approval failed",
			});
		}
	}, [approveNFT, nft.collection, nft.tokenId, contracts.treasury, sendDepositEvent]);

	// Handle deposit step
	const handleDepositTransaction = useCallback(async () => {
		if (!contracts.treasury) return;

		try {
			depositNFT({
				address: contracts.treasury,
				abi: gachaTreasuryAbi,
				functionName: "depositNFT",
				args: [nft.collection as `0x${string}`, BigInt(nft.tokenId)],
			});
			// Transaction success/failure will be handled by useEffect
		} catch (error) {
			sendDepositEvent({
				type: "ERROR",
				error: error instanceof Error ? error.message : "Deposit failed",
			});
		}
	}, [depositNFT, nft.collection, nft.tokenId, contracts.treasury, sendDepositEvent]);

	// Handle approval transaction results
	useEffect(() => {
		if (isApprovalSuccess && depositState.matches("needsApproval")) {
			sendDepositEvent({
				type: "APPROVAL_CONFIRMED",
				txHash: "approval-confirmed",
			});
		}
	}, [isApprovalSuccess, depositState, sendDepositEvent]);

	useEffect(() => {
		if (isApprovalError && depositState.matches("needsApproval")) {
			sendDepositEvent({
				type: "ERROR",
				error: approvalError?.message || "Approval failed",
			});
		}
	}, [isApprovalError, approvalError, depositState, sendDepositEvent]);

	// Handle deposit transaction results
	useEffect(() => {
		if (isDepositSuccess && (depositState.matches("depositing") || depositState.matches("readyToDeposit"))) {
			sendDepositEvent({
				type: "DEPOSIT_CONFIRMED",
				txHash: "deposit-confirmed",
			});

			// Now remove NFT from list after successful deposit
			if (onAction) {
				onAction(nft.collection, nft.tokenId, true);
			}
		}
	}, [isDepositSuccess, depositState, sendDepositEvent, onAction, nft.collection, nft.tokenId]);

	useEffect(() => {
		if (isDepositError && (depositState.matches("depositing") || depositState.matches("readyToDeposit"))) {
			sendDepositEvent({
				type: "ERROR",
				error: depositError?.message || "Deposit failed",
			});
		}
	}, [isDepositError, depositError, depositState, sendDepositEvent]);

	// Get current state info for UI
	const isDepositInProgress = !depositState.matches("idle") && !depositState.matches("completed");
	const currentDepositState = depositState.value as string;
	const depositStateError = depositState.context.error;

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
								hasValidAppraisal
									? 'bg-gradient-to-r from-green-500 to-green-600' 
									: 'bg-gradient-to-r from-blue-500 to-blue-600'
							}`}
						>
							<span className="text-sm">
								{hasValidAppraisal ? '✅' : '🔍'}
							</span>
							<span className="text-sm font-medium text-white">
								{hasValidAppraisal ? 'Ready to Deposit' : 'Needs Appraisal'}
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
						{hasValidAppraisal && (
							<div>
								<p className="text-xs text-foreground/60 uppercase tracking-wide mb-1">
									Appraised Value
								</p>
								<p className="text-lg font-bold text-warning">
									{formatCurrency(appraisalValue.toString(), 18, "USD")}
								</p>
							</div>
						)}
					</div>

					{/* Action Button */}
					<div className="pt-2">
						{!hasValidAppraisal ? (
							<GlassButton
								variant="secondary"
								size="md"
								className="w-full"
								startIcon="gem"
								onClick={() => onAction(nft.collection, nft.tokenId, hasValidAppraisal)}
								isLoading={false}
								loadingText="Redirecting..."
								animate={true}
							>
								Get Appraised
							</GlassButton>
						) : (
							<div className="space-y-2">
								{/* Main action button based on state */}
								{currentDepositState === "idle" && (
									<GlassButton
										variant="primary"
										size="md"
										className="w-full"
										startIcon="gift"
										onClick={handleDeposit}
										animate={true}
									>
										Deposit to Gacha
									</GlassButton>
								)}

								{currentDepositState === "checkingApproval" && (
									<GlassButton
										variant="primary"
										size="md"
										className="w-full"
										isLoading={true}
										loadingText="Checking approval..."
										animate={true}
									>
										Checking...
									</GlassButton>
								)}

								{currentDepositState === "needsApproval" && (
									<GlassButton
										variant="secondary"
										size="md"
										className="w-full"
										startIcon="shield-check"
										onClick={handleApproval}
										animate={true}
									>
										Approve NFT
									</GlassButton>
								)}

								{currentDepositState === "readyToDeposit" && (
									<GlassButton
										variant="primary"
										size="md"
										className="w-full"
										startIcon="gift"
										onClick={handleDepositTransaction}
										animate={true}
									>
										Deposit to Treasury
									</GlassButton>
								)}

								{currentDepositState === "depositing" && (
									<GlassButton
										variant="primary"
										size="md"
										className="w-full"
										isLoading={true}
										loadingText="Depositing..."
										animate={true}
									>
										Depositing...
									</GlassButton>
								)}

								{currentDepositState === "needsDeposit" && (
									<GlassButton
										variant="secondary"
										size="md"
										className="w-full"
										startIcon="refresh"
										onClick={handleDepositTransaction}
										animate={true}
									>
										Retry Deposit
									</GlassButton>
								)}

								{currentDepositState === "completed" && (
									<GlassButton
										variant="primary"
										size="md"
										className="w-full"
										startIcon="check"
										isDisabled={true}
										animate={true}
									>
										Deposited Successfully
									</GlassButton>
								)}

								{currentDepositState === "error" && (
									<div className="space-y-2">
										<GlassButton
											variant="danger"
											size="md"
											className="w-full"
											startIcon="refresh"
											onClick={() => sendDepositEvent({ type: "RESET" })}
											animate={true}
										>
											Reset & Try Again
										</GlassButton>
										{depositStateError && (
											<p className="text-xs text-danger text-center">
												{depositStateError}
											</p>
										)}
									</div>
								)}
							</div>
						)}
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
	const [showSuccess, setShowSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	
	// Separate NFTs by appraisal status
	const [readyToDepositNFTs, setReadyToDepositNFTs] = useState<UserNFT[]>([]);
	const [needsAppraisalNFTs, setNeedsAppraisalNFTs] = useState<UserNFT[]>([]);

	// Get whitelisted collections
	const { data: whitelistedCollections } = useReadGachaTreasuryGetWhitelistedCollections({
		address: contracts.treasury,
		query: { enabled: !!contracts.treasury },
	});

	// Get user's actual NFTs from all whitelisted collections
	const {
		nfts: userOwnedNFTs,
		isLoading: nftsLoading,
		error: nftsError,
		refetch: refetchNFTs,
	} = useUserOwnedNFTsMultipleCollections(whitelistedCollections ? [...whitelistedCollections] : []);


	// Transform owned NFTs to include appraisal status
	useEffect(() => {
		if (!userAddress) {
			setUserNFTs([]);
			setLoading(false);
			return;
		}

		if (nftsLoading) {
			setLoading(true);
			return;
		}

		if (nftsError) {
			setError(nftsError);
			setLoading(false);
			return;
		}

		// Transform owned NFTs to include appraisal status (will be fetched by individual cards)
		const transformedNFTs: UserNFT[] = userOwnedNFTs.map(ownedNFT => {
			return {
				collection: ownedNFT.collection,
				tokenId: ownedNFT.tokenId.toString(),
				collectionName: ownedNFT.collectionName,
				isAppraised: false, // Will be determined by contract data in UserNFTCard
				appraisalValue: BigInt(0), // Will be fetched by contract data in UserNFTCard
			};
		});

		setUserNFTs(transformedNFTs);
		setLoading(false);
		setError(null);
	}, [userAddress, userOwnedNFTs, nftsLoading, nftsError]);

	// Handle appraisal status updates from child components
	const handleAppraisalStatusChange = useCallback((collection: string, tokenId: string, hasValidAppraisal: boolean) => {
		const nftKey = `${collection}:${tokenId}`;
		
		// Update the lists based on appraisal status
		setReadyToDepositNFTs(prev => {
			const filtered = prev.filter(nft => `${nft.collection}:${nft.tokenId}` !== nftKey);
			if (hasValidAppraisal) {
				const nft = userNFTs.find(n => n.collection === collection && n.tokenId === tokenId);
				if (nft && !filtered.some(n => `${n.collection}:${n.tokenId}` === nftKey)) {
					return [...filtered, nft];
				}
			}
			return filtered;
		});

		setNeedsAppraisalNFTs(prev => {
			const filtered = prev.filter(nft => `${nft.collection}:${nft.tokenId}` !== nftKey);
			if (!hasValidAppraisal) {
				const nft = userNFTs.find(n => n.collection === collection && n.tokenId === tokenId);
				if (nft && !filtered.some(n => `${n.collection}:${n.tokenId}` === nftKey)) {
					return [...filtered, nft];
				}
			}
			return filtered;
		});
	}, [userNFTs]);

	// Initialize NFT lists when userNFTs change
	useEffect(() => {
		// Reset lists and let the child components categorize them
		setReadyToDepositNFTs([]);
		setNeedsAppraisalNFTs([...userNFTs]);
	}, [userNFTs]);

	// Handle NFT action (appraise or removal notification)
	const handleNFTAction = useCallback((collection: string, tokenId: string, hasValidAppraisal?: boolean) => {
		if (hasValidAppraisal) {
			// This is called when deposit is completed - remove NFT from list
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
	}, [userNFTs]);

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
							<GlassButton variant="danger" onClick={refetchNFTs}>
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
								onClick={refetchNFTs}
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
						NFTs from collections accepted by this gacha. Ready NFTs can be deposited immediately.
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
							<p className="text-2xl font-bold text-success">
								{readyToDepositNFTs.length}
							</p>
						</div>
					</GlassCard>

					<GlassCard variant="floating" padding="md">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Needs Appraisal
							</p>
							<p className="text-2xl font-bold text-warning">
								{needsAppraisalNFTs.length}
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

				{/* Ready to Deposit Section */}
				{readyToDepositNFTs.length > 0 && (
					<div className="space-y-6">
						<div className="flex items-center gap-3">
							<div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
							<h3 className="text-xl font-medium text-success">
								Ready to Deposit ({readyToDepositNFTs.length})
							</h3>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<AnimatePresence>
								{readyToDepositNFTs.map((nft) => (
									<UserNFTCard
										key={`ready-${nft.collection}:${nft.tokenId}`}
										nft={nft}
										onAction={handleNFTAction}
										onAppraisalStatusChange={handleAppraisalStatusChange}
									/>
								))}
							</AnimatePresence>
						</div>
					</div>
				)}

				{/* Needs Appraisal Section */}
				{needsAppraisalNFTs.length > 0 && (
					<div className="space-y-6">
						<div className="flex items-center gap-3">
							<div className="w-3 h-3 bg-warning rounded-full animate-pulse"></div>
							<h3 className="text-xl font-medium text-warning">
								Needs Appraisal ({needsAppraisalNFTs.length})
							</h3>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<AnimatePresence>
								{needsAppraisalNFTs.map((nft) => (
									<UserNFTCard
										key={`appraisal-${nft.collection}:${nft.tokenId}`}
										nft={nft}
										onAction={handleNFTAction}
										onAppraisalStatusChange={handleAppraisalStatusChange}
									/>
								))}
							</AnimatePresence>
						</div>
					</div>
				)}

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
								2. Once appraised, click "Deposit to Gacha" to start the 2-step process.
								3. First approve the NFT, then deposit it to the treasury.
								4. Deposited NFTs contribute to rewards and can be won by other players.
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
