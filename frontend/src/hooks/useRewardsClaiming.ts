import { useCallback } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import type { Address, Hex } from "viem";

// Modern ABI for card-based rewards claiming
const rewardsClaimingAbi = [
  {
    type: "function",
    name: "claimCardRewards",
    stateMutability: "nonpayable",
    inputs: [
      { name: "rarity", type: "uint8" },
      { name: "cardId", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "claimRewardsForCards",
    stateMutability: "nonpayable",
    inputs: [
      { name: "rarity", type: "uint8" },
      { name: "cardIds", type: "bytes32[]" },
    ],
    outputs: [],
  },
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
] as const;

export type Rarity = 0 | 1 | 2 | 3 | 4;

export function useRewardsClaiming(rewardsManager?: Address) {
  const { address: user } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const publicClient = usePublicClient();

  const claimForCard = useCallback(
    async (cardId: Hex, rarity: Rarity) => {
      if (!rewardsManager || !user) return;
      await writeContract({
        address: rewardsManager,
        abi: rewardsClaimingAbi,
        functionName: "claimCardRewards",
        args: [rarity, cardId],
      });
    },
    [rewardsManager, user, writeContract],
  );

  const claimForRarity = useCallback(
    async (rarity: Rarity, cardIds: Hex[]) => {
      if (!rewardsManager || !user || cardIds.length === 0) return;
      await writeContract({
        address: rewardsManager,
        abi: rewardsClaimingAbi,
        functionName: "claimRewardsForCards",
        args: [rarity, cardIds],
      });
    },
    [rewardsManager, user, writeContract],
  );

  const claimForCards = useCallback(
    async (cardIds: Hex[]) => {
      if (!rewardsManager || !user || !publicClient || cardIds.length === 0) return;

      // Group cards by their active rarity
      const cardsByRarity: Record<number, Hex[]> = {};
      
      for (const cardId of cardIds) {
        try {
          const [rarity, found] = await publicClient.readContract({
            address: rewardsManager,
            abi: rewardsClaimingAbi,
            functionName: "findActiveCardRarity",
            args: [cardId],
          }) as [number, boolean];
          
          if (found && rarity >= 0 && rarity <= 4) {
            if (!cardsByRarity[rarity]) {
              cardsByRarity[rarity] = [];
            }
            cardsByRarity[rarity].push(cardId);
          }
        } catch (error) {
          console.warn("Failed to find rarity for card", cardId, error);
        }
      }
      
      // Claim for each rarity that has cards
      for (const [rarity, cards] of Object.entries(cardsByRarity)) {
        if (cards.length > 0) {
          await claimForRarity(Number(rarity) as Rarity, cards);
        }
      }
    },
    [rewardsManager, user, publicClient, claimForRarity],
  );

  return { claimForCard, claimForRarity, claimForCards, isPending };
}