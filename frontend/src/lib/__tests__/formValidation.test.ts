import { describe, it, expect } from "vitest";
import { validationRules } from "../formValidation";

describe("validationRules.required", () => {
	const rule = validationRules.required();

	it("passes for non-empty string", () => {
		expect(rule.validate("hello")).toBe(true);
	});

	it("fails for empty string", () => {
		expect(rule.validate("")).toBe(false);
	});

	it("fails for whitespace-only string", () => {
		expect(rule.validate("   ")).toBe(false);
	});

	it("uses custom message", () => {
		const custom = validationRules.required("Name is required");
		expect(custom.message).toBe("Name is required");
	});
});

describe("validationRules.ethAddress", () => {
	const rule = validationRules.ethAddress();

	it("passes for valid 0x + 40 hex chars", () => {
		expect(rule.validate("0x1234567890123456789012345678901234567890")).toBe(
			true,
		);
	});

	it("fails without 0x prefix", () => {
		expect(rule.validate("1234567890123456789012345678901234567890")).toBe(
			false,
		);
	});

	it("fails for wrong length", () => {
		expect(rule.validate("0x123")).toBe(false);
	});

	it("fails for non-hex characters", () => {
		expect(rule.validate("0x123456789012345678901234567890123456789g")).toBe(
			false,
		);
	});
});

describe("validationRules.tokenId", () => {
	const rule = validationRules.tokenId();

	it("passes for positive integer", () => {
		expect(rule.validate("1")).toBe(true);
	});

	it("passes for zero", () => {
		expect(rule.validate("0")).toBe(true);
	});

	it("fails for negative number", () => {
		expect(rule.validate("-1")).toBe(false);
	});

	it("fails for float", () => {
		expect(rule.validate("1.5")).toBe(false);
	});

	it("fails for non-numeric", () => {
		expect(rule.validate("abc")).toBe(false);
	});
});

describe("validationRules.minLength", () => {
	const rule = validationRules.minLength(3);

	it("passes at boundary", () => {
		expect(rule.validate("abc")).toBe(true);
	});

	it("fails below boundary", () => {
		expect(rule.validate("ab")).toBe(false);
	});

	it("has correct default message", () => {
		expect(rule.message).toBe("Must be at least 3 characters");
	});
});

describe("validationRules.maxLength", () => {
	const rule = validationRules.maxLength(5);

	it("passes at boundary", () => {
		expect(rule.validate("abcde")).toBe(true);
	});

	it("fails above boundary", () => {
		expect(rule.validate("abcdef")).toBe(false);
	});
});

describe("validationRules.min", () => {
	const rule = validationRules.min(10);

	it("passes at boundary", () => {
		expect(rule.validate("10")).toBe(true);
	});

	it("fails below boundary", () => {
		expect(rule.validate("9")).toBe(false);
	});

	it("fails for NaN", () => {
		expect(rule.validate("abc")).toBe(false);
	});
});

describe("validationRules.max", () => {
	const rule = validationRules.max(100);

	it("passes at boundary", () => {
		expect(rule.validate("100")).toBe(true);
	});

	it("fails above boundary", () => {
		expect(rule.validate("101")).toBe(false);
	});

	it("fails for NaN", () => {
		expect(rule.validate("abc")).toBe(false);
	});
});

describe("validationRules.pattern", () => {
	const rule = validationRules.pattern(/^\d+$/);

	it("passes for matching pattern", () => {
		expect(rule.validate("123")).toBe(true);
	});

	it("fails for non-matching pattern", () => {
		expect(rule.validate("abc")).toBe(false);
	});

	it("has correct default message", () => {
		expect(rule.message).toBe("Invalid format");
	});
});
