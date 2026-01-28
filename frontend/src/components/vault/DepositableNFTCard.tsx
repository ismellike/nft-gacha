"use client";

import {
	ArrowPathIcon,
	CheckIcon,
	GiftIcon,
	ShieldCheckIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { useReadNftAppraisalGetAppraisal } from "../../generated";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import { useNFTInteraction } from "../../hooks/useNFTInteraction";
import type { Rarity } from "../../lib/rarityConfig";
import { Button } from "../../ui";
import { NFTCard } from "../nft/NFTCard";

interface DepositableNFTCardProps {
	collection: string;
	tokenId: string;
	rarity?: Rarity;
	imageUrl?: string;
	onAction: (
		collection: string,
		tokenId: string,
		hasValidAppraisal?: boolean,
	) => void;
	onAppraisalStatusChange?: (
		collection: string,
		tokenId: string,
		hasValidAppraisal: boolean,
	) => void;
}

export const DepositableNFTCard = ({
	collection,
	tokenId,
	rarity,
	imageUrl,
	onAction,
	onAppraisalStatusChange,
}: DepositableNFTCardProps) => {
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	// Use the unified NFT interaction hook
	const interactionParams: {
		onAction?: (
			collection: string,
			tokenId: string,
			hasValidAppraisal?: boolean,
		) => void;
		onAppraisalStatusChange?: (
			collection: string,
			tokenId: string,
			hasValidAppraisal: boolean,
		) => void;
		refetchTreasuryCards?: () => Promise<void>;
	} = {
		onAction,
		refetchTreasuryCards: async () => {
			// Optional: Implement treasury cards refetch if needed
		},
	};

	if (onAppraisalStatusChange) {
		interactionParams.onAppraisalStatusChange = onAppraisalStatusChange;
	}

	const {
		error: hookError,
		startInteraction,
		getActionInfo,
		reset,
	} = useNFTInteraction(interactionParams);

	// Get appraisal data from contract
	const { data: appraisalData } = useReadNftAppraisalGetAppraisal({
		address: contracts.appraisal as `0x${string}`,
		args: [collection as `0x${string}`, BigInt(tokenId)],
		query: { enabled: !!contracts.appraisal },
	});

	// Extract appraisal info
	// Accept both Completed (1) and OwnerOverride (2) statuses as valid appraisals
	const hasValidAppraisal: boolean = !!(
		appraisalData &&
		appraisalData.priceUSD > BigInt(0) &&
		(appraisalData.status === 1 || appraisalData.status === 2)
	);

	// Report appraisal status change to parent component (with ref to prevent loops)
	const lastReportedStatusRef = useRef<boolean | null>(null);

	useEffect(() => {
		if (
			onAppraisalStatusChange &&
			lastReportedStatusRef.current !== hasValidAppraisal
		) {
			lastReportedStatusRef.current = hasValidAppraisal;
			onAppraisalStatusChange(collection, tokenId, hasValidAppraisal);
		}
	}, [hasValidAppraisal, collection, tokenId, onAppraisalStatusChange]);

	// Handle deposit flow using the unified hook
	const handleDeposit = useCallback(async () => {
		if (!userAddress || !publicClient || !contracts.treasury) {
			console.error("Missing required data for deposit");
			return;
		}

		try {
			// Start the deposit process
			await startInteraction(collection, tokenId, "deposit", {
				treasuryAddress: contracts.treasury,
				hasAppraisal: hasValidAppraisal,
			});
		} catch (error) {
			console.error("Deposit interaction failed:", error);
		}
	}, [
		userAddress,
		publicClient,
		contracts.treasury,
		collection,
		tokenId,
		startInteraction,
		hasValidAppraisal,
	]);

	// Get action info for UI
	const actionInfo = getActionInfo();

	// Handle NFT card click
	const handleNFTClick = () => {
		if (!hasValidAppraisal) {
			onAction(collection, tokenId, hasValidAppraisal);
		}
	};

	// Build action slot with appropriate buttons
	const actionSlot = (
		<div className="space-y-2">
			{!hasValidAppraisal ? (
				<Button
					color="glassPrimary"
					className="w-full"
					onPress={() => onAction(collection, tokenId, hasValidAppraisal)}
					startContent={<SparklesIcon className="w-4 h-4" />}
				>
					Get Appraised
				</Button>
			) : (
				<div className="space-y-2">
					{/* Main action button based on action info */}
					{actionInfo.type === "idle" && (
						<Button
							color="glassPrimary"
							className="w-full"
							onPress={handleDeposit}
						>
							<span className="flex items-center justify-center gap-2">
								<GiftIcon className="w-4 h-4" /> Deposit to Gacha
							</span>
						</Button>
					)}

					{actionInfo.type !== "idle" && actionInfo.type !== "completed" && (
						<Button
							className="w-full rounded-xl bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"
							isLoading={
								actionInfo.type === "processing" ||
								actionInfo.type === "checking"
							}
						>
							<span className="flex items-center justify-center gap-2">
								{actionInfo.type === "approveNFT" ? (
									<ShieldCheckIcon className="w-4 h-4" />
								) : (
									<ArrowPathIcon className="w-4 h-4" />
								)}
								{actionInfo.label || "Processing"}
							</span>
						</Button>
					)}

					{actionInfo.type === "completed" && (
						<Button color="glassPrimary" className="w-full" isDisabled>
							<span className="flex items-center justify-center gap-2">
								<CheckIcon className="w-4 h-4" /> {actionInfo.label}
							</span>
						</Button>
					)}

					{hookError && (
						<div className="space-y-2">
							<Button
								className="w-full rounded-xl bg-danger/20 border border-danger/30 text-danger hover:bg-danger/30"
								onPress={() => reset()}
							>
								<span className="flex items-center justify-center gap-2">
									<ArrowPathIcon className="w-4 h-4" /> Try Again
								</span>
							</Button>
							<p className="text-xs text-danger text-center">{hookError}</p>
						</div>
					)}
				</div>
			)}
		</div>
	);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="group relative"
		>
			<NFTCard
				data={{
					collection,
					tokenId,
					rarity,
					imageUrl,
				}}
				size="md"
				onClick={!hasValidAppraisal ? handleNFTClick : () => {}}
			/>

			{/* Action buttons */}
			<div className="mt-4 flex justify-center">{actionSlot}</div>
		</motion.div>
	);
};
