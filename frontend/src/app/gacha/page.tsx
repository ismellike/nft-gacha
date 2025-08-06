"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import GachaSpinner from "../../components/GachaSpinner";
import { UserNFTModal } from "../../components/UserNFTModal";
import { AdminControls } from "../../components/AdminControls";
import { ThemedIcon } from "../../lib/icons";
import {
	GlassCard,
	GlassButton,
	StatsGridSkeleton,
	RarityBreakdownSkeleton,
} from "../../components/ui";
import { getGachaConfig, formatGachaAddress } from "../../lib/gacha-config";
import {
	useReadGachaRewardsManagerGetUserTotalClaimableRewards,
	useReadGachaRewardsManagerGetUserRarityClaimableRewards,
	useReadGachaRewardsManagerGetUserAnalytics,
	useReadGachaTreasuryGetUserAllDepositCounts,
	useReadErc20Decimals,
	useReadErc20Symbol,
	useWriteGachaRewardsManagerClaimAllRewards,
	useReadGachaFeeToken,
	useReadGachaOwner,
	useReadGachaTreasuryOwner,
	useReadGachaRewardsManagerOwner,
} from "../../generated";
import { env } from "../../env";
import { RARITY_CONFIG, Rarity } from "../../lib/rarityConfig";

interface RarityReward {
	rarity: string;
	amount: string;
	deposits: number;
	emoji: string;
	color: string;
}

export default function GachaDetailPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { address: userAddress, isConnected } = useAccount();
	const [showDepositModal, setShowDepositModal] = useState(false);
	const [optimisticClaim, setOptimisticClaim] = useState(false);
	const [optimisticClaimedAmount, setOptimisticClaimedAmount] = useState<
		bigint | null
	>(null);
	const [isRefetchingRewards, setIsRefetchingRewards] = useState(false);
	const gachaId = searchParams.get("id");
	const sectionParam = searchParams.get("section");
	const validSections = ["spin", "rewards", "admin"] as const;
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
		address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
		query: { enabled: !!gacha },
	});

	const isOwner =
		userAddress &&
		(userAddress === gachaOwner ||
			userAddress === treasuryOwner ||
			userAddress === rewardsOwner);

	// Contract reads for rewards functionality
	const { data: feeToken } = useReadGachaFeeToken({
		address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
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
		address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!userAddress },
	});

	const {
		data: totalClaimable,
		refetch: refetchClaimable,
		isLoading: isTotalClaimableLoading,
	} = useReadGachaRewardsManagerGetUserTotalClaimableRewards({
		address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!userAddress },
	});

	const {
		data: depositCounts,
		refetch: refetchDepositCounts,
		isLoading: isDepositCountsLoading,
	} = useReadGachaTreasuryGetUserAllDepositCounts({
		address: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!userAddress },
	});

	// Individual rarity claimable amounts
	const { data: commonClaimable, refetch: refetchCommonClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
			args: userAddress ? [userAddress, 0] : undefined,
			query: { enabled: !!userAddress },
		});

	const { data: uncommonClaimable, refetch: refetchUncommonClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
			args: userAddress ? [userAddress, 1] : undefined,
			query: { enabled: !!userAddress },
		});

	const { data: rareClaimable, refetch: refetchRareClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
			args: userAddress ? [userAddress, 2] : undefined,
			query: { enabled: !!userAddress },
		});

	const { data: epicClaimable, refetch: refetchEpicClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
			args: userAddress ? [userAddress, 3] : undefined,
			query: { enabled: !!userAddress },
		});

	const { data: legendaryClaimable, refetch: refetchLegendaryClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
			args: userAddress ? [userAddress, 4] : undefined,
			query: { enabled: !!userAddress },
		});

	// Claim rewards mutation
	const {
		writeContract: claimRewards,
		isPending: isClaimPending,
		isSuccess: isClaimSuccess,
		error: claimError,
	} = useWriteGachaRewardsManagerClaimAllRewards();

	// Format token amounts
	const formatTokenAmount = (amount: bigint | undefined) => {
		if (!amount || !tokenDecimals) return "0";
		return formatUnits(amount, tokenDecimals);
	};

	// Prepare rarity rewards data using official config
	const rarityRewards: RarityReward[] = [
		{
			rarity: RARITY_CONFIG[Rarity.Common].name,
			amount: formatTokenAmount(commonClaimable),
			deposits: depositCounts ? Number(depositCounts[0]) : 0,
			emoji: RARITY_CONFIG[Rarity.Common].emoji,
			color: RARITY_CONFIG[Rarity.Common].bgGradient,
		},
		{
			rarity: RARITY_CONFIG[Rarity.Uncommon].name,
			amount: formatTokenAmount(uncommonClaimable),
			deposits: depositCounts ? Number(depositCounts[1]) : 0,
			emoji: RARITY_CONFIG[Rarity.Uncommon].emoji,
			color: RARITY_CONFIG[Rarity.Uncommon].bgGradient,
		},
		{
			rarity: RARITY_CONFIG[Rarity.Rare].name,
			amount: formatTokenAmount(rareClaimable),
			deposits: depositCounts ? Number(depositCounts[2]) : 0,
			emoji: RARITY_CONFIG[Rarity.Rare].emoji,
			color: RARITY_CONFIG[Rarity.Rare].bgGradient,
		},
		{
			rarity: RARITY_CONFIG[Rarity.Epic].name,
			amount: formatTokenAmount(epicClaimable),
			deposits: depositCounts ? Number(depositCounts[3]) : 0,
			emoji: RARITY_CONFIG[Rarity.Epic].emoji,
			color: RARITY_CONFIG[Rarity.Epic].bgGradient,
		},
		{
			rarity: RARITY_CONFIG[Rarity.Legendary].name,
			amount: formatTokenAmount(legendaryClaimable),
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

	// Handle keyboard navigation for tabs
	const handleTabKeyDown = (
		e: React.KeyboardEvent,
		currentTab: ValidSection,
	) => {
		const tabs = validSections.filter(
			(section) => section !== "admin" || isOwner,
		);
		const currentIndex = tabs.indexOf(currentTab);

		let nextIndex = currentIndex;

		switch (e.key) {
			case "ArrowLeft":
				e.preventDefault();
				nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
				break;
			case "ArrowRight":
				e.preventDefault();
				nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
				break;
			case "Home":
				e.preventDefault();
				nextIndex = 0;
				break;
			case "End":
				e.preventDefault();
				nextIndex = tabs.length - 1;
				break;
			default:
				return;
		}

		handleTabChange(tabs[nextIndex]);
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

	const handleClaimRewards = () => {
		if (!userAddress || !totalClaimable || totalClaimable === BigInt(0)) {
			console.warn(
				"Cannot claim rewards: missing user address or no claimable amount",
			);
			return;
		}

		// Set optimistic state
		setOptimisticClaim(true);
		setOptimisticClaimedAmount(totalClaimable);

		try {
			claimRewards({
				address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
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
					<ThemedIcon
						name="x-circle"
						size="xl"
						className="mx-auto mb-4 text-warning"
					/>
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
					<ThemedIcon
						name="x-circle"
						size="xl"
						className="mx-auto mb-4 text-warning"
					/>
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
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl">
				{/* Header */}
				<motion.div
					className="mb-12 lg:mb-16"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
				>
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

					<div
						className={`bg-gradient-to-br ${gacha.theme} rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12 relative overflow-hidden`}
					>
						<div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent"></div>
						<div className="relative z-10">
							<h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-white mb-4 lg:mb-6 leading-tight">
								{gacha.title}
							</h1>
							<p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-3xl leading-relaxed mb-6 lg:mb-8">
								{gacha.description}
							</p>
							<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-white/70">
								<div className="flex items-center gap-2">
									<ThemedIcon name="shield-check" size="sm" />
									<span className="text-sm font-medium">Provably Fair</span>
								</div>
								<div className="flex items-center gap-2">
									<ThemedIcon name="link" size="sm" />
									<span className="text-xs sm:text-sm font-mono">
										{formatGachaAddress(gacha.address)}
									</span>
								</div>
							</div>
						</div>
					</div>
				</motion.div>

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
							<TabButton
								active={activeTab === "spin"}
								onClick={() => handleTabChange("spin")}
								onKeyDown={(e) => handleTabKeyDown(e, "spin")}
								icon="zap"
								label="Spin & Play"
							/>
							<TabButton
								active={activeTab === "rewards"}
								onClick={() => handleTabChange("rewards")}
								onKeyDown={(e) => handleTabKeyDown(e, "rewards")}
								icon="gift"
								label="My Rewards"
							/>
							{isOwner && (
								<TabButton
									active={activeTab === "admin"}
									onClick={() => handleTabChange("admin")}
									onKeyDown={(e) => handleTabKeyDown(e, "admin")}
									icon="settings"
									label="Admin"
								/>
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
										<ThemedIcon
											name="wallet"
											size="xl"
											className="mx-auto mb-4 text-warning"
										/>
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
																	: formatTokenAmount(totalClaimable)}{" "}
																{tokenSymbol || "TOKENS"}
															</h3>
															{optimisticClaim && (
																<motion.div
																	initial={{ opacity: 0, scale: 0.95 }}
																	animate={{ opacity: 1, scale: 1 }}
																	className="text-xs text-success mt-1 flex items-center gap-1"
																>
																	<ThemedIcon name="check" size="xs" />
																	<span>
																		Claiming{" "}
																		{formatTokenAmount(
																			optimisticClaimedAmount || BigInt(0),
																		)}{" "}
																		{tokenSymbol}...
																	</span>
																</motion.div>
															)}
														</div>
														<div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
															<ThemedIcon
																name="coins"
																size="xl"
																variant="accent"
															/>
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
																	? formatTokenAmount(userAnalytics[0])
																	: "0"}{" "}
																{tokenSymbol || "TOKENS"}
															</h3>
														</div>
														<div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
															<ThemedIcon
																name="check"
																size="xl"
																variant="success"
															/>
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
															<ThemedIcon
																name="gem"
																size="xl"
																className="text-purple-400"
															/>
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
																isRefetchingRewards
															}
															animate={true}
															aria-label={`Claim ${formatTokenAmount(totalClaimable)} ${tokenSymbol} in rewards`}
														>
															{optimisticClaim
																? "Processing Claim..."
																: "Claim All Rewards"}
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
																					{parseFloat(rarity.amount).toFixed(2)}{" "}
																					{tokenSymbol}
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
																				{parseFloat(rarity.amount).toFixed(2)}{" "}
																				{tokenSymbol}
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
												className="fixed bottom-8 right-8 z-50 max-w-sm"
											>
												<GlassCard
													variant="base"
													className="bg-danger/10 border border-danger/20 shadow-xl backdrop-blur-xl p-4"
												>
													<div className="flex items-start justify-between gap-3">
														<div className="flex-1">
															<div className="flex items-center gap-2 mb-2">
																<ThemedIcon
																	name="x-circle"
																	size="sm"
																	className="text-danger"
																/>
																<h4 className="font-semibold text-danger text-sm">
																	Transaction Failed
																</h4>
															</div>
															<p className="text-danger/80 text-sm mb-3">
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
															<div className="flex gap-2">
																<GlassButton
																	variant="danger"
																	size="sm"
																	onClick={retryClaimRewards}
																	isDisabled={isClaimPending}
																	aria-label="Retry claiming rewards"
																>
																	Retry
																</GlassButton>
															</div>
														</div>
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

				{/* Deposit Modal */}
				{showDepositModal && (
					<UserNFTModal
						collectionAddress=""
						isOpen={showDepositModal}
						onClose={() => setShowDepositModal(false)}
					/>
				)}
			</div>
		</div>
	);
}

// Tab Button Component
function TabButton({
	active,
	onClick,
	icon,
	label,
	onKeyDown,
}: {
	active: boolean;
	onClick: () => void;
	icon: string;
	label: string;
	onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
	return (
		<button
			onClick={onClick}
			onKeyDown={onKeyDown}
			role="tab"
			aria-selected={active}
			aria-controls={`tabpanel-${label.toLowerCase().replace(/\s+/g, "-")}`}
			tabIndex={active ? 0 : -1}
			className={`flex-1 sm:flex-initial flex items-center justify-center sm:justify-start gap-2 lg:gap-3 px-3 sm:px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-warning/50 focus:ring-offset-2 focus:ring-offset-background ${
				active
					? "bg-gradient-to-r from-warning to-orange-400 text-black shadow-[0_0_12px_rgba(255,191,0,0.4),0_0_24px_rgba(255,191,0,0.15)] drop-shadow-sm font-bold"
					: "bg-content1/20 text-foreground/70 hover:bg-content1/30 hover:text-foreground hover:shadow-[0_0_8px_rgba(255,255,255,0.12),0_0_16px_rgba(255,255,255,0.06)] shadow-[0_0_4px_rgba(255,255,255,0.02)] backdrop-blur-xl"
			}`}
		>
			<ThemedIcon name={icon} size="sm" />
			<span className="font-semibold text-sm lg:text-base whitespace-nowrap">
				{label}
			</span>
		</button>
	);
}
