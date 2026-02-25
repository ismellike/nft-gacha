import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("page loads with correct title", async ({ page }) => {
		await expect(page).toHaveTitle(/SPINFI/i);
	});

	test("hero section renders with main heading", async ({ page }) => {
		const h1 = page.locator("h1").first();
		await expect(h1).toBeVisible();
		// The hero heading contains "Fair Spins." text
		await expect(h1).toContainText(/Fair Spins/i);
	});

	test("hero section has value proposition text", async ({ page }) => {
		const valueProposition = page.getByText(/Zero manipulation/i);
		await expect(valueProposition).toBeVisible();
	});

	test("WAVS badge is present", async ({ page }) => {
		const wavsBadge = page.getByText(/Powered by WAVS/i);
		await expect(wavsBadge).toBeVisible();
	});

	test("hero CTA buttons are visible", async ({ page }) => {
		const startPlayingBtn = page.getByRole("link", { name: /Start Playing/i });
		const depositEarnBtn = page.getByRole("link", { name: /Deposit & Earn/i });
		await expect(startPlayingBtn).toBeVisible();
		await expect(depositEarnBtn).toBeVisible();
	});

	test("Start Playing CTA links to gacha spin page", async ({ page }) => {
		// Scroll into view first since it's lower on the page
		const startPlayingBtn = page
			.getByRole("link", { name: /Start Playing/i })
			.first();
		const href = await startPlayingBtn.getAttribute("href");
		expect(href).toContain("/gacha");
		expect(href).toContain("spin");
	});

	test("Deposit & Earn CTA links to appraisal page", async ({ page }) => {
		const depositEarnBtn = page
			.getByRole("link", { name: /Deposit & Earn/i })
			.first();
		const href = await depositEarnBtn.getAttribute("href");
		expect(href).toContain("/appraisal");
	});

	test("user type cards are rendered", async ({ page }) => {
		await expect(page.getByRole("heading", { name: /For Players/i })).toBeVisible();
		await expect(page.getByRole("heading", { name: /For Contributors/i })).toBeVisible();
	});

	test("HowItWorks section is rendered", async ({ page }) => {
		const howItWorksHeading = page.getByRole("heading", { name: /How It Works/i });
		await expect(howItWorksHeading).toBeVisible();
	});

	test("HowItWorks section shows For Players steps", async ({ page }) => {
		await expect(page.getByRole("heading", { name: /For Players/i }).first()).toBeVisible();
		await expect(page.getByRole("heading", { name: /Connect Wallet/i })).toBeVisible();
		await expect(page.getByRole("heading", { name: /Spin & Win/i })).toBeVisible();
	});

	test("HowItWorks section shows For Contributors steps", async ({ page }) => {
		await expect(page.getByRole("heading", { name: /For Contributors/i }).first()).toBeVisible();
		await expect(page.getByRole("heading", { name: /Deposit NFTs/i })).toBeVisible();
	});

	test("footer is rendered", async ({ page }) => {
		const footer = page.locator("footer");
		await expect(footer).toBeVisible();
	});

	test("footer contains Spin-Fi Gacha branding", async ({ page }) => {
		const footerBranding = page.locator("footer").getByText(/Spin-Fi Gacha/i);
		await expect(footerBranding).toBeVisible();
	});

	test("skip to main content link is in DOM", async ({ page }) => {
		const skipLink = page.getByRole("link", { name: /Skip to main content/i });
		await expect(skipLink).toBeAttached();
	});

	test("skip link leads to #main-content", async ({ page }) => {
		const skipLink = page.getByRole("link", { name: /Skip to main content/i });
		const href = await skipLink.getAttribute("href");
		expect(href).toBe("#main-content");
	});

	test("page has proper h1 element", async ({ page }) => {
		const h1 = page.locator("h1");
		await expect(h1.first()).toBeAttached();
	});

	test("security features list renders", async ({ page }) => {
		await expect(page.getByText(/WAVS Secured/i)).toBeVisible();
		await expect(page.getByText(/Cryptographically Verifiable/i)).toBeVisible();
	});
});

test.describe("Landing Page - Responsive Layout", () => {
	test("renders correctly at mobile viewport (375px)", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/");

		// Header and main content should still be visible
		await expect(page.locator("header")).toBeVisible();
		await expect(page.locator("h1").first()).toBeVisible();

		// No horizontal overflow
		const scrollWidth = await page.evaluate(
			() => document.documentElement.scrollWidth,
		);
		const clientWidth = await page.evaluate(
			() => document.documentElement.clientWidth,
		);
		expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
	});

	test("renders correctly at tablet viewport (768px)", async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto("/");

		await expect(page.locator("header")).toBeVisible();
		await expect(page.locator("h1").first()).toBeVisible();
	});

	test("renders correctly at desktop viewport (1440px)", async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto("/");

		await expect(page.locator("header")).toBeVisible();
		await expect(page.locator("h1").first()).toBeVisible();
	});
});

test.describe("Landing Page - Navigation", () => {
	test("clicking Discover nav link navigates to discover page", async ({
		page,
	}) => {
		await page.goto("/");
		const discoverLink = page
			.locator("header")
			.getByRole("link", { name: /Discover/i });
		await discoverLink.click();
		await expect(page).toHaveURL(/.*discover/);
	});

	test("clicking logo navigates to home", async ({ page }) => {
		await page.goto("/discover");
		const logoLink = page.locator("header").getByRole("link", { name: /SPINFI/i });
		await logoLink.click();
		await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);
	});

	test("For Players card links to gacha spin", async ({ page }) => {
		await page.goto("/");
		const playersCard = page.getByRole("link").filter({ hasText: /For Players/i }).first();
		const href = await playersCard.getAttribute("href");
		expect(href).toContain("/gacha");
	});

	test("For Contributors card links to appraisal", async ({ page }) => {
		await page.goto("/");
		const contributorsCard = page.getByRole("link").filter({ hasText: /For Contributors/i }).first();
		const href = await contributorsCard.getAttribute("href");
		expect(href).toContain("/appraisal");
	});
});
