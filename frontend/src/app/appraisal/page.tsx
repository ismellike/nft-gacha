"use client";

import { NFTAppraisalDashboard } from "../../components/NFTAppraisalDashboard";

export default function AppraisalPage() {
	return (
		<div className="min-h-screen bg-transparent">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl">
				<NFTAppraisalDashboard />
			</div>
		</div>
	);
}
