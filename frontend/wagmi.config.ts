import { defineConfig } from '@wagmi/cli'
import { foundry } from '@wagmi/cli/plugins'
import type { Plugin } from '@wagmi/cli'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Custom plugin to include deployed contract addresses
function deployedAddresses(): Plugin {
  return {
    name: 'deployed-addresses',
    async run() {
      try {
        const envPath = resolve(__dirname, '../.env.local')
        const envContent = readFileSync(envPath, 'utf-8')
        const addresses: Record<string, string> = {}

        envContent.split('\n').forEach(line => {
          const [key, value] = line.split('=')
          if (key && value && key.endsWith('_ADDRESS')) {
            addresses[key] = value.trim()
          }
        })

        if (Object.keys(addresses).length === 0) {
          return {
            imports: '',
            content: '// No deployed addresses found - run `task contracts:deploy` first',
          }
        }

        const addressExports = Object.entries(addresses)
          .map(([key, value]) => {
            const name = key.replace('_ADDRESS', '').toLowerCase()
            return `export const ${name}Address = '${value}' as const`
          })
          .join('\n')

        const allAddresses = Object.entries(addresses)
          .reduce((acc, [key, value]) => {
            const name = key.replace('_ADDRESS', '').toLowerCase()
            acc[name] = value
            return acc
          }, {} as Record<string, string>)

        return {
          imports: '',
          content: `
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Deployed Contract Addresses
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

${addressExports}

export const deployedAddresses = {
${Object.entries(allAddresses).map(([name, address]) => `  ${name}: '${address}',`).join('\n')}
} as const

export type DeployedContract = keyof typeof deployedAddresses
`,
        }
      } catch (error) {
        console.warn('⚠️  Could not load .env.local - addresses will not be included in codegen')
        return {
          imports: '',
          content: '// No deployed addresses found - run `task contracts:deploy` first',
        }
      }
    },
  }
}

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [],
  plugins: [
    foundry({
      project: '../contracts',
      include: [
        // Main production contracts
        'Gacha.sol/**',
        'GachaTreasury.sol/**',
        'GachaServiceHandler.sol/**',
        'GachaRewardsManager.sol/**',
        'RarityDividendTracker.sol/**',
      ],
    }),
    deployedAddresses(),
  ],
})