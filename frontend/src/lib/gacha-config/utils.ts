import type { GachaConfig } from "./types";

// Get gacha config by ID (for routing)
export function getGachaConfig(
	configs: Record<string, GachaConfig>,
	id: string,
): GachaConfig | null {
	return configs[id] ?? null;
}

export function getAllActiveGachas(
	configs: Record<string, GachaConfig>,
): GachaConfig[] {
	return Object.values(configs).filter((gacha) => gacha.isActive);
}
