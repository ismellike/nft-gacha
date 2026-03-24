"use client";

import { SparklesIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { type Address, parseAbi } from "viem";
import {
	useAccount,
	useWaitForTransactionReceipt,
	useWriteContract,
} from "wagmi";
import { env } from "../../lib/env";
import { Button, Card } from "../../ui";

const pfpAbi = parseAbi(["function mint() external returns (uint256)"]);

/**
 * Mint button for the GachaPFP collection.
 * Only renders when NEXT_PUBLIC_PFP_COLLECTION_ADDRESS is configured.
 */
export function PfpMintButton({
	onMinted,
}: {
	onMinted?: (collection: string, tokenId: string) => void;
}) {
	const collectionAddress = env.NEXT_PUBLIC_PFP_COLLECTION_ADDRESS;
	const { isConnected } = useAccount();
	const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);

	const {
		writeContract,
		data: txHash,
		isPending: isSigning,
		reset,
	} = useWriteContract();

	const { isLoading: isConfirming, isSuccess } =
		useWaitForTransactionReceipt({
			hash: txHash,
			query: {
				enabled: !!txHash,
			},
		});

	// Extract tokenId from transaction logs on success
	useWaitForTransactionReceipt({
		hash: txHash,
		query: {
			enabled: !!txHash,
			select(receipt) {
				// The Transfer event topic0 for ERC721
				const transferTopic =
					"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
				const transferLog = receipt.logs.find(
					(log) => log.topics[0] === transferTopic,
				);
				if (transferLog?.topics[3]) {
					const tokenId = BigInt(transferLog.topics[3]).toString();
					setMintedTokenId(tokenId);
					if (collectionAddress) {
						onMinted?.(collectionAddress, tokenId);
					}
				}
				return receipt;
			},
		},
	});

	if (!collectionAddress) return null;

	const handleMint = () => {
		setMintedTokenId(null);
		writeContract({
			address: collectionAddress as Address,
			abi: pfpAbi,
			functionName: "mint",
		});
	};

	const handleMintAnother = () => {
		reset();
		setMintedTokenId(null);
	};

	const isLoading = isSigning || isConfirming;

	return (
		<Card className="p-4 bg-secondary/5 border border-secondary/20 rounded-2xl">
			<div className="flex items-center gap-3">
				<div className="flex-shrink-0 w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
					<SparklesIcon className="w-5 h-5 text-secondary" />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium text-foreground">
						Gacha PFP
					</p>
					<p className="text-xs text-foreground/60">
						{isSuccess && mintedTokenId
							? `Minted #${mintedTokenId} — select it below to appraise`
							: "Mint a free PFP NFT with random rarity"}
					</p>
				</div>
				<div className="flex-shrink-0">
					{isSuccess && mintedTokenId ? (
						<Button
							color="glass"
							size="sm"
							onPress={handleMintAnother}
						>
							Mint Another
						</Button>
					) : (
						<Button
							color="glassPrimary"
							size="sm"
							isDisabled={!isConnected}
							isLoading={isLoading}
							onPress={handleMint}
						>
							{isSigning
								? "Confirm..."
								: isConfirming
									? "Minting..."
									: "Mint PFP"}
						</Button>
					)}
				</div>
			</div>
		</Card>
	);
}
