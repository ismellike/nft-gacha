"use client";

import { useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
	useAccount,
	useWriteContract,
	usePublicClient,
	useWaitForTransactionReceipt,
} from "wagmi";
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
	useWriteGachaTreasuryDepositNft,
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
	const [depositState, sendDepositEvent] = useMachine(nftDepositMachine, {
		input: {
			onAction,
			onAppraisalStatusChange,
		},
	});

	// Contract write hooks
	const {
		writeContract: approveNFT,
		isSuccess: isApprovalSuccess,
		isError: isApprovalError,
		error: approvalError,
		data: approvalTxHash,
	} = useWriteContract();

	const {
		writeContract: depositNFT,
		isSuccess: isDepositSuccess,
		isError: isDepositError,
		error: depositError,
		data: depositTxHash,
	} = useWriteGachaTreasuryDepositNft();

	// Transaction receipt hooks
	const { data: approvalReceipt } = useWaitForTransactionReceipt({
		hash: approvalTxHash as `0x${string}`,
		query: {
			enabled: !!approvalTxHash,
		},
	});

	const { data: depositReceipt } = useWaitForTransactionReceipt({
		hash: depositTxHash as `0x${string}`,
		query: {
			enabled: !!depositTxHash,
		},
	});

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
			sendDepositEvent({
				type: "FAIL",
				error:
					"Wallet not connected or network unavailable. Please check your connection and try again.",
			});
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
			onAction,
			onAppraisalStatusChange,
		});
	}, [
		userAddress,
		publicClient,
		contracts.treasury,
		collection,
		tokenId,
		sendDepositEvent,
		onAction,
		onAppraisalStatusChange,
	]);

	// Handle approval step using setApprovalForAll
	const handleApproval = useCallback(() => {
		if (!contracts.treasury) return;

		try {
			approveNFT({
				address: collection as `0x${string}`,
				abi: erc721Abi,
				functionName: "setApprovalForAll",
				args: [contracts.treasury as `0x${string}`, true],
			});
		} catch (error) {
			sendDepositEvent({
				type: "FAIL",
				error:
					error instanceof Error
						? `Approval failed: ${error.message}`
						: "Failed to initiate NFT approval. Please check your wallet and try again.",
			});
		}
	}, [approveNFT, collection, contracts.treasury, sendDepositEvent]);

	// Handle deposit step
	const handleDepositNFT = useCallback(() => {
		if (!contracts.treasury) return;

		try {
			depositNFT({
				address: contracts.treasury as `0x${string}`,
				args: [collection as `0x${string}`, BigInt(tokenId)],
			});
		} catch (error) {
			sendDepositEvent({
				type: "FAIL",
				error:
					error instanceof Error
						? `Deposit failed: ${error.message}`
						: "Failed to initiate NFT deposit. Please check your wallet and try again.",
			});
		}
	}, [depositNFT, collection, tokenId, contracts.treasury, sendDepositEvent]);

	// Handle approval transaction success - dispatch APPROVAL_REQUESTED with tx hash
	useEffect(() => {
		if (
			isApprovalSuccess &&
			approvalTxHash &&
			depositState.matches("awaitingApprovalSignature")
		) {
			sendDepositEvent({
				type: "APPROVAL_REQUESTED",
			});
		}
	}, [isApprovalSuccess, approvalTxHash, depositState, sendDepositEvent]);

	// Handle approval transaction error
	useEffect(() => {
		if (
			isApprovalError &&
			approvalError &&
			depositState.matches("awaitingApprovalSignature")
		) {
			sendDepositEvent({
				type: "FAIL",
				error: approvalError?.message
					? `Approval transaction failed: ${approvalError.message}`
					: "Approval transaction failed. Please check your wallet and try again.",
			});
		}
	}, [isApprovalError, approvalError, depositState, sendDepositEvent]);

	// Handle approval transaction receipt confirmation - dispatch APPROVAL_CONFIRMED
	useEffect(() => {
		if (approvalReceipt && depositState.matches("awaitingApprovalReceipt")) {
			sendDepositEvent({
				type: "APPROVAL_CONFIRMED",
				txHash: approvalReceipt.transactionHash,
			});
		}
	}, [approvalReceipt, depositState, sendDepositEvent]);

	// Handle deposit transaction success - dispatch DEPOSIT_REQUESTED
	useEffect(() => {
		if (
			isDepositSuccess &&
			depositTxHash &&
			depositState.matches("awaitingDepositSignature")
		) {
			sendDepositEvent({
				type: "DEPOSIT_REQUESTED",
			});
		}
	}, [isDepositSuccess, depositTxHash, depositState, sendDepositEvent]);

	// Handle deposit transaction error
	useEffect(() => {
		if (
			isDepositError &&
			depositError &&
			depositState.matches("awaitingDepositSignature")
		) {
			sendDepositEvent({
				type: "FAIL",
				error: depositError?.message
					? `Deposit transaction failed: ${depositError.message}`
					: "Deposit transaction failed. Please check your wallet and try again.",
			});
		}
	}, [isDepositError, depositError, depositState, sendDepositEvent]);

	// Handle deposit transaction receipt confirmation - dispatch DEPOSIT_CONFIRMED
	useEffect(() => {
		if (depositReceipt && depositState.matches("awaitingDepositReceipt")) {
			sendDepositEvent({
				type: "DEPOSIT_CONFIRMED",
				txHash: depositReceipt.transactionHash,
			});
		}
	}, [depositReceipt, depositState, sendDepositEvent]);

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
					color="glassPrimary"
					className="w-full"
					onPress={() => onAction(collection, tokenId, hasValidAppraisal)}
					startContent={<SparklesIcon className="w-4 h-4" />}
				>
					Get Appraised
				</Button>
			) : (
				<div className="space-y-2">
					{/* Main action button based on state */}
					{currentDepositState === "idle" && (
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

					{currentDepositState === "checkingApproval" && (
						<Button color="glassPrimary" className="w-full" isLoading>
							Checking approval...
						</Button>
					)}

					{currentDepositState === "awaitingApprovalSignature" && (
						<Button
							className="w-full rounded-xl bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"
							onPress={handleApproval}
							isLoading={false}
						>
							<span className="flex items-center justify-center gap-2">
								<ShieldCheckIcon className="w-4 h-4" /> Approve NFT
							</span>
						</Button>
					)}

					{currentDepositState === "awaitingApprovalReceipt" && (
						<Button
							className="w-full rounded-xl bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"
							isLoading
						>
							<span className="flex items-center justify-center gap-2">
								<ArrowPathIcon className="w-4 h-4" /> Waiting for approval...
							</span>
						</Button>
					)}

					{currentDepositState === "awaitingDepositSignature" && (
						<Button
							className="w-full rounded-xl bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"
							onPress={handleDepositNFT}
							isLoading={false}
						>
							<span className="flex items-center justify-center gap-2">
								<GiftIcon className="w-4 h-4" /> Deposit NFT
							</span>
						</Button>
					)}

					{currentDepositState === "awaitingDepositReceipt" && (
						<Button
							className="w-full rounded-xl bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"
							isLoading
						>
							<span className="flex items-center justify-center gap-2">
								<ArrowPathIcon className="w-4 h-4" /> Processing deposit...
							</span>
						</Button>
					)}

					{currentDepositState === "confirmingDeposit" && (
						<Button color="glassPrimary" className="w-full" isLoading>
							<span className="flex items-center justify-center gap-2">
								<ArrowPathIcon className="w-4 h-4" /> Confirming deposit...
							</span>
						</Button>
					)}

					{currentDepositState === "completed" && (
						<Button color="glassPrimary" className="w-full" isDisabled>
							<span className="flex items-center justify-center gap-2">
								<CheckIcon className="w-4 h-4" /> Deposited Successfully
							</span>
						</Button>
					)}

					{depositStateError && (
						<div className="space-y-2">
							<Button
								className="w-full rounded-xl bg-danger/20 border border-danger/30 text-danger hover:bg-danger/30"
								onPress={() => sendDepositEvent({ type: "RESET" })}
							>
								<span className="flex items-center justify-center gap-2">
									<ArrowPathIcon className="w-4 h-4" /> Try Again
								</span>
							</Button>
							<p className="text-xs text-danger text-center">
								{depositStateError}
							</p>
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
				appraisalContractAddress={
					(contracts.appraisal as `0x${string}`) ||
					"0x0000000000000000000000000000000000000000"
				}
			/>
		</motion.div>
	);
};
