"use client";

import {
	useState,
	memo,
	useMemo,
	lazy,
	Suspense,
	startTransition,
} from "react";
import NextImage from "next/image";
import { motion, type MotionStyle } from "framer-motion";
import { cn } from "../lib/theme-config";
import {
	formatAddress,
	formatTokenId,
	formatCurrency,
	isValidAddress,
} from "../lib/utils";
import {
	useReadNftAppraisalGetAppraisedPrice,
	useReadNftAppraisalHasAppraisal,
	useReadErc721Name,
} from "../generated";
import { type Rarity, getRarityConfig } from "../lib/rarityConfig";
import { useNFTMetadata } from "../hooks/useNFTMetadata";
import {
	isCourtyardTokenURI,
	type CourtyardMetadata,
	processCourtyardImageUrl,
} from "../lib/courtyard-utils";
import { processImageUrl } from "../lib/nft-metadata";
import type { NFTMetadata } from "../types/hooks";

// Lazy load heavy components
const NFTLoadingPlaceholder = lazy(() =>
	import("./NFTLoadingPlaceholder").then((module) => ({
		default: module.NFTLoadingPlaceholder,
	})),
);

// Core Types - Flexible for all use cases
export interface NFTCardData {
	collection: string;
	tokenId: string;
	imageUrl?: string | undefined;
	rarity?: Rarity | undefined;
	appraisalOverride?: { hasAppraisal: boolean; priceUSD: bigint } | undefined;
}

export interface NFTCardProps {
	data: NFTCardData;
	// Basic options
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	showCollectionName?: boolean;
	onClick?: () => void;
	// Appraisal
	appraisalContractAddress?: `0x${string}`;
	protocolTreasuryAddress?: string;
	gachaId?: string;
	onBuybackSuccess?: (txHash: string) => void;
	// Styling
	className?: string;
	style?: MotionStyle;
}

// Flexible size configuration
const SIZE_CONFIG = {
	xs: {
		container: "w-32 h-36",
		image: "w-32 h-32",
		text: "text-xs",
		title: "text-sm",
		padding: "p-2",
		radius: "rounded-lg",
		gap: "gap-2",
	},
	sm: {
		container: "w-48 h-52",
		image: "w-48 h-48",
		text: "text-sm",
		title: "text-base",
		padding: "p-3",
		radius: "rounded-xl",
		gap: "gap-3",
	},
	md: {
		container: "w-64 h-72",
		image: "w-64 h-64",
		text: "text-sm",
		title: "text-base",
		padding: "p-4",
		radius: "rounded-xl",
		gap: "gap-3",
	},
	lg: {
		container: "w-80 h-88",
		image: "w-80 h-80",
		text: "text-sm",
		title: "text-base",
		padding: "p-4.5",
		radius: "rounded-2xl",
		gap: "gap-3.5",
	},
	xl: {
		container: "w-96 h-[28rem]",
		image: "w-96 h-96",
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
}>(({ data, contractAddress, size, override }) => {
	const themeStyles = GLASS_THEME;
	const sizeStyles = SIZE_CONFIG[size];

	// Smart caching - skip calls if override is provided
	const shouldSkipAppraisalCall =
		!!override || !isValidAddress(contractAddress);

	const { data: hasAppraisal, isLoading: checkingAppraisal } =
		useReadNftAppraisalHasAppraisal({
			address: contractAddress,
			args: [data.collection as `0x${string}`, BigInt(data.tokenId)],
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
			args: [data.collection as `0x${string}`, BigInt(data.tokenId)],
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
		(appraisalPrice
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
});
AppraisalDisplay.displayName = "AppraisalDisplay";

// Optimized image component with better loading states
const NFTImage = memo<{
	data: NFTCardData;
	metadata: NFTMetadata | null;
	tokenURI: string | null;
	size: "xs" | "sm" | "md" | "lg" | "xl";
}>(({ data, metadata, tokenURI, size }) => {
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
				className={cn(
					sizeStyles.container,
					sizeStyles.radius,
					"flex items-center justify-center border-2 border-dashed",
					themeStyles.border,
					themeStyles.background,
				)}
			>
				<span className={cn(sizeStyles.text, themeStyles.textSecondary)}>
					No Image
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
					rarityConfig && `border-[${rarityConfig.borderColor}/40]`,
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
						boxShadow: "none",
						transition: "box-shadow 0.3s ease",
					}),
				}}
			>
				{!isLoaded && (
					<div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm">
						<motion.div
							className="w-6 h-6 border-2 border-t-transparent rounded-full"
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
							"object-cover transition-opacity duration-300",
							isLoaded ? "opacity-100" : "opacity-0",
						)}
						priority={true}
						unoptimized={imageUrl.includes("courtyard.io")}
						onLoad={() => startTransition(() => setIsLoaded(true))}
						onError={() => setHasError(true)}
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
		data,
		size = "md",
		showCollectionName = true,
		onClick,
		appraisalContractAddress,
		className,
		style,
	}) => {
		// Enhanced metadata fetching with better error handling
		const nftData = useNFTMetadata(data.collection, data.tokenId, {
			enabled: true,
			skipFetch: false,
		});
		const metadata = nftData.metadata;
		const isLoading = nftData.isLoading;
		const error = nftData.error;

		// Collection name fetching with caching
		const { data: collectionName } = useReadErc721Name({
			address: data.collection as `0x${string}`,
			query: { staleTime: 300_000, gcTime: 600_000 },
		});

		// Memoized expensive calculations
		const { rarityConfig, displayName } = useMemo(() => {
			const rarityConfig =
				data.rarity !== undefined ? getRarityConfig(data.rarity) : null;

			const displayName =
				metadata?.name || `Token ${formatTokenId(data.tokenId)}`;

			return {
				rarityConfig,
				displayName,
			};
		}, [data.rarity, metadata, data.tokenId]);

		const themeStyles = GLASS_THEME;
		const sizeStyles = SIZE_CONFIG[size];

		// Loading state with better UX
		if (isLoading && !metadata?.tokenURI) {
			return (
				<div
					className={cn(
						sizeStyles.container,
						sizeStyles.radius,
						themeStyles.background,
						themeStyles.border,
						className,
					)}
				>
					<Suspense
						fallback={<div className="animate-pulse bg-white/10 rounded-lg" />}
					>
						<NFTLoadingPlaceholder
							size={
								size === "xs" || size === "sm"
									? "sm"
									: size === "xl"
										? "lg"
										: "md"
							}
						/>
					</Suspense>
				</div>
			);
		}

		// Error state with better UX
		if (error) {
			return (
				<motion.div
					className={cn(
						sizeStyles.container,
						sizeStyles.radius,
						"flex items-center justify-center border-2 border-dashed",
						themeStyles.border,
						themeStyles.background,
						className,
					)}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<span className={cn(sizeStyles.text, themeStyles.textSecondary)}>
						Error loading NFT
					</span>
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
				style={style || {}}
				onClick={onClick}
				initial={{ opacity: 0, scale: 0.95, y: 10 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: -10 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				layout={true}
			>
				{/* Rarity indicator */}
				{rarityConfig && (
					<motion.div
						className={cn(
							"absolute top-2 left-2 w-3 h-3 rounded-full",
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

				<div className={cn("flex flex-col", sizeStyles.gap)}>
					{/* Collection name */}
					{showCollectionName && (
						<div className="flex items-center justify-between">
							<span
								className={cn(
									sizeStyles.text,
									"font-medium uppercase tracking-wide truncate flex-1",
									themeStyles.textSecondary,
									rarityConfig ? "pl-6" : "", // Add left padding when rarity indicator is present
								)}
							>
								{collectionName || formatAddress(data.collection)}
							</span>
							<span
								className={cn(
									sizeStyles.text,
									"font-bold ml-2",
									themeStyles.text,
								)}
							>
								{formatTokenId(data.tokenId)}
							</span>
						</div>
					)}

					{/* NFT Image */}
					<div className="flex justify-center">
						<NFTImage
							data={data}
							metadata={metadata}
							tokenURI={nftData.tokenURI || null}
							size={size}
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
							data={data}
							contractAddress={appraisalContractAddress}
							size={size}
							override={data.appraisalOverride}
						/>
					)}
				</div>
			</motion.div>
		);
	},
);
NFTCard.displayName = "NFTCard";

export default NFTCard;
