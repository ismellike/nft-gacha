"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GachaCardHeaderProps {
	theme: string;
	children: ReactNode;
	className?: string;
}

export function GachaCardHeader({ theme, children, className = "" }: GachaCardHeaderProps) {
	return (
		<div className={`bg-gradient-to-br ${theme} relative overflow-hidden ${className}`}>
			{/* Enhanced glassmorphism overlays for depth */}
			<div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/8 to-transparent"></div>
			<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/12 to-white/15"></div>
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25"></div>
			
			{/* Additional glassmorphism layers */}
			<div className="absolute inset-0 backdrop-blur-[1px] bg-white/5"></div>
			<div className="absolute inset-0" style={{
				background: "radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, transparent 50%)"
			}}></div>
			
			{/* Enhanced animated background elements */}
			<motion.div
				className="absolute top-3 right-3 w-20 h-20 rounded-full bg-gradient-to-br from-white/25 via-white/15 to-transparent blur-xl opacity-80 shadow-2xl shadow-white/10"
				animate={{
					x: [0, 12, -8, 0],
					y: [0, -8, 12, 0],
					scale: [1, 1.15, 0.95, 1],
					opacity: [0.8, 1, 0.6, 0.8],
				}}
				transition={{
					duration: 12,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			></motion.div>
			<motion.div
				className="absolute bottom-3 left-3 w-24 h-24 rounded-full bg-gradient-to-tr from-white/15 via-white/8 to-transparent blur-2xl opacity-60 shadow-xl shadow-white/5"
				animate={{
					x: [0, -10, 6, 0],
					y: [0, 10, -6, 0],
					scale: [1, 0.85, 1.1, 1],
					opacity: [0.6, 0.3, 0.8, 0.6],
				}}
				transition={{
					duration: 15,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 3,
				}}
			></motion.div>
			
			{/* Additional smaller floating elements for depth */}
			<motion.div
				className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-lg opacity-40"
				animate={{
					x: [0, 6, -4, 0],
					y: [0, -4, 6, 0],
					scale: [0.8, 1.2, 0.9, 0.8],
					opacity: [0.4, 0.6, 0.3, 0.4],
				}}
				transition={{
					duration: 18,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 6,
				}}
			></motion.div>
			
			{/* Subtle border glow */}
			<div className="absolute inset-0 rounded-t-2xl border border-white/20 shadow-inner shadow-white/10"></div>

			{/* Content with enhanced backdrop */}
			<div className="relative z-10 p-6 backdrop-blur-[0.5px]">
				{children}
			</div>
		</div>
	);
}