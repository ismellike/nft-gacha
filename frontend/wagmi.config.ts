import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";

export default defineConfig({
	out: "src/generated.ts",
	plugins: [
		foundry({
			project: "../contracts",
			exclude: [
				"*.t.sol/**",
				"Test.sol/**",
				"TestConstants.sol/**",
				"TestUsers.sol/**",
				"StandardTest.sol/**",
				"StdAssertions.sol/**",
				"StdChains.sol/**",
				"StdCheats.sol/**",
				"StdError.sol/**",
				"StdInvariant.sol/**",
				"StdJson.sol/**",
				"StdMath.sol/**",
				"StdStorage.sol/**",
				"StdStyle.sol/**",
				"StdToml.sol/**",
				"StdUtils.sol/**",
				"Vm.sol/**",
				"console.sol/**",
				"console2.sol/**",
				"Script.sol/**",
				"**/script/**",
				"Deploy*.sol/**",
				"TestUSDC.sol/**",
				"Mock*.sol/**",
			],
		}),
		react({
			getHookName({ type, contractName, itemName }) {
				// Always include contract name to ensure uniqueness
				const typePart = type.charAt(0).toUpperCase() + type.slice(1);
				const itemPart = itemName
					? itemName.charAt(0).toUpperCase() + itemName.slice(1)
					: "";

				// Handle collisions by adding Contract suffix when no itemName
				if (!itemName) {
					return `use${typePart}${contractName}Contract`;
				}

				return `use${typePart}${contractName}${itemPart}`;
			},
		}),
	],
});
