"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/theme-config";
import { memo } from "react";
import { formatAddress, formatTokenId, formatCurrency } from "../lib/utils";
import {
	useReadNftAppraisalGetAppraisedPrice,
	useReadNftAppraisalHasAppraisal,
} from "../generated";
import { Rarity, getRarityConfig } from "../lib/rarityConfig";
import { useNFTWithMetadata } from "../hooks/useNFTWithMetadata";
import { NFTLoadingPlaceholder } from "./ui/NFTLoadingPlaceholder";
import { CourtyardNFTCard } from "./CourtyardNFTCard";
import {
	isCourtyardTokenURI,
	CourtyardMetadata,
	processCourtyardImageUrl,
} from "../lib/courtyard-utils";
import {
	useImageWithFallbacks,
	getImageUrlAlternatives,
} from "../lib/image-proxy";

export interface NFTCardProps {
	collection: string;
	tokenId: string;
	variant?: "compact" | "expanded";
	showAppraisal?: boolean;
	className?: string;
	onClick?: () => void;
	imageUrl?: string;
	animate?: boolean;
	appraisalContractAddress: `0x${string}`;
	rarity?: Rarity;
}

interface AppraisalDisplayProps {
	collection: `0x${string}`;
	tokenId: string;
	appraisalContractAddress: `0x${string}`;
}

const AppraisalDisplay = memo<AppraisalDisplayProps>(
	({ collection, tokenId, appraisalContractAddress }) => {
		// Check if appraisal exists
		const {
			data: hasAppraisal,
			isLoading: checkingAppraisal,
			error: appraisalCheckError,
		} = useReadNftAppraisalHasAppraisal({
			address: appraisalContractAddress,
			args: [collection, BigInt(tokenId)],
			query: {
				enabled: !!appraisalContractAddress && !!collection && !!tokenId,
				staleTime: 30000,
				retry: 2,
			},
		});

		// Get appraised price if appraisal exists
		const {
			data: appraisalPrice,
			isLoading: loadingPrice,
			error: priceError,
		} = useReadNftAppraisalGetAppraisedPrice({
			address: appraisalContractAddress,
			args: [collection, BigInt(tokenId)],
			query: {
				enabled: !!hasAppraisal && !!appraisalContractAddress,
				staleTime: 30000,
				retry: 2,
			},
		});

		const isLoading = checkingAppraisal || loadingPrice;
		// getAppraisedPrice returns [priceUSD, status] - extract the price
		const priceUSD = Array.isArray(appraisalPrice)
			? appraisalPrice[0]
			: appraisalPrice;
		const hasValidAppraisal = Boolean(
			hasAppraisal && priceUSD && Number(priceUSD) > 0,
		);
		const hasError = appraisalCheckError || priceError;

		// Show info when there's no appraisal available
		const showDebugInfo = !hasValidAppraisal && !isLoading && !hasError;

		if (isLoading) {
			return (
				<div className="flex items-center justify-center gap-2">
					<motion.div
						className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
					/>
					<span className="text-white/70 text-sm">Loading...</span>
				</div>
			);
		}

		if (hasValidAppraisal) {
			return (
				<div className="text-center space-y-1">
					<div className="flex items-center justify-center gap-2">
						<div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
						<span className="text-emerald-300 text-xs font-medium uppercase tracking-wide">
							Appraised Value
						</span>
					</div>
					<div className="text-xl font-bold text-white drop-shadow-lg">
						{formatCurrency(priceUSD?.toString() || "0", 18, "USD")}
					</div>
				</div>
			);
		}

		if (hasError) {
			return (
				<div className="text-center">
					<span className="text-red-300 text-xs">Failed to load appraisal</span>
				</div>
			);
		}

		if (showDebugInfo) {
			return (
				<div className="text-center">
					<span className="text-yellow-300 text-xs">
						No appraisal available
					</span>
				</div>
			);
		}

		return (
			<div className="text-center">
				<span className="text-white/60 text-xs">Checking...</span>
			</div>
		);
	},
);
AppraisalDisplay.displayName = "AppraisalDisplay";

interface NFTImageProps {
	imageUrl?: string;
	collection: string;
	tokenId: string;
	size?: "sm" | "md" | "lg" | "xl";
	animate?: boolean;
}

const NFTImage = memo<NFTImageProps>(
	({ imageUrl, collection, tokenId, size = "md", animate = true }) => {
		// Always fetch metadata to get token URI, regardless of imageUrl provided
		const nftData = useNFTWithMetadata(collection, tokenId);

		// Determine the actual image URL to use, prioritizing provided imageUrl
		const actualImageUrl = imageUrl || nftData.imageUrl;

		// Show loading if we don't have token URI yet or if metadata is loading
		const isMetadataLoading =
			nftData.isLoading || (!nftData.tokenURI && !nftData.error);
		const metadataError = nftData.error;

		// Use the image proxy hook for CORS-friendly loading with fallbacks
		const {
			finalUrl,
			isLoading: isProxyLoading,
			error: proxyError,
			attempt,
		} = useImageWithFallbacks(actualImageUrl);

		// Enhanced logging for Courtyard NFTs
		if (nftData.tokenURI && nftData.tokenURI.includes("api.courtyard.io")) {
			console.log("Courtyard NFT Image Processing:", {
				tokenURI: nftData.tokenURI,
				providedImageUrl: imageUrl,
				nftDataImageUrl: nftData.imageUrl,
				finalImageUrl: actualImageUrl,
				proxyFinalUrl: finalUrl,
				proxyAttempt: attempt,
				metadataImage: nftData.metadata?.image,
				metadataName: nftData.metadata?.name,
			});
		}

		const sizeClasses = {
			sm: { container: "w-32 h-32", icon: "w-10 h-10" },
			md: { container: "w-80 h-80", icon: "w-20 h-20" },
			lg: { container: "w-96 h-96", icon: "w-32 h-32" },
			xl: { container: "w-[480px] h-[480px]", icon: "w-40 h-40" },
		};

		const classes = sizeClasses[size];

		// Determine loading and error states - always show skeleton until we have token URI
		const isLoading = isMetadataLoading || isProxyLoading || !nftData.tokenURI;
		const hasError =
			(!isMetadataLoading && metadataError) ||
			(!isProxyLoading && proxyError) ||
			(!isProxyLoading && !finalUrl && nftData.tokenURI);

		// Build error message with more details
		const errorMessage =
			metadataError ||
			proxyError ||
			(hasError ? "Failed to load NFT image with all fallback options" : null);

		if (hasError && !isLoading) {
			// Enhanced error info for debugging
			const detailedError = {
				errorMessage,
				originalImageUrl: actualImageUrl,
				finalProxyUrl: finalUrl,
				tokenURI: nftData.tokenURI,
				isCourtyard: nftData.tokenURI?.includes("api.courtyard.io") || false,
				proxyAttempt: attempt,
				metadataLoaded: !!nftData.metadata,
				availableAlternatives: actualImageUrl
					? getImageUrlAlternatives(actualImageUrl).length
					: 0,
			};

			console.error("NFTImage render error:", detailedError);

			return (
				<NFTLoadingPlaceholder
					size={size}
					animate={animate}
					error={errorMessage}
				/>
			);
		}

		return (
			<div
				className={cn(
					classes.container,
					"relative overflow-hidden rounded-2xl",
					"bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl",
				)}
			>
				{/* Glassmorphism overlay */}
				<div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 z-10" />

				{isLoading && (
					<div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center z-20">
						<motion.div
							className="w-8 h-8 border-2 border-white/30 border-t-warning rounded-full"
							animate={{ rotate: 360 }}
							transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						/>
						{attempt > 0 && (
							<div className="absolute bottom-2 left-2 right-2">
								<div className="text-xs text-white/70 text-center">
									Trying fallback {attempt}...
								</div>
							</div>
						)}
					</div>
				)}

				{finalUrl && (
					<img
						src={finalUrl}
						alt={
							nftData.metadata?.name ||
							`NFT ${formatTokenId(tokenId)} from ${formatAddress(collection)}`
						}
						className={cn(
							classes.container,
							"object-cover rounded-2xl relative z-0",
						)}
						// Add CORS attributes for better compatibility
						crossOrigin="anonymous"
						// Preload for better UX
						loading="lazy"
						// Add referrer policy for CORS
						referrerPolicy="no-referrer-when-downgrade"
						onError={(e) => {
							console.error("Final image load failed:", {
								src: e.currentTarget.src,
								finalUrl,
								originalUrl: actualImageUrl,
								tokenURI: nftData.tokenURI,
							});
						}}
						onLoad={() => {
							console.log("NFT image loaded successfully:", {
								finalUrl,
								originalUrl: actualImageUrl,
								proxyUsed: finalUrl !== actualImageUrl,
								attempt,
							});
						}}
					/>
				)}
			</div>
		);
	},
);
NFTImage.displayName = "NFTImage";

// Export NFTImage for use in other components
export { NFTImage };

export const NFTCard = memo<NFTCardProps>(
	({
		collection,
		tokenId,
		variant = "expanded",
		showAppraisal = true,
		className,
		onClick,
		imageUrl,
		animate = true,
		appraisalContractAddress,
		rarity,
	}) => {
		const isCompact = variant === "compact";
		const isInteractive = !!onClick;

		// Get NFT metadata
		const nftData = useNFTWithMetadata(collection, tokenId);

		// Always show skeleton first, then check for Courtyard optimization once we have token URI
		if (nftData.isLoading || !nftData.tokenURI) {
			return (
				<NFTLoadingPlaceholder
					size={isCompact ? "sm" : "md"}
					animate={animate}
					error={nftData.error}
				/>
			);
		}

		// Check if this is a Courtyard NFT and use specialized component if needed
		const isCourtyardNFT = isCourtyardTokenURI(nftData.tokenURI);
		if (isCourtyardNFT && nftData.metadata) {
			// Use the metadata we already fetched as Courtyard metadata
			const courtyardMetadata = nftData.metadata as CourtyardMetadata;

			// Get the best image URL - prefer provided imageUrl, then nftData.imageUrl, then process from metadata
			const courtyardImageUrl =
				imageUrl ||
				nftData.imageUrl ||
				processCourtyardImageUrl(courtyardMetadata) ||
				undefined;

			console.log("Rendering Courtyard NFT Card:", {
				collection,
				tokenId,
				providedImageUrl: imageUrl,
				nftDataImageUrl: nftData.imageUrl,
				processedImageUrl: processCourtyardImageUrl(courtyardMetadata),
				finalImageUrl: courtyardImageUrl,
				metadataName: courtyardMetadata.name,
			});

			return (
				<CourtyardNFTCard
					collection={collection}
					tokenId={tokenId}
					metadata={courtyardMetadata}
					imageUrl={courtyardImageUrl}
					variant={variant}
					className={className}
					onClick={onClick}
					animate={animate}
					showAppraisal={showAppraisal}
					appraisalContractAddress={appraisalContractAddress}
				/>
			);
		}

		// Get rarity theming if provided
		const rarityConfig = rarity ? getRarityConfig(rarity) : null;

		const cardVariants = {
			hover: animate
				? {
						scale: 1.02,
						transition: {
							type: "spring" as const,
							stiffness: 300,
							damping: 20,
						},
					}
				: {},
			tap: animate
				? {
						scale: 0.98,
						transition: {
							type: "spring" as const,
							stiffness: 400,
							damping: 30,
						},
					}
				: {},
		};

		const CardComponent = animate ? motion.div : "div";
		const motionProps = animate
			? {
					initial: { opacity: 0, y: 20, scale: 0.95 },
					animate: { opacity: 1, y: 0, scale: 1 },
					whileHover: isInteractive ? cardVariants.hover : undefined,
					whileTap: isInteractive ? cardVariants.tap : undefined,
					transition: { duration: 0.3, ease: "easeOut" as const },
				}
			: {};

		if (isCompact) {
			return (
				<CardComponent
					className={cn(
						"relative group",
						"backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transition-all duration-500",
						isInteractive && "cursor-pointer",
						// Base styling or rarity-specific styling
						rarityConfig
							? `bg-gradient-to-br ${rarityConfig.bgGradient}/5 border ${rarityConfig.borderColor}/30 hover:${rarityConfig.bgGradient}/8`
							: "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20",
						className,
					)}
					onClick={onClick}
					{...motionProps}
				>
					{/* Glassmorphism layers */}
					<div
						className={cn(
							"absolute inset-0 bg-gradient-to-br to-transparent",
							rarityConfig
								? `${rarityConfig.bgGradient}/3 via-white/2`
								: "from-white/5 via-white/2",
						)}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />

					<div className="relative z-10 p-4">
						{/* Contract & Token ID - Top */}
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2">
								<div
									className={cn(
										"w-2 h-2 rounded-full animate-pulse shadow-sm",
										rarityConfig
											? `bg-gradient-to-r ${rarityConfig.bgGradient}/80`
											: "bg-gradient-to-r from-warning to-orange-400",
									)}
								/>
								<span className="text-xs font-mono text-white/60 uppercase tracking-wider">
									{formatAddress(collection)}
								</span>
							</div>
							<span className="text-lg font-bold text-white drop-shadow-sm">
								{formatTokenId(tokenId)}
							</span>
						</div>

						{/* NFT Image - Main focus */}
						<div className="flex justify-center mb-4">
							<NFTImage
								imageUrl={imageUrl}
								collection={collection}
								tokenId={tokenId}
								size="md"
								animate={animate}
							/>
						</div>

						{/* Appraisal Information - Bottom */}
						{showAppraisal && (
							<AppraisalDisplay
								collection={collection as `0x${string}`}
								tokenId={tokenId}
								appraisalContractAddress={appraisalContractAddress}
							/>
						)}
					</div>
				</CardComponent>
			);
		}

		return (
			<CardComponent
				className={cn(
					"relative group",
					"backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transition-all duration-500",
					isInteractive && "cursor-pointer",
					// Base styling or rarity-specific styling
					rarityConfig
						? `bg-gradient-to-br ${rarityConfig.bgGradient}/5 border ${rarityConfig.borderColor}/30 hover:${rarityConfig.bgGradient}/8`
						: "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20",
					className,
				)}
				onClick={onClick}
				{...motionProps}
			>
				{/* Glassmorphism layers */}
				<div
					className={cn(
						"absolute inset-0 bg-gradient-to-br to-transparent",
						rarityConfig
							? `${rarityConfig.bgGradient}/3 via-white/2`
							: "from-white/5 via-white/2",
					)}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />

				<div className="relative z-10 p-4">
					{/* Contract & Token ID - Top */}
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<div
								className={cn(
									"w-2 h-2 rounded-full animate-pulse shadow-sm",
									rarityConfig
										? `bg-gradient-to-r ${rarityConfig.bgGradient}/80`
										: "bg-gradient-to-r from-warning to-orange-400",
								)}
							/>
							<span className="text-xs font-mono text-white/60 uppercase tracking-wider">
								{formatAddress(collection)}
							</span>
						</div>
						<span className="text-lg font-bold text-white drop-shadow-sm">
							{formatTokenId(tokenId)}
						</span>
					</div>

					{/* NFT Image - Main focus - Takes up majority of space */}
					<div className="flex justify-center mb-4">
						<NFTImage
							imageUrl={imageUrl}
							collection={collection}
							tokenId={tokenId}
							size="xl"
							animate={animate}
						/>
					</div>

					{/* Appraisal Information - Bottom */}
					{showAppraisal && (
						<AppraisalDisplay
							collection={collection as `0x${string}`}
							tokenId={tokenId}
							appraisalContractAddress={appraisalContractAddress}
						/>
					)}
				</div>
			</CardComponent>
		);
	},
);
NFTCard.displayName = "NFTCard";

// Export convenience components for specific use cases with proper display names
export const NFTInventoryCard = memo<NFTCardProps>((props) => (
	<NFTCard {...props} variant="compact" />
));
NFTInventoryCard.displayName = "NFTInventoryCard";

export const NFTShowcaseCard = memo<NFTCardProps>((props) => (
	<NFTCard {...props} variant="expanded" />
));
NFTShowcaseCard.displayName = "NFTShowcaseCard";

export const NFTRevealCard = memo<NFTCardProps>((props) => (
	<NFTCard {...props} variant="expanded" animate={true} />
));
NFTRevealCard.displayName = "NFTRevealCard";
