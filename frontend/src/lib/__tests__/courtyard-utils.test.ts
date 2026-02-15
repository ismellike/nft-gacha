import { describe, it, expect } from "vitest";
import {
	parseCourtyardMetadata,
	formatCardTitle,
	formatGradeDisplay,
	getGradeColorScheme,
	isCourtyardTokenURI,
	processCourtyardImageUrl,
} from "../courtyard-utils";
import type { CourtyardMetadata } from "../courtyard-utils";

describe("isCourtyardTokenURI", () => {
	it("returns true for api.courtyard.io URLs", () => {
		expect(
			isCourtyardTokenURI("https://api.courtyard.io/token/123"),
		).toBe(true);
	});

	it("returns false for other URLs", () => {
		expect(isCourtyardTokenURI("https://example.com/token")).toBe(false);
	});

	it("returns false for empty string", () => {
		expect(isCourtyardTokenURI("")).toBe(false);
	});
});

describe("parseCourtyardMetadata", () => {
	it("extracts grading info from direct fields", () => {
		const metadata: CourtyardMetadata = {
			grading_company: "PSA",
			grade: "9",
			name: "Pikachu PSA 9",
		};
		const result = parseCourtyardMetadata(metadata);
		expect(result.grading.company).toBe("PSA");
		expect(result.grading.grade).toBe("9");
	});

	it("extracts set info from direct fields", () => {
		const metadata: CourtyardMetadata = {
			set: "Base Set",
			year: "1999",
			card_number: "#4",
			name: "Charizard",
		};
		const result = parseCourtyardMetadata(metadata);
		expect(result.setInfo.set).toBe("Base Set");
		expect(result.setInfo.year).toBe("1999");
		expect(result.setInfo.cardNumber).toBe("#4");
	});

	it("falls back to attributes array", () => {
		const metadata: CourtyardMetadata = {
			name: "Test Card",
			attributes: [
				{ trait_type: "Grader", value: "BGS" },
				{ trait_type: "Grade", value: "9.5" },
				{ trait_type: "Set", value: "Fossil" },
				{ trait_type: "Year", value: "2000" },
			],
		};
		const result = parseCourtyardMetadata(metadata);
		expect(result.grading.company).toBe("BGS");
		expect(result.setInfo.set).toBe("Fossil");
	});

	it("extracts card details", () => {
		const metadata: CourtyardMetadata = {
			name: "Test",
			category: "Pokemon TCG",
			variant: "Holo",
		};
		const result = parseCourtyardMetadata(metadata);
		expect(result.cardDetails.category).toBe("Pokemon TCG");
		expect(result.cardDetails.variant).toBe("Holo");
	});

	it("preserves original metadata", () => {
		const metadata: CourtyardMetadata = { name: "Test" };
		const result = parseCourtyardMetadata(metadata);
		expect(result.originalMetadata).toBe(metadata);
	});
});

describe("formatCardTitle", () => {
	it("formats title with card number", () => {
		expect(formatCardTitle("Charizard", "#4")).toBe("Charizard #4");
	});

	it("returns title only without number", () => {
		expect(formatCardTitle("Pikachu")).toBe("Pikachu");
	});

	it("returns empty string for no title", () => {
		expect(formatCardTitle(undefined)).toBe("");
	});

	it("extracts number from card number string", () => {
		expect(formatCardTitle("Enamorus", "180")).toBe("Enamorus #180");
	});
});

describe("formatGradeDisplay", () => {
	it("formats grade with company", () => {
		expect(formatGradeDisplay("9", "PSA")).toBe("PSA 9");
	});

	it("returns grade only without company", () => {
		expect(formatGradeDisplay("9")).toBe("9");
	});

	it("uses fullGrade when available", () => {
		expect(formatGradeDisplay("6", "PSA", "6 EX-MT")).toBe("PSA 6 EX-MT");
	});

	it("avoids duplication when grade contains company", () => {
		expect(formatGradeDisplay("PSA 9", "PSA")).toBe("PSA 9");
	});

	it("returns empty string for no grade", () => {
		expect(formatGradeDisplay(undefined)).toBe("");
	});
});

describe("getGradeColorScheme", () => {
	it("returns yellow for grade 10", () => {
		const scheme = getGradeColorScheme(10);
		expect(scheme.gradient).toContain("yellow");
	});

	it("returns info for grade 9", () => {
		const scheme = getGradeColorScheme(9);
		expect(scheme.gradient).toContain("info");
	});

	it("returns green for grade 8-8.9", () => {
		const scheme = getGradeColorScheme(8);
		expect(scheme.gradient).toContain("green");
	});

	it("returns orange for grade 6-7", () => {
		const scheme = getGradeColorScheme(7);
		expect(scheme.gradient).toContain("orange");
	});

	it("returns red for grade below 6", () => {
		const scheme = getGradeColorScheme(5);
		expect(scheme.gradient).toContain("red");
	});

	it("returns gray for undefined grade", () => {
		const scheme = getGradeColorScheme(undefined);
		expect(scheme.gradient).toContain("gray");
	});

	it("returns secondary for text grade", () => {
		const scheme = getGradeColorScheme("MINT");
		expect(scheme.gradient).toContain("secondary");
	});
});

describe("processCourtyardImageUrl", () => {
	it("returns direct http image URL", () => {
		const metadata: CourtyardMetadata = {
			image: "https://example.com/card.jpg",
			name: "Test",
		};
		expect(processCourtyardImageUrl(metadata)).toBe(
			"https://example.com/card.jpg",
		);
	});

	it("converts IPFS URLs", () => {
		const metadata: CourtyardMetadata = {
			image: "ipfs://QmTest123",
			name: "Test",
		};
		expect(processCourtyardImageUrl(metadata)).toBe(
			"https://ipfs.io/ipfs/QmTest123",
		);
	});

	it("finds image in attributes", () => {
		const metadata: CourtyardMetadata = {
			name: "Test",
			attributes: [
				{ trait_type: "image_url", value: "https://example.com/attr.jpg" },
			],
		};
		expect(processCourtyardImageUrl(metadata)).toBe(
			"https://example.com/attr.jpg",
		);
	});

	it("returns null when no image found", () => {
		const metadata: CourtyardMetadata = { name: "No Image" };
		expect(processCourtyardImageUrl(metadata)).toBeNull();
	});

	it("returns null for null metadata", () => {
		expect(
			processCourtyardImageUrl(null as unknown as CourtyardMetadata),
		).toBeNull();
	});
});
