"use client";

import {
  useState,
  memo,
  useMemo,
  useCallback,
  lazy,
  Suspense,
  startTransition
} from "react";
import NextImage from "next/image";
import { motion } from "framer-motion";
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
const SellToTreasury = lazy(() => import("./SellToTreasury"));
const NFTLoadingPlaceholder = lazy(() => import("./NFTLoadingPlaceholder").then(module => ({ default: module.NFTLoadingPlaceholder })));

// Core Types - Simplified and focused
export interface NFTCardData {
  collection: string;
  tokenId: string;
  imageUrl?: string | undefined;
  rarity?: Rarity | undefined;
  appraisalOverride?: { hasAppraisal: boolean; priceUSD: bigint } | undefined;
}

export interface NFTCardProps {
  data: NFTCardData;
  // Visual customization
  size?: NFTCardSize;
  variant?: NFTCardVariant;
  theme?: NFTCardTheme;
  // Behavior
  interactive?: boolean;
  animate?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onClick?: (data: NFTCardData) => void;
  onSelectionChange?: (selected: boolean, data: NFTCardData) => void;
  // Content control
  showAppraisal?: boolean;
  showTraits?: boolean;
  showCollectionName?: boolean;
  maxTraitsVisible?: number;
  // Performance
  priority?: number;
  lazy?: boolean;
  // Actions
  actions?: NFTCardAction[];
  // Appraisal
  appraisalContractAddress?: `0x${string}`;
  protocolTreasuryAddress?: string;
  gachaId?: string;
  onBuybackSuccess?: (txHash: string) => void;
  // Styling
  className?: string;
  style?: React.CSSProperties;
}

export type NFTCardSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type NFTCardVariant = "minimal" | "compact" | "detailed" | "showcase" | "immersive";
export type NFTCardTheme = "glass" | "solid" | "neon" | "mono" | "cyber";

export interface NFTCardAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (data: NFTCardData) => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
}

// Enhanced Size System - Cards are taller with better spacing, slightly wider
const SIZE_CONFIG = {
  xs: {
    container: "w-32 h-36",
    image: "w-32 h-32", // Will fill container with object-cover
    text: "text-[8px]",
    title: "text-[9px]",
    padding: "p-2",
    radius: "rounded-lg",
    gap: "gap-2",
  },
  sm: {
    container: "w-48 h-52",
    image: "w-48 h-48", // Will fill container with object-cover
    text: "text-[9px]",
    title: "text-[10px]",
    padding: "p-2.5",
    radius: "rounded-xl",
    gap: "gap-2.5",
  },
  md: {
    container: "w-64 h-72",
    image: "w-64 h-64", // Will fill container with object-cover
    text: "text-xs",
    title: "text-sm",
    padding: "p-3.5",
    radius: "rounded-xl",
    gap: "gap-3",
  },
  lg: {
    container: "w-80 h-88",
    image: "w-80 h-80", // Will fill container with object-cover
    text: "text-sm",
    title: "text-base",
    padding: "p-4.5",
    radius: "rounded-2xl",
    gap: "gap-3.5",
  },
  xl: {
    container: "w-96 h-[28rem]",
    image: "w-96 h-96", // Will fill container with object-cover
    text: "text-base",
    title: "text-lg",
    padding: "p-6",
    radius: "rounded-2xl",
    gap: "gap-4.5",
  },
  "2xl": {
    container: "w-[28rem] h-[36rem]",
    image: "w-[28rem] h-[28rem]", // Will fill container with object-cover
    text: "text-lg",
    title: "text-xl",
    padding: "p-7",
    radius: "rounded-3xl",
    gap: "gap-6",
  },
} as const;

// Theme System - Modern and customizable
const THEME_CONFIG = {
  glass: {
    background: "bg-white/[0.08] backdrop-blur-xl",
    border: "border-white/[0.15]",
    hover: "hover:bg-white/[0.12] hover:border-white/[0.25]",
    shadow: "shadow-lg shadow-black/10",
    text: "text-white",
    textSecondary: "text-white/70",
  },
  solid: {
    background: "bg-gray-900/90",
    border: "border-gray-700",
    hover: "hover:bg-gray-800/90 hover:border-gray-600",
    shadow: "shadow-lg shadow-black/20",
    text: "text-white",
    textSecondary: "text-gray-300",
  },
  neon: {
    background: "bg-black/80 backdrop-blur-md",
    border: "border-cyan-500/30",
    hover: "hover:bg-cyan-950/20 hover:border-cyan-400/50",
    shadow: "shadow-lg shadow-cyan-500/20",
    text: "text-cyan-100",
    textSecondary: "text-cyan-300/70",
  },
  mono: {
    background: "bg-white/95 backdrop-blur-sm",
    border: "border-gray-200",
    hover: "hover:bg-white hover:border-gray-300",
    shadow: "shadow-lg shadow-gray-200/50",
    text: "text-gray-900",
    textSecondary: "text-gray-600",
  },
  cyber: {
    background: "bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20 backdrop-blur-xl",
    border: "border-purple-500/30",
    hover: "hover:from-purple-800/30 hover:via-pink-800/30 hover:to-blue-800/30 hover:border-purple-400/50",
    shadow: "shadow-lg shadow-purple-500/20",
    text: "text-purple-100",
    textSecondary: "text-purple-300/70",
  },
} as const;

// Performance-optimized appraisal display with smart caching
const AppraisalDisplay = memo<{
  data: NFTCardData;
  size: NFTCardSize;
  theme: NFTCardTheme;
  contractAddress: `0x${string}`;
  override?: NFTCardData["appraisalOverride"];
}>(({ data, size, theme, contractAddress, override }) => {
  const themeStyles = THEME_CONFIG[theme];
  const sizeStyles = SIZE_CONFIG[size];

  // Smart caching - skip calls if override is provided
  const shouldSkipAppraisalCall = !!override || !isValidAddress(contractAddress);

  const { data: hasAppraisal, isLoading: checkingAppraisal } = useReadNftAppraisalHasAppraisal({
    address: contractAddress,
    args: [data.collection as `0x${string}`, BigInt(data.tokenId)],
    query: {
      enabled: !shouldSkipAppraisalCall,
      staleTime: 300_000, // 5 minutes
      gcTime: 600_000, // 10 minutes
      retry: 1,
    },
  });

  const { data: appraisalPrice, isLoading: loadingPrice } = useReadNftAppraisalGetAppraisedPrice({
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
  const finalAppraisal = override || (appraisalPrice ? {
    hasAppraisal: !!hasAppraisal,
    priceUSD: Array.isArray(appraisalPrice) ? appraisalPrice[0] : appraisalPrice as bigint,
  } : null);

  const isLoading = override ? false : checkingAppraisal || loadingPrice;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-1">
        <motion.div
          className={cn("w-2 h-2 border-2 border-t-transparent rounded-full", themeStyles.textSecondary)}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className={cn(sizeStyles.text, themeStyles.textSecondary)}>Appraising...</span>
      </div>
    );
  }

  if (!finalAppraisal?.hasAppraisal || finalAppraisal.priceUSD <= 0n) {
    return (
      <span className={cn(sizeStyles.text, themeStyles.textSecondary)}>Not appraised</span>
    );
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
        <span className={cn(sizeStyles.text, "text-emerald-300 font-medium")}>Appraised</span>
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
  size: NFTCardSize;
  theme: NFTCardTheme;
  metadata: NFTMetadata | null;
  tokenURI: string | null;
  priority: boolean;
}>(({ data, size, theme, metadata, tokenURI, priority }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const rarityConfig = data.rarity !== undefined ? getRarityConfig(data.rarity) : null;
  const themeStyles = THEME_CONFIG[theme];
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
      <div className={cn(
        sizeStyles.container,
        sizeStyles.radius,
        "flex items-center justify-center border-2 border-dashed",
        themeStyles.border,
        themeStyles.background
      )}>
        <span className={cn(sizeStyles.text, themeStyles.textSecondary)}>No Image</span>
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
          rarityConfig && `border-[${rarityConfig.borderColor}/40]`
        )}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        style={{
          ...(rarityConfig && {
            boxShadow: 'none',
            transition: 'box-shadow 0.3s ease',
          }),
        }}
        whileHover={{
          ...(rarityConfig && {
            boxShadow: `0 0 15px 2px ${rarityConfig.hexColor}, 0 0 25px 4px ${rarityConfig.hexColor}40, 0 0 35px 6px ${rarityConfig.hexColor}20`,
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

        <div className={cn("relative w-full h-full overflow-hidden", sizeStyles.radius)}>
          <NextImage
            src={imageUrl}
            alt={metadata?.name || `NFT ${data.tokenId}`}
            fill
            className={cn(
              "object-cover transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            priority={priority}
            unoptimized={imageUrl.includes("courtyard.io")}
            onLoad={() => startTransition(() => setIsLoaded(true))}
            onError={() => setHasError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        </motion.div>
    </div>
  );
});
NFTImage.displayName = "NFTImage";

// Simplified traits display with better UX
const TraitsDisplay = memo<{
  metadata: NFTMetadata;
  size: NFTCardSize;
  theme: NFTCardTheme;
  maxVisible?: number;
  isCourtyard: boolean;
}>(({ metadata, size, theme, maxVisible = 4, isCourtyard }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const themeStyles = THEME_CONFIG[theme];
  const sizeStyles = SIZE_CONFIG[size];

  const traits = useMemo(() => {
    if (!metadata?.attributes) return [];

    return metadata.attributes
      .filter(attr => attr.trait_type && attr.value && attr.value !== "")
      .filter(attr => {
        const type = attr.trait_type.toLowerCase();
        // Filter out common unwanted traits
        const excludeTypes = ["description", "title", "name", "image", "external_url"];
        return !excludeTypes.some(exclude => type.includes(exclude));
      })
      .slice(0, isExpanded ? undefined : maxVisible);
  }, [metadata?.attributes, isExpanded, maxVisible]);

  if (traits.length === 0) return null;

  return (
    <motion.div
      className={cn(
        "border rounded-xl",
        themeStyles.border,
        themeStyles.background,
        sizeStyles.padding
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={cn(sizeStyles.text, "font-medium uppercase tracking-wide", themeStyles.textSecondary)}>
          {isCourtyard ? "Details" : "Traits"}
        </span>
        {traits.length > maxVisible && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(sizeStyles.text, themeStyles.textSecondary, "hover:text-white transition-colors")}
          >
            {isExpanded ? "Less" : `+${traits.length - maxVisible}`}
          </button>
        )}
      </div>

      <div className="space-y-1">
        {traits.map((trait, index) => (
          <motion.div
            key={`${trait.trait_type}-${index}`}
            className="flex justify-between items-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span className={cn(sizeStyles.text, themeStyles.textSecondary)}>
              {trait.trait_type}:
            </span>
            <span className={cn(sizeStyles.text, "font-medium truncate max-w-[60%]", themeStyles.text)}>
              {typeof trait.value === "string" && trait.value.length > 15
                ? `${trait.value.slice(0, 15)}...`
                : trait.value}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});
TraitsDisplay.displayName = "TraitsDisplay";

// Action buttons with improved UX
const ActionButtons = memo<{
  actions: NFTCardAction[];
  data: NFTCardData;
  size: NFTCardSize;
  theme: NFTCardTheme;
}>(({ actions, data, size, theme }) => {
  const themeStyles = THEME_CONFIG[theme];
  const sizeStyles = SIZE_CONFIG[size];

  if (actions.length === 0) return null;

  return (
    <div className="flex gap-2 justify-center">
      {actions.map((action) => (
        <motion.button
          key={action.id}
          type="button"
          onClick={() => action.onClick(data)}
          disabled={action.disabled || action.loading}
          className={cn(
            "px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-xs",
            "border backdrop-blur-sm",
            action.disabled && "opacity-50 cursor-not-allowed",
            action.variant === "primary" && "bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30",
            action.variant === "secondary" && "bg-white/10 border-white/20 text-white/80 hover:bg-white/20",
            action.variant === "danger" && "bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30",
            action.variant === "ghost" && "bg-transparent border-transparent text-white/60 hover:bg-white/10 hover:border-white/20"
          )}
          whileHover={{ scale: action.disabled ? 1 : 1.05 }}
          whileTap={{ scale: action.disabled ? 1 : 0.95 }}
        >
          {action.loading ? (
            <motion.div
              className="w-3 h-3 border-2 border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <span className="flex items-center gap-1">
              {action.icon}
              {action.label}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
});
ActionButtons.displayName = "ActionButtons";

// Main NFT Card Component - Completely redesigned
export const NFTCard = memo<NFTCardProps>(({
  data,
  size = "md",
  variant = "detailed",
  theme = "glass",
  interactive = false,
  animate = true,
  selectable = false,
  selected = false,
  onClick,
  onSelectionChange,
  showAppraisal = true,
  showTraits = true,
  showCollectionName = true,
  maxTraitsVisible = 4,
  priority = 0,
  lazy = true,
  actions = [],
  appraisalContractAddress,
  protocolTreasuryAddress,
  gachaId,
  onBuybackSuccess,
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
  const {
    rarityConfig,
    isCourtyardNFT,
    displayName,
    isUsingFallbackName,
    shouldShowAppraisal,
    shouldShowTraits,
    shouldShowCollectionName,
  } = useMemo(() => {
    const rarityConfig = data.rarity !== undefined ? getRarityConfig(data.rarity) : null;

    const isCourtyardNFT = isCourtyardTokenURI(nftData.tokenURI || "") ||
      (metadata && (metadata as CourtyardMetadata).grading_company !== undefined);

    const displayName = metadata?.name || `Token ${formatTokenId(data.tokenId)}`;
    const isUsingFallbackName = !metadata?.name;

    const variantConfig = {
      minimal: { appraisal: false, traits: false, collectionName: false },
      compact: { appraisal: size !== "xs", traits: size !== "xs", collectionName: false },
      detailed: { appraisal: true, traits: true, collectionName: true },
      showcase: { appraisal: true, traits: true, collectionName: true },
      immersive: { appraisal: true, traits: true, collectionName: true },
    };

    const config = variantConfig[variant];

    return {
      rarityConfig,
      isCourtyardNFT,
      displayName,
      isUsingFallbackName,
      shouldShowAppraisal: showAppraisal && config.appraisal,
      shouldShowTraits: showTraits && config.traits && !!metadata,
      shouldShowCollectionName: showCollectionName && config.collectionName,
    };
  }, [size, data.rarity, metadata, nftData.tokenURI, data.tokenId, variant, showAppraisal, showTraits, showCollectionName]);

  const themeStyles = THEME_CONFIG[theme];
  const sizeStyles = SIZE_CONFIG[size];

  // Enhanced click handler
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    if (selectable && onSelectionChange) {
      onSelectionChange(!selected, data);
    } else if (interactive && onClick) {
      onClick(data);
    }
  }, [selectable, onSelectionChange, selected, interactive, onClick, data]);

  // Loading state with better UX
  if (isLoading && !metadata?.tokenURI) {
    return (
      <div className={cn(sizeStyles.container, sizeStyles.radius, themeStyles.background, themeStyles.border, className)}>
        <Suspense fallback={<div className="animate-pulse bg-white/10 rounded-lg" />}>
          <NFTLoadingPlaceholder size={size === "xs" || size === "sm" ? "sm" : size === "xl" || size === "2xl" ? "lg" : "md"} />
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
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className={cn(sizeStyles.text, themeStyles.textSecondary)}>Error loading NFT</span>
      </motion.div>
    );
  }

  const MotionComponent = animate ? motion.div : "div";
  const motionProps = animate ? {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 },
    transition: { duration: 0.3, ease: "easeOut" },
    layout: true,
  } : {};

  return (
    <MotionComponent
      className={cn(
        "relative group transition-all duration-300",
        sizeStyles.radius,
        themeStyles.background,
        themeStyles.border,
        themeStyles.shadow,
        (interactive || selectable) && "cursor-pointer",
        (interactive || selectable) && themeStyles.hover,
        selectable && selected && "ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent",
        sizeStyles.padding,
        className
      )}
      style={style as any}
      onClick={handleClick}
      {...motionProps}
    >
      {/* Selection indicator */}
      {selectable && (
        <motion.div
          className="absolute top-2 right-2 z-20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: selected ? 1 : 0.7, scale: selected ? 1 : 0.8 }}
          whileHover={{ scale: 1.1 }}
        >
          <div className={cn(
            "w-4 h-4 rounded-full border-2 backdrop-blur-sm",
            selected
              ? "bg-blue-500 border-blue-400"
              : "bg-white/10 border-white/30"
          )}>
            {selected && (
              <motion.svg
                className="w-full h-full text-white p-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </motion.svg>
            )}
          </div>
        </motion.div>
      )}

      {/* Rarity indicator */}
      {rarityConfig && (
        <motion.div
          className={cn(
            "absolute top-2 left-2 w-3 h-3 rounded-full",
            `bg-gradient-to-r ${rarityConfig.bgGradient}`
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      <div className={cn("flex flex-col", sizeStyles.gap)}>
        {/* Collection name */}
        {shouldShowCollectionName && (
          <div className="flex items-center justify-between">
            <span className={cn(
              sizeStyles.text,
              "font-medium uppercase tracking-wide truncate flex-1",
              themeStyles.textSecondary,
              rarityConfig ? "pl-6" : "" // Add left padding when rarity indicator is present
            )}>
              {collectionName || formatAddress(data.collection)}
            </span>
            <span className={cn(
              sizeStyles.text,
              "font-bold ml-2",
              themeStyles.text
            )}>
              {formatTokenId(data.tokenId)}
            </span>
          </div>
        )}

        {/* NFT Image */}
        <div className="flex justify-center">
          <NFTImage
            data={data}
            size={size}
            theme={theme}
            metadata={metadata}
            tokenURI={nftData.tokenURI || null}
            priority={priority > 7}
          />
        </div>

        {/* NFT Name */}
        {variant !== "minimal" && (
          <h3 className={cn(
            "font-bold text-center leading-tight break-words hyphens-auto",
            sizeStyles.title,
            themeStyles.text
          )}>
            {displayName}
          </h3>
        )}

        {/* Traits */}
        {shouldShowTraits && (
          <TraitsDisplay
            metadata={metadata}
            size={size}
            theme={theme}
            maxVisible={maxTraitsVisible}
            isCourtyard={isCourtyardNFT}
          />
        )}

        {/* Appraisal */}
        {shouldShowAppraisal && appraisalContractAddress && (
          <AppraisalDisplay
            data={data}
            size={size}
            theme={theme}
            contractAddress={appraisalContractAddress}
            override={data.appraisalOverride}
          />
        )}

        {/* Action buttons */}
        {actions.length > 0 && (
          <ActionButtons
            actions={actions}
            data={data}
            size={size}
            theme={theme}
          />
        )}
      </div>
    </MotionComponent>
  );
});
NFTCard.displayName = "NFTCard";

// Convenience exports with better defaults
export const CompactNFTCard = memo<Omit<NFTCardProps, "size" | "variant">>((props) => (
  <NFTCard {...props} size="sm" variant="compact" />
));
CompactNFTCard.displayName = "CompactNFTCard";

export const StandardNFTCard = memo<Omit<NFTCardProps, "size" | "variant">>((props) => (
  <NFTCard {...props} size="md" variant="detailed" />
));
StandardNFTCard.displayName = "StandardNFTCard";

export const ShowcaseNFTCard = memo<Omit<NFTCardProps, "size" | "variant">>((props) => (
  <NFTCard {...props} size="xl" variant="showcase" priority={10} />
));
ShowcaseNFTCard.displayName = "ShowcaseNFTCard";

export const ImmersiveNFTCard = memo<Omit<NFTCardProps, "size" | "variant">>((props) => (
  <NFTCard {...props} size="2xl" variant="immersive" priority={10} />
));
ImmersiveNFTCard.displayName = "ImmersiveNFTCard";

export default NFTCard;