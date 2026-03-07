"use client";

import { motion } from "framer-motion";
import type {
	CardGroupedVaultData,
	UserCardGroupedData,
} from "../../hooks/useCardGroupedVault";
import type { UserOwnedNFTMultiCollection } from "../../types/hooks";
import { DepositTab } from "./tabs/DepositTab";
import { VaultTabNavigation } from "./tabs/VaultTabNavigation";
import { WithdrawTab } from "./tabs/WithdrawTab";
import { YieldTab } from "./tabs/YieldTab";

type VaultTab = "deposit" | "withdraw" | "yield";

interface NFTWithCollection {
	collection: `0x${string}`;
	tokenId: bigint;
	appraisedPrice: bigint;
	currentRarity?: number | string;
	collectionName?: string | undefined;
}

interface AppraisalInfo {
	hasAppraisal: boolean;
	priceUSD: bigint;
}

interface VaultTabContentProps {
	activeTab: VaultTab;
	onTabChange: (tab: VaultTab) => void;
	sortedUserOwnedNFTs: UserOwnedNFTMultiCollection[];
	appraisedNFTs: Set<string>;
	appraisalData: Map<string, AppraisalInfo>;
	appraisal: string | undefined;
	getNFTDepositState: (
		collection: string,
		tokenId: string,
	) => {
		isDepositing: boolean;
		stage: string;
		message: string;
	} | null;
	onNFTAction: (
		collection: string,
		tokenId: string,
		hasAppraisal?: boolean,
	) => void;
	filteredWithdrawableNFTs: NFTWithCollection[];
	totalDepositedNFTs: number;
	withdrawingNFT: { collection: `0x${string}`; tokenId: bigint } | null;
	onWithdrawNFT: (collection: `0x${string}`, tokenId: bigint) => void;
	depositorUserData: UserCardGroupedData;
	depositorData: CardGroupedVaultData;
	treasuryAddress: `0x${string}` | undefined;
}

export function VaultTabContent({
	activeTab,
	onTabChange,
	sortedUserOwnedNFTs,
	appraisedNFTs,
	appraisalData,
	appraisal,
	getNFTDepositState,
	onNFTAction,
	filteredWithdrawableNFTs,
	totalDepositedNFTs,
	withdrawingNFT,
	onWithdrawNFT,
	depositorUserData,
	depositorData,
	treasuryAddress,
}: VaultTabContentProps) {
	return (
		<>
			<VaultTabNavigation activeTab={activeTab} onTabChange={onTabChange} />

			<motion.div
				key={activeTab}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
				className="mt-6"
			>
				{activeTab === "deposit" && (
					<DepositTab
						sortedUserOwnedNFTs={sortedUserOwnedNFTs}
						appraisedNFTs={appraisedNFTs}
						appraisalData={appraisalData}
						appraisal={appraisal}
						getNFTDepositState={getNFTDepositState}
						onNFTAction={onNFTAction}
					/>
				)}

				{activeTab === "withdraw" && (
					<WithdrawTab
						filteredWithdrawableNFTs={filteredWithdrawableNFTs}
						totalDepositedNFTs={totalDepositedNFTs}
						withdrawingNFT={withdrawingNFT}
						onWithdrawNFT={onWithdrawNFT}
						onSwitchToDeposit={() => onTabChange("deposit")}
					/>
				)}

				{activeTab === "yield" && (
					<YieldTab
						depositorUserData={depositorUserData}
						depositorData={depositorData}
						treasuryAddress={treasuryAddress}
					/>
				)}
			</motion.div>
		</>
	);
}
