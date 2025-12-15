export interface GachaConfig {
	id: string;
	address: string;
	title: string;
	description: string;
	longDescription: string;
	theme: string;
	treasuryAddress: string;
	isActive: boolean;
	createdAt: string;
	appraisalAddress: string;
	economyManagerAddress: string;
	gachaServiceHandlerAddress: string;
	// New economy system contracts
	depositorVaultAddress: string;
	buybackVaultAddress: string;
	protocolTreasuryAddress: string;
	// Collections are now queried dynamically from the treasury contract
	// Removed: nftCollectionAddress - collections are fetched from treasury whitelist
	trackerAddresses: {
		common: string;
		uncommon: string;
		rare: string;
		epic: string;
		legendary: string;
	};
}
