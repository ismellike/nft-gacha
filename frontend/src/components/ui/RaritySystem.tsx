"use client";

import { motion } from "framer-motion";
import { Rarity } from "../../lib/rarityConfig";
import { getRarityConfig } from "../../lib/rarityConfig";
import { Card, Chip } from "./GlassComponents";

// Get reward multiplier for each rarity tier
const getRewardMultiplier = (rarity: Rarity): string => {
	const multipliers = {
		[Rarity.Common]: "1.0",
		[Rarity.Uncommon]: "1.5",
		[Rarity.Rare]: "2.5",
		[Rarity.Epic]: "4.0",
		[Rarity.Legendary]: "8.0",
	};
	return multipliers[rarity];
};

interface RarityBadgeProps {
	rarity: Rarity;
	showEmoji?: boolean;
	size?: "sm" | "md" | "lg";
	className?: string;
}

export function RarityBadge({
	rarity,
	showEmoji = true,
	size = "md",
	className = "",
}: RarityBadgeProps) {
	const config = getRarityConfig(rarity);

	const sizeClasses = {
		sm: "px-2 py-1 text-xs",
		md: "px-3 py-1.5 text-sm",
		lg: "px-4 py-2 text-base",
	};

	return (
		<motion.div
			initial={{ scale: 0.9, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{ duration: 0.3 }}
		>
			<Chip
				className={`${sizeClasses[size]} ${className} bg-gradient-to-r ${config.bgGradient} border ${config.borderColor} text-white shadow-lg ${config.glowColor} backdrop-blur-xl`}
			>
				<span className="flex items-center gap-1.5 font-bold">
					{showEmoji && <span>{config.emoji}</span>}
					<span>{config.name}</span>
				</span>
			</Chip>
		</motion.div>
	);
}

interface RarityShowcaseProps {
	className?: string;
	animate?: boolean;
	onRarityClick?: (rarity: Rarity) => void;
}

export function RarityShowcase({
	className = "",
	animate = false,
	onRarityClick,
}: RarityShowcaseProps) {
	const rarities: Rarity[] = [
		Rarity.Common,
		Rarity.Uncommon,
		Rarity.Rare,
		Rarity.Epic,
		Rarity.Legendary,
	];

	return (
		<div className={`flex gap-3 flex-wrap ${className}`}>
			{rarities.map((rarity, index: number) => {
				return (
					<motion.div
						key={rarity.toString()}
						initial={{ opacity: 0, y: 20 }}
						animate={{
							opacity: 1,
							y: 0,
						}}
						transition={{
							duration: 0.5,
							delay: animate ? index * 0.1 : 0,
						}}
						whileHover={{ scale: 1.05 }}
						onClick={() => onRarityClick?.(rarity)}
						className="cursor-pointer"
					>
						<RarityBadge rarity={rarity} />
					</motion.div>
				);
			})}
		</div>
	);
}

interface RarityCardProps {
	rarity: Rarity;
	stats?: {
		count?: number;
		value?: string;
		description?: string;
	};
	onClick?: () => void;
	className?: string;
}

export function RarityCard({
	rarity,
	stats,
	onClick,
	className = "",
}: RarityCardProps) {
	const config = getRarityConfig(rarity);

	return (
		<motion.button
			onClick={onClick}
			className={`w-full ${className}`}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
		>
			<Card
				className={`h-full p-6 relative overflow-hidden bg-content1/20 backdrop-blur-xl border ${config.borderColor} hover:bg-content1/30 transition-all duration-300 ${config.glowColor} group`}
			>
				{/* Background gradient */}
				<div
					className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-5`}
				/>

				{/* Header */}
				<div className="flex justify-between items-start mb-4 relative z-10">
					<RarityBadge rarity={rarity} size="lg" />
					<div className="flex items-center gap-2">
						<div
							className={`w-3 h-3 rounded-full bg-gradient-to-r ${config.bgGradient} ${config.glowColor}`}
						/>
						<span className="text-xs text-foreground/60 uppercase tracking-wide font-medium">
							{config.name}
						</span>
					</div>
				</div>

				{/* Content */}
				<div className="relative z-10 space-y-3">
					<p className="text-foreground/80 leading-relaxed">
						{stats?.description || config.description}
					</p>

					{/* Reward multiplier indicator */}
					<div className="relative">
						<div className="flex items-center justify-center p-4 bg-content1/30 rounded-lg border border-white/10">
							<div className="text-center">
								<div
									className={`text-lg font-bold bg-gradient-to-r ${config.bgGradient} bg-clip-text text-transparent mb-1`}
								>
									{getRewardMultiplier(rarity)}x
								</div>
								<div className="text-xs text-foreground/60">
									Reward Multiplier
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Hover indicator */}
				<div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					<motion.div
						animate={{ x: [0, 4, 0] }}
						transition={{ duration: 1, repeat: 999 }}
					>
						<svg
							className="w-4 h-4 text-foreground/40"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-label="Arrow pointing right"
						>
							<title>Arrow right</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</motion.div>
				</div>
			</Card>
		</motion.button>
	);
}

interface SimpleRarityShowcaseProps {
	className?: string;
}

export function SimpleRarityShowcase({
	className = "",
}: SimpleRarityShowcaseProps) {
	return (
		<div className={`text-center ${className}`}>
			<h3 className="text-2xl font-bold mb-6 text-foreground">
				Five Rarity Tiers
			</h3>
			<p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
				From Common to Legendary, each tier offers increasing rewards and
				exclusivity
			</p>
			<RarityShowcase animate={true} className="justify-center" />
		</div>
	);
}
