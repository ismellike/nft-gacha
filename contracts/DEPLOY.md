# Testnet Deployment Guide

Step-by-step instructions for deploying the NFT Gacha system to a public testnet.

## Prerequisites

### 1. Funded Deployer Wallet

You need a wallet with native gas tokens on your target chain. The deployment
creates ~10 contracts plus proxy wiring, so budget generously for gas.

| Chain          | Chain ID   | Faucet                                           |
|----------------|------------|--------------------------------------------------|
| Holesky        | 17000      | https://holesky-faucet.pk910.de                  |
| Sepolia        | 11155111   | https://sepoliafaucet.com                        |
| Polygon Amoy   | 80002      | https://faucet.polygon.technology                |

Export the deployer private key (never use a key that holds mainnet funds):

```bash
export DEPLOYER_PRIVATE_KEY=0x<your_testnet_private_key>
```

### 2. RPC Endpoint

Use a reliable RPC provider. Public endpoints may rate-limit or drop
transactions during deployment.

```bash
export RPC_URL=https://holesky.infura.io/v3/<YOUR_API_KEY>
# or
export RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<YOUR_API_KEY>
```

### 3. WAVS Service Manager Address

The WAVS middleware must already be deployed on the Holesky chain (chain 17000).
After running the WAVS AVS bootstrap (`task avs:bootstrap`), the service manager
address is recorded in `.project-output/chain-1/avs/avs_deploy.json`.

```bash
export WAVS_SERVICE_MANAGER_ADDRESS=0x<address_from_avs_deploy>
```

### 4. USDC Token Address (Optional)

If the target chain has a test USDC contract you want to use, set it:

```bash
export USDC_TOKEN_ADDRESS=0x<existing_usdc_address>
```

If this variable is **not set**, the deploy script will automatically deploy a
`TestUSDC` token (6 decimals) and mint 1,000,000 tUSDC to the deployer.

### 5. Etherscan/Blockscout API Key (Optional, for verification)

```bash
export ETHERSCAN_API_KEY=<your_api_key>
```

---

## Deploy Command

From the repository root:

```bash
cd contracts

forge script script/DeployTestnet.s.sol:DeployTestnet \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### With Contract Verification

To verify contracts on Etherscan/Blockscout in the same step:

```bash
forge script script/DeployTestnet.s.sol:DeployTestnet \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### With Custom Spin Fee

To set a different spin fee (default is 25 USDC = 25000000 in 6 decimals):

```bash
SPIN_FEE=10000000 forge script script/DeployTestnet.s.sol:DeployTestnet \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### Slow Mode (for unreliable RPCs)

If transactions are being dropped, add `--slow` to wait for each tx receipt:

```bash
forge script script/DeployTestnet.s.sol:DeployTestnet \
  --rpc-url $RPC_URL \
  --broadcast \
  --slow \
  --private-key $DEPLOYER_PRIVATE_KEY
```

---

## Post-Deploy Verification

After deployment, the script prints all addresses and verification commands.
You can also verify manually:

### Read Contract State

```bash
# Check Gacha owner
cast call <GACHA_ADDRESS> "owner()(address)" --rpc-url $RPC_URL

# Check spin fee (should return 25000000 for $25)
cast call <GACHA_ADDRESS> "spinFee()(uint256)" --rpc-url $RPC_URL

# Check treasury is wired to gacha
cast call <GACHA_TREASURY_ADDRESS> "gachaContract()(address)" --rpc-url $RPC_URL

# Check economy manager is wired
cast call <GACHA_ADDRESS> "economyManager()(address)" --rpc-url $RPC_URL

# Check gacha availability (false until NFTs deposited)
cast call <GACHA_TREASURY_ADDRESS> "isGachaAvailable()(bool)" --rpc-url $RPC_URL

# Check USDC address used
cast call <GACHA_ADDRESS> "paymentToken()(address)" --rpc-url $RPC_URL
```

### Verify Contracts on Etherscan

If you did not use `--verify` during deployment, verify individually:

```bash
# Verify proxy contracts
forge verify-contract <GACHA_ADDRESS> ERC1967Proxy \
  --chain <CHAIN_ID> \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Verify implementation contracts (get impl address from proxy storage slot)
IMPL=$(cast storage <GACHA_ADDRESS> 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc --rpc-url $RPC_URL)
forge verify-contract $IMPL Gacha \
  --chain <CHAIN_ID> \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Verify non-proxy contracts (service handlers)
forge verify-contract <GACHA_SERVICE_HANDLER_ADDRESS> GachaServiceHandler \
  --chain <CHAIN_ID> \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address,address)" $WAVS_SERVICE_MANAGER_ADDRESS <GACHA_ADDRESS>)
```

### Broadcast Artifacts

Foundry saves all transaction details in:
```
contracts/broadcast/DeployTestnet.s.sol/<CHAIN_ID>/run-latest.json
```

This file contains every deployed contract address, constructor arguments, and
transaction hashes for auditing.

---

## Frontend Environment Setup

The deploy script writes a `.env.testnet` file in the repository root with all
contract addresses. To connect the frontend:

### Step 1: Copy Addresses to `.env.local`

```bash
# From the repository root
cp .env.testnet .env.local
```

Or merge manually if you have existing `.env.local` content.

### Step 2: Set Additional Frontend Variables

Add these to `.env.local` (not generated by the deploy script):

```bash
# Required
ENV_MODE=TESTNET
CHAIN_ID=<your_chain_id>
RPC_URL=<your_rpc_url>

# Optional: WalletConnect project ID for wallet connections
# WALLETCONNECT_PROJECT_ID=<your_project_id>
```

### Step 3: Sync to Frontend

```bash
task frontend:sync-env
```

This copies `.env.local` entries to `frontend/.env.local` with `NEXT_PUBLIC_`
prefixes, which Next.js requires for client-side access.

### Step 4: Verify Configuration

The frontend validates all addresses at startup. When running in TESTNET mode,
`validateTestnetConfig()` will log warnings for any missing addresses.

The required `NEXT_PUBLIC_*` variables (after sync) are:

| Variable                                     | Source                     |
|----------------------------------------------|----------------------------|
| `NEXT_PUBLIC_ENV_MODE`                       | Set to `TESTNET`           |
| `NEXT_PUBLIC_CHAIN_ID`                       | Target chain ID            |
| `NEXT_PUBLIC_RPC_URL`                        | Target RPC URL             |
| `NEXT_PUBLIC_USDC_ADDRESS`                   | From deploy output         |
| `NEXT_PUBLIC_GACHA_ADDRESS`                  | From deploy output         |
| `NEXT_PUBLIC_GACHA_TREASURY_ADDRESS`         | From deploy output         |
| `NEXT_PUBLIC_NFT_APPRAISAL_ADDRESS`          | From deploy output         |
| `NEXT_PUBLIC_ECONOMY_MANAGER_ADDRESS`        | From deploy output         |
| `NEXT_PUBLIC_CARD_GROUPED_VAULT_ADDRESS`     | From deploy output         |
| `NEXT_PUBLIC_PROTOCOL_TREASURY_ADDRESS`      | From deploy output         |
| `NEXT_PUBLIC_GACHA_SERVICE_HANDLER_ADDRESS`  | From deploy output         |
| `NEXT_PUBLIC_APPRAISAL_SERVICE_HANDLER_ADDRESS` | From deploy output      |

The tracker and buyback vault addresses are optional for initial testnet
deployment -- they can be added later.

---

## Post-Deploy: Seeding the Treasury

The testnet deploy script does **not** seed the treasury with demo NFTs (unlike
the local deploy). After deployment, the gacha will report `isGachaAvailable() = false`
until you:

1. Deploy or use an existing ERC721 collection
2. Whitelist the collection on GachaTreasury
3. Set appraisal prices via NFTAppraisal
4. Deposit NFTs into the treasury

Example using `cast`:

```bash
# 1. Whitelist a collection
cast send <GACHA_TREASURY_ADDRESS> "addToWhitelist(address)" <COLLECTION_ADDRESS> \
  --rpc-url $RPC_URL --private-key $DEPLOYER_PRIVATE_KEY

# 2. Set appraisal for a token
cast send <NFT_APPRAISAL_ADDRESS> \
  "ownerSetAppraisalForTokenWithCard(address,uint256,bytes32,uint256)" \
  <COLLECTION_ADDRESS> <TOKEN_ID> <CARD_ID_BYTES32> <PRICE_IN_18_DECIMALS> \
  --rpc-url $RPC_URL --private-key $DEPLOYER_PRIVATE_KEY

# 3. Approve treasury to transfer NFT
cast send <COLLECTION_ADDRESS> "approve(address,uint256)" <GACHA_TREASURY_ADDRESS> <TOKEN_ID> \
  --rpc-url $RPC_URL --private-key $DEPLOYER_PRIVATE_KEY

# 4. Deposit NFT
cast send <GACHA_TREASURY_ADDRESS> "depositNFT(address,uint256)" <COLLECTION_ADDRESS> <TOKEN_ID> \
  --rpc-url $RPC_URL --private-key $DEPLOYER_PRIVATE_KEY
```

---

## Troubleshooting

### "WAVS_SERVICE_MANAGER_ADDRESS not set"

The deploy script requires a real WAVS service manager. Ensure the WAVS
middleware has been deployed first (`task avs:bootstrap`) and export the address.

### "Nonce too low" / Transaction Failures

If a partial deployment failed, check `broadcast/DeployTestnet.s.sol/<CHAIN_ID>/`
for the last successful nonce. You may need to:
- Wait for pending transactions to clear
- Use `--resume` to continue from where it left off:
  ```bash
  forge script script/DeployTestnet.s.sol:DeployTestnet \
    --rpc-url $RPC_URL --broadcast --resume --private-key $DEPLOYER_PRIVATE_KEY
  ```

### Gas Estimation Failures

Some testnets have unreliable gas estimation. Try:
```bash
forge script ... --with-gas-price 30gwei --gas-estimate-multiplier 150
```

### Contract Verification Fails

Ensure you are using the exact same compiler settings as the deployment. The
`foundry.toml` settings (optimizer, via_ir, runs) must match. If verifying
after the fact, use the broadcast artifacts:

```bash
forge verify-contract <ADDRESS> <CONTRACT_NAME> \
  --chain <CHAIN_ID> \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --compiler-version v0.8.27 \
  --optimizer-runs 200
```
