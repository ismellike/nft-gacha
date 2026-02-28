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
