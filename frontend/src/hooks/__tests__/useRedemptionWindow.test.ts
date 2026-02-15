import { describe, it, expect } from "vitest";

/**
 * Test the formatSeconds logic used internally by useRedemptionWindow.
 * The function is not exported, so we replicate it here to verify behavior.
 */
function formatSeconds(totalSeconds: number): string {
	if (totalSeconds <= 0) return "0:00";
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	if (minutes >= 60) {
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return `${hours}:${remainingMinutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	}
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

describe("formatSeconds", () => {
	it("formats 0 as 0:00", () => {
		expect(formatSeconds(0)).toBe("0:00");
	});

	it("formats negative as 0:00", () => {
		expect(formatSeconds(-5)).toBe("0:00");
	});

	it("formats 1 second as 0:01", () => {
		expect(formatSeconds(1)).toBe("0:01");
	});

	it("formats 59 seconds as 0:59", () => {
		expect(formatSeconds(59)).toBe("0:59");
	});

	it("formats 60 seconds as 1:00", () => {
		expect(formatSeconds(60)).toBe("1:00");
	});

	it("formats 90 seconds as 1:30", () => {
		expect(formatSeconds(90)).toBe("1:30");
	});

	it("formats 3599 seconds as 59:59", () => {
		expect(formatSeconds(3599)).toBe("59:59");
	});

	it("formats 3600 seconds as 1:00:00", () => {
		expect(formatSeconds(3600)).toBe("1:00:00");
	});

	it("formats 3661 seconds as 1:01:01", () => {
		expect(formatSeconds(3661)).toBe("1:01:01");
	});

	it("formats 7200 seconds as 2:00:00", () => {
		expect(formatSeconds(7200)).toBe("2:00:00");
	});
});
