export const GachaAbi = [
  {
    type: "event",
    name: "SpinCompleted",
    inputs: [
      { name: "triggerId", type: "uint256", indexed: true },
      { name: "requester", type: "address", indexed: true },
      { name: "rarity", type: "uint8", indexed: false },
      { name: "collection", type: "address", indexed: false },
      { name: "tokenId", type: "uint256", indexed: false },
      { name: "appraisedPrice", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "SpinRefunded",
    inputs: [
      { name: "triggerId", type: "uint256", indexed: true },
      { name: "requester", type: "address", indexed: true },
      { name: "selectedRarity", type: "uint8", indexed: false },
      { name: "refundAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "SpinReclaimed",
    inputs: [
      { name: "triggerId", type: "uint256", indexed: true },
      { name: "requester", type: "address", indexed: true },
      { name: "refundAmount", type: "uint256", indexed: false },
    ],
  },
] as const;
