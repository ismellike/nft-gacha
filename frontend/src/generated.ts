import {
	createUseReadContract,
	createUseWriteContract,
	createUseSimulateContract,
	createUseWatchContractEvent,
} from "wagmi/codegen";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Address
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const addressAbi = [
	{
		type: "error",
		inputs: [{ name: "target", internalType: "address", type: "address" }],
		name: "AddressEmptyCode",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BaseERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const baseErc20Abi = [
	{
		type: "constructor",
		inputs: [
			{ name: "name_", internalType: "string", type: "string" },
			{ name: "symbol_", internalType: "string", type: "string" },
			{ name: "initialOwner", internalType: "address", type: "address" },
		],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "DOMAIN_SEPARATOR",
		outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "spender", internalType: "address", type: "address" },
		],
		name: "allowance",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "approve",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "decimals",
		outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "eip712Domain",
		outputs: [
			{ name: "fields", internalType: "bytes1", type: "bytes1" },
			{ name: "name", internalType: "string", type: "string" },
			{ name: "version", internalType: "string", type: "string" },
			{ name: "chainId", internalType: "uint256", type: "uint256" },
			{ name: "verifyingContract", internalType: "address", type: "address" },
			{ name: "salt", internalType: "bytes32", type: "bytes32" },
			{ name: "extensions", internalType: "uint256[]", type: "uint256[]" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "amount", internalType: "uint256", type: "uint256" },
		],
		name: "mint",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "name",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "nonces",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "owner",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
			{ name: "deadline", internalType: "uint256", type: "uint256" },
			{ name: "v", internalType: "uint8", type: "uint8" },
			{ name: "r", internalType: "bytes32", type: "bytes32" },
			{ name: "s", internalType: "bytes32", type: "bytes32" },
		],
		name: "permit",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "symbol",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalSupply",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "transfer",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "transferFrom",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "spender",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "value",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "Approval",
	},
	{ type: "event", anonymous: false, inputs: [], name: "EIP712DomainChanged" },
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "OwnershipTransferred",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "from", internalType: "address", type: "address", indexed: true },
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "value",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "Transfer",
	},
	{ type: "error", inputs: [], name: "ECDSAInvalidSignature" },
	{
		type: "error",
		inputs: [{ name: "length", internalType: "uint256", type: "uint256" }],
		name: "ECDSAInvalidSignatureLength",
	},
	{
		type: "error",
		inputs: [{ name: "s", internalType: "bytes32", type: "bytes32" }],
		name: "ECDSAInvalidSignatureS",
	},
	{
		type: "error",
		inputs: [
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "allowance", internalType: "uint256", type: "uint256" },
			{ name: "needed", internalType: "uint256", type: "uint256" },
		],
		name: "ERC20InsufficientAllowance",
	},
	{
		type: "error",
		inputs: [
			{ name: "sender", internalType: "address", type: "address" },
			{ name: "balance", internalType: "uint256", type: "uint256" },
			{ name: "needed", internalType: "uint256", type: "uint256" },
		],
		name: "ERC20InsufficientBalance",
	},
	{
		type: "error",
		inputs: [{ name: "approver", internalType: "address", type: "address" }],
		name: "ERC20InvalidApprover",
	},
	{
		type: "error",
		inputs: [{ name: "receiver", internalType: "address", type: "address" }],
		name: "ERC20InvalidReceiver",
	},
	{
		type: "error",
		inputs: [{ name: "sender", internalType: "address", type: "address" }],
		name: "ERC20InvalidSender",
	},
	{
		type: "error",
		inputs: [{ name: "spender", internalType: "address", type: "address" }],
		name: "ERC20InvalidSpender",
	},
	{
		type: "error",
		inputs: [{ name: "deadline", internalType: "uint256", type: "uint256" }],
		name: "ERC2612ExpiredSignature",
	},
	{
		type: "error",
		inputs: [
			{ name: "signer", internalType: "address", type: "address" },
			{ name: "owner", internalType: "address", type: "address" },
		],
		name: "ERC2612InvalidSigner",
	},
	{
		type: "error",
		inputs: [
			{ name: "account", internalType: "address", type: "address" },
			{ name: "currentNonce", internalType: "uint256", type: "uint256" },
		],
		name: "InvalidAccountNonce",
	},
	{ type: "error", inputs: [], name: "InvalidShortString" },
	{
		type: "error",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "OwnableInvalidOwner",
	},
	{
		type: "error",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "OwnableUnauthorizedAccount",
	},
	{
		type: "error",
		inputs: [{ name: "str", internalType: "string", type: "string" }],
		name: "StringTooLong",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BaseERC721
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const baseErc721Abi = [
	{
		type: "constructor",
		inputs: [
			{ name: "name_", internalType: "string", type: "string" },
			{ name: "symbol_", internalType: "string", type: "string" },
			{ name: "initialOwner", internalType: "address", type: "address" },
		],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "approve",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "count", internalType: "uint256", type: "uint256" },
		],
		name: "batchMint",
		outputs: [
			{ name: "tokenIds", internalType: "uint256[]", type: "uint256[]" },
		],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "uris", internalType: "string[]", type: "string[]" },
		],
		name: "batchMintWithURIs",
		outputs: [
			{ name: "tokenIds", internalType: "uint256[]", type: "uint256[]" },
		],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "getApproved",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "operator", internalType: "address", type: "address" },
		],
		name: "isApprovedForAll",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "to", internalType: "address", type: "address" }],
		name: "mint",
		outputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "uri", internalType: "string", type: "string" },
		],
		name: "mintWithURI",
		outputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "name",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "owner",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "ownerOf",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "safeTransferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "safeTransferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "operator", internalType: "address", type: "address" },
			{ name: "approved", internalType: "bool", type: "bool" },
		],
		name: "setApprovalForAll",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "baseURI", internalType: "string", type: "string" }],
		name: "setBaseURI",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "uri", internalType: "string", type: "string" },
		],
		name: "setTokenURI",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
		name: "supportsInterface",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "symbol",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "index", internalType: "uint256", type: "uint256" }],
		name: "tokenByIndex",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "index", internalType: "uint256", type: "uint256" },
		],
		name: "tokenOfOwnerByIndex",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "tokenURI",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalSupply",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "transferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "approved",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "Approval",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "operator",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{ name: "approved", internalType: "bool", type: "bool", indexed: false },
		],
		name: "ApprovalForAll",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "OwnershipTransferred",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "from", internalType: "address", type: "address", indexed: true },
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "Transfer",
	},
	{ type: "error", inputs: [], name: "ERC721EnumerableForbiddenBatchMint" },
	{
		type: "error",
		inputs: [
			{ name: "sender", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "owner", internalType: "address", type: "address" },
		],
		name: "ERC721IncorrectOwner",
	},
	{
		type: "error",
		inputs: [
			{ name: "operator", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "ERC721InsufficientApproval",
	},
	{
		type: "error",
		inputs: [{ name: "approver", internalType: "address", type: "address" }],
		name: "ERC721InvalidApprover",
	},
	{
		type: "error",
		inputs: [{ name: "operator", internalType: "address", type: "address" }],
		name: "ERC721InvalidOperator",
	},
	{
		type: "error",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "ERC721InvalidOwner",
	},
	{
		type: "error",
		inputs: [{ name: "receiver", internalType: "address", type: "address" }],
		name: "ERC721InvalidReceiver",
	},
	{
		type: "error",
		inputs: [{ name: "sender", internalType: "address", type: "address" }],
		name: "ERC721InvalidSender",
	},
	{
		type: "error",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "ERC721NonexistentToken",
	},
	{
		type: "error",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "index", internalType: "uint256", type: "uint256" },
		],
		name: "ERC721OutOfBoundsIndex",
	},
	{ type: "error", inputs: [], name: "InvalidCount" },
	{
		type: "error",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "OwnableInvalidOwner",
	},
	{
		type: "error",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "OwnableUnauthorizedAccount",
	},
	{
		type: "error",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "TokenDoesNotExist",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CardGroupedVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const cardGroupedVaultAbi = [
	{
		type: "function",
		inputs: [],
		name: "UPGRADE_INTERFACE_VERSION",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "asset",
		outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		name: "cardNodes",
		outputs: [
			{ name: "rarity", internalType: "uint8", type: "uint8" },
			{ name: "cardPriceUSD", internalType: "uint256", type: "uint256" },
			{ name: "totalCount", internalType: "uint256", type: "uint256" },
			{ name: "correctionPerUnit", internalType: "int256", type: "int256" },
			{ name: "settledYieldPerUnit", internalType: "uint256", type: "uint256" },
			{ name: "baseAcc", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "claimYield",
		outputs: [{ name: "withdrawn", internalType: "uint256", type: "uint256" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "account", internalType: "address", type: "address" },
			{ name: "cardIds", internalType: "bytes32[]", type: "bytes32[]" },
		],
		name: "claimYieldForCards",
		outputs: [{ name: "withdrawn", internalType: "uint256", type: "uint256" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "amount", internalType: "uint256", type: "uint256" },
			{ name: "rarity", internalType: "uint8", type: "uint8" },
		],
		name: "distributeYield",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "economyManager",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "depositor", internalType: "address", type: "address" }],
		name: "getDepositorCards",
		outputs: [{ name: "", internalType: "bytes32[]", type: "bytes32[]" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner_", internalType: "address", type: "address" },
			{ name: "asset_", internalType: "address", type: "address" },
			{ name: "treasury_", internalType: "address", type: "address" },
			{ name: "economyManager_", internalType: "address", type: "address" },
			{ name: "numRarities_", internalType: "uint8", type: "uint8" },
		],
		name: "initialize",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "cardId", internalType: "bytes32", type: "bytes32" },
			{ name: "newRarity", internalType: "uint8", type: "uint8" },
			{ name: "newPriceUSD", internalType: "uint256", type: "uint256" },
		],
		name: "migrateCardRarity",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "numRarities",
		outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "owner",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "pause",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "paused",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "pendingYield",
		outputs: [{ name: "total", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "", internalType: "bytes32", type: "bytes32" },
			{ name: "", internalType: "address", type: "address" },
		],
		name: "positions",
		outputs: [
			{ name: "count", internalType: "uint256", type: "uint256" },
			{ name: "rewardDebt", internalType: "uint256", type: "uint256" },
			{ name: "correctionDebt", internalType: "int256", type: "int256" },
			{ name: "settledDebt", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "proxiableUUID",
		outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		name: "rarityPools",
		outputs: [
			{ name: "accYieldPerUSD", internalType: "uint256", type: "uint256" },
			{ name: "totalValueUSD", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "rarity", internalType: "uint8", type: "uint8" }],
		name: "rarityTotalValue",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "cardId", internalType: "bytes32", type: "bytes32" },
			{ name: "depositor", internalType: "address", type: "address" },
			{ name: "priceUSD", internalType: "uint256", type: "uint256" },
			{ name: "rarity", internalType: "uint8", type: "uint8" },
			{ name: "count", internalType: "uint256", type: "uint256" },
		],
		name: "registerCardDeposit",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "cardId", internalType: "bytes32", type: "bytes32" },
			{ name: "depositor", internalType: "address", type: "address" },
			{ name: "count", internalType: "uint256", type: "uint256" },
		],
		name: "removeCardDeposit",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "newManager", internalType: "address", type: "address" }],
		name: "setEconomyManager",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "newTreasury", internalType: "address", type: "address" }],
		name: "setTreasury",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "sharesOf",
		outputs: [{ name: "total", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalShares",
		outputs: [{ name: "total", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalYieldClaimed",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalYieldDistributed",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "treasury",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "unpause",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "cardId", internalType: "bytes32", type: "bytes32" },
			{ name: "newPriceUSD", internalType: "uint256", type: "uint256" },
		],
		name: "updateCardPrice",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "newImplementation", internalType: "address", type: "address" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "upgradeToAndCall",
		outputs: [],
		stateMutability: "payable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "cardId",
				internalType: "bytes32",
				type: "bytes32",
				indexed: true,
			},
			{
				name: "depositor",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "priceUSD",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{ name: "rarity", internalType: "uint8", type: "uint8", indexed: false },
			{
				name: "count",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "CardDepositRegistered",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "cardId",
				internalType: "bytes32",
				type: "bytes32",
				indexed: true,
			},
			{
				name: "depositor",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "count",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "CardDepositRemoved",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "cardId",
				internalType: "bytes32",
				type: "bytes32",
				indexed: true,
			},
			{
				name: "oldPriceUSD",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "newPriceUSD",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "CardPriceUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "cardId",
				internalType: "bytes32",
				type: "bytes32",
				indexed: true,
			},
			{
				name: "oldRarity",
				internalType: "uint8",
				type: "uint8",
				indexed: false,
			},
			{
				name: "newRarity",
				internalType: "uint8",
				type: "uint8",
				indexed: false,
			},
			{
				name: "newPriceUSD",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "CardRarityMigrated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousManager",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newManager",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "EconomyManagerUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "version",
				internalType: "uint64",
				type: "uint64",
				indexed: false,
			},
		],
		name: "Initialized",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "OwnershipTransferred",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "Paused",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousTreasury",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newTreasury",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "TreasuryUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "Unpaused",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "implementation",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "Upgraded",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "amount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "YieldClaimed",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "caller",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "amount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{ name: "rarity", internalType: "uint8", type: "uint8", indexed: false },
		],
		name: "YieldDistributed",
	},
	{
		type: "error",
		inputs: [{ name: "target", internalType: "address", type: "address" }],
		name: "AddressEmptyCode",
	},
	{ type: "error", inputs: [], name: "CallerNotManager" },
	{ type: "error", inputs: [], name: "CallerNotTreasury" },
	{ type: "error", inputs: [], name: "CardNotRegistered" },
	{
		type: "error",
		inputs: [
			{ name: "implementation", internalType: "address", type: "address" },
		],
		name: "ERC1967InvalidImplementation",
	},
	{ type: "error", inputs: [], name: "ERC1967NonPayable" },
	{ type: "error", inputs: [], name: "EnforcedPause" },
	{ type: "error", inputs: [], name: "ExpectedPause" },
	{ type: "error", inputs: [], name: "FailedCall" },
	{ type: "error", inputs: [], name: "InsufficientPosition" },
	{ type: "error", inputs: [], name: "InsufficientVaultBalance" },
	{ type: "error", inputs: [], name: "InvalidInitialization" },
	{ type: "error", inputs: [], name: "InvalidNumRarities" },
	{ type: "error", inputs: [], name: "InvalidRarity" },
	{ type: "error", inputs: [], name: "NoValueInPool" },
	{ type: "error", inputs: [], name: "NotInitializing" },
	{ type: "error", inputs: [], name: "NothingToClaim" },
	{
		type: "error",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "OwnableInvalidOwner",
	},
	{
		type: "error",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "OwnableUnauthorizedAccount",
	},
	{ type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
	{
		type: "error",
		inputs: [{ name: "token", internalType: "address", type: "address" }],
		name: "SafeERC20FailedOperation",
	},
	{ type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
	{
		type: "error",
		inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
		name: "UUPSUnsupportedProxiableUUID",
	},
	{ type: "error", inputs: [], name: "UnauthorizedClaim" },
	{ type: "error", inputs: [], name: "YieldTooSmall" },
	{ type: "error", inputs: [], name: "ZeroAddress" },
	{ type: "error", inputs: [], name: "ZeroAmount" },
	{ type: "error", inputs: [], name: "ZeroPrice" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CardGroupedVaultFuzz
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const cardGroupedVaultFuzzAbi = [
	{
		type: "function",
		inputs: [],
		name: "IS_TEST",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeArtifacts",
		outputs: [
			{
				name: "excludedArtifacts_",
				internalType: "string[]",
				type: "string[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeContracts",
		outputs: [
			{
				name: "excludedContracts_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeSelectors",
		outputs: [
			{
				name: "excludedSelectors_",
				internalType: "struct StdInvariant.FuzzSelector[]",
				type: "tuple[]",
				components: [
					{ name: "addr", internalType: "address", type: "address" },
					{ name: "selectors", internalType: "bytes4[]", type: "bytes4[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeSenders",
		outputs: [
			{
				name: "excludedSenders_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "failed",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "setUp",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "targetArtifactSelectors",
		outputs: [
			{
				name: "targetedArtifactSelectors_",
				internalType: "struct StdInvariant.FuzzArtifactSelector[]",
				type: "tuple[]",
				components: [
					{ name: "artifact", internalType: "string", type: "string" },
					{ name: "selectors", internalType: "bytes4[]", type: "bytes4[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetArtifacts",
		outputs: [
			{
				name: "targetedArtifacts_",
				internalType: "string[]",
				type: "string[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetContracts",
		outputs: [
			{
				name: "targetedContracts_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetInterfaces",
		outputs: [
			{
				name: "targetedInterfaces_",
				internalType: "struct StdInvariant.FuzzInterface[]",
				type: "tuple[]",
				components: [
					{ name: "addr", internalType: "address", type: "address" },
					{ name: "artifacts", internalType: "string[]", type: "string[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetSelectors",
		outputs: [
			{
				name: "targetedSelectors_",
				internalType: "struct StdInvariant.FuzzSelector[]",
				type: "tuple[]",
				components: [
					{ name: "addr", internalType: "address", type: "address" },
					{ name: "selectors", internalType: "bytes4[]", type: "bytes4[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetSenders",
		outputs: [
			{
				name: "targetedSenders_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "count1", internalType: "uint256", type: "uint256" },
			{ name: "count2", internalType: "uint256", type: "uint256" },
			{ name: "y1", internalType: "uint256", type: "uint256" },
			{ name: "y2", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_AdditionalDeposit_ZeroPendingAfterDeposit",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
			{ name: "yieldAmount", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_ClaimIdempotent",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "priceA", internalType: "uint256", type: "uint256" },
			{ name: "priceB", internalType: "uint256", type: "uint256" },
			{ name: "countA", internalType: "uint256", type: "uint256" },
			{ name: "countB", internalType: "uint256", type: "uint256" },
			{ name: "yieldA", internalType: "uint256", type: "uint256" },
			{ name: "yieldB", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_ClaimYieldForCards_Partial",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "p0", internalType: "uint256", type: "uint256" },
			{ name: "p1", internalType: "uint256", type: "uint256" },
			{ name: "y1", internalType: "uint256", type: "uint256" },
			{ name: "y2", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_CorrectionAccumulator_MatchesReference",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "newPrice", internalType: "uint256", type: "uint256" },
			{ name: "yieldBefore", internalType: "uint256", type: "uint256" },
			{ name: "yieldAfter", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_DepositYieldPriceChangeClaim_Integrity",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "priceA", internalType: "uint256", type: "uint256" },
			{ name: "priceB", internalType: "uint256", type: "uint256" },
			{ name: "countA", internalType: "uint256", type: "uint256" },
			{ name: "countB", internalType: "uint256", type: "uint256" },
			{ name: "yieldAmount", internalType: "uint256", type: "uint256" },
			{ name: "rarity", internalType: "uint8", type: "uint8" },
		],
		name: "testFuzz_DifferentPrices_ProportionalByValue",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
			{ name: "yieldAmount", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_FullRemove_AutoClaims",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
			{ name: "y1", internalType: "uint256", type: "uint256" },
			{ name: "y2", internalType: "uint256", type: "uint256" },
			{ name: "y3", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_GlobalInvariant_ClaimedNeverExceedsDistributed",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
			{ name: "yieldAmount", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_LargePrice_NoOverflow",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "aliceCount", internalType: "uint256", type: "uint256" },
			{ name: "bobCount", internalType: "uint256", type: "uint256" },
			{ name: "yieldBefore", internalType: "uint256", type: "uint256" },
			{ name: "yieldAfter", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_LateJoiner_GetsNoHistoricalYield",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
			{ name: "y1", internalType: "uint256", type: "uint256" },
			{ name: "y2", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_LifecycleTotals",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price0", internalType: "uint256", type: "uint256" },
			{ name: "price1", internalType: "uint256", type: "uint256" },
			{ name: "price2", internalType: "uint256", type: "uint256" },
			{ name: "y0", internalType: "uint256", type: "uint256" },
			{ name: "y1", internalType: "uint256", type: "uint256" },
			{ name: "y2", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_MigrationAndPriceUpdate_Combined",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "seed", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
			{ name: "yieldBase", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_MixedOperations_Invariants",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "priceA", internalType: "uint256", type: "uint256" },
			{ name: "priceB", internalType: "uint256", type: "uint256" },
			{ name: "countA", internalType: "uint256", type: "uint256" },
			{ name: "countB", internalType: "uint256", type: "uint256" },
			{ name: "yieldA", internalType: "uint256", type: "uint256" },
			{ name: "yieldB", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_MultiCardDepositor_AggregatedPending",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "y1", internalType: "uint256", type: "uint256" },
			{ name: "y2", internalType: "uint256", type: "uint256" },
			{ name: "y3", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_MultiMigration_NoYieldDuplication",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "initialCount", internalType: "uint256", type: "uint256" },
			{ name: "removeCount", internalType: "uint256", type: "uint256" },
			{ name: "y1", internalType: "uint256", type: "uint256" },
			{ name: "y2", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_PartialRemove_FutureYieldCorrect",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "newPrice", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
			{ name: "y1", internalType: "uint256", type: "uint256" },
			{ name: "newRarity", internalType: "uint8", type: "uint8" },
			{ name: "y2", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_PendingYield_AlwaysNonNegative",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "p", internalType: "uint256", type: "uint256" },
			{ name: "d", internalType: "uint256", type: "uint256" },
			{ name: "y0", internalType: "uint256", type: "uint256" },
			{ name: "y1", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_PriceDeltaSymmetry",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "p0", internalType: "uint256", type: "uint256" },
			{ name: "p1", internalType: "uint256", type: "uint256" },
			{ name: "p2", internalType: "uint256", type: "uint256" },
			{ name: "y1", internalType: "uint256", type: "uint256" },
			{ name: "rarity", internalType: "uint8", type: "uint8" },
			{ name: "count", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_PriceOscillation_NeverNegativePending",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "p0", internalType: "uint256", type: "uint256" },
			{ name: "p1", internalType: "uint256", type: "uint256" },
			{ name: "y1", internalType: "uint256", type: "uint256" },
			{ name: "y2", internalType: "uint256", type: "uint256" },
			{ name: "y3", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_PriceOscillation_YieldConservation",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "p0", internalType: "uint256", type: "uint256" },
			{ name: "p1", internalType: "uint256", type: "uint256" },
			{ name: "y0", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_PriceRoundTrip_CorrectionCancels",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "priceCommon", internalType: "uint256", type: "uint256" },
			{ name: "priceRare", internalType: "uint256", type: "uint256" },
			{ name: "yieldCommon", internalType: "uint256", type: "uint256" },
			{ name: "yieldRare", internalType: "uint256", type: "uint256" },
			{ name: "countCommon", internalType: "uint256", type: "uint256" },
			{ name: "countRare", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_RarityIsolation",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "newPrice", internalType: "uint256", type: "uint256" },
			{ name: "oldRarity", internalType: "uint8", type: "uint8" },
			{ name: "newRarity", internalType: "uint8", type: "uint8" },
			{ name: "yieldOld", internalType: "uint256", type: "uint256" },
			{ name: "yieldNew", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_RarityMigration_PreservesYield",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "aliceCount", internalType: "uint256", type: "uint256" },
			{ name: "bobCount", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_RemoveAll_ZeroTotalShares",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "count", internalType: "uint256", type: "uint256" },
			{ name: "numDistributions", internalType: "uint8", type: "uint8" },
		],
		name: "testFuzz_SmallYieldDistributions_Accumulate",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "aliceCount", internalType: "uint256", type: "uint256" },
			{ name: "bobCount", internalType: "uint256", type: "uint256" },
			{ name: "carolCount", internalType: "uint256", type: "uint256" },
			{ name: "yieldAmount", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_TotalClaimed_NeverExceedsDistributed",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "price", internalType: "uint256", type: "uint256" },
			{ name: "aliceCount", internalType: "uint256", type: "uint256" },
			{ name: "bobCount", internalType: "uint256", type: "uint256" },
			{ name: "yieldAmount", internalType: "uint256", type: "uint256" },
			{ name: "rarity", internalType: "uint8", type: "uint8" },
		],
		name: "testFuzz_TwoDepositors_ProportionalSplit",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "string", type: "string", indexed: false },
		],
		name: "log",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "address", type: "address", indexed: false },
		],
		name: "log_address",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "val",
				internalType: "uint256[]",
				type: "uint256[]",
				indexed: false,
			},
		],
		name: "log_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "val",
				internalType: "int256[]",
				type: "int256[]",
				indexed: false,
			},
		],
		name: "log_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "val",
				internalType: "address[]",
				type: "address[]",
				indexed: false,
			},
		],
		name: "log_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "bytes", type: "bytes", indexed: false },
		],
		name: "log_bytes",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "bytes32", type: "bytes32", indexed: false },
		],
		name: "log_bytes32",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "int256", type: "int256", indexed: false },
		],
		name: "log_int",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "address", type: "address", indexed: false },
		],
		name: "log_named_address",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{
				name: "val",
				internalType: "uint256[]",
				type: "uint256[]",
				indexed: false,
			},
		],
		name: "log_named_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{
				name: "val",
				internalType: "int256[]",
				type: "int256[]",
				indexed: false,
			},
		],
		name: "log_named_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{
				name: "val",
				internalType: "address[]",
				type: "address[]",
				indexed: false,
			},
		],
		name: "log_named_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "bytes", type: "bytes", indexed: false },
		],
		name: "log_named_bytes",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "bytes32", type: "bytes32", indexed: false },
		],
		name: "log_named_bytes32",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "int256", type: "int256", indexed: false },
			{
				name: "decimals",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "log_named_decimal_int",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "uint256", type: "uint256", indexed: false },
			{
				name: "decimals",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "log_named_decimal_uint",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "int256", type: "int256", indexed: false },
		],
		name: "log_named_int",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "string", type: "string", indexed: false },
		],
		name: "log_named_string",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "uint256", type: "uint256", indexed: false },
		],
		name: "log_named_uint",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "string", type: "string", indexed: false },
		],
		name: "log_string",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "uint256", type: "uint256", indexed: false },
		],
		name: "log_uint",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "bytes", type: "bytes", indexed: false },
		],
		name: "logs",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ContextUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const contextUpgradeableAbi = [
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "version",
				internalType: "uint64",
				type: "uint64",
				indexed: false,
			},
		],
		name: "Initialized",
	},
	{ type: "error", inputs: [], name: "InvalidInitialization" },
	{ type: "error", inputs: [], name: "NotInitializing" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ECDSA
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ecdsaAbi = [
	{ type: "error", inputs: [], name: "ECDSAInvalidSignature" },
	{
		type: "error",
		inputs: [{ name: "length", internalType: "uint256", type: "uint256" }],
		name: "ECDSAInvalidSignatureLength",
	},
	{
		type: "error",
		inputs: [{ name: "s", internalType: "bytes32", type: "bytes32" }],
		name: "ECDSAInvalidSignatureS",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EIP712
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const eip712Abi = [
	{
		type: "function",
		inputs: [],
		name: "eip712Domain",
		outputs: [
			{ name: "fields", internalType: "bytes1", type: "bytes1" },
			{ name: "name", internalType: "string", type: "string" },
			{ name: "version", internalType: "string", type: "string" },
			{ name: "chainId", internalType: "uint256", type: "uint256" },
			{ name: "verifyingContract", internalType: "address", type: "address" },
			{ name: "salt", internalType: "bytes32", type: "bytes32" },
			{ name: "extensions", internalType: "uint256[]", type: "uint256[]" },
		],
		stateMutability: "view",
	},
	{ type: "event", anonymous: false, inputs: [], name: "EIP712DomainChanged" },
	{ type: "error", inputs: [], name: "InvalidShortString" },
	{
		type: "error",
		inputs: [{ name: "str", internalType: "string", type: "string" }],
		name: "StringTooLong",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC165
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc165Abi = [
	{
		type: "function",
		inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
		name: "supportsInterface",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC1967Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc1967ProxyAbi = [
	{
		type: "constructor",
		inputs: [
			{ name: "implementation", internalType: "address", type: "address" },
			{ name: "_data", internalType: "bytes", type: "bytes" },
		],
		stateMutability: "payable",
	},
	{ type: "fallback", stateMutability: "payable" },
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "implementation",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "Upgraded",
	},
	{
		type: "error",
		inputs: [{ name: "target", internalType: "address", type: "address" }],
		name: "AddressEmptyCode",
	},
	{
		type: "error",
		inputs: [
			{ name: "implementation", internalType: "address", type: "address" },
		],
		name: "ERC1967InvalidImplementation",
	},
	{ type: "error", inputs: [], name: "ERC1967NonPayable" },
	{ type: "error", inputs: [], name: "ERC1967ProxyUninitialized" },
	{ type: "error", inputs: [], name: "FailedCall" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC1967Utils
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc1967UtilsAbi = [
	{
		type: "error",
		inputs: [{ name: "admin", internalType: "address", type: "address" }],
		name: "ERC1967InvalidAdmin",
	},
	{
		type: "error",
		inputs: [{ name: "beacon", internalType: "address", type: "address" }],
		name: "ERC1967InvalidBeacon",
	},
	{
		type: "error",
		inputs: [
			{ name: "implementation", internalType: "address", type: "address" },
		],
		name: "ERC1967InvalidImplementation",
	},
	{ type: "error", inputs: [], name: "ERC1967NonPayable" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "spender", internalType: "address", type: "address" },
		],
		name: "allowance",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "approve",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "decimals",
		outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "name",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "symbol",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalSupply",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "transfer",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "transferFrom",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "spender",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "value",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "Approval",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "from", internalType: "address", type: "address", indexed: true },
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "value",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "Transfer",
	},
	{
		type: "error",
		inputs: [
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "allowance", internalType: "uint256", type: "uint256" },
			{ name: "needed", internalType: "uint256", type: "uint256" },
		],
		name: "ERC20InsufficientAllowance",
	},
	{
		type: "error",
		inputs: [
			{ name: "sender", internalType: "address", type: "address" },
			{ name: "balance", internalType: "uint256", type: "uint256" },
			{ name: "needed", internalType: "uint256", type: "uint256" },
		],
		name: "ERC20InsufficientBalance",
	},
	{
		type: "error",
		inputs: [{ name: "approver", internalType: "address", type: "address" }],
		name: "ERC20InvalidApprover",
	},
	{
		type: "error",
		inputs: [{ name: "receiver", internalType: "address", type: "address" }],
		name: "ERC20InvalidReceiver",
	},
	{
		type: "error",
		inputs: [{ name: "sender", internalType: "address", type: "address" }],
		name: "ERC20InvalidSender",
	},
	{
		type: "error",
		inputs: [{ name: "spender", internalType: "address", type: "address" }],
		name: "ERC20InvalidSpender",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20BatchQuery
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20BatchQueryAbi = [
	{
		type: "function",
		inputs: [
			{ name: "tokenAddress", internalType: "address", type: "address" },
			{ name: "userAddress", internalType: "address", type: "address" },
			{ name: "spenderAddress", internalType: "address", type: "address" },
		],
		name: "getBalanceAndAllowanceBatch",
		outputs: [
			{ name: "balance", internalType: "uint256", type: "uint256" },
			{ name: "allowance", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "tokenAddress", internalType: "address", type: "address" },
			{ name: "userAddresses", internalType: "address[]", type: "address[]" },
		],
		name: "getMultipleBalancesBatch",
		outputs: [
			{ name: "balances", internalType: "uint256[]", type: "uint256[]" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "tokenAddress", internalType: "address", type: "address" },
			{ name: "userAddress", internalType: "address", type: "address" },
		],
		name: "getTokenInfoBatch",
		outputs: [
			{ name: "name", internalType: "string", type: "string" },
			{ name: "symbol", internalType: "string", type: "string" },
			{ name: "decimals", internalType: "uint8", type: "uint8" },
			{ name: "totalSupply", internalType: "uint256", type: "uint256" },
			{ name: "userBalance", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20Permit
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20PermitAbi = [
	{
		type: "function",
		inputs: [],
		name: "DOMAIN_SEPARATOR",
		outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "spender", internalType: "address", type: "address" },
		],
		name: "allowance",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "approve",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "decimals",
		outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "eip712Domain",
		outputs: [
			{ name: "fields", internalType: "bytes1", type: "bytes1" },
			{ name: "name", internalType: "string", type: "string" },
			{ name: "version", internalType: "string", type: "string" },
			{ name: "chainId", internalType: "uint256", type: "uint256" },
			{ name: "verifyingContract", internalType: "address", type: "address" },
			{ name: "salt", internalType: "bytes32", type: "bytes32" },
			{ name: "extensions", internalType: "uint256[]", type: "uint256[]" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "name",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "nonces",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
			{ name: "deadline", internalType: "uint256", type: "uint256" },
			{ name: "v", internalType: "uint8", type: "uint8" },
			{ name: "r", internalType: "bytes32", type: "bytes32" },
			{ name: "s", internalType: "bytes32", type: "bytes32" },
		],
		name: "permit",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "symbol",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalSupply",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "transfer",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "transferFrom",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "spender",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "value",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "Approval",
	},
	{ type: "event", anonymous: false, inputs: [], name: "EIP712DomainChanged" },
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "from", internalType: "address", type: "address", indexed: true },
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "value",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "Transfer",
	},
	{ type: "error", inputs: [], name: "ECDSAInvalidSignature" },
	{
		type: "error",
		inputs: [{ name: "length", internalType: "uint256", type: "uint256" }],
		name: "ECDSAInvalidSignatureLength",
	},
	{
		type: "error",
		inputs: [{ name: "s", internalType: "bytes32", type: "bytes32" }],
		name: "ECDSAInvalidSignatureS",
	},
	{
		type: "error",
		inputs: [
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "allowance", internalType: "uint256", type: "uint256" },
			{ name: "needed", internalType: "uint256", type: "uint256" },
		],
		name: "ERC20InsufficientAllowance",
	},
	{
		type: "error",
		inputs: [
			{ name: "sender", internalType: "address", type: "address" },
			{ name: "balance", internalType: "uint256", type: "uint256" },
			{ name: "needed", internalType: "uint256", type: "uint256" },
		],
		name: "ERC20InsufficientBalance",
	},
	{
		type: "error",
		inputs: [{ name: "approver", internalType: "address", type: "address" }],
		name: "ERC20InvalidApprover",
	},
	{
		type: "error",
		inputs: [{ name: "receiver", internalType: "address", type: "address" }],
		name: "ERC20InvalidReceiver",
	},
	{
		type: "error",
		inputs: [{ name: "sender", internalType: "address", type: "address" }],
		name: "ERC20InvalidSender",
	},
	{
		type: "error",
		inputs: [{ name: "spender", internalType: "address", type: "address" }],
		name: "ERC20InvalidSpender",
	},
	{
		type: "error",
		inputs: [{ name: "deadline", internalType: "uint256", type: "uint256" }],
		name: "ERC2612ExpiredSignature",
	},
	{
		type: "error",
		inputs: [
			{ name: "signer", internalType: "address", type: "address" },
			{ name: "owner", internalType: "address", type: "address" },
		],
		name: "ERC2612InvalidSigner",
	},
	{
		type: "error",
		inputs: [
			{ name: "account", internalType: "address", type: "address" },
			{ name: "currentNonce", internalType: "uint256", type: "uint256" },
		],
		name: "InvalidAccountNonce",
	},
	{ type: "error", inputs: [], name: "InvalidShortString" },
	{
		type: "error",
		inputs: [{ name: "str", internalType: "string", type: "string" }],
		name: "StringTooLong",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC721
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc721Abi = [
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "approve",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "getApproved",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "operator", internalType: "address", type: "address" },
		],
		name: "isApprovedForAll",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "name",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "ownerOf",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "safeTransferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "safeTransferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "operator", internalType: "address", type: "address" },
			{ name: "approved", internalType: "bool", type: "bool" },
		],
		name: "setApprovalForAll",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
		name: "supportsInterface",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "symbol",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "tokenURI",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "transferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "approved",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "Approval",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "operator",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{ name: "approved", internalType: "bool", type: "bool", indexed: false },
		],
		name: "ApprovalForAll",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "from", internalType: "address", type: "address", indexed: true },
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "Transfer",
	},
	{
		type: "error",
		inputs: [
			{ name: "sender", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "owner", internalType: "address", type: "address" },
		],
		name: "ERC721IncorrectOwner",
	},
	{
		type: "error",
		inputs: [
			{ name: "operator", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "ERC721InsufficientApproval",
	},
	{
		type: "error",
		inputs: [{ name: "approver", internalType: "address", type: "address" }],
		name: "ERC721InvalidApprover",
	},
	{
		type: "error",
		inputs: [{ name: "operator", internalType: "address", type: "address" }],
		name: "ERC721InvalidOperator",
	},
	{
		type: "error",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "ERC721InvalidOwner",
	},
	{
		type: "error",
		inputs: [{ name: "receiver", internalType: "address", type: "address" }],
		name: "ERC721InvalidReceiver",
	},
	{
		type: "error",
		inputs: [{ name: "sender", internalType: "address", type: "address" }],
		name: "ERC721InvalidSender",
	},
	{
		type: "error",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "ERC721NonexistentToken",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC721Enumerable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc721EnumerableAbi = [
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "approve",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "getApproved",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "operator", internalType: "address", type: "address" },
		],
		name: "isApprovedForAll",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "name",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "ownerOf",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "safeTransferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "safeTransferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "operator", internalType: "address", type: "address" },
			{ name: "approved", internalType: "bool", type: "bool" },
		],
		name: "setApprovalForAll",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
		name: "supportsInterface",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "symbol",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "index", internalType: "uint256", type: "uint256" }],
		name: "tokenByIndex",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "index", internalType: "uint256", type: "uint256" },
		],
		name: "tokenOfOwnerByIndex",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "tokenURI",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalSupply",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "transferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "approved",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "Approval",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "operator",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{ name: "approved", internalType: "bool", type: "bool", indexed: false },
		],
		name: "ApprovalForAll",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "from", internalType: "address", type: "address", indexed: true },
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "Transfer",
	},
	{ type: "error", inputs: [], name: "ERC721EnumerableForbiddenBatchMint" },
	{
		type: "error",
		inputs: [
			{ name: "sender", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "owner", internalType: "address", type: "address" },
		],
		name: "ERC721IncorrectOwner",
	},
	{
		type: "error",
		inputs: [
			{ name: "operator", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "ERC721InsufficientApproval",
	},
	{
		type: "error",
		inputs: [{ name: "approver", internalType: "address", type: "address" }],
		name: "ERC721InvalidApprover",
	},
	{
		type: "error",
		inputs: [{ name: "operator", internalType: "address", type: "address" }],
		name: "ERC721InvalidOperator",
	},
	{
		type: "error",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "ERC721InvalidOwner",
	},
	{
		type: "error",
		inputs: [{ name: "receiver", internalType: "address", type: "address" }],
		name: "ERC721InvalidReceiver",
	},
	{
		type: "error",
		inputs: [{ name: "sender", internalType: "address", type: "address" }],
		name: "ERC721InvalidSender",
	},
	{
		type: "error",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "ERC721NonexistentToken",
	},
	{
		type: "error",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "index", internalType: "uint256", type: "uint256" },
		],
		name: "ERC721OutOfBoundsIndex",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Errors
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const errorsAbi = [
	{ type: "error", inputs: [], name: "FailedCall" },
	{ type: "error", inputs: [], name: "FailedDeployment" },
	{
		type: "error",
		inputs: [
			{ name: "balance", internalType: "uint256", type: "uint256" },
			{ name: "needed", internalType: "uint256", type: "uint256" },
		],
		name: "InsufficientBalance",
	},
	{
		type: "error",
		inputs: [{ name: "", internalType: "address", type: "address" }],
		name: "MissingPrecompile",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Gacha
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaAbi = [
	{
		type: "function",
		inputs: [],
		name: "TOTAL_WEIGHT",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "UPGRADE_INTERFACE_VERSION",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "economyManager",
		outputs: [
			{
				name: "",
				internalType: "contract IGachaEconomyManager",
				type: "address",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "emergencyPause",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "emergencyUnpause",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "feeToken",
		outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "feeTokenDecimals",
		outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "feeTokenScalar",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "triggerId", internalType: "uint256", type: "uint256" },
			{ name: "randomness", internalType: "bytes32", type: "bytes32" },
		],
		name: "fulfillRandomness",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "gachaServiceHandler",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getAverageRarityValues",
		outputs: [
			{ name: "averageValues", internalType: "uint256[]", type: "uint256[]" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "triggerIds", internalType: "uint256[]", type: "uint256[]" },
		],
		name: "getBatchSpinRequests",
		outputs: [
			{
				name: "requests",
				internalType: "struct Gacha.SpinRequest[]",
				type: "tuple[]",
				components: [
					{ name: "feePaid", internalType: "uint256", type: "uint256" },
					{ name: "requestTime", internalType: "uint256", type: "uint256" },
					{ name: "requester", internalType: "address", type: "address" },
					{ name: "statusFlags", internalType: "uint32", type: "uint32" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getCurrentRarityWeights",
		outputs: [
			{ name: "weights", internalType: "uint256[]", type: "uint256[]" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getCurrentSpinFee",
		outputs: [{ name: "fee", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getExpectedValueUSD",
		outputs: [
			{ name: "expectedValueUSD", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getGachaConfigBatch",
		outputs: [
			{ name: "feeTokenAddr", internalType: "address", type: "address" },
			{ name: "spinFeeAmount", internalType: "uint256", type: "uint256" },
			{ name: "isPaused", internalType: "bool", type: "bool" },
			{ name: "rarityWeights", internalType: "uint256[]", type: "uint256[]" },
			{ name: "totalWeight", internalType: "uint256", type: "uint256" },
			{ name: "isAvailable", internalType: "bool", type: "bool" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getGlobalAnalytics",
		outputs: [
			{ name: "totalSpins", internalType: "uint256", type: "uint256" },
			{ name: "totalRefunds", internalType: "uint256", type: "uint256" },
			{ name: "totalReclaims", internalType: "uint256", type: "uint256" },
			{
				name: "globalRarityWinCounts",
				internalType: "uint256[]",
				type: "uint256[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getNextTriggerId",
		outputs: [{ name: "nextId", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "triggerId", internalType: "uint256", type: "uint256" }],
		name: "getSpinRequest",
		outputs: [
			{ name: "requester", internalType: "address", type: "address" },
			{ name: "fulfilled", internalType: "bool", type: "bool" },
			{ name: "reclaimed", internalType: "bool", type: "bool" },
			{ name: "feePaid", internalType: "uint256", type: "uint256" },
			{ name: "requestTime", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getTargetRarityBps",
		outputs: [
			{ name: "targetBps", internalType: "uint256[]", type: "uint256[]" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getTotalValueLocked",
		outputs: [
			{ name: "totalValueUSD", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getTreasuryAddress",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getTreasuryDistribution",
		outputs: [
			{ name: "distribution", internalType: "uint256[]", type: "uint256[]" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "user", internalType: "address", type: "address" }],
		name: "getUserAnalytics",
		outputs: [
			{ name: "totalSpins", internalType: "uint256", type: "uint256" },
			{ name: "totalRefunds", internalType: "uint256", type: "uint256" },
			{ name: "totalReclaims", internalType: "uint256", type: "uint256" },
			{ name: "rarityWins", internalType: "uint256[]", type: "uint256[]" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "user", internalType: "address", type: "address" }],
		name: "getUserGachaBatch",
		outputs: [
			{ name: "totalSpins", internalType: "uint256", type: "uint256" },
			{ name: "totalRefunds", internalType: "uint256", type: "uint256" },
			{ name: "totalReclaims", internalType: "uint256", type: "uint256" },
			{ name: "rarityWins", internalType: "uint256[]", type: "uint256[]" },
			{ name: "spinCount", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "user", internalType: "address", type: "address" },
			{ name: "rarity", internalType: "uint8", type: "uint8" },
		],
		name: "getUserRarityWinCount",
		outputs: [{ name: "winCount", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "user", internalType: "address", type: "address" }],
		name: "getUserSpinCount",
		outputs: [{ name: "spinCount", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		name: "globalRarityWins",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "_owner", internalType: "address", type: "address" },
			{
				name: "_gachaServiceHandler",
				internalType: "address",
				type: "address",
			},
			{ name: "_feeToken", internalType: "address", type: "address" },
			{ name: "_minSpinFee", internalType: "uint256", type: "uint256" },
			{ name: "_treasury", internalType: "address", type: "address" },
			{ name: "_economyManager", internalType: "address", type: "address" },
		],
		name: "initialize",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "maxSpinFee",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "minSpinFee",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "numRarities",
		outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "owner",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "paused",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "pricingPremiumBps",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "proxiableUUID",
		outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "triggerId", internalType: "uint256", type: "uint256" }],
		name: "reclaimFailedSpin",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "targetBps", internalType: "uint256[]", type: "uint256[]" },
		],
		name: "setDynamicWeightsConfig",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "_economyManager", internalType: "address", type: "address" },
		],
		name: "setEconomyManager",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "decimals", internalType: "uint8", type: "uint8" }],
		name: "setFeeTokenDecimals",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{
				name: "_gachaServiceHandler",
				internalType: "address",
				type: "address",
			},
		],
		name: "setGachaServiceHandler",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "premiumBps", internalType: "uint256", type: "uint256" },
			{ name: "minFee", internalType: "uint256", type: "uint256" },
			{ name: "maxFee", internalType: "uint256", type: "uint256" },
		],
		name: "setPricingConfig",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "_spinTimeout", internalType: "uint256", type: "uint256" },
		],
		name: "setSpinTimeout",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "maxFee", internalType: "uint256", type: "uint256" }],
		name: "spin",
		outputs: [{ name: "triggerId", internalType: "uint256", type: "uint256" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		name: "spinRequests",
		outputs: [
			{ name: "feePaid", internalType: "uint256", type: "uint256" },
			{ name: "requestTime", internalType: "uint256", type: "uint256" },
			{ name: "requester", internalType: "address", type: "address" },
			{ name: "statusFlags", internalType: "uint32", type: "uint32" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "spinTimeout",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "deadline", internalType: "uint256", type: "uint256" },
			{ name: "v", internalType: "uint8", type: "uint8" },
			{ name: "r", internalType: "bytes32", type: "bytes32" },
			{ name: "s", internalType: "bytes32", type: "bytes32" },
			{ name: "maxFee", internalType: "uint256", type: "uint256" },
		],
		name: "spinWithPermit",
		outputs: [{ name: "triggerId", internalType: "uint256", type: "uint256" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		name: "targetRarityBps",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalReclaimCount",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalRefundCount",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalSpinCount",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "treasury",
		outputs: [
			{ name: "", internalType: "contract GachaTreasury", type: "address" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "newImplementation", internalType: "address", type: "address" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "upgradeToAndCall",
		outputs: [],
		stateMutability: "payable",
	},
	{
		type: "function",
		inputs: [
			{ name: "", internalType: "address", type: "address" },
			{ name: "", internalType: "uint8", type: "uint8" },
		],
		name: "userRarityWins",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "address", type: "address" }],
		name: "userReclaimCount",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "address", type: "address" }],
		name: "userRefundCount",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "address", type: "address" }],
		name: "userSpinCount",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "targetBps",
				internalType: "uint256[]",
				type: "uint256[]",
				indexed: false,
			},
		],
		name: "DynamicWeightsUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "oldManager",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newManager",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "EconomyManagerUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "admin",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "EmergencyPause",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "admin",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "EmergencyUnpause",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousDecimals",
				internalType: "uint8",
				type: "uint8",
				indexed: false,
			},
			{
				name: "newDecimals",
				internalType: "uint8",
				type: "uint8",
				indexed: false,
			},
		],
		name: "FeeTokenDecimalsUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "oldHandler",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newHandler",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "GachaServiceHandlerUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "version",
				internalType: "uint64",
				type: "uint64",
				indexed: false,
			},
		],
		name: "Initialized",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "OwnershipTransferred",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "Paused",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "premiumBps",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "minFee",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "maxFee",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "PricingConfigUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "triggerId",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "RandomnessRequested",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "triggerId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "requester",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{ name: "rarity", internalType: "uint8", type: "uint8", indexed: false },
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: false,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "appraisedPrice",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "SpinCompleted",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "triggerId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "requester",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "refundAmount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "SpinReclaimed",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "triggerId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "requester",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "selectedRarity",
				internalType: "uint8",
				type: "uint8",
				indexed: false,
			},
			{
				name: "refundAmount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "SpinRefunded",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "amount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "SpinRevenueForwarded",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "triggerId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "requester",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "status",
				internalType: "string",
				type: "string",
				indexed: false,
			},
			{
				name: "timestamp",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "SpinStatusUpdate",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "oldTimeout",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "newTimeout",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "SpinTimeoutUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "Unpaused",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "implementation",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "Upgraded",
	},
	{
		type: "error",
		inputs: [{ name: "target", internalType: "address", type: "address" }],
		name: "AddressEmptyCode",
	},
	{ type: "error", inputs: [], name: "AlreadyFulfilled" },
	{ type: "error", inputs: [], name: "CannotReclaimFulfilledSpin" },
	{
		type: "error",
		inputs: [
			{ name: "implementation", internalType: "address", type: "address" },
		],
		name: "ERC1967InvalidImplementation",
	},
	{ type: "error", inputs: [], name: "ERC1967NonPayable" },
	{ type: "error", inputs: [], name: "EnforcedPause" },
	{ type: "error", inputs: [], name: "ExpectedPause" },
	{ type: "error", inputs: [], name: "FailedCall" },
	{ type: "error", inputs: [], name: "InvalidEconomyManager" },
	{ type: "error", inputs: [], name: "InvalidFeeToken" },
	{ type: "error", inputs: [], name: "InvalidFeeTokenDecimals" },
	{ type: "error", inputs: [], name: "InvalidInitialization" },
	{ type: "error", inputs: [], name: "InvalidPricingConfig" },
	{ type: "error", inputs: [], name: "InvalidRecipient" },
	{ type: "error", inputs: [], name: "InvalidServiceHandler" },
	{ type: "error", inputs: [], name: "InvalidSpinTimeout" },
	{ type: "error", inputs: [], name: "InvalidTreasuryContract" },
	{ type: "error", inputs: [], name: "InvalidTriggerId" },
	{ type: "error", inputs: [], name: "InvalidWeightsLength" },
	{
		type: "error",
		inputs: [
			{ name: "currentFee", internalType: "uint256", type: "uint256" },
			{ name: "maxFee", internalType: "uint256", type: "uint256" },
		],
		name: "MaxFeeExceeded",
	},
	{
		type: "error",
		inputs: [{ name: "rarity", internalType: "uint8", type: "uint8" }],
		name: "NoNFTsAvailable",
	},
	{ type: "error", inputs: [], name: "NoTreasuryInventory" },
	{ type: "error", inputs: [], name: "NotInitializing" },
	{ type: "error", inputs: [], name: "NotSpinRequester" },
	{
		type: "error",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "OwnableInvalidOwner",
	},
	{
		type: "error",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "OwnableUnauthorizedAccount",
	},
	{ type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
	{
		type: "error",
		inputs: [{ name: "token", internalType: "address", type: "address" }],
		name: "SafeERC20FailedOperation",
	},
	{ type: "error", inputs: [], name: "SpinAlreadyReclaimed" },
	{ type: "error", inputs: [], name: "SpinRequestNotExpired" },
	{ type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
	{
		type: "error",
		inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
		name: "UUPSUnsupportedProxiableUUID",
	},
	{ type: "error", inputs: [], name: "UnauthorizedServiceHandler" },
	{ type: "error", inputs: [], name: "WeightsMustSumToTotal" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GachaEconomyManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaEconomyManagerAbi = [
	{
		type: "function",
		inputs: [],
		name: "BPS_DENOMINATOR",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "UPGRADE_INTERFACE_VERSION",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "cardGroupedVault",
		outputs: [
			{ name: "", internalType: "contract ICardGroupedVault", type: "address" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "depositorShareBps",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "feeToken",
		outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "gacha",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "feeToken_", internalType: "address", type: "address" },
			{ name: "gacha_", internalType: "address", type: "address" },
			{ name: "cardGroupedVault_", internalType: "address", type: "address" },
			{ name: "protocolTreasury_", internalType: "address", type: "address" },
			{ name: "numRarities_", internalType: "uint8", type: "uint8" },
		],
		name: "initialize",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "numRarities",
		outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "usdcAmount", internalType: "uint256", type: "uint256" },
			{ name: "hitRarity", internalType: "uint8", type: "uint8" },
		],
		name: "onSpinRevenue",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "owner",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "pause",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "paused",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "protocolShareBps",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "protocolTreasury",
		outputs: [
			{ name: "", internalType: "contract IProtocolTreasury", type: "address" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "proxiableUUID",
		outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		name: "queuedYieldByRarity",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		name: "revenueByRarity",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "newToken", internalType: "address", type: "address" }],
		name: "setFeeToken",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "newGacha", internalType: "address", type: "address" }],
		name: "setGacha",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "depositorBps", internalType: "uint256", type: "uint256" },
			{ name: "protocolBps", internalType: "uint256", type: "uint256" },
		],
		name: "setRevenueSplit",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "cardGroupedVault_", internalType: "address", type: "address" },
			{ name: "protocolTreasury_", internalType: "address", type: "address" },
		],
		name: "setVaults",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "totalQueuedYield",
		outputs: [{ name: "total", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalQueuedYieldReleased",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalRevenueProcessed",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalToDepositors",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalToProtocol",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "unpause",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "newImplementation", internalType: "address", type: "address" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "upgradeToAndCall",
		outputs: [],
		stateMutability: "payable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousVault",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newVault",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "CardGroupedVaultUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "amount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{ name: "rarity", internalType: "uint8", type: "uint8", indexed: false },
		],
		name: "DepositorYieldQueued",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousToken",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newToken",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "FeeTokenUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousGacha",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newGacha",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "GachaUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "version",
				internalType: "uint64",
				type: "uint64",
				indexed: false,
			},
		],
		name: "Initialized",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "OwnershipTransferred",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "Paused",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousTreasury",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newTreasury",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "ProtocolTreasuryUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "amount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{ name: "rarity", internalType: "uint8", type: "uint8", indexed: false },
		],
		name: "QueuedDepositorYieldProcessed",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "depositorShareBps",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "protocolShareBps",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "RevenueSplitUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "amount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "depositorShare",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "protocolShare",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "SpinRevenueReceived",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "Unpaused",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "implementation",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "Upgraded",
	},
	{
		type: "error",
		inputs: [{ name: "target", internalType: "address", type: "address" }],
		name: "AddressEmptyCode",
	},
	{ type: "error", inputs: [], name: "CallerNotGacha" },
	{
		type: "error",
		inputs: [
			{ name: "implementation", internalType: "address", type: "address" },
		],
		name: "ERC1967InvalidImplementation",
	},
	{ type: "error", inputs: [], name: "ERC1967NonPayable" },
	{ type: "error", inputs: [], name: "EnforcedPause" },
	{ type: "error", inputs: [], name: "ExpectedPause" },
	{ type: "error", inputs: [], name: "FailedCall" },
	{ type: "error", inputs: [], name: "InvalidInitialization" },
	{ type: "error", inputs: [], name: "InvalidNumRarities" },
	{ type: "error", inputs: [], name: "InvalidRevenueSplit" },
	{ type: "error", inputs: [], name: "NotInitializing" },
	{
		type: "error",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "OwnableInvalidOwner",
	},
	{
		type: "error",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "OwnableUnauthorizedAccount",
	},
	{ type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
	{
		type: "error",
		inputs: [{ name: "token", internalType: "address", type: "address" }],
		name: "SafeERC20FailedOperation",
	},
	{ type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
	{
		type: "error",
		inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
		name: "UUPSUnsupportedProxiableUUID",
	},
	{ type: "error", inputs: [], name: "ZeroAddress" },
	{ type: "error", inputs: [], name: "ZeroRevenue" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GachaEconomyManagerFuzz
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaEconomyManagerFuzzAbi = [
	{
		type: "function",
		inputs: [],
		name: "IS_TEST",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeArtifacts",
		outputs: [
			{
				name: "excludedArtifacts_",
				internalType: "string[]",
				type: "string[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeContracts",
		outputs: [
			{
				name: "excludedContracts_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeSelectors",
		outputs: [
			{
				name: "excludedSelectors_",
				internalType: "struct StdInvariant.FuzzSelector[]",
				type: "tuple[]",
				components: [
					{ name: "addr", internalType: "address", type: "address" },
					{ name: "selectors", internalType: "bytes4[]", type: "bytes4[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeSenders",
		outputs: [
			{
				name: "excludedSenders_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "failed",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "setUp",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "targetArtifactSelectors",
		outputs: [
			{
				name: "targetedArtifactSelectors_",
				internalType: "struct StdInvariant.FuzzArtifactSelector[]",
				type: "tuple[]",
				components: [
					{ name: "artifact", internalType: "string", type: "string" },
					{ name: "selectors", internalType: "bytes4[]", type: "bytes4[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetArtifacts",
		outputs: [
			{
				name: "targetedArtifacts_",
				internalType: "string[]",
				type: "string[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetContracts",
		outputs: [
			{
				name: "targetedContracts_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetInterfaces",
		outputs: [
			{
				name: "targetedInterfaces_",
				internalType: "struct StdInvariant.FuzzInterface[]",
				type: "tuple[]",
				components: [
					{ name: "addr", internalType: "address", type: "address" },
					{ name: "artifacts", internalType: "string[]", type: "string[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetSelectors",
		outputs: [
			{
				name: "targetedSelectors_",
				internalType: "struct StdInvariant.FuzzSelector[]",
				type: "tuple[]",
				components: [
					{ name: "addr", internalType: "address", type: "address" },
					{ name: "selectors", internalType: "bytes4[]", type: "bytes4[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetSenders",
		outputs: [
			{
				name: "targetedSenders_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "revenueAmount", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_PausedContractRejectsRevenue",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "revenueAmount", internalType: "uint256", type: "uint256" },
			{ name: "unauthorizedCaller", internalType: "address", type: "address" },
		],
		name: "testFuzz_UnauthorizedCaller_Fails",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "newDepositorBps", internalType: "uint256", type: "uint256" },
		],
		name: "testFuzz_UpdateShareBps",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "testFuzz_ZeroRevenue_Fails",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "string", type: "string", indexed: false },
		],
		name: "log",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "address", type: "address", indexed: false },
		],
		name: "log_address",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "val",
				internalType: "uint256[]",
				type: "uint256[]",
				indexed: false,
			},
		],
		name: "log_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "val",
				internalType: "int256[]",
				type: "int256[]",
				indexed: false,
			},
		],
		name: "log_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "val",
				internalType: "address[]",
				type: "address[]",
				indexed: false,
			},
		],
		name: "log_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "bytes", type: "bytes", indexed: false },
		],
		name: "log_bytes",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "bytes32", type: "bytes32", indexed: false },
		],
		name: "log_bytes32",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "int256", type: "int256", indexed: false },
		],
		name: "log_int",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "address", type: "address", indexed: false },
		],
		name: "log_named_address",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{
				name: "val",
				internalType: "uint256[]",
				type: "uint256[]",
				indexed: false,
			},
		],
		name: "log_named_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{
				name: "val",
				internalType: "int256[]",
				type: "int256[]",
				indexed: false,
			},
		],
		name: "log_named_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{
				name: "val",
				internalType: "address[]",
				type: "address[]",
				indexed: false,
			},
		],
		name: "log_named_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "bytes", type: "bytes", indexed: false },
		],
		name: "log_named_bytes",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "bytes32", type: "bytes32", indexed: false },
		],
		name: "log_named_bytes32",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "int256", type: "int256", indexed: false },
			{
				name: "decimals",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "log_named_decimal_int",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "uint256", type: "uint256", indexed: false },
			{
				name: "decimals",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "log_named_decimal_uint",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "int256", type: "int256", indexed: false },
		],
		name: "log_named_int",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "string", type: "string", indexed: false },
		],
		name: "log_named_string",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "uint256", type: "uint256", indexed: false },
		],
		name: "log_named_uint",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "string", type: "string", indexed: false },
		],
		name: "log_string",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "uint256", type: "uint256", indexed: false },
		],
		name: "log_uint",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "bytes", type: "bytes", indexed: false },
		],
		name: "logs",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GachaServiceHandler
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaServiceHandlerAbi = [
	{
		type: "constructor",
		inputs: [
			{
				name: "serviceManager",
				internalType: "contract IWavsServiceManager",
				type: "address",
			},
			{ name: "gachaAddress", internalType: "address", type: "address" },
		],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "getGacha",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getGachaTreasury",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getServiceManager",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{
				name: "envelope",
				internalType: "struct IWavsServiceHandler.Envelope",
				type: "tuple",
				components: [
					{ name: "eventId", internalType: "bytes20", type: "bytes20" },
					{ name: "ordering", internalType: "bytes12", type: "bytes12" },
					{ name: "payload", internalType: "bytes", type: "bytes" },
				],
			},
			{
				name: "signatureData",
				internalType: "struct IWavsServiceHandler.SignatureData",
				type: "tuple",
				components: [
					{ name: "signers", internalType: "address[]", type: "address[]" },
					{ name: "signatures", internalType: "bytes[]", type: "bytes[]" },
					{ name: "referenceBlock", internalType: "uint32", type: "uint32" },
				],
			},
		],
		name: "handleSignedEnvelope",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "randomness",
				internalType: "bytes32",
				type: "bytes32",
				indexed: false,
			},
		],
		name: "RandomnessReceived",
	},
	{ type: "error", inputs: [], name: "InvalidGachaAddress" },
	{ type: "error", inputs: [], name: "InvalidServiceManager" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GachaTreasury
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaTreasuryAbi = [
	{
		type: "function",
		inputs: [],
		name: "MAX_BATCH_DEPOSIT",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "MAX_BATCH_WITHDRAW",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "MAX_MIGRATION_BATCH",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "UPGRADE_INTERFACE_VERSION",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "collection", internalType: "address", type: "address" }],
		name: "addToWhitelist",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "appraisalContract",
		outputs: [
			{ name: "", internalType: "contract NFTAppraisal", type: "address" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collections", internalType: "address[]", type: "address[]" },
			{ name: "tokenIds", internalType: "uint256[]", type: "uint256[]" },
		],
		name: "batchDepositNFT",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "collections", internalType: "address[]", type: "address[]" },
			{ name: "tokenIds", internalType: "uint256[]", type: "uint256[]" },
		],
		name: "batchMigrateNFTRarity",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "cardGroupedVault",
		outputs: [
			{ name: "", internalType: "contract ICardGroupedVault", type: "address" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		name: "cardTotalDeposits",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "depositNFT",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "", internalType: "address", type: "address" },
			{ name: "", internalType: "uint256", type: "uint256" },
		],
		name: "depositedNFTs",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "emergencyPause",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "emergencyUnpause",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "gachaContract",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getAllPriceRanges",
		outputs: [
			{
				name: "ranges",
				internalType: "struct GachaTreasury.PriceRange[]",
				type: "tuple[]",
				components: [
					{ name: "minPriceUSD", internalType: "uint256", type: "uint256" },
					{ name: "maxPriceUSD", internalType: "uint256", type: "uint256" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getAllRarityCounts",
		outputs: [{ name: "counts", internalType: "uint256[]", type: "uint256[]" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getAllRarityTotalValues",
		outputs: [{ name: "values", internalType: "uint256[]", type: "uint256[]" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "cardId", internalType: "bytes32", type: "bytes32" }],
		name: "getCardTotalDeposits",
		outputs: [{ name: "totalCount", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getGlobalStats",
		outputs: [
			{ name: "totalDeposited", internalType: "uint256", type: "uint256" },
			{ name: "totalClaimed", internalType: "uint256", type: "uint256" },
			{ name: "activeUsers", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "getNFTCurrentRarity",
		outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "getNFTReceiveTime",
		outputs: [
			{ name: "receiveTime", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "getNFTRedemptionDeadline",
		outputs: [{ name: "deadline", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getNumRarities",
		outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getPlatformOverviewBatch",
		outputs: [
			{ name: "rarityCounts", internalType: "uint256[]", type: "uint256[]" },
			{ name: "totalItems", internalType: "uint256", type: "uint256" },
			{ name: "gachaAvailable", internalType: "bool", type: "bool" },
			{ name: "totalDeposited", internalType: "uint256", type: "uint256" },
			{ name: "totalClaimed", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "rarity", internalType: "uint8", type: "uint8" }],
		name: "getPriceRange",
		outputs: [
			{ name: "minPrice", internalType: "uint256", type: "uint256" },
			{ name: "maxPrice", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "priceUSD", internalType: "uint256", type: "uint256" }],
		name: "getRarityByPrice",
		outputs: [{ name: "rarity", internalType: "uint8", type: "uint8" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "rarity", internalType: "uint8", type: "uint8" }],
		name: "getRarityCount",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "rarity", internalType: "uint8", type: "uint8" }],
		name: "getRarityName",
		outputs: [{ name: "name", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getRarityNames",
		outputs: [{ name: "names", internalType: "string[]", type: "string[]" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "rarity", internalType: "uint8", type: "uint8" }],
		name: "getRarityTotalValue",
		outputs: [{ name: "totalValue", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getTotalItemsCount",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "rarity", internalType: "uint8", type: "uint8" },
			{ name: "index", internalType: "uint256", type: "uint256" },
		],
		name: "getTreasuryItem",
		outputs: [
			{
				name: "",
				internalType: "struct GachaTreasury.NFTItem",
				type: "tuple",
				components: [
					{ name: "collection", internalType: "address", type: "address" },
					{ name: "depositor", internalType: "address", type: "address" },
					{ name: "tokenId", internalType: "uint256", type: "uint256" },
					{ name: "appraisedPrice", internalType: "uint256", type: "uint256" },
					{ name: "rarity", internalType: "uint8", type: "uint8" },
					{ name: "depositTime", internalType: "uint256", type: "uint256" },
					{ name: "receiveTime", internalType: "uint256", type: "uint256" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "rarity", internalType: "uint8", type: "uint8" }],
		name: "getTreasuryItems",
		outputs: [
			{
				name: "",
				internalType: "struct GachaTreasury.NFTItem[]",
				type: "tuple[]",
				components: [
					{ name: "collection", internalType: "address", type: "address" },
					{ name: "depositor", internalType: "address", type: "address" },
					{ name: "tokenId", internalType: "uint256", type: "uint256" },
					{ name: "appraisedPrice", internalType: "uint256", type: "uint256" },
					{ name: "rarity", internalType: "uint8", type: "uint8" },
					{ name: "depositTime", internalType: "uint256", type: "uint256" },
					{ name: "receiveTime", internalType: "uint256", type: "uint256" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "user", internalType: "address", type: "address" }],
		name: "getUserAllDepositCounts",
		outputs: [{ name: "counts", internalType: "uint256[]", type: "uint256[]" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "user", internalType: "address", type: "address" }],
		name: "getUserAllDepositValues",
		outputs: [{ name: "values", internalType: "uint256[]", type: "uint256[]" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "user", internalType: "address", type: "address" },
			{ name: "offset", internalType: "uint256", type: "uint256" },
			{ name: "limit", internalType: "uint256", type: "uint256" },
		],
		name: "getUserCardDepositsPage",
		outputs: [
			{
				name: "deposits",
				internalType: "struct GachaTreasury.UserCardDeposit[]",
				type: "tuple[]",
				components: [
					{ name: "cardId", internalType: "bytes32", type: "bytes32" },
					{ name: "depositCount", internalType: "uint256", type: "uint256" },
					{
						name: "totalCardDeposits",
						internalType: "uint256",
						type: "uint256",
					},
				],
			},
			{ name: "total", internalType: "uint256", type: "uint256" },
			{ name: "hasMore", internalType: "bool", type: "bool" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "user", internalType: "address", type: "address" },
			{ name: "offset", internalType: "uint256", type: "uint256" },
			{ name: "limit", internalType: "uint256", type: "uint256" },
		],
		name: "getUserCardIds",
		outputs: [
			{ name: "cardIds", internalType: "bytes32[]", type: "bytes32[]" },
			{ name: "total", internalType: "uint256", type: "uint256" },
			{ name: "hasMore", internalType: "bool", type: "bool" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "user", internalType: "address", type: "address" }],
		name: "getUserCardIdsLength",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "user", internalType: "address", type: "address" },
			{ name: "rarity", internalType: "uint8", type: "uint8" },
		],
		name: "getUserDepositCount",
		outputs: [{ name: "count", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "user", internalType: "address", type: "address" },
			{ name: "rarity", internalType: "uint8", type: "uint8" },
		],
		name: "getUserDepositValue",
		outputs: [{ name: "value", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "user", internalType: "address", type: "address" }],
		name: "getUserDepositedNFTs",
		outputs: [
			{
				name: "items",
				internalType: "struct GachaTreasury.NFTItem[]",
				type: "tuple[]",
				components: [
					{ name: "collection", internalType: "address", type: "address" },
					{ name: "depositor", internalType: "address", type: "address" },
					{ name: "tokenId", internalType: "uint256", type: "uint256" },
					{ name: "appraisedPrice", internalType: "uint256", type: "uint256" },
					{ name: "rarity", internalType: "uint8", type: "uint8" },
					{ name: "depositTime", internalType: "uint256", type: "uint256" },
					{ name: "receiveTime", internalType: "uint256", type: "uint256" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "user", internalType: "address", type: "address" },
			{ name: "cardId", internalType: "bytes32", type: "bytes32" },
			{ name: "offset", internalType: "uint256", type: "uint256" },
			{ name: "limit", internalType: "uint256", type: "uint256" },
		],
		name: "getUserDepositedNFTsByCardIdPaginated",
		outputs: [
			{
				name: "items",
				internalType: "struct GachaTreasury.NFTItem[]",
				type: "tuple[]",
				components: [
					{ name: "collection", internalType: "address", type: "address" },
					{ name: "depositor", internalType: "address", type: "address" },
					{ name: "tokenId", internalType: "uint256", type: "uint256" },
					{ name: "appraisedPrice", internalType: "uint256", type: "uint256" },
					{ name: "rarity", internalType: "uint8", type: "uint8" },
					{ name: "depositTime", internalType: "uint256", type: "uint256" },
					{ name: "receiveTime", internalType: "uint256", type: "uint256" },
				],
			},
			{ name: "total", internalType: "uint256", type: "uint256" },
			{ name: "hasMore", internalType: "bool", type: "bool" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "user", internalType: "address", type: "address" },
			{ name: "offset", internalType: "uint256", type: "uint256" },
			{ name: "limit", internalType: "uint256", type: "uint256" },
		],
		name: "getUserDepositedNFTsPaginated",
		outputs: [
			{
				name: "items",
				internalType: "struct GachaTreasury.NFTItem[]",
				type: "tuple[]",
				components: [
					{ name: "collection", internalType: "address", type: "address" },
					{ name: "depositor", internalType: "address", type: "address" },
					{ name: "tokenId", internalType: "uint256", type: "uint256" },
					{ name: "appraisedPrice", internalType: "uint256", type: "uint256" },
					{ name: "rarity", internalType: "uint8", type: "uint8" },
					{ name: "depositTime", internalType: "uint256", type: "uint256" },
					{ name: "receiveTime", internalType: "uint256", type: "uint256" },
				],
			},
			{ name: "total", internalType: "uint256", type: "uint256" },
			{ name: "hasMore", internalType: "bool", type: "bool" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "user", internalType: "address", type: "address" }],
		name: "getUserLifetimeClaimed",
		outputs: [{ name: "claimed", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "user", internalType: "address", type: "address" }],
		name: "getUserLifetimeDeposited",
		outputs: [{ name: "deposited", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "user", internalType: "address", type: "address" }],
		name: "getUserLifetimeWithdrawn",
		outputs: [{ name: "withdrawn", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "user", internalType: "address", type: "address" }],
		name: "getUserProfileBatch",
		outputs: [
			{ name: "depositCounts", internalType: "uint256[]", type: "uint256[]" },
			{ name: "totalDeposits", internalType: "uint256", type: "uint256" },
			{ name: "lifetimeClaimed", internalType: "uint256", type: "uint256" },
			{ name: "lifetimeDeposited", internalType: "uint256", type: "uint256" },
			{ name: "lifetimeWithdrawn", internalType: "uint256", type: "uint256" },
			{ name: "netContribution", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "user", internalType: "address", type: "address" }],
		name: "getUserTotalDepositCount",
		outputs: [{ name: "totalCount", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getWhitelistLength",
		outputs: [{ name: "count", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getWhitelistedCollections",
		outputs: [
			{ name: "collections", internalType: "address[]", type: "address[]" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "globalLifetimeClaimed",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "globalLifetimeDeposited",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "seller", internalType: "address", type: "address" },
			{ name: "appraisalUSD", internalType: "uint256", type: "uint256" },
		],
		name: "handleRedemptionReturn",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "_owner", internalType: "address", type: "address" },
			{ name: "_gachaContract", internalType: "address", type: "address" },
			{ name: "_appraisalContract", internalType: "address", type: "address" },
			{ name: "_numRarities", internalType: "uint8", type: "uint8" },
			{ name: "_rarityNames", internalType: "string[]", type: "string[]" },
			{ name: "minPrices", internalType: "uint256[]", type: "uint256[]" },
			{ name: "maxPrices", internalType: "uint256[]", type: "uint256[]" },
		],
		name: "initialize",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "collection", internalType: "address", type: "address" }],
		name: "isCollectionWhitelisted",
		outputs: [{ name: "isWhitelisted", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "isGachaAvailable",
		outputs: [{ name: "available", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "isNFTDeposited",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "maxDepositsPerCard",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "migrateNFTRarity",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "", internalType: "address", type: "address" },
			{ name: "", internalType: "uint256", type: "uint256" },
		],
		name: "nftCurrentRarity",
		outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "", internalType: "address", type: "address" },
			{ name: "", internalType: "uint256", type: "uint256" },
		],
		name: "nftReceiveTimes",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "", internalType: "address", type: "address" },
			{ name: "", internalType: "uint256", type: "uint256" },
		],
		name: "nftRedemptionDeadlines",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "", internalType: "address", type: "address" },
			{ name: "", internalType: "uint256", type: "uint256" },
		],
		name: "nftToTreasuryIndex",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "numRarities",
		outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "cardId", internalType: "bytes32", type: "bytes32" },
			{ name: "newPriceUSD", internalType: "uint256", type: "uint256" },
		],
		name: "onCardPriceUpdated",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "", internalType: "address", type: "address" },
			{ name: "", internalType: "address", type: "address" },
			{ name: "", internalType: "uint256", type: "uint256" },
			{ name: "", internalType: "bytes", type: "bytes" },
		],
		name: "onERC721Received",
		outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
		stateMutability: "pure",
	},
	{
		type: "function",
		inputs: [],
		name: "owner",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "paused",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		name: "priceRanges",
		outputs: [
			{ name: "minPriceUSD", internalType: "uint256", type: "uint256" },
			{ name: "maxPriceUSD", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "priceRangesSet",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "protocolTreasury",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "proxiableUUID",
		outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		name: "rarityCount",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		name: "rarityNames",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "user", internalType: "address", type: "address" },
			{ name: "amount", internalType: "uint256", type: "uint256" },
		],
		name: "recordYieldClaim",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "collection", internalType: "address", type: "address" }],
		name: "removeFromWhitelist",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "rarity", internalType: "uint8", type: "uint8" },
			{ name: "randomSeed", internalType: "uint256", type: "uint256" },
			{ name: "winner", internalType: "address", type: "address" },
		],
		name: "sendRandomNFTToWinner",
		outputs: [
			{
				name: "item",
				internalType: "struct GachaTreasury.NFTItem",
				type: "tuple",
				components: [
					{ name: "collection", internalType: "address", type: "address" },
					{ name: "depositor", internalType: "address", type: "address" },
					{ name: "tokenId", internalType: "uint256", type: "uint256" },
					{ name: "appraisedPrice", internalType: "uint256", type: "uint256" },
					{ name: "rarity", internalType: "uint8", type: "uint8" },
					{ name: "depositTime", internalType: "uint256", type: "uint256" },
					{ name: "receiveTime", internalType: "uint256", type: "uint256" },
				],
			},
		],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "_appraisalContract", internalType: "address", type: "address" },
		],
		name: "setAppraisalContract",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "_cardGroupedVault", internalType: "address", type: "address" },
		],
		name: "setCardGroupedVault",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "_gachaContract", internalType: "address", type: "address" },
		],
		name: "setGachaContract",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "_maxDepositsPerCard", internalType: "uint256", type: "uint256" },
		],
		name: "setMaxDepositsPerCard",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "_protocolTreasury", internalType: "address", type: "address" },
		],
		name: "setProtocolTreasury",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		name: "totalRarityValue",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "", internalType: "uint8", type: "uint8" },
			{ name: "", internalType: "uint256", type: "uint256" },
		],
		name: "treasury",
		outputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "depositor", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "appraisedPrice", internalType: "uint256", type: "uint256" },
			{ name: "rarity", internalType: "uint8", type: "uint8" },
			{ name: "depositTime", internalType: "uint256", type: "uint256" },
			{ name: "receiveTime", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "newImplementation", internalType: "address", type: "address" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "upgradeToAndCall",
		outputs: [],
		stateMutability: "payable",
	},
	{
		type: "function",
		inputs: [
			{ name: "", internalType: "address", type: "address" },
			{ name: "", internalType: "bytes32", type: "bytes32" },
		],
		name: "userCardDeposits",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "", internalType: "address", type: "address" },
			{ name: "", internalType: "uint8", type: "uint8" },
		],
		name: "userDepositCounts",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "", internalType: "address", type: "address" },
			{ name: "", internalType: "uint8", type: "uint8" },
		],
		name: "userDepositValues",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "address", type: "address" }],
		name: "userLifetimeClaimed",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "address", type: "address" }],
		name: "userLifetimeDeposited",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "address", type: "address" }],
		name: "userLifetimeWithdrawn",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "address", type: "address" }],
		name: "userTotalDeposits",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "address", type: "address" }],
		name: "whitelistedCollections",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		name: "whitelistedCollectionsList",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "withdrawMyNFT",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "oldAppraisal",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newAppraisal",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "AppraisalContractUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "count",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "BatchDeposited",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "count",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{ name: "rarity", internalType: "uint8", type: "uint8", indexed: false },
			{ name: "to", internalType: "address", type: "address", indexed: false },
		],
		name: "BatchWithdrawn",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "oldVault",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newVault",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "CardGroupedVaultUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "CollectionRemovedFromWhitelist",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "CollectionWhitelisted",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "oldGacha",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newGacha",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "GachaContractUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "version",
				internalType: "uint64",
				type: "uint64",
				indexed: false,
			},
		],
		name: "Initialized",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "depositor",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{ name: "rarity", internalType: "uint8", type: "uint8", indexed: false },
			{
				name: "appraisedPrice",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "NFTDeposited",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{ name: "rarity", internalType: "uint8", type: "uint8", indexed: false },
			{ name: "to", internalType: "address", type: "address", indexed: true },
		],
		name: "NFTWithdrawn",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "OwnershipTransferred",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "Paused",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "oldTreasury",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newTreasury",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "ProtocolTreasuryUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "oldRarity",
				internalType: "uint8",
				type: "uint8",
				indexed: false,
			},
			{
				name: "newRarity",
				internalType: "uint8",
				type: "uint8",
				indexed: false,
			},
			{
				name: "newPrice",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "RarityMigrated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "seller",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{ name: "rarity", internalType: "uint8", type: "uint8", indexed: false },
			{
				name: "appraisedPrice",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "RedemptionRestocked",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "Unpaused",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "implementation",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "Upgraded",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "user", internalType: "address", type: "address", indexed: true },
			{
				name: "amount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "YieldClaimRecorded",
	},
	{
		type: "error",
		inputs: [{ name: "target", internalType: "address", type: "address" }],
		name: "AddressEmptyCode",
	},
	{ type: "error", inputs: [], name: "AppraisalRequired" },
	{ type: "error", inputs: [], name: "ArrayLengthMismatch" },
	{ type: "error", inputs: [], name: "CollectionAlreadyWhitelisted" },
	{ type: "error", inputs: [], name: "CollectionNotInWhitelist" },
	{ type: "error", inputs: [], name: "CollectionNotWhitelisted" },
	{
		type: "error",
		inputs: [
			{ name: "implementation", internalType: "address", type: "address" },
		],
		name: "ERC1967InvalidImplementation",
	},
	{ type: "error", inputs: [], name: "ERC1967NonPayable" },
	{ type: "error", inputs: [], name: "EmptyArrays" },
	{ type: "error", inputs: [], name: "EnforcedPause" },
	{ type: "error", inputs: [], name: "ExpectedPause" },
	{ type: "error", inputs: [], name: "FailedCall" },
	{ type: "error", inputs: [], name: "InsufficientDepositorValue" },
	{ type: "error", inputs: [], name: "InvalidAppraisalContract" },
	{ type: "error", inputs: [], name: "InvalidCardGroupedVault" },
	{ type: "error", inputs: [], name: "InvalidCollectionAddress" },
	{ type: "error", inputs: [], name: "InvalidGachaContract" },
	{ type: "error", inputs: [], name: "InvalidIndex" },
	{ type: "error", inputs: [], name: "InvalidInitialization" },
	{ type: "error", inputs: [], name: "InvalidLimit" },
	{ type: "error", inputs: [], name: "InvalidNFTContract" },
	{ type: "error", inputs: [], name: "InvalidNumRarities" },
	{ type: "error", inputs: [], name: "InvalidPriceRange" },
	{ type: "error", inputs: [], name: "InvalidProtocolTreasury" },
	{ type: "error", inputs: [], name: "InvalidRecipient" },
	{ type: "error", inputs: [], name: "MaxCardDepositsReached" },
	{ type: "error", inputs: [], name: "NFTAlreadyDeposited" },
	{ type: "error", inputs: [], name: "NFTNotAppraised" },
	{ type: "error", inputs: [], name: "NFTNotDeposited" },
	{
		type: "error",
		inputs: [{ name: "rarity", internalType: "uint8", type: "uint8" }],
		name: "NoNFTsAvailable",
	},
	{ type: "error", inputs: [], name: "NotInitializing" },
	{ type: "error", inputs: [], name: "NotNFTDepositor" },
	{ type: "error", inputs: [], name: "NotNFTOwner" },
	{
		type: "error",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "OwnableInvalidOwner",
	},
	{
		type: "error",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "OwnableUnauthorizedAccount",
	},
	{
		type: "error",
		inputs: [{ name: "priceUSD", internalType: "uint256", type: "uint256" }],
		name: "PriceOutOfBounds",
	},
	{ type: "error", inputs: [], name: "PriceRangesAlreadySet" },
	{ type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
	{ type: "error", inputs: [], name: "TooManyItems" },
	{ type: "error", inputs: [], name: "TreasuryRotationBlocked" },
	{ type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
	{
		type: "error",
		inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
		name: "UUPSUnsupportedProxiableUUID",
	},
	{ type: "error", inputs: [], name: "UnauthorizedGachaContract" },
	{ type: "error", inputs: [], name: "UnauthorizedProtocolTreasury" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GachaTreasuryFuzz
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaTreasuryFuzzAbi = [
	{
		type: "function",
		inputs: [],
		name: "IS_TEST",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "appraisal",
		outputs: [
			{ name: "", internalType: "contract MockNFTAppraisal", type: "address" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		name: "depositors",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeArtifacts",
		outputs: [
			{
				name: "excludedArtifacts_",
				internalType: "string[]",
				type: "string[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeContracts",
		outputs: [
			{
				name: "excludedContracts_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeSelectors",
		outputs: [
			{
				name: "excludedSelectors_",
				internalType: "struct StdInvariant.FuzzSelector[]",
				type: "tuple[]",
				components: [
					{ name: "addr", internalType: "address", type: "address" },
					{ name: "selectors", internalType: "bytes4[]", type: "bytes4[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeSenders",
		outputs: [
			{
				name: "excludedSenders_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "failed",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "mockTreasury",
		outputs: [
			{
				name: "",
				internalType: "contract MockProtocolTreasury",
				type: "address",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "nftCollection",
		outputs: [
			{ name: "", internalType: "contract MockERC721", type: "address" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "owner",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "setUp",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "targetArtifactSelectors",
		outputs: [
			{
				name: "targetedArtifactSelectors_",
				internalType: "struct StdInvariant.FuzzArtifactSelector[]",
				type: "tuple[]",
				components: [
					{ name: "artifact", internalType: "string", type: "string" },
					{ name: "selectors", internalType: "bytes4[]", type: "bytes4[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetArtifacts",
		outputs: [
			{
				name: "targetedArtifacts_",
				internalType: "string[]",
				type: "string[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetContracts",
		outputs: [
			{
				name: "targetedContracts_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetInterfaces",
		outputs: [
			{
				name: "targetedInterfaces_",
				internalType: "struct StdInvariant.FuzzInterface[]",
				type: "tuple[]",
				components: [
					{ name: "addr", internalType: "address", type: "address" },
					{ name: "artifacts", internalType: "string[]", type: "string[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetSelectors",
		outputs: [
			{
				name: "targetedSelectors_",
				internalType: "struct StdInvariant.FuzzSelector[]",
				type: "tuple[]",
				components: [
					{ name: "addr", internalType: "address", type: "address" },
					{ name: "selectors", internalType: "bytes4[]", type: "bytes4[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetSenders",
		outputs: [
			{
				name: "targetedSenders_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "priceUSD", internalType: "uint256", type: "uint256" }],
		name: "testFuzz_RarityAssignment",
		outputs: [],
		stateMutability: "pure",
	},
	{
		type: "function",
		inputs: [],
		name: "treasury",
		outputs: [
			{ name: "", internalType: "contract GachaTreasury", type: "address" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "usdc",
		outputs: [
			{ name: "", internalType: "contract MockERC20", type: "address" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "vault",
		outputs: [
			{
				name: "",
				internalType: "contract MockCardGroupedVault",
				type: "address",
			},
		],
		stateMutability: "view",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "string", type: "string", indexed: false },
		],
		name: "log",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "address", type: "address", indexed: false },
		],
		name: "log_address",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "val",
				internalType: "uint256[]",
				type: "uint256[]",
				indexed: false,
			},
		],
		name: "log_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "val",
				internalType: "int256[]",
				type: "int256[]",
				indexed: false,
			},
		],
		name: "log_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "val",
				internalType: "address[]",
				type: "address[]",
				indexed: false,
			},
		],
		name: "log_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "bytes", type: "bytes", indexed: false },
		],
		name: "log_bytes",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "bytes32", type: "bytes32", indexed: false },
		],
		name: "log_bytes32",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "int256", type: "int256", indexed: false },
		],
		name: "log_int",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "address", type: "address", indexed: false },
		],
		name: "log_named_address",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{
				name: "val",
				internalType: "uint256[]",
				type: "uint256[]",
				indexed: false,
			},
		],
		name: "log_named_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{
				name: "val",
				internalType: "int256[]",
				type: "int256[]",
				indexed: false,
			},
		],
		name: "log_named_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{
				name: "val",
				internalType: "address[]",
				type: "address[]",
				indexed: false,
			},
		],
		name: "log_named_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "bytes", type: "bytes", indexed: false },
		],
		name: "log_named_bytes",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "bytes32", type: "bytes32", indexed: false },
		],
		name: "log_named_bytes32",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "int256", type: "int256", indexed: false },
			{
				name: "decimals",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "log_named_decimal_int",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "uint256", type: "uint256", indexed: false },
			{
				name: "decimals",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "log_named_decimal_uint",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "int256", type: "int256", indexed: false },
		],
		name: "log_named_int",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "string", type: "string", indexed: false },
		],
		name: "log_named_string",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "uint256", type: "uint256", indexed: false },
		],
		name: "log_named_uint",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "string", type: "string", indexed: false },
		],
		name: "log_string",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "uint256", type: "uint256", indexed: false },
		],
		name: "log_uint",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "bytes", type: "bytes", indexed: false },
		],
		name: "logs",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBeacon
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBeaconAbi = [
	{
		type: "function",
		inputs: [],
		name: "implementation",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICardGroupedVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCardGroupedVaultAbi = [
	{
		type: "function",
		inputs: [],
		name: "asset",
		outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "claimYield",
		outputs: [{ name: "withdrawn", internalType: "uint256", type: "uint256" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "amount", internalType: "uint256", type: "uint256" },
			{ name: "rarity", internalType: "uint8", type: "uint8" },
		],
		name: "distributeYield",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "cardId", internalType: "bytes32", type: "bytes32" },
			{ name: "newRarity", internalType: "uint8", type: "uint8" },
			{ name: "newPriceUSD", internalType: "uint256", type: "uint256" },
		],
		name: "migrateCardRarity",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "pendingYield",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "cardId", internalType: "bytes32", type: "bytes32" },
			{ name: "depositor", internalType: "address", type: "address" },
			{ name: "priceUSD", internalType: "uint256", type: "uint256" },
			{ name: "rarity", internalType: "uint8", type: "uint8" },
			{ name: "count", internalType: "uint256", type: "uint256" },
		],
		name: "registerCardDeposit",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "cardId", internalType: "bytes32", type: "bytes32" },
			{ name: "depositor", internalType: "address", type: "address" },
			{ name: "count", internalType: "uint256", type: "uint256" },
		],
		name: "removeCardDeposit",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "sharesOf",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalShares",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "cardId", internalType: "bytes32", type: "bytes32" },
			{ name: "newPriceUSD", internalType: "uint256", type: "uint256" },
		],
		name: "updateCardPrice",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "cardId",
				internalType: "bytes32",
				type: "bytes32",
				indexed: true,
			},
			{
				name: "depositor",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "priceUSD",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{ name: "rarity", internalType: "uint8", type: "uint8", indexed: false },
			{
				name: "count",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "CardDepositRegistered",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "cardId",
				internalType: "bytes32",
				type: "bytes32",
				indexed: true,
			},
			{
				name: "depositor",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "count",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "CardDepositRemoved",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "cardId",
				internalType: "bytes32",
				type: "bytes32",
				indexed: true,
			},
			{
				name: "oldPriceUSD",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "newPriceUSD",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "CardPriceUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "cardId",
				internalType: "bytes32",
				type: "bytes32",
				indexed: true,
			},
			{
				name: "oldRarity",
				internalType: "uint8",
				type: "uint8",
				indexed: false,
			},
			{
				name: "newRarity",
				internalType: "uint8",
				type: "uint8",
				indexed: false,
			},
			{
				name: "newPriceUSD",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "CardRarityMigrated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "amount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "YieldClaimed",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "caller",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "amount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{ name: "rarity", internalType: "uint8", type: "uint8", indexed: false },
		],
		name: "YieldDistributed",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC1155Errors
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc1155ErrorsAbi = [
	{
		type: "error",
		inputs: [
			{ name: "sender", internalType: "address", type: "address" },
			{ name: "balance", internalType: "uint256", type: "uint256" },
			{ name: "needed", internalType: "uint256", type: "uint256" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "ERC1155InsufficientBalance",
	},
	{
		type: "error",
		inputs: [{ name: "approver", internalType: "address", type: "address" }],
		name: "ERC1155InvalidApprover",
	},
	{
		type: "error",
		inputs: [
			{ name: "idsLength", internalType: "uint256", type: "uint256" },
			{ name: "valuesLength", internalType: "uint256", type: "uint256" },
		],
		name: "ERC1155InvalidArrayLength",
	},
	{
		type: "error",
		inputs: [{ name: "operator", internalType: "address", type: "address" }],
		name: "ERC1155InvalidOperator",
	},
	{
		type: "error",
		inputs: [{ name: "receiver", internalType: "address", type: "address" }],
		name: "ERC1155InvalidReceiver",
	},
	{
		type: "error",
		inputs: [{ name: "sender", internalType: "address", type: "address" }],
		name: "ERC1155InvalidSender",
	},
	{
		type: "error",
		inputs: [
			{ name: "operator", internalType: "address", type: "address" },
			{ name: "owner", internalType: "address", type: "address" },
		],
		name: "ERC1155MissingApprovalForAll",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC1363
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc1363Abi = [
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "spender", internalType: "address", type: "address" },
		],
		name: "allowance",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "approve",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "approveAndCall",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "approveAndCall",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
		name: "supportsInterface",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalSupply",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "transfer",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "transferAndCall",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "transferAndCall",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "transferFrom",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "transferFromAndCall",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "transferFromAndCall",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "spender",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "value",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "Approval",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "from", internalType: "address", type: "address", indexed: true },
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "value",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "Transfer",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC165
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc165Abi = [
	{
		type: "function",
		inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
		name: "supportsInterface",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC1822Proxiable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc1822ProxiableAbi = [
	{
		type: "function",
		inputs: [],
		name: "proxiableUUID",
		outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		stateMutability: "view",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC1967
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc1967Abi = [
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousAdmin",
				internalType: "address",
				type: "address",
				indexed: false,
			},
			{
				name: "newAdmin",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "AdminChanged",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "beacon",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "BeaconUpgraded",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "implementation",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "Upgraded",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20Abi = [
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "spender", internalType: "address", type: "address" },
		],
		name: "allowance",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "approve",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalSupply",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "transfer",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "transferFrom",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "spender",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "value",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "Approval",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "from", internalType: "address", type: "address", indexed: true },
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "value",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "Transfer",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC20Errors
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20ErrorsAbi = [
	{
		type: "error",
		inputs: [
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "allowance", internalType: "uint256", type: "uint256" },
			{ name: "needed", internalType: "uint256", type: "uint256" },
		],
		name: "ERC20InsufficientAllowance",
	},
	{
		type: "error",
		inputs: [
			{ name: "sender", internalType: "address", type: "address" },
			{ name: "balance", internalType: "uint256", type: "uint256" },
			{ name: "needed", internalType: "uint256", type: "uint256" },
		],
		name: "ERC20InsufficientBalance",
	},
	{
		type: "error",
		inputs: [{ name: "approver", internalType: "address", type: "address" }],
		name: "ERC20InvalidApprover",
	},
	{
		type: "error",
		inputs: [{ name: "receiver", internalType: "address", type: "address" }],
		name: "ERC20InvalidReceiver",
	},
	{
		type: "error",
		inputs: [{ name: "sender", internalType: "address", type: "address" }],
		name: "ERC20InvalidSender",
	},
	{
		type: "error",
		inputs: [{ name: "spender", internalType: "address", type: "address" }],
		name: "ERC20InvalidSpender",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC20Metadata
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20MetadataAbi = [
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "spender", internalType: "address", type: "address" },
		],
		name: "allowance",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "approve",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "decimals",
		outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "name",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "symbol",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalSupply",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "transfer",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "transferFrom",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "spender",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "value",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "Approval",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "from", internalType: "address", type: "address", indexed: true },
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "value",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "Transfer",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC20Permit
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20PermitAbi = [
	{
		type: "function",
		inputs: [],
		name: "DOMAIN_SEPARATOR",
		outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "nonces",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "value", internalType: "uint256", type: "uint256" },
			{ name: "deadline", internalType: "uint256", type: "uint256" },
			{ name: "v", internalType: "uint8", type: "uint8" },
			{ name: "r", internalType: "bytes32", type: "bytes32" },
			{ name: "s", internalType: "bytes32", type: "bytes32" },
		],
		name: "permit",
		outputs: [],
		stateMutability: "nonpayable",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC5267
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc5267Abi = [
	{
		type: "function",
		inputs: [],
		name: "eip712Domain",
		outputs: [
			{ name: "fields", internalType: "bytes1", type: "bytes1" },
			{ name: "name", internalType: "string", type: "string" },
			{ name: "version", internalType: "string", type: "string" },
			{ name: "chainId", internalType: "uint256", type: "uint256" },
			{ name: "verifyingContract", internalType: "address", type: "address" },
			{ name: "salt", internalType: "bytes32", type: "bytes32" },
			{ name: "extensions", internalType: "uint256[]", type: "uint256[]" },
		],
		stateMutability: "view",
	},
	{ type: "event", anonymous: false, inputs: [], name: "EIP712DomainChanged" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721Abi = [
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "approve",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "balance", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "getApproved",
		outputs: [{ name: "operator", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "operator", internalType: "address", type: "address" },
		],
		name: "isApprovedForAll",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "ownerOf",
		outputs: [{ name: "owner", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "safeTransferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "safeTransferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "operator", internalType: "address", type: "address" },
			{ name: "approved", internalType: "bool", type: "bool" },
		],
		name: "setApprovalForAll",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
		name: "supportsInterface",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "transferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "approved",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "Approval",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "operator",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{ name: "approved", internalType: "bool", type: "bool", indexed: false },
		],
		name: "ApprovalForAll",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "from", internalType: "address", type: "address", indexed: true },
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "Transfer",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721Enumerable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721EnumerableAbi = [
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "approve",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "balance", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "getApproved",
		outputs: [{ name: "operator", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "operator", internalType: "address", type: "address" },
		],
		name: "isApprovedForAll",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "ownerOf",
		outputs: [{ name: "owner", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "safeTransferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "safeTransferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "operator", internalType: "address", type: "address" },
			{ name: "approved", internalType: "bool", type: "bool" },
		],
		name: "setApprovalForAll",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
		name: "supportsInterface",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "index", internalType: "uint256", type: "uint256" }],
		name: "tokenByIndex",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "index", internalType: "uint256", type: "uint256" },
		],
		name: "tokenOfOwnerByIndex",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "totalSupply",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "transferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "approved",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "Approval",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "operator",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{ name: "approved", internalType: "bool", type: "bool", indexed: false },
		],
		name: "ApprovalForAll",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "from", internalType: "address", type: "address", indexed: true },
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "Transfer",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721Errors
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721ErrorsAbi = [
	{
		type: "error",
		inputs: [
			{ name: "sender", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "owner", internalType: "address", type: "address" },
		],
		name: "ERC721IncorrectOwner",
	},
	{
		type: "error",
		inputs: [
			{ name: "operator", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "ERC721InsufficientApproval",
	},
	{
		type: "error",
		inputs: [{ name: "approver", internalType: "address", type: "address" }],
		name: "ERC721InvalidApprover",
	},
	{
		type: "error",
		inputs: [{ name: "operator", internalType: "address", type: "address" }],
		name: "ERC721InvalidOperator",
	},
	{
		type: "error",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "ERC721InvalidOwner",
	},
	{
		type: "error",
		inputs: [{ name: "receiver", internalType: "address", type: "address" }],
		name: "ERC721InvalidReceiver",
	},
	{
		type: "error",
		inputs: [{ name: "sender", internalType: "address", type: "address" }],
		name: "ERC721InvalidSender",
	},
	{
		type: "error",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "ERC721NonexistentToken",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721Metadata
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721MetadataAbi = [
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "approve",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "balance", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "getApproved",
		outputs: [{ name: "operator", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "operator", internalType: "address", type: "address" },
		],
		name: "isApprovedForAll",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "name",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "ownerOf",
		outputs: [{ name: "owner", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "safeTransferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "safeTransferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "operator", internalType: "address", type: "address" },
			{ name: "approved", internalType: "bool", type: "bool" },
		],
		name: "setApprovalForAll",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
		name: "supportsInterface",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "symbol",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "tokenURI",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "transferFrom",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "approved",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "Approval",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "operator",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{ name: "approved", internalType: "bool", type: "bool", indexed: false },
		],
		name: "ApprovalForAll",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "from", internalType: "address", type: "address", indexed: true },
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "Transfer",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721Receiver
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721ReceiverAbi = [
	{
		type: "function",
		inputs: [
			{ name: "operator", internalType: "address", type: "address" },
			{ name: "from", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "onERC721Received",
		outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
		stateMutability: "nonpayable",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IFundsDistributionToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iFundsDistributionTokenAbi = [
	{
		type: "function",
		inputs: [],
		name: "withdrawFunds",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "withdrawableFundsOf",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "by", internalType: "address", type: "address", indexed: true },
			{
				name: "fundsDistributed",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "FundsDistributed",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "by", internalType: "address", type: "address", indexed: true },
			{
				name: "fundsWithdrawn",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "FundsWithdrawn",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGacha
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGachaAbi = [
	{
		type: "function",
		inputs: [],
		name: "feeToken",
		outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "triggerId", internalType: "uint256", type: "uint256" },
			{ name: "randomness", internalType: "bytes32", type: "bytes32" },
		],
		name: "fulfillRandomness",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "getCurrentRarityWeights",
		outputs: [{ name: "", internalType: "uint256[]", type: "uint256[]" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getCurrentSpinFee",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getExpectedValueUSD",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getTargetRarityBps",
		outputs: [{ name: "", internalType: "uint256[]", type: "uint256[]" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "targetBps", internalType: "uint256[]", type: "uint256[]" },
		],
		name: "setDynamicWeightsConfig",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "decimals", internalType: "uint8", type: "uint8" }],
		name: "setFeeTokenDecimals",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "_serviceHandler", internalType: "address", type: "address" },
		],
		name: "setGachaServiceHandler",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "premiumBps", internalType: "uint256", type: "uint256" },
			{ name: "minFee", internalType: "uint256", type: "uint256" },
			{ name: "maxFee", internalType: "uint256", type: "uint256" },
		],
		name: "setPricingConfig",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "maxFee", internalType: "uint256", type: "uint256" }],
		name: "spin",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "deadline", internalType: "uint256", type: "uint256" },
			{ name: "v", internalType: "uint8", type: "uint8" },
			{ name: "r", internalType: "bytes32", type: "bytes32" },
			{ name: "s", internalType: "bytes32", type: "bytes32" },
			{ name: "maxFee", internalType: "uint256", type: "uint256" },
		],
		name: "spinWithPermit",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "nonpayable",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGachaEconomyManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGachaEconomyManagerAbi = [
	{
		type: "function",
		inputs: [],
		name: "depositorShareBps",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "usdcAmount", internalType: "uint256", type: "uint256" },
			{ name: "hitRarity", internalType: "uint8", type: "uint8" },
		],
		name: "onSpinRevenue",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "protocolShareBps",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "depositorShareBps",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "protocolShareBps",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "RevenueSplitUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "amount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "depositorShare",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "protocolShare",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "SpinRevenueReceived",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGachaTreasuryYieldTracker
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGachaTreasuryYieldTrackerAbi = [
	{
		type: "function",
		inputs: [
			{ name: "user", internalType: "address", type: "address" },
			{ name: "amount", internalType: "uint256", type: "uint256" },
		],
		name: "recordYieldClaim",
		outputs: [],
		stateMutability: "nonpayable",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMulticall3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iMulticall3Abi = [
	{
		type: "function",
		inputs: [
			{
				name: "calls",
				internalType: "struct IMulticall3.Call[]",
				type: "tuple[]",
				components: [
					{ name: "target", internalType: "address", type: "address" },
					{ name: "callData", internalType: "bytes", type: "bytes" },
				],
			},
		],
		name: "aggregate",
		outputs: [
			{ name: "blockNumber", internalType: "uint256", type: "uint256" },
			{ name: "returnData", internalType: "bytes[]", type: "bytes[]" },
		],
		stateMutability: "payable",
	},
	{
		type: "function",
		inputs: [
			{
				name: "calls",
				internalType: "struct IMulticall3.Call3[]",
				type: "tuple[]",
				components: [
					{ name: "target", internalType: "address", type: "address" },
					{ name: "allowFailure", internalType: "bool", type: "bool" },
					{ name: "callData", internalType: "bytes", type: "bytes" },
				],
			},
		],
		name: "aggregate3",
		outputs: [
			{
				name: "returnData",
				internalType: "struct IMulticall3.Result[]",
				type: "tuple[]",
				components: [
					{ name: "success", internalType: "bool", type: "bool" },
					{ name: "returnData", internalType: "bytes", type: "bytes" },
				],
			},
		],
		stateMutability: "payable",
	},
	{
		type: "function",
		inputs: [
			{
				name: "calls",
				internalType: "struct IMulticall3.Call3Value[]",
				type: "tuple[]",
				components: [
					{ name: "target", internalType: "address", type: "address" },
					{ name: "allowFailure", internalType: "bool", type: "bool" },
					{ name: "value", internalType: "uint256", type: "uint256" },
					{ name: "callData", internalType: "bytes", type: "bytes" },
				],
			},
		],
		name: "aggregate3Value",
		outputs: [
			{
				name: "returnData",
				internalType: "struct IMulticall3.Result[]",
				type: "tuple[]",
				components: [
					{ name: "success", internalType: "bool", type: "bool" },
					{ name: "returnData", internalType: "bytes", type: "bytes" },
				],
			},
		],
		stateMutability: "payable",
	},
	{
		type: "function",
		inputs: [
			{
				name: "calls",
				internalType: "struct IMulticall3.Call[]",
				type: "tuple[]",
				components: [
					{ name: "target", internalType: "address", type: "address" },
					{ name: "callData", internalType: "bytes", type: "bytes" },
				],
			},
		],
		name: "blockAndAggregate",
		outputs: [
			{ name: "blockNumber", internalType: "uint256", type: "uint256" },
			{ name: "blockHash", internalType: "bytes32", type: "bytes32" },
			{
				name: "returnData",
				internalType: "struct IMulticall3.Result[]",
				type: "tuple[]",
				components: [
					{ name: "success", internalType: "bool", type: "bool" },
					{ name: "returnData", internalType: "bytes", type: "bytes" },
				],
			},
		],
		stateMutability: "payable",
	},
	{
		type: "function",
		inputs: [],
		name: "getBasefee",
		outputs: [{ name: "basefee", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "blockNumber", internalType: "uint256", type: "uint256" }],
		name: "getBlockHash",
		outputs: [{ name: "blockHash", internalType: "bytes32", type: "bytes32" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getBlockNumber",
		outputs: [
			{ name: "blockNumber", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getChainId",
		outputs: [{ name: "chainid", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getCurrentBlockCoinbase",
		outputs: [{ name: "coinbase", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getCurrentBlockDifficulty",
		outputs: [{ name: "difficulty", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getCurrentBlockGasLimit",
		outputs: [{ name: "gaslimit", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getCurrentBlockTimestamp",
		outputs: [{ name: "timestamp", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "addr", internalType: "address", type: "address" }],
		name: "getEthBalance",
		outputs: [{ name: "balance", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getLastBlockHash",
		outputs: [{ name: "blockHash", internalType: "bytes32", type: "bytes32" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "requireSuccess", internalType: "bool", type: "bool" },
			{
				name: "calls",
				internalType: "struct IMulticall3.Call[]",
				type: "tuple[]",
				components: [
					{ name: "target", internalType: "address", type: "address" },
					{ name: "callData", internalType: "bytes", type: "bytes" },
				],
			},
		],
		name: "tryAggregate",
		outputs: [
			{
				name: "returnData",
				internalType: "struct IMulticall3.Result[]",
				type: "tuple[]",
				components: [
					{ name: "success", internalType: "bool", type: "bool" },
					{ name: "returnData", internalType: "bytes", type: "bytes" },
				],
			},
		],
		stateMutability: "payable",
	},
	{
		type: "function",
		inputs: [
			{ name: "requireSuccess", internalType: "bool", type: "bool" },
			{
				name: "calls",
				internalType: "struct IMulticall3.Call[]",
				type: "tuple[]",
				components: [
					{ name: "target", internalType: "address", type: "address" },
					{ name: "callData", internalType: "bytes", type: "bytes" },
				],
			},
		],
		name: "tryBlockAndAggregate",
		outputs: [
			{ name: "blockNumber", internalType: "uint256", type: "uint256" },
			{ name: "blockHash", internalType: "bytes32", type: "bytes32" },
			{
				name: "returnData",
				internalType: "struct IMulticall3.Result[]",
				type: "tuple[]",
				components: [
					{ name: "success", internalType: "bool", type: "bool" },
					{ name: "returnData", internalType: "bytes", type: "bytes" },
				],
			},
		],
		stateMutability: "payable",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IProtocolTreasury
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iProtocolTreasuryAbi = [
	{
		type: "function",
		inputs: [],
		name: "asset",
		outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "executeRedemption",
		outputs: [{ name: "payout", internalType: "uint256", type: "uint256" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
		name: "onRevenueReceived",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "amount", internalType: "uint256", type: "uint256" },
		],
		name: "transferOut",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "amount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "ProtocolRevenueReceived",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "amount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "ProtocolTransfer",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "seller",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "payout",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "RedemptionExecuted",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IRedemptionWindow
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iRedemptionWindowAbi = [
	{
		type: "function",
		inputs: [],
		name: "redemptionWindow",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IWavsServiceHandler
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iWavsServiceHandlerAbi = [
	{
		type: "function",
		inputs: [],
		name: "getServiceManager",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{
				name: "envelope",
				internalType: "struct IWavsServiceHandler.Envelope",
				type: "tuple",
				components: [
					{ name: "eventId", internalType: "bytes20", type: "bytes20" },
					{ name: "ordering", internalType: "bytes12", type: "bytes12" },
					{ name: "payload", internalType: "bytes", type: "bytes" },
				],
			},
			{
				name: "signatureData",
				internalType: "struct IWavsServiceHandler.SignatureData",
				type: "tuple",
				components: [
					{ name: "signers", internalType: "address[]", type: "address[]" },
					{ name: "signatures", internalType: "bytes[]", type: "bytes[]" },
					{ name: "referenceBlock", internalType: "uint32", type: "uint32" },
				],
			},
		],
		name: "handleSignedEnvelope",
		outputs: [],
		stateMutability: "nonpayable",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IWavsServiceManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iWavsServiceManagerAbi = [
	{
		type: "function",
		inputs: [],
		name: "getAllocationManager",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getDelegationManager",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "signingKeyAddress", internalType: "address", type: "address" },
		],
		name: "getLatestOperatorForSigningKey",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "operator", internalType: "address", type: "address" }],
		name: "getOperatorWeight",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getServiceURI",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getStakeRegistry",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "_serviceURI", internalType: "string", type: "string" }],
		name: "setServiceURI",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{
				name: "envelope",
				internalType: "struct IWavsServiceHandler.Envelope",
				type: "tuple",
				components: [
					{ name: "eventId", internalType: "bytes20", type: "bytes20" },
					{ name: "ordering", internalType: "bytes12", type: "bytes12" },
					{ name: "payload", internalType: "bytes", type: "bytes" },
				],
			},
			{
				name: "signatureData",
				internalType: "struct IWavsServiceHandler.SignatureData",
				type: "tuple",
				components: [
					{ name: "signers", internalType: "address[]", type: "address[]" },
					{ name: "signatures", internalType: "bytes[]", type: "bytes[]" },
					{ name: "referenceBlock", internalType: "uint32", type: "uint32" },
				],
			},
		],
		name: "validate",
		outputs: [],
		stateMutability: "view",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "numerator",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "denominator",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "QuorumThresholdUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "serviceURI",
				internalType: "string",
				type: "string",
				indexed: false,
			},
		],
		name: "ServiceURIUpdated",
	},
	{
		type: "error",
		inputs: [
			{ name: "signerWeight", internalType: "uint256", type: "uint256" },
			{ name: "thresholdWeight", internalType: "uint256", type: "uint256" },
			{ name: "totalWeight", internalType: "uint256", type: "uint256" },
		],
		name: "InsufficientQuorum",
	},
	{ type: "error", inputs: [], name: "InsufficientQuorumZero" },
	{ type: "error", inputs: [], name: "InvalidQuorumParameters" },
	{ type: "error", inputs: [], name: "InvalidSignature" },
	{ type: "error", inputs: [], name: "InvalidSignatureBlock" },
	{ type: "error", inputs: [], name: "InvalidSignatureLength" },
	{ type: "error", inputs: [], name: "InvalidSignatureOrder" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initializable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const initializableAbi = [
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "version",
				internalType: "uint64",
				type: "uint64",
				indexed: false,
			},
		],
		name: "Initialized",
	},
	{ type: "error", inputs: [], name: "InvalidInitialization" },
	{ type: "error", inputs: [], name: "NotInitializing" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MessageHashUtils
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const messageHashUtilsAbi = [
	{ type: "error", inputs: [], name: "ERC5267ExtensionsNotSupported" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NFTAppraisal
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const nftAppraisalAbi = [
	{
		type: "function",
		inputs: [],
		name: "UPGRADE_INTERFACE_VERSION",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "appraisalFee",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		name: "cardAppraisals",
		outputs: [
			{ name: "priceUSD", internalType: "uint256", type: "uint256" },
			{
				name: "status",
				internalType: "enum NFTAppraisal.AppraisalStatus",
				type: "uint8",
			},
			{ name: "firstTimestamp", internalType: "uint256", type: "uint256" },
			{ name: "lastUpdated", internalType: "uint256", type: "uint256" },
			{
				name: "canonicalContractAddress",
				internalType: "address",
				type: "address",
			},
			{ name: "canonicalTokenId", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "emergencyPause",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "emergencyUnpause",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "feeToken",
		outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "getAppraisal",
		outputs: [
			{
				name: "appraisal",
				internalType: "struct NFTAppraisal.Appraisal",
				type: "tuple",
				components: [
					{ name: "requester", internalType: "address", type: "address" },
					{ name: "priceUSD", internalType: "uint256", type: "uint256" },
					{
						name: "status",
						internalType: "enum NFTAppraisal.AppraisalStatus",
						type: "uint8",
					},
					{ name: "timestamp", internalType: "uint256", type: "uint256" },
					{ name: "lastUpdated", internalType: "uint256", type: "uint256" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "getAppraisedPrice",
		outputs: [
			{ name: "priceUSD", internalType: "uint256", type: "uint256" },
			{
				name: "status",
				internalType: "enum NFTAppraisal.AppraisalStatus",
				type: "uint8",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collections", internalType: "address[]", type: "address[]" },
			{ name: "tokenIds", internalType: "uint256[]", type: "uint256[]" },
		],
		name: "getBatchAppraisals",
		outputs: [
			{ name: "prices", internalType: "uint256[]", type: "uint256[]" },
			{
				name: "statuses",
				internalType: "enum NFTAppraisal.AppraisalStatus[]",
				type: "uint8[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "cardId", internalType: "bytes32", type: "bytes32" }],
		name: "getCardAppraisal",
		outputs: [
			{
				name: "",
				internalType: "struct NFTAppraisal.CardAppraisal",
				type: "tuple",
				components: [
					{ name: "priceUSD", internalType: "uint256", type: "uint256" },
					{
						name: "status",
						internalType: "enum NFTAppraisal.AppraisalStatus",
						type: "uint8",
					},
					{ name: "firstTimestamp", internalType: "uint256", type: "uint256" },
					{ name: "lastUpdated", internalType: "uint256", type: "uint256" },
					{
						name: "canonicalContractAddress",
						internalType: "address",
						type: "address",
					},
					{
						name: "canonicalTokenId",
						internalType: "uint256",
						type: "uint256",
					},
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "cardIds", internalType: "bytes32[]", type: "bytes32[]" }],
		name: "getCardAppraisals",
		outputs: [
			{
				name: "appraisals",
				internalType: "struct NFTAppraisal.CardAppraisal[]",
				type: "tuple[]",
				components: [
					{ name: "priceUSD", internalType: "uint256", type: "uint256" },
					{
						name: "status",
						internalType: "enum NFTAppraisal.AppraisalStatus",
						type: "uint8",
					},
					{ name: "firstTimestamp", internalType: "uint256", type: "uint256" },
					{ name: "lastUpdated", internalType: "uint256", type: "uint256" },
					{
						name: "canonicalContractAddress",
						internalType: "address",
						type: "address",
					},
					{
						name: "canonicalTokenId",
						internalType: "uint256",
						type: "uint256",
					},
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "cardId", internalType: "bytes32", type: "bytes32" }],
		name: "getCardInstance",
		outputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "cardIds", internalType: "bytes32[]", type: "bytes32[]" }],
		name: "getCardInstances",
		outputs: [
			{ name: "collections", internalType: "address[]", type: "address[]" },
			{ name: "tokenIds", internalType: "uint256[]", type: "uint256[]" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getServiceHandler",
		outputs: [{ name: "handler", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "getTokenCardId",
		outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getWhitelistedTreasuries",
		outputs: [
			{ name: "treasuries", internalType: "address[]", type: "address[]" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "hasAppraisal",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collections", internalType: "address[]", type: "address[]" },
			{ name: "tokenIds", internalType: "uint256[]", type: "uint256[]" },
		],
		name: "hasBatchAppraisals",
		outputs: [
			{ name: "hasAppraisals", internalType: "bool[]", type: "bool[]" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "_owner", internalType: "address", type: "address" },
			{ name: "_feeToken", internalType: "address", type: "address" },
			{ name: "_appraisalFee", internalType: "uint256", type: "uint256" },
			{ name: "_protocolAddress", internalType: "address", type: "address" },
		],
		name: "initialize",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "handler", internalType: "address", type: "address" }],
		name: "isServiceHandler",
		outputs: [{ name: "isAuthorized", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "treasury", internalType: "address", type: "address" }],
		name: "isTreasuryWhitelisted",
		outputs: [{ name: "isWhitelisted", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "owner",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collections", internalType: "address[]", type: "address[]" },
			{ name: "tokenIds", internalType: "uint256[]", type: "uint256[]" },
			{ name: "cardIds", internalType: "bytes32[]", type: "bytes32[]" },
			{ name: "pricesUSD", internalType: "uint256[]", type: "uint256[]" },
		],
		name: "ownerBatchSetAppraisalForTokensWithCards",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "cardId", internalType: "bytes32", type: "bytes32" },
			{ name: "priceUSD", internalType: "uint256", type: "uint256" },
		],
		name: "ownerSetAppraisalForTokenWithCard",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "paused",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "protocolAddress",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "proxiableUUID",
		outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "requestAppraisal",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "collections", internalType: "address[]", type: "address[]" },
			{ name: "tokenIds", internalType: "uint256[]", type: "uint256[]" },
		],
		name: "requestBatchAppraisal",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "serviceHandler",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "_newFee", internalType: "uint256", type: "uint256" }],
		name: "setAppraisalFee",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "cardId", internalType: "bytes32", type: "bytes32" },
			{ name: "priceUSD", internalType: "uint256", type: "uint256" },
		],
		name: "setAppraisalForTokenWithCard",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "_newFeeToken", internalType: "address", type: "address" },
		],
		name: "setFeeToken",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "_newProtocolAddress", internalType: "address", type: "address" },
		],
		name: "setProtocolAddress",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "_serviceHandler", internalType: "address", type: "address" },
		],
		name: "setServiceHandler",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "", internalType: "address", type: "address" },
			{ name: "", internalType: "uint256", type: "uint256" },
		],
		name: "tokenCardIds",
		outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "", internalType: "address", type: "address" },
			{ name: "", internalType: "uint256", type: "uint256" },
		],
		name: "tokenRequests",
		outputs: [
			{ name: "requester", internalType: "address", type: "address" },
			{
				name: "status",
				internalType: "enum NFTAppraisal.AppraisalStatus",
				type: "uint8",
			},
			{ name: "timestamp", internalType: "uint256", type: "uint256" },
			{ name: "lastUpdated", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		name: "treasuryList",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "treasury", internalType: "address", type: "address" }],
		name: "unwhitelistTreasury",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "newImplementation", internalType: "address", type: "address" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "upgradeToAndCall",
		outputs: [],
		stateMutability: "payable",
	},
	{
		type: "function",
		inputs: [{ name: "treasury", internalType: "address", type: "address" }],
		name: "whitelistTreasury",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "", internalType: "address", type: "address" }],
		name: "whitelistedTreasuries",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "priceUSD",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "oracle",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "timestamp",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "AppraisalCompleted",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "oldFee",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "newFee",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "AppraisalFeeUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "oldPriceUSD",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "newPriceUSD",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "AppraisalOverridden",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "nftContract",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "AppraisalRequested",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "oldStatus",
				internalType: "enum NFTAppraisal.AppraisalStatus",
				type: "uint8",
				indexed: false,
			},
			{
				name: "newStatus",
				internalType: "enum NFTAppraisal.AppraisalStatus",
				type: "uint8",
				indexed: false,
			},
			{
				name: "timestamp",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "AppraisalStatusChanged",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "treasury",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{ name: "reason", internalType: "bytes", type: "bytes", indexed: false },
		],
		name: "AutoMigrationFailed",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "treasury",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "AutoMigrationTriggered",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "cardId",
				internalType: "bytes32",
				type: "bytes32",
				indexed: true,
			},
			{
				name: "priceUSD",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "oracle",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "timestamp",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "CardAppraisalCompleted",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "cardId",
				internalType: "bytes32",
				type: "bytes32",
				indexed: true,
			},
			{
				name: "oldPriceUSD",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "newPriceUSD",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "CardPriceUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "oldToken",
				internalType: "address",
				type: "address",
				indexed: false,
			},
			{
				name: "newToken",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "FeeTokenUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "version",
				internalType: "uint64",
				type: "uint64",
				indexed: false,
			},
		],
		name: "Initialized",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "OwnershipTransferred",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "Paused",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "oldAddress",
				internalType: "address",
				type: "address",
				indexed: false,
			},
			{
				name: "newAddress",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "ProtocolAddressUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "oldHandler",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newHandler",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "ServiceHandlerUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "cardId",
				internalType: "bytes32",
				type: "bytes32",
				indexed: true,
			},
		],
		name: "TokenLinkedToCard",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "treasury",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "TreasuryUnwhitelisted",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "treasury",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "TreasuryWhitelisted",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "Unpaused",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "implementation",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "Upgraded",
	},
	{
		type: "error",
		inputs: [{ name: "target", internalType: "address", type: "address" }],
		name: "AddressEmptyCode",
	},
	{ type: "error", inputs: [], name: "AppraisalNotFound" },
	{ type: "error", inputs: [], name: "ArrayLengthMismatch" },
	{ type: "error", inputs: [], name: "CardIdMismatch" },
	{
		type: "error",
		inputs: [
			{ name: "implementation", internalType: "address", type: "address" },
		],
		name: "ERC1967InvalidImplementation",
	},
	{ type: "error", inputs: [], name: "ERC1967NonPayable" },
	{ type: "error", inputs: [], name: "EmptyArrays" },
	{ type: "error", inputs: [], name: "EnforcedPause" },
	{ type: "error", inputs: [], name: "ExpectedPause" },
	{ type: "error", inputs: [], name: "FailedCall" },
	{ type: "error", inputs: [], name: "InvalidCollection" },
	{ type: "error", inputs: [], name: "InvalidFeeToken" },
	{ type: "error", inputs: [], name: "InvalidInitialization" },
	{ type: "error", inputs: [], name: "InvalidPrice" },
	{ type: "error", inputs: [], name: "InvalidProtocolAddress" },
	{ type: "error", inputs: [], name: "InvalidTokenId" },
	{ type: "error", inputs: [], name: "InvalidTreasuryAddress" },
	{ type: "error", inputs: [], name: "NotInitializing" },
	{
		type: "error",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "OwnableInvalidOwner",
	},
	{
		type: "error",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "OwnableUnauthorizedAccount",
	},
	{ type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
	{
		type: "error",
		inputs: [{ name: "token", internalType: "address", type: "address" }],
		name: "SafeERC20FailedOperation",
	},
	{ type: "error", inputs: [], name: "TooManyItems" },
	{ type: "error", inputs: [], name: "TreasuryAlreadyWhitelisted" },
	{ type: "error", inputs: [], name: "TreasuryNotWhitelisted" },
	{ type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
	{
		type: "error",
		inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
		name: "UUPSUnsupportedProxiableUUID",
	},
	{ type: "error", inputs: [], name: "UnauthorizedServiceHandler" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NFTAppraisalServiceHandler
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const nftAppraisalServiceHandlerAbi = [
	{
		type: "constructor",
		inputs: [
			{
				name: "serviceManager",
				internalType: "contract IWavsServiceManager",
				type: "address",
			},
			{ name: "appraisalContract", internalType: "address", type: "address" },
		],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "checkAppraisal",
		outputs: [
			{ name: "exists", internalType: "bool", type: "bool" },
			{ name: "priceUSD", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "payload", internalType: "bytes", type: "bytes" }],
		name: "decodeError",
		outputs: [
			{
				name: "",
				internalType: "struct AppraisalError",
				type: "tuple",
				components: [
					{ name: "contractAddress", internalType: "address", type: "address" },
					{ name: "tokenId", internalType: "uint256", type: "uint256" },
					{ name: "groupId", internalType: "bytes32", type: "bytes32" },
					{ name: "error", internalType: "string", type: "string" },
					{ name: "txHash", internalType: "bytes32", type: "bytes32" },
				],
			},
		],
		stateMutability: "pure",
	},
	{
		type: "function",
		inputs: [{ name: "payload", internalType: "bytes", type: "bytes" }],
		name: "decodeSuccess",
		outputs: [
			{
				name: "",
				internalType: "struct AppraisalSuccess",
				type: "tuple",
				components: [
					{ name: "chain", internalType: "string", type: "string" },
					{ name: "contractAddress", internalType: "address", type: "address" },
					{ name: "tokenId", internalType: "uint256", type: "uint256" },
					{ name: "groupId", internalType: "bytes32", type: "bytes32" },
					{ name: "price", internalType: "uint256", type: "uint256" },
					{ name: "txHash", internalType: "bytes32", type: "bytes32" },
				],
			},
		],
		stateMutability: "pure",
	},
	{
		type: "function",
		inputs: [],
		name: "getAppraisalContract",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "getServiceManager",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{
				name: "envelope",
				internalType: "struct IWavsServiceHandler.Envelope",
				type: "tuple",
				components: [
					{ name: "eventId", internalType: "bytes20", type: "bytes20" },
					{ name: "ordering", internalType: "bytes12", type: "bytes12" },
					{ name: "payload", internalType: "bytes", type: "bytes" },
				],
			},
			{
				name: "signatureData",
				internalType: "struct IWavsServiceHandler.SignatureData",
				type: "tuple",
				components: [
					{ name: "signers", internalType: "address[]", type: "address[]" },
					{ name: "signatures", internalType: "bytes[]", type: "bytes[]" },
					{ name: "referenceBlock", internalType: "uint32", type: "uint32" },
				],
			},
		],
		name: "handleSignedEnvelope",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "contractAddress",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{ name: "error", internalType: "string", type: "string", indexed: false },
			{
				name: "txHash",
				internalType: "bytes32",
				type: "bytes32",
				indexed: false,
			},
		],
		name: "AppraisalErrorReceived",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "priceUSD",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{ name: "success", internalType: "bool", type: "bool", indexed: false },
			{
				name: "timestamp",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "AppraisalProcessed",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "contractAddress",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "price",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
			{
				name: "txHash",
				internalType: "bytes32",
				type: "bytes32",
				indexed: false,
			},
		],
		name: "AppraisalSuccessReceived",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "reason",
				internalType: "string",
				type: "string",
				indexed: false,
			},
			{
				name: "timestamp",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "PermanentAppraisalFailure",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "operation",
				internalType: "string",
				type: "string",
				indexed: true,
			},
			{ name: "success", internalType: "bool", type: "bool", indexed: false },
			{
				name: "reason",
				internalType: "string",
				type: "string",
				indexed: false,
			},
			{
				name: "timestamp",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "ServiceHandlerStatusUpdate",
	},
	{ type: "error", inputs: [], name: "AppraisalProcessingFailed" },
	{ type: "error", inputs: [], name: "InvalidAppraisalContract" },
	{ type: "error", inputs: [], name: "InvalidAppraisalData" },
	{ type: "error", inputs: [], name: "InvalidServiceManager" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NFTHelpers
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const nftHelpersAbi = [
	{
		type: "function",
		inputs: [],
		name: "IS_TEST",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeArtifacts",
		outputs: [
			{
				name: "excludedArtifacts_",
				internalType: "string[]",
				type: "string[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeContracts",
		outputs: [
			{
				name: "excludedContracts_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeSelectors",
		outputs: [
			{
				name: "excludedSelectors_",
				internalType: "struct StdInvariant.FuzzSelector[]",
				type: "tuple[]",
				components: [
					{ name: "addr", internalType: "address", type: "address" },
					{ name: "selectors", internalType: "bytes4[]", type: "bytes4[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "excludeSenders",
		outputs: [
			{
				name: "excludedSenders_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "failed",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetArtifactSelectors",
		outputs: [
			{
				name: "targetedArtifactSelectors_",
				internalType: "struct StdInvariant.FuzzArtifactSelector[]",
				type: "tuple[]",
				components: [
					{ name: "artifact", internalType: "string", type: "string" },
					{ name: "selectors", internalType: "bytes4[]", type: "bytes4[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetArtifacts",
		outputs: [
			{
				name: "targetedArtifacts_",
				internalType: "string[]",
				type: "string[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetContracts",
		outputs: [
			{
				name: "targetedContracts_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetInterfaces",
		outputs: [
			{
				name: "targetedInterfaces_",
				internalType: "struct StdInvariant.FuzzInterface[]",
				type: "tuple[]",
				components: [
					{ name: "addr", internalType: "address", type: "address" },
					{ name: "artifacts", internalType: "string[]", type: "string[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetSelectors",
		outputs: [
			{
				name: "targetedSelectors_",
				internalType: "struct StdInvariant.FuzzSelector[]",
				type: "tuple[]",
				components: [
					{ name: "addr", internalType: "address", type: "address" },
					{ name: "selectors", internalType: "bytes4[]", type: "bytes4[]" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "targetSenders",
		outputs: [
			{
				name: "targetedSenders_",
				internalType: "address[]",
				type: "address[]",
			},
		],
		stateMutability: "view",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "string", type: "string", indexed: false },
		],
		name: "log",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "address", type: "address", indexed: false },
		],
		name: "log_address",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "val",
				internalType: "uint256[]",
				type: "uint256[]",
				indexed: false,
			},
		],
		name: "log_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "val",
				internalType: "int256[]",
				type: "int256[]",
				indexed: false,
			},
		],
		name: "log_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "val",
				internalType: "address[]",
				type: "address[]",
				indexed: false,
			},
		],
		name: "log_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "bytes", type: "bytes", indexed: false },
		],
		name: "log_bytes",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "bytes32", type: "bytes32", indexed: false },
		],
		name: "log_bytes32",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "int256", type: "int256", indexed: false },
		],
		name: "log_int",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "address", type: "address", indexed: false },
		],
		name: "log_named_address",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{
				name: "val",
				internalType: "uint256[]",
				type: "uint256[]",
				indexed: false,
			},
		],
		name: "log_named_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{
				name: "val",
				internalType: "int256[]",
				type: "int256[]",
				indexed: false,
			},
		],
		name: "log_named_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{
				name: "val",
				internalType: "address[]",
				type: "address[]",
				indexed: false,
			},
		],
		name: "log_named_array",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "bytes", type: "bytes", indexed: false },
		],
		name: "log_named_bytes",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "bytes32", type: "bytes32", indexed: false },
		],
		name: "log_named_bytes32",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "int256", type: "int256", indexed: false },
			{
				name: "decimals",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "log_named_decimal_int",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "uint256", type: "uint256", indexed: false },
			{
				name: "decimals",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "log_named_decimal_uint",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "int256", type: "int256", indexed: false },
		],
		name: "log_named_int",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "string", type: "string", indexed: false },
		],
		name: "log_named_string",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "key", internalType: "string", type: "string", indexed: false },
			{ name: "val", internalType: "uint256", type: "uint256", indexed: false },
		],
		name: "log_named_uint",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "string", type: "string", indexed: false },
		],
		name: "log_string",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "uint256", type: "uint256", indexed: false },
		],
		name: "log_uint",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "", internalType: "bytes", type: "bytes", indexed: false },
		],
		name: "logs",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Nonces
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const noncesAbi = [
	{
		type: "function",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "nonces",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "error",
		inputs: [
			{ name: "account", internalType: "address", type: "address" },
			{ name: "currentNonce", internalType: "uint256", type: "uint256" },
		],
		name: "InvalidAccountNonce",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Ownable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ownableAbi = [
	{
		type: "function",
		inputs: [],
		name: "owner",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "OwnershipTransferred",
	},
	{
		type: "error",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "OwnableInvalidOwner",
	},
	{
		type: "error",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "OwnableUnauthorizedAccount",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OwnableUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ownableUpgradeableAbi = [
	{
		type: "function",
		inputs: [],
		name: "owner",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "version",
				internalType: "uint64",
				type: "uint64",
				indexed: false,
			},
		],
		name: "Initialized",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "OwnershipTransferred",
	},
	{ type: "error", inputs: [], name: "InvalidInitialization" },
	{ type: "error", inputs: [], name: "NotInitializing" },
	{
		type: "error",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "OwnableInvalidOwner",
	},
	{
		type: "error",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "OwnableUnauthorizedAccount",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PausableUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pausableUpgradeableAbi = [
	{
		type: "function",
		inputs: [],
		name: "paused",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "version",
				internalType: "uint64",
				type: "uint64",
				indexed: false,
			},
		],
		name: "Initialized",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "Paused",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "Unpaused",
	},
	{ type: "error", inputs: [], name: "EnforcedPause" },
	{ type: "error", inputs: [], name: "ExpectedPause" },
	{ type: "error", inputs: [], name: "InvalidInitialization" },
	{ type: "error", inputs: [], name: "NotInitializing" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ProtocolTreasury
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const protocolTreasuryAbi = [
	{
		type: "function",
		inputs: [],
		name: "REDEMPTION_PAYOUT_BPS",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "UPGRADE_INTERFACE_VERSION",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "appraisalOracle",
		outputs: [
			{ name: "", internalType: "contract NFTAppraisal", type: "address" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "asset",
		outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "economyManager",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "executeRedemption",
		outputs: [{ name: "payout", internalType: "uint256", type: "uint256" }],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "gachaTreasury",
		outputs: [
			{ name: "", internalType: "contract GachaTreasury", type: "address" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "getRemainingRedemptionWindow",
		outputs: [
			{ name: "remainingTime", internalType: "uint256", type: "uint256" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "asset_", internalType: "address", type: "address" },
			{ name: "economyManager_", internalType: "address", type: "address" },
			{ name: "treasury_", internalType: "address", type: "address" },
			{ name: "appraisalOracle_", internalType: "address", type: "address" },
		],
		name: "initialize",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "collection", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "isRedemptionEligible",
		outputs: [{ name: "isEligible", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
		name: "onRevenueReceived",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "owner",
		outputs: [{ name: "", internalType: "address", type: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "pause",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "paused",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "proxiableUUID",
		outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "redemptionWindow",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "newOracle", internalType: "address", type: "address" }],
		name: "setAppraisalOracle",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "newManager", internalType: "address", type: "address" }],
		name: "setEconomyManager",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "newTreasury", internalType: "address", type: "address" }],
		name: "setGachaTreasury",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "newWindow", internalType: "uint256", type: "uint256" }],
		name: "setRedemptionWindow",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "amount", internalType: "uint256", type: "uint256" },
		],
		name: "transferOut",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [],
		name: "unpause",
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		inputs: [
			{ name: "newImplementation", internalType: "address", type: "address" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "upgradeToAndCall",
		outputs: [],
		stateMutability: "payable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousOracle",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newOracle",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "AppraisalOracleUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousManager",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newManager",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "EconomyManagerUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousTreasury",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newTreasury",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "GachaTreasuryUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "version",
				internalType: "uint64",
				type: "uint64",
				indexed: false,
			},
		],
		name: "Initialized",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "previousOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "newOwner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "OwnershipTransferred",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "Paused",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "amount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "ProtocolRevenueReceived",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "amount",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "ProtocolTransfer",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "seller",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "payout",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "RedemptionExecuted",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "collection",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{ name: "user", internalType: "address", type: "address", indexed: true },
			{
				name: "timeSinceWin",
				internalType: "uint256",
				type: "uint256",
				indexed: false,
			},
		],
		name: "RedemptionWindowEnforced",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "oldWindow",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
			{
				name: "newWindow",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "RedemptionWindowUpdated",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "account",
				internalType: "address",
				type: "address",
				indexed: false,
			},
		],
		name: "Unpaused",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "implementation",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "Upgraded",
	},
	{
		type: "error",
		inputs: [{ name: "target", internalType: "address", type: "address" }],
		name: "AddressEmptyCode",
	},
	{ type: "error", inputs: [], name: "AppraisalMissing" },
	{
		type: "error",
		inputs: [
			{ name: "implementation", internalType: "address", type: "address" },
		],
		name: "ERC1967InvalidImplementation",
	},
	{ type: "error", inputs: [], name: "ERC1967NonPayable" },
	{ type: "error", inputs: [], name: "EnforcedPause" },
	{ type: "error", inputs: [], name: "ExpectedPause" },
	{ type: "error", inputs: [], name: "FailedCall" },
	{ type: "error", inputs: [], name: "InsufficientLiquidity" },
	{ type: "error", inputs: [], name: "InvalidAmount" },
	{ type: "error", inputs: [], name: "InvalidArrayLength" },
	{ type: "error", inputs: [], name: "InvalidInitialization" },
	{ type: "error", inputs: [], name: "NotInitializing" },
	{
		type: "error",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "OwnableInvalidOwner",
	},
	{
		type: "error",
		inputs: [{ name: "account", internalType: "address", type: "address" }],
		name: "OwnableUnauthorizedAccount",
	},
	{ type: "error", inputs: [], name: "RedemptionWindowExpired" },
	{ type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
	{
		type: "error",
		inputs: [{ name: "token", internalType: "address", type: "address" }],
		name: "SafeERC20FailedOperation",
	},
	{ type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
	{
		type: "error",
		inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
		name: "UUPSUnsupportedProxiableUUID",
	},
	{ type: "error", inputs: [], name: "UnauthorizedEconomyManager" },
	{
		type: "error",
		inputs: [{ name: "context", internalType: "string", type: "string" }],
		name: "ZeroAddress",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const proxyAbi = [
	{ type: "fallback", stateMutability: "payable" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ReentrancyGuardTransient
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const reentrancyGuardTransientAbi = [
	{ type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SafeCast
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const safeCastAbi = [
	{
		type: "error",
		inputs: [
			{ name: "bits", internalType: "uint8", type: "uint8" },
			{ name: "value", internalType: "int256", type: "int256" },
		],
		name: "SafeCastOverflowedIntDowncast",
	},
	{
		type: "error",
		inputs: [{ name: "value", internalType: "int256", type: "int256" }],
		name: "SafeCastOverflowedIntToUint",
	},
	{
		type: "error",
		inputs: [
			{ name: "bits", internalType: "uint8", type: "uint8" },
			{ name: "value", internalType: "uint256", type: "uint256" },
		],
		name: "SafeCastOverflowedUintDowncast",
	},
	{
		type: "error",
		inputs: [{ name: "value", internalType: "uint256", type: "uint256" }],
		name: "SafeCastOverflowedUintToInt",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SafeERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const safeErc20Abi = [
	{
		type: "error",
		inputs: [
			{ name: "spender", internalType: "address", type: "address" },
			{ name: "currentAllowance", internalType: "uint256", type: "uint256" },
			{ name: "requestedDecrease", internalType: "uint256", type: "uint256" },
		],
		name: "SafeERC20FailedDecreaseAllowance",
	},
	{
		type: "error",
		inputs: [{ name: "token", internalType: "address", type: "address" }],
		name: "SafeERC20FailedOperation",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ShortStrings
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const shortStringsAbi = [
	{ type: "error", inputs: [], name: "InvalidShortString" },
	{
		type: "error",
		inputs: [{ name: "str", internalType: "string", type: "string" }],
		name: "StringTooLong",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Strings
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const stringsAbi = [
	{
		type: "error",
		inputs: [
			{ name: "value", internalType: "uint256", type: "uint256" },
			{ name: "length", internalType: "uint256", type: "uint256" },
		],
		name: "StringsInsufficientHexLength",
	},
	{ type: "error", inputs: [], name: "StringsInvalidAddressFormat" },
	{ type: "error", inputs: [], name: "StringsInvalidChar" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UUPSUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const uupsUpgradeableAbi = [
	{
		type: "function",
		inputs: [],
		name: "UPGRADE_INTERFACE_VERSION",
		outputs: [{ name: "", internalType: "string", type: "string" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [],
		name: "proxiableUUID",
		outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
		stateMutability: "view",
	},
	{
		type: "function",
		inputs: [
			{ name: "newImplementation", internalType: "address", type: "address" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "upgradeToAndCall",
		outputs: [],
		stateMutability: "payable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "implementation",
				internalType: "address",
				type: "address",
				indexed: true,
			},
		],
		name: "Upgraded",
	},
	{
		type: "error",
		inputs: [{ name: "target", internalType: "address", type: "address" }],
		name: "AddressEmptyCode",
	},
	{
		type: "error",
		inputs: [
			{ name: "implementation", internalType: "address", type: "address" },
		],
		name: "ERC1967InvalidImplementation",
	},
	{ type: "error", inputs: [], name: "ERC1967NonPayable" },
	{ type: "error", inputs: [], name: "FailedCall" },
	{ type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
	{
		type: "error",
		inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
		name: "UUPSUnsupportedProxiableUUID",
	},
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__
 */
export const useReadBaseErc20Contract = /*#__PURE__*/ createUseReadContract({
	abi: baseErc20Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 */
export const useReadBaseErc20DomainSeparator =
	/*#__PURE__*/ createUseReadContract({
		abi: baseErc20Abi,
		functionName: "DOMAIN_SEPARATOR",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadBaseErc20Allowance = /*#__PURE__*/ createUseReadContract({
	abi: baseErc20Abi,
	functionName: "allowance",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadBaseErc20BalanceOf = /*#__PURE__*/ createUseReadContract({
	abi: baseErc20Abi,
	functionName: "balanceOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"decimals"`
 */
export const useReadBaseErc20Decimals = /*#__PURE__*/ createUseReadContract({
	abi: baseErc20Abi,
	functionName: "decimals",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"eip712Domain"`
 */
export const useReadBaseErc20Eip712Domain = /*#__PURE__*/ createUseReadContract(
	{ abi: baseErc20Abi, functionName: "eip712Domain" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"name"`
 */
export const useReadBaseErc20Name = /*#__PURE__*/ createUseReadContract({
	abi: baseErc20Abi,
	functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"nonces"`
 */
export const useReadBaseErc20Nonces = /*#__PURE__*/ createUseReadContract({
	abi: baseErc20Abi,
	functionName: "nonces",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"owner"`
 */
export const useReadBaseErc20Owner = /*#__PURE__*/ createUseReadContract({
	abi: baseErc20Abi,
	functionName: "owner",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadBaseErc20Symbol = /*#__PURE__*/ createUseReadContract({
	abi: baseErc20Abi,
	functionName: "symbol",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadBaseErc20TotalSupply = /*#__PURE__*/ createUseReadContract({
	abi: baseErc20Abi,
	functionName: "totalSupply",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__
 */
export const useWriteBaseErc20Contract = /*#__PURE__*/ createUseWriteContract({
	abi: baseErc20Abi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteBaseErc20Approve = /*#__PURE__*/ createUseWriteContract({
	abi: baseErc20Abi,
	functionName: "approve",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"mint"`
 */
export const useWriteBaseErc20Mint = /*#__PURE__*/ createUseWriteContract({
	abi: baseErc20Abi,
	functionName: "mint",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"permit"`
 */
export const useWriteBaseErc20Permit = /*#__PURE__*/ createUseWriteContract({
	abi: baseErc20Abi,
	functionName: "permit",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteBaseErc20RenounceOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: baseErc20Abi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteBaseErc20Transfer = /*#__PURE__*/ createUseWriteContract({
	abi: baseErc20Abi,
	functionName: "transfer",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteBaseErc20TransferFrom =
	/*#__PURE__*/ createUseWriteContract({
		abi: baseErc20Abi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteBaseErc20TransferOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: baseErc20Abi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__
 */
export const useSimulateBaseErc20Contract =
	/*#__PURE__*/ createUseSimulateContract({ abi: baseErc20Abi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateBaseErc20Approve =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc20Abi,
		functionName: "approve",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"mint"`
 */
export const useSimulateBaseErc20Mint = /*#__PURE__*/ createUseSimulateContract(
	{ abi: baseErc20Abi, functionName: "mint" },
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"permit"`
 */
export const useSimulateBaseErc20Permit =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc20Abi,
		functionName: "permit",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateBaseErc20RenounceOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc20Abi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateBaseErc20Transfer =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc20Abi,
		functionName: "transfer",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateBaseErc20TransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc20Abi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateBaseErc20TransferOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc20Abi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc20Abi}__
 */
export const useWatchBaseErc20Contract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: baseErc20Abi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc20Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchBaseErc20Approval =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: baseErc20Abi,
		eventName: "Approval",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc20Abi}__ and `eventName` set to `"EIP712DomainChanged"`
 */
export const useWatchBaseErc20Eip712DomainChanged =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: baseErc20Abi,
		eventName: "EIP712DomainChanged",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc20Abi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchBaseErc20OwnershipTransferred =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: baseErc20Abi,
		eventName: "OwnershipTransferred",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchBaseErc20Transfer =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: baseErc20Abi,
		eventName: "Transfer",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__
 */
export const useReadBaseErc721Contract = /*#__PURE__*/ createUseReadContract({
	abi: baseErc721Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadBaseErc721BalanceOf = /*#__PURE__*/ createUseReadContract({
	abi: baseErc721Abi,
	functionName: "balanceOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"getApproved"`
 */
export const useReadBaseErc721GetApproved = /*#__PURE__*/ createUseReadContract(
	{ abi: baseErc721Abi, functionName: "getApproved" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadBaseErc721IsApprovedForAll =
	/*#__PURE__*/ createUseReadContract({
		abi: baseErc721Abi,
		functionName: "isApprovedForAll",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"name"`
 */
export const useReadBaseErc721Name = /*#__PURE__*/ createUseReadContract({
	abi: baseErc721Abi,
	functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"owner"`
 */
export const useReadBaseErc721Owner = /*#__PURE__*/ createUseReadContract({
	abi: baseErc721Abi,
	functionName: "owner",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadBaseErc721OwnerOf = /*#__PURE__*/ createUseReadContract({
	abi: baseErc721Abi,
	functionName: "ownerOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadBaseErc721SupportsInterface =
	/*#__PURE__*/ createUseReadContract({
		abi: baseErc721Abi,
		functionName: "supportsInterface",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadBaseErc721Symbol = /*#__PURE__*/ createUseReadContract({
	abi: baseErc721Abi,
	functionName: "symbol",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"tokenByIndex"`
 */
export const useReadBaseErc721TokenByIndex =
	/*#__PURE__*/ createUseReadContract({
		abi: baseErc721Abi,
		functionName: "tokenByIndex",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 */
export const useReadBaseErc721TokenOfOwnerByIndex =
	/*#__PURE__*/ createUseReadContract({
		abi: baseErc721Abi,
		functionName: "tokenOfOwnerByIndex",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadBaseErc721TokenUri = /*#__PURE__*/ createUseReadContract({
	abi: baseErc721Abi,
	functionName: "tokenURI",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadBaseErc721TotalSupply = /*#__PURE__*/ createUseReadContract(
	{ abi: baseErc721Abi, functionName: "totalSupply" },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__
 */
export const useWriteBaseErc721Contract = /*#__PURE__*/ createUseWriteContract({
	abi: baseErc721Abi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteBaseErc721Approve = /*#__PURE__*/ createUseWriteContract({
	abi: baseErc721Abi,
	functionName: "approve",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"batchMint"`
 */
export const useWriteBaseErc721BatchMint = /*#__PURE__*/ createUseWriteContract(
	{ abi: baseErc721Abi, functionName: "batchMint" },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"batchMintWithURIs"`
 */
export const useWriteBaseErc721BatchMintWithUrIs =
	/*#__PURE__*/ createUseWriteContract({
		abi: baseErc721Abi,
		functionName: "batchMintWithURIs",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"mint"`
 */
export const useWriteBaseErc721Mint = /*#__PURE__*/ createUseWriteContract({
	abi: baseErc721Abi,
	functionName: "mint",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"mintWithURI"`
 */
export const useWriteBaseErc721MintWithUri =
	/*#__PURE__*/ createUseWriteContract({
		abi: baseErc721Abi,
		functionName: "mintWithURI",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteBaseErc721RenounceOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: baseErc721Abi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteBaseErc721SafeTransferFrom =
	/*#__PURE__*/ createUseWriteContract({
		abi: baseErc721Abi,
		functionName: "safeTransferFrom",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteBaseErc721SetApprovalForAll =
	/*#__PURE__*/ createUseWriteContract({
		abi: baseErc721Abi,
		functionName: "setApprovalForAll",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"setBaseURI"`
 */
export const useWriteBaseErc721SetBaseUri =
	/*#__PURE__*/ createUseWriteContract({
		abi: baseErc721Abi,
		functionName: "setBaseURI",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"setTokenURI"`
 */
export const useWriteBaseErc721SetTokenUri =
	/*#__PURE__*/ createUseWriteContract({
		abi: baseErc721Abi,
		functionName: "setTokenURI",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteBaseErc721TransferFrom =
	/*#__PURE__*/ createUseWriteContract({
		abi: baseErc721Abi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteBaseErc721TransferOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: baseErc721Abi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__
 */
export const useSimulateBaseErc721Contract =
	/*#__PURE__*/ createUseSimulateContract({ abi: baseErc721Abi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateBaseErc721Approve =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc721Abi,
		functionName: "approve",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"batchMint"`
 */
export const useSimulateBaseErc721BatchMint =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc721Abi,
		functionName: "batchMint",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"batchMintWithURIs"`
 */
export const useSimulateBaseErc721BatchMintWithUrIs =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc721Abi,
		functionName: "batchMintWithURIs",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"mint"`
 */
export const useSimulateBaseErc721Mint =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc721Abi,
		functionName: "mint",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"mintWithURI"`
 */
export const useSimulateBaseErc721MintWithUri =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc721Abi,
		functionName: "mintWithURI",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateBaseErc721RenounceOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc721Abi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateBaseErc721SafeTransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc721Abi,
		functionName: "safeTransferFrom",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateBaseErc721SetApprovalForAll =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc721Abi,
		functionName: "setApprovalForAll",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"setBaseURI"`
 */
export const useSimulateBaseErc721SetBaseUri =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc721Abi,
		functionName: "setBaseURI",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"setTokenURI"`
 */
export const useSimulateBaseErc721SetTokenUri =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc721Abi,
		functionName: "setTokenURI",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateBaseErc721TransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc721Abi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateBaseErc721TransferOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: baseErc721Abi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc721Abi}__
 */
export const useWatchBaseErc721Contract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: baseErc721Abi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc721Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchBaseErc721Approval =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: baseErc721Abi,
		eventName: "Approval",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc721Abi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchBaseErc721ApprovalForAll =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: baseErc721Abi,
		eventName: "ApprovalForAll",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc721Abi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchBaseErc721OwnershipTransferred =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: baseErc721Abi,
		eventName: "OwnershipTransferred",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc721Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchBaseErc721Transfer =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: baseErc721Abi,
		eventName: "Transfer",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__
 */
export const useReadCardGroupedVaultContract =
	/*#__PURE__*/ createUseReadContract({ abi: cardGroupedVaultAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadCardGroupedVaultUpgradeInterfaceVersion =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "UPGRADE_INTERFACE_VERSION",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"asset"`
 */
export const useReadCardGroupedVaultAsset = /*#__PURE__*/ createUseReadContract(
	{ abi: cardGroupedVaultAbi, functionName: "asset" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"cardNodes"`
 */
export const useReadCardGroupedVaultCardNodes =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "cardNodes",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"economyManager"`
 */
export const useReadCardGroupedVaultEconomyManager =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "economyManager",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"getDepositorCards"`
 */
export const useReadCardGroupedVaultGetDepositorCards =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "getDepositorCards",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"numRarities"`
 */
export const useReadCardGroupedVaultNumRarities =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "numRarities",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"owner"`
 */
export const useReadCardGroupedVaultOwner = /*#__PURE__*/ createUseReadContract(
	{ abi: cardGroupedVaultAbi, functionName: "owner" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"paused"`
 */
export const useReadCardGroupedVaultPaused =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "paused",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"pendingYield"`
 */
export const useReadCardGroupedVaultPendingYield =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "pendingYield",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"positions"`
 */
export const useReadCardGroupedVaultPositions =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "positions",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadCardGroupedVaultProxiableUuid =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "proxiableUUID",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"rarityPools"`
 */
export const useReadCardGroupedVaultRarityPools =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "rarityPools",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"rarityTotalValue"`
 */
export const useReadCardGroupedVaultRarityTotalValue =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "rarityTotalValue",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"sharesOf"`
 */
export const useReadCardGroupedVaultSharesOf =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "sharesOf",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"totalShares"`
 */
export const useReadCardGroupedVaultTotalShares =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "totalShares",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"totalYieldClaimed"`
 */
export const useReadCardGroupedVaultTotalYieldClaimed =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "totalYieldClaimed",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"totalYieldDistributed"`
 */
export const useReadCardGroupedVaultTotalYieldDistributed =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "totalYieldDistributed",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadCardGroupedVaultTreasury =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultAbi,
		functionName: "treasury",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__
 */
export const useWriteCardGroupedVaultContract =
	/*#__PURE__*/ createUseWriteContract({ abi: cardGroupedVaultAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"claimYield"`
 */
export const useWriteCardGroupedVaultClaimYield =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultAbi,
		functionName: "claimYield",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"claimYieldForCards"`
 */
export const useWriteCardGroupedVaultClaimYieldForCards =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultAbi,
		functionName: "claimYieldForCards",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"distributeYield"`
 */
export const useWriteCardGroupedVaultDistributeYield =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultAbi,
		functionName: "distributeYield",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteCardGroupedVaultInitialize =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultAbi,
		functionName: "initialize",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"migrateCardRarity"`
 */
export const useWriteCardGroupedVaultMigrateCardRarity =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultAbi,
		functionName: "migrateCardRarity",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteCardGroupedVaultPause =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultAbi,
		functionName: "pause",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"registerCardDeposit"`
 */
export const useWriteCardGroupedVaultRegisterCardDeposit =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultAbi,
		functionName: "registerCardDeposit",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"removeCardDeposit"`
 */
export const useWriteCardGroupedVaultRemoveCardDeposit =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultAbi,
		functionName: "removeCardDeposit",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteCardGroupedVaultRenounceOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"setEconomyManager"`
 */
export const useWriteCardGroupedVaultSetEconomyManager =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultAbi,
		functionName: "setEconomyManager",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useWriteCardGroupedVaultSetTreasury =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultAbi,
		functionName: "setTreasury",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteCardGroupedVaultTransferOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteCardGroupedVaultUnpause =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultAbi,
		functionName: "unpause",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"updateCardPrice"`
 */
export const useWriteCardGroupedVaultUpdateCardPrice =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultAbi,
		functionName: "updateCardPrice",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteCardGroupedVaultUpgradeToAndCall =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultAbi,
		functionName: "upgradeToAndCall",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__
 */
export const useSimulateCardGroupedVaultContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: cardGroupedVaultAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"claimYield"`
 */
export const useSimulateCardGroupedVaultClaimYield =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultAbi,
		functionName: "claimYield",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"claimYieldForCards"`
 */
export const useSimulateCardGroupedVaultClaimYieldForCards =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultAbi,
		functionName: "claimYieldForCards",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"distributeYield"`
 */
export const useSimulateCardGroupedVaultDistributeYield =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultAbi,
		functionName: "distributeYield",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateCardGroupedVaultInitialize =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultAbi,
		functionName: "initialize",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"migrateCardRarity"`
 */
export const useSimulateCardGroupedVaultMigrateCardRarity =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultAbi,
		functionName: "migrateCardRarity",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateCardGroupedVaultPause =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultAbi,
		functionName: "pause",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"registerCardDeposit"`
 */
export const useSimulateCardGroupedVaultRegisterCardDeposit =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultAbi,
		functionName: "registerCardDeposit",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"removeCardDeposit"`
 */
export const useSimulateCardGroupedVaultRemoveCardDeposit =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultAbi,
		functionName: "removeCardDeposit",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateCardGroupedVaultRenounceOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"setEconomyManager"`
 */
export const useSimulateCardGroupedVaultSetEconomyManager =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultAbi,
		functionName: "setEconomyManager",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useSimulateCardGroupedVaultSetTreasury =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultAbi,
		functionName: "setTreasury",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateCardGroupedVaultTransferOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateCardGroupedVaultUnpause =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultAbi,
		functionName: "unpause",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"updateCardPrice"`
 */
export const useSimulateCardGroupedVaultUpdateCardPrice =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultAbi,
		functionName: "updateCardPrice",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateCardGroupedVaultUpgradeToAndCall =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultAbi,
		functionName: "upgradeToAndCall",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__
 */
export const useWatchCardGroupedVaultContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: cardGroupedVaultAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"CardDepositRegistered"`
 */
export const useWatchCardGroupedVaultCardDepositRegistered =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultAbi,
		eventName: "CardDepositRegistered",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"CardDepositRemoved"`
 */
export const useWatchCardGroupedVaultCardDepositRemoved =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultAbi,
		eventName: "CardDepositRemoved",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"CardPriceUpdated"`
 */
export const useWatchCardGroupedVaultCardPriceUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultAbi,
		eventName: "CardPriceUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"CardRarityMigrated"`
 */
export const useWatchCardGroupedVaultCardRarityMigrated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultAbi,
		eventName: "CardRarityMigrated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"EconomyManagerUpdated"`
 */
export const useWatchCardGroupedVaultEconomyManagerUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultAbi,
		eventName: "EconomyManagerUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchCardGroupedVaultInitialized =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultAbi,
		eventName: "Initialized",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchCardGroupedVaultOwnershipTransferred =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultAbi,
		eventName: "OwnershipTransferred",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchCardGroupedVaultPaused =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultAbi,
		eventName: "Paused",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"TreasuryUpdated"`
 */
export const useWatchCardGroupedVaultTreasuryUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultAbi,
		eventName: "TreasuryUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchCardGroupedVaultUnpaused =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultAbi,
		eventName: "Unpaused",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchCardGroupedVaultUpgraded =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultAbi,
		eventName: "Upgraded",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"YieldClaimed"`
 */
export const useWatchCardGroupedVaultYieldClaimed =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultAbi,
		eventName: "YieldClaimed",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"YieldDistributed"`
 */
export const useWatchCardGroupedVaultYieldDistributed =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultAbi,
		eventName: "YieldDistributed",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__
 */
export const useReadCardGroupedVaultFuzzContract =
	/*#__PURE__*/ createUseReadContract({ abi: cardGroupedVaultFuzzAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"IS_TEST"`
 */
export const useReadCardGroupedVaultFuzzIsTest =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "IS_TEST",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"excludeArtifacts"`
 */
export const useReadCardGroupedVaultFuzzExcludeArtifacts =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "excludeArtifacts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"excludeContracts"`
 */
export const useReadCardGroupedVaultFuzzExcludeContracts =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "excludeContracts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"excludeSelectors"`
 */
export const useReadCardGroupedVaultFuzzExcludeSelectors =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "excludeSelectors",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"excludeSenders"`
 */
export const useReadCardGroupedVaultFuzzExcludeSenders =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "excludeSenders",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"failed"`
 */
export const useReadCardGroupedVaultFuzzFailed =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "failed",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"targetArtifactSelectors"`
 */
export const useReadCardGroupedVaultFuzzTargetArtifactSelectors =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "targetArtifactSelectors",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"targetArtifacts"`
 */
export const useReadCardGroupedVaultFuzzTargetArtifacts =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "targetArtifacts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"targetContracts"`
 */
export const useReadCardGroupedVaultFuzzTargetContracts =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "targetContracts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"targetInterfaces"`
 */
export const useReadCardGroupedVaultFuzzTargetInterfaces =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "targetInterfaces",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"targetSelectors"`
 */
export const useReadCardGroupedVaultFuzzTargetSelectors =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "targetSelectors",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"targetSenders"`
 */
export const useReadCardGroupedVaultFuzzTargetSenders =
	/*#__PURE__*/ createUseReadContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "targetSenders",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__
 */
export const useWriteCardGroupedVaultFuzzContract =
	/*#__PURE__*/ createUseWriteContract({ abi: cardGroupedVaultFuzzAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"setUp"`
 */
export const useWriteCardGroupedVaultFuzzSetUp =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "setUp",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_AdditionalDeposit_ZeroPendingAfterDeposit"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzAdditionalDepositZeroPendingAfterDeposit =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_AdditionalDeposit_ZeroPendingAfterDeposit",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_ClaimIdempotent"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzClaimIdempotent =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_ClaimIdempotent",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_ClaimYieldForCards_Partial"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzClaimYieldForCardsPartial =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_ClaimYieldForCards_Partial",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_CorrectionAccumulator_MatchesReference"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzCorrectionAccumulatorMatchesReference =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_CorrectionAccumulator_MatchesReference",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_DepositYieldPriceChangeClaim_Integrity"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzDepositYieldPriceChangeClaimIntegrity =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_DepositYieldPriceChangeClaim_Integrity",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_DifferentPrices_ProportionalByValue"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzDifferentPricesProportionalByValue =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_DifferentPrices_ProportionalByValue",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_FullRemove_AutoClaims"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzFullRemoveAutoClaims =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_FullRemove_AutoClaims",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_GlobalInvariant_ClaimedNeverExceedsDistributed"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzGlobalInvariantClaimedNeverExceedsDistributed =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_GlobalInvariant_ClaimedNeverExceedsDistributed",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_LargePrice_NoOverflow"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzLargePriceNoOverflow =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_LargePrice_NoOverflow",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_LateJoiner_GetsNoHistoricalYield"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzLateJoinerGetsNoHistoricalYield =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_LateJoiner_GetsNoHistoricalYield",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_LifecycleTotals"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzLifecycleTotals =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_LifecycleTotals",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_MigrationAndPriceUpdate_Combined"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzMigrationAndPriceUpdateCombined =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_MigrationAndPriceUpdate_Combined",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_MixedOperations_Invariants"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzMixedOperationsInvariants =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_MixedOperations_Invariants",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_MultiCardDepositor_AggregatedPending"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzMultiCardDepositorAggregatedPending =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_MultiCardDepositor_AggregatedPending",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_MultiMigration_NoYieldDuplication"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzMultiMigrationNoYieldDuplication =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_MultiMigration_NoYieldDuplication",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_PartialRemove_FutureYieldCorrect"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzPartialRemoveFutureYieldCorrect =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_PartialRemove_FutureYieldCorrect",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_PendingYield_AlwaysNonNegative"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzPendingYieldAlwaysNonNegative =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_PendingYield_AlwaysNonNegative",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_PriceDeltaSymmetry"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzPriceDeltaSymmetry =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_PriceDeltaSymmetry",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_PriceOscillation_NeverNegativePending"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzPriceOscillationNeverNegativePending =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_PriceOscillation_NeverNegativePending",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_PriceOscillation_YieldConservation"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzPriceOscillationYieldConservation =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_PriceOscillation_YieldConservation",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_PriceRoundTrip_CorrectionCancels"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzPriceRoundTripCorrectionCancels =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_PriceRoundTrip_CorrectionCancels",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_RarityIsolation"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzRarityIsolation =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_RarityIsolation",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_RarityMigration_PreservesYield"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzRarityMigrationPreservesYield =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_RarityMigration_PreservesYield",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_RemoveAll_ZeroTotalShares"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzRemoveAllZeroTotalShares =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_RemoveAll_ZeroTotalShares",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_SmallYieldDistributions_Accumulate"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzSmallYieldDistributionsAccumulate =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_SmallYieldDistributions_Accumulate",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_TotalClaimed_NeverExceedsDistributed"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzTotalClaimedNeverExceedsDistributed =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_TotalClaimed_NeverExceedsDistributed",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_TwoDepositors_ProportionalSplit"`
 */
export const useWriteCardGroupedVaultFuzzTestFuzzTwoDepositorsProportionalSplit =
	/*#__PURE__*/ createUseWriteContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_TwoDepositors_ProportionalSplit",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__
 */
export const useSimulateCardGroupedVaultFuzzContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: cardGroupedVaultFuzzAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"setUp"`
 */
export const useSimulateCardGroupedVaultFuzzSetUp =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "setUp",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_AdditionalDeposit_ZeroPendingAfterDeposit"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzAdditionalDepositZeroPendingAfterDeposit =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_AdditionalDeposit_ZeroPendingAfterDeposit",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_ClaimIdempotent"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzClaimIdempotent =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_ClaimIdempotent",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_ClaimYieldForCards_Partial"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzClaimYieldForCardsPartial =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_ClaimYieldForCards_Partial",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_CorrectionAccumulator_MatchesReference"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzCorrectionAccumulatorMatchesReference =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_CorrectionAccumulator_MatchesReference",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_DepositYieldPriceChangeClaim_Integrity"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzDepositYieldPriceChangeClaimIntegrity =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_DepositYieldPriceChangeClaim_Integrity",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_DifferentPrices_ProportionalByValue"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzDifferentPricesProportionalByValue =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_DifferentPrices_ProportionalByValue",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_FullRemove_AutoClaims"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzFullRemoveAutoClaims =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_FullRemove_AutoClaims",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_GlobalInvariant_ClaimedNeverExceedsDistributed"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzGlobalInvariantClaimedNeverExceedsDistributed =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_GlobalInvariant_ClaimedNeverExceedsDistributed",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_LargePrice_NoOverflow"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzLargePriceNoOverflow =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_LargePrice_NoOverflow",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_LateJoiner_GetsNoHistoricalYield"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzLateJoinerGetsNoHistoricalYield =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_LateJoiner_GetsNoHistoricalYield",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_LifecycleTotals"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzLifecycleTotals =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_LifecycleTotals",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_MigrationAndPriceUpdate_Combined"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzMigrationAndPriceUpdateCombined =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_MigrationAndPriceUpdate_Combined",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_MixedOperations_Invariants"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzMixedOperationsInvariants =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_MixedOperations_Invariants",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_MultiCardDepositor_AggregatedPending"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzMultiCardDepositorAggregatedPending =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_MultiCardDepositor_AggregatedPending",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_MultiMigration_NoYieldDuplication"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzMultiMigrationNoYieldDuplication =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_MultiMigration_NoYieldDuplication",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_PartialRemove_FutureYieldCorrect"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzPartialRemoveFutureYieldCorrect =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_PartialRemove_FutureYieldCorrect",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_PendingYield_AlwaysNonNegative"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzPendingYieldAlwaysNonNegative =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_PendingYield_AlwaysNonNegative",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_PriceDeltaSymmetry"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzPriceDeltaSymmetry =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_PriceDeltaSymmetry",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_PriceOscillation_NeverNegativePending"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzPriceOscillationNeverNegativePending =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_PriceOscillation_NeverNegativePending",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_PriceOscillation_YieldConservation"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzPriceOscillationYieldConservation =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_PriceOscillation_YieldConservation",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_PriceRoundTrip_CorrectionCancels"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzPriceRoundTripCorrectionCancels =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_PriceRoundTrip_CorrectionCancels",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_RarityIsolation"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzRarityIsolation =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_RarityIsolation",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_RarityMigration_PreservesYield"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzRarityMigrationPreservesYield =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_RarityMigration_PreservesYield",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_RemoveAll_ZeroTotalShares"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzRemoveAllZeroTotalShares =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_RemoveAll_ZeroTotalShares",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_SmallYieldDistributions_Accumulate"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzSmallYieldDistributionsAccumulate =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_SmallYieldDistributions_Accumulate",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_TotalClaimed_NeverExceedsDistributed"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzTotalClaimedNeverExceedsDistributed =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_TotalClaimed_NeverExceedsDistributed",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `functionName` set to `"testFuzz_TwoDepositors_ProportionalSplit"`
 */
export const useSimulateCardGroupedVaultFuzzTestFuzzTwoDepositorsProportionalSplit =
	/*#__PURE__*/ createUseSimulateContract({
		abi: cardGroupedVaultFuzzAbi,
		functionName: "testFuzz_TwoDepositors_ProportionalSplit",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__
 */
export const useWatchCardGroupedVaultFuzzContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: cardGroupedVaultFuzzAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log"`
 */
export const useWatchCardGroupedVaultFuzzLog =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_address"`
 */
export const useWatchCardGroupedVaultFuzzLogAddress =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_address",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_array"`
 */
export const useWatchCardGroupedVaultFuzzLogArray =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_array",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_bytes"`
 */
export const useWatchCardGroupedVaultFuzzLogBytes =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_bytes",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_bytes32"`
 */
export const useWatchCardGroupedVaultFuzzLogBytes32 =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_bytes32",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_int"`
 */
export const useWatchCardGroupedVaultFuzzLogInt =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_int",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_named_address"`
 */
export const useWatchCardGroupedVaultFuzzLogNamedAddress =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_named_address",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_named_array"`
 */
export const useWatchCardGroupedVaultFuzzLogNamedArray =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_named_array",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_named_bytes"`
 */
export const useWatchCardGroupedVaultFuzzLogNamedBytes =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_named_bytes",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_named_bytes32"`
 */
export const useWatchCardGroupedVaultFuzzLogNamedBytes32 =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_named_bytes32",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_named_decimal_int"`
 */
export const useWatchCardGroupedVaultFuzzLogNamedDecimalInt =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_named_decimal_int",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_named_decimal_uint"`
 */
export const useWatchCardGroupedVaultFuzzLogNamedDecimalUint =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_named_decimal_uint",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_named_int"`
 */
export const useWatchCardGroupedVaultFuzzLogNamedInt =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_named_int",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_named_string"`
 */
export const useWatchCardGroupedVaultFuzzLogNamedString =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_named_string",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_named_uint"`
 */
export const useWatchCardGroupedVaultFuzzLogNamedUint =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_named_uint",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_string"`
 */
export const useWatchCardGroupedVaultFuzzLogString =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_string",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"log_uint"`
 */
export const useWatchCardGroupedVaultFuzzLogUint =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "log_uint",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultFuzzAbi}__ and `eventName` set to `"logs"`
 */
export const useWatchCardGroupedVaultFuzzLogs =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: cardGroupedVaultFuzzAbi,
		eventName: "logs",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link contextUpgradeableAbi}__
 */
export const useWatchContextUpgradeableContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: contextUpgradeableAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link contextUpgradeableAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchContextUpgradeableInitialized =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: contextUpgradeableAbi,
		eventName: "Initialized",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link eip712Abi}__
 */
export const useReadEip712Contract = /*#__PURE__*/ createUseReadContract({
	abi: eip712Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link eip712Abi}__ and `functionName` set to `"eip712Domain"`
 */
export const useReadEip712Eip712Domain = /*#__PURE__*/ createUseReadContract({
	abi: eip712Abi,
	functionName: "eip712Domain",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link eip712Abi}__
 */
export const useWatchEip712Contract = /*#__PURE__*/ createUseWatchContractEvent(
	{ abi: eip712Abi },
);

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link eip712Abi}__ and `eventName` set to `"EIP712DomainChanged"`
 */
export const useWatchEip712Eip712DomainChanged =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: eip712Abi,
		eventName: "EIP712DomainChanged",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc165Abi}__
 */
export const useReadErc165Contract = /*#__PURE__*/ createUseReadContract({
	abi: erc165Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc165Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadErc165SupportsInterface =
	/*#__PURE__*/ createUseReadContract({
		abi: erc165Abi,
		functionName: "supportsInterface",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc1967ProxyAbi}__
 */
export const useWatchErc1967ProxyContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: erc1967ProxyAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc1967ProxyAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchErc1967ProxyUpgraded =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: erc1967ProxyAbi,
		eventName: "Upgraded",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useReadErc20Contract = /*#__PURE__*/ createUseReadContract({
	abi: erc20Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadErc20Allowance = /*#__PURE__*/ createUseReadContract({
	abi: erc20Abi,
	functionName: "allowance",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc20BalanceOf = /*#__PURE__*/ createUseReadContract({
	abi: erc20Abi,
	functionName: "balanceOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const useReadErc20Decimals = /*#__PURE__*/ createUseReadContract({
	abi: erc20Abi,
	functionName: "decimals",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"name"`
 */
export const useReadErc20Name = /*#__PURE__*/ createUseReadContract({
	abi: erc20Abi,
	functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc20Symbol = /*#__PURE__*/ createUseReadContract({
	abi: erc20Abi,
	functionName: "symbol",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc20TotalSupply = /*#__PURE__*/ createUseReadContract({
	abi: erc20Abi,
	functionName: "totalSupply",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWriteErc20Contract = /*#__PURE__*/ createUseWriteContract({
	abi: erc20Abi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc20Approve = /*#__PURE__*/ createUseWriteContract({
	abi: erc20Abi,
	functionName: "approve",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteErc20Transfer = /*#__PURE__*/ createUseWriteContract({
	abi: erc20Abi,
	functionName: "transfer",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc20TransferFrom = /*#__PURE__*/ createUseWriteContract({
	abi: erc20Abi,
	functionName: "transferFrom",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useSimulateErc20Contract = /*#__PURE__*/ createUseSimulateContract(
	{ abi: erc20Abi },
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc20Approve = /*#__PURE__*/ createUseSimulateContract({
	abi: erc20Abi,
	functionName: "approve",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateErc20Transfer = /*#__PURE__*/ createUseSimulateContract(
	{ abi: erc20Abi, functionName: "transfer" },
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc20TransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: erc20Abi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWatchErc20Contract = /*#__PURE__*/ createUseWatchContractEvent({
	abi: erc20Abi,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc20Approval = /*#__PURE__*/ createUseWatchContractEvent({
	abi: erc20Abi,
	eventName: "Approval",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc20Transfer = /*#__PURE__*/ createUseWatchContractEvent({
	abi: erc20Abi,
	eventName: "Transfer",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20BatchQueryAbi}__
 */
export const useReadErc20BatchQueryContract =
	/*#__PURE__*/ createUseReadContract({ abi: erc20BatchQueryAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20BatchQueryAbi}__ and `functionName` set to `"getBalanceAndAllowanceBatch"`
 */
export const useReadErc20BatchQueryGetBalanceAndAllowanceBatch =
	/*#__PURE__*/ createUseReadContract({
		abi: erc20BatchQueryAbi,
		functionName: "getBalanceAndAllowanceBatch",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20BatchQueryAbi}__ and `functionName` set to `"getMultipleBalancesBatch"`
 */
export const useReadErc20BatchQueryGetMultipleBalancesBatch =
	/*#__PURE__*/ createUseReadContract({
		abi: erc20BatchQueryAbi,
		functionName: "getMultipleBalancesBatch",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20BatchQueryAbi}__ and `functionName` set to `"getTokenInfoBatch"`
 */
export const useReadErc20BatchQueryGetTokenInfoBatch =
	/*#__PURE__*/ createUseReadContract({
		abi: erc20BatchQueryAbi,
		functionName: "getTokenInfoBatch",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__
 */
export const useReadErc20PermitContract = /*#__PURE__*/ createUseReadContract({
	abi: erc20PermitAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 */
export const useReadErc20PermitDomainSeparator =
	/*#__PURE__*/ createUseReadContract({
		abi: erc20PermitAbi,
		functionName: "DOMAIN_SEPARATOR",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadErc20PermitAllowance = /*#__PURE__*/ createUseReadContract({
	abi: erc20PermitAbi,
	functionName: "allowance",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc20PermitBalanceOf = /*#__PURE__*/ createUseReadContract({
	abi: erc20PermitAbi,
	functionName: "balanceOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadErc20PermitDecimals = /*#__PURE__*/ createUseReadContract({
	abi: erc20PermitAbi,
	functionName: "decimals",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"eip712Domain"`
 */
export const useReadErc20PermitEip712Domain =
	/*#__PURE__*/ createUseReadContract({
		abi: erc20PermitAbi,
		functionName: "eip712Domain",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"name"`
 */
export const useReadErc20PermitName = /*#__PURE__*/ createUseReadContract({
	abi: erc20PermitAbi,
	functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"nonces"`
 */
export const useReadErc20PermitNonces = /*#__PURE__*/ createUseReadContract({
	abi: erc20PermitAbi,
	functionName: "nonces",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc20PermitSymbol = /*#__PURE__*/ createUseReadContract({
	abi: erc20PermitAbi,
	functionName: "symbol",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc20PermitTotalSupply =
	/*#__PURE__*/ createUseReadContract({
		abi: erc20PermitAbi,
		functionName: "totalSupply",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20PermitAbi}__
 */
export const useWriteErc20PermitContract = /*#__PURE__*/ createUseWriteContract(
	{ abi: erc20PermitAbi },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc20PermitApprove = /*#__PURE__*/ createUseWriteContract({
	abi: erc20PermitAbi,
	functionName: "approve",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"permit"`
 */
export const useWriteErc20PermitPermit = /*#__PURE__*/ createUseWriteContract({
	abi: erc20PermitAbi,
	functionName: "permit",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteErc20PermitTransfer = /*#__PURE__*/ createUseWriteContract(
	{ abi: erc20PermitAbi, functionName: "transfer" },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc20PermitTransferFrom =
	/*#__PURE__*/ createUseWriteContract({
		abi: erc20PermitAbi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20PermitAbi}__
 */
export const useSimulateErc20PermitContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: erc20PermitAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc20PermitApprove =
	/*#__PURE__*/ createUseSimulateContract({
		abi: erc20PermitAbi,
		functionName: "approve",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"permit"`
 */
export const useSimulateErc20PermitPermit =
	/*#__PURE__*/ createUseSimulateContract({
		abi: erc20PermitAbi,
		functionName: "permit",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateErc20PermitTransfer =
	/*#__PURE__*/ createUseSimulateContract({
		abi: erc20PermitAbi,
		functionName: "transfer",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc20PermitTransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: erc20PermitAbi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20PermitAbi}__
 */
export const useWatchErc20PermitContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: erc20PermitAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20PermitAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc20PermitApproval =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: erc20PermitAbi,
		eventName: "Approval",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20PermitAbi}__ and `eventName` set to `"EIP712DomainChanged"`
 */
export const useWatchErc20PermitEip712DomainChanged =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: erc20PermitAbi,
		eventName: "EIP712DomainChanged",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20PermitAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc20PermitTransfer =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: erc20PermitAbi,
		eventName: "Transfer",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__
 */
export const useReadErc721Contract = /*#__PURE__*/ createUseReadContract({
	abi: erc721Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc721BalanceOf = /*#__PURE__*/ createUseReadContract({
	abi: erc721Abi,
	functionName: "balanceOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"getApproved"`
 */
export const useReadErc721GetApproved = /*#__PURE__*/ createUseReadContract({
	abi: erc721Abi,
	functionName: "getApproved",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadErc721IsApprovedForAll =
	/*#__PURE__*/ createUseReadContract({
		abi: erc721Abi,
		functionName: "isApprovedForAll",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"name"`
 */
export const useReadErc721Name = /*#__PURE__*/ createUseReadContract({
	abi: erc721Abi,
	functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadErc721OwnerOf = /*#__PURE__*/ createUseReadContract({
	abi: erc721Abi,
	functionName: "ownerOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadErc721SupportsInterface =
	/*#__PURE__*/ createUseReadContract({
		abi: erc721Abi,
		functionName: "supportsInterface",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc721Symbol = /*#__PURE__*/ createUseReadContract({
	abi: erc721Abi,
	functionName: "symbol",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadErc721TokenUri = /*#__PURE__*/ createUseReadContract({
	abi: erc721Abi,
	functionName: "tokenURI",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721Abi}__
 */
export const useWriteErc721Contract = /*#__PURE__*/ createUseWriteContract({
	abi: erc721Abi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc721Approve = /*#__PURE__*/ createUseWriteContract({
	abi: erc721Abi,
	functionName: "approve",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteErc721SafeTransferFrom =
	/*#__PURE__*/ createUseWriteContract({
		abi: erc721Abi,
		functionName: "safeTransferFrom",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteErc721SetApprovalForAll =
	/*#__PURE__*/ createUseWriteContract({
		abi: erc721Abi,
		functionName: "setApprovalForAll",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc721TransferFrom = /*#__PURE__*/ createUseWriteContract({
	abi: erc721Abi,
	functionName: "transferFrom",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721Abi}__
 */
export const useSimulateErc721Contract =
	/*#__PURE__*/ createUseSimulateContract({ abi: erc721Abi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc721Approve = /*#__PURE__*/ createUseSimulateContract(
	{ abi: erc721Abi, functionName: "approve" },
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateErc721SafeTransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: erc721Abi,
		functionName: "safeTransferFrom",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateErc721SetApprovalForAll =
	/*#__PURE__*/ createUseSimulateContract({
		abi: erc721Abi,
		functionName: "setApprovalForAll",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc721TransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: erc721Abi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721Abi}__
 */
export const useWatchErc721Contract = /*#__PURE__*/ createUseWatchContractEvent(
	{ abi: erc721Abi },
);

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc721Approval = /*#__PURE__*/ createUseWatchContractEvent(
	{ abi: erc721Abi, eventName: "Approval" },
);

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721Abi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchErc721ApprovalForAll =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: erc721Abi,
		eventName: "ApprovalForAll",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc721Transfer = /*#__PURE__*/ createUseWatchContractEvent(
	{ abi: erc721Abi, eventName: "Transfer" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__
 */
export const useReadErc721EnumerableContract =
	/*#__PURE__*/ createUseReadContract({ abi: erc721EnumerableAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc721EnumerableBalanceOf =
	/*#__PURE__*/ createUseReadContract({
		abi: erc721EnumerableAbi,
		functionName: "balanceOf",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"getApproved"`
 */
export const useReadErc721EnumerableGetApproved =
	/*#__PURE__*/ createUseReadContract({
		abi: erc721EnumerableAbi,
		functionName: "getApproved",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadErc721EnumerableIsApprovedForAll =
	/*#__PURE__*/ createUseReadContract({
		abi: erc721EnumerableAbi,
		functionName: "isApprovedForAll",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"name"`
 */
export const useReadErc721EnumerableName = /*#__PURE__*/ createUseReadContract({
	abi: erc721EnumerableAbi,
	functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadErc721EnumerableOwnerOf =
	/*#__PURE__*/ createUseReadContract({
		abi: erc721EnumerableAbi,
		functionName: "ownerOf",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadErc721EnumerableSupportsInterface =
	/*#__PURE__*/ createUseReadContract({
		abi: erc721EnumerableAbi,
		functionName: "supportsInterface",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc721EnumerableSymbol =
	/*#__PURE__*/ createUseReadContract({
		abi: erc721EnumerableAbi,
		functionName: "symbol",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"tokenByIndex"`
 */
export const useReadErc721EnumerableTokenByIndex =
	/*#__PURE__*/ createUseReadContract({
		abi: erc721EnumerableAbi,
		functionName: "tokenByIndex",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 */
export const useReadErc721EnumerableTokenOfOwnerByIndex =
	/*#__PURE__*/ createUseReadContract({
		abi: erc721EnumerableAbi,
		functionName: "tokenOfOwnerByIndex",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadErc721EnumerableTokenUri =
	/*#__PURE__*/ createUseReadContract({
		abi: erc721EnumerableAbi,
		functionName: "tokenURI",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc721EnumerableTotalSupply =
	/*#__PURE__*/ createUseReadContract({
		abi: erc721EnumerableAbi,
		functionName: "totalSupply",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721EnumerableAbi}__
 */
export const useWriteErc721EnumerableContract =
	/*#__PURE__*/ createUseWriteContract({ abi: erc721EnumerableAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc721EnumerableApprove =
	/*#__PURE__*/ createUseWriteContract({
		abi: erc721EnumerableAbi,
		functionName: "approve",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteErc721EnumerableSafeTransferFrom =
	/*#__PURE__*/ createUseWriteContract({
		abi: erc721EnumerableAbi,
		functionName: "safeTransferFrom",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteErc721EnumerableSetApprovalForAll =
	/*#__PURE__*/ createUseWriteContract({
		abi: erc721EnumerableAbi,
		functionName: "setApprovalForAll",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc721EnumerableTransferFrom =
	/*#__PURE__*/ createUseWriteContract({
		abi: erc721EnumerableAbi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721EnumerableAbi}__
 */
export const useSimulateErc721EnumerableContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: erc721EnumerableAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc721EnumerableApprove =
	/*#__PURE__*/ createUseSimulateContract({
		abi: erc721EnumerableAbi,
		functionName: "approve",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateErc721EnumerableSafeTransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: erc721EnumerableAbi,
		functionName: "safeTransferFrom",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateErc721EnumerableSetApprovalForAll =
	/*#__PURE__*/ createUseSimulateContract({
		abi: erc721EnumerableAbi,
		functionName: "setApprovalForAll",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc721EnumerableTransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: erc721EnumerableAbi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721EnumerableAbi}__
 */
export const useWatchErc721EnumerableContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: erc721EnumerableAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc721EnumerableApproval =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: erc721EnumerableAbi,
		eventName: "Approval",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchErc721EnumerableApprovalForAll =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: erc721EnumerableAbi,
		eventName: "ApprovalForAll",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc721EnumerableTransfer =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: erc721EnumerableAbi,
		eventName: "Transfer",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__
 */
export const useReadGachaContract = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"TOTAL_WEIGHT"`
 */
export const useReadGachaTotalWeight = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "TOTAL_WEIGHT",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadGachaUpgradeInterfaceVersion =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "UPGRADE_INTERFACE_VERSION",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"economyManager"`
 */
export const useReadGachaEconomyManager = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "economyManager",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"feeToken"`
 */
export const useReadGachaFeeToken = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "feeToken",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"feeTokenDecimals"`
 */
export const useReadGachaFeeTokenDecimals = /*#__PURE__*/ createUseReadContract(
	{ abi: gachaAbi, functionName: "feeTokenDecimals" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"feeTokenScalar"`
 */
export const useReadGachaFeeTokenScalar = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "feeTokenScalar",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"gachaServiceHandler"`
 */
export const useReadGachaGachaServiceHandler =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "gachaServiceHandler",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getAverageRarityValues"`
 */
export const useReadGachaGetAverageRarityValues =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "getAverageRarityValues",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getBatchSpinRequests"`
 */
export const useReadGachaGetBatchSpinRequests =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "getBatchSpinRequests",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getCurrentRarityWeights"`
 */
export const useReadGachaGetCurrentRarityWeights =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "getCurrentRarityWeights",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getCurrentSpinFee"`
 */
export const useReadGachaGetCurrentSpinFee =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "getCurrentSpinFee",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getExpectedValueUSD"`
 */
export const useReadGachaGetExpectedValueUsd =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "getExpectedValueUSD",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getGachaConfigBatch"`
 */
export const useReadGachaGetGachaConfigBatch =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "getGachaConfigBatch",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getGlobalAnalytics"`
 */
export const useReadGachaGetGlobalAnalytics =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "getGlobalAnalytics",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getNextTriggerId"`
 */
export const useReadGachaGetNextTriggerId = /*#__PURE__*/ createUseReadContract(
	{ abi: gachaAbi, functionName: "getNextTriggerId" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getSpinRequest"`
 */
export const useReadGachaGetSpinRequest = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "getSpinRequest",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getTargetRarityBps"`
 */
export const useReadGachaGetTargetRarityBps =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "getTargetRarityBps",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getTotalValueLocked"`
 */
export const useReadGachaGetTotalValueLocked =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "getTotalValueLocked",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getTreasuryAddress"`
 */
export const useReadGachaGetTreasuryAddress =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "getTreasuryAddress",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getTreasuryDistribution"`
 */
export const useReadGachaGetTreasuryDistribution =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "getTreasuryDistribution",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getUserAnalytics"`
 */
export const useReadGachaGetUserAnalytics = /*#__PURE__*/ createUseReadContract(
	{ abi: gachaAbi, functionName: "getUserAnalytics" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getUserGachaBatch"`
 */
export const useReadGachaGetUserGachaBatch =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "getUserGachaBatch",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getUserRarityWinCount"`
 */
export const useReadGachaGetUserRarityWinCount =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "getUserRarityWinCount",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getUserSpinCount"`
 */
export const useReadGachaGetUserSpinCount = /*#__PURE__*/ createUseReadContract(
	{ abi: gachaAbi, functionName: "getUserSpinCount" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"globalRarityWins"`
 */
export const useReadGachaGlobalRarityWins = /*#__PURE__*/ createUseReadContract(
	{ abi: gachaAbi, functionName: "globalRarityWins" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"maxSpinFee"`
 */
export const useReadGachaMaxSpinFee = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "maxSpinFee",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"minSpinFee"`
 */
export const useReadGachaMinSpinFee = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "minSpinFee",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"numRarities"`
 */
export const useReadGachaNumRarities = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "numRarities",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"owner"`
 */
export const useReadGachaOwner = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "owner",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"paused"`
 */
export const useReadGachaPaused = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "paused",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"pricingPremiumBps"`
 */
export const useReadGachaPricingPremiumBps =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "pricingPremiumBps",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadGachaProxiableUuid = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "proxiableUUID",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"spinRequests"`
 */
export const useReadGachaSpinRequests = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "spinRequests",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"spinTimeout"`
 */
export const useReadGachaSpinTimeout = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "spinTimeout",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"targetRarityBps"`
 */
export const useReadGachaTargetRarityBps = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "targetRarityBps",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"totalReclaimCount"`
 */
export const useReadGachaTotalReclaimCount =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaAbi,
		functionName: "totalReclaimCount",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"totalRefundCount"`
 */
export const useReadGachaTotalRefundCount = /*#__PURE__*/ createUseReadContract(
	{ abi: gachaAbi, functionName: "totalRefundCount" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"totalSpinCount"`
 */
export const useReadGachaTotalSpinCount = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "totalSpinCount",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadGachaTreasury = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "treasury",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"userRarityWins"`
 */
export const useReadGachaUserRarityWins = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "userRarityWins",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"userReclaimCount"`
 */
export const useReadGachaUserReclaimCount = /*#__PURE__*/ createUseReadContract(
	{ abi: gachaAbi, functionName: "userReclaimCount" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"userRefundCount"`
 */
export const useReadGachaUserRefundCount = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "userRefundCount",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"userSpinCount"`
 */
export const useReadGachaUserSpinCount = /*#__PURE__*/ createUseReadContract({
	abi: gachaAbi,
	functionName: "userSpinCount",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__
 */
export const useWriteGachaContract = /*#__PURE__*/ createUseWriteContract({
	abi: gachaAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useWriteGachaEmergencyPause = /*#__PURE__*/ createUseWriteContract(
	{ abi: gachaAbi, functionName: "emergencyPause" },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useWriteGachaEmergencyUnpause =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaAbi,
		functionName: "emergencyUnpause",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"fulfillRandomness"`
 */
export const useWriteGachaFulfillRandomness =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaAbi,
		functionName: "fulfillRandomness",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteGachaInitialize = /*#__PURE__*/ createUseWriteContract({
	abi: gachaAbi,
	functionName: "initialize",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"reclaimFailedSpin"`
 */
export const useWriteGachaReclaimFailedSpin =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaAbi,
		functionName: "reclaimFailedSpin",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteGachaRenounceOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setDynamicWeightsConfig"`
 */
export const useWriteGachaSetDynamicWeightsConfig =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaAbi,
		functionName: "setDynamicWeightsConfig",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setEconomyManager"`
 */
export const useWriteGachaSetEconomyManager =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaAbi,
		functionName: "setEconomyManager",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setFeeTokenDecimals"`
 */
export const useWriteGachaSetFeeTokenDecimals =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaAbi,
		functionName: "setFeeTokenDecimals",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setGachaServiceHandler"`
 */
export const useWriteGachaSetGachaServiceHandler =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaAbi,
		functionName: "setGachaServiceHandler",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setPricingConfig"`
 */
export const useWriteGachaSetPricingConfig =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaAbi,
		functionName: "setPricingConfig",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setSpinTimeout"`
 */
export const useWriteGachaSetSpinTimeout = /*#__PURE__*/ createUseWriteContract(
	{ abi: gachaAbi, functionName: "setSpinTimeout" },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"spin"`
 */
export const useWriteGachaSpin = /*#__PURE__*/ createUseWriteContract({
	abi: gachaAbi,
	functionName: "spin",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"spinWithPermit"`
 */
export const useWriteGachaSpinWithPermit = /*#__PURE__*/ createUseWriteContract(
	{ abi: gachaAbi, functionName: "spinWithPermit" },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteGachaTransferOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteGachaUpgradeToAndCall =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaAbi,
		functionName: "upgradeToAndCall",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__
 */
export const useSimulateGachaContract = /*#__PURE__*/ createUseSimulateContract(
	{ abi: gachaAbi },
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useSimulateGachaEmergencyPause =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaAbi,
		functionName: "emergencyPause",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useSimulateGachaEmergencyUnpause =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaAbi,
		functionName: "emergencyUnpause",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"fulfillRandomness"`
 */
export const useSimulateGachaFulfillRandomness =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaAbi,
		functionName: "fulfillRandomness",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateGachaInitialize =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaAbi,
		functionName: "initialize",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"reclaimFailedSpin"`
 */
export const useSimulateGachaReclaimFailedSpin =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaAbi,
		functionName: "reclaimFailedSpin",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateGachaRenounceOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setDynamicWeightsConfig"`
 */
export const useSimulateGachaSetDynamicWeightsConfig =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaAbi,
		functionName: "setDynamicWeightsConfig",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setEconomyManager"`
 */
export const useSimulateGachaSetEconomyManager =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaAbi,
		functionName: "setEconomyManager",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setFeeTokenDecimals"`
 */
export const useSimulateGachaSetFeeTokenDecimals =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaAbi,
		functionName: "setFeeTokenDecimals",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setGachaServiceHandler"`
 */
export const useSimulateGachaSetGachaServiceHandler =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaAbi,
		functionName: "setGachaServiceHandler",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setPricingConfig"`
 */
export const useSimulateGachaSetPricingConfig =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaAbi,
		functionName: "setPricingConfig",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setSpinTimeout"`
 */
export const useSimulateGachaSetSpinTimeout =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaAbi,
		functionName: "setSpinTimeout",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"spin"`
 */
export const useSimulateGachaSpin = /*#__PURE__*/ createUseSimulateContract({
	abi: gachaAbi,
	functionName: "spin",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"spinWithPermit"`
 */
export const useSimulateGachaSpinWithPermit =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaAbi,
		functionName: "spinWithPermit",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateGachaTransferOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateGachaUpgradeToAndCall =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaAbi,
		functionName: "upgradeToAndCall",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__
 */
export const useWatchGachaContract = /*#__PURE__*/ createUseWatchContractEvent({
	abi: gachaAbi,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"DynamicWeightsUpdated"`
 */
export const useWatchGachaDynamicWeightsUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "DynamicWeightsUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"EconomyManagerUpdated"`
 */
export const useWatchGachaEconomyManagerUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "EconomyManagerUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"EmergencyPause"`
 */
export const useWatchGachaEmergencyPause =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "EmergencyPause",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"EmergencyUnpause"`
 */
export const useWatchGachaEmergencyUnpause =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "EmergencyUnpause",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"FeeTokenDecimalsUpdated"`
 */
export const useWatchGachaFeeTokenDecimalsUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "FeeTokenDecimalsUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"GachaServiceHandlerUpdated"`
 */
export const useWatchGachaGachaServiceHandlerUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "GachaServiceHandlerUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchGachaInitialized =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "Initialized",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchGachaOwnershipTransferred =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "OwnershipTransferred",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchGachaPaused = /*#__PURE__*/ createUseWatchContractEvent({
	abi: gachaAbi,
	eventName: "Paused",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"PricingConfigUpdated"`
 */
export const useWatchGachaPricingConfigUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "PricingConfigUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"RandomnessRequested"`
 */
export const useWatchGachaRandomnessRequested =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "RandomnessRequested",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"SpinCompleted"`
 */
export const useWatchGachaSpinCompleted =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "SpinCompleted",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"SpinReclaimed"`
 */
export const useWatchGachaSpinReclaimed =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "SpinReclaimed",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"SpinRefunded"`
 */
export const useWatchGachaSpinRefunded =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "SpinRefunded",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"SpinRevenueForwarded"`
 */
export const useWatchGachaSpinRevenueForwarded =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "SpinRevenueForwarded",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"SpinStatusUpdate"`
 */
export const useWatchGachaSpinStatusUpdate =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "SpinStatusUpdate",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"SpinTimeoutUpdated"`
 */
export const useWatchGachaSpinTimeoutUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaAbi,
		eventName: "SpinTimeoutUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchGachaUnpaused = /*#__PURE__*/ createUseWatchContractEvent({
	abi: gachaAbi,
	eventName: "Unpaused",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchGachaUpgraded = /*#__PURE__*/ createUseWatchContractEvent({
	abi: gachaAbi,
	eventName: "Upgraded",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__
 */
export const useReadGachaEconomyManagerContract =
	/*#__PURE__*/ createUseReadContract({ abi: gachaEconomyManagerAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"BPS_DENOMINATOR"`
 */
export const useReadGachaEconomyManagerBpsDenominator =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "BPS_DENOMINATOR",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadGachaEconomyManagerUpgradeInterfaceVersion =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "UPGRADE_INTERFACE_VERSION",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"cardGroupedVault"`
 */
export const useReadGachaEconomyManagerCardGroupedVault =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "cardGroupedVault",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"depositorShareBps"`
 */
export const useReadGachaEconomyManagerDepositorShareBps =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "depositorShareBps",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"feeToken"`
 */
export const useReadGachaEconomyManagerFeeToken =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "feeToken",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"gacha"`
 */
export const useReadGachaEconomyManagerGacha =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "gacha",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"numRarities"`
 */
export const useReadGachaEconomyManagerNumRarities =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "numRarities",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"owner"`
 */
export const useReadGachaEconomyManagerOwner =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "owner",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"paused"`
 */
export const useReadGachaEconomyManagerPaused =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "paused",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"protocolShareBps"`
 */
export const useReadGachaEconomyManagerProtocolShareBps =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "protocolShareBps",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"protocolTreasury"`
 */
export const useReadGachaEconomyManagerProtocolTreasury =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "protocolTreasury",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadGachaEconomyManagerProxiableUuid =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "proxiableUUID",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"queuedYieldByRarity"`
 */
export const useReadGachaEconomyManagerQueuedYieldByRarity =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "queuedYieldByRarity",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"revenueByRarity"`
 */
export const useReadGachaEconomyManagerRevenueByRarity =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "revenueByRarity",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"totalQueuedYield"`
 */
export const useReadGachaEconomyManagerTotalQueuedYield =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "totalQueuedYield",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"totalQueuedYieldReleased"`
 */
export const useReadGachaEconomyManagerTotalQueuedYieldReleased =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "totalQueuedYieldReleased",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"totalRevenueProcessed"`
 */
export const useReadGachaEconomyManagerTotalRevenueProcessed =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "totalRevenueProcessed",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"totalToDepositors"`
 */
export const useReadGachaEconomyManagerTotalToDepositors =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "totalToDepositors",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"totalToProtocol"`
 */
export const useReadGachaEconomyManagerTotalToProtocol =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerAbi,
		functionName: "totalToProtocol",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__
 */
export const useWriteGachaEconomyManagerContract =
	/*#__PURE__*/ createUseWriteContract({ abi: gachaEconomyManagerAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteGachaEconomyManagerInitialize =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerAbi,
		functionName: "initialize",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"onSpinRevenue"`
 */
export const useWriteGachaEconomyManagerOnSpinRevenue =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerAbi,
		functionName: "onSpinRevenue",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteGachaEconomyManagerPause =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerAbi,
		functionName: "pause",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteGachaEconomyManagerRenounceOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setFeeToken"`
 */
export const useWriteGachaEconomyManagerSetFeeToken =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerAbi,
		functionName: "setFeeToken",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setGacha"`
 */
export const useWriteGachaEconomyManagerSetGacha =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerAbi,
		functionName: "setGacha",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setRevenueSplit"`
 */
export const useWriteGachaEconomyManagerSetRevenueSplit =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerAbi,
		functionName: "setRevenueSplit",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setVaults"`
 */
export const useWriteGachaEconomyManagerSetVaults =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerAbi,
		functionName: "setVaults",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteGachaEconomyManagerTransferOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteGachaEconomyManagerUnpause =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerAbi,
		functionName: "unpause",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteGachaEconomyManagerUpgradeToAndCall =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerAbi,
		functionName: "upgradeToAndCall",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__
 */
export const useSimulateGachaEconomyManagerContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: gachaEconomyManagerAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateGachaEconomyManagerInitialize =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerAbi,
		functionName: "initialize",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"onSpinRevenue"`
 */
export const useSimulateGachaEconomyManagerOnSpinRevenue =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerAbi,
		functionName: "onSpinRevenue",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateGachaEconomyManagerPause =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerAbi,
		functionName: "pause",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateGachaEconomyManagerRenounceOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setFeeToken"`
 */
export const useSimulateGachaEconomyManagerSetFeeToken =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerAbi,
		functionName: "setFeeToken",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setGacha"`
 */
export const useSimulateGachaEconomyManagerSetGacha =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerAbi,
		functionName: "setGacha",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setRevenueSplit"`
 */
export const useSimulateGachaEconomyManagerSetRevenueSplit =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerAbi,
		functionName: "setRevenueSplit",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setVaults"`
 */
export const useSimulateGachaEconomyManagerSetVaults =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerAbi,
		functionName: "setVaults",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateGachaEconomyManagerTransferOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateGachaEconomyManagerUnpause =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerAbi,
		functionName: "unpause",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateGachaEconomyManagerUpgradeToAndCall =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerAbi,
		functionName: "upgradeToAndCall",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__
 */
export const useWatchGachaEconomyManagerContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: gachaEconomyManagerAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"CardGroupedVaultUpdated"`
 */
export const useWatchGachaEconomyManagerCardGroupedVaultUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerAbi,
		eventName: "CardGroupedVaultUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"DepositorYieldQueued"`
 */
export const useWatchGachaEconomyManagerDepositorYieldQueued =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerAbi,
		eventName: "DepositorYieldQueued",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"FeeTokenUpdated"`
 */
export const useWatchGachaEconomyManagerFeeTokenUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerAbi,
		eventName: "FeeTokenUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"GachaUpdated"`
 */
export const useWatchGachaEconomyManagerGachaUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerAbi,
		eventName: "GachaUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchGachaEconomyManagerInitialized =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerAbi,
		eventName: "Initialized",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchGachaEconomyManagerOwnershipTransferred =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerAbi,
		eventName: "OwnershipTransferred",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchGachaEconomyManagerPaused =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerAbi,
		eventName: "Paused",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"ProtocolTreasuryUpdated"`
 */
export const useWatchGachaEconomyManagerProtocolTreasuryUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerAbi,
		eventName: "ProtocolTreasuryUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"QueuedDepositorYieldProcessed"`
 */
export const useWatchGachaEconomyManagerQueuedDepositorYieldProcessed =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerAbi,
		eventName: "QueuedDepositorYieldProcessed",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"RevenueSplitUpdated"`
 */
export const useWatchGachaEconomyManagerRevenueSplitUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerAbi,
		eventName: "RevenueSplitUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"SpinRevenueReceived"`
 */
export const useWatchGachaEconomyManagerSpinRevenueReceived =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerAbi,
		eventName: "SpinRevenueReceived",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchGachaEconomyManagerUnpaused =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerAbi,
		eventName: "Unpaused",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchGachaEconomyManagerUpgraded =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerAbi,
		eventName: "Upgraded",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__
 */
export const useReadGachaEconomyManagerFuzzContract =
	/*#__PURE__*/ createUseReadContract({ abi: gachaEconomyManagerFuzzAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"IS_TEST"`
 */
export const useReadGachaEconomyManagerFuzzIsTest =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "IS_TEST",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"excludeArtifacts"`
 */
export const useReadGachaEconomyManagerFuzzExcludeArtifacts =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "excludeArtifacts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"excludeContracts"`
 */
export const useReadGachaEconomyManagerFuzzExcludeContracts =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "excludeContracts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"excludeSelectors"`
 */
export const useReadGachaEconomyManagerFuzzExcludeSelectors =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "excludeSelectors",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"excludeSenders"`
 */
export const useReadGachaEconomyManagerFuzzExcludeSenders =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "excludeSenders",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"failed"`
 */
export const useReadGachaEconomyManagerFuzzFailed =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "failed",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"targetArtifactSelectors"`
 */
export const useReadGachaEconomyManagerFuzzTargetArtifactSelectors =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "targetArtifactSelectors",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"targetArtifacts"`
 */
export const useReadGachaEconomyManagerFuzzTargetArtifacts =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "targetArtifacts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"targetContracts"`
 */
export const useReadGachaEconomyManagerFuzzTargetContracts =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "targetContracts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"targetInterfaces"`
 */
export const useReadGachaEconomyManagerFuzzTargetInterfaces =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "targetInterfaces",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"targetSelectors"`
 */
export const useReadGachaEconomyManagerFuzzTargetSelectors =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "targetSelectors",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"targetSenders"`
 */
export const useReadGachaEconomyManagerFuzzTargetSenders =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "targetSenders",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__
 */
export const useWriteGachaEconomyManagerFuzzContract =
	/*#__PURE__*/ createUseWriteContract({ abi: gachaEconomyManagerFuzzAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"setUp"`
 */
export const useWriteGachaEconomyManagerFuzzSetUp =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "setUp",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"testFuzz_PausedContractRejectsRevenue"`
 */
export const useWriteGachaEconomyManagerFuzzTestFuzzPausedContractRejectsRevenue =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "testFuzz_PausedContractRejectsRevenue",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"testFuzz_UnauthorizedCaller_Fails"`
 */
export const useWriteGachaEconomyManagerFuzzTestFuzzUnauthorizedCallerFails =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "testFuzz_UnauthorizedCaller_Fails",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"testFuzz_UpdateShareBps"`
 */
export const useWriteGachaEconomyManagerFuzzTestFuzzUpdateShareBps =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "testFuzz_UpdateShareBps",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"testFuzz_ZeroRevenue_Fails"`
 */
export const useWriteGachaEconomyManagerFuzzTestFuzzZeroRevenueFails =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "testFuzz_ZeroRevenue_Fails",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__
 */
export const useSimulateGachaEconomyManagerFuzzContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: gachaEconomyManagerFuzzAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"setUp"`
 */
export const useSimulateGachaEconomyManagerFuzzSetUp =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "setUp",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"testFuzz_PausedContractRejectsRevenue"`
 */
export const useSimulateGachaEconomyManagerFuzzTestFuzzPausedContractRejectsRevenue =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "testFuzz_PausedContractRejectsRevenue",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"testFuzz_UnauthorizedCaller_Fails"`
 */
export const useSimulateGachaEconomyManagerFuzzTestFuzzUnauthorizedCallerFails =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "testFuzz_UnauthorizedCaller_Fails",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"testFuzz_UpdateShareBps"`
 */
export const useSimulateGachaEconomyManagerFuzzTestFuzzUpdateShareBps =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "testFuzz_UpdateShareBps",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `functionName` set to `"testFuzz_ZeroRevenue_Fails"`
 */
export const useSimulateGachaEconomyManagerFuzzTestFuzzZeroRevenueFails =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaEconomyManagerFuzzAbi,
		functionName: "testFuzz_ZeroRevenue_Fails",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__
 */
export const useWatchGachaEconomyManagerFuzzContract =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log"`
 */
export const useWatchGachaEconomyManagerFuzzLog =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_address"`
 */
export const useWatchGachaEconomyManagerFuzzLogAddress =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_address",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_array"`
 */
export const useWatchGachaEconomyManagerFuzzLogArray =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_array",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_bytes"`
 */
export const useWatchGachaEconomyManagerFuzzLogBytes =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_bytes",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_bytes32"`
 */
export const useWatchGachaEconomyManagerFuzzLogBytes32 =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_bytes32",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_int"`
 */
export const useWatchGachaEconomyManagerFuzzLogInt =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_int",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_named_address"`
 */
export const useWatchGachaEconomyManagerFuzzLogNamedAddress =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_named_address",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_named_array"`
 */
export const useWatchGachaEconomyManagerFuzzLogNamedArray =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_named_array",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_named_bytes"`
 */
export const useWatchGachaEconomyManagerFuzzLogNamedBytes =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_named_bytes",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_named_bytes32"`
 */
export const useWatchGachaEconomyManagerFuzzLogNamedBytes32 =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_named_bytes32",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_named_decimal_int"`
 */
export const useWatchGachaEconomyManagerFuzzLogNamedDecimalInt =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_named_decimal_int",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_named_decimal_uint"`
 */
export const useWatchGachaEconomyManagerFuzzLogNamedDecimalUint =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_named_decimal_uint",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_named_int"`
 */
export const useWatchGachaEconomyManagerFuzzLogNamedInt =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_named_int",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_named_string"`
 */
export const useWatchGachaEconomyManagerFuzzLogNamedString =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_named_string",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_named_uint"`
 */
export const useWatchGachaEconomyManagerFuzzLogNamedUint =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_named_uint",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_string"`
 */
export const useWatchGachaEconomyManagerFuzzLogString =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_string",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"log_uint"`
 */
export const useWatchGachaEconomyManagerFuzzLogUint =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "log_uint",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerFuzzAbi}__ and `eventName` set to `"logs"`
 */
export const useWatchGachaEconomyManagerFuzzLogs =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaEconomyManagerFuzzAbi,
		eventName: "logs",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__
 */
export const useReadGachaServiceHandlerContract =
	/*#__PURE__*/ createUseReadContract({ abi: gachaServiceHandlerAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__ and `functionName` set to `"getGacha"`
 */
export const useReadGachaServiceHandlerGetGacha =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaServiceHandlerAbi,
		functionName: "getGacha",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__ and `functionName` set to `"getGachaTreasury"`
 */
export const useReadGachaServiceHandlerGetGachaTreasury =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaServiceHandlerAbi,
		functionName: "getGachaTreasury",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__ and `functionName` set to `"getServiceManager"`
 */
export const useReadGachaServiceHandlerGetServiceManager =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaServiceHandlerAbi,
		functionName: "getServiceManager",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__
 */
export const useWriteGachaServiceHandlerContract =
	/*#__PURE__*/ createUseWriteContract({ abi: gachaServiceHandlerAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__ and `functionName` set to `"handleSignedEnvelope"`
 */
export const useWriteGachaServiceHandlerHandleSignedEnvelope =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaServiceHandlerAbi,
		functionName: "handleSignedEnvelope",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__
 */
export const useSimulateGachaServiceHandlerContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: gachaServiceHandlerAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__ and `functionName` set to `"handleSignedEnvelope"`
 */
export const useSimulateGachaServiceHandlerHandleSignedEnvelope =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaServiceHandlerAbi,
		functionName: "handleSignedEnvelope",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaServiceHandlerAbi}__
 */
export const useWatchGachaServiceHandlerContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: gachaServiceHandlerAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaServiceHandlerAbi}__ and `eventName` set to `"RandomnessReceived"`
 */
export const useWatchGachaServiceHandlerRandomnessReceived =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaServiceHandlerAbi,
		eventName: "RandomnessReceived",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__
 */
export const useReadGachaTreasuryContract = /*#__PURE__*/ createUseReadContract(
	{ abi: gachaTreasuryAbi },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"MAX_BATCH_DEPOSIT"`
 */
export const useReadGachaTreasuryMaxBatchDeposit =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "MAX_BATCH_DEPOSIT",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"MAX_BATCH_WITHDRAW"`
 */
export const useReadGachaTreasuryMaxBatchWithdraw =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "MAX_BATCH_WITHDRAW",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"MAX_MIGRATION_BATCH"`
 */
export const useReadGachaTreasuryMaxMigrationBatch =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "MAX_MIGRATION_BATCH",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadGachaTreasuryUpgradeInterfaceVersion =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "UPGRADE_INTERFACE_VERSION",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"appraisalContract"`
 */
export const useReadGachaTreasuryAppraisalContract =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "appraisalContract",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"cardGroupedVault"`
 */
export const useReadGachaTreasuryCardGroupedVault =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "cardGroupedVault",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"cardTotalDeposits"`
 */
export const useReadGachaTreasuryCardTotalDeposits =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "cardTotalDeposits",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"depositedNFTs"`
 */
export const useReadGachaTreasuryDepositedNfTs =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "depositedNFTs",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"gachaContract"`
 */
export const useReadGachaTreasuryGachaContract =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "gachaContract",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getAllPriceRanges"`
 */
export const useReadGachaTreasuryGetAllPriceRanges =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getAllPriceRanges",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getAllRarityCounts"`
 */
export const useReadGachaTreasuryGetAllRarityCounts =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getAllRarityCounts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getAllRarityTotalValues"`
 */
export const useReadGachaTreasuryGetAllRarityTotalValues =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getAllRarityTotalValues",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getCardTotalDeposits"`
 */
export const useReadGachaTreasuryGetCardTotalDeposits =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getCardTotalDeposits",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getGlobalStats"`
 */
export const useReadGachaTreasuryGetGlobalStats =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getGlobalStats",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getNFTCurrentRarity"`
 */
export const useReadGachaTreasuryGetNftCurrentRarity =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getNFTCurrentRarity",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getNFTReceiveTime"`
 */
export const useReadGachaTreasuryGetNftReceiveTime =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getNFTReceiveTime",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getNFTRedemptionDeadline"`
 */
export const useReadGachaTreasuryGetNftRedemptionDeadline =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getNFTRedemptionDeadline",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getNumRarities"`
 */
export const useReadGachaTreasuryGetNumRarities =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getNumRarities",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getPlatformOverviewBatch"`
 */
export const useReadGachaTreasuryGetPlatformOverviewBatch =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getPlatformOverviewBatch",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getPriceRange"`
 */
export const useReadGachaTreasuryGetPriceRange =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getPriceRange",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getRarityByPrice"`
 */
export const useReadGachaTreasuryGetRarityByPrice =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getRarityByPrice",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getRarityCount"`
 */
export const useReadGachaTreasuryGetRarityCount =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getRarityCount",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getRarityName"`
 */
export const useReadGachaTreasuryGetRarityName =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getRarityName",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getRarityNames"`
 */
export const useReadGachaTreasuryGetRarityNames =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getRarityNames",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getRarityTotalValue"`
 */
export const useReadGachaTreasuryGetRarityTotalValue =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getRarityTotalValue",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getTotalItemsCount"`
 */
export const useReadGachaTreasuryGetTotalItemsCount =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getTotalItemsCount",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getTreasuryItem"`
 */
export const useReadGachaTreasuryGetTreasuryItem =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getTreasuryItem",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getTreasuryItems"`
 */
export const useReadGachaTreasuryGetTreasuryItems =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getTreasuryItems",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserAllDepositCounts"`
 */
export const useReadGachaTreasuryGetUserAllDepositCounts =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getUserAllDepositCounts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserAllDepositValues"`
 */
export const useReadGachaTreasuryGetUserAllDepositValues =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getUserAllDepositValues",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserCardDepositsPage"`
 */
export const useReadGachaTreasuryGetUserCardDepositsPage =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getUserCardDepositsPage",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserCardIds"`
 */
export const useReadGachaTreasuryGetUserCardIds =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getUserCardIds",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserCardIdsLength"`
 */
export const useReadGachaTreasuryGetUserCardIdsLength =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getUserCardIdsLength",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserDepositCount"`
 */
export const useReadGachaTreasuryGetUserDepositCount =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getUserDepositCount",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserDepositValue"`
 */
export const useReadGachaTreasuryGetUserDepositValue =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getUserDepositValue",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserDepositedNFTs"`
 */
export const useReadGachaTreasuryGetUserDepositedNfTs =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getUserDepositedNFTs",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserDepositedNFTsByCardIdPaginated"`
 */
export const useReadGachaTreasuryGetUserDepositedNfTsByCardIdPaginated =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getUserDepositedNFTsByCardIdPaginated",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserDepositedNFTsPaginated"`
 */
export const useReadGachaTreasuryGetUserDepositedNfTsPaginated =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getUserDepositedNFTsPaginated",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserLifetimeClaimed"`
 */
export const useReadGachaTreasuryGetUserLifetimeClaimed =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getUserLifetimeClaimed",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserLifetimeDeposited"`
 */
export const useReadGachaTreasuryGetUserLifetimeDeposited =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getUserLifetimeDeposited",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserLifetimeWithdrawn"`
 */
export const useReadGachaTreasuryGetUserLifetimeWithdrawn =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getUserLifetimeWithdrawn",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserProfileBatch"`
 */
export const useReadGachaTreasuryGetUserProfileBatch =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getUserProfileBatch",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserTotalDepositCount"`
 */
export const useReadGachaTreasuryGetUserTotalDepositCount =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getUserTotalDepositCount",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getWhitelistLength"`
 */
export const useReadGachaTreasuryGetWhitelistLength =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getWhitelistLength",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getWhitelistedCollections"`
 */
export const useReadGachaTreasuryGetWhitelistedCollections =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "getWhitelistedCollections",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"globalLifetimeClaimed"`
 */
export const useReadGachaTreasuryGlobalLifetimeClaimed =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "globalLifetimeClaimed",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"globalLifetimeDeposited"`
 */
export const useReadGachaTreasuryGlobalLifetimeDeposited =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "globalLifetimeDeposited",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"isCollectionWhitelisted"`
 */
export const useReadGachaTreasuryIsCollectionWhitelisted =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "isCollectionWhitelisted",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"isGachaAvailable"`
 */
export const useReadGachaTreasuryIsGachaAvailable =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "isGachaAvailable",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"isNFTDeposited"`
 */
export const useReadGachaTreasuryIsNftDeposited =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "isNFTDeposited",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"maxDepositsPerCard"`
 */
export const useReadGachaTreasuryMaxDepositsPerCard =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "maxDepositsPerCard",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"nftCurrentRarity"`
 */
export const useReadGachaTreasuryNftCurrentRarity =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "nftCurrentRarity",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"nftReceiveTimes"`
 */
export const useReadGachaTreasuryNftReceiveTimes =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "nftReceiveTimes",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"nftRedemptionDeadlines"`
 */
export const useReadGachaTreasuryNftRedemptionDeadlines =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "nftRedemptionDeadlines",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"nftToTreasuryIndex"`
 */
export const useReadGachaTreasuryNftToTreasuryIndex =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "nftToTreasuryIndex",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"numRarities"`
 */
export const useReadGachaTreasuryNumRarities =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "numRarities",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useReadGachaTreasuryOnErc721Received =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "onERC721Received",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"owner"`
 */
export const useReadGachaTreasuryOwner = /*#__PURE__*/ createUseReadContract({
	abi: gachaTreasuryAbi,
	functionName: "owner",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"paused"`
 */
export const useReadGachaTreasuryPaused = /*#__PURE__*/ createUseReadContract({
	abi: gachaTreasuryAbi,
	functionName: "paused",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"priceRanges"`
 */
export const useReadGachaTreasuryPriceRanges =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "priceRanges",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"priceRangesSet"`
 */
export const useReadGachaTreasuryPriceRangesSet =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "priceRangesSet",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"protocolTreasury"`
 */
export const useReadGachaTreasuryProtocolTreasury =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "protocolTreasury",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadGachaTreasuryProxiableUuid =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "proxiableUUID",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"rarityCount"`
 */
export const useReadGachaTreasuryRarityCount =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "rarityCount",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"rarityNames"`
 */
export const useReadGachaTreasuryRarityNames =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "rarityNames",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"totalRarityValue"`
 */
export const useReadGachaTreasuryTotalRarityValue =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "totalRarityValue",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadGachaTreasuryTreasury = /*#__PURE__*/ createUseReadContract(
	{ abi: gachaTreasuryAbi, functionName: "treasury" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userCardDeposits"`
 */
export const useReadGachaTreasuryUserCardDeposits =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "userCardDeposits",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userDepositCounts"`
 */
export const useReadGachaTreasuryUserDepositCounts =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "userDepositCounts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userDepositValues"`
 */
export const useReadGachaTreasuryUserDepositValues =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "userDepositValues",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userLifetimeClaimed"`
 */
export const useReadGachaTreasuryUserLifetimeClaimed =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "userLifetimeClaimed",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userLifetimeDeposited"`
 */
export const useReadGachaTreasuryUserLifetimeDeposited =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "userLifetimeDeposited",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userLifetimeWithdrawn"`
 */
export const useReadGachaTreasuryUserLifetimeWithdrawn =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "userLifetimeWithdrawn",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userTotalDeposits"`
 */
export const useReadGachaTreasuryUserTotalDeposits =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "userTotalDeposits",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"whitelistedCollections"`
 */
export const useReadGachaTreasuryWhitelistedCollections =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "whitelistedCollections",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"whitelistedCollectionsList"`
 */
export const useReadGachaTreasuryWhitelistedCollectionsList =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryAbi,
		functionName: "whitelistedCollectionsList",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__
 */
export const useWriteGachaTreasuryContract =
	/*#__PURE__*/ createUseWriteContract({ abi: gachaTreasuryAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"addToWhitelist"`
 */
export const useWriteGachaTreasuryAddToWhitelist =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "addToWhitelist",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"batchDepositNFT"`
 */
export const useWriteGachaTreasuryBatchDepositNft =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "batchDepositNFT",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"batchMigrateNFTRarity"`
 */
export const useWriteGachaTreasuryBatchMigrateNftRarity =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "batchMigrateNFTRarity",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"depositNFT"`
 */
export const useWriteGachaTreasuryDepositNft =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "depositNFT",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useWriteGachaTreasuryEmergencyPause =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "emergencyPause",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useWriteGachaTreasuryEmergencyUnpause =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "emergencyUnpause",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"handleRedemptionReturn"`
 */
export const useWriteGachaTreasuryHandleRedemptionReturn =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "handleRedemptionReturn",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteGachaTreasuryInitialize =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "initialize",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"migrateNFTRarity"`
 */
export const useWriteGachaTreasuryMigrateNftRarity =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "migrateNFTRarity",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"onCardPriceUpdated"`
 */
export const useWriteGachaTreasuryOnCardPriceUpdated =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "onCardPriceUpdated",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"recordYieldClaim"`
 */
export const useWriteGachaTreasuryRecordYieldClaim =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "recordYieldClaim",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"removeFromWhitelist"`
 */
export const useWriteGachaTreasuryRemoveFromWhitelist =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "removeFromWhitelist",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteGachaTreasuryRenounceOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"sendRandomNFTToWinner"`
 */
export const useWriteGachaTreasurySendRandomNftToWinner =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "sendRandomNFTToWinner",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setAppraisalContract"`
 */
export const useWriteGachaTreasurySetAppraisalContract =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "setAppraisalContract",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setCardGroupedVault"`
 */
export const useWriteGachaTreasurySetCardGroupedVault =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "setCardGroupedVault",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setGachaContract"`
 */
export const useWriteGachaTreasurySetGachaContract =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "setGachaContract",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setMaxDepositsPerCard"`
 */
export const useWriteGachaTreasurySetMaxDepositsPerCard =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "setMaxDepositsPerCard",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setProtocolTreasury"`
 */
export const useWriteGachaTreasurySetProtocolTreasury =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "setProtocolTreasury",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteGachaTreasuryTransferOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteGachaTreasuryUpgradeToAndCall =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "upgradeToAndCall",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"withdrawMyNFT"`
 */
export const useWriteGachaTreasuryWithdrawMyNft =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryAbi,
		functionName: "withdrawMyNFT",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__
 */
export const useSimulateGachaTreasuryContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: gachaTreasuryAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"addToWhitelist"`
 */
export const useSimulateGachaTreasuryAddToWhitelist =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "addToWhitelist",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"batchDepositNFT"`
 */
export const useSimulateGachaTreasuryBatchDepositNft =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "batchDepositNFT",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"batchMigrateNFTRarity"`
 */
export const useSimulateGachaTreasuryBatchMigrateNftRarity =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "batchMigrateNFTRarity",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"depositNFT"`
 */
export const useSimulateGachaTreasuryDepositNft =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "depositNFT",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useSimulateGachaTreasuryEmergencyPause =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "emergencyPause",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useSimulateGachaTreasuryEmergencyUnpause =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "emergencyUnpause",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"handleRedemptionReturn"`
 */
export const useSimulateGachaTreasuryHandleRedemptionReturn =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "handleRedemptionReturn",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateGachaTreasuryInitialize =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "initialize",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"migrateNFTRarity"`
 */
export const useSimulateGachaTreasuryMigrateNftRarity =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "migrateNFTRarity",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"onCardPriceUpdated"`
 */
export const useSimulateGachaTreasuryOnCardPriceUpdated =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "onCardPriceUpdated",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"recordYieldClaim"`
 */
export const useSimulateGachaTreasuryRecordYieldClaim =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "recordYieldClaim",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"removeFromWhitelist"`
 */
export const useSimulateGachaTreasuryRemoveFromWhitelist =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "removeFromWhitelist",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateGachaTreasuryRenounceOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"sendRandomNFTToWinner"`
 */
export const useSimulateGachaTreasurySendRandomNftToWinner =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "sendRandomNFTToWinner",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setAppraisalContract"`
 */
export const useSimulateGachaTreasurySetAppraisalContract =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "setAppraisalContract",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setCardGroupedVault"`
 */
export const useSimulateGachaTreasurySetCardGroupedVault =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "setCardGroupedVault",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setGachaContract"`
 */
export const useSimulateGachaTreasurySetGachaContract =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "setGachaContract",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setMaxDepositsPerCard"`
 */
export const useSimulateGachaTreasurySetMaxDepositsPerCard =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "setMaxDepositsPerCard",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setProtocolTreasury"`
 */
export const useSimulateGachaTreasurySetProtocolTreasury =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "setProtocolTreasury",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateGachaTreasuryTransferOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateGachaTreasuryUpgradeToAndCall =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "upgradeToAndCall",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"withdrawMyNFT"`
 */
export const useSimulateGachaTreasuryWithdrawMyNft =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryAbi,
		functionName: "withdrawMyNFT",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__
 */
export const useWatchGachaTreasuryContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: gachaTreasuryAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"AppraisalContractUpdated"`
 */
export const useWatchGachaTreasuryAppraisalContractUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "AppraisalContractUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"BatchDeposited"`
 */
export const useWatchGachaTreasuryBatchDeposited =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "BatchDeposited",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"BatchWithdrawn"`
 */
export const useWatchGachaTreasuryBatchWithdrawn =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "BatchWithdrawn",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"CardGroupedVaultUpdated"`
 */
export const useWatchGachaTreasuryCardGroupedVaultUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "CardGroupedVaultUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"CollectionRemovedFromWhitelist"`
 */
export const useWatchGachaTreasuryCollectionRemovedFromWhitelist =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "CollectionRemovedFromWhitelist",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"CollectionWhitelisted"`
 */
export const useWatchGachaTreasuryCollectionWhitelisted =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "CollectionWhitelisted",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"GachaContractUpdated"`
 */
export const useWatchGachaTreasuryGachaContractUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "GachaContractUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchGachaTreasuryInitialized =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "Initialized",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"NFTDeposited"`
 */
export const useWatchGachaTreasuryNftDeposited =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "NFTDeposited",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"NFTWithdrawn"`
 */
export const useWatchGachaTreasuryNftWithdrawn =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "NFTWithdrawn",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchGachaTreasuryOwnershipTransferred =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "OwnershipTransferred",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchGachaTreasuryPaused =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "Paused",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"ProtocolTreasuryUpdated"`
 */
export const useWatchGachaTreasuryProtocolTreasuryUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "ProtocolTreasuryUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"RarityMigrated"`
 */
export const useWatchGachaTreasuryRarityMigrated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "RarityMigrated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"RedemptionRestocked"`
 */
export const useWatchGachaTreasuryRedemptionRestocked =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "RedemptionRestocked",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchGachaTreasuryUnpaused =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "Unpaused",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchGachaTreasuryUpgraded =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "Upgraded",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"YieldClaimRecorded"`
 */
export const useWatchGachaTreasuryYieldClaimRecorded =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryAbi,
		eventName: "YieldClaimRecorded",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__
 */
export const useReadGachaTreasuryFuzzContract =
	/*#__PURE__*/ createUseReadContract({ abi: gachaTreasuryFuzzAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"IS_TEST"`
 */
export const useReadGachaTreasuryFuzzIsTest =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "IS_TEST",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"appraisal"`
 */
export const useReadGachaTreasuryFuzzAppraisal =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "appraisal",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"depositors"`
 */
export const useReadGachaTreasuryFuzzDepositors =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "depositors",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"excludeArtifacts"`
 */
export const useReadGachaTreasuryFuzzExcludeArtifacts =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "excludeArtifacts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"excludeContracts"`
 */
export const useReadGachaTreasuryFuzzExcludeContracts =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "excludeContracts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"excludeSelectors"`
 */
export const useReadGachaTreasuryFuzzExcludeSelectors =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "excludeSelectors",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"excludeSenders"`
 */
export const useReadGachaTreasuryFuzzExcludeSenders =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "excludeSenders",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"failed"`
 */
export const useReadGachaTreasuryFuzzFailed =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "failed",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"mockTreasury"`
 */
export const useReadGachaTreasuryFuzzMockTreasury =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "mockTreasury",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"nftCollection"`
 */
export const useReadGachaTreasuryFuzzNftCollection =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "nftCollection",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"owner"`
 */
export const useReadGachaTreasuryFuzzOwner =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "owner",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"targetArtifactSelectors"`
 */
export const useReadGachaTreasuryFuzzTargetArtifactSelectors =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "targetArtifactSelectors",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"targetArtifacts"`
 */
export const useReadGachaTreasuryFuzzTargetArtifacts =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "targetArtifacts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"targetContracts"`
 */
export const useReadGachaTreasuryFuzzTargetContracts =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "targetContracts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"targetInterfaces"`
 */
export const useReadGachaTreasuryFuzzTargetInterfaces =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "targetInterfaces",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"targetSelectors"`
 */
export const useReadGachaTreasuryFuzzTargetSelectors =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "targetSelectors",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"targetSenders"`
 */
export const useReadGachaTreasuryFuzzTargetSenders =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "targetSenders",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"testFuzz_RarityAssignment"`
 */
export const useReadGachaTreasuryFuzzTestFuzzRarityAssignment =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "testFuzz_RarityAssignment",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadGachaTreasuryFuzzTreasury =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "treasury",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"usdc"`
 */
export const useReadGachaTreasuryFuzzUsdc = /*#__PURE__*/ createUseReadContract(
	{ abi: gachaTreasuryFuzzAbi, functionName: "usdc" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"vault"`
 */
export const useReadGachaTreasuryFuzzVault =
	/*#__PURE__*/ createUseReadContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "vault",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__
 */
export const useWriteGachaTreasuryFuzzContract =
	/*#__PURE__*/ createUseWriteContract({ abi: gachaTreasuryFuzzAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"setUp"`
 */
export const useWriteGachaTreasuryFuzzSetUp =
	/*#__PURE__*/ createUseWriteContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "setUp",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__
 */
export const useSimulateGachaTreasuryFuzzContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: gachaTreasuryFuzzAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `functionName` set to `"setUp"`
 */
export const useSimulateGachaTreasuryFuzzSetUp =
	/*#__PURE__*/ createUseSimulateContract({
		abi: gachaTreasuryFuzzAbi,
		functionName: "setUp",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__
 */
export const useWatchGachaTreasuryFuzzContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: gachaTreasuryFuzzAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log"`
 */
export const useWatchGachaTreasuryFuzzLog =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_address"`
 */
export const useWatchGachaTreasuryFuzzLogAddress =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_address",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_array"`
 */
export const useWatchGachaTreasuryFuzzLogArray =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_array",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_bytes"`
 */
export const useWatchGachaTreasuryFuzzLogBytes =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_bytes",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_bytes32"`
 */
export const useWatchGachaTreasuryFuzzLogBytes32 =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_bytes32",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_int"`
 */
export const useWatchGachaTreasuryFuzzLogInt =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_int",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_named_address"`
 */
export const useWatchGachaTreasuryFuzzLogNamedAddress =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_named_address",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_named_array"`
 */
export const useWatchGachaTreasuryFuzzLogNamedArray =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_named_array",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_named_bytes"`
 */
export const useWatchGachaTreasuryFuzzLogNamedBytes =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_named_bytes",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_named_bytes32"`
 */
export const useWatchGachaTreasuryFuzzLogNamedBytes32 =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_named_bytes32",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_named_decimal_int"`
 */
export const useWatchGachaTreasuryFuzzLogNamedDecimalInt =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_named_decimal_int",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_named_decimal_uint"`
 */
export const useWatchGachaTreasuryFuzzLogNamedDecimalUint =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_named_decimal_uint",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_named_int"`
 */
export const useWatchGachaTreasuryFuzzLogNamedInt =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_named_int",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_named_string"`
 */
export const useWatchGachaTreasuryFuzzLogNamedString =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_named_string",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_named_uint"`
 */
export const useWatchGachaTreasuryFuzzLogNamedUint =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_named_uint",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_string"`
 */
export const useWatchGachaTreasuryFuzzLogString =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_string",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"log_uint"`
 */
export const useWatchGachaTreasuryFuzzLogUint =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "log_uint",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryFuzzAbi}__ and `eventName` set to `"logs"`
 */
export const useWatchGachaTreasuryFuzzLogs =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: gachaTreasuryFuzzAbi,
		eventName: "logs",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iBeaconAbi}__
 */
export const useReadIBeaconContract = /*#__PURE__*/ createUseReadContract({
	abi: iBeaconAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iBeaconAbi}__ and `functionName` set to `"implementation"`
 */
export const useReadIBeaconImplementation = /*#__PURE__*/ createUseReadContract(
	{ abi: iBeaconAbi, functionName: "implementation" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__
 */
export const useReadICardGroupedVaultContract =
	/*#__PURE__*/ createUseReadContract({ abi: iCardGroupedVaultAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"asset"`
 */
export const useReadICardGroupedVaultAsset =
	/*#__PURE__*/ createUseReadContract({
		abi: iCardGroupedVaultAbi,
		functionName: "asset",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"pendingYield"`
 */
export const useReadICardGroupedVaultPendingYield =
	/*#__PURE__*/ createUseReadContract({
		abi: iCardGroupedVaultAbi,
		functionName: "pendingYield",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"sharesOf"`
 */
export const useReadICardGroupedVaultSharesOf =
	/*#__PURE__*/ createUseReadContract({
		abi: iCardGroupedVaultAbi,
		functionName: "sharesOf",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"totalShares"`
 */
export const useReadICardGroupedVaultTotalShares =
	/*#__PURE__*/ createUseReadContract({
		abi: iCardGroupedVaultAbi,
		functionName: "totalShares",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__
 */
export const useWriteICardGroupedVaultContract =
	/*#__PURE__*/ createUseWriteContract({ abi: iCardGroupedVaultAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"claimYield"`
 */
export const useWriteICardGroupedVaultClaimYield =
	/*#__PURE__*/ createUseWriteContract({
		abi: iCardGroupedVaultAbi,
		functionName: "claimYield",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"distributeYield"`
 */
export const useWriteICardGroupedVaultDistributeYield =
	/*#__PURE__*/ createUseWriteContract({
		abi: iCardGroupedVaultAbi,
		functionName: "distributeYield",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"migrateCardRarity"`
 */
export const useWriteICardGroupedVaultMigrateCardRarity =
	/*#__PURE__*/ createUseWriteContract({
		abi: iCardGroupedVaultAbi,
		functionName: "migrateCardRarity",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"registerCardDeposit"`
 */
export const useWriteICardGroupedVaultRegisterCardDeposit =
	/*#__PURE__*/ createUseWriteContract({
		abi: iCardGroupedVaultAbi,
		functionName: "registerCardDeposit",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"removeCardDeposit"`
 */
export const useWriteICardGroupedVaultRemoveCardDeposit =
	/*#__PURE__*/ createUseWriteContract({
		abi: iCardGroupedVaultAbi,
		functionName: "removeCardDeposit",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"updateCardPrice"`
 */
export const useWriteICardGroupedVaultUpdateCardPrice =
	/*#__PURE__*/ createUseWriteContract({
		abi: iCardGroupedVaultAbi,
		functionName: "updateCardPrice",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__
 */
export const useSimulateICardGroupedVaultContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: iCardGroupedVaultAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"claimYield"`
 */
export const useSimulateICardGroupedVaultClaimYield =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iCardGroupedVaultAbi,
		functionName: "claimYield",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"distributeYield"`
 */
export const useSimulateICardGroupedVaultDistributeYield =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iCardGroupedVaultAbi,
		functionName: "distributeYield",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"migrateCardRarity"`
 */
export const useSimulateICardGroupedVaultMigrateCardRarity =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iCardGroupedVaultAbi,
		functionName: "migrateCardRarity",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"registerCardDeposit"`
 */
export const useSimulateICardGroupedVaultRegisterCardDeposit =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iCardGroupedVaultAbi,
		functionName: "registerCardDeposit",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"removeCardDeposit"`
 */
export const useSimulateICardGroupedVaultRemoveCardDeposit =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iCardGroupedVaultAbi,
		functionName: "removeCardDeposit",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `functionName` set to `"updateCardPrice"`
 */
export const useSimulateICardGroupedVaultUpdateCardPrice =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iCardGroupedVaultAbi,
		functionName: "updateCardPrice",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iCardGroupedVaultAbi}__
 */
export const useWatchICardGroupedVaultContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: iCardGroupedVaultAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `eventName` set to `"CardDepositRegistered"`
 */
export const useWatchICardGroupedVaultCardDepositRegistered =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iCardGroupedVaultAbi,
		eventName: "CardDepositRegistered",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `eventName` set to `"CardDepositRemoved"`
 */
export const useWatchICardGroupedVaultCardDepositRemoved =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iCardGroupedVaultAbi,
		eventName: "CardDepositRemoved",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `eventName` set to `"CardPriceUpdated"`
 */
export const useWatchICardGroupedVaultCardPriceUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iCardGroupedVaultAbi,
		eventName: "CardPriceUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `eventName` set to `"CardRarityMigrated"`
 */
export const useWatchICardGroupedVaultCardRarityMigrated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iCardGroupedVaultAbi,
		eventName: "CardRarityMigrated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `eventName` set to `"YieldClaimed"`
 */
export const useWatchICardGroupedVaultYieldClaimed =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iCardGroupedVaultAbi,
		eventName: "YieldClaimed",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iCardGroupedVaultAbi}__ and `eventName` set to `"YieldDistributed"`
 */
export const useWatchICardGroupedVaultYieldDistributed =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iCardGroupedVaultAbi,
		eventName: "YieldDistributed",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc1363Abi}__
 */
export const useReadIerc1363Contract = /*#__PURE__*/ createUseReadContract({
	abi: ierc1363Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadIerc1363Allowance = /*#__PURE__*/ createUseReadContract({
	abi: ierc1363Abi,
	functionName: "allowance",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIerc1363BalanceOf = /*#__PURE__*/ createUseReadContract({
	abi: ierc1363Abi,
	functionName: "balanceOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadIerc1363SupportsInterface =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc1363Abi,
		functionName: "supportsInterface",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadIerc1363TotalSupply = /*#__PURE__*/ createUseReadContract({
	abi: ierc1363Abi,
	functionName: "totalSupply",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc1363Abi}__
 */
export const useWriteIerc1363Contract = /*#__PURE__*/ createUseWriteContract({
	abi: ierc1363Abi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteIerc1363Approve = /*#__PURE__*/ createUseWriteContract({
	abi: ierc1363Abi,
	functionName: "approve",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"approveAndCall"`
 */
export const useWriteIerc1363ApproveAndCall =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc1363Abi,
		functionName: "approveAndCall",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteIerc1363Transfer = /*#__PURE__*/ createUseWriteContract({
	abi: ierc1363Abi,
	functionName: "transfer",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transferAndCall"`
 */
export const useWriteIerc1363TransferAndCall =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc1363Abi,
		functionName: "transferAndCall",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIerc1363TransferFrom =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc1363Abi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transferFromAndCall"`
 */
export const useWriteIerc1363TransferFromAndCall =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc1363Abi,
		functionName: "transferFromAndCall",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc1363Abi}__
 */
export const useSimulateIerc1363Contract =
	/*#__PURE__*/ createUseSimulateContract({ abi: ierc1363Abi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIerc1363Approve =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc1363Abi,
		functionName: "approve",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"approveAndCall"`
 */
export const useSimulateIerc1363ApproveAndCall =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc1363Abi,
		functionName: "approveAndCall",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateIerc1363Transfer =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc1363Abi,
		functionName: "transfer",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transferAndCall"`
 */
export const useSimulateIerc1363TransferAndCall =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc1363Abi,
		functionName: "transferAndCall",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIerc1363TransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc1363Abi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transferFromAndCall"`
 */
export const useSimulateIerc1363TransferFromAndCall =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc1363Abi,
		functionName: "transferFromAndCall",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc1363Abi}__
 */
export const useWatchIerc1363Contract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: ierc1363Abi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc1363Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchIerc1363Approval =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc1363Abi,
		eventName: "Approval",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc1363Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIerc1363Transfer =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc1363Abi,
		eventName: "Transfer",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc165Abi}__
 */
export const useReadIerc165Contract = /*#__PURE__*/ createUseReadContract({
	abi: ierc165Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc165Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadIerc165SupportsInterface =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc165Abi,
		functionName: "supportsInterface",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc1822ProxiableAbi}__
 */
export const useReadIerc1822ProxiableContract =
	/*#__PURE__*/ createUseReadContract({ abi: ierc1822ProxiableAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc1822ProxiableAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadIerc1822ProxiableProxiableUuid =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc1822ProxiableAbi,
		functionName: "proxiableUUID",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc1967Abi}__
 */
export const useWatchIerc1967Contract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: ierc1967Abi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc1967Abi}__ and `eventName` set to `"AdminChanged"`
 */
export const useWatchIerc1967AdminChanged =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc1967Abi,
		eventName: "AdminChanged",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc1967Abi}__ and `eventName` set to `"BeaconUpgraded"`
 */
export const useWatchIerc1967BeaconUpgraded =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc1967Abi,
		eventName: "BeaconUpgraded",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc1967Abi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchIerc1967Upgraded =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc1967Abi,
		eventName: "Upgraded",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20Abi}__
 */
export const useReadIerc20Contract = /*#__PURE__*/ createUseReadContract({
	abi: ierc20Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadIerc20Allowance = /*#__PURE__*/ createUseReadContract({
	abi: ierc20Abi,
	functionName: "allowance",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIerc20BalanceOf = /*#__PURE__*/ createUseReadContract({
	abi: ierc20Abi,
	functionName: "balanceOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadIerc20TotalSupply = /*#__PURE__*/ createUseReadContract({
	abi: ierc20Abi,
	functionName: "totalSupply",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20Abi}__
 */
export const useWriteIerc20Contract = /*#__PURE__*/ createUseWriteContract({
	abi: ierc20Abi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteIerc20Approve = /*#__PURE__*/ createUseWriteContract({
	abi: ierc20Abi,
	functionName: "approve",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteIerc20Transfer = /*#__PURE__*/ createUseWriteContract({
	abi: ierc20Abi,
	functionName: "transfer",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIerc20TransferFrom = /*#__PURE__*/ createUseWriteContract({
	abi: ierc20Abi,
	functionName: "transferFrom",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20Abi}__
 */
export const useSimulateIerc20Contract =
	/*#__PURE__*/ createUseSimulateContract({ abi: ierc20Abi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIerc20Approve = /*#__PURE__*/ createUseSimulateContract(
	{ abi: ierc20Abi, functionName: "approve" },
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateIerc20Transfer =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc20Abi,
		functionName: "transfer",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIerc20TransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc20Abi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc20Abi}__
 */
export const useWatchIerc20Contract = /*#__PURE__*/ createUseWatchContractEvent(
	{ abi: ierc20Abi },
);

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc20Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchIerc20Approval = /*#__PURE__*/ createUseWatchContractEvent(
	{ abi: ierc20Abi, eventName: "Approval" },
);

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIerc20Transfer = /*#__PURE__*/ createUseWatchContractEvent(
	{ abi: ierc20Abi, eventName: "Transfer" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20MetadataAbi}__
 */
export const useReadIerc20MetadataContract =
	/*#__PURE__*/ createUseReadContract({ abi: ierc20MetadataAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadIerc20MetadataAllowance =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc20MetadataAbi,
		functionName: "allowance",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIerc20MetadataBalanceOf =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc20MetadataAbi,
		functionName: "balanceOf",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadIerc20MetadataDecimals =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc20MetadataAbi,
		functionName: "decimals",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"name"`
 */
export const useReadIerc20MetadataName = /*#__PURE__*/ createUseReadContract({
	abi: ierc20MetadataAbi,
	functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadIerc20MetadataSymbol = /*#__PURE__*/ createUseReadContract({
	abi: ierc20MetadataAbi,
	functionName: "symbol",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadIerc20MetadataTotalSupply =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc20MetadataAbi,
		functionName: "totalSupply",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20MetadataAbi}__
 */
export const useWriteIerc20MetadataContract =
	/*#__PURE__*/ createUseWriteContract({ abi: ierc20MetadataAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteIerc20MetadataApprove =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc20MetadataAbi,
		functionName: "approve",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteIerc20MetadataTransfer =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc20MetadataAbi,
		functionName: "transfer",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIerc20MetadataTransferFrom =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc20MetadataAbi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20MetadataAbi}__
 */
export const useSimulateIerc20MetadataContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: ierc20MetadataAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIerc20MetadataApprove =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc20MetadataAbi,
		functionName: "approve",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateIerc20MetadataTransfer =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc20MetadataAbi,
		functionName: "transfer",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIerc20MetadataTransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc20MetadataAbi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc20MetadataAbi}__
 */
export const useWatchIerc20MetadataContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: ierc20MetadataAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchIerc20MetadataApproval =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc20MetadataAbi,
		eventName: "Approval",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIerc20MetadataTransfer =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc20MetadataAbi,
		eventName: "Transfer",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20PermitAbi}__
 */
export const useReadIerc20PermitContract = /*#__PURE__*/ createUseReadContract({
	abi: ierc20PermitAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20PermitAbi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 */
export const useReadIerc20PermitDomainSeparator =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc20PermitAbi,
		functionName: "DOMAIN_SEPARATOR",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20PermitAbi}__ and `functionName` set to `"nonces"`
 */
export const useReadIerc20PermitNonces = /*#__PURE__*/ createUseReadContract({
	abi: ierc20PermitAbi,
	functionName: "nonces",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20PermitAbi}__
 */
export const useWriteIerc20PermitContract =
	/*#__PURE__*/ createUseWriteContract({ abi: ierc20PermitAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20PermitAbi}__ and `functionName` set to `"permit"`
 */
export const useWriteIerc20PermitPermit = /*#__PURE__*/ createUseWriteContract({
	abi: ierc20PermitAbi,
	functionName: "permit",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20PermitAbi}__
 */
export const useSimulateIerc20PermitContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: ierc20PermitAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20PermitAbi}__ and `functionName` set to `"permit"`
 */
export const useSimulateIerc20PermitPermit =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc20PermitAbi,
		functionName: "permit",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc5267Abi}__
 */
export const useReadIerc5267Contract = /*#__PURE__*/ createUseReadContract({
	abi: ierc5267Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc5267Abi}__ and `functionName` set to `"eip712Domain"`
 */
export const useReadIerc5267Eip712Domain = /*#__PURE__*/ createUseReadContract({
	abi: ierc5267Abi,
	functionName: "eip712Domain",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc5267Abi}__
 */
export const useWatchIerc5267Contract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: ierc5267Abi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc5267Abi}__ and `eventName` set to `"EIP712DomainChanged"`
 */
export const useWatchIerc5267Eip712DomainChanged =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc5267Abi,
		eventName: "EIP712DomainChanged",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721Abi}__
 */
export const useReadIerc721Contract = /*#__PURE__*/ createUseReadContract({
	abi: ierc721Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIerc721BalanceOf = /*#__PURE__*/ createUseReadContract({
	abi: ierc721Abi,
	functionName: "balanceOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721Abi}__ and `functionName` set to `"getApproved"`
 */
export const useReadIerc721GetApproved = /*#__PURE__*/ createUseReadContract({
	abi: ierc721Abi,
	functionName: "getApproved",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721Abi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadIerc721IsApprovedForAll =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721Abi,
		functionName: "isApprovedForAll",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721Abi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadIerc721OwnerOf = /*#__PURE__*/ createUseReadContract({
	abi: ierc721Abi,
	functionName: "ownerOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadIerc721SupportsInterface =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721Abi,
		functionName: "supportsInterface",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721Abi}__
 */
export const useWriteIerc721Contract = /*#__PURE__*/ createUseWriteContract({
	abi: ierc721Abi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteIerc721Approve = /*#__PURE__*/ createUseWriteContract({
	abi: ierc721Abi,
	functionName: "approve",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteIerc721SafeTransferFrom =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc721Abi,
		functionName: "safeTransferFrom",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721Abi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteIerc721SetApprovalForAll =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc721Abi,
		functionName: "setApprovalForAll",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIerc721TransferFrom = /*#__PURE__*/ createUseWriteContract(
	{ abi: ierc721Abi, functionName: "transferFrom" },
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721Abi}__
 */
export const useSimulateIerc721Contract =
	/*#__PURE__*/ createUseSimulateContract({ abi: ierc721Abi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIerc721Approve =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc721Abi,
		functionName: "approve",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateIerc721SafeTransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc721Abi,
		functionName: "safeTransferFrom",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721Abi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateIerc721SetApprovalForAll =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc721Abi,
		functionName: "setApprovalForAll",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIerc721TransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc721Abi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721Abi}__
 */
export const useWatchIerc721Contract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: ierc721Abi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchIerc721Approval =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc721Abi,
		eventName: "Approval",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721Abi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchIerc721ApprovalForAll =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc721Abi,
		eventName: "ApprovalForAll",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIerc721Transfer =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc721Abi,
		eventName: "Transfer",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__
 */
export const useReadIerc721EnumerableContract =
	/*#__PURE__*/ createUseReadContract({ abi: ierc721EnumerableAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIerc721EnumerableBalanceOf =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721EnumerableAbi,
		functionName: "balanceOf",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"getApproved"`
 */
export const useReadIerc721EnumerableGetApproved =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721EnumerableAbi,
		functionName: "getApproved",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadIerc721EnumerableIsApprovedForAll =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721EnumerableAbi,
		functionName: "isApprovedForAll",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadIerc721EnumerableOwnerOf =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721EnumerableAbi,
		functionName: "ownerOf",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadIerc721EnumerableSupportsInterface =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721EnumerableAbi,
		functionName: "supportsInterface",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"tokenByIndex"`
 */
export const useReadIerc721EnumerableTokenByIndex =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721EnumerableAbi,
		functionName: "tokenByIndex",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 */
export const useReadIerc721EnumerableTokenOfOwnerByIndex =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721EnumerableAbi,
		functionName: "tokenOfOwnerByIndex",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadIerc721EnumerableTotalSupply =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721EnumerableAbi,
		functionName: "totalSupply",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__
 */
export const useWriteIerc721EnumerableContract =
	/*#__PURE__*/ createUseWriteContract({ abi: ierc721EnumerableAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteIerc721EnumerableApprove =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc721EnumerableAbi,
		functionName: "approve",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteIerc721EnumerableSafeTransferFrom =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc721EnumerableAbi,
		functionName: "safeTransferFrom",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteIerc721EnumerableSetApprovalForAll =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc721EnumerableAbi,
		functionName: "setApprovalForAll",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIerc721EnumerableTransferFrom =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc721EnumerableAbi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__
 */
export const useSimulateIerc721EnumerableContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: ierc721EnumerableAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIerc721EnumerableApprove =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc721EnumerableAbi,
		functionName: "approve",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateIerc721EnumerableSafeTransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc721EnumerableAbi,
		functionName: "safeTransferFrom",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateIerc721EnumerableSetApprovalForAll =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc721EnumerableAbi,
		functionName: "setApprovalForAll",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIerc721EnumerableTransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc721EnumerableAbi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721EnumerableAbi}__
 */
export const useWatchIerc721EnumerableContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: ierc721EnumerableAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchIerc721EnumerableApproval =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc721EnumerableAbi,
		eventName: "Approval",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchIerc721EnumerableApprovalForAll =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc721EnumerableAbi,
		eventName: "ApprovalForAll",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIerc721EnumerableTransfer =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc721EnumerableAbi,
		eventName: "Transfer",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__
 */
export const useReadIerc721MetadataContract =
	/*#__PURE__*/ createUseReadContract({ abi: ierc721MetadataAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIerc721MetadataBalanceOf =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721MetadataAbi,
		functionName: "balanceOf",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"getApproved"`
 */
export const useReadIerc721MetadataGetApproved =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721MetadataAbi,
		functionName: "getApproved",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadIerc721MetadataIsApprovedForAll =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721MetadataAbi,
		functionName: "isApprovedForAll",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"name"`
 */
export const useReadIerc721MetadataName = /*#__PURE__*/ createUseReadContract({
	abi: ierc721MetadataAbi,
	functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadIerc721MetadataOwnerOf =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721MetadataAbi,
		functionName: "ownerOf",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadIerc721MetadataSupportsInterface =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721MetadataAbi,
		functionName: "supportsInterface",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadIerc721MetadataSymbol = /*#__PURE__*/ createUseReadContract(
	{ abi: ierc721MetadataAbi, functionName: "symbol" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadIerc721MetadataTokenUri =
	/*#__PURE__*/ createUseReadContract({
		abi: ierc721MetadataAbi,
		functionName: "tokenURI",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721MetadataAbi}__
 */
export const useWriteIerc721MetadataContract =
	/*#__PURE__*/ createUseWriteContract({ abi: ierc721MetadataAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteIerc721MetadataApprove =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc721MetadataAbi,
		functionName: "approve",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteIerc721MetadataSafeTransferFrom =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc721MetadataAbi,
		functionName: "safeTransferFrom",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteIerc721MetadataSetApprovalForAll =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc721MetadataAbi,
		functionName: "setApprovalForAll",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIerc721MetadataTransferFrom =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc721MetadataAbi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721MetadataAbi}__
 */
export const useSimulateIerc721MetadataContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: ierc721MetadataAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIerc721MetadataApprove =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc721MetadataAbi,
		functionName: "approve",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateIerc721MetadataSafeTransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc721MetadataAbi,
		functionName: "safeTransferFrom",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateIerc721MetadataSetApprovalForAll =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc721MetadataAbi,
		functionName: "setApprovalForAll",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIerc721MetadataTransferFrom =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc721MetadataAbi,
		functionName: "transferFrom",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721MetadataAbi}__
 */
export const useWatchIerc721MetadataContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: ierc721MetadataAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchIerc721MetadataApproval =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc721MetadataAbi,
		eventName: "Approval",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchIerc721MetadataApprovalForAll =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc721MetadataAbi,
		eventName: "ApprovalForAll",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIerc721MetadataTransfer =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ierc721MetadataAbi,
		eventName: "Transfer",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721ReceiverAbi}__
 */
export const useWriteIerc721ReceiverContract =
	/*#__PURE__*/ createUseWriteContract({ abi: ierc721ReceiverAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721ReceiverAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useWriteIerc721ReceiverOnErc721Received =
	/*#__PURE__*/ createUseWriteContract({
		abi: ierc721ReceiverAbi,
		functionName: "onERC721Received",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721ReceiverAbi}__
 */
export const useSimulateIerc721ReceiverContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: ierc721ReceiverAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721ReceiverAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useSimulateIerc721ReceiverOnErc721Received =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ierc721ReceiverAbi,
		functionName: "onERC721Received",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__
 */
export const useReadIFundsDistributionTokenContract =
	/*#__PURE__*/ createUseReadContract({ abi: iFundsDistributionTokenAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__ and `functionName` set to `"withdrawableFundsOf"`
 */
export const useReadIFundsDistributionTokenWithdrawableFundsOf =
	/*#__PURE__*/ createUseReadContract({
		abi: iFundsDistributionTokenAbi,
		functionName: "withdrawableFundsOf",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__
 */
export const useWriteIFundsDistributionTokenContract =
	/*#__PURE__*/ createUseWriteContract({ abi: iFundsDistributionTokenAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__ and `functionName` set to `"withdrawFunds"`
 */
export const useWriteIFundsDistributionTokenWithdrawFunds =
	/*#__PURE__*/ createUseWriteContract({
		abi: iFundsDistributionTokenAbi,
		functionName: "withdrawFunds",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__
 */
export const useSimulateIFundsDistributionTokenContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: iFundsDistributionTokenAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__ and `functionName` set to `"withdrawFunds"`
 */
export const useSimulateIFundsDistributionTokenWithdrawFunds =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iFundsDistributionTokenAbi,
		functionName: "withdrawFunds",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__
 */
export const useWatchIFundsDistributionTokenContract =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iFundsDistributionTokenAbi,
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__ and `eventName` set to `"FundsDistributed"`
 */
export const useWatchIFundsDistributionTokenFundsDistributed =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iFundsDistributionTokenAbi,
		eventName: "FundsDistributed",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__ and `eventName` set to `"FundsWithdrawn"`
 */
export const useWatchIFundsDistributionTokenFundsWithdrawn =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iFundsDistributionTokenAbi,
		eventName: "FundsWithdrawn",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaAbi}__
 */
export const useReadIGachaContract = /*#__PURE__*/ createUseReadContract({
	abi: iGachaAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"feeToken"`
 */
export const useReadIGachaFeeToken = /*#__PURE__*/ createUseReadContract({
	abi: iGachaAbi,
	functionName: "feeToken",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"getCurrentRarityWeights"`
 */
export const useReadIGachaGetCurrentRarityWeights =
	/*#__PURE__*/ createUseReadContract({
		abi: iGachaAbi,
		functionName: "getCurrentRarityWeights",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"getCurrentSpinFee"`
 */
export const useReadIGachaGetCurrentSpinFee =
	/*#__PURE__*/ createUseReadContract({
		abi: iGachaAbi,
		functionName: "getCurrentSpinFee",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"getExpectedValueUSD"`
 */
export const useReadIGachaGetExpectedValueUsd =
	/*#__PURE__*/ createUseReadContract({
		abi: iGachaAbi,
		functionName: "getExpectedValueUSD",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"getTargetRarityBps"`
 */
export const useReadIGachaGetTargetRarityBps =
	/*#__PURE__*/ createUseReadContract({
		abi: iGachaAbi,
		functionName: "getTargetRarityBps",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__
 */
export const useWriteIGachaContract = /*#__PURE__*/ createUseWriteContract({
	abi: iGachaAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"fulfillRandomness"`
 */
export const useWriteIGachaFulfillRandomness =
	/*#__PURE__*/ createUseWriteContract({
		abi: iGachaAbi,
		functionName: "fulfillRandomness",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setDynamicWeightsConfig"`
 */
export const useWriteIGachaSetDynamicWeightsConfig =
	/*#__PURE__*/ createUseWriteContract({
		abi: iGachaAbi,
		functionName: "setDynamicWeightsConfig",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setFeeTokenDecimals"`
 */
export const useWriteIGachaSetFeeTokenDecimals =
	/*#__PURE__*/ createUseWriteContract({
		abi: iGachaAbi,
		functionName: "setFeeTokenDecimals",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setGachaServiceHandler"`
 */
export const useWriteIGachaSetGachaServiceHandler =
	/*#__PURE__*/ createUseWriteContract({
		abi: iGachaAbi,
		functionName: "setGachaServiceHandler",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setPricingConfig"`
 */
export const useWriteIGachaSetPricingConfig =
	/*#__PURE__*/ createUseWriteContract({
		abi: iGachaAbi,
		functionName: "setPricingConfig",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"spin"`
 */
export const useWriteIGachaSpin = /*#__PURE__*/ createUseWriteContract({
	abi: iGachaAbi,
	functionName: "spin",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"spinWithPermit"`
 */
export const useWriteIGachaSpinWithPermit =
	/*#__PURE__*/ createUseWriteContract({
		abi: iGachaAbi,
		functionName: "spinWithPermit",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__
 */
export const useSimulateIGachaContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: iGachaAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"fulfillRandomness"`
 */
export const useSimulateIGachaFulfillRandomness =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iGachaAbi,
		functionName: "fulfillRandomness",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setDynamicWeightsConfig"`
 */
export const useSimulateIGachaSetDynamicWeightsConfig =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iGachaAbi,
		functionName: "setDynamicWeightsConfig",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setFeeTokenDecimals"`
 */
export const useSimulateIGachaSetFeeTokenDecimals =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iGachaAbi,
		functionName: "setFeeTokenDecimals",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setGachaServiceHandler"`
 */
export const useSimulateIGachaSetGachaServiceHandler =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iGachaAbi,
		functionName: "setGachaServiceHandler",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setPricingConfig"`
 */
export const useSimulateIGachaSetPricingConfig =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iGachaAbi,
		functionName: "setPricingConfig",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"spin"`
 */
export const useSimulateIGachaSpin = /*#__PURE__*/ createUseSimulateContract({
	abi: iGachaAbi,
	functionName: "spin",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"spinWithPermit"`
 */
export const useSimulateIGachaSpinWithPermit =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iGachaAbi,
		functionName: "spinWithPermit",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__
 */
export const useReadIGachaEconomyManagerContract =
	/*#__PURE__*/ createUseReadContract({ abi: iGachaEconomyManagerAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__ and `functionName` set to `"depositorShareBps"`
 */
export const useReadIGachaEconomyManagerDepositorShareBps =
	/*#__PURE__*/ createUseReadContract({
		abi: iGachaEconomyManagerAbi,
		functionName: "depositorShareBps",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__ and `functionName` set to `"protocolShareBps"`
 */
export const useReadIGachaEconomyManagerProtocolShareBps =
	/*#__PURE__*/ createUseReadContract({
		abi: iGachaEconomyManagerAbi,
		functionName: "protocolShareBps",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__
 */
export const useWriteIGachaEconomyManagerContract =
	/*#__PURE__*/ createUseWriteContract({ abi: iGachaEconomyManagerAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__ and `functionName` set to `"onSpinRevenue"`
 */
export const useWriteIGachaEconomyManagerOnSpinRevenue =
	/*#__PURE__*/ createUseWriteContract({
		abi: iGachaEconomyManagerAbi,
		functionName: "onSpinRevenue",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__
 */
export const useSimulateIGachaEconomyManagerContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: iGachaEconomyManagerAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__ and `functionName` set to `"onSpinRevenue"`
 */
export const useSimulateIGachaEconomyManagerOnSpinRevenue =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iGachaEconomyManagerAbi,
		functionName: "onSpinRevenue",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__
 */
export const useWatchIGachaEconomyManagerContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: iGachaEconomyManagerAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__ and `eventName` set to `"RevenueSplitUpdated"`
 */
export const useWatchIGachaEconomyManagerRevenueSplitUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iGachaEconomyManagerAbi,
		eventName: "RevenueSplitUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__ and `eventName` set to `"SpinRevenueReceived"`
 */
export const useWatchIGachaEconomyManagerSpinRevenueReceived =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iGachaEconomyManagerAbi,
		eventName: "SpinRevenueReceived",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaTreasuryYieldTrackerAbi}__
 */
export const useWriteIGachaTreasuryYieldTrackerContract =
	/*#__PURE__*/ createUseWriteContract({ abi: iGachaTreasuryYieldTrackerAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaTreasuryYieldTrackerAbi}__ and `functionName` set to `"recordYieldClaim"`
 */
export const useWriteIGachaTreasuryYieldTrackerRecordYieldClaim =
	/*#__PURE__*/ createUseWriteContract({
		abi: iGachaTreasuryYieldTrackerAbi,
		functionName: "recordYieldClaim",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaTreasuryYieldTrackerAbi}__
 */
export const useSimulateIGachaTreasuryYieldTrackerContract =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iGachaTreasuryYieldTrackerAbi,
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaTreasuryYieldTrackerAbi}__ and `functionName` set to `"recordYieldClaim"`
 */
export const useSimulateIGachaTreasuryYieldTrackerRecordYieldClaim =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iGachaTreasuryYieldTrackerAbi,
		functionName: "recordYieldClaim",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__
 */
export const useReadIMulticall3Contract = /*#__PURE__*/ createUseReadContract({
	abi: iMulticall3Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getBasefee"`
 */
export const useReadIMulticall3GetBasefee = /*#__PURE__*/ createUseReadContract(
	{ abi: iMulticall3Abi, functionName: "getBasefee" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getBlockHash"`
 */
export const useReadIMulticall3GetBlockHash =
	/*#__PURE__*/ createUseReadContract({
		abi: iMulticall3Abi,
		functionName: "getBlockHash",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getBlockNumber"`
 */
export const useReadIMulticall3GetBlockNumber =
	/*#__PURE__*/ createUseReadContract({
		abi: iMulticall3Abi,
		functionName: "getBlockNumber",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getChainId"`
 */
export const useReadIMulticall3GetChainId = /*#__PURE__*/ createUseReadContract(
	{ abi: iMulticall3Abi, functionName: "getChainId" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getCurrentBlockCoinbase"`
 */
export const useReadIMulticall3GetCurrentBlockCoinbase =
	/*#__PURE__*/ createUseReadContract({
		abi: iMulticall3Abi,
		functionName: "getCurrentBlockCoinbase",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getCurrentBlockDifficulty"`
 */
export const useReadIMulticall3GetCurrentBlockDifficulty =
	/*#__PURE__*/ createUseReadContract({
		abi: iMulticall3Abi,
		functionName: "getCurrentBlockDifficulty",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getCurrentBlockGasLimit"`
 */
export const useReadIMulticall3GetCurrentBlockGasLimit =
	/*#__PURE__*/ createUseReadContract({
		abi: iMulticall3Abi,
		functionName: "getCurrentBlockGasLimit",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getCurrentBlockTimestamp"`
 */
export const useReadIMulticall3GetCurrentBlockTimestamp =
	/*#__PURE__*/ createUseReadContract({
		abi: iMulticall3Abi,
		functionName: "getCurrentBlockTimestamp",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getEthBalance"`
 */
export const useReadIMulticall3GetEthBalance =
	/*#__PURE__*/ createUseReadContract({
		abi: iMulticall3Abi,
		functionName: "getEthBalance",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getLastBlockHash"`
 */
export const useReadIMulticall3GetLastBlockHash =
	/*#__PURE__*/ createUseReadContract({
		abi: iMulticall3Abi,
		functionName: "getLastBlockHash",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMulticall3Abi}__
 */
export const useWriteIMulticall3Contract = /*#__PURE__*/ createUseWriteContract(
	{ abi: iMulticall3Abi },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"aggregate"`
 */
export const useWriteIMulticall3Aggregate =
	/*#__PURE__*/ createUseWriteContract({
		abi: iMulticall3Abi,
		functionName: "aggregate",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"aggregate3"`
 */
export const useWriteIMulticall3Aggregate3 =
	/*#__PURE__*/ createUseWriteContract({
		abi: iMulticall3Abi,
		functionName: "aggregate3",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"aggregate3Value"`
 */
export const useWriteIMulticall3Aggregate3Value =
	/*#__PURE__*/ createUseWriteContract({
		abi: iMulticall3Abi,
		functionName: "aggregate3Value",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"blockAndAggregate"`
 */
export const useWriteIMulticall3BlockAndAggregate =
	/*#__PURE__*/ createUseWriteContract({
		abi: iMulticall3Abi,
		functionName: "blockAndAggregate",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"tryAggregate"`
 */
export const useWriteIMulticall3TryAggregate =
	/*#__PURE__*/ createUseWriteContract({
		abi: iMulticall3Abi,
		functionName: "tryAggregate",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"tryBlockAndAggregate"`
 */
export const useWriteIMulticall3TryBlockAndAggregate =
	/*#__PURE__*/ createUseWriteContract({
		abi: iMulticall3Abi,
		functionName: "tryBlockAndAggregate",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMulticall3Abi}__
 */
export const useSimulateIMulticall3Contract =
	/*#__PURE__*/ createUseSimulateContract({ abi: iMulticall3Abi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"aggregate"`
 */
export const useSimulateIMulticall3Aggregate =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iMulticall3Abi,
		functionName: "aggregate",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"aggregate3"`
 */
export const useSimulateIMulticall3Aggregate3 =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iMulticall3Abi,
		functionName: "aggregate3",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"aggregate3Value"`
 */
export const useSimulateIMulticall3Aggregate3Value =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iMulticall3Abi,
		functionName: "aggregate3Value",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"blockAndAggregate"`
 */
export const useSimulateIMulticall3BlockAndAggregate =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iMulticall3Abi,
		functionName: "blockAndAggregate",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"tryAggregate"`
 */
export const useSimulateIMulticall3TryAggregate =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iMulticall3Abi,
		functionName: "tryAggregate",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"tryBlockAndAggregate"`
 */
export const useSimulateIMulticall3TryBlockAndAggregate =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iMulticall3Abi,
		functionName: "tryBlockAndAggregate",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__
 */
export const useReadIProtocolTreasuryContract =
	/*#__PURE__*/ createUseReadContract({ abi: iProtocolTreasuryAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `functionName` set to `"asset"`
 */
export const useReadIProtocolTreasuryAsset =
	/*#__PURE__*/ createUseReadContract({
		abi: iProtocolTreasuryAbi,
		functionName: "asset",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__
 */
export const useWriteIProtocolTreasuryContract =
	/*#__PURE__*/ createUseWriteContract({ abi: iProtocolTreasuryAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `functionName` set to `"executeRedemption"`
 */
export const useWriteIProtocolTreasuryExecuteRedemption =
	/*#__PURE__*/ createUseWriteContract({
		abi: iProtocolTreasuryAbi,
		functionName: "executeRedemption",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `functionName` set to `"onRevenueReceived"`
 */
export const useWriteIProtocolTreasuryOnRevenueReceived =
	/*#__PURE__*/ createUseWriteContract({
		abi: iProtocolTreasuryAbi,
		functionName: "onRevenueReceived",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `functionName` set to `"transferOut"`
 */
export const useWriteIProtocolTreasuryTransferOut =
	/*#__PURE__*/ createUseWriteContract({
		abi: iProtocolTreasuryAbi,
		functionName: "transferOut",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__
 */
export const useSimulateIProtocolTreasuryContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: iProtocolTreasuryAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `functionName` set to `"executeRedemption"`
 */
export const useSimulateIProtocolTreasuryExecuteRedemption =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iProtocolTreasuryAbi,
		functionName: "executeRedemption",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `functionName` set to `"onRevenueReceived"`
 */
export const useSimulateIProtocolTreasuryOnRevenueReceived =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iProtocolTreasuryAbi,
		functionName: "onRevenueReceived",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `functionName` set to `"transferOut"`
 */
export const useSimulateIProtocolTreasuryTransferOut =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iProtocolTreasuryAbi,
		functionName: "transferOut",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iProtocolTreasuryAbi}__
 */
export const useWatchIProtocolTreasuryContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: iProtocolTreasuryAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `eventName` set to `"ProtocolRevenueReceived"`
 */
export const useWatchIProtocolTreasuryProtocolRevenueReceived =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iProtocolTreasuryAbi,
		eventName: "ProtocolRevenueReceived",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `eventName` set to `"ProtocolTransfer"`
 */
export const useWatchIProtocolTreasuryProtocolTransfer =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iProtocolTreasuryAbi,
		eventName: "ProtocolTransfer",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `eventName` set to `"RedemptionExecuted"`
 */
export const useWatchIProtocolTreasuryRedemptionExecuted =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iProtocolTreasuryAbi,
		eventName: "RedemptionExecuted",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iRedemptionWindowAbi}__
 */
export const useReadIRedemptionWindowContract =
	/*#__PURE__*/ createUseReadContract({ abi: iRedemptionWindowAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iRedemptionWindowAbi}__ and `functionName` set to `"redemptionWindow"`
 */
export const useReadIRedemptionWindowRedemptionWindow =
	/*#__PURE__*/ createUseReadContract({
		abi: iRedemptionWindowAbi,
		functionName: "redemptionWindow",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceHandlerAbi}__
 */
export const useReadIWavsServiceHandlerContract =
	/*#__PURE__*/ createUseReadContract({ abi: iWavsServiceHandlerAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceHandlerAbi}__ and `functionName` set to `"getServiceManager"`
 */
export const useReadIWavsServiceHandlerGetServiceManager =
	/*#__PURE__*/ createUseReadContract({
		abi: iWavsServiceHandlerAbi,
		functionName: "getServiceManager",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iWavsServiceHandlerAbi}__
 */
export const useWriteIWavsServiceHandlerContract =
	/*#__PURE__*/ createUseWriteContract({ abi: iWavsServiceHandlerAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iWavsServiceHandlerAbi}__ and `functionName` set to `"handleSignedEnvelope"`
 */
export const useWriteIWavsServiceHandlerHandleSignedEnvelope =
	/*#__PURE__*/ createUseWriteContract({
		abi: iWavsServiceHandlerAbi,
		functionName: "handleSignedEnvelope",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iWavsServiceHandlerAbi}__
 */
export const useSimulateIWavsServiceHandlerContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: iWavsServiceHandlerAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iWavsServiceHandlerAbi}__ and `functionName` set to `"handleSignedEnvelope"`
 */
export const useSimulateIWavsServiceHandlerHandleSignedEnvelope =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iWavsServiceHandlerAbi,
		functionName: "handleSignedEnvelope",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__
 */
export const useReadIWavsServiceManagerContract =
	/*#__PURE__*/ createUseReadContract({ abi: iWavsServiceManagerAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"getAllocationManager"`
 */
export const useReadIWavsServiceManagerGetAllocationManager =
	/*#__PURE__*/ createUseReadContract({
		abi: iWavsServiceManagerAbi,
		functionName: "getAllocationManager",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"getDelegationManager"`
 */
export const useReadIWavsServiceManagerGetDelegationManager =
	/*#__PURE__*/ createUseReadContract({
		abi: iWavsServiceManagerAbi,
		functionName: "getDelegationManager",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"getLatestOperatorForSigningKey"`
 */
export const useReadIWavsServiceManagerGetLatestOperatorForSigningKey =
	/*#__PURE__*/ createUseReadContract({
		abi: iWavsServiceManagerAbi,
		functionName: "getLatestOperatorForSigningKey",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"getOperatorWeight"`
 */
export const useReadIWavsServiceManagerGetOperatorWeight =
	/*#__PURE__*/ createUseReadContract({
		abi: iWavsServiceManagerAbi,
		functionName: "getOperatorWeight",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"getServiceURI"`
 */
export const useReadIWavsServiceManagerGetServiceUri =
	/*#__PURE__*/ createUseReadContract({
		abi: iWavsServiceManagerAbi,
		functionName: "getServiceURI",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"getStakeRegistry"`
 */
export const useReadIWavsServiceManagerGetStakeRegistry =
	/*#__PURE__*/ createUseReadContract({
		abi: iWavsServiceManagerAbi,
		functionName: "getStakeRegistry",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"validate"`
 */
export const useReadIWavsServiceManagerValidate =
	/*#__PURE__*/ createUseReadContract({
		abi: iWavsServiceManagerAbi,
		functionName: "validate",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__
 */
export const useWriteIWavsServiceManagerContract =
	/*#__PURE__*/ createUseWriteContract({ abi: iWavsServiceManagerAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"setServiceURI"`
 */
export const useWriteIWavsServiceManagerSetServiceUri =
	/*#__PURE__*/ createUseWriteContract({
		abi: iWavsServiceManagerAbi,
		functionName: "setServiceURI",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__
 */
export const useSimulateIWavsServiceManagerContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: iWavsServiceManagerAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"setServiceURI"`
 */
export const useSimulateIWavsServiceManagerSetServiceUri =
	/*#__PURE__*/ createUseSimulateContract({
		abi: iWavsServiceManagerAbi,
		functionName: "setServiceURI",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iWavsServiceManagerAbi}__
 */
export const useWatchIWavsServiceManagerContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: iWavsServiceManagerAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `eventName` set to `"QuorumThresholdUpdated"`
 */
export const useWatchIWavsServiceManagerQuorumThresholdUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iWavsServiceManagerAbi,
		eventName: "QuorumThresholdUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `eventName` set to `"ServiceURIUpdated"`
 */
export const useWatchIWavsServiceManagerServiceUriUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: iWavsServiceManagerAbi,
		eventName: "ServiceURIUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link initializableAbi}__
 */
export const useWatchInitializableContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: initializableAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link initializableAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchInitializableInitialized =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: initializableAbi,
		eventName: "Initialized",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__
 */
export const useReadNftAppraisalContract = /*#__PURE__*/ createUseReadContract({
	abi: nftAppraisalAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadNftAppraisalUpgradeInterfaceVersion =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "UPGRADE_INTERFACE_VERSION",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"appraisalFee"`
 */
export const useReadNftAppraisalAppraisalFee =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "appraisalFee",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"cardAppraisals"`
 */
export const useReadNftAppraisalCardAppraisals =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "cardAppraisals",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"feeToken"`
 */
export const useReadNftAppraisalFeeToken = /*#__PURE__*/ createUseReadContract({
	abi: nftAppraisalAbi,
	functionName: "feeToken",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getAppraisal"`
 */
export const useReadNftAppraisalGetAppraisal =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "getAppraisal",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getAppraisedPrice"`
 */
export const useReadNftAppraisalGetAppraisedPrice =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "getAppraisedPrice",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getBatchAppraisals"`
 */
export const useReadNftAppraisalGetBatchAppraisals =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "getBatchAppraisals",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getCardAppraisal"`
 */
export const useReadNftAppraisalGetCardAppraisal =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "getCardAppraisal",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getCardAppraisals"`
 */
export const useReadNftAppraisalGetCardAppraisals =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "getCardAppraisals",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getCardInstance"`
 */
export const useReadNftAppraisalGetCardInstance =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "getCardInstance",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getCardInstances"`
 */
export const useReadNftAppraisalGetCardInstances =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "getCardInstances",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getServiceHandler"`
 */
export const useReadNftAppraisalGetServiceHandler =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "getServiceHandler",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getTokenCardId"`
 */
export const useReadNftAppraisalGetTokenCardId =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "getTokenCardId",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getWhitelistedTreasuries"`
 */
export const useReadNftAppraisalGetWhitelistedTreasuries =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "getWhitelistedTreasuries",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"hasAppraisal"`
 */
export const useReadNftAppraisalHasAppraisal =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "hasAppraisal",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"hasBatchAppraisals"`
 */
export const useReadNftAppraisalHasBatchAppraisals =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "hasBatchAppraisals",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"isServiceHandler"`
 */
export const useReadNftAppraisalIsServiceHandler =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "isServiceHandler",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"isTreasuryWhitelisted"`
 */
export const useReadNftAppraisalIsTreasuryWhitelisted =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "isTreasuryWhitelisted",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"owner"`
 */
export const useReadNftAppraisalOwner = /*#__PURE__*/ createUseReadContract({
	abi: nftAppraisalAbi,
	functionName: "owner",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"paused"`
 */
export const useReadNftAppraisalPaused = /*#__PURE__*/ createUseReadContract({
	abi: nftAppraisalAbi,
	functionName: "paused",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"protocolAddress"`
 */
export const useReadNftAppraisalProtocolAddress =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "protocolAddress",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadNftAppraisalProxiableUuid =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "proxiableUUID",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"serviceHandler"`
 */
export const useReadNftAppraisalServiceHandler =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "serviceHandler",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"tokenCardIds"`
 */
export const useReadNftAppraisalTokenCardIds =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "tokenCardIds",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"tokenRequests"`
 */
export const useReadNftAppraisalTokenRequests =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "tokenRequests",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"treasuryList"`
 */
export const useReadNftAppraisalTreasuryList =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "treasuryList",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"whitelistedTreasuries"`
 */
export const useReadNftAppraisalWhitelistedTreasuries =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalAbi,
		functionName: "whitelistedTreasuries",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__
 */
export const useWriteNftAppraisalContract =
	/*#__PURE__*/ createUseWriteContract({ abi: nftAppraisalAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useWriteNftAppraisalEmergencyPause =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "emergencyPause",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useWriteNftAppraisalEmergencyUnpause =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "emergencyUnpause",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteNftAppraisalInitialize =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "initialize",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"ownerBatchSetAppraisalForTokensWithCards"`
 */
export const useWriteNftAppraisalOwnerBatchSetAppraisalForTokensWithCards =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "ownerBatchSetAppraisalForTokensWithCards",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"ownerSetAppraisalForTokenWithCard"`
 */
export const useWriteNftAppraisalOwnerSetAppraisalForTokenWithCard =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "ownerSetAppraisalForTokenWithCard",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteNftAppraisalRenounceOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"requestAppraisal"`
 */
export const useWriteNftAppraisalRequestAppraisal =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "requestAppraisal",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"requestBatchAppraisal"`
 */
export const useWriteNftAppraisalRequestBatchAppraisal =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "requestBatchAppraisal",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setAppraisalFee"`
 */
export const useWriteNftAppraisalSetAppraisalFee =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "setAppraisalFee",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setAppraisalForTokenWithCard"`
 */
export const useWriteNftAppraisalSetAppraisalForTokenWithCard =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "setAppraisalForTokenWithCard",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setFeeToken"`
 */
export const useWriteNftAppraisalSetFeeToken =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "setFeeToken",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setProtocolAddress"`
 */
export const useWriteNftAppraisalSetProtocolAddress =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "setProtocolAddress",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setServiceHandler"`
 */
export const useWriteNftAppraisalSetServiceHandler =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "setServiceHandler",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteNftAppraisalTransferOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"unwhitelistTreasury"`
 */
export const useWriteNftAppraisalUnwhitelistTreasury =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "unwhitelistTreasury",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteNftAppraisalUpgradeToAndCall =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "upgradeToAndCall",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"whitelistTreasury"`
 */
export const useWriteNftAppraisalWhitelistTreasury =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalAbi,
		functionName: "whitelistTreasury",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__
 */
export const useSimulateNftAppraisalContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: nftAppraisalAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useSimulateNftAppraisalEmergencyPause =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "emergencyPause",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useSimulateNftAppraisalEmergencyUnpause =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "emergencyUnpause",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateNftAppraisalInitialize =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "initialize",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"ownerBatchSetAppraisalForTokensWithCards"`
 */
export const useSimulateNftAppraisalOwnerBatchSetAppraisalForTokensWithCards =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "ownerBatchSetAppraisalForTokensWithCards",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"ownerSetAppraisalForTokenWithCard"`
 */
export const useSimulateNftAppraisalOwnerSetAppraisalForTokenWithCard =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "ownerSetAppraisalForTokenWithCard",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateNftAppraisalRenounceOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"requestAppraisal"`
 */
export const useSimulateNftAppraisalRequestAppraisal =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "requestAppraisal",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"requestBatchAppraisal"`
 */
export const useSimulateNftAppraisalRequestBatchAppraisal =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "requestBatchAppraisal",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setAppraisalFee"`
 */
export const useSimulateNftAppraisalSetAppraisalFee =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "setAppraisalFee",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setAppraisalForTokenWithCard"`
 */
export const useSimulateNftAppraisalSetAppraisalForTokenWithCard =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "setAppraisalForTokenWithCard",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setFeeToken"`
 */
export const useSimulateNftAppraisalSetFeeToken =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "setFeeToken",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setProtocolAddress"`
 */
export const useSimulateNftAppraisalSetProtocolAddress =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "setProtocolAddress",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setServiceHandler"`
 */
export const useSimulateNftAppraisalSetServiceHandler =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "setServiceHandler",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateNftAppraisalTransferOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"unwhitelistTreasury"`
 */
export const useSimulateNftAppraisalUnwhitelistTreasury =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "unwhitelistTreasury",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateNftAppraisalUpgradeToAndCall =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "upgradeToAndCall",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"whitelistTreasury"`
 */
export const useSimulateNftAppraisalWhitelistTreasury =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalAbi,
		functionName: "whitelistTreasury",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__
 */
export const useWatchNftAppraisalContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: nftAppraisalAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"AppraisalCompleted"`
 */
export const useWatchNftAppraisalAppraisalCompleted =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "AppraisalCompleted",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"AppraisalFeeUpdated"`
 */
export const useWatchNftAppraisalAppraisalFeeUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "AppraisalFeeUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"AppraisalOverridden"`
 */
export const useWatchNftAppraisalAppraisalOverridden =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "AppraisalOverridden",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"AppraisalRequested"`
 */
export const useWatchNftAppraisalAppraisalRequested =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "AppraisalRequested",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"AppraisalStatusChanged"`
 */
export const useWatchNftAppraisalAppraisalStatusChanged =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "AppraisalStatusChanged",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"AutoMigrationFailed"`
 */
export const useWatchNftAppraisalAutoMigrationFailed =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "AutoMigrationFailed",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"AutoMigrationTriggered"`
 */
export const useWatchNftAppraisalAutoMigrationTriggered =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "AutoMigrationTriggered",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"CardAppraisalCompleted"`
 */
export const useWatchNftAppraisalCardAppraisalCompleted =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "CardAppraisalCompleted",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"CardPriceUpdated"`
 */
export const useWatchNftAppraisalCardPriceUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "CardPriceUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"FeeTokenUpdated"`
 */
export const useWatchNftAppraisalFeeTokenUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "FeeTokenUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchNftAppraisalInitialized =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "Initialized",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchNftAppraisalOwnershipTransferred =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "OwnershipTransferred",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchNftAppraisalPaused =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "Paused",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"ProtocolAddressUpdated"`
 */
export const useWatchNftAppraisalProtocolAddressUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "ProtocolAddressUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"ServiceHandlerUpdated"`
 */
export const useWatchNftAppraisalServiceHandlerUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "ServiceHandlerUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"TokenLinkedToCard"`
 */
export const useWatchNftAppraisalTokenLinkedToCard =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "TokenLinkedToCard",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"TreasuryUnwhitelisted"`
 */
export const useWatchNftAppraisalTreasuryUnwhitelisted =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "TreasuryUnwhitelisted",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"TreasuryWhitelisted"`
 */
export const useWatchNftAppraisalTreasuryWhitelisted =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "TreasuryWhitelisted",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchNftAppraisalUnpaused =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "Unpaused",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchNftAppraisalUpgraded =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalAbi,
		eventName: "Upgraded",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__
 */
export const useReadNftAppraisalServiceHandlerContract =
	/*#__PURE__*/ createUseReadContract({ abi: nftAppraisalServiceHandlerAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"checkAppraisal"`
 */
export const useReadNftAppraisalServiceHandlerCheckAppraisal =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalServiceHandlerAbi,
		functionName: "checkAppraisal",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"decodeError"`
 */
export const useReadNftAppraisalServiceHandlerDecodeError =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalServiceHandlerAbi,
		functionName: "decodeError",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"decodeSuccess"`
 */
export const useReadNftAppraisalServiceHandlerDecodeSuccess =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalServiceHandlerAbi,
		functionName: "decodeSuccess",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"getAppraisalContract"`
 */
export const useReadNftAppraisalServiceHandlerGetAppraisalContract =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalServiceHandlerAbi,
		functionName: "getAppraisalContract",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"getServiceManager"`
 */
export const useReadNftAppraisalServiceHandlerGetServiceManager =
	/*#__PURE__*/ createUseReadContract({
		abi: nftAppraisalServiceHandlerAbi,
		functionName: "getServiceManager",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__
 */
export const useWriteNftAppraisalServiceHandlerContract =
	/*#__PURE__*/ createUseWriteContract({ abi: nftAppraisalServiceHandlerAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"handleSignedEnvelope"`
 */
export const useWriteNftAppraisalServiceHandlerHandleSignedEnvelope =
	/*#__PURE__*/ createUseWriteContract({
		abi: nftAppraisalServiceHandlerAbi,
		functionName: "handleSignedEnvelope",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__
 */
export const useSimulateNftAppraisalServiceHandlerContract =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalServiceHandlerAbi,
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"handleSignedEnvelope"`
 */
export const useSimulateNftAppraisalServiceHandlerHandleSignedEnvelope =
	/*#__PURE__*/ createUseSimulateContract({
		abi: nftAppraisalServiceHandlerAbi,
		functionName: "handleSignedEnvelope",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__
 */
export const useWatchNftAppraisalServiceHandlerContract =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalServiceHandlerAbi,
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `eventName` set to `"AppraisalErrorReceived"`
 */
export const useWatchNftAppraisalServiceHandlerAppraisalErrorReceived =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalServiceHandlerAbi,
		eventName: "AppraisalErrorReceived",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `eventName` set to `"AppraisalProcessed"`
 */
export const useWatchNftAppraisalServiceHandlerAppraisalProcessed =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalServiceHandlerAbi,
		eventName: "AppraisalProcessed",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `eventName` set to `"AppraisalSuccessReceived"`
 */
export const useWatchNftAppraisalServiceHandlerAppraisalSuccessReceived =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalServiceHandlerAbi,
		eventName: "AppraisalSuccessReceived",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `eventName` set to `"PermanentAppraisalFailure"`
 */
export const useWatchNftAppraisalServiceHandlerPermanentAppraisalFailure =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalServiceHandlerAbi,
		eventName: "PermanentAppraisalFailure",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `eventName` set to `"ServiceHandlerStatusUpdate"`
 */
export const useWatchNftAppraisalServiceHandlerServiceHandlerStatusUpdate =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftAppraisalServiceHandlerAbi,
		eventName: "ServiceHandlerStatusUpdate",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftHelpersAbi}__
 */
export const useReadNftHelpersContract = /*#__PURE__*/ createUseReadContract({
	abi: nftHelpersAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftHelpersAbi}__ and `functionName` set to `"IS_TEST"`
 */
export const useReadNftHelpersIsTest = /*#__PURE__*/ createUseReadContract({
	abi: nftHelpersAbi,
	functionName: "IS_TEST",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftHelpersAbi}__ and `functionName` set to `"excludeArtifacts"`
 */
export const useReadNftHelpersExcludeArtifacts =
	/*#__PURE__*/ createUseReadContract({
		abi: nftHelpersAbi,
		functionName: "excludeArtifacts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftHelpersAbi}__ and `functionName` set to `"excludeContracts"`
 */
export const useReadNftHelpersExcludeContracts =
	/*#__PURE__*/ createUseReadContract({
		abi: nftHelpersAbi,
		functionName: "excludeContracts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftHelpersAbi}__ and `functionName` set to `"excludeSelectors"`
 */
export const useReadNftHelpersExcludeSelectors =
	/*#__PURE__*/ createUseReadContract({
		abi: nftHelpersAbi,
		functionName: "excludeSelectors",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftHelpersAbi}__ and `functionName` set to `"excludeSenders"`
 */
export const useReadNftHelpersExcludeSenders =
	/*#__PURE__*/ createUseReadContract({
		abi: nftHelpersAbi,
		functionName: "excludeSenders",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftHelpersAbi}__ and `functionName` set to `"failed"`
 */
export const useReadNftHelpersFailed = /*#__PURE__*/ createUseReadContract({
	abi: nftHelpersAbi,
	functionName: "failed",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftHelpersAbi}__ and `functionName` set to `"targetArtifactSelectors"`
 */
export const useReadNftHelpersTargetArtifactSelectors =
	/*#__PURE__*/ createUseReadContract({
		abi: nftHelpersAbi,
		functionName: "targetArtifactSelectors",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftHelpersAbi}__ and `functionName` set to `"targetArtifacts"`
 */
export const useReadNftHelpersTargetArtifacts =
	/*#__PURE__*/ createUseReadContract({
		abi: nftHelpersAbi,
		functionName: "targetArtifacts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftHelpersAbi}__ and `functionName` set to `"targetContracts"`
 */
export const useReadNftHelpersTargetContracts =
	/*#__PURE__*/ createUseReadContract({
		abi: nftHelpersAbi,
		functionName: "targetContracts",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftHelpersAbi}__ and `functionName` set to `"targetInterfaces"`
 */
export const useReadNftHelpersTargetInterfaces =
	/*#__PURE__*/ createUseReadContract({
		abi: nftHelpersAbi,
		functionName: "targetInterfaces",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftHelpersAbi}__ and `functionName` set to `"targetSelectors"`
 */
export const useReadNftHelpersTargetSelectors =
	/*#__PURE__*/ createUseReadContract({
		abi: nftHelpersAbi,
		functionName: "targetSelectors",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftHelpersAbi}__ and `functionName` set to `"targetSenders"`
 */
export const useReadNftHelpersTargetSenders =
	/*#__PURE__*/ createUseReadContract({
		abi: nftHelpersAbi,
		functionName: "targetSenders",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__
 */
export const useWatchNftHelpersContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: nftHelpersAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log"`
 */
export const useWatchNftHelpersLog = /*#__PURE__*/ createUseWatchContractEvent({
	abi: nftHelpersAbi,
	eventName: "log",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_address"`
 */
export const useWatchNftHelpersLogAddress =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_address",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_array"`
 */
export const useWatchNftHelpersLogArray =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_array",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_bytes"`
 */
export const useWatchNftHelpersLogBytes =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_bytes",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_bytes32"`
 */
export const useWatchNftHelpersLogBytes32 =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_bytes32",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_int"`
 */
export const useWatchNftHelpersLogInt =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_int",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_named_address"`
 */
export const useWatchNftHelpersLogNamedAddress =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_named_address",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_named_array"`
 */
export const useWatchNftHelpersLogNamedArray =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_named_array",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_named_bytes"`
 */
export const useWatchNftHelpersLogNamedBytes =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_named_bytes",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_named_bytes32"`
 */
export const useWatchNftHelpersLogNamedBytes32 =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_named_bytes32",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_named_decimal_int"`
 */
export const useWatchNftHelpersLogNamedDecimalInt =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_named_decimal_int",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_named_decimal_uint"`
 */
export const useWatchNftHelpersLogNamedDecimalUint =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_named_decimal_uint",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_named_int"`
 */
export const useWatchNftHelpersLogNamedInt =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_named_int",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_named_string"`
 */
export const useWatchNftHelpersLogNamedString =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_named_string",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_named_uint"`
 */
export const useWatchNftHelpersLogNamedUint =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_named_uint",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_string"`
 */
export const useWatchNftHelpersLogString =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_string",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"log_uint"`
 */
export const useWatchNftHelpersLogUint =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: nftHelpersAbi,
		eventName: "log_uint",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftHelpersAbi}__ and `eventName` set to `"logs"`
 */
export const useWatchNftHelpersLogs = /*#__PURE__*/ createUseWatchContractEvent(
	{ abi: nftHelpersAbi, eventName: "logs" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link noncesAbi}__
 */
export const useReadNoncesContract = /*#__PURE__*/ createUseReadContract({
	abi: noncesAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link noncesAbi}__ and `functionName` set to `"nonces"`
 */
export const useReadNoncesNonces = /*#__PURE__*/ createUseReadContract({
	abi: noncesAbi,
	functionName: "nonces",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ownableAbi}__
 */
export const useReadOwnableContract = /*#__PURE__*/ createUseReadContract({
	abi: ownableAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ownableAbi}__ and `functionName` set to `"owner"`
 */
export const useReadOwnableOwner = /*#__PURE__*/ createUseReadContract({
	abi: ownableAbi,
	functionName: "owner",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ownableAbi}__
 */
export const useWriteOwnableContract = /*#__PURE__*/ createUseWriteContract({
	abi: ownableAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ownableAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteOwnableRenounceOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: ownableAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ownableAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteOwnableTransferOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: ownableAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ownableAbi}__
 */
export const useSimulateOwnableContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: ownableAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ownableAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateOwnableRenounceOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ownableAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ownableAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateOwnableTransferOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ownableAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ownableAbi}__
 */
export const useWatchOwnableContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: ownableAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ownableAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchOwnableOwnershipTransferred =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ownableAbi,
		eventName: "OwnershipTransferred",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__
 */
export const useReadOwnableUpgradeableContract =
	/*#__PURE__*/ createUseReadContract({ abi: ownableUpgradeableAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__ and `functionName` set to `"owner"`
 */
export const useReadOwnableUpgradeableOwner =
	/*#__PURE__*/ createUseReadContract({
		abi: ownableUpgradeableAbi,
		functionName: "owner",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__
 */
export const useWriteOwnableUpgradeableContract =
	/*#__PURE__*/ createUseWriteContract({ abi: ownableUpgradeableAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteOwnableUpgradeableRenounceOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: ownableUpgradeableAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteOwnableUpgradeableTransferOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: ownableUpgradeableAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__
 */
export const useSimulateOwnableUpgradeableContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: ownableUpgradeableAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateOwnableUpgradeableRenounceOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ownableUpgradeableAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateOwnableUpgradeableTransferOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: ownableUpgradeableAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ownableUpgradeableAbi}__
 */
export const useWatchOwnableUpgradeableContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: ownableUpgradeableAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ownableUpgradeableAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchOwnableUpgradeableInitialized =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ownableUpgradeableAbi,
		eventName: "Initialized",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ownableUpgradeableAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchOwnableUpgradeableOwnershipTransferred =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: ownableUpgradeableAbi,
		eventName: "OwnershipTransferred",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pausableUpgradeableAbi}__
 */
export const useReadPausableUpgradeableContract =
	/*#__PURE__*/ createUseReadContract({ abi: pausableUpgradeableAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pausableUpgradeableAbi}__ and `functionName` set to `"paused"`
 */
export const useReadPausableUpgradeablePaused =
	/*#__PURE__*/ createUseReadContract({
		abi: pausableUpgradeableAbi,
		functionName: "paused",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pausableUpgradeableAbi}__
 */
export const useWatchPausableUpgradeableContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: pausableUpgradeableAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pausableUpgradeableAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchPausableUpgradeableInitialized =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: pausableUpgradeableAbi,
		eventName: "Initialized",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pausableUpgradeableAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchPausableUpgradeablePaused =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: pausableUpgradeableAbi,
		eventName: "Paused",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pausableUpgradeableAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchPausableUpgradeableUnpaused =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: pausableUpgradeableAbi,
		eventName: "Unpaused",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__
 */
export const useReadProtocolTreasuryContract =
	/*#__PURE__*/ createUseReadContract({ abi: protocolTreasuryAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"REDEMPTION_PAYOUT_BPS"`
 */
export const useReadProtocolTreasuryRedemptionPayoutBps =
	/*#__PURE__*/ createUseReadContract({
		abi: protocolTreasuryAbi,
		functionName: "REDEMPTION_PAYOUT_BPS",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadProtocolTreasuryUpgradeInterfaceVersion =
	/*#__PURE__*/ createUseReadContract({
		abi: protocolTreasuryAbi,
		functionName: "UPGRADE_INTERFACE_VERSION",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"appraisalOracle"`
 */
export const useReadProtocolTreasuryAppraisalOracle =
	/*#__PURE__*/ createUseReadContract({
		abi: protocolTreasuryAbi,
		functionName: "appraisalOracle",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"asset"`
 */
export const useReadProtocolTreasuryAsset = /*#__PURE__*/ createUseReadContract(
	{ abi: protocolTreasuryAbi, functionName: "asset" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"economyManager"`
 */
export const useReadProtocolTreasuryEconomyManager =
	/*#__PURE__*/ createUseReadContract({
		abi: protocolTreasuryAbi,
		functionName: "economyManager",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"gachaTreasury"`
 */
export const useReadProtocolTreasuryGachaTreasury =
	/*#__PURE__*/ createUseReadContract({
		abi: protocolTreasuryAbi,
		functionName: "gachaTreasury",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"getRemainingRedemptionWindow"`
 */
export const useReadProtocolTreasuryGetRemainingRedemptionWindow =
	/*#__PURE__*/ createUseReadContract({
		abi: protocolTreasuryAbi,
		functionName: "getRemainingRedemptionWindow",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"isRedemptionEligible"`
 */
export const useReadProtocolTreasuryIsRedemptionEligible =
	/*#__PURE__*/ createUseReadContract({
		abi: protocolTreasuryAbi,
		functionName: "isRedemptionEligible",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"owner"`
 */
export const useReadProtocolTreasuryOwner = /*#__PURE__*/ createUseReadContract(
	{ abi: protocolTreasuryAbi, functionName: "owner" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"paused"`
 */
export const useReadProtocolTreasuryPaused =
	/*#__PURE__*/ createUseReadContract({
		abi: protocolTreasuryAbi,
		functionName: "paused",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadProtocolTreasuryProxiableUuid =
	/*#__PURE__*/ createUseReadContract({
		abi: protocolTreasuryAbi,
		functionName: "proxiableUUID",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"redemptionWindow"`
 */
export const useReadProtocolTreasuryRedemptionWindow =
	/*#__PURE__*/ createUseReadContract({
		abi: protocolTreasuryAbi,
		functionName: "redemptionWindow",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__
 */
export const useWriteProtocolTreasuryContract =
	/*#__PURE__*/ createUseWriteContract({ abi: protocolTreasuryAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"executeRedemption"`
 */
export const useWriteProtocolTreasuryExecuteRedemption =
	/*#__PURE__*/ createUseWriteContract({
		abi: protocolTreasuryAbi,
		functionName: "executeRedemption",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteProtocolTreasuryInitialize =
	/*#__PURE__*/ createUseWriteContract({
		abi: protocolTreasuryAbi,
		functionName: "initialize",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"onRevenueReceived"`
 */
export const useWriteProtocolTreasuryOnRevenueReceived =
	/*#__PURE__*/ createUseWriteContract({
		abi: protocolTreasuryAbi,
		functionName: "onRevenueReceived",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteProtocolTreasuryPause =
	/*#__PURE__*/ createUseWriteContract({
		abi: protocolTreasuryAbi,
		functionName: "pause",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteProtocolTreasuryRenounceOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: protocolTreasuryAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setAppraisalOracle"`
 */
export const useWriteProtocolTreasurySetAppraisalOracle =
	/*#__PURE__*/ createUseWriteContract({
		abi: protocolTreasuryAbi,
		functionName: "setAppraisalOracle",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setEconomyManager"`
 */
export const useWriteProtocolTreasurySetEconomyManager =
	/*#__PURE__*/ createUseWriteContract({
		abi: protocolTreasuryAbi,
		functionName: "setEconomyManager",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setGachaTreasury"`
 */
export const useWriteProtocolTreasurySetGachaTreasury =
	/*#__PURE__*/ createUseWriteContract({
		abi: protocolTreasuryAbi,
		functionName: "setGachaTreasury",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setRedemptionWindow"`
 */
export const useWriteProtocolTreasurySetRedemptionWindow =
	/*#__PURE__*/ createUseWriteContract({
		abi: protocolTreasuryAbi,
		functionName: "setRedemptionWindow",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"transferOut"`
 */
export const useWriteProtocolTreasuryTransferOut =
	/*#__PURE__*/ createUseWriteContract({
		abi: protocolTreasuryAbi,
		functionName: "transferOut",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteProtocolTreasuryTransferOwnership =
	/*#__PURE__*/ createUseWriteContract({
		abi: protocolTreasuryAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteProtocolTreasuryUnpause =
	/*#__PURE__*/ createUseWriteContract({
		abi: protocolTreasuryAbi,
		functionName: "unpause",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteProtocolTreasuryUpgradeToAndCall =
	/*#__PURE__*/ createUseWriteContract({
		abi: protocolTreasuryAbi,
		functionName: "upgradeToAndCall",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__
 */
export const useSimulateProtocolTreasuryContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: protocolTreasuryAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"executeRedemption"`
 */
export const useSimulateProtocolTreasuryExecuteRedemption =
	/*#__PURE__*/ createUseSimulateContract({
		abi: protocolTreasuryAbi,
		functionName: "executeRedemption",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateProtocolTreasuryInitialize =
	/*#__PURE__*/ createUseSimulateContract({
		abi: protocolTreasuryAbi,
		functionName: "initialize",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"onRevenueReceived"`
 */
export const useSimulateProtocolTreasuryOnRevenueReceived =
	/*#__PURE__*/ createUseSimulateContract({
		abi: protocolTreasuryAbi,
		functionName: "onRevenueReceived",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateProtocolTreasuryPause =
	/*#__PURE__*/ createUseSimulateContract({
		abi: protocolTreasuryAbi,
		functionName: "pause",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateProtocolTreasuryRenounceOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: protocolTreasuryAbi,
		functionName: "renounceOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setAppraisalOracle"`
 */
export const useSimulateProtocolTreasurySetAppraisalOracle =
	/*#__PURE__*/ createUseSimulateContract({
		abi: protocolTreasuryAbi,
		functionName: "setAppraisalOracle",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setEconomyManager"`
 */
export const useSimulateProtocolTreasurySetEconomyManager =
	/*#__PURE__*/ createUseSimulateContract({
		abi: protocolTreasuryAbi,
		functionName: "setEconomyManager",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setGachaTreasury"`
 */
export const useSimulateProtocolTreasurySetGachaTreasury =
	/*#__PURE__*/ createUseSimulateContract({
		abi: protocolTreasuryAbi,
		functionName: "setGachaTreasury",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setRedemptionWindow"`
 */
export const useSimulateProtocolTreasurySetRedemptionWindow =
	/*#__PURE__*/ createUseSimulateContract({
		abi: protocolTreasuryAbi,
		functionName: "setRedemptionWindow",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"transferOut"`
 */
export const useSimulateProtocolTreasuryTransferOut =
	/*#__PURE__*/ createUseSimulateContract({
		abi: protocolTreasuryAbi,
		functionName: "transferOut",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateProtocolTreasuryTransferOwnership =
	/*#__PURE__*/ createUseSimulateContract({
		abi: protocolTreasuryAbi,
		functionName: "transferOwnership",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateProtocolTreasuryUnpause =
	/*#__PURE__*/ createUseSimulateContract({
		abi: protocolTreasuryAbi,
		functionName: "unpause",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateProtocolTreasuryUpgradeToAndCall =
	/*#__PURE__*/ createUseSimulateContract({
		abi: protocolTreasuryAbi,
		functionName: "upgradeToAndCall",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__
 */
export const useWatchProtocolTreasuryContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: protocolTreasuryAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"AppraisalOracleUpdated"`
 */
export const useWatchProtocolTreasuryAppraisalOracleUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: protocolTreasuryAbi,
		eventName: "AppraisalOracleUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"EconomyManagerUpdated"`
 */
export const useWatchProtocolTreasuryEconomyManagerUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: protocolTreasuryAbi,
		eventName: "EconomyManagerUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"GachaTreasuryUpdated"`
 */
export const useWatchProtocolTreasuryGachaTreasuryUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: protocolTreasuryAbi,
		eventName: "GachaTreasuryUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchProtocolTreasuryInitialized =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: protocolTreasuryAbi,
		eventName: "Initialized",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchProtocolTreasuryOwnershipTransferred =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: protocolTreasuryAbi,
		eventName: "OwnershipTransferred",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchProtocolTreasuryPaused =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: protocolTreasuryAbi,
		eventName: "Paused",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"ProtocolRevenueReceived"`
 */
export const useWatchProtocolTreasuryProtocolRevenueReceived =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: protocolTreasuryAbi,
		eventName: "ProtocolRevenueReceived",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"ProtocolTransfer"`
 */
export const useWatchProtocolTreasuryProtocolTransfer =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: protocolTreasuryAbi,
		eventName: "ProtocolTransfer",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"RedemptionExecuted"`
 */
export const useWatchProtocolTreasuryRedemptionExecuted =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: protocolTreasuryAbi,
		eventName: "RedemptionExecuted",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"RedemptionWindowEnforced"`
 */
export const useWatchProtocolTreasuryRedemptionWindowEnforced =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: protocolTreasuryAbi,
		eventName: "RedemptionWindowEnforced",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"RedemptionWindowUpdated"`
 */
export const useWatchProtocolTreasuryRedemptionWindowUpdated =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: protocolTreasuryAbi,
		eventName: "RedemptionWindowUpdated",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchProtocolTreasuryUnpaused =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: protocolTreasuryAbi,
		eventName: "Unpaused",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchProtocolTreasuryUpgraded =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: protocolTreasuryAbi,
		eventName: "Upgraded",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uupsUpgradeableAbi}__
 */
export const useReadUupsUpgradeableContract =
	/*#__PURE__*/ createUseReadContract({ abi: uupsUpgradeableAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uupsUpgradeableAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadUupsUpgradeableUpgradeInterfaceVersion =
	/*#__PURE__*/ createUseReadContract({
		abi: uupsUpgradeableAbi,
		functionName: "UPGRADE_INTERFACE_VERSION",
	});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uupsUpgradeableAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadUupsUpgradeableProxiableUuid =
	/*#__PURE__*/ createUseReadContract({
		abi: uupsUpgradeableAbi,
		functionName: "proxiableUUID",
	});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link uupsUpgradeableAbi}__
 */
export const useWriteUupsUpgradeableContract =
	/*#__PURE__*/ createUseWriteContract({ abi: uupsUpgradeableAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link uupsUpgradeableAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteUupsUpgradeableUpgradeToAndCall =
	/*#__PURE__*/ createUseWriteContract({
		abi: uupsUpgradeableAbi,
		functionName: "upgradeToAndCall",
	});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link uupsUpgradeableAbi}__
 */
export const useSimulateUupsUpgradeableContract =
	/*#__PURE__*/ createUseSimulateContract({ abi: uupsUpgradeableAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link uupsUpgradeableAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateUupsUpgradeableUpgradeToAndCall =
	/*#__PURE__*/ createUseSimulateContract({
		abi: uupsUpgradeableAbi,
		functionName: "upgradeToAndCall",
	});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link uupsUpgradeableAbi}__
 */
export const useWatchUupsUpgradeableContract =
	/*#__PURE__*/ createUseWatchContractEvent({ abi: uupsUpgradeableAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link uupsUpgradeableAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchUupsUpgradeableUpgraded =
	/*#__PURE__*/ createUseWatchContractEvent({
		abi: uupsUpgradeableAbi,
		eventName: "Upgraded",
	});
