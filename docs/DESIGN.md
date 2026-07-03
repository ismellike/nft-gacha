# SPINFI — Design Document

## 1) Goals
- Provably fair decentralized NFT gacha using WAVS (WebAssembly Verifiable Services) for randomness and appraisal.
- Start with graded Pokémon cards (Courtyard inventory) and expand to multiple gachas/collections.
- Price-aware vaults segmented by rarity so spins pull from the correct value band.
- Reward liquidity providers (depositors) with yield on every spin; allow protocol-controlled buybacks/redemptions.
- Provide transparent analytics (live draw odds, treasury contents, win/refund/reclaim stats).

## 2) Actors
- **Spinner**: pays `spinFee` (USDC) to get a random NFT; can reclaim if fulfillment times out.
- **Depositor**: supplies NFTs after appraisal; earns pro‑rata USDC yield via the depositor vault.
- **Protocol/DAO**: configures parameters, manages vault splits, receives protocol fee, executes buybacks.
- **WAVS AVS**: signs drand randomness envelopes and appraisal payloads.
- **Courtyard data source**: upstream graded Pokémon prices → fed into WAVS appraisal service.

## 3) On‑chain architecture (contracts/src)
- **Gacha (`gacha/Gacha.sol`)**
  - Accepts spins; draw odds are uniform-over-pool (a tier is chosen with probability `counts[i] / totalCount`, then a uniform NFT within it). There is no configurable rarity-weight knob — the live odds *are* the current inventory composition (`getCurrentRarityWeights()`).
  - Emits `RandomnessRequested(triggerId)` and tracks `SpinRequest` with timeout (30s reclaim window).
  - `fulfillRandomness` (called only by the WAVS handler) draws a tier and NFT, refunds if pool empty, sends NFT from treasury, and forwards fee to the economy manager.
  - Spin analytics: user/global counts, rarity wins, refunds/reclaims, treasury distribution/TVL helpers.
- **Randomness entrypoint (`gacha/GachaServiceHandler.sol`)**
  - Implements `IWavsServiceHandler`; WAVS service manager validates envelope signatures then forwards `{triggerId, randomness}` to `Gacha.fulfillRandomness`.
- **Treasury (`gacha/GachaTreasury.sol`)**
  - Holds NFTs bucketed by rarity; rarity derived from USD appraisal bands (set at init; Legendary upper bound can be `type(uint256).max`).
  - Whitelists NFT collections; rejects un‑appraised tokens.
  - Swap‑and‑pop storage for O(1) random NFT extraction; records receive times to enforce redemption window.
  - Tracks depositor counts/value, cardId groupings, lifetime stats, and syncs deposit weights to CardGroupedVault.
  - Supports rarity migration when appraisals move, withdrawal by depositor, redemption restocking from ProtocolTreasury.
- **Economics**
  - **GachaEconomyManager (`economy/GachaEconomyManager.sol`)**: splits spin revenue (default 95% depositors / 5% protocol, adjustable) and handles queued yield when no shares exist. Auto-claims protocol’s vault yield if present.
  - **CardGroupedVault (`economy/CardGroupedVault.sol`)**: card-grouped yield vault using a correction-accumulator pattern for O(1) price updates and rarity migrations. Yield is distributed **globally by appraisal value across the whole pool** — every card earns its value share of each spin's depositor cut, independent of which rarity the spin hit (the hit rarity is analytics only). This keeps expected depositor P&L value-neutral across tiers; the earlier per-hit-rarity routing left above-mean cards (Epic/Legendary) structurally underwater. Supports claim by user or economy manager; records claims back into treasury analytics.
  - **ProtocolTreasury (`economy/ProtocolTreasury.sol`)**: receives protocol fee, executes buybacks/redemptions at 80% of appraisal (`REDEMPTION_PAYOUT_BPS = 8_000`), paying against `min(win-time snapshot, live appraisal)` so it never overpays if the market fell; restocks NFTs into treasury, enforces redemption window (default 1h).
- **Appraisal**
  - **NFTAppraisal (`appraisal/NFTAppraisal.sol`)**: user requests appraisal (pays fee), tracks token→cardId mapping, stores card-level price in 1e18 USD. Whitelisted treasuries auto-migrate rarities on price updates.
  - **NFTAppraisalServiceHandler (`appraisal/NFTAppraisalServiceHandler.sol`)**: WAVS envelope validator for appraisal payloads; decodes success/error, converts 6-decimal price → 18 decimals, and calls `setAppraisalForTokenWithCard`.
- **Reads / analytics**
  - **GachaTreasuryReader (`gacha/GachaTreasuryReader.sol`)**: view-only aggregation over treasury inventory (pool composition, TVL, depositor stats) for the frontend.

## 4) Core flows
### A) Deposit & appraisal (Courtyard Pokémon cards first)
1. Depositor requests appraisal via `NFTAppraisal.requestAppraisal` (pays fee in `feeToken`, typically USDC).
2. WAVS appraisal worker (fed by Courtyard pricing) returns signed payload → `NFTAppraisalServiceHandler` → `setAppraisalForTokenWithCard`.
3. Depositor calls `GachaTreasury.depositNFT` (collection must be whitelisted). Treasury pulls the NFT, derives rarity from price bands, records depositor/value, syncs shares to `CardGroupedVault`.

### B) Spin
1. User calls `Gacha.spin`/`spinWithPermit`; contract checks the treasury holds inventory, collects `spinFee` (USDC), emits `RandomnessRequested(triggerId)`.
2. WAVS drand operators sign randomness → `GachaServiceHandler.handleSignedEnvelope` → `Gacha.fulfillRandomness(triggerId, randomness)`.
3. Contract draws a tier (weighted by live inventory) and NFT, refunds if the pool is empty. Otherwise:
   - Forwards `spinFee` to `GachaEconomyManager.onSpinRevenue` with hit rarity.
   - `GachaTreasury.sendRandomNFTToWinner` (swap‑and‑pop using randomness modulus) transfers NFT; records win stats.

### C) Revenue distribution per spin
1. Economy manager splits fee: default 95% → depositors, 5% → protocol (rounding left to protocol).
2. Depositor share: `CardGroupedVault.distributeYield` accrues yield pro‑rata to appraisal-weighted shares; users call `claimYield` (or protocol auto-claims its own shares).
3. Protocol share: `ProtocolTreasury.onRevenueReceived` holds USDC for operations/buybacks.

### D) Redemption / buyback
1. Winner may sell NFT back during redemption window. `ProtocolTreasury.executeRedemption` checks appraisal + window, pays 80% of `min(win-time snapshot, live appraisal)` in USDC, and restocks NFT into treasury via `handleRedemptionReturn`.
2. Treasury credits protocol as depositor for restocked item (earning yield on future spins until it exits again).

### E) Fail-safes
- If randomness never arrives, requester can `reclaimFailedSpin` after 30s to recover `spinFee`.
- If the pool is empty at fulfillment, the spin auto-refunds and is tracked separately.
- Admin pause on Gacha, Treasury, Vault, Appraisal, EconomyManager, ProtocolTreasury.

## 5) Multi-gacha approach
- Each gacha instance pairs with its own `GachaTreasury` (rarity pools and price bands per market) and may share the same `CardGroupedVault`/`GachaEconomyManager`/`ProtocolTreasury` or use isolated instances per SKU.
- Launch plan: start with one Pokémon-graded gacha (Courtyard feed); add more gachas by cloning the stack with collection-specific whitelists and price bands.
- Shared appraisal service (WAVS) to reuse pricing across gachas; treasuries listen for auto-migration when prices move.

## 6) Key parameters (per deployment)
- `spinFee` & `feeToken` (USDC assumed). Draw odds are not a parameter — they derive from live inventory.
- Rarity price bands (USD 1e18): set at treasury init (e.g., Common ~$0–15, Uncommon ~$25–60, Rare ~$70–250, Epic ~$300–1.2k, Legendary ≥$1.5k).
- Revenue split BPS in `GachaEconomyManager`; redemption window in `ProtocolTreasury` (payout fixed at 80%, `REDEMPTION_PAYOUT_BPS`).
- Whitelisted collections and treasuries; appraisal fee/token.

## 7) Security / trust model
- WAVS service manager enforces signature validation for randomness/appraisal envelopes; drand randomness is unbiased post-validation.
- Upgradeable via UUPS (owner-controlled); production should place behind multisig/DAO with pausability.
- No hidden randomness: the draw is `randomness % totalCount` against the live pool composition; treasury inventory is on-chain visible.
- Appraisal dependency: incorrect prices can mis-tier NFTs; auto-migration mitigates drift but upstream oracle quality remains critical.
- Redemption window prevents stale buybacks; treasury whitelist prevents malicious collections.

## 8) Open questions / extensions
- Should each gacha have independent revenue splits and redemption BPS to tune per collection?
- Governance for whitelist updates and price band changes (immutable today post-init).
- Cross-gacha shared depositor vault vs isolated yield per collection.
- Additional randomness fallbacks if WAVS unavailable (currently reclaim-only).
