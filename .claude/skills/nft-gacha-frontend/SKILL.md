---
name: nft-gacha-frontend
description: Next.js frontend with React, RainbowKit wallet, wagmi v3, Zustand state, glassmorphism UI. Use when editing frontend/, components, state management, or web3 integration. Triggers on "build a component", "fix the UI", "add a page", "connect wallet", "update the store", or "type check frontend".
metadata:
  author: ismellike
  version: 1.0.0
---

# NFT Gacha Frontend

## Tech Stack

- **Next.js 16** with App Router
- **React 19** + TypeScript
- **RainbowKit 2.2** - Wallet connection
- **wagmi v3** + Viem 2.42 - Web3 hooks
- **Zustand 5.0** - State with localStorage persistence
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Biome** - Linting/formatting

## Key Locations

- `frontend/src/app/` - App Router pages
- `frontend/src/components/` - Feature components (GachaCard, AdminControls)
- `frontend/src/ui/` - UI primitives (glassmorphism)
- `frontend/src/stores/gachaStore.ts` - Zustand store with persistence
- `frontend/src/async-utils/gachaSpinMachine.ts` - Async utilities (no XState)
- `frontend/src/generated.ts` - Auto-generated contract types (do not edit)
- `frontend/wagmi.ts` - wagmi configuration

## State Management

- Use Zustand stores in `src/stores/`; avoid new global patterns.
- Keep async orchestration in `src/async-utils/` helpers.
- Spin state flow: `idle -> spinning -> waitingForFulfillment -> revealing -> idle`

## Contract Integration

**Prefer wagmi codegen hooks** from `src/generated.ts` over generic `useReadContract`/`useWriteContract` whenever possible. The generated hooks are type-safe, contract-specific, and reduce boilerplate:
```typescript
// PREFER: codegen hooks (type-safe, no ABI/address needed)
const { data: spinPrice } = useReadGachaSpinPrice();
const { writeContract } = useWriteGacha();

// AVOID: generic hooks (only use when codegen hooks cause deep instantiation errors)
const { data } = useReadContract({ abi: gachaAbi, functionName: 'spinPrice', ... });
```

After contract changes: `task contracts:build && task frontend:codegen`

## Environment Variables

Edit root `.env.local` then run: `task frontend:sync-env`

## UI Style

Use glassmorphism primitives from `src/ui/`:
```tsx
<div className="glass-card p-4">
  {/* backdrop-blur, border, subtle transparency */}
</div>
```

## Examples

### Example 1: Add a new page
User says: "create an inventory page"
Actions:
1. Create `frontend/src/app/inventory/page.tsx`
2. Use glassmorphism layout with `glass-card`
3. Read NFTs via codegen hooks (e.g., `useReadGachaTreasuryGetUserNfts`)
4. Run `pnpm tsc` to validate
Result: New `/inventory` route with wallet-connected NFT display.

### Example 2: Add a Zustand store field
User says: "track the last spin result in the store"
Actions:
1. Edit `frontend/src/stores/gachaStore.ts`
2. Add field to interface with `| undefined` (exactOptionalPropertyTypes)
3. Add setter action
4. Run `pnpm tsc`
Result: New persisted state field available across components.

## Troubleshooting

### Error: "Type instantiation is excessively deep"
Cause: Some wagmi codegen hooks trigger TypeScript deep instantiation limits.
Solution: Use `useReadContract` directly with the ABI import instead of the generated hook.

### Error: Biome exhaustive-deps warning won't go away
Cause: Biome doesn't support disable comments for this rule.
Solution: Use the ref pattern: store value in a ref, read ref inside setInterval/useEffect, use empty dependency array.

### Error: `exactOptionalPropertyTypes` type mismatch
Cause: Optional props need explicit `| undefined`.
Solution: Change `prop?: string` to `prop?: string | undefined`.

### Error: Chip color "default" not accepted
Cause: `Chip` component only accepts specific color literals.
Solution: Map `"default"` to `"glass"` before passing to the Chip component.
