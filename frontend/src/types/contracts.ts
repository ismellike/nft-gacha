/**
 * Contract addresses interface for gacha system
 */
export interface GachaContracts {
	gacha: `0x${string}`;
	treasury: `0x${string}`;
	appraisal: `0x${string}`;
	economyManager: `0x${string}`;
	gachaServiceHandler: `0x${string}`;
	depositorVault: `0x${string}`;
	buybackVault: `0x${string}`;
	protocolTreasury: `0x${string}`;
	trackers: {
		common: `0x${string}`;
		uncommon: `0x${string}`;
		rare: `0x${string}`;
		epic: `0x${string}`;
		legendary: `0x${string}`;
	};
}