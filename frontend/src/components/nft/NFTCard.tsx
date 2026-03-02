"use client";

/**
 * NFTCard - Unified NFT display component with glassmorphism design
 *
 * ## Size Selection Guidelines
 * Choose the appropriate size based on display context:
 *
 * - `xs` (8rem): Dense lists/tables (future use)
 * - `sm` (12rem): Compact previews, grid layouts, history cards, wallet picker
 * - `md` (16rem): Default general use, single-card displays, standalone cards
 * - `lg` (20rem): Special reveals, hero displays, modal content, featured NFTs
 * - `xl` (24rem): Featured displays, hero sections (future use)
 *
 * ## Metadata Handling Strategy
 * - **Default**: Component fetches metadata internally via useNFTMetadata hook
 * - **imageUrl override**: Only pass when image URL is already known/fetched (performance optimization)
 *
 * ## Appraisal Data Flow
 * - **Default**: Component fetches from contract when appraisalContractAddress provided
 * - **appraisalOverride**: Use when appraisal data already fetched (prevents redundant calls)
 * - **appraisedValue**: Alternative override pattern (legacy, prefer appraisalOverride)
 *
 * @example
 * // Standard usage - let component fetch everything
 * <NFTCard
 *   data={{ collection, tokenId, rarity }}
 *   size="md"
 *   appraisalContractAddress={appraisalContract}
 * />
 *
 * @example
 * // Performance optimized - override when data already fetched
 * <NFTCard
 *   data={{
 *     collection,
 *     tokenId,
 *     imageUrl: alreadyFetchedUrl,
 *     appraisalOverride: { hasAppraisal: true, priceUSD: alreadyFetchedPrice }
 *   }}
 *   size="lg"
 * />
 */

import { type MotionStyle, motion } from "framer-motion";
import NextImage from "next/image";
import { memo, startTransition, useMemo, useState } from "react";
import {
	useReadErc721Name,
	useReadNftAppraisalGetAppraisedPrice,
	useReadNftAppraisalHasAppraisal,
} from "../../generated";
import { useNFTMetadata } from "../../hooks/useNFTMetadata";
import {
	type CourtyardMetadata,
	isCourtyardTokenURI,
	processCourtyardImageUrl,
} from "../../lib/courtyard-utils";
import { processImageUrl } from "../../lib/nft-metadata";
import { getRarityConfig } from "../../lib/rarityConfig";
import { cn } from "../../lib/theme-config";
import {
	formatAddress,
	formatCurrency,
	formatTokenId,
	isValidAddress,
} from "../../lib/utils";
import type { NFTMetadata } from "../../types/hooks";

// Core Types - Flexible for all use cases
export interface NFTCardData {
	collection: string;
	tokenId: string;
	imageUrl?: string | undefined;
	rarity?: number | undefined;
	appraisalOverride?: { hasAppraisal: boolean; priceUSD: bigint } | undefined;
	appraisedValue?: bigint | undefined;
	// Pre-fetched metadata to avoid re-fetching
	metadata?: NFTMetadata | null;
	tokenURI?: string | null;
}

interface NFTCardProps {
	data: NFTCardData;
	// Basic options
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	showCollectionName?: boolean;
	onClick?: () => void;
	// Appraisal
	appraisalContractAddress?: `0x${string}`;
	// Image loading
	priority?: boolean;
	// Styling
	className?: string;
	style?: MotionStyle;
}

// Flexible size configuration - responsive widths with max-w constraints
const SIZE_CONFIG = {
	xs: {
		container: "w-full max-w-[8rem] aspect-[9/10]",
		image: "w-full aspect-square",
		text: "text-xs",
		title: "text-sm",
		padding: "p-2",
		radius: "rounded-lg",
		gap: "gap-2",
	},
	sm: {
		container: "w-full max-w-[12rem] aspect-[9/10]",
		image: "w-full aspect-square",
		text: "text-sm",
		title: "text-base",
		padding: "p-3",
		radius: "rounded-xl",
		gap: "gap-3",
	},
	md: {
		container: "w-full max-w-[16rem] aspect-[9/10]",
		image: "w-full aspect-square",
		text: "text-sm",
		title: "text-base",
		padding: "p-4",
		radius: "rounded-xl",
		gap: "gap-3",
	},
	lg: {
		container: "w-full max-w-[20rem] aspect-[9/10]",
		image: "w-full aspect-square",
		text: "text-sm",
		title: "text-base",
		padding: "p-4",
		radius: "rounded-2xl",
		gap: "gap-3",
	},
	xl: {
		container: "w-full max-w-[24rem] aspect-[9/10]",
		image: "w-full aspect-square",
		text: "text-base",
		title: "text-lg",
		padding: "p-6",
		radius: "rounded-2xl",
		gap: "gap-4",
	},
} as const;

// Glass theme only - for modal use
const GLASS_THEME = {
	background: "bg-white/[0.08] backdrop-blur-xl",
	border: "border-white/[0.15]",
	hover: "hover:bg-white/[0.12] hover:border-white/[0.25]",
	shadow: "shadow-lg shadow-black/10",
	text: "text-white",
	textSecondary: "text-white/70",
} as const;

// Performance-optimized appraisal display with smart caching
const AppraisalDisplay = memo<{
	data: NFTCardData;
	contractAddress: `0x${string}`;
	size: "xs" | "sm" | "md" | "lg" | "xl";
	override?: NFTCardData["appraisalOverride"];
}>(
	({
		data: { collection, tokenId, appraisedValue },
		contractAddress,
		size,
		override,
	}) => {
		const themeStyles = GLASS_THEME;
		const sizeStyles = SIZE_CONFIG[size];

		// Smart caching - skip calls if override is provided
		const shouldSkipAppraisalCall =
			!!override || !isValidAddress(contractAddress);

		const { data: hasAppraisal, isLoading: checkingAppraisal } =
			useReadNftAppraisalHasAppraisal({
				address: contractAddress,
				args: [collection as `0x${string}`, BigInt(tokenId)],
				query: {
					enabled: !shouldSkipAppraisalCall,
					staleTime: 300_000, // 5 minutes
					gcTime: 600_000, // 10 minutes
					retry: 1,
				},
			});

		const { data: appraisalPrice, isLoading: loadingPrice } =
			useReadNftAppraisalGetAppraisedPrice({
				address: contractAddress,
				args: [collection as `0x${string}`, BigInt(tokenId)],
				query: {
					enabled: !shouldSkipAppraisalCall && !!hasAppraisal,
					staleTime: 300_000,
					gcTime: 600_000,
					retry: 1,
				},
			});

		// Use override data if available
		const finalAppraisal =
			override ||
			(appraisedValue
				? {
						hasAppraisal: true,
						priceUSD: appraisedValue,
					}
				: appraisalPrice
					? {
							hasAppraisal: !!hasAppraisal,
							priceUSD: Array.isArray(appraisalPrice)
								? appraisalPrice[0]
								: (appraisalPrice as unknown as bigint),
						}
					: null);

		const isLoading = override ? false : checkingAppraisal || loadingPrice;

		if (isLoading) {
			return (
				<div className="flex items-center justify-center gap-1">
					<motion.div
						className={cn(
							"w-2 h-2 border-2 border-t-transparent rounded-full",
							themeStyles.textSecondary,
						)}
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
					/>
					<span className={cn(sizeStyles.text, themeStyles.textSecondary)}>
						Appraising...
					</span>
				</div>
			);
		}

		// Only show appraisal if it exists and has a valid price
		if (!finalAppraisal?.hasAppraisal || finalAppraisal.priceUSD <= 0n) {
			return null;
		}

		return (
			<motion.div
				className="text-center space-y-1"
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3 }}
			>
				<div className="flex items-center justify-center gap-1">
					<div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
					<span className={cn(sizeStyles.text, "text-emerald-300 font-medium")}>
						Appraised
					</span>
				</div>
				<div className={cn("font-bold", sizeStyles.title, themeStyles.text)}>
					{formatCurrency(finalAppraisal.priceUSD.toString(), 18, "USD")}
				</div>
			</motion.div>
		);
	},
);
AppraisalDisplay.displayName = "AppraisalDisplay";

// Optimized image component with better loading states
const NFTImage = memo<{
	data: NFTCardData;
	metadata: NFTMetadata | null;
	tokenURI: string | null;
	size: "xs" | "sm" | "md" | "lg" | "xl";
	priority?: boolean;
}>(({ data, metadata, tokenURI, size, priority = false }) => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [hasError, setHasError] = useState(false);

	const rarityConfig =
		data.rarity !== undefined ? getRarityConfig(data.rarity) : null;
	const themeStyles = GLASS_THEME;
	const sizeStyles = SIZE_CONFIG[size];

	// Smart image URL resolution
	const imageUrl = useMemo(() => {
		if (data.imageUrl) return data.imageUrl;
		if (!metadata) return null;

		if (isCourtyardTokenURI(tokenURI || "")) {
			return processCourtyardImageUrl(metadata as CourtyardMetadata);
		}
		return processImageUrl(metadata.image, metadata);
	}, [data.imageUrl, metadata, tokenURI]);

	if (!imageUrl || hasError) {
		return (
			<div
				role="img"
				aria-label={
					hasError
						? `Failed to load image for NFT ${data.tokenId}`
						: `No image available for NFT ${data.tokenId}`
				}
				className={cn(
					"w-full aspect-square",
					sizeStyles.radius,
					"flex items-center justify-center border-2 border-dashed bg-content1/25",
					"border-white/15 text-foreground/60",
				)}
			>
				<span className={cn(sizeStyles.text)}>
					{hasError ? "Image failed" : "No Image"}
				</span>
			</div>
		);
	}

	return (
		<div className={cn("relative group", sizeStyles.container)}>
			<motion.div
				className={cn(
					sizeStyles.container,
					sizeStyles.radius,
					themeStyles.background,
					themeStyles.border,
				)}
				whileHover={{
					scale: 1.05,
					...(rarityConfig && {
						boxShadow: `0 0 15px 2px ${rarityConfig.hexColor}, 0 0 25px 4px ${rarityConfig.hexColor}40, 0 0 35px 6px ${rarityConfig.hexColor}20`,
					}),
				}}
				transition={{ duration: 0.2 }}
				style={{
					...(rarityConfig && {
						borderColor: `${rarityConfig.hexColor}66`,
						boxShadow: "none",
						transition: "box-shadow 0.3s ease, border-color 0.3s ease",
					}),
				}}
			>
				{/* Loading overlay */}
				{!isLoaded && (
					<div className="absolute inset-0 z-10 flex items-center justify-center bg-white/10 backdrop-blur-md">
						<motion.div
							className={cn(
								"border-2 border-t-transparent rounded-full",
								size === "xs" || size === "sm" ? "w-6 h-6" : "w-8 h-8",
							)}
							style={{
								borderColor: rarityConfig
									? `${rarityConfig.hexColor}40`
									: "rgba(255,255,255,0.2)",
								borderTopColor: rarityConfig
									? rarityConfig.hexColor
									: "#f59e0b",
							}}
							animate={{ rotate: 360 }}
							transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						/>
					</div>
				)}

				<div
					className={cn(
						"relative w-full h-full overflow-hidden",
						sizeStyles.radius,
					)}
				>
					<NextImage
						src={imageUrl}
						alt={metadata?.name || `NFT ${data.tokenId}`}
						fill
						className={cn(
							"object-cover transition-all duration-500",
							isLoaded
								? "opacity-100 scale-100 blur-0"
								: "opacity-0 scale-105 blur-xl",
						)}
						priority={priority}
						unoptimized={imageUrl.includes("courtyard.io")}
						onLoad={() => {
							startTransition(() => setIsLoaded(true));
						}}
						onError={() => {
							setHasError(true);
						}}
						sizes="(max-width: 640px) 80vw, (max-width: 1024px) 60vw, 40vw"
					/>
				</div>
			</motion.div>
		</div>
	);
});
NFTImage.displayName = "NFTImage";

// Main NFT Card Component - Flexible for all use cases
export const NFTCard = memo<NFTCardProps>(
	({
		data: {
			collection,
			tokenId,
			imageUrl,
			rarity,
			appraisalOverride,
			appraisedValue,
			metadata: prefetchedMetadata,
			tokenURI: prefetchedTokenURI,
		},
		size = "md",
		showCollectionName = true,
		onClick,
		appraisalContractAddress,
		priority = false,
		className,
		style,
	}) => {
		// Use prefetched metadata if available, otherwise fetch
		const shouldSkipFetch = !!prefetchedMetadata;

		const nftData = useNFTMetadata(collection, tokenId, {
			enabled: !shouldSkipFetch,
			skipFetch: shouldSkipFetch,
		});

		// Use prefetched data or fetched data
		const metadata = prefetchedMetadata || nftData.metadata;
		const isLoading = shouldSkipFetch ? false : nftData.isLoading;
		const error = nftData.error;
		const tokenURI = prefetchedTokenURI || nftData.tokenURI;

		// Collection name fetching with caching
		const { data: collectionName } = useReadErc721Name({
			address: collection as `0x${string}`,
			query: { staleTime: 300_000, gcTime: 600_000 },
		});

		// Memoized expensive calculations
		const { rarityConfig, displayName } = useMemo(() => {
			const rarityConfig =
				rarity !== undefined ? getRarityConfig(rarity) : null;

			const displayName = metadata?.name || `Token ${formatTokenId(tokenId)}`;

			return {
				rarityConfig,
				displayName,
			};
		}, [rarity, metadata, tokenId]);

		const themeStyles = GLASS_THEME;
		const sizeStyles = SIZE_CONFIG[size];

		// Loading skeleton — mirrors loaded card structure to prevent layout shift
		if (isLoading && !metadata?.tokenURI) {
			return (
				<div
					className={cn(
						sizeStyles.radius,
						themeStyles.background,
						themeStyles.border,
						themeStyles.shadow,
						sizeStyles.padding,
						"animate-pulse",
						className,
					)}
				>
					<div className={cn("flex flex-col", sizeStyles.gap)}>
						{/* Collection name skeleton */}
						{showCollectionName && (
							<div className="flex items-center justify-between gap-2">
								<div className="h-3 w-2/3 rounded bg-white/10" />
								<div className="h-3 w-8 rounded bg-white/10" />
							</div>
						)}
						{/* Image skeleton — matches NFTImage's sizeStyles.container */}
						<div className="flex justify-center">
							<div
								className={cn(
									sizeStyles.container,
									sizeStyles.radius,
									"bg-white/[0.06]",
								)}
							/>
						</div>
						{/* Title skeleton */}
						<div className="flex justify-center">
							<div className="h-4 w-3/4 rounded bg-white/10" />
						</div>
					</div>
				</div>
			);
		}

		// Error state with better UX
		if (error) {
			return (
				<motion.div
					role="alert"
					className={cn(
						sizeStyles.container,
						sizeStyles.radius,
						"flex items-center justify-center border-2 border-dashed bg-content1/25 text-foreground/70",
						"border-white/15",
						className,
					)}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<span className={cn(sizeStyles.text)}>Error loading NFT</span>
				</motion.div>
			);
		}

		return (
			<motion.div
				className={cn(
					"relative group transition-all duration-300",
					sizeStyles.radius,
					themeStyles.background,
					themeStyles.border,
					themeStyles.shadow,
					onClick && "cursor-pointer",
					onClick && themeStyles.hover,
					sizeStyles.padding,
					className,
				)}
				{...(style && { style })}
				onClick={onClick}
				initial={{ opacity: 0, scale: 0.95, y: 10 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: -10 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				layout={true}
			>
				<div className={cn("flex flex-col", sizeStyles.gap)}>
					{/* Collection name */}
					{showCollectionName && (
						<div className="flex items-center justify-between gap-2">
							<span className="flex items-center gap-2 min-w-0 flex-1">
								{rarityConfig && (
									<motion.span
										className={cn(
											"w-2.5 h-2.5 shrink-0 rounded-full",
											`bg-gradient-to-r ${rarityConfig.bgGradient}`,
										)}
										animate={{
											scale: [1, 1.2, 1],
											opacity: [0.7, 1, 0.7],
										}}
										transition={{
											duration: 2,
											repeat: Infinity,
											ease: "easeInOut",
										}}
									/>
								)}
								<span
									className={cn(
										sizeStyles.text,
										"font-medium uppercase tracking-wide truncate",
										themeStyles.textSecondary,
									)}
								>
									{collectionName || formatAddress(collection)}
								</span>
							</span>
							<span
								className={cn(
									sizeStyles.text,
									"font-bold shrink-0",
									themeStyles.text,
								)}
							>
								{formatTokenId(tokenId)}
							</span>
						</div>
					)}

					{/* NFT Image */}
					<div className="flex justify-center">
						<NFTImage
							data={{ collection, tokenId, imageUrl, rarity }}
							metadata={metadata}
							tokenURI={tokenURI ?? null}
							size={size}
							priority={priority}
						/>
					</div>

					{/* NFT Name */}
					<h3
						className={cn(
							"font-bold text-center leading-tight break-words hyphens-auto",
							sizeStyles.title,
							themeStyles.text,
						)}
					>
						{displayName}
					</h3>

					{/* Appraisal - Always show when available */}
					{appraisalContractAddress && (
						<AppraisalDisplay
							data={{ collection, tokenId, appraisedValue }}
							contractAddress={appraisalContractAddress}
							size={size}
							override={appraisalOverride}
						/>
					)}
				</div>
			</motion.div>
		);
	},
);
NFTCard.displayName = "NFTCard";
