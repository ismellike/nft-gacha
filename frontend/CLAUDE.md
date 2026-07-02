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
- **Spin State Machine**: XState v5 machine in `src/machines/gachaSpinMachine.ts`, consumed via the React binding in `src/hooks/useGachaSpinMachine.ts`
- **Async Utilities**: Polling/storage helper functions in `src/async-utils/` invoked by the machine (not a state machine itself)
- **Zustand Store**: Global state in `src/stores/gachaStore.ts` for pending spins persistence
- **Wagmi Hooks**: Contract interactions with auto-generated TypeScript types

### Key Flow
The gacha spinning flow is driven by the XState v5 machine in `src/machines/gachaSpinMachine.ts` with explicit states:
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
- **State Integration**: Components consume Zustand stores and async utilities

### Configuration System
- **Environment-Aware**: `src/lib/gacha-config.ts` provides different contract addresses per environment
- **Type Safety**: Zod schemas validate environment variables in `src/env.ts`
- **Hot Reload**: Environment changes update `NEXT_PUBLIC_` prefixes automatically

### Key Directories
- `src/machines/` - XState v5 machines (spin flow: `gachaSpinMachine.ts`)
- `src/async-utils/` - Polling/storage helper functions invoked by the machine
- `src/stores/` - Zustand state management
- `src/hooks/` - Custom React hooks for contract interactions (incl. `useGachaSpinMachine.ts`)
- `src/lib/gacha-config.ts` - Environment-specific configurations
- `src/ui/` - Reusable UI components
- `src/generated.ts` - Auto-generated contract types

## Important Development Notes

### Code Quality
- Always run `pnpm tsc` before committing to ensure type safety
- Use `pnpm lint` to fix formatting and import issues automatically
- Biome handles both linting and formatting with tabs for indentation
- Do not run `pnpm dev`, `pnpm build`, or `next` commands here

### Contract Development
- Run `pnpm codegen` after contract changes to update TypeScript types
- Contract types are generated from `../contracts` Foundry artifacts
- Wagmi hooks follow pattern `use<Type><Contract><Function>()`

### Flow Debugging
- The gacha spinner uses persistent state in localStorage
- Check browser localStorage for pending spins during debugging
- The spin flow includes retry logic and timeout handling

### Environment Configuration
- Environment variables defined in root directory `.env` file
- Frontend automatically prefixes with `NEXT_PUBLIC_` via task runner
- Environment switching updates contract addresses and RPC endpoints

## Production Readiness Checklist

- `pnpm tsc` passes with no errors
- `pnpm lint` and `pnpm format` are clean
- `pnpm codegen` run after any contract ABI changes
- Environment variables validated by `src/env.ts`
- Gacha flow validated against `src/machines/gachaSpinMachine.ts`
