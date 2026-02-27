"use client";

import { ShieldCheckIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import {
	useReadGachaTreasuryGetWhitelistedCollections,
	useWriteGachaTreasuryAddToWhitelist,
	useWriteGachaTreasuryRemoveFromWhitelist,
} from "@/generated";
import { logger } from "@/lib/logger";
import { Button, Card, Input } from "../../../ui";

export function WhitelistSection() {
	const [newCollectionAddress, setNewCollectionAddress] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const treasuryAddress = process.env
		.NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}`;
	const { data: whitelistedCollections, refetch: refetchWhitelist } =
		useReadGachaTreasuryGetWhitelistedCollections({
			address: treasuryAddress,
		} as Parameters<typeof useReadGachaTreasuryGetWhitelistedCollections>[0]);

	const { writeContract: addToWhitelist } =
		useWriteGachaTreasuryAddToWhitelist();
	const { writeContract: removeFromWhitelist } =
		useWriteGachaTreasuryRemoveFromWhitelist();

	const handleAddCollection = async () => {
		if (!newCollectionAddress || !newCollectionAddress.startsWith("0x")) return;

		setIsLoading(true);
		try {
			await addToWhitelist({
				address: treasuryAddress,
				args: [newCollectionAddress as `0x${string}`],
			});
			setNewCollectionAddress("");
			await refetchWhitelist();
		} catch (error) {
			logger.contracts.error("Error adding collection to whitelist:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemoveCollection = async (collectionAddress: string) => {
		setIsLoading(true);
		try {
			await removeFromWhitelist({
				address: treasuryAddress,
				args: [collectionAddress as `0x${string}`],
			});
			await refetchWhitelist();
		} catch (error) {
			logger.contracts.error("Error removing collection from whitelist:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="p-8 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-foreground mb-2">
					Collection Whitelist
				</h2>
				<p className="text-foreground/70">
					Manage approved NFT collections for deposits.
				</p>
			</div>

			{/* Add New Collection */}
			<div className="mb-8">
				<h3 className="text-lg font-semibold text-foreground mb-4">
					Add Collection to Whitelist
				</h3>
				<div className="flex gap-4">
					<Input
						type="text"
						value={newCollectionAddress}
						onChange={(e) => setNewCollectionAddress(e.target.value)}
						placeholder="0x..."
						wrapperClassName="flex-1"
					/>
					<Button
						color="glassPrimary"
						onPress={handleAddCollection}
						disabled={!newCollectionAddress || isLoading}
						isLoading={isLoading}
					>
						Add Collection
					</Button>
				</div>
			</div>

			{/* Whitelisted Collections */}
			<div>
				<h3 className="text-lg font-semibold text-foreground mb-4">
					Whitelisted Collections
				</h3>
				{whitelistedCollections &&
				Array.isArray(whitelistedCollections) &&
				whitelistedCollections.length > 0 ? (
					<div className="space-y-3">
						{whitelistedCollections.map((collection: `0x${string}`) => (
							<div
								key={collection}
								className="flex items-center justify-between p-4 bg-content1/10 border border-white/10 rounded-xl"
							>
								<div className="flex items-center gap-3">
									<ShieldCheckIcon className="w-5 h-5 text-success" />
									<div>
										<div className="font-mono text-sm text-foreground">
											{collection}
										</div>
										<div className="text-xs text-foreground/60">
											Approved Collection
										</div>
									</div>
								</div>
								<Button
									className="rounded-xl bg-danger/20 border border-danger/30 text-danger hover:bg-danger/30 px-4 py-2"
									onPress={() => handleRemoveCollection(collection)}
									disabled={isLoading}
								>
									<XCircleIcon className="w-4 h-4" />
								</Button>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<ShieldCheckIcon className="w-8 h-8 mx-auto mb-4 text-foreground/40" />
						<h3 className="text-lg font-medium text-foreground/60 mb-2">
							No Whitelisted Collections
						</h3>
						<p className="text-foreground/40">
							Add NFT collection addresses to approve them for deposits.
						</p>
					</div>
				)}
			</div>
		</Card>
	);
}
