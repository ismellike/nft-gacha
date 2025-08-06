import { env } from '@/env'

export interface GachaConfig {
  id: string
  address: string
  title: string
  description: string
  longDescription: string
  theme: string
  treasuryAddress: string
  isActive: boolean
  createdAt: string
}

// Gacha configurations by ID (for clean URLs)
export const GACHA_CONFIGS: Record<string, GachaConfig> = {
  "graded-pokemon": {
    id: "graded-pokemon",
    address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
    title: "Graded Pokemon Cards",
    description: "Collect graded Pokemon cards from different rarities. Each spin unlocks authentic Pokemon trading cards with verified grades and pristine condition.",
    longDescription: `
      Welcome to Graded Pokemon Cards - our flagship gacha experience featuring professionally graded Pokemon trading cards with verified authenticity and condition.
      
      Each Pokemon card belongs to one of five rarity tiers, with increasing scarcity and collectible value. Common cards provide great entry points for any collection,
      while Legendary cards are the holy grail that every Pokemon collector dreams of owning.
      
      The rarity system is completely transparent and verifiable on-chain, ensuring fair distribution across all participants.
    `,
    theme: "from-blue-500 to-yellow-500",
    treasuryAddress: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
    isActive: true,
    createdAt: "2024-01-01"
  }
  // Future gachas would be added here with clean IDs as keys:
  // "sports-cards": { id: "sports-cards", address: "0x...", ... }
}

// Get gacha config by ID (for routing)
export function getGachaConfig(id: string): GachaConfig | null {
  return GACHA_CONFIGS[id] || null
}

// Get gacha config by contract address (for blockchain interactions)
export function getGachaConfigByAddress(address: string): GachaConfig | null {
  return Object.values(GACHA_CONFIGS).find(
    gacha => gacha.address.toLowerCase() === address.toLowerCase()
  ) || null
}

export function getAllActiveGachas(): GachaConfig[] {
  return Object.values(GACHA_CONFIGS).filter(gacha => gacha.isActive)
}

export function formatGachaAddress(address: string): string {
  if (!address) return ''
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}