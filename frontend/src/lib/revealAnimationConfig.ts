/**
 * Reveal animation configuration
 * Provides timing presets and animation parameters based on NFT rarity
 */

// ============================================================================
// TIMING RATIONALE
// ============================================================================
//
// These timing constants were tuned through UX testing to balance engagement
// with pacing. Each constant serves a specific psychological purpose:
//
// DURATION_STEP_MIN (1.8s): Reveal for simple traits (year, setName, name)
//   Rationale: Long enough to register the animation and read the text,
//   short enough to maintain momentum through the reveal sequence.
//
// DURATION_STEP_BASE (2.0s): Standard reveal for complex traits (grading)
//   Rationale: Grading displays compound data (company + grade), so 2s
//   gives users time to parse both pieces of information without feeling slow.
//
// DURATION_STEP_CARD (2.5s): Dramatic card reveal
//   Rationale: The "money shot" moment—longer duration emphasizes importance
//   of the full card reveal and creates a satisfying climax to the sequence.
//
// STAGGER_DELAY_PER_TRAIT (0.08s): Cascade delay between traits
//   Rationale: 80ms stagger creates smooth waterfall effect without adding
//   noticeable time to the total sequence. Small enough to feel responsive,
//   large enough to prevent visual clutter from simultaneous animations.
//
// CARD_FADE_OUT_DURATION (0.20s): Trait cards fade speed
//   Rationale: 200ms is fast enough to not delay the card reveal, but slow
//   enough to be perceived as a smooth transition rather than a cut.
//
// CARD_ENTRANCE_DELAY (0.05s): Delay before card appears during fade overlap
//   Rationale: 50ms wait lets trait cards start fading before card appears,
//   creating smooth crossfade without visual overlap or clutter.
//
// ============================================================================

export type RevealPhase =
	| "year"
	| "grading"
	| "setName"
	| "name"
	| "rarity"
	| "card"
	| "monetary";

export interface PhaseTimingConfig {
	phase: RevealPhase;
	duration: number;
	animationDuration: number;
}

// ============================================================================
// NAMED CONSTANTS
// ============================================================================

// Animation durations (in seconds)
const DURATION_STEP_MIN = 1.8; // Standard phase duration
const DURATION_STEP_BASE = 2.0; // Longer for complex traits like grading
const DURATION_STEP_CARD = 2.5; // Longest for the dramatic card reveal

// Trait animation timing (in seconds)
export const STAGGER_DELAY_PER_TRAIT = 0.08; // 80ms stagger between traits for smooth cascade
export const CARD_FADE_OUT_DURATION = 0.2; // 200ms fade for trait cards
export const CARD_ENTRANCE_DELAY = 0.05; // 50ms delay before card appears (reduced for faster feel)

// Spring animation configurations
export const SPRING_CONFIGS = {
	soft: {
		type: "spring" as const,
		stiffness: 100,
		damping: 15,
	},
	bouncy: {
		type: "spring" as const,
		stiffness: 200,
		damping: 10,
	},
	smooth: {
		type: "spring" as const,
		stiffness: 150,
		damping: 20,
	},
	dramatic: {
		type: "spring" as const,
		stiffness: 300,
		damping: 8,
	},
};

/**
 * Get spring config based on rarity index using normalized position
 * @param rarityIndex - Numeric rarity index (0 = lowest)
 * @param numRarities - Total number of rarity tiers
 */
export const getSpringConfig = (rarityIndex: number, numRarities = 5) => {
	const normalized = rarityIndex / Math.max(numRarities - 1, 1);
	if (normalized < 0.4) return SPRING_CONFIGS.soft;
	if (normalized < 0.6) return SPRING_CONFIGS.smooth;
	if (normalized < 0.8) return SPRING_CONFIGS.bouncy;
	return SPRING_CONFIGS.dramatic;
};

/**
 * Get glow intensity based on rarity index using linear interpolation
 * @param rarityIndex - Numeric rarity index (0 = lowest)
 * @param numRarities - Total number of rarity tiers
 */
const getGlowIntensity = (rarityIndex: number, numRarities = 5): number => {
	const normalized = rarityIndex / Math.max(numRarities - 1, 1);
	return 0.2 + normalized * 0.7; // 0.2 to 0.9
};

/**
 * Glow animation config based on rarity
 * @param rarityIndex - Numeric rarity index (0 = lowest)
 * @param numRarities - Total number of rarity tiers
 */
export const getGlowConfig = (rarityIndex: number, numRarities = 5) => {
	const intensity = getGlowIntensity(rarityIndex, numRarities);
	const isTopTier = rarityIndex >= numRarities - 1;

	const PULSE_DURATION_TOP = 3;
	const PULSE_DURATION_BASE = 4;
	// Use mutable arrays for framer-motion compatibility
	const SCALE_TOP = [1, 1.15, 1];
	const SCALE_BASE = [1, 1.1, 1];
	const OPACITY_TOP = [0.4, 0.6, 0.4];
	const OPACITY_BASE = [0.3, 0.5, 0.3];

	return {
		intensity,
		pulseDuration: isTopTier ? PULSE_DURATION_TOP : PULSE_DURATION_BASE,
		scale: isTopTier ? SCALE_TOP : SCALE_BASE,
		opacity: isTopTier ? OPACITY_TOP : OPACITY_BASE,
	};
};

/**
 * Get phase timing configuration for progressive reveal
 * @returns Array of phase timing configs (duration and animation duration)
 *
 * Note: Timing is rarity-agnostic to maintain consistent UX across all pulls.
 * NFTRevealModal filters these phases based on available metadata.
 */
export const getPhaseTiming = (): PhaseTimingConfig[] => {
	// Phase order: year → setName → name (title/subject) → grading → rarity → card
	return [
		{
			phase: "year",
			duration: DURATION_STEP_MIN,
			animationDuration: DURATION_STEP_MIN,
		},
		{
			phase: "setName",
			duration: DURATION_STEP_MIN,
			animationDuration: DURATION_STEP_MIN,
		},
		{
			phase: "name",
			duration: DURATION_STEP_MIN,
			animationDuration: DURATION_STEP_MIN,
		},
		{
			phase: "grading",
			duration: DURATION_STEP_BASE,
			animationDuration: DURATION_STEP_BASE,
		},
		{
			phase: "rarity",
			duration: DURATION_STEP_MIN,
			animationDuration: DURATION_STEP_MIN,
		},
		{
			phase: "card",
			duration: DURATION_STEP_CARD,
			animationDuration: DURATION_STEP_CARD,
		},
	];
};

// ============================================================================
// TIMING TUNING GUIDE
// ============================================================================
//
// If you need to adjust reveal timing, follow these principles:
//
// 1. To make reveals feel faster:
//    - Reduce DURATION_STEP_MIN (but keep above 0.3s to avoid feeling rushed)
//    - Reduce STAGGER_DELAY_PER_TRAIT (can go to 0.05s for faster cascade)
//
// 2. To make reveals feel more dramatic:
//    - Increase DURATION_STEP_CARD (up to 3.0s for maximum impact)
//    - Increase DURATION_STEP_BASE for grading (up to 2.5s)
//
// 3. If animations feel jerky:
//    - Check that STAGGER_DELAY_PER_TRAIT >= 0.05s (below this feels instant)
//    - Verify CARD_FADE_OUT_DURATION >= 0.15s (below this feels like a cut)
//    - Ensure spring configs in SPRING_CONFIGS have damping >= 10
//
// 4. To maintain total duration:
//    - Total = sum(phase durations) for phases with data
//    - Phases with missing metadata are automatically skipped
//    - If you add delay in one place, reduce duration elsewhere
//
// ============================================================================
