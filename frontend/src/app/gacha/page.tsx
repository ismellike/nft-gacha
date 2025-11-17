"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import {
	ArrowLeftIcon,
	BoltIcon,
	UserCircleIcon,
	CogIcon,
	XCircleIcon,
	ChartBarIcon,
} from "@heroicons/react/24/outline";

import { Button, Card } from "../../ui";
import { FlowSwitcher } from "../../components/gacha/FlowSwitcher";
import { SpinSection } from "../../components/gacha/SpinSection";
import { VaultSection } from "../../components/gacha/VaultSection";
import { AdminSection } from "../../components/gacha/AdminSection";
import { EconomySection } from "../../components/gacha/EconomySection";
import { getGachaConfig } from "../../lib/gacha-config";
import {
	useReadGachaFeeToken,
	useReadGachaOwner,
	useReadGachaTreasuryOwner,
	useReadGachaEconomyManagerOwner,
	useReadGachaEconomyManagerPaused,
} from "../../generated";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import { useRewardsData } from "../../hooks/useRewardsData";
import { useGachaSections } from "../../hooks/useGachaSections";
import { BuybackNotificationProvider } from "../../components/BuybackNotificationProvider";

type FlowOption = {
	id: "spin" | "vault" | "economy" | "admin";
	label: string;
	icon: typeof BoltIcon;
	description: string;
};

function GachaDetailPageContent() {
	const router = useRouter();
	const { address: userAddress, isConnected } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const gacha = useMemo(
		() => (gachaId ? getGachaConfig(gachaId) : null),
		[gachaId],
	);

	// Owner checks for admin access
	const { data: gachaOwner } = useReadGachaOwner({
		address: gacha?.address as `0x${string}`,
		query: { enabled: !!gacha },
	} as Parameters<typeof useReadGachaOwner>[0]);

	const { data: treasuryOwner } = useReadGachaTreasuryOwner({
		address: gacha?.treasuryAddress as `0x${string}`,
		query: { enabled: !!gacha },
	} as Parameters<typeof useReadGachaTreasuryOwner>[0]);

	const { data: rewardsOwner } = useReadGachaEconomyManagerOwner({
		address: contracts.economyManager,
		query: { enabled: !!contracts.economyManager },
	} as Parameters<typeof useReadGachaEconomyManagerOwner>[0]);

	const isOwner = Boolean(
		userAddress &&
			(userAddress === gachaOwner ||
				userAddress === treasuryOwner ||
				userAddress === rewardsOwner),
	);
	const shouldGateAdmin = Boolean(
		isConnected && gachaOwner && treasuryOwner && rewardsOwner,
	);

	// Check if rewards manager is paused (kept warm for subcomponents)
	useReadGachaEconomyManagerPaused({
		address: contracts.economyManager,
		query: { enabled: !!contracts.economyManager },
	} as Parameters<typeof useReadGachaEconomyManagerPaused>[0]);

	// Contract reads for rewards functionality
	useReadGachaFeeToken({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	} as Parameters<typeof useReadGachaFeeToken>[0]);

	const rewardsData = useRewardsData();

	const { activeSection, selectSection } = useGachaSections({
		isOwner,
		gachaTitle: gacha?.title ?? null,
		defaultSection: "spin",
		shouldGateAdmin,
	});

	// When users land on Vault ensure balances are fresh
	useEffect(() => {
		if (activeSection === "vault" && userAddress) {
			const refetchAllRewardsData = async () => {
				try {
					await rewardsData.refetchAllRewardsData();
				} catch (error) {
					console.warn("Some rewards data failed to refetch:", error);
				}
			};

			refetchAllRewardsData();
		}
	}, [activeSection, userAddress, rewardsData]);

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
			<div className="min-h-screen bg-transparent">
				<header className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
						<div className="flex items-start gap-4">
							<Button
								className="p-2 rounded-xl border border-white/15 bg-content1/20 text-foreground hover:bg-content1/30"
								onPress={() => router.push("/discover")}
							>
								<ArrowLeftIcon className="w-5 h-5" />
							</Button>
							<div className="space-y-1">
								<span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-foreground/40">
									<span className="flex h-2 w-2 rounded-full bg-success" />
									Live
								</span>
								<h1 className="text-xl font-semibold text-foreground md:text-3xl">
									{gacha.title}
								</h1>
								<p className="text-sm text-foreground/60 md:text-base max-w-2xl">
									{gacha.description}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 rounded-xl border border-white/10 bg-content1/20 px-4 py-3 text-sm text-foreground/70">
							<div className="flex flex-col">
								<span className="text-xs uppercase tracking-wide text-foreground/50">
									Status
								</span>
								<span className="font-medium text-success">Operational</span>
							</div>
						</div>
					</div>

					<FlowSwitcher
						className="mt-8"
						options={flowOptions}
						activeId={activeSection}
						onSelect={(section) => selectSection(section as FlowOption["id"])}
					/>
				</header>

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

						{activeSection === "admin" && gacha && (
							<AdminSection gacha={gacha} />
						)}
					</motion.div>
				</div>
			</div>
		</BuybackNotificationProvider>
	);
}

export default function GachaDetailPage() {
	return <GachaDetailPageContent />;
}
