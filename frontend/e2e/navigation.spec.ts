import { test, expect } from "@playwright/test";

test.describe("Header - Desktop Navigation", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto("/");
	});

	test("header is visible on landing page", async ({ page }) => {
		await expect(page.locator("header")).toBeVisible();
	});

	test("SPINFI logo is displayed in header", async ({ page }) => {
		const logo = page.locator("header").getByText(/SPINFI/i);
		await expect(logo).toBeVisible();
	});

	test("SPINFI logo links to home", async ({ page }) => {
		const logoLink = page
			.locator("header")
			.getByRole("link", { name: /SPINFI/i });
		const href = await logoLink.getAttribute("href");
		expect(href).toBe("/");
	});

	test("Home nav link is present", async ({ page }) => {
		const homeLink = page
			.locator("header")
			.getByRole("link", { name: /Home/i });
		await expect(homeLink).toBeVisible();
	});

	test("Discover nav link is present", async ({ page }) => {
		const discoverLink = page
			.locator("header")
			.getByRole("link", { name: /Discover/i });
		await expect(discoverLink).toBeVisible();
	});

	test("NFT Appraisal nav link is present", async ({ page }) => {
		const appraisalLink = page
			.locator("header")
			.getByRole("link", { name: /NFT Appraisal/i });
		await expect(appraisalLink).toBeVisible();
	});

	test("desktop nav has aria-label Main navigation", async ({ page }) => {
		const nav = page.locator("header nav[aria-label='Main navigation']");
		await expect(nav).toBeVisible();
	});

	test("Home link is marked as current page on /", async ({ page }) => {
		const homeLink = page
			.locator("header")
			.getByRole("link", { name: /Home/i });
		await expect(homeLink).toHaveAttribute("aria-current", "page");
	});

	test("Discover link is NOT marked as current page on /", async ({ page }) => {
		const discoverLink = page
			.locator("header")
			.getByRole("link", { name: /Discover/i });
		// aria-current should be absent or undefined on non-active pages
		const ariaCurrent = await discoverLink.getAttribute("aria-current");
		expect(ariaCurrent).toBeNull();
	});

	test("Discover link is marked as current page on /discover", async ({
		page,
	}) => {
		await page.goto("/discover");
		const discoverLink = page
			.locator("header")
			.getByRole("link", { name: /Discover/i });
		await expect(discoverLink).toHaveAttribute("aria-current", "page");
	});

	test("NFT Appraisal link is marked current on /appraisal", async ({
		page,
	}) => {
		await page.goto("/appraisal");
		const appraisalLink = page
			.locator("header")
			.getByRole("link", { name: /NFT Appraisal/i });
		await expect(appraisalLink).toHaveAttribute("aria-current", "page");
	});

	test("Connect Wallet button is rendered in header", async ({ page }) => {
		// RainbowKit ConnectButton renders in the header
		const connectBtn = page.locator("header").getByRole("button", {
			name: /connect wallet/i,
		});
		await expect(connectBtn).toBeVisible();
	});
});

test.describe("Header - Mobile Menu", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto("/");
	});

	test("hamburger menu button is visible on mobile", async ({ page }) => {
		const hamburger = page.getByRole("button", { name: /Open menu/i });
		await expect(hamburger).toBeVisible();
	});

	test("desktop nav links are hidden on mobile", async ({ page }) => {
		const desktopNav = page.locator(
			"header nav[aria-label='Main navigation']",
		);
		// On mobile the desktop nav has class 'hidden md:flex'
		await expect(desktopNav).toBeHidden();
	});

	test("clicking hamburger opens mobile menu", async ({ page }) => {
		const hamburger = page.getByRole("button", { name: /Open menu/i });
		await hamburger.click();

		const mobileMenu = page.getByRole("dialog", {
			name: /Mobile navigation menu/i,
		});
		await expect(mobileMenu).toBeVisible();
	});

	test("mobile menu shows Menu heading", async ({ page }) => {
		const hamburger = page.getByRole("button", { name: /Open menu/i });
		await hamburger.click();

		const menuHeading = page.getByText(/^Menu$/i);
		await expect(menuHeading).toBeVisible();
	});

	test("mobile menu shows navigation links", async ({ page }) => {
		const hamburger = page.getByRole("button", { name: /Open menu/i });
		await hamburger.click();

		const mobileNav = page.getByRole("navigation", {
			name: /Mobile navigation/i,
		});
		await expect(mobileNav).toBeVisible();

		await expect(
			mobileNav.getByRole("link", { name: /Home/i }),
		).toBeVisible();
		await expect(
			mobileNav.getByRole("link", { name: /Discover/i }),
		).toBeVisible();
		await expect(
			mobileNav.getByRole("link", { name: /NFT Appraisal/i }),
		).toBeVisible();
	});

	test("close button inside mobile menu closes the drawer", async ({
		page,
	}) => {
		const hamburger = page.getByRole("button", { name: /Open menu/i });
		await hamburger.click();

		const closeBtn = page.getByRole("button", { name: /Close menu/i });
		await closeBtn.click();

		const mobileMenu = page.getByRole("dialog", {
			name: /Mobile navigation menu/i,
		});
		await expect(mobileMenu).not.toBeVisible();
	});

	test("pressing Escape closes the mobile menu", async ({ page }) => {
		const hamburger = page.getByRole("button", { name: /Open menu/i });
		await hamburger.click();

		// Menu should be open
		const mobileMenu = page.getByRole("dialog", {
			name: /Mobile navigation menu/i,
		});
		await expect(mobileMenu).toBeVisible();

		await page.keyboard.press("Escape");
		await expect(mobileMenu).not.toBeVisible();
	});

	test("clicking a mobile nav link closes the menu and navigates", async ({
		page,
	}) => {
		const hamburger = page.getByRole("button", { name: /Open menu/i });
		await hamburger.click();

		const discoverLink = page
			.getByRole("navigation", { name: /Mobile navigation/i })
			.getByRole("link", { name: /Discover/i });
		await discoverLink.click();

		// Menu should close and page should navigate
		await expect(page).toHaveURL(/.*discover/);
		const mobileMenu = page.getByRole("dialog", {
			name: /Mobile navigation menu/i,
		});
		await expect(mobileMenu).not.toBeVisible();
	});
});

test.describe("Footer", () => {
	test("footer is rendered on landing page", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("footer")).toBeVisible();
	});

	test("footer is rendered on discover page", async ({ page }) => {
		await page.goto("/discover");
		await expect(page.locator("footer")).toBeVisible();
	});

	test("footer is rendered on appraisal page", async ({ page }) => {
		await page.goto("/appraisal");
		await expect(page.locator("footer")).toBeVisible();
	});

	test("footer has Spin-Fi Gacha heading", async ({ page }) => {
		await page.goto("/");
		const footerHeading = page.locator("footer").getByRole("heading", {
			name: /Spin-Fi Gacha/i,
		});
		await expect(footerHeading).toBeVisible();
	});

	test("footer has Why Choose Spin-Fi section", async ({ page }) => {
		await page.goto("/");
		const whySection = page.locator("footer").getByRole("heading", {
			name: /Why Choose Spin-Fi/i,
		});
		await expect(whySection).toBeVisible();
	});

	test("footer has Provably Fair Randomness feature", async ({ page }) => {
		await page.goto("/");
		const feature = page
			.locator("footer")
			.getByText(/Provably Fair Randomness/i);
		await expect(feature).toBeVisible();
	});

	test("footer has Ready to Spin section", async ({ page }) => {
		await page.goto("/");
		const readyToSpin = page.locator("footer").getByRole("heading", {
			name: /Ready to Spin/i,
		});
		await expect(readyToSpin).toBeVisible();
	});

	test("footer has copyright notice", async ({ page }) => {
		await page.goto("/");
		const copyright = page.locator("footer").getByText(/2024 Spin-Fi/i);
		await expect(copyright).toBeVisible();
	});

	test("footer has Live Network indicator", async ({ page }) => {
		await page.goto("/");
		const liveNetwork = page.locator("footer").getByText(/Live Network/i);
		await expect(liveNetwork).toBeVisible();
	});
});

test.describe("Cross-page Navigation Flow", () => {
	test("can navigate full app flow: home → discover → appraisal → home", async ({
		page,
	}) => {
		// Start at home
		await page.goto("/");
		await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);

		// Go to discover
		await page
			.locator("header")
			.getByRole("link", { name: /Discover/i })
			.click();
		await expect(page).toHaveURL(/.*discover/);

		// Go to appraisal
		await page
			.locator("header")
			.getByRole("link", { name: /NFT Appraisal/i })
			.click();
		await expect(page).toHaveURL(/.*appraisal/);

		// Return home
		await page
			.locator("header")
			.getByRole("link", { name: /Home/i })
			.click();
		await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);
	});
});
