"use client";

import { motion } from "framer-motion";
import { getAllRarities, getRarityColorHex } from "../../lib/rarityConfig";

interface SubtleHeroBackgroundProps {
	className?: string;
}

/**
 * SubtleHeroBackground - Dynamic animated background matching the rarity theme.
 * Uses the rarity color palette (Common → Legendary) with smooth, flowing animations.
 */
export function SubtleHeroBackground({
	className = "",
}: SubtleHeroBackgroundProps) {
	const rarities = getAllRarities();

	return (
		<div
			className={`absolute inset-0 overflow-hidden ${className}`}
			aria-hidden="true"
		>
			{/* Base ambient glow layer */}
			<motion.div
				className="absolute rounded-full blur-3xl"
				style={{
					width: "800px",
					height: "800px",
					left: "20%",
					top: "10%",
					background:
						"radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)",
				}}
				animate={{
					scale: [1, 1.2, 1],
					opacity: [0.3, 0.5, 0.3],
				}}
				transition={{
					duration: 12,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
				}}
			/>

			{/* Rarity color flows - larger, smoother orbs */}
			{rarities.map((rarity, i) => {
				const colorHex = getRarityColorHex(rarity, 500);
				const colorWithAlpha = `${colorHex}15`;

				return (
					<motion.div
						key={rarity}
						className="absolute rounded-full blur-3xl"
						style={{
							width: `${500 + i * 120}px`,
							height: `${500 + i * 120}px`,
							background: `radial-gradient(circle, ${colorWithAlpha} 0%, transparent 70%)`,
							left: `${5 + i * 18}%`,
							top: `${-5 + i * 15}%`,
						}}
						animate={{
							y: [0, -40, 0],
							x: [0, 25, 0],
							scale: [1, 1.15, 1],
							opacity: [0.2, 0.45, 0.2],
						}}
						transition={{
							duration: 14 + i * 2,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
							delay: i * 0.8,
						}}
					/>
				);
			})}

			{/* Secondary floating orbs with warning/orange theme */}
			<motion.div
				className="absolute rounded-full blur-3xl"
				style={{
					width: "600px",
					height: "600px",
					right: "10%",
					bottom: "10%",
					background:
						"radial-gradient(circle, rgba(251, 146, 60, 0.1) 0%, transparent 70%)",
				}}
				animate={{
					y: [0, -35, 0],
					x: [0, -20, 0],
					scale: [1, 1.1, 1],
					opacity: [0.25, 0.4, 0.25],
				}}
				transition={{
					duration: 16,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
					delay: 1,
				}}
			/>

			{/* Legendary accent orb */}
			<motion.div
				className="absolute rounded-full blur-3xl"
				style={{
					width: "450px",
					height: "450px",
					left: "40%",
					bottom: "20%",
					background:
						"radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 65%)",
				}}
				animate={{
					y: [0, -25, 0],
					scale: [1, 1.2, 1],
					opacity: [0.2, 0.35, 0.2],
				}}
				transition={{
					duration: 11,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
					delay: 2,
				}}
			/>

			{/* Small floating accent orbs using rarity colors */}
			{[
				{ rarity: 2, x: "15%", y: "60%", size: 180, delay: 0.5 },
				{ rarity: 3, x: "75%", y: "30%", size: 200, delay: 1.5 },
				{ rarity: 4, x: "50%", y: "75%", size: 160, delay: 2.5 },
				{ rarity: 1, x: "85%", y: "65%", size: 140, delay: 3 },
			].map((orb, i) => {
				const colorHex = getRarityColorHex(orb.rarity, 500);
				const colorWithAlpha = `${colorHex}18`;

				return (
					<motion.div
						key={`accent-${orb.rarity}`}
						className="absolute rounded-full blur-2xl"
						style={{
							width: orb.size,
							height: orb.size,
							left: orb.x,
							top: orb.y,
							background: `radial-gradient(circle, ${colorWithAlpha} 0%, transparent 70%)`,
						}}
						animate={{
							y: [0, -20, 0],
							x: [0, 15, 0],
							scale: [1, 1.15, 1],
							opacity: [0.15, 0.35, 0.15],
						}}
						transition={{
							duration: 9 + i,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
							delay: orb.delay,
						}}
					/>
				);
			})}

			{/* Subtle shimmering overlay */}
			<motion.div
				className="absolute inset-0 opacity-[0.02]"
				style={{
					background:
						"linear-gradient(135deg, transparent 40%, rgba(251, 191, 36, 0.3) 50%, transparent 60%)",
				}}
				animate={{
					x: ["-100%", "100%"],
				}}
				transition={{
					duration: 20,
					repeat: Number.POSITIVE_INFINITY,
					ease: "linear",
				}}
			/>
		</div>
	);
}
