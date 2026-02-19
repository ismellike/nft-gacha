# E2E Testing with Playwright

This directory contains end-to-end tests for the SPINFI application using Playwright.

## Setup

First, install Playwright:

```bash
pnpm install -D @playwright/test
pnpm exec playwright install
```

## Running Tests

Run all tests:
```bash
pnpm exec playwright test
```

Run tests in headed mode (see browser):
```bash
pnpm exec playwright test --headed
```

Run tests in debug mode:
```bash
pnpm exec playwright test --debug
```

Run specific test file:
```bash
pnpm exec playwright test basic.spec.ts
```

View test report:
```bash
pnpm exec playwright show-report
```

## Test Structure

- `basic.spec.ts` - Basic navigation and accessibility tests
- `forms.spec.ts` - Form validation tests
- `visual.spec.ts` - Visual regression tests

## Writing New Tests

1. Create a new `.spec.ts` file in this directory
2. Use `test.describe()` to group related tests
3. Use `test()` to define individual test cases
4. Use Playwright's locators and assertions to interact with elements

Example:
```typescript
import { test, expect } from "@playwright/test";

test.describe("My Feature", () => {
  test("does something", async ({ page }) => {
    await page.goto("/my-page");
    await expect(page.locator("h1")).toHaveText("My Page");
  });
});
```

## CI/CD Integration

To run tests in CI:
```bash
pnpm exec playwright test --reporter=github
```

## Notes

- Tests are configured to run on Chromium, Firefox, and WebKit
- Tests run in parallel by default for faster execution
- Screenshots and videos are captured on failure
- Visual regression tests use pixel comparison with tolerance
