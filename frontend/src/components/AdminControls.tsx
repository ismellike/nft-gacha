"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, GlassButton, GlassBadge } from "@/components/ui";
import { 
	ShieldCheckIcon, 
	XCircleIcon, 
	CheckIcon, 
	Squares2X2Icon,
	CurrencyDollarIcon,
	FolderOpenIcon,
	BoltIcon,
	ExclamationTriangleIcon,
	WalletIcon
} from "@heroicons/react/24/outline";

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
import {
	useReadGachaOwner,
	useReadGachaTreasuryOwner,
	useReadGachaRewardsManagerOwner,
	useReadGachaSpinFee,
	useReadGachaGetRarityWeights,
	useWriteGachaSetSpinFee,
	useWriteGachaSetRarityWeights,
	useWriteGachaEmergencyPause,
	useWriteGachaEmergencyUnpause,
	useReadGachaPaused,
} from "@/generated";
import { formatUnits, parseUnits } from "viem";
import {
	formatTokenAmount,
	formatAddress,
	formatPercentage,
} from "@/lib/utils";
import { RARITY_CONFIG, Rarity } from "@/lib/rarityConfig";
import type { GachaConfig } from "@/lib/gacha-config";

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

	// Owner checks
	const { data: gachaOwner } = useReadGachaOwner({
		address: gacha.address as `0x${string}`,
	});

	const { data: treasuryOwner } = useReadGachaTreasuryOwner({
		address: gacha.treasuryAddress as `0x${string}`,
	});

	const { data: rewardsOwner } = useReadGachaRewardsManagerOwner({
		address: process.env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS as `0x${string}`,
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
	}, [isConnected, gachaOwner, treasuryOwner, rewardsOwner]);

	if (!isConnected) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<GlassCard className="p-12 text-center max-w-md">
					<WalletIcon className="w-8 h-8 mx-auto mb-6 text-warning" />
					<h2 className="text-2xl font-bold text-foreground mb-4">
						Connect Your Wallet
					</h2>
					<p className="text-foreground/70 mb-6">
						Please connect your wallet to access admin controls for this gacha.
					</p>
				</GlassCard>
			</div>
		);
	}

	if (isOwnerChecked && !isOwner) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<GlassCard className="p-12 text-center max-w-md">
					<ShieldCheckIcon className="w-8 h-8 mx-auto mb-6 text-danger" />
					<h2 className="text-2xl font-bold text-foreground mb-4">
						Access Denied
					</h2>
					<p className="text-foreground/70 mb-6">
						You are not authorized to access admin controls for this gacha. Only
						contract owners can access these settings.
					</p>
				</GlassCard>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="text-center"
			>
				<h2 className="text-4xl font-light mb-4 tracking-tight">
					<span className="bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
						Admin Controls
					</span>
				</h2>
				<p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed font-light">
					Manage settings and operations for {gacha.title}
				</p>

				<div className="flex items-center justify-center gap-3 mt-6">
					<GlassBadge variant="success">
						<ShieldCheckIcon className="w-4 h-4" />
						<span className="ml-1">Authorized Owner</span>
					</GlassBadge>
					<GlassBadge variant="info">
						<span className="font-mono text-xs">
							{userAddress ? formatAddress(userAddress) : ""}
						</span>
					</GlassBadge>
				</div>
			</motion.div>

			<div className="grid lg:grid-cols-4 gap-8">
				{/* Sidebar Navigation */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="lg:col-span-1"
				>
					<GlassCard className="p-6">
						<h3 className="text-lg font-semibold text-foreground mb-4">
							Control Sections
						</h3>
						<div className="space-y-2">
							{adminSections.map((section) => (
								<button
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
											{getAdminSectionIcon(section.icon, `w-5 h-5 ${activeSection === section.id ? "text-warning" : "text-foreground"}`)}
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
					</GlassCard>
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

// Individual Admin Sections
function RarityRatesSection({ gacha }: { gacha: GachaConfig }) {
	const [weights, setWeights] = useState([7000, 2000, 600, 300, 100]);
	const [isUpdating, setIsUpdating] = useState(false);

	const { data: currentWeights } = useReadGachaGetRarityWeights({
		address: gacha.address as `0x${string}`,
	});

	const { writeContract: setRarityWeights, isPending } =
		useWriteGachaSetRarityWeights();

	useEffect(() => {
		if (currentWeights) {
			setWeights(currentWeights.map((w: bigint) => Number(w)));
		}
	}, [currentWeights]);

	const handleWeightChange = (index: number, value: string) => {
		const newWeights = [...weights];
		newWeights[index] = parseInt(value) || 0;
		setWeights(newWeights);
	};

	const totalWeight = weights.reduce((sum, w) => sum + w, 0);
	const isValidTotal = totalWeight === 10000;

	const handleSave = () => {
		if (!isValidTotal) return;

		setRarityWeights({
			address: gacha.address as `0x${string}`,
			args: weights.map((w: number) => BigInt(w)) as [
				bigint,
				bigint,
				bigint,
				bigint,
				bigint,
			],
		});
	};

	return (
		<GlassCard className="p-8">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h2 className="text-2xl font-bold text-foreground mb-2">
						Rarity Drop Rates
					</h2>
					<p className="text-foreground/70">
						Configure the probability weights for each rarity tier. Total must
						equal 10,000.
					</p>
				</div>
				<GlassBadge variant={isValidTotal ? "success" : "danger"}>
					Total: {totalWeight.toLocaleString()}/10,000
				</GlassBadge>
			</div>

			<div className="grid md:grid-cols-2 gap-6 mb-8">
				{weights.map((weight, index) => {
					const rarity = Object.values(RARITY_CONFIG)[index];
					const percentage = formatPercentage(weight / 100, 2, true);

					return (
						<div key={index} className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<span className="text-xl">{rarity.emoji}</span>
									<div>
										<div className="font-semibold text-foreground">
											{rarity.name}
										</div>
										<div className="text-sm text-foreground/60">
											{percentage} drop rate
										</div>
									</div>
								</div>
							</div>

							<div className="relative">
								<input
									type="number"
									value={weight}
									onChange={(e) => handleWeightChange(index, e.target.value)}
									className="w-full bg-content1/20 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-foreground focus:border-warning/50 focus:outline-none transition-colors"
									placeholder="Weight (0-10000)"
									min="0"
									max="10000"
								/>
								<div className="absolute right-3 top-3 text-sm text-foreground/60">
									/ 10,000
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<div className="flex justify-end gap-4">
				<GlassButton
					variant="secondary"
					onClick={() =>
						currentWeights &&
						setWeights(currentWeights.map((w: bigint) => Number(w)))
					}
				>
					Reset to Current
				</GlassButton>
				<GlassButton
					variant="primary"
					startIcon="check"
					onClick={handleSave}
					isDisabled={!isValidTotal}
					isLoading={isPending}
					loadingText="Updating..."
				>
					Save Changes
				</GlassButton>
			</div>
		</GlassCard>
	);
}

function SpinFeesSection({ gacha }: { gacha: GachaConfig }) {
	const [newFee, setNewFee] = useState("");

	const { data: currentFee } = useReadGachaSpinFee({
		address: gacha.address as `0x${string}`,
	});

	const { writeContract: setSpinFee, isPending } = useWriteGachaSetSpinFee();

	const handleSave = () => {
		if (!newFee) return;

		try {
			const feeInWei = parseUnits(newFee, 18);
			setSpinFee({
				address: gacha.address as `0x${string}`,
				args: [feeInWei],
			});
		} catch (error) {
			console.error("Invalid fee amount:", error);
		}
	};

	return (
		<GlassCard className="p-8">
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-foreground mb-2">
					Spin Fee Configuration
				</h2>
				<p className="text-foreground/70">
					Set the token amount required for each gacha spin.
				</p>
			</div>

			<div className="space-y-6">
				<div>
					<label className="block text-sm font-medium text-foreground mb-2">
						Current Spin Fee
					</label>
					<div className="bg-content1/10 border border-white/10 rounded-xl p-4">
						<div className="text-2xl font-bold text-warning">
							{currentFee
								? formatTokenAmount(currentFee, 18, {
										maxDecimals: 4,
										suffix: " TOKENS",
									})
								: "0 TOKENS"}
						</div>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-foreground mb-2">
						New Spin Fee (in TOKENS)
					</label>
					<input
						type="number"
						value={newFee}
						onChange={(e) => setNewFee(e.target.value)}
						className="w-full bg-content1/20 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-foreground focus:border-warning/50 focus:outline-none transition-colors"
						placeholder="Enter fee amount (e.g., 10.5)"
						step="0.01"
						min="0"
					/>
				</div>

				<div className="flex justify-end gap-4">
					<GlassButton variant="secondary" onClick={() => setNewFee("")}>
						Clear
					</GlassButton>
					<GlassButton
						variant="primary"
						startIcon="coins"
						onClick={handleSave}
						isDisabled={!newFee}
						isLoading={isPending}
						loadingText="Updating..."
					>
						Update Fee
					</GlassButton>
				</div>
			</div>
		</GlassCard>
	);
}

function WhitelistSection() {
	return (
		<GlassCard className="p-8">
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-foreground mb-2">
					Collection Whitelist
				</h2>
				<p className="text-foreground/70">
					Manage approved NFT collections for deposits.
				</p>
			</div>

			<div className="text-center py-12">
				<FolderOpenIcon className="w-8 h-8 mx-auto mb-4 text-foreground/40" />
				<h3 className="text-lg font-medium text-foreground/60 mb-2">
					Coming Soon
				</h3>
				<p className="text-foreground/40">
					Whitelist management interface will be available in the next update.
				</p>
			</div>
		</GlassCard>
	);
}

function DepositsSection() {
	return (
		<GlassCard className="p-8">
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-foreground mb-2">
					Pending Deposits
				</h2>
				<p className="text-foreground/70">
					Review and approve NFT deposits from contributors.
				</p>
			</div>

			<div className="text-center py-12">
				<FolderOpenIcon className="w-8 h-8 mx-auto mb-4 text-foreground/40" />
				<h3 className="text-lg font-medium text-foreground/60 mb-2">
					No Pending Deposits
				</h3>
				<p className="text-foreground/40">
					All deposits have been processed. New deposits will appear here for
					review.
				</p>
			</div>
		</GlassCard>
	);
}

function EmergencySection({ gacha }: { gacha: GachaConfig }) {
	const { data: isPaused } = useReadGachaPaused({
		address: gacha.address as `0x${string}`,
	});

	const { writeContract: pauseContract, isPending: isPausing } =
		useWriteGachaEmergencyPause();
	const { writeContract: unpauseContract, isPending: isUnpausing } =
		useWriteGachaEmergencyUnpause();

	const handlePause = () => {
		pauseContract({
			address: gacha.address as `0x${string}`,
		});
	};

	const handleUnpause = () => {
		unpauseContract({
			address: gacha.address as `0x${string}`,
		});
	};

	return (
		<GlassCard className="p-8">
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-foreground mb-2">
					Emergency Controls
				</h2>
				<p className="text-foreground/70">
					Pause or unpause contract operations in case of emergency.
				</p>
			</div>

			<div className="space-y-6">
				<div className="flex items-center justify-between p-6 bg-content1/10 border border-white/10 rounded-xl">
					<div>
						<h3 className="text-lg font-semibold text-foreground">
							Contract Status
						</h3>
						<p className="text-foreground/60">
							Current operational state of the gacha contract
						</p>
					</div>
					<GlassBadge variant={isPaused ? "danger" : "success"} size="lg">
						{isPaused ? <XCircleIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
						<span className="ml-2">{isPaused ? "PAUSED" : "ACTIVE"}</span>
					</GlassBadge>
				</div>

				<div className="flex gap-4">
					{!isPaused ? (
						<GlassButton
							variant="danger"
							size="lg"
							startIcon="x-circle"
							onClick={handlePause}
							isLoading={isPausing}
							loadingText="Pausing..."
							className="flex-1"
						>
							Pause Contract
						</GlassButton>
					) : (
						<GlassButton
							variant="primary"
							size="lg"
							startIcon="check"
							onClick={handleUnpause}
							isLoading={isUnpausing}
							loadingText="Unpausing..."
							className="flex-1"
						>
							Unpause Contract
						</GlassButton>
					)}
				</div>

				<div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
					<div className="flex items-start gap-3">
						<ExclamationTriangleIcon className="w-5 h-5 text-warning mt-0.5" />
						<div>
							<h4 className="font-semibold text-warning mb-1">
								Emergency Use Only
							</h4>
							<p className="text-warning/80 text-sm">
								Pausing the contract will stop all spinning operations. Only use
								in case of security issues or critical bugs. Users will not be
								able to spin until unpaused.
							</p>
						</div>
					</div>
				</div>
			</div>
		</GlassCard>
	);
}
