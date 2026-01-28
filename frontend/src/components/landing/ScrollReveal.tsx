"use client";

import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

interface ScrollRevealProps {
	children: React.ReactNode;
	className?: string;
	delay?: number;
	direction?: "up" | "down" | "left" | "right";
	distance?: number;
	once?: boolean;
}

export function ScrollReveal({
	children,
	className = "",
	delay = 0,
	direction = "up",
	distance = 50,
	once = true,
}: ScrollRevealProps) {
	const controls = useAnimation();
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, {
		once,
		amount: 0.3,
	});

	const getInitialPosition = () => {
		// Check for reduced motion preference (SPA - always client-side)
		if (typeof window === "undefined") return { opacity: 0 };

		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		if (prefersReducedMotion) {
			return { opacity: 0 };
		}

		switch (direction) {
			case "up":
				return { y: distance, opacity: 0 };
			case "down":
				return { y: -distance, opacity: 0 };
			case "left":
				return { x: distance, opacity: 0 };
			case "right":
				return { x: -distance, opacity: 0 };
			default:
				return { y: distance, opacity: 0 };
		}
	};

	useEffect(() => {
		if (!isInView) return;

		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		controls.start({
			x: 0,
			y: 0,
			opacity: 1,
			transition: prefersReducedMotion
				? { duration: 0.01 }
				: {
						duration: 0.6,
						delay,
						ease: [0.25, 0.4, 0.25, 1],
					},
		});
	}, [controls, isInView, delay]);

	return (
		<motion.div
			ref={ref}
			initial={getInitialPosition()}
			animate={controls}
			className={className}
			suppressHydrationWarning
		>
			{children}
		</motion.div>
	);
}
