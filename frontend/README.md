# Frontend (Next.js)

This app is the UI for the NFT Gacha system. It uses Next.js, React, TypeScript, Wagmi, and RainbowKit with a glassmorphism UI system.

## Setup

```bash
# From repo root
cd frontend
pnpm install
```

Environment variables live in the repo root `.env`. See `frontend/src/env.ts` for validation rules and `frontend/src/lib/gacha-config.ts` for environment-specific contract addresses.

## Code Quality

```bash
pnpm tsc      # Type checking (primary validation command)
pnpm lint     # Biome linting (auto-fix)
pnpm format   # Biome formatting
```

## Contract Integration

```bash
pnpm codegen  # Generate TypeScript types from Foundry artifacts
```

Run `pnpm codegen` after contract changes to keep `frontend/src/generated.ts` current.

## Notes

- Do not run `pnpm dev` or `pnpm build` here. Use `pnpm tsc` for validation.
- UI and interaction guidelines live in `DESIGN.md`.
- For agent-focused instructions, see `frontend/CLAUDE.md`.
