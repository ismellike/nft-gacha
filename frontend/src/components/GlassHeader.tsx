"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { GlassCard } from "./ui";
import {
	ShieldCheckIcon,
	GiftIcon,
	ChartBarIcon,
	PlusIcon,
	LinkIcon,
} from "@heroicons/react/24/outline";

// Helper function to map icon names to components
function getIconComponent(iconName: string, props: any) {
	const iconMap: Record<string, any> = {
		"shield-check": ShieldCheckIcon,
		gem: GiftIcon,
		trending: ChartBarIcon,
		plus: PlusIcon,
		link: LinkIcon,
	};

	const IconComponent = iconMap[iconName];
	if (!IconComponent) {
		console.warn(`Icon "${iconName}" not found`);
		return null;
	}

	return <IconComponent {...props} />;
}

interface GlassHeaderProps {
	title: string;
	subtitle?: string;
	description?: string;
	badges?: Array<{
		icon: string;
		text: string;
		variant?: "primary" | "secondary" | "success" | "warning" | "info";
	}>;
	gradient?: string;
	children?: ReactNode;
	className?: string;
}

export function GlassHeader({
	title,
	subtitle,
	description,
	badges = [],
	gradient = "from-warning/20 via-warning/10 to-transparent",
	children,
	className = "",
}: GlassHeaderProps) {
	return (
		<motion.div
			className={`mb-16 ${className}`}
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
		>
			{/* Glassmorphism Header Card */}
			<GlassCard
				variant="highlight"
				padding="none"
				className="relative overflow-hidden border border-white/20 mb-12"
			>
				{/* Clean glassmorphism overlays for depth */}
				<div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
				<div className="absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-black/10"></div>

				{/* Content */}
				<div className="relative z-10 p-6 sm:p-8 lg:p-12 text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.3 }}
					>
						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight mb-6 lg:mb-8 tracking-tight leading-tight text-foreground">
							{title}
							{subtitle && (
								<>
									<br />
									<span className="text-foreground/80 font-light">
										{subtitle}
									</span>
								</>
							)}
						</h1>

						{description && (
							<p className="text-lg sm:text-xl lg:text-2xl text-foreground/80 max-w-4xl mx-auto leading-relaxed mb-8 lg:mb-10">
								{description}
							</p>
						)}

						{/* Feature badges */}
						{badges.length > 0 && (
							<div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-8">
								{badges.map((badge, index) => (
									<motion.div
										key={index}
										className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
										whileHover={{ scale: 1.05 }}
										transition={{ type: "spring", stiffness: 300 }}
									>
										{getIconComponent(badge.icon, {
											className: `w-4 h-4 ${
												badge.variant === "success"
													? "text-success"
													: badge.variant === "warning"
														? "text-warning"
														: badge.variant === "info"
															? "text-primary"
															: badge.variant === "primary"
																? "text-warning"
																: "text-foreground/60"
											}`,
										})}
										<span className="text-sm font-medium text-foreground/90">
											{badge.text}
										</span>
									</motion.div>
								))}
							</div>
						)}

						{/* Custom children content */}
						{children}
					</motion.div>
				</div>
			</GlassCard>
		</motion.div>
	);
}
