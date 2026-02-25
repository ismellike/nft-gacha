"use client";

import type { CourtyardMetadata } from "./types";

/**
 * Processes and validates Courtyard image URL with comprehensive fallbacks
 */
export function processCourtyardImageUrl(
	metadata: CourtyardMetadata,
): string | null {
	if (!metadata) {
		console.warn("No metadata provided to processCourtyardImageUrl");
		return null;
	}

	// Direct image field - most common case
	if (metadata.image) {
		const url = metadata.image.trim();
		if (url.startsWith("http://") || url.startsWith("https://")) {
			return url;
		}
		// Handle IPFS URLs in image field
		if (url.startsWith("ipfs://")) {
			const ipfsUrl = url.replace("ipfs://", "https://ipfs.io/ipfs/");
			return ipfsUrl;
		}
	}

	// Check for image in attributes - more comprehensive search
	if (metadata.attributes && Array.isArray(metadata.attributes)) {
		for (const attr of metadata.attributes) {
			if (!attr || typeof attr !== "object") continue;

			// Check various image-related trait types
			const traitType = attr.trait_type?.toLowerCase() || "";
			const isImageTrait =
				traitType.includes("image") ||
				traitType.includes("photo") ||
				traitType.includes("picture") ||
				traitType.includes("url");

			if (isImageTrait && typeof attr.value === "string") {
				const value = attr.value.trim();
				if (value.startsWith("http://") || value.startsWith("https://")) {
					return value;
				}
				if (value.startsWith("ipfs://")) {
					const ipfsUrl = value.replace("ipfs://", "https://ipfs.io/ipfs/");
					return ipfsUrl;
				}
			}
		}
	}

	// Check for external_url as fallback - more permissive image detection
	if (metadata.external_url) {
		const url = metadata.external_url.trim();
		const isImageUrl =
			url.includes(".jpg") ||
			url.includes(".jpeg") ||
			url.includes(".png") ||
			url.includes(".gif") ||
			url.includes(".webp") ||
			url.includes(".svg") ||
			url.includes("image") ||
			url.includes("photo");

		if (
			isImageUrl &&
			(url.startsWith("http://") || url.startsWith("https://"))
		) {
			return url;
		}
	}

	// Final fallback - check any metadata field that might contain an image URL
	const allValues = Object.values(metadata).filter(
		(value) =>
			typeof value === "string" &&
			(value.startsWith("http://") || value.startsWith("https://")) &&
			(value.includes(".jpg") ||
				value.includes(".jpeg") ||
				value.includes(".png") ||
				value.includes(".gif") ||
				value.includes(".webp") ||
				value.includes("image")),
	);

	if (allValues.length > 0) {
		return allValues[0] as string;
	}

	console.warn(
		"No valid image URL found in Courtyard metadata. Available fields:",
		{
			metadataKeys: Object.keys(metadata),
			imageField: metadata.image,
			externalUrl: metadata.external_url,
			attributeCount: metadata.attributes?.length || 0,
		},
	);
	return null;
}

/**
 * Extracts structured information from Courtyard metadata
 */
export function parseCourtyardMetadata(metadata: CourtyardMetadata) {
	// Extract grading information
	const grading = {
		company:
			metadata.grading_company ||
			(metadata.attributes?.find(
				(attr) =>
					attr.trait_type?.toLowerCase().includes("grading_company") ||
					attr.trait_type?.toLowerCase().includes("grader"),
			)?.value as string),
		grade:
			metadata.grade ||
			metadata.attributes?.find(
				(attr) =>
					attr.trait_type?.toLowerCase().includes("grade") &&
					!attr.trait_type?.toLowerCase().includes("company"),
			)?.value,
		// Try to extract full grade from title if available (like "6 EX-MT" from "PSA 6 EX-MT")
		fullGrade: (() => {
			// Look for grade patterns in the original title like "PSA 6 EX-MT", "BGS 9.5", etc.
			const gradeMatch = metadata.name?.match(
				/\b(PSA|BGS|SGC|CGC)\s+(\d+(?:\.\d+)?(?:\s+[A-Z-]+)*)\b/i,
			);
			if (gradeMatch) {
				return gradeMatch[2]; // Return "6 EX-MT", "9.5", etc.
			}

			// Fallback to regular grade field
			return (
				metadata.grade ||
				metadata.attributes?.find(
					(attr) =>
						attr.trait_type?.toLowerCase().includes("grade") &&
						!attr.trait_type?.toLowerCase().includes("company"),
				)?.value
			);
		})(),
		certNumber:
			metadata.cert_number ||
			(metadata.attributes?.find(
				(attr) =>
					attr.trait_type?.toLowerCase().includes("cert") ||
					attr.trait_type?.toLowerCase().includes("certification"),
			)?.value as string),
		condition:
			metadata.condition ||
			(metadata.attributes?.find((attr) =>
				attr.trait_type?.toLowerCase().includes("condition"),
			)?.value as string),
	};

	// Extract set information
	const setInfo = {
		set:
			metadata.set ||
			(metadata.attributes?.find((attr) =>
				attr.trait_type?.toLowerCase().includes("set"),
			)?.value as string),
		series:
			metadata.series ||
			(metadata.attributes?.find((attr) =>
				attr.trait_type?.toLowerCase().includes("series"),
			)?.value as string),
		year:
			metadata.year ||
			metadata.attributes?.find((attr) =>
				attr.trait_type?.toLowerCase().includes("year"),
			)?.value,
		edition:
			metadata.edition ||
			(metadata.attributes?.find((attr) =>
				attr.trait_type?.toLowerCase().includes("edition"),
			)?.value as string),
		cardNumber:
			(metadata.attributes?.find((attr) => attr.trait_type === "Card Number")
				?.value as string) ||
			metadata.card_number ||
			(metadata.attributes?.find(
				(attr) =>
					attr.trait_type?.toLowerCase().includes("card_number") ||
					attr.trait_type?.toLowerCase().includes("number") ||
					attr.trait_type?.toLowerCase().includes("card_num"),
			)?.value as string),
		rarity:
			metadata.rarity ||
			(metadata.attributes?.find((attr) =>
				attr.trait_type?.toLowerCase().includes("rarity"),
			)?.value as string),
	};

	// Extract card details and title/subject
	const cardDetails = {
		category:
			metadata.category ||
			(metadata.attributes?.find(
				(attr) =>
					attr.trait_type?.toLowerCase().includes("category") ||
					attr.trait_type?.toLowerCase().includes("type"),
			)?.value as string),
		variant:
			metadata.variant ||
			(metadata.attributes?.find(
				(attr) =>
					attr.trait_type?.toLowerCase().includes("variant") ||
					attr.trait_type?.toLowerCase().includes("special"),
			)?.value as string),
		proofOfIntegrity: metadata.proof_of_integrity,
		// Extract the card title/subject - look for "Title/Subject" attribute first
		title:
			(metadata.attributes?.find((attr) => attr.trait_type === "Title/Subject")
				?.value as string) ||
			metadata.name ||
			(metadata.attributes?.find(
				(attr) =>
					attr.trait_type?.toLowerCase().includes("title") ||
					attr.trait_type?.toLowerCase().includes("subject") ||
					attr.trait_type?.toLowerCase().includes("character") ||
					attr.trait_type?.toLowerCase().includes("player") ||
					attr.trait_type?.toLowerCase().includes("card_name") ||
					attr.trait_type?.toLowerCase().includes("pokemon"),
			)?.value as string),
	};

	return {
		grading,
		setInfo,
		cardDetails,
		// Keep original metadata for fallback
		originalMetadata: metadata,
	};
}

/**
 * Build deterministic grouping components from Courtyard metadata.
 * Includes grader and grade since they dictate price.
 * Excludes unique identifiers (e.g., Serial, images). Normalizes values.
 */

/**
 * Return a human-readable breakdown of group components for display.
 */
export function extractCourtyardGroupDisplay(metadata: CourtyardMetadata) {
	const attrs = metadata.attributes ?? [];
	const get = (name: string) =>
		attrs
			.find((a) => a.trait_type === name)
			?.value?.toString()
			.trim();
	const tags = attrs
		.filter(
			(a) =>
				!a.trait_type &&
				typeof a.value === "string" &&
				a.value.trim().length > 0,
		)
		.map((a) => (a.value as string).trim())
		.sort() as string[];

	return {
		grader: get("Grader") || "",
		grade: get("Grade") || "",
		set: get("Set") || "",
		title: get("Title/Subject") || metadata.name || "",
		language: get("Language") || "English",
		cardNumber: get("Card Number") || "",
		year: get("Year") || "",
		category: get("Category") || "",
		event: get("Event") || "",
		tags,
	};
}

/**
 * Formats the card title to be concise and avoid duplication with other sections
 * Examples: "Enamorus #180", "Charizard #4", "Babe Ruth"
 */
export function formatCardTitle(
	title?: string,
	cardNumber?: string,
	_category?: string,
	_metadata?: CourtyardMetadata,
): string {
	// Use the title directly if it's clean (like "Enamorus" from Title/Subject attribute)
	if (!title) return "";

	// Clean up the card number - ensure it starts with #
	let formattedNumber = "";
	if (cardNumber) {
		const numberMatch = cardNumber.match(/\d+/);
		if (numberMatch) {
			formattedNumber = `#${numberMatch[0]}`;
		}
	}

	// Format as "Character #Number" or just "Character"
	if (formattedNumber) {
		return `${title} ${formattedNumber}`;
	}

	return title;
}

/**
 * Formats grading display text
 */
export function formatGradeDisplay(
	grade: string | number | undefined,
	company?: string,
	fullGrade?: string | number | undefined,
): string {
	if (!grade) return "";

	// Use fullGrade if available (contains condition like "6 EX-MT")
	const gradeToUse = fullGrade?.toString() || grade.toString();

	// If we have both company and grade, always format as "COMPANY GRADE"
	if (company) {
		// If the grade already contains the company, just return it
		if (gradeToUse.toLowerCase().includes(company.toLowerCase())) {
			return gradeToUse;
		}

		// Otherwise, prepend company
		return `${company} ${gradeToUse}`;
	}

	// No company provided, just return the grade
	return gradeToUse;
}

/**
 * Gets the appropriate color scheme for a grade
 */
export function getGradeColorScheme(grade: string | number | undefined): {
	gradient: string;
	textColor: string;
	borderColor: string;
} {
	if (!grade) {
		return {
			gradient: "from-gray-400 to-gray-600",
			textColor: "text-gray-300",
			borderColor: "border-gray-400/30",
		};
	}

	const numGrade = Number(grade);

	if (!Number.isNaN(numGrade)) {
		if (numGrade === 10) {
			return {
				gradient: "from-yellow-400 via-yellow-500 to-yellow-600",
				textColor: "text-yellow-100",
				borderColor: "border-yellow-400/40",
			};
		} else if (numGrade === 9) {
			return {
				gradient: "from-info via-info to-info",
				textColor: "text-info-100",
				borderColor: "border-info/40",
			};
		} else if (numGrade >= 8) {
			return {
				gradient: "from-green-400 via-green-500 to-green-600",
				textColor: "text-green-100",
				borderColor: "border-green-400/40",
			};
		} else if (numGrade >= 6) {
			return {
				gradient: "from-orange-400 via-orange-500 to-orange-600",
				textColor: "text-orange-100",
				borderColor: "border-orange-400/40",
			};
		} else {
			return {
				gradient: "from-red-400 via-red-500 to-red-600",
				textColor: "text-red-100",
				borderColor: "border-red-400/40",
			};
		}
	}

	// For text grades, use a neutral scheme
	return {
		gradient: "from-secondary via-secondary to-secondary",
		textColor: "text-secondary-100",
		borderColor: "border-secondary/40",
	};
}
