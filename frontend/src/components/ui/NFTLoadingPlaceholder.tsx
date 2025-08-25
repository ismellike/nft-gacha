"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/theme-config";

interface NFTLoadingPlaceholderProps {
	size?: "sm" | "md" | "lg" | "xl";
	animate?: boolean;
	className?: string;
	error?: string | null;
}

export function NFTLoadingPlaceholder({
	size = "md",
	animate = true,
	className,
	error,
}: NFTLoadingPlaceholderProps) {
	const sizeClasses = {
		sm: { container: "w-32 h-32", icon: "w-10 h-10" },
		md: { container: "w-80 h-80", icon: "w-20 h-20" },
		lg: { container: "w-96 h-96", icon: "w-32 h-32" },
		xl: { container: "w-[480px] h-[480px]", icon: "w-40 h-40" },
	};

	const classes = sizeClasses[size];

	return (
		<motion.div
			className={cn(
				classes.container,
				"rounded-2xl flex flex-col items-center justify-center relative overflow-hidden",
				"bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl",
				className,
			)}
			animate={
				animate
					? {
							boxShadow: [
								"0 0 30px rgba(255, 255, 255, 0.1)",
								"0 0 50px rgba(255, 255, 255, 0.2)",
								"0 0 30px rgba(255, 255, 255, 0.1)",
							],
						}
					: {}
			}
			transition={{
				duration: 3,
				repeat: Infinity,
				ease: "easeInOut",
			}}
		>
			{/* Glassmorphism layers */}
			<div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
			<div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

			{error ? (
				// Error state
				<div className="relative z-10 text-center space-y-4">
					<motion.div
						className={cn(
							classes.icon,
							"bg-gradient-to-br from-red-400/80 to-red-600/80 rounded-2xl",
							"border border-white/40 shadow-xl backdrop-blur-sm",
							"flex items-center justify-center",
						)}
						animate={animate ? { scale: [1, 1.05, 1] } : {}}
						transition={animate ? { duration: 2, repeat: Infinity } : {}}
					>
						<svg
							className="w-8 h-8 text-white/80"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
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
				// Loading state
				<div className="relative z-10 text-center space-y-4">
					<motion.div
						className={cn(
							classes.icon,
						"bg-gradient-to-br from-warning/80 to-warning/60 rounded-2xl",
							"border border-white/40 shadow-xl backdrop-blur-sm",
							"flex items-center justify-center transform rotate-45",
						)}
						animate={
							animate
								? {
										y: [-3, 3, -3],
										rotateY: [0, 180, 360],
										scale: [1, 1.05, 1],
									}
								: {}
						}
						transition={
							animate
								? {
										y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
										rotateY: { duration: 10, repeat: Infinity, ease: "linear" },
										scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
									}
								: {}
						}
					>
						<motion.div
							className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"
							animate={animate ? { opacity: [0.3, 0.6, 0.3] } : {}}
							transition={animate ? { duration: 2, repeat: Infinity } : {}}
						/>
						<div className="w-4 h-4 bg-white/60 rounded-full transform -rotate-45" />
					</motion.div>
					<div className="text-xs text-white/70">Loading NFT image...</div>
				</div>
			)}
		</motion.div>
	);
}
