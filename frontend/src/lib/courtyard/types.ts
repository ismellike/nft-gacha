"use client";

import type { NFTMetadata } from "../nft-metadata";

/**
 * Extended interface for Courtyard-specific metadata
 * Based on Courtyard's Pokemon card tokenization system
 */
export interface CourtyardMetadata extends NFTMetadata {
	// Standard NFT fields (inherited)
	name?: string;
	description?: string;
	image?: string;
	external_url?: string;

	// Courtyard-specific fields
	proof_of_integrity?: string;
	grading_company?: string; // e.g., "PSA", "BGS", "CGC"
	grade?: string | number; // e.g., "9", "10", "MINT"
	cert_number?: string; // Certification number from grading company
	set?: string; // e.g., "1999 Pokemon Base Set Shadowless 1st Edition"
	card_number?: string; // e.g., "#58"
	rarity?: string; // e.g., "Holo", "Rare", "Common"
	condition?: string; // e.g., "MINT", "NEAR MINT"
	category?: string; // e.g., "Pokemon TCG", "Baseball Cards"
	year?: string | number; // e.g., "1999"
	series?: string; // e.g., "Base Set"
	edition?: string; // e.g., "1st Edition", "Shadowless"
	variant?: string; // e.g., "Red Cheeks Pikachu"

	// Courtyard attributes may be in the attributes array
	attributes?: Array<{
		trait_type: string;
		value: string | number;
		display_type?: string;
	}>;
}
