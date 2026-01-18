import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
	// Add custom options here if needed
}

export function renderWithProviders(
	ui: ReactElement,
	options?: CustomRenderOptions,
) {
	// For now, just use the default render
	// In the future, you can add providers like Zustand store, Wagmi config, etc.
	return render(ui, options);
}

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
