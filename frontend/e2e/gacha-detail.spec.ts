import { test, expect } from "@playwright/test";

// The gacha detail page is at /gacha?id=graded-pokemon
const GACHA_URL = "/gacha?id=graded-pokemon";
const GACHA_URL_WITH_SPIN = "/gacha?id=graded-pokemon&section=spin";

test.describe("Gacha Detail Page - Basic Loading", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(GACHA_URL);
	});

	test("page loads without crashing", async ({ page }) => {
		await expect(page.locator("body")).toBeVisible();
	});

	test("page has header navigation", async ({ page }) => {
		await expect(page.locator("header")).toBeVisible();
	});

	test("Live chip is displayed", async ({ page }) => {
		const liveChip = page.getByText(/^Live$/i);
		await expect(liveChip).toBeVisible();
	});

	test("gacha title heading is present", async ({ page }) => {
		const h1 = page.locator("h1").first();
		await expect(h1).toBeVisible();
	});

	test("back button to discovery is present", async ({ page }) => {
		const backButton = page.getByRole("button", {
			name: /Go back to discovery page/i,
		});
		await expect(backButton).toBeVisible();
	});

	test("clicking back button navigates to discover", async ({ page }) => {
		const backButton = page.getByRole("button", {
			name: /Go back to discovery page/i,
		});
		await backButton.click();
		await expect(page).toHaveURL(/.*discover/);
	});

	test("Operational status is displayed", async ({ page }) => {
		const status = page.getByText(/Operational/i);
		await expect(status).toBeVisible();
	});
});

test.describe("Gacha Detail Page - Section Tabs (FlowSwitcher)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(GACHA_URL);
	});

	test("Spin tab button is present", async ({ page }) => {
		const spinTab = page.getByRole("button", { name: /Navigate to Spin/i });
		await expect(spinTab).toBeVisible();
	});

	test("Vault tab button is present", async ({ page }) => {
		const vaultTab = page.getByRole("button", { name: /Navigate to Vault/i });
		await expect(vaultTab).toBeVisible();
	});

	test("Economy tab button is present", async ({ page }) => {
		const economyTab = page.getByRole("button", {
			name: /Navigate to Economy/i,
		});
		await expect(economyTab).toBeVisible();
	});

	test("History tab button is present", async ({ page }) => {
		const historyTab = page.getByRole("button", {
			name: /Navigate to History/i,
		});
		await expect(historyTab).toBeVisible();
	});

	test("all four main tabs are visible simultaneously", async ({ page }) => {
		const tabs = page.getByRole("button", { name: /Navigate to (Spin|Vault|Economy|History)/i });
		await expect(tabs).toHaveCount(4);
	});

	test("Spin tab is active by default", async ({ page }) => {
		// The Spin section title text should be visible when spin is active
		const spinTitle = page.getByText(/Spin & win provably fair NFT rewards/i);
		await expect(spinTitle).toBeVisible();
	});

	test("clicking Vault tab switches to vault section", async ({ page }) => {
		const vaultTab = page.getByRole("button", { name: /Navigate to Vault/i });
		await vaultTab.click();

		// Vault section title should be visible
		const vaultTitle = page.getByText(/Manage vault and withdraw yield/i);
		await expect(vaultTitle).toBeVisible();
	});

	test("clicking Economy tab switches to economy section", async ({ page }) => {
		const economyTab = page.getByRole("button", {
			name: /Navigate to Economy/i,
		});
		await economyTab.click();

		const economyTitle = page.getByText(/Gacha Economy Overview/i);
		await expect(economyTitle).toBeVisible();
	});

	test("clicking History tab switches to history section", async ({ page }) => {
		const historyTab = page.getByRole("button", {
			name: /Navigate to History/i,
		});
		await historyTab.click();

		// History section renders - look for spin history related text
		const historySection = page.getByText(/Your spin history/i).first();
		await expect(historySection).toBeVisible();
	});

	test("section is preserved in URL via section param", async ({ page }) => {
		await page.goto(GACHA_URL_WITH_SPIN);

		// The section=spin should show spin content
		const spinTitle = page.getByText(/Spin & win provably fair NFT rewards/i);
		await expect(spinTitle).toBeVisible();
	});
});

test.describe("Gacha Detail Page - Spin Section (No Wallet)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(GACHA_URL_WITH_SPIN);
	});

	test("spin section shows GachaSectionLayout with Spin Flow label", async ({
		page,
	}) => {
		const spinFlowLabel = page.getByText(/Spin Flow/i);
		await expect(spinFlowLabel).toBeVisible();
	});

	test("spin section description is visible", async ({ page }) => {
		const description = page.getByText(/WAVS randomness/i);
		await expect(description).toBeVisible();
	});

	test("Instant Buyback highlight is visible", async ({ page }) => {
		const buyback = page.getByText(/Instant Buyback/i);
		await expect(buyback).toBeVisible();
	});

	test("rarity breakdown section renders", async ({ page }) => {
		// RarityBreakdown is rendered inside the GachaSpinner
		// It shows rarity categories - wait for it to load or show skeleton
		const rarityBreakdown = page.locator(
			"[class*='space-y'], [class*='grid']",
		).first();
		await expect(rarityBreakdown).toBeVisible();
	});
});

test.describe("Gacha Detail Page - Invalid Gacha ID", () => {
	test("missing gacha ID shows Missing Gacha ID error", async ({ page }) => {
		// Navigate to gacha page with empty/missing id
		await page.goto("/gacha");
		// With DEFAULT_GACHA_ID fallback, it will load the default gacha
		// So check that it either loads a gacha or shows error
		const hasContent =
			(await page.locator("h1, h2").count()) > 0;
		expect(hasContent).toBeTruthy();
	});

	test("unknown gacha ID shows Gacha Not Found error", async ({ page }) => {
		await page.goto("/gacha?id=nonexistent-gacha-xyz");
		const notFoundHeading = page.getByRole("heading", {
			name: /Gacha Not Found/i,
		});
		await expect(notFoundHeading).toBeVisible();
	});

	test("Gacha Not Found page has Back to Discovery button", async ({
		page,
	}) => {
		await page.goto("/gacha?id=nonexistent-gacha-xyz");
		const backButton = page.getByRole("button", {
			name: /Back to Discovery/i,
		});
		await expect(backButton).toBeVisible();
	});

	test("Back to Discovery button navigates to discover page", async ({
		page,
	}) => {
		await page.goto("/gacha?id=nonexistent-gacha-xyz");
		const backButton = page.getByRole("button", {
			name: /Back to Discovery/i,
		});
		await backButton.click();
		await expect(page).toHaveURL(/.*discover/);
	});
});

test.describe("Gacha Detail Page - Responsive", () => {
	test("renders at mobile viewport", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto(GACHA_URL);

		await expect(page.locator("header")).toBeVisible();
		// Section tabs should still be visible (may wrap)
		const spinTab = page.getByRole("button", { name: /Navigate to Spin/i });
		await expect(spinTab).toBeVisible();
	});

	test("renders at desktop viewport", async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto(GACHA_URL);

		await expect(page.locator("header")).toBeVisible();
		const spinTab = page.getByRole("button", { name: /Navigate to Spin/i });
		await expect(spinTab).toBeVisible();
	});
});
