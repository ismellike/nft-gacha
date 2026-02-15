import { test, expect } from "@playwright/test";

test.describe("Appraisal Page", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/appraisal");
	});

	test("appraisal page loads with heading", async ({ page }) => {
		const heading = page.locator("h1, h2").first();
		await expect(heading).toBeVisible();
	});

	test("appraisal form is present", async ({ page }) => {
		await expect(page.locator("#collection")).toBeVisible();
		await expect(page.locator("#tokenId")).toBeVisible();
	});

	test("form inputs accept valid Ethereum addresses", async ({ page }) => {
		const collectionInput = page.locator("#collection");
		const validAddress = "0x1234567890123456789012345678901234567890";
		await collectionInput.fill(validAddress);
		await expect(collectionInput).toHaveValue(validAddress);
	});

	test("form inputs accept valid token IDs", async ({ page }) => {
		const tokenIdInput = page.locator("#tokenId");
		await tokenIdInput.fill("42");
		await expect(tokenIdInput).toHaveValue("42");
	});

	test("invalid address shows error feedback", async ({ page }) => {
		const collectionInput = page.locator("#collection");
		await collectionInput.fill("not-an-address");
		await collectionInput.blur();

		// Give time for validation
		await page.waitForTimeout(300);

		// Check for any visual error indicator
		const hasErrorClass = await collectionInput.evaluate((el) => {
			const classes = el.className;
			return (
				classes.includes("danger") ||
				classes.includes("error") ||
				classes.includes("invalid")
			);
		});

		const errorText = page
			.locator("[class*='danger'], [class*='error']")
			.first();
		const hasErrorStyling = hasErrorClass || (await errorText.count()) > 0;
		expect(hasErrorStyling).toBeTruthy();
	});

	test("page is accessible at mobile viewport", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/appraisal");
		await expect(page.locator("#collection")).toBeVisible();
		await expect(page.locator("#tokenId")).toBeVisible();
	});
});
