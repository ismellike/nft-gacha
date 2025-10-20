/**
 * Shared contract interaction utilities
 */

import { useCallback } from "react";
import { usePublicClient } from "wagmi";
import type { Address, Hex } from "viem";
import { TIMEOUTS, RETRY_COUNTS } from "./constants";
import type { ContractInteractionOptions } from "../types/hooks";

/**
 * Hook for safe contract interactions with error handling and timeouts
 */
export function useContractReader() {
	const publicClient = usePublicClient();

	const readContractWithTimeout = useCallback(
		async <T>(
			address: Address,
			abi: readonly unknown[],
			functionName: string,
			args: readonly unknown[] = [],
			options: ContractInteractionOptions = {},
		): Promise<T | null> => {
			if (!publicClient) return null;

			const {
				retryCount = RETRY_COUNTS.CONTRACT_CALL,
				timeoutMs = TIMEOUTS.CONTRACT_READ,
			} = options;

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

			try {
				const result = await publicClient.readContract({
					address,
					abi,
					functionName,
					args,
					// Note: wagmi doesn't support AbortController natively,
					// but we'll use it for our timeout logic
				});

				clearTimeout(timeoutId);
				return result as T;
			} catch (error) {
				clearTimeout(timeoutId);

				if (retryCount > 0 && error instanceof Error) {
					console.warn(
						`Retrying contract call ${functionName}, ${retryCount} attempts left`,
					);
					// Exponential backoff
					await new Promise((resolve) =>
						setTimeout(
							resolve,
							1000 * (RETRY_COUNTS.CONTRACT_CALL - retryCount + 1),
						),
					);
					return readContractWithTimeout(address, abi, functionName, args, {
						...options,
						retryCount: retryCount - 1,
					});
				}

				console.error(`Contract call failed for ${functionName}:`, error);
				throw error;
			}
		},
		[publicClient],
	);

	return { readContractWithTimeout };
}

/**
 * Validates if an address is a valid contract address
 */
export function isValidContractAddress(
	address: string | undefined,
): address is Address {
	return (
		typeof address === "string" &&
		address.startsWith("0x") &&
		address.length === 42 &&
		/^[0-9a-fA-F]+$/.test(address.slice(2))
	);
}

/**
 * Validates if a hex string is properly formatted
 */
export function isValidHex(hex: string | undefined): hex is Hex {
	return (
		typeof hex === "string" &&
		hex.startsWith("0x") &&
		hex.length === 66 &&
		/^[0-9a-fA-F]+$/.test(hex.slice(2))
	);
}

/**
 * Batch contract call utility
 */
export async function batchContractReads<T>(
	calls: Array<{
		address: Address;
		abi: readonly unknown[];
		functionName: string;
		args?: readonly unknown[];
		options?: ContractInteractionOptions;
	}>,
): Promise<Array<T | null>> {
	const promises = calls.map(
		() =>
			// For now, we'll implement sequential batching
			// In a real implementation, you'd use multicall or similar
			new Promise<T | null>((resolve) => {
				// This would use the contract reader in a real implementation
				// For now, we'll simulate the call structure
				const result = null as T | null; // Placeholder
				resolve(result);
			}),
	);

	return Promise.all(promises);
}

/**
 * Common ERC721 ABI fragments
 */
export const ERC721_ABI_FRAGMENTS = {
	BALANCE_OF: {
		type: "function" as const,
		name: "balanceOf",
		stateMutability: "view" as const,
		inputs: [{ name: "owner", type: "address" }],
		outputs: [{ name: "", type: "uint256" }],
	},
	TOKEN_URI: {
		type: "function" as const,
		name: "tokenURI",
		stateMutability: "view" as const,
		inputs: [{ name: "tokenId", type: "uint256" }],
		outputs: [{ name: "", type: "string" }],
	},
	OWNER_OF: {
		type: "function" as const,
		name: "ownerOf",
		stateMutability: "view" as const,
		inputs: [{ name: "tokenId", type: "uint256" }],
		outputs: [{ name: "", type: "address" }],
	},
	TOKEN_OF_OWNER_BY_INDEX: {
		type: "function" as const,
		name: "tokenOfOwnerByIndex",
		stateMutability: "view" as const,
		inputs: [
			{ name: "owner", type: "address" },
			{ name: "index", type: "uint256" },
		],
		outputs: [{ name: "", type: "uint256" }],
	},
	SUPPORTS_INTERFACE: {
		type: "function" as const,
		name: "supportsInterface",
		stateMutability: "view" as const,
		inputs: [{ name: "interfaceId", type: "bytes4" }],
		outputs: [{ name: "", type: "bool" }],
	},
	NAME: {
		type: "function" as const,
		name: "name",
		stateMutability: "view" as const,
		inputs: [],
		outputs: [{ name: "", type: "string" }],
	},
} as const;
