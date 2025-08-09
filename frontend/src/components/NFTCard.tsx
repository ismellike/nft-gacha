"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/theme";
import { formatAddress, formatTokenId, formatCurrency } from "../lib/utils";
import {
	useReadNftAppraisalGetAppraisedPrice,
	useReadNftAppraisalHasAppraisal,
} from "../generated";

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
}

function AppraisalDisplay({
	collection,
	tokenId,
	appraisalContractAddress,
}: {
	collection: `0x${string}`;
	tokenId: string;
	appraisalContractAddress: `0x${string}`;
}) {
	// Check if appraisal exists
	const { data: hasAppraisal, isLoading: checkingAppraisal, error: appraisalCheckError } =
		useReadNftAppraisalHasAppraisal({
			address: appraisalContractAddress,
			args: [collection, BigInt(tokenId)],
			query: {
				enabled: !!appraisalContractAddress && !!collection && !!tokenId,
				staleTime: 30000,
				retry: 2,
			},
		});

	// Get appraised price if appraisal exists
	const { data: appraisalPrice, isLoading: loadingPrice, error: priceError } =
		useReadNftAppraisalGetAppraisedPrice({
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
	const priceUSD = Array.isArray(appraisalPrice) ? appraisalPrice[0] : appraisalPrice;
	const hasValidAppraisal = Boolean(hasAppraisal && priceUSD && Number(priceUSD) > 0);
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
				<span className="text-yellow-300 text-xs">No appraisal available</span>
			</div>
		);
	}

	return (
		<div className="text-center">
			<span className="text-white/60 text-xs">Checking...</span>
		</div>
	);
}

function NFTImage({
	imageUrl,
	collection,
	tokenId,
	size = "md",
	animate = true,
}: {
	imageUrl?: string;
	collection: string;
	tokenId: string;
	size?: "sm" | "md" | "lg";
	animate?: boolean;
}) {
	const [isLoading, setIsLoading] = useState(!imageUrl);
	const [hasError, setHasError] = useState(false);
	const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

	const sizeClasses = {
		sm: { container: "w-32 h-32", icon: "w-10 h-10" },
		md: { container: "w-80 h-80", icon: "w-20 h-20" },
		lg: { container: "w-96 h-96", icon: "w-32 h-32" },
	};

	const classes = sizeClasses[size];

	useEffect(() => {
		if (!imageUrl) {
			setHasError(true);
			setIsLoading(false);
		} else {
			setCurrentImageUrl(imageUrl);
		}
	}, [imageUrl]);

	const handleImageLoad = () => {
		setIsLoading(false);
		setHasError(false);
	};

	const handleImageError = () => {
		setIsLoading(false);
		setHasError(true);
	};

	if (hasError || !currentImageUrl) {
		return (
			<motion.div
				className={cn(
					classes.container,
					"rounded-2xl flex flex-col items-center justify-center relative overflow-hidden",
					"bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl",
				)}
				animate={
					animate
						? {
								boxShadow: [
									"0 0 30px rgba(255, 255, 255, 0.1)",
									"0 0 50px rgba(255, 255, 255, 0.2)",
									"0 0 30px rgba(255, 255, 255, 0.1)",
								],
							}
						: {}
				}
				transition={{
					duration: 3,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			>
				{/* Glassmorphism layers */}
				<div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
				<div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

				{/* Animated crystal icon */}
				<motion.div
					className="relative z-10"
					animate={
						animate
							? {
									y: [-3, 3, -3],
									rotateY: [0, 180, 360],
									scale: [1, 1.05, 1],
								}
							: {}
					}
					transition={
						animate
							? {
									y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
									rotateY: { duration: 10, repeat: Infinity, ease: "linear" },
									scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
								}
							: {}
					}
				>
					<div
						className={cn(
							classes.icon,
							"bg-gradient-to-br from-orange-400/80 to-yellow-500/80 rounded-2xl",
							"border border-white/40 shadow-xl backdrop-blur-sm",
							"flex items-center justify-center transform rotate-45",
						)}
					>
						<motion.div
							className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"
							animate={animate ? { opacity: [0.3, 0.6, 0.3] } : {}}
							transition={animate ? { duration: 2, repeat: Infinity } : {}}
						/>
						<div className="w-4 h-4 bg-white/60 rounded-full transform -rotate-45" />
					</div>
				</motion.div>

				{/* NFT info */}
				<div className="relative z-10 mt-4 text-center">
					<div className="text-xs font-medium text-white/80 tracking-wide">
						{formatTokenId(tokenId)}
					</div>
				</div>
			</motion.div>
		);
	}

	return (
		<div
			className={cn(
				classes.container, 
				"relative overflow-hidden rounded-2xl",
				"bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl"
			)}
		>
			{/* Glassmorphism overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 z-10" />
			
			{isLoading && (
				<div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center z-20">
					<motion.div
						className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
					/>
				</div>
			)}
			
			<img
				src={currentImageUrl}
				alt={`NFT ${formatTokenId(tokenId)} from ${formatAddress(collection)}`}
				className={cn(
					classes.container,
					"object-cover rounded-2xl relative z-0",
				)}
				onLoad={handleImageLoad}
				onError={handleImageError}
			/>
		</div>
	);
}

export function NFTCard({
	collection,
	tokenId,
	variant = "expanded",
	showAppraisal = true,
	className,
	onClick,
	imageUrl,
	animate = true,
	appraisalContractAddress,
}: NFTCardProps) {
	const isCompact = variant === "compact";
	const isInteractive = !!onClick;

	const cardVariants = {
		hover: animate
			? {
					scale: 1.02,
					transition: { type: "spring" as const, stiffness: 300, damping: 20 },
				}
			: {},
		tap: animate
			? {
					scale: 0.98,
					transition: { type: "spring" as const, stiffness: 400, damping: 30 },
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
					"bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden",
					"hover:bg-white/10 hover:border-white/20 transition-all duration-500",
					isInteractive && "cursor-pointer",
					className,
				)}
				onClick={onClick}
				{...motionProps}
			>
				{/* Glassmorphism layers */}
				<div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/2 to-transparent" />
				<div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />

				<div className="relative z-10 p-4">
					{/* Contract & Token ID - Top */}
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-gradient-to-r from-warning to-orange-400 rounded-full animate-pulse shadow-sm" />
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
							size="sm"
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
				"bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden",
				"hover:bg-white/10 hover:border-white/20 transition-all duration-500",
				isInteractive && "cursor-pointer",
				className,
			)}
			onClick={onClick}
			{...motionProps}
		>
			{/* Glassmorphism layers */}
			<div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/2 to-transparent" />
			<div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />

			<div className="relative z-10 p-4">
				{/* Contract & Token ID - Top */}
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-gradient-to-r from-warning to-orange-400 rounded-full animate-pulse shadow-sm" />
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

// Export convenience components for specific use cases
export const NFTInventoryCard = (props: NFTCardProps) => (
	<NFTCard {...props} variant="compact" />
);

export const NFTShowcaseCard = (props: NFTCardProps) => (
	<NFTCard {...props} variant="expanded" />
);

export const NFTRevealCard = (props: NFTCardProps) => (
	<NFTCard {...props} variant="expanded" animate={true} />
);
