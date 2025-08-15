"use client";

import { Suspense } from "react";
import { NFTAppraisalDashboard } from "../../components/NFTAppraisalDashboard";
import { LoadingState } from "../../components/ui";

export default function AppraisalPage() {
	return (
		<div className="min-h-screen bg-transparent">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl">
				<Suspense
					fallback={
						<div className="flex items-center justify-center min-h-[400px]">
							<LoadingState size="lg" />
						</div>
					}
				>
					<NFTAppraisalDashboard />
				</Suspense>
			</div>
		</div>
	);
}
