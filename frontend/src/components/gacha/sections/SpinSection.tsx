"use client";

import {
	BoltIcon,
	CurrencyDollarIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";
import GachaSpinner from "../GachaSpinner";
import { GachaSectionLayout } from "./GachaSectionLayout";

interface SpinSectionProps {
	title: string;
	description: string;
}

export function SpinSection({ title, description }: SpinSectionProps) {
	return (
		<GachaSectionLayout
			tone="spin"
			icon={SparklesIcon}
			label="Spin Flow"
			title={title}
			description={description}
			highlights={[
				{
					icon: BoltIcon,
					title: "Primary Action",
					description:
						"Approve the fee token once, then enjoy live updates while WAVS randomness settles.",
				},
				{
					icon: CurrencyDollarIcon,
					title: "Best-Effort Buyback",
					description:
						"Revealed NFTs can be sold back for 80% of their appraised value on a best-effort basis, while treasury funds last.",
				},
			]}
		>
			<GachaSpinner />
		</GachaSectionLayout>
	);
}
