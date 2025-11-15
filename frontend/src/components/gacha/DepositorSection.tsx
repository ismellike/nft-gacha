"use client";

import { GiftIcon } from "@heroicons/react/24/outline";
import { SimpleNFTManagement } from "../SimpleNFTManagement";
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
			highlights={[]}
		>
			<SimpleNFTManagement mode="deposit" />
		</GachaSectionLayout>
	);
}
