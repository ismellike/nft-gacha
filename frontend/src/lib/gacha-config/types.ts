type Address = `0x${string}`;

export interface GachaConfig {
	id: string;
	address: Address;
	title: string;
	description: string;
	longDescription: string;
	theme: string;
	treasuryAddress: Address;
	isActive: boolean;
	createdAt: string;
	appraisalAddress: Address;
	economyManagerAddress: Address;
	gachaServiceHandlerAddress: Address;
	appraisalServiceHandlerAddress: Address;
	// New economy system contracts
	cardGroupedVaultAddress: Address;
	buybackVaultAddress: Address;
	protocolTreasuryAddress: Address;
	// Collections are now queried dynamically from the treasury contract
	// Removed: nftCollectionAddress - collections are fetched from treasury whitelist
	trackerAddresses: {
		common: Address;
		uncommon: Address;
		rare: Address;
		epic: Address;
		legendary: Address;
	};
}
