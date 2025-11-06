"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import {
	MagnifyingGlassIcon,
	CheckBadgeIcon,
	ExclamationTriangleIcon,
	WalletIcon,
} from "@heroicons/react/24/outline";

import { Card, Button } from "../ui";
import { LoadingState } from ".";
import { DepositableNFTCard } from "./DepositableNFTCard";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { useUserOwnedNFTsMultipleCollections } from "../hooks/useUserOwnedNFTs";
import { useReadGachaTreasuryGetWhitelistedCollections } from "../generated";

interface UserNFT {
	collection: string;
	tokenId: string;
	collectionName?: string;
	isAppraised: boolean;
	appraisalValue?: bigint;
}

interface NFTAvailabilitySectionProps {
	className?: string;
}

const truncateAddress = (address?: string) => {
	if (!address) return "Wallet not connected";
	return `${address.slice(0, 6)}…${address.slice(-4)}`;
};

export function NFTAvailabilitySection({
	className,
}: NFTAvailabilitySectionProps) {
	const { address: userAddress, isConnected } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
	const [loading, setLoading] = useState(true);
	const [showSuccess, setShowSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [readyToDepositNFTs, setReadyToDepositNFTs] = useState<UserNFT[]>([]);
	const [needsAppraisalNFTs, setNeedsAppraisalNFTs] = useState<UserNFT[]>([]);

	const treasuryAddress = contracts.treasury as `0x${string}` | undefined;
	const whitelistedCollectionsQuery =
		useReadGachaTreasuryGetWhitelistedCollections({
			address: treasuryAddress,
		} as Parameters<typeof useReadGachaTreasuryGetWhitelistedCollections>[0]);
	const whitelistedCollections =
		(whitelistedCollectionsQuery.data as `0x${string}`[]) || [];

	const {
		nfts: userOwnedNFTs,
		isLoading: nftsLoading,
		error: nftsError,
		refetch: refetchNFTs,
	} = useUserOwnedNFTsMultipleCollections(
		whitelistedCollections ? [...whitelistedCollections] : [],
	);

	useEffect(() => {
		if (!userAddress) {
			setUserNFTs([]);
			setLoading(false);
			return;
		}

		if (nftsLoading) {
			setLoading(true);
			return;
		}

		if (nftsError) {
			setError(nftsError);
			setLoading(false);
			return;
		}

		const transformedNFTs: UserNFT[] = userOwnedNFTs.map((ownedNFT) => ({
			collection: ownedNFT.collection,
			tokenId: ownedNFT.tokenId.toString(),
			collectionName: ownedNFT.collectionName || "",
			isAppraised: false,
			appraisalValue: BigInt(0),
		}));

		setUserNFTs(transformedNFTs);
		setLoading(false);
		setError(null);
	}, [userAddress, userOwnedNFTs, nftsLoading, nftsError]);

	const handleAppraisalStatusChange = useCallback(
		(collection: string, tokenId: string, hasValidAppraisal: boolean) => {
			const nftKey = `${collection}:${tokenId}`;

			setReadyToDepositNFTs((prev) => {
				const filtered = prev.filter(
					(nft) => `${nft.collection}:${nft.tokenId}` !== nftKey,
				);
				if (hasValidAppraisal) {
					const nft = userNFTs.find(
						(n) => n.collection === collection && n.tokenId === tokenId,
					);
					if (
						nft &&
						!filtered.some((n) => `${n.collection}:${n.tokenId}` === nftKey)
					) {
						return [...filtered, nft];
					}
				}
				return filtered;
			});

			setNeedsAppraisalNFTs((prev) => {
				const filtered = prev.filter(
					(nft) => `${nft.collection}:${nft.tokenId}` !== nftKey,
				);
				if (!hasValidAppraisal) {
					const nft = userNFTs.find(
						(n) => n.collection === collection && n.tokenId === tokenId,
					);
					if (
						nft &&
						!filtered.some((n) => `${n.collection}:${n.tokenId}` === nftKey)
					) {
						return [...filtered, nft];
					}
				}
				return filtered;
			});
		},
		[userNFTs],
	);

	useEffect(() => {
		setReadyToDepositNFTs([]);
		setNeedsAppraisalNFTs([...userNFTs]);
	}, [userNFTs]);

	const handleNFTAction = useCallback(
		(collection: string, tokenId: string, hasValidAppraisal?: boolean) => {
			if (hasValidAppraisal) {
				const updatedNFTs = userNFTs.filter(
					(nft) => !(nft.collection === collection && nft.tokenId === tokenId),
				);
				setUserNFTs(updatedNFTs);
				setShowSuccess(true);
				setTimeout(() => setShowSuccess(false), 3000);
			} else {
				const appraisalUrl = `/appraisal?collection=${encodeURIComponent(
					collection,
				)}&tokenId=${encodeURIComponent(tokenId)}`;
				window.location.href = appraisalUrl;
			}
		},
		[userNFTs],
	);

	if (!isConnected) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				className={className}
			>
				<Card className="space-y-6 border border-white/10 bg-content1/20 p-8 text-center backdrop-blur-2xl">
					<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-warning/40 bg-warning/15">
						<WalletIcon className="h-10 w-10 text-warning" />
					</div>
					<div className="space-y-3">
						<h3 className="text-2xl font-semibold text-foreground">
							Connect your wallet to manage deposits
						</h3>
						<p className="text-sm text-foreground/70">
							We surface whitelisted collections automatically and guide you
							through appraisal and treasury deposits step-by-step.
						</p>
					</div>
					<div className="rounded-2xl border border-white/10 bg-content1/25 p-4 text-left">
						<p className="text-xs uppercase tracking-wide text-foreground/50">
							How it works
						</p>
						<ul className="mt-3 space-y-2 text-sm text-foreground/70">
							<li>Connect your wallet to detect eligible NFTs.</li>
							<li>
								Appraise any asset that does not yet have a WAVS valuation.
							</li>
							<li>Deposit and start earning a share of every spin.</li>
						</ul>
					</div>
				</Card>
			</motion.div>
		);
	}

	if (loading) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className={className}
			>
				<Card className="border border-white/10 bg-content1/20 p-6 text-center backdrop-blur-2xl">
					<div className="space-y-4">
						<LoadingState size="lg" />
						<p className="text-sm text-foreground/70">Loading your NFTs…</p>
					</div>
				</Card>
			</motion.div>
		);
	}

	if (error) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className={className}
			>
				<Card className="space-y-4 border border-danger/30 bg-danger/10 p-6 text-center backdrop-blur-2xl">
					<ExclamationTriangleIcon className="mx-auto h-12 w-12 text-danger" />
					<div className="space-y-2">
						<h3 className="text-lg font-semibold text-danger">
							Unable to load NFTs
						</h3>
						<p className="text-sm text-danger/80">{error}</p>
					</div>
					<Button color="glass" onPress={refetchNFTs}>
						Retry
					</Button>
				</Card>
			</motion.div>
		);
	}

	if (userNFTs.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				className={className}
			>
				<Card className="space-y-6 border border-white/10 bg-content1/20 p-8 text-center backdrop-blur-2xl">
					<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-content1/30">
						<MagnifyingGlassIcon className="h-10 w-10 text-foreground/60" />
					</div>
					<div className="space-y-3">
						<h3 className="text-2xl font-semibold text-foreground">
							No eligible NFTs detected
						</h3>
						<p className="text-sm text-foreground/70">
							Explore whitelisted collections or mint supported assets to start
							contributing to the treasury.
						</p>
					</div>
					<Button color="glass" onPress={refetchNFTs} className="w-full">
						Refresh
					</Button>
				</Card>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className={className}
		>
			<div className="space-y-10">
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
					<Card className="relative overflow-hidden border border-white/10 bg-content1/20 p-6 backdrop-blur-2xl">
						<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.16),_transparent_60%)]" />
						<div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
							<div className="space-y-2">
								<span className="text-xs font-medium uppercase tracking-[0.35em] text-success/70">
									Connected wallet
								</span>
								<h3 className="text-xl font-semibold text-foreground">
									{truncateAddress(userAddress)}
								</h3>
								<p className="text-sm text-foreground/60">
									Deposits use this wallet to sign appraisal approvals and
									treasury transfers. Confirmation receipts are surfaced in the
									rewards dashboard.
								</p>
							</div>
							<div className="flex items-center gap-3 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
								<div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
								<span>Ready for deposits</span>
							</div>
						</div>
					</Card>

					<Card className="border border-white/10 bg-content1/20 p-6 backdrop-blur-2xl">
						<h4 className="text-xs uppercase tracking-[0.35em] text-foreground/50">
							Portfolio summary
						</h4>
						<div className="mt-4 grid gap-3 md:grid-cols-2">
							<div className="rounded-2xl border border-white/10 bg-content1/30 p-4">
								<p className="text-xs uppercase tracking-wide text-foreground/50">
									Depositable now
								</p>
								<p className="mt-2 text-2xl font-semibold text-success">
									{readyToDepositNFTs.length}
								</p>
								<p className="mt-2 text-xs text-foreground/50">
									Appraised and ready to submit
								</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-content1/30 p-4">
								<p className="text-xs uppercase tracking-wide text-foreground/50">
									Awaiting appraisal
								</p>
								<p className="mt-2 text-2xl font-semibold text-warning">
									{needsAppraisalNFTs.length}
								</p>
								<p className="mt-2 text-xs text-foreground/50">
									Start WAVS appraisal flow for these assets
								</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-content1/30 p-4">
								<p className="text-xs uppercase tracking-wide text-foreground/50">
									Collections detected
								</p>
								<p className="mt-2 text-2xl font-semibold text-foreground">
									{new Set(userNFTs.map((nft) => nft.collection)).size}
								</p>
								<p className="mt-2 text-xs text-foreground/50">
									Whitelisted contracts for this drop
								</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-content1/30 p-4">
								<p className="text-xs uppercase tracking-wide text-foreground/50">
									Total NFTs tracked
								</p>
								<p className="mt-2 text-2xl font-semibold text-foreground">
									{userNFTs.length}
								</p>
								<p className="mt-2 text-xs text-foreground/50">
									Across all eligible collections
								</p>
							</div>
						</div>
					</Card>
				</div>

				<AnimatePresence>
					{showSuccess && (
						<motion.div
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 12 }}
							className="rounded-2xl border border-success/25 bg-success/10 p-4 text-sm text-success"
						>
							<div className="flex items-center gap-3">
								<CheckBadgeIcon className="h-5 w-5" />
								<span>
									Deposit broadcasted. Treasury balances update after
									confirmation.
								</span>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{readyToDepositNFTs.length > 0 && (
					<section className="space-y-4">
						<header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
							<div className="flex items-center gap-3">
								<div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
								<h3 className="text-lg font-semibold text-foreground">
									Ready to deposit
								</h3>
							</div>
							<p className="text-sm text-foreground/60">
								Submit deposits one by one. We track confirmations in your
								rewards dashboard.
							</p>
						</header>
						<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
							<AnimatePresence>
								{readyToDepositNFTs.map((nft) => (
									<DepositableNFTCard
										key={`ready-${nft.collection}:${nft.tokenId}`}
										collection={nft.collection as `0x${string}`}
										tokenId={nft.tokenId}
										appraisalContractAddress={
											(contracts.appraisal as `0x${string}`) || "0x0"
										}
										onAction={handleNFTAction}
										onAppraisalStatusChange={handleAppraisalStatusChange}
									/>
								))}
							</AnimatePresence>
						</div>
					</section>
				)}

				{needsAppraisalNFTs.length > 0 && (
					<section className="space-y-4">
						<header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
							<div className="flex items-center gap-3">
								<div className="h-2.5 w-2.5 rounded-full bg-warning animate-pulse" />
								<h3 className="text-lg font-semibold text-foreground">
									Needs appraisal
								</h3>
							</div>
							<p className="text-sm text-foreground/60">
								Start the WAVS appraisal flow. We prefill collection and token
								metadata automatically.
							</p>
						</header>
						<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
							<AnimatePresence>
								{needsAppraisalNFTs.map((nft) => (
									<DepositableNFTCard
										key={`appraisal-${nft.collection}:${nft.tokenId}`}
										collection={nft.collection as `0x${string}`}
										tokenId={nft.tokenId}
										appraisalContractAddress={
											(contracts.appraisal as `0x${string}`) || "0x0"
										}
										onAction={handleNFTAction}
										onAppraisalStatusChange={handleAppraisalStatusChange}
									/>
								))}
							</AnimatePresence>
						</div>
					</section>
				)}

				<Card className="border border-white/10 bg-content1/20 p-6 backdrop-blur-2xl">
					<div className="grid gap-6 md:grid-cols-2">
						<div className="space-y-3">
							<h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/60">
								Deposit checklist
							</h4>
							<ul className="space-y-2 text-sm text-foreground/70">
								<li className="flex items-start gap-2">
									<div className="mt-2 h-1.5 w-1.5 rounded-full bg-success" />
									<span>
										Appraise each NFT before depositing to lock in treasury
										valuation.
									</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="mt-2 h-1.5 w-1.5 rounded-full bg-success" />
									<span>
										Review gas prompts—fee estimates surface before you sign.
									</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="mt-2 h-1.5 w-1.5 rounded-full bg-success" />
									<span>
										Track confirmations via the rewards dashboard without
										leaving this tab.
									</span>
								</li>
							</ul>
						</div>
						<div className="space-y-3">
							<h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/60">
								Treasury context
							</h4>
							<ul className="space-y-2 text-sm text-foreground/70">
								<li className="flex items-start gap-2">
									<div className="mt-2 h-1.5 w-1.5 rounded-full bg-warning" />
									<span>
										Deposited NFTs rotate into active prize pools as rarity
										slots open.
									</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="mt-2 h-1.5 w-1.5 rounded-full bg-warning" />
									<span>
										Spin fees stream rewards back to depositors on a pro-rata
										basis.
									</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="mt-2 h-1.5 w-1.5 rounded-full bg-warning" />
									<span>
										Withdrawals are available once any configured lockups
										expire.
									</span>
								</li>
							</ul>
						</div>
					</div>
				</Card>
			</div>
		</motion.div>
	);
}
