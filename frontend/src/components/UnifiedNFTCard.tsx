"use client";

import { useState, memo, useMemo } from "react";
import NextImage from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
import { NFTLoadingPlaceholder } from "./NFTLoadingPlaceholder";
import {
	isCourtyardTokenURI,
	type CourtyardMetadata,
	processCourtyardImageUrl,
	parseCourtyardMetadata,
	formatCardTitle,
	formatGradeDisplay,
} from "../lib/courtyard-utils";
import { processImageUrl } from "../lib/nft-metadata";
import type { NFTMetadata } from "../types/hooks";
import SellToTreasury from "./SellToTreasury";
import { getGachaConfig } from "../lib/gacha-config";

// Enhanced props for the unified NFT card
export interface UnifiedNFTCardProps {
	collection: string;
	tokenId: string;
	className?: string;
	onClick?: () => void;
	imageUrl?: string;
	animate?: boolean;
	appraisalContractAddress: `0x${string}`;
	rarity?: Rarity;
	showAppraisal?: boolean;
	priority?: number; // 0-10, higher loads first
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	variant?: "minimal" | "compact" | "detailed" | "showcase";
	enableTraitExpansion?: boolean; // Whether traits can be expanded/collapsed
	// Extended details and actions
	collectionName?: string; // Custom collection name to display
	extraDetails?: Array<{ label: string; value: string; highlight?: boolean }>; // Additional detail rows
	rewardsSlot?: React.ReactNode; // Custom rewards section
	actionSlot?: React.ReactNode; // Custom action button/content
	// Optional appraisal override to avoid extra RPCs when price is known
	appraisalOverride?: { hasAppraisal: boolean; priceUSD: bigint };
	// Redemption functionality
	protocolTreasuryAddress?: string;
	gachaId?: string;
	onBuybackSuccess?: (txHash: string) => void;
}

// Enhanced appraisal display with better caching
const UnifiedAppraisalDisplay: React.FC<{
	collection: `0x${string}`;
	tokenId: string;
	appraisalContractAddress: `0x${string}`;
	size: UnifiedNFTCardProps["size"];
	override?: { hasAppraisal: boolean; priceUSD: bigint };
}> = ({ collection, tokenId, appraisalContractAddress, size, override }) => {
	// Only use appraisal hooks when the contract address is a valid, non-zero address
	const appraisalAddrUsable =
		isValidAddress(appraisalContractAddress) &&
		!/^0x0{40}$/i.test(appraisalContractAddress);

	// Always call hooks unconditionally
	const {
		data: hasAppraisal,
		isLoading: checkingAppraisal,
		error: appraisalCheckError,
	} = useReadNftAppraisalHasAppraisal({
		address: appraisalContractAddress,
		args: [collection, BigInt(tokenId)],
		query: {
			enabled: appraisalAddrUsable && !!collection && !!tokenId && !override,
			staleTime: 60000,
			gcTime: 300000,
			retry: 1,
		},
	});

	const {
		data: appraisalPrice,
		isLoading: loadingPrice,
		error: priceError,
	} = useReadNftAppraisalGetAppraisedPrice({
		address: appraisalContractAddress,
		args: [collection, BigInt(tokenId)],
		query: {
			enabled: appraisalAddrUsable && !!hasAppraisal && !override,
			staleTime: 60000,
			gcTime: 300000,
			retry: 1,
		},
	});


	// Use override data if provided, otherwise use hook data
	const useOverride = override && typeof override.priceUSD === "bigint";
	const finalHasAppraisal = useOverride ? override?.hasAppraisal : hasAppraisal;
	const finalAppraisalPrice = useOverride ? override?.priceUSD : appraisalPrice;
	const finalCheckingAppraisal = useOverride ? false : checkingAppraisal;
	const finalLoadingPrice = useOverride ? false : loadingPrice;
	const finalAppraisalCheckError = useOverride
		? undefined
		: appraisalCheckError;
	const finalPriceError = useOverride ? undefined : priceError;

	const isLoading = finalCheckingAppraisal || finalLoadingPrice;

	// Extract price and status from appraisal data
	let priceAsBigInt: bigint = 0n;
	let appraisalStatus: number = 0; // Default to Pending

	if (useOverride) {
		priceAsBigInt = override?.priceUSD || 0n;
		// For override, assume valid status
		appraisalStatus = 1; // Completed
	} else if (finalAppraisalPrice) {
		// Handle if the data is from getAppraisedPrice (returns [price, status])
		if (Array.isArray(finalAppraisalPrice)) {
			priceAsBigInt = finalAppraisalPrice[0] as bigint;
			appraisalStatus = Number(finalAppraisalPrice[1]);
		}
		// Handle if it's already a bigint
		else if (typeof finalAppraisalPrice === "bigint") {
			priceAsBigInt = finalAppraisalPrice;
		}
		// Handle if it's an object with toString method
		else if (
			finalAppraisalPrice != null &&
			typeof finalAppraisalPrice === "object" &&
			"toString" in finalAppraisalPrice
		) {
			try {
				priceAsBigInt = BigInt(String(finalAppraisalPrice));
			} catch {
				priceAsBigInt = 0n;
			}
		}
	}

	// Check for valid appraisal: has appraisal, price > 0, and status is Completed (1) or OwnerOverride (2)
	const hasValidAppraisal = Boolean(
		finalHasAppraisal &&
		priceAsBigInt > 0n &&
		(appraisalStatus === 1 || appraisalStatus === 2)
	);
	const hasError =
		(finalAppraisalCheckError as unknown as boolean) ||
		(finalPriceError as unknown as boolean);

	// Size-responsive styling
	const sizeStyles = {
		xs: { text: "text-[9px]", price: "text-[10px]", icon: "w-1.5 h-1.5" },
		sm: { text: "text-[10px]", price: "text-xs", icon: "w-2 h-2" },
		md: { text: "text-xs", price: "text-sm", icon: "w-2 h-2" },
		lg: { text: "text-sm", price: "text-base", icon: "w-2.5 h-2.5" },
		xl: { text: "text-base", price: "text-lg", icon: "w-3 h-3" },
	};

	const styles = sizeStyles[size || "md"];

	if (!appraisalAddrUsable) {
		return (
			<div className="text-center">
				<span className={cn("text-warning-300", sizeStyles[size || "md"].text)}>
					No appraisal
				</span>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center gap-1">
				<motion.div
					className={cn(
						styles.icon,
						"border border-white/30 border-t-white rounded-full",
					)}
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
				/>
				<span className={cn("text-white/70", styles.text)}>...</span>
			</div>
		);
	}

	if (hasValidAppraisal) {
		return (
			<div className="text-center space-y-0.5">
				<div className="flex items-center justify-center gap-1">
					<div
						className={cn(
							styles.icon,
							"bg-emerald-400 rounded-full animate-pulse",
						)}
					/>
					<span
						className={cn(
							"text-emerald-300 font-medium uppercase tracking-wide",
							styles.text,
						)}
					>
						Appraised
					</span>
				</div>
				<div
					className={cn("font-bold text-white drop-shadow-lg", styles.price)}
				>
					{formatCurrency(priceAsBigInt?.toString() || "0", 18, "USD")}
				</div>
			</div>
		);
	}

	if (hasError) {
		return (
			<div className="text-center">
				<span className={cn("text-red-300", styles.text)}>Error</span>
			</div>
		);
	}

	return (
		<div className="text-center">
			<span className={cn("text-warning-300", styles.text)}>No appraisal</span>
		</div>
	);
};

// Enhanced NFT image with progressive loading
const UnifiedNFTImage: React.FC<{
	imageUrl?: string; // explicit override
	fallbackImageUrl?: string | null; // from parent hook
	tokenId: string;
	size: UnifiedNFTCardProps["size"];
	animate?: boolean;
	priority?: number;
	rarity?: Rarity;
	metadata?: NFTMetadata | null; // from parent hook
	tokenURI?: string | null; // from parent hook
}> = ({
	imageUrl,
	fallbackImageUrl,
	tokenId,
	size,
	priority = 0,
	rarity,
	metadata,
	tokenURI,
}) => {
		// Determine the best image URL using the unified metadata provided by parent
		const actualImageUrl = useMemo(() => {
			// Priority: provided imageUrl > fallbackImageUrl from hook > processed from metadata
			if (imageUrl) return imageUrl;
			if (fallbackImageUrl) return fallbackImageUrl;

			if (metadata) {
				if (isCourtyardTokenURI(tokenURI || "")) {
					return processCourtyardImageUrl(metadata as CourtyardMetadata);
				}
				return processImageUrl(metadata.image, metadata);
			}

			return null;
		}, [imageUrl, fallbackImageUrl, metadata, tokenURI]);

		// Use the image URL directly
		const displayImageUrl = actualImageUrl;

		// Size configurations optimized for performance - made images take up more space
		const sizeClasses = {
			xs: { container: "w-20 h-20", icon: "w-3 h-3", rounded: "rounded-lg" },
			sm: { container: "w-32 h-32", icon: "w-4 h-4", rounded: "rounded-lg" },
			md: { container: "w-48 h-48", icon: "w-6 h-6", rounded: "rounded-xl" },
			lg: { container: "w-56 h-56", icon: "w-8 h-8", rounded: "rounded-xl" },
			xl: { container: "w-72 h-72", icon: "w-12 h-12", rounded: "rounded-2xl" },
		};

		const classes = sizeClasses[size || "md"];

		const isLoading = false;
		// Show error state only when we have no image URL at all
		const hasError = !displayImageUrl;

		const rarityConfig = rarity ? getRarityConfig(rarity) : null;

		if (hasError && !isLoading) {
			return (
				<div
					className={cn(
						classes.container,
						classes.rounded,
						"bg-red-500/10 border border-red-500/30 flex items-center justify-center",
					)}
				>
					<div className={cn(classes.icon, "text-red-400")}>⚠</div>
				</div>
			);
		}

		return (
			<div
				className={cn(
					classes.container,
					classes.rounded,
					"relative overflow-hidden bg-white/5 backdrop-blur-xl shadow-lg",
					rarityConfig
						? `border ${rarityConfig.borderColor}/40 ${rarityConfig.glowColor}`
						: "border border-white/20",
				)}
			>
				{/* Removed gradient overlay to prevent bleeding onto image */}

				{isLoading && (
					<div
						className={cn(
							"absolute inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-20",
							classes.rounded,
						)}
					>
						<motion.div
							className={cn(
								classes.icon,
								"border-2 border-white/30 rounded-full",
								rarityConfig ? "border-t-warning" : "border-t-warning",
							)}
							animate={{ rotate: 360 }}
							transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						/>
					</div>
				)}

				{displayImageUrl && (
					<NextImage
						src={displayImageUrl}
						alt={
							(metadata?.name as string | undefined) ||
							`NFT ${formatTokenId(tokenId)}`
						}
						width={512}
						height={512}
						className={cn(
							classes.container,
							classes.rounded,
							"object-cover relative z-0",
						)}
						priority={priority > 7}
						unoptimized={displayImageUrl.includes('courtyard.io')}
					/>
				)}
			</div>
		);
	};

// Standard NFT trait filtering following industry best practices
function filterNFTTraits(
	attributes: NFTMetadata["attributes"],
	isCourtyardNFT: boolean,
): Array<{ trait_type: string; value: string | number }> {
	if (!attributes) return [];

	return attributes.filter((attr) => {
		if (!attr.trait_type || attr.value == null || attr.value === "") {
			return false;
		}

		const traitType = attr.trait_type.toLowerCase();
		const traitValue = attr.value.toString().toLowerCase();

		// Filter out common unwanted traits
		const excludeTypes = [
			"description",
			"title",
			"name",
			"image",
			"external_url",
			"card number",
			"cert number",
			"certification",
			"bring your irl",
			"tokenize",
			"onchain",
		];

		if (excludeTypes.some((exclude) => traitType.includes(exclude))) {
			return false;
		}

		// Filter out marketing content and overly long values
		if (
			traitValue.includes("bring your irl") ||
			traitValue.includes("tokenize") ||
			traitValue.includes("onchain") ||
			traitValue.length > 100
		) {
			return false;
		}

		// For Courtyard NFTs, also exclude grade info (shown separately)
		if (
			isCourtyardNFT &&
			(traitType.includes("grade") || traitType.includes("grading"))
		) {
			return false;
		}

		return true;
	});
}

// Enhanced trait display system with expandable functionality
const UnifiedTraitDisplay: React.FC<{
	metadata: NFTMetadata;
	size: UnifiedNFTCardProps["size"];
	isExpanded: boolean;
	onToggle: () => void;
	enableExpansion: boolean;
	isCourtyardNFT: boolean;
}> = ({
	metadata,
	size,
	isExpanded,
	onToggle,
	enableExpansion,
	isCourtyardNFT,
}) => {
		// Start with standard traits array
		let traits = filterNFTTraits(metadata.attributes, isCourtyardNFT);

		// For Courtyard NFTs, synthesize a minimal trait set if none present
		const parsedData = isCourtyardNFT
			? parseCourtyardMetadata(metadata as CourtyardMetadata)
			: null;

		if (isCourtyardNFT && traits.length === 0 && parsedData) {
			const fallback: Array<{ trait_type: string; value: string | number }> = [];
			if (parsedData.setInfo.set) {
				fallback.push({ trait_type: "Set", value: parsedData.setInfo.set });
			}
			if (parsedData.setInfo.cardNumber) {
				fallback.push({
					trait_type: "Card No.",
					value: parsedData.setInfo.cardNumber,
				});
			}
			if (parsedData.setInfo.year) {
				fallback.push({ trait_type: "Year", value: parsedData.setInfo.year });
			}
			if (parsedData.cardDetails.category) {
				fallback.push({
					trait_type: "Category",
					value: parsedData.cardDetails.category,
				});
			}
			if (parsedData.cardDetails.variant) {
				fallback.push({
					trait_type: "Variant",
					value: parsedData.cardDetails.variant,
				});
			}
			if (parsedData.setInfo.edition) {
				fallback.push({
					trait_type: "Edition",
					value: parsedData.setInfo.edition,
				});
			}
			if (parsedData.setInfo.rarity) {
				fallback.push({ trait_type: "Rarity", value: parsedData.setInfo.rarity });
			}
			traits = fallback;
		}

		if (!traits.length && !(isCourtyardNFT && parsedData?.grading.grade))
			return null;

		// Size-responsive styling
		const sizeStyles = {
			xs: { text: "text-[8px]", title: "text-[9px]", padding: "p-1" },
			sm: { text: "text-[9px]", title: "text-[10px]", padding: "p-1.5" },
			md: { text: "text-xs", title: "text-sm", padding: "p-2" },
			lg: { text: "text-sm", title: "text-base", padding: "p-2.5" },
			xl: { text: "text-base", title: "text-lg", padding: "p-3" },
		};

		const styles = sizeStyles[size || "md"];

		// parsedData already computed above

		// Limit traits shown when collapsed
		const maxCollapsedTraits = size === "xs" ? 2 : size === "sm" ? 3 : 4;
		const visibleTraits = isExpanded
			? traits
			: traits.slice(0, maxCollapsedTraits);

		// For Courtyard NFTs, add grading info as the first trait if available
		const allTraitsToShow =
			isCourtyardNFT && parsedData?.grading.grade
				? [
					{
						trait_type: "Grade",
						value: formatGradeDisplay(
							parsedData.grading.grade,
							parsedData.grading.company,
							parsedData.grading.fullGrade,
						),
					},
					...visibleTraits,
				]
				: visibleTraits;

		const adjustedMaxCollapsed =
			isCourtyardNFT && parsedData?.grading.grade
				? maxCollapsedTraits + 1 // Add one more to account for grade
				: maxCollapsedTraits;

		const finalVisibleTraits = isExpanded
			? allTraitsToShow
			: allTraitsToShow.slice(0, adjustedMaxCollapsed);
		const finalHasMoreTraits = allTraitsToShow.length > adjustedMaxCollapsed;

		return (
			<div className="space-y-1">
				{/* Traits Grid */}
				<div
					className={cn(
						"bg-white/5 backdrop-blur-md rounded-xl border border-white/20",
						styles.padding,
					)}
				>
					<div className="flex items-center justify-between mb-1">
						<span
							className={cn(
								"text-white/70 font-medium uppercase tracking-wide",
								styles.title,
							)}
						>
							{isCourtyardNFT ? "Details" : "Traits"}
						</span>
						{enableExpansion && finalHasMoreTraits && (
							<button
								type="button"
								onClick={onToggle}
								className={cn(
									"text-white/60 hover:text-white/90 transition-colors",
									styles.text,
								)}
							>
								{isExpanded
									? "Less"
									: `+${allTraitsToShow.length - adjustedMaxCollapsed}`}
							</button>
						)}
					</div>

					<AnimatePresence>
						<motion.div
							layout
							className="grid grid-cols-1 gap-1"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
						>
							{finalVisibleTraits.map((trait, index) => (
								<motion.div
									key={`${trait.trait_type}-${index}`}
									layout
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ delay: index * 0.05 }}
									className="flex justify-between items-center"
								>
									<span className={cn("text-white/80", styles.text)}>
										{trait.trait_type}:
									</span>
									<span className={cn("text-white font-medium", styles.text)}>
										{typeof trait.value === "string"
											? trait.value.length > 15
												? `${trait.value.slice(0, 15)}...`
												: trait.value
											: trait.value}
									</span>
								</motion.div>
							))}
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
		);
	};

// Main unified NFT card component
export const UnifiedNFTCard = memo<UnifiedNFTCardProps>(
	({
		collection,
		tokenId,
		className,
		onClick,
		imageUrl,
		animate = true,
		appraisalContractAddress,
		rarity,
		showAppraisal = true,
		priority = 0,
		size = "md",
		variant = "detailed",
		enableTraitExpansion = true,
		collectionName,
		extraDetails,
		rewardsSlot,
		actionSlot,
		appraisalOverride,
		protocolTreasuryAddress,
		gachaId,
	}) => {
		const isInteractive = !!onClick;
		const [traitsExpanded, setTraitsExpanded] = useState(false);

		// Get NFT metadata with optimizations
		const nftData = useNFTMetadata(collection, tokenId, {
			enabled: true,
			skipFetch: false,
		});

		// Get collection name from contract
		const { data: contractCollectionName } = useReadErc721Name({
			address: collection as `0x${string}`,
			query: {
				staleTime: 300000, // Cache for 5 minutes
				gcTime: 600000, // Keep in cache for 10 minutes
			},
		});

		// Robust Courtyard detection: prefer tokenURI, fallback to metadata signals
		const metadataLooksCourtyard = useMemo(() => {
			const md = nftData.metadata as CourtyardMetadata | null;
			if (!md) return false;
			if (
				md.grading_company !== undefined ||
				md.cert_number !== undefined ||
				md.set !== undefined ||
				md.card_number !== undefined ||
				md.category !== undefined
			) {
				return true;
			}
			if (Array.isArray(md.attributes)) {
				const lower = md.attributes.map(
					(a) => a.trait_type?.toLowerCase() || "",
				);
				const keys = [
					"grader",
					"grade",
					"card number",
					"set",
					"category",
					"title/subject",
				];
				return keys.some((k) => lower.some((t) => t.includes(k)));
			}
			return false;
		}, [nftData.metadata]);

		const isCourtyardNFT =
			isCourtyardTokenURI(nftData.tokenURI || "") || metadataLooksCourtyard;

		// Get rarity theming
		const rarityConfig = rarity ? getRarityConfig(rarity) : null;

		// For Courtyard NFTs, parse structured data
		const parsedData =
			isCourtyardNFT && nftData.metadata
				? parseCourtyardMetadata(nftData.metadata as CourtyardMetadata)
				: null;

		// Determine NFT name/title
		const nftName = useMemo(() => {
			if (isCourtyardNFT && parsedData) {
				return (
					formatCardTitle(
						parsedData.cardDetails.title || nftData.metadata?.name,
						parsedData.setInfo.cardNumber,
						parsedData.cardDetails.category,
						nftData.metadata as CourtyardMetadata,
					) || `Token ${formatTokenId(tokenId)}`
				);
			}
			return nftData.metadata?.name || `Token ${formatTokenId(tokenId)}`;
		}, [isCourtyardNFT, parsedData, nftData.metadata, tokenId]);

		// Get gacha config for buyback vault if not provided
		const gachaConfig = gachaId ? getGachaConfig(gachaId) : null;
		const finalProtocolTreasuryAddress = protocolTreasuryAddress || gachaConfig?.protocolTreasuryAddress;

	// Create redemption action if treasury is available - simplified version
		const redemptionAction = finalProtocolTreasuryAddress ? (
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3, duration: 0.3 }}
			>
				<SellToTreasury
					collection={collection}
					tokenId={tokenId}
					appraisalContractAddress={appraisalContractAddress}
					protocolTreasuryAddress={finalProtocolTreasuryAddress}
					gachaTreasuryAddress={gachaConfig?.treasuryAddress as `0x${string}` || ""}
					size="md"
					variant="button"
					onSuccess={(txHash) => {
						console.log("NFT sold successfully:", txHash);
					}}
				/>
			</motion.div>
		) : null;

		// Merge custom actionSlot with redemption actions
		const finalActionSlot = (
			<div className="flex flex-col gap-2 items-center justify-center">
				{actionSlot}
				{redemptionAction}
			</div>
		);

		// Variant configurations - always show traits when size allows
		const variantConfig = useMemo(() => {
			const configs = {
				minimal: {
					showTokenId: false,
					showContract: false,
					showAppraisal: false,
					showTraits: size !== "xs",
					padding: size === "xs" ? "p-1" : "p-2",
				},
				compact: {
					showTokenId: size !== "xs",
					showContract: false,
					showAppraisal: size !== "xs" && size !== "sm",
					showTraits: size !== "xs",
					padding: size === "xs" ? "p-1.5" : "p-2",
				},
				detailed: {
					showTokenId: true,
					showContract: size !== "xs" && size !== "sm",
					showAppraisal: true,
					showTraits: size !== "xs",
					padding: size === "xs" ? "p-2" : size === "sm" ? "p-2.5" : "p-3",
				},
				showcase: {
					showTokenId: true,
					showContract: true,
					showAppraisal: true,
					showTraits: true,
					padding: size === "xs" ? "p-2" : size === "sm" ? "p-3" : "p-4",
				},
			};
			return configs[variant];
		}, [variant, size]);

		// Animation variants optimized for performance
		const cardVariants = useMemo(
			() => ({
				hover: animate
					? {
						scale: size === "xs" ? 1.1 : size === "sm" ? 1.05 : 1.02,
						transition: {
							type: "spring" as const,
							stiffness: 400,
							damping: 25,
						},
					}
					: {},
				tap: animate
					? {
						scale: size === "xs" ? 0.9 : size === "sm" ? 0.95 : 0.98,
						transition: {
							type: "spring" as const,
							stiffness: 500,
							damping: 30,
						},
					}
					: {},
			}),
			[animate, size],
		);

		// Size-based styling
		const sizeStyles = {
			xs: {
				text: "text-[9px]",
				tokenId: "text-[10px]",
				gap: "gap-0.5",
				name: "text-[10px]",
			},
			sm: {
				text: "text-[10px]",
				tokenId: "text-xs",
				gap: "gap-1",
				name: "text-xs",
			},
			md: {
				text: "text-xs",
				tokenId: "text-sm",
				gap: "gap-2",
				name: "text-sm",
			},
			lg: {
				text: "text-sm",
				tokenId: "text-base",
				gap: "gap-2.5",
				name: "text-base",
			},
			xl: {
				text: "text-base",
				tokenId: "text-lg",
				gap: "gap-3",
				name: "text-lg",
			},
		};

		const styles = sizeStyles[size];

		// Show skeleton while loading metadata
		if (nftData.isLoading && !nftData.tokenURI) {
			return (
				<div className={className}>
					<NFTLoadingPlaceholder
						size={
							size === "xs" || size === "sm"
								? "sm"
								: size === "xl"
									? "lg"
									: "md"
						}
						animate={animate}
						error={nftData.error}
					/>
				</div>
			);
		}

		const CardComponent = animate ? motion.div : "div";
		const motionProps = animate
			? {
				initial: { opacity: 0, y: 10, scale: 0.98 },
				animate: { opacity: 1, y: 0, scale: 1 },
				...(isInteractive && { whileHover: cardVariants.hover }),
				...(isInteractive && { whileTap: cardVariants.tap }),
				transition: { duration: 0.2, ease: "easeOut" as const },
			}
			: {};

		return (
			<CardComponent
				className={cn(
					"relative group",
					"backdrop-blur-xl rounded-xl shadow-lg overflow-hidden transition-all duration-200",
					isInteractive && "cursor-pointer",
					// Subtle rarity styling with glow effect only
					rarityConfig
						? `bg-white/8 border ${rarityConfig.borderColor}/40 hover:bg-white/12 hover:border-white/25 shadow-xl shadow-${rarityConfig.borderColor}/20`
						: "bg-white/8 border border-white/15 hover:bg-white/12 hover:border-white/25",
					variantConfig.padding,
					className,
				)}
				onClick={onClick}
				{...motionProps}
			>
				{/* Subtle glassmorphism background */}
				<div className="absolute inset-0 bg-gradient-to-br from-white/8 via-white/3 to-transparent" />

				<div className={cn("relative z-10 flex flex-col", styles.gap)}>
					{/* Header */}
					{(variantConfig.showContract || variantConfig.showTokenId) && (
						<div className="flex items-center justify-between">
							{variantConfig.showContract && (
								<div className="flex items-center gap-1">
									<div
										className={cn(
											"w-1 h-1 rounded-full animate-pulse",
											rarityConfig
												? `bg-gradient-to-r ${rarityConfig.bgGradient}/80`
												: "bg-gradient-to-r from-warning to-orange-400",
										)}
									/>
									<span
										className={cn(
											"font-semibold text-white/80 uppercase tracking-wider",
											styles.text,
										)}
									>
										{collectionName ||
											contractCollectionName ||
											formatAddress(collection)}
									</span>
								</div>
							)}
							{variantConfig.showTokenId && (
								<span
									className={cn(
										"font-bold text-white drop-shadow-sm",
										styles.tokenId,
									)}
								>
									{formatTokenId(tokenId)}
								</span>
							)}
						</div>
					)}

					{/* NFT Name/Title */}
					{(variant === "detailed" || variant === "showcase") && (
						<div className="text-center">
							<h3
								className={cn(
									"font-bold text-white drop-shadow-sm leading-tight",
									styles.name,
								)}
							>
								{nftName}
							</h3>
						</div>
					)}

					{/* NFT Image */}
					<div className="flex justify-center">
						<UnifiedNFTImage
							{...(imageUrl && { imageUrl })}
							tokenId={tokenId}
							size={size}
							{...(animate !== undefined && { animate })}
							{...(priority !== undefined && { priority })}
							{...(rarity && { rarity })}
							metadata={nftData.metadata}
							tokenURI={nftData.tokenURI}
							fallbackImageUrl={nftData.imageUrl}
						/>
					</div>

					{/* Traits Display */}
					{variantConfig.showTraits && !!nftData.metadata && (
						<UnifiedTraitDisplay
							key={`traits-${collection}-${tokenId}-${nftData.tokenURI || ""}`}
							metadata={nftData.metadata as NFTMetadata}
							size={size}
							isExpanded={traitsExpanded}
							onToggle={() => setTraitsExpanded(!traitsExpanded)}
							enableExpansion={enableTraitExpansion}
							isCourtyardNFT={isCourtyardNFT}
						/>
					)}

					{/* Appraisal */}
					{showAppraisal &&
						variantConfig.showAppraisal &&
						isValidAddress(appraisalContractAddress) &&
						!/^0x0{40}$/i.test(appraisalContractAddress) && (
							<UnifiedAppraisalDisplay
								collection={collection as `0x${string}`}
								tokenId={tokenId}
								appraisalContractAddress={appraisalContractAddress}
								size={size}
								{...(appraisalOverride && { override: appraisalOverride })}
							/>
						)}

					{/* Extra Details */}
					{extraDetails && extraDetails.length > 0 && (
						<div className="space-y-1">
							{extraDetails.map((detail) => (
								<div
									key={`${detail.label}:${detail.value}`}
									className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-2"
								>
									<p
										className={cn(
											"text-white/60 uppercase tracking-wide font-medium mb-1",
											styles.text,
										)}
									>
										{detail.label}
									</p>
									<p
										className={cn(
											"font-medium",
											detail.highlight ? "text-warning" : "text-white",
											styles.text,
										)}
									>
										{detail.value}
									</p>
								</div>
							))}
						</div>
					)}

					{/* Rewards Slot */}
					{rewardsSlot && <div className="mt-2">{rewardsSlot}</div>}

					{/* Action Slot */}
					{finalActionSlot && <div className="mt-2 flex justify-center">{finalActionSlot}</div>}
				</div>
			</CardComponent>
		);
	},
);
UnifiedNFTCard.displayName = "UnifiedNFTCard";

// Convenience exports for specific use cases

export const NFTGridCard = memo<UnifiedNFTCardProps>((props) => (
	<UnifiedNFTCard {...props} size="sm" variant="compact" />
));
NFTGridCard.displayName = "NFTGridCard";

export const NFTListCard = memo<UnifiedNFTCardProps>((props) => (
	<UnifiedNFTCard {...props} size="md" variant="detailed" />
));
NFTListCard.displayName = "NFTListCard";

export const NFTHeroCard = memo<UnifiedNFTCardProps>((props) => (
	<UnifiedNFTCard {...props} size="xl" variant="showcase" priority={10} />
));
NFTHeroCard.displayName = "NFTHeroCard";

// Main export removed: use UnifiedNFTCard directly or NFTHeroCard via index
