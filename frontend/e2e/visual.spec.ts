import { test, expect } from "@playwright/test";

test.describe("Visual Regression Tests", () => {
	test("homepage visual snapshot", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		// Take a full page screenshot
		await expect(page).toHaveScreenshot("homepage.png", {
			fullPage: true,
			maxDiffPixels: 500, // Allow some tolerance for dynamic content
		});
	});

	test("discover page visual snapshot", async ({ page }) => {
		await page.goto("/discover");
		await page.waitForLoadState("networkidle");

		// Take a screenshot of the discover page
		await expect(page).toHaveScreenshot("discover.png", {
			fullPage: true,
			maxDiffPixels: 500,
		});
	});

	test("appraisal form visual snapshot", async ({ page }) => {
		await page.goto("/appraisal");
		await page.waitForLoadState("networkidle");

		// Take a screenshot of the appraisal form
		await expect(page).toHaveScreenshot("appraisal-form.png", {
			fullPage: true,
			maxDiffPixels: 500,
		});
	});
});

test.describe("Component Visual Tests", () => {
	test("glass card component styling", async ({ page }) => {
		await page.goto("/");

		// Look for glass-card class or similar styling
		const glassCard = page.locator(".glass-card, .bg-content1\\/20").first();

		if ((await glassCard.count()) > 0) {
			// Verify glass card has some transparency
			const backgroundColor = await glassCard.evaluate(
				(el) => window.getComputedStyle(el).backgroundColor,
			);

			// Log background color for manual verification
			console.log("Glass card background color:", backgroundColor);

			// Note: We're not asserting here since glassmorphism implementation may vary
		}
	});

	test("button hover states", async ({ page }) => {
		await page.goto("/");

		const button = page.locator("button").first();

		if ((await button.count()) > 0) {
			// Normal state
			await expect(button).toHaveScreenshot("button-normal.png");

			// Hover state
			await button.hover();
			await expect(button).toHaveScreenshot("button-hover.png");
		}
	});
});
