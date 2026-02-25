# E2E Testing with Playwright

This directory contains end-to-end tests for the SPINFI application using Playwright.

## Setup

Install Playwright browsers (one-time setup):

```bash
pnpm exec playwright install
```

## Running Tests

Tests require the Next.js dev server to be running first:

```bash
# Terminal 1 - start the dev server (see CLAUDE.md: do not run in Claude agent sessions)
pnpm dev

# Terminal 2 - run E2E tests
pnpm test:e2e
```

### Additional test commands

```bash
# Run tests in headed mode (see the browser)
pnpm test:e2e:headed

# Run in debug / step-through mode
pnpm test:e2e:debug

# Run a specific file
pnpm exec playwright test landing.spec.ts

# Run with verbose output
pnpm exec playwright test --reporter=list

# View HTML report after a run
pnpm test:e2e:report
```

## Test Files

| File | Purpose |
|------|---------|
| `landing.spec.ts` | Landing page hero, sections, CTAs, responsive layout, navigation |
| `discover.spec.ts` | Discover page collections grid, gacha cards, navigation |
| `gacha-detail.spec.ts` | Gacha detail page sections (Spin/Vault/Economy/History), tab switching, error states |
| `appraisal.spec.ts` | Appraisal page workflow guide, connect-wallet prompt, info banners |
| `navigation.spec.ts` | Global header (desktop + mobile menu), footer, cross-page navigation |
| `accessibility.spec.ts` | Landmark regions, heading hierarchy, skip links, ARIA attributes, keyboard nav |
| `basic.spec.ts` | Basic smoke tests for page load and title |
| `forms.spec.ts` | Appraisal form validation |
| `gacha-page.spec.ts` | Additional gacha page smoke tests |
| `visual.spec.ts` | Visual regression screenshots |

## Test Philosophy

- All tests run **without a connected wallet** — they test the "not connected" UI state
- Wallet-dependent UI elements (e.g. spin buttons, vault balance) are not exercised
- Tests use semantic selectors (`getByRole`, `getByText`, `getByTestId`) for resilience
- Mobile viewport tests verify responsive layout does not overflow

## Writing New Tests

```typescript
import { test, expect } from "@playwright/test";

test.describe("My Feature", () => {
  test("does something", async ({ page }) => {
    await page.goto("/my-page");
    await expect(page.getByRole("heading", { name: /My Page/i })).toBeVisible();
  });
});
```

## CI/CD Integration

To run tests in CI with automatic server start, set `E2E_START_SERVER=true`:

```bash
E2E_START_SERVER=true pnpm exec playwright test --reporter=github
```
