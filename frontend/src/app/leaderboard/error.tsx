"use client";

import {
	ArrowLeftIcon,
	ArrowPathIcon,
	ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { logger } from "../../lib/logger";
import { Button, Card } from "../../ui";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function LeaderboardError({ error, reset }: ErrorProps) {
	const router = useRouter();

	useEffect(() => {
		logger.general.error("Leaderboard route error:", error);
	}, [error]);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl p-8 text-center bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
				<div className="mx-auto w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mb-6">
					<ExclamationTriangleIcon className="w-8 h-8 text-warning" />
				</div>

				<h1 className="text-2xl font-semibold text-foreground mb-3">
					Something went wrong
				</h1>

				<p className="text-foreground/70 mb-8 leading-relaxed">
					An unexpected error occurred while loading the leaderboard.
				</p>

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
						color="ghost"
						onPress={() => router.push("/")}
						startContent={<ArrowLeftIcon className="w-4 h-4" />}
					>
						Back to Home
					</Button>
				</div>
			</Card>
		</div>
	);
}
