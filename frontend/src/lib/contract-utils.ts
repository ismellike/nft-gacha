/**
 * Shared contract interaction utilities
 */

import type { Address } from "viem";

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
