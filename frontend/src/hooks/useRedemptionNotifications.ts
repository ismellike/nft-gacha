"use client";

import { useWatchProtocolTreasuryRedemptionExecuted } from "../generated";
import { logger } from "../lib/logger";
import { toastError, toastInfo, toastSuccess } from "../lib/toast";

export function useRedemptionNotifications(
	protocolTreasuryAddress: `0x${string}`,
) {
	// Watch for redemption executed events
	useWatchProtocolTreasuryRedemptionExecuted({
		address: protocolTreasuryAddress,
		onLogs: (logs) => {
			logs.forEach((log) => {
				const { collection, tokenId, payout } = log.args;

				// Create a detailed notification
				const collectionShort = `${collection?.slice(0, 6)}...${collection?.slice(-4) ?? ""}`;
				const tokenIdStr = tokenId?.toString() ?? "";

				// Success notification for NFT redemption
				toastSuccess(
					`🎯 Collection: ${collectionShort} | Token ID: ${tokenIdStr} | Received: ${(Number(payout) / 1_000_000).toFixed(2)} USDC`,
					"NFT Sold Successfully!",
				);

				// Optional: Play a sound effect
				if (typeof window !== "undefined" && "AudioContext" in window) {
					try {
						const ctx = new window.AudioContext();
						const oscillator = ctx.createOscillator();
						const gain = ctx.createGain();
						oscillator.type = "sine";
						oscillator.frequency.value = 880;
						gain.gain.setValueAtTime(0.0001, ctx.currentTime);
						gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
						gain.gain.exponentialRampToValueAtTime(
							0.0001,
							ctx.currentTime + 0.25,
						);
						oscillator.connect(gain).connect(ctx.destination);
						oscillator.start();
						oscillator.stop(ctx.currentTime + 0.3);
					} catch (_error) {
						// Ignore audio errors
					}
				}
			});
		},
		onError: (error) => {
			logger.network.error("Redemption event subscription error:", error);
			toastError("Failed to track redemption events");
		},
	});

	// Return a helper function to show custom notifications
	const showCustomNotification = (
		message: string,
		type: "success" | "error" | "info" = "info",
	) => {
		if (type === "success") {
			toastSuccess(message);
		} else if (type === "error") {
			toastError(message);
		} else {
			toastInfo(message);
		}
	};

	return { showCustomNotification };
}
