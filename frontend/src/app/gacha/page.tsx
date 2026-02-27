"use client";

import {
	ArrowLeftIcon,
	BoltIcon,
	ChartBarIcon,
	ClockIcon,
	CogIcon,
	UserCircleIcon,
	XCircleIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useAccount, useReadContract } from "wagmi";
import { BuybackNotificationProvider } from "../../components/economy";
import {
	FlowSwitcher,
	SpinSection,
} from "../../components/gacha";
import {
	ContractStatusAnnouncer,
	InlineRetryMessage,
	useContractStatusAnnouncer,
} from "../../components/shared/feedback";
import { GachaRefreshProvider } from "../../contexts/GachaRefreshContext";
import {
	gachaAbi,
	gachaEconomyManagerAbi,
	gachaTreasuryAbi,
	useReadGachaEconomyManagerPaused,
} from "../../generated";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import { useGachaSections } from "../../hooks/useGachaSections";
import { useRewardsData } from "../../hooks/useRewardsData";
import { getGachaConfig } from "../../lib/gacha-config";
import { logger } from "../../lib/logger";
import { Button, Card, CardSkeleton, Chip } from "../../ui";

// Lazy-load non-default sections to reduce initial bundle size.
// SpinSection is the default view and is always loaded eagerly.
const VaultSection = dynamic(
	() =>
		import("../../components/gacha/sections/VaultSection").then(
			(m) => m.VaultSection,
		),
	{
		loading: () => (
			<div className="space-y-6">
				<div className="grid gap-6 lg:grid-cols-3">
					<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
					<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
					<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
				</div>
			</div>
		),
		ssr: false,
	},
);

const EconomySection = dynamic(
	() =>
		import("../../components/gacha/sections/EconomySection").then(
			(m) => m.EconomySection,
		),
	{
		loading: () => (
			<div className="space-y-6">
				<div className="grid gap-6 lg:grid-cols-2">
					<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
					<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
				</div>
			</div>
		),
		ssr: false,
	},
);

const SpinHistorySection = dynamic(
	() =>
		import("../../components/spin-history/SpinHistorySection").then(
			(m) => m.SpinHistorySection,
		),
	{
		loading: () => (
			<div className="space-y-6">
				<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
				<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
			</div>
		),
		ssr: false,
	},
);

const AdminSection = dynamic(
	() =>
		import("../../components/gacha/sections/AdminSection").then(
			(m) => m.AdminSection,
		),
	{
		loading: () => (
			<div className="space-y-6">
				<div className="grid gap-6 lg:grid-cols-3">
					<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
					<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
					<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
				</div>
			</div>
		),
		ssr: false,
	},
);

type FlowOption = {
	id: "spin" | "vault" | "economy" | "history" | "admin";
	label: string;
	icon: typeof BoltIcon;
	description: string;
};

function GachaDetailPageContent() {
	const router = useRouter();
	const { address: userAddress, isConnected } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const { status: contractStatus } = useContractStatusAnnouncer();

	const gacha = useMemo(
		() => (gachaId ? getGachaConfig(gachaId) : null),
		[gachaId],
	);

	// Owner checks for admin access - use useReadContract directly to avoid deep instantiation
	const {
		data: gachaOwner,
		isLoading: isLoadingGachaOwner,
		isError: isGachaOwnerError,
	} = useReadContract({
		address: gacha?.address as `0x${string}`,
		abi: gachaAbi,
		functionName: "owner",
		query: { enabled: isConnected && !!gacha },
	});

	const {
		data: treasuryOwner,
		isLoading: isLoadingTreasuryOwner,
		isError: isTreasuryOwnerError,
	} = useReadContract({
		address: gacha?.treasuryAddress as `0x${string}`,
		abi: gachaTreasuryAbi,
		functionName: "owner",
		query: { enabled: isConnected && !!gacha },
	});

	const {
		data: rewardsOwner,
		isLoading: isLoadingRewardsOwner,
		isError: isRewardsOwnerError,
	} = useReadContract({
		address: contracts.economyManager,
		abi: gachaEconomyManagerAbi,
		functionName: "owner",
		query: { enabled: isConnected && !!contracts.economyManager },
	});

	// Show loading skeleton while fetching owner permissions
	const isLoadingOwnerData =
		isLoadingGachaOwner || isLoadingTreasuryOwner || isLoadingRewardsOwner;

	const isOwner = Boolean(
		userAddress &&
			(userAddress === gachaOwner ||
				userAddress === treasuryOwner ||
				userAddress === rewardsOwner),
	);
	const shouldGateAdmin = Boolean(
		isConnected && gachaOwner && treasuryOwner && rewardsOwner,
	);

	const rewardsData = useRewardsData();

	const { activeSection, selectSection } = useGachaSections({
		isOwner,
		gachaTitle: gacha?.title ?? null,
		defaultSection: "spin",
		shouldGateAdmin,
	});

	// Check if rewards manager is paused only when admin tools are visible
	useReadGachaEconomyManagerPaused({
		address: contracts.economyManager,
		query: {
			enabled:
				isConnected &&
				activeSection === "admin" &&
				Boolean(contracts.economyManager),
		},
	} as Parameters<typeof useReadGachaEconomyManagerPaused>[0]);

	// When users land on Vault ensure balances are fresh
	// Use a ref for rewardsData to avoid dependency issues
	const rewardsDataRef = useRef(rewardsData);
	rewardsDataRef.current = rewardsData;

	useEffect(() => {
		if (activeSection === "vault" && userAddress) {
			const refetchAllRewardsData = async () => {
				try {
					await rewardsDataRef.current.refetchAllRewardsData();
				} catch (error) {
					logger.general.warn("Some rewards data failed to refetch:", error);
				}
			};

			refetchAllRewardsData();
		}
	}, [activeSection, userAddress]);

	const flowOptions = useMemo(() => {
		const base: FlowOption[] = [
			{
				id: "spin",
				label: "Spin",
				icon: BoltIcon,
				description: "Play & reveal rewards",
			},
			{
				id: "vault",
				label: "Vault",
				icon: UserCircleIcon,
				description: "Manage deposits & yield",
			},
			{
				id: "economy",
				label: "Economy",
				icon: ChartBarIcon,
				description: "Protocol economics",
			},
			{
				id: "history",
				label: "History",
				icon: ClockIcon,
				description: "Your spin history",
			},
		];

		if (isOwner) {
			base.push({
				id: "admin",
				label: "Admin",
				icon: CogIcon,
				description: "Owner tools",
			});
		}

		return base;
	}, [isOwner]);

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
					<Button color="glassPrimary" onPress={() => router.push("/discover")}>
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
					<Button color="glassPrimary" onPress={() => router.push("/discover")}>
						<span className="inline-flex items-center gap-2">
							<ArrowLeftIcon className="w-4 h-4" /> Back to Discovery
						</span>
					</Button>
				</Card>
			</div>
		);
	}

	return (
		<BuybackNotificationProvider gachaId={gachaId}>
			<GachaRefreshProvider>
				<div className="min-h-screen bg-transparent">
					{/* Global contract status announcer */}
					<div className="fixed top-4 right-2 sm:right-4 z-50 max-w-[calc(100vw-1rem)] sm:max-w-sm">
						<ContractStatusAnnouncer status={contractStatus} compact />
					</div>
					<header className="mx-auto w-full max-w-7xl px-4 pt-8 sm:pt-12 sm:px-6 lg:px-8">
						<div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
							<div className="flex items-start gap-3 sm:gap-4">
								<Button
									className="mt-1 p-2 rounded-xl border border-white/20 bg-content1/20 text-foreground hover:bg-content1/30 focus:outline-none focus:ring-2 focus:ring-warning/50 focus:ring-offset-2 focus:ring-offset-background shrink-0"
									onPress={() => router.push("/discover")}
									aria-label="Go back to discovery page"
								>
									<ArrowLeftIcon className="w-5 h-5" />
								</Button>
								<div className="space-y-1 min-w-0">
									<Chip color="success" size="sm">
										<span
											className="flex h-2 w-2 rounded-full bg-success"
											aria-hidden="true"
										/>
										Live
									</Chip>
									<h1 className="text-lg font-semibold text-foreground sm:text-xl md:text-3xl">
										{gacha.title}
									</h1>
									<p className="text-sm text-foreground/60 md:text-base max-w-2xl">
										{gacha.description}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3 rounded-xl border border-white/10 bg-content1/20 px-4 py-3 text-sm text-foreground/70 self-start lg:self-auto">
								<div className="flex flex-col">
									<span className="text-xs uppercase tracking-wide text-foreground/50">
										Status
									</span>
									<span className="font-medium text-success">Operational</span>
								</div>
							</div>
						</div>

						<FlowSwitcher
							className="mt-6 sm:mt-8"
							options={flowOptions}
							activeId={activeSection}
							onSelect={(section) => selectSection(section as FlowOption["id"])}
						/>
					</header>

					{/* Error messages for contract reads */}
					<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
						{(isGachaOwnerError ||
							isTreasuryOwnerError ||
							isRewardsOwnerError) && (
							<InlineRetryMessage
								type="contract"
								message="Failed to load owner permissions. Some admin features may be unavailable."
								className="mb-4"
							/>
						)}
					</div>

					<div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
						<motion.div
							key={activeSection}
							initial={{ opacity: 0, y: 24 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.35 }}
						>
							{activeSection === "spin" && (
								<SpinSection
									title="Spin & win provably fair NFT rewards"
									description="Leverage WAVS randomness to reveal vaulted NFTs with real-time transaction feedback across every step of the spin."
								/>
							)}

							{activeSection === "vault" && (
								<VaultSection
									title="Manage vault and withdraw yield"
									description="Monitor deposited NFTs, track USDC yield earnings, and withdraw your assets with on-chain receipts for every action."
								/>
							)}

							{activeSection === "economy" && (
								<EconomySection
									title="Gacha Economy Overview"
									description="Track protocol revenue, depositor yields, and treasury performance for this specific gacha."
								/>
							)}

							{activeSection === "history" && (
								<SpinHistorySection
									gachaAddress={gacha?.address ?? ""}
									gachaId={gachaId}
									appraisalContractAddress={contracts.appraisal ?? undefined}
									protocolTreasuryAddress={
										contracts.protocolTreasury ?? undefined
									}
									treasuryAddress={contracts.treasury ?? undefined}
								/>
							)}

							{activeSection === "admin" &&
								(isLoadingOwnerData ? (
									<div className="space-y-6">
										<div className="grid gap-6 lg:grid-cols-3">
											<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
											<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
											<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
										</div>
									</div>
								) : (
									gacha && <AdminSection gacha={gacha} />
								))}
						</motion.div>
					</div>
				</div>
			</GachaRefreshProvider>
		</BuybackNotificationProvider>
	);
}

export default function GachaDetailPage() {
	return <GachaDetailPageContent />;
}
