/**
 * Example usage of dynamic collection querying
 * This demonstrates how to use the new system instead of hardcoded collection addresses
 */

// OLD APPROACH (removed):
// import { getGachaConfig } from '../lib/gacha-config';
// const config = getGachaConfig('graded-pokemon');
// const collectionAddress = config.nftCollectionAddress; // This was hardcoded

// NEW APPROACH - Dynamic collection querying:
import {
	useWhitelistedCollections,
	useGachaWhitelistedCollections,
} from "../hooks/useWhitelistedCollections";

// Example 1: Get collections for a specific treasury
function ExampleComponent1() {
	const treasuryAddress =
		"0x1234567890123456789012345678901234567890" as `0x${string}`;
	const {
		data: collections,
		isLoading,
		error,
	} = useWhitelistedCollections(treasuryAddress);

	if (isLoading) return <div>Loading collections...</div>;
	if (error) return <div>Error loading collections</div>;

	return (
		<div>
			<h3>Whitelisted Collections:</h3>
			{collections?.map((collection) => (
				<div key={collection}>{collection}</div>
			))}
		</div>
	);
}

// Example 2: Get collections for a specific gacha
function ExampleComponent2() {
	const gachaId = "graded-pokemon";
	const {
		data: collections,
		isLoading,
		error,
	} = useGachaWhitelistedCollections(gachaId);

	if (isLoading) return <div>Loading collections...</div>;
	if (error) return <div>Error loading collections</div>;

	return (
		<div>
			<h3>Collections for {gachaId}:</h3>
			{collections?.map((collection) => (
				<div key={collection}>{collection}</div>
			))}
		</div>
	);
}

// Example 3: Using collections with NFT cards
import { UnifiedNFTCard } from "../components/ui/UnifiedNFTCard";

function ExampleNFTDisplay() {
	const gachaId = "graded-pokemon";
	const { data: collections } = useGachaWhitelistedCollections(gachaId);

	// Now you can use any of the whitelisted collections for NFT display
	const firstCollection = collections?.[0];

	if (!firstCollection) return <div>No collections available</div>;

	return (
		<UnifiedNFTCard
			collection={firstCollection} // Dynamic collection address
			tokenId="1"
			appraisalContractAddress={
				"0x1234567890123456789012345678901234567890" as `0x${string}`
			}
			showAppraisal={true}
		/>
	);
}

/**
 * Key Benefits of the new approach:
 *
 * 1. Dynamic: Collections are fetched from the blockchain, not hardcoded
 * 2. Flexible: Easily supports multiple collections per gacha
 * 3. Real-time: Changes to treasury whitelist are reflected immediately
 * 4. Maintainable: No need to update frontend code when collections change
 * 5. Accurate: Always shows the current state of whitelisted collections
 *
 * Migration Notes:
 * - Remove nftCollectionAddress from GachaConfig type
 * - Remove hardcoded collection addresses from config files
 * - Use useWhitelistedCollections or useGachaWhitelistedCollections hooks
 * - NFT components now receive collection addresses as props from dynamic queries
 */

export { ExampleComponent1, ExampleComponent2, ExampleNFTDisplay };
