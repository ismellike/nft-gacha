"use client";

import { useMemo } from "react";
import { isValidContractAddress } from "../lib/contract-utils";
import { getGachaContracts } from "../lib/gacha-config/contracts";

export interface GachaContracts {
	gacha: string | undefined;
	treasury: string | undefined;
	appraisal: string | undefined;
	economyManager: string | undefined;
	gachaServiceHandler: string | undefined;
	appraisalServiceHandler: string | undefined;
	depositorVault: string | undefined;
	buybackVault: string | undefined;
	protocolTreasury: string | undefined;
	trackers:
		| {
				common: string | undefined;
				uncommon: string | undefined;
				rare: string | undefined;
				epic: string | undefined;
				legendary: string | undefined;
		  }
		| undefined;
}

/**
 * Hook to get contract addresses for a specific gacha
 * @param gachaId - The gacha ID to get contracts for (required)
 * @returns Contract addresses object
 */
export function useGachaContracts(gachaId: string): GachaContracts {
	const contracts = useMemo(() => {
		if (!gachaId) {
			console.warn("No gacha ID provided to useGachaContracts");
			return getEmptyContracts();
		}

		try {
			const contractAddresses = getGachaContracts(gachaId);

			// Validate that all contract addresses are valid
			const validatedContracts = {
				gacha: contractAddresses.gacha,
				treasury: contractAddresses.treasury,
				appraisal: contractAddresses.appraisal,
				economyManager: contractAddresses.economyManager,
				gachaServiceHandler: contractAddresses.gachaServiceHandler,
				appraisalServiceHandler: contractAddresses.appraisalServiceHandler,
				depositorVault: contractAddresses.depositorVault,
				buybackVault: contractAddresses.buybackVault,
				protocolTreasury: contractAddresses.protocolTreasury,
				trackers: contractAddresses.trackers,
			};

			// Log warnings for invalid addresses
			Object.entries(validatedContracts).forEach(([key, value]) => {
				if (key === "trackers" && value) {
					Object.entries(value).forEach(([rarity, address]) => {
						if (address && !isValidContractAddress(address)) {
							console.warn(`Invalid ${rarity} tracker address: ${address}`);
						}
					});
				} else if (
					typeof value === "string" &&
					value &&
					!isValidContractAddress(value)
				) {
					console.warn(`Invalid ${key} contract address: ${value}`);
				}
			});

			return validatedContracts;
		} catch (error) {
			console.error(`Failed to get contracts for gacha ${gachaId}:`, error);
			return getEmptyContracts();
		}
	}, [gachaId]);

	return contracts;
}

function getEmptyContracts(): GachaContracts {
	return {
		gacha: undefined,
		treasury: undefined,
		appraisal: undefined,
		economyManager: undefined,
		gachaServiceHandler: undefined,
		appraisalServiceHandler: undefined,
		depositorVault: undefined,
		buybackVault: undefined,
		protocolTreasury: undefined,
		trackers: {
			common: undefined,
			uncommon: undefined,
			rare: undefined,
			epic: undefined,
			legendary: undefined,
		},
	};
}
