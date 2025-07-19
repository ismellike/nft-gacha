# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an NFT Gacha system built with Solidity smart contracts and a Next.js frontend. The system provides provably fair gacha mechanics where users pay tokens to receive random NFTs from curated collections with transparent rarity distributions.

## Architecture

### Smart Contracts (`/contracts`)

The system consists of three main contracts:

1. **Gacha.sol** - Main gacha contract that handles:
   - User spins and fee collection
   - Rarity weight configuration (70% Common, 20% Uncommon, 6% Rare, 3% Epic, 1% Legendary)
   - Integration with WAVS randomness service for fair distribution
   - Automatic refunds when selected rarity pools are empty

2. **GachaTreasury.sol** - NFT storage and management:
   - Stores NFTs organized by rarity (Common, Uncommon, Rare, Epic, Legendary)
   - Batch deposit/withdrawal operations (max 50 deposits, 20 withdrawals)
   - Duplicate protection and validation
   - Only accessible by authorized gacha contract

3. **GachaServiceHandler.sol** - WAVS integration:
   - Implements RandomnessConsumer for WAVS-DRAND service
   - Handles signed envelope validation from WAVS service manager
   - Creates and manages Gacha contract instance

### Frontend (`/frontend`)

Next.js application with:
- RainbowKit for wallet connections
- Wagmi for Ethereum interactions
- TypeScript for type safety
- Biome for linting and formatting

## Development Commands

### Smart Contracts

```bash
cd contracts
pnpm install && forge install  # Install dependencies
forge build                    # Compile contracts
forge test                     # Run tests
forge test --match-test testName # Run specific test
forge fmt                      # Format code
forge snapshot                 # Gas usage snapshots
```

### Frontend

```bash
cd frontend
pnpm install                   # Install dependencies
pnpm dev                       # Start development server
pnpm build                     # Build for production
pnpm start                     # Start production server
pnpm lint                      # Run linter
pnpm format                    # Format code
```

## Key Dependencies

### Contracts
- **OpenZeppelin**: Security-audited contract libraries
- **Forge Standard Library**: Testing utilities
- **WAVS Solidity**: Integration with WAVS randomness service

### Frontend
- **Next.js 15**: React framework
- **RainbowKit**: Wallet connection UI
- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript Ethereum library

## Development Notes

### Contract Architecture Patterns
- Uses custom errors for gas efficiency
- Implements pausable functionality for emergency stops
- Reentrancy guards on all state-changing functions
- Batch operations with configurable limits
- Event emissions for off-chain monitoring

### Rarity System
- Fixed weights totaling 10,000 (for precision)
- Configurable by owner but must always sum to TOTAL_WEIGHT
- Automatic validation ensures weighted rarities have available NFTs
- Graceful handling when selected rarity pools become empty during fulfillment

### Testing Strategy
- Comprehensive test coverage including edge cases
- Tests for both successful operations and failure scenarios
- Refund mechanism testing for various fee configurations
- Batch operation testing with boundary conditions

### Security Considerations
- Owner-only administrative functions
- Input validation on all external calls
- Safe transfer patterns for NFTs and tokens
- Protection against common attack vectors (reentrancy, overflow)

## Frontend Integration Points

The frontend needs to interact with:
- Gacha contract for spinning and fee approval
- Treasury contract for viewing available NFTs
- ERC20 token contract for fee payments
- WAVS service for randomness requests

## Gas Optimization

- Uses `unchecked` blocks for safe arithmetic operations
- Batch operations to reduce transaction costs
- Efficient storage patterns and mappings
- Custom errors instead of string reverts