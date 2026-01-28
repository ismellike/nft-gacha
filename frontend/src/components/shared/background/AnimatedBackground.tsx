"use client";

import { motion, useReducedMotion } from "framer-motion";
import { memo, useCallback, useEffect, useState } from "react";

interface FloatingElement {
	id: string;
	x: number;
	y: number;
	size: number;
	duration: number;
	delay: number;
	opacity: number;
	type: "orb" | "logo" | "crystal" | "particle";
}

export const AnimatedBackground = memo(() => {
	const shouldReduceMotion = useReducedMotion();
	const [elements, setElements] = useState<FloatingElement[]>([]);

	// Removed window resize tracking (not used in animations)

	useEffect(() => {
		if (shouldReduceMotion) {
			return;
		}

		const generateElements = () => {
			const newElements: FloatingElement[] = [];

			// Generate floating orbs
			for (let i = 0; i < 5; i++) {
				newElements.push({
					id: `orb-${i}`,
					x: Math.random() * 100,
					y: Math.random() * 100,
					size: Math.random() * 200 + 100,
					duration: Math.random() * 15 + 10,
					delay: Math.random() * 5,
					opacity: Math.random() * 0.15 + 0.05, // Reduced but still visible
					type: "orb",
				});
			}

			// Generate crystal particles
			for (let i = 0; i < 8; i++) {
				newElements.push({
					id: `crystal-${i}`,
					x: Math.random() * 100,
					y: Math.random() * 100,
					size: Math.random() * 8 + 4,
					duration: Math.random() * 8 + 6,
					delay: Math.random() * 4,
					opacity: Math.random() * 0.2 + 0.1,
					type: "crystal",
				});
			}

			// Generate small particles
			for (let i = 0; i < 12; i++) {
				newElements.push({
					id: `particle-${i}`,
					x: Math.random() * 100,
					y: Math.random() * 100,
					size: Math.random() * 3 + 1,
					duration: Math.random() * 12 + 8,
					delay: Math.random() * 6,
					opacity: Math.random() * 0.15 + 0.05,
					type: "particle",
				});
			}

			setElements(newElements);
		};

		generateElements();
	}, [shouldReduceMotion]);

	// Removed mouse tracking to avoid unused state and simplify dependencies

	const getElementComponent = useCallback((element: FloatingElement) => {
		switch (element.type) {
			case "orb":
				return (
					<motion.div
						key={element.id}
						className="absolute rounded-full bg-gradient-to-br from-warning/30 via-warning/20 to-transparent blur-2xl"
						style={{
							left: `${element.x}%`,
							top: `${element.y}%`,
							width: element.size,
							height: element.size,
							opacity: element.opacity,
						}}
						animate={{
							x: [0, 30, 0, -20, 0],
							y: [0, -25, 0, 20, 0],
							scale: [1, 1.1, 0.9, 1.05, 1],
						}}
						transition={{
							duration: element.duration,
							delay: element.delay,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
				);

			case "crystal":
				return (
					<motion.div
						key={element.id}
						className="absolute"
						style={{
							left: `${element.x}%`,
							top: `${element.y}%`,
							width: element.size * 3, // Made bigger
							height: element.size * 3,
							opacity: element.opacity,
						}}
						animate={{
							x: [0, 40, -20, 0],
							y: [0, -30, 20, 0],
							rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360],
							scale: [1, 2, 1.5, 1],
						}}
						transition={{
							duration: element.duration,
							delay: element.delay,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					>
						<div className="w-full h-full bg-gradient-to-br from-warning/80 to-warning/60 rotate-45 rounded-lg shadow-2xl shadow-warning/50 border border-warning/30" />
					</motion.div>
				);

			case "particle":
				return (
					<motion.div
						key={element.id}
						className="absolute rounded-full bg-gradient-to-br from-white/80 to-warning/60 shadow-lg shadow-warning/30 border border-white/20"
						style={{
							left: `${element.x}%`,
							top: `${element.y}%`,
							width: element.size * 4, // Made much bigger
							height: element.size * 4,
							opacity: element.opacity,
						}}
						animate={{
							x: [0, 60, -40, 0],
							y: [0, -50, 30, 0],
							scale: [0, 2, 1, 2, 0],
							opacity: [0, 1, 0.5, 1, 0],
						}}
						transition={{
							duration: element.duration,
							delay: element.delay,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
				);

			default:
				return null;
		}
	}, []);

	if (shouldReduceMotion) {
		return (
			<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
				<div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black" />
				<div className="absolute inset-0 opacity-5">
					<div
						className="absolute inset-0"
						style={{
							backgroundImage: `
								linear-gradient(rgba(234, 179, 8, 0.08) 1px, transparent 1px),
								linear-gradient(90deg, rgba(234, 179, 8, 0.08) 1px, transparent 1px)
							`,
							backgroundSize: "50px 50px",
						}}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
			{/* Enhanced gradient background */}
			<div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black" />

			{/* Central glow effect */}
			<motion.div
				className="absolute inset-0"
				animate={{
					background: [
						"radial-gradient(ellipse at 50% 50%, rgba(234, 179, 8, 0.03) 0%, transparent 50%)",
						"radial-gradient(ellipse at 60% 40%, rgba(251, 146, 60, 0.04) 0%, transparent 60%)",
						"radial-gradient(ellipse at 40% 60%, rgba(234, 179, 8, 0.03) 0%, transparent 50%)",
					],
				}}
				transition={{
					duration: 20,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Floating elements */}
			<div className="absolute inset-0">
				{elements.map(getElementComponent)}
			</div>

			{/* Grid overlay */}
			<div
				className="absolute inset-0 opacity-5"
				style={{
					backgroundImage: `
						linear-gradient(rgba(234, 179, 8, 0.1) 1px, transparent 1px),
						linear-gradient(90deg, rgba(234, 179, 8, 0.1) 1px, transparent 1px)
					`,
					backgroundSize: "50px 50px",
				}}
			/>

			{/* Corner accents */}
			<div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-warning/5 to-transparent rounded-full blur-3xl" />
			<div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-warning/3 to-transparent rounded-full blur-3xl" />
			<div className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-bl from-warning/4 to-transparent rounded-full blur-2xl" />
		</div>
	);
});
AnimatedBackground.displayName = "AnimatedBackground";
