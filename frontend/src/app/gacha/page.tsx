"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAccount, useWriteContract } from "wagmi";
import GachaSpinner from "../../components/GachaSpinner";
import { AdminControls } from "../../components/AdminControls";
import { NFTAvailabilitySection } from "../../components/NFTAvailabilitySection";
import { ProfileDashboard } from "../../components/ProfileDashboard";
import { PlatformAnalytics } from "../../components/PlatformAnalytics";
import { RealTimeNotifications } from "../../components/RealTimeNotifications";
import {
	XCircleIcon,
	GiftIcon,
	SparklesIcon,
	ChartBarIcon,
	UserCircleIcon,
	CogIcon,
} from "@heroicons/react/24/outline";

import { GlassHeader } from "../../components/ui";
import { Button, Card } from "../../components/ui";
import { ArrowLeftIcon, BoltIcon } from "@heroicons/react/24/outline";
import { glassTypography } from "../../lib/theme-config";
import { getGachaConfig, formatGachaAddress } from "../../lib/gacha-config";
import {
	useReadGachaRewardsManagerGetUserTotalClaimableRewards,
	useReadGachaRewardsManagerGetUserRarityClaimableRewards,
	useReadGachaRewardsManagerGetRewardsAnalytics,
	useReadGachaTreasuryGetUserAllDepositCounts,
	useReadGachaFeeToken,
	useReadGachaOwner,
	useReadGachaTreasuryOwner,
	useReadGachaRewardsManagerOwner,
	useReadGachaRewardsManagerPaused,
} from "../../generated";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import {
	useClientSearchParam,
	useUpdateSearchParams,
} from "../../hooks/useClientSearchParams";
// import { RARITY_CONFIG, Rarity } from "../../lib/rarityConfig";

// interface RarityReward {
//   rarity: string;
//   amount: string;
//   deposits: number;
//   emoji: string;
//   color: string;
// }

function GachaDetailPageContent() {
	const router = useRouter();
	const { address: userAddress, isConnected } = useAccount();
	const [, setOptimisticClaim] = useState(false);
	const [, setOptimisticClaimedAmount] = useState<bigint | null>(null);
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const sectionParam = useClientSearchParam("section");
	const updateSearchParams = useUpdateSearchParams();
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
	} as Parameters<typeof useReadGachaOwner>[0]);

	const { data: treasuryOwner } = useReadGachaTreasuryOwner({
		address: gacha?.treasuryAddress as `0x${string}`,
		query: { enabled: !!gacha },
	} as Parameters<typeof useReadGachaTreasuryOwner>[0]);

	const { data: rewardsOwner } = useReadGachaRewardsManagerOwner({
		address: contracts.rewardsManager,
		query: { enabled: !!contracts.rewardsManager },
	} as Parameters<typeof useReadGachaRewardsManagerOwner>[0]);

	const isOwner =
		userAddress &&
		(userAddress === gachaOwner ||
			userAddress === treasuryOwner ||
			userAddress === rewardsOwner);

	// Check if rewards manager is paused
	useReadGachaRewardsManagerPaused({
		address: contracts.rewardsManager,
		query: { enabled: !!contracts.rewardsManager },
	});

	// Contract reads for rewards functionality
	useReadGachaFeeToken({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	} as Parameters<typeof useReadGachaFeeToken>[0]);

	// decimals not used on this page; omit to keep types clean

	const { refetch: refetchUserAnalytics } =
		useReadGachaRewardsManagerGetRewardsAnalytics({
			address: contracts.rewardsManager,
			args: userAddress && contracts.rewardsManager ? [userAddress] : undefined,
			query: { enabled: !!userAddress && !!contracts.rewardsManager },
		});

	const { refetch: refetchClaimable } =
		useReadGachaRewardsManagerGetUserTotalClaimableRewards({
			address: contracts.rewardsManager,
			args: userAddress && contracts.rewardsManager ? [userAddress] : undefined,
			query: { enabled: !!userAddress && !!contracts.rewardsManager },
		} as Parameters<
			typeof useReadGachaRewardsManagerGetUserTotalClaimableRewards
		>[0]);

	const { refetch: refetchDepositCounts } =
		useReadGachaTreasuryGetUserAllDepositCounts({
			address: contracts.treasury,
			args: userAddress && contracts.treasury ? [userAddress] : undefined,
			query: { enabled: !!userAddress && !!contracts.treasury },
		} as Parameters<typeof useReadGachaTreasuryGetUserAllDepositCounts>[0]);

	// Individual rarity claimable amounts
	const { refetch: refetchCommonClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: contracts.rewardsManager,
			args:
				userAddress && contracts.rewardsManager ? [userAddress, 0] : undefined,
			query: { enabled: !!userAddress && !!contracts.rewardsManager },
		});

	const { refetch: refetchUncommonClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: contracts.rewardsManager,
			args:
				userAddress && contracts.rewardsManager ? [userAddress, 1] : undefined,
			query: { enabled: !!userAddress && !!contracts.rewardsManager },
		});

	const { refetch: refetchRareClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: contracts.rewardsManager,
			args:
				userAddress && contracts.rewardsManager ? [userAddress, 2] : undefined,
			query: { enabled: !!userAddress && !!contracts.rewardsManager },
		});

	const { refetch: refetchEpicClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: contracts.rewardsManager,
			args:
				userAddress && contracts.rewardsManager ? [userAddress, 3] : undefined,
			query: { enabled: !!userAddress && !!contracts.rewardsManager },
		});

	const { refetch: refetchLegendaryClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: contracts.rewardsManager,
			args:
				userAddress && contracts.rewardsManager ? [userAddress, 4] : undefined,
			query: { enabled: !!userAddress && !!contracts.rewardsManager },
		});

	// Claim rewards mutation - use generic writeContract for individual tracker calls
	const { isSuccess: isClaimSuccess, error: claimError } = useWriteContract();

	// Local formatter was unused; rely on shared formatters in lib/utils

	// Handle tab navigation via URL
	const handleTabChange = useCallback(
		(section: ValidSection) => {
			updateSearchParams({ section });
		},
		[updateSearchParams],
	);

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
				analytics: "Analytics & Insights",
				rewards: "My Rewards & Profile",
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

	if (!gachaId) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Card className="p-6 text-center bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
					<XCircleIcon className="w-8 h-8 mx-auto mb-4 text-warning" />
					<h2 className="text-2xl font-medium text-foreground mb-2">
						Missing Gacha ID
					</h2>
					<p className="text-foreground/70 mb-6">
						Please provide a gacha ID in the URL parameters.
					</p>
					<Button
						className="rounded-xl bg-gradient-to-r from-warning to-orange-400 text-black"
						onPress={() => router.push("/discover")}
					>
						<span className="inline-flex items-center gap-2">
							<ArrowLeftIcon className="w-4 h-4" /> Back to Discovery
						</span>
					</Button>
				</Card>
			</div>
		);
	}

	if (!gacha) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Card className="p-6 text-center bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
					<XCircleIcon className="w-8 h-8 mx-auto mb-4 text-warning" />
					<h2 className="text-2xl font-medium text-foreground mb-2">
						Gacha Not Found
					</h2>
					<p className="text-foreground/70 mb-6">
						The gacha "{gachaId}" is not recognized or configured.
					</p>
					<Button
						className="rounded-xl bg-gradient-to-r from-warning to-orange-400 text-black"
						onPress={() => router.push("/discover")}
					>
						<span className="inline-flex items-center gap-2">
							<ArrowLeftIcon className="w-4 h-4" /> Back to Discovery
						</span>
					</Button>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-transparent">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl">
				{/* Header */}
				<div className="flex items-center gap-4 mb-8 lg:mb-12">
					<Button
						className="px-4 py-2 rounded-xl bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30 hover:border-white/30"
						onPress={() => router.push("/discover")}
					>
						<span className="flex items-center gap-2">
							<ArrowLeftIcon className="w-4 h-4" />
							<span className="hidden sm:inline">Back to Discovery</span>
							<span className="sm:hidden">Back</span>
						</span>
					</Button>
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
							variant: "secondary",
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
					<Card className="p-3 lg:p-4 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
						<div
							role="tablist"
							aria-label="Gacha navigation tabs"
							className="flex flex-col sm:flex-row gap-3 lg:gap-4"
						>
							<Button
								className={`flex-1 sm:flex-initial rounded-xl ${activeTab === "spin" ? "bg-gradient-to-r from-warning to-orange-400 text-black" : "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"}`}
								onPress={() => handleTabChange("spin")}
								role="tab"
								aria-selected={activeTab === "spin"}
								aria-controls="tabpanel-spin-&-play"
								tabIndex={activeTab === "spin" ? 0 : -1}
							>
								<span className="flex items-center gap-2">
									<BoltIcon className="w-4 h-4" />
									Spin & Play
								</span>
							</Button>
							<Button
								className={`flex-1 sm:flex-initial rounded-xl ${activeTab === "deposits" ? "bg-gradient-to-r from-warning to-orange-400 text-black" : "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"}`}
								onPress={() => handleTabChange("deposits")}
								role="tab"
								aria-selected={activeTab === "deposits"}
								aria-controls="tabpanel-deposits"
								tabIndex={activeTab === "deposits" ? 0 : -1}
							>
								<span className="flex items-center gap-2">
									<GiftIcon className="w-4 h-4" />
									NFT Deposits
								</span>
							</Button>
							<Button
								className={`flex-1 sm:flex-initial rounded-xl ${activeTab === "analytics" ? "bg-gradient-to-r from-warning to-orange-400 text-black" : "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"}`}
								onPress={() => handleTabChange("analytics")}
								role="tab"
								aria-selected={activeTab === "analytics"}
								aria-controls="tabpanel-analytics"
								tabIndex={activeTab === "analytics" ? 0 : -1}
							>
								<span className="flex items-center gap-2">
									<ChartBarIcon className="w-4 h-4" />
									Analytics
								</span>
							</Button>
							<Button
								className={`flex-1 sm:flex-initial rounded-xl ${activeTab === "rewards" ? "bg-gradient-to-r from-warning to-orange-400 text-black" : "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"}`}
								onPress={() => handleTabChange("rewards")}
								role="tab"
								aria-selected={activeTab === "rewards"}
								aria-controls="tabpanel-my-rewards"
								tabIndex={activeTab === "rewards" ? 0 : -1}
							>
								<span className="flex items-center gap-2">
									<UserCircleIcon className="w-4 h-4" />
									My Profile
								</span>
							</Button>
							{isOwner && (
								<Button
									className={`flex-1 sm:flex-initial rounded-xl ${activeTab === "admin" ? "bg-gradient-to-r from-warning to-orange-400 text-black" : "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"}`}
									onPress={() => handleTabChange("admin")}
									role="tab"
									aria-selected={activeTab === "admin"}
									aria-controls="tabpanel-admin"
									tabIndex={activeTab === "admin" ? 0 : -1}
								>
									<span className="flex items-center gap-2">
										<CogIcon className="w-4 h-4" />
										Admin
									</span>
								</Button>
							)}
						</div>
					</Card>
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
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.1 }}
								className="mb-8"
							>
								<h1
									className={`${glassTypography({ variant: "mainHeading" })} flex items-center gap-3 mb-2`}
								>
									<div className="w-8 h-8 bg-gradient-to-r from-warning/20 to-orange-400/20 rounded-lg flex items-center justify-center border border-warning/30">
										<SparklesIcon className="w-5 h-5 text-warning" />
									</div>
									Spin & Play
								</h1>
								<p className={glassTypography({ variant: "bodySecondary" })}>
									Try your luck and win amazing NFTs from the treasury!
								</p>
							</motion.div>
							<GachaSpinner />
						</div>
					)}

					{activeTab === "deposits" && (
						<div
							role="tabpanel"
							id="tabpanel-deposits"
							aria-labelledby="tab-deposits"
						>
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.1 }}
								className="mb-8"
							>
								<h1
									className={`${glassTypography({ variant: "mainHeading" })} flex items-center gap-3 mb-2`}
								>
									<div className="w-8 h-8 bg-gradient-to-r from-success/20 to-primary/20 rounded-lg flex items-center justify-center border border-success/30">
										<GiftIcon className="w-5 h-5 text-success" />
									</div>
									NFT Deposits
								</h1>
								<p className={glassTypography({ variant: "bodySecondary" })}>
									Deposit your NFTs to the treasury and earn rewards from every
									spin!
								</p>
							</motion.div>
							<NFTAvailabilitySection />
						</div>
					)}

					{activeTab === "analytics" && (
						<div
							role="tabpanel"
							id="tabpanel-analytics"
							aria-labelledby="tab-analytics"
						>
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.1 }}
								className="mb-8"
							>
								<h1
									className={`${glassTypography({ variant: "mainHeading" })} flex items-center gap-3 mb-2`}
								>
									<div className="w-8 h-8 bg-gradient-to-r from-primary/20 to-info/20 rounded-lg flex items-center justify-center border border-primary/30">
										<ChartBarIcon className="w-5 h-5 text-primary" />
									</div>
									Analytics & Insights
								</h1>
								<p className={glassTypography({ variant: "bodySecondary" })}>
									Explore platform statistics, treasury health, and global
									activity metrics.
								</p>
							</motion.div>
							<PlatformAnalytics />
						</div>
					)}

					{activeTab === "rewards" && (
						<div
							role="tabpanel"
							id="tabpanel-my-rewards"
							aria-labelledby="tab-my-rewards"
						>
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.1 }}
								className="mb-8"
							>
								<h1
									className={`${glassTypography({ variant: "mainHeading" })} flex items-center gap-3 mb-2`}
								>
									<div className="w-8 h-8 bg-gradient-to-r from-rarity-legendary-500/20 to-rarity-epic-500/20 rounded-lg flex items-center justify-center border border-rarity-legendary-500/30">
										<UserCircleIcon className="w-5 h-5 text-rarity-legendary-300" />
									</div>
									My Profile & Rewards
								</h1>
								<p className={glassTypography({ variant: "bodySecondary" })}>
									View your stats, claim rewards, and track your gacha journey.
								</p>
							</motion.div>
							<ProfileDashboard />
						</div>
					)}

					{activeTab === "admin" && gacha && (
						<div
							role="tabpanel"
							id="tabpanel-admin"
							aria-labelledby="tab-admin"
						>
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.1 }}
								className="mb-8"
							>
								<h1
									className={`${glassTypography({ variant: "mainHeading" })} flex items-center gap-3 mb-2`}
								>
									<div className="w-8 h-8 bg-gradient-to-r from-danger/20 to-warning/20 rounded-lg flex items-center justify-center border border-danger/30">
										<CogIcon className="w-5 h-5 text-danger" />
									</div>
									Admin Controls
								</h1>
								<p className={glassTypography({ variant: "bodySecondary" })}>
									Manage gacha settings, treasury parameters, and system
									configuration.
								</p>
							</motion.div>
							<AdminControls gacha={gacha} />
						</div>
					)}
				</motion.div>

				{/* Real-Time Notifications */}
				<RealTimeNotifications />
			</div>
		</div>
	);
}

export default function GachaDetailPage() {
	return <GachaDetailPageContent />;
}
