/**
 * Wallet Disconnect Handler Hook
 *
 * Detects when a user disconnects their wallet during critical operations
 * and triggers a callback for recovery handling.
 */

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

type DisconnectCallback = () => void;

export function useWalletDisconnectHandler(
	onDisconnect: DisconnectCallback,
	enabled = true,
) {
	const { address, isConnected } = useAccount();
	const previousAddress = useRef<string | null>(null);

	useEffect(() => {
		if (!enabled) return;

		// Store current address
		if (address) {
			previousAddress.current = address;
		}

		// Check if wallet disconnected (address went from truthy to falsy)
		if (previousAddress.current && !address && !isConnected) {
			// Wallet was disconnected!
			onDisconnect();
		}
	}, [address, isConnected, enabled, onDisconnect]);

	// Cleanup
	useEffect(() => {
		return () => {
			// Reset on unmount
			previousAddress.current = null;
		};
	}, []);
}
