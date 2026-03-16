import { createConfig } from "@ponder/core";
import { http } from "viem";
import { GachaAbi } from "./abis/GachaAbi";
import { GachaTreasuryAbi } from "./abis/GachaTreasuryAbi";

const RPC_URL = process.env.RPC_URL ?? "http://localhost:8545";
const CHAIN_ID = Number(process.env.CHAIN_ID ?? "31337");
const GACHA_ADDRESS = process.env.GACHA_ADDRESS as `0x${string}`;
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS as `0x${string}`;
const START_BLOCK = Number(process.env.START_BLOCK ?? "0");

export default createConfig({
  networks: {
    default: {
      chainId: CHAIN_ID,
      transport: http(RPC_URL),
    },
  },
  contracts: {
    Gacha: {
      network: "default",
      abi: GachaAbi,
      address: GACHA_ADDRESS,
      startBlock: START_BLOCK,
    },
    GachaTreasury: {
      network: "default",
      abi: GachaTreasuryAbi,
      address: TREASURY_ADDRESS,
      startBlock: START_BLOCK,
    },
  },
});
