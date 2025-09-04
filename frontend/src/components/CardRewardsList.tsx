"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import type { Address, Hex } from "viem";
import { Card, Button } from "./ui";
import { BanknotesIcon, ArrowPathIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { UnifiedNFTCard } from "./ui/UnifiedNFTCard";
import { glassTypography } from "../lib/theme-config";
import { getRarityConfig } from "../lib/rarityConfig";
import { useGachaId } from "../hooks/useGachaId";
import { useGachaContracts } from "../hooks/useGachaContracts";
import {
  useReadGachaRewardsManagerFeeToken,
  useReadErc20Decimals,
  useReadErc20Symbol,
} from "../generated";
import { formatTokenAmount } from "../lib/utils";
import { useTreasuryUserCards, type CardDepositInfo } from "../hooks/useTreasuryUserCards";
import { useRewardsClaiming, type Rarity } from "../hooks/useRewardsClaiming";
import { useAccount, usePublicClient } from "wagmi";
import type { CardAppraisal } from "../hooks/useBatchCardAppraisal";

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
  claimableAmount: bigint | null; // null = not yet loaded
  isLoadingClaimable: boolean;
  appraisal: CardAppraisal | null;
}

export function CardRewardsList() {
  const gachaId = useGachaId();
  const contracts = useGachaContracts(gachaId);
  const treasury = contracts.treasury as Address | undefined;
  const rewardsManager = contracts.rewardsManager as Address | undefined;
  const { loadAllCardDeposits } = useTreasuryUserCards(treasury);
  const { claimForCard, claimForRarity, isPending } = useRewardsClaiming(rewardsManager);
  const { address: user } = useAccount();
  const publicClient = usePublicClient();

  const [cards, setCards] = useState<CardRewardInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;
  const hasLoadedRef = useRef(false);
  const lastUserRef = useRef<string | null>(null);

  // Fee token details from RewardsManager
  const { data: feeTokenAddress } = useReadGachaRewardsManagerFeeToken({
    address: rewardsManager as `0x${string}` | undefined,
    query: { enabled: !!rewardsManager },
  });
  const { data: feeTokenDecimals } = useReadErc20Decimals({
    address: feeTokenAddress,
    query: { enabled: !!feeTokenAddress },
  });
  const { data: feeTokenSymbol } = useReadErc20Symbol({
    address: feeTokenAddress,
    query: { enabled: !!feeTokenAddress },
  });

  // Format claimable using actual fee token decimals/symbol
  const formatClaimable = (amount: bigint) => {
    const decimals = typeof feeTokenDecimals === "number" ? feeTokenDecimals : 6; // default to 6 if unknown
    const symbol = feeTokenSymbol || "";
    return formatTokenAmount(amount, decimals, { maxDecimals: 2, minDecimals: 2, suffix: symbol ? ` ${symbol}` : "" });
  };

  const paginatedCards = useMemo(() => {
    const start = currentPage * pageSize;
    return cards.slice(start, start + pageSize);
  }, [cards, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(cards.length / pageSize);
  }, [cards.length]);

  // Note: auto-fetch moved below after fetchClaimable is defined

  useEffect(() => {
    console.log("[CardRewardsList] mount/useEffect deps", {
      hasTreasury: !!treasury,
      hasRewardsManager: !!rewardsManager,
      hasUser: !!user,
      hasPublicClient: !!publicClient,
    });
    if (!treasury || !rewardsManager || !user || !publicClient) {
      hasLoadedRef.current = false;
      return;
    }

    // Reset loading state if user changed
    if (lastUserRef.current !== user) {
      hasLoadedRef.current = false;
      lastUserRef.current = user;
    }

    // Prevent duplicate loading
    if (hasLoadedRef.current) return;

    const loadUserCards = async () => {
      console.log("[CardRewardsList] loadUserCards start", {
        treasury,
        rewardsManager,
        user,
      });
      hasLoadedRef.current = true;
      setIsLoading(true);
      try {
        // Load all user's cards with deposit counts and group data
        const deposits = await loadAllCardDeposits();
        console.log("[CardRewardsList] deposits loaded", {
          count: deposits.length,
          sample: deposits.slice(0, 5),
        });

        const cardInfos: CardRewardInfo[] = [];

        // Fetch batch card appraisals directly from contract
        const cardIds = deposits.map((d) => d.cardId);

        const appraisalResults =
          cardIds.length > 0
            ? ((await publicClient.readContract({
                address: contracts.appraisal as `0x${string}`,
                abi: [
                  {
                    type: "function",
                    name: "getCardAppraisals",
                    stateMutability: "view",
                    inputs: [{ name: "cardIds", type: "bytes32[]" }],
                    outputs: [{
                      name: "appraisals",
                      type: "tuple[]",
                      components: [
                        { name: "priceUSD", type: "uint256" },
                        { name: "status", type: "uint8" },
                        { name: "firstTimestamp", type: "uint256" },
                        { name: "lastUpdated", type: "uint256" },
                        { name: "canonicalContractAddress", type: "address" },
                        { name: "canonicalTokenId", type: "uint256" },
                      ],
                    }],
                  },
                ] as const,
                functionName: "getCardAppraisals",
                args: [cardIds],
              })) as {
                priceUSD: bigint;
                status: number;
                firstTimestamp: bigint;
                lastUpdated: bigint;
                canonicalContractAddress: `0x${string}`;
                canonicalTokenId: bigint;
              }[])
            : [];
        console.log("[CardRewardsList] appraisalResults", {
          count: appraisalResults?.length ?? 0,
          sample: appraisalResults?.slice(0, 3),
        });
        if (!appraisalResults || appraisalResults.length === 0) {
          console.warn("[CardRewardsList] No appraisal results returned", {
            appraisalAddress: contracts.appraisal,
            cardIds: cardIds.slice(0, 5),
          });
        }

        // Batch fetch active rarities for all cards via multicall
        let activeRarityResults: Array<
          { result?: [number, boolean] | undefined } | undefined
        > = [];
        try {
          activeRarityResults = await publicClient.multicall({
            allowFailure: true,
            contracts: deposits.map((d) => ({
              address: rewardsManager as `0x${string}`,
              abi: managerViewAbi,
              functionName: "findActiveCardRarity",
              args: [d.cardId],
            })),
          });
        } catch {
          activeRarityResults = [];
        }
        console.log("[CardRewardsList] activeRarityResults", {
          count: activeRarityResults?.length ?? 0,
          sample: activeRarityResults?.slice(0, 3),
        });

        // Build card info list using batch results
        deposits.forEach(({ cardId, depositCount, groupData }, i) => {
          const res = activeRarityResults?.[i] as unknown as
            | { result?: [number, boolean] }
            | undefined;
          const tuple = res?.result;
          const activeRarity = tuple?.[1] ? (tuple?.[0] as Rarity) : null;
          const appraisalResult = appraisalResults?.[i];

          cardInfos.push({
            cardId,
            depositCount,
            activeRarity,
            claimableAmount: null,
            isLoadingClaimable: false,
            groupData: groupData as `0x${string}`,
            appraisal: appraisalResult
              ? {
                  canonicalContractAddress: appraisalResult.canonicalContractAddress,
                  canonicalTokenId: appraisalResult.canonicalTokenId,
                  priceUSD: appraisalResult.priceUSD,
                  status: appraisalResult.status,
                  firstTimestamp: appraisalResult.firstTimestamp,
                  lastUpdated: appraisalResult.lastUpdated,
                }
              : null,
          });
        });

        setCards(cardInfos);
        console.log("[CardRewardsList] cardInfos built", {
          count: cardInfos.length,
          sample: cardInfos.slice(0, 3),
        });
      } catch (error) {
        console.error("Failed to load user cards:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserCards().catch((error) => {
      console.error("Error in loadUserCards:", error);
      setIsLoading(false);
      hasLoadedRef.current = false;
    });
  }, [
    treasury,
    rewardsManager,
    user,
    publicClient,
    loadAllCardDeposits,
    contracts.appraisal,
  ]);

  const cardIndexById = useMemo(() => {
    const map = new Map<Hex, number>();
    cards.forEach((c, i) => map.set(c.cardId, i));
    return map;
  }, [cards]);

  const fetchClaimableById = useCallback(async (cardId: Hex) => {
    if (!publicClient || !rewardsManager || !user) return;

    const cardIndex = cardIndexById.get(cardId);
    if (cardIndex === undefined) return;
    const card = cards[cardIndex];
    if (!card || card.activeRarity === null || card.isLoadingClaimable) return;

    setCards((prev) =>
      prev.map((c, i) => (i === cardIndex ? { ...c, isLoadingClaimable: true } : c)),
    );

    try {
      const amount = (await publicClient.readContract({
        address: rewardsManager,
        abi: managerViewAbi,
        functionName: "getUserCardClaimable",
        args: [user, card.activeRarity, card.cardId],
      })) as bigint;
      console.log("[CardRewardsList] claimable fetched", {
        cardId,
        amount: amount.toString(),
      });

      setCards((prev) =>
        prev.map((c, i) =>
          i === cardIndex
            ? {
                ...c,
                claimableAmount: amount,
                isLoadingClaimable: false,
              }
            : c,
        ),
      );
    } catch (error) {
      console.error("Failed to fetch claimable amount:", error);
      setCards((prev) =>
        prev.map((c, i) =>
          i === cardIndex
            ? {
                ...c,
                claimableAmount: 0n,
                isLoadingClaimable: false,
              }
            : c,
        ),
      );
    }
  }, [publicClient, rewardsManager, user, cardIndexById, cards]);

  const handleClaimCard = async (card: CardRewardInfo) => {
    if (card.activeRarity === null) return;
    
    try {
      await claimForCard(card.cardId, card.activeRarity);
      // Refresh claimable amount after successful claim
      setTimeout(() => fetchClaimableById(card.cardId), 1000);
    } catch (error) {
      console.error("Failed to claim card rewards:", error);
    }
  };

  const handleClaimPage = async () => {
    // Group cards by rarity for batch claiming
    const cardsByRarity: Record<number, Hex[]> = {};
    
    for (const card of paginatedCards) {
      if (card.activeRarity !== null && (card.claimableAmount ?? 0n) > 0n) {
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
        paginatedCards.forEach((c) => {
          fetchClaimableById(c.cardId);
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to claim page rewards:", error);
    }
  };

  // Auto-fetch claimable amounts for visible page where applicable
  // Batch-fetch claimable amounts for visible page via multicall
  useEffect(() => {
    (async () => {
      if (!publicClient || !rewardsManager || !user) return;

      const targets = paginatedCards.filter(
        (c) => c.activeRarity !== null && c.claimableAmount === null && !c.isLoadingClaimable,
      );
      if (targets.length === 0) return;

      // Optimistically set loading
      setCards((prev) =>
        prev.map((c) =>
          targets.some((t) => t.cardId === c.cardId)
            ? { ...c, isLoadingClaimable: true }
            : c,
        ),
      );

      try {
        const res = await publicClient.multicall({
          allowFailure: true,
          contracts: targets.map((t) => ({
            address: rewardsManager as `0x${string}`,
            abi: managerViewAbi,
            functionName: "getUserCardClaimable",
            args: [user as Address, t.activeRarity as number, t.cardId],
          })),
        });
        console.log("[CardRewardsList] batch claimables", {
          targets: targets.map((t) => t.cardId),
          results: res,
        });

        setCards((prev) => {
          const next = [...prev];
          targets.forEach((t, i) => {
            const idx = cardIndexById.get(t.cardId);
            if (idx === undefined) return;
            const out = res[i] as unknown as { result?: bigint } | undefined;
            const claimable = out?.result ?? 0n;
            next[idx] = {
              ...next[idx],
              claimableAmount: claimable,
              isLoadingClaimable: false,
            };
          });
          return next;
        });
      } catch (err) {
        console.warn("Batch claimable multicall failed; falling back per-card", err);
        // Fallback to per-card fetch for robustness
        targets.forEach((t) => fetchClaimableById(t.cardId));
      }
    })();
  }, [
    paginatedCards,
    publicClient,
    rewardsManager,
    user,
    cardIndexById,
    fetchClaimableById,
  ]);

  const pageClaimableCount = useMemo(
    () => paginatedCards.filter((c) => (c.claimableAmount ?? 0n) > 0n).length,
    [paginatedCards],
  );
  const pageClaimableTotal = useMemo(
    () => paginatedCards.reduce((sum, c) => sum + (c.claimableAmount ?? 0n), 0n),
    [paginatedCards],
  );

  const refreshPageClaimables = useCallback(() => {
    paginatedCards.forEach((c) => fetchClaimableById(c.cardId));
  }, [paginatedCards, fetchClaimableById]);

  if (isLoading) {
    return (
      <Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
        <div className="space-y-4">
          <div className="h-6 w-40 bg-white/10 rounded animate-pulse" />
          <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: pageSize }).map((_, i) => (
              <div key={`skeleton-${currentPage}-${pageSize}-${i * 13}`} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
                <div className="h-40 w-full bg-white/10 rounded-xl animate-pulse mb-3" />
                <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={glassTypography({ variant: "secondaryHeading" })}>Rewards by Card</h3>
          <div className="mt-1 text-xs text-foreground/60">{cards.length} cards deposited</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
            <BanknotesIcon className="w-4 h-4 text-warning" />
            <span className="text-sm text-foreground/70">{pageClaimableCount} claimable</span>
            <span className="text-sm font-medium text-foreground">{formatClaimable(pageClaimableTotal)}</span>
          </div>
          <Button size="sm" onPress={refreshPageClaimables} className="rounded-lg bg-content2 hover:bg-content3">
            <span className="inline-flex items-center gap-1"><ArrowPathIcon className="w-4 h-4" /> Refresh</span>
          </Button>
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
            <div className="text-sm text-foreground/60 inline-flex items-center gap-2">
              <TrophyIcon className="w-4 h-4" /> {pageClaimableCount} cards have claimable rewards
            </div>
            <Button
              size="sm"
              isLoading={isPending}
              isDisabled={pageClaimableCount === 0}
              onPress={handleClaimPage}
              className="rounded-lg bg-gradient-to-r from-primary to-secondary"
            >
              Claim Page ({pageClaimableCount} cards)
            </Button>
          </div>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedCards.map((card) => {
          const rarityConfig = card.activeRarity !== null ? getRarityConfig(card.activeRarity) : null;
          const appraisal = card.appraisal;

          // Minimal address validation (40 hex and not zero address)
          const isValidAddress = (addr: string) =>
            /^0x[0-9a-fA-F]{40}$/.test(addr) &&
            addr.toLowerCase() !==
              "0x0000000000000000000000000000000000000000";
          
          const hasValidCanonical =
            typeof appraisal?.canonicalContractAddress === "string" &&
            isValidAddress(appraisal.canonicalContractAddress) &&
            typeof appraisal?.canonicalTokenId === "bigint"; // tokenId 0 is valid
          if (!hasValidCanonical) {
            console.warn("[CardRewardsList] invalid canonical for card", {
              cardId: card.cardId,
              address: appraisal?.canonicalContractAddress,
              addressValid: appraisal?.canonicalContractAddress
                ? isValidAddress(appraisal.canonicalContractAddress)
                : false,
              tokenIdType: typeof appraisal?.canonicalTokenId,
              appraisal,
            });
          } else {
            console.log("[CardRewardsList] rendering UnifiedNFTCard", {
              cardId: card.cardId,
              collection: appraisal?.canonicalContractAddress,
              tokenId: appraisal?.canonicalTokenId?.toString(),
            });
          }
              
              if (hasValidCanonical) {

                // Create rewards slot
                const rewardsSlot = (
                  <div key={`rewards-${card.cardId}`} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/70 uppercase tracking-wide font-medium">
                        Rewards
                      </span>
                      {rarityConfig && (
                        <span className={`text-xs px-2 py-1 rounded-full ${rarityConfig.textColor} ${rarityConfig.borderColor} border`}>
                          {rarityConfig.name}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60">Card ID:</span>
                      <span className="text-white font-medium">{card.cardId.slice(2, 10).toUpperCase()}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">Deposited:</span>
                        <span className="text-white font-medium">{card.depositCount.toString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">Claimable:</span>
                        <span className="text-white font-medium">
                          {card.isLoadingClaimable || card.claimableAmount === null ? (
                            <span className="animate-pulse">Loading...</span>
                          ) : (
                            formatClaimable(card.claimableAmount)
                          )}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      isDisabled={card.activeRarity === null || !card.claimableAmount || card.claimableAmount === 0n}
                      isLoading={isPending}
                      onPress={() => handleClaimCard(card)}
                      className="w-full rounded-lg bg-gradient-to-r from-warning to-orange-400 text-black"
                    >
                      Claim Rewards
                    </Button>
                  </div>
                );

                return (
                  <UnifiedNFTCard
                    key={card.cardId}
                    collection={appraisal.canonicalContractAddress}
                    tokenId={appraisal.canonicalTokenId.toString()}
                    size="md"
                    variant="detailed"
                    appraisalContractAddress={contracts.appraisal as `0x${string}`}
                    {...(card.activeRarity !== null && { rarity: card.activeRarity })}
                    showAppraisal={false} // We'll show price in extra details instead
                    rewardsSlot={rewardsSlot}
                    extraDetails={[
                      {
                        label: "Appraised Price",
                        value: formatTokenAmount(appraisal.priceUSD, 18, { suffix: " USD" }),
                        highlight: true,
                      },
                      {
                        label: "Card ID",
                        value: card.cardId.slice(2, 10).toUpperCase(),
                      },
                    ]}
                  />
                );
              }
              
              // Fallback for cards with invalid canonical addresses - show a placeholder card
              if (appraisal) {
                const rewardsSlot = (
                  <div key={`rewards-${card.cardId}`} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/70 uppercase tracking-wide font-medium">
                        Rewards
                      </span>
                      {rarityConfig && (
                        <span className={`text-xs px-2 py-1 rounded-full ${rarityConfig.textColor} ${rarityConfig.borderColor} border`}>
                          {rarityConfig.name}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">Deposited:</span>
                        <span className="text-white font-medium">{card.depositCount.toString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">Claimable:</span>
                        <span className="text-white font-medium">
                          {card.isLoadingClaimable || card.claimableAmount === null ? (
                            <span className="animate-pulse">Loading...</span>
                          ) : (
                            formatClaimable(card.claimableAmount)
                          )}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      isDisabled={card.activeRarity === null || !card.claimableAmount || card.claimableAmount === 0n}
                      isLoading={isPending}
                      onPress={() => handleClaimCard(card)}
                      className="w-full rounded-lg bg-gradient-to-r from-warning to-orange-400 text-black"
                    >
                      Claim Rewards
                    </Button>
                  </div>
                );

                return (
                  <UnifiedNFTCard
                    key={card.cardId}
                    collection={appraisal.canonicalContractAddress as `0x${string}`}
                    tokenId={appraisal.canonicalTokenId.toString()}
                    size="md"
                    variant="detailed"
                    appraisalContractAddress={contracts.appraisal as `0x${string}`}
                    {...(card.activeRarity !== null && { rarity: card.activeRarity })}
                    showAppraisal={true}
                    rewardsSlot={rewardsSlot}
                    extraDetails={[
                      // Keep extra details minimal; appraisal rendered by card header
                    ]}
                  />
                );
              }
              
              // Invariant: appraisal exists per design. If missing, skip rendering to avoid broken UI.
              return null;
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

// (Removed) CardRewardDisplay with NFT fetching; we now derive display solely from groupId
