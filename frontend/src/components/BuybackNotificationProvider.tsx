"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useBuybackNotifications } from "../hooks/useBuybackNotifications";
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
	buybackVaultAddress?: string;
}

export function BuybackNotificationProvider({
	children,
	gachaId,
	buybackVaultAddress
}: BuybackNotificationProviderProps) {
	// Get buyback vault address from gacha config if not provided
	const gachaConfig = gachaId ? getGachaConfig(gachaId) : null;
	const finalBuybackVaultAddress = buybackVaultAddress || gachaConfig?.buybackVaultAddress;

	const { showCustomNotification } = useBuybackNotifications(
		finalBuybackVaultAddress as `0x${string}`
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