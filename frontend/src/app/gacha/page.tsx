"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useWriteContract } from "wagmi";
import { formatTokenAmount } from "../../lib/utils";
import GachaSpinner from "../../components/GachaSpinner";
import { AdminControls } from "../../components/AdminControls";
import AnalyticsDashboard from "../../components/AnalyticsDashboard";
import { NFTAvailabilitySection } from "../../components/NFTAvailabilitySection";
import {
	CheckIcon,
	XCircleIcon,
	CurrencyDollarIcon,
	GiftIcon,
	WalletIcon,
} from "@heroicons/react/24/outline";

import {
	GlassCard,
	GlassButton,
	StatsGridSkeleton,
	RarityBreakdownSkeleton,
	GlassHeader,
} from "../../components/ui";
import { getGachaConfig, formatGachaAddress } from "../../lib/gacha-config";
import {
	useReadGachaRewardsManagerGetUserTotalClaimableRewards,
	useReadGachaRewardsManagerGetUserRarityClaimableRewards,
	useReadGachaRewardsManagerGetUserAnalytics,
	useReadGachaTreasuryGetUserAllDepositCounts,
	useReadErc20Decimals,
	useReadErc20Symbol,
	useReadGachaFeeToken,
	useReadGachaOwner,
	useReadGachaTreasuryOwner,
	useReadGachaRewardsManagerOwner,
	useReadGachaRewardsManagerPaused,
	rarityDividendTrackerAbi,
} from "../../generated";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import { RARITY_CONFIG, Rarity } from "../../lib/rarityConfig";

interface RarityReward {
	rarity: string;
	amount: string;
	deposits: number;
	emoji: string;
	color: string;
}

function GachaDetailPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { address: userAddress, isConnected } = useAccount();
	const [optimisticClaim, setOptimisticClaim] = useState(false);
	const [optimisticClaimedAmount, setOptimisticClaimedAmount] = useState<
		bigint | null
	>(null);
	const [isRefetchingRewards, setIsRefetchingRewards] = useState(false);
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const sectionParam = searchParams.get("section");
	const validSections = [
		"spin",
		"deposits",
		"analytics",
		"rewards",
		"admin",
	] as const;
	type ValidSection = (typeof validSections)[number];

	// Determine active tab from URL or default to 'spin'
	const activeTab: ValidSection = validSections.includes(
		sectionParam as ValidSection,
	)
		? (sectionParam as ValidSection)
		: "spin";

	const gacha = gachaId ? getGachaConfig(gachaId) : null;

	// Owner checks for admin access
	const { data: gachaOwner } = useReadGachaOwner({
		address: gacha?.address as `0x${string}`,
		query: { enabled: !!gacha },
	});

	const { data: treasuryOwner } = useReadGachaTreasuryOwner({
		address: gacha?.treasuryAddress as `0x${string}`,
		query: { enabled: !!gacha },
	});

	const { data: rewardsOwner } = useReadGachaRewardsManagerOwner({
		address: contracts.rewardsManager,
		query: { enabled: !!contracts.rewardsManager },
	});

	const isOwner =
		userAddress &&
		(userAddress === gachaOwner ||
			userAddress === treasuryOwner ||
			userAddress === rewardsOwner);

	// Check if rewards manager is paused
	const { data: isRewardsManagerPaused } = useReadGachaRewardsManagerPaused({
		address: contracts.rewardsManager,
		query: { enabled: !!contracts.rewardsManager },
	});

	// Contract reads for rewards functionality
	const { data: feeToken } = useReadGachaFeeToken({
		address: contracts.gacha!,
		query: { enabled: !!contracts.gacha },
	});

	const { data: tokenDecimals } = useReadErc20Decimals({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const { data: tokenSymbol } = useReadErc20Symbol({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const {
		data: userAnalytics,
		refetch: refetchUserAnalytics,
		isLoading: isUserAnalyticsLoading,
	} = useReadGachaRewardsManagerGetUserAnalytics({
		address: contracts.rewardsManager,
		args: userAddress && contracts.rewardsManager ? [userAddress] : undefined,
		query: { enabled: !!userAddress && !!contracts.rewardsManager },
	});

	const {
		data: totalClaimable,
		refetch: refetchClaimable,
		isLoading: isTotalClaimableLoading,
	} = useReadGachaRewardsManagerGetUserTotalClaimableRewards({
		address: contracts.rewardsManager,
		args: userAddress && contracts.rewardsManager ? [userAddress] : undefined,
		query: { enabled: !!userAddress && !!contracts.rewardsManager },
	});

	const {
		data: depositCounts,
		refetch: refetchDepositCounts,
		isLoading: isDepositCountsLoading,
	} = useReadGachaTreasuryGetUserAllDepositCounts({
		address: contracts.treasury,
		args: userAddress && contracts.treasury ? [userAddress] : undefined,
		query: { enabled: !!userAddress && !!contracts.treasury },
	});

	// Individual rarity claimable amounts
	const { data: commonClaimable, refetch: refetchCommonClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: contracts.rewardsManager,
			args:
				userAddress && contracts.rewardsManager ? [userAddress, 0] : undefined,
			query: { enabled: !!userAddress && !!contracts.rewardsManager },
		});

	const { data: uncommonClaimable, refetch: refetchUncommonClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: contracts.rewardsManager,
			args:
				userAddress && contracts.rewardsManager ? [userAddress, 1] : undefined,
			query: { enabled: !!userAddress && !!contracts.rewardsManager },
		});

	const { data: rareClaimable, refetch: refetchRareClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: contracts.rewardsManager,
			args:
				userAddress && contracts.rewardsManager ? [userAddress, 2] : undefined,
			query: { enabled: !!userAddress && !!contracts.rewardsManager },
		});

	const { data: epicClaimable, refetch: refetchEpicClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: contracts.rewardsManager,
			args:
				userAddress && contracts.rewardsManager ? [userAddress, 3] : undefined,
			query: { enabled: !!userAddress && !!contracts.rewardsManager },
		});

	const { data: legendaryClaimable, refetch: refetchLegendaryClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: contracts.rewardsManager,
			args:
				userAddress && contracts.rewardsManager ? [userAddress, 4] : undefined,
			query: { enabled: !!userAddress && !!contracts.rewardsManager },
		});

	// Claim rewards mutation - use generic writeContract for individual tracker calls
	const {
		writeContract: claimRewards,
		isPending: isClaimPending,
		isSuccess: isClaimSuccess,
		error: claimError,
	} = useWriteContract();

	// Format token amounts with enhanced precision and clean display
	const formatTokenAmountLocal = (amount: bigint | undefined) => {
		if (!amount || !tokenDecimals) return "0";
		return formatTokenAmount(amount, tokenDecimals, {
			maxDecimals: 6,
			minDecimals: 0,
			useGrouping: true,
			notation: "standard",
		});
	};

	// Prepare rarity rewards data using official config
	const rarityRewards: RarityReward[] = [
		{
			rarity: RARITY_CONFIG[Rarity.Common].name,
			amount: formatTokenAmountLocal(commonClaimable),
			deposits: depositCounts ? Number(depositCounts[0]) : 0,
			emoji: RARITY_CONFIG[Rarity.Common].emoji,
			color: RARITY_CONFIG[Rarity.Common].bgGradient,
		},
		{
			rarity: RARITY_CONFIG[Rarity.Uncommon].name,
			amount: formatTokenAmountLocal(uncommonClaimable),
			deposits: depositCounts ? Number(depositCounts[1]) : 0,
			emoji: RARITY_CONFIG[Rarity.Uncommon].emoji,
			color: RARITY_CONFIG[Rarity.Uncommon].bgGradient,
		},
		{
			rarity: RARITY_CONFIG[Rarity.Rare].name,
			amount: formatTokenAmountLocal(rareClaimable),
			deposits: depositCounts ? Number(depositCounts[2]) : 0,
			emoji: RARITY_CONFIG[Rarity.Rare].emoji,
			color: RARITY_CONFIG[Rarity.Rare].bgGradient,
		},
		{
			rarity: RARITY_CONFIG[Rarity.Epic].name,
			amount: formatTokenAmountLocal(epicClaimable),
			deposits: depositCounts ? Number(depositCounts[3]) : 0,
			emoji: RARITY_CONFIG[Rarity.Epic].emoji,
			color: RARITY_CONFIG[Rarity.Epic].bgGradient,
		},
		{
			rarity: RARITY_CONFIG[Rarity.Legendary].name,
			amount: formatTokenAmountLocal(legendaryClaimable),
			deposits: depositCounts ? Number(depositCounts[4]) : 0,
			emoji: RARITY_CONFIG[Rarity.Legendary].emoji,
			color: RARITY_CONFIG[Rarity.Legendary].bgGradient,
		},
	];

	// Handle tab navigation via URL
	const handleTabChange = (section: ValidSection) => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		newSearchParams.set("section", section);
		router.push(`/gacha?${newSearchParams.toString()}`, { scroll: false });
	};

	// Redirect to spin tab if trying to access admin without permissions
	useEffect(() => {
		if (
			activeTab === "admin" &&
			isConnected &&
			gachaOwner &&
			treasuryOwner &&
			rewardsOwner &&
			!isOwner
		) {
			handleTabChange("spin");
		}
	}, [
		activeTab,
		isConnected,
		isOwner,
		gachaOwner,
		treasuryOwner,
		rewardsOwner,
		handleTabChange,
	]);

	// Update document title based on active section
	useEffect(() => {
		if (gacha) {
			const sectionTitles = {
				spin: "Spin & Play",
				deposits: "NFT Deposits",
				analytics: "Treasury Analytics",
				rewards: "My Rewards",
				admin: "Admin Controls",
			};
			const sectionTitle = sectionTitles[activeTab];
			document.title = `${gacha.title} - ${sectionTitle} | Spin-Fi`;
		}
	}, [gacha, activeTab]);

	// Handle claim success
	useEffect(() => {
		if (isClaimSuccess) {
			// Reset optimistic state on success
			setOptimisticClaim(false);
			setOptimisticClaimedAmount(null);

			// Refetch all rewards-related data with delay to ensure blockchain state is updated
			const refetchAfterClaim = async () => {
				// Small delay to ensure blockchain state is updated
				await new Promise((resolve) => setTimeout(resolve, 2000));

				try {
					await Promise.allSettled([
						refetchUserAnalytics(),
						refetchClaimable(),
						refetchDepositCounts(),
						refetchCommonClaimable(),
						refetchUncommonClaimable(),
						refetchRareClaimable(),
						refetchEpicClaimable(),
						refetchLegendaryClaimable(),
					]);
				} catch (error) {
					console.warn(
						"Some rewards data failed to refetch after claim:",
						error,
					);
				}
			};

			refetchAfterClaim();
		}
	}, [
		isClaimSuccess,
		refetchUserAnalytics,
		refetchClaimable,
		refetchDepositCounts,
		refetchCommonClaimable,
		refetchUncommonClaimable,
		refetchRareClaimable,
		refetchEpicClaimable,
		refetchLegendaryClaimable,
	]);

	// Reset optimistic state on error
	useEffect(() => {
		if (claimError) {
			console.error("Claim rewards error:", claimError);
			setOptimisticClaim(false);
			setOptimisticClaimedAmount(null);
		}
	}, [claimError]);

	// Refetch rewards data when switching to rewards tab
	useEffect(() => {
		if (activeTab === "rewards" && userAddress) {
			// Refetch all rewards-related data with better error handling
			const refetchAllRewardsData = async () => {
				setIsRefetchingRewards(true);
				try {
					await Promise.allSettled([
						refetchUserAnalytics(),
						refetchClaimable(),
						refetchDepositCounts(),
						refetchCommonClaimable(),
						refetchUncommonClaimable(),
						refetchRareClaimable(),
						refetchEpicClaimable(),
						refetchLegendaryClaimable(),
					]);
				} catch (error) {
					console.warn("Some rewards data failed to refetch:", error);
				} finally {
					setIsRefetchingRewards(false);
				}
			};

			refetchAllRewardsData();
		}
	}, [
		activeTab,
		userAddress,
		refetchUserAnalytics,
		refetchClaimable,
		refetchDepositCounts,
		refetchCommonClaimable,
		refetchUncommonClaimable,
		refetchRareClaimable,
		refetchEpicClaimable,
		refetchLegendaryClaimable,
	]);

	const handleClaimRewards = async () => {
		// Enhanced debugging
		console.log("Claim attempt:", {
			userAddress,
			totalClaimable: totalClaimable?.toString(),
			rewardsManager: contracts.rewardsManager,
			isConnected,
			isRewardsManagerPaused,
		});

		if (!userAddress || !totalClaimable || totalClaimable === BigInt(0)) {
			console.warn(
				"Cannot claim rewards: missing user address or no claimable amount",
				{ userAddress, totalClaimable: totalClaimable?.toString() },
			);
			return;
		}

		if (!contracts.trackers) {
			console.error("No tracker contract addresses available");
			return;
		}

		// Set optimistic state
		setOptimisticClaim(true);
		setOptimisticClaimedAmount(totalClaimable);

		try {
			console.log("Initiating individual tracker claims...");

			// Find the first tracker with claimable rewards and claim from it
			// Users will need to call this multiple times if they have rewards in multiple rarities
			let trackerToClaim: `0x${string}` | null = null;
			let amountToClaim = BigInt(0);

			if (commonClaimable && commonClaimable > BigInt(0)) {
				trackerToClaim = contracts.trackers.common;
				amountToClaim = commonClaimable;
			} else if (uncommonClaimable && uncommonClaimable > BigInt(0)) {
				trackerToClaim = contracts.trackers.uncommon;
				amountToClaim = uncommonClaimable;
			} else if (rareClaimable && rareClaimable > BigInt(0)) {
				trackerToClaim = contracts.trackers.rare;
				amountToClaim = rareClaimable;
			} else if (epicClaimable && epicClaimable > BigInt(0)) {
				trackerToClaim = contracts.trackers.epic;
				amountToClaim = epicClaimable;
			} else if (legendaryClaimable && legendaryClaimable > BigInt(0)) {
				trackerToClaim = contracts.trackers.legendary;
				amountToClaim = legendaryClaimable;
			}

			if (!trackerToClaim) {
				console.warn("No claimable rewards found");
				setOptimisticClaim(false);
				setOptimisticClaimedAmount(null);
				return;
			}

			console.log(
				`Claiming ${formatTokenAmountLocal(amountToClaim)} from tracker: ${trackerToClaim}`,
			);

			claimRewards({
				address: trackerToClaim,
				abi: rarityDividendTrackerAbi,
				functionName: "withdrawFunds",
			});
		} catch (error) {
			console.error("Failed to initiate claim transaction:", error);
			// Reset optimistic state on immediate error
			setOptimisticClaim(false);
			setOptimisticClaimedAmount(null);
		}
	};

	const retryClaimRewards = () => {
		handleClaimRewards();
	};

	if (!gachaId) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<GlassCard padding="lg" className="text-center">
					<XCircleIcon className="w-8 h-8 mx-auto mb-4 text-warning" />
					<h2 className="text-2xl font-medium text-foreground mb-2">
						Missing Gacha ID
					</h2>
					<p className="text-foreground/70 mb-6">
						Please provide a gacha ID in the URL parameters.
					</p>
					<GlassButton
						variant="primary"
						startIcon="arrow-left"
						onClick={() => router.push("/discover")}
					>
						Back to Discovery
					</GlassButton>
				</GlassCard>
			</div>
		);
	}

	if (!gacha) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<GlassCard padding="lg" className="text-center">
					<XCircleIcon className="w-8 h-8 mx-auto mb-4 text-warning" />
					<h2 className="text-2xl font-medium text-foreground mb-2">
						Gacha Not Found
					</h2>
					<p className="text-foreground/70 mb-6">
						The gacha "{gachaId}" is not recognized or configured.
					</p>
					<GlassButton
						variant="primary"
						startIcon="arrow-left"
						onClick={() => router.push("/discover")}
					>
						Back to Discovery
					</GlassButton>
				</GlassCard>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-transparent">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl">
				{/* Header */}
				<div className="flex items-center gap-4 mb-8 lg:mb-12">
					<GlassButton
						variant="secondary"
						size="md"
						startIcon="arrow-left"
						onClick={() => router.push("/discover")}
					>
						<span className="hidden sm:inline">Back to Discovery</span>
						<span className="sm:hidden">Back</span>
					</GlassButton>
				</div>

				<GlassHeader
					title={gacha.title}
					description={gacha.description}
					gradient={`${gacha.theme} opacity-20`}
					badges={[
						{ icon: "shield-check", text: "Provably Fair", variant: "success" },
						{
							icon: "link",
							text: formatGachaAddress(gacha.address),
							variant: "info",
						},
					]}
				/>

				{/* Navigation Tabs */}
				<motion.div
					className="mb-12 lg:mb-16"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.6 }}
				>
					<GlassCard variant="base" className="p-3 lg:p-4">
						<div
							role="tablist"
							aria-label="Gacha navigation tabs"
							className="flex flex-col sm:flex-row gap-3 lg:gap-4"
						>
							<GlassButton
								variant={activeTab === "spin" ? "primary" : "secondary"}
								size="md"
								startIcon="zap"
								onClick={() => handleTabChange("spin")}
								role="tab"
								aria-selected={activeTab === "spin"}
								aria-controls="tabpanel-spin-&-play"
								tabIndex={activeTab === "spin" ? 0 : -1}
								className="flex-1 sm:flex-initial"
							>
								Spin & Play
							</GlassButton>
							<GlassButton
								variant={activeTab === "deposits" ? "primary" : "secondary"}
								size="md"
								startIcon="gem"
								onClick={() => handleTabChange("deposits")}
								role="tab"
								aria-selected={activeTab === "deposits"}
								aria-controls="tabpanel-deposits"
								tabIndex={activeTab === "deposits" ? 0 : -1}
								className="flex-1 sm:flex-initial"
							>
								NFT Deposits
							</GlassButton>
							<GlassButton
								variant={activeTab === "analytics" ? "primary" : "secondary"}
								size="md"
								startIcon="trending"
								onClick={() => handleTabChange("analytics")}
								role="tab"
								aria-selected={activeTab === "analytics"}
								aria-controls="tabpanel-analytics"
								tabIndex={activeTab === "analytics" ? 0 : -1}
								className="flex-1 sm:flex-initial"
							>
								Analytics
							</GlassButton>
							<GlassButton
								variant={activeTab === "rewards" ? "primary" : "secondary"}
								size="md"
								startIcon="gift"
								onClick={() => handleTabChange("rewards")}
								role="tab"
								aria-selected={activeTab === "rewards"}
								aria-controls="tabpanel-my-rewards"
								tabIndex={activeTab === "rewards" ? 0 : -1}
								className="flex-1 sm:flex-initial"
							>
								My Rewards
							</GlassButton>
							{isOwner && (
								<GlassButton
									variant={activeTab === "admin" ? "primary" : "secondary"}
									size="md"
									startIcon="settings"
									onClick={() => handleTabChange("admin")}
									role="tab"
									aria-selected={activeTab === "admin"}
									aria-controls="tabpanel-admin"
									tabIndex={activeTab === "admin" ? 0 : -1}
									className="flex-1 sm:flex-initial"
								>
									Admin
								</GlassButton>
							)}
						</div>
					</GlassCard>
				</motion.div>

				{/* Tab Content */}
				<motion.div
					key={activeTab}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					{activeTab === "spin" && (
						<div
							role="tabpanel"
							id="tabpanel-spin-&-play"
							aria-labelledby="tab-spin-&-play"
						>
							<GachaSpinner />
						</div>
					)}

					{activeTab === "deposits" && (
						<div
							role="tabpanel"
							id="tabpanel-deposits"
							aria-labelledby="tab-deposits"
						>
							<NFTAvailabilitySection />
						</div>
					)}

					{activeTab === "analytics" && (
						<div
							role="tabpanel"
							id="tabpanel-analytics"
							aria-labelledby="tab-analytics"
						>
							<AnalyticsDashboard />
						</div>
					)}

					{activeTab === "admin" && gacha && (
						<div
							role="tabpanel"
							id="tabpanel-admin"
							aria-labelledby="tab-admin"
						>
							<AdminControls gacha={gacha} />
						</div>
					)}

					{activeTab === "rewards" && (
						<div
							role="tabpanel"
							id="tabpanel-my-rewards"
							aria-labelledby="tab-my-rewards"
							className="space-y-8"
						>
							{!isConnected ? (
								<div className="flex items-center justify-center min-h-[400px]">
									<GlassCard variant="base" className="p-8 text-center">
										<WalletIcon className="w-8 h-8 mx-auto mb-4 text-warning" />
										<h3 className="text-xl font-medium text-foreground mb-4">
											Connect Your Wallet
										</h3>
										<p className="text-foreground/70">
											Connect your wallet to view your rewards from this gacha
										</p>
									</GlassCard>
								</div>
							) : (
								<>
									{/* Header */}
									<motion.div
										className="text-center"
										initial={{ opacity: 0, y: -20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6 }}
									>
										<h2 className="text-4xl font-light mb-4 tracking-tight">
											<span className="bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
												My Gacha Rewards
											</span>
										</h2>
										<p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed font-light">
											Track your NFT deposits and accumulated rewards from{" "}
											{gacha?.title}
										</p>
									</motion.div>

									{/* Summary Cards */}
									{isUserAnalyticsLoading ||
									isTotalClaimableLoading ||
									isDepositCountsLoading ||
									isRefetchingRewards ? (
										<StatsGridSkeleton columns={3} />
									) : (
										<div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{/* Total Claimable */}
											<motion.div
												initial={{ opacity: 0, scale: 0.95 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ delay: 0.1, duration: 0.6 }}
											>
												<GlassCard
													variant="floating"
													animate={true}
													padding="lg"
												>
													<div className="flex items-center justify-between">
														<div>
															<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
																Available to Claim
															</p>
															<h3 className="text-3xl font-bold bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent mt-2">
																{optimisticClaim
																	? "0"
																	: formatTokenAmountLocal(totalClaimable)}{" "}
																{tokenSymbol || "TOKENS"}
															</h3>
															{optimisticClaim && (
																<motion.div
																	initial={{ opacity: 0, scale: 0.95 }}
																	animate={{ opacity: 1, scale: 1 }}
																	className="text-xs text-success mt-1 flex items-center gap-1"
																>
																	<CheckIcon className="w-3 h-3" />
																	<span>
																		Claiming{" "}
																		{formatTokenAmountLocal(
																			optimisticClaimedAmount || BigInt(0),
																		)}{" "}
																		{tokenSymbol}...
																	</span>
																</motion.div>
															)}
														</div>
														<div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
															<CurrencyDollarIcon className="w-8 h-8 text-warning" />
														</div>
													</div>
												</GlassCard>
											</motion.div>

											{/* Total Claimed */}
											<motion.div
												initial={{ opacity: 0, scale: 0.95 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ delay: 0.2, duration: 0.6 }}
											>
												<GlassCard
													variant="floating"
													animate={true}
													padding="lg"
												>
													<div className="flex items-center justify-between">
														<div>
															<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
																Total Claimed
															</p>
															<h3 className="text-3xl font-bold text-foreground mt-2">
																{userAnalytics
																	? formatTokenAmountLocal(userAnalytics[0])
																	: "0"}{" "}
																{tokenSymbol || "TOKENS"}
															</h3>
														</div>
														<div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
															<CheckIcon className="w-8 h-8 text-success" />
														</div>
													</div>
												</GlassCard>
											</motion.div>

											{/* Total Deposits */}
											<motion.div
												initial={{ opacity: 0, scale: 0.95 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ delay: 0.3, duration: 0.6 }}
											>
												<GlassCard
													variant="floating"
													animate={true}
													padding="lg"
												>
													<div className="flex items-center justify-between">
														<div>
															<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
																NFTs Deposited
															</p>
															<h3 className="text-3xl font-bold text-foreground mt-2">
																{depositCounts
																	? depositCounts.reduce(
																			(sum, count) => sum + Number(count),
																			0,
																		)
																	: 0}
															</h3>
														</div>
														<div className="w-16 h-16 bg-gradient-to-br from-purple-400/20 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
															<GiftIcon className="w-8 h-8 text-purple-400" />
														</div>
													</div>
												</GlassCard>
											</motion.div>
										</div>
									)}

									{/* Rarity Breakdown */}
									{isUserAnalyticsLoading ||
									isTotalClaimableLoading ||
									isDepositCountsLoading ||
									isRefetchingRewards ? (
										<div className="bg-content1/20 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6">
											<div className="flex justify-between items-center mb-6">
												<div className="h-8 w-48 bg-content1/30 rounded animate-pulse"></div>
												<div className="h-12 w-32 bg-content1/30 rounded-xl animate-pulse"></div>
											</div>
											<RarityBreakdownSkeleton />
										</div>
									) : (
										<motion.div
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.4, duration: 0.6 }}
										>
											<GlassCard
												variant="base"
												padding="none"
												header={
													<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
														<h3 className="text-2xl font-light text-foreground tracking-tight">
															Rewards by Rarity
														</h3>
														<GlassButton
															size="lg"
															variant="primary"
															className="w-full sm:w-auto"
															isLoading={isClaimPending || optimisticClaim}
															loadingText={
																optimisticClaim
																	? "Processing..."
																	: "Claiming..."
															}
															onClick={handleClaimRewards}
															isDisabled={
																!totalClaimable ||
																totalClaimable === BigInt(0) ||
																optimisticClaim ||
																isRefetchingRewards ||
																isRewardsManagerPaused
															}
															animate={true}
															aria-label={`Claim ${formatTokenAmountLocal(totalClaimable)} ${tokenSymbol} in rewards`}
														>
															{optimisticClaim
																? "Processing Claim..."
																: "Claim Next Reward"}
														</GlassButton>
													</div>
												}
											>
												{/* Desktop/Tablet: Horizontal Layout */}
												<div className="hidden sm:block pt-8 pb-4">
													<div className="flex flex-wrap gap-4 justify-center">
														{rarityRewards.map((rarity, index) => (
															<motion.div
																key={rarity.rarity}
																initial={{ opacity: 0, y: 20 }}
																animate={{ opacity: 1, y: 0 }}
																transition={{
																	delay: 0.5 + index * 0.1,
																	duration: 0.6,
																}}
																className="relative group flex-1 min-w-[180px] max-w-[220px]"
															>
																{/* Background glow */}
																<div
																	className={`absolute -inset-2 bg-gradient-to-r ${rarity.color} rounded-xl blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
																/>

																{/* Card */}
																<div className="relative bg-gradient-to-br from-content1/40 via-background/95 to-content1/30 backdrop-blur-xl rounded-xl border border-white/20 p-4 shadow-xl h-full">
																	<div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />

																	<div className="relative z-10 text-center space-y-3">
																		{/* Rarity badge */}
																		<div className="inline-flex items-center gap-2 px-2 py-1 bg-gradient-to-r from-content1/50 to-content1/30 backdrop-blur-xl border border-white/30 rounded-full">
																			<span className="text-sm">
																				{rarity.emoji}
																			</span>
																			<span className="text-xs font-medium text-foreground">
																				{rarity.rarity}
																			</span>
																		</div>

																		{/* Stats in compact layout */}
																		<div className="space-y-2">
																			<div>
																				<p className="text-xs text-foreground/60 uppercase tracking-wide">
																					Deposits
																				</p>
																				<p className="text-lg font-bold text-foreground">
																					{rarity.deposits}
																				</p>
																			</div>
																			<div>
																				<p className="text-xs text-foreground/60 uppercase tracking-wide">
																					Claimable
																				</p>
																				<p
																					className={`text-sm font-semibold bg-gradient-to-r ${rarity.color} bg-clip-text text-transparent`}
																				>
																					{rarity.amount} {tokenSymbol}
																				</p>
																			</div>
																		</div>
																	</div>
																</div>
															</motion.div>
														))}
													</div>
												</div>

												{/* Mobile: Vertical List Layout */}
												<div className="block sm:hidden space-y-3 pt-6 pb-2">
													{rarityRewards.map((rarity, index) => (
														<motion.div
															key={rarity.rarity}
															initial={{ opacity: 0, x: -20 }}
															animate={{ opacity: 1, x: 0 }}
															transition={{
																delay: 0.5 + index * 0.1,
																duration: 0.6,
															}}
															className="relative group"
														>
															{/* Background glow */}
															<div
																className={`absolute -inset-1 bg-gradient-to-r ${rarity.color} rounded-lg blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
															/>

															{/* Card */}
															<div className="relative bg-gradient-to-r from-content1/40 to-content1/20 backdrop-blur-xl rounded-lg border border-white/20 p-4 shadow-lg">
																<div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-lg" />

																<div className="relative z-10 flex items-center justify-between">
																	{/* Left side - Rarity info */}
																	<div className="flex items-center gap-3">
																		<div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-content1/50 to-content1/30 backdrop-blur-xl border border-white/30 rounded-full">
																			<span className="text-sm">
																				{rarity.emoji}
																			</span>
																			<span className="text-sm font-medium text-foreground">
																				{rarity.rarity}
																			</span>
																		</div>
																	</div>

																	{/* Right side - Stats */}
																	<div className="flex items-center gap-6 text-right">
																		<div>
																			<p className="text-xs text-foreground/60 uppercase tracking-wide">
																				Deposits
																			</p>
																			<p className="text-lg font-bold text-foreground">
																				{rarity.deposits}
																			</p>
																		</div>
																		<div>
																			<p className="text-xs text-foreground/60 uppercase tracking-wide">
																				Claimable
																			</p>
																			<p
																				className={`text-sm font-semibold bg-gradient-to-r ${rarity.color} bg-clip-text text-transparent`}
																			>
																				{rarity.amount} {tokenSymbol}
																			</p>
																		</div>
																	</div>
																</div>
															</div>
														</motion.div>
													))}
												</div>
											</GlassCard>
										</motion.div>
									)}

									{/* Error Display */}
									<AnimatePresence>
										{claimError && (
											<motion.div
												initial={{ opacity: 0, scale: 0.95 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.95 }}
												className="fixed bottom-8 right-8 z-50 max-w-sm overflow-hidden"
											>
												<GlassCard
													variant="base"
													className="bg-danger/10 border border-danger/20 shadow-xl backdrop-blur-xl p-4 overflow-hidden"
												>
													<div className="flex items-start justify-between gap-3">
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 mb-2">
																<XCircleIcon className="w-4 h-4 text-danger flex-shrink-0" />
																<h4 className="font-semibold text-danger text-sm truncate">
																	Transaction Failed
																</h4>
															</div>
															<p className="text-danger/80 text-sm mb-3 break-words">
																{claimError?.message?.includes(
																	"insufficient funds",
																)
																	? "Insufficient funds for gas fees. Please add more ETH to your wallet."
																	: claimError?.message?.includes(
																				"User rejected",
																			)
																		? "Transaction was rejected in your wallet."
																		: claimError?.message?.includes(
																					"No rewards to claim",
																				)
																			? "No rewards available to claim at this time."
																			: "Failed to claim rewards. This could be due to network issues or insufficient gas."}
															</p>
															<div className="flex gap-2 flex-wrap">
																<GlassButton
																	variant="danger"
																	size="sm"
																	onClick={retryClaimRewards}
																	isDisabled={isClaimPending}
																	aria-label="Retry claiming rewards"
																	className="flex-shrink-0"
																>
																	Retry
																</GlassButton>
															</div>
														</div>
														<button
															onClick={() => {
																// Force a state update to clear the error by reloading
																window.location.reload();
															}}
															className="flex-shrink-0 p-1 hover:bg-danger/20 rounded-full transition-colors"
															aria-label="Close error message"
														>
															<XCircleIcon className="w-4 h-4 text-danger/60 hover:text-danger" />
														</button>
													</div>
												</GlassCard>
											</motion.div>
										)}
									</AnimatePresence>
								</>
							)}
						</div>
					)}
				</motion.div>

			</div>
		</div>
	);
}

export default function GachaDetailPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-background flex items-center justify-center">
					<div className="text-center space-y-4">
						<div className="w-8 h-8 border-4 border-warning border-t-transparent rounded-full animate-spin mx-auto" />
						<p className="text-foreground/70">Loading gacha...</p>
					</div>
				</div>
			}
		>
			<GachaDetailPageContent />
		</Suspense>
	);
}
