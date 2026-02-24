import type { AxeResults } from "axe-core";
import { expect } from "vitest";
import { axe } from "vitest-axe";
import * as matchers from "vitest-axe/matchers";

expect.extend(matchers);

declare module "vitest" {
	interface Assertion {
		toHaveNoViolations(): void;
	}
}

/**
 * Runs axe-core accessibility checks on the given container and asserts
 * there are no violations.
 */
export async function expectNoA11yViolations(
	container: HTMLElement,
): Promise<void> {
	const results: AxeResults = await axe(container);
	expect(results).toHaveNoViolations();
}
