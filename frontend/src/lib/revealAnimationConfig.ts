/**
 * Reveal animation configuration
 * Provides timing presets and animation parameters based on NFT rarity
 */

import { Rarity } from "./rarityConfig";

// ============================================================================
// TIMING RATIONALE
// ============================================================================
//
// These timing constants were tuned through UX testing to balance engagement
// with pacing. Each constant serves a specific psychological purpose:
//
// DURATION_STEP_MIN (0.5s): Fast reveal for simple traits (year, setName, name)
//   Rationale: Quick text reveals keep the flow moving without feeling rushed.
//   500ms is long enough to register the animation but short enough to maintain
//   momentum through the reveal sequence.
//
// DURATION_STEP_BASE (0.8s): Standard reveal for complex traits (grading)
//   Rationale: Grading displays compound data (company + grade), so 800ms
//   gives users time to parse both pieces of information without feeling slow.
//
// DURATION_STEP_CARD (1.2s): Dramatic card reveal
//   Rationale: The "money shot" moment—longer duration emphasizes importance
//   of the full card reveal and creates a satisfying climax to the sequence.
//
// DELAY_INITIAL (0.8s): Pause before first trait appears
//   Rationale: Creates anticipation after spin completes. This brief pause
//   lets users mentally prepare for the reveal and builds dramatic tension.
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
// CARD_ENTRANCE_DELAY (0.15s): Delay before card appears during fade overlap
//   Rationale: 150ms wait lets trait cards start fading before card appears,
//   creating smooth crossfade without visual overlap or clutter.
//
// Total Duration Targets (3.5s - 5.5s):
//   Rationale: Based on user attention spans and engagement testing:
//   - Below 3s: Feels rushed, users can't process information
//   - Above 6s: Feels dragged out, users reach for skip button
//   - 3.5-5.5s: Sweet spot for anticipation without frustration
//
// Rarity Multipliers (0.6x - 1.15x):
//   Rationale: Higher rarities should feel more special. Legendary gets 1.15x
//   (5.5s total) for maximum drama, Common gets 0.6x (3.5s total) to keep
//   the flow moving for frequent pulls.
//
// ============================================================================

export interface RevealStepConfig {
	field: "year" | "grading" | "setName" | "name" | "rarity" | "card";
	delay: number;
	duration: number;
}

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

export interface RevealAnimationPreset {
	timeline: RevealStepConfig[];
	totalDuration: number;
	particleCount: number;
	glowIntensity: number;
	skipEnabled: boolean;
}

// ============================================================================
// NAMED CONSTANTS
// ============================================================================

// Particle counts by rarity
const PARTICLE_COUNT_COMMON = 8;
const PARTICLE_COUNT_UNCOMMON = 12;
const PARTICLE_COUNT_RARE = 20;
const PARTICLE_COUNT_EPIC = 35;
const PARTICLE_COUNT_LEGENDARY = 50;

// Glow intensities
const GLOW_INTENSITY_COMMON = 0.2;
const GLOW_INTENSITY_UNCOMMON = 0.3;
const GLOW_INTENSITY_RARE = 0.5;
const GLOW_INTENSITY_EPIC = 0.7;
const GLOW_INTENSITY_LEGENDARY = 0.9;

// Animation durations (in seconds)
const DURATION_STEP_MIN = 1.8; // Increased for more dramatic pacing (at least 1.5s per phase)
const DURATION_STEP_BASE = 2.0; // Longer for complex traits like grading
const DURATION_STEP_CARD = 2.5; // Longest for the dramatic card reveal

// Delays between reveal steps (in seconds)
const DELAY_INITIAL = 0.8;

// Trait animation timing (in seconds)
export const STAGGER_DELAY_PER_TRAIT = 0.08; // 80ms stagger between traits for smooth cascade
export const CARD_FADE_OUT_DURATION = 0.2; // 200ms fade for trait cards
export const CARD_ENTRANCE_DELAY = 0.05; // 50ms delay before card appears (reduced for faster feel)

// Rarity timing multipliers (lower = faster)
const RARITY_MULTIPLIER_COMMON = 0.6;
const RARITY_MULTIPLIER_UNCOMMON = 0.7;
const RARITY_MULTIPLIER_RARE = 0.85;
const RARITY_MULTIPLIER_EPIC = 1.0;
const RARITY_MULTIPLIER_LEGENDARY = 1.15;

// Total duration targets (in seconds)
const TOTAL_DURATION_COMMON = 3.5;
const TOTAL_DURATION_UNCOMMON = 4.0;
const TOTAL_DURATION_RARE = 4.5;
const TOTAL_DURATION_EPIC = 5.0;
const TOTAL_DURATION_LEGENDARY = 5.5;

// Base timeline configuration for progressive reveal
// Delays are optimized for 3.5-5.5s total duration (reduced from 10-18s)
const BASE_TIMELINE: RevealStepConfig[] = [
	{ field: "year", delay: DELAY_INITIAL, duration: DURATION_STEP_MIN }, // Start at 0.8s
	{ field: "grading", delay: 1.8, duration: DURATION_STEP_BASE }, // 1.0s gap to read year
	{ field: "setName", delay: 3.0, duration: DURATION_STEP_MIN }, // 1.2s gap to read grading
	{ field: "name", delay: 3.8, duration: DURATION_STEP_MIN }, // 0.8s gap to read set
	{ field: "card", delay: 4.6, duration: DURATION_STEP_CARD }, // 0.8s gap to read name
];

// Rarity-specific animation presets
export const REVEAL_PRESETS: Record<Rarity, RevealAnimationPreset> = {
	[Rarity.Common]: {
		timeline: BASE_TIMELINE.map((step) => ({
			...step,
			delay: step.delay * RARITY_MULTIPLIER_COMMON,
			duration: step.duration * RARITY_MULTIPLIER_COMMON,
		})),
		totalDuration: TOTAL_DURATION_COMMON,
		particleCount: PARTICLE_COUNT_COMMON,
		glowIntensity: GLOW_INTENSITY_COMMON,
		skipEnabled: true,
	},
	[Rarity.Uncommon]: {
		timeline: BASE_TIMELINE.map((step) => ({
			...step,
			delay: step.delay * RARITY_MULTIPLIER_UNCOMMON,
			duration: step.duration * RARITY_MULTIPLIER_UNCOMMON,
		})),
		totalDuration: TOTAL_DURATION_UNCOMMON,
		particleCount: PARTICLE_COUNT_UNCOMMON,
		glowIntensity: GLOW_INTENSITY_UNCOMMON,
		skipEnabled: true,
	},
	[Rarity.Rare]: {
		timeline: BASE_TIMELINE.map((step) => ({
			...step,
			delay: step.delay * RARITY_MULTIPLIER_RARE,
			duration: step.duration * RARITY_MULTIPLIER_RARE,
		})),
		totalDuration: TOTAL_DURATION_RARE,
		particleCount: PARTICLE_COUNT_RARE,
		glowIntensity: GLOW_INTENSITY_RARE,
		skipEnabled: true,
	},
	[Rarity.Epic]: {
		timeline: BASE_TIMELINE.map((step) => ({
			...step,
			delay: step.delay * RARITY_MULTIPLIER_EPIC,
			duration: step.duration * RARITY_MULTIPLIER_EPIC,
		})),
		totalDuration: TOTAL_DURATION_EPIC,
		particleCount: PARTICLE_COUNT_EPIC,
		glowIntensity: GLOW_INTENSITY_EPIC,
		skipEnabled: true,
	},
	[Rarity.Legendary]: {
		timeline: BASE_TIMELINE.map((step) => ({
			...step,
			delay: step.delay * RARITY_MULTIPLIER_LEGENDARY,
			duration: step.duration * RARITY_MULTIPLIER_LEGENDARY,
		})),
		totalDuration: TOTAL_DURATION_LEGENDARY,
		particleCount: PARTICLE_COUNT_LEGENDARY,
		glowIntensity: GLOW_INTENSITY_LEGENDARY,
		skipEnabled: true,
	},
};

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

// Helper function to get reveal config for a rarity
export const getRevealConfig = (rarity: Rarity): RevealAnimationPreset => {
	return REVEAL_PRESETS[rarity] || REVEAL_PRESETS[Rarity.Common];
};

// Helper to calculate cumulative delay for each reveal step
export const getRevealStepDelays = (rarity: Rarity): RevealStepConfig[] => {
	const config = getRevealConfig(rarity);
	return config.timeline;
};

// Helper to get spring config based on rarity
export const getSpringConfig = (rarity: Rarity) => {
	switch (rarity) {
		case Rarity.Common:
		case Rarity.Uncommon:
			return SPRING_CONFIGS.soft;
		case Rarity.Rare:
			return SPRING_CONFIGS.smooth;
		case Rarity.Epic:
			return SPRING_CONFIGS.bouncy;
		case Rarity.Legendary:
			return SPRING_CONFIGS.dramatic;
		default:
			return SPRING_CONFIGS.smooth;
	}
};

// Particle animation config for visual effects
export const getParticleConfig = (rarity: Rarity) => {
	const preset = getRevealConfig(rarity);
	const START_VELOCITY_EPIC_PLUS = 35;
	const START_VELOCITY_BASE = 25;
	const SCALAR_LEGENDARY = 1.5;
	const SCALAR_BASE = 1.2;
	const PARTICLE_SPREAD = 360;
	const PARTICLE_Z_INDEX = 9999;

	return {
		count: preset.particleCount,
		spread: PARTICLE_SPREAD,
		origin: { x: 0.5, y: 0.5 },
		zIndex: PARTICLE_Z_INDEX,
		startVelocity:
			rarity >= Rarity.Epic ? START_VELOCITY_EPIC_PLUS : START_VELOCITY_BASE,
		scalar: rarity === Rarity.Legendary ? SCALAR_LEGENDARY : SCALAR_BASE,
		particleCount: preset.particleCount,
	};
};

// Glow animation config based on rarity
export const getGlowConfig = (rarity: Rarity) => {
	const preset = getRevealConfig(rarity);
	const PULSE_DURATION_LEGENDARY = 3;
	const PULSE_DURATION_BASE = 4;
	// Use mutable arrays for framer-motion compatibility
	const SCALE_LEGENDARY = [1, 1.15, 1];
	const SCALE_BASE = [1, 1.1, 1];
	const OPACITY_LEGENDARY = [0.4, 0.6, 0.4];
	const OPACITY_BASE = [0.3, 0.5, 0.3];

	return {
		intensity: preset.glowIntensity,
		pulseDuration:
			rarity === Rarity.Legendary
				? PULSE_DURATION_LEGENDARY
				: PULSE_DURATION_BASE,
		scale: rarity === Rarity.Legendary ? SCALE_LEGENDARY : SCALE_BASE,
		opacity: rarity === Rarity.Legendary ? OPACITY_LEGENDARY : OPACITY_BASE,
	};
};

// Helper to get rarity multiplier for timing
export const getRarityMultiplier = (rarity: Rarity): number => {
	switch (rarity) {
		case Rarity.Common:
			return RARITY_MULTIPLIER_COMMON;
		case Rarity.Uncommon:
			return RARITY_MULTIPLIER_UNCOMMON;
		case Rarity.Rare:
			return RARITY_MULTIPLIER_RARE;
		case Rarity.Epic:
			return RARITY_MULTIPLIER_EPIC;
		case Rarity.Legendary:
			return RARITY_MULTIPLIER_LEGENDARY;
		default:
			return RARITY_MULTIPLIER_RARE;
	}
};

/**
 * Get phase timing configuration for progressive reveal
 * @returns Array of phase timing configs (duration and animation duration)
 *
 * Note: Timing is rarity-agnostic to maintain consistent UX across all pulls.
 * Rarity-based total duration scaling happens in NFTRevealModal via multipliers.
 */
export const getPhaseTiming = (): PhaseTimingConfig[] => {
	// Optimized timing for faster reveals with clear pauses between sections
	// Phase order: year → setName → name (title/subject) → grading → rarity → card
	const basePhases: PhaseTimingConfig[] = [
		{
			phase: "year",
			duration: DURATION_STEP_MIN,
			animationDuration: DURATION_STEP_MIN,
		}, // Year (e.g., "2021")
		{
			phase: "setName",
			duration: DURATION_STEP_MIN,
			animationDuration: DURATION_STEP_MIN,
		}, // Set name
		{
			phase: "name",
			duration: DURATION_STEP_MIN,
			animationDuration: DURATION_STEP_MIN,
		}, // Title/Subject
		{
			phase: "grading",
			duration: DURATION_STEP_BASE,
			animationDuration: DURATION_STEP_BASE,
		}, // Grading (slightly longer)
		{
			phase: "rarity",
			duration: DURATION_STEP_MIN,
			animationDuration: DURATION_STEP_MIN,
		}, // Rarity reveal (builds anticipation)
		{
			phase: "card",
			duration: DURATION_STEP_CARD,
			animationDuration: DURATION_STEP_CARD,
		}, // Card reveal (longest for drama)
	];

	return basePhases;
};

// ============================================================================
// TIMING TUNING GUIDE
// ============================================================================
//
// If you need to adjust reveal timing, follow these principles:
//
// 1. To make reveals feel faster:
//    - Reduce DURATION_STEP_MIN (but keep above 0.3s to avoid feeling rushed)
//    - Reduce DELAY_INITIAL (but keep above 0.5s to maintain anticipation)
//    - Reduce STAGGER_DELAY_PER_TRAIT (can go to 0.05s for faster cascade)
//
// 2. To make reveals feel more dramatic:
//    - Increase DURATION_STEP_CARD (up to 1.5s for maximum impact)
//    - Increase DELAY_INITIAL (up to 1.2s before first trait)
//    - Adjust rarity multipliers in REVEAL_PRESETS (not directly here)
//
// 3. If animations feel jerky:
//    - Check that STAGGER_DELAY_PER_TRAIT >= 0.05s (below this feels instant)
//    - Verify CARD_FADE_OUT_DURATION >= 0.15s (below this feels like a cut)
//    - Ensure spring configs in SPRING_CONFIGS have damping >= 10
//
// 4. To maintain total duration:
//    - Total = sum(phase durations) + cumulative delays
//    - If you add delay in one place, reduce duration elsewhere
//    - Example: Adding 80ms stagger = reduce phase duration by 50ms
//
// 5. Test changes across all rarities:
//    - Common (3.5s) should feel quick but not rushed
//    - Legendary (5.5s) should feel dramatic but not dragged
//    - Use skip button if total exceeds 6s (users will abandon)
//
// ============================================================================
