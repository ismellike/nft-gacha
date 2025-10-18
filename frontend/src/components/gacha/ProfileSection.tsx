"use client";

import { UserCircleIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import { ProfileDashboard } from "../ProfileDashboard";
import { GachaSectionLayout } from "./GachaSectionLayout";

interface ProfileSectionProps {
	title: string;
	description: string;
}

export function ProfileSection({ title, description }: ProfileSectionProps) {
	return (
		<GachaSectionLayout
			tone="rewards"
			icon={UserCircleIcon}
			label="Vault Management"
			title={title}
			description={description}
			highlights={[
				{
					icon: CheckBadgeIcon,
					title: "Vault Balance",
					description:
						"Stay on top of deposited NFTs, accrued USDC yield, and withdrawal history.",
				},
			]}
		>
			<ProfileDashboard />
		</GachaSectionLayout>
	);
}
