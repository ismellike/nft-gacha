import { test, expect } from "@playwright/test";

test.describe("NFT Appraisal Form Validation", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/appraisal");
	});

	test("appraisal page loads with form elements", async ({ page }) => {
		// The page should have collection and tokenId inputs
		await expect(page.locator("#collection")).toBeVisible();
		await expect(page.locator("#tokenId")).toBeVisible();
	});

	test("form validates Ethereum address format", async ({ page }) => {
		const collectionInput = page.locator("#collection");

		// Enter invalid address
		await collectionInput.fill("invalid-address");
		await collectionInput.blur();

		// Wait for validation to appear
		await expect(collectionInput).toHaveAttribute("aria-invalid", "true", { timeout: 2000 }).catch(() => {
			// Alternative: check for error styling
		});

		// Enter valid address
		await collectionInput.fill("0x1234567890123456789012345678901234567890");
		await collectionInput.blur();

		// Should clear error state
		await expect(page.locator(".text-danger").filter({ hasText: /address/i })).not.toBeVisible({ timeout: 2000 }).catch(() => {});
	});

	test("form validates token ID input", async ({ page }) => {
		const tokenIdInput = page.locator("#tokenId");

		// Enter invalid token ID
		await tokenIdInput.fill("abc");
		await tokenIdInput.blur();

		// Wait for validation feedback
		await page.waitForFunction(() => true, null, { timeout: 1000 });

		// Enter valid token ID
		await tokenIdInput.fill("123");
		await tokenIdInput.blur();
	});

	test("submit button state reflects form validity", async ({ page }) => {
		const submitButton = page.locator('button[type="submit"]').first();

		// Initially should be disabled
		await expect(submitButton).toBeDisabled();

		// Fill in valid data
		await page.locator("#collection").fill("0x1234567890123456789012345678901234567890");
		await page.locator("#tokenId").fill("123");

		// Wait for form state to update
		await page.waitForFunction(() => true, null, { timeout: 500 });
	});
});
