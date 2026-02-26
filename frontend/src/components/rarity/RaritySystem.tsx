"use client";

import { motion } from "framer-motion";
import { getAllRarities, getRarityConfig } from "../../lib/rarityConfig";
import { Chip } from "../../ui";

interface RarityBadgeProps {
	rarity: number;
	showEmoji?: boolean;
	size?: "sm" | "md" | "lg";
	className?: string;
}

function RarityBadge({
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
	onRarityClick?: (rarity: number) => void;
}

function RarityShowcase({
	className = "",
	animate = false,
	onRarityClick,
}: RarityShowcaseProps) {
	const rarities: number[] = getAllRarities();

	return (
		<div className={`flex gap-3 flex-wrap ${className}`}>
			{rarities.map((rarity, index: number) => {
				return (
					<motion.div
						key={rarity}
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
