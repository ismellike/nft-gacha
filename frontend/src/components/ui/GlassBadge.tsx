/**
 * Reusable Glass Badge Component
 * Implements glassmorphism styling using HeroUI's custom variants system
 */

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { glassBadge } from "../../lib/theme-config";

interface GlassBadgeProps {
	children: ReactNode;
	variant?: "primary" | "secondary" | "info" | "success" | "warning" | "danger";
	size?: "sm" | "md" | "lg";
	className?: string;
	animate?: boolean;
	glow?: boolean;
	pulse?: boolean;
}

export function GlassBadge({
	children,
	variant = "info",
	size = "md",
	className,
	animate = false,
	glow = false,
	pulse = false,
}: GlassBadgeProps) {
	// Generate classes using our custom variant system
	const badgeStyles = glassBadge({
		variant,
		size,
		className: [
			glow && "shadow-xl shadow-current/30",
			pulse && "animate-pulse",
			className,
		]
			.filter(Boolean)
			.join(" "),
	});

	const BadgeComponent = animate ? motion.div : "div";

	const motionProps = animate
		? {
				initial: { scale: 0.95, opacity: 0 },
				animate: { scale: 1, opacity: 1 },
				transition: { type: "spring" as const, stiffness: 400, damping: 17 },
			}
		: {};

	return (
		<BadgeComponent className={badgeStyles} {...motionProps}>
			{children}
		</BadgeComponent>
	);
}
