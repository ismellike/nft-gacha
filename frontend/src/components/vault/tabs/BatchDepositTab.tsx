"use client";

import {
	ArrowUpTrayIcon,
	CheckIcon,
	CubeTransparentIcon,
	SparklesIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	useAccount,
	usePublicClient,
	useWaitForTransactionReceipt,
} from "wagmi";
import {
	erc721Abi,
	useWriteErc721SetApprovalForAll,
	useWriteGachaTreasuryBatchDepositNft,
} from "../../../generated";
import { cn } from "../../../lib/theme-config";
import { toastError, toastSuccess } from "../../../lib/toast";
import type { UserOwnedNFTMultiCollection } from "../../../types/hooks";
import { Button, Card } from "../../../ui";
import { NFTCard } from "../../nft";
import { EmptyDepositState } from "../empty-states/EmptyDepositState";

interface AppraisalInfo {
	hasAppraisal: boolean;
	priceUSD: bigint;
}

interface BatchDepositTabProps {
	treasuryAddress: `0x${string}` | undefined;
	sortedUserOwnedNFTs: UserOwnedNFTMultiCollection[];
	appraisedNFTs: Set<string>;
	appraisalData: Map<string, AppraisalInfo>;
	appraisal: string | undefined;
	onDepositComplete: () => void;
}

type BatchDepositStatus =
	| "idle"
	| "approving"
	| "depositing"
	| "confirming"
	| "done";

const createNFTKey = (collection: string, tokenId: string | bigint): string =>
	`${collection.toLowerCase()}:${tokenId.toString()}`;

// Individual selectable NFT card in the batch grid
interface SelectableNFTCardProps {
	nft: UserOwnedNFTMultiCollection;
	isSelected: boolean;
	isAppraised: boolean;
	appraisalValue: bigint | undefined;
	appraisalContractAddress: `0x${string}` | undefined;
	onToggle: (key: string) => void;
}

function SelectableNFTCard({
	nft,
	isSelected,
	isAppraised,
	appraisalValue,
	appraisalContractAddress,
	onToggle,
}: SelectableNFTCardProps) {
	const nftKey = createNFTKey(nft.collection, nft.tokenId);

	return (
		<motion.div
			className={cn(
				"relative rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden",
				isSelected
					? "border-warning/60 shadow-[0_0_12px_rgba(255,191,0,0.2)] bg-content1/30"
					: isAppraised
						? "border-white/10 hover:border-white/20 bg-content1/20 hover:bg-content1/25"
						: "border-white/5 opacity-60 cursor-default bg-content1/10",
			)}
			whileHover={isAppraised ? { scale: 1.01 } : {}}
			whileTap={isAppraised ? { scale: 0.99 } : {}}
			transition={{ type: "spring", stiffness: 400, damping: 17 }}
			onClick={() => {
				if (isAppraised) onToggle(nftKey);
			}}
			role={isAppraised ? "checkbox" : "presentation"}
			aria-checked={isAppraised ? isSelected : undefined}
			aria-label={
				isAppraised
					? `${isSelected ? "Deselect" : "Select"} NFT ${nft.tokenId.toString()}`
					: `NFT ${nft.tokenId.toString()} needs appraisal`
			}
		>
			{/* Selection indicator */}
			{isAppraised && (
				<div
					className={cn(
						"absolute top-2 right-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
						isSelected
							? "bg-warning border-warning"
							: "bg-content1/40 border-white/30",
					)}
				>
					{isSelected && (
						<CheckIcon className="w-3.5 h-3.5 text-black font-bold" />
					)}
				</div>
			)}

			{/* Not appraised badge */}
			{!isAppraised && (
				<div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-content1/60 border border-white/10 text-xs text-foreground/50">
					<SparklesIcon className="w-3 h-3" />
					Needs appraisal
				</div>
			)}

			<div className="p-2">
				<NFTCard
					data={{
						collection: nft.collection,
						tokenId: nft.tokenId.toString(),
						appraisalOverride:
							isAppraised && appraisalValue
								? { hasAppraisal: true, priceUSD: appraisalValue }
								: undefined,
					}}
					size="sm"
					{...(appraisalContractAddress ? { appraisalContractAddress } : {})}
				/>
			</div>
		</motion.div>
	);
}

export function BatchDepositTab({
	treasuryAddress,
	sortedUserOwnedNFTs,
	appraisedNFTs,
	appraisalData,
	appraisal,
	onDepositComplete,
}: BatchDepositTabProps) {
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();

	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
	const [depositStatus, setDepositStatus] =
		useState<BatchDepositStatus>("idle");
	const [statusMessage, setStatusMessage] = useState<string>("");
	// Ref to track selected count at deposit time (avoids stale closures in effect)
	const depositedCountRef = useRef<number>(0);

	const { writeContractAsync: approveForAll } =
		useWriteErc721SetApprovalForAll();
	const { writeContractAsync: batchDeposit, data: batchDepositTxHash } =
		useWriteGachaTreasuryBatchDepositNft();

	const { data: batchReceipt } = useWaitForTransactionReceipt({
		hash: batchDepositTxHash,
	});

	// Only appraised NFTs can be deposited
	const appraisedOwnedNFTs = useMemo(
		() =>
			sortedUserOwnedNFTs.filter((nft) =>
				appraisedNFTs.has(createNFTKey(nft.collection, nft.tokenId)),
			),
		[sortedUserOwnedNFTs, appraisedNFTs],
	);

	const selectedNFTs = useMemo(
		() =>
			sortedUserOwnedNFTs.filter((nft) =>
				selectedKeys.has(createNFTKey(nft.collection, nft.tokenId)),
			),
		[sortedUserOwnedNFTs, selectedKeys],
	);

	// Estimate gas savings: batch vs N individual txns
	// Individual deposit: ~2 txns per NFT (approve + deposit), batch: 1 txn per collection + 1 batch deposit
	const gasInfo = useMemo(() => {
		const count = selectedKeys.size;
		if (count < 2) return null;

		// Unique collections needing approval checks
		const uniqueCollections = new Set(
			selectedNFTs.map((nft) => nft.collection.toLowerCase()),
		);

		// Individual: count separate deposit txns (after per-collection approvals)
		const individualTxns = uniqueCollections.size + count;
		// Batch: uniqueCollections approval txns + 1 batch deposit
		const batchTxns = uniqueCollections.size + 1;
		const savedTxns = individualTxns - batchTxns;

		return {
			count,
			uniqueCollections: uniqueCollections.size,
			savedTxns,
		};
	}, [selectedKeys.size, selectedNFTs]);

	const toggleNFT = useCallback(
		(key: string) => {
			setSelectedKeys((prev) => {
				const next = new Set(prev);
				if (next.has(key)) {
					next.delete(key);
				} else {
					next.add(key);
				}
				return next;
			});
		},
		[setSelectedKeys],
	);

	const selectAll = useCallback(() => {
		setSelectedKeys(
			new Set(
				appraisedOwnedNFTs.map((nft) =>
					createNFTKey(nft.collection, nft.tokenId),
				),
			),
		);
	}, [appraisedOwnedNFTs]);

	const clearSelection = () => {
		setSelectedKeys(new Set());
	};

	const handleBatchDeposit = useCallback(async () => {
		if (!treasuryAddress || !userAddress || !publicClient) {
			toastError("Wallet not connected or treasury unavailable");
			return;
		}
		if (selectedNFTs.length === 0) {
			toastError("No NFTs selected for batch deposit");
			return;
		}

		setDepositStatus("approving");

		try {
			// Group selected NFTs by collection for batch approval
			const collectionMap = new Map<string, bigint[]>();
			for (const nft of selectedNFTs) {
				const col = nft.collection.toLowerCase();
				const existing = collectionMap.get(col) ?? [];
				existing.push(nft.tokenId);
				collectionMap.set(col, existing);
			}

			// Approve each collection if not already approved
			for (const collection of collectionMap.keys()) {
				setStatusMessage(`Checking approval for ${collection.slice(0, 6)}...`);

				const alreadyApproved = await publicClient.readContract({
					address: collection as `0x${string}`,
					abi: erc721Abi,
					functionName: "isApprovedForAll",
					args: [userAddress as `0x${string}`, treasuryAddress],
				});

				if (!alreadyApproved) {
					setStatusMessage(`Approving ${collection.slice(0, 6)}...`);
					await approveForAll({
						address: collection as `0x${string}`,
						args: [treasuryAddress, true],
					});
				}
			}

			// Execute batch deposit
			setDepositStatus("depositing");
			setStatusMessage(
				`Depositing ${selectedNFTs.length} NFT${selectedNFTs.length !== 1 ? "s" : ""}...`,
			);

			const collections = selectedNFTs.map(
				(nft) => nft.collection as `0x${string}`,
			);
			const tokenIds = selectedNFTs.map((nft) => nft.tokenId);

			// Store count before state changes
			depositedCountRef.current = selectedNFTs.length;

			const txHash = await batchDeposit({
				address: treasuryAddress,
				args: [collections, tokenIds],
			});

			if (txHash) {
				setDepositStatus("confirming");
				setStatusMessage("Confirming transaction...");
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Batch deposit failed";
			toastError(
				message.includes("User rejected") ? "Transaction rejected" : message,
			);
			setDepositStatus("idle");
			setStatusMessage("");
		}
	}, [
		treasuryAddress,
		userAddress,
		publicClient,
		selectedNFTs,
		approveForAll,
		batchDeposit,
	]);

	// Watch for receipt using useEffect + ref pattern for count
	useEffect(() => {
		if (!batchReceipt) return;
		if (depositStatus !== "confirming") return;

		if (batchReceipt.status === "success") {
			const count = depositedCountRef.current;
			setDepositStatus("done");
			setStatusMessage("");
			toastSuccess(
				`Successfully deposited ${count} NFT${count !== 1 ? "s" : ""}!`,
			);
			setSelectedKeys(new Set());
			onDepositComplete();
		} else if (batchReceipt.status === "reverted") {
			setDepositStatus("idle");
			setStatusMessage("");
			toastError("Batch deposit transaction reverted. Please try again.");
		}
	}, [batchReceipt, depositStatus, onDepositComplete]);

	const isProcessing = depositStatus !== "idle" && depositStatus !== "done";

	if (sortedUserOwnedNFTs.length === 0) {
		return (
			<section
				id="batch-deposit-panel"
				role="tabpanel"
				aria-labelledby="batch-deposit-tab"
			>
				<EmptyDepositState />
			</section>
		);
	}

	return (
		<section
			id="batch-deposit-panel"
			role="tabpanel"
			aria-labelledby="batch-deposit-tab"
			className="space-y-6 sm:space-y-8"
		>
			{/* Header */}
			<header className="space-y-3">
				<h2 className="text-xl sm:text-2xl font-semibold text-foreground">
					Batch Deposit NFTs
				</h2>
				<p className="text-sm sm:text-base text-foreground/60">
					Select multiple appraised NFTs to deposit in a single transaction and
					save on gas fees.
				</p>
			</header>

			{/* Gas savings banner */}
			{gasInfo && (
				<motion.div
					initial={{ opacity: 0, y: -8 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -8 }}
					className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm"
				>
					<CubeTransparentIcon className="w-5 h-5 text-success flex-shrink-0" />
					<span className="text-foreground/80">
						Batching{" "}
						<strong className="text-foreground">{gasInfo.count} NFTs</strong>{" "}
						across{" "}
						<strong className="text-foreground">
							{gasInfo.uniqueCollections} collection
							{gasInfo.uniqueCollections !== 1 ? "s" : ""}
						</strong>{" "}
						saves you{" "}
						<strong className="text-success">
							~{gasInfo.savedTxns} transaction
							{gasInfo.savedTxns !== 1 ? "s" : ""}
						</strong>{" "}
						vs depositing individually.
					</span>
				</motion.div>
			)}

			{/* Selection controls */}
			<div className="flex flex-wrap items-center gap-3">
				<Button
					color="glass"
					size="sm"
					onPress={selectAll}
					disabled={isProcessing || appraisedOwnedNFTs.length === 0}
					className="text-xs"
				>
					Select All Appraised ({appraisedOwnedNFTs.length})
				</Button>
				{selectedKeys.size > 0 && (
					<Button
						color="ghost"
						size="sm"
						onPress={clearSelection}
						disabled={isProcessing}
						startContent={<XMarkIcon className="w-3.5 h-3.5" />}
						className="text-xs"
					>
						Clear Selection
					</Button>
				)}
				{selectedKeys.size > 0 && (
					<span className="text-sm text-foreground/60 ml-auto">
						{selectedKeys.size} selected
					</span>
				)}
			</div>

			{/* NFT Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
				{sortedUserOwnedNFTs.map((nft) => {
					const nftKey = createNFTKey(nft.collection, nft.tokenId);
					const isAppraised = appraisedNFTs.has(nftKey);
					const appraisalInfo = appraisalData.get(nftKey);
					return (
						<SelectableNFTCard
							key={nftKey}
							nft={nft}
							isSelected={selectedKeys.has(nftKey)}
							isAppraised={isAppraised}
							appraisalValue={appraisalInfo?.priceUSD}
							appraisalContractAddress={appraisal as `0x${string}` | undefined}
							onToggle={toggleNFT}
						/>
					);
				})}
			</div>

			{/* Batch deposit action area */}
			{selectedKeys.size > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					className="sticky bottom-4"
				>
					<Card className="p-4 border border-white/20 bg-content1/40 backdrop-blur-2xl shadow-2xl">
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
							<div className="flex-1 min-w-0">
								<p className="font-medium text-foreground">
									{selectedKeys.size} NFT
									{selectedKeys.size !== 1 ? "s" : ""} selected for batch
									deposit
								</p>
								{isProcessing && statusMessage && (
									<p className="text-sm text-foreground/60 mt-0.5">
										{statusMessage}
									</p>
								)}
								{!isProcessing && gasInfo && (
									<p className="text-sm text-success mt-0.5">
										Saves ~{gasInfo.savedTxns} transaction
										{gasInfo.savedTxns !== 1 ? "s" : ""} vs individual deposits
									</p>
								)}
							</div>

							<Button
								color="glassPrimary"
								className="w-full sm:w-auto min-h-[44px] px-6 flex-shrink-0"
								onPress={handleBatchDeposit}
								disabled={isProcessing || selectedKeys.size === 0}
								isLoading={isProcessing}
								startContent={
									!isProcessing ? (
										<ArrowUpTrayIcon className="w-4 h-4" />
									) : undefined
								}
								aria-label={`Batch deposit ${selectedKeys.size} NFTs`}
							>
								{isProcessing
									? depositStatus === "approving"
										? "Approving Collections..."
										: depositStatus === "depositing"
											? "Depositing..."
											: "Confirming..."
									: `Deposit ${selectedKeys.size} NFT${selectedKeys.size !== 1 ? "s" : ""}`}
							</Button>
						</div>
					</Card>
				</motion.div>
			)}

			{/* Unappraisable NFTs notice */}
			{sortedUserOwnedNFTs.length > appraisedOwnedNFTs.length && (
				<p className="text-xs text-foreground/40 text-center">
					{sortedUserOwnedNFTs.length - appraisedOwnedNFTs.length} NFT
					{sortedUserOwnedNFTs.length - appraisedOwnedNFTs.length !== 1
						? "s"
						: ""}{" "}
					require appraisal before depositing. Use the Deposit tab to get them
					appraised.
				</p>
			)}
		</section>
	);
}
