import { z } from 'zod'

// Helper to transform string to address type
const addressSchema = z.string().transform((val): `0x${string}` => val as `0x${string}`)

// Environment variable schema with proper typing - all required
const envSchema = z.object({
  // Contract addresses - properly typed as `0x${string}`
  NEXT_PUBLIC_NFT_CONTRACT_ADDRESS: addressSchema,
  NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS: addressSchema,
  NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS: addressSchema,

  // Wallet configuration
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string(),

  // Development flags - properly typed as boolean
  NEXT_PUBLIC_ENABLE_TESTNETS: z.string().transform(val => val === 'true'),

  // Private key for development - properly typed as `0x${string}`
  NEXT_PUBLIC_PRIVATE_KEY: addressSchema,

  // Mint address for development - properly typed as `0x${string}`
  NEXT_PUBLIC_MINT_TO_ADDRESS: addressSchema,
})

// Parse environment variables with error handling
const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('\n')
      throw new Error(`❌ Invalid environment variables:\n${issues}`)
    }
    throw error
  }
}

// Export typed environment variables
export const env = parseEnv()

// Type for environment variables
export type Env = z.infer<typeof envSchema>
