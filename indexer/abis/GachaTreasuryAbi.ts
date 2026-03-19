export const GachaTreasuryAbi = [
  {
    type: "event",
    name: "NFTDeposited",
    inputs: [
      { name: "collection", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "depositor", type: "address", indexed: true },
      { name: "rarity", type: "uint8", indexed: false },
      { name: "appraisedPrice", type: "uint256", indexed: false },
    ],
  },
] as const;
