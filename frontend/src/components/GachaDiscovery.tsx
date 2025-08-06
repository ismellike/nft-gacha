"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { formatUnits } from "viem";
import { 
  useReadGachaTreasuryGetTreasuryItems,
  useReadGachaTreasuryIsGachaAvailable,
  useReadGachaTreasuryGetAllRarityCounts,
  useReadGachaTreasuryGetTotalItemsCount,
  useReadGachaSpinFee,
  useReadGachaFeeToken,
  useReadErc20Symbol,
  useReadErc20Decimals
} from "../generated";
import { env } from "../env";
import { ThemedIcon } from "../lib/icons";
import { GlassCard, GlassButton, GlassBadge, GachaCardSkeleton } from "./ui";
import { getAllActiveGachas, formatGachaAddress, type GachaConfig } from "../lib/gacha-config";

interface GachaInfo extends GachaConfig {
  isAvailable: boolean;
  totalNFTs: number;
  spinFee: string;
  feeTokenSymbol: string;
}

export default function GachaDiscovery() {
  const router = useRouter();
  const [gachaData, setGachaData] = useState<GachaInfo[]>([]);
  const gachas = getAllActiveGachas();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-7xl font-light mb-8 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-foreground via-warning to-orange-400 bg-clip-text text-transparent font-extralight">
              Discover
            </span>
            <br />
            <span className="text-foreground font-light">Card Collections</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto mb-8 leading-relaxed font-light">
            Explore our collection of provably fair trading card gacha systems.
            <br className="hidden sm:block" />
            Each collection features authentic graded cards with transparent rarity mechanics.
          </p>
          
          {/* Platform Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-warning mb-2">{gachas.length}</div>
              <div className="text-sm text-foreground/60 uppercase tracking-wide">Card Collections</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-warning mb-2">100%</div>
              <div className="text-sm text-foreground/60 uppercase tracking-wide">Provably Fair</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-warning mb-2">∞</div>
              <div className="text-sm text-foreground/60 uppercase tracking-wide">Possibilities</div>
            </div>
          </div>
        </motion.div>

        {/* Gacha Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {gachas.map((gacha, index) => (
            <motion.div
              key={gacha.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <GachaCard gacha={gacha} />
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <GlassCard variant="base" padding="lg" className="text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-warning/20 to-orange-400/20 rounded-full flex items-center justify-center">
                <ThemedIcon name="plus" size="xl" className="text-warning" />
              </div>
              <div>
                <h3 className="text-2xl font-medium text-foreground mb-3">More Card Collections Coming Soon</h3>
                <p className="text-foreground/70 max-w-2xl mx-auto">
                  We're constantly adding new trading card gacha experiences with unique themes, mechanics, and card collections. 
                  Stay tuned for more exciting opportunities!
                </p>
              </div>
              <GlassBadge variant="info">
                🚀 Next Launch: Q2 2024
              </GlassBadge>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

// Individual Gacha Card Component
function GachaCard({ gacha }: { gacha: GachaConfig }) {
  const router = useRouter();

  // Fetch gacha-specific data
  const { data: isAvailable, isLoading: isAvailableLoading } = useReadGachaTreasuryIsGachaAvailable({
    address: gacha.treasuryAddress as `0x${string}`,
  });

  const { data: totalItemsCount, isLoading: isTotalItemsLoading } = useReadGachaTreasuryGetTotalItemsCount({
    address: gacha.treasuryAddress as `0x${string}`,
  });

  const { data: rarityCounts, isLoading: isRarityCountsLoading } = useReadGachaTreasuryGetAllRarityCounts({
    address: gacha.treasuryAddress as `0x${string}`,
  });

  const { data: spinFee, isLoading: isSpinFeeLoading } = useReadGachaSpinFee({
    address: gacha.address as `0x${string}`,
  });

  const { data: feeToken, isLoading: isFeeTokenLoading } = useReadGachaFeeToken({
    address: gacha.address as `0x${string}`,
  });

  const { data: feeTokenSymbol, isLoading: isFeeTokenSymbolLoading } = useReadErc20Symbol({
    address: feeToken,
    query: { enabled: !!feeToken }
  });

  const { data: feeTokenDecimals, isLoading: isFeeTokenDecimalsLoading } = useReadErc20Decimals({
    address: feeToken,
    query: { enabled: !!feeToken }
  });

  const totalNFTs = totalItemsCount ? Number(totalItemsCount) : 0;

  const formattedSpinFee = spinFee && feeTokenDecimals && feeTokenSymbol ?
    `${formatUnits(spinFee, feeTokenDecimals)} ${feeTokenSymbol}` :
    "Loading...";

  const handleExplore = () => {
    router.push(`/gacha?id=${gacha.id}&section=spin`);
  };

  // Show skeleton while essential data is loading
  const isLoading = isAvailableLoading || isRarityCountsLoading || isSpinFeeLoading || isTotalItemsLoading;
  
  if (isLoading) {
    return <GachaCardSkeleton />;
  }

  return (
    <GlassCard 
      variant="interactive" 
      padding="none"
      animate={true}
      className="h-full overflow-hidden group"
    >
      {/* Header with gradient */}
      <div className={`bg-gradient-to-br ${gacha.theme} p-6 relative`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
                {gacha.title}
              </h3>
              <div className="flex items-center gap-2">
                <div 
                  className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-400' : 'bg-red-400'} shadow-lg`}
                  aria-hidden="true"
                ></div>
                <span className="text-white/90 text-sm font-medium drop-shadow">
                  <span className="sr-only">Status: </span>
                  {isAvailable ? 'Active' : 'Unavailable'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white drop-shadow-lg">
                {totalNFTs}
              </div>
              <div className="text-white/80 text-xs uppercase tracking-wide">
                Cards Available
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <p className="text-foreground/70 leading-relaxed">
          {gacha.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-content1/20 rounded-xl">
            <div className="text-lg font-bold text-foreground">
              {totalNFTs}
            </div>
            <div className="text-xs text-foreground/60 uppercase tracking-wide">
              Total Cards
            </div>
          </div>
          <div className="text-center p-3 bg-content1/20 rounded-xl">
            <div className="text-lg font-bold text-warning">
              {formattedSpinFee}
            </div>
            <div className="text-xs text-foreground/60 uppercase tracking-wide">
              Entry Fee
            </div>
          </div>
        </div>

        {/* Rarity Distribution Preview */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground/80">Card Distribution</div>
          <div className="grid grid-cols-5 gap-1">
            {rarityCounts?.map((count, index) => {
              const rarityColors = ['bg-gray-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400', 'bg-yellow-400'];
              return (
                <div key={index} className="text-center">
                  <div className={`h-2 ${rarityColors[index]} rounded-full mb-1`}></div>
                  <div className="text-xs text-foreground/60">
                    {Number(count)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <GlassButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleExplore}
            animate={true}
            aria-label={`Explore ${gacha.title} gacha with ${totalNFTs} cards available`}
            data-testid={`explore-gacha-${gacha.id}`}
          >
            <div className="flex items-center justify-center gap-2">
              <ThemedIcon name="eye" size="sm" />
              Explore Collection
            </div>
          </GlassButton>
          
          {!isAvailable && (
            <GlassBadge variant="warning" className="w-full text-center">
              <ThemedIcon name="clock" size="xs" className="mr-2" />
              Temporarily Unavailable
            </GlassBadge>
          )}
        </div>
      </div>
    </GlassCard>
  );
}