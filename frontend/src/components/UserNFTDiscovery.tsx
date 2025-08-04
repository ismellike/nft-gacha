"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { 
  useReadGachaTreasuryGetWhitelistedCollections,
  useReadGachaTreasuryIsGachaAvailable,
  useReadErc721BalanceOf,
  useReadErc721Name,
  useReadErc721Symbol
} from "../generated";
import { env } from "../env";
import { ThemedIcon } from "../lib/icons";
import { GlassCard, GlassButton, GlassBadge } from "./ui";

interface NFTItem {
  collection: string;
  tokenId: string;
  collectionName: string;
  collectionSymbol: string;
}

interface CollectionInfo {
  address: string;
  name: string;
  symbol: string;
  userBalance: number;
  nfts: NFTItem[];
}

export default function UserNFTDiscovery() {
  const { address: userAddress, isConnected } = useAccount();
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Get whitelisted collections
  const { data: whitelistedCollections, refetch: refetchWhitelist } = 
    useReadGachaTreasuryGetWhitelistedCollections({
      address: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
    });

  // Check if gacha is available
  const { data: isGachaAvailable } = useReadGachaTreasuryIsGachaAvailable({
    address: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
  });

  // Fetch user's NFTs from whitelisted collections
  useEffect(() => {
    if (!userAddress || !whitelistedCollections || whitelistedCollections.length === 0) {
      setCollections([]);
      return;
    }

    const fetchUserNFTs = async () => {
      setLoading(true);
      const collectionData: CollectionInfo[] = [];

      for (const collectionAddress of whitelistedCollections) {
        try {
          // Get collection metadata (we'll need to make these calls)
          // Note: In a real app, you'd want to batch these or use a more efficient method
          
          const collectionInfo: CollectionInfo = {
            address: collectionAddress,
            name: "NFT Collection", // Placeholder - would get from contract
            symbol: "NFT", // Placeholder - would get from contract
            userBalance: 0,
            nfts: []
          };

          collectionData.push(collectionInfo);
        } catch (error) {
          console.error(`Error fetching data for collection ${collectionAddress}:`, error);
        }
      }

      setCollections(collectionData);
      setLoading(false);
    };

    fetchUserNFTs();
  }, [userAddress, whitelistedCollections]);

  if (!isConnected) {
    return (
      <GlassCard className="text-center" padding="lg">
        <div className="space-y-4">
          <ThemedIcon name="wallet" size="xl" className="mx-auto text-foreground/60" />
          <h3 className="text-xl font-medium text-foreground">
            Connect Your Wallet
          </h3>
          <p className="text-foreground/70">
            Connect your wallet to discover NFTs you can deposit into the gacha system
          </p>
        </div>
      </GlassCard>
    );
  }

  if (!isGachaAvailable) {
    return (
      <GlassCard className="text-center" padding="lg">
        <div className="space-y-4">
          <ThemedIcon name="x-circle" size="xl" className="mx-auto text-warning" />
          <h3 className="text-xl font-medium text-foreground">
            Gacha System Unavailable
          </h3>
          <p className="text-foreground/70">
            The gacha system is currently unavailable. No collections are whitelisted or no NFTs are available.
          </p>
          <GlassBadge variant="warning">
            Contact the admin to whitelist NFT collections
          </GlassBadge>
        </div>
      </GlassCard>
    );
  }

  if (!whitelistedCollections || whitelistedCollections.length === 0) {
    return (
      <GlassCard className="text-center" padding="lg">
        <div className="space-y-4">
          <ThemedIcon name="archive" size="xl" className="mx-auto text-foreground/60" />
          <h3 className="text-xl font-medium text-foreground">
            No Whitelisted Collections
          </h3>
          <p className="text-foreground/70">
            There are currently no NFT collections whitelisted for the gacha system.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-light mb-4 tracking-tight">
          <span className="bg-gradient-to-r from-foreground to-warning bg-clip-text text-transparent">
            Your Eligible NFTs
          </span>
        </h2>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed font-light">
          Discover NFTs from whitelisted collections that you can deposit into the gacha system
        </p>
      </div>

      {/* Gacha Availability Status */}
      <GlassCard variant="highlight" padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isGachaAvailable ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className="font-medium text-foreground">
              Gacha System: {isGachaAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <GlassBadge variant={isGachaAvailable ? "success" : "danger"}>
            {whitelistedCollections.length} Collection{whitelistedCollections.length !== 1 ? 's' : ''} Whitelisted
          </GlassBadge>
        </div>
      </GlassCard>

      {/* Collections Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <GlassCard key={i} variant="base" padding="lg">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-foreground/20 rounded-lg"></div>
                <div className="h-4 bg-foreground/20 rounded w-3/4"></div>
                <div className="h-10 bg-foreground/20 rounded-lg"></div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {whitelistedCollections.map((collectionAddress, index) => (
            <motion.div
              key={collectionAddress}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <CollectionCard 
                collectionAddress={collectionAddress}
                userAddress={userAddress}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <GlassCard variant="base" padding="lg">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <ThemedIcon name="info" size="sm" />
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-foreground/70">
            <div className="space-y-2">
              <div className="font-medium text-foreground">1. Check Your NFTs</div>
              <p>Browse your NFTs from whitelisted collections</p>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-foreground">2. Submit for Deposit</div>
              <p>Choose NFTs and propose their rarity level</p>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-foreground">3. Wait for Approval</div>
              <p>Admin reviews and approves your deposit with final rarity</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// Individual collection card component
function CollectionCard({ 
  collectionAddress, 
  userAddress 
}: { 
  collectionAddress: string;
  userAddress?: string;
}) {
  // Get collection info
  const { data: collectionName } = useReadErc721Name({
    address: collectionAddress as `0x${string}`,
    query: { enabled: !!collectionAddress }
  });

  const { data: collectionSymbol } = useReadErc721Symbol({
    address: collectionAddress as `0x${string}`,
    query: { enabled: !!collectionAddress }
  });

  const { data: userBalance } = useReadErc721BalanceOf({
    address: collectionAddress as `0x${string}`,
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: { enabled: !!(collectionAddress && userAddress) }
  });

  const hasNFTs = userBalance && userBalance > BigInt(0);

  return (
    <GlassCard 
      variant={hasNFTs ? "interactive" : "base"} 
      padding="lg"
      animate={!!hasNFTs}
      className={hasNFTs ? "cursor-pointer" : ""}
    >
      <div className="space-y-4">
        {/* Collection Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">
              {collectionName || "Loading..."}
            </h3>
            <p className="text-sm text-foreground/60 truncate">
              {collectionSymbol || "..."} • {collectionAddress.slice(0, 6)}...{collectionAddress.slice(-4)}
            </p>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            hasNFTs 
              ? "bg-gradient-to-br from-green-400/20 to-green-600/20 border border-green-400/30" 
              : "bg-content1/20 border border-white/10"
          }`}>
            <ThemedIcon 
              name={hasNFTs ? "check" : "x"} 
              size="sm" 
              className={hasNFTs ? "text-green-400" : "text-foreground/40"}
            />
          </div>
        </div>

        {/* Balance Display */}
        <div className="text-center py-4">
          <div className="text-3xl font-bold text-foreground mb-1">
            {userBalance ? userBalance.toString() : "0"}
          </div>
          <div className="text-sm text-foreground/60">
            NFT{userBalance !== BigInt(1) ? 's' : ''} Owned
          </div>
        </div>

        {/* Action Button */}
        <GlassButton
          variant={hasNFTs ? "primary" : "secondary"}
          size="md"
          className="w-full"
          isDisabled={!hasNFTs}
        >
          {hasNFTs ? "View NFTs" : "No NFTs Owned"}
        </GlassButton>
      </div>
    </GlassCard>
  );
}