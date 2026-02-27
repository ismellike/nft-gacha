"use client";

import { ExclamationTriangleIcon, HomeIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { logger } from "../lib/logger";
import { Button, Card } from "../ui";

interface WindowWithSentry extends Window {
	Sentry?: {
		captureException: (error: Error) => void;
	};
}

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		logger.general.error("Error boundary caught:", error);

		// Optional: Log to external service like Sentry
		if (typeof window !== "undefined") {
			const windowWithSentry = window as unknown as WindowWithSentry;
			if (windowWithSentry.Sentry) {
				windowWithSentry.Sentry.captureException(error);
			}
		}
	}, [error]);

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="max-w-md w-full p-8 text-center">
				<ExclamationTriangleIcon className="w-16 h-16 text-danger mx-auto mb-4" />
				<h2 className="text-2xl font-bold text-foreground mb-2">
					Something went wrong!
				</h2>
				<p className="text-foreground/70 mb-6">
					{error.message || "An unexpected error occurred. Please try again."}
				</p>

				{/* Error details in development */}
				{process.env.NODE_ENV === "development" && (
					<details className="mb-6 text-left">
						<summary className="cursor-pointer text-sm text-foreground/60 mb-2">
							Error Details
						</summary>
						<pre className="text-xs bg-content1/20 p-4 rounded-lg overflow-auto max-h-40">
							{error.stack}
						</pre>
					</details>
				)}

				<div className="flex gap-3">
					<Button
						color="glass"
						className="flex-1"
						onPress={
							reset // Attempt to recover by trying to re-render the segment
						}
					>
						Try again
					</Button>
					<Button
						color="glass"
						className="flex-1"
						onPress={() => {
							window.location.href = "/";
						}}
					>
						<HomeIcon className="w-4 h-4 mr-2" />
						Go Home
					</Button>
				</div>
			</Card>
		</div>
	);
}
