/**
 * Shared types for hooks
 */

import type { Address, Hex } from "viem";

// Base hook result interface
export interface BaseHookResult<T> {
	data: T | null;
	isLoading: boolean;
	error: string | null;
}

// Extended hook result with refetch
export interface HookResult<T> extends BaseHookResult<T> {
	refetch: () => Promise<void>;
}

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
	artist?: string;
	// Allow additional properties for future extensions
	[key: string]: unknown;
}

// Hook result interfaces
export interface UseUserOwnedNFTsResult {
	tokens: bigint[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

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

// Card appraisal interfaces
export interface CardAppraisal {
	priceUSD: bigint;
	status: number; // AppraisalStatus enum
	firstTimestamp: bigint;
	lastUpdated: bigint;
	canonicalContractAddress: Address;
	canonicalTokenId: bigint;
}

// User NFT interfaces
export interface UserOwnedNFT {
	tokenId: bigint;
	contractAddress: string;
}

export interface UserOwnedNFTMultiCollection {
	collection: string;
	tokenId: bigint;
	collectionName?: string;
}

// Treasury card interfaces
export interface UserCardDeposit {
	cardId: Hex;
	depositCount: bigint;
	totalCardDeposits: bigint;
}

export interface PaginatedCardDeposits {
	deposits: UserCardDeposit[];
	total: bigint;
	hasMore: boolean;
}

// Contract interaction options
export interface ContractInteractionOptions {
	enabled?: boolean;
	retryCount?: number;
	timeoutMs?: number;
	priority?: number;
}

// Batch operation options
export interface BatchOperationOptions<T> {
	batchSize?: number;
	enabled?: boolean;
	onProgress?: (completed: number, total: number) => void;
	onError?: (error: Error, item: T) => void;
}
