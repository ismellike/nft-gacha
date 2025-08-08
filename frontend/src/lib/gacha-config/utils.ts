import type { GachaConfig } from "./types";

// Get gacha config by ID (for routing)
export function getGachaConfig(
	configs: Record<string, GachaConfig>,
	id: string,
): GachaConfig | null {
	return configs[id] || null;
}

// Get gacha config by contract address (for blockchain interactions)
export function getGachaConfigByAddress(
	configs: Record<string, GachaConfig>,
	address: string,
): GachaConfig | null {
	return (
		Object.values(configs).find(
			(gacha) => gacha.address.toLowerCase() === address.toLowerCase(),
		) || null
	);
}

export function getAllActiveGachas(
	configs: Record<string, GachaConfig>,
): GachaConfig[] {
	return Object.values(configs).filter((gacha) => gacha.isActive);
}

export function formatGachaAddress(address: string): string {
	if (!address) return "";
	if (address.length < 10) return address;
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
