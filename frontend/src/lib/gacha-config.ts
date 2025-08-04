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
  "epic-heroes": {
    id: "epic-heroes",
    address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
    title: "Epic Heroes Collection",
    description: "Collect legendary heroes from different rarities. Each spin unlocks powerful NFTs with unique abilities and stunning artwork.",
    longDescription: `
      Welcome to the Epic Heroes Collection - our flagship gacha experience featuring hand-crafted NFTs with stunning artwork and unique abilities.
      
      Each hero belongs to one of five rarity tiers, with increasing power and exclusivity. Common heroes form the backbone of any collection,
      while Legendary heroes are the crown jewels that every collector seeks.
      
      The rarity system is completely transparent and verifiable on-chain, ensuring fair distribution across all participants.
    `,
    theme: "from-purple-500 to-blue-600",
    treasuryAddress: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
    isActive: true,
    createdAt: "2024-01-01"
  }
  // Future gachas would be added here with clean IDs as keys:
  // "mystical-creatures": { id: "mystical-creatures", address: "0x...", ... }
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