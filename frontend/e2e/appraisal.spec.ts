import { test, expect } from "@playwright/test";

test.describe("Appraisal Page - Basic Loading", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/appraisal");
	});

	test("page loads without crashing", async ({ page }) => {
		await expect(page.locator("body")).toBeVisible();
	});

	test("page has correct URL", async ({ page }) => {
		await expect(page).toHaveURL(/.*appraisal/);
	});

	test("NFT Appraisal badge is visible", async ({ page }) => {
		const badge = page.getByText(/NFT Appraisal/i).first();
		await expect(badge).toBeVisible();
	});

	test("main heading is visible", async ({ page }) => {
		const heading = page.getByRole("heading", {
			name: /Get Your NFT Valued/i,
		});
		await expect(heading).toBeVisible();
	});

	test("page description is visible", async ({ page }) => {
		const description = page.getByText(
			/Select an NFT from your wallet, pay a small fee/i,
		);
		await expect(description).toBeVisible();
	});
});

test.describe("Appraisal Page - Workflow Guide", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/appraisal");
	});

	test("How Appraisal Works heading is visible", async ({ page }) => {
		const heading = page.getByRole("heading", {
			name: /How Appraisal Works/i,
		});
		await expect(heading).toBeVisible();
	});

	test("workflow guide subtitle is visible", async ({ page }) => {
		const subtitle = page.getByText(/4 simple steps/i);
		await expect(subtitle).toBeVisible();
	});

	test("Step 1: Select an NFT is visible", async ({ page }) => {
		const step1 = page.getByRole("heading", { name: /Select an NFT/i });
		await expect(step1).toBeVisible();
	});

	test("Step 2: Pay Appraisal Fee is visible", async ({ page }) => {
		const step2 = page.getByRole("heading", { name: /Pay Appraisal Fee/i });
		await expect(step2).toBeVisible();
	});

	test("Step 3: Wait ~1 Minute is visible", async ({ page }) => {
		const step3 = page.getByRole("heading", { name: /Wait ~1 Minute/i });
		await expect(step3).toBeVisible();
	});

	test("Step 4: Deposit to Gacha is visible", async ({ page }) => {
		const step4 = page.getByRole("heading", { name: /Deposit to Gacha/i });
		await expect(step4).toBeVisible();
	});

	test("workflow note about returning users is visible", async ({ page }) => {
		const note = page.getByText(/No approval needed for returning users/i);
		await expect(note).toBeVisible();
	});

	test("on-chain results timeframe note is visible", async ({ page }) => {
		const note = page.getByText(/Results posted on-chain within ~1 minute/i);
		await expect(note).toBeVisible();
	});
});

test.describe("Appraisal Page - Connect Wallet Prompt (No Wallet)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/appraisal");
	});

	test("Step 1 heading (Select Your NFT) is shown", async ({ page }) => {
		// The main content card shows stage 1 by default
		const step1Heading = page.getByRole("heading", {
			name: /Step 1: Select Your NFT/i,
		});
		await expect(step1Heading).toBeVisible();
	});

	test("Connect Your Wallet prompt is shown in picker when not connected", async ({
		page,
	}) => {
		// WalletNFTPicker renders "Connect Your Wallet" when isConnected is false
		const connectPrompt = page.getByRole("heading", {
			name: /Connect Your Wallet/i,
		});
		await expect(connectPrompt).toBeVisible();
	});

	test("connect prompt explains viewing NFTs", async ({ page }) => {
		const description = page.getByText(
			/Connect to view your NFTs and start the appraisal process/i,
		);
		await expect(description).toBeVisible();
	});
});

test.describe("Appraisal Page - How Appraisal Works Info Banner", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/appraisal");
	});

	test("info banner with How Appraisal Works is visible", async ({ page }) => {
		// There are two instances - one in WorkflowGuide (heading) and one in info banner (paragraph)
		const infoBanner = page
			.getByText(/How Appraisal Works/i)
			.first();
		await expect(infoBanner).toBeVisible();
	});

	test("info banner explains AVS process", async ({ page }) => {
		const avsDescription = page.getByText(/AVS.*Active Validated Service/i);
		await expect(avsDescription).toBeVisible();
	});
});

test.describe("Appraisal Page - Responsive", () => {
	test("renders correctly at mobile viewport", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto("/appraisal");

		await expect(page.locator("header")).toBeVisible();
		await expect(
			page.getByRole("heading", { name: /Get Your NFT Valued/i }),
		).toBeVisible();
	});

	test("workflow guide renders at mobile viewport", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto("/appraisal");

		await expect(
			page.getByRole("heading", { name: /How Appraisal Works/i }),
		).toBeVisible();
	});

	test("renders correctly at desktop viewport", async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto("/appraisal");

		await expect(
			page.getByRole("heading", { name: /Get Your NFT Valued/i }),
		).toBeVisible();
	});
});

test.describe("Appraisal Page - Navigation", () => {
	test("header is present on appraisal page", async ({ page }) => {
		await page.goto("/appraisal");
		await expect(page.locator("header")).toBeVisible();
	});

	test("can navigate to discover from header", async ({ page }) => {
		await page.goto("/appraisal");
		const discoverLink = page
			.locator("header")
			.getByRole("link", { name: /Discover/i });
		await discoverLink.click();
		await expect(page).toHaveURL(/.*discover/);
	});

	test("can navigate home from header", async ({ page }) => {
		await page.goto("/appraisal");
		const homeLink = page
			.locator("header")
			.getByRole("link", { name: /Home/i });
		await homeLink.click();
		await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);
	});
});
