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
	rewardsManagerAddress: string;
	trackerAddresses: {
		common: string;
		uncommon: string;
		rare: string;
		epic: string;
		legendary: string;
	};
}
