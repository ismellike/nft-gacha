"use client";

import { useMemo } from "react";
import { isValidContractAddress } from "../lib/contract-utils";
import { getGachaContracts } from "../lib/gacha-config/contracts";
import { logger } from "../lib/logger";

type Address = `0x${string}`;

export interface GachaContracts {
	gacha: Address | undefined;
	treasury: Address | undefined;
	appraisal: Address | undefined;
	economyManager: Address | undefined;
	gachaServiceHandler: Address | undefined;
	appraisalServiceHandler: Address | undefined;
	cardGroupedVault: Address | undefined;
	buybackVault: Address | undefined;
	protocolTreasury: Address | undefined;
	trackers: (Address | undefined)[];
	rarityNames: string[];
}

/**
 * Hook to get contract addresses for a specific gacha
 * @param gachaId - The gacha ID to get contracts for (required)
 * @returns Contract addresses object
 */
export function useGachaContracts(gachaId: string): GachaContracts {
	const contracts = useMemo(() => {
		if (!gachaId) {
			logger.contracts.warn("No gacha ID provided to useGachaContracts");
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
				cardGroupedVault: contractAddresses.cardGroupedVault,
				buybackVault: contractAddresses.buybackVault,
				protocolTreasury: contractAddresses.protocolTreasury,
				trackers: contractAddresses.trackers,
				rarityNames: contractAddresses.rarityNames,
			};

			// Log warnings for invalid addresses
			for (const [key, value] of Object.entries(validatedContracts)) {
				if (key === "trackers" && Array.isArray(value)) {
					for (let i = 0; i < value.length; i++) {
						const address = value[i] as string | undefined;
						if (address && !isValidContractAddress(address)) {
							logger.contracts.warn(
								`Invalid tracker[${i}] address: ${address}`,
							);
						}
					}
				} else if (
					typeof value === "string" &&
					value &&
					!isValidContractAddress(value)
				) {
					logger.contracts.warn(`Invalid ${key} contract address: ${value}`);
				}
			}

			return validatedContracts;
		} catch (error) {
			logger.contracts.error(`Failed to get contracts for gacha ${gachaId}:`, error);
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
		cardGroupedVault: undefined,
		buybackVault: undefined,
		protocolTreasury: undefined,
		trackers: [],
		rarityNames: [],
	};
}
