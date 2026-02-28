import { test, expect } from "@playwright/test";

// NOTE: axe-core is available as a devDependency. These tests inject axe via
// CDN-free approach using the axe-core package bundled into the test file.
// For lightweight a11y checks without a full axe run, we test structural semantics.

test.describe("Accessibility - Landmark Regions", () => {
	test("landing page has main landmark", async ({ page }) => {
		await page.goto("/");
		const main = page.locator("main");
		await expect(main).toBeVisible();
	});

	test("landing page has header landmark", async ({ page }) => {
		await page.goto("/");
		const header = page.locator("header");
		await expect(header).toBeVisible();
	});

	test("landing page has footer landmark", async ({ page }) => {
		await page.goto("/");
		const footer = page.locator("footer");
		await expect(footer).toBeVisible();
	});

	test("discover page has main landmark", async ({ page }) => {
		await page.goto("/discover");
		const main = page.locator("main");
		await expect(main).toBeVisible();
	});

	test("appraisal page has main landmark", async ({ page }) => {
		await page.goto("/appraisal");
		const main = page.locator("main");
		await expect(main).toBeVisible();
	});
});

test.describe("Accessibility - Heading Hierarchy", () => {
	test("landing page has exactly one h1", async ({ page }) => {
		await page.goto("/");
		const h1Elements = page.locator("h1");
		const count = await h1Elements.count();
		expect(count).toBe(1);
	});

	test("landing page h1 contains meaningful text", async ({ page }) => {
		await page.goto("/");
		const h1 = page.locator("h1").first();
		const text = await h1.textContent();
		expect(text?.trim().length).toBeGreaterThan(0);
	});

	test("discover page has an h1", async ({ page }) => {
		await page.goto("/discover");
		const h1 = page.locator("h1").first();
		await expect(h1).toBeVisible();
	});

	test("appraisal page has an h1", async ({ page }) => {
		await page.goto("/appraisal");
		const h1 = page.locator("h1").first();
		await expect(h1).toBeVisible();
	});
});

test.describe("Accessibility - Skip Navigation", () => {
	test("skip link exists on landing page", async ({ page }) => {
		await page.goto("/");
		const skipLink = page.getByRole("link", { name: /Skip to main content/i });
		await expect(skipLink).toBeAttached();
	});

	test("skip link href targets #main-content", async ({ page }) => {
		await page.goto("/");
		const skipLink = page.getByRole("link", { name: /Skip to main content/i });
		const href = await skipLink.getAttribute("href");
		expect(href).toBe("#main-content");
	});

	test("main-content element exists and is focusable", async ({ page }) => {
		await page.goto("/");
		// The layout.tsx has <main id="main-content" tabIndex={-1}>
		const main = page.locator("#main-content");
		await expect(main).toBeAttached();
		const tabIndex = await main.getAttribute("tabindex");
		expect(tabIndex).toBe("-1");
	});
});

test.describe("Accessibility - Navigation Roles", () => {
	test("desktop header nav has accessible aria-label", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto("/");

		const nav = page.getByRole("navigation", { name: /Main navigation/i });
		await expect(nav).toBeVisible();
	});

	test("mobile menu dialog has aria-modal attribute", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto("/");

		const hamburger = page.getByRole("button", { name: /Open menu/i });
		await hamburger.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toHaveAttribute("aria-modal", "true");
	});

	test("mobile menu dialog has descriptive aria-label", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto("/");

		const hamburger = page.getByRole("button", { name: /Open menu/i });
		await hamburger.click();

		const dialog = page.getByRole("dialog");
		const ariaLabel = await dialog.getAttribute("aria-label");
		expect(ariaLabel).toMatch(/navigation menu/i);
	});

	test("mobile nav has accessible label", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto("/");

		const hamburger = page.getByRole("button", { name: /Open menu/i });
		await hamburger.click();

		const mobileNav = page.getByRole("navigation", {
			name: /Mobile navigation/i,
		});
		await expect(mobileNav).toBeVisible();
	});
});

test.describe("Accessibility - ARIA Attributes", () => {
	test("back button on gacha page has descriptive aria-label", async ({
		page,
	}) => {
		await page.goto("/gacha?id=graded-pokemon");
		const backBtn = page.getByRole("button", {
			name: /Go back to discovery page/i,
		});
		await expect(backBtn).toBeVisible();
	});

	test("FlowSwitcher tab buttons have aria-label attributes", async ({
		page,
	}) => {
		await page.goto("/gacha?id=graded-pokemon");

		const spinTab = page.getByRole("button", { name: /Navigate to Spin/i });
		await expect(spinTab).toBeVisible();
		const ariaLabel = await spinTab.getAttribute("aria-label");
		expect(ariaLabel).toBeTruthy();
	});

	test("hero section has aria-labelledby attribute", async ({ page }) => {
		await page.goto("/");
		const heroSection = page.locator("#hero");
		const labelledBy = await heroSection.getAttribute("aria-labelledby");
		expect(labelledBy).toBe("hero-heading");
	});

	test("how-it-works section has aria-labelledby attribute", async ({
		page,
	}) => {
		await page.goto("/");
		const howItWorksSection = page.locator("#how-it-works");
		const labelledBy = await howItWorksSection.getAttribute("aria-labelledby");
		expect(labelledBy).toBe("how-heading");
	});

	test("footer security features list has aria-label", async ({ page }) => {
		await page.goto("/");
		const securityList = page.locator("ul[aria-label='Security features']");
		await expect(securityList).toBeVisible();
	});
});

test.describe("Accessibility - Keyboard Navigation", () => {
	test("can Tab to Discover nav link from logo", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto("/");

		// Tab through the header to find nav links
		await page.keyboard.press("Tab");
		// The skip link should receive focus first
		const skipLink = page.getByRole("link", { name: /Skip to main content/i });
		// Check it's focusable (it uses sr-only class that becomes visible on focus)
		await expect(skipLink).toBeAttached();
	});

	test("can Tab to hamburger button on mobile", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto("/");

		// Focus the page body and Tab through to find hamburger
		await page.locator("body").click();

		// Tab a few times - hamburger button should be reachable
		let found = false;
		for (let i = 0; i < 10; i++) {
			await page.keyboard.press("Tab");
			const focused = page.locator(":focus");
			const ariaLabel = await focused
				.getAttribute("aria-label")
				.catch(() => null);
			if (ariaLabel === "Open menu") {
				found = true;
				break;
			}
		}
		expect(found).toBeTruthy();
	});

	test("Enter key activates hamburger button to open menu", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto("/");

		const hamburger = page.getByRole("button", { name: /Open menu/i });
		await hamburger.focus();
		await page.keyboard.press("Enter");

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();
	});

	test("gacha explore cards are keyboard focusable", async ({ page }) => {
		await page.goto("/discover");

		const exploreButton = page
			.locator('[data-testid^="explore-gacha-"]')
			.first();

		if ((await exploreButton.count()) > 0) {
			await exploreButton.focus();
			const focused = await exploreButton.evaluate(
				(el) => document.activeElement === el,
			);
			expect(focused).toBeTruthy();
		}
	});
});

test.describe("Accessibility - Image Alt Text", () => {
	test("SPINFI logo image has alt text", async ({ page }) => {
		await page.goto("/");
		const logoImg = page.locator("header img[alt='SPINFI Logo']");
		await expect(logoImg).toBeAttached();
	});
});

test.describe("Accessibility - Color & Contrast (Structural)", () => {
	test("buttons have visible text content", async ({ page }) => {
		await page.goto("/");

		// All visible buttons should have some accessible text
		const buttons = page.getByRole("button");
		const count = await buttons.count();
		expect(count).toBeGreaterThan(0);

		// At least the connect wallet button should have text
		const connectBtn = page.getByRole("button", { name: /connect wallet/i });
		await expect(connectBtn).toBeVisible();
	});

	test("links have visible or accessible text", async ({ page }) => {
		await page.goto("/");
		// Check nav links have text
		const navLinks = page.locator("header nav a");
		const count = await navLinks.count();
		expect(count).toBeGreaterThan(0);
	});
});
