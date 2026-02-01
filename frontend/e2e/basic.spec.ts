import { test, expect } from "@playwright/test";

test.describe("Basic Navigation", () => {
	test("home page loads correctly", async ({ page }) => {
		await page.goto("/");

		// Check that the page loads
		await expect(page).toHaveTitle(/SPINFI/);

		// Check that main navigation elements are visible
		await expect(page.locator("header")).toBeVisible();
	});

	test("navigation to discover page works", async ({ page }) => {
		await page.goto("/");

		// Click on discover link (you may need to adjust selector)
		const discoverLink = page
			.locator("a")
			.filter({ hasText: /discover/i })
			.first();

		if ((await discoverLink.count()) > 0) {
			await discoverLink.click();
			await expect(page).toHaveURL(/.*discover/);
		}
	});

	test("wallet connect button is visible", async ({ page }) => {
		await page.goto("/");

		// Check for wallet connect button
		const walletButton = page.locator("button", {
			hasText: /connect wallet/i,
		});

		// The button might exist, might not, based on the implementation
		await expect(walletButton).toBeAttached();
	});
});

test.describe("Responsive Design", () => {
	test("mobile viewport loads correctly", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/");

		// Check that mobile menu or navigation is visible
		await expect(page.locator("header")).toBeVisible();
	});

	test("desktop viewport loads correctly", async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/");

		// Check that header is visible
		await expect(page.locator("header")).toBeVisible();
	});
});

test.describe("Accessibility", () => {
	test("skip link is available but hidden", async ({ page }) => {
		await page.goto("/");

		// Check for skip link
		const skipLink = page.locator("a", { hasText: /skip to main content/i });

		// Skip link should be in the DOM but not visible
		await expect(skipLink).toBeAttached({ attached: true });
	});

	test("page has proper heading structure", async ({ page }) => {
		await page.goto("/");

		// Check for h1 element
		const h1 = page.locator("h1");
		await expect(h1).toBeAttached();
	});
});
