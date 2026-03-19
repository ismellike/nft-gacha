---
name: nft-gacha-contracts
description: Smart contracts in Solidity using Foundry. Gacha mechanics, NFT appraisal, treasury. Use when editing contracts/, running forge, deploying, or handling Solidity code. Triggers on "deploy contract", "run tests", "add event", "fix Solidity bug", "write a test for", or "forge build".
metadata:
  author: ismellike
  version: 1.0.0
---

# NFT Gacha Contracts

## Quick Commands

```bash
cd contracts && forge build
cd contracts && forge test
cd contracts && forge test --match-test testGachaSpin
cd contracts && forge script script/DeployLocal.s.sol:DeployLocal --rpc-url http://localhost:8548 --broadcast --private-key $DEPLOYER_PRIVATE_KEY
```

## Contract Locations

- `contracts/src/gacha/Gacha.sol` - Main game contract, spin logic, randomness
- `contracts/src/tokens/GachaTreasury.sol` - NFT storage, rarity by price
- `contracts/src/appraisal/NFTAppraisal.sol` - NFT price appraisal
- `contracts/src/economy/` - Treasury, vault, economy manager
- `contracts/script/DeployLocal.s.sol` - Deployment script

For detailed architecture, see `references/architecture.md`.

## Key Events

```solidity
event RandomnessRequested(uint256 indexed triggerId);
event SpinCompleted(uint256 indexed triggerId, address indexed requester, uint8 rarity, address collection, uint256 tokenId, uint256 appraisedPrice);
event SpinRefunded(uint256 indexed triggerId, address indexed requester, uint8 selectedRarity, uint256 refundAmount);
event AppraisalRequested(address indexed nftContract, uint256 indexed tokenId, uint256 indexed requestId);
event AppraisalFulfilled(uint256 indexed requestId, uint256 price);
```

## Rarity by Price (GachaTreasury)

| Rarity | Price Range | Probability |
|--------|-------------|-------------|
| Common | $0 - $15 | 70% |
| Uncommon | $25 - $60 | 20% |
| Rare | $70 - $250 | 6% |
| Epic | $300 - $1,200 | 3% |
| Legendary | $1,500+ | 1% |

## After Contract Changes

1. Run `cd contracts && forge build`.
2. Run `cd contracts && forge test`.
3. Deploy if needed.
4. Run `task frontend:codegen`.

## Environment

- RPC: `http://localhost:8548`
- Chain ID: `31337`
- Required: `DEPLOYER_PRIVATE_KEY`, `WAVS_SERVICE_MANAGER_ADDRESS`

## Examples

### Example 1: Add a new contract event
User says: "add an event when spin price changes"
Actions:
1. Read the target contract (e.g., `Gacha.sol`)
2. Add `event SpinPriceUpdated(uint256 oldPrice, uint256 newPrice);`
3. Emit the event in the setter function
4. Run `forge build && forge test`
Result: New event emitted on price change, all tests pass.

### Example 2: Write a unit test
User says: "write a test for the refund logic"
Actions:
1. Read existing test helpers in `contracts/test/helpers/`
2. Create test in `contracts/test/unit/gacha/`
3. Use `StandardTest` base, set up fixtures
4. Run `forge test --match-test testRefund -vvv`
Result: New test validates refund behavior with verbose output.

## Troubleshooting

### Error: "forge build" fails with missing imports
Cause: Submodule dependencies not initialized.
Solution: Run `git submodule update --init --recursive` then retry.

### Error: Stack too deep
Cause: Too many local variables in a function.
Solution: Extract variables into a struct or use internal helper functions to reduce stack depth.

### Error: Test reverts unexpectedly
Cause: Missing setup or incorrect test state.
Solution: Run with `-vvvv` for full trace. Check that `setUp()` deploys all required contracts and that test accounts have sufficient balances.
