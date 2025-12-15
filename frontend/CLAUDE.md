# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Frontend Overview

This is the frontend for an NFT Gacha system built on WAVS-DRAND infrastructure. It's a Next.js application with glassmorphism design using React, TypeScript, and modern Web3 technologies.

## Essential Development Commands

### Code Quality & Type Checking
```bash
pnpm tsc                  # Type checking (use this to validate code)
pnpm lint                 # Biome linting with auto-fix
pnpm format               # Biome formatting
```

### Contract Integration
```bash
pnpm codegen              # Generate TypeScript types from contracts
```

### Package Management
```bash
pnpm install              # Install dependencies
pnpm deadcode             # Find unused code
```

## Architecture

### State Management
- **XState Machines**: Complex async flows (gacha spinning, NFT reveals) in `src/machines/`
- **Zustand Store**: Global state in `src/stores/gachaStore.ts` for pending spins persistence
- **Wagmi Hooks**: Contract interactions with auto-generated TypeScript types

### Key State Machine
The gacha spinning flow uses `gachaSpinMachine.ts` with states:
- `idle` → `spinning` → `waitingForFulfillment` → `revealing` → `idle`
- Handles timeout/retry logic and automatic refunds for empty rarity pools
- Persistent state survives page refreshes via localStorage

### Contract Integration
- **Type Generation**: `wagmi generate` creates TypeScript bindings from Foundry artifacts
- **Multi-Environment**: Config system supports local/testnet/mainnet with different contract addresses
- **Generated Hooks**: Auto-generated hooks like `useReadGachaGetRarityWeights()`

### Component Architecture
- **Glass UI System**: Reusable glassmorphism components in `src/ui/`
- **Gacha Components**: Modular spin controls, history, reveal modals in `src/components/`
- **State Integration**: Components consume XState actors and Zustand stores

### Configuration System
- **Environment-Aware**: `src/lib/gacha-config.ts` provides different contract addresses per environment
- **Type Safety**: Zod schemas validate environment variables in `src/env.ts`
- **Hot Reload**: Environment changes update `NEXT_PUBLIC_` prefixes automatically

### Key Directories
- `src/machines/` - XState state machines for complex flows
- `src/stores/` - Zustand state management
- `src/hooks/` - Custom React hooks for contract interactions
- `src/lib/gacha-config/` - Environment-specific configurations
- `src/ui/` - Reusable UI components
- `src/generated.ts` - Auto-generated contract types

## Important Development Notes

### Code Quality
- Always run `pnpm tsc` before committing to ensure type safety
- Use `pnpm lint` to fix formatting and import issues automatically
- Biome handles both linting and formatting with tabs for indentation

### Contract Development
- Run `pnpm codegen` after contract changes to update TypeScript types
- Contract types are generated from `../contracts` Foundry artifacts
- Wagmi hooks follow pattern `use<Type><Contract><Function>()`

### State Machine Debugging
- The gacha spinner uses persistent state in localStorage
- Check browser localStorage for pending spins during debugging
- State machines handle complex async flows with built-in retry logic

### Environment Configuration
- Environment variables defined in root directory `.env` file
- Frontend automatically prefixes with `NEXT_PUBLIC_` via task runner
- Environment switching updates contract addresses and RPC endpoints