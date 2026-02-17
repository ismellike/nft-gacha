import { describe, it, expect } from "vitest";
import {
	formatAddress,
	formatTxHash,
	formatBlockNumber,
	formatTokenAmount,
	formatCurrency,
	formatPercentage,
	truncateText,
	capitalizeText,
	formatDescription,
	formatCollectionName,
	formatRarityName,
	formatErrorMessage,
	formatTokenId,
	isValidAddress,
	isValidTokenAmount,
} from "../utils";

describe("formatAddress", () => {
	it("returns empty string for empty input", () => {
		expect(formatAddress("")).toBe("");
	});

	it("returns empty string for non-string input", () => {
		expect(formatAddress(null as unknown as string)).toBe("");
		expect(formatAddress(undefined as unknown as string)).toBe("");
		expect(formatAddress(123 as unknown as string)).toBe("");
	});

	it("returns short addresses as-is", () => {
		expect(formatAddress("0x123")).toBe("0x123");
	});

	it("truncates valid 0x addresses", () => {
		const addr = "0x1234567890123456789012345678901234567890";
		expect(formatAddress(addr)).toBe("0x1234...7890");
	});

	it("applies custom startChars and endChars", () => {
		const addr = "0x1234567890123456789012345678901234567890";
		expect(formatAddress(addr, { startChars: 8, endChars: 6 })).toBe(
			"0x123456...567890",
		);
	});

	it("applies custom middleText", () => {
		const addr = "0x1234567890123456789012345678901234567890";
		expect(formatAddress(addr, { middleText: "---" })).toBe("0x1234---7890");
	});

	it("preserves case when ensureChecksum is true for 42-char address", () => {
		const addr = "0xAbCdEf1234567890123456789012345678901234";
		const result = formatAddress(addr, { ensureChecksum: true });
		// ensureChecksum keeps original case; startChars=6 gives "0xAbCd"
		expect(result).toBe("0xAbCd...1234");
	});

	it("returns non-0x strings as-is", () => {
		expect(formatAddress("abc123")).toBe("abc123");
	});
});

describe("formatTxHash", () => {
	it("delegates to formatAddress with startChars=10 endChars=8", () => {
		const hash =
			"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
		const result = formatTxHash(hash);
		expect(result.startsWith("0x12345678")).toBe(true);
		expect(result).toContain("...");
	});
});

describe("formatBlockNumber", () => {
	it("formats bigint with locale separators", () => {
		expect(formatBlockNumber(1000000n)).toBe("1,000,000");
	});

	it("formats number with locale separators", () => {
		expect(formatBlockNumber(1234567)).toBe("1,234,567");
	});
});

describe("formatTokenAmount", () => {
	it("formats zero bigint", () => {
		expect(formatTokenAmount(0n, 18)).toBe("0");
	});

	it("formats 1 ETH (1e18)", () => {
		expect(formatTokenAmount(1000000000000000000n, 18)).toBe("1");
	});

	it("formats fractional amount", () => {
		const result = formatTokenAmount(1234567890000000000n, 18);
		expect(result).toBe("1.234567");
	});

	it("handles BigInt from string", () => {
		expect(formatTokenAmount("1000000000000000000", 18)).toBe("1");
	});

	it("respects maxDecimals", () => {
		expect(
			formatTokenAmount(1234567890000000000n, 18, { maxDecimals: 2 }),
		).toBe("1.23");
	});

	it("applies grouping to large numbers", () => {
		expect(formatTokenAmount(1000000000000000000000n, 18)).toBe("1,000");
	});

	it("applies prefix and suffix", () => {
		expect(
			formatTokenAmount(1000000000000000000n, 18, {
				prefix: "$",
				suffix: " USD",
			}),
		).toBe("$1 USD");
	});

	it("returns '0' for falsy non-zero input", () => {
		expect(formatTokenAmount(null as unknown as bigint, 18)).toBe("0");
	});

	it("returns '0' on parse error", () => {
		expect(formatTokenAmount("invalid" as unknown as bigint, 18)).toBe("0");
	});
});

describe("formatCurrency", () => {
	it("formats with symbol", () => {
		// formatCurrency uses maxDecimals=2 but trailing zeros are trimmed by formatTokenAmount
		expect(formatCurrency(1500000000000000000n, 18, "ETH")).toBe("1.5 ETH");
	});

	it("formats without symbol", () => {
		expect(formatCurrency(1000000000000000000n, 18)).toBe("1");
	});
});

describe("formatPercentage", () => {
	it("converts raw value to percentage", () => {
		expect(formatPercentage(0.5)).toBe("50.00%");
	});

	it("uses value as-is when isAlreadyPercentage", () => {
		expect(formatPercentage(50, 2, true)).toBe("50.00%");
	});

	it("respects custom decimals", () => {
		expect(formatPercentage(0.12345, 4)).toBe("12.3450%");
	});
});

describe("truncateText", () => {
	it("truncates at end by default", () => {
		expect(truncateText("hello world", 8)).toBe("hello...");
	});

	it("truncates in middle", () => {
		expect(truncateText("hello world", 8, { position: "middle" })).toBe(
			"he...rld",
		);
	});

	it("truncates at start", () => {
		expect(truncateText("hello world", 8, { position: "start" })).toBe(
			"...world",
		);
	});

	it("returns full text when shorter than maxLength", () => {
		expect(truncateText("hello", 10)).toBe("hello");
	});

	it("uses custom ellipsis", () => {
		expect(truncateText("hello world", 8, { ellipsis: "---" })).toBe(
			"hello---",
		);
	});

	it("returns falsy input as-is", () => {
		expect(truncateText("", 10)).toBe("");
	});
});

describe("capitalizeText", () => {
	it("capitalizes first letter and lowercases rest", () => {
		expect(capitalizeText("hello WORLD")).toBe("Hello world");
	});

	it("returns empty string for empty input", () => {
		expect(capitalizeText("")).toBe("");
	});
});

describe("formatDescription", () => {
	it("formats multi-line text with double newlines", () => {
		expect(formatDescription("Line 1\nLine 2\nLine 3")).toBe(
			"Line 1\n\nLine 2\n\nLine 3",
		);
	});

	it("returns empty string for empty input", () => {
		expect(formatDescription("")).toBe("");
	});

	it("trims whitespace and filters empty lines", () => {
		expect(formatDescription("  Line 1  \n\n  Line 2  \n  ")).toBe(
			"Line 1\n\nLine 2",
		);
	});
});

describe("formatCollectionName", () => {
	it("capitalizes and formats collection name", () => {
		expect(formatCollectionName("my-cool_nft Collection")).toBe(
			"My Cool Nft Collection",
		);
	});

	it("returns default for empty input", () => {
		expect(formatCollectionName("")).toBe("Unknown Collection");
	});
});

describe("formatRarityName", () => {
	it("capitalizes and replaces separators", () => {
		expect(formatRarityName("ultra-rare")).toBe("Ultra rare");
	});

	it("returns default for empty input", () => {
		expect(formatRarityName("")).toBe("Common");
	});
});

describe("formatErrorMessage", () => {
	it("handles string errors", () => {
		expect(formatErrorMessage("Something went wrong")).toBe(
			"Something went wrong",
		);
	});

	it("strips blockchain error patterns from strings", () => {
		expect(formatErrorMessage("execution reverted: Out of gas")).toBe(
			"Out of gas",
		);
	});

	it("handles Error objects", () => {
		expect(formatErrorMessage(new Error("Test error"))).toBe("Test error");
	});

	it("detects user rejection", () => {
		expect(formatErrorMessage({ message: "User rejected the tx" })).toBe(
			"Transaction was rejected by user",
		);
	});

	it("detects insufficient funds", () => {
		expect(formatErrorMessage({ message: "insufficient funds for gas" })).toBe(
			"Insufficient balance for this transaction",
		);
	});

	it("handles nested reason", () => {
		// reason is recursively passed to formatErrorMessage which strips "revert"
		expect(formatErrorMessage({ reason: "Out of gas" })).toBe("Out of gas");
	});

	it("returns default for falsy input", () => {
		expect(formatErrorMessage(null)).toBe("An unknown error occurred");
		expect(formatErrorMessage(undefined)).toBe("An unknown error occurred");
	});

	it("returns fallback for object without message or reason", () => {
		expect(formatErrorMessage({})).toBe(
			"Transaction failed. Please try again.",
		);
	});
});

describe("formatTokenId", () => {
	it("formats small token IDs with #", () => {
		expect(formatTokenId(123)).toBe("#123");
	});

	it("formats medium token IDs (<=6 chars)", () => {
		expect(formatTokenId(123456)).toBe("#123456");
	});

	it("formats large token IDs (7-12 chars) with #", () => {
		expect(formatTokenId("1234567")).toBe("#1234567");
	});

	it("truncates very large token IDs (>12 chars)", () => {
		expect(formatTokenId("1234567890123")).toBe("#123456...0123");
	});
});

describe("isValidAddress", () => {
	it("validates correct address", () => {
		expect(isValidAddress("0x1234567890123456789012345678901234567890")).toBe(
			true,
		);
	});

	it("rejects short address", () => {
		expect(isValidAddress("0x123")).toBe(false);
	});

	it("rejects without 0x prefix", () => {
		expect(isValidAddress("1234567890123456789012345678901234567890")).toBe(
			false,
		);
	});

	it("rejects non-hex characters", () => {
		expect(isValidAddress("0x123456789012345678901234567890123456789g")).toBe(
			false,
		);
	});

	it("rejects non-string input", () => {
		expect(isValidAddress(123 as unknown as string)).toBe(false);
	});
});

describe("isValidTokenAmount", () => {
	it("validates positive number string", () => {
		expect(isValidTokenAmount("10")).toBe(true);
	});

	it("validates zero", () => {
		expect(isValidTokenAmount("0")).toBe(true);
	});

	it("rejects negative numbers", () => {
		expect(isValidTokenAmount("-1")).toBe(false);
	});

	it("rejects NaN strings", () => {
		expect(isValidTokenAmount("abc")).toBe(false);
	});

	it("rejects empty string", () => {
		expect(isValidTokenAmount("")).toBe(false);
	});
});
