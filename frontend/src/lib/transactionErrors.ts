/**
 * Transaction Error Mapping Utility
 *
 * Converts technical blockchain error messages into user-friendly error messages
 * with actionable next steps.
 */

import { UserRejectedRequestError } from "viem";

/**
 * Returns true when the error represents a deliberate user rejection/cancellation
 * of a wallet prompt, rather than an unexpected failure.
 */
export function isUserRejectedError(error: unknown): boolean {
	if (error instanceof UserRejectedRequestError) {
		return true;
	}
	if (error instanceof Error) {
		const lower = error.message.toLowerCase();
		return (
			lower.includes("rejected") ||
			lower.includes("denied") ||
			lower.includes("cancelled") ||
			lower.includes("canceled")
		);
	}
	return false;
}


export interface UserFriendlyError {
	title: string;
	message: string;
	action?: string;
	canRetry: boolean;
}

export function mapTransactionError(
	error: Error | { message?: string; code?: number | string; cause?: unknown },
): UserFriendlyError {
	const message = String("message" in error ? error.message : "");
	const lowerMessage = message.toLowerCase();
	const errorCode = "code" in error ? error.code : undefined;

	// User rejected transaction
	if (
		lowerMessage.includes("rejected") ||
		lowerMessage.includes("denied") ||
		lowerMessage.includes("cancelled") ||
		lowerMessage.includes("canceled") ||
		errorCode === 4001
	) {
		return {
			title: "Transaction Cancelled",
			message:
				"You cancelled the transaction in your wallet. No funds were spent.",
			canRetry: true,
		};
	}

	// Insufficient funds for gas
	if (
		lowerMessage.includes("insufficient funds") ||
		lowerMessage.includes("exceeds balance")
	) {
		return {
			title: "Insufficient Funds",
			message:
				"You don't have enough ETH to pay for gas fees. Please add more ETH to your wallet and try again.",
			action: "Add ETH to wallet",
			canRetry: false,
		};
	}

	// Fee mismatch (dynamic pricing changed)
	if (
		lowerMessage.includes("fee") ||
		lowerMessage.includes("maxfee") ||
		(lowerMessage.includes("revert") && lowerMessage.includes("spin"))
	) {
		return {
			title: "Price Updated",
			message:
				"The spin fee just changed. This happens when the treasury inventory changes from new deposits. We've refreshed the latest price for you.",
			action: "Try again with updated fee",
			canRetry: true,
		};
	}

	// Invalid signature / permit issues
	if (
		lowerMessage.includes("invalid signature") ||
		lowerMessage.includes("permit") ||
		lowerMessage.includes("signature")
	) {
		return {
			title: "Signature Error",
			message:
				"There was an issue with the signature. This can happen if you cancelled or if there's a wallet compatibility issue.",
			action: "Try signing again",
			canRetry: true,
		};
	}

	// Network errors
	if (
		lowerMessage.includes("network") ||
		lowerMessage.includes("timeout") ||
		lowerMessage.includes("rpc")
	) {
		return {
			title: "Network Error",
			message:
				"There was a problem connecting to the blockchain. Please check your internet connection and try again.",
			action: "Check connection and retry",
			canRetry: true,
		};
	}

	// Default fallback
	return {
		title: "Transaction Failed",
		message:
			"Something went wrong with your transaction. Please try again. If this continues, contact support.",
		canRetry: true,
	};
}
