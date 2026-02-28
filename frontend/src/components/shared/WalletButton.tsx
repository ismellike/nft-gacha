"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";

export function WalletButton() {
	const { open } = useAppKit();
	const { address, isConnected, isReconnecting } = useAccount();

	if (isReconnecting) {
		return (
			<div className="px-4 py-2.5 rounded-xl bg-content1/30 border border-white/10 text-sm font-medium text-foreground/50 animate-pulse">
				Connecting...
			</div>
		);
	}

	if (isConnected && address) {
		return (
			<button
				type="button"
				onClick={() => open({ view: "Account" })}
				className="px-4 py-2.5 rounded-xl bg-content1/30 border border-white/10 text-sm font-medium text-foreground/90 hover:bg-content1/50 transition-all duration-200"
			>
				{address.slice(0, 6)}...{address.slice(-4)}
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={() => open()}
			className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-warning to-orange-400 text-black font-semibold text-sm hover:from-warning/90 hover:to-orange-400/90 transition-all duration-200 shadow-lg shadow-warning/20"
		>
			Connect Wallet
		</button>
	);
}
