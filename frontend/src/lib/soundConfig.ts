/**
 * Pure Web Audio API synthesis functions for gacha sound effects.
 * No external dependencies - all sounds are synthesized at runtime (~3KB).
 */

/** Master volume for all sounds (0-1). Keep subtle. */
const MASTER_VOLUME = 0.15;

/** Create a gain node with master volume applied */
function masterGain(ctx: AudioContext, volume = 1): GainNode {
	const gain = ctx.createGain();
	gain.gain.value = volume * MASTER_VOLUME;
	gain.connect(ctx.destination);
	return gain;
}

/**
 * Percussive click + rising whoosh for spin initiation.
 * 10ms sine at 800Hz + 200ms noise sweep.
 */
export function playSpinClick(ctx: AudioContext): void {
	const now = ctx.currentTime;

	// Percussive click - short sine burst
	const osc = ctx.createOscillator();
	const clickGain = masterGain(ctx, 0.8);
	osc.type = "sine";
	osc.frequency.setValueAtTime(800, now);
	osc.frequency.exponentialRampToValueAtTime(1200, now + 0.01);
	clickGain.gain.setValueAtTime(0.8 * MASTER_VOLUME, now);
	clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
	osc.connect(clickGain);
	osc.start(now);
	osc.stop(now + 0.05);

	// Rising whoosh - filtered noise
	const bufferSize = ctx.sampleRate * 0.2;
	const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
	const data = noiseBuffer.getChannelData(0);
	for (let i = 0; i < bufferSize; i++) {
		data[i] = Math.random() * 2 - 1;
	}
	const noise = ctx.createBufferSource();
	noise.buffer = noiseBuffer;

	const filter = ctx.createBiquadFilter();
	filter.type = "bandpass";
	filter.frequency.setValueAtTime(400, now);
	filter.frequency.exponentialRampToValueAtTime(2000, now + 0.2);
	filter.Q.value = 2;

	const noiseGain = masterGain(ctx, 0.3);
	noiseGain.gain.setValueAtTime(0, now);
	noiseGain.gain.linearRampToValueAtTime(0.3 * MASTER_VOLUME, now + 0.05);
	noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

	noise.connect(filter);
	filter.connect(noiseGain);
	noise.start(now);
	noise.stop(now + 0.2);
}

/**
 * Ascending pitch dings for trait reveals.
 * C5 chromatic scale, 120ms each. Step index determines pitch.
 */
export function playTraitDing(ctx: AudioContext, stepIndex: number): void {
	const now = ctx.currentTime;

	// C5 = 523.25Hz, each chromatic step multiplies by 2^(1/12)
	const baseFreq = 523.25;
	const freq = baseFreq * 2 ** (stepIndex / 12);

	const osc = ctx.createOscillator();
	osc.type = "triangle";
	osc.frequency.setValueAtTime(freq, now);

	const gain = masterGain(ctx, 0.6);
	gain.gain.setValueAtTime(0.6 * MASTER_VOLUME, now);
	gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

	osc.connect(gain);
	osc.start(now);
	osc.stop(now + 0.12);
}

/**
 * Rarity-scaled reveal sound.
 * Lowest rarity = single tone, highest = 5-note fanfare.
 * @param rarityIndex - Numeric rarity index (0 = lowest)
 * @param numRarities - Total number of rarity tiers
 */
export function playRarityReveal(
	ctx: AudioContext,
	rarityIndex: number,
	numRarities = 5,
): void {
	const now = ctx.currentTime;
	const maxIndex = Math.max(numRarities - 1, 1);
	const normalized = rarityIndex / maxIndex; // 0.0 to 1.0

	// Note count scales: 1 for lowest, up to 5 for highest
	const noteCount = Math.min(rarityIndex + 1, 5);
	// Volume scales from 0.4 to 0.9
	const volume = 0.4 + normalized * 0.5;

	// Ascending major pentatonic scale from E5
	const intervals = [0, 2, 4, 7, 9]; // pentatonic semitones
	const baseFreq = 659.25; // E5

	// Use "sine" for top 2 tiers, "triangle" for lower
	const isHighTier = rarityIndex >= numRarities - 2;

	for (let i = 0; i < noteCount; i++) {
		const offset = i * 0.1;
		const freq = baseFreq * 2 ** (intervals[i] / 12);

		const osc = ctx.createOscillator();
		osc.type = isHighTier ? "sine" : "triangle";
		osc.frequency.setValueAtTime(freq, now + offset);

		const gain = masterGain(ctx, volume);
		gain.gain.setValueAtTime(0, now + offset);
		gain.gain.linearRampToValueAtTime(
			volume * MASTER_VOLUME,
			now + offset + 0.02,
		);
		gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);

		osc.connect(gain);
		osc.start(now + offset);
		osc.stop(now + offset + 0.15);
	}

	// Top-tier shimmer: add a subtle high-frequency sparkle
	if (rarityIndex >= numRarities - 1) {
		const shimmerOsc = ctx.createOscillator();
		shimmerOsc.type = "sine";
		shimmerOsc.frequency.setValueAtTime(2637, now + 0.3); // E7
		shimmerOsc.frequency.exponentialRampToValueAtTime(3951, now + 0.8); // B7

		const shimmerGain = masterGain(ctx, 0.15);
		shimmerGain.gain.setValueAtTime(0, now + 0.3);
		shimmerGain.gain.linearRampToValueAtTime(0.15 * MASTER_VOLUME, now + 0.4);
		shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

		shimmerOsc.connect(shimmerGain);
		shimmerOsc.start(now + 0.3);
		shimmerOsc.stop(now + 0.8);
	}
}

/**
 * Card reveal: low sweep (100Hz->400Hz) + percussive hit.
 * Rarity scales duration and intensity.
 * @param rarityIndex - Numeric rarity index (0 = lowest)
 * @param numRarities - Total number of rarity tiers
 */
export function playCardReveal(
	ctx: AudioContext,
	rarityIndex: number,
	numRarities = 5,
): void {
	const now = ctx.currentTime;
	const maxIndex = Math.max(numRarities - 1, 1);
	const normalized = rarityIndex / maxIndex; // 0.0 to 1.0

	const duration = 0.3 + normalized * 0.4; // 0.3s to 0.7s
	const volume = 0.5 + normalized * 0.4; // 0.5 to 0.9

	// Low sweep
	const sweep = ctx.createOscillator();
	sweep.type = "sine";
	sweep.frequency.setValueAtTime(100, now);
	sweep.frequency.exponentialRampToValueAtTime(400, now + duration);

	const sweepGain = masterGain(ctx, volume * 0.6);
	sweepGain.gain.setValueAtTime(volume * 0.6 * MASTER_VOLUME, now);
	sweepGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

	sweep.connect(sweepGain);
	sweep.start(now);
	sweep.stop(now + duration);

	// Percussive hit
	const hit = ctx.createOscillator();
	hit.type = "square";
	hit.frequency.setValueAtTime(150, now);
	hit.frequency.exponentialRampToValueAtTime(60, now + 0.08);

	const hitGain = masterGain(ctx, volume * 0.4);
	hitGain.gain.setValueAtTime(volume * 0.4 * MASTER_VOLUME, now);
	hitGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

	hit.connect(hitGain);
	hit.start(now);
	hit.stop(now + 0.1);
}

/**
 * "Cha-ching" for value reveal: two quick high tones + shimmer noise burst.
 */
export function playValueReveal(ctx: AudioContext): void {
	const now = ctx.currentTime;

	// Two quick high tones
	for (let i = 0; i < 2; i++) {
		const offset = i * 0.08;
		const osc = ctx.createOscillator();
		osc.type = "sine";
		osc.frequency.setValueAtTime(1318.5 + i * 200, now + offset); // E6, then higher

		const gain = masterGain(ctx, 0.5);
		gain.gain.setValueAtTime(0.5 * MASTER_VOLUME, now + offset);
		gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

		osc.connect(gain);
		osc.start(now + offset);
		osc.stop(now + offset + 0.1);
	}

	// Shimmer noise burst
	const bufferSize = Math.floor(ctx.sampleRate * 0.15);
	const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
	const data = noiseBuffer.getChannelData(0);
	for (let i = 0; i < bufferSize; i++) {
		data[i] = Math.random() * 2 - 1;
	}
	const noise = ctx.createBufferSource();
	noise.buffer = noiseBuffer;

	const filter = ctx.createBiquadFilter();
	filter.type = "highpass";
	filter.frequency.value = 4000;

	const noiseGain = masterGain(ctx, 0.2);
	noiseGain.gain.setValueAtTime(0.2 * MASTER_VOLUME, now + 0.12);
	noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

	noise.connect(filter);
	filter.connect(noiseGain);
	noise.start(now + 0.12);
	noise.stop(now + 0.3);
}

/**
 * Fast descending whoosh for skip animation (600Hz->200Hz, 150ms).
 */
export function playSkipSound(ctx: AudioContext): void {
	const now = ctx.currentTime;

	const osc = ctx.createOscillator();
	osc.type = "sine";
	osc.frequency.setValueAtTime(600, now);
	osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);

	const gain = masterGain(ctx, 0.4);
	gain.gain.setValueAtTime(0.4 * MASTER_VOLUME, now);
	gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

	osc.connect(gain);
	osc.start(now);
	osc.stop(now + 0.15);
}
