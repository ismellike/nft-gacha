"use client";

import { CardSkeleton } from "../../ui";

const LOADING_PLACEHOLDERS = [
	"loading-1",
	"loading-2",
	"loading-3",
	"loading-4",
];

export default function GachaLoading() {
	return (
		<div className="min-h-screen bg-transparent">
			<header className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
					<div className="flex items-start gap-4">
						<div className="p-2 rounded-xl border border-white/20 bg-content1/20 animate-pulse" />
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-success/50 animate-pulse" />
								<div className="h-4 w-12 rounded bg-white/10 animate-pulse" />
							</div>
							<div className="h-8 w-48 rounded bg-white/10 animate-pulse" />
							<div className="h-5 w-96 rounded bg-white/5 animate-pulse" />
						</div>
					</div>
					<div className="flex items-center gap-3 rounded-xl border border-white/10 bg-content1/20 px-4 py-3 animate-pulse">
						<div className="h-8 w-20 rounded bg-white/5" />
					</div>
				</div>

				<div className="mt-8">
					<div className="flex gap-2">
						{LOADING_PLACEHOLDERS.map((placeholder) => (
							<div
								key={placeholder}
								className="h-12 w-24 rounded-xl bg-content1/20 border border-white/10 animate-pulse"
							/>
						))}
					</div>
				</div>
			</header>

			<div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
				<div className="space-y-8">
					<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
					<div className="grid gap-6 lg:grid-cols-3">
						<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
						<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
						<CardSkeleton className="bg-content1/20 backdrop-blur-xl border border-white/10" />
					</div>
				</div>
			</div>
		</div>
	);
}
