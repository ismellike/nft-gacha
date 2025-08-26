"use client";

import { GlassCard, GlassButton, GlassBadge } from "@/components/ui";
import { motion } from "framer-motion";
import Link from "next/link";
import {
	CurrencyDollarIcon,
	BoltIcon,
	TrophyIcon,
	ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { RealTimeNotifications } from "../components/RealTimeNotifications";

const rarityColors = [
	"from-primary-400 to-primary-600",
	"from-success-400 to-success-600",
	"from-secondary-400 to-secondary-600",
	"from-primary-500 to-primary-700",
	"from-warning-400 to-warning-600",
];

const features = [
	{
		icon: "coins",
		title: "On-Chain Treasury",
		description:
			"Prize pools and deposits live entirely on-chain. No black boxes—treasury flows are enforced by contracts and visible to everyone.",
		stats: "Transparent by Design",
	},
	{
		icon: "trending",
		title: "Real-Time Analytics",
		description:
			"Inspect spins, deposits, and treasury composition in real time. Every state change is queryable and auditable.",
		stats: "Open Data",
	},
	{
		icon: "trophy",
		title: "Provably Fair Spins",
		description:
			"Randomness is delivered via WAVS with signed proofs and verified on-chain before fulfillment—spins are cryptographically fair.",
		stats: "WAVS-Backed RNG",
	},
];

const pillars = [
	{
		label: "Provably Fair Randomness",
		detail: "WAVS-signed, on-chain verified",
	},
	{ label: "On-Chain Treasury", detail: "Transparent prize pools" },
	{ label: "Open Analytics", detail: "Live, queryable data" },
	{
		label: "Self-Custody Friendly",
		detail: "Deposit and withdraw by contract",
	},
];

export default function LandingPage() {
	const [currentRarity, setCurrentRarity] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentRarity((prev) => (prev + 1) % rarityColors.length);
		}, 2000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="min-h-screen bg-transparent">
			{/* Hero Section - Redesigned */}
			<section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
				{/* Animated Background Elements */}
				<div className="absolute inset-0">
					{Array.from({ length: 6 }, (_, i) => `bg-${i}`).map((id, i) => (
						<motion.div
							key={id}
							className="absolute w-64 h-64 rounded-full"
							style={{
								background: `radial-gradient(circle, ${rarityColors[i % rarityColors.length].replace("from-", "rgba(").replace(" to-", ", 0.03) 0%, rgba(").replace("-400", "").replace("-600", ", 0.01)")} 100%)`,
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
							}}
							animate={{
								x: [0, Math.random() * 100 - 50],
								y: [0, Math.random() * 100 - 50],
								scale: [1, 1.1, 1],
							}}
							transition={{
								duration: 10 + Math.random() * 10,
								repeat: Infinity,
								ease: "easeInOut",
								delay: i * 2,
							}}
						/>
					))}
				</div>

				<div className="relative z-10 text-center max-w-6xl mx-auto">
					{/* Beta Badge */}
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.1, duration: 0.6 }}
						className="mb-8"
					>
						<GlassBadge
							variant="primary"
							className="inline-flex items-center gap-2 text-sm px-4 py-2"
							glow
							animate
						>
							<CurrencyDollarIcon className="w-4 h-4" />
							<span className="font-medium">Community-Funded NFT Gacha</span>
						</GlassBadge>
					</motion.div>

					{/* Main Heading */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.8 }}
						className="mb-8"
					>
						<h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
							<span className="bg-gradient-to-r from-warning via-warning to-warning-500 bg-clip-text text-transparent">
								Provably Fair NFT Gacha
							</span>
							<br />
							<span className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground/80">
								Deposit. Contribute. Spin with Proof.
							</span>
						</h1>
					</motion.div>

					{/* Subtitle */}
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4, duration: 0.8 }}
						className="text-lg md:text-xl lg:text-2xl text-foreground/80 mb-12 max-w-4xl mx-auto leading-relaxed"
					>
						A community-owned trading card gacha built on open, verifiable tech.
						Deposit graded cards to fund prize pools and earn protocol rewards,
						or spin to reveal authentic, graded Pokémon cards.
						<span className="text-warning font-medium">
							{" "}
							Cryptographic fairness
						</span>{" "}
						and transparent mechanics from spin to settlement.
					</motion.p>

					{/* CTA Buttons */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6, duration: 0.8 }}
						className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
					>
						<Link href="/gacha/?id=graded-pokemon&section=spin">
							<GlassButton
								variant="primary"
								size="lg"
								startIcon="dice"
								className="min-w-56 h-14 text-lg font-semibold"
								animate={true}
							>
								Start Spinning
							</GlassButton>
						</Link>

						<Link href="/gacha/?id=graded-pokemon&section=analytics">
							<GlassButton
								variant="secondary"
								size="lg"
								startIcon="trending"
								className="min-w-56 h-14 text-lg"
								animate={true}
							>
								View Analytics
							</GlassButton>
						</Link>
					</motion.div>

					{/* Tech Pillars Row (no faux stats) */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8, duration: 0.8 }}
						className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto"
					>
						{pillars.map((p, index) => (
							<motion.div
								key={p.label}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.8 + index * 0.08, duration: 0.5 }}
								className="flex items-center justify-center"
							>
								<GlassBadge
									variant="primary"
									size="lg"
									glow
									className="whitespace-nowrap"
								>
									{p.label}
								</GlassBadge>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Features Section - Enhanced */}
			<section className="py-24 px-4 relative">
				<div className="max-w-7xl mx-auto">
					{/* Section Header */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center mb-20"
					>
						<GlassBadge variant="primary" className="mb-6" glow animate>
							<CurrencyDollarIcon className="w-4 h-4" />
							<span className="ml-2">Community Benefits</span>
						</GlassBadge>
						<h2 className="text-4xl md:text-6xl font-bold mb-8">
							<span className="bg-gradient-to-r from-warning to-warning bg-clip-text text-transparent">
								Earn While You
							</span>
							<br />
							<span className="text-foreground">Contribute</span>
						</h2>
						<p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
							Community-owned economics meet verifiable randomness. Contributors
							earn based on transparent rarity weights; spinners get fair
							outcomes backed by cryptographic proofs.
						</p>
					</motion.div>

					{/* Features Grid */}
					<div className="grid lg:grid-cols-3 gap-8 mb-20">
						{features.map((feature, index) => (
							<motion.div
								key={feature.title}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: index * 0.2 }}
								viewport={{ once: true }}
								className="group"
							>
								<GlassCard
									variant="highlight"
									className="h-full p-8 text-center relative overflow-hidden group-hover:shadow-xl group-hover:shadow-warning/20"
									animate={true}
								>
									{/* Icon */}
									<div className="relative z-10 w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-warning/25 to-orange-400/25 rounded-2xl flex items-center justify-center ring-1 ring-warning/30 group-hover:shadow-xl group-hover:shadow-warning/30 transition-all duration-300">
										{feature.icon === "coins" && (
											<CurrencyDollarIcon className="w-8 h-8 text-warning" />
										)}
										{feature.icon === "trending" && (
											<ChartBarIcon className="w-8 h-8 text-warning" />
										)}
										{feature.icon === "trophy" && (
											<TrophyIcon className="w-8 h-8 text-warning" />
										)}
									</div>

									{/* Content */}
									<div className="relative z-10">
										<div className="flex items-center justify-center gap-3 mb-4">
											<h3 className="text-xl font-bold text-foreground">
												{feature.title}
											</h3>
											<GlassBadge
												variant="primary"
												size="sm"
												className="text-xs"
												glow
											>
												{feature.stats}
											</GlassBadge>
										</div>
										<p className="text-foreground/70 leading-relaxed">
											{feature.description}
										</p>
									</div>
								</GlassCard>
							</motion.div>
						))}
					</div>

					{/* Rarity Showcase */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center"
					>
						<GlassCard className="p-12">
							<h3 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
								Rarity-Based Rewards
							</h3>
							<p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
								Higher-rarity deposits receive proportionally higher rewards.
								All rarity weights and distributions are on-chain and
								verifiable.
							</p>
							<div className="flex justify-center items-center gap-4 flex-wrap">
								{["Common", "Uncommon", "Rare", "Epic", "Legendary"].map(
									(rarity, index) => (
										<motion.div
											key={rarity}
											animate={
												currentRarity === index ? { scale: 1.1 } : { scale: 1 }
											}
											transition={{ duration: 0.3 }}
										>
											<GlassBadge
												variant={
													currentRarity === index ? "primary" : "secondary"
												}
												glow={currentRarity === index}
												className={`${currentRarity === index ? "shadow-lg shadow-warning/40" : ""}`}
											>
												{rarity}
											</GlassBadge>
										</motion.div>
									),
								)}
							</div>
						</GlassCard>
					</motion.div>
				</div>
			</section>

			{/* CTA Section - Redesigned */}
			<section className="py-24 px-4 relative">
				<div className="max-w-5xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						<GlassCard
							variant="highlight"
							className="p-12 md:p-16 text-center"
							animate
						>
							<motion.div
								animate={{ rotate: [0, 5, -5, 0] }}
								transition={{
									duration: 4,
									repeat: Infinity,
									ease: "easeInOut",
								}}
								className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-warning to-orange-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-warning/40 ring-2 ring-warning/30"
							>
								<BoltIcon className="w-8 h-8 text-black" />
							</motion.div>

							<h2 className="text-3xl md:text-5xl font-bold mb-6">
								<span className="bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
									Join the Community
								</span>
							</h2>
							<p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-3xl mx-auto leading-relaxed">
								Deposit to contribute liquidity—or spin to reveal. Built and
								owned by the community with transparency at every step.
							</p>

							<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
								<Link href="/gacha">
									<GlassButton
										variant="primary"
										size="lg"
										className="min-w-64 h-16 text-xl font-bold"
										startIcon="dice"
										animate={true}
									>
										Enter Gacha Platform
									</GlassButton>
								</Link>

								<div className="flex items-center gap-3 text-foreground/60">
									<TrophyIcon className="w-5 h-5 text-warning" />
									<span className="text-sm font-medium">
										Community Owned & Operated
									</span>
								</div>
							</div>
						</GlassCard>
					</motion.div>
				</div>
			</section>
			{/* Real-Time Notifications */}
			<RealTimeNotifications />
		</div>
	);
}
