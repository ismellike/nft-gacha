"use client";

import { useCallback, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { expectedChainId, expectedNetworkName } from "../../wagmi";

/**
 * Renders a dismissible banner when the connected wallet is on the wrong chain.
 * Provides a one-click "Switch Network" button via useSwitchChain().
 */
export function WrongChainBanner() {
	const { isConnected } = useAccount();
	const walletChainId = useChainId();
	const { switchChain, isPending } = useSwitchChain();
	const [dismissed, setDismissed] = useState(false);

	const isWrongChain = isConnected && walletChainId !== expectedChainId;

	const handleSwitch = useCallback(() => {
		switchChain({ chainId: expectedChainId });
	}, [switchChain]);

	if (!isWrongChain || dismissed) return null;

	return (
		<div
			role="alert"
			className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-danger/90 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm"
		>
			<span>
				Wrong network — please switch to <strong>{expectedNetworkName}</strong>
			</span>
			<button
				type="button"
				disabled={isPending}
				onClick={handleSwitch}
				className="rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold transition-colors hover:bg-white/30 disabled:opacity-50"
			>
				{isPending ? "Switching..." : "Switch Network"}
			</button>
			<button
				type="button"
				onClick={() => setDismissed(true)}
				className="ml-1 rounded p-0.5 text-white/70 transition-colors hover:text-white"
				aria-label="Dismiss"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					className="h-4 w-4"
					role="img"
					aria-label="Dismiss"
				>
					<title>Dismiss</title>
					<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
				</svg>
			</button>
		</div>
	);
}
