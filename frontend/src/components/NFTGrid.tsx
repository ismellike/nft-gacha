"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  startTransition,
  useRef,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/theme-config";
import { NFTCard, type NFTCardData, type NFTCardSize, type NFTCardTheme } from "./NFTCard";

// Enhanced Grid Types
export interface NFTGridItem extends NFTCardData {
  id: string; // Unique identifier for the grid
  index?: number; // Position in grid
}

export type NFTGridLayout = "masonry" | "grid" | "list" | "carousel";
export type NFTGridSize = "compact" | "comfortable" | "spacious" | "immersive";
export type NFTGridTheme = NFTCardTheme;

export interface NFTGridProps {
  items: NFTGridItem[];
  // Layout
  layout?: NFTGridLayout;
  size?: NFTGridSize;
  theme?: NFTGridTheme;
  columns?: number | "auto";
  gap?: "sm" | "md" | "lg" | "xl";
  // Content
  showAppraisal?: boolean;
  showTraits?: boolean;
  maxTraitsVisible?: number;
  // Performance
  virtualize?: boolean;
  virtualizeThreshold?: number;
  lazyLoad?: boolean;
  preloadCount?: number;
  batchSize?: number;
  animate?: boolean;
  // Interaction
  selectable?: boolean;
  multiSelect?: boolean;
  onSelectionChange?: (selectedItems: NFTGridItem[]) => void;
  onItemClick?: (item: NFTGridItem) => void;
  // Actions
  itemActions?: Array<(item: NFTGridItem) => import("./NFTCard").NFTCardAction>;
  // Appraisal
  appraisalContractAddress?: `0x${string}`;
  protocolTreasuryAddress?: string;
  gachaId?: string;
  onBuybackSuccess?: (txHash: string) => void;
  // UI
  header?: ReactNode;
  footer?: ReactNode;
  emptyState?: ReactNode;
  loadingState?: ReactNode;
  errorState?: ReactNode;
  // Pagination
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  // Styling
  className?: string;
  style?: React.CSSProperties;
}

// Advanced Virtualization Hook
function useVirtualization(
  items: NFTGridItem[],
  enabled: boolean,
  threshold: number,
  containerHeight: number,
  itemHeight: number,
  batchSize: number,
) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: batchSize });
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || items.length <= threshold) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      const newScrollTop = target.scrollTop;
      setScrollTop(newScrollTop);

      const start = Math.floor(newScrollTop / itemHeight);
      const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + 1, items.length);

      startTransition(() => {
        setVisibleRange({ start: Math.max(0, start - 5), end: Math.min(end + 5, items.length) });
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [enabled, items.length, threshold, containerHeight, itemHeight]);

  const visibleItems = useMemo(() => {
    if (!enabled || items.length <= threshold) return items;
    return items.slice(visibleRange.start, visibleRange.end);
  }, [enabled, items, visibleRange, threshold]);

  const totalHeight = enabled ? items.length * itemHeight : "auto";

  return { visibleItems, totalHeight, containerRef, scrollTop };
}

// Selection Management Hook
function useSelection(
  items: NFTGridItem[],
  multiSelect: boolean,
  onSelectionChange?: (selectedItems: NFTGridItem[]) => void,
) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.has(item.id));
  }, [items, selectedIds]);

  const handleSelectionChange = useCallback((itemId: string, selected: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        if (multiSelect) {
          newSet.add(itemId);
        } else {
          return new Set([itemId]);
        }
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  }, [multiSelect]);

  useEffect(() => {
    onSelectionChange?.(selectedItems);
  }, [selectedItems, onSelectionChange]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return { selectedIds, handleSelectionChange, selectedItems, clearSelection };
}

// Grid Configuration System - Adjusted for larger images and cards
const GRID_CONFIG = {
  compact: {
    grid: { columns: 4, cardSize: "sm" as NFTCardSize, gap: "sm" },
    masonry: { columns: 5, cardSize: "sm" as NFTCardSize, gap: "sm" },
    list: { cardSize: "sm" as NFTCardSize, gap: "sm" },
    carousel: { cardSize: "md" as NFTCardSize, gap: "md" },
  },
  comfortable: {
    grid: { columns: 3, cardSize: "sm" as NFTCardSize, gap: "md" },
    masonry: { columns: 4, cardSize: "sm" as NFTCardSize, gap: "md" },
    list: { cardSize: "md" as NFTCardSize, gap: "md" },
    carousel: { cardSize: "md" as NFTCardSize, gap: "lg" },
  },
  spacious: {
    grid: { columns: 2, cardSize: "md" as NFTCardSize, gap: "lg" },
    masonry: { columns: 3, cardSize: "md" as NFTCardSize, gap: "lg" },
    list: { cardSize: "lg" as NFTCardSize, gap: "lg" },
    carousel: { cardSize: "lg" as NFTCardSize, gap: "xl" },
  },
  immersive: {
    grid: { columns: 2, cardSize: "lg" as NFTCardSize, gap: "xl" },
    masonry: { columns: 3, cardSize: "lg" as NFTCardSize, gap: "xl" },
    list: { cardSize: "xl" as NFTCardSize, gap: "xl" },
    carousel: { cardSize: "xl" as NFTCardSize, gap: "xl" },
  },
} as const;

const GAP_CONFIG = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
} as const;

// Virtualized Grid Item
const VirtualizedGridItem = memo<{
  item: NFTGridItem;
  index: number;
  size: NFTCardSize;
  theme: NFTCardTheme;
  selectable: boolean;
  selected: boolean;
  onSelectionChange: (itemId: string, selected: boolean) => void;
  onClick: (item: NFTGridItem) => void;
  actions: Array<(item: NFTGridItem) => import("./NFTCard").NFTCardAction>;
  showAppraisal: boolean;
  showTraits: boolean;
  maxTraitsVisible: number;
  appraisalContractAddress?: `0x${string}`;
  protocolTreasuryAddress?: string;
  gachaId?: string;
  onBuybackSuccess?: (txHash: string) => void;
  lazy: boolean;
  priority: number;
  animate: boolean;
}>(({
  item,
  index,
  size,
  theme,
  selectable,
  selected,
  onSelectionChange,
  onClick,
  actions,
  showAppraisal,
  showTraits,
  maxTraitsVisible,
  appraisalContractAddress,
  protocolTreasuryAddress,
  gachaId,
  onBuybackSuccess,
  lazy,
  priority,
  animate,
}) => {
  const itemActions = useMemo(() => actions.map(actionFn => actionFn(item)), [actions, item]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        duration: 0.3,
        delay: animate ? index * 0.05 : 0,
        ease: "easeOut"
      }}
    >
      <NFTCard
        data={item}
        size={size}
        variant="detailed"
        theme={theme}
        selectable={selectable}
        selected={selected}
        onSelectionChange={(selected) => onSelectionChange(item.id, selected)}
        onClick={() => onClick(item)}
        actions={itemActions}
        showAppraisal={showAppraisal}
        showTraits={showTraits}
        maxTraitsVisible={maxTraitsVisible}
        appraisalContractAddress={appraisalContractAddress}
        protocolTreasuryAddress={protocolTreasuryAddress}
        gachaId={gachaId}
        onBuybackSuccess={onBuybackSuccess}
        lazy={lazy}
        priority={priority}
        animate={animate}
      />
    </motion.div>
  );
});
VirtualizedGridItem.displayName = "VirtualizedGridItem";

// Main NFT Grid Component
export const NFTGrid = memo<NFTGridProps>(({
  items,
  layout = "grid",
  size = "comfortable",
  theme = "glass",
  columns: customColumns,
  gap = "md",
  showAppraisal = true,
  showTraits = true,
  maxTraitsVisible = 4,
  virtualize = true,
  virtualizeThreshold = 50,
  lazyLoad = true,
  preloadCount = 20,
  batchSize = 20,
  animate = true,
  selectable = false,
  multiSelect = false,
  onSelectionChange,
  onItemClick,
  itemActions = [],
  appraisalContractAddress,
  protocolTreasuryAddress,
  gachaId,
  onBuybackSuccess,
  header,
  footer,
  emptyState,
  loadingState,
  errorState,
  itemsPerPage,
  currentPage: controlledPage,
  onPageChange,
  className,
  style,
}) => {
  const [internalPage, setInternalPage] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPage = controlledPage !== undefined ? controlledPage : internalPage;
  const setCurrentPage = onPageChange || setInternalPage;

  // Grid configuration
  const config = useMemo(() => {
    const baseConfig = GRID_CONFIG[size][layout];
    const cardSize = baseConfig.cardSize;

    let columns = customColumns || (baseConfig as any).columns || 3;
    if (columns === "auto") {
      columns = layout === "grid" ? 3 : layout === "masonry" ? 4 : 1;
    }

    return { ...baseConfig, columns: columns as number, cardSize };
  }, [size, layout, customColumns]);

  // Pagination
  const paginatedItems = useMemo(() => {
    if (!itemsPerPage) return items;
    const start = currentPage * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, itemsPerPage, currentPage]);

  // Virtualization
  const itemHeight = config.cardSize === "xs" ? 160 :
                    config.cardSize === "sm" ? 240 :
                    config.cardSize === "md" ? 380 :
                    config.cardSize === "lg" ? 520 : 720;

  const {
    visibleItems,
    containerRef: virtualContainerRef,
  } = useVirtualization(
    paginatedItems,
    virtualize,
    virtualizeThreshold,
    containerHeight,
    itemHeight,
    batchSize
  );

  // Selection management
  const { selectedIds, handleSelectionChange, selectedItems, clearSelection } = useSelection(
    paginatedItems,
    multiSelect,
    onSelectionChange
  );

  // Update container height
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Calculate priority for items
  const getItemPriority = useCallback((index: number) => {
    if (index < preloadCount) return 10;
    if (index < preloadCount * 2) return 7;
    if (index < preloadCount * 3) return 5;
    return 1;
  }, [preloadCount]);

  // Responsive columns - using static Tailwind classes
  const responsiveColumns = useMemo(() => {
    const baseCols = typeof config.columns === "number" ? config.columns : 3;

    // Map column count to appropriate static Tailwind classes
    if (baseCols === 1) {
      return "grid-cols-1";
    } else if (baseCols === 2) {
      return "grid-cols-1 sm:grid-cols-2";
    } else if (baseCols === 3) {
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    } else if (baseCols === 4) {
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    } else if (baseCols === 5) {
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    } else if (baseCols === 6) {
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";
    } else {
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"; // fallback
    }
  }, [config.columns]);

  // Grid content
  const gridContent = useMemo(() => {
    if (items.length === 0) {
      return emptyState || (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-white/50 text-lg mb-2">No NFTs found</div>
          <div className="text-white/30 text-sm">Try adjusting your filters</div>
        </div>
      );
    }

    const itemsToRender = virtualize ? visibleItems : paginatedItems;

    return (
      <div
        className={cn(
          layout === "grid" && "grid",
          layout === "grid" && responsiveColumns,
          layout === "masonry" && "columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5",
          layout === "list" && "space-y-4",
          layout === "carousel" && "flex gap-6 overflow-x-auto pb-4",
          GAP_CONFIG[gap],
          className
        )}
        style={style}
      >
        <AnimatePresence mode="popLayout">
          {itemsToRender.map((item, index) => {
            const itemIndex = itemsPerPage ? currentPage * itemsPerPage + index : index;

            return (
              <VirtualizedGridItem
                key={item.id}
                item={item}
                index={itemIndex}
                size={config.cardSize}
                theme={theme}
                selectable={selectable}
                selected={selectedIds.has(item.id)}
                onSelectionChange={handleSelectionChange}
                onClick={onItemClick || (() => {})}
                actions={itemActions}
                showAppraisal={showAppraisal}
                showTraits={showTraits}
                maxTraitsVisible={maxTraitsVisible}
                appraisalContractAddress={appraisalContractAddress}
                protocolTreasuryAddress={protocolTreasuryAddress}
                gachaId={gachaId}
                onBuybackSuccess={onBuybackSuccess}
                lazy={lazyLoad}
                priority={getItemPriority(itemIndex)}
                animate={true}
              />
            );
          })}
        </AnimatePresence>
      </div>
    );
  }, [
    items,
    emptyState,
    virtualize,
    visibleItems,
    paginatedItems,
    layout,
    responsiveColumns,
    GAP_CONFIG[gap],
    className,
    style,
    config.cardSize,
    theme,
    selectable,
    selectedIds,
    handleSelectionChange,
    onItemClick,
    itemActions,
    showAppraisal,
    showTraits,
    maxTraitsVisible,
    appraisalContractAddress,
    protocolTreasuryAddress,
    gachaId,
    onBuybackSuccess,
    lazyLoad,
    getItemPriority,
    currentPage,
    itemsPerPage,
  ]);

  // Pagination controls
  const paginationControls = useMemo(() => {
    if (!itemsPerPage || items.length <= itemsPerPage) return null;

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const hasNext = currentPage < totalPages - 1;
    const hasPrev = currentPage > 0;

    return (
      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={!hasPrev}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-all duration-200",
            "bg-white/10 border border-white/20 text-white/80",
            "hover:bg-white/20 hover:border-white/30",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let page;
            if (totalPages <= 5) {
              page = i;
            } else if (currentPage < 2) {
              page = i;
            } else if (currentPage > totalPages - 3) {
              page = totalPages - 5 + i;
            } else {
              page = currentPage - 2 + i;
            }

            return (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-10 h-10 rounded-lg font-medium transition-all duration-200",
                  page === currentPage
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                )}
              >
                {page + 1}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={!hasNext}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-all duration-200",
            "bg-white/10 border border-white/20 text-white/80",
            "hover:bg-white/20 hover:border-white/30",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          Next
        </button>
      </div>
    );
  }, [itemsPerPage, items.length, currentPage, setCurrentPage]);

  // Selection toolbar
  const selectionToolbar = useMemo(() => {
    if (!selectable || selectedItems.length === 0) return null;

    return (
      <motion.div
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 flex items-center gap-4">
          <span className="text-white font-medium">
            {selectedItems.length} selected
          </span>
          <button
            type="button"
            onClick={clearSelection}
            className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/20 transition-colors"
          >
            Clear Selection
          </button>
        </div>
      </motion.div>
    );
  }, [selectable, selectedItems]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Header */}
      {header && (
        <div className="mb-6">
          {header}
        </div>
      )}

      {/* Grid Content */}
      <div
        ref={virtualContainerRef}
        className={cn(
          "relative",
          virtualize && items.length > virtualizeThreshold && "overflow-y-auto"
        )}
        style={{ height: virtualize && items.length > virtualizeThreshold ? containerHeight : "auto" }}
      >
        {gridContent}
      </div>

      {/* Pagination */}
      {paginationControls}

      {/* Footer */}
      {footer && (
        <div className="mt-8">
          {footer}
        </div>
      )}

      {/* Selection Toolbar */}
      <AnimatePresence>
        {selectionToolbar}
      </AnimatePresence>
    </div>
  );
});
NFTGrid.displayName = "NFTGrid";

// Convenience exports
export const CompactNFTGrid = memo<Omit<NFTGridProps, "size" | "layout">>((props) => (
  <NFTGrid {...props} size="compact" layout="grid" />
));
CompactNFTGrid.displayName = "CompactNFTGrid";

export const StandardNFTGrid = memo<Omit<NFTGridProps, "size" | "layout">>((props) => (
  <NFTGrid {...props} size="comfortable" layout="grid" />
));
StandardNFTGrid.displayName = "StandardNFTGrid";

export const ShowcaseNFTGrid = memo<Omit<NFTGridProps, "size" | "layout">>((props) => (
  <NFTGrid {...props} size="spacious" layout="masonry" />
));
ShowcaseNFTGrid.displayName = "ShowcaseNFTGrid";

// Hook for converting treasury data to grid items
export function useTreasuryItemsToGridItems(
  treasuryItems:
    | readonly {
        collection: string;
        tokenId: bigint;
        depositor: string;
        [key: string]: unknown;
      }[]
    | undefined,
  rarity?: import("./NFTCard").Rarity,
): NFTGridItem[] {
  return useMemo(() => {
    if (!treasuryItems) return [];

    return treasuryItems.map((item, index) => ({
      id: `${item.collection}-${item.tokenId.toString()}`,
      collection: item.collection,
      tokenId: item.tokenId.toString(),
      rarity: rarity || 0, // Default to Common (Rarity.Common = 0) if no rarity specified
      priority: index < 20 ? 8 : index < 50 ? 5 : 2, // Higher priority for first items
    }));
  }, [treasuryItems, rarity]);
}

export default NFTGrid;