// @ts-nocheck - Playwright types don't align perfectly with strict TypeScript settings
import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E Testing Configuration for SPINFI
 *
 * This configuration sets up end-to-end testing for the NFT Gacha platform.
 *
 * IMPORTANT: Tests require the Next.js dev server to be running.
 * Start your dev server manually before running tests:
 *   pnpm dev   (in a separate terminal, from the frontend/ directory)
 *
 * Then run tests with:
 *   pnpm test:e2e
 *
 * The webServer config below uses `reuseExistingServer: true` so tests will
 * connect to the already-running server rather than starting a new one.
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

	// Expect a running dev server at port 3000.
	// With reuseExistingServer: true (local) we reuse whatever is already
	// running (e.g. started via `pnpm dev`).
	// In CI, set E2E_START_SERVER=true to have Playwright start the server.
	webServer: process.env.E2E_START_SERVER
		? {
				command: "pnpm dev",
				port: 3000,
				reuseExistingServer: false,
				timeout: 120000,
			}
		: {
				command: "pnpm dev",
				port: 3000,
				reuseExistingServer: true,
				timeout: 120000,
			},
});
