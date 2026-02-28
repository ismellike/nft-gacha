/**
 * Shared types for hooks
 */

// NFT metadata interfaces - compatible with all library types
export interface NFTMetadata {
	name: string;
	description?: string;
	image?: string;
	tokenURI?: string;
	external_url?: string;
	attributes?: Array<{
		trait_type: string;
		value: string | number;
	}>;
	// Courtyard-specific fields
	proof_of_integrity?: string;
	grading_company?: string;
	grade?: string | number;
	cert_number?: string;
	set_number?: string;
	card_number?: string;
	year?: string | number;
	title?: string; // Title/Subject for cards (e.g., "Gengar Vmax")
	artist?: string;
	// Allow additional properties for future extensions
	[key: string]: unknown;
}

// Hook result interfaces
export interface UseUserOwnedNFTsMultiResult {
	nfts: UserOwnedNFTMultiCollection[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

export interface NFTWithMetadata {
	collection: string;
	tokenId: string;
	tokenURI: string | null;
	metadata: NFTMetadata | null;
	imageUrl: string | null;
	isLoading: boolean;
	error: string | null;
}

export interface UserOwnedNFTMultiCollection {
	collection: string;
	tokenId: bigint;
	collectionName?: string;
}

