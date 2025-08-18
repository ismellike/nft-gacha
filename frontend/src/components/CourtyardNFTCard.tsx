"use client";

import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/theme-config";
import { formatAddress, formatTokenId } from "../lib/utils";
import {
	CourtyardMetadata,
	parseCourtyardMetadata,
	formatGradeDisplay,
	getGradeColorScheme,
	processCourtyardImageUrl,
	formatCardTitle,
} from "../lib/courtyard-utils";
import { NFTImage } from "./NFTCard";
import {
	useReadNftAppraisalGetAppraisedPrice,
	useReadNftAppraisalHasAppraisal,
} from "../generated";
import { formatCurrency } from "../lib/utils";

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

export interface CourtyardNFTCardProps {
	collection: string;
	tokenId: string;
	metadata: CourtyardMetadata;
	imageUrl?: string;
	variant?: "compact" | "expanded";
	className?: string;
	onClick?: () => void;
	animate?: boolean;
	showAppraisal?: boolean;
	appraisalContractAddress?: `0x${string}`;
}

export const CourtyardNFTCard = memo<CourtyardNFTCardProps>(
	({
		collection,
		tokenId,
		metadata,
		imageUrl,
		variant = "expanded",
		className,
		onClick,
		animate = true,
		showAppraisal = true,
		appraisalContractAddress,
	}) => {
		const isCompact = variant === "compact";
		const isInteractive = !!onClick;

		// Parse Courtyard-specific metadata
		const parsedData = parseCourtyardMetadata(metadata);
		const { grading, setInfo, cardDetails } = parsedData;

		// Get grade color scheme
		const gradeColors = getGradeColorScheme(grading.grade);

		// Determine the best image URL - prioritize provided imageUrl over processing
		const actualImageUrl =
			imageUrl || processCourtyardImageUrl(metadata) || undefined;

		// Log Courtyard NFT rendering for debugging
		console.log("CourtyardNFTCard rendering:", {
			collection,
			tokenId,
			name: metadata.name,
			providedImageUrl: imageUrl,
			metadataImage: metadata.image,
			processedCourtyardImageUrl: processCourtyardImageUrl(metadata),
			finalImageUrl: actualImageUrl,
			hasGrading: !!grading.grade,
			hasSetInfo: !!setInfo.set,
			metadataKeys: Object.keys(metadata),
		});

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
						"relative group flex flex-col",
						"backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transition-all duration-500",
						isInteractive && "cursor-pointer",
						"bg-gradient-to-br from-content1/30 via-content1/20 to-content1/40 border border-white/20 hover:border-white/30",
						className,
					)}
					onClick={onClick}
					{...motionProps}
				>
					{/* Glassmorphism layers */}
					<div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
					<div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

					{/* Courtyard brand indicator */}
					<div className="absolute top-3 left-3 z-20">
						<motion.div
							className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 backdrop-blur-md rounded-full px-2 py-1 border border-white/20 shadow-lg"
							whileHover={{ scale: 1.05 }}
							transition={{ type: "spring", stiffness: 400 }}
						>
							<span className="text-xs font-bold text-white tracking-wide">
								COURTYARD
							</span>
						</motion.div>
					</div>

					{/* Cover Image - Takes up majority of space */}
					<div className="relative z-10 flex-1 flex items-center justify-center p-4 pt-12">
						<NFTImage
							imageUrl={actualImageUrl}
							collection={collection}
							tokenId={tokenId}
							size="md"
							animate={animate}
						/>
					</div>

					{/* Metadata Section - Below image */}
					<div className="relative z-10 p-4 pt-2 space-y-2">
						{/* Card Title - Pokemon #7 Magnemite format */}
						<div className="text-center">
							<h3 className="text-sm font-bold text-white drop-shadow-sm leading-tight">
								{formatCardTitle(
									cardDetails.title || metadata.name,
									setInfo.cardNumber,
									cardDetails.category,
									metadata,
								) || `Token ${formatTokenId(tokenId)}`}
							</h3>
						</div>

						{/* Grade Badge */}
						{grading.grade && (
							<div className="flex justify-center">
								<div
									className={cn(
										"inline-flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-md",
										`bg-gradient-to-r ${gradeColors.gradient}/20 border ${gradeColors.borderColor}`,
										gradeColors.textColor,
									)}
								>
									<div
										className={cn(
											"w-1.5 h-1.5 rounded-full bg-gradient-to-r",
											gradeColors.gradient,
										)}
									/>
									<span className="text-xs font-bold">
										{formatGradeDisplay(
											grading.grade,
											grading.company,
											grading.fullGrade,
										)}
									</span>
								</div>
							</div>
						)}

						{/* Set and Rarity Info */}
						<div className="text-center space-y-1">
							{setInfo.set && (
								<div className="text-xs text-white/70 truncate">
									{setInfo.set}
								</div>
							)}
							{setInfo.rarity && (
								<div className="text-xs text-white/60 truncate">
									{setInfo.rarity}
								</div>
							)}
						</div>

						{/* Appraisal Information */}
						{showAppraisal && appraisalContractAddress && (
							<div className="pt-1">
								<AppraisalDisplay
									collection={collection as `0x${string}`}
									tokenId={tokenId}
									appraisalContractAddress={appraisalContractAddress}
								/>
							</div>
						)}
					</div>
				</CardComponent>
			);
		}

		// Expanded variant
		return (
			<CardComponent
				className={cn(
					"relative group flex flex-col",
					"backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transition-all duration-500",
					isInteractive && "cursor-pointer",
					"bg-gradient-to-br from-content1/30 via-content1/20 to-content1/40 border border-white/20 hover:border-white/30",
					className,
				)}
				onClick={onClick}
				{...motionProps}
			>
				{/* Glassmorphism layers */}
				<div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
				<div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

				{/* Courtyard brand indicator */}
				<div className="absolute top-4 left-4 z-20">
					<motion.div
						className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20 shadow-lg"
						whileHover={{ scale: 1.05 }}
						animate={{
							boxShadow: [
								"0 10px 25px rgba(139, 69, 255, 0.3)",
								"0 10px 25px rgba(59, 130, 246, 0.3)",
								"0 10px 25px rgba(139, 69, 255, 0.3)",
							],
						}}
						transition={{
							boxShadow: {
								duration: 3,
								repeat: Infinity,
								ease: "easeInOut",
							},
							scale: {
								type: "spring",
								stiffness: 400,
							},
						}}
					>
						<span className="text-sm font-bold text-white tracking-wide">
							COURTYARD
						</span>
					</motion.div>
				</div>

				{/* Collection address - top right */}
				<div className="absolute top-4 right-4 z-20">
					<span className="text-xs font-mono text-white/60 bg-white/10 backdrop-blur-md rounded-lg px-2 py-1 border border-white/20">
						{formatAddress(collection)}
					</span>
				</div>

				{/* Cover Image - Takes up majority of space */}
				<div className="relative z-10 flex-1 flex items-center justify-center p-6 pt-16">
					<NFTImage
						imageUrl={actualImageUrl}
						collection={collection}
						tokenId={tokenId}
						size="xl"
						animate={animate}
					/>
				</div>

				{/* Metadata Section - Below image */}
				<div className="relative z-10 p-6 space-y-4">
					{/* Card Title - Pokemon #7 Magnemite format */}
					<div className="text-center">
						<h2 className="text-xl font-bold text-white drop-shadow-lg mb-1">
							{formatCardTitle(
								cardDetails.title || metadata.name,
								setInfo.cardNumber,
								cardDetails.category,
								metadata,
							) || `Token ${formatTokenId(tokenId)}`}
						</h2>
						{metadata.description && (
							<p className="text-sm text-white/80 max-w-md mx-auto">
								{metadata.description}
							</p>
						)}
					</div>

					{/* Grade Badge */}
					{grading.grade && (
						<div className="flex justify-center">
							<div
								className={cn(
									"inline-flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md",
									`bg-gradient-to-r ${gradeColors.gradient}/20 border ${gradeColors.borderColor}`,
									gradeColors.textColor,
								)}
							>
								<div
									className={cn(
										"w-2 h-2 rounded-full bg-gradient-to-r",
										gradeColors.gradient,
										"animate-pulse",
									)}
								/>
								<span className="text-base font-bold">
									{formatGradeDisplay(
										grading.grade,
										grading.company,
										grading.fullGrade,
									)}
								</span>
							</div>
						</div>
					)}

					{/* Set and Rarity Information */}
					<div className="grid grid-cols-1 gap-3">
						{setInfo.set && (
							<div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
								<div className="flex items-center gap-2 mb-2">
									<div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" />
									<span className="text-white/70 text-xs font-medium uppercase tracking-wide">
										Set Information
									</span>
								</div>
								<div className="space-y-1">
									<div className="text-white font-medium">{setInfo.set}</div>
									<div className="flex flex-wrap gap-3 text-sm text-white/80">
										{setInfo.year && <span>Year: {setInfo.year}</span>}
										{setInfo.rarity && <span>Rarity: {setInfo.rarity}</span>}
										{setInfo.edition && <span>Edition: {setInfo.edition}</span>}
									</div>
								</div>
							</div>
						)}

						{/* Additional grading details */}
						{(grading.certNumber || grading.condition) && (
							<div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
								<div className="flex items-center gap-2 mb-2">
									<div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
									<span className="text-white/70 text-xs font-medium uppercase tracking-wide">
										Grading Details
									</span>
								</div>
								<div className="grid grid-cols-2 gap-3 text-sm">
									{grading.certNumber && (
										<div>
											<span className="block text-white/60 text-xs mb-1">
												Cert #
											</span>
											<span className="text-white font-mono">
												{grading.certNumber}
											</span>
										</div>
									)}
									{grading.condition && (
										<div>
											<span className="block text-white/60 text-xs mb-1">
												Condition
											</span>
											<span className="text-white">{grading.condition}</span>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Card Details */}
						{(cardDetails.category ||
							cardDetails.variant ||
							cardDetails.proofOfIntegrity) && (
							<div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
								<div className="flex items-center gap-2 mb-2">
									<div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
									<span className="text-white/70 text-xs font-medium uppercase tracking-wide">
										Card Details
									</span>
								</div>
								<div className="space-y-1 text-sm text-white/80">
									{cardDetails.category && (
										<div>Category: {cardDetails.category}</div>
									)}
									{cardDetails.variant && (
										<div>Variant: {cardDetails.variant}</div>
									)}
									{cardDetails.proofOfIntegrity && (
										<motion.div
											className="flex items-center gap-2 mt-2 p-2 bg-purple-500/20 rounded-lg border border-purple-400/30"
											whileHover={{ scale: 1.02 }}
										>
											<div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
											<span className="text-xs text-purple-200 font-mono">
												Proof of Integrity
											</span>
										</motion.div>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Appraisal Information */}
					{showAppraisal && appraisalContractAddress && (
						<div className="pt-2">
							<AppraisalDisplay
								collection={collection as `0x${string}`}
								tokenId={tokenId}
								appraisalContractAddress={appraisalContractAddress}
							/>
						</div>
					)}
				</div>
			</CardComponent>
		);
	},
);

CourtyardNFTCard.displayName = "CourtyardNFTCard";
