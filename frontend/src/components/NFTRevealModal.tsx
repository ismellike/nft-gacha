"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rarity, getRarityConfig } from "../lib/rarityConfig";
import { NFTRevealCard } from "./NFTCard";
import { formatCurrency } from "../lib/utils";
import {
	useReadNftAppraisalHasAppraisal,
	useReadNftAppraisalGetAppraisedPrice,
} from "../generated";

export interface SpinResult {
	rarity: string;
	collection: string;
	tokenId: string;
	imageUrl?: string;
}

interface NFTRevealModalProps {
	isVisible: boolean;
	nftResult: SpinResult;
	onClose: () => void;
	appraisalContractAddress?: `0x${string}`;
}

const ANIMATION_PHASES = {
	INITIALIZING: "initializing",
	SPINNING: "spinning",
	REVEALING: "revealing",
	REVEALED: "revealed",
} as const;

type AnimationPhase = (typeof ANIMATION_PHASES)[keyof typeof ANIMATION_PHASES];

// Dedicated appraised price display for the reveal modal
function RevealAppraisalDisplay({
	collection,
	tokenId,
	appraisalContractAddress,
}: {
	collection: string;
	tokenId: string;
	appraisalContractAddress?: `0x${string}`;
}) {
	const { data: hasAppraisal, isLoading: checkingAppraisal } =
		useReadNftAppraisalHasAppraisal({
			address: appraisalContractAddress!,
			args: [collection as `0x${string}`, BigInt(tokenId)],
			query: {
				enabled: !!appraisalContractAddress && !!collection && !!tokenId,
				staleTime: 30000,
				retry: 2,
			},
		});

	const { data: appraisalPrice, isLoading: loadingPrice } =
		useReadNftAppraisalGetAppraisedPrice({
			address: appraisalContractAddress!,
			args: [collection as `0x${string}`, BigInt(tokenId)],
			query: {
				enabled: !!hasAppraisal && !!appraisalContractAddress,
				staleTime: 30000,
				retry: 2,
			},
		});

	const isLoading = checkingAppraisal || loadingPrice;
	const hasValidAppraisal = hasAppraisal && appraisalPrice && Number(appraisalPrice) > 0;

	if (!appraisalContractAddress) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ delay: 1, duration: 0.5, type: "spring" }}
			className="mt-6 p-4 bg-gradient-to-br from-content1/30 via-background/95 to-content1/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl"
		>
			<div className="text-center">
				<div className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
					Market Appraisal
				</div>
				{isLoading ? (
					<div className="flex items-center justify-center gap-2">
						<motion.div
							className="w-5 h-5 border-2 border-warning/30 border-t-warning rounded-full"
							animate={{ rotate: 360 }}
							transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						/>
						<span className="text-foreground/60">Fetching appraisal...</span>
					</div>
				) : hasValidAppraisal ? (
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
						className="space-y-2"
					>
						<div className="text-3xl font-bold bg-gradient-to-r from-success via-emerald-400 to-success bg-clip-text text-transparent">
							{formatCurrency(appraisalPrice.toString(), 18, "USD")}
						</div>
						<div className="flex items-center justify-center gap-2">
							<div className="w-2 h-2 bg-success rounded-full animate-pulse" />
							<span className="text-success/80 text-sm font-medium">
								Professionally Appraised
							</span>
						</div>
					</motion.div>
				) : (
					<div className="text-foreground/60">
						<div className="text-warning">No appraisal available</div>
						<div className="text-xs mt-1 opacity-70">
							This NFT has not been appraised yet
						</div>
					</div>
				)}
			</div>
		</motion.div>
	);
}

export default function NFTRevealModal({
	isVisible,
	nftResult,
	onClose,
	appraisalContractAddress,
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
				className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
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
									{/* Circular Glassmorphism Frame */}
									<motion.div
										className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-content1/30 via-warning/20 to-content1/30 backdrop-blur-xl border border-white/20 shadow-2xl"
										animate={{
											boxShadow: [
												"0 0 30px rgba(255, 165, 0, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.1)",
												"0 0 60px rgba(255, 165, 0, 0.5), inset 0 0 40px rgba(255, 255, 255, 0.2)",
												"0 0 30px rgba(255, 165, 0, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.1)",
											],
										}}
										transition={{
											duration: 3,
											repeat: Infinity,
											ease: "easeInOut",
										}}
									/>

									{/* Outer rotating ring */}
									<motion.div
										className="absolute inset-4 w-72 h-72 rounded-full border-2 border-warning/30"
										animate={{ rotate: 360 }}
										transition={{
											duration: 8,
											repeat: Infinity,
											ease: "linear",
										}}
									/>

									{/* Inner counter-rotating ring */}
									<motion.div
										className="absolute inset-8 w-64 h-64 rounded-full border border-warning/20"
										animate={{ rotate: -360 }}
										transition={{
											duration: 12,
											repeat: Infinity,
											ease: "linear",
										}}
									/>

									{/* Data Loading Progress Bars */}
									<div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
										{[...Array(4)].map((_, i) => (
											<motion.div
												key={i}
												className="w-40 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20"
												initial={{ opacity: 0, scale: 0 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ delay: i * 0.15, duration: 0.4 }}
											>
												<motion.div
													className="h-full bg-gradient-to-r from-warning via-orange-400 to-warning rounded-full shadow-lg"
													initial={{ width: "0%" }}
													animate={{ width: "100%" }}
													transition={{
														delay: i * 0.2 + 0.6,
														duration: 1.8,
														ease: "easeOut",
														repeat: Infinity,
														repeatType: "loop",
														repeatDelay: 1,
													}}
												/>
											</motion.div>
										))}
									</div>

									{/* Center Digital Vault Icon */}
									<motion.div
										className="absolute inset-0 flex items-center justify-center"
										animate={{
											scale: [1, 1.15, 1],
											opacity: [0.8, 1, 0.8],
										}}
										transition={{
											duration: 2.5,
											repeat: Infinity,
											ease: "easeInOut",
										}}
									>
										{/* Glassmorphism icon container */}
										<div className="relative w-20 h-20 bg-gradient-to-br from-content1/40 to-content1/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center justify-center shadow-xl">
											<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
											<svg
												className="w-10 h-10 text-warning drop-shadow-lg relative z-10"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												strokeWidth={2.5}
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
												/>
											</svg>
										</div>
									</motion.div>

									{/* Orbital Access Points */}
									{[0, 1, 2, 3, 4, 5, 6, 7].map((point) => (
										<motion.div
											key={point}
											className="absolute w-2 h-2 bg-gradient-to-br from-warning to-orange-400 rounded-full shadow-lg"
											style={{
												left: `${50 + 42 * Math.cos((point * Math.PI) / 4)}%`,
												top: `${50 + 42 * Math.sin((point * Math.PI) / 4)}%`,
												transform: "translate(-50%, -50%)",
											}}
											animate={{
												scale: [0.6, 1.4, 0.6],
												opacity: [0.4, 1, 0.4],
												boxShadow: [
													"0 0 5px rgba(255, 165, 0, 0.3)",
													"0 0 15px rgba(255, 165, 0, 0.8)",
													"0 0 5px rgba(255, 165, 0, 0.3)",
												],
											}}
											transition={{
												duration: 2,
												repeat: Infinity,
												delay: point * 0.25,
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
											{phase === ANIMATION_PHASES.SPINNING &&
												"Accessing Digital Vault..."}
										</motion.p>
										<motion.p
											className="text-sm text-foreground/60 font-mono"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 1 }}
										>
											{phase === ANIMATION_PHASES.SPINNING &&
												"DECRYPTING REWARD DATA..."}
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
								className="relative"
							>
								{/* Close Button */}
								<motion.button
									onClick={onClose}
									className="absolute top-4 right-4 z-30 w-12 h-12 bg-gradient-to-br from-content1/60 to-content1/40 hover:from-content1/80 hover:to-content1/60 rounded-xl border border-white/30 shadow-xl backdrop-blur-xl flex items-center justify-center group"
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.95 }}
									initial={{ opacity: 0, scale: 0 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.5 }}
								>
									<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />
									<svg
										className="w-6 h-6 text-foreground/70 group-hover:text-foreground transition-colors relative z-10"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										strokeWidth={2.5}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</motion.button>

								{/* NFT Card Container */}
								<div className="relative flex flex-col items-center">
									<NFTRevealCard
										collection={nftResult.collection}
										tokenId={nftResult.tokenId}
										imageUrl={nftResult.imageUrl}
										showAppraisal={true}
										appraisalContractAddress={appraisalContractAddress}
										className="w-96"
									/>
									
									{/* Prominent Appraised Price Display */}
									<RevealAppraisalDisplay
										collection={nftResult.collection}
										tokenId={nftResult.tokenId}
										appraisalContractAddress={appraisalContractAddress}
									/>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
