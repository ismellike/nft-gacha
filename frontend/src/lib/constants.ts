/**
 * Centralized constants for hooks and utilities
 */

// Cache durations
export const CACHE_DURATIONS = {
	SHORT: 1 * 60 * 1000, // 1 minute
	MEDIUM: 10 * 60 * 1000, // 10 minutes
	LONG: 60 * 60 * 1000, // 1 hour
} as const;

// Spin configuration
export const SPIN_TIMEOUT_SECONDS = 300; // 5 minutes
export const MAX_FEE_SLIPPAGE_BPS = 200; // 2% max-fee buffer for UI

// Polling intervals
export const POLLING_INTERVAL_MS = 3000; // 3 seconds
export const BLOCK_LOOKBACK = 1000n;

// Fee staleness
export const FEE_STALENESS_MS = 15_000; // 15 seconds

// Appraisal thresholds
export const HIGH_VALUE_THRESHOLD = 1000n * 10n ** 18n; // > $1000

// Timeout durations
export const PENDING_SPIN_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const APPRAISAL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
export const BASE_SPIN_POLLING_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
