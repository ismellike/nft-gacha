# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NFT Gacha system on WAVS-DRAND infrastructure for provably fair randomness in NFT distribution:

- **Smart Contracts** (Foundry): Gacha mechanics, NFT appraisal, treasury - `contracts/`
- **Frontend** (Next.js): Game-Fi interface with glassmorphism design - `frontend/`
- **Backend**: WAVS aggregator/instance services for cryptographic randomness - `backend/`
- **WASI Components** (Rust): Off-chain compute for appraisal & randomness - `packages/`
- **Task Automation**: Comprehensive Task runner for all workflows - `Taskfile.yml`

For detailed architecture, contract flow diagrams, and component references, see the relevant `.claude/skills/` SKILL.md files.

## Essential Development Commands

### Full System Bootstrap
```bash
task bootstrap                 # Complete system setup
task contracts:build           # Build smart contracts
task contracts:test            # Run contract tests
task contracts:deploy          # Deploy to local WAVS chain
task backend:start             # Start WAVS backend services
```

### Frontend Development
```bash
# In frontend/ directory
pnpm tsc                      # Type checking (use this to validate code)
pnpm lint                     # Biome linting with auto-fix
pnpm format                   # Biome formatting
pnpm codegen                  # Generate TypeScript types from contracts
```

**IMPORTANT: NEVER run these commands** - they interfere with user workflow:
- `pnpm dev`, `pnpm build`, `next build`, `next dev`
- Only validate code with `pnpm tsc`

### Smart Contract Development
```bash
# In contracts/ directory
forge build                    # Compile contracts
forge test                     # Run all tests
forge test --match-test <name> # Run specific test
```

### After Contract Changes
```bash
task contracts:build           # 1. Rebuild
task contracts:test            # 2. Run tests
task frontend:codegen          # 3. Regenerate TypeScript types
```

## TypeScript & Linting Gotchas

- **`exactOptionalPropertyTypes: true`**: Optional props must explicitly include `| undefined` (e.g., `prop?: string | undefined`)
- **Wagmi generated hook deep instantiation**: Some hooks cause "Type instantiation is excessively deep". Workaround: use `useReadContract` directly with the ABI import instead.
- **Biome exhaustive deps**: No disable comments work. Use ref pattern: store value in ref, read ref inside setInterval, use empty dependency array.
- **Chip color mapping**: `RarityConfigItem.chipColor` can be `"default"` but `Chip` only accepts specific literals. Map `"default"` to `"glass"`.

## Key Architectural Decisions

- **State**: Zustand stores with localStorage persistence. Async orchestration in `src/async-utils/`.
- **Spin flow**: `idle` -> `spinning` -> `waitingForFulfillment` -> `revealing` -> `idle` (no XState).
- **Contract types**: Auto-generated via `wagmi generate` from Foundry artifacts. Never edit `src/generated.ts`.
- **Config**: Environment-aware via `src/lib/gacha-config.ts` with Zod validation.
- **UI**: Glassmorphism primitives in `frontend/src/ui/`.

## Commit Conventions

```
<type>(<scope>): <subject>
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`
**Scopes**: `contracts`, `frontend`, `packages`, `backend`, `tasks`, `deps`

## Important Development Notes

- Always update `.env` before running `task bootstrap`.
- Run `task contracts:build` before `task frontend:codegen` to ensure types are current.
- The gacha spinner uses persistent state that survives page refreshes. Check browser localStorage for pending spins during debugging.
- Mock contracts available in `contracts/test/mocks/` for isolated testing.
