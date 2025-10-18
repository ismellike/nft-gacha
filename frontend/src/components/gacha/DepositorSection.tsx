"use client";

import {
	GiftIcon,
	WalletIcon,
	ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { NFTAvailabilitySection } from "../NFTAvailabilitySection";
import { GachaSectionLayout } from "./GachaSectionLayout";

interface DepositorSectionProps {
	title: string;
	description: string;
}

export function DepositorSection({
	title,
	description,
}: DepositorSectionProps) {
	return (
		<GachaSectionLayout
			tone="deposits"
			icon={GiftIcon}
			label="Depositor Flow"
			title={title}
			description={description}
			highlights={[
				{
					icon: WalletIcon,
					title: "Wallet Insight",
					description:
						"Auto-detects whitelisted collections in your connected wallet.",
				},
				{
					icon: ArrowUpTrayIcon,
					title: "Appraise & Deposit",
					description:
						"Request appraisals and commit NFTs with immediate treasury feedback.",
				},
			]}
		>
			<NFTAvailabilitySection />
		</GachaSectionLayout>
	);
}
