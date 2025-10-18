"use client";

import { CogIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { AdminControls } from "../AdminControls";
import type { GachaConfig } from "../../lib/gacha-config/types";
import { GachaSectionLayout } from "./GachaSectionLayout";

interface AdminSectionProps {
	gacha: GachaConfig;
}

export function AdminSection({ gacha }: AdminSectionProps) {
	return (
		<GachaSectionLayout
			tone="admin"
			icon={CogIcon}
			label="Admin Controls"
			title="Manage This Gacha"
			description="Update fee tokens, tune treasury parameters, and pause or resume the service manager with clarity."
			highlights={[
				{
					icon: ShieldCheckIcon,
					title: "Safeguards",
					description:
						"Ownership-gated actions emit detailed transaction feedback for coordinated teams.",
				},
			]}
		>
			<AdminControls gacha={gacha} />
		</GachaSectionLayout>
	);
}
