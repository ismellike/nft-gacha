"use client";

import type { PublicClient } from "viem";
import { erc721Abi } from "../generated";
import { isAddress } from "viem";

// Utility function for exponential backoff with jitter
export const getPollingDelay = (
	attempt: number,
	baseInterval: number,
): number => {
	const exponentialDelay = baseInterval * 2 ** Math.min(attempt / 10, 5);
	const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
	return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
};

// Input validation utilities
export const validateAddress = (
	address: string | null | undefined,
): address is `0x${string}` => {
	return !!address && isAddress(address);
};

export const validateTokenId = (
	tokenId: string | null | undefined,
): tokenId is string => {
	return !!tokenId && !Number.isNaN(Number(tokenId)) && Number(tokenId) >= 0;
};

export const validateUserAddress = (
	address: string | null | undefined,
): address is `0x${string}` => {
	return validateAddress(address);
};

// Common approval checking helper
export const checkApprovalNeeded = async ({
	collection,
	operatorAddress,
	userAddress,
	publicClient,
}: {
	collection: string;
	operatorAddress: string;
	userAddress: string;
	publicClient: PublicClient;
}): Promise<boolean> => {
	if (
		!validateAddress(collection) ||
		!validateAddress(operatorAddress) ||
		!validateUserAddress(userAddress) ||
		!publicClient
	) {
		throw new Error("Invalid parameters for approval check");
	}

	try {
		const isApprovedForAll = await publicClient.readContract({
			address: collection,
			abi: erc721Abi,
			functionName: "isApprovedForAll",
			args: [userAddress, operatorAddress],
		});

		return !isApprovedForAll;
	} catch (error) {
		console.error("Approval check failed, assuming approval needed:", error);
		return true;
	}
};

// NFT ownership confirmation helper
export const confirmNFTOwnershipChange = async ({
	collection,
	tokenId,
	userAddress,
	publicClient,
}: {
	collection: string;
	tokenId: string;
	userAddress: string;
	publicClient: PublicClient;
}): Promise<void> => {
	if (
		!validateAddress(collection) ||
		!validateTokenId(tokenId) ||
		!validateUserAddress(userAddress) ||
		!publicClient
	) {
		throw new Error("Invalid parameters for NFT ownership confirmation");
	}

	const currentOwner = await publicClient.readContract({
		address: collection as `0x${string}`,
		abi: erc721Abi,
		functionName: "ownerOf",
		args: [BigInt(tokenId)],
	});

	const isDeposited = currentOwner?.toLowerCase() !== userAddress.toLowerCase();

	if (!isDeposited) {
		throw new Error(
			"NFT still owned by user - ownership change confirmation failed",
		);
	}

	console.log("✅ [SharedActors] NFT ownership change confirmed");
};

// Enhanced logging utility
export const createMachineLogger = (machineName: string) => ({
	logInfo: (message: string, data?: Record<string, unknown>) => {
		console.log(`📋 [${machineName}] ${message}`, data || "");
	},
	logSuccess: (message: string, data?: Record<string, unknown>) => {
		console.log(`✅ [${machineName}] ${message}`, data || "");
	},
	logError: (message: string, error?: Error | Record<string, unknown>) => {
		console.error(`❌ [${machineName}] ${message}`, error || "");
	},
	logWarning: (message: string, data?: Record<string, unknown>) => {
		console.warn(`⚠️ [${machineName}] ${message}`, data || "");
	},
	logDebug: (message: string, data?: Record<string, unknown>) => {
		if (process.env.NODE_ENV === "development") {
			console.log(`🔍 [${machineName}] ${message}`, data || "");
		}
	},
});

// Common error types
export class MachineError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly context?: Record<string, unknown>,
	) {
		super(message);
		this.name = "MachineError";
	}
}

export const ErrorCodes = {
	VALIDATION_ERROR: "VALIDATION_ERROR",
	TIMEOUT_ERROR: "TIMEOUT_ERROR",
	NETWORK_ERROR: "NETWORK_ERROR",
	CONTRACT_ERROR: "CONTRACT_ERROR",
	USER_CANCELLATION: "USER_CANCELLATION",
	POLLING_ERROR: "POLLING_ERROR",
} as const;
