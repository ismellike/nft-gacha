# Frontend-New Agent Guide

## Scope
- Build a brand-new public-facing frontend in `/frontend-new` (do not touch the existing `/frontend` app).
- Use `DESIGN.md` as the product source of truth: WAVS-backed randomness + appraisal, Pokémon (Courtyard) as first gacha, rarity bands, revenue split, redemption window, depositor yield.

## Tech & Conventions
- Stack (use this unless told otherwise): Next.js (App Router), TypeScript, Tailwind + shadcn/ui, wagmi + viem, RainbowKit, Zustand (global UI state), TanStack React Query (async + caching), React Hook Form + Zod, Sonner (toasts), Lucide-react (icons).
- Styling: Tailwind first; keep design tokens in a single theme file; avoid default system fonts—pick an intentional primary/secondary pair.
- Code style: 2-space indent, functional React components in PascalCase, hooks in `useCamelCase`. Prefer composition over large pages; colocate UI in `components/`, hooks in `hooks/`, data/config in `lib/`.
- Env: client-safe vars as `NEXT_PUBLIC_*`. Keep secret config out of git; provide `.env.example` when adding new vars.
- Scripts (define once scaffolded): `pnpm -C frontend-new dev`, `pnpm -C frontend-new build`, `pnpm -C frontend-new lint`, `pnpm -C frontend-new format`.

## Runtime targets & SPA stance
- App should behave as a SPA: prioritize client components where possible; avoid server actions/data dependencies that block hydration. App Router is fine—just keep page shells client-side and data via React Query.
- Environment switching: use a single config loader (e.g., `lib/env.ts`) that maps `NEXT_PUBLIC_CHAIN_ENV=mock|devnet|testnet|mainnet` to chain IDs, RPCs, contract addresses, and feature flags. Keep all per-env addresses in one place (`lib/chains.ts`).
- Local mocks: if no chain available, gate an MSW/mock-mode or Anvil fork behind `CHAIN_ENV=mock`; stub wagmi `publicClient`/`walletClient` accordingly and surface a visible “Mock mode” badge.
- Dev/Testnet/Prod: drive wagmi `config` from `CHAIN_ENV`; ensure RainbowKit has the same chain list. Provide npm scripts or Task targets to run each profile (e.g., `pnpm dev` uses `mock`, `pnpm dev:testnet` uses `testnet`, etc.).

## Product Requirements (grounded in DESIGN.md)
- Hero/landing: explain provable fairness (WAVS + drand), price-aware vaults, depositor yield, and redemption/buyback (85% within window). Show current featured gacha (Pokémon graded).
- Spin flow:
  - Show rarity odds (default 70/20/6/3/1) and live inventory counts from `GachaTreasury`.
  - Wallet connect, USDC balance check, approval + `spin` call, with status states: requested → completed/refunded/reclaimed.
  - Display won NFT card (collection, tokenId, appraised price) and redemption eligibility countdown.
- Depositor flow:
  - Guide: appraisal request → deposit → earning yield per spin. Surfaces user deposit counts/value per rarity, pending yield, claim button (via `DepositorVault.claimYield`).
  - Show protocol/depositor split (default 95/5) and queued yield note when no shares exist.
- Analytics:
  - Global: total spins/refunds/reclaims, rarity win counts, treasury TVL (sum of appraised prices), revenue routed to depositors/protocol.
  - User: spin history, rarity win counts, refunds/reclaims, deposits by rarity, lifetime claimed.
- Admin/controls (surface read-only unless connected wallet is owner): pause states, rarity weights, spin fee, redemption window, whitelist info.

## UX & Visual Direction
- Avoid generic layouts; pick a coherent visual language (e.g., bold card-grid with glassy panels, subtle gradient background, accent color pulled from Pokémon palette). Provide motion on page-load/spin result reveals (stagger/fade/scale).
- Use large, legible odds displays; show “provably fair” badge referencing WAVS validation. Make empty rarity pools visibly disabled.
- Mobile-first responsive layout; ensure controls stay reachable and readable.

## Data/Contract Integration
- Contracts of interest (per DESIGN.md): `Gacha`, `GachaTreasury`, `GachaEconomyManager`, `DepositorVault`, `ProtocolTreasury`, `NFTAppraisal` (read-only for status), WAVS handlers (events).
- Build a single config file mapping chain IDs → contract addresses/ABIs. Fetch dynamic weights/counts from chain instead of hardcoding the example odds.
- Reflect timeout/reclaim UX (30s) and redemption window countdown from `ProtocolTreasury.getRemainingRedemptionWindow`.
- Handle empty rarity refund path and show status reason; handle reclaim flow if randomness fails.

## Delivery Expectations
- Keep components small and testable; add story or visual fixtures only if they speed iteration.
- Prefer optimistic UI with clear pending/success/error states; never hide on-chain failures.
- When adding assets, keep them in `/frontend-new/public/`; avoid non-ASCII text unless needed.
- If adding tests, colocate (e.g., `__tests__` or `.test.tsx`) and ensure `pnpm -C frontend-new build` passes.

## Out of Scope
- Do not modify contracts or backend from this agent. Avoid touching `frontend/` unless explicitly asked.
