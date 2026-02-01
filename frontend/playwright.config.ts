// @ts-nocheck - Playwright types don't align perfectly with strict TypeScript settings
import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E Testing Configuration for SPINFI
 *
 * This configuration sets up end-to-end testing for the NFT Gacha platform,
 * including wallet mocking, local Anvil chain integration, and visual regression tests.
 */
export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",

	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},
		{
			name: "Mobile Chrome",
			use: { ...devices["Pixel 5"] },
		},
	],

	// Local development server configuration
	// Note: Start your dev server manually before running tests:
	// 1. In one terminal: cd ../.. && task backend:start
	// 2. In another terminal: pnpm exec playwright test
	webServer: {
		command: "cd ../.. && task backend:start",
		port: 3000,
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
