import { useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import type { Address, Hex } from "viem";

// Updated ABI for new paginated card deposit queries
const treasuryUserCardsAbi = [
	{
		type: "function",
		name: "getUserCardIdsLength",
		stateMutability: "view",
		inputs: [{ name: "user", type: "address" }],
		outputs: [{ name: "length", type: "uint256" }],
	},
	{
		type: "function",
		name: "getUserCardDepositsPage",
		stateMutability: "view",
		inputs: [
			{ name: "user", type: "address" },
			{ name: "offset", type: "uint256" },
			{ name: "limit", type: "uint256" },
		],
		outputs: [
			{
				name: "deposits",
				type: "tuple[]",
				components: [
					{ name: "cardId", type: "bytes32" },
					{ name: "depositCount", type: "uint256" },
					{ name: "totalCardDeposits", type: "uint256" },
				],
			},
			{ name: "total", type: "uint256" },
			{ name: "hasMore", type: "bool" },
		],
	},
	{
		type: "function",
		name: "getAllUserCardDeposits",
		stateMutability: "view",
		inputs: [{ name: "user", type: "address" }],
		outputs: [
			{
				name: "deposits",
				type: "tuple[]",
				components: [
					{ name: "cardId", type: "bytes32" },
					{ name: "depositCount", type: "uint256" },
					{ name: "totalCardDeposits", type: "uint256" },
				],
			},
		],
	},
] as const;

export interface PaginatedCardDeposits {
	deposits: UserCardDeposit[];
	total: bigint;
	hasMore: boolean;
}

export interface UserCardDeposit {
	cardId: Hex;
	depositCount: bigint;
	totalCardDeposits: bigint;
}

// Legacy interface for backward compatibility
export interface CardDepositInfo {
	cardId: Hex;
	depositCount: bigint;
	groupData: Hex;
}

/**
 * Utilities to read a user's cardIds from the Treasury using the simplified card structure.
 * No more rarity separation - cards are tracked globally.
 */
export function useTreasuryUserCards(treasury?: Address) {
	const { address: user } = useAccount();
	const publicClient = usePublicClient();

	const getUserCardIdsLength = useCallback(async (): Promise<bigint> => {
		if (!publicClient || !treasury || !user) return 0n;
		return publicClient.readContract({
			address: treasury,
			abi: treasuryUserCardsAbi,
			functionName: "getUserCardIdsLength",
			args: [user],
		});
	}, [publicClient, treasury, user]);

	const getUserCardDepositsPage = useCallback(
		async (offset: bigint, limit: bigint): Promise<PaginatedCardDeposits> => {
			if (!publicClient || !treasury || !user)
				return { deposits: [], total: 0n, hasMore: false };
			const [deposits, total, hasMore] = (await publicClient.readContract({
				address: treasury,
				abi: treasuryUserCardsAbi,
				functionName: "getUserCardDepositsPage",
				args: [user, offset, limit],
			})) as unknown as [UserCardDeposit[], bigint, boolean];
			return {
				deposits: deposits as UserCardDeposit[],
				total: total as bigint,
				hasMore: hasMore as boolean,
			};
		},
		[publicClient, treasury, user],
	);

	const getAllUserCardDeposits = useCallback(async (): Promise<
		UserCardDeposit[]
	> => {
		if (!publicClient || !treasury || !user) {
			console.log("❌ Missing dependencies:", {
				publicClient: !!publicClient,
				treasury,
				user,
			});
			return [];
		}

		console.log(
			"🔍 Querying getAllUserCardDeposits for:",
			user,
			"from treasury:",
			treasury,
		);

		try {
			const result = await publicClient.readContract({
				address: treasury,
				abi: treasuryUserCardsAbi,
				functionName: "getAllUserCardDeposits",
				args: [user],
			});

			console.log("✅ Contract returned:", result);
			return [...result] as UserCardDeposit[]; // Convert readonly to mutable array
		} catch (error) {
			console.error("❌ Error calling getAllUserCardDeposits:", error);
			return [];
		}
	}, [publicClient, treasury, user]);

	// Removed: getUserCardDeposits function - use getAllUserCardDeposits instead for better efficiency

	// Backward compatibility function for existing code
	const loadAllCardDeposits = useCallback(async (): Promise<
		{ cardId: Hex; depositCount: bigint; groupData: Hex }[]
	> => {
		const deposits = await getAllUserCardDeposits();
		// Transform to old format for backward compatibility
		return deposits.map((deposit) => ({
			cardId: deposit.cardId,
			depositCount: deposit.depositCount,
			groupData: deposit.cardId, // groupData is the same as cardId
		}));
	}, [getAllUserCardDeposits]);

	const getWhitelistedNFTs = useCallback(async () => {
		if (!publicClient || !treasury) return [];

		try {
			const whitelistedNFTs = await publicClient.readContract({
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

			console.log("🏷️ Whitelisted NFT collections:", whitelistedNFTs);
			return whitelistedNFTs;
		} catch (error) {
			console.error("❌ Error getting whitelisted NFTs:", error);
			return [];
		}
	}, [publicClient, treasury]);

	// Debug functions removed - they should be in a separate debug utilities file

	return {
		getUserCardIdsLength,
		getUserCardDepositsPage,
		getAllUserCardDeposits,
		loadAllCardDeposits, // Backward compatibility
		getWhitelistedNFTs,
	};
}
