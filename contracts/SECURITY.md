# Security Audit Documentation

This document was prepared to support a formal security audit of the NFT Gacha system smart contracts.
It covers formal invariants, an access control matrix, storage layout analysis, and known risks.

---

## Table of Contents

1. [Formal Invariants](#formal-invariants)
   - [CardGroupedVault](#cardgroupedvault-invariants)
   - [GachaTreasury](#gachatreasury-invariants)
   - [Gacha](#gacha-invariants)
   - [GachaEconomyManager](#gachaeconomymanager-invariants)
   - [NFTAppraisal](#nftappraisal-invariants)
2. [Access Control Matrix](#access-control-matrix)
3. [Storage Layout Analysis](#storage-layout-analysis)
4. [Known Risks and Assumptions](#known-risks-and-assumptions)

---

## Formal Invariants

### CardGroupedVault Invariants

**Source:** `contracts/src/economy/CardGroupedVault.sol`

#### I-CGV-1: Total Distributed >= Total Claimed

```
totalYieldDistributed >= totalYieldClaimed  (at all times)
```

`totalYieldDistributed` is incremented in `distributeYield` only after a successful
`safeTransferFrom` pulls tokens into the vault. `totalYieldClaimed` is incremented in `_payOut`
only after the balance check (`asset.balanceOf >= amount`) passes and before `safeTransfer` is
called. Because yield is pulled before the distributed counter is updated, and claims are guarded
by a balance check, the distributed total must always be >= the claimed total.

**Risk if violated:** Users could claim yield that was never deposited, draining other depositors.

#### I-CGV-2: No Negative Net Yield Per Position

```
_pendingForCard(cardId, depositor) >= 0  for all (cardId, depositor) pairs
```

`_pendingForCard` returns `max(raw, 0)`. Negative raw values (arising when corrections exceed
accumulated yield) are clamped to zero:

```solidity
return raw > 0 ? uint256(raw) : 0;
```

**Risk if violated:** `_accrueAll` could revert on underflow, locking user claims.

#### I-CGV-3: Correction Accumulator Preserves Total Yield

For any card with constant depositor composition and no rarity migration:

```
sum_over_depositors(pending(cardId, d)) ==
    totalYield distributed to card's rarity pool
    * card's share of pool totalValueUSD
    (modulo rounding)
```

When `updateCardPrice` is called:
```
correctionPerUnit += (newP - oldP) * (accYieldPerUSD[rarity] - baseAcc) / PRECISION
```

This neutralises yield falsely attributed to the price delta since `baseAcc` was set, so past
yield distributions are re-attributed at the old price and future distributions use the new price.

#### I-CGV-4: RarityPool.totalValueUSD Equals Sum of Deposited Values

```
rarityPools[r].totalValueUSD ==
    sum over CardNodes where card.rarity == r of (card.cardPriceUSD * card.totalCount)
```

Maintained by:
- `registerCardDeposit`: adds `count * priceUSD`
- `removeCardDeposit`: subtracts `count * card.cardPriceUSD`
- `updateCardPrice`: replaces `totalCount * oldPrice` with `totalCount * newPrice`
- `migrateCardRarity`: subtracts from old pool, adds to new pool

**Risk if violated:** `distributeYield` computes incorrect per-USD increments.

#### I-CGV-5: Depositor Card List Consistency

```
_depositorCardIndex[depositor][cardId] == 0
    iff  cardId NOT in _depositorCards[depositor]

_depositorCardIndex[depositor][cardId] == index + 1
    iff  _depositorCards[depositor][index] == cardId
```

Maintained by `_addDepositorCard` (1-based sentinel) and `_removeDepositorCard` (swap-and-pop
with index update).

#### I-CGV-6: Yield Distribution Requires Non-Zero Pool Value

```
distributeYield(amount, rarity) MUST revert if rarityPools[rarity].totalValueUSD == 0
```

Enforced by `if (pool.totalValueUSD == 0) revert NoValueInPool()`. Prevents division by zero.

#### I-CGV-7: Only Treasury Can Modify Card Positions

All state-mutating card operations (`registerCardDeposit`, `removeCardDeposit`,
`updateCardPrice`, `migrateCardRarity`) are gated by `onlyTreasury`.
`distributeYield` is gated by `onlyEconomyManager`.

---

### GachaTreasury Invariants

**Source:** `contracts/src/gacha/GachaTreasury.sol`

#### I-GT-1: NFT Count Matches Array Length

```
rarityCount[r] == treasury[r].length  for all r in {Common, Uncommon, Rare, Epic, Legendary}
```

`rarityCount[r]` is incremented/decremented atomically with `push()` / `pop()` in every deposit,
withdrawal, and migration path.

#### I-GT-2: All Deposited NFTs Are Tracked

```
depositedNFTs[collection][tokenId] == true
    iff  exists r, i such that
        treasury[r][i].collection == collection AND
        treasury[r][i].tokenId == tokenId
```

`depositedNFTs` is set `true` on deposit and cleared `false` in `_removeNFTAtIndex` (gacha win
/ withdrawal) and `withdrawMyNFT`. `handleRedemptionReturn` also sets `depositedNFTs` before
pushing to the array.

#### I-GT-3: Index Mapping Consistency

```
nftToTreasuryIndex[collection][tokenId] == i  implies
    treasury[nftCurrentRarity[collection][tokenId]][i].collection == collection AND
    treasury[nftCurrentRarity[collection][tokenId]][i].tokenId == tokenId
```

Maintained after every swap-and-pop: the moved item's index is updated in `_removeNFTAtIndex`:

```solidity
nftToTreasuryIndex[movedItem.collection][movedItem.tokenId] = index;
```

#### I-GT-4: Swap-and-Pop Consistency

When an item is removed from index `i` in a rarity array of length `n`:
1. The item at index `n-1` is copied to index `i`.
2. `nftToTreasuryIndex[moved.collection][moved.tokenId]` is updated to `i`.
3. The array is popped (length becomes `n-1`).

No stale index references remain after removal.

#### I-GT-5: Price Ranges Are Continuous and Non-Overlapping

Set once during `initialize` and enforced by `_setInitialPriceRanges`:

```
commonMax + PRICE_STEP == uncommonMin
uncommonMax + PRICE_STEP == rareMin
rareMax + PRICE_STEP == epicMin
epicMax + PRICE_STEP == legendaryMin
legendaryMax == type(uint256).max
```

Every valid appraised price maps to exactly one rarity tier.

#### I-GT-6: Value Tracking Consistency

```
totalRarityValue[r] ==
    sum over all NFTItem in treasury[r] of item.appraisedPrice

userDepositValues[depositor][r] ==
    sum over all NFTItem in treasury[r] where item.depositor == depositor of item.appraisedPrice
```

Both counters are updated together in `_trackDeposit` and `_trackRemoval`.

#### I-GT-7: User Card Deposits Match Vault Positions

```
userCardDeposits[depositor][cardId] ==
    cardGroupedVault.positions[cardId][depositor].count
    (when cardGroupedVault is set and non-zero)
```

`_trackDeposit` calls `cardGroupedVault.registerCardDeposit` immediately after incrementing
`userCardDeposits`. `_trackRemoval` calls `cardGroupedVault.removeCardDeposit` immediately after
decrementing `userCardDeposits`.

#### I-GT-8: Only Gacha Contract Can Select NFTs for Winners

`sendRandomNFTToWinner` is guarded by `onlyGacha`. No other code path transfers NFTs to
arbitrary winner addresses.

---

### Gacha Invariants

**Source:** `contracts/src/gacha/Gacha.sol`

#### I-G-1: Trigger IDs Are Monotonically Increasing and Start at 1

```
_nextTriggerId >= 1  always
spinRequests[0].requester == address(0)  (slot 0 is never a valid spin)
```

`_nextTriggerId` is initialised to `1` in `initialize` and only ever incremented by 1 in `spin`
and `spinWithPermit`. The assignment `triggerId = _nextTriggerId++` assigns before incrementing,
so the lowest assignable ID is `1`.

#### I-G-2: Every Pending Spin Is Tracked

```
forall triggerId where spinRequests[triggerId].requester != address(0) AND NOT fulfilled:
    contract holds spinRequests[triggerId].feePaid tokens of feeToken
```

Fees are transferred from the user before the `SpinRequest` is stored. Fees are released only via
`fulfillRandomness` (refund path), `reclaimFailedSpin`, or successful spin distribution.

#### I-G-3: A Spin Can Only Be Fulfilled Once

```
fulfillRandomness(triggerId, ...) MUST revert if spinRequests[triggerId].statusFlags & 1 != 0
```

Enforced by:

```solidity
if (isFulfilled) { ... revert AlreadyFulfilled(); }
```

#### I-G-4: Reclaimed Spins Cannot Be Fulfilled

When a user reclaims via `reclaimFailedSpin`, both the fulfilled and reclaimed bits are set:

```solidity
request.statusFlags = _setFulfilled(request.statusFlags);
request.statusFlags = _setReclaimed(request.statusFlags);
```

A subsequent `fulfillRandomness` call sees `isFulfilled == true` and reverts with
`SpinAlreadyReclaimed`.

#### I-G-5: Reclaimable Only After Timeout, By Original Requester

```
reclaimFailedSpin(triggerId) MUST revert if:
    msg.sender != spinRequests[triggerId].requester  OR
    block.timestamp <= spinRequests[triggerId].requestTime + spinTimeout
```

#### I-G-6: Fee Accounting Is Complete

On a successful spin:
```
feeToCharge == amount transferred from user == amount forwarded to economyManager
```

On a refund (empty rarity pool):
```
feeToCharge == amount transferred from user == amount refunded to user
```

On a reclaim:
```
feePaid == amount transferred from user == amount refunded to user
```

No partial payments or fee residuals remain in the Gacha contract after fulfillment.

#### I-G-7: Rarity Weights Always Sum to TOTAL_WEIGHT

`getCurrentRarityWeights` (the live pool-composition odds) ensures the returned weights sum to
`TOTAL_WEIGHT` (10,000) via the remainder-to-largest-tier assignment. There is no configurable
rarity-weight setter — odds are derived purely from current inventory.

#### I-G-8: Pause Is Asymmetric by Design

`spin` and `spinWithPermit` require `whenNotPaused`. `reclaimFailedSpin` deliberately does NOT
require `whenNotPaused`, ensuring users can always reclaim stuck funds during emergency pause.

---

### GachaEconomyManager Invariants

**Source:** `contracts/src/economy/GachaEconomyManager.sol`

#### I-GEM-1: Revenue Split Sums to BPS_DENOMINATOR

```
depositorShareBps + protocolShareBps == BPS_DENOMINATOR (10,000)
```

Enforced in `setRevenueSplit`:

```solidity
if (depositorBps + protocolBps != BPS_DENOMINATOR) revert InvalidRevenueSplit();
```

#### I-GEM-2: All Revenue Is Accounted For

For each `onSpinRevenue(usdcAmount, ...)`:

```
depositShare + protocolShare == usdcAmount
```

Rounding remainders are explicitly added to `protocolShare`:

```solidity
uint256 distributed = depositShare + protocolShare;
if (distributed < usdcAmount) {
    protocolShare += usdcAmount - distributed;
}
```

No USDC is stranded in the economy manager.

#### I-GEM-3: Queued Yield Is Eventually Distributed to Originating Rarity

When `cardGroupedVault.distributeYield` reverts (empty rarity pool), `depositShare` is added to
`queuedYieldByRarity[rarity]` rather than lost. Each `onSpinRevenue` call attempts to flush all
5 per-rarity queues, distributing queued yield only to the rarity pool that originally generated
it.

#### I-GEM-4: No Yield Lost on Successful Distribution

When `depositShare > 0` and the vault has shares, `vault.distributeYield` pulls `depositShare`
from the economy manager via `safeTransferFrom`, so tokens cannot remain stranded.

#### I-GEM-5: Only Gacha Can Trigger Revenue Routing

`onSpinRevenue` is gated by `onlyGacha`.

---

### NFTAppraisal Invariants

**Source:** `contracts/src/appraisal/NFTAppraisal.sol`

#### I-NA-1: Prices Are Strictly Positive When Set

```
cardAppraisals[cardId].priceUSD > 0
    whenever status is Completed or OwnerOverride
```

Both appraisal paths enforce:

```solidity
if (priceUSD == 0) revert InvalidPrice();
```

#### I-NA-2: Token-to-Card Mapping Is Immutable Once Set

```
tokenCardIds[collection][tokenId] cannot change to a different cardId once assigned
```

Enforced by:

```solidity
if (existing != bytes32(0) && existing != cardId) revert CardIdMismatch();
```

#### I-NA-3: Auto-Migration Triggers Only on Price Change

```
_triggerAutoMigration is only called when oldPrice != priceUSD
```

Verified by `if (oldPrice != priceUSD)` guards in both the service handler path and the owner
override path.

#### I-NA-4: Auto-Migration Cannot Revert the Appraisal Transaction

`_triggerAutoMigration` uses a low-level call with a 500,000 gas cap. If the treasury call
reverts, only `AutoMigrationFailed` is emitted; the appraisal price update still commits.

#### I-NA-5: Re-appraisal Policy Is Consistent

Both `requestAppraisal` (single token) and `requestBatchAppraisal` allow re-requesting a token
that already has a request, charging a new fee. Previously `requestBatchAppraisal` reverted
with `AppraisalAlreadyExists` — this was fixed as part of TRUST-8.

#### I-NA-6: Treasury Whitelist Determines Auto-Migration Scope

Auto-migration only fires if the NFT's current owner is a whitelisted treasury. Tokens owned by
EOAs or non-whitelisted contracts require manual `migrateNFTRarity` calls.

---

## Access Control Matrix

### Legend

| Symbol | Role |
|---|---|
| **Owner** | `OwnableUpgradeable` owner (intended: DAO multisig or timelock) |
| **Gacha** | The registered `Gacha.sol` contract address |
| **Treasury** | The registered `GachaTreasury.sol` contract address |
| **EconMgr** | The registered `GachaEconomyManager.sol` contract address |
| **SvcHandler(G)** | `GachaServiceHandler.sol` — set as `gachaServiceHandler` in Gacha |
| **SvcHandler(A)** | `NFTAppraisalServiceHandler.sol` — set as `serviceHandler` in NFTAppraisal |
| **ProtoTreasury** | The registered `ProtocolTreasury.sol` contract address |
| **CardVault** | The registered `CardGroupedVault.sol` contract address |
| **AppraisalCtr** | The registered `NFTAppraisal.sol` contract address |
| **NFTOwner** | Current ERC721 owner of the token being operated on |
| **Depositor** | Original depositor stored in `NFTItem.depositor` |
| **SpinReq** | The `requester` stored in a `SpinRequest` |
| **Anyone** | No restriction |

---

### Gacha.sol

| Function | Caller | State Modified | Reentrancy Guard |
|---|---|---|---|
| `initialize` | Anyone (once) | All state | No |
| `spin(maxFee)` | Anyone, when not paused | `spinRequests`, `_nextTriggerId`, pulls feeToken | Yes |
| `spinWithPermit(deadline,v,r,s,maxFee)` | Anyone, when not paused | `spinRequests`, `_nextTriggerId`, pulls feeToken | Yes |
| `fulfillRandomness(triggerId, randomness)` | SvcHandler(G) only | `spinRequests.statusFlags`, counters, forwards fee, calls Treasury | Yes |
| `reclaimFailedSpin(triggerId)` | SpinReq only (always callable, no pause) | `spinRequests.statusFlags`, counters, refunds feeToken | Yes |
| `setPricingConfig(premiumBps,minFee,maxFee)` | Owner | `pricingPremiumBps`, `minSpinFee`, `maxSpinFee` | No |
| `setGachaServiceHandler(handler)` | Owner | `gachaServiceHandler` | No |
| `setEconomyManager(manager)` | Owner | `economyManager` | No |
| `setFeeTokenDecimals(decimals)` | Owner | `feeTokenDecimals`, `feeTokenScalar` | No |
| `setSpinTimeout(timeout)` | Owner | `spinTimeout` | No |
| `emergencyPause()` | Owner | `_paused = true` | No |
| `emergencyUnpause()` | Owner | `_paused = false` | No |
| `_authorizeUpgrade(impl)` | Owner | UUPS implementation slot | No |
| All view/pure getters | Anyone | None | No |

---

### GachaTreasury.sol

| Function | Caller | State Modified | Reentrancy Guard |
|---|---|---|---|
| `initialize` | Anyone (once) | All state | No |
| `depositNFT(collection, tokenId)` | NFTOwner, when not paused | Treasury arrays, counters, value tracking, calls CardVault | Yes |
| `batchDepositNFT(collections, tokenIds)` | NFTOwner, when not paused | Treasury arrays, counters, value tracking, calls CardVault | Yes |
| `withdrawMyNFT(collection, tokenId)` | Depositor only, when not paused | Treasury arrays, counters, value tracking, calls CardVault | Yes |
| `migrateNFTRarity(collection, tokenId)` | Anyone, when not paused | Treasury arrays, rarity/value tracking | Yes |
| `batchMigrateNFTRarity(collections, tokenIds)` | Anyone, when not paused | Treasury arrays, rarity/value tracking (max 50 items) | Yes |
| `sendRandomNFTToWinner(rarity, seed, winner)` | Gacha only | Treasury arrays, counters, value tracking, calls CardVault, transfers NFT, snapshots redemption deadline | Yes |
| `handleRedemptionReturn(col,tok,seller,price)` | ProtoTreasury only, when not paused | Treasury arrays, counters, value tracking, calls CardVault | Yes |
| `onCardPriceUpdated(cardId, newPriceUSD)` | AppraisalCtr only | Calls CardVault (`updateCardPrice` or `migrateCardRarity`) | No |
| `recordYieldClaim(user, amount)` | CardVault only, when not paused | `userLifetimeClaimed`, `globalLifetimeClaimed` | No |
| `setGachaContract(addr)` | Owner | `gachaContract` | No |
| `setAppraisalContract(addr)` | Owner | `appraisalContract` | No |
| `setCardGroupedVault(addr)` | Owner | `cardGroupedVault` | No |
| `setMaxDepositsPerCard(max)` | Owner | `maxDepositsPerCard` (must be > 0) | No |
| `setProtocolTreasury(addr)` | Owner | `protocolTreasury` (guarded by deposit + vault shares check) | No |
| `addToWhitelist(collection)` | Owner | `whitelistedCollections`, `whitelistedCollectionsList` | No |
| `removeFromWhitelist(collection)` | Owner | `whitelistedCollections`, `whitelistedCollectionsList` | No |
| `emergencyPause()` | Owner | `_paused = true` | No |
| `emergencyUnpause()` | Owner | `_paused = false` | No |
| `_authorizeUpgrade(impl)` | Owner | UUPS implementation slot | No |
| All view/pure getters | Anyone | None | No |

---

### GachaServiceHandler.sol (non-upgradeable)

| Function | Caller | State Modified | Reentrancy Guard |
|---|---|---|---|
| `handleSignedEnvelope(envelope, sig)` | Anyone (WAVS sig validated internally) | Calls `Gacha.fulfillRandomness` | No |
| `getServiceManager()` | Anyone | None (view) | No |
| `getGacha()` | Anyone | None (view) | No |
| `getGachaTreasury()` | Anyone | None (view) | No |

---

### NFTAppraisal.sol

| Function | Caller | State Modified | Reentrancy Guard |
|---|---|---|---|
| `initialize` | Anyone (once) | All state | No |
| `requestAppraisal(collection, tokenId)` | Anyone, when not paused | `tokenRequests`, transfers feeToken to `protocolAddress` | Yes |
| `requestBatchAppraisal(collections, tokenIds)` | Anyone, when not paused | `tokenRequests`, transfers feeToken to `protocolAddress` | Yes |
| `setAppraisalForTokenWithCard(col,tok,cardId,price)` | SvcHandler(A) only, when not paused | `tokenCardIds`, `cardAppraisals`, `tokenRequests`, triggers auto-migration | Yes |
| `ownerSetAppraisalForTokenWithCard(col,tok,cardId,price)` | Owner, when not paused | Same as above | Yes |
| `ownerBatchSetAppraisalForTokensWithCards(...)` | Owner, when not paused | Same as above for each token (max 50) | Yes |
| `setServiceHandler(handler)` | Owner | `serviceHandler` | No |
| `setAppraisalFee(fee)` | Owner | `appraisalFee` | No |
| `setFeeToken(token)` | Owner | `feeToken` | No |
| `setProtocolAddress(addr)` | Owner | `protocolAddress` | No |
| `whitelistTreasury(treasury)` | Owner | `whitelistedTreasuries`, `treasuryList` | No |
| `unwhitelistTreasury(treasury)` | Owner | `whitelistedTreasuries`, `treasuryList` | No |
| `emergencyPause()` | Owner | `_paused = true` | No |
| `emergencyUnpause()` | Owner | `_paused = false` | No |
| `_authorizeUpgrade(impl)` | Owner | UUPS implementation slot | No |
| All view/pure getters | Anyone | None | No |

---

### NFTAppraisalServiceHandler.sol (non-upgradeable)

| Function | Caller | State Modified | Reentrancy Guard |
|---|---|---|---|
| `handleSignedEnvelope(envelope, sig)` | Anyone (WAVS sig validated internally) | Calls `NFTAppraisal.setAppraisalForTokenWithCard` | No |
| `decodeSuccess(payload)` | Anyone (pure) | None | No |
| `decodeError(payload)` | Anyone (pure) | None | No |
| `checkAppraisal(collection, tokenId)` | Anyone | None (view) | No |
| `getServiceManager()` | Anyone | None (view) | No |
| `getAppraisalContract()` | Anyone | None (view) | No |

---

### CardGroupedVault.sol

| Function | Caller | State Modified | Reentrancy Guard |
|---|---|---|---|
| `initialize` | Anyone (once) | All state | No |
| `registerCardDeposit(cardId,depositor,price,rarity,count)` | Treasury only, when not paused | `cardNodes`, `positions`, `rarityPools`, depositor card list | No |
| `removeCardDeposit(cardId, depositor, count)` | Treasury only, when not paused | `cardNodes`, `positions`, `rarityPools`, depositor card list, may auto-pay asset | Yes |
| `updateCardPrice(cardId, newPriceUSD)` | Treasury only, when not paused | `cardNodes.correctionPerUnit`, `rarityPools.totalValueUSD` | No |
| `migrateCardRarity(cardId, newRarity, newPriceUSD)` | Treasury only, when not paused | `cardNodes`, `rarityPools` | No |
| `distributeYield(amount, rarity)` | EconMgr only, when not paused | `rarityPools.accYieldPerUSD`, `totalYieldDistributed`, pulls asset | Yes |
| `claimYield(account)` | Account itself OR EconMgr, when not paused | Position debts, `totalYieldClaimed`, transfers asset, calls Treasury `recordYieldClaim` | Yes |
| `claimYieldForCards(account, cardIds)` | Account itself OR EconMgr, when not paused | Position debts, `totalYieldClaimed`, transfers asset, calls Treasury `recordYieldClaim` | Yes |
| `setTreasury(addr)` | Owner | `treasury` | No |
| `setEconomyManager(addr)` | Owner | `economyManager` | No |
| `pause()` | Owner | `_paused = true` | No |
| `unpause()` | Owner | `_paused = false` | No |
| `_authorizeUpgrade(impl)` | Owner | UUPS implementation slot | No |
| All view/pure getters | Anyone | None | No |

---

### GachaEconomyManager.sol

| Function | Caller | State Modified | Reentrancy Guard |
|---|---|---|---|
| `initialize` | Anyone (once) | All state | No |
| `onSpinRevenue(amount, hitRarity)` | Gacha only, when not paused | Accounting counters, `queuedDepositorYield`, calls CardVault and ProtoTreasury | Yes |
| `setRevenueSplit(depositorBps, protocolBps)` | Owner | `depositorShareBps`, `protocolShareBps` | No |
| `setFeeToken(token)` | Owner | `feeToken` | No |
| `setGacha(addr)` | Owner | `gacha` | No |
| `setVaults(vault, protocol)` | Owner | `cardGroupedVault` and/or `protocolTreasury` | No |
| `pause()` | Owner | `_paused = true` | No |
| `unpause()` | Owner | `_paused = false` | No |
| `_authorizeUpgrade(impl)` | Owner | UUPS implementation slot | No |

---

### ProtocolTreasury.sol

| Function | Caller | State Modified | Reentrancy Guard |
|---|---|---|---|
| `initialize` | Anyone (once) | All state | No |
| `onRevenueReceived(amount)` | EconMgr only, when not paused | Pulls `_asset` from sender | No |
| `executeRedemption(collection, tokenId)` | Anyone, when not paused | Transfers NFT to GachaTreasury, pays `_asset` to caller | Yes |
| `transferOut(to, amount)` | Owner, when not paused | Transfers `_asset` to `to` | No |
| `setEconomyManager(addr)` | Owner | `economyManager` | No |
| `setGachaTreasury(addr)` | Owner | `_treasury` | No |
| `setAppraisalOracle(addr)` | Owner | `appraisalOracle` | No |
| `setRedemptionWindow(seconds)` | Owner | `redemptionWindow` | No |
| `pause()` | Owner | `_paused = true` | No |
| `unpause()` | Owner | `_paused = false` | No |
| `_authorizeUpgrade(impl)` | Owner | UUPS implementation slot | No |
| `getRemainingRedemptionWindow(col,tok)` | Anyone | None (view) | No |
| `isRedemptionEligible(col,tok)` | Anyone | None (view) | No |
| `gachaTreasury()` | Anyone | None (view) | No |
| `asset()` | Anyone | None (view) | No |

---

## Storage Layout Analysis

All core contracts use the UUPS upgradeable proxy pattern with `__gap` arrays reserving future
storage slots. Run `forge inspect <ContractName> storageLayout` in the repository root to
generate the machine-readable JSON. The following is a manual source analysis.

### Gacha.sol Storage (approximate order)

```
slot  0: Initializable._initialized / _initializing
slot  1: OwnableUpgradeable._owner
slots 2-51: OwnableUpgradeable.__gap[50]
slot 52: PausableUpgradeable._paused
slots 53-102: PausableUpgradeable.__gap[50]

NOTE: ReentrancyGuardTransient uses TRANSIENT storage (EIP-1153) — not a persistent slot.
NOTE: UUPSUpgradeable stores implementation in the ERC1967 admin slot, not a numbered slot.

Custom Gacha state (starting ~slot 103):
  treasury              (address)
  feeToken              (address)
  economyManager        (address)
  gachaServiceHandler   (address)
  _nextTriggerId        (uint256)
  spinRequests          mapping(uint256 => SpinRequest)
  userSpinCount         mapping(address => uint256)
  userRarityWins        mapping(address => mapping(Rarity => uint256))
  userRefundCount       mapping(address => uint256)
  userReclaimCount      mapping(address => uint256)
  totalSpinCount        (uint256)
  totalRefundCount      (uint256)
  totalReclaimCount     (uint256)
  globalRarityWins      mapping(Rarity => uint256)
  spinTimeout           (uint256)
  feeTokenDecimals      (uint8) — own slot; uint256 feeTokenScalar follows
  feeTokenScalar        (uint256)
  pricingPremiumBps     (uint256)
  minSpinFee            (uint256)
  maxSpinFee            (uint256)
  __gap                 (uint256[44]) — 44 reserved slots
```

**SpinRequest struct packing:** `feePaid` (uint256, slot n) + `requestTime` (uint256, slot n+1) +
`requester` (address, 20 bytes) + `statusFlags` (uint32, 4 bytes) — `requester` and
`statusFlags` pack together into one 32-byte slot.

### GachaTreasury.sol Storage Notes

- `mapping(address => uint256) private __deprecated_userActiveDepositValueUSD` is a reserved
  slot for a removed variable. It must never be repurposed without proxy state migration.
- `priceRanges[5]` occupies 10 slots (2 uint256 per `PriceRange` struct * 5 tiers).
- `priceRangesSet` (bool) follows `priceRanges` and occupies its own slot due to alignment.
- `cardGroupedVault` (address) and `protocolTreasury` (address) were added after initial
  deployment. Confirm they fit within the reserved `__gap` before deploying any upgrade.
- `maxDepositsPerCard` (uint256) added for TRUST-7 — 1 slot.
- `nftRedemptionDeadlines` (mapping) added for TRUST-11 — 1 slot.
- `__gap` reduced from `[47]` to `[45]` (2 new slots consumed).

### CardGroupedVault.sol Storage Notes

- `rarityPools[5]` is a fixed array of `RarityPool` structs (2 uint256 each = 10 slots).
- `cardNodes` and `positions` are nested mappings; they use keccak256-derived slots and do not
  collide with fixed-size variables.
- `__gap[40]` reserves 40 slots for future upgrades.

### GachaEconomyManager.sol Storage Notes

- `revenueByRarity` is `mapping(GachaTreasury.Rarity => uint256)`. The `Rarity` enum has 5
  values (uint8 0-4); each key maps to a unique keccak256-derived slot.
- `__gap[41]` reserves 41 slots.

### ProtocolTreasury.sol Storage Notes

- `_asset` is a `private` variable exposed via the `asset()` view function.
- `__gap[44]` reserves 44 slots.

### Immutable Variables in Service Handlers

`GachaServiceHandler` and `NFTAppraisalServiceHandler` are non-upgradeable. Critical addresses
are `private immutable`, baked into bytecode at construction:

- `GachaServiceHandler._serviceManager` — immutable
- `GachaServiceHandler._gacha` — immutable
- `NFTAppraisalServiceHandler._serviceManager` — immutable
- `NFTAppraisalServiceHandler._appraisalContract` — immutable

No storage collision risk. To update a service handler target, deploy a new handler and update
the parent contract's registered address via the owner.

### Storage Collision Risk Assessment

**Risk: Low** — provided upgrade discipline is followed:
1. New variables are appended immediately before `__gap`.
2. `__gap` length is decremented by the number of new slots consumed.
3. No existing variables are removed, renamed, or reordered between upgrades.

The `__deprecated_userActiveDepositValueUSD` slot in GachaTreasury demonstrates correct handling
of a removed storage variable without causing layout collisions.

### EIP-1153 Transient Storage Dependency

All five core upgradeable contracts use `ReentrancyGuardTransient`, which depends on the
`TLOAD`/`TSTORE` opcodes introduced in the Ethereum Cancun hardfork (EIP-1153). Transient
storage is cleared at the end of each transaction. Deployment on pre-Cancun chains will fail at
runtime.

**Deployment requirement:** Verify the target chain supports EIP-1153 before deployment.

---

## Known Risks and Assumptions

### TRUST-1: WAVS Service Handler Is a Privileged Oracle

`gachaServiceHandler` in Gacha and `serviceHandler` in NFTAppraisal are single privileged
addresses. A compromised or malicious service handler can:

- **Gacha:** Call `fulfillRandomness` with a crafted `randomness` value to steer spin outcomes
  to preferred addresses.
- **NFTAppraisal:** Call `setAppraisalForTokenWithCard` with manipulated prices, distorting
  rarity assignments, spin fees, redemption payouts, and yield weights.

**Mitigation:** The WAVS service handler contracts validate ECDSA signatures from
`IWavsServiceManager` (backed by EigenLayer restaking) before forwarding data. The service
manager address is `immutable` in both handlers and cannot be changed post-deployment. Security
depends on WAVS operator set honesty and EigenLayer slashing.

### TRUST-2: ERC721 Compliance of Deposited NFTs

The treasury assumes all whitelisted collections correctly implement `IERC721`:
- `ownerOf(tokenId)` returns the correct current owner.
- `safeTransferFrom` does not re-enter the treasury or gacha in unexpected ways.
- `supportsInterface(0x80ac58cd)` returns `true`.

Non-standard implementations (fee-on-transfer, callback-heavy, silent-fail) could corrupt
treasury state.

**Reentrancy concern (RESOLVED):** `sendRandomNFTToWinner` calls `IERC721.safeTransferFrom`,
triggering `onERC721Received` on the winner. `nonReentrant` guards have been added to
`Gacha.fulfillRandomness`, `GachaTreasury.sendRandomNFTToWinner`, and
`CardGroupedVault.removeCardDeposit` to block cross-contract reentrancy through this path.
Each contract has its own `ReentrancyGuardTransient` instance, so guards don't conflict across
the call chain.

### TRUST-3: Fee Token Decimal Assumptions

The system assumes the fee token has 6 decimals (USDC). `ProtocolTreasury` hard-codes
`USD_TO_USDC_CONVERSION = 1e12` for the 18-to-6 decimal conversion. If the fee token is
replaced with a token of different decimals, the owner must call `Gacha.setFeeTokenDecimals`
AND verify all conversion arithmetic in `ProtocolTreasury.executeRedemption` remains correct.

### TRUST-4: Price Oracle Integrity

NFT prices come exclusively from the WAVS-backed appraisal system. Price manipulation affects:
- Rarity assignment (which pool the NFT enters)
- Spin fee calculation (EV-based dynamic pricing)
- Redemption payout at 80% of appraised value
- Yield distribution weights in `CardGroupedVault`

There is no on-chain price sanity bound beyond `priceUSD > 0`. A rogue oracle reporting an
extreme price for a low-value NFT would misclassify it and allow disproportionate yield capture.

### TRUST-5: Owner Key Compromise

All contracts share a single `OwnableUpgradeable` owner. A compromised owner key can:
- Upgrade any proxy to a malicious implementation.
- Replace any service handler with an attacker-controlled address.
- Whitelist malicious NFT collections.
- Drain `ProtocolTreasury` via `transferOut`.
- Change revenue split to 0% depositors / 100% protocol.
- Change the fee token to a worthless token.

**Recommendation:** Deploy with a Gnosis Safe multisig (minimum 3-of-5) as owner, gated by a
48-hour time-lock for upgrade and service-handler change operations.

### TRUST-6: Queued Yield Rarity Cross-Contamination — RESOLVED

When a rarity pool is empty and `distributeYield` reverts, yield was previously accumulated in a
single global `queuedDepositorYield`. The queued amount was flushed during the *next*
`onSpinRevenue` call and distributed to the *next spin's hit rarity pool*, not the originating
rarity. Depositors of one rarity tier could receive yield attributable to spins in a different
rarity tier.

**Fix applied:** `queuedDepositorYield` has been replaced with a per-rarity mapping
`queuedYieldByRarity[uint8]`. When `distributeYield` reverts for a rarity pool, yield is queued
under that specific rarity. On each `onSpinRevenue` call, the flush loop iterates all 5 rarities
and attempts to distribute each rarity's queued yield back to its originating pool. Yield is only
released when the correct rarity pool has depositors. Events `DepositorYieldQueued` and
`QueuedDepositorYieldProcessed` now include a `rarity` parameter for auditability. A convenience
view `totalQueuedYield()` sums all per-rarity queues.

### TRUST-7: Auto-Migration Gas Limit May Be Insufficient — RESOLVED

`_triggerAutoMigration` in NFTAppraisal passes `gas: 500_000` to
`GachaTreasury.onCardPriceUpdated`. For cards with a large number of deposited tokens,
`_migrateCardTokensInTreasury` iterates all tokens of the card in the source rarity array. If
iteration exceeds the gas limit, the migration silently fails (emitting `AutoMigrationFailed`
but not reverting the appraisal update). The vault's card data is updated but treasury arrays
are not migrated, causing `nftCurrentRarity` in the treasury to diverge from `cardNodes.rarity`
in the vault.

**Fix applied:**
1. Added `maxDepositsPerCard` storage variable (default 50, owner-configurable via
   `setMaxDepositsPerCard`). `_trackDeposit` reverts with `MaxCardDepositsReached` when the
   per-card cap is reached, bounding worst-case migration gas.
2. Added `batchMigrateNFTRarity(collections, tokenIds)` as a public manual fallback (capped at
   `MAX_MIGRATION_BATCH = 50`). When auto-migration fails (emitting `AutoMigrationFailed`),
   operators or users can call this to batch-migrate tokens that were not migrated.

### TRUST-8: Batch vs. Single Appraisal Re-request Inconsistency — RESOLVED

`requestAppraisal` (single token) allows re-requesting a token that already has a request and
charges a new fee. `requestBatchAppraisal` previously reverted with `AppraisalAlreadyExists`
for any token that already had a request. An attacker could front-run a user's batch request
by inserting a single-token request for one of the batch members, causing the batch to revert
after the user has already paid gas.

**Fix applied:** `requestBatchAppraisal` now allows re-requests matching the single-request
path. The `AppraisalAlreadyExists` error has been removed. Both paths now create or update
the `TokenRequest` with `lastUpdated` set to `block.timestamp` for re-appraisals.

### TRUST-9: `onCardPriceUpdated` Is Indirectly Owner-Controlled

`GachaTreasury.onCardPriceUpdated` checks `msg.sender == address(appraisalContract)`. However,
`appraisalContract` can be changed by the owner via `setAppraisalContract`. A compromised owner
could point `appraisalContract` to a malicious contract that calls `onCardPriceUpdated` with
arbitrary arguments, triggering unauthorised rarity migrations and vault state corruption without
going through the WAVS appraisal system.

### TRUST-10: `setProtocolTreasury` Rotation Guard Is Incomplete — RESOLVED

`setProtocolTreasury` previously only blocked rotation if
`userTotalDeposits[protocolTreasury] != 0`. This missed two cases:
1. If `protocolTreasury` was `address(0)`, the check passed regardless of vault state.
2. The check did not cover `CardGroupedVault` positions held by the old protocol treasury
   address — those vault shares and pending yield would be orphaned after rotation.

**Fix applied:** The guard now skips validation when `protocolTreasury == address(0)` (first-time
configuration). For subsequent rotations, it checks both `userTotalDeposits` and
`cardGroupedVault.sharesOf(protocolTreasury) != 0`, reverting with `TreasuryRotationBlocked`
if either has outstanding positions.

### TRUST-11: Redemption Window Is a Mutable Global Parameter — RESOLVED

`ProtocolTreasury.redemptionWindow` previously applied uniformly to all NFTs. If the owner
reduced the window after a user won an NFT, the user's eligibility deadline was shortened
without notice.

**Fix applied:** `GachaTreasury._removeNFTAtIndex` now snapshots
`receiveTime + ProtocolTreasury.redemptionWindow()` into a new
`nftRedemptionDeadlines[collection][tokenId]` mapping at win time. `ProtocolTreasury` methods
(`executeRedemption`, `getRemainingRedemptionWindow`, `isRedemptionEligible`) now compare
against the snapshot deadline instead of dynamically recalculating from the mutable
`redemptionWindow`. The deadline is cleared when the NFT returns via `handleRedemptionReturn`.

### TRUST-12: `fulfillRandomness` Has No Reentrancy Guard — RESOLVED

`nonReentrant` has been added to `Gacha.fulfillRandomness`. The full call tree now has
reentrancy guards at each contract boundary:
1. `Gacha.fulfillRandomness` (`nonReentrant` on Gacha)
   → `economyManager.onSpinRevenue` (`nonReentrant` on EconomyManager)
   → `cardGroupedVault.distributeYield` (`nonReentrant` on Vault)
2. → `treasury.sendRandomNFTToWinner` (`nonReentrant` on Treasury)
   → `vault.removeCardDeposit` (`nonReentrant` on Vault — guard was released after step 1)
   → `IERC721.safeTransferFrom` (callback blocked from re-entering any guarded contract)

### TRUST-13: `removeCardDeposit` Auto-Claims Without Its Own Reentrancy Guard — RESOLVED

`nonReentrant` has been added to `CardGroupedVault.removeCardDeposit`. The auto-claim path
via `_payOut` → `asset.safeTransfer` is now guarded. Combined with `nonReentrant` on
`GachaTreasury.sendRandomNFTToWinner`, the entire NFT removal → yield auto-claim → NFT
transfer chain is protected at every contract boundary.
