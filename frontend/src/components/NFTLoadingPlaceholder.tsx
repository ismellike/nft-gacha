"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/theme-config";
import type { Rarity } from "../lib/rarityConfig";
import { getRarityConfig } from "../lib/rarityConfig";

interface NFTLoadingPlaceholderProps {
	size?: "sm" | "md" | "lg" | "xl";
	animate?: boolean;
	className?: string;
	error?: string | null;
	rarity?: Rarity;
	showProgress?: boolean;
	progress?: number; // 0-100
}

export function NFTLoadingPlaceholder({
	size = "md",
	animate = true,
	className,
	error,
	rarity,
	showProgress = false,
	progress = 0,
}: NFTLoadingPlaceholderProps) {
	const sizeClasses = {
		sm: { container: "w-32 h-32", icon: "w-10 h-10", textSize: "text-xs" },
		md: { container: "w-80 h-80", icon: "w-20 h-20", textSize: "text-sm" },
		lg: { container: "w-96 h-96", icon: "w-32 h-32", textSize: "text-base" },
		xl: {
			container: "w-[480px] h-[480px]",
			icon: "w-40 h-40",
			textSize: "text-lg",
		},
	};

	const classes = sizeClasses[size];
	const rarityConfig = rarity ? getRarityConfig(rarity) : null;

	// Shimmer effect for skeleton loading
	const shimmer = (
		<motion.div
			className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
			animate={{
				x: ["-100%", "100%"],
			}}
			transition={{
				duration: 1.5,
				repeat: Infinity,
				ease: "linear",
			}}
		/>
	);

	return (
		<motion.div
			className={cn(
				classes.container,
				"rounded-2xl flex flex-col items-center justify-center relative overflow-hidden",
				"bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl",
				className,
			)}
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3 }}
			{...(rarityConfig && {
				style: {
					boxShadow: `0 0 20px ${rarityConfig.hexColor}40, inset 0 0 30px ${rarityConfig.hexColor}10`,
					borderColor: `${rarityConfig.hexColor}60`,
				},
			})}
		>
			{/* Glassmorphism layers */}
			<div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
			<div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

			{/* Animated background gradient based on rarity */}
			{rarityConfig && (
				<motion.div
					className="absolute inset-0 opacity-30"
					style={{
						background: `radial-gradient(circle at 50% 50%, ${rarityConfig.hexColor}40, transparent 70%)`,
					}}
					animate={{
						opacity: [0.2, 0.4, 0.2],
						scale: [1, 1.1, 1],
					}}
					transition={{
						duration: 3,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
			)}

			{error ? (
				// Error state with improved animation
				<div className="relative z-10 text-center space-y-4 px-4">
					<motion.div
						className={cn(
							classes.icon,
							"bg-gradient-to-br from-red-400/80 to-red-600/80 rounded-2xl",
							"border border-white/40 shadow-xl backdrop-blur-sm",
							"flex items-center justify-center mx-auto",
						)}
						animate={
							animate
								? {
										scale: [1, 1.1, 1],
										rotate: [0, -5, 5, -5, 0],
									}
								: {}
						}
						transition={
							animate
								? {
										duration: 0.5,
										repeat: Infinity,
										ease: "easeInOut",
									}
								: {}
						}
					>
						<svg
							className="w-1/2 h-1/2 text-white/80"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Error</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</motion.div>
					<div className="text-xs text-white/70 max-w-48 mx-auto leading-relaxed">
						<div className="font-medium mb-1">
							{error.includes("Failed to fetch")
								? "Network Error"
								: error.includes("timeout")
									? "Request Timeout"
									: error.includes("Courtyard")
										? "Courtyard API Issue"
										: error.includes("404")
											? "Image Not Found"
											: error.includes("403")
												? "Access Denied"
												: error.includes("CORS")
													? "CORS Policy Block"
													: "Image Load Failed"}
						</div>
						<div className="text-xs text-white/50">
							{error.includes("Failed to fetch")
								? "Check your internet connection"
								: error.includes("timeout")
									? "Server is responding slowly"
									: error.includes("Courtyard")
										? "Courtyard service unavailable"
										: error.includes("404")
											? "Image URL no longer exists"
											: error.includes("403")
												? "Image access is restricted"
												: error.includes("CORS")
													? "Browser security restriction"
													: "Image failed to load"}
						</div>
					</div>
				</div>
			) : (
				// Improved loading state with multiple options
				<div className="relative z-10 text-center space-y-4">
					{/* Card skeleton with shimmer */}
					<div className="relative">
						{/* Outer card frame */}
						<div
							className={cn(
								"rounded-xl border-2 border-dashed overflow-hidden relative",
								rarityConfig
									? `border-[${rarityConfig.hexColor}/60]`
									: "border-white/20",
							)}
						>
							{/* Shimmer effect */}
							{shimmer}

							{/* Card content skeleton */}
							<div className="p-4 space-y-3">
								{/* Image placeholder */}
								<div
									className={cn(
										"rounded-lg bg-white/10 relative overflow-hidden",
										size === "sm" ? "h-16" : size === "md" ? "h-24" : "h-32",
									)}
								>
									{shimmer}
								</div>

								{/* Text placeholder */}
								<div className="space-y-2">
									<div className="h-3 bg-white/10 rounded relative overflow-hidden">
										{shimmer}
									</div>
									<div className="h-2 bg-white/5 rounded w-3/4 relative overflow-hidden">
										{shimmer}
									</div>
								</div>
							</div>
						</div>

						{/* Floating rarity icon */}
						{rarityConfig && (
							<motion.div
								className={cn(
									"absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg",
								)}
								style={{
									background: rarityConfig.hexColor,
									boxShadow: `0 0 15px ${rarityConfig.hexColor}80`,
								}}
								animate={
									animate
										? {
												y: [0, -5, 0],
												rotate: [0, 10, -10, 0],
											}
										: {}
								}
								transition={
									animate
										? {
												duration: 2,
												repeat: Infinity,
												ease: "easeInOut",
											}
										: {}
								}
							>
								{rarityConfig.emoji}
							</motion.div>
						)}
					</div>

					{/* Progress bar if enabled */}
					{showProgress && (
						<div className="w-full px-8">
							<div className="h-1 bg-white/10 rounded-full overflow-hidden">
								<motion.div
									className="h-full rounded-full"
									style={{
										background: rarityConfig
											? rarityConfig.hexColor
											: "linear-gradient(to right, #f59e0b, #f97316)",
									}}
									initial={{ width: 0 }}
									animate={{ width: `${progress}%` }}
									transition={{ duration: 0.3 }}
								/>
							</div>
							<div className={cn("text-xs mt-2", classes.textSize)}>
								{progress < 30
									? "Fetching metadata..."
									: progress < 60
										? "Loading image..."
										: progress < 90
											? "Almost there..."
											: "Finalizing..."}
							</div>
						</div>
					)}

					{/* Loading spinner with rarity color */}
					{!showProgress && (
						<>
							<motion.div
								className={cn(
									"rounded-2xl border-2 border-t-transparent mx-auto",
									size === "sm"
										? "w-8 h-8"
										: size === "md"
											? "w-12 h-12"
											: "w-16 h-16",
								)}
								style={{
									borderColor: rarityConfig
										? `${rarityConfig.hexColor}40`
										: "rgba(255,255,255,0.2)",
									borderTopColor: rarityConfig
										? rarityConfig.hexColor
										: "#f59e0b",
								}}
								animate={{ rotate: 360 }}
								transition={{
									duration: 1,
									repeat: Infinity,
									ease: "linear",
								}}
							/>

							{/* Pulsing text */}
							<motion.div
								className={cn("text-white/70", classes.textSize)}
								animate={{ opacity: [0.5, 1, 0.5] }}
								transition={{ duration: 2, repeat: Infinity }}
							>
								{rarityConfig ? (
									<span style={{ color: rarityConfig.hexColor }}>
										Loading {rarityConfig.name} NFT...
									</span>
								) : (
									"Loading NFT..."
								)}
							</motion.div>
						</>
					)}
				</div>
			)}

			{/* Animated corner accents */}
			{animate &&
				!error &&
				[
					"top-2 left-2",
					"top-2 right-2",
					"bottom-2 left-2",
					"bottom-2 right-2",
				].map((position, i) => (
					<motion.div
						key={position}
						className={cn(
							"absolute w-2 h-2 rounded-full",
							rarityConfig ? "bg-white/40" : "bg-white/30",
							position,
						)}
						animate={{
							opacity: [0.3, 0.8, 0.3],
							scale: [1, 1.5, 1],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							delay: i * 0.2,
							ease: "easeInOut",
						}}
					/>
				))}
		</motion.div>
	);
}
