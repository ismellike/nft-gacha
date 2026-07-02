"use client";

import { SparklesIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	type Address,
	BaseError,
	ContractFunctionRevertedError,
	formatEther,
	parseAbi,
} from "viem";
import {
	useAccount,
	useReadContract,
	useWaitForTransactionReceipt,
	useWatchContractEvent,
	useWriteContract,
} from "wagmi";
import { env } from "../../lib/env";
import { buildRarityConfig, getRarityConfig } from "../../lib/rarityConfig";
import { Button, Card, Chip } from "../../ui";

const pfpAbi = parseAbi([
	"function mint() external payable returns (uint256)",
	"function mintPrice() external view returns (uint256)",
	"function rarityRevealed(uint256 tokenId) external view returns (bool)",
	"function tokenRarity(uint256 tokenId) external view returns (uint8)",
	"function requestReveal(uint256 tokenId) external",
	"event RarityRequested(uint256 indexed tokenId, address indexed to)",
	"event RarityRevealed(uint256 indexed tokenId, uint8 rarity)",
	"error RevealRequestCooldown()",
	"error RarityAlreadyRevealed()",
]);

// GachaPFP is a 6-tier collection (adds a Mythic tier on top of the default
// 5-tier set used elsewhere), so we derive its own config from the shared
// palette rather than reusing DEFAULT_RARITY_CONFIG or hardcoding colors.
const PFP_RARITY_NAMES = [
	"Common",
	"Uncommon",
	"Rare",
	"Epic",
	"Legendary",
	"Mythic",
];
const PFP_RARITY_PERCENTAGES = [40, 25, 18, 10, 5, 2];
const PFP_RARITY_CONFIG = buildRarityConfig(
	PFP_RARITY_NAMES,
	PFP_RARITY_PERCENTAGES,
);

// How long to wait after mint before offering a "re-request reveal" fallback.
// Kept comfortably above the contract's 5-minute on-chain cooldown window so
// re-requesting is actually likely to succeed once the button appears... but
// still short enough to reassure the user something is happening.
const REVEAL_FALLBACK_DELAY_MS = 90_000;

/**
 * Mint button for the GachaPFP collection.
 * Only renders when NEXT_PUBLIC_PFP_COLLECTION_ADDRESS is configured.
 *
 * Rarity is no longer assigned synchronously at mint. The contract mints the
 * token immediately in an "unrevealed" state and emits a randomness request;
 * the WAVS-DRAND service later fulfills it, emitting `RarityRevealed`. This
 * component mints, then shows a pending "revealing" state until that event
 * (or a fallback poll of `rarityRevealed`) confirms the rarity.
 */
export function PfpMintButton({
	onMinted,
}: {
	onMinted?: ((collection: string, tokenId: string) => void) | undefined;
}) {
	const collectionAddress = env.NEXT_PUBLIC_PFP_COLLECTION_ADDRESS;
	const { isConnected } = useAccount();
	const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
	const [revealedRarity, setRevealedRarity] = useState<number | null>(null);
	const [showRevealFallback, setShowRevealFallback] = useState(false);
	const [requestRevealMessage, setRequestRevealMessage] = useState<
		string | null
	>(null);
	const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	const { data: mintPrice } = useReadContract({
		address: collectionAddress as Address | undefined,
		abi: pfpAbi,
		functionName: "mintPrice",
		query: { enabled: !!collectionAddress },
	});

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
					setRevealedRarity(null);
					setShowRevealFallback(false);
					setRequestRevealMessage(null);
					if (collectionAddress) {
						onMinted?.(collectionAddress, tokenId);
					}
				}
				return receipt;
			},
		},
	});

	const tokenIdBigInt =
		mintedTokenId !== null ? BigInt(mintedTokenId) : undefined;
	const isRevealed = revealedRarity !== null;

	// Fallback poll of rarityRevealed()/tokenRarity() in case the log
	// subscription used by useWatchContractEvent below misses the event
	// (e.g. RPC providers without reliable eth_subscribe support).
	const { data: rarityRevealedData } = useReadContract({
		address: collectionAddress as Address | undefined,
		abi: pfpAbi,
		functionName: "rarityRevealed",
		args: tokenIdBigInt !== undefined ? [tokenIdBigInt] : undefined,
		query: {
			enabled:
				!!collectionAddress && tokenIdBigInt !== undefined && !isRevealed,
			refetchInterval: 8000,
		},
	});

	const { data: tokenRarityData } = useReadContract({
		address: collectionAddress as Address | undefined,
		abi: pfpAbi,
		functionName: "tokenRarity",
		args: tokenIdBigInt !== undefined ? [tokenIdBigInt] : undefined,
		query: {
			enabled:
				!!collectionAddress &&
				tokenIdBigInt !== undefined &&
				!isRevealed &&
				rarityRevealedData === true,
		},
	});

	useEffect(() => {
		if (rarityRevealedData === true && tokenRarityData !== undefined) {
			setRevealedRarity(Number(tokenRarityData));
		}
	}, [rarityRevealedData, tokenRarityData]);

	// Preferred path: watch for RarityRevealed directly so the UI updates the
	// moment the WAVS-DRAND callback lands, without waiting on the poll above.
	useWatchContractEvent({
		address: collectionAddress as Address | undefined,
		abi: pfpAbi,
		eventName: "RarityRevealed",
		enabled:
			!!collectionAddress && tokenIdBigInt !== undefined && !isRevealed,
		args: tokenIdBigInt !== undefined ? { tokenId: tokenIdBigInt } : undefined,
		onLogs(logs) {
			for (const log of logs) {
				if (
					log.args.tokenId === tokenIdBigInt &&
					log.args.rarity !== undefined
				) {
					setRevealedRarity(Number(log.args.rarity));
					break;
				}
			}
		},
	});

	// Surface a subtle "re-request reveal" action if the reveal hasn't arrived
	// after a while (operator downtime, dropped trigger, etc). Scheduling is
	// pulled out into a stable callback so it can be re-armed after a manual
	// re-request without adding a synthetic dependency to the effect below.
	const scheduleRevealFallback = useCallback(() => {
		if (fallbackTimeoutRef.current) {
			clearTimeout(fallbackTimeoutRef.current);
		}
		fallbackTimeoutRef.current = setTimeout(() => {
			setShowRevealFallback(true);
		}, REVEAL_FALLBACK_DELAY_MS);
	}, []);

	useEffect(() => {
		if (mintedTokenId === null || isRevealed) {
			setShowRevealFallback(false);
			if (fallbackTimeoutRef.current) {
				clearTimeout(fallbackTimeoutRef.current);
				fallbackTimeoutRef.current = null;
			}
			return;
		}
		scheduleRevealFallback();
		return () => {
			if (fallbackTimeoutRef.current) {
				clearTimeout(fallbackTimeoutRef.current);
			}
		};
	}, [mintedTokenId, isRevealed, scheduleRevealFallback]);

	const {
		writeContract: writeRequestReveal,
		data: requestRevealTxHash,
		isPending: isRequestingReveal,
		error: requestRevealError,
		reset: resetRequestReveal,
	} = useWriteContract();

	const { isSuccess: isRequestRevealConfirmed } =
		useWaitForTransactionReceipt({
			hash: requestRevealTxHash,
			query: { enabled: !!requestRevealTxHash },
		});

	useEffect(() => {
		if (isRequestRevealConfirmed) {
			setShowRevealFallback(false);
			scheduleRevealFallback();
		}
	}, [isRequestRevealConfirmed, scheduleRevealFallback]);

	useEffect(() => {
		if (!requestRevealError) {
			setRequestRevealMessage(null);
			return;
		}
		let message = "Failed to re-request reveal. Please try again.";
		if (requestRevealError instanceof BaseError) {
			const revertError = requestRevealError.walk(
				(err) => err instanceof ContractFunctionRevertedError,
			);
			if (revertError instanceof ContractFunctionRevertedError) {
				const errorName = revertError.data?.errorName;
				if (errorName === "RevealRequestCooldown") {
					message = "Please wait a few minutes before requesting again.";
				} else if (errorName === "RarityAlreadyRevealed") {
					message = "This token has already been revealed.";
				}
			}
		}
		setRequestRevealMessage(message);
	}, [requestRevealError]);

	if (!collectionAddress) return null;

	const isFree = !mintPrice || mintPrice === 0n;

	const handleMint = () => {
		setMintedTokenId(null);
		setRevealedRarity(null);
		setShowRevealFallback(false);
		setRequestRevealMessage(null);
		resetRequestReveal();
		writeContract({
			address: collectionAddress as Address,
			abi: pfpAbi,
			functionName: "mint",
			value: mintPrice ?? 0n,
		});
	};

	const handleMintAnother = () => {
		reset();
		resetRequestReveal();
		setMintedTokenId(null);
		setRevealedRarity(null);
		setShowRevealFallback(false);
		setRequestRevealMessage(null);
	};

	const handleRequestReveal = () => {
		if (tokenIdBigInt === undefined) return;
		setRequestRevealMessage(null);
		writeRequestReveal({
			address: collectionAddress as Address,
			abi: pfpAbi,
			functionName: "requestReveal",
			args: [tokenIdBigInt],
		});
	};

	const isLoading = isSigning || isConfirming;
	const isPendingReveal = isSuccess && mintedTokenId !== null && !isRevealed;
	const rarityConfig =
		revealedRarity !== null
			? getRarityConfig(revealedRarity, PFP_RARITY_CONFIG)
			: null;

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
						{isRevealed && mintedTokenId
							? `Minted #${mintedTokenId} — select it below to appraise`
							: isPendingReveal
								? `Minted #${mintedTokenId} — revealing rarity…`
								: isFree
									? "Mint a free PFP NFT with random rarity"
									: `Mint a PFP NFT for ${formatEther(mintPrice)} POL`}
					</p>
				</div>
				<div className="flex-shrink-0">
					{isRevealed && mintedTokenId ? (
						<Button
							color="glass"
							size="sm"
							onPress={handleMintAnother}
						>
							Mint Another
						</Button>
					) : isPendingReveal ? (
						<Button color="glass" size="sm" isLoading isDisabled>
							Revealing…
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

			{isRevealed && rarityConfig && (
				<div className="mt-3 flex items-center gap-2">
					<Chip color={rarityConfig.chipColor} size="sm">
						{rarityConfig.emoji} {rarityConfig.name}
					</Chip>
				</div>
			)}

			{isPendingReveal && showRevealFallback && (
				<div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
					<p className="text-xs text-foreground/50">
						Still waiting on the randomness service to reveal this PFP's
						rarity. You can re-request the reveal below.
					</p>
					<div className="flex items-center gap-2">
						<Button
							color="glass"
							size="sm"
							isLoading={isRequestingReveal}
							onPress={handleRequestReveal}
						>
							Re-request reveal
						</Button>
						{requestRevealMessage && (
							<p className="text-xs text-warning">{requestRevealMessage}</p>
						)}
					</div>
				</div>
			)}
		</Card>
	);
}
