import { describe, it, expect } from "vitest";
import {
	rarityIndexToName,
	rarityBigIntToName,
	isValidRarityName,
	rarityNameToIndex,
} from "../rarity-utils";
import { DEFAULT_RARITY_NAMES } from "../rarityConfig";

describe("DEFAULT_RARITY_NAMES", () => {
	it("contains 5 rarity names in order", () => {
		expect(DEFAULT_RARITY_NAMES).toEqual([
			"Common",
			"Uncommon",
			"Rare",
			"Epic",
			"Legendary",
		]);
	});
});

describe("rarityIndexToName", () => {
	it("maps 0 to Common", () => {
		expect(rarityIndexToName(0)).toBe("Common");
	});

	it("maps 1 to Uncommon", () => {
		expect(rarityIndexToName(1)).toBe("Uncommon");
	});

	it("maps 2 to Rare", () => {
		expect(rarityIndexToName(2)).toBe("Rare");
	});

	it("maps 3 to Epic", () => {
		expect(rarityIndexToName(3)).toBe("Epic");
	});

	it("maps 4 to Legendary", () => {
		expect(rarityIndexToName(4)).toBe("Legendary");
	});

	it("returns Unknown for out of range", () => {
		expect(rarityIndexToName(5)).toBe("Unknown");
		expect(rarityIndexToName(-1)).toBe("Unknown");
	});

	it("uses custom names array", () => {
		const customNames = ["Low", "Mid", "High"];
		expect(rarityIndexToName(0, customNames)).toBe("Low");
		expect(rarityIndexToName(2, customNames)).toBe("High");
		expect(rarityIndexToName(3, customNames)).toBe("Unknown");
	});
});

describe("rarityBigIntToName", () => {
	it("maps 0n to Common", () => {
		expect(rarityBigIntToName(0n)).toBe("Common");
	});

	it("maps 4n to Legendary", () => {
		expect(rarityBigIntToName(4n)).toBe("Legendary");
	});

	it("returns Unknown for undefined", () => {
		expect(rarityBigIntToName(undefined)).toBe("Unknown");
	});

	it("handles number input", () => {
		expect(rarityBigIntToName(2)).toBe("Rare");
	});
});

describe("isValidRarityName", () => {
	it("returns true for each valid name", () => {
		for (const name of DEFAULT_RARITY_NAMES) {
			expect(isValidRarityName(name)).toBe(true);
		}
	});

	it("returns false for Unknown", () => {
		expect(isValidRarityName("Unknown")).toBe(false);
	});

	it("returns false for arbitrary strings", () => {
		expect(isValidRarityName("foo")).toBe(false);
	});
});

describe("rarityNameToIndex", () => {
	it("maps Common to 0", () => {
		expect(rarityNameToIndex("Common")).toBe(0);
	});

	it("maps Legendary to 4", () => {
		expect(rarityNameToIndex("Legendary")).toBe(4);
	});

	it("returns -1 for invalid name", () => {
		expect(rarityNameToIndex("foo")).toBe(-1);
	});
});
