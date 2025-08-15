"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GachaCardHeaderProps {
	theme: string;
	children: ReactNode;
	className?: string;
}

export function GachaCardHeader({
	theme,
	children,
	className = "",
}: GachaCardHeaderProps) {
	return (
		<div className={`relative overflow-hidden rounded-t-2xl ${className}`}>
			{/* Clean glassmorphism overlays for depth */}
			<div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-t-2xl"></div>
			<div className="absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-black/10 rounded-t-2xl"></div>

			{/* Subtle border */}
			<div className="absolute inset-0 rounded-t-2xl border border-white/20"></div>

			{/* Content */}
			<div className="relative z-10 p-6">{children}</div>
		</div>
	);
}
