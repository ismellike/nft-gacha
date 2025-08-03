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

Next.js application with game-fi glassmorphism design system:
- **Design Language**: Glassmorphism with `backdrop-blur-xl` effects, transparent borders (`border-white/20`), and gradient backgrounds
- **Color Scheme**: Warning/orange gradients (`from-warning to-orange-400`) with content1/background transparency layers
- **Animation Style**: Smooth spring animations with floating/breathing effects using Framer Motion
- **Component Styling**: Cards use `bg-content1/20 backdrop-blur-xl` with `shadow-2xl` and rounded corners
- **Interactive Elements**: Hover states with scale transforms and gradient shifts
- **Tech Stack**: RainbowKit for wallet connections, Wagmi for Ethereum interactions, TypeScript for type safety

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
pnpm tsc                           # Type check (preferred for development)
pnpm lint                      # Run linter
pnpm format                    # Format code
```

## Key Dependencies

### Contracts
- **OpenZeppelin**: Security-audited contract libraries
- **Forge Standard Library**: Testing utilities
- **WAVS Solidity**: Integration with WAVS randomness service

### Frontend
- **Next.js 15**: React framework with App Router
- **RainbowKit**: Wallet connection UI with glassmorphism theming
- **Wagmi**: React hooks for Ethereum interactions
- **Viem**: TypeScript Ethereum library
- **Framer Motion**: Animation library for smooth transitions
- **HeroUI**: Component library styled with glassmorphism design system

## Development Notes

### Frontend Design System

#### Glassmorphism Theme
- **Background Layers**: Use `bg-content1/20` to `bg-content1/40` with `backdrop-blur-xl`
- **Borders**: Consistent `border-white/20` or `border-white/30` for subtle definition
- **Shadows**: Apply `shadow-xl` or `shadow-2xl` for depth
- **Inner Highlights**: Add `from-white/10 to-transparent` gradient overlays for glass effect

#### Color Palette
- **Primary**: Warning/orange gradients (`from-warning to-orange-400`)
- **Backgrounds**: Layered transparency (`from-background/95 to-background/80`)
- **Accents**: Content1 variants (`from-content1/40 via-background/95 to-content1/30`)

#### Animation Patterns
- **Hover States**: Scale transforms `whileHover={{ scale: 1.02 }}` with spring transitions
- **Loading**: Breathing animations with opacity and scale changes
- **Reveals**: Spring animations with stagger delays for sequential reveals
- **Interactive**: Pulse effects on buttons and floating animations for cards

#### Component Standards
- **Cards**: `bg-content1/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20`
- **Buttons**: Glassmorphism with gradient backgrounds and hover state transitions
- **Modals**: Full-screen `bg-background/95 backdrop-blur-xl` with centered content
- **Icons**: Contained in glassmorphism containers with inner light effects

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