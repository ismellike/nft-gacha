# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an NFT Gacha system built on WAVS-DRAND infrastructure providing provably fair randomness for NFT distribution. The project consists of:

- **Smart Contracts** (Foundry): Gacha mechanics, NFT appraisal system, treasury management
- **Frontend** (Next.js): Game-Fi interface with glassmorphism design using React + Zustand state management
- **Backend Infrastructure**: WAVS aggregator/instance services for cryptographic randomness
- **Task Automation**: Comprehensive Task runner for all development workflows

## Essential Development Commands

### Full System Bootstrap
```bash
# Complete system setup (contracts + frontend + backend)
task bootstrap

# Individual components
task contracts:build       # Build smart contracts  
task contracts:test        # Run contract tests
task contracts:deploy      # Deploy to local WAVS chain
task backend:start         # Start WAVS backend services
```

### Frontend Development
```bash
# In frontend/ directory
pnpm tsc                  # Type checking (use this to validate code)
pnpm lint                 # Biome linting with auto-fix
pnpm format               # Biome formatting
pnpm codegen              # Generate TypeScript types from contracts

# IMPORTANT: NEVER use these commands - they interfere with user workflow:
# - pnpm dev (development server)
# - pnpm build (production build) 
# - next build (Next.js build)
# - next dev (Next.js dev server)
# Only validate code with pnpm tsc
```

### Smart Contract Development
```bash
# In contracts/ directory
forge build               # Compile contracts
forge test                # Run all tests
forge test --match-test <test_name>  # Run specific test
```

## Architecture

### State Management
- **Frontend State**: Zustand stores with localStorage persistence for global state
- **Async Utilities**: Pure utility functions for complex async flows (gacha spinning, NFT reveals) in `src/async-utils/`
- **Contract State**: Wagmi hooks with auto-generated TypeScript types

### Key Async Flow
The gacha spinning flow uses utility functions in `async-utils/gachaSpinMachine.ts` with states:
- `idle` → `spinning` → `waitingForFulfillment` → `revealing` → `idle`
- Handles timeout/retry logic and automatic refunds for empty rarity pools
- No XState - uses Zustand for persistence and pure functions for async operations

### Contract Integration
- **Type Generation**: `wagmi generate` creates TypeScript bindings from Foundry artifacts
- **Multi-Environment**: Config system supports local/testnet/mainnet with different contract addresses
- **Contract Hooks**: Auto-generated hooks like `useReadGachaGetRarityWeights()` 

### Component Architecture
- **Glass UI System**: Reusable glassmorphism components in `frontend/src/ui/`
- **Gacha Components**: Modular spin controls, history, reveal modals in `frontend/src/components/`
- **State Integration**: Components consume async utilities and Zustand stores

### Configuration System
- **Environment-Aware**: `src/lib/gacha-config.ts` provides different contract addresses per environment
- **Type Safety**: Zod schemas validate environment variables and configurations
- **Build Integration**: Task runner syncs environment variables with NEXT_PUBLIC_ prefixes

## Architecture Diagrams

### Gacha Spin Flow
```
User clicks spin
    ↓
Frontend: writeContract({ spinGacha })
    ↓
Gacha contract: RandomnessRequested event
    ↓
WAVS Operator detects trigger
    ↓
wavs_drand component: Fetch DRAND + derive VRF
    ↓
Aggregator: Batch submissions
    ↓
Gacha contract: SpinCompleted event
    ↓
Frontend: Polls for event, reveals NFT
```

### Contract Architecture
```
Gacha.sol (Main game logic)
    ├─→ Calls NFTAppraisal for prices
    ├─→ Uses WAVS for randomness
    └─→ Emits SpinCompleted

GachaTreasury.sol (NFT storage)
    ├─→ Assigns rarity by price
    ├─→ Stores NFTs by rarity pool
    ├─→ Calls CardGroupedVault for card-level tracking
    └─→ Mints to winners

GachaEconomyManager.sol (Fees & yield)
    ├─→ Collects spin fees
    ├─→ Routes yield per-rarity to CardGroupedVault
    └─→ Queues yield when rarity pool empty

CardGroupedVault.sol (Card-grouped yield)
    ├─→ Per-rarity yield pools (5 tiers)
    ├─→ O(1) price updates via correction accumulator
    └─→ O(1) rarity migration with yield settlement
```

### Frontend State Flow
```
User action
    ↓
Zustand store (persisted in localStorage)
    ↓
Contract interaction (wagmi hooks)
    ↓
Wait for events (polling utilities)
    ↓
Update store → React re-renders
```

## TypeScript & Linting Gotchas

- **`exactOptionalPropertyTypes: true`**: Optional props must explicitly include `| undefined` (e.g., `prop?: string | undefined`)
- **Wagmi generated hook deep instantiation**: Some hooks (e.g., `useReadGachaTreasuryGetUserProfileBatch`) cause "Type instantiation is excessively deep" with `as Parameters<typeof hook>[0]`. Workaround: use `useReadContract` directly with the ABI import instead.
- **Biome exhaustive deps**: No disable comments work. For interval tickers, use a ref pattern: store value in ref, read ref inside setInterval, use empty dependency array.
- **Chip color mapping**: `RarityConfigItem.chipColor` can be `"default"` but `Chip` component only accepts `"primary" | "secondary" | "danger" | "ghost" | "warning" | "success" | "glass"`. Map `"default"` to `"glass"`.

## Commit Conventions

Use conventional commits:
```
<type>(<scope>): <subject>
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

**Scopes**: `contracts`, `frontend`, `packages`, `backend`, `tasks`, `deps`

## Important Development Notes

### Environment Setup
Always update `.env` file before running `task bootstrap`. The system requires proper wallet keys and service addresses.

### Contract Development
Run `task contracts:build` before `task frontend:codegen` to ensure TypeScript types are current.

### State Machine Debugging
The gacha spinner uses persistent state that survives page refreshes. Check browser localStorage for pending spins during debugging.

### Testing
- Smart contracts use Foundry's testing framework
- Frontend uses Zustand stores with persist middleware for state management
- Mock contracts available in `contracts/test/mocks/` for isolated testing
