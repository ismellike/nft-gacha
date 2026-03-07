"use client";

import { WalletIcon } from "@heroicons/react/24/outline";
import { EmptyState } from "../shared/EmptyState";

export function WalletConnectPrompt() {
	return (
		<section role="alert" aria-live="polite">
			<EmptyState
				icon={WalletIcon}
				title="Connect Your Wallet"
				description="Connect your wallet to view your vault, deposit NFTs, and earn yield on your assets."
			/>
		</section>
	);
}
