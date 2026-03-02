"use client";

import { CardSkeleton } from "../../ui";

export default function LeaderboardLoading() {
	return (
		<div className="min-h-screen bg-transparent">
			<div className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
				<div className="space-y-3 mb-8">
					<div className="h-8 w-48 rounded bg-white/10 animate-pulse" />
					<div className="h-5 w-96 rounded bg-white/5 animate-pulse" />
				</div>
			</div>

			<div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
				<div className="space-y-6">
					<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
					<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
				</div>
			</div>
		</div>
	);
}
