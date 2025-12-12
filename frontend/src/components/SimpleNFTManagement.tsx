"use client";

import { useCallback, useEffect, useMemo } from "react";
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
import { useNFTVaultStore, type VaultNFT } from "../stores/nftVaultStore";
import { useNFTInteraction } from "../hooks/useNFTInteraction";
import { useNFTWithdrawal } from "../hooks/useNFTWithdrawal";

interface SimpleNFTManagementProps {
	mode: "deposit" | "withdraw";
}

export function SimpleNFTManagement({ mode }: SimpleNFTManagementProps) {
	const { address: userAddress, isConnected } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const {
		walletNFTs,
		depositedNFTs,
		loadingWallet,
		loadingDeposited,
		processing,
		setWalletNFTs,
		setDepositedNFTs,
		setLoadingWallet,
		setLoadingDeposited,
		startProcessing,
		stopProcessing,
		removeWalletNFT,
		removeDepositedNFT,
		addDepositedNFT,
		addWalletNFT,
		setError,
		reset,
		error,
	} = useNFTVaultStore();

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
	const { withdrawNFT } = useNFTWithdrawal(treasuryAddress);

	// Unified interaction hook for deposits
	const interaction = useNFTInteraction({
		onSuccess: () => {
			if (
				interaction.context.collection &&
				interaction.context.tokenId &&
				interaction.context.mode === "deposit"
			) {
				const key = `${interaction.context.collection}:${interaction.context.tokenId}`;
				const existing = walletNFTs.find(
					(nft) =>
						nft.collection === interaction.context.collection &&
						nft.tokenId === interaction.context.tokenId,
				);

				removeWalletNFT(key);
				addDepositedNFT({
					collection: interaction.context.collection,
					tokenId: interaction.context.tokenId,
					collectionName: existing?.collectionName,
					rarity: existing?.rarity,
					appraisedValue: existing?.appraisedValue,
					canWithdraw: true,
					depositCount: existing?.depositCount,
					isAppraised: true,
				});
				stopProcessing(key);
			}
		},
	});

	// Load NFTs based on mode
	// Load wallet NFTs for deposits
	useEffect(() => {
		if (mode !== "deposit") return;
		if (!isConnected || !userAddress) {
			setWalletNFTs([]);
			setLoadingWallet(false);
			return;
		}

		if (nftsLoading || whitelistedCollectionsQuery.isLoading) {
			setLoadingWallet(true);
			return;
		}

		setLoadingWallet(true);
		try {
			const transformedNFTs: VaultNFT[] = userOwnedNFTs.map((ownedNFT) => ({
				collection: ownedNFT.collection,
				tokenId: ownedNFT.tokenId.toString(),
				collectionName: ownedNFT.collectionName || "",
				isAppraised: true,
				canWithdraw: false,
			}));
			setWalletNFTs(transformedNFTs);
		} catch (err) {
			console.error("Error loading depositable NFTs:", err);
			setWalletNFTs([]);
			setError("Failed to load depositable NFTs");
		} finally {
			setLoadingWallet(false);
		}
	}, [
		mode,
		isConnected,
		userAddress,
		userOwnedNFTs,
		nftsLoading,
		setWalletNFTs,
		setLoadingWallet,
		setError,
		whitelistedCollectionsQuery.isLoading,
	]);

	// Load deposited NFTs for withdrawals
	useEffect(() => {
		if (mode !== "withdraw") return;

		const loadDeposited = async () => {
			if (!isConnected || !userAddress) {
				setDepositedNFTs([]);
				setLoadingDeposited(false);
				return;
			}

			setLoadingDeposited(true);
			try {
				const deposited = await getUserDepositedNFTs();
				const transformedNFTs: VaultNFT[] = deposited.map((nft) => ({
					collection: nft.collection,
					tokenId: nft.tokenId.toString(),
					collectionName: nft.collectionName || "",
					canWithdraw: true,
					depositCount: BigInt(1),
					appraisedValue: nft.appraisedPrice || BigInt(0),
				}));
				setDepositedNFTs(transformedNFTs);
			} catch (err) {
				console.error("Error loading deposited NFTs:", err);
				setDepositedNFTs([]);
				setError("Failed to load deposited NFTs");
			} finally {
				setLoadingDeposited(false);
			}
		};

		void loadDeposited();
	}, [
		mode,
		isConnected,
		userAddress,
		getUserDepositedNFTs,
		setDepositedNFTs,
		setLoadingDeposited,
		setError,
	]);

	// Reset state when switching modes
	useEffect(() => {
		reset();
	}, [mode, reset]);

	const nfts = useMemo<SimpleNFT[]>(() => {
		return mode === "deposit" ? walletNFTs : depositedNFTs;
	}, [walletNFTs, depositedNFTs, mode]);

	const isLoading =
		mode === "deposit"
			? loadingWallet || nftsLoading
			: loadingDeposited || false;

	// Clear processing flags if interaction errors out
	useEffect(() => {
		if (
			interaction.currentState === "error" &&
			interaction.context.collection &&
			interaction.context.tokenId
		) {
			const key = `${interaction.context.collection}:${interaction.context.tokenId}`;
			stopProcessing(key);
		}
	}, [
		interaction.context.collection,
		interaction.context.tokenId,
		interaction.currentState,
		stopProcessing,
	]);

	useEffect(() => {
		if (
			interaction.currentState === "idle" &&
			interaction.context.collection &&
			interaction.context.tokenId
		) {
			const key = `${interaction.context.collection}:${interaction.context.tokenId}`;
			stopProcessing(key);
		}
	}, [
		interaction.context.collection,
		interaction.context.tokenId,
		interaction.currentState,
		stopProcessing,
	]);

	// Handle NFT action
	const handleAction = useCallback(
		async (nft: SimpleNFT) => {
			const key = `${nft.collection}:${nft.tokenId}`;
			if (processing[key]) return;

			startProcessing(key, mode);

			try {
				if (mode === "deposit") {
					if (!contracts.treasury) {
						throw new Error("Missing treasury address");
					}

					interaction.startInteraction(
						nft.collection,
						nft.tokenId,
						"deposit",
						{
							treasuryAddress: contracts.treasury,
							hasAppraisal: true,
						},
					);
				} else {
					await withdrawNFT(
						nft.collection as `0x${string}`,
						BigInt(nft.tokenId),
					);
					removeDepositedNFT(key);
					addWalletNFT({
						collection: nft.collection,
						tokenId: nft.tokenId,
						collectionName: nft.collectionName,
						rarity: nft.rarity,
						appraisedValue: nft.appraisedValue,
						isAppraised: true,
					});
					stopProcessing(key);
				}
			} catch (err) {
				console.error(`${mode} action failed:`, err);
				setError(
					err instanceof Error
						? err.message
						: `Unable to ${mode === "deposit" ? "deposit" : "withdraw"} NFT`,
				);
				stopProcessing(key);
			}
		},
		[
			processing,
			mode,
			startProcessing,
			treasuryAddress,
			interaction,
			withdrawNFT,
			removeDepositedNFT,
			addWalletNFT,
			setError,
			stopProcessing,
		],
	);

	// Loading state
	if (isLoading) {
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
	if (nftsError || error) {
		return (
			<Card className="text-center p-12 bg-danger/10 backdrop-blur-xl border border-danger/20 rounded-2xl">
				<h3 className="text-xl font-semibold mb-2 text-danger">
					Error Loading NFTs
				</h3>
				<p className="text-foreground/60 mb-4">{nftsError || error}</p>
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
			<div className="flex flex-col gap-2 text-center">
				<h2 className="text-2xl font-semibold text-foreground">
					{mode === "deposit" ? "Deposit to Vault" : "Withdraw from Vault"}
				</h2>
				<p className="text-foreground/60 text-sm">
					{mode === "deposit"
						? "Select an NFT from your wallet to deposit into the vault."
						: "Select an NFT from your vault to withdraw back to your wallet."}
				</p>
				<div className="text-foreground/70 text-sm">
					{nfts.length} NFT{nfts.length !== 1 ? "s" : ""}{" "}
					{mode === "deposit" ? "in wallet" : "in vault"}
				</div>
			</div>

			{/* NFT Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{nfts.map((nft) => (
					<NFTActionCard
						key={`${nft.collection}:${nft.tokenId}`}
						nft={nft}
						mode={mode}
						onAction={handleAction}
						isProcessing={
							!!processing[`${nft.collection}:${nft.tokenId}`] ||
							(interaction.context.collection === nft.collection &&
								interaction.context.tokenId === nft.tokenId &&
								interaction.currentState !== "idle" &&
								interaction.currentState !== "completed" &&
								interaction.currentState !== "error")
						}
					/>
				))}
			</div>
		</motion.div>
	);
}
