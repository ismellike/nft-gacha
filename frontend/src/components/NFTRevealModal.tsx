"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rarity, getRarityConfig } from "../lib/rarityConfig";

export interface SpinResult {
	rarity: string;
	collection: string;
	tokenId: string;
}

interface NFTRevealModalProps {
	isVisible: boolean;
	nftResult: SpinResult;
	onClose: () => void;
}

const ANIMATION_PHASES = {
	INITIALIZING: "initializing",
	SPINNING: "spinning",
	REVEALING: "revealing",
	REVEALED: "revealed",
} as const;

type AnimationPhase = (typeof ANIMATION_PHASES)[keyof typeof ANIMATION_PHASES];

export default function NFTRevealModal({
	isVisible,
	nftResult,
	onClose,
}: NFTRevealModalProps) {
	const [phase, setPhase] = useState<AnimationPhase>(
		ANIMATION_PHASES.INITIALIZING,
	);

	useEffect(() => {
		if (isVisible) {
			// Animation sequence with proper timing
			setPhase(ANIMATION_PHASES.INITIALIZING);

			const timers = [
				setTimeout(() => setPhase(ANIMATION_PHASES.SPINNING), 200),
				setTimeout(() => setPhase(ANIMATION_PHASES.REVEALING), 2500),
				setTimeout(() => setPhase(ANIMATION_PHASES.REVEALED), 3800),
			];

			return () => timers.forEach(clearTimeout);
		} else {
			setPhase(ANIMATION_PHASES.INITIALIZING);
		}
	}, [isVisible]);

	if (!isVisible) return null;

	const rarityConfig = getRarityConfig(
		Rarity[nftResult.rarity as keyof typeof Rarity] || Rarity.Common,
	);

	const backdropVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { duration: 0.5 },
		},
		exit: {
			opacity: 0,
			transition: { duration: 0.3 },
		},
	};

	const orbVariants = {
		[ANIMATION_PHASES.INITIALIZING]: {
			scale: 0,
			opacity: 0,
			rotate: 0,
		},
		[ANIMATION_PHASES.SPINNING]: {
			scale: [0, 1.2, 1],
			opacity: [0, 0.8, 1],
			transition: {
				duration: 1.5,
				ease: "easeOut" as const,
			},
		},
		[ANIMATION_PHASES.REVEALING]: {
			scale: [1, 1.5, 0.8],
			opacity: [1, 0.5, 0],
			rotate: 720,
			transition: {
				duration: 0.8,
				ease: "easeInOut" as const,
			},
		},
		[ANIMATION_PHASES.REVEALED]: {
			scale: 0,
			opacity: 0,
		},
	};

	const cardVariants = {
		hidden: {
			scale: 0,
			opacity: 0,
			rotateY: -90,
			z: -100,
		},
		visible: {
			scale: 1,
			opacity: 1,
			rotateY: 0,
			z: 0,
			transition: {
				type: "spring" as const,
				damping: 15,
				stiffness: 100,
				duration: 0.8,
			},
		},
	};


	return (
		<AnimatePresence>
			<motion.div
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
				variants={backdropVariants}
				initial="hidden"
				animate="visible"
				exit="exit"
			>
				{/* Dynamic Background Glow */}
				<motion.div
					className="absolute inset-0 overflow-hidden"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1 }}
				>
					{/* Spinning Phase Background */}
					<AnimatePresence>
						{(phase === ANIMATION_PHASES.SPINNING ||
							phase === ANIMATION_PHASES.INITIALIZING) && (
							<motion.div
								className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 0.2 }}
								exit={{ scale: 0, opacity: 0 }}
								transition={{ duration: 1.2, ease: "easeOut" }}
							>
								<motion.div
									className="w-96 h-96 bg-gradient-to-r from-warning/20 via-orange-400/30 to-warning/20 rounded-full blur-3xl"
									animate={{
										scale: [1, 1.3, 1.1, 1],
										opacity: [0.3, 0.6, 0.4, 0.3],
									}}
									transition={{
										duration: 4,
										repeat: Infinity,
										ease: "easeInOut",
									}}
								/>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Revealed Phase Background */}
					<AnimatePresence>
						{(phase === ANIMATION_PHASES.REVEALING ||
							phase === ANIMATION_PHASES.REVEALED) && (
							<motion.div
								className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 0.4 }}
								exit={{ scale: 0, opacity: 0 }}
								transition={{ duration: 0.5 }}
							>
								<motion.div
									className={`w-96 h-96 bg-gradient-to-r ${rarityConfig.bgGradient} rounded-full blur-3xl`}
									animate={{
										scale: [1, 1.1, 1],
									}}
									transition={{
										duration: 3,
										repeat: Infinity,
										ease: "easeInOut",
									}}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>

				{/* Main Content */}
				<div className="relative z-10">
					{/* Spinning Orb Phase */}
					<AnimatePresence>
						{(phase === ANIMATION_PHASES.INITIALIZING ||
							phase === ANIMATION_PHASES.SPINNING) && (
							<motion.div
								className="flex flex-col items-center space-y-8"
								variants={orbVariants}
								animate={phase}
								exit={{ opacity: 0, scale: 0 }}
							>
								{/* Digital Vault Opening Sequence */}
								<div className="relative w-80 h-80 flex items-center justify-center">
									{/* Hexagonal Frame */}
									<motion.div
										className="absolute inset-0"
										style={{
											clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
										}}
									>
										<motion.div
											className="w-full h-full bg-gradient-to-br from-warning/20 via-orange-400/30 to-warning/20 backdrop-blur-sm border-2 border-warning/40"
											animate={{
												boxShadow: [
													"0 0 20px rgba(255, 165, 0, 0.3)",
													"0 0 40px rgba(255, 165, 0, 0.5)",
													"0 0 20px rgba(255, 165, 0, 0.3)",
												],
											}}
											transition={{
												duration: 2,
												repeat: Infinity,
												ease: "easeInOut",
											}}
										/>
									</motion.div>

									{/* Progress Bars */}
									<div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
										{[...Array(5)].map((_, i) => (
											<motion.div
												key={i}
												className="w-48 h-1 bg-foreground/10 rounded-full overflow-hidden"
												initial={{ opacity: 0, width: 0 }}
												animate={{ opacity: 1, width: "12rem" }}
												transition={{ delay: i * 0.2, duration: 0.5 }}
											>
												<motion.div
													className="h-full bg-gradient-to-r from-warning to-orange-400 rounded-full"
													initial={{ width: "0%" }}
													animate={{ width: "100%" }}
													transition={{
														delay: i * 0.3 + 0.5,
														duration: 1.5,
														ease: "easeOut",
														repeat: Infinity,
														repeatType: "loop",
														repeatDelay: 2,
													}}
												/>
											</motion.div>
										))}
									</div>

									{/* Center Icon */}
									<motion.div
										className="absolute inset-0 flex items-center justify-center"
										animate={{
											scale: [1, 1.1, 1],
											opacity: [0.7, 1, 0.7],
										}}
										transition={{
											duration: 2,
											repeat: Infinity,
											ease: "easeInOut",
										}}
									>
										<svg
											className="w-16 h-16 text-warning drop-shadow-lg"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
											/>
										</svg>
									</motion.div>

									{/* Corner Accents */}
									{[0, 1, 2, 3, 4, 5].map((corner) => (
										<motion.div
											key={corner}
											className="absolute w-3 h-3 bg-warning rounded-full"
											style={{
												left: `${50 + 45 * Math.cos((corner * Math.PI) / 3)}%`,
												top: `${50 + 45 * Math.sin((corner * Math.PI) / 3)}%`,
												transform: "translate(-50%, -50%)",
											}}
											animate={{
												scale: [0.8, 1.2, 0.8],
												opacity: [0.5, 1, 0.5],
											}}
											transition={{
												duration: 1.5,
												repeat: Infinity,
												delay: corner * 0.2,
												ease: "easeInOut",
											}}
										/>
									))}
								</div>

								{/* Status Text */}
								<motion.div
									className="text-center"
									animate={{
										opacity: [0.7, 1, 0.7],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										ease: "easeInOut",
									}}
								>
									<div className="text-center space-y-2">
										<motion.p 
											className="text-xl font-semibold text-warning tracking-wide"
											animate={{
												opacity: [0.8, 1, 0.8],
											}}
											transition={{
												duration: 2,
												repeat: Infinity,
												ease: "easeInOut",
											}}
										>
											{phase === ANIMATION_PHASES.SPINNING && "Accessing Digital Vault..."}
										</motion.p>
										<motion.p 
											className="text-sm text-foreground/60 font-mono"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 1 }}
										>
											{phase === ANIMATION_PHASES.SPINNING && "DECRYPTING REWARD DATA..."}
										</motion.p>
									</div>
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* NFT Card Phase */}
					<AnimatePresence>
						{phase === ANIMATION_PHASES.REVEALED && (
							<motion.div
								variants={cardVariants}
								initial="hidden"
								animate="visible"
								exit="hidden"
								style={{ perspective: 1000 }}
							>
								{/* Card Container */}
								<div className="relative">
									{/* Card Glow Effect */}
									<motion.div
										className={`absolute -inset-8 bg-gradient-to-r ${rarityConfig.bgGradient} rounded-3xl blur-2xl`}
										initial={{ opacity: 0 }}
										animate={{ opacity: [0, 0.6, 0.4] }}
										transition={{ duration: 1, ease: "easeOut" }}
									/>

									{/* Main NFT Card */}
									<motion.div
										className="relative w-96 h-[28rem] bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
										whileHover={{ scale: 1.02 }}
										transition={{ type: "spring", stiffness: 300 }}
									>
										{/* Close Button */}
										<motion.button
											onClick={onClose}
											className="absolute top-4 right-4 z-20 w-8 h-8 bg-background/80 hover:bg-background/90 rounded-full border border-white/20 shadow-lg backdrop-blur-sm flex items-center justify-center group"
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.95 }}
											initial={{ opacity: 0, scale: 0 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: 0.5 }}
										>
											<svg
												className="w-4 h-4 text-foreground/70 group-hover:text-foreground transition-colors"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</motion.button>

										<div className="w-full h-full flex flex-col items-center justify-center space-y-6 p-8">
											{/* Rarity Badge */}
											<motion.div
												className="relative"
												initial={{ opacity: 0, y: -20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.2 }}
											>
												<motion.div
													className={`absolute -inset-4 bg-gradient-to-r ${rarityConfig.bgGradient} rounded-2xl blur-lg`}
													animate={{ opacity: [0.3, 0.6, 0.3] }}
													transition={{ duration: 2, repeat: Infinity }}
												/>
												<div className="relative px-6 py-3 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl">
													<span
														className={`${rarityConfig.textColor} font-bold text-xl flex items-center gap-3`}
													>
														<motion.span
															className="text-2xl"
															animate={{ scale: [1, 1.2, 1] }}
															transition={{ duration: 1, delay: 0.3 }}
														>
															{rarityConfig.emoji}
														</motion.span>
														<span className="tracking-wide">
															{nftResult.rarity}
														</span>
													</span>
												</div>
											</motion.div>

											{/* NFT Crystal Visual */}
											<motion.div
												className="relative"
												initial={{ opacity: 0, scale: 0 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{
													delay: 0.4,
													type: "spring",
													stiffness: 100,
												}}
											>
												<motion.div
													className={`absolute -inset-6 bg-gradient-to-r ${rarityConfig.bgGradient} rounded-3xl blur-xl`}
													animate={{ opacity: [0.2, 0.4, 0.2] }}
													transition={{ duration: 3, repeat: Infinity }}
												/>
												<div
													className={`relative w-48 h-48 bg-gradient-to-br ${rarityConfig.bgGradient} rounded-2xl flex items-center justify-center border-2 border-white/40 shadow-xl`}
												>
													<div className="absolute inset-2 bg-gradient-to-br from-background/95 to-background/80 rounded-xl backdrop-blur-xl"></div>

													{/* Animated Crystal */}
													<motion.div
														className="relative z-10"
														animate={{
															y: [-2, 2, -2],
														}}
														transition={{
															y: {
																duration: 3,
																repeat: Infinity,
																ease: "easeInOut",
															},
														}}
													>
														<div
															className={`w-20 h-20 bg-gradient-to-br ${rarityConfig.bgGradient} rounded-lg transform rotate-45 border-2 border-white/60 shadow-xl`}
														>
															<motion.div
																className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-lg"
																animate={{ opacity: [0.4, 0.8, 0.4] }}
																transition={{ duration: 1.5, repeat: Infinity }}
															/>
														</div>
													</motion.div>
												</div>
											</motion.div>

											{/* NFT Details */}
											<motion.div
												className="text-center space-y-3"
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.6 }}
											>
												<h3
													className={`text-2xl font-bold bg-gradient-to-r ${rarityConfig.bgGradient} bg-clip-text text-transparent`}
												>
													NFT #{nftResult.tokenId}
												</h3>
												<p className="text-sm text-foreground/70 font-mono">
													{nftResult.collection.slice(0, 6)}...
													{nftResult.collection.slice(-4)}
												</p>
											</motion.div>

											{/* Success Message */}
											<motion.div
												className="text-center"
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{
													delay: 0.8,
													duration: 0.6,
													ease: "easeOut",
												}}
											>
												<p className="text-lg font-semibold text-warning tracking-wide">
													Successfully Acquired
												</p>
											</motion.div>
										</div>
									</motion.div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

				</div>
			</motion.div>
		</AnimatePresence>
	);
}
