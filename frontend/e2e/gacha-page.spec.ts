import { test, expect } from "@playwright/test";

test.describe("Gacha Page", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("home page loads with main heading", async ({ page }) => {
		await expect(page.locator("h1")).toBeVisible();
	});

	test("header navigation is visible", async ({ page }) => {
		await expect(page.locator("header")).toBeVisible();
	});

	test("page has proper meta title", async ({ page }) => {
		await expect(page).toHaveTitle(/SPINFI/i);
	});

	test("wallet connect button is visible for disconnected users", async ({
		page,
	}) => {
		const walletButton = page.locator("button").filter({ hasText: /connect/i });
		await expect(walletButton).toBeVisible();
	});

	test("responsive layout at mobile viewport", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/");
		await expect(page.locator("header")).toBeVisible();
		const scrollWidth = await page.evaluate(
			() => document.documentElement.scrollWidth,
		);
		const clientWidth = await page.evaluate(
			() => document.documentElement.clientWidth,
		);
		expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
	});

	test("responsive layout at desktop viewport", async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/");
		await expect(page.locator("header")).toBeVisible();
	});
});

test.describe("Gacha Page Navigation", () => {
	test("navigation links exist", async ({ page }) => {
		await page.goto("/");
		const navLinks = page.locator("nav a, header a");
		const count = await navLinks.count();
		expect(count).toBeGreaterThan(0);
	});

	test("discover page is accessible", async ({ page }) => {
		await page.goto("/discover");
		await expect(page.locator("body")).toBeVisible();
	});

	test("appraisal page is accessible", async ({ page }) => {
		await page.goto("/appraisal");
		await expect(page.locator("body")).toBeVisible();
	});
});
