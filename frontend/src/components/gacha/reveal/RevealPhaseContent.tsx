import { motion } from "framer-motion";
import type { NFTCardData } from "../../nft";
import {
	CARD_FADE_OUT_DURATION,
	type RevealPhase,
	STAGGER_DELAY_PER_TRAIT,
} from "../../../lib/revealAnimationConfig";
import { NFTCard } from "../../nft";
import RevealStep, { RevealStepGroup } from "../RevealStep";

// Get all possible phases in their correct order
const ALL_PHASES: RevealPhase[] = [
	"year",
	"setName",
	"name",
	"grading",
	"rarity",
	"card",
];

// Helper to determine if an item should be shown based on current phase and available phases
export const shouldShowItemInAvailable = (
	itemPhase: RevealPhase,
	currentPhase: RevealPhase,
	availablePhases: RevealPhase[],
): boolean => {
	const currentIndex = ALL_PHASES.indexOf(currentPhase);
	const itemIndex = ALL_PHASES.indexOf(itemPhase);
	const isItemAvailable = availablePhases.includes(itemPhase);
	return isItemAvailable && itemIndex >= 0 && itemIndex <= currentIndex;
};

// Calculate staggered delay for each trait to prevent simultaneous animations
const getTraitStaggerDelay = (traitPhase: RevealPhase): number => {
	const traitIndex = ALL_PHASES.indexOf(traitPhase);
	return traitIndex * STAGGER_DELAY_PER_TRAIT;
};

interface RevealPhaseContentProps {
	currentPhase: RevealPhase | null;
	availablePhases: RevealPhase[];
	isMetadataLoading: boolean;
	year: string | null;
	setName: string | null;
	cardName: string;
	gradingInfo: { displayString: string } | null;
	resultRarity: number;
	rarityName: string;
	cardPhaseTiming: { duration: number; animationDuration: number };
	cardData: NFTCardData;
	appraisalContractAddress: `0x${string}`;
	protocolTreasuryAddress?: string | undefined;
	gachaId?: string | undefined;
}

export function RevealPhaseContent({
	currentPhase,
	availablePhases,
	isMetadataLoading,
	year,
	setName,
	cardName,
	gradingInfo,
	resultRarity,
	rarityName,
	cardPhaseTiming,
	cardData,
	appraisalContractAddress,
	protocolTreasuryAddress,
	gachaId,
}: RevealPhaseContentProps) {
	if (isMetadataLoading || currentPhase === null) return null;

	return (
		<>
			{/* Traits Phase */}
			{availablePhases.includes(currentPhase) &&
				currentPhase !== "card" &&
				currentPhase !== "monetary" && (
					<motion.div
						exit={{
							opacity: 0,
							scale: 0.95,
							filter: "blur(8px)",
							transition: { duration: CARD_FADE_OUT_DURATION },
						}}
					>
						<RevealStepGroup className="gap-6">
							{/* Year - shows from year phase onwards */}
							{shouldShowItemInAvailable(
								"year",
								currentPhase,
								availablePhases,
							) &&
								year && (
									<RevealStep
										label="Year"
										value={year}
										delay={getTraitStaggerDelay("year")}
										duration={0.8}
										rarity={resultRarity}
										icon="📅"
									/>
								)}

							{/* Set Name - shows from setName phase onwards */}
							{shouldShowItemInAvailable(
								"setName",
								currentPhase,
								availablePhases,
							) &&
								setName && (
									<RevealStep
										label="Set"
										value={setName}
										delay={getTraitStaggerDelay("setName")}
										duration={0.8}
										rarity={resultRarity}
										icon="📦"
									/>
								)}

							{/* Card Name - shows from name phase onwards */}
							{shouldShowItemInAvailable(
								"name",
								currentPhase,
								availablePhases,
							) && (
								<RevealStep
									label="Title"
									value={cardName}
									delay={getTraitStaggerDelay("name")}
									duration={0.8}
									rarity={resultRarity}
									icon="✨"
								/>
							)}

							{/* Grading - shows from grading phase onwards */}
							{shouldShowItemInAvailable(
								"grading",
								currentPhase,
								availablePhases,
							) &&
								gradingInfo && (
									<RevealStep
										label="Grading"
										value={gradingInfo.displayString}
										delay={getTraitStaggerDelay("grading")}
										duration={0.8}
										rarity={resultRarity}
										icon="📊"
									/>
								)}

							{/* Rarity - shows from rarity phase onwards */}
							{shouldShowItemInAvailable(
								"rarity",
								currentPhase,
								availablePhases,
							) && (
								<RevealStep
									label="Rarity"
									value={rarityName}
									delay={getTraitStaggerDelay("rarity")}
									duration={0.8}
									rarity={resultRarity}
									icon="💎"
								/>
							)}
						</RevealStepGroup>
					</motion.div>
				)}

			{/* Full Card Reveal */}
			{(currentPhase === "card" || currentPhase === "monetary") && (
				<motion.div
					initial={{
						opacity: 0,
						scale: 0.3,
						rotateY: -180,
					}}
					animate={{
						opacity: 1,
						scale: 1,
						rotateY: 0,
					}}
					transition={{
						duration: cardPhaseTiming.animationDuration,
						ease: "easeOut",
						type: "spring",
						damping: 20,
						stiffness: 100,
					}}
					className="relative"
					style={{ perspective: 1000 }}
				>
					<NFTCard
						data={cardData}
						size="lg"
						showCollectionName={true}
						appraisalContractAddress={appraisalContractAddress}
						{...(protocolTreasuryAddress && {
							protocolTreasuryAddress,
						})}
						{...(gachaId && { gachaId })}
					/>
				</motion.div>
			)}
		</>
	);
}
