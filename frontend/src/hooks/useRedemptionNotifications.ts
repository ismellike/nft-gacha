"use client";

import { useWatchContractEvent } from "wagmi";
import { useWatchProtocolTreasuryRedemptionExecuted } from "../generated";
import { toast } from "react-hot-toast";

export function useRedemptionNotifications(protocolTreasuryAddress: `0x${string}`) {
	// Watch for redemption executed events
	useWatchProtocolTreasuryRedemptionExecuted({
		address: protocolTreasuryAddress,
		onLogs: (logs) => {
			logs.forEach((log) => {
				const { seller, collection, tokenId, payout } = log.args;

				// Create a detailed notification
				const collectionShort = `${collection.slice(0, 6)}...${collection.slice(-4)}`;
				const tokenIdStr = tokenId.toString();

				// Success notification for NFT redemption
				toast.success(
					`🎯 NFT Sold Successfully!\nCollection: ${collectionShort}\nToken ID: ${tokenIdStr}\nReceived: ${(Number(payout) / 1_000_000).toFixed(2)} USDC`,
					{
						duration: 5000,
						position: "top-right",
						icon: "💰",
						style: {
							background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
							color: "white",
							border: "1px solid #065f46",
							borderRadius: "12px",
							fontWeight: "500",
						},
					}
				);

				// Optional: Play a sound effect
				if (typeof window !== "undefined" && window.Audio) {
					try {
						const audio = new Audio("/sounds/success.mp3");
						audio.volume = 0.3;
						audio.play().catch(() => {
							// Ignore audio errors (user may not have interacted with page yet)
						});
					} catch (error) {
						// Ignore audio errors
					}
				}
			});
		},
		onError: (error) => {
			console.error("Redemption event subscription error:", error);
			toast.error("Failed to track redemption events", {
				duration: 3000,
				position: "top-right",
			});
		},
	});

	// Return a helper function to show custom notifications
	const showCustomNotification = (message: string, type: "success" | "error" | "info" = "info") => {
		const toastFn = type === "success" ? toast.success : type === "error" ? toast.error : toast;

		toastFn(message, {
			duration: 4000,
			position: "top-right",
			style: type === "success" ? {
				background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
				color: "white",
				border: "1px solid #065f46",
				borderRadius: "12px",
				fontWeight: "500",
			} : type === "error" ? {
				background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
				color: "white",
				border: "1px solid #991b1b",
				borderRadius: "12px",
				fontWeight: "500",
			} : {
				background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
				color: "white",
				border: "1px solid #1e40af",
				borderRadius: "12px",
				fontWeight: "500",
			},
		});
	};

	return { showCustomNotification };
}