"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { motion } from "framer-motion";
import {
	BanknotesIcon,
	ArrowUpTrayIcon,
	ArrowDownTrayIcon,
	GiftIcon,
	WalletIcon,
	ChartBarIcon,
	TrophyIcon,
	ShieldCheckIcon,
	ArrowPathIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";

import { Button, GlassButton } from "../../ui";
import { GlassCard } from "../../ui/Card";
import { UnifiedNFTCard } from "../UnifiedNFTCard";
import { GachaSectionLayout } from "./GachaSectionLayout";
import {
	useDepositorVaultData,
	formatTokenAmount,
	calculateUserSharePercentage,
	useClaimYield,
	useSimulateClaimYield,
} from "../../hooks/useDepositorVault";
import {
	useTreasuryUserCards,
	type UserCardDeposit,
} from "../../hooks/useTreasuryUserCards";
import { useRarityTracker, type CardAppraisalInfo } from "../../hooks/useRarityTracker";
import { useNFTWithdrawal } from "../../hooks/useNFTWithdrawal";
import { useNFTDeposit } from "../../hooks/useNFTDeposit";
import { useUserOwnedNFTsMultipleCollections } from "../../hooks/useUserOwnedNFTs";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import { getGachaConfig } from "../../lib/gacha-config";
import { useReadGachaTreasuryGetWhitelistedCollections } from "../../generated";
import { toast } from "react-hot-toast";

interface VaultSectionProps {
	title: string;
	description: string;
}

type VaultTab = "deposit" | "withdraw" | "yield";

interface WithdrawableCard extends Omit<UserCardDeposit, 'cardId'> {
	cardId: `0x${string}`;
	appraisalInfo: CardAppraisalInfo | null;
}

export function VaultSection({ title, description }: VaultSectionProps) {
	const { address } = useAccount();
	const publicClient = usePublicClient();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const gachaConfig = getGachaConfig(gachaId);

	// Tab management
	const [activeTab, setActiveTab] = useState<VaultTab>("deposit");

	// Depositor Vault data
	const depositorVaultProps = {
		contractAddress: gachaConfig?.depositorVaultAddress || "",
		...(address && { userAddress: address }),
	};

	const {
		data: depositorData,
		userData: depositorUserData,
		refetch: refetchDepositorVault,
	} = useDepositorVaultData(depositorVaultProps);

	// Claim yield functionality
	const { claimYield, isClaiming } = useClaimYield();
	const { canClaim } = useSimulateClaimYield({
		contractAddress: gachaConfig?.depositorVaultAddress || "",
		account: address || "",
		recipient: address || "",
	});

	// NFT Withdrawal functionality
	const treasury = contracts.treasury as `0x${string}` | undefined;
	const appraisal = contracts.appraisal as `0x${string}` | undefined;
	const rarityTracker = contracts.trackers?.common as `0x${string}` | undefined;
	const { getAllUserCardDeposits } = useTreasuryUserCards(treasury);
	const { getBatchCardInfo } = useRarityTracker(rarityTracker);
	const { withdrawNFT, isPending: isWithdrawing } = useNFTWithdrawal(treasury);

	// Whitelisted collections
	const whitelistedCollectionsQuery = useReadGachaTreasuryGetWhitelistedCollections({
		address: treasury,
		query: { enabled: !!treasury }
	} as Parameters<typeof useReadGachaTreasuryGetWhitelistedCollections>[0]);
	const whitelistedCollections: `0x${string}`[] = (whitelistedCollectionsQuery.data as `0x${string}`[]) || [];

	// Create a map to track which NFTs have appraisals for sorting
	const [appraisedNFTs, setAppraisedNFTs] = useState<Set<string>>(new Set());
	// Store appraisal data with prices to pass to UnifiedNFTCard
	const [appraisalData, setAppraisalData] = useState<Map<string, { hasAppraisal: boolean; priceUSD: bigint }>>(new Map());

	// Track which NFTs are currently being deposited to prevent duplicates
	const [depositingNFTs, setDepositingNFTs] = useState<Set<string>>(new Set());

	// Update appraised NFTs when we get appraisal data
	const updateAppraisedStatus = useCallback((collection: string, tokenId: string, hasAppraisal: boolean, priceUSD?: bigint) => {
		const normalizedTokenId = tokenId.toString();
		const key = `${collection.toLowerCase()}:${normalizedTokenId}`;

		setAppraisedNFTs(prev => {
			const newSet = new Set(prev);
			if (hasAppraisal) {
				newSet.add(key);
			} else {
				newSet.delete(key);
			}
			return newSet;
		});
		// Update appraisal data with price
		setAppraisalData(prev => {
			const newMap = new Map(prev);
			if (hasAppraisal && priceUSD) {
				newMap.set(key, { hasAppraisal: true, priceUSD });
			} else {
				newMap.delete(key);
			}
			return newMap;
		});
	}, []);

	// NFT Deposit functionality
	const {
		depositNFT,
		isNFTDepositing,
		reset: resetDeposit,
		forceReset: forceResetDeposit,
	} = useNFTDeposit({
		onSuccess: () => {
			toast.success("NFT deposited successfully!");
			// Clear all depositing NFTs on success (clean slate for next deposits)
			setDepositingNFTs(new Set());

			// Refetch user's NFTs to remove deposited NFT from the list
			refetchUserNFTs();

			// Also refetch vault data
			refetchDepositorVault();
		},
		onAction: (collection, tokenId, hasValidAppraisal) =>
			updateAppraisedStatus(collection, tokenId, !!hasValidAppraisal),
		onAppraisalStatusChange: updateAppraisedStatus,
	});
	const { nfts: userOwnedNFTs, refetch: refetchUserNFTs } = useUserOwnedNFTsMultipleCollections(whitelistedCollections);

	// Check appraisal status when component mounts or NFTs change
	React.useEffect(() => {
		if (!userOwnedNFTs.length || !appraisal || !publicClient) return;

		const checkAppraisals = async () => {
			for (const nft of userOwnedNFTs) {
				const key = `${nft.collection}:${nft.tokenId}`;

				try {
					const hasAppraisalResult = await publicClient.readContract({
						address: appraisal as `0x${string}`,
						abi: [
							{
								name: "hasAppraisal",
								type: "function",
								stateMutability: "view",
								inputs: [
									{ name: "collection", type: "address" },
									{ name: "tokenId", type: "uint256" }
								],
								outputs: [{ name: "", type: "bool" }]
							}
						],
						functionName: "hasAppraisal",
						args: [nft.collection as `0x${string}`, nft.tokenId]
					}) as boolean;

					let hasValidAppraisal = hasAppraisalResult;
					let priceUSD: bigint = 0n;
					let status: number = 0;

					if (hasAppraisalResult) {
						try {
							const appraisalData = await publicClient.readContract({
								address: appraisal as `0x${string}`,
								abi: [
									{
										name: "getAppraisedPrice",
										type: "function",
										stateMutability: "view",
										inputs: [
											{ name: "collection", type: "address" },
											{ name: "tokenId", type: "uint256" }
										],
										outputs: [
											{ name: "priceUSD", type: "uint256" },
											{ name: "status", type: "uint8" }
										]
									}
								],
								functionName: "getAppraisedPrice",
								args: [nft.collection as `0x${string}`, nft.tokenId]
							}) as readonly [bigint, number];

							[priceUSD, status] = appraisalData;
							const statusAsNumber = Number(status);
							hasValidAppraisal = priceUSD > 0n && (statusAsNumber === 1 || statusAsNumber === 2);
						} catch (error) {
							console.warn(`Failed to fetch appraisal details for ${key}:`, error);
						}
					}

					updateAppraisedStatus(nft.collection, nft.tokenId.toString(), hasValidAppraisal, priceUSD);
				} catch (error) {
					console.error(`Error checking appraisal for ${key}:`, error);
					updateAppraisedStatus(nft.collection, nft.tokenId.toString(), false, 0n);
				}
			}
		};

		checkAppraisals();
	}, [userOwnedNFTs, appraisal, publicClient, updateAppraisedStatus]);

	// Sort NFTs to show appraised ones first
	const sortedUserOwnedNFTs = useMemo(() => {
		if (!userOwnedNFTs.length) return [];

		const appraised: typeof userOwnedNFTs = [];
		const needsAppraisal: typeof userOwnedNFTs = [];

		for (const nft of userOwnedNFTs) {
			const key = `${nft.collection.toLowerCase()}:${nft.tokenId.toString()}`;
			if (appraisedNFTs.has(key)) {
				appraised.push(nft);
			} else {
				needsAppraisal.push(nft);
			}
		}

		return [...appraised, ...needsAppraisal];
	}, [userOwnedNFTs, appraisedNFTs]);

	// Clean up appraisal state when NFT list changes
	React.useEffect(() => {
		if (!userOwnedNFTs.length) {
			setAppraisedNFTs(new Set());
			setAppraisalData(new Map());
			return;
		}

		const validKeys = new Set(
			userOwnedNFTs.map((nft) => `${nft.collection.toLowerCase()}:${nft.tokenId.toString()}`),
		);

		setAppraisedNFTs((prev) => {
			const next = new Set<string>();
			prev.forEach((key) => {
				if (validKeys.has(key)) {
					next.add(key);
				}
			});
			return next;
		});

		setAppraisalData((prev) => {
			const next = new Map();
			prev.forEach((value, key) => {
				if (validKeys.has(key)) {
					next.set(key, value);
				}
			});
			return next;
		});
	}, [userOwnedNFTs]);

	// State for NFT lists
	const [withdrawableCards, setWithdrawableCards] = useState<WithdrawableCard[]>([]);
	const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(false);

	// Load withdrawable cards
	const loadWithdrawableCards = useCallback(async () => {
		if (!treasury || !rarityTracker || !address) {
			setWithdrawableCards([]);
			setIsLoadingWithdrawals(false);
			return;
		}

		setIsLoadingWithdrawals(true);
		try {
			const deposits = await getAllUserCardDeposits();
			if (deposits.length === 0) {
				setWithdrawableCards([]);
				setIsLoadingWithdrawals(false);
				return;
			}

			const cardIds = deposits.map(d => d.cardId);
			const appraisalInfos = await getBatchCardInfo(cardIds);

			const cards: WithdrawableCard[] = deposits.map((deposit, index) => ({
				...deposit,
				cardId: deposit.cardId,
				appraisalInfo: appraisalInfos[index] || null,
			}));

			setWithdrawableCards(cards);
		} catch (error) {
			console.error("Error loading withdrawable cards:", error);
			setWithdrawableCards([]);
		} finally {
			setIsLoadingWithdrawals(false);
		}
	}, [treasury, rarityTracker, address, getAllUserCardDeposits, getBatchCardInfo]);

	// Load withdrawable cards on component mount
	React.useEffect(() => {
		loadWithdrawableCards();
	}, [loadWithdrawableCards]);

	// Load data on tab change
	React.useEffect(() => {
		if (activeTab !== "deposit") {
			// Reset deposit state when leaving deposit tab
			resetDeposit();
		}
	}, [activeTab, resetDeposit]);

	// Cleanup on unmount to reset any stuck states
	React.useEffect(() => {
		return () => {
			forceResetDeposit();
		};
	}, [forceResetDeposit]);

	// Handle yield claim
	const handleClaimYield = async () => {
		if (!address || !canClaim) return;

		try {
			await claimYield({
				address: gachaConfig?.depositorVaultAddress as `0x${string}`,
				args: [address as `0x${string}`, address as `0x${string}`],
			});

			toast.success("Yield claimed successfully!");

			// Refetch immediately and then again after a short delay to ensure UI updates
			refetchDepositorVault();
			setTimeout(() => {
				refetchDepositorVault();
			}, 2000);
		} catch (error) {
			console.error("Error claiming yield:", error);
			toast.error("Failed to claim yield");
		}
	};

	// Handle NFT withdrawal
	const handleWithdrawNFT = async (cardId: `0x${string}`, depositCount: bigint) => {
		if (!treasury) return;

		try {
			await withdrawNFT(cardId, depositCount);
			toast.success("NFT withdrawal successful!");
			loadWithdrawableCards();
			refetchDepositorVault();
		} catch (error) {
			console.error("Error withdrawing NFT:", error);
			toast.error("Failed to withdraw NFT");
		}
	};

	// Handle NFT deposit
	const handleDepositNFT = useCallback(async (collection: string, tokenId: string, hasAppraisal = false) => {
		const nftKey = `${collection}:${tokenId}`;

		try {
			await depositNFT(collection as `0x${string}`, BigInt(tokenId), {
				hasAppraisal,
			});

			// Set a timeout to ensure the loading state clears even if onSuccess doesn't fire
			setTimeout(() => {
				setDepositingNFTs(prev => {
					const newSet = new Set(prev);
					newSet.delete(nftKey);
					return newSet;
				});
			}, 3000); // 3 second timeout as safety net
		} catch (error) {
			console.error("Error depositing NFT:", error);
			toast.error("Failed to deposit NFT");
			// Clear all depositing NFTs on error
			setDepositingNFTs(new Set());
		}
	}, [depositNFT]);

	// Handle NFT actions (deposit vs get appraised)
	const handleNFTAction = useCallback(
		(collection: string, tokenId: string, hasAppraisal?: boolean) => {
			if (hasAppraisal) {
				const nftKey = `${collection}:${tokenId}`;

				// Check if the NFT interaction hook says this NFT is currently being deposited
				// This is more reliable than our manual tracking
				if (isNFTDepositing(collection, tokenId)) {
					return; // Already depositing, skip
				}

				// Add to depositing set for UI feedback
				setDepositingNFTs(prev => new Set(prev).add(nftKey));

				// Deposit the NFT
				handleDepositNFT(collection, tokenId, true);
			} else {
				// Redirect to appraisal page
				const appraisalUrl = `/appraisal?collection=${encodeURIComponent(
					collection,
				)}&tokenId=${encodeURIComponent(tokenId)}`;
				window.location.href = appraisalUrl;
			}
		},
		[isNFTDepositing, handleDepositNFT],
	);

	// Calculate total deposited NFTs (sum of all deposit counts)
	const totalDepositedNFTs = useMemo(() => {
		return withdrawableCards.reduce((total, card) => {
			return total + Number(card.depositCount);
		}, 0);
	}, [withdrawableCards]);

	// Tab configuration
	const tabs = [
		{ id: "deposit", label: "Deposit NFTs", icon: ArrowUpTrayIcon },
		{ id: "withdraw", label: "Withdraw NFTs", icon: ArrowDownTrayIcon },
		{ id: "yield", label: "Yield", icon: BanknotesIcon },
	] as const;


	if (!address) {
		return (
			<GlassCard className="text-center p-8">
				<WalletIcon className="w-16 h-16 mx-auto mb-4 text-foreground/50" />
				<h3 className="text-xl font-medium text-foreground mb-2">Connect Your Wallet</h3>
				<p className="text-foreground/70">Please connect your wallet to view your vault.</p>
			</GlassCard>
		);
	}

	return (
		<GachaSectionLayout
			tone="deposits"
			icon={TrophyIcon}
			label="Vault Management"
			title={title}
			description={description}
			highlights={[
				{
					icon: ShieldCheckIcon,
					title: "Secure Deposits",
					description:
						"Deposit your appraised NFTs to earn yield from the protocol. Your assets remain secure while generating passive income.",
				},
				{
					icon: BanknotesIcon,
					title: "Yield Generation",
					description:
						"Earn USDC yield on your deposited NFTs based on their appraised value. Claim your earnings at any time.",
				},
			]}
		>
			{/* Balance Overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
				<div className="bg-content1/30 rounded-xl p-4 border border-white/10">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-primary/20">
							<BanknotesIcon className="w-6 h-6 text-primary" />
						</div>
						<div>
							<p className="text-sm text-foreground/60">Pending Yield</p>
							<p className="text-xl font-semibold text-foreground">
								{depositorUserData?.pendingYield
									? formatTokenAmount(depositorUserData.pendingYield, 6)
									: "0.000000"} USDC
							</p>
						</div>
					</div>
					{canClaim && (
						<GlassButton
							className="mt-3 w-full"
							color="primary"
							onPress={handleClaimYield}
							isLoading={isClaiming}
						>
							Claim Yield
						</GlassButton>
					)}
				</div>

				<div className="bg-content1/30 rounded-xl p-4 border border-white/10">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-success/20">
							<GiftIcon className="w-6 h-6 text-success" />
						</div>
						<div>
							<p className="text-sm text-foreground/60">Deposited NFTs</p>
							<p className="text-xl font-semibold text-foreground">
								{totalDepositedNFTs} NFTs
							</p>
						</div>
					</div>
				</div>

				<div className="bg-content1/30 rounded-xl p-4 border border-white/10">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-warning/20">
							<ChartBarIcon className="w-6 h-6 text-warning" />
						</div>
						<div>
							<p className="text-sm text-foreground/60">Total Earned</p>
							<p className="text-xl font-semibold text-foreground">
								{depositorUserData?.yieldValue
									? formatTokenAmount(depositorUserData.yieldValue, 6)
									: "0.000000"} USDC
							</p>
						</div>
					</div>
					<p className="text-sm text-foreground/60 mt-2">
						lifetime yield earnings
					</p>
				</div>
			</div>

			{/* Tab Navigation */}
			<div className="flex flex-wrap gap-2 p-1 bg-content1/20 rounded-xl">
				{tabs.map((tab) => (
					<Button
						key={tab.id}
						variant={activeTab === tab.id ? "solid" : "light"}
						className={`flex-1 min-w-[120px] justify-center gap-2 rounded-lg ${activeTab === tab.id
							? "bg-gradient-to-r from-warning to-orange-400 text-black hover:!from-warning hover:!to-orange-400 hover:!text-black"
							: "text-foreground/70 hover:text-foreground hover:bg-content1/30"
							}`}
						onPress={() => setActiveTab(tab.id)}
					>
						<tab.icon className="w-4 h-4" />
						{tab.label}
					</Button>
				))}
			</div>

			{/* Tab Content */}
			<motion.div
				key={activeTab}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
				className="mt-6"
			>
				{activeTab === "deposit" && (
					<div>
						<h3 className="text-xl font-semibold text-foreground mb-4">Deposit NFTs</h3>
						{userOwnedNFTs.length === 0 ? (
							<div className="text-center py-12">
								<ArrowUpTrayIcon className="w-16 h-16 mx-auto mb-4 text-foreground/30" />
								<h4 className="text-lg font-medium text-foreground mb-2">No Eligible NFTs</h4>
								<p className="text-foreground/60">
									You don't own any NFTs from whitelisted collections.
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{sortedUserOwnedNFTs.map((nft) => {
									const nftKey = `${nft.collection.toLowerCase()}:${nft.tokenId.toString()}`;
									const hasAppraisal = appraisedNFTs.has(nftKey);
									const appraiseInfo = appraisalData.get(nftKey);

									return (
										<div key={nftKey} className="bg-content1/30 rounded-xl p-4 border border-white/10 flex flex-col h-full">
											<div className="flex-1">
												<UnifiedNFTCard
													collection={nft.collection}
													tokenId={nft.tokenId.toString()}
													appraisalContractAddress={appraisal || "0x0000000000000000000000000000000000000000"}
													variant="detailed"
													size="md"
													showAppraisal={true}
													showAppraisalAction={false}
													{...(appraiseInfo && {
														appraisalOverride: {
															hasAppraisal: appraiseInfo.hasAppraisal,
															priceUSD: appraiseInfo.priceUSD
														}
													})}
												/>
											</div>
											<div className="mt-4 pt-2">
												{hasAppraisal ? (
													<GlassButton
														color="primary"
														size="sm"
														onPress={() => handleNFTAction(nft.collection, nft.tokenId.toString(), true)}
														isDisabled={depositingNFTs.has(`${nft.collection}:${nft.tokenId.toString()}`) || isNFTDepositing(nft.collection, nft.tokenId.toString())}
														className="w-full"
														startContent={<ArrowUpTrayIcon className="w-4 h-4" />}
													>
														Deposit NFT
													</GlassButton>
												) : (
													<GlassButton
														color="warning"
														size="sm"
														onPress={() => handleNFTAction(nft.collection, nft.tokenId.toString(), false)}
														className="w-full"
														startContent={<SparklesIcon className="w-4 h-4" />}
													>
														Get Appraised
													</GlassButton>
												)}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				)}

				{activeTab === "withdraw" && (
					<div>
						<h3 className="text-xl font-semibold text-foreground mb-4">Withdraw NFTs</h3>
						{isLoadingWithdrawals ? (
							<div className="text-center py-12">
								<ArrowPathIcon className="w-16 h-16 mx-auto mb-4 text-foreground/30 animate-spin" />
								<p className="text-foreground/60">Loading your withdrawable NFTs...</p>
							</div>
						) : withdrawableCards.length === 0 ? (
							<div className="text-center py-12">
								<ArrowDownTrayIcon className="w-16 h-16 mx-auto mb-4 text-foreground/30" />
								<h4 className="text-lg font-medium text-foreground mb-2">No Withdrawable NFTs</h4>
								<p className="text-foreground/60">
									You haven't deposited any NFTs yet.
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{withdrawableCards.map((card) => (
									<div key={card.cardId} className="bg-content1/30 rounded-xl p-4 border border-white/10 flex flex-col h-full">
										<div className="flex-1">
											<UnifiedNFTCard
												collection={card.cardId}
												tokenId={card.cardId}
												appraisalContractAddress={appraisal || "0x0000000000000000000000000000000000000000"}
												variant="detailed"
												size="md"
												showAppraisal={true}
												{...(card.appraisalInfo && {
													appraisalOverride: {
														hasAppraisal: true,
														priceUSD: card.appraisalInfo.appraisedValueUsd
													}
												})}
											/>
										</div>
										<div className="mt-4 pt-2 flex items-center justify-between">
											<div>
												<p className="text-sm text-foreground/60">Deposit Count</p>
												<p className="font-medium text-foreground">{card.depositCount.toString()}</p>
											</div>
											<GlassButton
												color="glass"
												size="sm"
												onPress={() => handleWithdrawNFT(card.cardId, card.depositCount)}
												isLoading={isWithdrawing}
											>
												<ArrowDownTrayIcon className="w-4 h-4" />
												Withdraw
											</GlassButton>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{activeTab === "yield" && (
					<div>
						<h3 className="text-xl font-semibold text-foreground mb-4">Yield Information</h3>
						<div className="space-y-4">
							<div className="bg-content1/30 rounded-xl p-4 border border-white/10">
								<h4 className="font-medium text-foreground mb-3">Yield Summary</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-foreground/60">Pending Yield</p>
										<p className="text-lg font-semibold text-success">
											{depositorUserData?.pendingYield
												? formatTokenAmount(depositorUserData.pendingYield, 6)
												: "0.000000"} USDC
										</p>
									</div>
									<div>
										<p className="text-sm text-foreground/60">Total Earned</p>
										<p className="text-lg font-semibold text-foreground">
											{depositorUserData?.yieldValue
												? formatTokenAmount(depositorUserData.yieldValue, 6)
												: "0.000000"} USDC
										</p>
									</div>
								</div>
							</div>

							<div className="bg-content1/30 rounded-xl p-4 border border-white/10">
								<h4 className="font-medium text-foreground mb-3">Your Position</h4>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<p className="text-sm text-foreground/60">Your Shares</p>
										<p className="text-lg font-semibold text-foreground">
											{depositorUserData?.shares?.toString() || "0"}
										</p>
									</div>
									<div>
										<p className="text-sm text-foreground/60">Total Vault Shares</p>
										<p className="text-lg font-semibold text-foreground">
											{depositorData?.totalShares?.toString() || "0"}
										</p>
									</div>
									<div>
										<p className="text-sm text-foreground/60">Share Ownership</p>
										<p className="text-lg font-semibold text-primary">
											{calculateUserSharePercentage(depositorUserData?.shares, depositorData?.totalShares)}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</motion.div>
		</GachaSectionLayout>
	);
}
