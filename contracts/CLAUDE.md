# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the smart contracts layer for an NFT Gacha system built on Foundry, providing provably fair randomness for NFT distribution. The contracts manage:

- **Gacha Mechanics**: Core spinning game with weighted rarity system using WAVS randomness
- **NFT Appraisal**: Price valuation system for automatic rarity assignment
- **Treasury Management**: Price-based NFT storage with rarity categorization
- **Rewards Distribution**: Multi-tier dividend system for NFT depositors

## Essential Development Commands

### Smart Contract Development
```bash
# Build and test contracts
forge build                   # Compile contracts
forge test                    # Run all tests
forge test --match-test <test_name>  # Run specific test
forge fmt                     # Format Solidity code
forge snapshot                # Gas snapshot analysis

# Local development
anvil                         # Start local testnet
forge script script/DeployLocal.s.sol \\
  --rpc-url http://localhost:8545 \\
  --private-key <key> \\
  --broadcast \\
  --skip-simulation \\
  --sig run \\
  --env WAVS_SERVICE_MANAGER_ADDRESS=<manager> \\
         USDC_TOKEN_ADDRESS=<usdc> \\
         APPRAISAL_PROTOCOL_ADDRESS=<protocol_treasury> \\
         GACHA_SPIN_FEE=<fee_in_wei> \\
         NFT_APPRAISAL_FEE=<fee_in_wei>

# Contract verification and deployment
forge verify-contract <contract> <chain> --verifier etherscan
forge create <contract> --rpc-url <url> --private-key <key>
```

## Architecture

### Core Contract System

**Gacha Contract** (`src/gacha/Gacha.sol`)
- Main game interface handling spin requests and randomness fulfillment
- Uses WAVS service handlers for provably fair randomness
- Uniform-over-pool selection: every NFT in the treasury is equally likely to be drawn
  (a tier is chosen with probability `counts[i]/totalCount`, then a uniform NFT within it).
  Draw odds ARE the live pool composition (`getCurrentRarityWeights()`), verifiable on-chain;
  rarity is a descriptive label, not a probability input. There is no configurable rarity-weight
  knob — odds are purely a function of current inventory.
- Spin fee = pool-average expected value (`getExpectedValueUSD()`) × pricing premium
- Manages spin fees and automatic refunds when the pool is empty at fulfillment
- Comprehensive analytics tracking for spins, wins, and refunds

**NFTAppraisal Contract** (`src/appraisal/NFTAppraisal.sol`)
- Paid appraisal service for NFT valuation in USD
- Card-based pricing system where multiple tokens can share the same price
- Supports owner overrides for local testing
- Integrates with external oracle services for price discovery
- Batch appraisal capabilities for gas optimization

**GachaTreasury Contract** (`src/gacha/GachaTreasury.sol`)
- Price-based NFT storage with automatic rarity assignment
- 5-tier rarity system with specific USD price ranges:
  - Common: $0-$15
  - Uncommon: $25-$60
  - Rare: $70-$250
  - Epic: $300-$1,200
  - Legendary: $1,500+
- Value-weighted dividend tracking for reward distribution
- Collection whitelist system for controlling allowed NFTs
- O(1) random selection using swap-and-pop algorithm
- Timeout mechanisms for orphaned spins and refunds

**GachaEconomyManager Contract** (`src/economy/GachaEconomyManager.sol`)
- Intelligent fee distribution from spin operations
- Splits spin revenue between depositors (95%) and protocol (5%)
- Queues depositor yield when no NFTs are deposited (no shares exist)
- Processes queued yield automatically when deposits arrive
- Auto-claims protocol yield when protocol has meaningful shares
- Prevents protocol from receiving depositor yield inappropriately

**CardGroupedVault Contract** (`src/economy/CardGroupedVault.sol`)
- Card-grouped yield vault using correction accumulator pattern for O(1) price updates
- Tracks deposits at the card level (all tokens of the same card share one CardNode)
- Per-rarity yield distribution: spin revenue routes to the rarity tier that generated it
- Correction accumulator enables O(1) price updates without iterating depositors
- Rarity migration settles old-tier yield and moves card to new pool atomically
- Backward-compatible view functions (`sharesOf`, `pendingYield`, `totalShares`, `claimYield`, `asset`)

**ProtocolTreasury Contract** (`src/economy/ProtocolTreasury.sol`)
- Treasury for protocol funds and fees
- Manages protocol revenue distribution
- Handles administrative functions
- Supports emergency withdrawal mechanisms

### Service Handler Pattern

Both Gacha and NFTAppraisal use authorized service handler contracts for:
- **GachaServiceHandler** (`src/gacha/GachaServiceHandler.sol`): Processes randomness requests from WAVS network
- **NFTAppraisalServiceHandler** (`src/appraisal/NFTAppraisalServiceHandler.sol`): Handles price updates from external appraisal oracles

This pattern separates core game logic from external service integration, allowing for modular upgrades and testing.

### Utility Contracts

Additional utility contracts provide system-wide functionality:
- **ERC20BatchQuery** (`src/utils/ERC20BatchQuery.sol`): Batch query operations for ERC20 tokens
- **BaseERC20** (`src/tokens/BaseERC20.sol`): Base ERC20 token implementation
- **BaseERC721** (`src/tokens/BaseERC721.sol`): Base ERC721 NFT implementation

### CardGroupedVault Architecture

The CardGroupedVault uses a correction accumulator pattern for efficient card-level yield tracking:

**Data Model:**
```
RarityPool[5]                    ← 5 per-rarity accumulators
  └─ accYieldPerUSD              ← cumulative yield per $1 of value
  └─ totalValueUSD               ← sum of (count × price) for all cards

CardNode[cardId]                 ← one per card
  └─ rarity, cardPriceUSD, totalCount
  └─ correctionPerUnit (int256)  ← accumulates price-change corrections
  └─ settledYieldPerUnit         ← yield from previous rarity stints
  └─ baseAcc                     ← accYieldPerUSD[rarity] when card entered pool

DepositorPosition[cardId][depositor]  ← per depositor per card
  └─ count, rewardDebt, correctionDebt (int256), settledDebt
```

**Key Operations:**
- `registerCardDeposit(cardId, depositor, priceUSD, rarity, count)`: Adds card deposit to vault
- `removeCardDeposit(cardId, depositor, count)`: Removes deposit, auto-claims if count reaches 0
- `updateCardPrice(cardId, newPriceUSD)`: O(1) price update via correction accumulator
- `migrateCardRarity(cardId, newRarity, newPriceUSD)`: O(1) rarity migration with yield settlement
- `distributeYield(amount, rarity)`: O(1) yield distribution to a specific rarity pool
- `claimYield(account)`: Iterates depositor's card list, claims accumulated yield

**Correction Accumulator (O(1) price updates):**
When a card's price changes within the same rarity:
```
correctionPerUnit += (newP - oldP) × (accYieldPerUSD[rarity] - baseAcc) / PRECISION
```
This adjusts all depositors' yield calculations without iterating them.

**Rarity Migration (O(1) vault update):**
When a card moves to a new rarity tier:
```
settledYieldPerUnit += price × (accYieldPerUSD[oldR] - baseAcc) / PRECISION - correctionPerUnit
baseAcc = accYieldPerUSD[newR]; correctionPerUnit = 0
```

### Rewards Integration

Multi-tier rewards system integrated with the CardGroupedVault:
1. **Rarity-level rewards**: Spin revenue routes to the rarity tier that generated it via `distributeYield(amount, rarity)`
2. **Card-level rewards**: Value-weighted rewards based on card appraisal within each rarity pool
3. **Depositor-level rewards**: Individual rewards calculated as `depositValue / totalRarityValue × rarityRewards`

**GachaEconomyManager** handles intelligent fee distribution from spin operations:
- Splits spin revenue between depositors (95%) and protocol (5%)
- Routes depositor yield to the specific rarity pool via `distributeYield(amount, rarity)`
- Queues depositor yield when the rarity pool has no deposits (totalValueUSD == 0)
- Processes queued yield automatically when deposits arrive
- Only auto-claims protocol yield when protocol has meaningful shares

### Key Data Flows

1. **NFT Deposit Flow**: appraisal → price-based rarity → treasury deposit → `vault.registerCardDeposit(cardId, depositor, priceUSD, rarity, 1)`
2. **Gacha Spin Flow**: fee payment → randomness request → rarity selection → NFT distribution → economy manager fee splitting → `vault.distributeYield(amount, rarity)`
3. **Price Update Flow**: `NFTAppraisal._triggerAutoMigration()` → `GachaTreasury.onCardPriceUpdated(cardId, newPriceUSD)` → `vault.updateCardPrice(cardId, newPriceUSD)` [O(1)]
4. **Rarity Migration Flow**: price change crosses rarity boundary → `vault.migrateCardRarity(cardId, newRarity, newPriceUSD)` [O(1) vault] + treasury array migration [O(tokens_per_card)]

### Advanced Features

#### Queued Yield Mechanism
- **Yield Queueing**: When no NFTs are deposited in the treasury, depositor yield is queued instead of being lost
- **Automatic Processing**: Queued yield is automatically distributed to depositors when NFTs are deposited
- **Fair Distribution**: Ensures early depositors receive their fair share of accumulated yield
- **Integration**: Seamlessly integrated with GachaEconomyManager for intelligent yield management

#### Timeout and Refund System
- **Orphaned Spin Handling**: Spins that don't receive randomness within timeout period are automatically refunded
- **Timeout Configuration**: Adjustable timeout periods for different operational scenarios
- **Refund Mechanism**: Automatic refund of spin fees when operations fail due to timeouts
- **Event Tracking**: Comprehensive event logging for timeout and refund operations

#### Batch Operations
- **Batch Claims**: Users can claim multiple rewards in a single transaction
- **Batch Deposits**: Multiple NFTs can be deposited efficiently
- **Batch Queries**: ERC20 token balances can be queried in batches
- **Gas Optimization**: All batch operations designed for maximum gas efficiency

#### Correction Accumulator Implementation Details
- **CardNode Structure**: Each card stores rarity, price, totalCount, correctionPerUnit (int256), settledYieldPerUnit, and baseAcc
- **DepositorPosition**: Per-depositor-per-card tracking with count, rewardDebt, correctionDebt (int256), settledDebt
- **O(1) Price Updates**: `updateCardPrice` adjusts correctionPerUnit without iterating depositors
- **O(1) Rarity Migration**: `migrateCardRarity` settles yield from old tier and resets for new tier
- **Signed Math**: correctionPerUnit uses int256 because prices can decrease
- **Precision**: Uses `Math.mulDiv` for safe 256-bit multiplication with 1e18 precision factor

## Testing

Test files are organized with comprehensive unit and integration testing:

### Core Contract Tests
- `test/GachaTreasury.t.sol` - Treasury management and basic operations
- `test/GachaTreasuryTest.t.sol` - Treasury unit tests
- `test/GachaTreasuryEconomicsTest.t.sol` - Treasury economics simulation
- `test/NFTAppraisal.t.sol` - Appraisal system testing
- `test/NFTAppraisalTest.t.sol` - Appraisal unit tests
- `test/NFTAppraisalEconomicsTest.t.sol` - Appraisal economics testing

### Integration Tests
- `test/EconomyFlow.t.sol` - Complete economy flow integration testing
- `test/QueuedYieldTest.t.sol` - Queued yield mechanism testing
- `test/TimeoutMechanismTest.t.sol` - Timeout system testing
- `test/BasicEconomicsTest.t.sol` - Basic economics flow testing
- `test/SimpleCardTracking.t.sol` - Card tracking functionality testing

### Mock Contracts
Mock contracts available in `test/mocks/` for isolated testing:
- `MockCardGroupedVault.sol` - Mock card-grouped vault for testing
- `MockERC20.sol` - Mock ERC20 token
- `MockERC721.sol` - Mock ERC721 NFT
- `MockNFTAppraisal.sol` - Mock appraisal service
- `MockProtocolTreasury.sol` - Mock protocol treasury
- `MockWavsServiceManager.sol` - Mock WAVS service manager

## Configuration

**foundry.toml** configures comprehensive development environment:

### Compiler Settings
- Solidity version ^0.8.27 with optimizer enabled (200 runs)
- IR-based compilation (`via_ir = true`) for optimized bytecode
- Multiple output profiles for different testing scenarios

### Library Remappings
- `@openzeppelin/contracts/` - Standard ERC interfaces and access control
- `@openzeppelin/contracts-upgradeable/` - Upgradeable contract patterns
- `@wavs/solidity/` - WAVS network integration for randomness
- `forge-std/` - Foundry testing framework

### File System Permissions
- Read-write access to project directory and parent directory
- Enables test file access and external script execution

### Testing Profiles
- **Default Profile**: Standard configuration with fuzz testing (256 runs) and invariant testing (256 runs, depth 15)
- **Test Profile**: Enhanced verbosity (3) and detailed revert information for debugging
- **Coverage Profile**: Comprehensive coverage analysis with FFI enabled

### Gas Optimization
- Optimizer runs set to 200 for balance between deployment cost and execution efficiency
- IR-based compilation for advanced optimization opportunities

**Dependencies**:
- `@openzeppelin/contracts` & `@openzeppelin/contracts-upgradeable` - Security audited contract libraries
- `@wavs/solidity` - WAVS integration for off-chain compute
- `forge-std` - Foundry's testing and deployment framework

## Development Notes

### Gas Optimization
- Extensive use of swap-and-pop patterns for O(1) array operations
- Batch functions for reducing RPC calls in frontend integrations
- Custom errors for gas-efficient error handling

### Security Considerations
- Reentrancy guards on all external functions
- Access control using OpenZeppelin's Ownable pattern
- Pause functionality for emergency stops
- Comprehensive input validation and edge case handling

### Upgrade Patterns
- Immutable variables for critical contract addresses
- Authorized service handler pattern for external integrations
- Configuration updates through owner-only functions with events
