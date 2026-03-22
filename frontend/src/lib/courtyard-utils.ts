"use client";

/**
 * Re-export shim for backward compatibility.
 * The implementation has been split into focused modules under `./courtyard/`:
 *   - `./courtyard/types`    - CourtyardMetadata interface
 *   - `./courtyard/api`      - isCourtyardTokenURI, fetchCourtyardMetadata
 *   - `./courtyard/metadata` - image processing, parsing, formatting helpers
 *
 * All existing imports of this file continue to work unchanged.
 */
export type { CourtyardMetadata } from "./courtyard/types";
export {
	isCourtyardTokenURI,
	fetchCourtyardMetadata,
} from "./courtyard/api";
export {
	getCourtyardSlabBackUrl,
	processCourtyardImageUrl,
	parseCourtyardMetadata,
	formatCardTitle,
	formatGradeDisplay,
	getGradeColorScheme,
} from "./courtyard/metadata";
