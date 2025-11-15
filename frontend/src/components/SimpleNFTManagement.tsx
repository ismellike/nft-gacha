"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { Card } from "../ui";
import { NFTActionCard, type SimpleNFT } from "./NFTActionCard";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { useUserOwnedNFTsMultipleCollections } from "../hooks/useUserOwnedNFTs";
import { useReadGachaTreasuryGetWhitelistedCollections } from "../generated";
import { useUserDepositedNFTs } from "../hooks/useUserDepositedNFTs";
import { LoadingState } from ".";

interface SimpleNFTManagementProps {
	mode: "deposit" | "withdraw";
}

export function SimpleNFTManagement({ mode }: SimpleNFTManagementProps) {
	const { address: userAddress, isConnected } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const [nfts, setNfts] = useState<SimpleNFT[]>([]);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState<Set<string>>(new Set());

	// Get contract addresses
	const treasuryAddress = contracts.treasury as `0x${string}` | undefined;
	const whitelistedCollectionsQuery =
		useReadGachaTreasuryGetWhitelistedCollections({
			address: treasuryAddress,
		} as Parameters<typeof useReadGachaTreasuryGetWhitelistedCollections>[0]);
	const whitelistedCollections =
		(whitelistedCollectionsQuery.data as `0x${string}`[]) || [];

	// Get NFTs based on mode
	const {
		nfts: userOwnedNFTs,
		isLoading: nftsLoading,
		error: nftsError,
	} = useUserOwnedNFTsMultipleCollections(
		whitelistedCollections ? [...whitelistedCollections] : [],
	);

	const { getUserDepositedNFTs } = useUserDepositedNFTs(treasuryAddress);

	// Load NFTs based on mode
	useEffect(() => {
		const loadNFTs = async () => {
			if (!isConnected || !userAddress) {
				setNfts([]);
				setLoading(false);
				return;
			}

			setLoading(true);
			try {
				if (mode === "deposit") {
					// Load user's wallet NFTs for deposit
					const transformedNFTs: SimpleNFT[] = userOwnedNFTs.map(
						(ownedNFT) => ({
							collection: ownedNFT.collection,
							tokenId: ownedNFT.tokenId.toString(),
							collectionName: ownedNFT.collectionName || "",
							isAppraised: false, // Will be updated by appraisal status check
						}),
					);
					setNfts(transformedNFTs);
				} else {
					// Load deposited NFTs for withdrawal
					const depositedNFTs = await getUserDepositedNFTs();
					const transformedNFTs: SimpleNFT[] = depositedNFTs.map((nft) => ({
						collection: nft.collection,
						tokenId: nft.tokenId.toString(),
						collectionName: nft.collectionName || "",
						canWithdraw: true, // Simplified - assume all can be withdrawn
						depositCount: BigInt(1), // Simplified
						appraisedValue: nft.appraisedPrice || BigInt(0), // Use actual appraised price
					}));
					setNfts(transformedNFTs);
				}
			} catch (error) {
				console.error(`Error loading ${mode} NFTs:`, error);
				setNfts([]);
			} finally {
				setLoading(false);
			}
		};

		loadNFTs();
	}, [mode, isConnected, userAddress, userOwnedNFTs, getUserDepositedNFTs]);

	// Handle NFT action
	const handleAction = async (nft: SimpleNFT) => {
		const key = `${nft.collection}:${nft.tokenId}`;

		// Prevent double actions
		if (processing.has(key)) return;

		setProcessing((prev) => new Set([...prev, key]));

		try {
			if (mode === "deposit") {
				if (nft.isAppraised) {
					// Handle deposit
					console.log("Depositing NFT:", nft);
					// TODO: Implement deposit logic
				} else {
					// Handle appraisal
					console.log("Getting appraisal for NFT:", nft);
					// TODO: Implement appraisal logic
				}
			} else {
				// Handle withdrawal
				console.log("Withdrawing NFT:", nft);
				// TODO: Implement withdrawal logic
			}
		} catch (error) {
			console.error(`${mode} action failed:`, error);
		} finally {
			// Clear processing state after a delay
			setTimeout(() => {
				setProcessing((prev) => {
					const newSet = new Set(prev);
					newSet.delete(key);
					return newSet;
				});
			}, 2000);
		}
	};

	// Loading state
	if (loading || nftsLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="text-center space-y-4">
					<LoadingState size="lg" />
					<p className="text-foreground/60">
						{mode === "deposit"
							? "Loading your NFTs..."
							: "Loading deposited NFTs..."}
					</p>
				</div>
			</div>
		);
	}

	// Not connected state
	if (!isConnected) {
		return (
			<Card className="text-center p-12 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl">
				<h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
				<p className="text-foreground/60">
					Connect your wallet to {mode === "deposit" ? "deposit" : "withdraw"}{" "}
					NFTs.
				</p>
			</Card>
		);
	}

	// Error state
	if (nftsError) {
		return (
			<Card className="text-center p-12 bg-danger/10 backdrop-blur-xl border border-danger/20 rounded-2xl">
				<h3 className="text-xl font-semibold mb-2 text-danger">
					Error Loading NFTs
				</h3>
				<p className="text-foreground/60 mb-4">{nftsError}</p>
				<button
					type="button"
					onClick={() => window.location.reload()}
					className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
				>
					Retry
				</button>
			</Card>
		);
	}

	// Empty state
	if (nfts.length === 0) {
		return (
			<Card className="text-center p-12 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl">
				<h3 className="text-xl font-semibold mb-2">
					{mode === "deposit" ? "No NFTs Found" : "No Deposited NFTs"}
				</h3>
				<p className="text-foreground/60">
					{mode === "deposit"
						? "You don't have any NFTs from whitelisted collections."
						: "You haven't deposited any NFTs yet."}
				</p>
			</Card>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="space-y-8"
		>
			{/* Header */}
			<div className="text-center space-y-2">
				<h2 className="text-3xl font-bold">
					{mode === "deposit" ? "Deposit NFTs" : "Withdraw NFTs"}
				</h2>
				<p className="text-foreground/70">
					{nfts.length} NFT{nfts.length !== 1 ? "s" : ""}{" "}
					{mode === "deposit" ? "in wallet" : "available"}
				</p>
			</div>

			{/* NFT Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{nfts.map((nft) => (
					<NFTActionCard
						key={`${nft.collection}:${nft.tokenId}`}
						nft={nft}
						mode={mode}
						onAction={handleAction}
						isProcessing={processing.has(`${nft.collection}:${nft.tokenId}`)}
					/>
				))}
			</div>
		</motion.div>
	);
}
