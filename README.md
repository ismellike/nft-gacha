# SPINFI

<div align="center">

**Fair Spins. Real Yield.**

*Provably fair NFT gacha powered by cryptographic randomness.*

</div>

---

## What is SPINFI?

SPINFI is a provably fair NFT gacha platform where every spin is backed by decentralized cryptography.

**What is gacha?** Gacha is a popular game mechanic where you pay to spin for random rewards. Traditional gacha games hide their odds and use secret algorithms—but SPINFI is different.

Unlike traditional gacha games with hidden algorithms, SPINFI makes all odds visible on-chain and powers every spin with [WAVS](https://github.com/Lay3rLabs/wavs)-DRAND—a decentralized randomness beacon. This makes manipulation mathematically impossible.

Whether you're spinning for NFTs or earning yield by contributing NFTs to pools, SPINFI guarantees fairness you can verify.

---

## Why SPINFI?

<table>
<tr>
<th width="50%" align="center">Traditional Gacha</th>
<th width="50%" align="center">SPINFI</th>
</tr>
<tr>
<td valign="top">

- Hidden odds and algorithms
- Trust in centralized servers required
- No way to verify fairness
- Opaque revenue distribution

</td>
<td valign="top">

- Live draw odds = the on-chain pool composition
- Cryptographic randomness (WAVS-DRAND)
- Verify any spin on-chain
- **95% of revenue to contributors**
- Automatic refunds for empty pools

</td>
</tr>
</table>

---

## Who Should Use SPINFI?

<table>
<tr>
<th width="33%" align="center">Players</th>
<th width="33%" align="center">Contributors</th>
<th width="33%" align="center">Protocol</th>
</tr>
<tr>
<td valign="top">

**Spin for NFTs with verifiable fairness**
- Know your odds before you play
- Instant reveals, no waiting
- Automatic refunds if pools empty
- Verify every spin on-chain

</td>
<td valign="top">

**Earn 95% of all spin fees**
- Build passive income with your NFTs
- Higher-value cards earn a larger yield share
- Withdraw anytime, no lock-ups
- Transparent yield distribution

</td>
<td valign="top">

**Transparent treasury management**
- Sustainable 5% protocol fee
- Community-driven curation
- On-chain analytics dashboard
- Emergency pause controls

</td>
</tr>
</table>

---

## Transparent Economics

<table>
<tr>
<th width="50%" align="center">Draw Odds</th>
<th width="50%" align="center">Reward Distribution</th>
</tr>
<tr>
<td valign="top">

```
Odds = live pool composition.

Every NFT has an equal
1 / (total NFTs) chance, so a
tier's odds are just its share
of inventory. A pool holding

  700 Common
  200 Uncommon
   60 Rare
   30 Epic
   10 Legendary

draws Common 70% of the time —
purely because it is 70% of the
pool. No hidden weights.
```

</td>
<td valign="top">

```
Per 100 tokens spun:

95 -> Contributors
  Paid to the rarity tier that
  produced the spin, split by
  appraisal value across that
  tier's cards.

 5 -> Protocol
  Treasury, buybacks, ops.
```

</td>
</tr>
</table>

---

## Architecture

```
                          SPINFI System
 ┌──────────────────────────────────────────────────────┐
 │                     Frontend                         │
 │         Next.js · Reown AppKit · Zustand             │
 └──────────────┬──────────────────────┬────────────────┘
                │                      │
        wagmi hooks              polling / events
                │                      │
 ┌──────────────▼──────────────────────▼────────────────┐
 │                  Smart Contracts                      │
 │                                                       │
 │  Gacha.sol ──────► GachaTreasury.sol                  │
 │    │                  (NFT pools by rarity)           │
 │    │                                                  │
 │    ├──► GachaEconomyManager.sol                       │
 │    │      (95/5 fee split)                            │
 │    │        └──► CardGroupedVault.sol                  │
 │    │              (per-card yield tracking)            │
 │    │                                                  │
 │    └──► NFTAppraisal.sol                              │
 │           (price-based rarity assignment)              │
 └──────────────┬───────────────────────────────────────┘
                │
        WAVS Service Handlers
                │
 ┌──────────────▼───────────────────────────────────────┐
 │              WAVS AVS Infrastructure                  │
 │                                                       │
 │  wavs-drand ──── Cryptographic randomness (Rust/WASI) │
 │  nft-appraisal ─ Off-chain price oracle   (Rust/WASI) │
 │  aggregator ──── Batch operator submissions           │
 └───────────────────────────────────────────────────────┘
```

### Spin Flow

```
User clicks spin
       │
       ▼
Frontend: writeContract(spinGacha)
       │
       ▼
Gacha contract emits RandomnessRequested
       │
       ▼
WAVS Operator detects trigger
       │
       ▼
wavs-drand component: fetch DRAND + derive VRF
       │
       ▼
Aggregator: batch operator submissions
       │
       ▼
Gacha contract: fulfill randomness, select rarity, transfer NFT
       │
       ▼
Frontend: poll for SpinCompleted event, reveal NFT
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS, Reown AppKit, wagmi v3, Zustand, Framer Motion |
| **Smart Contracts** | Solidity, Foundry, OpenZeppelin |
| **Off-chain Compute** | Rust, WebAssembly (WASI), WAVS operators |
| **Randomness** | DRAND beacon via WAVS-DRAND |
| **Task Automation** | [Task](https://taskfile.dev) runner |

---

## Project Structure

```
nft-gacha/
├── contracts/              # Solidity smart contracts (Foundry)
│   ├── src/
│   │   ├── gacha/          # Gacha.sol, GachaTreasury.sol, service handler
│   │   ├── economy/        # CardGroupedVault, EconomyManager, ProtocolTreasury
│   │   ├── appraisal/      # NFTAppraisal.sol, service handler
│   │   ├── tokens/         # Base ERC20/ERC721 implementations
│   │   └── interfaces/     # Contract interfaces
│   └── test/               # Foundry tests + mocks
├── frontend/               # Next.js application
│   └── src/
│       ├── components/     # Gacha UI (spin controls, history, reveal)
│       ├── ui/             # Glassmorphism design system
│       ├── stores/         # Zustand state management
│       ├── hooks/          # Custom React + contract hooks
│       ├── async-utils/    # Spin flow state machine utilities
│       └── lib/            # Config, helpers
├── packages/               # Rust/WASI off-chain components
│   ├── wavs-drand/         # Cryptographic randomness from DRAND
│   ├── nft-appraisal/      # Off-chain NFT price oracle
│   └── aggregator-simple/  # Operator submission aggregator
├── docs/                   # DESIGN.md, DEPLOYMENT.md
└── Taskfile.yml            # Task runner automation
```

---

## Quick Start

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (forge, anvil)
- [Rust](https://rustup.rs/) with `wasm32-wasip2` target
- [Node.js](https://nodejs.org/) (v18+) and [pnpm](https://pnpm.io/)
- [Task](https://taskfile.dev/installation/) runner
- [Docker](https://docs.docker.com/get-docker/) (for WAVS backend services)

### Setup

```bash
# 1. Clone
git clone https://github.com/Lay3rLabs/nft-gacha.git && cd nft-gacha

# 2. First-time setup (installs deps, creates .env)
task setup

# 3. Edit .env with your wallet keys, RPC endpoints, and contract addresses

# 4. Bootstrap everything (backend + AVS + contracts + frontend)
task bootstrap
```

Navigate to `http://localhost:3000` to start spinning.

### Common Commands

```bash
# Contracts
task contracts:build          # Compile contracts
task contracts:test           # Run all tests
task contracts:deploy         # Deploy to local chain

# Frontend
task frontend:codegen         # Generate TypeScript types from contracts
task frontend:dev             # Start dev server
task frontend:build           # Production build

# Backend
task avs:backend:start        # Start WAVS + Anvil + IPFS
task avs:backend:stop         # Stop all backend services
task status                   # Check service status
```

---

## Contributing

SPINFI is open source and community-driven. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on development workflow, code style, testing, and the pull request process.

---

## Learn More

- [docs/DESIGN.md](./docs/DESIGN.md) — Technical architecture, economics, and WAVS-DRAND integration
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) — End-to-end testnet deployment guide
- [`/contracts`](./contracts) — Smart contracts with Foundry tests
- [`/frontend`](./frontend) — Next.js frontend application
- [`/packages`](./packages) — Rust/WASI off-chain compute components

---

## License

SPINFI is licensed under the [GNU AGPL-3.0](./LICENSE). The on-chain contracts
(`contracts/`) and off-chain WASI components (`packages/`) stay under the MIT license
declared in their source headers, so they can be integrated and reused permissively.
