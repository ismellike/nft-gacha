"use client";

import type React from "react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the component tree,
 * log those errors, and display a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		// Log the error to an error reporting service
		console.error("ErrorBoundary caught an error:", error, errorInfo);

		// Call custom error handler if provided
		if (this.props.onError) {
			this.props.onError(error, errorInfo);
		}
	}

	handleReset = (): void => {
		this.setState({ hasError: false, error: null });
	};

	render(): ReactNode {
		if (this.state.hasError) {
			// Custom fallback UI
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default fallback UI
			return (
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="glass-card rounded-xl p-8 text-center max-w-md">
						<div className="mb-4 flex justify-center">
							<svg
								className="h-16 w-16 text-red-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
						<h2 className="mb-2 text-2xl font-bold text-foreground">
							Something went wrong
						</h2>
						<p className="mb-6 text-foreground/70">
							{this.state.error?.message || "An unexpected error occurred"}
						</p>
						<div className="flex gap-3 justify-center">
							<button
								onClick={this.handleReset}
								className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
							>
								Try Again
							</button>
							<button
								onClick={() => window.location.reload()}
								className="px-4 py-2 rounded-lg bg-content2 text-foreground font-medium hover:bg-content3 transition-colors"
							>
								Reload Page
							</button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

/**
 * Hook-based error boundary for functional components
 */
export function withErrorBoundary<P extends object>(
	WrappedComponent: React.ComponentType<P>,
	errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
): React.ComponentType<P> {
	return function WithErrorBoundaryWrapper(props: P) {
		return (
			<ErrorBoundary {...errorBoundaryProps}>
				<WrappedComponent {...props} />
			</ErrorBoundary>
		);
	};
}
