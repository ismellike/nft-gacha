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

	const debugCardIds = useCallback(async () => {
		if (!publicClient || !treasury) return;

		try {
			// Get whitelisted NFT collections first
			const collections = await getWhitelistedNFTs();
			if (collections.length === 0) {
				console.log("❌ No whitelisted NFT collections found");
				return;
			}

			const firstCollection = collections[0];
			console.log("🔍 Testing first whitelisted collection:", firstCollection);

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

			console.log("🔍 Appraisal contract address:", appraisalAddress);

			// Test cardIds for tokens 0-4 in the first collection
			for (let tokenId = 0; tokenId < 5; tokenId++) {
				try {
					const tokenCardId = await publicClient.readContract({
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
						args: [firstCollection, BigInt(tokenId)],
					});

					console.log(
						`🎴 Collection ${firstCollection} Token ${tokenId} cardId:`,
						tokenCardId,
					);

					if (
						tokenCardId ===
						"0x0000000000000000000000000000000000000000000000000000000000000000"
					) {
						console.log(`❌ Token ${tokenId} has empty cardId!`);
					} else {
						console.log(`✅ Token ${tokenId} has valid cardId!`);
					}
				} catch (error) {
					console.error(
						`❌ Error checking cardId for token ${tokenId}:`,
						error,
					);
				}
			}
		} catch (error) {
			console.error("❌ Error in debugCardIds:", error);
		}
	}, [publicClient, treasury, getWhitelistedNFTs]);

	const debugUserDeposits = useCallback(async () => {
		if (!publicClient || !treasury || !user) {
			console.log("❌ Missing dependencies for user deposit debug");
			return;
		}

		try {
			console.log("🔍 Debugging user deposits for:", user);

			// Get whitelisted collections
			const collections = await getWhitelistedNFTs();
			if (collections.length === 0) {
				console.log("❌ No whitelisted collections");
				return;
			}

			const collection = collections[0];
			console.log("🏷️ Using collection:", collection);

			// Check if user has any deposits in the treasury at all
			const rarityDeposits = await publicClient.readContract({
				address: treasury,
				abi: [
					{
						type: "function",
						name: "getUserAllDepositCounts",
						stateMutability: "view",
						inputs: [{ name: "user", type: "address" }],
						outputs: [{ name: "", type: "uint256[5]" }],
					},
				] as const,
				functionName: "getUserAllDepositCounts",
				args: [user],
			});

			console.log("📊 User rarity deposits:", rarityDeposits);
			const totalDeposits = rarityDeposits.reduce(
				(sum, count) => sum + Number(count),
				0,
			);
			console.log("📊 Total user deposits:", totalDeposits);

			if (totalDeposits === 0) {
				console.log("❌ User has no deposits at all!");
				return;
			}

			// Check specific card deposits using the new batch function
			const allDeposits = await getAllUserCardDeposits();
			const specificCard = allDeposits.find(
				(d) =>
					d.cardId ===
					"0xbe8e564966cf82accd6250abf50f7227746ee1002165921d303529b3748046ea",
			);
			console.log(
				"🎴 User deposits for specific cardId:",
				specificCard?.depositCount?.toString() || "0",
			);

			// Check total card deposits for the first deposit found
			if (allDeposits.length > 0) {
				const firstCardId = allDeposits[0].cardId;
				const totalCardDeposits = await publicClient.readContract({
					address: treasury,
					abi: [
						{
							type: "function",
							name: "getCardTotalDeposits",
							stateMutability: "view",
							inputs: [{ name: "cardId", type: "bytes32" }],
							outputs: [{ name: "totalCount", type: "uint256" }],
						},
					] as const,
					functionName: "getCardTotalDeposits",
					args: [firstCardId],
				});

				console.log(
					"🎴 Total deposits for cardId",
					firstCardId,
					":",
					totalCardDeposits.toString(),
				);
			}

			// NEW: Check what cardIds exist for higher token IDs (maybe different NFTs were deposited)
			console.log(
				"🔍 Checking cardIds for tokens 45-50 (which should have been deposited):",
			);
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

			for (let tokenId = 45; tokenId <= 50; tokenId++) {
				try {
					const tokenCardId = await publicClient.readContract({
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
						args: [collection, BigInt(tokenId)],
					});

					console.log(`🎴 Token ${tokenId} cardId:`, tokenCardId);

					if (
						tokenCardId !==
						"0x0000000000000000000000000000000000000000000000000000000000000000"
					) {
						// Check deposits for this cardId using batch query
						const allUserDeposits = await getAllUserCardDeposits();
						const depositsForThisCard = allUserDeposits.find(
							(d) => d.cardId === tokenCardId,
						);
						console.log(
							`🎴 User deposits for token ${tokenId} cardId:`,
							depositsForThisCard?.depositCount?.toString() || "0",
						);
					}
				} catch (error) {
					console.log(`❌ Error checking token ${tokenId}:`, error);
				}
			}
		} catch (error) {
			console.error("❌ Error in debugUserDeposits:", error);
		}
	}, [
		publicClient,
		treasury,
		user,
		getWhitelistedNFTs,
		getAllUserCardDeposits,
	]);

	return {
		getUserCardIdsLength,
		getUserCardDepositsPage,
		getAllUserCardDeposits,
		loadAllCardDeposits, // Backward compatibility
		debugCardIds,
		debugUserDeposits,
	};
}
