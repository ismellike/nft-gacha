"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import {
	MagnifyingGlassIcon,
	CheckBadgeIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
	WalletIcon,
} from "@heroicons/react/24/outline";

import { Card, Button } from "./ui";
import { LoadingState } from "./ui";
import { DepositableNFTCard } from "./ui/DepositableNFTCard";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { useUserOwnedNFTsMultipleCollections } from "../hooks/useUserOwnedNFTs";
import { useReadGachaTreasuryGetWhitelistedCollections } from "../generated";

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
	const treasuryAddress = contracts.treasury as `0x${string}` | undefined;
	const whitelistedCollectionsQuery = useReadGachaTreasuryGetWhitelistedCollections({
		address: treasuryAddress,
	} as any);
	const whitelistedCollections = whitelistedCollectionsQuery.data;

	// Get user's actual NFTs from all whitelisted collections
	const {
		nfts: userOwnedNFTs,
		isLoading: nftsLoading,
		error: nftsError,
		refetch: refetchNFTs,
	} = useUserOwnedNFTsMultipleCollections(
		whitelistedCollections ? [...whitelistedCollections] : [],
	);

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
		const transformedNFTs: UserNFT[] = userOwnedNFTs.map((ownedNFT) => {
			return {
				collection: ownedNFT.collection,
				tokenId: ownedNFT.tokenId.toString(),
				collectionName: ownedNFT.collectionName || "",
				isAppraised: false, // Will be determined by contract data in UserNFTCard
				appraisalValue: BigInt(0), // Will be fetched by contract data in UserNFTCard
			};
		});

		setUserNFTs(transformedNFTs);
		setLoading(false);
		setError(null);
	}, [userAddress, userOwnedNFTs, nftsLoading, nftsError]);

	// Handle appraisal status updates from child components
	const handleAppraisalStatusChange = useCallback(
		(collection: string, tokenId: string, hasValidAppraisal: boolean) => {
			const nftKey = `${collection}:${tokenId}`;

			// Update the lists based on appraisal status
			setReadyToDepositNFTs((prev) => {
				const filtered = prev.filter(
					(nft) => `${nft.collection}:${nft.tokenId}` !== nftKey,
				);
				if (hasValidAppraisal) {
					const nft = userNFTs.find(
						(n) => n.collection === collection && n.tokenId === tokenId,
					);
					if (
						nft &&
						!filtered.some((n) => `${n.collection}:${n.tokenId}` === nftKey)
					) {
						return [...filtered, nft];
					}
				}
				return filtered;
			});

			setNeedsAppraisalNFTs((prev) => {
				const filtered = prev.filter(
					(nft) => `${nft.collection}:${nft.tokenId}` !== nftKey,
				);
				if (!hasValidAppraisal) {
					const nft = userNFTs.find(
						(n) => n.collection === collection && n.tokenId === tokenId,
					);
					if (
						nft &&
						!filtered.some((n) => `${n.collection}:${n.tokenId}` === nftKey)
					) {
						return [...filtered, nft];
					}
				}
				return filtered;
			});
		},
		[userNFTs],
	);

	// Initialize NFT lists when userNFTs change
	useEffect(() => {
		// Reset lists and let the child components categorize them
		setReadyToDepositNFTs([]);
		setNeedsAppraisalNFTs([...userNFTs]);
	}, [userNFTs]);

	// Handle NFT action (appraise or removal notification)
	const handleNFTAction = useCallback(
		(collection: string, tokenId: string, hasValidAppraisal?: boolean) => {
			if (hasValidAppraisal) {
				// This is called when deposit is completed - remove NFT from list
				const updatedNFTs = userNFTs.filter(
					(nft) => !(nft.collection === collection && nft.tokenId === tokenId),
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
		},
		[userNFTs],
	);

	if (!isConnected) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className={className}
			>
				<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
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
				</Card>
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
				<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
					<div className="text-center space-y-4">
						<LoadingState size="lg" />
						<p className="text-foreground/70">Loading available NFTs...</p>
					</div>
				</Card>
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
				<Card className="p-6 bg-danger/10 border border-danger/20 rounded-2xl shadow-lg">
					<div className="text-center space-y-4">
						<ExclamationTriangleIcon className="w-12 h-12 text-danger mx-auto" />
						<div>
							<h3 className="text-lg font-medium text-danger mb-2">Error</h3>
							<p className="text-foreground/70 mb-4">{error}</p>
							<Button
								className="rounded-xl bg-danger/20 border border-danger/30 text-danger hover:bg-danger/30"
								onPress={refetchNFTs}
							>
								Try Again
							</Button>
						</div>
					</div>
				</Card>
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
				<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
					<div className="text-center space-y-4">
						<div className="w-16 h-16 bg-gradient-to-br from-content1/20 to-content1/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto">
							<MagnifyingGlassIcon className="w-8 h-8 text-foreground/60" />
						</div>
						<div>
							<h3 className="text-xl font-medium text-foreground mb-2">
								No NFTs Found
							</h3>
							<p className="text-foreground/70 mb-4">
								You don't have any NFTs from the whitelisted collections for
								this gacha, or they haven't been loaded yet.
							</p>
							<Button
								className="rounded-xl bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"
								onPress={refetchNFTs}
							>
								Refresh
							</Button>
						</div>
					</div>
				</Card>
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
				{/* Statistics */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<Card className="p-4 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Total NFTs
							</p>
							<p className="text-2xl font-bold text-foreground">
								{userNFTs.length}
							</p>
						</div>
					</Card>

					<Card className="p-4 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Ready to Deposit
							</p>
							<p className="text-2xl font-bold text-success">
								{readyToDepositNFTs.length}
							</p>
						</div>
					</Card>

					<Card className="p-4 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Needs Appraisal
							</p>
							<p className="text-2xl font-bold text-warning">
								{needsAppraisalNFTs.length}
							</p>
						</div>
					</Card>

					<Card className="p-4 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Collections
							</p>
							<p className="text-2xl font-bold text-secondary-400">
								{new Set(userNFTs.map((nft) => nft.collection)).size}
							</p>
						</div>
					</Card>
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
									<DepositableNFTCard
										key={`ready-${nft.collection}:${nft.tokenId}`}
										collection={nft.collection}
										tokenId={nft.tokenId}
										appraisalContractAddress={contracts.appraisal || "0x0"}
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
									<DepositableNFTCard
										key={`appraisal-${nft.collection}:${nft.tokenId}`}
										collection={nft.collection}
										tokenId={nft.tokenId}
										appraisalContractAddress={contracts.appraisal || "0x0"}
										onAction={handleNFTAction}
										onAppraisalStatusChange={handleAppraisalStatusChange}
									/>
								))}
							</AnimatePresence>
						</div>
					</div>
				)}

				{/* Info Banner */}
				<Card className="bg-gradient-to-r from-info/10 to-secondary/10 border border-info/20 rounded-2xl shadow-xl">
					<div className="flex items-start gap-3 p-4">
						<InformationCircleIcon className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
						<div className="text-sm text-foreground/70">
							<p className="font-medium text-info mb-1">How it Works</p>
							<p>
								1. Click "Get Appraised" on any NFT to get its value assessed.
								2. Once appraised, click "Deposit to Gacha" to start the 2-step
								process. 3. First approve the NFT, then deposit it to the
								treasury. 4. Deposited NFTs contribute to rewards and can be won
								by other players.
							</p>
						</div>
					</div>
				</Card>

				{/* Success Toast */}
				<AnimatePresence>
					{showSuccess && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="fixed bottom-8 right-8 z-50 max-w-sm"
						>
							<Card className="p-4 bg-success/10 border border-success/20 rounded-xl shadow-lg">
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
							</Card>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
}
