# Testnet Deployment Guide

This guide walks through deploying the NFT Gacha system to **Polygon Amoy** (chain ID `80002`) and seeding it with your first NFT collection.

## Overview

The deployment pipeline has six phases:

1. **Prerequisites** — wallet funding, environment config, Docker
2. **WAVS Infrastructure** — deploy POA middleware (service manager)
3. **Smart Contracts** — deploy all gacha contracts via Foundry
4. **NFT Collection** — deploy, mint, appraise, and deposit NFTs
5. **WAVS Operators** — build components, start operators, register service
6. **Frontend** — sync env vars, configure testnet, deploy

---

## Phase 1: Prerequisites

### 1.1 Fund a Deployer Wallet

Get test MATIC on Polygon Amoy from the [Polygon faucet](https://faucet.polygon.technology/). You need enough to cover deployment gas for ~12 contracts plus NFT minting/deposits.

### 1.2 Install Dependencies

- **Docker** — required for WAVS operators, aggregator, and POA middleware
- **Foundry** — `forge`, `cast`, `anvil` for contract deployment
- **Rust + wasm32-wasip2 target** — for building WASI components
- **Node.js + pnpm** — for the frontend
- **Task** — [task runner](https://taskfile.dev/) for automation

### 1.3 Configure Environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# Switch to testnet mode
DEPLOY_ENV=TESTNET

# Your funded deployer wallet (NEVER use a mainnet key)
DEPLOYER_PRIVATE_KEY=0x<your_private_key>

# Generate unique mnemonics for each operator (DO NOT reuse the defaults)
WAVS_OPERATOR_MNEMONIC_1="<your twelve word mnemonic>"
WAVS_OPERATOR_MNEMONIC_2="<your twelve word mnemonic>"
WAVS_OPERATOR_MNEMONIC_3="<your twelve word mnemonic>"

# Aggregator credential for submitting transactions on-chain
WAVS_AGGREGATOR_CREDENTIAL="<your twelve word mnemonic>"

# Scrydex API (required for live NFT appraisals via WAVS operators)
WAVS_ENV_SCRYDEX_API_KEY="<your_key>"
WAVS_ENV_SCRYDEX_TEAM_ID="<your_team_id>"

# Optional: use a paid RPC for better reliability
# TESTNET_EVM_RPC_URL_3=https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY
```

> **Operator mnemonics**: Each operator needs a unique mnemonic. Generate them with `cast wallet new-mnemonic`. The deployer must fund these operator addresses with test MATIC so they can submit transactions.

### 1.4 Polygonscan API Key

Get a free API key from [polygonscan.com](https://polygonscan.com/apis) — needed for `--verify` during contract deployment.

---

## Phase 2: Deploy WAVS Infrastructure

The POA middleware creates the `WavsServiceManager` contract on-chain. All gacha contracts reference this address.

```bash
DEPLOY_ENV=TESTNET task avs:middleware-deploy
```

This runs the `poa-middleware` Docker image and writes `poa_deploy.json` to `.project-output/chain-1/avs/`.

Verify the service manager address:

```bash
task avs:get-service-manager-address
# Outputs: 0x<WAVS_SERVICE_MANAGER_ADDRESS>
```

---

## Phase 3: Deploy Smart Contracts

### 3.1 Build Contracts

```bash
task contracts:build
```

### 3.2 Deploy to Polygon Amoy

```bash
cd contracts

WAVS_SERVICE_MANAGER_ADDRESS=$(cd .. && task avs:get-service-manager-address) \
forge script script/DeployTestnet.s.sol:DeployTestnet \
  --rpc-url https://polygon-amoy-bor-rpc.publicnode.com \
  --broadcast \
  --verify \
  --etherscan-api-key $POLYGONSCAN_API_KEY \
  --private-key $DEPLOYER_PRIVATE_KEY

cd ..
```

This deploys 9 contracts:

| Contract | Type | Purpose |
|---|---|---|
| TestUSDC | ERC20 (6 decimals) | Payment token (deployed if no `USDC_TOKEN_ADDRESS` set) |
| NFTAppraisal | ERC1967 Proxy | NFT price oracle |
| GachaTreasury | ERC1967 Proxy | NFT pool storage with rarity assignment |
| CardGroupedVault | ERC1967 Proxy | Per-rarity yield tracking |
| ProtocolTreasury | ERC1967 Proxy | Protocol fee collection |
| GachaEconomyManager | ERC1967 Proxy | Fee splitting (95% depositors / 5% protocol) |
| Gacha | ERC1967 Proxy | Main game contract |
| GachaServiceHandler | Immutable | WAVS randomness bridge |
| NFTAppraisalServiceHandler | Immutable | WAVS appraisal bridge |

The script outputs a `.env.testnet` file in the repo root with all deployed addresses.

### 3.3 Verify Deployment

The deploy script prints verification commands. Run them to confirm everything is wired:

```bash
RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com

# Gacha owner should be your deployer
cast call $GACHA_ADDRESS "owner()(address)" --rpc-url $RPC_URL

# Spin fee should be 25000000 (25 tUSDC)
cast call $GACHA_ADDRESS "spinFee()(uint256)" --rpc-url $RPC_URL

# Treasury should point to Gacha
cast call $GACHA_TREASURY_ADDRESS "gachaContract()(address)" --rpc-url $RPC_URL

# Gacha not yet available (no NFTs deposited)
cast call $GACHA_TREASURY_ADDRESS "isGachaAvailable()(bool)" --rpc-url $RPC_URL
```

---

## Phase 4: Seed Your NFT Collection

Unlike local development (which auto-seeds 49 NFTs), testnet requires manual collection setup.

### 4.1 Deploy the NFT Collection

```bash
RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com

forge create contracts/src/tokens/BaseERC721.sol:BaseERC721 \
  --constructor-args "My Gacha Cards" "GACHA" $(cast wallet address --private-key $DEPLOYER_PRIVATE_KEY) \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --verify --etherscan-api-key $POLYGONSCAN_API_KEY
```

Save the deployed address as `COLLECTION_ADDRESS`.

### 4.2 Whitelist the Collection

```bash
cast send $GACHA_TREASURY_ADDRESS \
  "addToWhitelist(address)" $COLLECTION_ADDRESS \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### 4.3 Mint NFTs

Mint with metadata URIs pointing to your NFT images/attributes (IPFS, Arweave, or any HTTP URL):

```bash
# Single mint with URI
cast send $COLLECTION_ADDRESS \
  "mintWithURI(address,string)" $DEPLOYER_ADDRESS "ipfs://QmYourMetadata1" \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY

# Batch mint (up to 100 at a time)
cast send $COLLECTION_ADDRESS \
  "batchMintWithURIs(address,string[])" \
  $DEPLOYER_ADDRESS \
  '["ipfs://QmMetadata1","ipfs://QmMetadata2","ipfs://QmMetadata3"]' \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### 4.4 Appraise Each Card

Each NFT needs a USD price appraisal that determines its rarity tier. Prices use **18 decimal** precision.

```bash
# ownerSetAppraisalForTokenWithCard(address collection, uint256 tokenId, bytes32 cardId, uint256 priceUSD)
#
# cardId is a bytes32 identifier — all tokens of the same card share one cardId.
# Use keccak256 of the card name for a deterministic ID:

CARD_ID=$(cast keccak "charizard-base-set")

cast send $NFT_APPRAISAL_ADDRESS \
  "ownerSetAppraisalForTokenWithCard(address,uint256,bytes32,uint256)" \
  $COLLECTION_ADDRESS 0 $CARD_ID 500000000000000000000 \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY
```

**Rarity tiers by price:**

| Rarity | USD Range | Example (18 decimals) | Spin Weight |
|---|---|---|---|
| Common | $0 – $15 | `10000000000000000000` ($10) | 70% |
| Uncommon | $15.01 – $60 | `30000000000000000000` ($30) | 20% |
| Rare | $60.01 – $250 | `100000000000000000000` ($100) | 6% |
| Epic | $250.01 – $1,200 | `500000000000000000000` ($500) | 3% |
| Legendary | $1,200.01+ | `2000000000000000000000` ($2000) | 1% |

> **Tip**: For your first gacha, seed heavily into Common and Uncommon to ensure most spins yield an NFT. A good starting mix: 20 Common, 10 Uncommon, 5 Rare, 3 Epic, 1 Legendary.

### 4.5 Deposit NFTs into Treasury

```bash
# Approve treasury to transfer all your NFTs
cast send $COLLECTION_ADDRESS \
  "setApprovalForAll(address,bool)" $GACHA_TREASURY_ADDRESS true \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY

# Deposit each NFT (repeat for each tokenId)
for TOKEN_ID in 0 1 2 3 4; do
  cast send $GACHA_TREASURY_ADDRESS \
    "depositNFT(address,uint256)" $COLLECTION_ADDRESS $TOKEN_ID \
    --rpc-url $RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY
done
```

### 4.6 Verify Treasury is Ready

```bash
# Should return true
cast call $GACHA_TREASURY_ADDRESS "isGachaAvailable()(bool)" --rpc-url $RPC_URL

# Check each rarity pool (0=Common, 1=Uncommon, 2=Rare, 3=Epic, 4=Legendary)
for RARITY in 0 1 2 3 4; do
  echo "Rarity $RARITY: $(cast call $GACHA_TREASURY_ADDRESS 'getRarityPoolSize(uint8)(uint256)' $RARITY --rpc-url $RPC_URL)"
done
```

---

## Phase 5: WAVS Operators

The WAVS operators watch for on-chain events (`RandomnessRequested`, `AppraisalRequested`) and submit fulfillments.

### 5.1 Build WASI Components

```bash
task avs:components-build
```

This builds three Rust WASI components:
- `wavs_drand` — fetches DRAND randomness for gacha spins
- `nft_appraisal` — fetches NFT prices from Scrydex
- `aggregator_simple` — batches operator submissions

### 5.2 Upload Components to IPFS

For local testing, the task runner uses a local Kubo node. For testnet, you need components accessible via IPFS.

**Option A: Use the local IPFS node** (works if your WAVS operators can reach localhost):

```bash
task avs:components-upload
```

**Option B: Use a public pinning service** (Pinata, web3.storage):

Upload the `.wasm` files from `target/wasm32-wasip2/release/` to your pinning service, then update the CID files in `.project-output/components/`.

### 5.3 Update WAVS Config for Testnet

The `backend/wavs.toml` already has Polygon Amoy chain config. For testnet, you may want to update the IPFS gateway URL if using a remote pinning service:

```toml
# In backend/wavs.toml — update if using remote IPFS
[wavs]
ipfs_gateway = "https://gateway.pinata.cloud/ipfs/"

[aggregator]
ipfs_gateway = "https://gateway.pinata.cloud/ipfs/"
```

### 5.4 Start Backend Services

```bash
# Start WAVS aggregator and operator(s)
# Chains are skipped in TESTNET mode (uses Polygon Amoy RPC directly)
# IPFS is also skipped in TESTNET mode if using remote pinning
DEPLOY_ENV=TESTNET task backend:start-wavs
```

### 5.5 Build and Deploy the Service

```bash
# Copy .env.testnet to .env.local so the service builder can read contract addresses
cp .env.testnet .env.local

# Build the WAVS service configuration (wires trigger events to component CIDs)
DEPLOY_ENV=TESTNET task avs:build-service

# Upload service to operators
DEPLOY_ENV=TESTNET task avs:upload-service

# Set service URI on-chain
DEPLOY_ENV=TESTNET task avs:set-service-uri
```

### 5.6 Register Operators

```bash
# Deploy service to each operator
for i in $(docker ps --format '{{.Names}}' | grep '^wavs-operator-' | grep -oE '[0-9]+$' | sort -n); do
  DEPLOY_ENV=TESTNET task avs:deploy-service WAVS_INSTANCE="$i"
done

# Register operators with POA middleware
DEPLOY_ENV=TESTNET task avs:register-operators

# Update quorum settings
DEPLOY_ENV=TESTNET task avs:update-quorum

# Register service with aggregator
DEPLOY_ENV=TESTNET task avs:register-service
```

### 5.7 Fund Operator Addresses

Each operator needs test MATIC to submit transactions:

```bash
# Get operator addresses
for i in 1 2 3; do
  echo "Operator $i: $(DEPLOY_ENV=TESTNET task avs:get-operator-address WAVS_INSTANCE=$i)"
done

# Fund them from your deployer (adjust amounts as needed)
cast send $OPERATOR_1_ADDRESS --value 1ether \
  --rpc-url $RPC_URL --private-key $DEPLOYER_PRIVATE_KEY
```

---

## Phase 6: Frontend

### 6.1 Sync Environment Variables

```bash
# Add collection address to .env.local
echo "COLLECTION_ADDRESS=$COLLECTION_ADDRESS" >> .env.local

# Generate NEXT_PUBLIC_ vars for the frontend
task frontend:sync-env
```

### 6.2 Configure WalletConnect

Get a project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/) and add it to `frontend/.env.local`:

```bash
echo "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id" >> frontend/.env.local
```

### 6.3 Generate Contract Types

```bash
task contracts:build
task frontend:codegen
```

### 6.4 Build and Deploy

```bash
cd frontend
pnpm install
pnpm tsc        # Verify no type errors
pnpm build      # Production build
```

Deploy the `frontend/out/` or `frontend/.next/` directory to your hosting provider (Vercel, Netlify, etc.).

> **Note**: The frontend validates several optional addresses (`BUYBACK_VAULT_ADDRESS`, rarity tracker addresses) that are not deployed by `DeployTestnet.s.sol`. The app will start with console warnings but all core gacha functionality works without them.

---

## Phase 7: Test the Full Flow

### 7.1 Distribute TestUSDC to Users

Users need TestUSDC to pay the spin fee ($25 default):

```bash
# Mint 1000 tUSDC to a test user
cast send $USDC_ADDRESS \
  "mint(address,uint256)" $USER_ADDRESS 1000000000 \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### 7.2 End-to-End Test

1. Connect wallet to the frontend (switch to Polygon Amoy network)
2. Approve tUSDC spend for the Gacha contract
3. Click "Spin" — this emits a `RandomnessRequested` event
4. WAVS operator picks up the event, fetches DRAND randomness
5. Aggregator batches and submits the fulfillment on-chain
6. `SpinCompleted` event fires — frontend reveals the won NFT
7. NFT is transferred from treasury to the winner's wallet

### 7.3 Monitor

```bash
# Watch for spin events
cast logs --from-block latest --address $GACHA_ADDRESS --rpc-url $RPC_URL

# Check operator logs
docker logs wavs-operator-1 --tail 50 -f

# Check aggregator logs
docker logs wavs-aggregator --tail 50 -f
```

---

## Quick Reference

### All Contract Addresses

After deployment, addresses are in `.env.testnet`:

```
USDC_ADDRESS=0x...
NFT_APPRAISAL_ADDRESS=0x...
GACHA_TREASURY_ADDRESS=0x...
CARD_GROUPED_VAULT_ADDRESS=0x...
PROTOCOL_TREASURY_ADDRESS=0x...
ECONOMY_MANAGER_ADDRESS=0x...
GACHA_ADDRESS=0x...
GACHA_SERVICE_HANDLER_ADDRESS=0x...
APPRAISAL_SERVICE_HANDLER_ADDRESS=0x...
```

### Key Task Commands

| Command | Description |
|---|---|
| `DEPLOY_ENV=TESTNET task avs:middleware-deploy` | Deploy POA middleware |
| `task avs:get-service-manager-address` | Get WAVS service manager address |
| `task contracts:build` | Build smart contracts |
| `task frontend:sync-env` | Sync env vars to frontend |
| `task frontend:codegen` | Generate TypeScript contract types |
| `DEPLOY_ENV=TESTNET task avs:components-build` | Build WASI components |
| `DEPLOY_ENV=TESTNET task backend:start-wavs` | Start WAVS operators |
| `DEPLOY_ENV=TESTNET task avs:build-service` | Build service config |
| `DEPLOY_ENV=TESTNET task avs:register-operators` | Register operators |

### Rarity Tiers

Tiers are assigned from each NFT's USD appraisal. Draw odds are **not** fixed
weights — they equal the live pool composition (a tier's share of total
inventory), so the distribution below only sets the price bands, not the odds.

| Rarity | Price Range (USD) |
|---|---|
| Common | $0 – $15 |
| Uncommon | $15.01 – $60 |
| Rare | $60.01 – $250 |
| Epic | $250.01 – $1,200 |
| Legendary | $1,200.01+ |

### Network Details

| Property | Value |
|---|---|
| Chain | Polygon Amoy |
| Chain ID | 80002 |
| RPC | `https://polygon-amoy-bor-rpc.publicnode.com` |
| WebSocket | `wss://polygon-amoy-bor-rpc.publicnode.com` |
| Explorer | `https://amoy.polygonscan.com` |
| Faucet | `https://faucet.polygon.technology/` |

---

## Troubleshooting

### "Gacha not available" after depositing NFTs

- Verify NFTs were appraised: `cast call $NFT_APPRAISAL_ADDRESS "getAppraisal(address,uint256)(uint256)" $COLLECTION $TOKEN_ID --rpc-url $RPC_URL`
- Verify collection is whitelisted: `cast call $GACHA_TREASURY_ADDRESS "whitelistedCollections(address)(bool)" $COLLECTION --rpc-url $RPC_URL`
- Check pool sizes — if all zeroes, the appraisal price may not match any rarity tier boundary

### Spins not being fulfilled

- Check operator logs: `docker logs wavs-operator-1 --tail 100`
- Verify operators are registered: check POA middleware registration
- Verify operator addresses have MATIC for gas
- Confirm WAVS service is deployed and the trigger addresses match your contract

### "Insufficient allowance" on spin

Users must approve the Gacha contract to spend their tUSDC before spinning:

```bash
cast send $USDC_ADDRESS \
  "approve(address,uint256)" $GACHA_ADDRESS 1000000000 \
  --rpc-url $RPC_URL \
  --private-key $USER_PRIVATE_KEY
```

### Frontend missing addresses

The testnet config uses `emptyFallback: true` — missing addresses produce console warnings, not crashes. Core gacha functionality (spin, reveal, deposit) works without the optional tracker and buyback vault addresses.

### Recovering a partial deploy

If the deploy fails midway ("nonce too low", dropped tx), resume from the last successful transaction instead of redeploying:

```bash
cd contracts
forge script script/DeployTestnet.s.sol:DeployTestnet \
  --rpc-url $RPC_URL --broadcast --resume --private-key $DEPLOYER_PRIVATE_KEY
```

For flaky testnet RPCs, add `--slow` (waits for each receipt) or override gas: `--with-gas-price 30gwei --gas-estimate-multiplier 150`.

### Manual contract verification

If you did not pass `--verify` during deployment, verify individually. Implementation addresses live behind the ERC-1967 proxy storage slot:

```bash
# Proxy
forge verify-contract $GACHA_ADDRESS ERC1967Proxy --chain 80002 --etherscan-api-key $ETHERSCAN_API_KEY

# Implementation (read impl address from the proxy slot first)
IMPL=$(cast storage $GACHA_ADDRESS 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc --rpc-url $RPC_URL)
forge verify-contract $IMPL Gacha --chain 80002 --etherscan-api-key $ETHERSCAN_API_KEY

# Non-proxy service handlers (pass constructor args)
forge verify-contract $GACHA_SERVICE_HANDLER_ADDRESS GachaServiceHandler --chain 80002 \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address,address)" $WAVS_SERVICE_MANAGER_ADDRESS $GACHA_ADDRESS)
```

Compiler settings must match `foundry.toml` (`--compiler-version v0.8.27 --optimizer-runs 200`) or verification fails.
