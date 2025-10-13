"use client";

import { EconomyDashboard } from "../../components/EconomyDashboard";
import { getGachaConfig } from "../../lib/gacha-config";
import { DEFAULT_GACHA_ID } from "../../lib/gacha-config/contracts";

export default function EconomyPage() {
	const gachaConfig = getGachaConfig(DEFAULT_GACHA_ID);

	if (!gachaConfig) {
		return (
			<div className="min-h-screen bg-transparent px-6 py-8">
				<div className="max-w-7xl mx-auto">
					<div className="text-center">
						<h1 className="text-4xl font-black mb-4">Configuration Error</h1>
						<p>Unable to load gacha configuration. Please check your environment settings.</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-transparent px-6 py-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl md:text-6xl font-black mb-4 font-orbitron">
						<span className="bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
							Economy Dashboard
						</span>
					</h1>
					<p className="text-xl text-foreground/80 max-w-4xl">
						Track protocol revenue, depositor yields, and treasury performance in real-time.
					</p>
				</div>

				{/* Economy Dashboard */}
				<EconomyDashboard gachaConfig={gachaConfig} />
			</div>
		</div>
	);
}