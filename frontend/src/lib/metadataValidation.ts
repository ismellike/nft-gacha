/**
 * Metadata validation utilities for NFT reveal system
 * Provides runtime type checking and safe accessors for metadata fields
 */

/**
 * NFT Metadata type definition
 * Defines expected structure and types for trading card metadata
 */
export interface NFTMetadata {
	// Core identifiers
	name?: string;
	title?: string;
	collection?: string;
	token_id?: string;

	// Trading card specific fields
	year?: string | number;
	set_number?: string;
	card_number?: string;

	// Grading fields
	grading_company?: string;
	grade?: string | number;
	cert_number?: string;

	// Additional metadata
	artist?: string;
	description?: string;
	image?: string;
	attributes?: unknown[];

	// Allow additional properties
	[key: string]: unknown;
}

/**
 * Validation result type
 */
interface ValidationResult<T> {
	success: boolean;
	data?: T;
	errors?: string[];
}

/**
 * Validate NFT metadata with basic type checking
 * Returns typed metadata or validation errors
 */
export function validateMetadata(
	metadata: unknown,
): ValidationResult<NFTMetadata> {
	try {
		// Check if metadata exists and is an object
		if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
			return {
				success: false,
				errors: ["Metadata must be a valid object"],
			};
		}

		// Metadata is valid - return it with proper typing
		return {
			success: true,
			data: metadata as NFTMetadata,
		};
	} catch (error) {
		return {
			success: false,
			errors: [(error as Error).message || "Unknown validation error"],
		};
	}
}

/**
 * Safe accessor utilities with fallbacks
 */

/**
 * Get year from metadata with fallback
 */
export function getYear(metadata: NFTMetadata | null): string | undefined {
	if (!metadata) return undefined;

	const year = metadata.year;
	if (!year) return undefined;

	// Convert number to string if needed
	return typeof year === "number" ? year.toString() : year;
}

/**
 * Get set name from metadata with fallback
 */
export function getSetName(metadata: NFTMetadata | null): string | undefined {
	if (!metadata) return undefined;
	return metadata.set_number ? `Set: ${metadata.set_number}` : undefined;
}

/**
 * Get card name/title from metadata with fallback
 * Falls back to "name" field if "title" is not present
 */
export function getCardName(metadata: NFTMetadata | null): string {
	if (!metadata) return "Unknown Card";

	// Try title first, then name, then fallback
	return metadata.title || metadata.name || "Unknown Card";
}

/**
 * Get grading information from metadata
 */
interface GradingInfo {
	company?: string;
	grade?: string;
	displayString: string;
}

export function getGradingInfo(
	metadata: NFTMetadata | null,
): GradingInfo | undefined {
	if (!metadata) return undefined;

	const company = metadata.grading_company;
	const grade = metadata.grade;

	if (!company && !grade) return undefined;

	// Format grade for display
	const gradeDisplay = grade ? grade.toString() : "";

	const result: GradingInfo = {
		displayString:
			company && gradeDisplay
				? `${companyDisplay(company)} ${gradeDisplay}`
				: company
					? companyDisplay(company)
					: gradeDisplay,
	};

	if (company) result.company = company;
	if (gradeDisplay) result.grade = gradeDisplay;

	return result;
}

/**
 * Format grading company name for display
 */
function companyDisplay(company: string): string {
	const companyMap: Record<string, string> = {
		psa: "PSA",
		bgs: "BGS",
		sgc: "SGC",
		csg: "CSG",
		beckett: "BGS",
	};
	return companyMap[company.toLowerCase()] || company.toUpperCase();
}

/**
 * Check if metadata has all required fields for progressive reveal
 */
export function hasRequiredRevealFields(metadata: NFTMetadata | null): {
	hasYear: boolean;
	hasSetName: boolean;
	hasName: boolean;
	hasGrading: boolean;
} {
	return {
		hasYear: !!metadata?.year,
		hasSetName: !!metadata?.set_number,
		hasName: !!(metadata?.title || metadata?.name),
		hasGrading: !!(metadata?.grading_company || metadata?.grade),
	};
}

/**
 * Get safe metadata for reveal animation
 * Ensures all fields are valid and present before starting reveal
 */
export function getSafeMetadataForReveal(metadata: unknown): {
	metadata: NFTMetadata | null;
	isValid: boolean;
	missingFields: string[];
} {
	const validation = validateMetadata(metadata);

	if (!validation.success) {
		return {
			metadata: null,
			isValid: false,
			missingFields: validation.errors || [],
		};
	}

	// biome-ignore lint/style/noNonNullAssertion: validation.success is checked above
	const safeMetadata = validation.data!;
	const fieldCheck = hasRequiredRevealFields(safeMetadata);
	const missingFields: string[] = [];

	// Don't treat missing optional fields as errors, just track them
	if (!fieldCheck.hasYear) missingFields.push("year");
	if (!fieldCheck.hasSetName) missingFields.push("set_number");
	if (!fieldCheck.hasName) missingFields.push("title/name");
	if (!fieldCheck.hasGrading) missingFields.push("grading");

	return {
		metadata: safeMetadata,
		isValid: true,
		missingFields,
	};
}
