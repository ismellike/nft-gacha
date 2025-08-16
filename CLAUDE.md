# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an NFT Gacha system built on WAVS-DRAND infrastructure providing provably fair randomness for NFT distribution. The project consists of:

- **Smart Contracts** (Foundry): Gacha mechanics, NFT appraisal system, treasury management
- **Frontend** (Next.js): Game-Fi interface with glassmorphism design using React + XState state machines
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
pnpm build                # Production build
pnpm lint                 # Biome linting with auto-fix
pnpm format               # Biome formatting
pnpm codegen              # Generate TypeScript types from contracts

# IMPORTANT: Do not start development servers - only validate with tsc
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
- **Frontend State**: XState machines for complex async flows (gacha spinning, NFT reveals)
- **Global State**: Zustand store for app-wide state (gacha store in `src/stores/`)
- **Contract State**: Wagmi hooks with auto-generated TypeScript types

### Key State Machine
The gacha spinning flow is managed by `gachaSpinMachine.ts` with states:
- `idle` → `spinning` → `waitingForFulfillment` → `revealing` → `idle`
- Handles timeout/retry logic and automatic refunds for empty rarity pools

### Contract Integration
- **Type Generation**: `wagmi generate` creates TypeScript bindings from Foundry artifacts
- **Multi-Environment**: Config system supports local/testnet/mainnet with different contract addresses
- **Contract Hooks**: Auto-generated hooks like `useReadGachaGetRarityWeights()` 

### Component Architecture
- **Glass UI System**: Reusable glassmorphism components in `src/components/ui/`
- **Gacha Components**: Modular spin controls, history, reveal modals
- **State Integration**: Components consume XState actors and Zustand stores

### Configuration System
- **Environment-Aware**: `src/lib/gacha-config.ts` provides different contract addresses per environment
- **Type Safety**: Zod schemas validate environment variables and configurations
- **Build Integration**: Task runner syncs environment variables with NEXT_PUBLIC_ prefixes

## Important Development Notes

### Environment Setup
Always update `.env` file before running `task bootstrap`. The system requires proper wallet keys and service addresses.

### Contract Development
Run `task contracts:build` before `task frontend:codegen` to ensure TypeScript types are current.

### State Machine Debugging  
The gacha spinner uses persistent state that survives page refreshes. Check browser localStorage for pending spins during debugging.

### Testing
- Smart contracts use Foundry's testing framework
- Frontend components integrate with XState for predictable state transitions
- Mock contracts available in `contracts/test/mocks/` for isolated testing