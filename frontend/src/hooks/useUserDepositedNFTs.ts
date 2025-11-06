"use client";

import { useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import type { Address, Hex } from "viem";

// ABI for the new user NFT deposit functions
const userDepositedNFTsAbi = [
	{
		type: "function",
		name: "getUserDepositedNFTs",
		stateMutability: "view",
		inputs: [{ name: "user", type: "address" }],
		outputs: [
			{
				name: "items",
				type: "tuple[]",
				components: [
					{ name: "collection", type: "address" },
					{ name: "tokenId", type: "uint256" },
					{ name: "depositor", type: "address" },
					{ name: "appraisedPrice", type: "uint256" },
					{ name: "currentRarity", type: "uint8" },
				],
			},
		],
	},
	// Alternative function name that might exist
	{
		type: "function",
		name: "getDepositedNFTs",
		stateMutability: "view",
		inputs: [{ name: "user", type: "address" }],
		outputs: [
			{
				name: "items",
				type: "tuple[]",
				components: [
					{ name: "collection", type: "address" },
					{ name: "tokenId", type: "uint256" },
					{ name: "depositor", type: "address" },
					{ name: "appraisedPrice", type: "uint256" },
					{ name: "currentRarity", type: "uint8" },
				],
			},
		],
	},
	// Fallback: try to get user's card deposits first
	{
		type: "function",
		name: "getUserCardDeposits",
		stateMutability: "view",
		inputs: [{ name: "user", type: "address" }],
		outputs: [
			{
				name: "cardIds",
				type: "bytes32[]",
			},
		],
	},
	{
		type: "function",
		name: "getUserDepositedNFTsByCardId",
		stateMutability: "view",
		inputs: [
			{ name: "user", type: "address" },
			{ name: "cardId", type: "bytes32" },
		],
		outputs: [
			{
				name: "items",
				type: "tuple[]",
				components: [
					{ name: "collection", type: "address" },
					{ name: "tokenId", type: "uint256" },
					{ name: "depositor", type: "address" },
					{ name: "appraisedPrice", type: "uint256" },
					{ name: "currentRarity", type: "uint8" },
				],
			},
		],
	},
] as const;

// Raw interface from contract responses
interface RawDepositedNFT {
	collection: string;
	tokenId: string;
	depositor: string;
	appraisedPrice: string;
	currentRarity: number;
}

export interface DepositedNFT {
	collection: Address;
	tokenId: bigint;
	depositor: Address;
	appraisedPrice: bigint;
	currentRarity: number; // 0-4 for Common-Legendary
	collectionName?: string; // Optional collection name for display
}

/**
 * Hook to get specific NFTs deposited by a user with collection and token ID details
 */
export function useUserDepositedNFTs(treasury?: Address) {
	const { address: user } = useAccount();
	const publicClient = usePublicClient();

	const getUserDepositedNFTs = useCallback(async (): Promise<
		DepositedNFT[]
	> => {
		if (!publicClient || !treasury || !user) {
			console.log("🔍 [useUserDepositedNFTs] Missing dependencies:", {
				hasPublicClient: !!publicClient,
				hasTreasury: !!treasury,
				hasUser: !!user,
			});
			return [];
		}

		console.log("🔍 [useUserDepositedNFTs] Fetching NFTs for:", {
			treasury,
			user,
		});

		try {
			// First, let's try to verify the contract exists and is accessible
			console.log(
				"🔍 [useUserDepositedNFTs] Testing contract accessibility...",
			);

			// Check if we can call the contract at all
			const code = await publicClient.getBytecode({ address: treasury });
			console.log(
				"🔍 [useUserDepositedNFTs] Contract has code:",
				code !== "0x",
				"Length:",
				code?.length,
			);

			if (code === "0x") {
				console.error(
					"❌ [useUserDepositedNFTs] No contract code found at address:",
					treasury,
				);
				return [];
			}

			// Try to call a simple function first to test connectivity
			console.log(
				"🔍 [useUserDepositedNFTs] Testing contract call with getUserDepositedNFTs...",
			);

			type RawDepositedNFT = {
			collection: string;
			tokenId: string;
			depositor: string;
			appraisedPrice?: string;
			currentRarity?: string;
		};

		let items: RawDepositedNFT[] = [];
			let functionUsed = "";

			// Try the primary function first
			try {
				items = await publicClient.readContract({
					address: treasury,
					abi: userDepositedNFTsAbi,
					functionName: "getUserDepositedNFTs",
					args: [user],
				}) as any[];
				functionUsed = "getUserDepositedNFTs";
				console.log("✅ [useUserDepositedNFTs] Primary function worked!");
			} catch (primaryError) {
				console.log(
					"⚠️ [useUserDepositedNFTs] Primary function failed:",
					primaryError instanceof Error ? primaryError.message : "Unknown",
				);

				// Try alternative function name
				try {
					items = await publicClient.readContract({
						address: treasury,
						abi: userDepositedNFTsAbi,
						functionName: "getDepositedNFTs",
						args: [user],
					}) as any[];
					functionUsed = "getDepositedNFTs";
					console.log("✅ [useUserDepositedNFTs] Alternative function worked!");
				} catch (altError) {
					console.log(
						"⚠️ [useUserDepositedNFTs] Alternative function failed:",
						altError instanceof Error ? altError.message : "Unknown",
					);

					// Try the card deposits approach as fallback
					try {
						console.log(
							"🔄 [useUserDepositedNFTs] Trying card deposits approach...",
						);
						const cardIds = await publicClient.readContract({
							address: treasury,
							abi: userDepositedNFTsAbi,
							functionName: "getUserCardDeposits",
							args: [user],
						});

						console.log("📋 [useUserDepositedNFTs] User card IDs:", cardIds);

						if (Array.isArray(cardIds) && cardIds.length > 0) {
							// Get NFTs for each card ID
							const allNFTs: DepositedNFT[] = [];
							for (const cardId of cardIds) {
								try {
									const cardNFTs = await publicClient.readContract({
										address: treasury,
										abi: userDepositedNFTsAbi,
										functionName: "getUserDepositedNFTsByCardId",
										args: [user, cardId],
									});
									allNFTs.push(...cardNFTs);
								} catch (cardError) {
									console.warn(
										`⚠️ [useUserDepositedNFTs] Failed to get NFTs for card ${cardId}:`,
										cardError instanceof Error ? cardError.message : "Unknown",
									);
								}
							}
							items = allNFTs as unknown as RawDepositedNFT[];
							functionUsed =
								"getUserCardDeposits + getUserDepositedNFTsByCardId";
							console.log(
								"✅ [useUserDepositedNFTs] Card deposits approach worked!",
							);
						} else {
							console.log(
								"📋 [useUserDepositedNFTs] No card deposits found either",
							);
						}
					} catch (fallbackError) {
						console.log(
							"⚠️ [useUserDepositedNFTs] Card deposits approach failed:",
							fallbackError instanceof Error
								? fallbackError.message
								: "Unknown",
						);
						throw new Error("All function attempts failed");
					}
				}
			}

			console.log(
				"📦 [useUserDepositedNFTs] Raw contract response from",
				functionUsed,
				":",
				items,
			);
			console.log("📦 [useUserDepositedNFTs] Response type:", typeof items);
			console.log("📦 [useUserDepositedNFTs] Is array:", Array.isArray(items));
			console.log(
				"📦 [useUserDepositedNFTs] Response length:",
				Array.isArray(items) ? items.length : "N/A",
			);

			if (!Array.isArray(items)) {
				console.warn(
					"⚠️ [useUserDepositedNFTs] Contract response is not an array:",
					typeof items,
				);

				// Let's try alternative approaches
				console.log("🔄 [useUserDepositedNFTs] Trying alternative approach...");

				// Try to call a different function to see if the contract is working
				try {
					// Check if there's a balance or total count function we can call
					const totalDeposits = await publicClient.readContract({
						address: treasury,
						abi: [
							{
								type: "function",
								name: "balanceOf",
								stateMutability: "view",
								inputs: [{ name: "account", type: "address" }],
								outputs: [{ name: "", type: "uint256" }],
							},
						],
						functionName: "balanceOf",
						args: [user],
					});
					console.log(
						"💰 [useUserDepositedNFTs] User balance (if available):",
						totalDeposits,
					);
				} catch (balanceError) {
					console.log(
						"ℹ️ [useUserDepositedNFTs] Balance function not available:",
						balanceError instanceof Error ? balanceError.message : "Unknown",
					);
				}

				return [];
			}

			if (items.length === 0) {
				console.log(
					"📋 [useUserDepositedNFTs] Empty array returned - user might have no deposits",
				);
				return [];
			}

			// Convert the contract response to our interface
			const convertedItems = items
				.map((item: RawDepositedNFT, index: number) => {
					console.log(`🔄 [useUserDepositedNFTs] Converting item ${index}:`, {
						raw: item,
						collection: item?.collection,
						tokenId: item?.tokenId,
						depositor: item?.depositor,
						appraisedPrice: item?.appraisedPrice,
						currentRarity: item?.currentRarity,
					});

					// Validate each field before converting
					if (!item?.collection || !item?.tokenId) {
						console.warn(
							`⚠️ [useUserDepositedNFTs] Item ${index} missing required fields:`,
							item,
						);
						return null;
					}

					return {
						collection: item.collection as Address,
						tokenId: BigInt(item.tokenId),
						depositor: item.depositor as Address,
						appraisedPrice: BigInt(item.appraisedPrice || 0),
						currentRarity: Number(item.currentRarity || 0),
					};
				})
				.filter(Boolean) as DepositedNFT[]; // Filter out null items

			console.log(
				"✅ [useUserDepositedNFTs] Successfully converted items:",
				convertedItems,
			);
			console.log(
				"✅ [useUserDepositedNFTs] Final count:",
				convertedItems.length,
			);

			return convertedItems;
		} catch (error) {
			console.error(
				"❌ [useUserDepositedNFTs] Error fetching user deposited NFTs:",
				error,
			);
			console.error("❌ [useUserDepositedNFTs] Error details:", {
				message: error instanceof Error ? error.message : "Unknown error",
				name: error instanceof Error ? error.name : "Unknown",
				treasury,
				user,
				shortMessage:
					error instanceof Error && "shortMessage" in error
						? (error as { shortMessage?: string }).shortMessage
						: "No short message",
			});

			// Try to provide more helpful debugging information
			if (error instanceof Error) {
				if (error.message.includes("function selector")) {
					console.error(
						"❌ [useUserDepositedNFTs] Function selector error - ABI might be incorrect",
					);
				}
				if (error.message.includes("call revert exception")) {
					console.error(
						"❌ [useUserDepositedNFTs] Contract call reverted - function might not exist or failed",
					);
				}
				if (error.message.includes("network")) {
					console.error(
						"❌ [useUserDepositedNFTs] Network error - check RPC connection",
					);
				}
			}

			return [];
		}
	}, [publicClient, treasury, user]);

	const getUserDepositedNFTsByCardId = useCallback(
		async (cardId: Hex): Promise<DepositedNFT[]> => {
			if (!publicClient || !treasury || !user) return [];

			try {
				const items = await publicClient.readContract({
					address: treasury,
					abi: userDepositedNFTsAbi,
					functionName: "getUserDepositedNFTsByCardId",
					args: [user, cardId],
				});

				// Convert the contract response to our interface
				return (items as unknown as RawDepositedNFT[]).map((item: RawDepositedNFT) => ({
					collection: item.collection as Address,
					tokenId: BigInt(item.tokenId),
					depositor: item.depositor as Address,
					appraisedPrice: BigInt(item.appraisedPrice),
					currentRarity: Number(item.currentRarity),
				}));
			} catch (error) {
				console.error(`Error fetching NFTs for card ID ${cardId}:`, error);
				return [];
			}
		},
		[publicClient, treasury, user],
	);

	return {
		getUserDepositedNFTs,
		getUserDepositedNFTsByCardId,
	};
}
