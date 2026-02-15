import { describe, it, expect } from "vitest";
import {
	validateMetadata,
	getYear,
	getSetName,
	getCardName,
	getGradingInfo,
	hasRequiredRevealFields,
	getSafeMetadataForReveal,
} from "../metadataValidation";

describe("validateMetadata", () => {
	it("succeeds for valid object", () => {
		const result = validateMetadata({ name: "Test" });
		expect(result.success).toBe(true);
		expect(result.data).toEqual({ name: "Test" });
	});

	it("fails for null", () => {
		const result = validateMetadata(null);
		expect(result.success).toBe(false);
		expect(result.errors).toBeDefined();
	});

	it("fails for non-object", () => {
		expect(validateMetadata("string").success).toBe(false);
		expect(validateMetadata(42).success).toBe(false);
	});

	it("fails for array", () => {
		expect(validateMetadata([1, 2, 3]).success).toBe(false);
	});
});

describe("getYear", () => {
	it("returns undefined for null metadata", () => {
		expect(getYear(null)).toBeUndefined();
	});

	it("converts number year to string", () => {
		expect(getYear({ year: 1999 })).toBe("1999");
	});

	it("returns string year as-is", () => {
		expect(getYear({ year: "2005" })).toBe("2005");
	});

	it("returns undefined when year is missing", () => {
		expect(getYear({ name: "test" })).toBeUndefined();
	});
});

describe("getSetName", () => {
	it("returns formatted set name when set_number present", () => {
		expect(getSetName({ set_number: "Base Set" })).toBe("Set: Base Set");
	});

	it("returns undefined without set_number", () => {
		expect(getSetName({ name: "test" })).toBeUndefined();
	});

	it("returns undefined for null metadata", () => {
		expect(getSetName(null)).toBeUndefined();
	});
});

describe("getCardName", () => {
	it("prefers title over name", () => {
		expect(getCardName({ title: "Pikachu", name: "Card" })).toBe("Pikachu");
	});

	it("falls back to name", () => {
		expect(getCardName({ name: "Charizard" })).toBe("Charizard");
	});

	it("returns Unknown Card when neither present", () => {
		expect(getCardName({})).toBe("Unknown Card");
	});

	it("returns Unknown Card for null metadata", () => {
		expect(getCardName(null)).toBe("Unknown Card");
	});
});

describe("getGradingInfo", () => {
	it("returns formatted string for company + grade", () => {
		const info = getGradingInfo({ grading_company: "psa", grade: "9" });
		expect(info).toBeDefined();
		expect(info?.displayString).toBe("PSA 9");
		expect(info?.company).toBe("psa");
		expect(info?.grade).toBe("9");
	});

	it("returns company only", () => {
		const info = getGradingInfo({ grading_company: "bgs" });
		expect(info?.displayString).toBe("BGS");
	});

	it("returns grade only", () => {
		const info = getGradingInfo({ grade: "10" });
		expect(info?.displayString).toBe("10");
	});

	it("returns undefined when neither present", () => {
		expect(getGradingInfo({ name: "test" })).toBeUndefined();
	});

	it("returns undefined for null metadata", () => {
		expect(getGradingInfo(null)).toBeUndefined();
	});

	it("maps beckett to BGS", () => {
		const info = getGradingInfo({ grading_company: "beckett", grade: "9.5" });
		expect(info?.displayString).toBe("BGS 9.5");
	});
});

describe("hasRequiredRevealFields", () => {
	it("detects all fields present", () => {
		const result = hasRequiredRevealFields({
			year: "1999",
			set_number: "Base",
			title: "Pikachu",
			grading_company: "PSA",
		});
		expect(result).toEqual({
			hasYear: true,
			hasSetName: true,
			hasName: true,
			hasGrading: true,
		});
	});

	it("detects all fields missing", () => {
		const result = hasRequiredRevealFields({});
		expect(result).toEqual({
			hasYear: false,
			hasSetName: false,
			hasName: false,
			hasGrading: false,
		});
	});

	it("detects partial fields", () => {
		const result = hasRequiredRevealFields({ name: "Test", grade: "9" });
		expect(result.hasName).toBe(true);
		expect(result.hasGrading).toBe(true);
		expect(result.hasYear).toBe(false);
		expect(result.hasSetName).toBe(false);
	});

	it("handles null metadata", () => {
		const result = hasRequiredRevealFields(null);
		expect(result.hasYear).toBe(false);
		expect(result.hasName).toBe(false);
	});
});

describe("getSafeMetadataForReveal", () => {
	it("returns valid metadata with missing field list", () => {
		const result = getSafeMetadataForReveal({
			title: "Pikachu",
			year: "1999",
			set_number: "Base",
			grading_company: "PSA",
		});
		expect(result.isValid).toBe(true);
		expect(result.metadata).toBeDefined();
		expect(result.missingFields).toEqual([]);
	});

	it("tracks missing optional fields", () => {
		const result = getSafeMetadataForReveal({ title: "Card" });
		expect(result.isValid).toBe(true);
		expect(result.missingFields).toContain("year");
		expect(result.missingFields).toContain("set_number");
		expect(result.missingFields).toContain("grading");
	});

	it("returns invalid for non-object input", () => {
		const result = getSafeMetadataForReveal(null);
		expect(result.isValid).toBe(false);
		expect(result.metadata).toBeNull();
	});
});
