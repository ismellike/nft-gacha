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
- Implements weighted rarity selection (Common 70%, Uncommon 20%, Rare 6%, Epic 3%, Legendary 1%)
- Manages spin fees and automatic refunds for empty rarity pools
- Comprehensive analytics tracking for spins, wins, and refunds

**NFTAppraisal Contract** (`src/appraisal/NFTAppraisal.sol`)
- Paid appraisal service for NFT valuation in USD
- Card-based pricing system where multiple tokens can share the same price
- Supports owner overrides for local testing
- Integrates with external oracle services for price discovery
- Batch appraisal capabilities for gas optimization

**GachaTreasury Contract** (`src/gacha/GachaTreasury.sol`)
- Price-based NFT storage with automatic rarity assignment
- 5-tier rarity system with configurable USD price ranges:
  - Common: $0-$100
  - Uncommon: $100-$500
  - Rare: $500-$2,000
  - Epic: $2,000-$10,000
  - Legendary: $10,000+
- Value-weighted dividend tracking for reward distribution
- Collection whitelist system for controlling allowed NFTs
- O(1) random selection using swap-and-pop algorithm

### Service Handler Pattern

Both Gacha and NFTAppraisal use authorized service handler contracts for:
- **GachaServiceHandler**: Processes randomness requests from WAVS network
- **NFTAppraisalServiceHandler**: Handles price updates from external appraisal oracles

This pattern separates core game logic from external service integration, allowing for modular upgrades and testing.

### Rewards Integration

Three-tier rewards system integrated across contracts:
1. **Rarity-level rewards**: Based on NFT rarity distribution
2. **Card-level rewards**: Based on specific card deposits
3. **User-level rewards**: Value-weighted dividend tracking

Rewards managers handle fee distribution from spin operations and NFT wins.

### Key Data Flows

1. **NFT Deposit Flow**: appraisal → price-based rarity → treasury deposit → rewards tracking
2. **Gacha Spin Flow**: fee payment → randomness request → rarity selection → NFT distribution → rewards distribution
3. **Price Migration Flow**: price update → rarity re-evaluation → treasury migration → rewards recalculation

## Testing

Test files are organized by contract:
- `test/Gacha.t.sol` - Core gacha mechanics testing
- `test/NFTAppraisal.t.sol` - Appraisal system testing
- `test/GachaTreasury.t.sol` - Treasury management testing
- `test/GachaRewards.t.sol` - Rewards distribution testing
- `test/BatchClaim.t.sol` - Batch operations testing

Mock contracts available in `test/mocks/` for isolated testing.

## Configuration

**foundry.toml** configures:
- Solidity version ^0.8.27 with optimizer enabled (200 runs)
- Library remappings for OpenZeppelin and WAVS contracts
- File system permissions for test file access

**Dependencies**:
- `@openzeppelin/contracts` - Standard ERC interfaces and access control
- `@wavs/solidity` - WAVS network integration for randomness

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
