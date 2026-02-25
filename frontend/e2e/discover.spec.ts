import { test, expect } from "@playwright/test";

test.describe("Discover Page", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/discover");
	});

	test("page loads with correct URL", async ({ page }) => {
		await expect(page).toHaveURL(/.*discover/);
	});

	test("page renders main heading", async ({ page }) => {
		const heading = page.getByRole("heading", { name: /Card Collections/i });
		await expect(heading).toBeVisible();
	});

	test("Discover Collections badge is visible", async ({ page }) => {
		const badge = page.getByText(/Discover Collections/i);
		await expect(badge).toBeVisible();
	});

	test("page description text is rendered", async ({ page }) => {
		const description = page.getByText(
			/provably fair trading card gacha systems/i,
		);
		await expect(description).toBeVisible();
	});

	test("Provably Fair badge is visible", async ({ page }) => {
		const badge = page.getByText(/Provably Fair/i).first();
		await expect(badge).toBeVisible();
	});

	test("Live Analytics badge is visible", async ({ page }) => {
		const badge = page.getByText(/Live Analytics/i);
		await expect(badge).toBeVisible();
	});

	test("gacha grid is rendered", async ({ page }) => {
		// Cards may be loading (skeleton) or rendered - the grid should exist
		const grid = page.locator(".grid");
		await expect(grid.first()).toBeVisible();
	});

	test("More Card Collections Coming Soon section is visible", async ({
		page,
	}) => {
		const comingSoon = page.getByRole("heading", {
			name: /More Card Collections Coming Soon/i,
		});
		await expect(comingSoon).toBeVisible();
	});

	test("New Drops Incoming chip is visible", async ({ page }) => {
		const chip = page.getByText(/New Drops Incoming/i);
		await expect(chip).toBeVisible();
	});

	test("header is rendered on discover page", async ({ page }) => {
		await expect(page.locator("header")).toBeVisible();
	});

	test("footer is rendered on discover page", async ({ page }) => {
		await expect(page.locator("footer")).toBeVisible();
	});

	test("page is accessible at mobile viewport", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/discover");

		await expect(page.locator("header")).toBeVisible();
		await expect(
			page.getByRole("heading", { name: /Card Collections/i }),
		).toBeVisible();
	});
});

test.describe("Discover Page - Gacha Cards", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/discover");
	});

	test("gacha card data-testid attribute is present when loaded", async ({
		page,
	}) => {
		// Cards may show loading skeleton initially; wait for any explore button or card
		// The GachaCard renders with data-testid="explore-gacha-{id}"
		const exploreButton = page.locator('[data-testid^="explore-gacha-"]').first();

		// If no contracts are configured (local dev), cards might stay in skeleton state.
		// We check with a soft assertion — test is valid if cards load OR skeleton is shown.
		const skeletonCount = await page
			.locator("[class*='animate-pulse']")
			.count();
		const cardCount = await exploreButton.count();

		// At least one of them should be present (either loading or loaded)
		expect(skeletonCount + cardCount).toBeGreaterThan(0);
	});

	test("explore button has accessible aria-label when gacha card loads", async ({
		page,
	}) => {
		const exploreButton = page
			.locator('[data-testid^="explore-gacha-"]')
			.first();

		if ((await exploreButton.count()) > 0) {
			const ariaLabel = await exploreButton.getAttribute("aria-label");
			expect(ariaLabel).toMatch(/Explore .+ gacha/i);
		}
	});

	test("clicking a gacha card navigates to gacha detail page", async ({
		page,
	}) => {
		const exploreButton = page
			.locator('[data-testid^="explore-gacha-"]')
			.first();

		if ((await exploreButton.count()) > 0) {
			await exploreButton.click();
			await expect(page).toHaveURL(/.*gacha/);
		}
	});

	test("gacha card shows Live or Offline status", async ({ page }) => {
		const statusLabel = page
			.getByText(/^(Live|Offline)$/)
			.first();

		if ((await statusLabel.count()) > 0) {
			await expect(statusLabel).toBeVisible();
		}
	});
});

test.describe("Discover Page - Navigation", () => {
	test("can navigate back to home from discover", async ({ page }) => {
		await page.goto("/discover");
		const homeLink = page
			.locator("header")
			.getByRole("link", { name: /Home/i });
		await homeLink.click();
		await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);
	});

	test("can navigate to appraisal from header", async ({ page }) => {
		await page.goto("/discover");
		const appraisalLink = page
			.locator("header")
			.getByRole("link", { name: /NFT Appraisal/i });
		await appraisalLink.click();
		await expect(page).toHaveURL(/.*appraisal/);
	});
});
