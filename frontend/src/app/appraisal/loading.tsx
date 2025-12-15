"use client";

import { CardSkeleton, FormSkeleton, StatsSkeleton } from "../../ui";

export default function AppraisalLoading() {
	return (
		<div className="min-h-screen bg-transparent">
			<div className="relative z-10 container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
				<div className="space-y-8">
					<div className="space-y-4">
						<div className="h-8 w-32 rounded-full border border-white/10 bg-content1/20 animate-pulse" />
						<div className="space-y-3">
							<div className="h-12 w-96 rounded bg-white/10 animate-pulse" />
							<div className="h-6 w-full max-w-3xl rounded bg-white/5 animate-pulse" />
							<div className="h-6 w-64 rounded bg-white/5 animate-pulse" />
						</div>
						<div className="flex items-center gap-3">
							<div className="h-12 w-32 rounded-xl bg-white/10 animate-pulse" />
							<div className="h-10 w-40 rounded-full border border-white/10 bg-content1/30 animate-pulse" />
						</div>
					</div>

					<div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
						<CardSkeleton className="relative overflow-hidden rounded-3xl border border-white/10 bg-content1/30 p-4 sm:p-6 lg:p-8">
							<div className="space-y-6">
								<div className="space-y-3">
									<div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
									<div className="h-8 w-96 rounded bg-white/10 animate-pulse" />
									<div className="h-5 w-full max-w-3xl rounded bg-white/5 animate-pulse" />
								</div>
								<FormSkeleton className="mt-2" />
							</div>
						</CardSkeleton>

						<div className="flex flex-col gap-4">
							<CardSkeleton className="rounded-3xl border border-white/10 bg-content1/30 p-5">
								<div className="flex items-center justify-between mb-4">
									<div className="h-6 w-32 rounded bg-white/10 animate-pulse" />
									<div className="h-6 w-24 rounded-full bg-white/10 animate-pulse" />
								</div>
								<StatsSkeleton />
							</CardSkeleton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
