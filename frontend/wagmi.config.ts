import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";

export default defineConfig({
	out: "src/generated.ts",
	plugins: [
		foundry({
			project: "../contracts",
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
