"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEnhancedSpinResult } from "../../hooks/useNFTMetadata";
import { getGachaConfig } from "../../lib/gacha-config";
import { createDebugLogger, DEBUG_FLAGS, logger } from "../../lib/logger";
import {
	getCardName,
	getGradingInfo,
	getSafeMetadataForReveal,
	getSetName,
	getYear,
	type NFTMetadata,
} from "../../lib/metadataValidation";
import { getRarityConfig, Rarity } from "../../lib/rarityConfig";
import {
	getGlowConfig,
	getPhaseTiming,
	type RevealPhase,
} from "../../lib/revealAnimationConfig";
import { useSoundEffects } from "../../hooks/useSoundEffects";
import { DialogTitle, Modal, ModalBody, ModalContent } from "../../ui";
import { RevealErrorBoundary } from "./RevealErrorBoundary";
import {
	MonetaryRevealSection,
	RevealPhaseContent,
	shouldShowItemInAvailable,
} from "./reveal";

const debugLog = createDebugLogger(DEBUG_FLAGS.NFT_METADATA);

interface SpinResult {
	rarity: string;
	collection: string;
	tokenId: string;
	imageUrl?: string;
}

interface NFTRevealModalProps {
	isVisible: boolean;
	nftResult: SpinResult;
	onClose: () => void;
	appraisalContractAddress: `0x${string}`;
	gachaId?: string;
}

// Determine which metadata fields are available for reveal
// Only include phases that have corresponding data to avoid empty waits
// Order: year → setName → name (title/subject) → grading → rarity → card
const getAvailableRevealPhases = (
	metadata: NFTMetadata | null,
): RevealPhase[] => {
	const phases: RevealPhase[] = [];
	if (metadata?.year) phases.push("year");
	if (metadata?.set_number) phases.push("setName");
	phases.push("name"); // Always included - has "Unknown Card" fallback
	if (metadata?.grading_company || metadata?.grade) phases.push("grading");
	phases.push("rarity"); // Always included - comes from spin result
	phases.push("card"); // Always included
	return phases;
};

export default function NFTRevealModal({
	isVisible,
	nftResult,
	onClose,
	appraisalContractAddress,
	gachaId,
}: NFTRevealModalProps) {
	const [currentPhase, setCurrentPhase] = useState<RevealPhase | null>(null);
	const [isSkipped, setIsSkipped] = useState(false);
	const [showMonetary, setShowMonetary] = useState(false);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const isSkippedRef = useRef(false);
	const prefersReducedMotion = useReducedMotion();
	// Store timers in a ref to persist across effect re-runs
	const animationTimersRef = useRef<NodeJS.Timeout[]>([]);

	// Sound effects - stored in ref so animation effect can use without deps
	const sound = useSoundEffects();
	const soundRef = useRef(sound);
	soundRef.current = sound;

	// Get enhanced spin result with metadata
	const enhancedResult = useEnhancedSpinResult(nftResult);

	// Extract loading state
	const isMetadataLoading = enhancedResult?.isLoading ?? true;

	// Debug: Log raw metadata when it arrives
	useEffect(() => {
		if (enhancedResult && !enhancedResult.isLoading) {
			debugLog("[NFTRevealModal] Raw NFT metadata received:", {
				originalResult: nftResult,
				enhancedResult: {
					isLoading: enhancedResult.isLoading,
					imageUrl: enhancedResult.imageUrl,
					tokenURI: enhancedResult.tokenURI,
					metadata: enhancedResult.metadata,
				},
				parsedMetadataFields: {
					rawMetadata: enhancedResult.metadata,
					year: enhancedResult.metadata?.year,
					set_number: enhancedResult.metadata?.set_number,
					card_number: enhancedResult.metadata?.card_number,
					title: enhancedResult.metadata?.title,
					name: enhancedResult.metadata?.name,
					grading_company: enhancedResult.metadata?.grading_company,
					grade: enhancedResult.metadata?.grade,
				},
			});
		}
	}, [enhancedResult, nftResult]);

	// Validate and safely extract metadata
	const metadataValidation = useMemo(
		() => getSafeMetadataForReveal(enhancedResult?.metadata ?? null),
		[enhancedResult?.metadata],
	);

	const metadata = metadataValidation.metadata;

	// Use safe accessor utilities for metadata fields
	const year = getYear(metadata);
	const setName = getSetName(metadata);
	const cardName = getCardName(metadata);
	const gradingInfo = getGradingInfo(metadata);

	// Get available phases based on actual metadata
	const availablePhases = useMemo(
		() => getAvailableRevealPhases(metadata),
		[metadata],
	);

	// Get gacha config for protocol treasury address
	const gachaConfig = useMemo(
		() => (gachaId ? getGachaConfig(gachaId) : null),
		[gachaId],
	);
	const protocolTreasuryAddress = gachaConfig?.protocolTreasuryAddress;
	const gachaTreasuryAddress = gachaConfig?.treasuryAddress || "";

	// Get rarity config
	const resultRarity =
		Rarity[nftResult.rarity as keyof typeof Rarity] || Rarity.Common;
	const rarityConfig = getRarityConfig(resultRarity);
	const allPhaseTimings = useMemo(() => getPhaseTiming(), []);
	const glowConfig = useMemo(() => getGlowConfig(resultRarity), [resultRarity]);

	// Get the card phase timing safely
	const cardPhaseTiming = useMemo(
		() =>
			allPhaseTimings.find((pt) => pt.phase === "card") || {
				duration: 1.2,
				animationDuration: 1.2,
			},
		[allPhaseTimings],
	);

	// Skip animation handler
	const skipAnimation = useCallback(() => {
		if (isSkippedRef.current) return; // Early exit, prevent re-entry

		soundRef.current.playSkip();
		isSkippedRef.current = true;
		setIsSkipped(true);
		setCurrentPhase("monetary");
		setShowMonetary(true);

		// Focus close button
		setTimeout(() => {
			closeButtonRef.current?.focus();
		}, 100);
	}, []); // Remove isSkipped from deps to avoid race conditions

	// Handle keyboard events
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
			if (e.key === " " || e.key === "Enter") {
				e.preventDefault();
				skipAnimation();
			}
		},
		[onClose, skipAnimation],
	);

	// Add ref to track initialization
	const hasInitializedAnimation = useRef(false);
	const hasCompletedAnimation = useRef(false);

	// Debug: Log currentPhase changes
	useEffect(() => {
		debugLog("[NFTRevealModal] currentPhase changed to:", currentPhase);
	}, [currentPhase]);

	// Debug: Log what should be displayed
	useEffect(() => {
		if (currentPhase !== null && !isMetadataLoading) {
			debugLog("[NFTRevealModal] Should display:", {
				currentPhase,
				year:
					shouldShowItemInAvailable("year", currentPhase, availablePhases) &&
					year,
				setName:
					shouldShowItemInAvailable("setName", currentPhase, availablePhases) &&
					setName,
				name:
					shouldShowItemInAvailable("name", currentPhase, availablePhases) &&
					cardName,
				grading:
					shouldShowItemInAvailable("grading", currentPhase, availablePhases) &&
					gradingInfo,
				rarity:
					shouldShowItemInAvailable("rarity", currentPhase, availablePhases) &&
					nftResult.rarity,
			});
		}
	}, [
		currentPhase,
		isMetadataLoading,
		availablePhases,
		year,
		setName,
		cardName,
		gradingInfo,
		nftResult.rarity,
	]);

	// Reset state when modal opens/closes
	// biome-ignore lint/correctness/useExhaustiveDependencies: Intentional - currentPhase used for guard check, metadata fields only for logging
	useEffect(() => {
		debugLog("[NFTRevealModal] useEffect triggered", {
			isVisible,
			isMetadataLoading,
			currentPhase,
		});

		// Reset flag and state when modal closes
		if (!isVisible) {
			debugLog("[NFTRevealModal] Modal closed, resetting state");
			hasInitializedAnimation.current = false;
			hasCompletedAnimation.current = false;
			setCurrentPhase(null);
			setIsSkipped(false);
			setShowMonetary(false);
			return;
		}

		// Wait for metadata to be loaded before starting
		if (isMetadataLoading) {
			debugLog("[NFTRevealModal] Metadata still loading, waiting...");
			return;
		}

		// Skip animation sequence for users who prefer reduced motion
		if (prefersReducedMotion && currentPhase === null) {
			debugLog("[NFTRevealModal] Reduced motion: skipping to monetary phase");
			isSkippedRef.current = true;
			setIsSkipped(true);
			setCurrentPhase("monetary");
			setShowMonetary(true);
			return;
		}

		// If animation is already in progress (currentPhase not null), don't restart
		if (currentPhase !== null) {
			debugLog(
				"[NFTRevealModal] Animation already in progress, currentPhase:",
				currentPhase,
			);
			return;
		}

		debugLog("[NFTRevealModal] Starting animation initialization");
		hasInitializedAnimation.current = true;

		// Get the current available phases based on loaded metadata
		const currentAvailablePhases = getAvailableRevealPhases(metadata);

		// Use new phase timing system - filter to only include available phases
		const allPhaseTimingsLocal = getPhaseTiming();
		const phaseTimings = allPhaseTimingsLocal.filter((phaseConfig) =>
			currentAvailablePhases.includes(phaseConfig.phase),
		);

		debugLog("[NFTRevealModal] Animation starting:", {
			availablePhases: currentAvailablePhases,
			filteredPhaseTimings: phaseTimings.map((p) => p.phase),
			metadataFields: {
				hasYear: !!metadata?.year,
				hasSetNumber: !!metadata?.set_number,
				hasName: !!metadata?.name,
				hasTitle: !!metadata?.title,
				hasGradingCompany: !!metadata?.grading_company,
				hasGrade: !!metadata?.grade,
			},
		});

		// Reset animation state
		setIsSkipped(false);
		setShowMonetary(false);
		isSkippedRef.current = false;

		// Start the animation sequence
		let phaseIndex = 0;

		const runNextPhase = () => {
			debugLog("[NFTRevealModal] runNextPhase called", {
				phaseIndex,
				totalPhases: phaseTimings.length,
				isSkipped: isSkippedRef.current,
				currentPhase: currentPhase,
			});

			if (isSkippedRef.current || phaseIndex >= phaseTimings.length) {
				debugLog("[NFTRevealModal] Animation ended or skipped", {
					phaseIndex,
					totalPhases: phaseTimings.length,
					isSkipped: isSkippedRef.current,
				});
				return;
			}

			const phase = phaseTimings[phaseIndex];
			debugLog("[NFTRevealModal] Phase transition:", {
				from: currentPhase,
				to: phase.phase,
				phaseIndex: phaseIndex + 1,
				totalPhases: phaseTimings.length,
			});
			setCurrentPhase(phase.phase as RevealPhase);

			// Play phase-appropriate sound
			const s = soundRef.current;
			if (phase.phase === "rarity") {
				s.playRarityReveal(resultRarity);
			} else if (phase.phase === "card") {
				s.playCardReveal(resultRarity);
			} else {
				s.playTraitReveal(phase.phase as RevealPhase);
			}

			phaseIndex++;

			// Schedule next phase
			if (phaseIndex < phaseTimings.length) {
				const nextPhase = phaseTimings[phaseIndex];
				debugLog("[NFTRevealModal] Scheduling next phase:", {
					nextPhase: nextPhase.phase,
					delay: nextPhase.duration * 1000,
					phaseIndexAfterIncrement: phaseIndex,
				});
				const timer = setTimeout(() => {
					debugLog("[NFTRevealModal] Timer fired for phase:", nextPhase.phase);
					runNextPhase();
				}, nextPhase.duration * 1000);

				// Store timer for cleanup
				animationTimersRef.current.push(timer);
			} else {
				// All phases done, schedule monetary reveal
				hasCompletedAnimation.current = true;
				debugLog(
					"[NFTRevealModal] All phases complete, scheduling monetary reveal",
				);
				const monetaryTimer = setTimeout(() => {
					if (!isSkippedRef.current) {
						debugLog("[NFTRevealModal] Showing monetary phase");
						setCurrentPhase("monetary");
						setShowMonetary(true);
						soundRef.current.playValueReveal();
						closeButtonRef.current?.focus();
					}
				}, 1000);

				animationTimersRef.current.push(monetaryTimer);
			}
		};

		// Start first phase immediately
		debugLog("[NFTRevealModal] About to call runNextPhase for first time");
		runNextPhase();

		return () => {
			debugLog(
				"[NFTRevealModal] Cleanup: clearing",
				animationTimersRef.current.length,
				"timers",
			);
			animationTimersRef.current.forEach(clearTimeout);
			animationTimersRef.current = [];
		};
	}, [isVisible, isMetadataLoading]);

	return (
		<Modal
			isOpen={isVisible}
			onClose={onClose}
			size="full"
			hideCloseButton
			placement="center"
		>
			<ModalContent>
				<DialogTitle className="sr-only">
					{rarityConfig.name} NFT Revealed
				</DialogTitle>
				<ModalBody
					className="relative overflow-hidden p-0 min-h-screen flex items-center justify-center pointer-events-auto"
					onKeyDown={handleKeyDown}
				>
					<RevealErrorBoundary
						onError={(error) => {
							logger.nftMetadata.error("NFT Reveal Error:", error);
						}}
					>
						{/* Close Button - Top Right of Modal */}
						<AnimatePresence>
							{showMonetary && (
								<motion.button
									ref={closeButtonRef}
									onClick={onClose}
									className="absolute top-8 right-8 z-50 w-12 h-12 bg-content1/60 hover:bg-content1/80 rounded-xl border border-white/30 shadow-xl backdrop-blur-xl flex items-center justify-center group transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
									initial={{ opacity: 0, scale: 0 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.3 }}
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.95 }}
									aria-label="Close NFT reveal modal"
								>
									<svg
										className="w-6 h-6 text-foreground/70 group-hover:text-foreground transition-colors"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										strokeWidth={2.5}
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</motion.button>
							)}
						</AnimatePresence>

						{/* Skip Button - Bottom Right */}
						{!isSkipped && !showMonetary && currentPhase !== "monetary" && (
							<motion.button
								onClick={skipAnimation}
								className="absolute bottom-12 right-12 z-50 px-6 py-3 bg-content1/60 hover:bg-content1/80 rounded-xl border border-white/30 shadow-xl backdrop-blur-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-foreground/80 font-medium"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5, duration: 0.5 }}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								aria-label="Skip animation"
							>
								Skip Animation
							</motion.button>
						)}

						{/* Dramatic Background Glow - Only during final card reveal */}
						{(currentPhase === "card" || currentPhase === "monetary") && (
							<motion.div
								className="absolute inset-0 overflow-hidden pointer-events-none"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.8 }}
							>
								<motion.div
									className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ duration: 1.5, ease: "easeOut" }}
								>
									<motion.div
										className={`w-96 h-96 ${rarityConfig.bgGradient} rounded-full blur-3xl`}
										animate={{
											scale: glowConfig.scale,
											opacity: glowConfig.opacity,
										}}
										transition={{
											duration: glowConfig.pulseDuration,
											repeat: Infinity,
											ease: "easeInOut",
										}}
									/>
								</motion.div>
							</motion.div>
						)}

						{/* Progressive Reveal Content */}
						<div className="relative z-10 flex items-center justify-center min-h-screen w-full max-w-4xl mx-auto px-4">
							<div className="flex flex-col items-center gap-8 w-full">
								{/* Loading State */}
								{isMetadataLoading && (
									<AnimatePresence>
										<motion.div
											key="loading"
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.8 }}
											className="flex flex-col items-center gap-6"
										>
											<motion.div
												className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full"
												animate={{ rotate: 360 }}
												transition={{
													duration: 1,
													repeat: Infinity,
													ease: "linear",
												}}
											/>
											<motion.p
												className={`text-lg font-medium ${rarityConfig.textColor}`}
												animate={{ opacity: [0.5, 1, 0.5] }}
												transition={{ duration: 1.5, repeat: Infinity }}
											>
												Loading NFT details...
											</motion.p>
										</motion.div>
									</AnimatePresence>
								)}

								{/* Progressive Metadata Reveal */}
								<RevealPhaseContent
									currentPhase={currentPhase}
									availablePhases={availablePhases}
									isMetadataLoading={isMetadataLoading}
									year={year ?? null}
									setName={setName ?? null}
									cardName={cardName}
									gradingInfo={gradingInfo ?? null}
									resultRarity={resultRarity}
									rarityName={nftResult.rarity}
									cardPhaseTiming={cardPhaseTiming}
									cardData={{
										collection: nftResult.collection,
										tokenId: nftResult.tokenId,
										imageUrl:
											enhancedResult?.imageUrl || nftResult.imageUrl,
										rarity: resultRarity,
										metadata: enhancedResult?.metadata ?? null,
										tokenURI: enhancedResult?.tokenURI ?? null,
									}}
									appraisalContractAddress={appraisalContractAddress}
									protocolTreasuryAddress={protocolTreasuryAddress}
									gachaId={gachaId}
								/>

								{/* Monetary Reveal */}
								{protocolTreasuryAddress && (
									<MonetaryRevealSection
										isMetadataLoading={isMetadataLoading}
										currentPhase={currentPhase}
										resultRarity={resultRarity}
										rarityName={nftResult.rarity}
										nftCollection={nftResult.collection}
										nftTokenId={nftResult.tokenId}
										enhancedMetadata={enhancedResult?.metadata ?? null}
										appraisalContractAddress={appraisalContractAddress}
										protocolTreasuryAddress={protocolTreasuryAddress}
										gachaTreasuryAddress={gachaTreasuryAddress}
									/>
								)}
							</div>
						</div>
					</RevealErrorBoundary>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
