"use client";

import {
	ArrowPathIcon,
	PlusIcon,
	ShieldCheckIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useReadContract, useWaitForTransactionReceipt } from "wagmi";
import {
	erc721Abi,
	useReadGachaTreasuryGetWhitelistedCollections,
	useWriteGachaTreasuryAddToWhitelist,
	useWriteGachaTreasuryRemoveFromWhitelist,
} from "@/generated";
import { formatAddress } from "@/lib/utils";
import { toastError, toastSuccess } from "@/lib/toast";
import { Button, Card, Input } from "@/ui";

interface CollectionWhitelistManagerProps {
	treasuryAddress: `0x${string}`;
}

// Renders name + symbol by reading on-chain from the collection contract
interface CollectionMetadataProps {
	address: `0x${string}`;
}

function CollectionMetadata({ address }: CollectionMetadataProps) {
	const { data: name } = useReadContract({
		address,
		abi: erc721Abi,
		functionName: "name",
	});

	const { data: symbol } = useReadContract({
		address,
		abi: erc721Abi,
		functionName: "symbol",
	});

	if (!name && !symbol) {
		return (
			<span className="text-foreground/40 text-xs italic">
				Loading metadata...
			</span>
		);
	}

	return (
		<span className="text-foreground/70 text-sm">
			{name ?? "Unknown"}
			{symbol ? (
				<span className="ml-1 text-foreground/50 text-xs">({symbol})</span>
			) : null}
		</span>
	);
}

interface CollectionRowProps {
	collection: `0x${string}`;
	isRemoving: boolean;
	onRemove: (address: `0x${string}`) => void;
}

function CollectionRow({
	collection,
	isRemoving,
	onRemove,
}: CollectionRowProps) {
	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: -8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
			className="flex items-center justify-between gap-4 p-4 bg-content1/10 border border-white/10 rounded-xl"
		>
			<div className="flex items-center gap-3 min-w-0">
				<div className="flex-shrink-0 p-1.5 rounded-lg bg-success/10">
					<ShieldCheckIcon className="w-4 h-4 text-success" />
				</div>
				<div className="min-w-0">
					<CollectionMetadata address={collection} />
					<p className="font-mono text-xs text-foreground/50 mt-0.5 truncate">
						{collection}
					</p>
				</div>
			</div>

			<Button
				color="danger"
				size="sm"
				className="flex-shrink-0 rounded-xl bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 px-3 py-2"
				onPress={() => onRemove(collection)}
				disabled={isRemoving}
				isLoading={isRemoving}
				aria-label={`Remove ${formatAddress(collection)} from whitelist`}
				startContent={
					!isRemoving ? <TrashIcon className="w-3.5 h-3.5" /> : undefined
				}
			>
				Remove
			</Button>
		</motion.div>
	);
}

export function CollectionWhitelistManager({
	treasuryAddress,
}: CollectionWhitelistManagerProps) {
	const [newCollectionAddress, setNewCollectionAddress] = useState("");
	const [addError, setAddError] = useState<string | undefined>(undefined);
	const [removingCollection, setRemovingCollection] = useState<
		`0x${string}` | null
	>(null);

	const {
		data: whitelistedCollections,
		refetch: refetchWhitelist,
		isLoading: isLoadingWhitelist,
	} = useReadGachaTreasuryGetWhitelistedCollections({
		address: treasuryAddress,
	} as Parameters<typeof useReadGachaTreasuryGetWhitelistedCollections>[0]);

	const {
		writeContractAsync: addToWhitelist,
		data: addTxHash,
		isPending: isAddPending,
	} = useWriteGachaTreasuryAddToWhitelist();

	const {
		writeContractAsync: removeFromWhitelist,
		data: removeTxHash,
		isPending: isRemovePending,
	} = useWriteGachaTreasuryRemoveFromWhitelist();

	const { data: addReceipt } = useWaitForTransactionReceipt({ hash: addTxHash });
	const { data: removeReceipt } = useWaitForTransactionReceipt({
		hash: removeTxHash,
	});

	// Handle add receipt
	useEffect(() => {
		if (!addReceipt) return;
		if (addReceipt.status === "success") {
			toastSuccess("Collection added to whitelist");
			setNewCollectionAddress("");
			setAddError(undefined);
			refetchWhitelist();
		} else if (addReceipt.status === "reverted") {
			toastError("Add to whitelist transaction reverted");
		}
	}, [addReceipt, refetchWhitelist]);

	// Handle remove receipt
	useEffect(() => {
		if (!removeReceipt) return;
		if (removeReceipt.status === "success") {
			toastSuccess("Collection removed from whitelist");
			setRemovingCollection(null);
			refetchWhitelist();
		} else if (removeReceipt.status === "reverted") {
			toastError("Remove from whitelist transaction reverted");
			setRemovingCollection(null);
		}
	}, [removeReceipt, refetchWhitelist]);

	const validateAddress = useCallback((value: string): string | undefined => {
		if (!value) return undefined;
		if (!value.startsWith("0x")) return "Address must start with 0x";
		if (value.length !== 42) return "Address must be 42 characters long";
		return undefined;
	}, []);

	const handleAddressChange = useCallback(
		(value: string) => {
			setNewCollectionAddress(value);
			setAddError(validateAddress(value));
		},
		[validateAddress],
	);

	const handleAddCollection = useCallback(async () => {
		const error = validateAddress(newCollectionAddress);
		if (error) {
			setAddError(error);
			return;
		}
		if (!newCollectionAddress) return;

		try {
			await addToWhitelist({
				address: treasuryAddress,
				args: [newCollectionAddress as `0x${string}`],
			});
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to add collection";
			toastError(
				message.includes("User rejected") ? "Transaction rejected" : message,
			);
		}
	}, [newCollectionAddress, addToWhitelist, treasuryAddress, validateAddress]);

	const handleRemoveCollection = useCallback(
		async (collectionAddress: `0x${string}`) => {
			setRemovingCollection(collectionAddress);
			try {
				await removeFromWhitelist({
					address: treasuryAddress,
					args: [collectionAddress],
				});
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Failed to remove collection";
				toastError(
					message.includes("User rejected") ? "Transaction rejected" : message,
				);
				setRemovingCollection(null);
			}
		},
		[removeFromWhitelist, treasuryAddress],
	);

	const collections =
		(whitelistedCollections as `0x${string}`[] | undefined) ?? [];

	return (
		<Card className="p-6 sm:p-8 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
			{/* Header */}
			<div className="flex items-start justify-between gap-4 mb-8">
				<div>
					<h2 className="text-2xl font-bold text-foreground mb-1">
						Collection Whitelist
					</h2>
					<p className="text-foreground/70 text-sm">
						Manage which NFT collections are approved for treasury deposits.
					</p>
				</div>

				{/* Collection count badge */}
				<div className="flex-shrink-0 px-3 py-1.5 rounded-full bg-content1/30 border border-white/10 text-sm text-foreground/60">
					{isLoadingWhitelist ? (
						<ArrowPathIcon className="w-4 h-4 animate-spin inline" />
					) : (
						<>
							{collections.length} collection
							{collections.length !== 1 ? "s" : ""}
						</>
					)}
				</div>
			</div>

			{/* Add new collection form */}
			<section className="mb-8">
				<h3 className="text-base font-semibold text-foreground mb-3">
					Add Collection
				</h3>
				<div className="flex flex-col sm:flex-row gap-3">
					<Input
						type="text"
						value={newCollectionAddress}
						onChange={(e) => handleAddressChange(e.target.value)}
						placeholder="Collection contract address (0x...)"
						wrapperClassName="flex-1"
						errorMessage={addError}
						disabled={isAddPending}
						aria-label="Collection contract address to whitelist"
					/>
					<Button
						color="glassPrimary"
						onPress={handleAddCollection}
						disabled={!newCollectionAddress || !!addError || isAddPending}
						isLoading={isAddPending}
						startContent={
							!isAddPending ? <PlusIcon className="w-4 h-4" /> : undefined
						}
						className="flex-shrink-0 min-h-[44px] px-5"
						aria-label="Add collection to whitelist"
					>
						Add Collection
					</Button>
				</div>
				<p className="text-xs text-foreground/40 mt-2">
					The address must be a valid ERC-721 contract deployed on the current
					network.
				</p>
			</section>

			{/* Whitelisted collections list */}
			<section>
				<h3 className="text-base font-semibold text-foreground mb-3">
					Whitelisted Collections
				</h3>

				{isLoadingWhitelist ? (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-16 rounded-xl bg-content1/10 border border-white/5 animate-pulse"
							/>
						))}
					</div>
				) : collections.length > 0 ? (
					<AnimatePresence mode="popLayout">
						<div className="space-y-3">
							{collections.map((collection) => (
								<CollectionRow
									key={collection}
									collection={collection}
									isRemoving={
										removingCollection === collection && isRemovePending
									}
									onRemove={handleRemoveCollection}
								/>
							))}
						</div>
					</AnimatePresence>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-center py-12 rounded-xl border border-dashed border-white/10"
					>
						<ShieldCheckIcon className="w-8 h-8 mx-auto mb-3 text-foreground/30" />
						<p className="font-medium text-foreground/50">
							No collections whitelisted
						</p>
						<p className="text-sm text-foreground/30 mt-1">
							Add NFT collection addresses above to approve them for deposits.
						</p>
					</motion.div>
				)}
			</section>
		</Card>
	);
}
