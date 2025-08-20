"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { useMachine } from "@xstate/react";
import { SparklesIcon } from "@heroicons/react/24/outline";

import { UnifiedNFTCard, type UnifiedNFTCardProps } from "./UnifiedNFTCard";
import { GlassButton } from "./index";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import {
	useReadNftAppraisalGetAppraisal,
	useWriteErc721Approve,
	useWriteGachaTreasuryDepositNft,
	gachaTreasuryAbi,
	erc721Abi,
} from "../../generated";
import { formatCurrency } from "../../lib/utils";
import { nftDepositMachine } from "../../machines/nftDepositMachine";

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
	const {
		writeContract: depositNFT,
		isSuccess: isDepositSuccess,
		isError: isDepositError,
		error: depositError,
	} = useWriteContract();

	// Get appraisal data from contract
	const { data: appraisalData } = useReadNftAppraisalGetAppraisal({
		address: contracts.appraisal,
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
	const appraisalValue =
		hasValidAppraisal && appraisalData ? appraisalData.priceUSD : BigInt(0);

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
			treasuryAddress: contracts.treasury,
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
	const handleApproval = useCallback(async () => {
		if (!contracts.treasury) return;

		try {
			approveNFT({
				address: collection as `0x${string}`,
				abi: erc721Abi,
				functionName: "approve",
				args: [contracts.treasury, BigInt(tokenId)],
			});
			// Transaction success/failure will be handled by useEffect
		} catch (error) {
			sendDepositEvent({
				type: "ERROR",
				error: error instanceof Error ? error.message : "Approval failed",
			});
		}
	}, [approveNFT, collection, tokenId, contracts.treasury, sendDepositEvent]);

	// Handle deposit step
	const handleDepositTransaction = useCallback(async () => {
		if (!contracts.treasury) return;

		try {
			depositNFT({
				address: contracts.treasury,
				abi: gachaTreasuryAbi,
				functionName: "depositNFT",
				args: [collection as `0x${string}`, BigInt(tokenId)],
			});
			// Transaction success/failure will be handled by useEffect
		} catch (error) {
			sendDepositEvent({
				type: "ERROR",
				error: error instanceof Error ? error.message : "Deposit failed",
			});
		}
	}, [depositNFT, collection, tokenId, contracts.treasury, sendDepositEvent]);

	// Handle approval transaction results
	useEffect(() => {
		if (isApprovalSuccess && depositState.matches("needsApproval")) {
			sendDepositEvent({
				type: "APPROVAL_CONFIRMED",
				txHash: "approval-confirmed",
			});
		}
	}, [isApprovalSuccess, depositState, sendDepositEvent]);

	useEffect(() => {
		if (isApprovalError && depositState.matches("needsApproval")) {
			sendDepositEvent({
				type: "ERROR",
				error: approvalError?.message || "Approval failed",
			});
		}
	}, [isApprovalError, approvalError, depositState, sendDepositEvent]);

	// Handle deposit transaction results
	useEffect(() => {
		if (
			isDepositSuccess &&
			(depositState.matches("depositing") ||
				depositState.matches("readyToDeposit"))
		) {
			sendDepositEvent({
				type: "DEPOSIT_CONFIRMED",
				txHash: "deposit-confirmed",
			});

			// Now remove NFT from list after successful deposit
			if (onAction) {
				onAction(collection, tokenId, true);
			}
		}
	}, [
		isDepositSuccess,
		depositState,
		sendDepositEvent,
		onAction,
		collection,
		tokenId,
	]);

	useEffect(() => {
		if (
			isDepositError &&
			(depositState.matches("depositing") ||
				depositState.matches("readyToDeposit"))
		) {
			sendDepositEvent({
				type: "ERROR",
				error: depositError?.message || "Deposit failed",
			});
		}
	}, [isDepositError, depositError, depositState, sendDepositEvent]);

	// Get current state info for UI
	const isDepositInProgress =
		!depositState.matches("idle") && !depositState.matches("completed");
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
				<GlassButton
					variant="secondary"
					size="md"
					className="w-full"
					startIcon="gem"
					onClick={() => onAction(collection, tokenId, hasValidAppraisal)}
					animate={true}
				>
					Get Appraised
				</GlassButton>
			) : (
				<div className="space-y-2">
					{/* Main action button based on state */}
					{currentDepositState === "idle" && (
						<GlassButton
							variant="primary"
							size="md"
							className="w-full"
							startIcon="gift"
							onClick={handleDeposit}
							animate={true}
						>
							Deposit to Gacha
						</GlassButton>
					)}

					{currentDepositState === "checkingApproval" && (
						<GlassButton
							variant="primary"
							size="md"
							className="w-full"
							isLoading={true}
							loadingText="Checking approval..."
							animate={true}
						>
							Checking...
						</GlassButton>
					)}

					{currentDepositState === "needsApproval" && (
						<GlassButton
							variant="secondary"
							size="md"
							className="w-full"
							startIcon="shield-check"
							onClick={handleApproval}
							animate={true}
						>
							Approve NFT
						</GlassButton>
					)}

					{currentDepositState === "readyToDeposit" && (
						<GlassButton
							variant="primary"
							size="md"
							className="w-full"
							startIcon="gift"
							onClick={handleDepositTransaction}
							animate={true}
						>
							Deposit to Treasury
						</GlassButton>
					)}

					{currentDepositState === "depositing" && (
						<GlassButton
							variant="primary"
							size="md"
							className="w-full"
							isLoading={true}
							loadingText="Depositing..."
							animate={true}
						>
							Depositing...
						</GlassButton>
					)}

					{currentDepositState === "needsDeposit" && (
						<GlassButton
							variant="secondary"
							size="md"
							className="w-full"
							startIcon="refresh"
							onClick={handleDepositTransaction}
							animate={true}
						>
							Retry Deposit
						</GlassButton>
					)}

					{currentDepositState === "completed" && (
						<GlassButton
							variant="primary"
							size="md"
							className="w-full"
							startIcon="check"
							isDisabled={true}
							animate={true}
						>
							Deposited Successfully
						</GlassButton>
					)}

					{currentDepositState === "error" && (
						<div className="space-y-2">
							<GlassButton
								variant="danger"
								size="md"
								className="w-full"
								startIcon="refresh"
								onClick={() => sendDepositEvent({ type: "RESET" })}
								animate={true}
							>
								Reset & Try Again
							</GlassButton>
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
				onClick={hasValidAppraisal ? undefined : handleNFTClick}
				size="md"
				variant="detailed"
				showAppraisal={true} // Use built-in appraisal display for consistency
				priority={hasValidAppraisal ? 8 : 5}
				animate={true}
				extraDetails={extraDetails}
				actionSlot={actionSlot}
				{...nftCardProps}
				appraisalContractAddress={contracts.appraisal || "0x0"}
			/>
		</motion.div>
	);
};
