/**
 * Error Boundary for NFT Reveal Modal
 * Catches and handles animation/rendering failures gracefully
 */

"use client";

import { motion } from "framer-motion";
import { Component, type ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class RevealErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error(
			"NFT Reveal Error Boundary caught an error:",
			error,
			errorInfo,
		);
		this.props.onError?.(error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default error UI
			return (
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="flex flex-col items-center justify-center min-h-screen p-8"
				>
					<div className="glass-card p-8 rounded-2xl max-w-md text-center">
						<motion.div
							initial={{ rotate: 0 }}
							animate={{ rotate: [0, -10, 10, -10, 0] }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="text-6xl mb-4"
						>
							⚠️
						</motion.div>
						<h2 className="text-2xl font-bold text-foreground mb-2">
							Reveal Error
						</h2>
						<p className="text-foreground/70 mb-6">
							We encountered an error while revealing your NFT. This might be
							due to missing metadata or a temporary issue.
						</p>
						{this.state.error && (
							<details className="text-left text-sm text-foreground/50 mb-4">
								<summary className="cursor-pointer hover:text-foreground/70">
									Error details
								</summary>
								<pre className="mt-2 p-2 bg-content1/50 rounded overflow-auto max-h-32">
									{this.state.error.message}
								</pre>
							</details>
						)}
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => window.location.reload()}
							className="px-6 py-2 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg font-medium"
						>
							Try Again
						</motion.button>
					</div>
				</motion.div>
			);
		}

		return this.props.children;
	}
}
