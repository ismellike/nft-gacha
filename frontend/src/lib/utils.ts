// ============================================================================
// ADDRESS FORMATTING
// ============================================================================

/**
 * Formats blockchain addresses with proper truncation and case handling
 * Industry standard: 0x1234...abcd format
 */
export function formatAddress(
	address: string,
	options: {
		startChars?: number;
		endChars?: number;
		middleText?: string;
		ensureChecksum?: boolean;
	} = {},
): string {
	if (!address) return "";
	if (typeof address !== "string") return "";
	if (!address.startsWith("0x")) return address;
	if (address.length < 10) return address;

	const {
		startChars = 6,
		endChars = 4,
		middleText = "...",
		ensureChecksum = false,
	} = options;

	const cleanAddress =
		ensureChecksum && address.length === 42
			? address // Could add checksum validation here
			: address.toLowerCase();

	return `${cleanAddress.slice(0, startChars)}${middleText}${cleanAddress.slice(-endChars)}`;
}

/**
 * Formats transaction hashes with standard truncation
 */
export function formatTxHash(hash: string): string {
	return formatAddress(hash, { startChars: 10, endChars: 8 });
}

/**
 * Formats block numbers with thousand separators
 */
export function formatBlockNumber(blockNumber: bigint | number): string {
	return Number(blockNumber).toLocaleString();
}

// ============================================================================
// TOKEN AMOUNT FORMATTING
// ============================================================================

/**
 * Enhanced token amount formatting with pure BigInt arithmetic
 */
export function formatTokenAmount(
	amount: bigint | string | number,
	decimals: number = 18,
	options: {
		maxDecimals?: number;
		minDecimals?: number;
		useGrouping?: boolean;
		notation?: "standard" | "compact" | "scientific";
		suffix?: string;
		prefix?: string;
	} = {},
): string {
	const {
		maxDecimals = 6,
		useGrouping = true,
		suffix = "",
		prefix = "",
	} = options;

	if (!amount && amount !== 0) return "0";

	try {
		// Convert to bigint if needed
		const bigIntAmount =
			typeof amount === "bigint" ? amount : BigInt(amount.toString());

		// Use pure BigInt arithmetic for divisor
		let divisor = BigInt(10);
		for (let i = 1; i < decimals; i++) {
			divisor *= BigInt(10);
		}
		const quotient = bigIntAmount / divisor;
		const remainder = bigIntAmount % divisor;

		// Helper function to format BigInt numbers with grouping
		const formatBigInt = (bigNum: bigint): string => {
			const str = bigNum.toString();
			if (!useGrouping || str.length <= 3) return str;

			// Add thousands separators from right to left
			const groups = [];
			let start = str.length;

			while (start > 0) {
				const end = start;
				start = Math.max(0, start - 3);
				groups.unshift(str.slice(start, end));
			}

			return groups.join(",");
		};

		// Handle whole numbers (no remainder)
		if (remainder === BigInt(0)) {
			const formatted = formatBigInt(quotient);
			return `${prefix}${formatted}${suffix}`;
		}

		// Convert remainder to decimal string
		const remainderStr = remainder.toString().padStart(decimals, "0");
		const trimmedRemainder = remainderStr.replace(/0+$/, "");

		// Handle cases where decimal part gets trimmed away
		if (trimmedRemainder === "") {
			const formatted = formatBigInt(quotient);
			return `${prefix}${formatted}${suffix}`;
		}

		// Get the decimal part limited by maxDecimals
		const decimalPart = trimmedRemainder.slice(0, maxDecimals);
		const wholeNumber = formatBigInt(quotient);

		return `${prefix}${wholeNumber}.${decimalPart}${suffix}`;
	} catch (error) {
		console.warn("Error formatting token amount:", error);
		return "0";
	}
}

/**
 * Format token amounts with currency-style notation
 */
export function formatCurrency(
	amount: bigint | string | number,
	decimals: number = 18,
	symbol: string = "",
	notation: "standard" | "compact" = "standard",
): string {
	return formatTokenAmount(amount, decimals, {
		notation,
		maxDecimals: 2,
		suffix: symbol ? ` ${symbol}` : "",
	});
}

/**
 * Format percentage with proper decimal handling
 */
export function formatPercentage(
	value: number | bigint,
	decimals: number = 2,
	isAlreadyPercentage: boolean = false,
): string {
	const numValue = Number(value);
	const percentage = isAlreadyPercentage ? numValue : numValue * 100;
	return `${percentage.toFixed(decimals)}%`;
}

// ============================================================================
// DATE & TIME FORMATTING
// ============================================================================

/**
 * Format timestamps for blockchain data
 */
export function formatTimestamp(
	timestamp: number | bigint,
	options: {
		format?: "relative" | "absolute" | "both";
		showTime?: boolean;
	} = {},
): string {
	const { format = "relative", showTime = true } = options;
	const date = new Date(Number(timestamp) * 1000);

	if (format === "relative") {
		return formatRelativeTime(date);
	}

	if (format === "absolute") {
		return showTime
			? date.toLocaleString("en-US", {
					year: "numeric",
					month: "short",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				})
			: date.toLocaleDateString("en-US", {
					year: "numeric",
					month: "short",
					day: "numeric",
				});
	}

	// Both format
	const relative = formatRelativeTime(date);
	const absolute = date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
	return `${relative} (${absolute})`;
}

function formatRelativeTime(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMinutes < 1) return "Just now";
	if (diffMinutes < 60) return `${diffMinutes}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 30) return `${diffDays}d ago`;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

// ============================================================================
// TEXT FORMATTING
// ============================================================================

export function truncateText(
	text: string,
	maxLength: number,
	options: {
		position?: "end" | "middle" | "start";
		ellipsis?: string;
	} = {},
): string {
	const { position = "end", ellipsis = "..." } = options;

	if (!text || text.length <= maxLength) return text;

	if (position === "middle") {
		const startChars = Math.floor((maxLength - ellipsis.length) / 2);
		const endChars = maxLength - startChars - ellipsis.length;
		return `${text.slice(0, startChars)}${ellipsis}${text.slice(-endChars)}`;
	}

	if (position === "start") {
		return `${ellipsis}${text.slice(-(maxLength - ellipsis.length))}`;
	}

	// Default: end
	return `${text.slice(0, maxLength - ellipsis.length)}${ellipsis}`;
}

/**
 * Capitalize text with proper handling
 */
export function capitalizeText(text: string): string {
	if (!text) return "";
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format multi-line text for display
 */
export function formatDescription(description: string): string {
	if (!description) return "";

	// Clean up whitespace and format paragraphs
	return description
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.join("\n\n");
}

// ============================================================================
// ERROR MESSAGE FORMATTING
// ============================================================================

/**
 * Format blockchain error messages for user display
 */
export function formatErrorMessage(error: unknown): string {
	if (!error) return "An unknown error occurred";

	// Handle common error types
	if (typeof error === "string") {
		// Clean up common blockchain error patterns
		return (
			error
				.replace(/execution reverted:?/i, "")
				.replace(/VM Exception while processing transaction:?/i, "")
				.replace(/revert/i, "")
				.trim() || "Transaction failed"
		);
	}

	if ((error as { message?: string }).message) {
		// Handle rejected transactions
		if ((error as { message: string }).message.includes("User rejected")) {
			return "Transaction was rejected by user";
		}

		// Handle insufficient funds
		if (
			(error as { message: string }).message
				.toLowerCase()
				.includes("insufficient")
		) {
			return "Insufficient balance for this transaction";
		}

		return formatErrorMessage((error as { message: string }).message);
	}

	if ((error as { reason?: string }).reason) {
		return formatErrorMessage((error as { reason: string }).reason);
	}

	return "Transaction failed. Please try again.";
}

// ============================================================================
// NFT & GACHA SPECIFIC FORMATTING
// ============================================================================

/**
 * Format NFT token IDs with proper padding and display
 */
export function formatTokenId(tokenId: bigint | string | number): string {
	const id = tokenId.toString();
	// Add padding for better visual consistency
	return id.length > 6 ? formatTokenIdLarge(id) : `#${id}`;
}

function formatTokenIdLarge(tokenId: string): string {
	// For very large token IDs, use truncation
	if (tokenId.length > 12) {
		return `#${tokenId.slice(0, 6)}...${tokenId.slice(-4)}`;
	}
	return `#${tokenId}`;
}

/**
 * Format collection names with proper capitalization
 */
export function formatCollectionName(name: string): string {
	if (!name) return "Unknown Collection";

	// Handle common naming patterns
	return name
		.split(/[-_\s]+/)
		.map((word) => capitalizeText(word))
		.join(" ");
}

/**
 * Format rarity names consistently
 */
export function formatRarityName(rarity: string): string {
	if (!rarity) return "Common";
	return capitalizeText(rarity.replace(/[-_]/g, " "));
}

/**
 * Validate and format Ethereum addresses
 */
export function isValidAddress(address: string): boolean {
	return (
		typeof address === "string" &&
		address.startsWith("0x") &&
		address.length === 42 &&
		/^0x[a-fA-F0-9]{40}$/.test(address)
	);
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate token amounts
 */
export function isValidTokenAmount(amount: string): boolean {
	if (!amount || amount.trim() === "") return false;
	try {
		const num = parseFloat(amount);
		return !Number.isNaN(num) && num >= 0;
	} catch {
		return false;
	}
}
