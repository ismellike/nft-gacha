# NFT Gacha System — Design Document

## 1) Goals
- Provably fair decentralized NFT gacha using WAVS (WebAssembly Verifiable Services) for randomness and appraisal.
- Start with graded Pokémon cards (Courtyard inventory) and expand to multiple gachas/collections.
- Price-aware vaults segmented by rarity so spins pull from the correct value band.
- Reward liquidity providers (depositors) with yield on every spin; allow protocol-controlled buybacks/redemptions.
- Provide transparent analytics (rarity weights, treasury contents, win/refund/reclaim stats).

## 2) Actors
- **Spinner**: pays `spinFee` (USDC) to get a random NFT; can reclaim if fulfillment times out.
- **Depositor**: supplies NFTs after appraisal; earns pro‑rata USDC yield via the depositor vault.
- **Protocol/DAO**: configures parameters, manages vault splits, receives protocol fee, executes buybacks.
- **WAVS AVS**: signs drand randomness envelopes and appraisal payloads.
- **Courtyard data source**: upstream graded Pokémon prices → fed into WAVS appraisal service.

## 3) On‑chain architecture (contracts/src)
- **Gacha (`gacha/Gacha.sol`)**
  - Accepts spins, enforces rarity weights (default 70/20/6/3/1, sum to 10_000).
  - Emits `RandomnessRequested(triggerId)` and tracks `SpinRequest` with timeout (30s reclaim window).
  - `fulfillRandomness` (called only by the WAVS handler) rolls rarity, refunds if pool empty, sends NFT from treasury, and forwards fee to the economy manager.
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
  - **CardGroupedVault (`economy/CardGroupedVault.sol`)**: ERC-2222–style share accounting using appraisal value (1e18) as shares. Distributes USDC yield, supports claim by user or economy manager; records claims back into treasury analytics.
  - **ProtocolTreasury (`economy/ProtocolTreasury.sol`)**: receives protocol fee, executes buybacks/redemptions at 85% of appraisal (USD→USDC conversion), restocks NFTs into treasury, enforces redemption window (default 1h).
- **Appraisal**
  - **NFTAppraisal (`appraisal/NFTAppraisal.sol`)**: user requests appraisal (pays fee), tracks token→cardId mapping, stores card-level price in 1e18 USD. Whitelisted treasuries auto-migrate rarities on price updates.
  - **NFTAppraisalServiceHandler (`appraisal/NFTAppraisalServiceHandler.sol`)**: WAVS envelope validator for appraisal payloads; decodes success/error, converts 6-decimal price → 18 decimals, and calls `setAppraisalForTokenWithCard`.
- **Analytics**
  - **RarityTracker (`gacha/RarityTracker.sol`)**: optional rarity-level aggregation (card → depositor positions, wins, rewards) for richer stats.

## 4) Core flows
### A) Deposit & appraisal (Courtyard Pokémon cards first)
1. Depositor requests appraisal via `NFTAppraisal.requestAppraisal` (pays fee in `feeToken`, typically USDC).
2. WAVS appraisal worker (fed by Courtyard pricing) returns signed payload → `NFTAppraisalServiceHandler` → `setAppraisalForTokenWithCard`.
3. Depositor calls `GachaTreasury.depositNFT` (collection must be whitelisted). Treasury pulls the NFT, derives rarity from price bands, records depositor/value, syncs shares to `CardGroupedVault`.

### B) Spin
1. User calls `Gacha.spin`/`spinWithPermit`; contract checks all weighted rarities have inventory, collects `spinFee` (USDC), emits `RandomnessRequested(triggerId)`.
2. WAVS drand operators sign randomness → `GachaServiceHandler.handleSignedEnvelope` → `Gacha.fulfillRandomness(triggerId, randomness)`.
3. Contract rolls rarity, refunds if selected pool empty. Otherwise:
   - Forwards `spinFee` to `GachaEconomyManager.onSpinRevenue` with hit rarity.
   - `GachaTreasury.sendRandomNFTToWinner` (swap‑and‑pop using randomness modulus) transfers NFT; records win stats.

### C) Revenue distribution per spin
1. Economy manager splits fee: default 95% → depositors, 5% → protocol (rounding left to protocol).
2. Depositor share: `CardGroupedVault.distributeYield` accrues yield pro‑rata to appraisal-weighted shares; users call `claimYield` (or protocol auto-claims its own shares).
3. Protocol share: `ProtocolTreasury.onRevenueReceived` holds USDC for operations/buybacks.

### D) Redemption / buyback
1. Winner may sell NFT back during redemption window. `ProtocolTreasury.executeRedemption` checks appraisal + window, pays 85% of USD appraisal (converted to USDC), and restocks NFT into treasury via `handleRedemptionReturn`.
2. Treasury credits protocol as depositor for restocked item (earning yield on future spins until it exits again).

### E) Fail-safes
- If randomness never arrives, requester can `reclaimFailedSpin` after 30s to recover `spinFee`.
- If roll hits empty rarity bucket, spin auto-refunds and is tracked separately.
- Admin pause on Gacha, Treasury, Vault, Appraisal, EconomyManager, ProtocolTreasury.

## 5) Multi-gacha approach
- Each gacha instance pairs with its own `GachaTreasury` (rarity pools and price bands per market) and may share the same `CardGroupedVault`/`GachaEconomyManager`/`ProtocolTreasury` or use isolated instances per SKU.
- Launch plan: start with one Pokémon-graded gacha (Courtyard feed) using default rarity weights; add more gachas by cloning the stack with collection-specific whitelists and price bands.
- Shared appraisal service (WAVS) to reuse pricing across gachas; treasuries listen for auto-migration when prices move.

## 6) Key parameters (per deployment)
- `spinFee` & `feeToken` (USDC assumed).
- Rarity weights (must sum to 10_000).
- Rarity price bands (USD 1e18): set at treasury init (e.g., Common ~$0–15, Uncommon ~$25–60, Rare ~$70–250, Epic ~$300–1.2k, Legendary ≥$1.5k).
- Revenue split BPS in `GachaEconomyManager`; redemption BPS (85%) and window in `ProtocolTreasury`.
- Whitelisted collections and treasuries; appraisal fee/token.

## 7) Security / trust model
- WAVS service manager enforces signature validation for randomness/appraisal envelopes; drand randomness is unbiased post-validation.
- Upgradeable via UUPS (owner-controlled); production should place behind multisig/DAO with pausability.
- No hidden randomness: rarity selection is `randomness % 10_000` against transparent weights; treasury inventory is on-chain visible.
- Appraisal dependency: incorrect prices can mis-tier NFTs; auto-migration mitigates drift but upstream oracle quality remains critical.
- Redemption window prevents stale buybacks; treasury whitelist prevents malicious collections.

## 8) Open questions / extensions
- Should each gacha have independent revenue splits and redemption BPS to tune per collection?
- Do we want staged rarity weights that adapt to inventory depth?
- Governance for whitelist updates and price band changes (immutable today post-init).
- Cross-gacha shared depositor vault vs isolated yield per collection.
- Additional randomness fallbacks if WAVS unavailable (currently reclaim-only).
