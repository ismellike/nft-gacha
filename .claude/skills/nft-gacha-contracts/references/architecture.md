# Contract Architecture Reference

## Contract Dependency Graph

```
Gacha.sol (Main game logic)
    ├── Calls NFTAppraisal for prices
    ├── Uses WAVS for randomness
    └── Emits SpinCompleted

GachaTreasury.sol (NFT storage)
    ├── Assigns rarity by price
    ├── Stores NFTs by rarity pool
    ├── Calls CardGroupedVault for card-level tracking
    └── Mints to winners

GachaEconomyManager.sol (Fees & yield)
    ├── Collects spin fees
    ├── Routes yield per-rarity to CardGroupedVault
    └── Queues yield when rarity pool empty

CardGroupedVault.sol (Card-grouped yield)
    ├── Per-rarity yield pools (5 tiers)
    ├── O(1) price updates via correction accumulator
    └── O(1) rarity migration with yield settlement
```

## Gacha Spin Flow (end-to-end)

```
User clicks spin
    ↓
Frontend: writeContract({ spinGacha })
    ↓
Gacha contract: RandomnessRequested event
    ↓
WAVS Operator detects trigger
    ↓
wavs_drand component: Fetch DRAND + derive VRF
    ↓
Aggregator: Batch submissions
    ↓
Gacha contract: SpinCompleted event
    ↓
Frontend: Polls for event, reveals NFT
```

## Interface Files

- `contracts/src/interfaces/IGacha.sol` - Gacha interface
- `contracts/src/interfaces/IGachaEconomyManager.sol` - Economy interface
- `contracts/src/interfaces/ICardGroupedVault.sol` - Vault interface
- `contracts/src/interfaces/IProtocolTreasury.sol` - Treasury interface
- `contracts/src/interfaces/IFundsDistributionToken.sol` - FDT interface
- `contracts/src/interfaces/NFTAppraisalTypes.sol` - Appraisal types
- `contracts/src/interfaces/WavsDrandTypes.sol` - WAVS/DRAND types

## Test Organization

```
contracts/test/
├── unit/           - Isolated contract tests
│   ├── appraisal/  - NFTAppraisal, ServiceHandler tests
│   └── economy/    - CardGroupedVault, EconomyManager, ProtocolTreasury tests
├── integration/    - Multi-contract interaction tests
├── fuzz/           - Fuzzing tests for edge cases
├── stress/         - Load and stress tests
├── gas/            - Gas snapshot tests
├── economics/      - Economic model validation
├── invariant/      - Invariant tests
├── helpers/        - Shared test utilities
└── mocks/          - Mock contracts for isolation
```
