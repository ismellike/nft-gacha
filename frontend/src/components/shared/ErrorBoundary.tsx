"use client";

import {
	Component,
	type ReactNode,
	type ErrorInfo,
} from "react";
import {
	ExclamationTriangleIcon,
	ArrowPathIcon,
	HomeIcon,
} from "@heroicons/react/24/outline";
import { Button, Card } from "../../ui";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);

		// Log to error reporting service (e.g., Sentry)
		if (typeof window !== "undefined" && (window as any).Sentry) {
			(window as any).Sentry.captureException(error, {
				contexts: { react: { componentStack: errorInfo.componentStack } },
			});
		}

		this.props.onError?.(error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render(): ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-screen flex items-center justify-center p-4">
					<Card className="max-w-md w-full p-8 text-center">
						<ExclamationTriangleIcon className="w-16 h-16 text-danger mx-auto mb-4" />
						<h2 className="text-2xl font-bold text-foreground mb-2">
							Something went wrong
						</h2>
						<p className="text-foreground/70 mb-6">
							{this.state.error?.message ||
								"An unexpected error occurred. Please try again."}
						</p>

						{/* Error details in development */}
						{process.env.NODE_ENV === "development" && (
							<details className="mb-6 text-left">
								<summary className="cursor-pointer text-sm text-foreground/60 mb-2">
									Error Details
								</summary>
								<pre className="text-xs bg-content1/20 p-4 rounded-lg overflow-auto max-h-40">
									{this.state.error?.stack}
								</pre>
							</details>
						)}

						<div className="flex gap-3">
							<Button
								color="glass"
								className="flex-1"
								onPress={this.handleReset}
							>
								<ArrowPathIcon className="w-4 h-4 mr-2" />
								Try Again
							</Button>
							<Button
								color="glass"
								className="flex-1"
								onPress={() => (window.location.href = "/")}
							>
								<HomeIcon className="w-4 h-4 mr-2" />
								Go Home
							</Button>
						</div>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}
