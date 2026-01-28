/**
 * RevealStep Component
 * Animated metadata reveal step for progressive NFT reveal animation
 */

"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { getRarityConfig, Rarity } from "../../lib/rarityConfig";
import { getSpringConfig } from "../../lib/revealAnimationConfig";

interface RevealStepProps {
	label: string;
	value: string | ReactNode;
	delay: number;
	duration: number;
	rarity: Rarity;
	icon?: ReactNode;
	className?: string;
}

export default function RevealStep({
	label,
	value,
	delay,
	duration,
	rarity,
	icon,
	className = "",
}: RevealStepProps) {
	const rarityConfig = getRarityConfig(rarity);
	const springConfig = getSpringConfig(rarity);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20, scale: 0.8 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{
				delay,
				duration,
				...springConfig,
			}}
			className={`
				glass-card
				flex items-center gap-3 px-6 py-3
				border border-white/20 rounded-xl
				backdrop-blur-xl bg-content1/60
				shadow-xl ${rarityConfig.glowColor}
				${className}
			`}
		>
			{icon && (
				<motion.div
					initial={{ scale: 0, rotate: -180 }}
					animate={{ scale: 1, rotate: 0 }}
					transition={{
						delay,
						duration: duration * 0.7,
						type: "spring",
						stiffness: 200,
						damping: 10,
					}}
					className="text-2xl"
				>
					{icon}
				</motion.div>
			)}

			<div className="flex flex-col items-start gap-0.5">
				<motion.span
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: delay + 0.1, duration: duration * 0.5 }}
					className="text-xs uppercase tracking-wider text-foreground/60 font-semibold"
				>
					{label}
				</motion.span>
				<motion.span
					initial={{ opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{
						delay: delay + 0.15,
						duration: duration * 0.6,
						type: "spring",
						stiffness: 150,
						damping: 15,
					}}
					className={`text-lg font-bold ${rarityConfig.textColor}`}
				>
					{value}
				</motion.span>
			</div>

			{/* Sparkle effect for rare+ */}
			{rarity >= Rarity.Rare && (
				<motion.div
					className="absolute inset-0 pointer-events-none"
					initial={{ opacity: 0 }}
					animate={{ opacity: [0, 1, 0] }}
					transition={{
						delay,
						duration: duration * 0.5,
						times: [0, 0.5, 1],
					}}
				>
					<div
						className={`absolute inset-0 rounded-xl bg-gradient-to-r ${rarityConfig.bgGradient} opacity-20 blur-xl`}
					/>
				</motion.div>
			)}
		</motion.div>
	);
}

/**
 * RevealStepGroup Component
 * Groups multiple reveal steps with staggered layout
 */
interface RevealStepGroupProps {
	children: ReactNode;
	className?: string;
}

export function RevealStepGroup({
	children,
	className = "",
}: RevealStepGroupProps) {
	return (
		<div className={`flex flex-col gap-3 items-center ${className}`}>
			{children}
		</div>
	);
}
