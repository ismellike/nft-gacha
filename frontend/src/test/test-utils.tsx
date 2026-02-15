import {
	type RenderOptions,
	render,
	renderHook as rtlRenderHook,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { createConfig, http } from "wagmi";
import { WagmiProvider } from "wagmi";
import { holesky } from "wagmi/chains";

/**
 * Creates a test QueryClient with retries disabled for faster test execution
 */
export function createTestQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
				staleTime: 0,
			},
			mutations: {
				retry: false,
			},
		},
	});
}

/**
 * Test Wagmi config for mocking blockchain interactions
 */
export const testWagmiConfig = createConfig({
	chains: [holesky],
	transports: {
		[holesky.id]: http(),
	},
});

/**
 * Mock account helper for testing connected/disconnected wallet states
 */
export const mockAccount = {
	connected: {
		address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
		isConnected: true,
		isConnecting: false,
		isDisconnected: false,
		isReconnecting: false,
		status: "connected" as const,
	},
	disconnected: {
		address: undefined,
		isConnected: false,
		isConnecting: false,
		isDisconnected: true,
		isReconnecting: false,
		status: "disconnected" as const,
	},
};

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
	queryClient?: QueryClient;
}

/**
 * Custom render function with Wagmi and TanStack Query providers
 */
export function renderWithProviders(
	ui: ReactElement,
	options?: CustomRenderOptions,
) {
	const queryClient = options?.queryClient ?? createTestQueryClient();

	return render(
		<WagmiProvider config={testWagmiConfig}>
			<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
		</WagmiProvider>,
		options,
	);
}

/**
 * Custom renderHook with Wagmi and TanStack Query providers
 */
export function renderHook<Result, Props>(
	render: (initialProps: Props) => Result,
	options?: CustomRenderOptions,
) {
	const queryClient = options?.queryClient ?? createTestQueryClient();

	return rtlRenderHook(render, {
		...options,
		wrapper: ({ children }) => (
			<WagmiProvider config={testWagmiConfig}>
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			</WagmiProvider>
		),
	});
}

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
