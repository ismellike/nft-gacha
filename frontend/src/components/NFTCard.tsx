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
	appraisalContractAddress?: `0x${string}`;
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
	const { data: hasAppraisal, isLoading: checkingAppraisal } =
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
	const { data: appraisalPrice, isLoading: loadingPrice } =
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
	const hasValidAppraisal = hasAppraisal && appraisalPrice && Number(appraisalPrice) > 0;

	if (!hasValidAppraisal && !isLoading) {
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3 }}
			className="bg-gradient-to-r from-success/20 to-emerald-500/20 backdrop-blur-xl border border-success/30 rounded-lg px-3 py-2 shadow-lg"
		>
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<div className="w-2 h-2 bg-success rounded-full shadow-sm shadow-success/50 animate-pulse" />
					<span className="text-success/80 font-medium uppercase tracking-wide text-xs">
						Appraised
					</span>
				</div>
				<div className="font-bold text-success text-sm">
					{isLoading ? (
						<div className="flex items-center gap-1">
							<motion.div
								className="w-4 h-4 border-2 border-success/30 border-t-success rounded-full"
								animate={{ rotate: 360 }}
								transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
							/>
							<span className="text-success/60">Loading...</span>
						</div>
					) : (
						formatCurrency(appraisalPrice?.toString() || "0", 18, "USD")
					)}
				</div>
			</div>
		</motion.div>
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
		sm: { container: "w-24 h-24", icon: "w-8 h-8" },
		md: { container: "w-48 h-48", icon: "w-16 h-16" },
		lg: { container: "w-64 h-64", icon: "w-24 h-24" },
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
					"rounded-2xl flex flex-col items-center justify-center",
					"bg-gradient-to-br from-content1/60 via-background/95 to-content1/40 border-2 border-white/40 shadow-xl relative overflow-hidden",
				)}
				animate={
					animate
						? {
								boxShadow: [
									"0 0 20px rgba(251, 146, 60, 0.3)",
									"0 0 40px rgba(251, 146, 60, 0.5)",
									"0 0 20px rgba(251, 146, 60, 0.3)",
								],
							}
						: {}
				}
				transition={{
					duration: 2,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			>
				{/* Background glassmorphism layer */}
				<div className="absolute inset-2 bg-gradient-to-br from-content1/60 via-background/95 to-content1/40 rounded-xl backdrop-blur-xl" />
				<div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />

				{/* Animated crystal icon */}
				<motion.div
					className="relative z-10"
					animate={
						animate
							? {
									y: [-2, 2, -2],
									rotateY: [0, 180, 360],
								}
							: {}
					}
					transition={
						animate
							? {
									y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
									rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
								}
							: {}
					}
				>
					<div
						className={cn(
							classes.icon,
							"bg-gradient-to-br from-warning to-orange-500 rounded-lg transform rotate-45 border-2 border-white/60 shadow-xl",
						)}
					>
						<motion.div
							className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-lg"
							animate={animate ? { opacity: [0.4, 0.8, 0.4] } : {}}
							transition={animate ? { duration: 1.5, repeat: Infinity } : {}}
						/>
					</div>
				</motion.div>

				{/* NFT info */}
				<div className="relative z-10 mt-3 text-center">
					<div className="text-xs font-bold text-white/90 tracking-wide">
						NFT {formatTokenId(tokenId)}
					</div>
				</div>
			</motion.div>
		);
	}

	return (
		<div className={cn(classes.container, "relative overflow-hidden rounded-2xl")}>
			{isLoading && (
				<div
					className={cn(
						classes.container,
						"absolute inset-0 bg-gradient-to-br from-content1/40 to-content1/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center",
					)}
				>
					<motion.div
						className="w-8 h-8 border-3 border-warning/30 border-t-warning rounded-full"
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
					"object-cover rounded-2xl border-2 border-white/20",
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
					"relative bg-gradient-to-br from-content1/40 via-background/95 to-content1/30 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden",
					"p-4 flex items-center gap-4",
					isInteractive &&
						"cursor-pointer hover:border-white/30 transition-all duration-300",
					className,
				)}
				onClick={onClick}
				{...motionProps}
			>
				{/* Inner glassmorphism layer */}
				<div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none" />

				<NFTImage
					imageUrl={imageUrl}
					collection={collection}
					tokenId={tokenId}
					size="sm"
					animate={animate}
				/>

				<div className="flex-1 min-w-0 relative z-10">
					<div className="space-y-2">
						<h3 className="font-bold text-lg bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
							NFT {formatTokenId(tokenId)}
						</h3>
						<p className="text-sm text-foreground/70 font-mono truncate">
							{formatAddress(collection)}
						</p>
						{showAppraisal && appraisalContractAddress && (
							<AppraisalDisplay
								collection={collection as `0x${string}`}
								tokenId={tokenId}
								appraisalContractAddress={appraisalContractAddress}
							/>
						)}
					</div>
				</div>
			</CardComponent>
		);
	}

	return (
		<CardComponent
			className={cn(
				"relative bg-gradient-to-br from-content1/40 via-background/95 to-content1/30 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden",
				"p-6",
				isInteractive &&
					"cursor-pointer hover:border-white/30 transition-all duration-300",
				className,
			)}
			onClick={onClick}
			{...motionProps}
		>
			{/* Inner glassmorphism layer */}
			<div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none" />

			<div className="relative z-10 space-y-4">
				<div className="flex justify-center">
					<NFTImage
						imageUrl={imageUrl}
						collection={collection}
						tokenId={tokenId}
						size="md"
						animate={animate}
					/>
				</div>

				<div className="space-y-3 text-center">
					<h3 className="font-bold text-2xl bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
						NFT {formatTokenId(tokenId)}
					</h3>
					
					<div className="space-y-2">
						<div className="text-sm text-foreground/60 uppercase tracking-wide">
							Collection
						</div>
						<p className="text-foreground font-mono text-sm bg-content1/20 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2">
							{formatAddress(collection)}
						</p>
					</div>

					{showAppraisal && appraisalContractAddress && (
						<AppraisalDisplay
							collection={collection as `0x${string}`}
							tokenId={tokenId}
							appraisalContractAddress={appraisalContractAddress}
						/>
					)}
				</div>
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