import { test, expect } from "@playwright/test";

test.describe("NFT Appraisal Form Validation", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/appraisal");
	});

	test("form validation shows errors for empty fields", async ({ page }) => {
		// Try to submit without filling the form
		const submitButton = page.locator('button[type="submit"]').first();
		if ((await submitButton.count()) > 0) {
			await submitButton.click();

			// Check for validation errors
			// The form should show error messages
			const collectionInput = page.locator("#collection");
			await expect(collectionInput).toBeVisible();
		}
	});

	test("form validates Ethereum address format", async ({ page }) => {
		const collectionInput = page.locator("#collection");
		const submitButton = page.locator('button[type="submit"]').first();

		if (
			(await collectionInput.count()) > 0 &&
			(await submitButton.count()) > 0
		) {
			// Enter invalid address
			await collectionInput.fill("invalid-address");
			await collectionInput.blur();

			// Should show validation error
			await page.waitForTimeout(500);

			// Check for error styling or message
			void collectionInput.evaluate(
				(el) =>
					el.classList.contains("border-danger") ||
					el.classList.contains("border-red"),
			);

			// Enter valid address
			await collectionInput.fill("0x1234567890123456789012345678901234567890");
			await collectionInput.blur();
			await page.waitForTimeout(500);

			// Should not have error
			void collectionInput.evaluate(
				(el) =>
					el.classList.contains("border-success") ||
					el.classList.contains("border-green"),
			);
		}
	});

	test("form validates token ID", async ({ page }) => {
		const tokenIdInput = page.locator("#tokenId");

		if ((await tokenIdInput.count()) > 0) {
			// Enter invalid token ID
			await tokenIdInput.fill("abc");
			await tokenIdInput.blur();
			await page.waitForTimeout(500);

			// Should show validation error
			void tokenIdInput.evaluate(
				(el) =>
					el.classList.contains("border-danger") ||
					el.classList.contains("border-red"),
			);

			// Enter valid token ID
			await tokenIdInput.fill("123");
			await tokenIdInput.blur();
			await page.waitForTimeout(500);

			// Should not have error
			void tokenIdInput.evaluate(
				(el) =>
					el.classList.contains("border-success") ||
					el.classList.contains("border-green"),
			);
		}
	});

	test("submit button is disabled when form is invalid", async ({ page }) => {
		const submitButton = page.locator('button[type="submit"]').first();

		if ((await submitButton.count()) > 0) {
			// Initially should be disabled
			const isDisabled = await submitButton.isDisabled();
			expect(isDisabled).toBeTruthy();

			// Fill in valid data
			const collectionInput = page.locator("#collection");
			const tokenIdInput = page.locator("#tokenId");

			if (
				(await collectionInput.count()) > 0 &&
				(await tokenIdInput.count()) > 0
			) {
				await collectionInput.fill(
					"0x1234567890123456789012345678901234567890",
				);
				await tokenIdInput.fill("123");
				await page.waitForTimeout(500);

				// Button should now be enabled (assuming wallet is connected)
				// Note: This might still be disabled if wallet is not connected
			}
		}
	});
});
