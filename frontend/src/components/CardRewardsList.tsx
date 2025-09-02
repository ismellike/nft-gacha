"use client";

import { useEffect, useMemo, useState } from "react";
import type { Address, Hex } from "viem";
import { Card, Button } from "./ui";
import { UnifiedNFTCard } from "./ui/UnifiedNFTCard";
import { glassTypography } from "../lib/theme-config";
import { getRarityConfig } from "../lib/rarityConfig";
import { formatTokenAmount } from "../lib/utils";
import { parseCourtyardMetadata, isCourtyardTokenURI } from "../lib/courtyard-utils";
import { useOptimizedNFTMetadata } from "../hooks/useOptimizedNFTMetadata";
import { cn } from "../lib/theme-config";
import { useGachaId } from "../hooks/useGachaId";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useTreasuryUserCards, type CardDepositInfo } from "../hooks/useTreasuryUserCards";
import { useRewardsClaiming, type Rarity } from "../hooks/useRewardsClaiming";
import { useAccount, usePublicClient } from "wagmi";
import { useReadErc20Symbol, useReadGachaFeeToken } from "../generated";

const managerViewAbi = [
  {
    type: "function",
    name: "findActiveCardRarity",
    stateMutability: "view",
    inputs: [{ name: "cardId", type: "bytes32" }],
    outputs: [
      { name: "activeRarity", type: "uint8" },
      { name: "found", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "getUserCardClaimable",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "rarity", type: "uint8" },
      { name: "cardId", type: "bytes32" },
    ],
    outputs: [{ name: "claimable", type: "uint256" }],
  },
] as const;


interface CardRewardInfo extends CardDepositInfo {
  activeRarity: Rarity | null;
  claimableAmount: bigint;
  isLoadingClaimable: boolean;
  collection: Address | undefined;
  tokenId: bigint | undefined;
}

export function CardRewardsList() {
  const gachaId = useGachaId();
  const contracts = useGachaContracts(gachaId);
  const treasury = contracts.treasury as Address | undefined;
  const rewardsManager = contracts.rewardsManager as Address | undefined;
  const { getAllUserCardIds, getUserCardDeposits } = useTreasuryUserCards(treasury);
  const { claimForCard, claimForRarity, isPending } = useRewardsClaiming(rewardsManager);
  const { address: user } = useAccount();
  const publicClient = usePublicClient();

  const [cards, setCards] = useState<CardRewardInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  const paginatedCards = useMemo(() => {
    const start = currentPage * pageSize;
    return cards.slice(start, start + pageSize);
  }, [cards, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    return Math.ceil(cards.length / pageSize);
  }, [cards.length, pageSize]);

  useEffect(() => {
    console.log("🔄 CardRewardsList useEffect triggered");
    console.log("Dependencies:", { 
      treasury: !!treasury, 
      rewardsManager: !!rewardsManager, 
      user: !!user, 
      publicClient: !!publicClient 
    });
    
    if (!treasury || !rewardsManager || !user || !publicClient) {
      console.log("❌ Missing dependencies, skipping card load");
      return;
    }
    
    const loadUserCards = async () => {
      setIsLoading(true);
      try {
        // Get all user's card IDs
        const cardIds = await getAllUserCardIds();
        console.log("📊 Found user card IDs:", cardIds.length, "cards");
        
        // Get deposit counts and active rarities for each card
        const cardInfos: CardRewardInfo[] = [];
        
        // Get appraisal contract address
        const appraisalAddress = await publicClient.readContract({
          address: treasury,
          abi: [
            {
              type: "function",
              name: "appraisalContract",
              stateMutability: "view",
              inputs: [],
              outputs: [{ name: "", type: "address" }],
            },
          ] as const,
          functionName: "appraisalContract",
        });

        // Get whitelisted collections to map cardIds back to tokens
        const whitelistedCollections = await publicClient.readContract({
          address: treasury,
          abi: [
            {
              type: "function",
              name: "getWhitelistedCollections",
              stateMutability: "view",
              inputs: [],
              outputs: [{ name: "", type: "address[]" }],
            },
          ] as const,
          functionName: "getWhitelistedCollections",
        });

        console.log("🏷️ Whitelisted collections:", whitelistedCollections);

        for (const cardId of cardIds) {
          const depositCount = await getUserCardDeposits(cardId);
          
          // Find which collection and tokenId this cardId represents
          let collection: Address | undefined;
          let tokenId: bigint | undefined;
          
          for (const col of whitelistedCollections) {
            // Check a reasonable range of token IDs (0-99 for local deployment)
            for (let tid = 0; tid < 100; tid++) {
              try {
                const foundCardId = await publicClient.readContract({
                  address: appraisalAddress,
                  abi: [
                    {
                      type: "function",
                      name: "getTokenCardId",
                      stateMutability: "view",
                      inputs: [
                        { name: "collection", type: "address" },
                        { name: "tokenId", type: "uint256" },
                      ],
                      outputs: [{ name: "", type: "bytes32" }],
                    },
                  ] as const,
                  functionName: "getTokenCardId",
                  args: [col, BigInt(tid)],
                });
                
                if (foundCardId === cardId) {
                  collection = col;
                  tokenId = BigInt(tid);
                  console.log(`✅ Found cardId ${cardId} = ${col} #${tid}`);
                  break;
                }
              } catch (e) {
                // Skip tokens that error
              }
            }
            if (collection) break; // Found it, stop searching
          }
          
          // Find which rarity this card is active in
          let activeRarity: Rarity | null = null;
          try {
            const [rarity, found] = await publicClient.readContract({
              address: rewardsManager,
              abi: managerViewAbi,
              functionName: "findActiveCardRarity",
              args: [cardId],
            }) as [number, boolean];
            
            if (found) {
              activeRarity = rarity as Rarity;
            }
          } catch (e) {
            console.warn("Failed to find active rarity for card", cardId, e);
          }
          
          cardInfos.push({
            cardId,
            depositCount,
            activeRarity,
            claimableAmount: 0n,
            isLoadingClaimable: false,
            collection,
            tokenId,
          });
        }
        
        console.log("🎮 Final card infos:", cardInfos);
        setCards(cardInfos);
      } catch (error) {
        console.error("Failed to load user cards:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserCards();
  }, [treasury, rewardsManager, user, publicClient, getAllUserCardIds, getUserCardDeposits]);

  const fetchClaimable = async (cardIndex: number) => {
    if (!publicClient || !rewardsManager || !user) return;
    
    const card = cards[cardIndex];
    if (!card || card.activeRarity === null || card.isLoadingClaimable) return;
    
    setCards(prev => prev.map((c, i) => 
      i === cardIndex ? { ...c, isLoadingClaimable: true } : c
    ));
    
    try {
      const amount = await publicClient.readContract({
        address: rewardsManager,
        abi: managerViewAbi,
        functionName: "getUserCardClaimable",
        args: [user, card.activeRarity, card.cardId],
      }) as bigint;
      
      setCards(prev => prev.map((c, i) => 
        i === cardIndex ? { 
          ...c, 
          claimableAmount: amount, 
          isLoadingClaimable: false 
        } : c
      ));
    } catch (error) {
      console.error("Failed to fetch claimable amount:", error);
      setCards(prev => prev.map((c, i) => 
        i === cardIndex ? { 
          ...c, 
          claimableAmount: 0n, 
          isLoadingClaimable: false 
        } : c
      ));
    }
  };

  const handleClaimCard = async (card: CardRewardInfo) => {
    if (card.activeRarity === null) return;
    
    try {
      await claimForCard(card.cardId, card.activeRarity);
      // Refresh claimable amount after successful claim
      const cardIndex = cards.findIndex(c => c.cardId === card.cardId);
      if (cardIndex >= 0) {
        setTimeout(() => fetchClaimable(cardIndex), 1000);
      }
    } catch (error) {
      console.error("Failed to claim card rewards:", error);
    }
  };

  const handleClaimPage = async () => {
    // Group cards by rarity for batch claiming
    const cardsByRarity: Record<number, Hex[]> = {};
    
    for (const card of paginatedCards) {
      if (card.activeRarity !== null && card.claimableAmount > 0n) {
        if (!cardsByRarity[card.activeRarity]) {
          cardsByRarity[card.activeRarity] = [];
        }
        cardsByRarity[card.activeRarity].push(card.cardId);
      }
    }
    
    // Claim for each rarity that has cards
    try {
      for (const [rarity, cardIds] of Object.entries(cardsByRarity)) {
        if (cardIds.length > 0) {
          await claimForRarity(Number(rarity) as Rarity, cardIds);
        }
      }
      
      // Refresh claimable amounts after successful claims
      setTimeout(() => {
        paginatedCards.forEach((_, index) => {
          const cardIndex = cards.findIndex(c => c.cardId === paginatedCards[index].cardId);
          if (cardIndex >= 0) {
            fetchClaimable(cardIndex);
          }
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to claim page rewards:", error);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-foreground/60">Loading cards...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className={glassTypography({ variant: "secondaryHeading" })}>Rewards by Card</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground/60">{cards.length} cards</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                isDisabled={currentPage === 0}
                onPress={() => setCurrentPage(p => Math.max(0, p - 1))}
              >
                Prev
              </Button>
              <span className="text-sm text-foreground/60">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                size="sm"
                isDisabled={currentPage === totalPages - 1}
                onPress={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {cards.length === 0 ? (
        <p className="text-foreground/60">No deposited cards found for this wallet.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-foreground/60">
              {paginatedCards.filter(c => c.claimableAmount > 0n).length} cards have claimable rewards
            </div>
            <Button
              size="sm"
              isLoading={isPending}
              onPress={handleClaimPage}
              className="rounded-lg bg-gradient-to-r from-primary to-secondary"
            >
              Claim Page ({paginatedCards.filter(c => c.claimableAmount > 0n).length} cards)
            </Button>
          </div>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedCards.map((card) => {
              const rarityConfig = card.activeRarity !== null ? getRarityConfig(card.activeRarity) : null;
              const cardIndex = cards.findIndex(c => c.cardId === card.cardId);
              
              // Only show NFT card if we have collection and tokenId
              if (!card.collection || card.tokenId === undefined) {
                return (
                  <div key={card.cardId} className="p-4 rounded-xl border border-white/10 bg-content2/20">
                    <div className="text-center text-foreground/60">
                      <div className="text-sm font-medium mb-2">
                        Card {card.cardId.slice(2, 10).toUpperCase()}
                      </div>
                      <div className="text-xs mb-4">
                        {rarityConfig?.name || "Unknown Rarity"} • {card.depositCount.toString()} deposits
                      </div>
                      <div className="text-xs text-foreground/40 mb-4">
                        Collection/Token info not found
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          {card.activeRarity === null ? (
                            <span className="text-foreground/40">No active rarity</span>
                          ) : card.isLoadingClaimable ? (
                            <span className="animate-pulse">Loading...</span>
                          ) : card.claimableAmount === 0n ? (
                            <button 
                              type="button" 
                              className="text-primary underline" 
                              onClick={() => fetchClaimable(cardIndex)}
                            >
                              Load claimable
                            </button>
                          ) : (
                            <span className="font-medium">Claimable: {card.claimableAmount.toString()}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          isDisabled={card.activeRarity === null || card.claimableAmount === 0n}
                          isLoading={isPending}
                          onPress={() => handleClaimCard(card)}
                          className="rounded-lg bg-gradient-to-r from-warning to-orange-400 text-black"
                        >
                          Claim
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
                <CardRewardDisplay 
                  key={card.cardId}
                  card={card}
                  rarityConfig={rarityConfig}
                  cardIndex={cardIndex}
                  contracts={contracts}
                  fetchClaimable={fetchClaimable}
                  handleClaimCard={handleClaimCard}
                  isPending={isPending}
                />
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

// Component to display individual card rewards
function CardRewardDisplay({
  card,
  rarityConfig,
  cardIndex,
  contracts,
  fetchClaimable,
  handleClaimCard,
  isPending,
}: {
  card: CardRewardInfo;
  rarityConfig: ReturnType<typeof getRarityConfig> | null;
  cardIndex: number;
  contracts: ReturnType<typeof useGachaContracts>;
  fetchClaimable: (index: number) => void;
  handleClaimCard: (card: CardRewardInfo) => void;
  isPending: boolean;
}) {
  // Get fee token info for rewards denomination
  const { data: feeTokenAddress } = useReadGachaFeeToken({
    address: contracts.gacha as `0x${string}` | undefined,
    query: { enabled: !!contracts.gacha },
  });

  const { data: tokenSymbol } = useReadErc20Symbol({
    address: feeTokenAddress,
    query: { enabled: !!feeTokenAddress },
  });

  // Auto-fetch claimable rewards when component mounts
  useEffect(() => {
    if (card.activeRarity !== null && card.claimableAmount === 0n && !card.isLoadingClaimable) {
      fetchClaimable(cardIndex);
    }
  }, [card.activeRarity, card.claimableAmount, card.isLoadingClaimable, cardIndex, fetchClaimable]);

  // Get NFT metadata to create card-level title
  const nftData = useOptimizedNFTMetadata(
    card.collection!,
    card.tokenId!.toString(),
    { priority: 0, enabled: true }
  );

  // Create card-level title (without individual serial/cert info)
  const cardLevelTitle = useMemo(() => {
    if (!nftData.metadata) return undefined;
    
    const isCourtyard = isCourtyardTokenURI(nftData.tokenURI || "");
    if (isCourtyard) {
      const parsed = parseCourtyardMetadata(nftData.metadata as any);
      // Show just the card name and basic info, not the individual cert/serial
      return parsed?.cardDetails.title || nftData.metadata.name || "Trading Card";
    }
    
    return nftData.metadata.name || "NFT Card";
  }, [nftData.metadata, nftData.tokenURI]);

  // Custom Rewards section component matching the Details section style
  const RewardsSection = () => (
    <div className="space-y-1">
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/70 font-medium uppercase tracking-wide text-sm">
            Rewards
          </span>
        </div>
        
        <div className="grid grid-cols-1 gap-1">
          <div className="flex justify-between items-center">
            <span className="text-white/80 text-xs">Card Deposits:</span>
            <span className="text-white font-medium text-xs">
              {card.depositCount.toString()} deposited
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/80 text-xs">Rarity Pool:</span>
            <span className={cn("font-medium text-xs", card.activeRarity !== null ? "text-white" : "text-white/50")}>
              {rarityConfig?.name || "No active pool"}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/80 text-xs">Claimable:</span>
            <span className={cn("font-medium text-xs", card.claimableAmount > 0n ? "text-green-300" : "text-white/70")}>
              {card.isLoadingClaimable 
                ? "Loading..." 
                : card.claimableAmount === 0n 
                  ? "0"
                  : `${formatTokenAmount(card.claimableAmount, 18, { maxDecimals: 4 })} ${tokenSymbol || 'tokens'}`
              }
            </span>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-white/10">
          <Button
            size="sm"
            fullWidth
            isDisabled={card.activeRarity === null || card.claimableAmount === 0n}
            isLoading={isPending}
            onPress={() => handleClaimCard(card)}
            className="rounded-lg bg-gradient-to-r from-warning to-orange-400 text-black text-xs py-1"
          >
            {card.claimableAmount > 0n ? "Claim Rewards" : "No Rewards"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <UnifiedNFTCard
        collection={card.collection!}
        tokenId={card.tokenId!.toString()}
        appraisalContractAddress={contracts.appraisal as `0x${string}`}
        {...(card.activeRarity !== null && { rarity: card.activeRarity })}
        size="md"
        variant="detailed"
        showAppraisal
        collectionName={cardLevelTitle ? cardLevelTitle : "Card Rewards"}
        rewardsSlot={<RewardsSection />}
      />
    </div>
  );
}