"use client";

import { useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { useMachine } from "@xstate/react";

import { UnifiedNFTCard, type UnifiedNFTCardProps } from "./UnifiedNFTCard";
import { Button } from "../ui";
import {
	GiftIcon,
	ShieldCheckIcon,
	CheckIcon,
	ArrowPathIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import {
	useReadNftAppraisalGetAppraisal,
	erc721Abi,
} from "../generated";
import { nftDepositMachine } from "../machines/nftDepositMachine";

interface DepositableNFTCardProps
	extends Omit<
		UnifiedNFTCardProps,
		"onClick" | "collectionName" | "extraDetails" | "actionSlot"
	> {
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
	onAction,
	onAppraisalStatusChange,
	...nftCardProps
}: DepositableNFTCardProps) => {
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	// XState machine for deposit process
	const [depositState, sendDepositEvent] = useMachine(nftDepositMachine);

	// Contract write hooks
	const {
		writeContract: approveNFT,
		isSuccess: isApprovalSuccess,
		isError: isApprovalError,
		error: approvalError,
	} = useWriteContract();
	
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

	// Handle deposit flow using state machine
	const handleDeposit = useCallback(async () => {
		if (!userAddress || !publicClient || !contracts.treasury) {
			console.error("Missing required parameters for deposit");
			return;
		}

		// Start the deposit process
		sendDepositEvent({
			type: "START_DEPOSIT",
			collection,
			tokenId,
			treasuryAddress: contracts.treasury as `0x${string}`,
			userAddress,
			publicClient,
		});
	}, [
		userAddress,
		publicClient,
		contracts.treasury,
		collection,
		tokenId,
		sendDepositEvent,
	]);

	// Handle approval step
	const handleApproval = useCallback(() => {
		if (!contracts.treasury) return;

		try {
			approveNFT({
				address: collection as `0x${string}`,
				abi: erc721Abi,
				functionName: "approve",
				args: [contracts.treasury as `0x${string}`, BigInt(tokenId)],
			});
			// Send approval transaction started event to state machine
			sendDepositEvent({
				type: "APPROVAL_TRANSACTION_SENT",
				txHash: "approval-started",
			});
		} catch (error) {
			sendDepositEvent({
				type: "ERROR",
				error: error instanceof Error ? error.message : "Approval failed",
			});
		}
	}, [approveNFT, collection, tokenId, contracts.treasury, sendDepositEvent]);

	
	// Handle approval transaction results
	useEffect(() => {
		if (isApprovalSuccess && depositState.matches("waitingForApproval")) {
			sendDepositEvent({
				type: "DEPOSIT_TRANSACTION_SENT",
				txHash: "approval-confirmed",
			});
		}
	}, [isApprovalSuccess, depositState, sendDepositEvent]);

	useEffect(() => {
		if (isApprovalError && depositState.matches("waitingForApproval")) {
			sendDepositEvent({
				type: "ERROR",
				error: approvalError?.message || "Approval failed",
			});
		}
	}, [isApprovalError, approvalError, depositState, sendDepositEvent]);

	
	// Get current state info for UI
	const currentDepositState = depositState.value as string;
	const depositStateError = depositState.context.error;

	// Handle NFT card click
	const handleNFTClick = () => {
		if (!hasValidAppraisal) {
			onAction(collection, tokenId, hasValidAppraisal);
		}
	};

	// Don't use extraDetails for appraisal - let UnifiedNFTCard handle it with built-in display
	const extraDetails = undefined;

	// Build action slot with appropriate buttons
	const actionSlot = (
		<div className="space-y-2">
			{!hasValidAppraisal ? (
				<Button
					className="w-full rounded-xl bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"
					onPress={() => onAction(collection, tokenId, hasValidAppraisal)}
				>
					<span className="flex items-center justify-center gap-2">
						<SparklesIcon className="w-4 h-4" /> Get Appraised
					</span>
				</Button>
			) : (
				<div className="space-y-2">
					{/* Main action button based on state */}
					{currentDepositState === "idle" && (
						<Button
							className="w-full rounded-xl bg-gradient-to-r from-warning to-orange-400 text-black"
							onPress={handleDeposit}
						>
							<span className="flex items-center justify-center gap-2">
								<GiftIcon className="w-4 h-4" /> Deposit to Gacha
							</span>
						</Button>
					)}

					{currentDepositState === "checkingApproval" && (
						<Button
							className="w-full rounded-xl bg-gradient-to-r from-warning to-orange-400 text-black"
							isLoading
						>
							Checking approval...
						</Button>
					)}

					{currentDepositState === "approving" && (
						<Button
							className="w-full rounded-xl bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"
							onPress={handleApproval}
						>
							<span className="flex items-center justify-center gap-2">
								<ShieldCheckIcon className="w-4 h-4" /> Approve NFT
							</span>
						</Button>
					)}

					{currentDepositState === "waitingForApproval" && (
						<Button
							className="w-full rounded-xl bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"
							isLoading
						>
							<span className="flex items-center justify-center gap-2">
								<ArrowPathIcon className="w-4 h-4" /> Waiting for approval...
							</span>
						</Button>
					)}

					{currentDepositState === "depositing" && (
						<Button
							className="w-full rounded-xl bg-gradient-to-r from-warning to-orange-400 text-black"
							isLoading
						>
							Depositing...
						</Button>
					)}

					
					{currentDepositState === "completed" && (
						<Button
							className="w-full rounded-xl bg-gradient-to-r from-warning to-orange-400 text-black"
							isDisabled
						>
							<span className="flex items-center justify-center gap-2">
								<CheckIcon className="w-4 h-4" /> Deposited Successfully
							</span>
						</Button>
					)}

					{currentDepositState === "error" && (
						<div className="space-y-2">
							<Button
								className="w-full rounded-xl bg-danger/20 border border-danger/30 text-danger hover:bg-danger/30"
								onPress={() => sendDepositEvent({ type: "RESET" })}
							>
								<span className="flex items-center justify-center gap-2">
									<ArrowPathIcon className="w-4 h-4" /> Reset & Try Again
								</span>
							</Button>
							{depositStateError && (
								<p className="text-xs text-danger text-center">
									{depositStateError}
								</p>
							)}
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
			<UnifiedNFTCard
				collection={collection}
				tokenId={tokenId}
				{...(!hasValidAppraisal && { onClick: handleNFTClick })}
				size="md"
				variant="detailed"
				showAppraisal={true} // Use built-in appraisal display for consistency
				priority={hasValidAppraisal ? 8 : 5}
				animate={true}
				{...(extraDetails ? { extraDetails } : {})}
				actionSlot={actionSlot}
				{...nftCardProps}
				appraisalContractAddress={contracts.appraisal as `0x${string}` || "0x0000000000000000000000000000000000000000"}
			/>
		</motion.div>
	);
};
