"use client";

import { ChartBarIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { EconomyDashboard } from "../../economy";
import { useGachaId } from "../../../hooks/useGachaId";
import { getGachaConfig } from "../../../lib/gacha-config";
import { Card } from "../../../ui";
import { GachaSectionLayout } from "./GachaSectionLayout";

interface EconomySectionProps {
	title?: string;
	description?: string;
}

export function EconomySection({
	title = "Economy Dashboard",
	description = "Track protocol revenue, depositor yields, and treasury performance in real-time.",
}: EconomySectionProps) {
	const gachaId = useGachaId();
	const gacha = gachaId ? getGachaConfig(gachaId) : null;

	if (!gacha) {
		return (
			<Card className="p-8 text-center bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
				<h2 className="text-2xl font-bold mb-4">Gacha Configuration Error</h2>
				<p className="text-foreground/70">
					Unable to load gacha configuration. Please check your environment
					settings.
				</p>
			</Card>
		);
	}

	return (
		<GachaSectionLayout
			tone="economy"
			icon={ChartBarIcon}
			label="Economy Overview"
			title={title}
			description={description}
			highlights={[
				{
					icon: ChartBarIcon,
					title: "Revenue Split",
					description:
						"Monitor protocol and depositor shares as spins settle across the network.",
				},
				{
					icon: BanknotesIcon,
					title: "Treasury Health",
					description:
						"Track inflows, outflows, and runway for this gacha's asset pool.",
				},
			]}
		>
			<EconomyDashboard gachaConfig={gacha} />
		</GachaSectionLayout>
	);
}
