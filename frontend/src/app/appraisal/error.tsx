"use client";

import { useEffect } from "react";
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Button, Card } from "../../ui";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function AppraisalError({ error, reset }: ErrorProps) {
	const router = useRouter();

	// Log error to monitoring service
	useEffect(() => {
		console.error("Appraisal route error:", error);
	}, [error]);

	const isWalletError = error.message.toLowerCase().includes("wallet") ||
		error.message.toLowerCase().includes("connector") ||
		error.message.toLowerCase().includes("provider");

	const isNetworkError = error.message.toLowerCase().includes("network") ||
		error.message.toLowerCase().includes("rpc") ||
		error.message.toLowerCase().includes("connection");

	const isContractError = error.message.toLowerCase().includes("contract") ||
		error.message.toLowerCase().includes("transaction") ||
		error.message.toLowerCase().includes("call") ||
		error.message.toLowerCase().includes("appraisal");

	const getErrorTitle = () => {
		if (isWalletError) return "Wallet Connection Error";
		if (isNetworkError) return "Network Connection Error";
		if (isContractError) return "Appraisal Service Error";
		return "Something went wrong";
	};

	const getErrorMessage = () => {
		if (isWalletError) {
			return "There's an issue with your wallet connection. Please check your wallet is properly connected to start appraisals.";
		}
		if (isNetworkError) {
			return "Unable to connect to the appraisal service. Please check your internet connection and try again.";
		}
		if (isContractError) {
			return "Failed to load appraisal data or submit appraisal requests. Please try again or contact support if the issue persists.";
		}
		return "An unexpected error occurred while loading the appraisal page.";
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl p-8 text-center bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
				<div className="mx-auto w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mb-6">
					<ExclamationTriangleIcon className="w-8 h-8 text-warning" />
				</div>

				<h1 className="text-2xl font-semibold text-foreground mb-3">
					{getErrorTitle()}
				</h1>

				<p className="text-foreground/70 mb-8 leading-relaxed">
					{getErrorMessage()}
				</p>

				{/* Error details for developers */}
				{process.env.NODE_ENV === "development" && (
					<details className="mb-6 text-left">
						<summary className="cursor-pointer text-sm text-foreground/50 hover:text-foreground/70 mb-2">
							Error Details
						</summary>
						<pre className="text-xs text-foreground/40 bg-content1/40 p-3 rounded-lg overflow-auto">
							{error.message}
							{error.digest && <br />}
							{error.digest && `Digest: ${error.digest}`}
						</pre>
					</details>
				)}

				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Button
						color="glassPrimary"
						onPress={reset}
						startContent={<ArrowPathIcon className="w-4 h-4" />}
					>
						Try Again
					</Button>

					<Button
						color="glass"
						onPress={() => window.location.reload()}
						startContent={<ArrowPathIcon className="w-4 h-4" />}
					>
						Refresh Page
					</Button>

					<Button
						color="ghost"
						onPress={() => router.push("/")}
						startContent={<HomeIcon className="w-4 h-4" />}
					>
						Back to Home
					</Button>
				</div>

				{/* Inline retry messaging for specific error types */}
				<div className="mt-6 text-sm text-foreground/50" aria-live="polite">
					{isWalletError && (
						<p>
							Tip: Connect your wallet to access the appraisal service. Make sure it's unlocked and has ETH for fees.
						</p>
					)}
					{isNetworkError && (
						<p>
							Tip: The appraisal service requires a stable internet connection. Check your connection and try again.
						</p>
					)}
					{isContractError && (
						<p>
							Tip: Appraisal contracts might be experiencing high demand. Please wait a moment and retry.
						</p>
					)}
				</div>
			</Card>
		</div>
	);
}