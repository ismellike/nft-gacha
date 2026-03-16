"use client";

import {
	BoltIcon,
	CurrencyDollarIcon,
	FolderOpenIcon,
	ShieldCheckIcon,
	Squares2X2Icon,
	WalletIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Card } from "../../ui";

import {
	gachaAbi,
	gachaEconomyManagerAbi,
	gachaTreasuryAbi,
} from "@/generated";
import { env } from "@/lib/env";
import type { GachaConfig } from "@/lib/gacha-config";
import {
	DepositsSection,
	EmergencySection,
	RarityRatesSection,
	SpinFeesSection,
	WhitelistSection,
} from "./admin";

// Helper function to get admin section icons
function getAdminSectionIcon(iconName: string, className: string = "w-5 h-5") {
	switch (iconName) {
		case "dice":
			return <Squares2X2Icon className={className} />;
		case "coins":
			return <CurrencyDollarIcon className={className} />;
		case "shield-check":
			return <ShieldCheckIcon className={className} />;
		case "folder-open":
			return <FolderOpenIcon className={className} />;
		case "zap":
			return <BoltIcon className={className} />;
		default:
			return <ShieldCheckIcon className={className} />;
	}
}

interface AdminControlsProps {
	gacha: GachaConfig;
}

interface AdminSection {
	id: string;
	title: string;
	description: string;
	icon: string;
	badge?: string;
}

const adminSections: AdminSection[] = [
	{
		id: "rates",
		title: "Rarity Rates",
		description: "Configure drop rates for each rarity tier",
		icon: "dice",
	},
	{
		id: "fees",
		title: "Spin Fees",
		description: "Set the cost for each gacha spin",
		icon: "coins",
	},
	{
		id: "whitelist",
		title: "Collection Whitelist",
		description: "Manage approved NFT collections",
		icon: "shield-check",
	},
	{
		id: "deposits",
		title: "Pending Deposits",
		description: "Review and approve NFT deposits",
		icon: "folder-open",
	},
	{
		id: "emergency",
		title: "Emergency Controls",
		description: "Pause/unpause contract operations",
		icon: "zap",
	},
];

export function AdminControls({ gacha }: AdminControlsProps) {
	const { address: userAddress, isConnected } = useAccount();
	const [activeSection, setActiveSection] = useState("rates");
	const [isOwnerChecked, setIsOwnerChecked] = useState(false);

	// Owner checks - use useReadContract directly to avoid wagmi deep instantiation
	const { data: gachaOwner } = useReadContract({
		address: gacha.address as `0x${string}`,
		abi: gachaAbi,
		functionName: "owner",
	});

	const { data: treasuryOwner } = useReadContract({
		address: gacha.treasuryAddress as `0x${string}`,
		abi: gachaTreasuryAbi,
		functionName: "owner",
	});

	const rewardsManager = env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS as
		| `0x${string}`
		| undefined;
	const { data: rewardsOwner } = useReadContract({
		address: rewardsManager,
		abi: gachaEconomyManagerAbi,
		functionName: "owner",
		query: { enabled: !!rewardsManager },
	});

	const isOwner =
		userAddress &&
		(userAddress === gachaOwner ||
			userAddress === treasuryOwner ||
			userAddress === rewardsOwner);

	useEffect(() => {
		if (isConnected) {
			setIsOwnerChecked(true);
		}
	}, [isConnected]);

	if (!isConnected) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Card className="p-6 sm:p-12 text-center max-w-md bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
					<WalletIcon className="w-8 h-8 mx-auto mb-6 text-warning" />
					<h2 className="text-2xl font-bold text-foreground mb-4">
						Connect Your Wallet
					</h2>
					<p className="text-foreground/70 mb-6">
						Please connect your wallet to access admin controls for this gacha.
					</p>
				</Card>
			</div>
		);
	}

	if (isOwnerChecked && !isOwner) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Card className="p-6 sm:p-12 text-center max-w-md bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
					<ShieldCheckIcon className="w-8 h-8 mx-auto mb-6 text-danger" />
					<h2 className="text-2xl font-bold text-foreground mb-4">
						Access Denied
					</h2>
					<p className="text-foreground/70 mb-6">
						You are not authorized to access admin controls for this gacha. Only
						contract owners can access these settings.
					</p>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="grid gap-8 lg:grid-cols-4">
				{/* Sidebar Navigation */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="lg:col-span-1"
				>
					<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
						<h3 className="text-lg font-semibold text-foreground mb-4">
							Control Sections
						</h3>
						<div className="space-y-2">
							{adminSections.map((section) => (
								<button
									type="button"
									key={section.id}
									onClick={() => setActiveSection(section.id)}
									className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
										activeSection === section.id
											? "bg-gradient-to-r from-warning/20 to-orange-400/20 border border-warning/30 shadow-lg shadow-warning/10"
											: "hover:bg-content1/20 hover:border-white/10 border border-transparent"
									}`}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											{getAdminSectionIcon(
												section.icon,
												`w-5 h-5 ${activeSection === section.id ? "text-warning" : "text-foreground"}`,
											)}
											<div>
												<div className="font-medium text-foreground text-sm">
													{section.title}
												</div>
												<div className="text-xs text-foreground/60">
													{section.description}
												</div>
											</div>
										</div>
									</div>
								</button>
							))}
						</div>
					</Card>
				</motion.div>

				{/* Main Content */}
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="lg:col-span-3"
				>
					<AnimatePresence mode="wait">
						<motion.div
							key={activeSection}
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.3 }}
						>
							{activeSection === "rates" && (
								<RarityRatesSection gacha={gacha} />
							)}
							{activeSection === "fees" && <SpinFeesSection gacha={gacha} />}
							{activeSection === "whitelist" && <WhitelistSection />}
							{activeSection === "deposits" && <DepositsSection />}
							{activeSection === "emergency" && (
								<EmergencySection gacha={gacha} />
							)}
						</motion.div>
					</AnimatePresence>
				</motion.div>
			</div>
		</div>
	);
}
