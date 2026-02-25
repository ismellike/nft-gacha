/**
 * Courtyard utilities - barrel re-export for backward compatibility.
 * All existing imports of `../lib/courtyard-utils` continue to work
 * via the `courtyard-utils.ts` re-export shim.
 *
 * For new code, prefer importing directly from the focused modules:
 *   - `./types`    - CourtyardMetadata interface
 *   - `./api`      - isCourtyardTokenURI, fetchCourtyardMetadata
 *   - `./metadata` - processCourtyardImageUrl, parseCourtyardMetadata,
 *                    extractCourtyardGroupDisplay, formatCardTitle,
 *                    formatGradeDisplay, getGradeColorScheme
 */
export type { CourtyardMetadata } from "./types";
export {
	isCourtyardTokenURI,
	fetchCourtyardMetadata,
} from "./api";
export {
	processCourtyardImageUrl,
	parseCourtyardMetadata,
	extractCourtyardGroupDisplay,
	formatCardTitle,
	formatGradeDisplay,
	getGradeColorScheme,
} from "./metadata";
