"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useRedemptionNotifications } from "../hooks/useRedemptionNotifications";
import { getGachaConfig } from "../lib/gacha-config";

interface BuybackNotificationContextType {
	showNotification: (message: string, type?: "success" | "error" | "info") => void;
}

const BuybackNotificationContext = createContext<BuybackNotificationContextType | null>(null);

export function useBuybackNotificationsContext() {
	const context = useContext(BuybackNotificationContext);
	if (!context) {
		throw new Error("useBuybackNotificationsContext must be used within BuybackNotificationProvider");
	}
	return context;
}

interface BuybackNotificationProviderProps {
	children: ReactNode;
	gachaId?: string;
	protocolTreasuryAddress?: string;
}

export function BuybackNotificationProvider({
	children,
	gachaId,
	protocolTreasuryAddress
}: BuybackNotificationProviderProps) {
	// Get protocol treasury address from gacha config if not provided
	const gachaConfig = gachaId ? getGachaConfig(gachaId) : null;
	const finalProtocolTreasuryAddress = protocolTreasuryAddress || gachaConfig?.protocolTreasuryAddress;

	const { showCustomNotification } = useRedemptionNotifications(
		finalProtocolTreasuryAddress as `0x${string}`
	);

	const contextValue: BuybackNotificationContextType = {
		showNotification: showCustomNotification,
	};

	return (
		<BuybackNotificationContext.Provider value={contextValue}>
			{children}
		</BuybackNotificationContext.Provider>
	);
}